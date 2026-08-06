# 🛡️ Manual Completo de Segurança e Blindagem — REPASS AI

Este documento é a referência oficial sobre a **Arquitetura de Segurança, Criptografia, Mitigação de Vulnerabilidades e Plano de Blindagem (Hardening)** do projeto REPASS AI.

---

## 📐 1. As 4 Camadas de Proteção Atuais do Sistema

O REPASS AI possui uma arquitetura de defesa nativa no backend Python (`app_api.py`, `supabase_client.py` e `llm_gateway.py`):

```
Requisições ──► [ RateLimiter por IP/User ] ──► [ Cache de JWT (RAM) ] ──► [ Cotas do Plano ] ──► [ Failover de IA ]
```

### 1.1 Limite de Taxa por Identidade (`_identidade`)
* **Localização:** `backend/app_api.py` (`_identidade()`)
* **Funcionamento:**
  - **Requisições Anônimas:** Identificadas por `ip:{IP}`. Teto padrão de 30 requisições por minuto por IP.
  - **Requisições Autenticadas:** Identificadas por `user:{user_id}` (extraído do token JWT).
* **Benefício:** Se um usuário autenticado tentar burlar o Rate Limiter usando proxies/VPNs (rotacionando IPs), todas as requisições cairão no mesmo `user_id`, resultando em bloqueio imediato **HTTP 429 Too Many Requests**.

### 1.2 Cache de JWT em Memória (`_CACHE_TOKENS`)
* **Localização:** `backend/supabase_client.py` (`_CACHE_TOKENS`, `_CACHE_TTL = 60`)
* **Funcionamento:** Valida o JWT no Supabase Auth na primeira requisição e armazena o resultado em RAM por 60 segundos.
* **Benefício:** Impede que rajadas de requisições sobrecarreguem a API de autenticação do Supabase com consultas HTTP repetidas, reduzindo a latência de validação para **< 2 ms**.

### 1.3 Proteção de Cotas do Plano
* **Localização:** `backend/app_api.py`
* **Funcionamento:** Antes de executar rotas pesadas (geração de sites ou varredura de leads), o backend lê o perfil do usuário e bloqueia a execução se a cota do plano for atingida.
* **Proteção Especial:** Edições em um site existente não consomem cota (somente a criação de novos projetos é debitada).

### 1.4 Circuit Breaker e Failover no Gateway de IA
* **Localização:** `backend/llm_gateway.py`
* **Funcionamento:** Se um provedor de IA (Groq, Gemini, OpenRouter) retornar **HTTP 429** (Rate Limit de API externa), a chave entra em quarentena por 60s e o gateway faz o rodízio automático para a próxima chave via Round-Robin.

---

## 🔑 2. Criptografia, Entropia e Imprevisibilidade de Tokens

A segurança de tokens de sessão, links mágicos e API Keys no REPASS AI é regida por regras rígidas de entropia e criptografia.

### 2.1 Regra do Gerador de Entropia (CSPRNG)
* **Proibido:** Uso de `random.random()` ou `random.choice()` (algoritmo *Mersenne Twister* determinístico e previsível).
* **Obrigatório:** Uso do módulo `secrets` em Python ou `crypto.getRandomValues()` no JS, que consomem ruído criptográfico do kernel do sistema operacional.

### 2.2 Fórmula de Entropia e Tabela Comparativa

A entropia de um token (em bits) é calculada por:
$$H = L \times \log_2(N)$$

| Formato do Token | Tamanho ($L$) | Alfabeto ($N$) | Entropia ($H$) | Nível de Segurança | Uso Recomendado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OTP Numérico 6 dígitos** | 6 | 10 (`0-9`) | $\approx 19.9$ bits | Baixo (Exige Rate Limit estrito) | 2FA via SMS/E-mail |
| **Base62 Alfanumérico** | 32 | 62 (`a-z, A-Z, 0-9`) | $\approx 190.5$ bits | **Extremamente Alto** | API Keys de clientes |
| **Hexadecimal (CSPRNG)** | 64 | 16 (`0-9, a-f`) | $256$ bits | **Imprevisibilidade Máxima** | Assinatura HMAC / Secrets |

