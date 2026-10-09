# Revisão inicial: Automações, Conhecimento, Formulários e Prospector

## Alterações desta etapa
- Apresentação comum orientada à criação de sites, estado real de integração e limitações visíveis.
- Automações: teste explicitamente simulado; removidos tempos aleatórios, sucesso fictício e incremento de contador real.
- Conhecimento: consulta lexical retorna texto existente ou nenhuma correspondência; não inventa preços, respostas nem percentuais. Não pré-carrega exemplos comerciais para novos navegadores. Dados anteriormente salvos não foram excluídos.
- Formulários: compartilhamento público desativado, sem URL /#f ou embed fictício.
- Prospector (LeadsView): retirada promessa de varredura ilimitada e indicador fixo 100% operacional.
- Sem alteração de autenticação, banco, agentes do escritório 3D ou publicação externa.

## Ainda precisa de implementação
- Automações: substituir catálogo legado de agentes por etapas de geração e QA de sites; workflows exportados precisam de nós/conexões n8n válidos e execução verificada.
- Conhecimento: biblioteca por projeto/conta no servidor, importadores com limites, autorização, busca indexada e uso real pelo gerador.
- Formulários: publicação autenticada, rota pública específica, recebimento validado de respostas, proteção antispam e persistência por proprietário.
- Prospector: disponibilidade por motor, quotas e filtros de oportunidades de sites.
- Três editores legados ainda salvam no navegador com chaves globais. Isto NÃO oferece isolamento entre contas nem sincronização. Evitar dados sensíveis; migrar com titularidade confirmada, sem atribuir dados antigos automaticamente a qualquer usuário.
- Redesign completo e revisão mobile dos editores internos ainda pendentes; a apresentação comum não constitui uma reimplementação completa.

## Verificação
- Compilação e smoke test das quatro abas nesta etapa.
- Testes de interface usam API simulada, não comprovam integrações externas.
