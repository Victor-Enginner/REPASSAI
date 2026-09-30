# -*- coding: utf-8 -*-
"""
REPASS AI — Auditor de Templates (somente leitura).

Examina a saúde TÉCNICA dos templates e dos sites gerados: estrutura do HTML,
responsividade, dependências externas, acessibilidade e resíduo do negócio
original.

Este módulo NÃO ALTERA NENHUM ARQUIVO. É diagnóstico puro, para decidir o que
consertar sabendo o tamanho do problema — mexer em 8 templates às cegas é o
caminho mais rápido para quebrar o que já funciona.

Severidades:
    critico  — quebra o site ou entrega dado de terceiro ao cliente
    grave    — compromete a venda (não responsivo, não indexa)
    aviso    — acabamento; não impede o uso

Uso:
    python template_auditor.py                 # audita templates preparados
    python template_auditor.py --gerados       # audita os sites já gerados
    python template_auditor.py --detalhe SLUG  # tudo o que achou em um só
"""

from __future__ import annotations

import argparse
import glob
import os
import re
from html.parser import HTMLParser
from typing import Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PREPARADOS_DIR = os.path.join(BASE_DIR, "data", "templates_preparados")
GERADOS_DIR = os.path.join(BASE_DIR, "data", "77lib_catalog")

# Elementos que não fecham. Cobrar fechamento deles geraria falso alarme.
VAZIOS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}

# Conteúdo que denuncia o template de agência sobrevivendo traduzido.
# A auditoria do lib77 procura os nomes originais ("Columbia Pictures"), mas
# eles foram TRADUZIDOS — "Comemoração de um Século de Cinema" passou batido
# no site de um petshop.
RESIDUO_AGENCIA = (
    ("Behance", "rede de portfólio de designer"),
    ("Dribbble", "rede de portfólio de designer"),
    ("Século de Cinema", "projeto fictício do template"),
    ("Soluções Sustentáveis", "projeto fictício do template"),
    ("Trilha Fotográfica", "projeto fictício do template"),
    ("Inovação em Saúde", "projeto fictício do template"),
    ("fones de ouvido", "texto de estúdio de design"),
    ("clientes e parceiros", "linguagem de agência"),
    ("projetos que desenvolvemos", "linguagem de agência"),
)

MOEDA_ESTRANGEIRA = re.compile(r"[$€£¥]\s?\d[\d.,]*|\bUSD\b|\bEUR\b|\bCAD\b")
CIRILICO = re.compile(r"[Ѐ-ӿ]")

# Largura fixa grande em CSS quebra o layout no celular.
LARGURA_FIXA = re.compile(r"(?:min-)?width:\s*(\d{3,})px")


