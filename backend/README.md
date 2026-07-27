# Backend REPASS AI — Mapa dos Módulos

Nem todo arquivo aqui é importado pelo servidor. Alguns são ferramentas de
linha de comando que você roda manualmente. Confundir os dois leva a apagar
ferramenta boa achando que é código morto.

## Serviço (carregados pelo `app_api.py`)

| Módulo | Papel |
|---|---|
| `app_api.py` | Servidor HTTP. Todas as rotas `/api/*`. Ponto de entrada. |
| `places_engine.py` | Google Places: busca, detalhes, score, mensagem de abordagem. |
| `scraper_monster.py` | Orquestrador da varredura OSINT + enriquecimento de mídia. |
| `llm_gateway.py` | Cadeia de LLMs com rotação de chaves. Guarda as credenciais. |
| `lib77_engine.py` | Compilador procedural de sites a partir do catálogo 77lib. |
| `r2_storage_engine.py` | Cópia local garantida + upload opcional para Cloudflare R2. |

## Ferramentas de linha de comando (rodadas à mão)

Têm bloco `if __name__ == "__main__"` e existem para popular catálogos e
testar pipelines. Não são importadas pelo servidor — isso é intencional.

```bash
python backend/originkit_scraper.py   # baixa componentes para data/originkit_catalog
python backend/originkit_engine.py    # sintetiza a partir do catálogo OriginKit
python backend/basehub_engine.py      # ingestão de conteúdo BaseHub
python backend/beta_live_runner.py    # pipeline completa: lead -> site -> storage
```

## Sem uso no momento

| Módulo | Situação |
|---|---|
| `modal_engine.py` | Perdeu o import quando o `handle_scan` passou a chamar o `OSINTCore` direto. Mantido para quando a execução serverless voltar à pauta. |

## Estado do armazenamento

`r2_storage_engine.py` sempre grava uma cópia em `data/r2_bucket/`. Com
credenciais completas e `boto3` instalado, também envia o HTML para o
Cloudflare R2 pela API S3-compatible.

Upload no bucket e publicação são estados diferentes. `publicado` só fica
`True` quando `R2_PUBLIC_BASE_URL` aponta para um domínio que realmente serve
o bucket. Sem domínio, o arquivo pode estar no R2, mas a interface continua
oferecendo preview/download em vez de inventar um link.

Instalação do backend:

```bash
pip install -r backend/requirements.txt
```

## Testes

```bash
python backend/test_api.py
```

Cobre integridade de dados (nunca fabricar contato), bloqueio de SSRF no
proxy de mídia e o contrato das rotas.
