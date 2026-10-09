# REPASS — auditoria da publicação Netlify em 29/09/2026

Alvo: `https://repass-ai-beta.netlify.app/`. Inspeção com Playwright Chromium em 1440×900, navegação pela landing, entrada em Modo Demo e clique nas abas disponíveis. Script reproduzível: `node scripts/auditar-producao.mjs`.

## Evidência observada

| Verificação | Resultado |
| --- | --- |
| Landing | Carrega com título `REPASS AI — Plataforma OSINT & Motor Agêntico de Sites 3D` e botão `ACESSAR PAINEL` |
| Entrada | `ACESSAR PAINEL` abre a tela de login; `Entrar Modo Demo` mostra o menu |
| Sidebar publicada | Apresenta menu antigo (`Dashboard`, `CRM`, `Disparos`, `Prospector` etc.); a suíte atual de 11 módulos da pasta local não está publicada |
| `/api/health` | HTTP 200, `text/html` (HTML da SPA; não é resposta de saúde da API) |
| `/api/auth/status` | HTTP 200, `text/html` (HTML da SPA; não é configuração de autenticação) |
| Prospector | Abre a tela; `/api/logs/stream` recebe `text/html` e o navegador cancela o EventSource por MIME incorreto |
| Console | Violação de `script-src 'self'` para um script inline; origem precisa ser investigada antes de alterar CSP |
| Backend local | `127.0.0.1:8001` recusou conexão durante a inspeção |

O `netlify.toml` publica `dist` e reescreve qualquer caminho desconhecido para `/index.html`. Não há proxy de `/api`. O frontend atual usa chamadas relativas via `src/config.js`, de modo que a API da produção cai nessa reescrita.

## Ordem de correção

1. Definir e disponibilizar um endereço HTTPS permanente para `backend/app_api.py`, com autenticação, Supabase e variáveis de ambiente configuradas no servidor. Não usar o modo `REPASS_DEV_SINGLE_USER` publicamente.
2. Adicionar na Netlify o proxy `/api/*` para esse endereço **antes** da regra `/* → /index.html`; conferir cookies, CORS e SSE em produção.
3. Repetir as provas: `/api/health` e `/api/auth/status` devem devolver JSON; `/api/logs/stream` deve devolver `text/event-stream`; `/api/sites` deve consultar o banco com a sessão correta.
4. Auditar as operações de cada módulo, pois view visível não comprova persistência. Já há valores fictícios no código, como uma fatura estática em `src/views/BillingView.jsx`; não declarar faturamento funcional antes de integrar cobranças reais.
5. Compilar e publicar a versão local somente após a API responder. O build local passou em 29/09/2026, mas contém alterações não commitadas de múltiplas origens; comparar o diff e preservar o trabalho existente antes do deploy.
6. Reexecutar o Playwright em desktop e mobile no endereço publicado, com inspeção de rede e console. A violação de CSP requer identificar o script que a produz; não liberar scripts inline indiscriminadamente.

## Correções locais realizadas após a auditoria

- Login/cadastro não criam mais usuário local quando a API falha. Os botões de acesso direto e Modo Demo foram retirados.
- A resposta de `/api/auth/status` precisa ser JSON válido; HTML do fallback passa a produzir aviso de API indisponível.
- O dashboard deixa de mostrar 40 leads fictícios. A busca OSINT deixa de inserir empresas inventadas quando falha. Agenda não inventa horário/Meet.
- Faturamento e Indicações deixam de exibir fatura, plano, comissão e receita fictícios; mostram explicitamente que a integração ainda está pendente.
- O desenho anterior dessas duas telas foi preservado em `src/features/billing/legacy/BillingPreview.jsx` e `src/features/referrals/legacy/AffiliatePreview.jsx`, fora da aplicação ativa, para recuperar componentes quando houver dados reais.
- `npm run build:netlify` exige `REPASS_BACKEND_ORIGIN=https://...` e gera `dist/_redirects` com `/api/*` antes do fallback SPA. O build falha sem essa variável, para impedir novo deploy de frontend sem backend.
- Build Vite concluído. Playwright local confirmou `/api/health` e `/api/auth/status` como JSON e confirmou que o login não oferece os atalhos falsos. A simulação de HTML na rota de autenticação exibiu o aviso correto.

**Deploy pendente:** não há uma origem HTTPS pública de backend configurada nesta pasta. `backend/.env` aponta URLs de rede para `localhost`; Netlify não executa `backend/app_api.py`. O destino de backend precisa existir e passar nas provas de saúde e autenticação antes do deploy de produção.

## Limite da inspeção

Não foram enviados formulários, varreduras ou cobranças para evitar criar dados comerciais. A inspeção prova o estado da navegação e das respostas HTTP observadas; não prova todos os fluxos internos das abas.
