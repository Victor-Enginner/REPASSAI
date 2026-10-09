# REPASS: direção de produto e checkpoint

## Decisão direta do usuário

REPASS passa a ter foco exclusivo na criação de sites. Os agentes de prospecção/escritório pertencem ao outro projeto. Não migrar ou alterar esse projeto. A retirada de abas do REPASS será gradual e dependerá da confirmação explícita do usuário para cada grupo; nenhuma aba foi removida nesta etapa.

## Fontes estudadas

Em Site Pack Assets: prompt RECUPERAÇÃO DO REPASS PARA GERADOR DE SITES COMPLEXO PROCEDURAL POR BANCO DE DADOS DE COMPONENETES E TEMPALTES MCPS CONECCETS.txt; PIPELINE OPERACIONAL PARA AGENTES.MD; CINEMATIC-3D-WEBSITES-KNOWLEDGE.md; DEEPSEEK.WEBSITES.3D.md; deepseek.websites.3d2.md; Execução, orquestração e QA.md; MANUS.AI.WEBSITES.3D.md.

São referências de arquitetura e pesquisa, não prova de implementação nem autorização automática para instalar servidores MCP, publicar ou alterar credenciais. As alegações sobre sites de terceiros e pacotes nelas citados ainda precisam de verificação antes de adoção.

## Síntese aplicável

Briefing e intenção → busca de templates/componentes com licença e proveniência → narrativa e conteúdo → design tokens → plano de assets → composição modular → validação determinística → reparo limitado → build em sandbox → QA visual/funcional/acessibilidade/performance → exportação ou publicação confirmada.

- Persistir entradas, decisões, tentativas, testes e artefatos de cada fase.
- Preservar layout, copy e assets originais dos templates durante a primeira validação.
- Separar biblioteca de componentes, templates completos e projetos que precisam de build.
- 3D somente quando houver interação ou objetivo narrativo; DOM semântico para texto, formulários e CTAs.
- Contrato de componente: desktop, touch, teclado, reduced-motion, loading, erro, assets e fallback sem WebGL.
- Controle de custos e recursos: orçamento por tarefa, concorrência limitada, prazo máximo e poucas tentativas de reparo.
- Código gerado/importado não recebe segredos do REPASS nem acesso ao host, banco ou sessão.

## Ressalvas dos estudos

- Não adotar como regra os absolutos “uma landing page nunca tem menu”, “um único canvas/timeline sempre” ou “nunca Lenis com pin”. São escolhas que precisam de contexto e teste.
- Não tratar Apple Vision Pro como prova de interface puramente WebGL. Acessibilidade e conteúdo DOM continuam necessários.
- O exemplo de sandbox tem rede desabilitada e instalação de dependências: essas fases precisam ser separadas e a aquisição usar allowlist controlada. Os exemplos Docker não constituem executor pronto.
- Pacotes MCP e versões do prompt são sugestões não verificadas. Nenhum MCP foi instalado neste checkpoint.
- Metas de FPS/Lighthouse são critérios a medir, não garantias automáticas.

## Implementação desta etapa

- Loja local: aba Site Pack com 14 itens em validação, busca, análise resumida e estados explícitos de pendência.
- Pacote background-animations-2: preview HTML em iframe sem same-origin, sem formulários/popups, CSP bloqueando conexões a APIs. Servido por rota fixa exclusiva do servidor de desenvolvimento, nunca pelo backend autenticado. A versão de preview usa Three.js 0.160 como módulo (o script global original não carregou), limita o título no mobile e respeita reduced-motion; originais extraídos intactos.
- Seletor de preview: 390×844, 768×1024, 1360×768 e 1920×1080. A rolagem horizontal de um preview largo fica confinada ao seu painel.
- Área experimental somente em desenvolvimento; não disponibilizar como template aprovado ou geração funcional.
- 13 projetos Next.js não executados: Docker não está instalado/disponível no ambiente atual. Não instalar nem executar scripts dos ZIPs diretamente no host.
- Nenhum deploy, push, exclusão de abas ou alteração de autenticação/pagamento nesta etapa.

## Evidências de QA

- Build de produção passou; a área Site Pack e seu código de preview ficaram fora dos artefatos finais.
- Teste de interface com API simulada confirmou 14 cards, detalhe Next.js pendente e iframe com sandbox allow-scripts sem same-origin.
- Pacote HTML renderizou canvas em 390×844, 768×1024, 1360×768 e 1920×1080, sem overflow do documento do template ou do REPASS.
- Screenshots mobile e desktop inspecionados; efeito e texto visíveis. O dock global do REPASS sobrepõe uma faixa do conteúdo na captura mobile: permanece como pendência da interface global.
- Resultado: `docs/QA_SITE_PACK_2026-10-05.json`; capturas `docs/site-pack-mobile.png`, `docs/site-pack-tablet.png`, `docs/site-pack-notebook.png`, `docs/site-pack-desktop.png`.
- Não medidos: FPS, Web Vitals, acessibilidade completa, redução de movimento em dispositivo real. Não testados visualmente: os 13 projetos Next.js. Não validada: integração com backend real ou produção.

## Próximas etapas, com estados claros

1. Disponibilizar sandbox de build, revisar dependências/lockfiles e executar um projeto Next.js por vez, sem segredos.
2. Conectar previews isolados e screenshots ao catálogo; testar desktop/mobile/reduced-motion e documentar falhas.
3. Usuário confirma quais abas retirar. Atualizar navegação, atalhos e rotas de maneira coerente, preservando dados.
4. Mapear gerador existente e implementar o pipeline progressivamente. Este documento é direção, não alegação de que o gerador procedural já existe.
