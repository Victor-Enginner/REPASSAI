# -*- coding: utf-8 -*-
"""
REPASS AI - Loja de Templates.

Importa templates do registry privado 77lib (formato shadcn registry-item),
guarda em cache local e extrai a ficha técnica de cada um: paleta, fontes,
seções e tecnologias — os mesmos dados que a 77lib exibe na página do
template.

O registry não expõe índice: só dá para buscar por slug. Então o catálogo
local é construído por importação, um slug de cada vez.

    python backend/templates_store.py aura-template-artisanal-specialty-91

Também aceita colar o comando npx inteiro, que o slug é extraído dele.
"""

import os
import re
import io
import json
import sys
import time
import zipfile
import urllib.parse
import urllib.request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOG_DIR = os.path.join(BASE_DIR, "data", "templates_store")
os.makedirs(CATALOG_DIR, exist_ok=True)

URL_REGISTRY = "https://77lib.dev/r"

# Preço padrão de venda, em centavos, para não trabalhar com float.
# Zero = sem preço definido. A loja esconde o selo quando é 0, em vez de
# anunciar um valor que ninguém decidiu. O preço de cada template é escolhido
# depois, um a um, editando `preco_centavos` na ficha.
PRECO_PADRAO_CENTAVOS = 0


def token():
    """Token do registry privado, vindo do .env."""
    return os.environ.get("LIB77_TOKEN", "").strip()


def extrair_slug(entrada):
    """
    Aceita slug puro, URL do registry ou o comando npx completo.

    >>> extrair_slug('npx shadcn@latest add https://77lib.dev/r/aura-x-1?token=abc')
    'aura-x-1'
    """
    texto = (entrada or "").strip()

    m = re.search(r"/r/([a-zA-Z0-9._-]+)", texto)
    if m:
        return m.group(1)

    # Slug solto: tira query string se houver.
    return texto.split("?")[0].strip().strip("/")


# --- Extração da ficha técnica -------------------------------------------

def _extrair_paleta(html, limite=16):
    """
    Cores usadas no template, ordenadas por frequência.

    Frequência importa: a cor que aparece 40 vezes é a identidade, a que
    aparece uma vez é detalhe. Ordenar por uso coloca a paleta real no topo.
    """
    achadas = re.findall(r"#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b", html)
    achadas += re.findall(r"rgba?\([^)]{3,40}\)", html)

    contagem = {}
    for c in achadas:
        chave = c.lower()
        contagem[chave] = contagem.get(chave, 0) + 1

    ordenadas = sorted(contagem.items(), key=lambda kv: kv[1], reverse=True)
    return [{"cor": c, "usos": n} for c, n in ordenadas[:limite]]


def _extrair_fontes(html):
    """Famílias do Google Fonts declaradas no <head>."""
    fontes = []
    for bruto in re.findall(r"family=([A-Za-z0-9+%:;,.@_-]+)", html):
        nome = urllib.parse.unquote(bruto).split(":")[0].replace("+", " ").strip()
        if nome and nome not in fontes:
            fontes.append(nome)
    return fontes


def _limpar_texto(t):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", t or "")).strip()


def _extrair_secoes(html, limite=12):
    """Títulos h1/h2 na ordem em que aparecem — o roteiro da página."""
    secoes = []
    for _, conteudo in re.findall(r"<(h1|h2)\b[^>]*>(.*?)</\1>", html, re.S | re.I):
        texto = _limpar_texto(conteudo)
        if texto and texto not in secoes:
            secoes.append(texto[:90])
    return secoes[:limite]


def _extrair_tecnologias(html):
    """Detecta o que o template realmente usa, para a aba de requisitos."""
    tec = ["HTML5", "CSS3"]
    checagens = [
        (r"tailwind", "Tailwind CSS"),
        (r"gsap", "GSAP"),
        (r"three(\.min)?\.js|three@", "Three.js"),
        (r"lottie", "Lottie"),
        (r"swiper", "Swiper"),
        (r"lenis", "Lenis"),
        (r"<canvas", "Canvas"),
        (r"@keyframes|animation:", "CSS Animations"),
        (r"IntersectionObserver", "IntersectionObserver"),
        (r"backdrop-filter", "Backdrop Filter"),
    ]
    for padrao, nome in checagens:
        if re.search(padrao, html, re.I):
            tec.append(nome)
    return tec


def _contar_imagens(html):
    return len(re.findall(r"<img\b", html, re.I))


