# REPASS AI — Plano de Execução UX/Navegação

**Para:** agente Antigravity
**De:** auditoria técnica (Claude)
**Estado base:** Sprint A (mobile) concluído — build ✅, 11/11 testes ✅

Este documento é executável. Cada task tem arquivo alvo, o que mudar e como
verificar. Não invente componente: use os ids reais do catálogo, listados
na seção "Arsenal disponível".

---

## REGRAS QUE NÃO PODEM SER QUEBRADAS

Antes de qualquer task, leia estas cinco. Elas custaram caro para existir.

1. **NÃO usar Tailwind CSS.** O projeto é CSS puro + estilo inline. Injetar
   Tailwind quebra os 10 componentes WebGL existentes.

2. **NÃO fabricar dado.** Telefone, nota, nº de avaliações e URL vêm da
   Google Places API ou não existem. Nunca preencher com placeholder,
   nunca gerar número. Já houve um incidente de telefones inventados que
   apontavam para terceiros reais — não repetir.

3. **NÃO quebrar `is_demo`.** Lead de demonstração não pode receber botão
   de WhatsApp funcional. A trava está em `whatsappBulkEngine.podeAbordar()`.

4. **NÃO regredir o mobile.** Sidebar vira gaveta abaixo de 1024px; alvos
   de toque ≥ 44px; zero estouro horizontal em 375px.

5. **NÃO subir bundle sem medir.** Hoje: 348 KB inicial. Cada componente
   WebGL novo entra por `React.lazy`, nunca import estático.

---

## ARSENAL DISPONÍVEL

102 componentes instaláveis no catálogo, **10 implementados**. Estes são
os ids reais — use exatamente assim:

**Navegação (8):**
`bubble_menu` · `dock` · `flowing_menu` · `gooey_nav` · `infinite_menu` ·
`line_sidebar` · `pill_nav` · `staggered_menu`

**Cards (9):**
`card_nav` · `card_swap` · `folder` · `profile_card` · `reflective_card` ·
`scroll_stack` · `spotligh_card` · `stack` · `tilted_card`

**Cursor (5):**
`glare_hover` · `magnet_lines` · `slpash_cursor` · `target_cursor` ·
`image_trail_integrate_the_imagetrail_component_from_react_bits`

**Superfície (4):**
`eletric_border` · `glass_icons` · `glass_surface` · `specular_button`

**Luz (12):** `beams` · `border_glow` · `orb` · `prism` · `light_rays` · …

**Materializar um componente:**
```bash
# O código-fonte está em D:\Site Pack Assets\Components Animations\*.txt
# na seção "### Full Component Source". Copiar para:
src/components/ui/<Nome>.jsx
# Depois registrar em src/components/ui/registry.js
npm run build:index   # reindexa o catálogo
```

---

## SPRINT 1 — Linguagem da interface

> **Problema:** `CRIAR_SITE_11`, `MOTOR_DE_IA_05` são nomes de variável
> vazando na tela. Parece protótipo interno, não produto.
>
> A estética de terminal é boa e deve ficar. O erro não é o monoespaçado —
> é usar `SNAKE_CASE_11` como rótulo humano. Terminal de verdade tem
> comando legível; o número serve de índice, não de nome.

### T1.1 — Renomear os 11 rótulos
**Arquivo:** `src/components/Sidebar.jsx` (array `menuItems`)

Trocar `label` por dois campos — `nome` (humano) e `indice` (o número,
renderizado pequeno e apagado ao lado):

| id | ANTES | nome | índice |
|---|---|---|---|
| dashboard | `PAINEL_01` | Painel | 01 |
| leads | `LEADS_OSINT_02` | Scanner de Leads | 02 |
| crm | `CRM_VENDAS_03` | Funil de Vendas | 03 |
| bulk_whatsapp | `DISPARO_WHATSAPP_04` | Abordagem em Lote | 04 |
| engine | `MOTOR_DE_IA_05` | Motor Neural | 05 |
| agendamentos | `AGENDA_06` | Agenda | 06 |
| projetos | `PROJETOS_07` | Meus Sites | 07 |
| cobrar | `FATURAMENTO_08` | Faturamento | 08 |
| ranking | `RANKING_09` | Indicações | 09 |
| templates | `TEMPLATES_10` | Loja de Templates | 10 |
| editor | `CRIAR_SITE_11` | Criar Site | 11 |

Renderização: `nome` em peso 600, tamanho 13px; `indice` em `--font-mono`,
9px, `opacity: 0.35`, alinhado à direita.

> Mantém o DNA de terminal sem parecer variável exposta.

### T1.2 — Varrer o resto da interface
**Arquivos:** todas as views

Rótulos como `MODULE // LEADS_OSINT_02` viram `SCANNER DE LEADS` no `<h1>`,
com o código técnico movido para um `mono-label` discreto acima. O código
some do lugar de destaque, não da tela.

