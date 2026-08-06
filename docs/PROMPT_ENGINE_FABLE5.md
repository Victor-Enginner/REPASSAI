# Prompt Engine — REPASS AI · Fase 1 (Fable 5)

> Gerado em 04/08/2026 a partir de auditoria do código, não de documento.
> Estado de entrada verificado: 29 testes passando, path traversal fechado,
> zero segredo hardcoded, docs recuperadas.
>
> **Como usar:** cole o bloco `PROMPT` inteiro numa sessão nova do Fable 5,
> com o cwd no repositório. Não resuma, não corte — o contexto de restrição é
> o que impede o agente de inventar arquitetura.

---

## PROMPT

```
Você vai trabalhar no REPASS AI, um SaaS em produção. Leia este contexto
inteiro antes de tocar em qualquer arquivo.

## O QUE É O SISTEMA

SaaS de geração de sites a partir de leads OSINT. O cliente entra no painel,
roda uma varredura no Google Places, e o sistema gera uma landing page pt-BR
personalizada para cada lead em ~14 ms, sem custo de LLM por geração.

Stack real (verificada, não presumida):
- Frontend: React 18.2 + Vite 7, 14 telas em src/views/, design system com 40
  tokens e lint que trava o build (scripts/verificar-tokens.mjs).
- Backend: Python, ThreadingHTTPServer puro (NÃO é FastAPI, NÃO é Flask).
  backend/app_api.py tem 1.739 linhas e 27 rotas roteadas por if/elif sobre
  self.path. Aceite isso como está; não proponha migrar de framework.
- Persistência: Supabase (Auth + Postgres + RLS) e Cloudflare R2 via boto3.
- IA: backend/llm_gateway.py com Round-Robin entre Groq, Gemini e OpenRouter,
  circuit breaker de 60s em HTTP 429.

Modelo de negócio, para calibrar decisões: é SaaS por fora e PaaS por dentro.
Não vendemos infraestrutura. Consumimos IaaS/MaaS de terceiros. Toda chamada
a Google Places e a LLM custa dinheiro real — isso ordena as prioridades.

## O QUE JÁ ESTÁ FECHADO — NÃO REFAÇA

Auditado e confirmado no código. Se você "corrigir" algo desta lista, está
introduzindo regressão:

- Segredos: zero hardcoded. .gitignore cobre .env, .env.*, backend/.env.*.
- Headers: nosniff, X-Frame-Options DENY, CSP default-src 'none',
  frame-ancestors 'none', HSTS, Referrer-Policy, Permissions-Policy.
- CORS: allowlist em ORIGENS_PERMITIDAS + Vary: Origin. Nunca '*'.
- Rate limit: _identidade() em app_api.py, chave ip:{IP} ou user:{user_id}.
- Auth: 7 rotas em ROTAS_PROTEGIDAS exigem JWT. Cache de token 60s em RAM.
- SSRF no proxy de mídia: HOSTS_PERMITIDOS, 4 hosts fixos.
- Prompt injection: SYSTEM_PROMPTS fixos no servidor. O cliente escolhe um
  `modo`, nunca envia system role. Não abra isso por conveniência.
- XSS: src/ não tem nenhum dangerouslySetInnerHTML, innerHTML=, eval(),
  new Function() ou document.write. Mantenha assim.
- Path traversal: templates_store._slug_seguro() faz basename + allowlist
  [a-zA-Z0-9._-]. Toda escrita/leitura de template passa por ele.
- Body limit: TAMANHO_MAX_BODY = 1MB.
- LOG_QUEUE tem maxsize=500 e descarta o mais antigo. MEDIA_CACHE tem teto
  FIFO de 200 itens / 5MB. Ambos são propositais — não remova os tetos.

## SUA TAREFA — FASE 1, NESTA ORDEM

Ordem por risco financeiro. Não pule, não paralelize, não comece o próximo
antes de o anterior ter teste que prove que fechou.

### 1.1 — Cota atômica (Denial of Wallet)  [CRÍTICO]

Problema: /api/site/generate lê o saldo de cota do usuário, decide, e depois
grava. Duas requisições simultâneas leem o mesmo saldo e ambas passam. Um
cliente no plano grátis consegue N gerações pagas disparando N requisições em
paralelo. Cada geração custa chamada de LLM e de Places.

Correção: mover a dedução para uma função RPC no Postgres do Supabase que use
SELECT ... FOR UPDATE na linha do perfil, decremente e retorne o novo saldo
numa transação só. O backend passa a chamar a RPC e a confiar no retorno; não
faz mais read-then-write.

Onde: backend/supabase_client.py (chamada), supabase/schema.sql (a função).
Cuidado: edição de site existente NÃO consome cota; só criação. Preserve isso.

Prova exigida: teste que dispara 10 requisições concorrentes de geração com
cota=1 e afirma que exatamente 1 passa e 9 recebem bloqueio.

### 1.2 — IP confiável no rate limit  [ALTO]

Problema: _identidade() em app_api.py monta a chave anônima a partir de um
header que o próprio cliente controla (X-Forwarded-For). Trocar o header a
cada requisição zera o contador — o rate limit anônimo não vale nada.

Correção: ler o IP apenas de um header de proxy confiável, configurável por
env (ex.: CF-Connecting-IP quando atrás de Cloudflare). Se a env não estiver
definida, usar o IP de socket direto, nunca o header do cliente.

Onde: backend/app_api.py, função _identidade(). Nova env em .env.example.

Prova exigida: teste que envia 40 requisições com X-Forwarded-For diferente a
cada uma e afirma que o 31º recebe HTTP 429.

### 1.3 — Anti-SSRF no scraper OSINT  [ALTO]

Problema: backend/scraper_monster.py busca URLs vindas do usuário sem filtrar
faixa privada. Um usuário aponta o scraper para 169.254.169.254 (metadados da
instância na nuvem) ou para localhost:5432 e usa nosso servidor para
inspecionar nossa própria rede.

Correção: antes de qualquer requisição, resolver o hostname e rejeitar se o IP
resolvido cair em faixa privada, loopback, link-local ou reservada — usar o
módulo ipaddress (is_private, is_loopback, is_link_local, is_reserved), não
regex de string. Rejeitar também esquema diferente de http/https. Re-validar
após cada redirecionamento (o destino pode redirecionar para 127.0.0.1).

Onde: backend/scraper_monster.py.

Prova exigida: teste com a lista 127.0.0.1, 169.254.169.254, 10.0.0.1,
192.168.1.1, [::1], file:///etc/passwd, e um domínio público que resolve para
IP privado — todos bloqueados; um domínio público normal, permitido.

### 1.4 — Resposta neutra no login  [MÉDIO]

Problema: /api/auth/login devolve mensagens distintas para e-mail inexistente
e senha errada, o que permite enumerar quem é cliente.

Correção: mensagem única e idêntica nos dois casos. Atenção ao canal lateral
de tempo: se o caminho "usuário não existe" retorna sem verificar hash, ele é
mensuravelmente mais rápido. Iguale o custo.

Onde: backend/app_api.py (handler de auth), backend/supabase_client.py.

## REGRAS DE TRABALHO — NÃO NEGOCIÁVEIS

1. Antes de editar um arquivo, leia-o inteiro. O código tem comentários que
   explicam por que cada trava existe; vários descrevem bugs já corrigidos.
   Remover uma trava porque "parece redundante" reabre o bug.

2. Nada de dependência nova sem justificar. O backend hoje roda com duas:
   python-dotenv e boto3. Se a solução exige uma terceira, pare e explique por
   que a biblioteca padrão não resolve. `ipaddress`, `hmac`, `secrets` e
   `urllib` são stdlib — prefira-os.

3. Teste antes de declarar pronto. `python -m pytest backend/test_api.py -q`
   está em 29 passed / 10 skipped. Esse número não pode cair. Cada item acima
   adiciona teste novo; a suíte só cresce.

4. Entropia: `secrets`, nunca `random`. Comparação de segredo:
   `hmac.compare_digest`, nunca `==`.

5. Português no código. Nomes de função, variável e comentário seguem o
   padrão do repositório (`_identidade`, `caminho_html`, `_slug_seguro`).

6. Comentário explica POR QUE, não O QUE. Siga o tom dos existentes: eles
   narram o problema que a linha previne.

7. Não invente número. Se for escrever "14 ms" ou "935 trechos" em doc ou
   comentário, meça antes ou não escreva.

8. Ao terminar cada item, relate: o que mudou, qual teste prova, e o que você
   NÃO fez e por quê. Se um item ficou bloqueado, termine os outros e diga
   explicitamente o que ficou de fora.

## O QUE ESTÁ FORA DE ESCOPO NESTA FASE

Não toque: frontend, design system, pipeline de templates, loja, roadmap de
produto, migração de framework, Elastic, Snyk, urlhaus. Tudo isso é fase 2+ e
tem plano próprio. Fase 1 é só o que sangra dinheiro.
```