class ContadorDeTags(HTMLParser):
    """Acompanha abertura e fechamento para achar tag não fechada."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.pilha: list[str] = []
        self.sobrando: list[str] = []
        self.fechados_sem_abrir: list[str] = []
        self.imgs = 0
        self.imgs_sem_alt = 0
        self.titulos: list[str] = []
        self.links_vazios = 0
        self.inputs = 0
        self.inputs_sem_nome = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        d = dict(attrs)
        if tag == "img":
            self.imgs += 1
            if not (d.get("alt") or "").strip():
                self.imgs_sem_alt += 1
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.titulos.append(tag)
        elif tag == "a":
            href = (d.get("href") or "").strip()
            if href in ("", "#"):
                self.links_vazios += 1
        elif tag == "input":
            self.inputs += 1
            if not (d.get("aria-label") or d.get("id") or d.get("name")):
                self.inputs_sem_nome += 1

        if tag not in VAZIOS:
            self.pilha.append(tag)

    def handle_endtag(self, tag: str) -> None:
        if tag in VAZIOS:
            return
        if tag in self.pilha:
            while self.pilha and self.pilha[-1] != tag:
                self.sobrando.append(self.pilha.pop())
            if self.pilha:
                self.pilha.pop()
        else:
            self.fechados_sem_abrir.append(tag)


def _texto_visivel(html: str) -> str:
    """Texto que o visitante lê, sem script, style nem marcação."""
    limpo = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.DOTALL | re.IGNORECASE)
    limpo = re.sub(r"<[^>]+>", " ", limpo)
    return re.sub(r"\s+", " ", limpo)


def auditar_html(html: str, nome: str) -> list[dict[str, str]]:
    """
    Roda todas as verificações sobre um documento.

    Args:
        html: conteúdo completo do arquivo.
        nome: identificador para o relatório.

    Returns:
        Lista de achados, cada um com `severidade`, `area` e `detalhe`.
    """
    achados: list[dict[str, str]] = []

    def anota(sev: str, area: str, detalhe: str) -> None:
        achados.append({"severidade": sev, "area": area, "detalhe": detalhe})

    texto = _texto_visivel(html)

    # ---------------------------------------------------------- estrutura
    parser = ContadorDeTags()
    try:
        parser.feed(html)
    except Exception as exc:  # o parser da stdlib é tolerante; se falhar, é grave
        anota("critico", "estrutura", f"HTML nao pode ser lido: {type(exc).__name__}")
        return achados

    abertos = [t for t in parser.pilha if t not in ("html", "body", "head")]
    if abertos:
        anota("grave", "estrutura", f"{len(abertos)} tag(s) sem fechar: {abertos[:5]}")
    if parser.fechados_sem_abrir:
        anota("grave", "estrutura", f"fechamento sem abertura: {parser.fechados_sem_abrir[:5]}")
    if "<!DOCTYPE" not in html[:200] and "<!doctype" not in html[:200]:
        anota("aviso", "estrutura", "sem DOCTYPE no inicio do arquivo")

    # ------------------------------------------------------- responsivo
    if 'name="viewport"' not in html:
        anota("critico", "responsivo", "sem meta viewport — o site nao se adapta ao celular")
    medias = len(re.findall(r"@media", html))
    classes_resp = len(re.findall(r'\b(?:sm|md|lg|xl):', html))
    if medias == 0 and classes_resp < 10:
        anota("grave", "responsivo", f"quase nada responsivo (@media={medias}, classes={classes_resp})")
    larguras = [int(m) for m in LARGURA_FIXA.findall(html) if int(m) >= 500]
    if larguras:
        anota("aviso", "responsivo", f"{len(larguras)} largura(s) fixa(s) >= 500px: {sorted(set(larguras))[:4]}")

    # -------------------------------------------------- dependencia externa
    externos = re.findall(r'<(?:script|link)[^>]+(?:src|href)="(https?://[^"]+)"', html)
    hosts = sorted({re.sub(r"https?://([^/]+).*", r"\1", u) for u in externos})
    if hosts:
        sev = "grave" if any("tailwind" in h for h in hosts) else "aviso"
        anota(sev, "dependencia", f"depende de {len(hosts)} host(s) externo(s): {hosts[:4]}")

    # ------------------------------------------------------ acessibilidade
    if parser.imgs_sem_alt:
        anota("aviso", "acessibilidade", f"{parser.imgs_sem_alt} de {parser.imgs} imagem(ns) sem alt")
    niveis = [int(t[1]) for t in parser.titulos]
    if not niveis:
        anota("grave", "acessibilidade", "nenhum titulo h1-h6 — ruim para busca e leitor de tela")
    else:
        if niveis.count(1) == 0:
            anota("grave", "acessibilidade", "sem <h1>")
        elif niveis.count(1) > 1:
            anota("aviso", "acessibilidade", f"{niveis.count(1)} elementos <h1> (o certo e um)")
        saltos = [(a, b) for a, b in zip(niveis, niveis[1:]) if b - a > 1]
        if saltos:
            anota("aviso", "acessibilidade", f"hierarquia de titulos pula nivel: {saltos[:3]}")
    if parser.inputs_sem_nome:
        anota("aviso", "acessibilidade", f"{parser.inputs_sem_nome} campo(s) sem rotulo")
    if "<main" not in html:
        anota("aviso", "acessibilidade", "sem <main>")

    # -------------------------------------------------------------- idioma
    lang = re.search(r'<html[^>]*\slang="([^"]*)"', html)
    if not lang:
        anota("critico", "idioma", "sem atributo lang no <html>")
    elif not lang.group(1).lower().startswith("pt"):
        anota("critico", "idioma", f"idioma declarado e '{lang.group(1)}', deveria ser pt-BR")

    # ------------------------------------------------------------ conteudo
    if CIRILICO.search(texto):
        anota("critico", "conteudo", "texto em alfabeto cirilico remanescente")
    moedas = MOEDA_ESTRANGEIRA.findall(texto)
    if moedas:
        anota("critico", "conteudo", f"moeda estrangeira: {sorted(set(moedas))[:4]}")
    for termo, motivo in RESIDUO_AGENCIA:
        if termo.lower() in texto.lower():
            anota("grave", "conteudo", f"'{termo}' — {motivo}")
    duplicado = re.search(r"\b(\w{4,}(?:\s+\w+){2,4})\s+\1\b", texto)
    if duplicado:
        anota("grave", "conteudo", f"texto duplicado: '{duplicado.group(1)[:44]}'")

    # ------------------------------------------------------------ funcional
    if parser.links_vazios:
        sev = "grave" if parser.links_vazios > 5 else "aviso"
        anota(sev, "funcional", f"{parser.links_vazios} link(s) sem destino (href vazio ou #)")
    marcadores = re.findall(r"\{\{[A-Z0-9_]+\}\}", html)
    if marcadores:
        anota("critico", "funcional", f"marcador nao preenchido: {sorted(set(marcadores))[:4]}")

    return achados


def auditar_arquivo(caminho: str) -> dict[str, Any]:
    """Lê um arquivo e devolve seu relatório."""
    with open(caminho, encoding="utf-8", errors="replace") as f:
        html = f.read()
    nome = os.path.basename(caminho)
    achados = auditar_html(html, nome)
    return {
        "arquivo": nome,
        "kb": len(html) // 1024,
        "achados": achados,
        "criticos": sum(1 for a in achados if a["severidade"] == "critico"),
        "graves": sum(1 for a in achados if a["severidade"] == "grave"),
        "avisos": sum(1 for a in achados if a["severidade"] == "aviso"),
    }


def _relatorio(caminhos: list[str], titulo: str) -> int:
    """Imprime o placar e devolve quantos arquivos têm problema crítico."""
    print(f"\n{titulo}")
    print("=" * 78)
    print(f"{'ARQUIVO':<40}{'KB':>5}{'CRIT':>6}{'GRAVE':>7}{'AVISO':>7}")
    print("-" * 78)

    relatorios = [auditar_arquivo(c) for c in sorted(caminhos)]
    for r in relatorios:
        marca = "  <--" if r["criticos"] else ""
        print(f"{r['arquivo'][:39]:<40}{r['kb']:>5}{r['criticos']:>6}{r['graves']:>7}{r['avisos']:>7}{marca}")

    print("-" * 78)
    tot_c = sum(r["criticos"] for r in relatorios)
    tot_g = sum(r["graves"] for r in relatorios)
    tot_a = sum(r["avisos"] for r in relatorios)
    print(f"{'TOTAL':<40}{'':>5}{tot_c:>6}{tot_g:>7}{tot_a:>7}")

    from collections import Counter
    por_area = Counter(
        (a["severidade"], a["area"])
        for r in relatorios for a in r["achados"]
    )
    print("\nPor area:")
    for (sev, area), n in sorted(por_area.items(), key=lambda x: (-x[1])):
        if sev != "aviso":
            print(f"  [{sev:<7}] {area:<16} {n}")

    return sum(1 for r in relatorios if r["criticos"])


def main(argv: list[str] | None = None) -> int:
    """CLI do auditor."""
    parser = argparse.ArgumentParser(description="Audita templates e sites gerados. Nao altera nada.")
    parser.add_argument("--gerados", action="store_true", help="auditar os sites gerados")
    parser.add_argument("--detalhe", help="mostrar todos os achados de um arquivo")
    args = parser.parse_args(argv)

    if args.detalhe:
        alvos = glob.glob(os.path.join(PREPARADOS_DIR, f"*{args.detalhe}*.pt.html"))
        alvos += glob.glob(os.path.join(GERADOS_DIR, f"*{args.detalhe}*.html"))
        if not alvos:
            print(f"Nada encontrado para '{args.detalhe}'.")
            return 1
        for alvo in alvos:
            r = auditar_arquivo(alvo)
            print(f"\n=== {r['arquivo']} ({r['kb']} KB) ===")
            if not r["achados"]:
                print("  nenhum achado")
            for a in r["achados"]:
                print(f"  [{a['severidade']:<7}] {a['area']:<15} {a['detalhe']}")
        return 0

    if args.gerados:
        return 0 if _relatorio(
            glob.glob(os.path.join(GERADOS_DIR, "generated_*.html")),
            "SITES GERADOS",
        ) == 0 else 1

    return 0 if _relatorio(
        glob.glob(os.path.join(PREPARADOS_DIR, "*.pt.html")),
        "TEMPLATES PREPARADOS (versao pt-BR, antes de receber dados do lead)",
    ) == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
