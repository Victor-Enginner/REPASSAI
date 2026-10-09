# REPASS — ponto de retorno, 30/09/2026

Leia este documento e ARCHITECTURE.md antes de alterar o projeto.

## Correção de referência aprovada pelo usuário

Os nomes devem seguir a imagem: Principal = Dashboard, Atendimentos, CRM, Contatos, Relatórios, Disparos. Automação & IA = Fluxos, Automações, Base de Conhecimento, Formulários, Prospector. Depois vem Ajustes · Workspace. Canais usa nome curto. Não renomear Disparos para Abordagem ou Disparos & Campanhas. Rotas permanecem iguais. As remoções anteriores continuam válidas, incluindo Tags; os módulos adicionais REPASS ficam abaixo dos grupos da referência. A nova ordem padrão usa repass.sidebar.order.v3; personalizações antigas continuam armazenadas na v2, sem serem aplicadas à nova organização.

## Decisões preservadas

- React 18/Vite, Python no Render, frontend Netlify e dados Supabase.
- Sidebar Liquid Glass com tema claro/escuro, sans legível e nomes sem números.
- Atendimentos (`atendimentos`) abre conversas. Disparos & Campanhas (`disparos`) abre campanhas WhatsApp. Não unir as funções nem trocar seus IDs.
- Grupos: Principal, Automação & IA, Sites & Templates, Gestão & Crescimento, Ajustes · Workspace, Ajustes · Sistema e Motor Neural.
- Motor Neural é a última opção fixa; demais abas aceitam arraste entre grupos, alça touch, Alt+setas / Alt+Shift+setas, restauração e ordem salva em repass.sidebar.order.v2.
- Papéis & Permissões, IA & Conhecimento, Campos Personalizados e Tags & Segmentos estão ocultos no menu e busca; telas e dados preservados.
- Busca deve usar os mesmos nomes do menu. Referências do professor orientam hierarquia, sem copiar sua interface ou confundir suas funções com as do REPASS.

## Responsáveis

Sidebar.jsx: navegação e interação; SidebarGlass.css: apresentação isolada; sidebarOrder.js: ordenação; themes.css: cores; CommandPalette.jsx: busca; App.jsx: montagem das views. Não reescrever telas internas para corrigir a sidebar.

## Produção

Último deploy publicado antes deste checkpoint: 6abcb921f6b2931c390070ce, https://repass-ai-beta.netlify.app/. API: https://repassai.onrender.com/.

Usar `netlify deploy --prod --build --context production`. O build:netlify gera proxy /api antes do fallback SPA, com REPASS_BACKEND_ORIGIN do contexto production. Build simples não gera o proxy.

Health/auth: 200 JSON; leads/sites sem sessão: 401 JSON; landing/login carregaram no Chromium. Operações autenticadas e stream de logs precisam de prova. Views com dados demonstrativos ainda existem: aparência não comprova integração.

Ajustes finais de nomes e tipografia deste checkpoint são locais até aprovação de publicação.

## Salvar e recuperar

Execute `powershell -File scripts/salvar-checkpoint.ps1`. Cada execução cria backups/checkpoint-data-hora com histórico Git (historico.bundle), estado atual de arquivos inclusive não commitados (projeto-atual.zip) e manifesto SHA-256. O script verifica bundle e estrutura do ZIP.

Para recuperar: crie outra pasta, clone historico.bundle e extraia projeto-atual.zip sobre essa cópia; confira manifesto.json, configure segredos e execute npm ci. Compare arquivos ausentes no ZIP antes de restaurar itens antigos do bundle. Não sobrescreva o checkout atual automaticamente.

Não inclui segredos, dependências, caches, worktrees auxiliares, backend/data nem banco Supabase. O bundle é um histórico privado local: não compartilhá-lo sem revisão. Backups de banco/configuração dos provedores são separados.

## Verificação

Antes de publicar: verificar-sidebar-drag.mjs, verificar-sidebar-tema.mjs, tests/sidebarOrder.test.mjs e npm run build. Depois do deploy: validar frontend e API no domínio publicado.
