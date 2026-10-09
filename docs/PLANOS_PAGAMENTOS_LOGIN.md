# REPASS — planos, pagamentos e login social

## Dados para cadastrar os planos

Fonte comercial: config/planos-repass.json. Valores em centavos: Starter 4990, Pro 9450, Agência 29500. Gratuito: 10 leads, 5 categorias, 2 sites e 10 scripts de abordagem por mês. Scripts nos planos pagos e lista de categorias permitidas ainda precisam de definição; null não significa ilimitado. O período mensal do gratuito segue o catálogo mensal solicitado.

Execute `node scripts/planos-repass.mjs --plano starter` e copie Nome, Valor e Descrição para o painel. Repita com pro e agencia. `--json` produz dados internos, não um payload oficial da API Appmax. Produto digital: sim. Gratuito não precisa de checkout.

A tela Link de pagamento não comprova cobrança recorrente. Antes de vender mensalidades, confirmar habilitação no módulo Assinaturas e testar ambiente de homologação. Não prometer domínios ou recursos que ainda não foram implementados.

`node scripts/planos-repass.mjs --plano starter --link "URL_PUBLICA"` confere apenas estrutura HTTPS e domínio Appmax, sem executar requisições. Não comprova valor, status, recorrência, pagamento ou autenticidade da assinatura. Links em outro domínio oficial exigem validar esse domínio antes de incluí-lo na regra.

## Integração ainda necessária

O catálogo não está aplicado às cotas do backend nem aos preços da landing. O backend atual usa beta, varreduras_limite=10 e sites_limite=5. Varreduras não são leads: não converter números diretamente. A landing mantém preços/desconto anual antigos até ser alinhada ao catálogo mensal; não usar essa oferta antiga para iniciar vendas.

Fluxo: sessão autenticada → plano escolhido por ID → backend busca preço neste catálogo → cria checkout vinculado ao usuário → persiste identificadores → confirma pagamento via mecanismo de webhook oficial e consulta autenticada ao gateway → atualiza assinatura e permissões atomicamente. Nunca liberar plano por successUrl ou por comprovante enviado pelo navegador. Credenciais privadas apenas no servidor.

Confirmar na documentação vigente o mecanismo real de autenticação dos webhooks Appmax. Não inventar assinatura HMAC se o gateway não a fornece. Tratar duplicatas, eventos fora de ordem, renovação, estorno, atraso e cancelamento. Não criar cobranças reais durante os testes iniciais.

Referências: https://docs.appmax.com.br/ e https://docs.appmax.com.br/guides/webhooks.

## Google, GitHub e Microsoft

Supabase Auth suporta os três: google, github e azure. Usar Supabase existente; não construir um sistema de senhas paralelo. Isto é login social OAuth; SSO corporativo por SAML é outro recurso.

1. Criar aplicação OAuth no Google Cloud, GitHub OAuth Apps ou Microsoft Entra ID.
2. Copiar a URL de callback exibida em Supabase → Authentication → Sign In / Providers. Formato: https://PROJECT_REF.supabase.co/auth/v1/callback. Nunca inventar PROJECT_REF.
3. Registrar essa URL no provedor; cadastrar Client ID/Secret no painel Supabase. Segredos não entram no frontend nem no chat.
4. Implementar início e callback OAuth no backend REPASS com PKCE, estado validado e destino fixo permitido. Trocar código por sessão e manter cookies HttpOnly/Secure; não gravar tokens no localStorage.
5. Configurar URLs de retorno exatas no Supabase, testar usuário novo, usuário existente, cancelamento e logout antes de habilitar botões públicos. Azure exige escopo email; Google usar apenas openid/email/profile inicialmente.

Os três botões e o fluxo PKCE no backend foram implementados localmente. Provedores não habilitados pelo servidor ficam desabilitados na interface. Sete testes unitários passaram; consentimento real e publicação ainda estão pendentes. Consulte ATIVAR_LOGIN_SOCIAL.md para os valores exatos dos painéis. Não tratar habilitação no painel como prova de login completo.

Documentação: https://supabase.com/docs/guides/auth/social-login/auth-google, https://supabase.com/docs/guides/auth/social-login/auth-github, https://supabase.com/docs/guides/auth/social-login/auth-azure e https://supabase.com/docs/guides/auth/sessions/pkce-flow.
