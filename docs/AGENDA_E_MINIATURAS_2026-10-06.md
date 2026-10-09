# Agenda e miniaturas — 6 de outubro de 2026

- Gestão & Crescimento passou para o final das seções da sidebar. Preferências de itens não foram apagadas.
- Grade de templates usa 61 capturas JPEG locais, com carregamento sob demanda. Preview interativo continua disponível somente ao abrir um template.
- Script de captura: scripts/gerar-miniaturas-templates.mjs. Remove scripts importados e eventos inline; bloqueia rede fora de uma lista de assets públicos, sem sessão autenticada.
- Agenda: grade de 42 dias, mês/ano, hoje, seleção de dia, criação/edição/exclusão, título, horário, tipo, projeto e observações.
- Tipos: tarefa, trabalho, projeto, fechado. Agendamentos do CRM sem data podem ser cadastrados manualmente, sem inventar horários.
- Persistência LOCAL no navegador, chave por ID de conta. Não representa isolamento de banco, não sincroniza, não é armazenamento adequado a informações sensíveis em dispositivo compartilhado. Não alteramos tokens, cookies ou políticas de produção.
- Próximo passo de persistência: tabela de eventos no Supabase, autorização por proprietário, políticas RLS revisadas e integração autenticada. Nenhuma migração de produção foi aplicada.

## Verificação

- Build de produção passou.
- scripts/verificar-agenda.mjs: criar, editar, recarregar mantendo evento, excluir, navegar meses, grade de 42 dias e ausência de overflow horizontal em 390×844, 768×1024, 1360×768 e 1920×1080. API simulada nesses testes de interface.
- Miniaturas carregadas no navegador, sem iframe na grade.
- Quatro testes de organização da sidebar passaram.
- Conferência visual de screenshots de agenda mobile/desktop e grade; amostra de captura Aura Estates.
- API local real: /api/auth/status retorna auth_ativo e configurado verdadeiros. OAuth local ainda não configurado.
- Sem publicação, commit ou push nesta etapa.

## Abrir

Frontend: http://127.0.0.1:4188
API local: http://127.0.0.1:8001
