# -*- coding: utf-8 -*-
"""
REPASS AI - Motor Procedural de Templates (77lib.dev Engine)

Baixa o template cru da 77lib.dev e injeta os dados reais do lead (OSINT via
Google Places), entregando HTML 100% em português.

Diferença para a versão anterior: a substituição deixou de ser "aplica e torce".
Agora cada regra é contada, o HTML final passa por uma auditoria que procura
resíduo do template original (francês, dados da Exo Ape, imagens do Storyblok)
e o site sujo é BLOQUEADO em vez de salvo. Se o template mudar na origem, o
relatório aponta exatamente qual regra parou de casar.
"""

from __future__ import annotations

import json
import logging
import os
import re
import unicodedata
import urllib.error
import urllib.request
from typing import Any

from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOG_DIR = os.path.join(BASE_DIR, "data", "77lib_catalog")
BACKEND_ENV = os.path.join(BASE_DIR, ".env")

os.makedirs(CATALOG_DIR, exist_ok=True)
load_dotenv(BACKEND_ENV)

URL_BASE_77LIB = "https://77lib.dev/r"
TEMPLATE_PADRAO = "aura-template-digital-creative-30"
TIMEOUT_S = 20

logger = logging.getLogger("lib77_engine")

# Resíduos do template original que NUNCA podem sobreviver no site do cliente.
# A auditoria falha se qualquer um destes aparecer no HTML final.
TERMOS_PROIBIDOS: tuple[str, ...] = (
    "Exo Ape",
    "exoape.com",
    "hello@exoape.com",
    "Willem II Singel",
    "Roermond",
    "Pays-Bas",
    "+31 772 086 200",
    "storyblok.com",
)

# Detecção de francês por palavra gramatical, não por lista de frases.
#
# A versão anterior listava frases específicas e por isso aprovou sites que
# ainda tinham francês: bastava o template ter um parágrafo fora da lista.
# Estas são palavras funcionais que existem em francês e NÃO em português,
# então qualquer uma delas no texto visível denuncia conteúdo não traduzido.
MARCADORES_FRANCES: tuple[str, ...] = (
    "des", "les", "nous", "vous", "votre", "notre", "avec", "dans", "cette",
    "ces", "aux", "leur", "leurs", "toutes", "tout", "plus", "pour", "qui",
    "une", "est", "du", "au", "sur", "sont", "vedette", "aperçu",
)

# Nomes de clientes do portfólio da agência original. São dados de exemplo:
# um restaurante em Franca não trabalhou com a Columbia Pictures.
CLIENTES_FICTICIOS: tuple[str, ...] = (
    "Ottografie", "Amaterasu", "Columbia Pictures", "Cambium",
)


# Imagem de reserva por nicho. Usada quando o lead não tem foto do Google
# Places: sem isso o site sairia com as fotos da agência holandesa do template.
# Fotos livres do Unsplash, coerentes com o segmento do negócio.
IMAGENS_FALLBACK: tuple[tuple[tuple[str, ...], str], ...] = (
    (("padaria", "confeitaria", "doceria", "cafe", "cafeteria"),
     "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80"),
    (("restaurante", "churrascaria", "steak", "pizzaria", "bar", "lanche", "hamburgue"),
     "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80"),
    (("barbearia", "barber", "cabelereiro", "cabeleireiro", "salao"),
     "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&q=80"),
    (("pet", "veterinar", "animal"),
     "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1600&q=80"),
    (("academia", "fitness", "cross", "muscula"),
     "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80"),
    (("oficina", "mecanic", "autopec", "funilaria"),
     "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1600&q=80"),
)
IMAGEM_FALLBACK_GENERICA = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"


def _imagem_por_nicho(nicho: str) -> str:
    """
    Escolhe a imagem de reserva coerente com o segmento do negócio.

    Args:
        nicho: categoria do lead (ex.: "Restaurante & Churrascaria").

    Returns:
        URL de uma foto livre adequada ao nicho, ou uma foto neutra de
        estabelecimento comercial se o nicho não for reconhecido.
    """
    alvo = nicho.lower()
    for chaves, url in IMAGENS_FALLBACK:
        if any(c in alvo for c in chaves):
            return url
    return IMAGEM_FALLBACK_GENERICA


