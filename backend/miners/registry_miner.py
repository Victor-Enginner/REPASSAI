# -*- coding: utf-8 -*-
"""
REPASS AI - Minerador de Registries de Componentes (Híbrido Local + Cloudflare R2)

Minera bibliotecas de componentes que expõem o formato de registry do shadcn
(`{ name, type, files: [{path, content}], dependencies }`) e monta a biblioteca
de assets do REPASS AI.

Modelo híbrido:
    - Cache local em `backend/data/asset_library/` (rápido, offline, .gitignore).
    - Cópia canônica no Cloudflare R2 sob `assets/{fonte}/{slug}/` (produção).
    - Índice leve em `asset_library/index.json`, versionável no git.

Uso:
    python -m miners.registry_miner --probe
    python -m miners.registry_miner --source magicui --limit 10
    python -m miners.registry_miner --all
    python -m miners.registry_miner --list --tipo registry:block
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Iterable

from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MINERS_DIR = os.path.join(BASE_DIR, "miners")
LIBRARY_DIR = os.path.join(BASE_DIR, "data", "asset_library")
SOURCES_PATH = os.path.join(MINERS_DIR, "sources.json")
INDEX_PATH = os.path.join(LIBRARY_DIR, "index.json")
BACKEND_ENV = os.path.join(BASE_DIR, ".env")

R2_PREFIXO = "assets"
USER_AGENT = "REPASS-AI-RegistryMiner/1.0 (+https://repass.ai)"
TIMEOUT_S = 20
RATE_LIMIT_S = 0.35
MAX_BYTES = 4 * 1024 * 1024

EXTENSAO_MIME = {
    ".tsx": "text/plain; charset=utf-8",
    ".ts": "text/plain; charset=utf-8",
    ".jsx": "text/plain; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".vue": "text/plain; charset=utf-8",
    ".svelte": "text/plain; charset=utf-8",
}

logger = logging.getLogger("registry_miner")


class RegistryMinerError(Exception):
    """Falha recuperável durante a mineração de uma fonte."""


class ItemAusenteNaOrigem(RegistryMinerError):
    """
    O item está no índice mas o servidor de origem devolve 404.

    Não é defeito do minerador: é componente listado e ainda não publicado.
    Separado de erro real para que o log não confunda os dois casos.
    """


def _http_json(url: str) -> Any:
    """
    Baixa e decodifica um JSON.

    Args:
        url: URL absoluta a requisitar.

    Returns:
        Objeto Python decodificado do JSON.

    Raises:
        ItemAusenteNaOrigem: se o servidor responder 404.
        RegistryMinerError: em erro de rede, tamanho excessivo ou JSON inválido.
    """
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as res:
            bruto = res.read(MAX_BYTES + 1)
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            raise ItemAusenteNaOrigem(f"404 em {url}") from exc
        raise RegistryMinerError(f"HTTP {exc.code} em {url}") from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise RegistryMinerError(f"{type(exc).__name__} em {url}") from exc

    if len(bruto) > MAX_BYTES:
        raise RegistryMinerError(f"Resposta acima de {MAX_BYTES} bytes em {url}")
    try:
        return json.loads(bruto.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RegistryMinerError(f"Resposta não-JSON em {url}") from exc


def _slug_seguro(valor: str) -> str:
    """Normaliza um identificador para uso seguro como nome de pasta ou chave R2."""
    limpo = re.sub(r"[^a-z0-9_-]+", "-", str(valor).lower()).strip("-")
    return limpo[:120] or "item"


def _caminho_seguro(raiz: str, relativo: str) -> str:
    """
    Resolve `relativo` dentro de `raiz`, barrando path traversal.

    Raises:
        RegistryMinerError: se o caminho final escapar de `raiz`.
    """
    nome = os.path.basename(relativo.replace("\\", "/").rstrip("/")) or "arquivo.txt"
    destino = os.path.abspath(os.path.join(raiz, nome))
    if os.path.commonpath([destino, os.path.abspath(raiz)]) != os.path.abspath(raiz):
        raise RegistryMinerError(f"Caminho inseguro recusado: {relativo}")
    return destino


def carregar_fontes() -> list[dict[str, Any]]:
    """
    Lê `sources.json` e devolve apenas as fontes ativas.

    Raises:
        RegistryMinerError: se o arquivo não existir ou estiver malformado.
    """
    if not os.path.isfile(SOURCES_PATH):
        raise RegistryMinerError(f"sources.json não encontrado em {SOURCES_PATH}")
    try:
        with open(SOURCES_PATH, encoding="utf-8") as f:
            dados = json.load(f)
    except (OSError, json.JSONDecodeError) as exc:
        raise RegistryMinerError(f"sources.json inválido: {exc}") from exc
    return [s for s in dados.get("sources", []) if s.get("ativo")]


class RegistryMiner:
    """Minera fontes com registry no formato shadcn e publica no R2."""

    def __init__(self, storage: Any | None = None) -> None:
        """
        Args:
            storage: instância de R2StorageEngine. Se None, uma é criada; se as
                credenciais não estiverem completas, o minerador roda só-local.
        """
        os.makedirs(LIBRARY_DIR, exist_ok=True)
        if storage is None:
            load_dotenv(BACKEND_ENV)
            sys.path.insert(0, BASE_DIR)
            from r2_storage_engine import R2StorageEngine

            storage = R2StorageEngine()
        self.storage = storage
        self.stats: dict[str, int] = {"minerados": 0, "ausentes": 0, "erros": 0}
        self.r2_ativo: bool = bool(storage.configurado())
        if not self.r2_ativo:
            logger.warning("R2 não configurado: mineração seguirá apenas em cache local.")

    # ---------------------------------------------------------------- descoberta

    def descobrir(self, fonte: dict[str, Any]) -> tuple[str | None, list[str]]:
        """
        Testa os `index_candidates` da fonte até um responder um índice válido.

        Args:
            fonte: objeto de configuração vindo de sources.json.

        Returns:
            Tupla (url_do_indice_ou_None, lista_de_slugs).
        """
        base = fonte["base_url"].rstrip("/")
        for caminho in fonte.get("index_candidates", []):
            url = f"{base}{caminho}"
            try:
                dados = _http_json(url)
            except RegistryMinerError as exc:
                logger.debug("Índice recusado (%s): %s", url, exc)
                time.sleep(RATE_LIMIT_S)
                continue
            slugs = self._extrair_slugs(dados)
            if slugs:
                logger.info("[%s] índice OK em %s — %d itens", fonte["id"], caminho, len(slugs))
                return url, slugs
            time.sleep(RATE_LIMIT_S)
        logger.warning("[%s] nenhum índice público respondeu.", fonte["id"])
        return None, []

    @staticmethod
    def _extrair_slugs(dados: Any) -> list[str]:
        """Extrai nomes de itens dos formatos de índice conhecidos."""
        itens: Iterable[Any]
        if isinstance(dados, list):
            itens = dados
        elif isinstance(dados, dict):
            itens = dados.get("items") or dados.get("registry") or dados.get("components") or []
        else:
            return []

        # 'index' e 'registry' não são componentes: são a própria listagem
        # aparecendo entre os itens em algumas fontes.
        pseudo = {"index", "registry"}
        slugs: list[str] = []
        for item in itens:
            if isinstance(item, str):
                slugs.append(item)
            elif isinstance(item, dict) and item.get("name"):
                slugs.append(str(item["name"]))
        return sorted({s for s in slugs if s.lower() not in pseudo})

    # ------------------------------------------------------------------- coleta

    def minerar_item(self, fonte: dict[str, Any], slug: str) -> dict[str, Any] | None:
        """
        Baixa um item do registry, grava no cache local e publica no R2.

        Args:
            fonte: configuração da fonte.
            slug: nome do componente no registry.

        Returns:
            Entrada de índice do item, ou None se o item não pôde ser obtido.
        """
        base = fonte["base_url"].rstrip("/")
        url = f"{base}{fonte['item_template'].format(slug=urllib.parse.quote(slug))}"
        try:
            dados = _http_json(url)
        except ItemAusenteNaOrigem:
            self.stats["ausentes"] += 1
            logger.info("[%s] '%s' indisponivel na origem (404); ignorado.", fonte["id"], slug)
            return None
        except RegistryMinerError as exc:
            self.stats["erros"] += 1
            logger.warning("[%s] ERRO de rede em '%s': %s", fonte["id"], slug, exc)
            return None

        arquivos = [f for f in dados.get("files", []) if isinstance(f, dict) and f.get("content")]

        # Temas (registry:style) não trazem `files`: a carga útil são as
        # variáveis CSS. Serializa como um arquivo para caber no mesmo formato.
        if not arquivos and (dados.get("cssVars") or dados.get("css")):
            tema = {"name": dados.get("name", slug), "cssVars": dados.get("cssVars", {}), "css": dados.get("css", "")}
            arquivos = [{"path": "theme.json", "content": json.dumps(tema, indent=2, ensure_ascii=False)}]

        if not arquivos:
            self.stats["ausentes"] += 1
            logger.info("[%s] '%s' sem conteúdo de arquivo; ignorado.", fonte["id"], slug)
            return None

        slug_seguro = _slug_seguro(slug)
        destino = os.path.join(LIBRARY_DIR, _slug_seguro(fonte["id"]), slug_seguro)
        os.makedirs(destino, exist_ok=True)

        gravados: list[dict[str, Any]] = []
        for arquivo in arquivos:
            caminho_local = _caminho_seguro(destino, arquivo.get("path", "componente.txt"))
            conteudo = str(arquivo["content"])
            with open(caminho_local, "w", encoding="utf-8") as f:
                f.write(conteudo)

            nome = os.path.basename(caminho_local)
            chave_r2 = f"{R2_PREFIXO}/{_slug_seguro(fonte['id'])}/{slug_seguro}/{nome}"
            cdn_url = None
            if self.r2_ativo:
                mime = EXTENSAO_MIME.get(os.path.splitext(nome)[1], "text/plain; charset=utf-8")
                envio = self.storage.upload_objeto(chave_r2, conteudo, content_type=mime)
                if not envio["enviado"]:
                    logger.warning("[%s] upload R2 falhou (%s): %s", fonte["id"], nome, envio["erro"])
                cdn_url = envio.get("cdn_url")
            gravados.append(
                {
                    "arquivo": nome,
                    "bytes": len(conteudo.encode("utf-8")),
                    "local": os.path.relpath(caminho_local, BASE_DIR),
                    "r2_key": chave_r2 if self.r2_ativo else None,
                    "cdn_url": cdn_url,
                }
            )

        entrada = {
            "id": f"{fonte['id']}_{slug_seguro}",
            "fonte": fonte["id"],
            "fonte_nome": fonte["nome"],
            "slug": slug,
            "tipo": dados.get("type", "desconhecido"),
            "dependencias": dados.get("dependencies", []),
            "url_origem": url,
            "licenca": fonte["licenca"],
            "atribuicao": fonte["atribuicao"],
            "arquivos": gravados,
        }
        with open(os.path.join(destino, "meta.json"), "w", encoding="utf-8") as f:
            json.dump(entrada, f, indent=2, ensure_ascii=False)
        return entrada

    def minerar_fonte(self, fonte: dict[str, Any], limite: int | None = None) -> list[dict[str, Any]]:
        """
        Minera uma fonte inteira, respeitando rate limit entre itens.

        Args:
            fonte: configuração da fonte.
            limite: máximo de itens a minerar; None para todos.

        Returns:
            Lista de entradas de índice mineradas com sucesso.
        """
        _, slugs = self.descobrir(fonte)
        if not slugs:
            return []
        if limite is not None:
            if len(slugs) > limite:
                logger.info("[%s] limitando a %d de %d itens.", fonte["id"], limite, len(slugs))
            slugs = slugs[:limite]

        antes = dict(self.stats)
        entradas: list[dict[str, Any]] = []
        for i, slug in enumerate(slugs, 1):
            entrada = self.minerar_item(fonte, slug)
            if entrada:
                self.stats["minerados"] += 1
                entradas.append(entrada)
            if i % 25 == 0:
                logger.info("[%s] %d/%d processados.", fonte["id"], i, len(slugs))
            time.sleep(RATE_LIMIT_S)
        logger.info(
            "[%s] concluido: %d minerados | %d indisponiveis na origem | %d erros (de %d)",
            fonte["id"],
            len(entradas),
            self.stats["ausentes"] - antes["ausentes"],
            self.stats["erros"] - antes["erros"],
            len(slugs),
        )
        return entradas

    # ------------------------------------------------------------------- índice

    def atualizar_indice(self, entradas: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Funde `entradas` no índice global e o publica no R2.

        Args:
            entradas: entradas recém-mineradas (sobrescrevem as de mesmo id).

        Returns:
            O índice completo já gravado em disco.
        """
        atual: dict[str, dict[str, Any]] = {}
        if os.path.isfile(INDEX_PATH):
            try:
                with open(INDEX_PATH, encoding="utf-8") as f:
                    for item in json.load(f).get("itens", []):
                        atual[item["id"]] = item
            except (OSError, json.JSONDecodeError, KeyError):
                logger.warning("index.json ilegível; será reconstruído.")

        for entrada in entradas:
            atual[entrada["id"]] = entrada

        indice = {
            "versao": 1,
            "total": len(atual),
            "itens": sorted(atual.values(), key=lambda e: e["id"]),
        }
        with open(INDEX_PATH, "w", encoding="utf-8") as f:
            json.dump(indice, f, indent=2, ensure_ascii=False)

        if self.r2_ativo:
            envio = self.storage.upload_objeto(
                f"{R2_PREFIXO}/index.json",
                json.dumps(indice, ensure_ascii=False),
                content_type="application/json; charset=utf-8",
            )
            if not envio["enviado"]:
                logger.warning("Índice não publicado no R2: %s", envio["erro"])
        return indice


