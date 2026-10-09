# Estado confirmado — login e pagamentos

Netlify: deploy 6abccdd5619482386b03f90f concluído em produção.
Backend: commit d09b461 enviado à branch codex/render-backend-release.
Verificação HTTP após retomada: Render e Netlify devolvem /api/auth/status 200 JSON, auth_ativo=true, modo=multiusuario, oauth_providers=[]. A API inclui o campo novo, mas nenhum provedor está habilitado em runtime; não declarar login social funcional.

Revisar no serviço Render correto, sem expor secrets:
- REPASS_OAUTH_PROVIDERS: google (minúsculo, sem aspas).
- REPASS_PUBLIC_ORIGIN: https://repass-ai-beta.netlify.app (sem caminho).
- REPASS_OAUTH_SECRET: valor aleatório real, pelo menos 32 caracteres; não o comando de geração.
- Salvar e redeployar após correção. Confirmar oauth_providers=["google"] antes do teste real.

## Links informados e associados pelo proprietário

| Plano | Valor informado | Checkout |
|---|---|---|
| Starter | R$ 49,90 | https://pay.finaliza.shop/pl/d479bc7d82 |
| Pro | R$ 94,50 | https://pay.finaliza.shop/pl/7f9e7ea99f |
| Agência | R$ 295,00 | https://pay.finaliza.shop/pl/738aa4bf8f |

Mapeamento confirmado pelo usuário; valores e recorrência não foram verificados no gateway. Nenhuma cobrança executada. Links não ativam planos automaticamente. Não liberar acesso por retorno do checkout; integração de confirmação autenticada, vínculo com usuário e cotas completas continua pendente.
