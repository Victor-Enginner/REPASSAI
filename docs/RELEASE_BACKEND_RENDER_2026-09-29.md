# REPASS — liberação controlada do backend no Render

Estado observado em 29/09/2026:

- Render `REPASSAI` usa `Victor-Enginner/REPASSAI`, branch `master`, commit `c4a339f`.
- O código local está em `codex/repass-infrastructure-foundation`, commit `bd9d469`, 56 commits à frente do ancestral `c4a339f`, com alterações não commitadas de várias origens.
- Netlify já encaminha `/api/*` para `https://repassai.onrender.com`; health e auth/status retornaram JSON.
- `/api/sites` no Render antigo retorna 404; no backend local a rota exige sessão e deveria responder 401 sem login.

## Portões antes de alterar produção

1. Verificar no Supabase de produção a existência das tabelas `perfis`, `leads`, `sites`, `site_versoes` e das RPCs `consumir_varredura_atomica` e `consumir_site_atomico`. A mudança de schema/policies exige revisão humana antes de executar SQL de produção. Referências: `supabase/schema.sql` e `supabase/migrations/20260810_cota_atomica.sql`.
2. Criar uma branch de release a partir de `origin/master` contendo apenas os arquivos necessários de backend, Dockerfile, requirements e migrations revisadas. Não empurrar a branch local inteira nem as alterações não commitadas para `master`.
3. Rodar testes offline de auth, ownership e cotas nessa branch, além de build Docker com `backend/Dockerfile` no contexto da raiz.
4. Publicar a branch de release no repositório que o Render realmente usa. Alterar a branch do serviço Render só depois da revisão dos passos anteriores.
5. Confirmar o deploy no Render: `/api/health` 200 JSON, `/api/auth/status` 200 JSON com multiusuário ativo, `/api/sites` sem sessão 401 JSON e com sessão válida 200 JSON. Repetir pelo domínio Netlify.
6. Fazer teste autenticado de leitura e escrita com conta de teste antes de declarar CRM e sites persistentes. Não usar credenciais reais em logs ou scripts.

## Validação já feita

- `python -m unittest backend.test_api.TestCotasAtomicas -q`: 2 testes passaram.
- Suíte completa `backend.test_api` não concluiu neste ambiente: Playwright e chamadas HTTP externas foram bloqueados pela rede/sandbox. Isto não é aprovação da suíte.
- Consulta visual enviada pelo usuário confirmou as quatro tabelas e as duas RPCs listadas acima no Supabase de produção. Isto não verifica colunas, grants nem políticas.
- Worktree isolada: `.release-worktrees/render-backend`, branch `codex/render-backend-release`, commit `56b75eb` (30 arquivos de backend, sem dados gerados e sem mudanças não commitadas do frontend).
- `python -m compileall -q backend` e import de `app_api` passaram nessa branch.
- 18 testes offline focados em auth, sessão, cotas, rate limit e isolamento de leads passaram sem skips.
- Docker não está instalado neste host; a imagem ainda não foi construída localmente.
- O primeiro `git push` foi bloqueado pelo auto-review. Após autorização explícita do usuário, `git push -u origin codex/render-backend-release` concluiu: a branch de release está no GitHub `Victor-Enginner/REPASSAI`, commit `56b75eb`; `master` não foi alterada.
- A ferramenta de navegador falhou ao iniciar neste ambiente; a troca de branch não foi observada diretamente no painel do Render. A verificação HTTP posterior mostrou o comportamento das rotas novas, mas não identifica o hash do commit publicado.
- Verificação HTTP posterior: Render `/api/health` 200 JSON; `/api/auth/status` 200 JSON com `modo=multiusuario`, `auth_ativo=true`, `configurado=true`; `/api/sites` e `/api/leads` 401 JSON sem sessão. Netlify devolve os mesmos 401 e `/api/health` 200 JSON. Isto comprova que o backend com as rotas protegidas está no ar, mas não comprova o hash do commit nem leitura autenticada no Supabase.

Não ativar `REPASS_DEV_SINGLE_USER` em produção. Não executar `supabase/schema.sql` integralmente às cegas em banco existente: revisar o diff/policies e aplicar apenas migração necessária.
