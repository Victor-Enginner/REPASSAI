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
| `r2_storage_engine.py` | Armazenamento do HTML compilado. **Hoje só local** — ver abaixo. |

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

`r2_storage_engine.py` grava o HTML em `data/r2_bucket/` e **não faz upload
para o Cloudflare R2** — as credenciais são lidas mas nenhuma chamada de API
acontece.

Por isso `salvar_site_compilado()` devolve `publicado: False` e
`cdn_url: None`. A versão anterior devolvia `https://cdn.repass.ai/...`, um
domínio inexistente (NXDOMAIN) — mandar aquele link a um cliente entregava
uma página morta.

**Enquanto `publicado` for `False`, a interface deve oferecer download do
HTML, nunca um link público.**

Para implementar o upload de verdade: R2 fala a API S3, então `boto3` com
`endpoint_url=https://<account_id>.r2.cloudflarestorage.com` resolve. Depois
é preciso um domínio público servindo o bucket antes de `cdn_url` deixar de
ser `None`.

## Testes

```bash
python backend/test_api.py
```

Cobre integridade de dados (nunca fabricar contato), bloqueio de SSRF no
proxy de mídia e o contrato das rotas.
