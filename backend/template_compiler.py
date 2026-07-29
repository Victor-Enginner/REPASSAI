# -*- coding: utf-8 -*-
"""
REPASS AI — Seletor e Compilador de Templates (Camadas 4 e 5).

Camada 5 (seletor): escolhe o template pelo nicho do lead.
Camada 4 (compilador): preenche os marcadores com os dados reais e entrega
o HTML final.

Aqui não há IA. O template já chegou em português na camada 3; compilar é
trocar `{{NOME}}` por "Padaria Doce Manhã" e apontar as imagens para as
fotos certas. É por isso que gerar site custa R$ 0,00 e leva milissegundos.

O HTML só é gravado depois da auditoria. Site com marcador não preenchido,
idioma errado ou resíduo do negócio original é recusado, não salvo — a mesma
regra que já vale no motor da 77lib.
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PREPARADOS_DIR = os.path.join(BASE_DIR, "data", "templates_preparados")
SAIDA_DIR = os.path.join(BASE_DIR, "data", "77lib_catalog")

os.makedirs(SAIDA_DIR, exist_ok=True)

logger = logging.getLogger("template_compiler")

# Aceita DÍGITO no nome. Sem isso, `{{SERVICO_1_TITULO}}` não casava — e como
# preenchimento, limpeza e auditoria usam esta mesma constante, o marcador
# aparecia cru na página e passava por todas as verificações.
MARCADOR = re.compile(r"\{\{([A-Z0-9_]+)\}\}")


class CompilacaoError(Exception):
    """Falha ao compilar: template ausente, lead inválido ou auditoria."""


class TemplateNaoPreparado(CompilacaoError):
    """O template existe no catálogo mas ainda não passou pela camada 3."""


# ─────────────────────────────────────────────── Camada 5: seleção

def selecionar_template(categoria: str, catalogo: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    """
    Escolhe o template mais próximo do nicho do lead.

    O casamento é por palavra do catálogo contida na categoria do Google
    Places ("Salão De Unhas" casa com o nicho "salão de unhas"). Sem
    correspondência, cai no template marcado como padrão — nunca falha, para
    que um nicho novo não impeça a venda.

    Args:
        categoria: categoria do lead, como vem do Places.
        catalogo: lista de templates; lida do disco se omitida.

    Returns:
        O objeto do template escolhido.

    Raises:
        CompilacaoError: se o catálogo não tiver nenhum template ativo.
    """
    from template_preparer import carregar_catalogo

    catalogo = catalogo or carregar_catalogo()
    if not catalogo:
        raise CompilacaoError("Catálogo sem templates ativos.")

    alvo = _sem_acento(str(categoria or "").lower())

    melhor, melhor_peso = None, 0
    for tpl in catalogo:
        for nicho in tpl.get("nichos", []):
            chave = _sem_acento(nicho.lower())
            # Palavra mais longa vence: "salao de unhas" é mais específico
            # que "salao" e deve ganhar quando os dois casam.
            if chave and chave in alvo and len(chave) > melhor_peso:
                melhor, melhor_peso = tpl, len(chave)

    if melhor:
        return melhor
    padrao = next((t for t in catalogo if t.get("padrao")), None)
    return padrao or catalogo[0]


def _sem_acento(texto: str) -> str:
    """Remove acentos para o casamento de nicho não depender de digitação."""
    import unicodedata

    return unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()


# ─────────────────────────────────────────────── Camada 4: compilação

def montar_valores(lead: dict[str, Any], schema: dict[str, Any] | None = None) -> dict[str, str]:
    """
    Traduz o lead validado no mapa de marcadores do template.

    Campo sem dado real vira string vazia, nunca um exemplo: telefone
    inventado no site do cliente é pior que telefone ausente.

    Args:
        lead: lead já validado.
        schema: saída do `hybrid_engine`. Quando presente, alimenta os textos
            por nicho do template base (título, CTA, cards de serviço).

    Returns:
        Mapa marcador -> texto.
    """
    from lib77_engine import _dominio, _imagem_por_nicho

    from datetime import date

    schema = schema or {}
    hero = schema.get("hero") or {}
    sobre = schema.get("sobre") or {}
    diferenciais = schema.get("diferenciais") or []

    nome, nicho, cidade = lead["nome"], lead["nicho"], lead["cidade"]

    valores = {
        "NOME": nome,
        "CATEGORIA": nicho,
        "CIDADE": cidade,
        "ESTADO": lead["estado"],
        "ENDERECO": lead["endereco"],
        "TELEFONE": lead["telefone"] or "",
        "WHATSAPP": lead["whatsapp"] if lead["whatsapp"] != "#contato" else "#contato",
        "EMAIL": f"contato@{_dominio(nome)}.com.br",
        "AVALIACAO": str(lead["avaliacao"]) if lead["avaliacao"] else "",
        "REVIEWS": str(lead["reviews"]) if lead["reviews"] else "",
        "ANO": str(date.today().year),

        # Textos do template base. Vêm das regras por nicho quando há schema;
        # senão caem num texto neutro que serve para qualquer negócio.
        "HERO_SUBTITULO": hero.get("subtitle")
            or f"{nicho} em {cidade}. Atendimento direto pelo WhatsApp.",
        "CTA": hero.get("cta") or "Falar no WhatsApp",
        "SERVICOS_TITULO": hero.get("title") or f"O que o {nome} faz por você",
        "SERVICOS_TEXTO": sobre.get("descricao")
            or f"Conheça os serviços do {nome} em {cidade}.",
        "AMBIENTE_TEXTO": f"Venha conhecer o {nome} de perto. Estamos em "
                          f"{lead['endereco']}.",
        "AVALIACOES_TITULO": "O que dizem quem já foi atendido",
        "AVALIACOES_TEXTO": f"A reputação do {nome} é construída no atendimento "
                            f"do dia a dia, uma pessoa de cada vez.",
        "RODAPE_TEXTO": f"{nicho} em {cidade}. Fale com a gente pelo WhatsApp "
                        f"e agende seu atendimento.",
    }

    # Cards de serviço: até 4, vindos dos diferenciais das regras.
    padroes = [
        ("Atendimento", f"Cuidado em cada visita ao {nome}."),
        ("Qualidade", "Padrão que faz o cliente voltar."),
        ("Nosso espaço", f"Ambiente preparado para receber você em {cidade}."),
        ("Localização", f"Fácil acesso em {cidade}."),
    ]
    for i in range(4):
        item = diferenciais[i] if i < len(diferenciais) else {}
        titulo, texto = padroes[i]
        valores[f"SERVICO_{i + 1}_TITULO"] = item.get("titulo") or titulo
        valores[f"SERVICO_{i + 1}_TEXTO"] = item.get("descricao") or texto

    # Fotos: cada slot recebe uma imagem diferente quando o lead tem galeria.
    # Repetir a mesma foto cinco vezes foi o que deixou os primeiros sites com
    # cara de rascunho.
    fotos = [u for u in ([lead.get("hero_bg")] + list(lead.get("galeria") or [])) if u]
    if not fotos:
        fotos = [_imagem_por_nicho(nicho)]
    for i in range(5):
        valores[f"FOTO_{i + 1}"] = fotos[i % len(fotos)]

    return valores


def _limpar_sobras(html: str) -> str:
    """
    Remove marcadores que ficaram sem valor e a pontuação órfã ao redor.

    Sem isso, um lead sem nota deixaria " Estrelas" solto na página, ou
    "Avaliação  no Google" com dois espaços — o tipo de detalhe que faz o
    dono do negócio desconfiar do produto.
    """
    html = MARCADOR.sub("", html)
    html = re.sub(r">[ \t]*[·•|,\-–—]+[ \t]*<", "><", html)
    html = re.sub(r"[ \t]{2,}", " ", html)
    return html


def _trocar_imagens(html: str, lead: dict[str, Any]) -> tuple[str, int]:
    """
    Aponta todas as imagens do template para as fotos do lead.

    As fotos do template pertencem ao negócio original — um café canadense,
    uma barbearia espanhola. Mantê-las é publicar a foto de terceiro no site
    do cliente. Sem foto real do Google Places, entra a imagem do nicho.

    Returns:
        Tupla (html, quantidade_trocada).
    """
    from lib77_engine import _imagem_por_nicho

    fotos = [u for u in (lead.get("galeria") or []) if u]
    principal = lead.get("hero_bg") or _imagem_por_nicho(lead["nicho"])
    if not fotos:
        fotos = [principal]

    contador = {"n": 0}

    def troca(m: re.Match[str]) -> str:
        url = fotos[contador["n"] % len(fotos)]
        contador["n"] += 1
        return f'{m.group(1)}{url}{m.group(3)}'

    html = re.sub(r'(<img\b[^>]*?\bsrc=")([^"]*)(")', troca, html, flags=re.IGNORECASE)
    html = re.sub(
        r'(style="[^"]*background-image:\s*url\(\')([^\']*)(\'\))',
        lambda m: f"{m.group(1)}{principal}{m.group(3)}",
        html,
    )

    # Vídeo do negócio original.
    #
    # Fica em `<video><source src="...">`, que a troca de <img> não alcança —
    # o site do cliente tocava o vídeo institucional da agência holandesa.
    # Não temos vídeo do lead, então o `<source>` sai e o `<video>` ganha um
    # `poster` com a imagem do nicho: aparece um quadro estático coerente, e
    # o dono sobe o vídeo dele depois pelo editor.
    def sem_video(m: re.Match[str]) -> str:
        bloco = m.group(0)
        if "storyblok" not in bloco and "aura.build" not in bloco:
            return bloco
        bloco = re.sub(r"<source\b[^>]*>", "", bloco, flags=re.IGNORECASE)
        if "poster=" in bloco:
            bloco = re.sub(r'poster="[^"]*"', f'poster="{principal}"', bloco)
        else:
            bloco = bloco.replace("<video", f'<video poster="{principal}"', 1)
        contador["n"] += 1
        return bloco

    html = re.sub(r"<video\b.*?</video\s*>", sem_video, html, flags=re.DOTALL | re.IGNORECASE)
    return html, contador["n"]


def _ajustar_cabeca(html: str, lead: dict[str, Any]) -> str:
    """Grava idioma, título e metadados de SEO do negócio no `<head>`."""
    from lib77_engine import _imagem_por_nicho

    titulo = f"{lead['nome']} | {lead['nicho']} em {lead['cidade']} - {lead['estado']}"
    descricao = (
        f"{lead['nome']} em {lead['cidade']} - {lead['estado']}. {lead['nicho']}. "
        f"Fale pelo WhatsApp e conheca nossos servicos."
    )
    imagem = lead.get("hero_bg") or _imagem_por_nicho(lead["nicho"])

    html = re.sub(r'<html[^>]*\slang="[^"]*"', '<html lang="pt-BR"', html, count=1)
    if "<html" in html and 'lang="pt-BR"' not in html:
        html = html.replace("<html", '<html lang="pt-BR"', 1)

    html = re.sub(r"<title>.*?</title>", f"<title>{titulo}</title>", html, flags=re.DOTALL, count=1)
    html = re.sub(r'<meta[^>]+name="description"[^>]*>', "", html, flags=re.IGNORECASE)

    meta = (
        f'<meta name="description" content="{descricao}">'
        f'<meta property="og:type" content="website">'
        f'<meta property="og:title" content="{titulo}">'
        f'<meta property="og:description" content="{descricao}">'
        f'<meta property="og:image" content="{imagem}">'
        f'<meta property="og:locale" content="pt_BR">'
        f'<meta name="twitter:card" content="summary_large_image">'
    )
    return html.replace("<head>", f"<head>{meta}", 1)


def _reescrever_contatos(html: str, lead: dict[str, Any]) -> str:
    """
    Substitui e-mails e telefones que ficaram nos ATRIBUTOS do template.

    A extração de texto só enxerga o que está entre tags, então
    `href="mailto:hello@exoape.com"` sobrevivia intacto: o site do cliente
    saía com o e-mail da agência holandesa dona do template. O mesmo vale
    para `tel:` com número estrangeiro.

    Args:
        html: HTML já compilado.
        lead: lead validado.

    Returns:
        HTML com os contatos apontando para o negócio certo.
    """
    from lib77_engine import _dominio, _so_digitos

    email = f"contato@{_dominio(lead['nome'])}.com.br"
    html = re.sub(r'mailto:[^"\'\s>]+', f"mailto:{email}", html, flags=re.IGNORECASE)

    digitos = _so_digitos(lead["telefone"])
    if digitos:
        html = re.sub(r'tel:[+\d\s()\-.]+', f"tel:+55{digitos}", html, flags=re.IGNORECASE)
    return html


def _apontar_ctas(html: str, lead: dict[str, Any]) -> str:
    """Manda todo link vazio ou âncora morta para o WhatsApp do lead."""
    destino = lead["whatsapp"] if lead["whatsapp"] != "#contato" else "#contato"
    if destino == "#contato":
        return html
    return re.sub(r'href="#"', f'href="{destino}" target="_blank" rel="noopener"', html)


def compilar(
    lead_data: dict[str, Any],
    slug: str | None = None,
    schema: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Gera o site final do lead a partir de um template já preparado.

    Args:
        lead_data: dados do lead vindos do Google Places.
        slug: template a usar. Se omitido, o seletor escolhe pelo nicho.
        schema: saida do `hybrid_engine`, para os textos por nicho.

    Returns:
        dict com `status`, `empresa`, `template`, `output_html_file`,
        `imagens_trocadas`, `avisos` e `marcadores_usados`.

    Raises:
        TemplateNaoPreparado: template ainda sem versão em português.
        CompilacaoError: lead inválido ou auditoria reprovada.
    """
    from lib77_engine import AuditoriaReprovada, Lib77Engine, Lib77Error, _slug

    try:
        lead = Lib77Engine.validar_lead(lead_data)
    except Lib77Error as exc:
        raise CompilacaoError(str(exc)) from exc

    tpl = selecionar_template(lead["nicho"]) if slug is None else _por_slug(slug)
    caminho = os.path.join(PREPARADOS_DIR, f"{tpl['slug']}.pt.html")
    if not os.path.isfile(caminho):
        raise TemplateNaoPreparado(
            f"Template '{tpl['slug']}' ainda nao tem versao em portugues. "
            f"Rode: python template_translator.py {tpl['slug']}"
        )

    with open(caminho, encoding="utf-8") as f:
        html = f.read()

    valores = montar_valores(lead, schema)
    usados = sorted(set(MARCADOR.findall(html)))
    html = MARCADOR.sub(lambda m: valores.get(m.group(1), ""), html)
    html = _limpar_sobras(html)
    html, trocadas = _trocar_imagens(html, lead)
    html = _ajustar_cabeca(html, lead)
    html = _reescrever_contatos(html, lead)
    html = _apontar_ctas(html, lead)

    problemas = Lib77Engine.auditar(html)
    if MARCADOR.search(html):
        problemas.append(f"marcador nao preenchido: {MARCADOR.findall(html)[:3]}")
    if problemas:
        raise AuditoriaReprovada(problemas)

    destino = os.path.join(SAIDA_DIR, f"generated_{_slug(lead['nome'])}.html")
    with open(destino, "w", encoding="utf-8") as f:
        f.write(html)

    logger.info("Site de '%s' compilado com '%s'.", lead["nome"], tpl["slug"])
    return {
        "status": "success",
        "empresa": lead["nome"],
        "template": tpl["slug"],
        "template_nome": tpl["nome"],
        "output_html_file": destino,
        "whatsapp_link": lead["whatsapp"],
        "imagens_trocadas": trocadas,
        "marcadores_usados": usados,
        "avisos": lead["_avisos"],
    }


def _por_slug(slug: str) -> dict[str, Any]:
    """Busca um template do catálogo pelo identificador."""
    from template_preparer import carregar_catalogo

    for tpl in carregar_catalogo():
        if tpl["slug"] == slug:
            return tpl
    raise CompilacaoError(f"Template '{slug}' nao esta no catalogo.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    exemplos = [
        {"nome": "Padaria Doce Manhã", "categoria": "Padaria & Cafeteria", "cidade": "Franca",
         "estado": "SP", "telefone": "(16) 3721-4455", "avaliacao": 4.7, "reviewsCount": 312},
        {"nome": "Barbearia Cruz", "categoria": "Barbearia", "cidade": "Franca",
         "estado": "SP", "telefone": "16997001122"},
        {"nome": "Pet Feliz", "categoria": "Petshop e Veterinaria", "cidade": "Franca", "estado": "SP"},
    ]
    for exemplo in exemplos:
        escolhido = selecionar_template(exemplo["categoria"])
        print(f"{exemplo['nome']:<22} nicho '{exemplo['categoria']}' -> {escolhido['nome']} ({escolhido['slug']})")
