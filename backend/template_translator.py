# -*- coding: utf-8 -*-
"""
REPASS AI — Classificador e Tradutor de Templates (Camada 3).

Roda UMA VEZ por template, não uma vez por site. É o único ponto do sistema
onde a IA entra no caminho principal: depois disso o template fica guardado
em português e a geração de sites volta a ser 100% determinística.

Cada trecho de texto recebe um destino:

  traduzir  → texto de interface do template ("Home", "Read more").
              Vira português e fica fixo.
  variavel  → dado que pertence ao negócio ("Little Latte Cafe", "5.0 Stars").
              Vira um espaço nomeado: {{NOME}}, {{AVALIACAO}}.
  adaptar   → conteúdo específico do dono do template original (nomes de
              produtos, depoimentos). Vira texto neutro em português que
              serve para qualquer negócio do nicho.

Sem essa separação o site sairia em português falando de outra empresa —
traduzir "Little Latte Cafe" não resolve nada.

Uso:
    python template_translator.py aura-template-cafelittlelatte
    python template_translator.py --todos
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from typing import Any

from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PREPARADOS_DIR = os.path.join(BASE_DIR, "data", "templates_preparados")

load_dotenv(os.path.join(BASE_DIR, ".env"))
sys.path.insert(0, BASE_DIR)

# Espaços variáveis que o compilador sabe preencher com dados do lead.
VARIAVEIS_VALIDAS = {
    "NOME", "CATEGORIA", "CIDADE", "ESTADO", "ENDERECO", "TELEFONE",
    "WHATSAPP", "EMAIL", "AVALIACAO", "REVIEWS", "ANO",
}

DESTINOS_VALIDOS = {"traduzir", "variavel", "adaptar"}

# Lotes pequenos: pedir 200 itens de uma vez faz o modelo truncar a resposta
# e perder trechos no meio, o que só aparece como buraco no site final.
TAMANHO_LOTE = 25

SYSTEM = (
    "Você prepara templates de site para negócios locais brasileiros. "
    "Responde SEMPRE com JSON válido, sem texto fora do JSON, sem markdown."
)


def _prompt(lote: list[dict[str, Any]], contexto: dict[str, Any]) -> str:
    """Monta o pedido de classificação para um lote de trechos."""
    itens = "\n".join(
        f'{i["id"]}|{i["tag"]}|{i["texto"]}' for i in lote
    )
    return f"""Template original: "{contexto['nome']}" (idioma {contexto['idioma']}).
Nicho de destino: {contexto['nichos']}.

Abaixo há trechos de texto no formato id|tag|texto.
Classifique CADA id em um destino e devolva o texto final em português do Brasil.

DESTINOS:
- "traduzir": texto de interface ou título genérico. Traduza para pt-BR.
- "variavel": dado que pertence ao negócio dono do site. Escolha UMA variável
  entre {sorted(VARIAVEIS_VALIDAS)} e devolva o marcador, ex: "{{{{NOME}}}}".
  Use para: nome da empresa, telefone, endereço, e-mail, nota/estrelas,
  quantidade de avaliações, cidade, ano de fundação.
- "adaptar": conteúdo específico do negócio ORIGINAL (nomes de produtos,
  depoimentos, endereços de outro país, textos de marca).
  NÃO TRADUZA ao pé da letra: SUBSTITUA por algo equivalente e comum no
  Brasil, do ramo {contexto['nichos']}.
  Exemplos do que se espera:
    "Strawberry Dirty Soda" -> "Pão de Queijo"      (produto local, não tradução)
    "Bacon Egg Croissant"   -> "Misto Quente"
    "Cocoa Hazelnut Latte"  -> "Café com Leite"
  Um brasileiro tem que ler e reconhecer o item. Se não existir equivalente,
  use um nome genérico do ramo.
  Nunca invente telefone, preço, endereço, CNPJ ou nome de pessoa.

REGRAS:
- Devolva TODOS os ids recebidos, nenhum a menos.
- Mantenha o comprimento parecido com o original: o layout depende disso.
- Não use nome de cidade estrangeira, moeda estrangeira nem produto que não
  se vende no Brasil.

TRECHOS:
{itens}