class Lib77Error(Exception):
    """Falha na geração do site: download, dados do lead ou auditoria."""


class AuditoriaReprovada(Lib77Error):
    """O HTML final ainda contém resíduo do template original."""

    def __init__(self, problemas: list[str]) -> None:
        self.problemas = problemas
        super().__init__(
            f"{len(problemas)} residuo(s) do template original no HTML final: "
            + "; ".join(problemas[:6])
        )


def _slug(valor: str) -> str:
    """Normaliza um nome para uso como nome de arquivo."""
    limpo = re.sub(r"_+", "_", re.sub(r"[^a-zA-Z0-9]", "_", str(valor).lower()))
    return limpo.strip("_") or "site"


def _dominio(valor: str) -> str:
    """
    Converte o nome do negócio em rótulo de domínio válido.

    Underscore não é aceito em domínio: `contato@fogo_vivo.com.br` é um
    endereço quebrado. Acentos também são removidos.

    Args:
        valor: nome do negócio.

    Returns:
        Rótulo em minúsculas, apenas letras e números.
    """
    sem_acento = unicodedata.normalize("NFKD", str(valor)).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", sem_acento.lower()) or "site"


def _so_digitos(valor: str) -> str:
    """Extrai apenas os dígitos de uma string."""
    return re.sub(r"\D", "", str(valor))


def _encurtar(texto: str, limite: int) -> str:
    """
    Corta o texto no fim de frase mais próximo, sem passar do limite.

    O slot do hero tem altura fixa: o template alinha o conteúdo embaixo
    (`justify-end`) dentro de uma seção de 100svh. Texto longo demais empurra
    o bloco para cima e ele some por trás do cabeçalho fixo. Duas linhas
    cabem; quatro não.

    Args:
        texto: frase completa vinda das regras.
        limite: máximo de caracteres aceito no slot.

    Returns:
        O texto inteiro se couber; senão a maior parte que termina em ponto.
    """
    texto = texto.strip()
    if len(texto) <= limite:
        return texto
    corte = texto[:limite]
    ponto = corte.rfind(". ")
    if ponto > limite * 0.4:
        return corte[: ponto + 1]
    espaco = corte.rfind(" ")
    return (corte[:espaco] if espaco > 0 else corte).rstrip(" ,;") + "."


def _frase_regex(frase: str) -> str:
    """
    Converte uma frase em regex tolerante à marcação entre as palavras.

    O template quebra frases dentro de tags — `<span>Voir</span>
    <span>la Vidéo</span>` — então busca literal por "Voir la Vidéo" nunca
    casa. Aqui cada espaço vira "espaços e/ou tags", que é como o texto
    realmente aparece no HTML.

    Args:
        frase: texto como é lido na página, com espaços simples.

    Returns:
        Padrão regex que casa a frase mesmo fatiada por tags ou quebras de linha.
    """
    return r"(?:\s|<[^>]*>)+".join(re.escape(p) for p in frase.split())


