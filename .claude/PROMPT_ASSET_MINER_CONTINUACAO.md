Continuação do prompt do minerador de assets...

 TIPOS (elemento visual):
 - button, card, navbar, footer, hero, form, modal, animation
 - background, icon, logo, color-palette, gradient, font

 TAGS (atributos):
 - modern, minimal, dark, light, colorful, animated
 - responsive, accessible, fast, seo-friendly
 - restaurant, barbershop, petshop, cafe, bakery

═══════════════════════════════════════════════════════════
7. ESTRATÉGIA DE MINERAÇÃO
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
- V0.app (React app): Usar Playwright/Puppeteer
- 3D websites: Scrape de Three.js examples
- Superscene: Scrape de cenas 3D

═══════════════════════════════════════════════════════════
8. SISTEMA DE NOMENCLATURA
═══════════════════════════════════════════════════════════

TEMPLATES:
- {source}_{niche}_{id}
- Exemplo: v0_restaurant_001, originkit_barbershop_003

COMPONENTES:
- {category}_{subcategory}_{id}
- Exemplo: button_cta_001, navbar_modern_007

ASSETS:
- {type}_{niche}_{id}
- Exemplo: hero_restaurant_001, icon_food_012

═══════════════════════════════════════════════════════════
9. CRITÉRIOS DE QUALIDADE (TODOS OS ASSETS DEVEM PASSAR)
═══════════════════════════════════════════════════════════

CÓDIGO:
✅ HTML válido (W3C validator)
✅ CSS sem erros de sintaxe
✅ JavaScript sem erros de console
✅ Responsivo (mobile-first)
✅ Sem dependências quebradas

DESIGN:
✅ Acessibilidade WCAG 2.1 (mínimo AA)
✅ Performance > 90 (Lighthouse)
✅ Design moderno (não anos 2000)
✅ Boa legibilidade
✅ Contraste adequado

LEGAL:
✅ Licença permissiva (MIT, Apache, CC0)
✅ Autor visível nos metadados
✅ Link para fonte original
✅ Não remove direitos autorais

═══════════════════════════════════════════════════════════
10. ENTREGÁVEIS DO SISTEMA
═══════════════════════════════════════════════════════════

A) SCRIPTS DE MINERAÇÃO:
1. `backend/scripts/miner.py` (PRINCIPAL)
   - Classe AssetMiner
   - Métodos por plataforma: mine_v0(), mine_originkit(), mine_uiverse()
   - Métodos auxiliares: download_file(), extract_metadata(), sanitize_html()
   - CLI interface: `python miner.py --source v0 --type template --niche restaurant`

2. `backend/scripts/miner_config.json` (CONFIG)
   - Lista de fontes para minerar
   - Tokens/API keys (para fontes que precisam)
   - Filtros de qualidade
   - Rate limits

B) BANCO DE DADOS:
1. `backend/data/asset_library/` (ESTRUTURA COMPLETA)
   - /templates/ (organizado por fonte)
   - /components/ (organizado por tipo)
   - /assets/ (imagens, ícones, cores, fontes)
   - /registry/ (índices JSON)

C) DOCUMENTAÇÃO:
1. `docs/ASSET_MINER_GUIDE.md`
   - Como rodar o minerador
   - Como adicionar nova fonte
   - Como catalogar assets
   - Como usar assets no template engine

2. `docs/ASSET_LIBRARY_USAGE.md`
   - Como buscar assets por nicho
   - Como combinar componentes
   - Como aplicar assets nos templates

═══════════════════════════════════════════════════════════
11. FLUXO DE MINERAÇÃO (PASSO A PASSO)
═══════════════════════════════════════════════════════════

1. MINERADOR INICIA
   ↓
2. LÊ miner_config.json (quais fontes minerar)
   ↓
3. PARA CADA FONTE:
   a. Conecta na plataforma
   b. Lista todos os assets disponíveis
   c. Filtra por qualidade (performance, acessibilidade)
   d. Download dos arquivos (HTML/CSS/JS/images)
   e. Extrai metadados (autor, licença, tags)
   f. Sanitiza código (remove código malicioso)
   g. Salva em estrutura de pastas organizada
   h. Atualiza índice (registry/templates_index.json)
   ↓
4. VALIDAÇÃO FINAL:
   a. Verifica se todos assets foram baixados
   b. Verifica integridade dos arquivos
   c. Gera relatório de mineração
   ↓
5. PRONTO PARA USAR no Template Engine

═══════════════════════════════════════════════════════════
12. IMPLEMENTAÇÃO TURBO (7 DIAS)
═══════════════════════════════════════════════════════════

DIA 1 - Fundação:
1. Criar estrutura de pastas (asset_library/)
2. Criar miner_config.json com 5 fontes fáceis
3. Criar classe AssetMiner base
4. Implementar miner_v0() (fonte mais fácil)
5. Testar: minerar 1 template do v0

