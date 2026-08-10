# -*- coding: utf-8 -*-
"""
REPASS AI - Motor de Dados Reais do Google Places.

Portado do motor de produção validado do `franca-leads-scanner`
(`lib/places.ts` + `lib/scoring.ts`), preservando a mesma lógica de
paginação, seleção de campos, pontuação de oportunidade e redação da
mensagem de abordagem.

Regra inegociável deste módulo: ele NUNCA inventa dado de contato.
Telefone, site, nota e número de avaliações vêm exclusivamente da
resposta da Google Places API. Quando um campo não existe, ele é `None`
e a interface deve tratar a ausência — jamais preencher com placeholder.
"""

import os
import json
import time
import urllib.parse
import urllib.request

PLACES_BASE = "https://maps.googleapis.com/maps/api/place"

# Campos pedidos no Place Details. Manter enxuto: a Places API cobra por
# faixa de campos, e pedir campos extras encarece cada varredura.
CAMPOS_DETALHES = ",".join([
    "name",
    "formatted_address",
    "formatted_phone_number",
    "website",
    "rating",
    "user_ratings_total",
    "business_status",
    "geometry",
    "photos",
])


class PlacesIndisponivel(Exception):
    """Sinaliza que a varredura real não pode ser executada agora."""


def api_key():
    """Retorna a GOOGLE_PLACES_API_KEY ou levanta PlacesIndisponivel."""
    key = os.environ.get("GOOGLE_PLACES_API_KEY", "").strip()
    if not key:
        raise PlacesIndisponivel(
            "GOOGLE_PLACES_API_KEY não definida no backend/.env"
        )
    return key


def places_configurado():
    """Indica se há chave configurada, sem levantar exceção."""
    return bool(os.environ.get("GOOGLE_PLACES_API_KEY", "").strip())