### 2.3 Comparação em Tempo Constante (Anti-Timing Attack)
Para validar assinaturas HMAC de webhooks ou hashes de verificação:
* ❌ **Errado:** `if token_recebido == token_esperado:` (Vulnerável a ataques de tempo que medem microssegundos).
* ✅ **Correto:** `if hmac.compare_digest(token_recebido, token_esperado):` (Tempo constante de execução).

---

## 🎯 3. Mapeamento de Vetores de Ataque e Vulnerabilidades

> **Estado verificado em 04/08/2026.** Os quatro vetores abaixo foram
> auditados contra o código. Três estão fechados com teste; um continua
> aberto por ser decisão de produto. Dois tinham a descrição errada — a
> correção real ficou registrada para não repetir o diagnóstico equivocado.

### 3.1 Spoofing do Cabeçalho `X-Forwarded-For` — ✅ FECHADO
* **Descrição:** Atacantes podem enviar cabeçalhos HTTP falsificados (`X-Forwarded-For: 1.1.1.1`) para simular múltiplos IPs em rotas anônimas.
* **Correção aplicada:** `_ip_de_origem()` em `backend/app_api.py`. O cabeçalho só é lido quando a env `PROXY_HEADER_IP` declara qual confiar (ex.: `CF-Connecting-IP`); sem ela vale o IP do socket. Configurar a env sem proxy à frente devolve o controle ao cliente — o `.env.example` avisa.
* **Teste:** `IdentidadeDoLimitador` — 40 requisições com header rotativo geram uma única identidade e o 31º pedido é recusado.

### 3.2 *Denial of Wallet* & *Race Conditions* em Cotas de IA — ✅ FECHADO
* **Descrição original (incompleta):** requisições paralelas leem o mesmo saldo antes de ser atualizado.
* **O que realmente acontecia:** as RPCs atômicas (`consumir_site_atomico`, `consumir_varredura_atomica`) **já existiam e já eram corretas** — `update ... where usados < limite` trava a linha no próprio UPDATE. O furo estava na ORDEM: o backend fazia um SELECT consultivo, rodava o trabalho caro (Google Places, LLM), e só então chamava a RPC **descartando o retorno**. Dez requisições simultâneas passavam as dez pelo SELECT, as dez pagavam Places, e a RPC recusava nove tarde demais.
* **Correção aplicada:** débito ANTES do trabalho caro, e o retorno da RPC decide se continua. Como debitar antes cria o risco inverso (cobrar por trabalho que falhou), entraram as RPCs `devolver_varredura_atomica` e `devolver_site_atomico`, com piso em zero.
* **Teste:** `CotaSobConcorrencia` — 10 threads com cota 1: o Places é chamado exatamente 1 vez. Editar site existente segue sem consumir cota.
* **Deploy:** as duas funções de estorno precisam ser criadas no Supabase. Rode `supabase/migrations/20260804_estorno_de_cota.sql` no SQL Editor e confira com `supabase/migrations/20260804_verificar.sql` (espera 4 linhas `OK`). Sem isso, débito e bloqueio funcionam; só o estorno falha, e o log registra `[Supabase] Estorno de ... falhou`.

### 3.3 *SSRF* em Varreduras OSINT — ✅ FECHADO (a descrição estava errada)
* **Descrição original:** `scraper_monster.py` buscaria URLs do usuário sem filtrar faixa privada.
* **Verificação:** **não existe esse caminho.** `scraper_monster.py` não faz nenhuma requisição a URL vinda do usuário, e `/api/site/clone` apenas extrai o nome do domínio da string — nunca busca a URL. O único fetch com destino influenciado pelo cliente é o proxy de mídia, que já tinha `HOSTS_PERMITIDOS`.
* **Furo real encontrado:** `urlopen` segue redirecionamento sozinho, e a allowlist só era checada na primeira URL. Um host permitido com open-redirect levaria o proxy a qualquer destino, inclusive `169.254.169.254`.
* **Correção aplicada:** `RedirecionamentoRestrito` + `ABRIDOR_MIDIA` em `backend/app_api.py` revalidam a allowlist a cada salto.
* **Teste:** `RedirecionamentoDoProxyDeMidia` — 7 destinos internos bloqueados, salto entre hosts da allowlist permitido.