DIA 2 - Scrapers Básicos:
1. Implementar mine_originkit()
2. Implementar mine_inspira_ui()
3. Implementar mine_uiverse()
4. Testar: minerar 10 componentes de cada
5. Validar estrutura de pastas

DIA 3 - Scrapers Avançados:
1. Implementar mine_reactbits()
2. Implementar mine_magicui()
3. Implementar mine_shadcn()
4. Testar: minerar animações e componentes complexos
5. Catalogar todos os assets

DIA 4 - Assets Visuais:
1. Implementar download de imagens (hero backgrounds)
2. Implementar download de ícones
3. Implementar download de paletas de cores
4. Organizar por nicho
5. Criar gradientes úteis

DIA 5 - Sistema de Índices:
1. Criar templates_index.json
2. Criar components_index.json
3. Criar assets_index.json
4. Implementar busca por nicho/tag
5. Implementar busca por tecnologia

DIA 6 - Qualidade e Validação:
1. Implementar validação HTML/CSS/JS
2. Implementar verificação de licenças
3. Implementar sanitização de código
4. Testar todos os assets minerados
5. Gerar relatório de qualidade

DIA 7 - Documentação e Deploy:
1. Documentar como usar o sistema
2. Criar guia de mineração
3. Automatizar com cron job
4. Testar sistema completo
5. Deploy em produção

═══════════════════════════════════════════════════════════
13. COMANDOS PARA EXECUTAR
═══════════════════════════════════════════════════════════

# Minerar TODAS as fontes:
python backend/scripts/miner.py --all

# Minerar fonte específica:
python backend/scripts/miner.py --source v0

# Minerar tipo específico:
python backend/scripts/miner.py --source v0 --type template --niche restaurant

# Listar assets disponíveis:
python backend/scripts/miner.py --list templates --niche restaurant

# Validar assets:
python backend/scripts/miner.py --validate

# Gerar relatório:
python backend/scripts/miner.py --report

═══════════════════════════════════════════════════════════
14. MANDAMENTOS DO MINERADOR
═══════════════════════════════════════════════════════════

1. NUNCA minerar sem verificar licença
2. NUNCA remover créditos/autores
3. NUNCA baixar código malicioso
4. SEMPRE sanitizar HTML/CSS/JS baixado
5. SEMPRE documentar fonte original
6. SEMPRE respeitar robots.txt
7. SEMPRE implementar rate limiting
8. SEMPRE validar qualidade antes de adicionar ao banco

═══════════════════════════════════════════════════════════
15. PRÓXIMOS PASSOS APÓS MINERAÇÃO
═══════════════════════════════════════════════════════════

Após ter o banco de assets minerado:

1. Template Engine (FASE 2):
   - Usar templates da pasta /templates/
   - Combinar componentes da pasta /components/
   - Aplicar assets da pasta /assets/

2. Sistema de Montagem (FASE 3):
   - Escolher template base
   - Escolher componentes adicionais
   - Aplicar assets visuais
   - Resultado: site único para cada lead

3. IA Generativa (FASE 4 - FUTURO):
   - Usar LLM para escolher melhor template
   - Usar LLM para gerar texto personalizado
   - Usar LLM para sugerir melhorias

═══════════════════════════════════════════════════════════

AGORA VOCÊ ESTÁ NO CONTROLE.

PRÓXIMO PASSO IMEDIATO:
1. Leia este prompt COMPLETAMENTE
2. Verifique as fontes listadas (quais são prioritárias)
3. Me apresente um RESUMO EXECUTIVO (3-5 linhas)
4. Aguarde minha aprovação para criar o plano de implementação

NÃO altere NADA ainda. Só ANALISE e REPORT.

═══════════════════════════════════════════════════════════
```

---

## 🎯 COMO USAR ESSE PROMPT:

1. **Copie TODO o bloco acima** (de 🚀 até a última linha tracejada)
2. **Abra o Claude Opus 5**
3. **Configure o projeto** como raiz: `c:\Users\Victor Ads\Documents\SCRAPER HACKING`
4. **Cole o prompt** e envie
5. **O Claude Opus 5 vai:**
   - Analisar as plataformas alvo
   - Criar arquitetura do minerador
   - Implementar scripts de scraping
   - Catalogar todos os assets
   - Criar documentação completa

## ⚡ BENEFÍCIO FINAL:

Você terá um **banco de assets próprio** com:
- Templates modernos de v0.app, originkit, shadcn
- Componentes de magicui, inspira-ui, reactbits
- Animações de framer motion, GSAP
- Ícones, logos, cores, fontes
- Tudo catalogado e pronto para usar

**Isso significa:** Geradores de sites variados sem precisar criar template do zero.

---

**Pronto? Copie o prompt e cole no Claude Opus 5.** 🚀