def _cmd_probe(miner: RegistryMiner) -> int:
    """Testa a descoberta de todas as fontes sem baixar nada."""
    print(f"{'FONTE':<12} {'STATUS':<10} ITENS  ÍNDICE")
    ok = 0
    for fonte in carregar_fontes():
        url, slugs = miner.descobrir(fonte)
        if slugs:
            ok += 1
        caminho = url.replace(fonte["base_url"], "") if url else "-"
        print(f"{fonte['id']:<12} {'OK' if slugs else 'SEM API':<10} {len(slugs):<6} {caminho}")
    print(f"\n{ok} de {len(carregar_fontes())} fontes com registry público acessível.")
    return 0


def _cmd_list(tipo: str | None, fonte: str | None) -> int:
    """Lista itens já minerados, com filtro opcional por tipo e fonte."""
    if not os.path.isfile(INDEX_PATH):
        print("Nenhum índice ainda. Rode a mineração primeiro.")
        return 1
    with open(INDEX_PATH, encoding="utf-8") as f:
        itens = json.load(f).get("itens", [])
    if tipo:
        itens = [i for i in itens if i["tipo"] == tipo]
    if fonte:
        itens = [i for i in itens if i["fonte"] == fonte]
    for item in itens:
        print(f"{item['id']:<45} {item['tipo']:<22} {item['licenca']}")
    print(f"\n{len(itens)} itens.")
    return 0


