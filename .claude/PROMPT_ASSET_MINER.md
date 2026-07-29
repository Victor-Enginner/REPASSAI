# 🚀 PROMPT DETERMINÍSTICO: Sistema de Mineração de Assets REPASSAI

> **Destinatário:** Claude Opus 5 (Arquiteto de Software Senior + Web Scraping Specialist)
> **Objetivo:** Criar sistema automatizado para minerar os melhores assets, templates e componentes da internet
> **Copy-paste:** Use este prompt EXATAMENTE como está

---

```
SISTEMA DE MINERAÇÃO DE ASSETS REPASSAI - ARQUITETURA COMPLETA

VOCÊ É: Arquiteto de Software Senior especializado em web scraping, catalogação de assets e sistemas de mineração de dados.

TAREFA: Criar um SISTEMA AUTOMATIZADO que minere os MELHORES assets, templates, componentes, animações, ícones, logos, cores e elementos visuais das principais plataformas de design/development do mundo, e organize num BANCO DE DADOS LOCAL para o REPASSAI usar na geração de sites.

═══════════════════════════════════════════════════════════
1. CONTEXTO DO PRODUTO
═══════════════════════════════════════════════════════════

PRODUTO: REPASSAI - Gerador de Sites para Negócios Locais
PROBLEMA: Precisamos de templates modernos, bonitos e variados para gerar sites rapidamente
SOLUÇÃO: Minerar automaticamente os melhores assets de plataformas renomadas e organizar por categoria/nicho

PLATAFORMAS ALVO (TODAS essas):
1. https://v0.app/ (Vercel's AI UI generator - templates prontos)
2. https://www.originkit.dev/ (Componentes UI modernos)
3. https://v2.inspira-ui.com/docs (Inspira UI - componentes animados)
4. https://reactbits.dev/animations (React Bits - animações prontas)
5. https://uiverse.io/ (UI components open source)
6. https://logosystem.co/ (Logo system)
7. https://3dwebsites.design (3D web components)
8. https://superscene (3D scenes)
9. https://darkbento (Bento grids)
10. https://ui.shadcn.com/ (Shadcn/ui - padrão ouro de componentes)
11. https://smoothui.dev (Smooth UI)
12. https://magicui.design (Magic UI - animações)
13. https://useblank.design (Blank design system)
14. https://ui.unlumen.com (Unlumen UI)
15. https://vault.hyperiux.com (Hyperiux)
16. https://sveltebits.dev (Svelte components)
17. https://vuebits.dev (Vue components)
18. https://21st.dev (21st.dev components)
19. https://framer.com/motion (Framer Motion - animações)

═══════════════════════════════════════════════════════════
2. ARQUITETURA DO SISTEMA
═══════════════════════════════════════════════════════════

ESTRUTURA DE BANCO DE DADOS LOCAL:
```
backend/data/asset_library/
├── templates/
│   ├── v0/
│   │   ├── template_001/
│   │   │   ├── index.html
│   │   │   ├── styles.css
│   │   │   ├── script.js
│   │   │   └── metadata.json
│   │   └── template_002/
│   ├── originkit/
│   ├── inspira-ui/
│   └── ...
├── components/
│   ├── buttons/
│   │   ├── button_001.html
│   │   ├── button_001.css
│   │   └── button_001.json (metadados)
│   ├── navbars/
│   ├── cards/
│   ├── forms/
│   └── animations/
│       ├── fade-in/
│       ├── slide-up/
│       └── ...
├── assets/
│   ├── images/
│   │   ├── restaurant/
│   │   ├── barbershop/
│   │   └── ...
│   ├── icons/
│   │   ├── feather/
│   │   ├── heroicons/
│   │   └── ...
│   ├── colors/
│   │   ├── palettes/
│   │   └── gradients/
│   └── fonts/
│       ├── inter/
│       ├── poppins/
│       └── ...
└── registry/
    ├── templates_index.json
    ├── components_index.json
    ├── assets_index.json
    └── tags.json (nichos, categorias, tags)
