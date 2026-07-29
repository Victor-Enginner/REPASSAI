> **HISTÓRICO — não é referência.**
> Passagem de contexto entre sessoes.
> A referência atual está em [../ARQUITETURA.md](../ARQUITETURA.md) e
> [../ROADMAP.md](../ROADMAP.md). Índice em [../README.md](../README.md).

# REPASS AI — Handoff para nova sessão

Documento autossuficiente. Um agente sem histórico consegue continuar só
com isto. **Estado verificado em execução real**, não de memória.

---

## 1. CHECKPOINT

```
Repositório: C:\Users\Victor Ads\Documents\SCRAPER HACKING
Branch:      codex/repass-infrastructure-foundation
Commit:      1ad87bc
Working tree: limpo (tudo commitado)
```

## 2. ESTADO VERIFICADO

Rodado agora, não presumido:

```
npm run build            ✅  bundle inicial 356,75 KB
python backend/test_api.py   ✅  15 testes (1 pulado)
python scripts/e2e_smoke.py  ✅  15 OK, 0 avisos, 0 falhas
```

O e2e confirma, com conexão real:

| Item | Estado |
|---|---|
| Supabase | conectado, latência ~726ms |
| Auth | `auth_ativo: true`, modo multiusuário |
| R2 | bucket real, 1 objeto, publicação HTTP 200 |
| Motores de IA | 5 prontos |
| Scanner sem JWT | bloqueado **antes** de gerar custo |
| SSE | canal abre e transmite |

## 3. STACK

- **Frontend:** React 18 + Vite, porta **3000**. CSS puro + estilo inline.
- **Backend:** Python `http.server` (stdlib), porta **8000**.
- **Auth + banco:** Supabase (ativo).
- **Publicação:** Cloudflare R2 (ativo).
- **IA:** cadeia com rotação, **só no backend**.

---

## 4. REGRAS INVIOLÁVEIS

Cada uma custou caro. Não relaxar sem decisão explícita do dono.

1. **Sem Tailwind.** O projeto é CSS puro + inline. Injetar Tailwind quebra
   os componentes WebGL.
2. **Nunca fabricar dado.** Telefone, nota, nº de avaliações e URL vêm da
   Google Places API ou não existem. Já houve incidente de telefones
   gerados por `random()` que apontavam para terceiros reais.
3. **Nunca inventar URL pública.** Já houve `sobresite.io` e
   `cdn.repass.ai`, ambos NXDOMAIN, sendo enviados a clientes.
4. **Trava `is_demo`.** Lead de demonstração não recebe botão de WhatsApp
   funcional. A regra vive em `whatsappBulkEngine.podeAbordar()`.
5. **Segredo nunca no frontend.** Nada de `VITE_*` com chave privada.
   Só a chave pública do Supabase pode ir ao navegador.
6. **Mobile não regride.** Sidebar vira gaveta abaixo de 1024px; alvos de
   toque ≥ 44px; zero estouro horizontal em 375px.
7. **Componente WebGL entra por `React.lazy`**, nunca import estático.
8. **Não marcar como pronto o que não foi testado no caminho real.**

---

## 5. O QUE ESTÁ FEITO

**Backend**
- `places_engine.py` — Google Places real (telefone, site, nota, score)
- `scraper_monster.py` — orquestra a varredura; sem chave → modo demo com
  `is_demo: true` e `telefone: None`
- `llm_gateway.py` — cadeia de IA com rotação de chaves, tudo server-side
- `supabase_client.py` — auth + PostgREST, só stdlib. Aceita os dois nomes
  de chave (`SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`)
- `templates_store.py` — loja de templates via registry 77lib
- Proteções: SSRF no proxy de mídia, path traversal no preview, CORS por
  allowlist, teto de corpo POST, caches com limite

**Frontend**
- `ViewErrorBoundary` — aba quebrada não derruba o app
- `useMediaQuery` / `useEhMobile` — breakpoint 1024px
- `Sidebar` — gaveta no mobile, rótulos humanos (`Criar Site` + `11`)
- `DockMobile` — 4 atalhos no rodapé, só mobile
- `LeadCard` — `SpotlightCard` + `Cyber3DCard`
- `CursorPersonalizado` + `StickyCursor` — desktop, lazy, com 4 guardas
- `LoginView` + `authService` — login/cadastro sem SDK
- Code splitting por rota + prefetch em ocioso + keep-alive seletivo

