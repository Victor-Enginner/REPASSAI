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