def main(argv: list[str] | None = None) -> int:
    """Ponto de entrada da CLI do minerador."""
    parser = argparse.ArgumentParser(description="Minerador de registries de componentes do REPASS AI.")
    parser.add_argument("--source", help="Minerar apenas a fonte com este id.")
    parser.add_argument("--all", action="store_true", help="Minerar todas as fontes ativas.")
    parser.add_argument("--probe", action="store_true", help="Só testar quais fontes têm registry acessível.")
    parser.add_argument("--list", action="store_true", help="Listar itens já minerados.")
    parser.add_argument("--tipo", help="Filtro de tipo para --list.")
    parser.add_argument("--limit", type=int, help="Máximo de itens por fonte.")
    parser.add_argument("--verbose", action="store_true", help="Log em nível DEBUG.")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(levelname)s %(name)s: %(message)s",
    )

    if args.list:
        return _cmd_list(args.tipo, args.source)

    try:
        miner = RegistryMiner()
        if args.probe:
            return _cmd_probe(miner)

        fontes = carregar_fontes()
        if args.source:
            fontes = [f for f in fontes if f["id"] == args.source]
            if not fontes:
                print(f"Fonte '{args.source}' não existe ou está inativa em sources.json.")
                return 1
        elif not args.all:
            parser.print_help()
            return 1

        entradas: list[dict[str, Any]] = []
        for fonte in fontes:
            entradas.extend(miner.minerar_fonte(fonte, limite=args.limit))
        indice = miner.atualizar_indice(entradas)
        s = miner.stats
        print("\n" + "=" * 52)
        print("PLACAR DA MINERACAO")
        print("=" * 52)
        print(f"  Minerados com sucesso .... {s['minerados']}")
        print(f"  Indisponiveis na origem .. {s['ausentes']}  (404 no servidor da fonte, nao e erro nosso)")
        print(f"  Erros reais .............. {s['erros']}  (rede/timeout — se >0, vale investigar)")
        print(f"  Total no indice .......... {indice['total']}")
        print("=" * 52)
        print(f"Cache local: {LIBRARY_DIR}")
        print(f"R2: {'publicado em ' + R2_PREFIXO + '/' if miner.r2_ativo else 'desativado (sem credenciais)'}")
        return 0
    except RegistryMinerError as exc:
        logger.error("%s", exc)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
