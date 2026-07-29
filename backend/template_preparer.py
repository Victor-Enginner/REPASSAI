# -*- coding: utf-8 -*-
"""
REPASS AI — Preparador de Templates (Camada 2).

Transforma um template cru do 77lib num "template preparado": sem rastreador
de terceiro, com todos os textos visíveis extraídos e endereçáveis.

Por que trabalhar por POSIÇÃO e não por frase
---------------------------------------------
O motor antigo procurava frases conhecidas ("Voir la Vidéo") e trocava por
português. Isso exigia uma regra escrita à mão por frase, por template, por
idioma — e os 8 templates estão em 6 idiomas, incluindo búlgaro e catalão.
Seriam ~200 regras impossíveis de revisar.

Aqui cada trecho de texto é localizado pelo seu deslocamento em bytes dentro
do HTML. Trocar o conteúdo é recortar e colar por posição, o que funciona
igual em qualquer idioma e não depende de adivinhar a frase.

Fluxo:
    1. `remover_rastreadores()` — tira o Google Analytics do 77lib
    2. `extrair_textos()`       — lista os trechos visíveis, com posição
    3. (tradução acontece fora, uma vez, e vira um dicionário id->texto)
    4. `aplicar_textos()`       — devolve o HTML com os textos novos
"""

from __future__ import annotations

import html as html_lib
import json
import os
import re
from typing import Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOGO = os.path.join(BASE_DIR, "data", "template_catalog.json")
CRUS_DIR = os.path.join(BASE_DIR, "data", "77lib_catalog")
PREPARADOS_DIR = os.path.join(BASE_DIR, "data", "templates_preparados")

os.makedirs(PREPARADOS_DIR, exist_ok=True)

# Blocos cujo conteúdo NÃO é texto visível e não pode ser traduzido.
BLOCOS_OPACOS = re.compile(
    r"<(script|style|noscript|svg)\b.*?</\1\s*>|<!--.*?-->",
    re.DOTALL | re.IGNORECASE,
)

# Rastreadores de terceiro embutidos pelo 77lib nos templates. Todo site
# vendido ao cliente reportava visitas para a conta deles.
RASTREADORES = (
    re.compile(r"<script[^>]*googletagmanager\.com[^>]*>\s*</script>", re.IGNORECASE),
    re.compile(
        r"<script\b[^>]*>(?:(?!</script>).)*?(?:gtag\(|dataLayer|G-[A-Z0-9]{8,})"
        r"(?:(?!</script>).)*?</script>",
        re.DOTALL | re.IGNORECASE,
    ),
)

# Texto que não vale traduzir: número solto, pontuação, símbolo isolado.
SEM_VALOR = re.compile(r"^[\s\d\W_]*$")

# Exceções ao filtro acima. Preço e telefone são só símbolo e número, então
# caíam como "sem valor" e nunca eram extraídos — e é justamente o dado que
# NÃO pode sobrar do negócio original. O site de uma padaria em Franca saiu
# com preços em dólar, e o template genérico com o telefone da agência
# holandesa (+31 772 086 200) no rodapé.
MOEDA = re.compile(r"[$€£¥]\s?\d|\d\s?[$€£¥]|\bUSD\b|\bEUR\b|\bCAD\b", re.IGNORECASE)
TELEFONE = re.compile(r"(?:\+?\d[\d\s().\-]{6,}\d)")


def _tem_dado_sensivel(texto: str) -> bool:
    """True se o trecho carrega preço ou telefone, que precisam ser tratados."""
    return bool(MOEDA.search(texto) or TELEFONE.search(texto))


def _sem_blocos_opacos(html: str) -> str:
    """
    Substitui script/style/comentário por espaços do mesmo tamanho.

    Preserva os deslocamentos do documento original, então uma posição
    encontrada aqui vale no HTML de verdade.

    Args:
        html: HTML completo.

    Returns:
        HTML com os blocos opacos apagados, mesmo comprimento.
    """
    return BLOCOS_OPACOS.sub(lambda m: " " * len(m.group(0)), html)


def remover_rastreadores(html: str) -> tuple[str, int]:
    """
    Retira scripts de analytics de terceiro do template.

    Returns:
        Tupla (html_limpo, quantidade_removida).
    """
    total = 0
    for padrao in RASTREADORES:
        html, n = padrao.subn("", html)
        total += n
    return html, total


