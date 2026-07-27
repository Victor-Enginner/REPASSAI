# REPASS AI — Auditoria de Frontend e Plano de Produção

Documento de engenharia. Todo número aqui foi **medido**, não estimado —
a metodologia está indicada em cada seção para você poder repetir.

---

## PARTE 1 — AUDITORIA DE FRONTEND

### 1.1 O achado que bloqueia tudo: o app não funciona no celular

Medido no navegador com viewport de 375px (iPhone SE / padrão de mercado):

| Medida | Valor | Consequência |
|---|---|---|
| Largura da Sidebar | **260px** | 69% da tela |
| Sobra para conteúdo | **115px** | inutilizável |
| Largura dos cards de lead | **50px** | ilegível |
| Alvos de toque abaixo de 44px | **17 de 25** | difíceis de acertar com o dedo |

Causa raiz, em `src/components/Sidebar.jsx`:

```js
width: '260px',
flexShrink: 0,      // nunca encolhe
position: 'sticky'  // sempre ocupa espaço no fluxo
```

Não é problema de overflow — o `body.scrollWidth` bate com a tela. É que a
Sidebar **nunca colapsa**. Em 375px ela come dois terços do aparelho.

Detalhe que muda a prioridade: seu produto vende para dono de barbearia,
restaurante e salão. Esse público abre link **no celular**. Se ele receber
uma demonstração e abrir no telefone, vê uma faixa de 115px.

**Overflow real** (só 2 telas, ambas pequenas):

| Tela | Estouro | Origem |
|---|---|---|
| TEMPLATES_10 | +9px | `iframe` da miniatura |
| CRIAR_SITE_11 | +261px | `div` do wizard |

### 1.2 Não existe design system na prática

| Medida | Valor |
|---|---|
| `style={{ }}` inline | **862** |
| Classes CSS definidas | 28 |
| Cores hex escritas à mão no JSX | **619** |
| Uso de `var(--token)` | 42 |
| Tokens declarados no `index.css` | 15 |

Há 15 tokens definidos e praticamente ninguém os usa. As cores mais
repetidas são candidatas óbvias:

```
93×  #ffffff      77×  #94a3b8     66×  #6366f1
53×  #0a0e1a      49×  #22c55e     38×  #64748b
```

Consequência prática: mudar a identidade visual hoje exige editar 619
lugares. Com tokens, seriam 8.

### 1.3 Tipografia e grid não são fluidos

| Medida | Valor |
|---|---|
| `fontSize` em px fixo | **356** |
| `clamp()` | 29 |
| Grids de coluna fixa | **21** |
| `@media` no `index.css` | 2 |

Os oito piores grids (quebram abaixo de ~900px):

```
DashboardView       repeat(6, 1fr)
CRMView             repeat(4, 1fr)
AffiliateView       repeat(3, 1fr)
BillingView         repeat(3, 1fr)
CreateSiteWizard    repeat(3, 1fr)
AppointmentsView    2fr 1.5fr 160px 180px
ProjectsView        1.5fr 2fr 140px 220px
BulkWhatsAppView    minmax(160px,1.8fr) minmax(0,2.5fr) 160px
```

### 1.4 Acessibilidade: praticamente ausente

| Medida | Valor |
|---|---|
| `aria-label` | **0** |
| `role=` | **0** |
| `<label>` | 8 |
| `<input>` | 12 |
| `<img>` sem `alt` | 0 ✅ |

Quatro inputs sem rótulo associado. Zero atributos ARIA no sistema inteiro.

Isso não é só conformidade: os sites que o REPASS AI gera herdam esse
padrão, e site sem semântica **não indexa bem no Google** — exatamente o
que você promete resolver para o cliente.

### 1.5 Arquivos grandes demais

```
628  LeadsView.jsx
625  LandingPage.jsx
556  TemplatesView.jsx
353  CreateSiteWizardView.jsx
```

Acima de ~400 linhas com estilo inline, a manutenção fica cara e o risco de
conflito entre edições cresce.

### 1.6 O que está bom

Sendo justo, há trabalho sólido aqui:

- Bundle inicial de **348 KB** (era 700 KB), 39 chunks
- Lazy loading por rota + prefetch em ocioso
- Keep-alive seletivo por custo de view
- Error boundary isolando falha por aba
- Zero `<img>` sem `alt`
- Zero chamada HTTP hardcoded (tudo via `config.js`)
- Zero segredo no frontend

---

## PARTE 2 — PLANO DE EXECUÇÃO

Cada sprint tem entregável verificável. A ordem é por **risco de negócio**,
não por facilidade.

---

### SPRINT A — Mobile (bloqueador comercial)

> **Por que primeiro:** seu cliente final abre link no celular. Hoje ele vê
> uma faixa de 115px. Nada mais importa até isso funcionar.

| # | Task | Arquivo | Entregável |
|---|---|---|---|
| A1 | Sidebar vira drawer abaixo de 1024px, com botão hambúrguer e overlay | `Sidebar.jsx`, `App.jsx` | conteúdo usa 100% da largura no celular |
| A2 | Fechar o drawer ao navegar e ao tocar fora | `Sidebar.jsx` | navegação natural no toque |
| A3 | Alvos de toque com mínimo de 44px | `index.css` | 0 de 25 abaixo do mínimo |
| A4 | Trocar os 8 grids de coluna fixa por `auto-fit` | 8 views | 0 estouros em 375px |
| A5 | Corrigir os 2 overflows (iframe de template, div do wizard) | `TemplatesView`, `CreateSiteWizardView` | 0 estouros |

**Critério de aceite:** em 375px, todas as 11 abas sem overflow, sobra ≥
340px para conteúdo, 0 alvos abaixo de 44px.

