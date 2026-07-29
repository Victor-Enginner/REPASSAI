> **HISTÓRICO — não é referência.**
> Placar dos sprints em 27/07/2026. Substituido pelo ROADMAP.md.
> A referência atual está em [../ARQUITETURA.md](../ARQUITETURA.md) e
> [../ROADMAP.md](../ROADMAP.md). Índice em [../README.md](../README.md).

# REPASS AI — Revisão Completa dos Sprints Pendentes

> Medido em **27/07/2026**, branch `codex/repass-infrastructure-foundation`.
> Todo número aqui saiu de comando executado no repositório, não de estimativa.
> Complementa o [PLANO_PRODUCAO.md](PLANO_PRODUCAO.md), que continua sendo a
> referência dos critérios de aceite.

---

## 1. Placar geral

| Sprint | Antes | Agora | Estado |
|---|---|---|---|
| **A** — Mobile | 21 grids fixos, 2 media queries | **3 grids fixos, 7 media queries, 20 auto-fit** | ✅ feito |
| **B** — Design system | 619 hex, 862 inline | **473 substituições feitas + trava de lint** | ✅ feito |
| **SEG** — Auth e rate limit | 1 de 6 rotas protegidas | **4 rotas protegidas, 429 ativo, 22 testes** | ✅ feito |
| **C** — Acessibilidade | 0 aria, 0 role | **25 aria, 0 role**, 6 inputs sem label | 🟡 iniciado |
| **D** — Persistência | localStorage | **`documentDB.js` ainda em `src/mock/`** | ❌ não começou |
| **E** — i18n | — | **`src/i18n/` não existe** | ❌ não começou |
| **F** — Deploy | — | R2 real ✅, domínio `r2.dev` padrão | 🟡 F1 feito |

**Build de produção passa**: 16,4s, sem erro. Bundle principal 311 KB
(99,7 KB gzip). `SiteEditorView` é o mais pesado: 215 KB (53 KB gzip).

---

## 2. Sprint B — Design system (regrediu)

| Medida | Meta do plano | Agora | Delta |
|---|---|---|---|
| Hex escrito à mão | ~0 | **870** | +251 |
| `style={{ }}` inline | ~200 | **941** | +79 |
| `var(--token)` | alto | 94 | +52 |
| `fontSize` px fixo | escala fluida | **325** | -31 |
| `clamp()` | — | 32 | +3 |

As features novas (chatbot agêntico, wizard, landing) entraram escrevendo cor
na mão. Não é descuido isolado: **não existe barreira** que impeça isso. Sem
um lint que reprove hex literal no JSX, o número volta a subir no próximo
sprint, independente de quantas vezes for corrigido.

Custo atual de trocar a identidade visual: **870 edições**.

### Arquivos acima de 400 linhas

```
10047  src/data/componentIndex.js      (dado gerado — aceitável)
  688  src/components/AgenticChatbotBuilder.jsx
  625  src/views/LandingPage.jsx
  556  src/views/TemplatesView.jsx
  539  src/views/LeadsView.jsx
  471  src/components/ui/PixelTetris.jsx
  436  src/services/componentRetrieval.js
  430  src/components/ui/FaultyTerminal.jsx
  404  src/views/CreateSiteWizardView.jsx
```

---

## 3. Sprint C — Acessibilidade

| Medida | Agora | Observação |
|---|---|---|
| `aria-*` | 25 | havia 0; começou |
| `role=` | **0** | nenhum papel semântico declarado |
| `<input>` × `<label>` | 13 × 7 | **6 inputs sem rótulo** |
| `<button>` | 91 | muitos só com ícone |
| `onClick` em `div`/`span` | **1** | ótimo — quase tudo é botão real |

O ponto que liga ao negócio continua valendo: os sites gerados herdam o
padrão do sistema, e site sem semântica não indexa. É o que você vende.

---

## 4. Sprint D — Persistência (o mais crítico)

- `documentDB.js` está em **`src/mock/`** — é mock, grava no `localStorage`
- `localStorage` aparece em 4 arquivos: `App.jsx`, `mock/documentDB.js`,
  `services/authService.js`, `utils/analyticsEngine.js`
- Endpoint `/api/sites`: **não existe** (0 ocorrências)
- A tabela `sites` **já existe** no Supabase ([GUIA_SUPABASE.md:143](GUIA_SUPABASE.md))

