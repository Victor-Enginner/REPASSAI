# -*- coding: utf-8 -*-
"""Diagnóstico seguro dos provedores de IA do REPASS AI.

Executa uma chamada mínima em cada provedor configurado e imprime somente
o estado da conexão. Chaves, modelos e conteúdo das respostas nunca aparecem
na saída.
"""

from __future__ import annotations

import json
import time
import urllib.error
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).with_name(".env"), override=True)

import llm_gateway  # noqa: E402  (o ambiente precisa ser carregado primeiro)


def diagnosticar() -> list[dict]:
    resultados = []

    for provedor in llm_gateway.provedores_ativos():
        inicio = time.perf_counter()
        chave = None

        if provedor.formato != "ollama":
            chave = provedor.rotacao.proxima()
            if chave is None:
                resultados.append(
                    {
                        "provedor": provedor.id,
                        "funcionando": False,
                        "status": "sem_chave_disponivel",
                        "latencia_ms": 0,
                    }
                )
                continue

        try:
            dados = llm_gateway._chamar(
                provedor,
                chave,
                "Responda somente OK.",
                "Teste técnico de conectividade do REPASS AI.",
                0.0,
            )
            texto = llm_gateway._extrair_texto(provedor, dados)
            funcionando = bool(texto and texto.strip())
            status = "ok" if funcionando else "resposta_vazia"
        except urllib.error.HTTPError as erro:
            funcionando = False
            status = f"http_{erro.code}"
        except urllib.error.URLError:
            funcionando = False
            status = "falha_de_rede"
        except TimeoutError:
            funcionando = False
            status = "timeout"
        except Exception as erro:  # saída deliberadamente sanitizada
            funcionando = False
            status = type(erro).__name__

        resultados.append(
            {
                "provedor": provedor.id,
                "funcionando": funcionando,
                "status": status,
                "latencia_ms": round((time.perf_counter() - inicio) * 1000),
            }
        )

    return resultados


if __name__ == "__main__":
    print(json.dumps(diagnosticar(), ensure_ascii=False, indent=2))
