# Ativação do login social REPASS

Código local preparado; não significa login validado nem deploy realizado.

## Supabase

Authentication → URL Configuration:
- Site URL: `https://repass-ai-beta.netlify.app`
- Redirect URLs: adicionar exatamente `https://repass-ai-beta.netlify.app/api/auth/oauth/callback`.
- Não usar wildcard nem o endereço Render para esse retorno: o cookie pertence ao site Netlify.

Callback registrado nos aplicativos Google/GitHub/Microsoft:
`https://mfdeyfsphdhfusdxqrst.supabase.co/auth/v1/callback`.
Confirmar que é o mesmo projeto usado pelo backend antes da publicação.

Google: Client ID/Secret no Supabase; incluir usuário de teste enquanto o aplicativo estiver em teste.
GitHub: Settings → Developer settings → OAuth Apps → New OAuth App; homepage Netlify e callback acima. Copiar Client ID/Secret para Supabase → GitHub.
Microsoft: Entra ID → App registrations → New registration; escolher contas organizacionais e pessoais se o produto aceitar ambas; Redirect URI Web = callback acima. Copiar Application (client) ID e o VALUE de um client secret para Supabase → Azure. Registrar vencimento do secret. Não confundir value com Secret ID.

## Render — variáveis privadas do backend

```text
REPASS_PUBLIC_ORIGIN=https://repass-ai-beta.netlify.app
REPASS_OAUTH_PROVIDERS=google
COOKIE_SECURE=true
```

Adicionar `REPASS_OAUTH_SECRET`: segredo aleatório de pelo menos 32 caracteres, somente no Render. Gere localmente com `python -c "import secrets; print(secrets.token_urlsafe(48))"`; não envie no chat nem coloque em variável VITE.

Após configurar e testar os outros provedores, mudar REPASS_OAUTH_PROVIDERS para `google,github,azure`. Não habilitar antes das credenciais estarem prontas.
SUPABASE_URL deve corresponder ao projeto confirmado acima; preservar chaves privadas existentes. Não copiar secrets para Netlify/frontend.

## Publicação e prova

Publicar backend contendo oauth_flow.py e app_api.py; publicar frontend apenas depois da API atualizada.
Netlify precisa REPASS_BACKEND_ORIGIN=https://repassai.onrender.com; build `npm run build:netlify` mantém o proxy /api antes do fallback SPA.
Testar cada provedor: iniciar login, consentir, retorno ao Netlify, /api/auth/status com usuário, recarregar e sair. Cancelamento não deve criar sessão. Testar desktop/mobile.

Build e testes unitários não comprovam consentimento real dos provedores. Nenhuma cobrança Appmax é ativada por esta configuração. Cotas comerciais completas continuam pendentes; não iniciar vendas baseado apenas no catálogo.
