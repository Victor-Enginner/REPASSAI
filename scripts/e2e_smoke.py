#!/usr/bin/env python3
"""
Primeiro teste ponta a ponta, somente leitura, do REPASS AI.

Valida navegador/arquivos estáticos -> proxy/API -> autenticação ->
Supabase -> R2, sem consumir Google Places, LLM ou alterar dados.
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.request


ROOT = pathlib.Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))


def carregar_ambiente() -> None:
    from dotenv import load_dotenv

    load_dotenv(BACKEND_DIR / ".env", override=False)


def requisitar(url: str, *, method: str = "GET", body=None, headers=None, timeout=12):
    dados = None
    headers = dict(headers or {})
    headers.setdefault("User-Agent", "REPASS-AI-E2E/1.0")
    if body is not None:
        dados = json.dumps(body).encode("utf-8")
        headers.setdefault("Content-Type", "application/json")
    req = urllib.request.Request(url, data=dados, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resposta:
            return resposta.status, resposta.read(), dict(resposta.headers)
    except urllib.error.HTTPError as erro:
        return erro.code, erro.read(), dict(erro.headers)


def json_get(url: str):
    status, corpo, _ = requisitar(url)
    return status, json.loads(corpo.decode("utf-8"))


class Relatorio:
    def __init__(self):
        self.itens = []

    def ok(self, nome: str, detalhe: str):
        self.itens.append(("OK", nome, detalhe))

    def falha(self, nome: str, detalhe: str):
        self.itens.append(("FALHA", nome, detalhe))

    def aviso(self, nome: str, detalhe: str):
        self.itens.append(("AVISO", nome, detalhe))

    def verificar(self, condicao: bool, nome: str, sucesso: str, falha: str):
        (self.ok if condicao else self.falha)(nome, sucesso if condicao else falha)

    def imprimir(self) -> int:
        print("\nREPASS AI — TESTE PONTA A PONTA (SOMENTE LEITURA)")
        print("=" * 58)
        for estado, nome, detalhe in self.itens:
            print(f"[{estado:5}] {nome}: {detalhe}")
        falhas = sum(1 for estado, _, _ in self.itens if estado == "FALHA")
        avisos = sum(1 for estado, _, _ in self.itens if estado == "AVISO")
        print("-" * 58)
        print(f"Resultado: {len(self.itens) - falhas - avisos} OK, {avisos} avisos, {falhas} falhas")
        return 1 if falhas else 0


def testar_frontend(rel: Relatorio, base: str):
    status, html, _ = requisitar(f"{base}/")
    texto = html.decode("utf-8", errors="replace")
    rel.verificar(status == 200 and "<div id=\"root\"" in texto, "Frontend", f"{status} e raiz React presente", f"HTTP {status} ou raiz React ausente")

    status_mapa, mapa, _ = requisitar(f"{base}/docs/repass-architecture-map.html")
    rel.verificar(status_mapa == 200 and b"Mapa Vivo" in mapa, "Mapa vivo", f"{status_mapa} servido pelo frontend", f"HTTP {status_mapa} ou conteúdo inválido")

    scripts = re.findall(r'<script[^>]+src="([^"]+)"', texto)
    if scripts:
        alvo = scripts[-1]
        url = alvo if alvo.startswith("http") else f"{base}{alvo if alvo.startswith('/') else '/' + alvo}"
        status_asset, corpo, _ = requisitar(url)
        rel.verificar(status_asset == 200 and len(corpo) > 100, "Bundle frontend", f"{len(corpo)} bytes acessíveis", f"asset {alvo} retornou {status_asset}")
    else:
        rel.falha("Bundle frontend", "nenhum script encontrado no HTML")


def testar_api(rel: Relatorio, base: str):
    inicio = time.perf_counter()
    status, health = json_get(f"{base}/api/health")
    ms = round((time.perf_counter() - inicio) * 1000)
    rel.verificar(status == 200 and health.get("status") == "ok", "API", f"saudável em {ms} ms", f"HTTP {status}: {health}")

    status, sistema = json_get(f"{base}/api/system/status")
    rel.verificar(status == 200 and sistema.get("api", {}).get("operacional") is True, "Diagnóstico", "contrato /api/system/status válido", f"HTTP {status} ou contrato inválido")

    ia = sistema.get("ia", {})
    rel.verificar(ia.get("operacional") is True and ia.get("motores_prontos", 0) > 0, "Motores de IA", f"{ia.get('motores_prontos', 0)} prontos", "nenhum motor pronto")

    storage = sistema.get("storage", {})
    rel.verificar(storage.get("r2_configurado") is True, "R2 no backend", "credenciais e cliente configurados", "R2 não configurado")

    status, profundo = json_get(f"{base}/api/system/diagnostics")
    supa_profundo = profundo.get("supabase", {})
    r2_profundo = profundo.get("r2", {})
    rel.verificar(
        status == 200 and supa_profundo.get("conectado") is True,
        "Diagnóstico Supabase",
        f"conexão real em {supa_profundo.get('latencia_ms')} ms",
        f"HTTP {status}: {supa_profundo.get('erro')}",
    )
    rel.verificar(
        status == 200 and r2_profundo.get("r2_conectado") is True,
        "Diagnóstico R2",
        f"bucket real em {r2_profundo.get('latencia_ms')} ms",
        f"HTTP {status}: {r2_profundo.get('erro')}",
    )

    status, auth = json_get(f"{base}/api/auth/status")
    rel.verificar(status == 200 and auth.get("auth_ativo") is True, "Autenticação", "modo multiusuário ativo", f"auth_ativo={auth.get('auth_ativo')}")

    status_bloqueio, corpo, _ = requisitar(
        f"{base}/api/leads/scan",
        method="POST",
        body={"estado": "SP", "cidade": "teste-e2e", "nichos": "teste", "max_results": 1},
    )
    rel.verificar(status_bloqueio == 401, "Proteção de dados", "scanner bloqueia chamada sem JWT antes de gerar custo", f"esperado 401, recebido {status_bloqueio}: {corpo[:160]!r}")

    status, templates = json_get(f"{base}/api/templates")
    quantidade = len(templates.get("templates", []))
    rel.verificar(status == 200 and quantidade > 0, "Templates", f"{quantidade} no catálogo", f"HTTP {status}; catálogo vazio")

    try:
        req = urllib.request.Request(f"{base}/api/logs/stream", headers={"Accept": "text/event-stream"})
        with urllib.request.urlopen(req, timeout=6) as resposta:
            linha = resposta.readline().decode("utf-8", errors="replace").strip()
            rel.verificar(resposta.status == 200 and (linha.startswith("data:") or linha.startswith(":")), "SSE", "canal abriu e transmitiu pulso", f"resposta inesperada: {linha[:100]}")
    except Exception as exc:
        rel.falha("SSE", f"{type(exc).__name__}: {exc}")


def testar_supabase(rel: Relatorio):
    try:
        import supabase_client

        linhas = supabase_client.selecionar("perfis", limite=1)
        rel.ok("Supabase", f"PostgREST respondeu; leitura isolada retornou {len(linhas)} registro(s)")
    except Exception as exc:
        rel.falha("Supabase", f"{type(exc).__name__}: {exc}")


def testar_r2_publico(rel: Relatorio):
    base = (
        os.environ.get("R2_PUBLIC_BASE_URL", "")
        or os.environ.get("CLOUDFLARE_R2_PUBLIC_BASE_URL", "")
    ).strip().rstrip("/")
    arquivo = BACKEND_DIR / "data" / "r2_bucket" / "fogo-vivo-steakhouse.html"
    if not base:
        rel.falha("Publicação R2", "R2_PUBLIC_BASE_URL ausente")
        return
    if not arquivo.exists():
        rel.aviso("Publicação R2", "não há artefato local conhecido para comparar")
        return
    try:
        status, corpo, headers = requisitar(f"{base}/{arquivo.name}", timeout=20)
    except Exception as exc:
        rel.falha("Publicação R2", f"{type(exc).__name__}: {exc}")
        return
    tipo = headers.get("Content-Type", "")
    rel.verificar(status == 200 and b"<html" in corpo.lower(), "Publicação R2", f"{status}, {len(corpo)} bytes, {tipo}", f"HTTP {status} ou HTML inválido")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--frontend", default="http://localhost:3000")
    parser.add_argument("--backend", default="http://localhost:8000")
    args = parser.parse_args()

    carregar_ambiente()
    rel = Relatorio()
    testar_frontend(rel, args.frontend.rstrip("/"))
    testar_api(rel, args.backend.rstrip("/"))
    testar_supabase(rel)
    testar_r2_publico(rel)
    raise SystemExit(rel.imprimir())


if __name__ == "__main__":
    main()