### 3.4 Enumeração de Usuários — ✅ LOGIN FECHADO · ⚠️ CADASTRO EM ABERTO
* **Descrição:** respostas diferenciadas revelam se um e-mail está cadastrado.
* **Verificação:** o login já era neutro para o caso principal — o Supabase devolve `invalid login credentials` tanto para senha errada quanto para e-mail inexistente. A fuga real era `"Confirme seu e-mail antes de entrar."`, que só aparece para conta que existe.
* **Correção aplicada:** `LOGIN_RECUSADO` em `backend/supabase_client.py`. Toda recusa de login sai com o mesmo texto e HTTP 401. HTTP 429 é exceção proposital: é estado do servidor, vale para qualquer e-mail.
* **Sem canal lateral de tempo:** a verificação da senha acontece no Supabase, não localmente. Os dois caminhos fazem a mesma ida e volta HTTP, então não há diferença mensurável a igualar.
* **Ainda aberto — decisão de produto:** o cadastro responde `"Este e-mail já tem cadastro."`, o que confirma a existência da conta. Fechar isso exige trocar por uma mensagem neutra do tipo *"se este e-mail ainda não tiver cadastro, você receberá um link"* — o que piora a experiência de quem simplesmente esqueceu que já tinha conta. Não foi alterado: é escolha de negócio, não de engenharia.

### 3.5 Rotas de geração sem cota de plano — ⚠️ RISCO CONHECIDO E ACEITO

**Decisão registrada em 04/08/2026: deixar como está por enquanto.** Não é
esquecimento — está aqui para ser reavaliado quando houver cliente pagante.

Três rotas custam dinheiro a cada chamada e **não debitam cota nenhuma**:

| Rota | O que chama | Custo |
|---|---|---|
| `/api/ai/generate` | `llm_gateway.gerar()` | LLM por chamada |
| `/api/site/generate` | `HybridSiteGenerator` | LLM por chamada |
| `/api/site/clone` | `Lib77Engine` | geração |

O que **existe** de proteção: exigem token válido (`ROTAS_PROTEGIDAS`) e
passam pelo limite de taxa por identidade.

O que **falta**: teto mensal. O limite de taxa segura rajada, não uso
sustentado — 30/min mantidos dão ~43.200 chamadas de LLM por dia, por
usuário, em qualquer plano. E a cota de sites só é debitada no **save**:
gerar sem salvar não custa nada ao cliente e custa LLM ao projeto.

Por que foi aceito: o risco depende de usuário autenticado agindo de má-fé,
e hoje a base é beta. **Fechar antes de abrir para pagante.**

Como fechar quando for a hora: campo `geracoes_limite` / `geracoes_usadas`
no perfil, RPC `consumir_geracao_atomica` no mesmo molde das existentes, e
débito ANTES da chamada ao LLM — com estorno em caso de falha, exatamente
como foi feito em 3.2. O trabalho é mecânico; o que falta é decidir o número
de cada plano.

### 3.6 Segredos e Armazenamento no Cliente
* **Regra:** Nenhum segredo ou chave privada (API Key do Gemini/Groq, `SUPABASE_SECRET_KEY`, `R2_SECRET_ACCESS_KEY`) pode ser prefixado com `VITE_` ou exposto no front-end.
* **Cookies:** Utilizar sempre cookies `HttpOnly`, `Secure` e `SameSite=Lax` para armazenar a sessão, em vez de `localStorage` (evitando riscos de XSS).

### 3.7 O repositório é PÚBLICO — ⚠️ FATO OPERACIONAL

Verificado em 06/08/2026 por consulta anônima à API do GitHub:
`visibility: public`, aberto desde 25/07/2026. Um clone sem autenticação
traz os 45 commits.

Isso não é vulnerabilidade, é **contexto que muda o peso de todo o resto**:
qualquer segredo que entre num commit é público no instante do push, e não
existe "remover depois" — o histórico do git é permanente.

**Auditoria do histórico (06/08/2026):** varredura de todos os objetos do
repositório não encontrou nenhuma chave viva. As duas ocorrências de `AIza`
são o placeholder `"AIzaSy...Sua_Chave_Aqui..."` do `.env.example`. O
`backend/.env` que entrou em `f62e7fa` tinha os valores vazios.

