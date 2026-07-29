# REPASS AI — Landing page de vendas

Projeto **separado** do painel. Vive no mesmo repositório, mas não
compartilha build, dependências nem estilo com `src/`.

## Por que separado

O painel (`src/`) é React + Vite com **CSS puro e estilo inline**, e injetar
Tailwind lá quebra os componentes WebGL — é a regra 1 do projeto. Esta
landing é Next.js com Tailwind, e isso só é seguro porque os dois nunca se
misturam. **Não importe nada de `src/` aqui, nem daqui para lá.**

## Rodar

```bash
npm install --prefix landing
npm run dev --prefix landing
```

Sobe em <http://localhost:3100>. A porta 3000 é do painel — os dois rodam
juntos sem conflito.

## Deploy

Publicado na **Netlify**, em `repassaiapp.netlify.app`. Base directory:
`landing`.

O `@vercel/analytics` que vinha no template foi removido: ele buscava
`/_vercel/insights/script.js`, que só existe na Vercel, e dava 404 em toda
visita fora dela. Hoje o site não carrega nenhum script de analytics — se
quiser medir visitas, use o painel da própria Netlify.

Quando houver domínio próprio, aponte em Domain settings. Nada no código
precisa mudar.

## Estrutura das seções

Decisão do dono sobre onde cada linguagem visual entra:

| # | Seção | Visual |
|---|---|---|
| 1 | Hero | **do template** — vídeo dos cristais + nav flutuante |
| 2 | Plataforma | **do template** — bento com `arc.png`, só a copy é do REPASS |
| 3+ | Passos, telas, receita, CTA | **marca REPASS** — imagens de `public/brand/` |

## Vídeo do hero

Servido pelo próprio site, em `public/video/hero.mp4` (3,3 MB).

Ele vinha do blob da Vercel de onde o template veio — armazenamento de
terceiro. Com o site público, isso deixou de ser risco teórico: se o arquivo
sumisse de lá, o hero ficaria sem fundo para todos os visitantes, sem aviso.
Foi baixado para dentro do projeto.

**A página não faz nenhuma requisição externa.** Verificado no build (zero
URLs `http` no HTML gerado) e em execução (`recursosExternos: []`).

## Antes de publicar — dois placeholders travados de propósito

Ambos estão em `lib/config.ts`:

| Constante | Estado | O que fazer |
|---|---|---|
| `URL_PAINEL` | `null` | Trocar pela URL real do painel quando ele estiver no ar |
| `PRECOS_DEFINIDOS` | `false` | Virar `true` e montar a grade quando os planos estiverem fechados |

Enquanto `URL_PAINEL` é `null`, os botões "Acessar painel" aparecem
esmaecidos e **não** são links. Isso é intencional: o projeto já enviou
`sobresite.io` e `cdn.repass.ai` para clientes, ambos NXDOMAIN. Melhor um
botão inerte do que um link que não abre.

Enquanto `PRECOS_DEFINIDOS` é `false`, a seção de planos mostra um bloco
tracejado dizendo que não deve ser publicada assim.

## O que foi deixado de fora, e por quê

- **Depoimentos e contadores** (`12.000+ negócios`, `4,9/5`) — os números da
  referência são de outra empresa. Site novo não tem prova social ainda;
  inventar seria falsificar. Entram quando houver cliente real.
- **`live-agent-feed.tsx`** — o componente gera nomes e dados com
  `Math.random()`. Já houve incidente de telefone gerado por `random()`
  apontando para terceiro real. Não é usado.
- **Preços** — são do concorrente, não seus.

## Marca

Imagens em `public/brand/`, tiradas da pasta `REPASSAI/`:

- `glass-hero.jpg` — logo sobre vidro iridescente, fundo do hero
- `grad-1..4.jpg` — gradientes suaves, fundos de seção

Superfície é **branco-gelo** (`#F5F4F0`), não o escuro do painel. O verde
`#00FF9D` é cor de **dado** (estado ativo, métrica), não de identidade — por
isso não aparece como cor de marca aqui.

O logotipo em SVG ainda não existe no repositório: o wordmark é renderizado
como texto, com o tracking aberto da identidade. Quando o SVG aparecer, vale
trocar.

## Intro

`components/intro-animation.tsx` monta `RE PASS / A I` letra por letra
(stagger de 90ms, blur 36px→0), depois retrai a cortina. É o layout do hero
antigo, preservado. Quem tem `prefers-reduced-motion` pula a intro inteira.