**Consequência real:** o cliente limpa o cache do navegador e perde todos os
sites. É também a causa raiz do "projectId órfão / tela cinza" listado como
problema conhecido do produto.

---

## 5. Backend — cobertura de autenticação

| Handler | Auth | Linhas | Risco |
|---|---|---|---|
| `handle_scan` | SIM* | 105 | *bypass: sem token, pula a cota e executa |
| `handle_site_generate` | **NÃO** | 62 | gera site sem conta |
| `handle_ai_generate` | **NÃO** | 45 | **queima crédito de LLM de graça** |
| `handle_site_clone` | **NÃO** | 84 | — |
| `handle_media_proxy` | NÃO | 99 | aceitável: só serve imagem, tem allowlist |
| `handle_site_preview_html` | NÃO | 64 | aceitável: preview público |

O bypass em [app_api.py:592](../backend/app_api.py#L592):

```python
if supabase_client.auth_configurado():
    usuario = self._usuario_atual()
    if usuario:              # sem token cai fora
        ...checa cota...
# ...e a varredura executa mesmo assim
```

### Outros achados

| Item | Medida | Impacto |
|---|---|---|
| Rate limiting | **0 ocorrências** | 1.000 requisições esgotam sua cota do Places |
| `except Exception` genérico | 6 | mascara causa real da falha |
| `print()` em vez de logger | 12 | sem nível, sem timestamp, invisível em produção |
| `str(e)` devolvido ao cliente | [:629](../backend/app_api.py#L629) | vaza caminho de arquivo |
| `modal_engine.py` | **0 referências** | código morto |
| `/api/site/clone` | devolve schema fixo | não clona nada; promete "Firecrawl" |

### O que já está protegido

Registrando para não ser reaberto sem motivo:

- **SSRF**: `media_proxy` valida host contra allowlist antes de buscar
- **Path traversal**: `preview_html` tem suíte de teste dedicada em `test_api.py`
- **CORS**: restrito a origens conhecidas, não usa `*`
- **Teto de corpo**: `Content-Length` limitado ([:477](../backend/app_api.py#L477))
- **Concorrência**: `ThreadingHTTPServer`, não single-thread

---

## 6. Sprints E e F

**E — i18n:** `src/i18n/` não existe. Strings PT-BR escritas direto no JSX.
Nada bloqueia, mas quanto mais telas entram, mais caro fica extrair.

**F — Deploy:** `F1` concluído e verificado hoje (1.399 arquivos no R2 com
URL respondendo 200). `F2` parcial: publica em `pub-*.r2.dev`, o domínio
padrão da Cloudflare — funciona, mas o cliente vê uma URL que não é a marca
dele. `vercel.json` está correto para SPA.

---

## 7. Ordem recomendada

A regra é: **primeiro o que perde cliente ou dinheiro, depois o que perde tempo.**

### 1º — Auth e rate limit (perde dinheiro, hoje)
Fechar o bypass, exigir token em `site/generate` e `ai/generate`, limitar por
IP e usuário, parar de devolver `str(e)`. É código puro, não depende de você.

### 2º — Sprint D (perde cliente)
Ligar `documentDB` no Supabase, criar `/api/sites` com filtro por `user_id`,
migrar o localStorage existente. Mata a tela cinza de vez.

### 3º — Sprint C (perde venda)
Barato e liga direto na proposta de valor: site que indexa.

### 4º — Sprint B (perde tempo)
Fazer **com lint que trave regressão** — sem isso os 870 voltam.

### 5º — Sprints E e F
Só depois da base firme. `F3` (domínio do cliente) tem apelo comercial forte
e pode ser antecipado se virar objeção de venda.

---

## 8. Fora do plano, feito em 27/07/2026

- Biblioteca de **1.140 componentes MIT** minerada (6 fontes), cache local +
  Cloudflare R2, índice pesquisável
- `lib77_engine` reescrito: auditoria que **bloqueia** site com francês,
  dado genérico ou foto de terceiro; token fora do código
- Dois `NameError` que quebravam `/api/site/generate` e `/api/site/clone`
  em toda chamada

---

## 9. Dívida que segue aberta por decisão

- **Chaves nos commits `bf11c0d` e `f62e7fa`** (`GOOGLE_PLACES_API_KEY`,
  `LLM_API_KEY`, `MODAL_TOKEN_ID`, `MODAL_TOKEN_SECRET`). Decidido em
  27/07/2026 não rotacionar e não reescrever o histórico. Risco aceito
  enquanto o repositório permanecer privado.