**Verificação:** `grep -rE "[A-Z]+_[A-Z]+_[0-9]{2}" src/views/ src/components/`
não retorna nada em posição de título.

---

## SPRINT 2 — O card de lead

> **Problema:** hoje é `border: 0.5px solid rgba(255,255,255,0.15)` +
> `borderRadius: 4px` — a mesma caixa do resto. Não comunica hierarquia
> nem valor. É a tela onde o operador passa 80% do tempo.
>
> Referência: `LeadsView.jsx:265` e `:291`.

### T2.1 — Materializar `spotligh_card`
Copiar de `D:\Site Pack Assets\Components Animations\Spotligh Card.txt`
→ `src/components/ui/SpotlightCard.jsx`. Registrar no `registry.js`.

Efeito: luz segue o cursor sobre o card. Baixo custo (CSS + rAF), alto
retorno percebido.

### T2.2 — Materializar `eletric_border`
De `Eletric Border.txt` → `src/components/ui/ElectricBorder.jsx`.

**Uso semântico, não decorativo:** borda elétrica **apenas** em lead com
score ≥ 80 (`temperatura: 'Quente'`). O efeito passa a significar
"oportunidade quente" em vez de enfeite.

### T2.3 — Reconstruir o card
**Arquivo:** `src/views/LeadsView.jsx`, novo `src/components/LeadCard.jsx`

Hierarquia visual obrigatória:
```
┌─ [checkbox]  NOME DO NEGÓCIO            [score]  ← 15px/700
│              Categoria · Cidade                  ← 11px/#94a3b8
│              ★ 4.8 · 1177 avaliações             ← só se existir
├──────────────────────────────────────────────
│  📞 (16) 99050-5914          [TEM SITE]
│  📍 Endereço completo
│  💡 Motivo da abordagem (itálico)
├──────────────────────────────────────────────
│  [ Ver site ]          [ Enviar para CRM ]
└─
```

Regras:
- `avaliacao`/`reviewsCount` **só renderizam se forem número**. Ausência é
  ausência — não escrever "sem avaliações", simplesmente omitir a linha.
- Lead com `is_demo: true` recebe selo `DEMONSTRAÇÃO` e botões desabilitados.
- Card inteiro é `<article>` com `aria-label` = nome do negócio.

### T2.4 — Estados de carregamento
Substituir "VARENDO..." por **skeleton** dos cards (6 placeholders com
shimmer). O usuário vê a estrutura chegando em vez de um botão travado.

**Verificação:** em 375px, cards ocupam largura total, sem estouro; alvos
de toque ≥ 44px.

---

## SPRINT 3 — Navegação memorável

> **Objetivo do dono:** "a navegação mais foda que alguém já teve".
>
> Tradução em engenharia: **transição com continuidade**. O que faz uma
> navegação parecer cara não é ter muita animação — é o elemento
> compartilhado persistir entre telas em vez de tudo piscar e recarregar.

### T3.1 — Indicador contínuo na Sidebar
Já existe `layoutId="activeSidebarPill"` (framer-motion). Está correto.
**Não substituir.** Apenas garantir que sobrevive à gaveta no mobile.

### T3.2 — Transição de conteúdo
**Arquivo:** `src/App.jsx`

Envolver o `<Suspense>` de cada view em `AnimatePresence mode="wait"`:
```jsx
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -8 }}
transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
```
180ms. Acima de 250ms vira lentidão percebida.

**Respeitar `prefers-reduced-motion`:** com a preferência ativa, duração 0.

### T3.3 — `target_cursor` no desktop
De `Crossharis xxxx.txt` / `Target Cursor.txt`.

- **Somente** em `(pointer: fine)` — nunca em toque
- Desligar com `prefers-reduced-motion`
- Um único listener global, não um por componente

### T3.4 — `dock` para ações rápidas
Barra flutuante inferior no mobile com as 4 ações mais usadas
(Scanner · Funil · Criar Site · Motor). Resolve o problema de precisar
abrir a gaveta para trocar de tela.

### T3.5 — Feedback de clique universal
**Arquivo:** `src/index.css`

Todo botão: `active` com `scale(0.97)` em 90ms. É o detalhe que faz a
interface parecer responsiva ao toque.

---

## SPRINT 4 — Design system (a dívida real)

> **Medido na auditoria:** 862 estilos inline · 619 cores hex escritas à
> mão · 42 usos de token · 356 `fontSize` em px fixo.
>
> Trocar a identidade visual hoje custa 619 edições. Depois deste sprint,
> custa 8.

### T4.1 — Promover as 8 cores mais usadas a token
```
93× #ffffff → --texto-forte      53× #0a0e1a → --superficie
77× #94a3b8 → --texto-fraco      49× #22c55e → --sucesso
66× #6366f1 → --primaria         38× #64748b → --texto-apagado
37× #cbd5e1 → --texto-medio      23× #111726 → --superficie-2
```