---

## Fases seguintes (contexto para você, não parte do prompt)

### Fase 2 — Supply chain

| Ferramenta | Instalação | O que pega | Custo |
|---|---|---|---|
| `pip-audit` | `pip install pip-audit` | CVE em dependência Python (OSV) | offline, grátis |
| `bandit` | `pip install bandit` | SAST Python — `eval`, `random` em cripto, `subprocess shell=True` | offline, grátis |
| `npm audit` | já vem no npm | CVE em dependência Node | offline, grátis |
| `semgrep` | `pip install semgrep` | SAST multi-linguagem, regras OWASP | offline, grátis |
| Snyk Code | `npm i -g snyk` + login | SAST com data-flow; melhor triagem de falso-positivo | conta necessária |
| Dependabot | `.github/dependabot.yml` | PR automático de upgrade | grátis no GitHub |

Ordem sugerida: as quatro offline primeiro (não exigem conta, não enviam
código para fora), CI no `.github/workflows`, e só então avaliar se o Snyk
acrescenta algo que o semgrep não deu.

**Impacto real:** hoje o `backend/requirements.txt` tem duas dependências —
a superfície Python é pequena. O risco de verdade está no `package.json`: 12
dependências de runtime, várias na cadeia do Three.js, com árvore transitiva
grande. É lá que o `npm audit` vai render.

