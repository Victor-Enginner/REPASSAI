# REPASS — mapa operacional do código

Atualização de 30/09/2026: consulte `docs/CHECKPOINT_REPASS_2026-09-30.md` para decisões atuais, backup e recuperação. O proxy Netlify → Render já foi configurado e verificado; observações abaixo sobre sua ausência são históricas.

Estado verificado em 29/09/2026. Leia este arquivo antes de modificar uma aba. O projeto atual usa React 18 + Vite no frontend, Python em `backend/app_api.py` e Supabase para dados persistidos. A hospedagem Netlify, conforme `netlify.toml`, publica apenas `dist`.

## Caminho de uma ação

`src/components/Sidebar.jsx` seleciona um identificador de aba → `src/App.jsx` monta a view correspondente com `React.lazy` → a view chama `/api/...` pelo serviço apropriado → `backend/app_api.py` valida sessão e entrada e aciona o motor → Supabase/R2/serviço externo persiste ou executa a ação. Confirme todo o caminho antes de declarar uma função pronta.

## Donos dos módulos principais

| Módulo | View | Motor/estado existente |
| --- | --- | --- |
| Painel | `src/views/DashboardView.jsx` | dados recebidos de `App.jsx` e chamadas da API |
| Prospector | `src/views/LeadsView.jsx` | `/api/leads/scan`, `backend/places_engine.py`, `backend/osm_engine.py` |
| Funil de Vendas | `src/views/CRMView.jsx` | leads em `App.jsx`, `/api/leads/status`, Supabase |
| Abordagem 1-a-1 | `src/views/DisparosView.jsx` | canais/serviços de mensagem; conferir envio real por fluxo |
| Motor Neural | `src/views/AIEngineView.jsx` | `/api/ai/...`, `backend/llm_gateway.py` |
| Agenda | `src/views/AppointmentsView.jsx` | conferir persistência por operação |
| Meus Sites | `src/views/ProjectsView.jsx` | `/api/sites`, backend/R2 |
| Faturamento | `src/views/BillingView.jsx` | conferir cobrança real por operação |
| Indicações | `src/views/AffiliateView.jsx` | conferir persistência por operação |
| Loja de Templates | `src/views/TemplatesView.jsx` | `/api/templates`, `backend/templates_store.py` |
| Criar Site | `src/views/CreateSiteWizardView.jsx` | `/api/site/generate`, `backend/lib77_engine.py` |

As abas adicionais (atendimentos, automações, conhecimento, formulários, contatos, relatórios e ajustes) também fazem parte do produto. Não as remova durante a organização dos 11 módulos centrais.

## Regras para mudanças

1. Preserve as alterações locais e os dados de clientes. Não mova nem elimine arquivos antes de identificar imports, endpoints, migrações e consumidores.
2. Use `src/App.jsx` como composição de views, não como repositório de regras de negócio. Para cada melhoria, extraia estado e acesso à API para um hook ou módulo da funcionalidade; mantenha a view focada na apresentação. Faça isso incrementalmente, com uma aba por vez.
3. `src/components/Sidebar.jsx` e `src/components/CommandPalette.jsx` devem apontar para os mesmos IDs válidos em `App.jsx`. O ID `prospector` é convertido para `leads` na navegação atual.
4. Views pesadas são carregadas sob demanda. Evite pré-carregar todas as views; WebGL, editores e fluxos de mensagens devem montar somente quando necessário.
5. Não introduza leads, faturamento, acessos ou resultados de IA inventados. Em falha de API, mostre erro e preserve o estado anterior. Um `setTimeout` usado só para fechar uma notificação não representa processamento de backend.
6. Segredos ficam no servidor. Autentique e autorize toda rota com dados de usuário, valide a entrada no servidor e mantenha RLS nas tabelas de usuário. Nunca coloque chave privada em `VITE_*`.
7. Uma mudança visual segue os tokens de `src/theme/` e as capturas de referência do REPASS. Verifique tema claro/escuro e telas estreitas.
8. Uma mudança de deploy precisa cobrir frontend e API. O `netlify.toml` atual publica o frontend estático; `/api` exige um backend acessível e roteamento configurado. Não anuncie “backend real em produção” sem confirmar `/api/health` e `/api/auth/status` no domínio publicado.

## Migração planejada

O briefing pede Next.js 14/15, TypeScript e Tailwind. A base existente não usa essa stack. A migração deve ser uma iniciativa separada, com inventário de funções e dados, equivalência de rotas, hospedagem do backend e comparação visual antes de trocar o deploy. A pasta atual é a fonte de verdade enquanto isso.

## Lacunas conhecidas

`docs/ESTADO_REAL.md` é um levantamento de 11/08/2026, útil como histórico, mas precisa ser revalidado. A existência de uma view ou botão não prova integração real. A configuração atual da Netlify não encaminha `/api`. Faça auditoria das funções por módulo e registre evidência de cada operação antes de afirmar que os 11 estão completos.