### T4.2 — Substituir os 619 literais
**Verificação:** `grep -roE "#[0-9a-fA-F]{6}" src/ --include=*.jsx | wc -l`
deve cair de 619 para < 40 (só os shaders WebGL, que precisam de hex).

### T4.3 — Escala tipográfica fluida
Seis degraus com `clamp()`. Elimina os 356 px fixos.

### T4.4 — Primitivos
`<Botao>`, `<Card>`, `<Campo>`, `<Selo>`, `<Painel>` em
`src/components/primitivos/`. Meta: 862 inline → ~200.

### T4.5 — Quebrar arquivos grandes
`LeadsView` (628 linhas) e `TemplatesView` (556) → nenhum acima de 400.

---

## SPRINT 5 — Acessibilidade

> **Medido:** 0 `aria-label`, 0 `role`, 8 `<label>` para 12 inputs.
>
> Não é só conformidade: **os sites gerados herdam esse padrão**, e site
> sem semântica não indexa no Google — que é exatamente o que o REPASS AI
> promete resolver para o cliente.

| # | Task | Meta |
|---|---|---|
| T5.1 | `aria-label` em todo botão só-ícone | cobertura total |
| T5.2 | `<label>` nos 4 inputs órfãos | 12/12 |
| T5.3 | Foco visível em todo interativo | navegar sem mouse |
| T5.4 | Camada semântica no `SchemaRenderer` | `<h1>`, `<section>`, ARIA |
| T5.5 | `<title>`, meta description, Open Graph nos sites gerados | indexável |

**Verificação:** Lighthouse Accessibility ≥ 90 no painel e nos sites gerados.

---

## ORDEM RECOMENDADA

```
1 → 2 → 3 → 5 → 4
```

**Por quê:** 1 e 2 são o que o dono vê e o que o cliente julga. 3 é o
diferencial percebido. 5 é barato e destrava SEO. 4 economiza mais tempo
no longo prazo, mas não trava venda — e fazer 4 antes de 2 significa
refatorar cores de um card que vai ser reescrito.

---

## CHECKLIST ANTES DE CADA COMMIT

```bash
npm run build                 # sem erro
python backend/test_api.py    # 11/11
```

No navegador, em **375px**:
- [ ] 11 abas sem estouro horizontal
- [ ] 0 alvos de toque abaixo de 44px
- [ ] Sidebar em gaveta, conteúdo com largura total

Em **1440px**:
- [ ] Sidebar 260px `sticky`, sem hambúrguer
- [ ] 11 abas sem view quebrada

**Script de verificação** (colar no console do navegador):
```js
(async () => {
  const t = document.documentElement.clientWidth, m = document.querySelector('main');
  const abrir = () => document.querySelector('button[aria-label*="Abrir menu"]');
  const abas = () => [...document.querySelector('aside').querySelectorAll('button')]
    .filter(b => b.closest('nav'));
  let estouros = 0, pequenos = 0, total = 0, falhas = 0;
  for (let i = 0; i < 11; i++) {
    abrir()?.click(); await new Promise(r => setTimeout(r, 300));
    const l = abas(); if (!l[i]) continue;
    l[i].click(); await new Promise(r => setTimeout(r, 600));
    if (m.innerText.includes('ESTA ABA FALHOU')) falhas++;
    let pior = 0;
    m.querySelectorAll('*').forEach(e => { const w = e.getBoundingClientRect().width;
      if (w > pior && w > t + 2) pior = w; });
    if (pior) estouros++;
    m.querySelectorAll('button,a,input,select,textarea').forEach(e => {
      const h = e.getBoundingClientRect().height;
      if (h > 0) { total++; if (h < 44) pequenos++; } });
  }
  console.log({ viewport: t, estouros, alvosPequenos: `${pequenos}/${total}`, falhas,
    scrollH: document.body.scrollWidth > t + 2 });
})()
```

Referência atual (Sprint A): `estouros: 0`, `alvosPequenos: 0/125`,
`falhas: 0`, `scrollH: false`.

---

## O QUE NÃO ESTÁ NESTE PLANO

Pendências conhecidas, fora de escopo aqui:

| Item | Onde |
|---|---|
| Rate limit no `/api/leads/scan` | qualquer um queima a cota do Places |
| `/api/site/clone` não clona | devolve schema fixo |
| Domínio próprio para o R2 | upload e `r2.dev` já funcionam; falta URL de produção |
| Editor ainda salva no localStorage | tabela `sites` existe e não é usada |
| `dispose()` de recursos WebGL | vaza memória de GPU na troca de rota |
| Loops de animação separados | unificar no `gsap.ticker` |