**Docs**
- `docs/repass-architecture-map.json` — fonte de verdade arquitetural
- `docs/PLANO_PRODUCAO.md` — auditoria medida + 6 sprints
- `docs/SPRINT_UX_ANTIGRAVITY.md` — plano UX detalhado
- `docs/GUIA_SUPABASE.md` · `docs/INFRASTRUCTURE.md`

---

## 6. GAPS REAIS (confirmados)

| # | Gap | Impacto |
|---|---|---|
| 1 | `LIB77_TOKEN` sumiu do `.env` | importar template novo falha; os 2 em cache funcionam |
| 2 | CRM, projetos e faturamento ainda em `localStorage` | some ao limpar cache; tabela `sites` existe e não é usada |
| 3 | Sem rate limit em `/api/leads/scan` | qualquer um queima a cota do Places |
| 4 | `/api/site/clone` não clona | devolve schema fixo |
| 5 | Comentários do `LeadCard` citam `ElectricBorder` | foi trocado por `Cyber3DCard` no commit `46b25d7` |
| 6 | `dispose()` de recursos WebGL ausente | vaza memória de GPU na troca de rota |
| 7 | 619 cores hex e 862 estilos inline | trocar identidade visual custa 619 edições |
| 8 | 0 `aria-label`, 0 `role` | sites gerados herdam e não indexam |

---

## 7. PRÓXIMA TAREFA

**Trocar o fundo da tela de login.** Hoje ela usa o `FaultyTerminal` verde,
o mesmo do app inteiro — o dono quer algo distinto para a entrada.

Disponíveis no catálogo (`npm run build:index` reindexa):
- **Luz (12):** `beams` · `light_rays` · `orb` · `prism` · `aurora` ·
  `light_pillar` · `prismatic_burst` · `side_rays`
- **Fluido (13):** `silk` · `liquid_ether` · `plasma` · `line_waves` ·
  `ferrofluid`

Materializar: o código está em
`D:\Site Pack Assets\Backgrounds Animations\*.txt`, seção
`### Full Component Source` → copiar para `src/components/ui/<Nome>.jsx` →
registrar em `src/components/ui/registry.js`.

Arquivo a editar: `src/views/LoginView.jsx` (o `FaultyTerminal` está no
bloco de fundo, com `opacity: 0.3`).

**Perguntar ao dono qual efeito antes de implementar.**

---

## 8. COMANDOS

```bash
npm run dev                    # frontend :3000
python backend/app_api.py      # backend :8000 (demora ~5s para subir)
npm run build
python backend/test_api.py
python scripts/e2e_smoke.py
npm run build:index            # reindexa o catálogo de componentes
```

## 9. VERIFICAÇÃO DE MOBILE

Colar no console do navegador, em 375px:

```js
(async () => {
  const t = document.documentElement.clientWidth, m = document.querySelector('main');
  const abrir = () => document.querySelector('button[aria-label*="Abrir menu"]');
  const abas = () => [...document.querySelector('aside nav').querySelectorAll('button')];
  let estouros = 0, pequenos = 0, total = 0, falhas = 0;
  for (let i = 0; i < 11; i++) {
    abrir()?.click(); await new Promise(r => setTimeout(r, 280));
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
  console.log({ estouros, alvosPequenos: `${pequenos}/${total}`, falhas,
    scrollH: document.body.scrollWidth > t + 2 });
})()
```

**Referência atual:** `estouros: 0` · `alvosPequenos: 0/170` · `falhas: 0` ·
`scrollH: false`

---

## 10. LIMITAÇÃO DO AMBIENTE

Quando o painel do navegador está oculto, **`requestAnimationFrame` não
dispara** (medido: 0 frames em 500ms). Isso congela framer-motion,
transições CSS e eventos de `matchMedia`.

Consequência prática: **animação não é verificável por script** nesse
estado. Verifique montagem, estilo computado e estrutura do DOM; para
confirmar movimento, peça ao dono para olhar na tela.

Não persiga "animação não funciona" por script — quase sempre é isto.