def montar_design_md(ficha):
    """
    Gera o DESIGN.md do template.

    É o documento que a IA usa como fonte de verdade ao recriar o layout
    para outro negócio: preserva a direção visual e troca só marca e copy.
    """
    paleta = "\n".join(f"- {c['cor']}  ({c['usos']}x)" for c in ficha["paleta"])
    fontes = "\n".join(f"- {f}" for f in ficha["fontes"]) or "- (nenhuma externa)"
    secoes = "\n".join(f"- {s}" for s in ficha["secoes"]) or "- (não detectadas)"

    return f"""# DESIGN.md — {ficha['titulo']}

Origem: registry privado 77lib
Slug: `{ficha['slug']}`

## Objetivo
{ficha['descricao']}

## Direção visual
- Manter a composição original: proporções, ritmo vertical, blocos de
  conteúdo e atmosfera.
- Preservar hierarquia tipográfica, contraste, espaçamento, estados
  visuais e tratamento de imagens.
- Adaptar responsivamente sem descaracterizar o layout.

## Paleta detectada
{paleta}

## Tipografia detectada
{fontes}

## Estrutura de seções
{secoes}

## Regras de implementação
- O `index.html` do template é a fonte principal de verdade.
- Não simplificar a identidade visual: manter imagens, gradientes, cards,
  overlays, efeitos e ritmo da copy.
- Ao converter para React, chegar ao resultado fiel antes de refatorar
  em componentes.
- Trocar apenas textos, links e imagens necessários ao novo negócio.
- Nunca inserir número que o negócio não tenha (avaliação, anos de
  mercado, nº de clientes). Dado não verificado não vai para o site.
"""


def montar_prompts(ficha):
    """Os três prompts que a página do template oferece para copiar."""
    return {
        "integracao": (
            f'Recrie o template "{ficha["titulo"]}" como uma landing page '
            "responsiva fiel ao original. Use o index.html e o DESIGN.md como "
            "fonte de verdade. Preserve layout, hierarquia visual, tipografia, "
            "espaçamento, paleta, posicionamento de imagens, gradientes, sombras, "
            "cards, navegação, estrutura de CTA, animações e direção de arte. "
            "Mantenha a ordem das seções e o estilo da copy, salvo pedido "
            "explícito de adaptação. Ao reconstruir em React, Next.js ou "
            "HTML/CSS puro, entregue código pronto para produção e mantenha a "
            "maior fidelidade visual possível em desktop e mobile."
        ),
        "customizacao": (
            "Use o DESIGN.md para preservar o estilo original e adaptar marca, "
            "copy, imagens e CTAs ao novo negócio. Substitua apenas o que for "
            "necessário para o cliente. Não invente números sobre o negócio "
            "(avaliação, tempo de mercado, quantidade de clientes) — use apenas "
            "dados verificados ou omita."
        ),
        "design_md": ficha["design_md"],
    }


def analisar(slug, dados_registry):
    """Monta a ficha completa a partir da resposta do registry."""
    arquivos = dados_registry.get("files") or [{}]
    html = arquivos[0].get("content", "") or ""

    ficha = {
        "slug": slug,
        "titulo": (dados_registry.get("title") or slug).strip(),
        "descricao": (dados_registry.get("description") or "").strip(),
        "arquivo": arquivos[0].get("path", f"{slug}.html"),
        "tamanho_html": len(html),
        "paleta": _extrair_paleta(html),
        "fontes": _extrair_fontes(html),
        "secoes": _extrair_secoes(html),
        "tecnologias": _extrair_tecnologias(html),
        "imagens": _contar_imagens(html),
        "preco_centavos": PRECO_PADRAO_CENTAVOS,
        "comando_instalacao": (
            f"npx shadcn@latest add {URL_REGISTRY}/{slug}?token=SEU_TOKEN"
        ),
        "requisitos": [
            "Navegador moderno",
            "Personalizar textos, imagens e links antes de publicar",
        ],
    }
    ficha["design_md"] = montar_design_md(ficha)
    ficha["prompts"] = montar_prompts(ficha)
    return ficha, html


# --- Persistência ---------------------------------------------------------

def caminho_html(slug):
    return os.path.join(CATALOG_DIR, f"{slug}.html")


def caminho_ficha(slug):
    return os.path.join(CATALOG_DIR, f"{slug}.json")


