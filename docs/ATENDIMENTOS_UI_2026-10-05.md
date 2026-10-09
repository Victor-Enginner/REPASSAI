# Atendimentos: evolução da interface

## Escopo

Redesign local solicitado pelo usuário, inspirado na estrutura de mensageiros. Não é fork do código do WhatsApp, nem conexão real com provedor. Fundo SVG original do REPASS, sem copiar assets proprietários.

## Implementado

Lista com avatar, resumo, horário, contador de mensagens de demonstração, seleção, busca e filtro de não lidas. Histórico com fundo ilustrado, balões recebidos/enviados, metadados, aviso de demonstração. Rascunho por conversa; simulação local com Enter ou botão e quebra de linha com Shift+Enter. Tela de informações e navegação lista/conversa no mobile. Tema claro/escuro.

Exemplos são fictícios, permanecem somente na memória da view e podem desaparecer ao sair dela/recarregar. Não persistir mensagens de clientes em localStorage. Indicadores de leitura são simulados e o envio local mostra explicitamente que nada foi enviado ao WhatsApp. Nenhuma chamada externa é disparada pelo compositor.

## Estrutura para futura integração

O modelo de interface possui conversa id/name/initials/unread e mensagem id/direction/text/time/status. É somente uma primeira estrutura visual, não o contrato completo do backend. Adaptador real deve acrescentar providerMessageId, timestamp completo, contactId, instanceId/workspaceId, tipo de mídia, paginação, estados de conexão e entrega.

Conexão por QR code exige etapa separada: backend autenticado, autorização por workspace, armazenamento protegido da sessão do provedor, webhook validado, deduplicação e prevenção de envio duplicado, validação server-side, limites, consentimento e política do WhatsApp. Evolution/OpenWA não foram instalados ou configurados; avaliar suporte e restrições antes de escolher.

## Restrições

## Verificação local

Build passou. Teste de interface com API simulada passou para envio explícito somente local, rascunhos por contato, busca, retorno à lista no celular, ausência de overflow horizontal e compositor visível em 390×844, 768×1024, 1360×768 e 1920×1080. Capturas desktop/mobile/dark em docs/atendimentos-*.png. O tamanho mobile/tablet desconta os espaços globais de menu e dock. Isto não valida integração com WhatsApp nem entrega real.

Sem deploy, push, exclusão de outras abas ou mudança de auth nesta etapa. Outros recursos do REPASS permanecem intactos. A aba de atendimentos foi priorizada por solicitação direta, apesar da direção geral de simplificação do produto.
