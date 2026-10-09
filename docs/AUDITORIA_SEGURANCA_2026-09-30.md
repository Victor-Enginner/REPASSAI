# Auditoria de segurança — REPASS — 30/09/2026

## Correções locais posteriores à auditoria

### Publicação confirmada posteriormente

Netlify produção: deploy `6abd15b5ede9da0ad13fe4f6`, https://repass-ai-beta.netlify.app. Backend enviado para `origin/codex/render-backend-release`, commit `a5b8210`, no repositório REPASSAI (nenhum push para Repass-Ai nem master). Verificação pública após publicação: Render e proxy Netlify `/api/auth/status` retornam 200, auth_ativo=true e Cache-Control no-store, private, comportamento desta correção. Quinze testes também passaram na worktree de release. Jornada do frontend publicado passou com API simulada via Playwright; logout Supabase com conta real não foi executado. O estado financeiro continua pendente; ver CONFIGURAR_APPMAX.md.

- Sidebar agora oferece Sair da conta para usuário autenticado, com estado de espera e erro explícito.
- Logout chama `/auth/v1/logout?scope=local`, usando token renovado quando necessário; não declara sucesso em falha de revogação. Cookies são apagados após confirmação ou refresh já inválido. Não encerra todos os dispositivos. JWT de acesso já emitido ainda pode ser válido até expirar.
- Logout bem-sucedido descarta estado local e recarrega a aplicação; outra aba recebe aviso de logout sem tokens no storage. Restauração BFCache força nova carga/validação; não é prova de ausência de todo flash de snapshot do navegador.
- Respostas JSON sempre usam `private, no-store`; consulta de auth no frontend usa `cache: no-store`.
- Logs de requisição não incluem query string.
- nanoid atualizado no lockfile para 3.3.19; npm audit passou a zero achados.
- Validador aceita a estrutura de links `https://pay.finaliza.shop/pl/<id>`, sem query, fragmento ou credenciais. Isso NÃO verifica preço, propriedade, recorrência ou pagamento.

Verificação: 15 testes Python aprovados; build Vite concluído; `scripts/verificar-logout.mjs` aprovado com API simulada para F5, falha de logout e saída seguida de F5. A revogação real Supabase, navegação Back autenticada real e logout entre abas ainda precisam de teste de integração. Mudanças não foram publicadas.