def _get_json(url, timeout=10):
    """Executa GET e devolve o JSON decodificado."""
    req = urllib.request.Request(url, headers={"User-Agent": "RepassAI/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode("utf-8"))


def negocio_encerrado(status):
    """True para negócios fechados permanente ou temporariamente."""
    return status in ("CLOSED_PERMANENTLY", "CLOSED_TEMPORARILY")


def buscar_nicho(nicho, cidade, max_resultados=20):
    """
    Busca lugares por texto livre (ex.: "barbearia em Franca, SP").

    Pagina automaticamente até `max_resultados`. A Places API devolve até
    20 por página (60 no total) e exige ~2s de espera antes do
    `next_page_token` ficar válido.

    Retorna: lista de dicts com `place_id`.
    """
    query = urllib.parse.quote(f"{nicho} em {cidade}")
    url = (
        f"{PLACES_BASE}/textsearch/json?query={query}"
        f"&language=pt-BR&key={api_key()}"
    )

    resultados = []
    while len(resultados) < max_resultados:
        data = _get_json(url)
        status = data.get("status")

        if status not in ("OK", "ZERO_RESULTS"):
            raise PlacesIndisponivel(
                f"Places API (textsearch) retornou: {status}"
            )

        for r in data.get("results", []):
            resultados.append({"place_id": r.get("place_id")})

        token = data.get("next_page_token")
        if not token or len(resultados) >= max_resultados:
            break

        time.sleep(2)
        url = f"{PLACES_BASE}/textsearch/json?pagetoken={token}&key={api_key()}"

    return resultados[:max_resultados]


def detalhes_do_lugar(place_id):
    """Busca os detalhes de um place_id. Levanta PlacesIndisponivel em erro."""
    url = (
        f"{PLACES_BASE}/details/json?place_id={place_id}"
        f"&fields={CAMPOS_DETALHES}&language=pt-BR&key={api_key()}"
    )
    data = _get_json(url)
    if data.get("status") != "OK":
        raise PlacesIndisponivel(
            f"Places API (details) retornou: {data.get('status')}"
        )
    resultado = data.get("result", {})
    resultado["place_id"] = place_id
    return resultado


# --- Pontuação de oportunidade -------------------------------------------

OPORTUNIDADE = {
    "sem_site": (
        "Percebi que o perfil do Google ainda não tem um site próprio "
        "vinculado, o que pode dificultar que uma busca vire atendimento."
    ),
    "so_rede_social": (
        "Reparei que o principal link do perfil leva a uma rede social, e há "
        "espaço para transformar essas buscas em conversas e agendamentos."
    ),
    "poucas_reviews": (
        "A nota é muito boa; há espaço para aproveitar melhor cada cliente "
        "satisfeito e fortalecer essa reputação no Google."
    ),
    "geral": (
        "Queria entender como está hoje a presença digital e o atendimento "
        "de vocês."
    ),
}

PERGUNTA_FINAL = (
    "Hoje os novos contatos de vocês chegam mais pelo WhatsApp ou pelo "
    "Instagram?"
)


def _eh_rede_social(url):
    """True se a URL aponta para uma rede social em vez de site próprio."""
    dominios = ("instagram.com", "facebook.com", "linktr.ee")
    return any(d in (url or "").lower() for d in dominios)


# Faixas de oportunidade, da melhor para a pior. Menor número = aparece antes.
#
# A ordem não é estética: é a ordem em que o operador ganha dinheiro. Quem não
# tem site é a venda direta; quem só tem Instagram é a venda fácil de explicar;
# quem tem site sem HTTPS tem um site velho e um motivo concreto de conversa;
# quem já tem site bom é o último a valer uma ligação.
FAIXA_SEM_SITE = 0
FAIXA_SO_REDE_SOCIAL = 1
FAIXA_SITE_INSEGURO = 2
FAIXA_TEM_SITE = 3


def classificar_site(site):
    """
    Classifica a presença digital do negócio a partir da URL do Places.

    Devolve um dos quatro rótulos usados pela tela e pela ordenação:
    'sem_site', 'so_rede_social', 'site_inseguro' ou 'tem_site'.

    Existe para que o mesmo julgamento valha na varredura e na listagem do
    banco. Enquanto isso era um `"sem_site" if not site else "tem_site"`
    escrito em dois lugares, "só rede social" — que é a segunda melhor
    oportunidade comercial — aparecia na tela como se fosse um site pronto.
    """
    url = (site or "").strip()
    if not url:
        return "sem_site"
    if _eh_rede_social(url):
        return "so_rede_social"
    if not url.lower().startswith("https://"):
        return "site_inseguro"
    return "tem_site"


_FAIXA_POR_CLASSE = {
    "sem_site": FAIXA_SEM_SITE,
    "so_rede_social": FAIXA_SO_REDE_SOCIAL,
    "site_inseguro": FAIXA_SITE_INSEGURO,
    "tem_site": FAIXA_TEM_SITE,
}


def faixa_oportunidade(site):
    """Faixa numérica para ordenar. Ver FAIXA_* acima."""
    return _FAIXA_POR_CLASSE[classificar_site(site)]


def chave_de_prioridade(lead):
    """
    Chave de ordenação de leads: faixa primeiro, score depois.

    Ordenar só por score misturava as faixas. O score soma pontos por poucas
    avaliações, então um negócio COM site e com 3 avaliações chegava a 40 e
    passava na frente de um que só tem Instagram, que vale 30. Para quem vende
    site, essa ordem está invertida: a ausência de site é o argumento, e o
    número de avaliações é só o desempate.

    Use com `sorted(leads, key=places_engine.chave_de_prioridade)`.
    """
    site = lead.get("site")
    score = lead.get("score")
    if score is None:
        score = lead.get("score_oportunidade") or 0
    return (faixa_oportunidade(site), -(score or 0))


def score_oportunidade(place):
    """
    Calcula o score (0-100) e o motivo de abordagem a partir de dados reais.

    Retorna: (score:int, motivo:str)
    """
    website = place.get("website") or ""
    rating = place.get("rating") or 0
    total_reviews = place.get("user_ratings_total") or 0

    score = 0
    motivo = "geral"

    if not website:
        score += 45
        motivo = "sem_site"
    elif _eh_rede_social(website):
        score += 30
        motivo = "so_rede_social"
    elif not website.lower().startswith("https://"):
        score += 20
        motivo = "so_rede_social"

    if total_reviews < 15:
        score += 25
        if motivo == "geral":
            motivo = "poucas_reviews"
    elif total_reviews < 50:
        score += 10

    if rating >= 4.5 and total_reviews < 30:
        score += 15
        if motivo == "geral":
            motivo = "poucas_reviews"

    return min(score, 100), motivo


def _resumo_da_reputacao(place):
    """Frase sobre a reputação, apenas se os números realmente existirem."""
    rating = place.get("rating")
    reviews = place.get("user_ratings_total")
    if isinstance(rating, (int, float)) and isinstance(reviews, int):
        return f"vi a reputação de vocês no Google: nota {rating} em {reviews} avaliações."
    return "vi o perfil de vocês no Google."


def gerar_mensagem(place, motivo, cidade="sua cidade", nicho="negócios locais"):
    """
    Monta a mensagem inicial de abordagem.

    Estrutura: contexto real observado, apresentação breve, oportunidade
    verificável e pergunta de diagnóstico. Deliberadamente NÃO promete
    site pronto nem inclui link — a proposta só entra depois da resposta
    humana do negócio.
    """
    operador = os.environ.get("REPASS_OPERADOR_NOME", "").strip()
    marca = os.environ.get("REPASS_OPERADOR_MARCA", "").strip()

    if operador and marca:
        apresentacao = f"Sou o {operador}, da {marca}, e ajudo"
    elif operador:
        apresentacao = f"Sou o {operador} e ajudo"
    else:
        apresentacao = "Ajudo"

    nicho_busca = (nicho or "negócios locais").strip()
    cidade_busca = (cidade or "sua cidade").strip()
    nome = (place.get("name") or "seu negócio").strip()

    return " ".join([
        f"Oi, tudo bem? Encontrei {nome} pesquisando {nicho_busca} em "
        f"{cidade_busca} e {_resumo_da_reputacao(place)}",
        f"{apresentacao} negócios locais a organizar presença digital e "
        f"atendimento no WhatsApp. {OPORTUNIDADE[motivo]}",
        PERGUNTA_FINAL,
    ])