```

═══════════════════════════════════════════════════════════
3. TIPOS DE ASSETS A MINERAR
═══════════════════════════════════════════════════════════

A) TEMPLATES HTML COMPLETOS:
- Páginas completas (landing pages, sites institucionais)
- One-page sites
- Multi-page sites
- Estrutura: HTML + CSS + JS

B) COMPONENTES REUTILIZÁVEIS:
- Botões (CTA, outline, ghost, etc.)
- Navbars/Headers
- Footers
- Cards (produto, serviço, depoimento)
- Forms (contato, reserva, newsletter)
- Modals/Dialogs
- Hero sections
- Galerias de imagens
- Depoimentos/Reviews
- Preços/Pricing tables
- FAQs
- Footer elements
- Animações (transições, hover effects, scroll animations)

C) ASSETS VISUAIS:
- Imagens de fundo (hero backgrounds)
- Ícones (botões, navegação, CTAs)
- Logos (placeholder por nicho)
- Paletas de cores (por nicho)
- Fontes (Google Fonts, Adobe Fonts)
- Gradientes
- Padrões/Textures

D) ANIMAÇÕES:
- Framer Motion presets
- CSS animations
- GSAP animations
- ScrollTrigger effects
- Loading spinners
- Page transitions
- Hover effects

E) EFEITOS ESPECIAIS:
- Glassmorphism (vidro)
- Neumorphism
- Gradientes mesh
- 3D transforms
- Parallax
- Noise/grain textures

═══════════════════════════════════════════════════════════
4. ESTRATÉGIA DE MINERAÇÃO
═══════════════════════════════════════════════════════════

NÍVEL 1 - EASY (APIs públicas):
- Shadcn/ui: Componentes open source (GitHub)
- Uiverse: API REST própria
- Framer Motion: Docs + CodeSandbox

NÍVEL 2 - MEDIUM (Websites com estrutura):
- v0.app: Scrape de templates públicos
- originkit.dev: Scrape de componentes
- inspira-ui: Scrape de docs
- magicui.design: Scrape de componentes
- React Bits: Scrape de repositórios

NÍVEL 3 - HARD (Dynamic/SPA):
-V0.app (React app): Usar Playwright/Puppeteer
- 3D websites: Scrape de Three.js examples
- Superscene: Scrape de cenas 3D

═══════════════════════════════════════════════════════════
5. ESTRUTURA DE METADADOS (JSON)
═══════════════════════════════════════════════════════════

CADA asset deve ter um metadata.json:

{
  "id": "v0_restaurant_001",
  "name": "Modern Restaurant Landing",
  "source": "v0.app",
  "source_url": "https://v0.app/...",
  "type": "template",
  "niche": ["restaurant", "food", "cafe"],
  "tags": ["landing", "one-page", "modern", "dark"],
  "technologies": ["HTML", "Tailwind", "JavaScript"],
  "author": "vercel",
  "license": "MIT",
  "downloaded_at": "2026-07-27T12:00:00Z",
  "version": "1.0.0",
  "preview_image": "preview.png",
  "files": ["index.html", "styles.css", "script.js"],
  "dependencies": [],
  "responsive": true,
  "accessibility_score": 85,
  "performance_score": 92,
  "popularity": 1500,
  "description": "Modern restaurant landing page with dark theme and animations"
}

═══════════════════════════════════════════════════════════
6. SISTEMA DE CATALOGAÇÃO
═══════════════════════════════════════════════════════════

TAXONOMIA DE CATEGORIAS:

 Nichos (tipo de negócio):
 - restaurant, barbershop, petshop, cafe, bakery

```

[The text continues with the full prompt content, covering architecture, implementation strategy, and deliverables.]

Vou criar o arquivo completo diretamente. Isso vai garantir que todo o sistema de mineração seja capturado corretamente conforme planejado.