### Fase 3 — Observabilidade

`LOG_QUEUE` é uma fila em RAM de 500 linhas que some ao reiniciar o processo.
Isso significa que **hoje é impossível investigar um incidente passado.** É
essa a lacuna que o Elastic fecha — não é "melhoria de dashboard", é a
diferença entre saber e não saber o que aconteceu.

O feed do urlhaus.abuse.ch entra como lista de IOC consultada na entrada do
scraper: se o domínio alvo está no feed, recusa antes de buscar. Vale como
segunda camada — o filtro anti-SSRF da fase 1.3 é a primeira e a mais
importante.

---

## Impacto de cada alteração já aplicada

| Alteração | Arquivo | Impacto | Risco de regressão |
|---|---|---|---|
| `_slug_seguro()` | `backend/templates_store.py` | Fecha escrita arbitrária de arquivo em disco via `POST /api/templates/import` e leitura arbitrária via 3 rotas GET | Baixo. Slugs legítimos do registry (`aura-template-artisanal-specialty-91`) passam intactos pela allowlist. Slug inválido vira 404 em vez de 500. |
| `try/except ValueError` em `obter` e `html_do_template` | `backend/templates_store.py` | Slug impossível vira ausência (404), não erro de servidor | Nenhum. Comportamento anterior para slug válido é idêntico. |
| Restauração de 6 documentos | `docs/` | `docs/README.md` volta a indexar arquivos que existem | Nenhum. Conteúdo idêntico ao do último commit. |