def extrair_textos(html: str) -> list[dict[str, Any]]:
    """
    Lista os trechos de texto visível, cada um com sua posição no documento.

    Args:
        html: HTML já sem rastreadores.

    Returns:
        Lista de dicts com `id`, `texto`, `inicio`, `fim` e `tag` (o elemento
        que contém o trecho, útil para saber se é título, botão ou parágrafo).
    """
    mascarado = _sem_blocos_opacos(html)
    itens: list[dict[str, Any]] = []

    for achado in re.finditer(r">([^<>]+)<", mascarado):
        bruto = achado.group(1)
        texto = bruto.strip()
        if not texto or len(texto) < 2:
            continue
        if SEM_VALOR.match(texto) and not _tem_dado_sensivel(texto):
            continue

        # Tag de abertura imediatamente anterior: dá o papel do trecho.
        antes = mascarado.rfind("<", 0, achado.start())
        tag = "?"
        if antes != -1:
            m = re.match(r"<\s*([a-zA-Z][\w-]*)", mascarado[antes : achado.start() + 1])
            if m:
                tag = m.group(1).lower()

        deslocamento = achado.start(1) + (len(bruto) - len(bruto.lstrip()))
        itens.append({
            "id": len(itens),
            "tag": tag,
            "texto": html_lib.unescape(texto),
            "inicio": deslocamento,
            "fim": deslocamento + len(texto),
        })

    return itens


def aplicar_textos(html: str, novos: dict[int, str], itens: list[dict[str, Any]]) -> str:
    """
    Reescreve o HTML trocando os trechos pelos textos novos.

    A substituição vai do fim para o início: mexer no começo primeiro
    invalidaria todas as posições seguintes.

    Args:
        html: HTML original (o mesmo usado em `extrair_textos`).
        novos: mapa id -> texto novo. Ids ausentes ficam como estão.
        itens: saída de `extrair_textos`.

    Returns:
        HTML com os textos aplicados.
    """
    for item in sorted(itens, key=lambda i: i["inicio"], reverse=True):
        novo = novos.get(item["id"])
        if novo is None:
            continue
        html = html[: item["inicio"]] + html_lib.escape(novo, quote=False) + html[item["fim"] :]
    return html


def carregar_catalogo() -> list[dict[str, Any]]:
    """Lê o catálogo e devolve só os templates ativos."""
    with open(CATALOGO, encoding="utf-8") as f:
        return [t for t in json.load(f)["templates"] if t.get("ativo")]


def carregar_html_cru(slug: str) -> str:
    """
    Lê o HTML cru de um template já baixado do registry.

    Raises:
        FileNotFoundError: se o template ainda não foi baixado.
    """
    caminho = os.path.join(CRUS_DIR, f"{slug}.json")
    with open(caminho, encoding="utf-8") as f:
        dados = json.load(f)
    arquivos = dados.get("files") or []
    if not arquivos or not arquivos[0].get("content"):
        raise FileNotFoundError(f"Template '{slug}' sem conteúdo HTML no cache.")
    return arquivos[0]["content"]


def preparar(slug: str) -> dict[str, Any]:
    """
    Executa a preparação completa de um template e grava o resultado.

    Returns:
        dict com `slug`, `rastreadores_removidos`, `total_textos`,
        `palavras` e os caminhos gravados.
    """
    html = carregar_html_cru(slug)
    html, removidos = remover_rastreadores(html)
    itens = extrair_textos(html)

    destino_html = os.path.join(PREPARADOS_DIR, f"{slug}.html")
    destino_textos = os.path.join(PREPARADOS_DIR, f"{slug}.textos.json")

    with open(destino_html, "w", encoding="utf-8") as f:
        f.write(html)
    with open(destino_textos, "w", encoding="utf-8") as f:
        json.dump(itens, f, indent=2, ensure_ascii=False)

    return {
        "slug": slug,
        "rastreadores_removidos": removidos,
        "total_textos": len(itens),
        "palavras": sum(len(i["texto"].split()) for i in itens),
        "html": destino_html,
        "textos": destino_textos,
    }


if __name__ == "__main__":
    print(f"{'TEMPLATE':<40}{'RASTR':>6}{'TRECHOS':>9}{'PALAVRAS':>10}")
    for tpl in carregar_catalogo():
        try:
            r = preparar(tpl["slug"])
            print(f"{tpl['slug'].replace('aura-template-',''):<40}"
                  f"{r['rastreadores_removidos']:>6}{r['total_textos']:>9}{r['palavras']:>10}")
        except FileNotFoundError as exc:
            print(f"{tpl['slug'][:38]:<40}  nao baixado ({exc})")