Pagamentos continuam pendentes: a [documentação Appmax](https://docs.appmax.com.br/guides/webhooks) informa ausência de assinatura HMAC nos webhooks. Não implementar HMAC fictício nem ativar planos confiando no payload recebido. A próxima etapa exige credenciais de API da instalação guardadas no backend, confirmação do pedido pela API oficial, associação verificável pedido→conta→plano, idempotência persistida e teste sandbox. Os links estáticos fornecidos não bastam para provar essa associação ou cobrança recorrente. Nenhuma credencial nova foi solicitada por chat nem lida/exposta nesta etapa.

## Escopo e limitações

Revisão do código de autenticação, logout, cookies, histórico e cache; Snyk e npm audit nas dependências JavaScript; consultas anônimas não invasivas aos endpoints publicados. Nenhum pagamento, alteração de produção, exploração, revogação de sessão real ou envio de código-fonte ao scanner foi realizado nesta auditoria. Não é certificação de segurança do sistema inteiro. RLS, isolamento entre contas, pagamentos e dependências Python ainda precisam de validação própria.

## Achados confirmados

1. **Logout incompleto — prioridade alta de correção, risco médio.** A interface revisada não oferece botão Sair. `backend/app_api.py:735` limpa cookies e cache local de validação, mas não chama logout do Supabase para revogar refresh tokens. `src/services/authService.js:192` oculta falhas do pedido de logout. Não foi realizado replay de token real. Implementar ação visível, revogação e tratamento explícito de falhas. Mesmo após revogar refresh tokens, JWTs de acesso já emitidos podem continuar válidos até expirar; não prometer invalidação imediata de todo acesso. [Referência Supabase](https://supabase.com/docs/guides/auth/signout).

2. **Política de cache incompleta — risco médio.** `_json` aplica `private, no-store` apenas a alguns resultados. Respostas privadas que não incluem o campo `usuario` podem ficar fora dessa regra. Em produção, `/api/auth/status` anônimo respondeu 200 sem Cache-Control; `/api/sites` e `/api/leads` anônimos responderam 401 com no-store. Aplicar no-store uniformemente a autenticação e dados privados. Ausência do header não comprova vazamento ocorrido.

3. **Possível código OAuth nos logs — risco médio, exposição efetiva não testada.** O servidor usa o logger padrão de BaseHTTPRequestHandler, que registra a linha da requisição com query string. O callback recebe código OAuth na URL. Redigir parâmetros sensíveis nos logs, sem registrar tokens, senhas ou códigos. A resposta de sucesso já redireciona para URL limpa e usa no-store e Referrer-Policy; a resposta de erro observada não tinha no-store.

4. **Dependência vulnerável — severidade alta do advisory, alcance observado de build/desenvolvimento.** Snyk com `--dev` encontrou `SNYK-JS-NANOID-18506897`, Infinite loop, em nanoid 3.3.16. Cadeia: Vite 7.3.6 → PostCSS 8.5.23 → nanoid 3.3.16. npm audit também apontou uma vulnerabilidade alta e correção disponível; faixa informada <3.3.18. Atualizar a cadeia/lockfile e repetir build e testes. Exploração remota no frontend publicado não foi demonstrada.

## Resultados das ferramentas

- `snyk test --json`: 97 dependências, zero achados; esse resultado não incluía todas as dependências de desenvolvimento.
- `snyk test --dev --json`: 326 dependências, um achado alto em nanoid.
- `npm audit --json`: um achado alto; zero críticos.
- `python -m unittest test_oauth_flow -q`: nove testes aprovados. Não cobre logout autenticado completo nem navegação Back após logout.
- **Strix não executado.** Docker não está disponível neste ambiente. O projeto exige Docker e configuração de provedor LLM; é uma ferramenta de testes ativos, não apenas análise passiva. Preparar ambiente isolado e definir escopo/custos antes de executá-la. [Strix oficial](https://github.com/usestrix/strix). [Snyk CLI](https://docs.snyk.io/developer-tools/snyk-cli/overview).

## Histórico, HTTPS e próximos testes

## Complemento: pagamentos e HackAgent

Na árvore principal e no backend da worktree de release não foi encontrada implementação de webhook Appmax. `src/views/BillingView.jsx` informa integração financeira pendente. Links externos de checkout, isoladamente, não comprovam pagamento nem ativam uma assinatura com validação do servidor. Não foi realizada compra ou tentativa de ativar plano indevidamente.

Falha funcional reproduzida: `node scripts/planos-repass.mjs --plano starter --link https://pay.finaliza.shop/pl/d479bc7d82` rejeita a URL porque a allowlist só aceita appmax.com.br e subdomínios. Não liberar domínios arbitrários; verificar o domínio do checkout com a documentação/conta do provedor antes de corrigir a lista.

Login, cadastro e recuperação possuem chamadas de rate limit no código revisado; efetividade distribuída e resistência a brute force não foram testadas. Logout/cache/logs continuam com os achados anteriores. Não foi testada uma conta autenticada nesta etapa.

HackAgent 0.12.0 instalado. Ollama foi iniciado em segundo plano; listou qwen2.5:1.5b e llama3.1:8b, sem modelo identificado como abliterado. Primeira tentativa tentou baixar gemma3:4b automaticamente; os processos dessa tentativa e do download foram interrompidos. Arquivos parciais não foram removidos. Criada configuração local com auto_pull_models=false para nova tentativa controlada. Nenhum resultado dessa ferramenta deve ser tratado como aprovação de segurança sem conclusão da execução.

Resultado da segunda tentativa: falha de validação PairConfig após 24,6 segundos. A versão instalada rejeitou auto_pull_models e disable_goal_category_classifier, embora o orquestrador documente a primeira opção. O teste adversarial não foi concluído. O arquivo experimental de configuração foi removido para não deixar instruções inválidas no projeto. Não há processos desta execução pendentes.

Voltar para uma tela pública de login é normal: o histórico do navegador não revela automaticamente o corpo POST com senha. HTTPS protege o transporte, não substitui autorização, proteção de cookies, cache ou sanitização de logs. Não colocar credenciais na URL nem permitir que a tela privada reapareça utilizável após logout. A rota pública `/login` respondeu 200, sem 404 no teste feito; isso não prova todos os caminhos de navegação.

Próxima sequência recomendada: implementar logout visível e revogação; uniformizar cache privado e redigir logs; atualizar nanoid; testar login → F5 → sair → Voltar/Avançar em navegador autenticado, incluindo restauração por BFCache, expiração e falha de rede. Em seguida auditar isolamento entre contas e confirmação de pagamento por webhook. Alterações no aplicativo e deploy não foram feitos nesta etapa.