def importar(entrada, forcar=False):
    """
    Importa um template do registry para o catálogo local.

    Args:
        entrada: slug, URL ou comando npx completo.
        forcar: reimporta mesmo se já estiver em cache.

    Returns:
        dict com a ficha do template.

    Raises:
        RuntimeError: token ausente ou falha na busca.
    """
    slug = extrair_slug(entrada)
    if not slug:
        raise RuntimeError("Slug do template não identificado na entrada.")

    if not forcar and os.path.isfile(caminho_ficha(slug)):
        with open(caminho_ficha(slug), encoding="utf-8") as f:
            return json.load(f)

    tk = token()
    if not tk:
        raise RuntimeError("LIB77_TOKEN não configurado em backend/.env")

    url = f"{URL_REGISTRY}/{slug}?token={urllib.parse.quote(tk)}"
    req = urllib.request.Request(url, headers={"User-Agent": "REPASS-AI/1.0"})

    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            dados = json.loads(res.read().decode("utf-8"))
    except Exception as e:
        raise RuntimeError(f"Falha ao buscar '{slug}' no registry: {e}")

    ficha, html = analisar(slug, dados)
    ficha["importado_em"] = time.strftime("%Y-%m-%dT%H:%M:%S")

    with open(caminho_html(slug), "w", encoding="utf-8") as f:
        f.write(html)
    with open(caminho_ficha(slug), "w", encoding="utf-8") as f:
        json.dump(ficha, f, ensure_ascii=False, indent=2)

    return ficha


def importar_lote(entradas, forcar=False):
    """
    Importa vários templates de uma vez.

    O registry não expõe índice — só busca por slug. Então a forma prática
    de montar um catálogo grande é colar de uma vez a lista de comandos
    `npx` (ou de slugs) copiada da interface do registry.

    Aceita string com um item por linha, ou uma lista.

    Returns:
        dict com `importados` (fichas), `falhas` (slug + erro) e `total`.
    """
    if isinstance(entradas, str):
        itens = [l.strip() for l in entradas.splitlines() if l.strip()]
    else:
        itens = [str(e).strip() for e in (entradas or []) if str(e).strip()]

    # Deduplica preservando a ordem: colar a mesma lista duas vezes não
    # deve gastar duas requisições por template.
    vistos = set()
    unicos = []
    for item in itens:
        slug = extrair_slug(item)
        if slug and slug not in vistos:
            vistos.add(slug)
            unicos.append(item)

    importados, falhas = [], []
    for item in unicos:
        try:
            importados.append(importar(item, forcar=forcar))
        except RuntimeError as e:
            falhas.append({"entrada": extrair_slug(item) or item[:60], "erro": str(e)})

    return {
        "importados": importados,
        "falhas": falhas,
        "total": len(unicos),
    }


def listar():
    """Catálogo local, mais recente primeiro. Não inclui o HTML."""
    fichas = []
    for nome in os.listdir(CATALOG_DIR):
        if not nome.endswith(".json"):
            continue
        try:
            with open(os.path.join(CATALOG_DIR, nome), encoding="utf-8") as f:
                ficha = json.load(f)
            # A listagem não precisa do DESIGN.md inteiro nem dos prompts.
            fichas.append({
                k: v for k, v in ficha.items()
                if k not in ("design_md", "prompts")
            })
        except Exception:
            continue

    fichas.sort(key=lambda t: t.get("importado_em", ""), reverse=True)
    return fichas


def obter(slug):
    """Ficha completa de um template, com DESIGN.md e prompts."""
    caminho = caminho_ficha(extrair_slug(slug))
    if not os.path.isfile(caminho):
        return None
    with open(caminho, encoding="utf-8") as f:
        return json.load(f)


def html_do_template(slug):
    """HTML bruto do template, para o iframe de preview."""
    caminho = caminho_html(extrair_slug(slug))
    if not os.path.isfile(caminho):
        return None
    with open(caminho, encoding="utf-8") as f:
        return f.read()


def montar_zip(slug):
    """
    Empacota index.html + DESIGN.md em memória, para download.

    Returns:
        bytes do .zip, ou None se o template não estiver no catálogo.
    """
    slug = extrair_slug(slug)
    ficha = obter(slug)
    html = html_do_template(slug)
    if not ficha or html is None:
        return None

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("index.html", html)
        z.writestr("DESIGN.md", ficha.get("design_md", ""))
        z.writestr("prompts.json", json.dumps(ficha.get("prompts", {}), ensure_ascii=False, indent=2))
    return buffer.getvalue()


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    if len(sys.argv) < 2:
        print(__doc__)
        print("\nCatálogo local:")
        for t in listar():
            preco = t.get("preco_centavos", 0) / 100
            print(f"  {t['slug']:<46} R$ {preco:>6.2f}  {t['titulo']}")
        sys.exit(0)

    for entrada in sys.argv[1:]:
        try:
            f = importar(entrada, forcar=True)
            print(f"[ok] {f['slug']}")
            print(f"     {f['titulo']}")
            print(f"     paleta: {len(f['paleta'])} cores | fontes: {', '.join(f['fontes']) or '-'}")
            print(f"     seções: {len(f['secoes'])} | tecnologias: {', '.join(f['tecnologias'])}")
        except RuntimeError as e:
            print(f"[erro] {entrada}: {e}")