class Lib77Engine:
    """Compila sites da 77lib.dev com os dados reais do lead."""

    def __init__(self, token: str | None = None) -> None:
        """
        Args:
            token: token do registry 77lib. Se omitido, lê `LIB77_TOKEN` do
                ambiente. Não há mais token embutido no código-fonte.

        Raises:
            Lib77Error: se nenhum token estiver disponível.
        """
        self.token = token or os.environ.get("LIB77_TOKEN", "").strip()
        if not self.token:
            raise Lib77Error(
                "LIB77_TOKEN ausente. Defina a variavel no backend/.env; "
                "o token nao fica mais embutido no codigo."
            )

    # ------------------------------------------------------------------ dados

    @staticmethod
    def validar_lead(lead_data: dict[str, Any]) -> dict[str, Any]:
        """
        Valida o lead e preenche faltas com padrões seguros em português.

        Nunca devolve dado estrangeiro ou de exemplo: se um campo faltar, o
        substituto é neutro e em PT-BR.

        Args:
            lead_data: dados brutos do lead (Google Places).

        Returns:
            dict com os campos normalizados e a chave `_avisos` (list[str])
            listando o que foi preenchido por falta de dado real.

        Raises:
            Lib77Error: se o nome da empresa estiver ausente — sem ele o site
                não tem identidade e não deve ser gerado.
        """
        avisos: list[str] = []
        nome = str(lead_data.get("nome", "")).strip()
        if not nome:
            raise Lib77Error("Lead sem 'nome': impossivel gerar site sem identidade.")

        cidade = str(lead_data.get("cidade", "")).strip()
        estado = str(lead_data.get("estado", "")).strip()
        if not cidade:
            cidade, _ = "Franca", avisos.append("cidade ausente; usando 'Franca'")
        if not estado:
            estado, _ = "SP", avisos.append("estado ausente; usando 'SP'")

        telefone = str(lead_data.get("telefone", "")).strip()
        digitos = _so_digitos(telefone)
        if len(digitos) < 10:
            telefone = ""
            avisos.append("telefone invalido ou ausente; CTA de telefone omitido")

        whatsapp = str(lead_data.get("whatsapp", "")).strip()
        if not whatsapp and digitos:
            whatsapp = f"https://wa.me/55{digitos}"
        if not whatsapp:
            avisos.append("sem WhatsApp; CTAs apontarao para a secao de contato")

        endereco = str(lead_data.get("endereco", "")).strip() or f"{cidade} - {estado}"

        return {
            "nome": nome,
            "nicho": str(lead_data.get("categoria", "")).strip() or "Negocios & Servicos",
            "cidade": cidade,
            "estado": estado,
            "endereco": endereco,
            "telefone": telefone,
            "whatsapp": whatsapp or "#contato",
            "avaliacao": lead_data.get("avaliacao"),
            "reviews": lead_data.get("reviewsCount"),
            "hero_bg": (
                lead_data.get("mediaEnrichment", {})
                .get("designSystem", {})
                .get("heroBackground", "")
            ),
            "galeria": (
                lead_data.get("mediaEnrichment", {})
                .get("designSystem", {})
                .get("gallery", [])
            ),
            "_avisos": avisos,
        }

    # --------------------------------------------------------------- download

    def baixar_template_registry(self, template_slug: str = TEMPLATE_PADRAO) -> dict[str, Any]:
        """
        Baixa o manifesto do template no registry da 77lib.dev e o salva em cache.

        Args:
            template_slug: identificador do template no registry.

        Returns:
            Manifesto decodificado do template.

        Raises:
            Lib77Error: em falha de rede ou resposta inválida.
        """
        url = f"{URL_BASE_77LIB}/{template_slug}?token={self.token}"
        req = urllib.request.Request(url, headers={"User-Agent": "RepassAI/1.0"})
        logger.info("Baixando template '%s' do registry 77lib.", template_slug)
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT_S) as res:
                bruto = res.read().decode("utf-8")
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as exc:
            raise Lib77Error(f"Falha ao baixar '{template_slug}': {type(exc).__name__}") from exc

        try:
            dados = json.loads(bruto)
        except json.JSONDecodeError as exc:
            raise Lib77Error(f"Registry devolveu conteudo nao-JSON para '{template_slug}'.") from exc

        caminho = os.path.join(CATALOG_DIR, f"{template_slug}.json")
        with open(caminho, "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=2, ensure_ascii=False)
        return dados

    # -------------------------------------------------------------- auditoria

    @staticmethod
    def texto_visivel(html: str) -> str:
        """
        Extrai o texto que o visitante realmente lê.

        Auditar o HTML bruto gera falso positivo (classes CSS e URLs contêm
        sequências como "des" e "les") e falso negativo. A auditoria precisa
        olhar exatamente o que aparece na tela.

        Args:
            html: HTML completo da página.

        Returns:
            Texto corrido, sem tags, scripts, estilos nem espaços repetidos.
        """
        limpo = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.DOTALL | re.IGNORECASE)
        limpo = re.sub(r"<[^>]+>", " ", limpo)
        return re.sub(r"\s+", " ", limpo)

    @classmethod
    def auditar(cls, html: str) -> list[str]:
        """
        Procura resíduo do template original no texto visível da página.

        Args:
            html: HTML final, pós-injeção.

        Returns:
            Lista de problemas encontrados. Lista vazia significa site limpo.
        """
        problemas: list[str] = []
        texto = cls.texto_visivel(html)

        # SEO: um site que se declara francês não indexa para o público do
        # cliente. Auditar só o texto visível deixaria isso passar.
        idioma = re.search(r'<html[^>]*\slang="([^"]*)"', html)
        if not idioma:
            problemas.append("sem atributo lang no <html>")
        elif not idioma.group(1).lower().startswith("pt"):
            problemas.append(f"idioma do documento e '{idioma.group(1)}', deveria ser pt-BR")
        if 'name="description"' not in html:
            problemas.append("sem meta description")

        # Moeda estrangeira. Os templates do 77lib vêm com a tabela de preços
        # do negócio original — um site de padaria em Franca saiu com "$6" no
        # cardápio. Preço errado na página é pior que página sem preço.
        moedas = re.findall(r"(?:[$€£¥]\s?\d[\d.,]*|\bUSD\b|\bEUR\b|\bCAD\b)", texto)
        if moedas:
            problemas.append(f"moeda estrangeira {moedas[:3]} x{len(moedas)}")

        for termo in TERMOS_PROIBIDOS:
            n = html.count(termo)
            if n:
                problemas.append(f"dado generico '{termo}' x{n}")
        for cliente in CLIENTES_FICTICIOS:
            n = len(re.findall(rf"\b{re.escape(cliente)}\b", texto))
            if n:
                problemas.append(f"cliente ficticio '{cliente}' x{n}")
        for palavra in MARCADORES_FRANCES:
            achados = re.findall(rf"(?<![\w'’]){re.escape(palavra)}(?![\w'’])", texto, re.IGNORECASE)
            if achados:
                problemas.append(f"frances '{palavra}' x{len(achados)}")
        return problemas

    # ---------------------------------------------------------------- geração

    def gerar_site_injetado_osint(
        self,
        lead_data: dict[str, Any],
        template_slug: str = TEMPLATE_PADRAO,
        schema: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Compila o site do lead a partir do template da 77lib.dev.

        O HTML só é gravado em disco depois de passar na auditoria. Um site com
        resíduo do template original é rejeitado, não salvo.

        Args:
            lead_data: dados do lead vindos do Google Places.
            template_slug: template a usar.
            schema: schema do motor híbrido (`hybrid_engine`). Quando presente,
                os textos das regras por nicho alimentam o HTML. Sem ele o
                motor usa os textos genéricos de sempre — o parâmetro é
                opcional justamente para não quebrar quem já chamava assim.

        Returns:
            dict com `status`, `empresa`, `template`, `output_html_file`,
            `whatsapp_link`, `avisos` e `regras_sem_efeito`.

        Raises:
            Lib77Error: lead inválido ou falha no download.
            AuditoriaReprovada: se sobrou conteúdo do template original.
        """
        lead = self.validar_lead(lead_data)
        dados = self.baixar_template_registry(template_slug)

        arquivos = dados.get("files") or []
        if not arquivos or not arquivos[0].get("content"):
            raise Lib77Error(f"Template '{template_slug}' veio sem conteudo HTML.")
        html = arquivos[0]["content"]

        html, sem_efeito = self._injetar(html, lead, schema or {})

        problemas = self.auditar(html)
        if problemas:
            logger.error("Auditoria reprovou o site de '%s'.", lead["nome"])
            raise AuditoriaReprovada(problemas)

        nome_slug = _slug(lead["nome"])
        destino = os.path.join(CATALOG_DIR, f"generated_{nome_slug}.html")
        with open(destino, "w", encoding="utf-8") as f:
            f.write(html)

        if sem_efeito:
            logger.warning(
                "%d regra(s) nao casaram — o template pode ter mudado: %s",
                len(sem_efeito),
                ", ".join(sem_efeito[:5]),
            )
        for aviso in lead["_avisos"]:
            logger.info("Lead '%s': %s", lead["nome"], aviso)

        logger.info("Site gerado e aprovado na auditoria: %s", destino)
        return {
            "status": "success",
            "empresa": lead["nome"],
            "template": template_slug,
            "output_html_file": destino,
            "whatsapp_link": lead["whatsapp"],
            "avisos": lead["_avisos"],
            "regras_sem_efeito": sem_efeito,
        }

    def _injetar(
        self,
        html: str,
        lead: dict[str, Any],
        schema: dict[str, Any] | None = None,
    ) -> tuple[str, list[str]]:
        """
        Aplica todas as regras de substituição, contando as que não casaram.

        Args:
            html: HTML cru do template.
            lead: lead já validado por `validar_lead`.

        Returns:
            Tupla (html_final, lista_de_regras_que_nao_casaram).
        """
        nome, nicho = lead["nome"], lead["nicho"]
        cidade, estado = lead["cidade"], lead["estado"]
        sem_efeito: list[str] = []

        def literal(texto: str, de: str, para: str, rotulo: str) -> str:
            if de not in texto:
                sem_efeito.append(rotulo)
                return texto
            return texto.replace(de, para)

        def padrao(texto: str, rx: str, para: str, rotulo: str, flags: int = 0) -> str:
            novo, n = re.subn(rx, para, texto, flags=flags)
            if not n:
                sem_efeito.append(rotulo)
            return novo

        # 1. SEO e idioma do documento.
        #
        # O template vem com `<html lang="fr">`. Isso diz ao Google que o site
        # de um negócio brasileiro é francês — o buscador passa a oferecê-lo
        # para outro público e o cliente não aparece na busca local. Era o
        # defeito mais caro do gerador, porque anula justamente o que o
        # produto promete: um site que indexa.
        html = padrao(html, r'<html\s+lang="[^"]*"', '<html lang="pt-BR"', "seo:lang")

        titulo = f"{nome} | {nicho} em {cidade} - {estado}"
        html = padrao(html, r"<title>.*?</title>", f"<title>{titulo}</title>", "title", re.DOTALL)

        # Descrição e Open Graph: sem isso o link compartilhado no WhatsApp
        # aparece sem resumo nem imagem — e WhatsApp é o canal do cliente.
        descricao = (
            f"{nome} em {cidade} - {estado}. {nicho}. "
            f"Fale pelo WhatsApp e conheca nossos servicos."
        )
        imagem_og = lead["hero_bg"] or _imagem_por_nicho(nicho)
        meta = (
            f'<meta name="description" content="{descricao}">'
            f'<meta property="og:type" content="website">'
            f'<meta property="og:title" content="{titulo}">'
            f'<meta property="og:description" content="{descricao}">'
            f'<meta property="og:image" content="{imagem_og}">'
            f'<meta property="og:locale" content="pt_BR">'
            f'<meta name="twitter:card" content="summary_large_image">'
        )
        html = padrao(html, r"<head>", f"<head>{meta}", "seo:meta")

        # 2. Marca — precisa vir antes das regras que dependem de contexto.
        html = literal(html, "Exo Ape", nome, "marca:ExoApe")

        # 3. Hero H1 — o nome quebrado em até três linhas gigantes.
        #
        # A terceira linha completava com o nicho, e isso produzia repetição
        # boba quando o nicho já está no nome: "Barbearia / Cruz / Barbearia".
        # Nesse caso a cidade cumpre melhor o papel de terceira linha.
        partes = nome.split()
        l1 = partes[0]
        l2 = partes[1] if len(partes) > 1 else "Qualidade"
        if len(partes) > 2:
            l3 = " ".join(partes[2:])
        else:
            palavras_nome = {p.lower() for p in partes}
            primeira_do_nicho = nicho.split()[0].lower() if nicho.split() else ""
            l3 = cidade if primeira_do_nicho in palavras_nome else nicho.title()
        hero = (
            f'<h1 class="text-[14vw] lg:text-[11vw] leading-[0.85] tracking-tighter flex flex-col">'
            f'<span class="block">{l1}</span>'
            f'<span class="block ml-[10vw]">{l2}</span>'
            f'<span class="block">{l3}</span></h1>'
        )
        html = padrao(
            html,
            r'<h1[^>]*>.*?<span class="block">Digital</span>.*?</h1>',
            hero, "hero:h1", re.DOTALL,
        )

        # 4. Parágrafos do hero.
        #
        # Quando o motor híbrido entrega schema, o texto vem das regras por
        # nicho — uma barbearia deixa de receber a mesma frase de um petshop.
        # Sem schema, o texto genérico de sempre continua valendo.
        nota = ""
        if lead["avaliacao"] and lead["reviews"]:
            nota = f" Nota {lead['avaliacao']} no Google com {lead['reviews']} avaliações."

        hero_schema = (schema or {}).get("hero") or {}
        sobre_schema = (schema or {}).get("sobre") or {}

        # 110 caracteres ≈ 2 linhas no slot do hero. Acima disso o bloco
        # transborda e passa por baixo do cabeçalho fixo.
        p1 = _encurtar(
            hero_schema.get("subtitle") or f"O melhor em {nicho} em {cidade} - {estado}.{nota}",
            110,
        )
        p2 = sobre_schema.get("descricao") or (
            f"Conheça nosso espaço e nossos serviços. Atendimento rápido e "
            f"contato direto pelo WhatsApp em {cidade}."
        )

        html = padrao(
            html, r"Studio de design numérique en partenariat avec des marques.*?</p>",
            f"{p1}</p>", "hero:p1", re.DOTALL,
        )
        html = padrao(
            html, r"Nous aidons les entreprises axées sur l'expérience à prospérer.*?</p>",
            f"{p2}</p>", "hero:p2", re.DOTALL,
        )

        # 4b. Legenda da seção de vídeo. O motor antigo não cobria esta frase,
        # que ia para o ar em francês ("Notre travail s'apprécie mieux...").
        html = padrao(
            html,
            _frase_regex("Notre travail s") + r".{0,140}?couteurs\.",
            f"Conheça o ambiente do {nome} em movimento. Ative o som para a experiência completa.",
            "video:legenda", re.DOTALL,
        )

        # 4c. Bloco de portfólio da agência. Além de francês, trazia clientes
        # ficticios (Columbia Pictures, Amaterasu...) que nada têm a ver com o
        # negocio do lead. Vira uma vitrine de diferenciais do proprio cliente.
        html = padrao(
            html,
            _frase_regex("Aperçu des projets que nous avons passionnément construits avec des")
            + r".{0,120}?ans\.",
            hero_schema.get("title")
            or f"Conheça o que faz do {nome} referência em {nicho} na região de {cidade}.",
            "portfolio:intro", re.DOTALL,
        )
        # O template tem 4 cartões; as regras entregam 3. Os do schema entram
        # primeiro e os genéricos completam o que faltar, para não sobrar
        # cartão com texto do template original.
        padrao_diferenciais = [
            ("Nosso Espaço", f"Ambiente preparado para receber você em {cidade}"),
            ("Atendimento", "Rapidez e cuidado em cada visita"),
            ("Qualidade", f"O padrão que faz o cliente voltar ao {nome}"),
            ("Localização", f"Fácil acesso em {cidade} - {estado}"),
        ]
        do_schema = [
            (d.get("titulo", ""), d.get("descricao", ""))
            for d in ((schema or {}).get("diferenciais") or [])
            if d.get("titulo")
        ]
        diferenciais = tuple((do_schema + padrao_diferenciais)[:4])
        antigos = (
            ("Ottografie", "Parcours Photographique Fluide"),
            ("Amaterasu", "Innovation en Santé de Pointe"),
            ("Columbia Pictures", "Célébration d'un Siècle de Cinéma"),
            ("Cambium", "Pionnier des Solutions Durables"),
        )
        for (cliente, descricao), (titulo, novo_texto) in zip(antigos, diferenciais):
            html = padrao(html, _frase_regex(cliente), titulo, f"portfolio:{cliente}", re.DOTALL)
            html = padrao(html, _frase_regex(descricao), novo_texto, f"portfolio:desc:{cliente}", re.DOTALL)

        # 4d. Rodapé social e chamada de imprensa da agência.
        html = padrao(
            html,
            _frase_regex("Découvrez-en plus sur notre travail sur ces plateformes de référence")
            + r".{0,80}?technologie\.",
            f"Acompanhe o {nome} nas redes sociais e veja as novidades da semana.",
            "social:intro", re.DOTALL,
        )
        html = padrao(
            html,
            _frase_regex("L") + r".{0,20}?histoire" + r".{0,200}?curiosit[éeè]\.",
            f"A história do {nome} é feita de dedicação, atendimento próximo e "
            f"clientes que voltam sempre.",
            "historia:texto", re.DOTALL,
        )

        # 5. Títulos de seção. Ordem importa: 'Le Studio' antes de 'Studio'.
        secoes = [
            ("Réalisations", "Destaques & Serviços"),
            ("Projets en vedette", "Nossas Especialidades"),
            ("Voir la Vidéo", "Experiência Ao Vivo"),
            ("Travail en mouvement", "Assista ao Vídeo"),
            ("Faire Passer le Mot", "Avaliações do Google"),
            ("Dans les médias", "O Que Dizem os Clientes"),
            ("Notre Histoire", "Nossa História"),
            # CTA por nicho: barbearia recebe "Agende Seu Horário no WhatsApp",
            # petshop "Fale Conosco pelo WhatsApp", academia "Garanta Sua Aula
            # Experimental". Era fixo em "Fazer Pedido" para todo mundo.
            ("Le Studio", hero_schema.get("cta") or "Fazer Pedido"),
            ("Actualités", "Novidades"),
            ("Parcourir tous les projets", "Ver Tudo"),
            ("Toutes les actualités", "Todas as Novidades"),
            ("Contact", "Contato"),
            ("Behance", "WhatsApp"),
            ("Dribbble", "Facebook"),
            ("Studio", "Sobre Nós"),
        ]
        # Casamento tolerante a tags: o template fatia estas frases em <span>s.
        for de, para in secoes:
            html = padrao(html, _frase_regex(de), para, f"secao:{de}", re.DOTALL)

        # 6. Mídia. Lead sem foto do Google Places cai na imagem do nicho —
        # nunca nas fotos da agência holandesa do template.
        imagem_base = lead["hero_bg"] or _imagem_por_nicho(nicho)
        html = padrao(
            html,
            r"https://a\.storyblok\.com/f/133769/1920x2716/5c24d6b467/exo-ape-hero-1\.jpg[^\"]*",
            imagem_base, "midia:hero",
        )
        for img in lead["galeria"]:
            html = re.sub(
                r"https://a\.storyblok\.com/f/133769/[^\"]*\.(?:jpg|png|jpeg)[^\"]*",
                img, html, count=1,
            )

        # Rede de segurança: qualquer imagem do template que ainda tenha
        # sobrado é trocada. Roda sempre, com foto real ou com a do nicho.
        html = re.sub(r"https://a\.storyblok\.com/[^\"']*", imagem_base, html)

        # 7. Contato real
        html = literal(html, "hello@exoape.com", f"contato@{_dominio(nome)}.com.br", "contato:email")
        if lead["telefone"]:
            html = literal(html, "+31 772 086 200", lead["telefone"], "contato:telefone")
        else:
            html = literal(html, "+31 772 086 200", lead["whatsapp"], "contato:telefone")
        html = literal(html, "Willem II Singel 8", lead["endereco"], "contato:endereco")
        html = literal(html, "6041 HS, Roermond", f"{cidade} - {estado}", "contato:cidade")
        html = literal(html, "Pays-Bas", "Brasil", "contato:pais")

        # 8. CTAs para o WhatsApp
        html = padrao(
            html, r'href="#"',
            f'href="{lead["whatsapp"]}" target="_blank" rel="noopener"',
            "cta:whatsapp",
        )
        return html, sem_efeito


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    engine = Lib77Engine()
    lead_teste = {
        "nome": "Fogo Vivo Steakhouse",
        "categoria": "Restaurante & Churrascaria",
        "cidade": "Franca",
        "estado": "SP",
        "endereco": "Av. Alonso Y Alonso, 940 - Jardim Veneza",
        "telefone": "(16) 99050-5914",
        "avaliacao": 4.8,
        "reviewsCount": 1177,
        "mediaEnrichment": {
            "designSystem": {
                "heroBackground": "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80",
                "gallery": [
                    "https://images.unsplash.com/photo-1558030006-450675393462?w=800&auto=format&fit=crop&q=80",
                ],
            }
        },
    }
    try:
        print(json.dumps(engine.gerar_site_injetado_osint(lead_teste), indent=2, ensure_ascii=False))
    except AuditoriaReprovada as exc:
        print("AUDITORIA REPROVOU:")
        for p in exc.problemas:
            print("  -", p)