Responda apenas:
{{"itens":[{{"id":0,"destino":"traduzir","texto":"..."}}]}}"""


def _extrair_json(bruto: str) -> dict[str, Any]:
    """
    Recupera o objeto JSON da resposta do modelo.

    Modelos costumam embrulhar o JSON em ```json ... ``` mesmo quando o
    prompt proíbe. Tentar o parse direto e falhar seria desperdiçar a chamada.

    Raises:
        ValueError: se não houver JSON aproveitável.
    """
    texto = (bruto or "").strip()
    texto = re.sub(r"^```(?:json)?|```$", "", texto, flags=re.MULTILINE).strip()
    inicio, fim = texto.find("{"), texto.rfind("}")
    if inicio == -1 or fim <= inicio:
        raise ValueError("resposta sem JSON")
    return json.loads(texto[inicio : fim + 1])


def _validar(item: dict[str, Any], original: dict[str, Any]) -> dict[str, Any] | None:
    """
    Confere um item classificado. Devolve None se for inaproveitável.

    A validação existe porque a saída da IA entra no site do cliente: um
    destino inventado ou um marcador desconhecido viraria texto quebrado
    na página.
    """
    destino = str(item.get("destino", "")).strip().lower()
    texto = str(item.get("texto", "")).strip()
    if destino not in DESTINOS_VALIDOS or not texto:
        return None

    if destino == "variavel":
        marcadores = re.findall(r"\{\{([A-Z_]+)\}\}", texto)
        if not marcadores or any(m not in VARIAVEIS_VALIDAS for m in marcadores):
            return None

    return {
        "id": original["id"],
        "tag": original["tag"],
        "original": original["texto"],
        "destino": destino,
        "texto": texto,
    }


def classificar(slug: str, contexto: dict[str, Any]) -> dict[str, Any]:
    """
    Classifica e traduz todos os trechos de um template.

    Returns:
        dict com `plano` (list) e `nao_resolvidos` (list de ids que a IA
        não devolveu ou devolveu inválidos).
    """
    import llm_gateway

    with open(os.path.join(PREPARADOS_DIR, f"{slug}.textos.json"), encoding="utf-8") as f:
        itens = json.load(f)
    por_id = {i["id"]: i for i in itens}

    plano: list[dict[str, Any]] = []
    resolvidos: set[int] = set()

    for inicio in range(0, len(itens), TAMANHO_LOTE):
        lote = itens[inicio : inicio + TAMANHO_LOTE]
        resp = llm_gateway.gerar(_prompt(lote, contexto), SYSTEM, temperature=0.0)
        if not resp.get("sucesso"):
            print(f"  lote {inicio}: falha do gateway ({resp.get('erro')})")
            continue
        try:
            dados = _extrair_json(resp.get("texto", ""))
        except (ValueError, json.JSONDecodeError) as exc:
            print(f"  lote {inicio}: resposta ilegível ({exc})")
            continue

        for bruto in dados.get("itens", []):
            original = por_id.get(bruto.get("id"))
            # O modelo às vezes repete o mesmo id na mesma resposta. Sem este
            # filtro o plano ganhava linhas duplicadas e o placar mentia
            # ("57/56 classificados").
            if original is None or original["id"] in resolvidos:
                continue
            validado = _validar(bruto, original)
            if validado:
                plano.append(validado)
                resolvidos.add(original["id"])

        print(f"  lote {inicio:>4}-{inicio + len(lote) - 1:<4} {len(resolvidos)}/{len(itens)} resolvidos")

    # Segunda passada nos trechos que a IA pulou.
    #
    # Um item sem resposta fica no idioma original e vai para o ar assim: na
    # primeira rodada sobraram "Victoria, BC V8W 1E1" e "and nearby parking"
    # — um CEP canadense no site de uma padaria em Franca. Reenviar sozinhos,
    # em lote pequeno, resolve quase sempre.
    faltantes = [i for i in itens if i["id"] not in resolvidos]
    if faltantes:
        print(f"  repescagem de {len(faltantes)} trecho(s)...")
        for inicio in range(0, len(faltantes), 10):
            lote = faltantes[inicio : inicio + 10]
            resp = llm_gateway.gerar(_prompt(lote, contexto), SYSTEM, temperature=0.0)
            if not resp.get("sucesso"):
                continue
            try:
                dados = _extrair_json(resp.get("texto", ""))
            except (ValueError, json.JSONDecodeError):
                continue
            for bruto in dados.get("itens", []):
                original = por_id.get(bruto.get("id"))
                if original is None or original["id"] in resolvidos:
                    continue
                validado = _validar(bruto, original)
                if validado:
                    plano.append(validado)
                    resolvidos.add(original["id"])

    nao_resolvidos = [i["id"] for i in itens if i["id"] not in resolvidos]
    plano.sort(key=lambda p: p["id"])
    marcas = _remover_marcas_originais(plano)
    corrigidos = _uniformizar_variaveis(plano)
    precos = _neutralizar_precos(plano)
    return {
        "plano": plano,
        "nao_resolvidos": nao_resolvidos,
        "total": len(itens),
        "marcas_removidas": marcas,
        "corrigidos_por_consistencia": corrigidos,
        "precos_neutralizados": precos,
    }


# Trecho que é só um valor monetário: "$6", "€ 12,50", "$4–6".
SO_PRECO = re.compile(r"^[\s]*[$€£¥]\s?\d[\d.,]*\s*(?:[-–—a]\s*[$€£¥]?\s?\d[\d.,]*)?\s*$")

# Valor monetário em qualquer posição, inclusive no meio de uma frase.
# Precisa existir porque a IA, ao adaptar, ESCREVE preços novos: um item em
# búlgaro virou "Manicure $ 50" e escapou da regra acima, que só olhava o
# trecho inteiro. Também cobre "лв", "€" e o "R$" — nem o real serve, porque
# continua sendo um preço que ninguém confirmou com o dono do negócio.
PRECO_EMBUTIDO = re.compile(
    r"(?:R\$|[$€£¥]|\bлв\b)\s?\d[\d.,]*(?:\s?[-–—a]\s?(?:R\$|[$€£¥])?\s?\d[\d.,]*)?",
    re.IGNORECASE,
)


def _neutralizar_precos(plano: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Tira do template todo preço, venha de onde vier.

    Regra determinística de propósito. Não sabemos quanto o cliente cobra, e
    deixar a IA decidir abre espaço para ela inventar valor — foi o que
    aconteceu: um template búlgaro saiu com "$ 50" que o modelo escreveu
    sozinho. Preço errado numa página que o dono vai divulgar é o pior
    defeito possível deste produto, pior que não ter preço nenhum.

    O dono ajusta depois no editor.

    Args:
        plano: itens classificados, alterados no lugar.

    Returns:
        Os itens que continham preço e foram neutralizados.
    """
    trocados: list[dict[str, Any]] = []
    for item in plano:
        if SO_PRECO.match(item["original"]) or SO_PRECO.match(item["texto"]):
            trocados.append({"id": item["id"], "era": item["original"], "modo": "total"})
            item["destino"] = "adaptar"
            item["texto"] = "Sob consulta"
        elif PRECO_EMBUTIDO.search(item["texto"]):
            novo = PRECO_EMBUTIDO.sub("sob consulta", item["texto"]).strip()
            trocados.append({"id": item["id"], "era": item["texto"], "modo": "embutido"})
            item["destino"] = "adaptar"
            item["texto"] = re.sub(r"\s{2,}", " ", novo)
    return trocados


