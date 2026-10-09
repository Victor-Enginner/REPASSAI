# Configurar Appmax — REPASS

## Estado

Frontend e backend de autenticação publicados. Integração financeira NÃO implementada: não existe ainda endpoint de webhook que confirme pedidos e libere planos. Não cadastrar URL inventada nem considerar link aberto como pagamento.

## Primeiro passo no painel

Para integrar a própria loja, a [documentação de Meus tokens](https://docs.appmax.com.br/guides/meus-tokens) orienta abrir o menu do usuário no canto superior direito → Meus tokens → Gerar credenciais → Usar loja existente. Selecionar a loja associada aos três checkouts. Se o item não aparece, solicitar ao suporte liberação do acesso à API. Guardar client_id/client_secret em local seguro; nunca enviar secret por chat ou incluir em frontend/Git.

Depois de implementar o cliente de API, as credenciais serão configuradas apenas no Environment do serviço Render. Não confundir credenciais da loja (merchant) com credenciais de aplicativo de terceiros. Variáveis e URL de webhook definitivas serão documentadas junto do código; ainda não existem nesta release.

## Etapas que faltam no REPASS

1. Cliente backend autenticado na API oficial, com ambiente sandbox separado de produção.
2. Registrar pedido associado ao usuário autenticado, plano e valor definidos no servidor: Starter 4990, Pro 9450, Agência 29500 centavos.
3. Implementar webhook e consultar novamente o pedido na API. A [documentação dos webhooks](https://docs.appmax.com.br/guides/webhooks) informa que não há assinatura HMAC; o payload recebido não pode autorizar benefícios sozinho.
4. Persistir processamento idempotente e assinatura/ciclo em banco, com revisão da migração antes de produção. Tratar duplicatas, falhas, reembolso e cancelamento.
5. Confirmar no módulo Assinaturas se os produtos são mensais recorrentes. Não presumir recorrência só porque os preços no REPASS usam /mês.
6. Testar em sandbox antes de cobrar ou habilitar upgrades reais. Só depois cadastrar a URL HTTPS implementada em Configurações → Apphook (Webhook), conforme a documentação.

Links fornecidos pelo titular:

- Starter: https://pay.finaliza.shop/pl/d479bc7d82
- Pro: https://pay.finaliza.shop/pl/7f9e7ea99f
- Agência: https://pay.finaliza.shop/pl/738aa4bf8f

Validação local atual verifica apenas a estrutura dessas URLs, não comprova titularidade, preço ou recorrência.