O comando que produz essa prova — varre objeto, não diff de commit, que é
onde um diagnóstico apressado erra:

```bash
git rev-list --objects --all | awk '{print $1}' \
  | git cat-file --batch-check='%(objectname) %(objecttype)' \
  | awk '$2=="blob"{print $1}' | git cat-file --batch \
  | grep -aoE "AIza[0-9A-Za-z_-]{30,}" | sort -u
```

**Risco real hoje:** segredos fora do padrão `.env`. `docs/ELASTIC DOC/api-key.txt`
guardava uma chave viva da Elastic em `.txt` — fora das regras que o
`.gitignore` cobria. Nunca chegou a ser commitado; hoje está ignorado.

---

## 🚀 4. Plano de Ação de Blindagem (Security Hardening Roadmap)

> **Este checklist ficou desalinhado da seção 3 e foi reconciliado em
> 06/08/2026.** Ele marcava como pendentes três itens que a seção 3, no mesmo
> arquivo, já declarava fechados — quem lesse de baixo para cima refazia
> trabalho pronto. Cada linha abaixo foi conferida contra o código, não contra
> o texto da seção 3.

- [x] **1. Sanitização de IP por Borda (`app_api.py`)** — ver 3.1
  - `_ip_de_origem()` só lê cabeçalho quando `PROXY_HEADER_IP` declara qual
    confiar; sem a env, vale o IP do socket.
  - Verificado: função existe em `backend/app_api.py` e é quem `_identidade()`
    chama. Teste `IdentidadeDoLimitador`.
- [x] **2. Dedução Atômica de Cotas (`Supabase RPC`)** — ver 3.2
  - O diagnóstico original estava errado: as RPCs já eram atômicas. O furo era
    a ORDEM (débito depois do trabalho caro, retorno descartado).
  - Verificado: `consumir_site_atomico` e `devolver_site_atomico` em
    `backend/supabase_client.py`. Teste `CotaSobConcorrencia`.
  - ⚠️ **Deploy pendente:** rodar `supabase/migrations/20260804_estorno_de_cota.sql`
    no SQL Editor. Sem isso o estorno falha (débito e bloqueio funcionam).
- [x] **3. Filtro Anti-SSRF** — ver 3.3, **com ressalva de escopo**
  - O item pedia filtro em `scraper_monster.py`. Esse caminho **não existe**:
    o módulo não busca URL vinda do usuário.
  - O furo real era outro: `urlopen` seguia redirecionamento e a allowlist só
    valia na primeira URL. Fechado com `RedirecionamentoRestrito`, que
    revalida a cada salto. Teste `RedirecionamentoDoProxyDeMidia`.
- [ ] **4. Configuração de Proteção de Borda (Cloudflare WAF)** — PENDENTE
  - Rate limiting de borda: `/api/auth/*` 10 req/min por IP; API geral 60/min.
  - Turnstile/JS challenge contra botnet anônima.
  - Fora do código: depende de configuração no painel da Cloudflare.
- [ ] **5. Sanitização de Templates de Terceiros (`77lib`)** — PENDENTE
  - Medido em 06/08/2026: **16 templates** carregam **39 scripts** de CDN
    externo, **0 deles com `integrity` (SRI)**.
  - Consequência concreta: se um desses CDNs for comprometido, JavaScript
    arbitrário roda no site de todo cliente já entregue — e nos visitantes
    dele. Sem SRI, o navegador aceita o que vier.
  - É o item aberto de maior alcance, porque atinge quem já pagou.

### Itens que entraram depois

- [x] **6. Injeção de comando no importador OriginKit** — fechado em 06/08/2026
  - `subprocess.run(f'npx ... "{registry_url}"', shell=True)` executava comando
    arbitrário se a URL colada contivesse aspa e `&&`. Agora é lista de
    argumentos sem shell, com `shutil.which("npx")` para o Windows.
  - Prova: mesma URL hostil criava arquivo do atacante com `shell=True` e não
    cria com lista.
- [x] **7. Scan de segurança no CI** — fechado em 06/08/2026
  - O workflow escutava `push: main`, branch que não existe aqui. Rodava só em
    pull request. Agora dispara em `master` e `codex/**`.
  - Estado do gate: **exit 0**, 19s num checkout limpo.