def _remover_marcas_originais(plano: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Força a marca do negócio original a virar `{{NOME}}`.

    A regra de consistência só uniformiza textos idênticos; se a marca
    aparecer uma única vez, ela escapa. Foi assim que "Exo Ape" — a agência
    holandesa dona do template — sobreviveu traduzida e reprovou a auditoria.

    Args:
        plano: itens classificados, alterados no lugar.

    Returns:
        Os itens corrigidos.
    """
    from lib77_engine import TERMOS_PROIBIDOS

    corrigidos: list[dict[str, Any]] = []
    for item in plano:
        # Olhar só o RESULTADO, nunca o original.
        #
        # A versão anterior comparava original + resultado, e isso destruía
        # classificações corretas: "hello@exoape.com" já virava {{EMAIL}}, mas
        # a regra via "exoape.com" no original e sobrescrevia com {{NOME}} —
        # o site sairia com o nome da empresa no campo de e-mail, telefone e
        # endereço. Se a IA já resolveu, não há nada a corrigir.
        if any(termo.lower() in item["texto"].lower() for termo in TERMOS_PROIBIDOS):
            corrigidos.append({"id": item["id"], "era": item["texto"]})
            item["destino"] = "variavel"
            item["texto"] = "{{NOME}}"
    return corrigidos


def _uniformizar_variaveis(plano: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Força o mesmo destino para trechos de texto idênticos.

    A IA classifica em lotes e não enxerga o template inteiro, então o mesmo
    texto pode sair como variável num lote e como tradução em outro. Foi o que
    aconteceu com "Little Latte Cafe": virou `{{NOME}}` em três lugares e
    "Café com Leite Pequeno" no quarto — o nome da marca traduzido ao pé da
    letra, que iria para o site do cliente.

    Regra: se um texto virou variável em qualquer lugar, vira em todos. É
    determinística e não depende de o modelo acertar duas vezes seguidas.

    Args:
        plano: lista de itens classificados, alterada no lugar.

    Returns:
        Os itens que precisaram de correção.
    """
    variavel_por_texto: dict[str, str] = {}
    for item in plano:
        if item["destino"] == "variavel":
            variavel_por_texto.setdefault(item["original"].strip().lower(), item["texto"])

    corrigidos: list[dict[str, Any]] = []
    for item in plano:
        chave = item["original"].strip().lower()
        if item["destino"] != "variavel" and chave in variavel_por_texto:
            corrigidos.append({
                "id": item["id"],
                "original": item["original"],
                "era": item["texto"],
                "virou": variavel_por_texto[chave],
            })
            item["destino"] = "variavel"
            item["texto"] = variavel_por_texto[chave]
    return corrigidos


def salvar_plano(slug: str, resultado: dict[str, Any]) -> str:
    """Grava o plano de tradução ao lado do template preparado."""
    destino = os.path.join(PREPARADOS_DIR, f"{slug}.plano.json")
    with open(destino, "w", encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)
    return destino


def montar_versao_pt(slug: str) -> str:
    """
    Aplica o plano e grava o template já em português, com os marcadores.

    Este é o artefato que o compilador consome. Depois daqui não há mais IA
    no caminho: gerar site vira troca de `{{NOME}}` por texto.

    Returns:
        Caminho do arquivo `.pt.html` gravado.
    """
    from template_preparer import aplicar_textos

    with open(os.path.join(PREPARADOS_DIR, f"{slug}.html"), encoding="utf-8") as f:
        html = f.read()
    with open(os.path.join(PREPARADOS_DIR, f"{slug}.textos.json"), encoding="utf-8") as f:
        itens = json.load(f)
    with open(os.path.join(PREPARADOS_DIR, f"{slug}.plano.json"), encoding="utf-8") as f:
        plano = json.load(f)["plano"]

    # Trava contra dessincronia entre o plano e a extração.
    #
    # O plano guarda posições por id. Se `extrair_textos` rodar de novo e o
    # número de trechos mudar (foi o que houve ao passar a capturar telefones),
    # os ids deslocam e o plano cola cada texto no lugar errado — sem erro
    # nenhum, só uma página embaralhada. Melhor recusar e mandar reclassificar.
    por_id = {i["id"]: i for i in itens}
    divergentes = [
        p["id"] for p in plano
        if p["id"] not in por_id or por_id[p["id"]]["texto"] != p["original"]
    ]
    if divergentes:
        raise ValueError(
            f"Plano de '{slug}' esta dessincronizado da extracao "
            f"({len(divergentes)} de {len(plano)} trechos nao batem). "
            f"Rode: python template_translator.py {slug}"
        )

    pt = aplicar_textos(html, {p["id"]: p["texto"] for p in plano}, itens)
    destino = os.path.join(PREPARADOS_DIR, f"{slug}.pt.html")
    with open(destino, "w", encoding="utf-8") as f:
        f.write(pt)
    return destino


def main(argv: list[str] | None = None) -> int:
    """CLI do classificador."""
    from template_preparer import carregar_catalogo

    parser = argparse.ArgumentParser(description="Classifica e traduz templates uma vez.")
    parser.add_argument("slug", nargs="?", help="template a processar")
    parser.add_argument("--todos", action="store_true", help="processar o catálogo inteiro")
    args = parser.parse_args(argv)

    catalogo = {t["slug"]: t for t in carregar_catalogo()}
    alvos = list(catalogo) if args.todos else ([args.slug] if args.slug else [])
    if not alvos:
        parser.print_help()
        return 1

    for slug in alvos:
        tpl = catalogo.get(slug)
        if not tpl:
            print(f"{slug}: fora do catálogo.")
            continue
        print(f"\n=== {slug} ({tpl['idioma_origem']}) ===")
        resultado = classificar(slug, {
            "nome": tpl["nome"],
            "idioma": tpl["idioma_origem"],
            "nichos": ", ".join(tpl["nichos"]) or "negócio local",
        })
        caminho = salvar_plano(slug, resultado)

        from collections import Counter
        contagem = Counter(p["destino"] for p in resultado["plano"])
        print(f"  {len(resultado['plano'])}/{resultado['total']} classificados  {dict(contagem)}")
        for c in resultado.get("corrigidos_por_consistencia", []):
            print(f"  consistencia: '{c['original'][:34]}' era '{c['era'][:26]}' -> {c['virou']}")
        for m in resultado.get("marcas_removidas", []):
            print(f"  marca original: '{m['era'][:40]}' -> {{{{NOME}}}}")
        precos = resultado.get("precos_neutralizados", [])
        if precos:
            print(f"  precos -> 'Sob consulta': {len(precos)} ({[p['era'] for p in precos[:6]]})")
        if resultado["nao_resolvidos"]:
            print(f"  NAO RESOLVIDOS: {resultado['nao_resolvidos']}")
        print(f"  -> {caminho}")
        print(f"  -> {montar_versao_pt(slug)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