**Como validar:** o mesmo script que usei nesta auditoria — percorre as
abas medindo `getBoundingClientRect()` de cada elemento contra a largura da
tela.

---

### SPRINT B — Design system

> **Por que:** habilita tema, marca branca e mudança visual barata. Sem
> isso, todo ajuste de identidade custa 619 edições.

| # | Task | Entregável |
|---|---|---|
| B1 | Promover as 8 cores mais usadas a tokens CSS | paleta central em `index.css` |
| B2 | Substituir os 619 hex literais pelos tokens | `grep -c '#[0-9a-f]\{6\}' src/` próximo de 0 |
| B3 | Escala tipográfica fluida com `clamp()` | 356 px fixos → escala de 6 degraus |
| B4 | Extrair `<Botao>`, `<Card>`, `<Campo>`, `<Selo>` | 862 inline → ~200 |
| B5 | Quebrar `LeadsView` e `TemplatesView` em subcomponentes | nenhum arquivo acima de 400 linhas |

**Critério de aceite:** trocar a cor primária em 1 lugar muda o app inteiro.

---

### SPRINT C — Acessibilidade e SEO

> **Por que:** os sites gerados herdam o padrão do sistema. Site sem
> semântica não indexa — e indexar é o que você vende.

| # | Task | Entregável |
|---|---|---|
| C1 | `aria-label` em todo botão que só tem ícone | 0 → cobertura total |
| C2 | `<label>` associado aos 4 inputs órfãos | 12 de 12 rotulados |
| C3 | Navegação por teclado com foco visível | percorrer o app sem mouse |
| C4 | Camada semântica nos sites gerados | `<h1>`, `<section>`, ARIA no `SchemaRenderer` |
| C5 | `<title>`, meta description e Open Graph no HTML gerado | site indexável |

**Critério de aceite:** Lighthouse Accessibility ≥ 90 no painel e nos sites
gerados.

---

### SPRINT D — Persistência completa

> **Por que:** a base do Supabase existe (Sessão 3), mas o editor ainda
> grava no localStorage. Sites somem ao limpar o cache.

| # | Task | Entregável |
|---|---|---|
| D1 | `documentDB.js` passa a falar com a tabela `sites` | site sobrevive a limpar cache |
| D2 | Histórico de versões na tabela `site_versoes` | restaurar versão anterior |
| D3 | Endpoints `/api/sites` (CRUD) com filtro por `user_id` | isolamento por operador |
| D4 | Cota de sites por plano | `sites_limite` respeitado |
| D5 | Migração do localStorage existente | nada se perde ao ligar |

---

### SPRINT E — Global Ready (i18n)

> Requisito seu: trocar idioma, formato de telefone e padrão de busca por
> variável de ambiente.

| # | Task | Entregável |
|---|---|---|
| E1 | Dicionário pt-BR / en / es com fallback | `src/i18n/` |
| E2 | Formatação de telefone por país | BR `(16) 99999-9999` · US `+1 555-0199` |
| E3 | Termos de busca por locale | "Barbearia" ↔ "Barbershop" |
| E4 | `LOCALE_PADRAO` e `PAIS_PADRAO` no `.env` | trocar país sem tocar em código |
| E5 | Validação de telefone por país no motor de disparo | não gera link inválido |

> **Nota de arquitetura:** o backend já segue o desenho que você descreveu —
> `NicheFilter`, `LeadParser`, `KPIEngine` e `OSINTCore` existem em
> `scraper_monster.py`. O `GeoScraper` foi absorvido pelo `places_engine.py`
> quando trocamos o Nominatim (que não retorna telefone) pela Places API.
> A separação de responsabilidades continua a mesma.

---

### SPRINT F — Deploy real

> **Por que:** hoje "publicar" baixa um HTML. Sem isso, não há produto
> completo para vender.

| # | Task | Entregável |
|---|---|---|
| F1 | Upload real para o Cloudflare R2 (API S3) | arquivo no bucket |
| F2 | Domínio servindo o bucket | `cdn_url` deixa de ser `null` |
| F3 | Worker de CNAME para domínio do cliente | `site.cliente.com.br` |
| F4 | Botão "Publicar" com estado real | `publicado: true` só quando está no ar |
| F5 | Pixel do Facebook e GTM injetáveis no `<head>` | rastreamento funcionando |

---

## PARTE 3 — DÍVIDA CONHECIDA

Itens já identificados que continuam abertos:

| Item | Onde | Impacto |
|---|---|---|
| Rate limit no `/api/leads/scan` | `app_api.py` | qualquer um queima sua cota do Places |
| `/api/site/clone` não clona | `app_api.py` | devolve schema fixo dizendo "Firecrawl" |
| `modal_engine.py` sem uso | `backend/` | código morto (documentado, não apagado) |
| Chave do Gemini em formato inválido | `backend/.env` | retorna 429; Groq está cobrindo |
| Loops de animação separados | componentes WebGL | cada um com seu `rAF` |
| `dispose()` de recursos WebGL | componentes WebGL | vaza memória de GPU na troca de rota |

---

## PARTE 4 — RECOMENDAÇÃO

Faça **A → C → D**, nessa ordem.

- **A** porque hoje o produto não funciona no aparelho do seu cliente.
- **C** logo depois porque é barato e é o que faz o site gerado indexar —
  o núcleo da sua proposta de valor.
- **D** porque perder o trabalho do cliente ao limpar o cache é o tipo de
  falha que cancela assinatura.

**B** é o que mais economiza tempo no longo prazo, mas não trava venda.
**E** e **F** só depois que a base estiver firme.

Uma observação sobre sequência: não faça **B** antes de **A**. Refatorar 619
cores para tokens e depois descobrir que metade dos componentes precisa
mudar de layout no mobile é retrabalho garantido.
