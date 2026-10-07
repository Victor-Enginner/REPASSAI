# Adaptação empresarial sem modelo

Painel de empresa recebe nome, descrição e WhatsApp. Mapeia explicitamente nós textuais do template para nome/descrição e link para contato. Operação local preserva estrutura original, atualiza title/description/og:title/og:description e guarda perfil/mapeamento no documento. Gravação continua explícita no botão Salvar alterações, via serviço autenticado existente.

Sem scraping, foto gerada ou inferência de fatos. Telefone precisa de país/DDD e formato numérico válido, mas validação de formato não comprova propriedade do número. Não há troca cega de todos os links/textos. Nomes/descrições entram via DOM/textContent, nunca HTML cru. Rejeita nome e descrição no mesmo nó.

Teste de edição visual ampliado: marca com tags tratada literalmente, telefone inválido recusado, href WhatsApp correto, ícones preservados e perfil/metadados salvos; API simulada, sem IA. Build aprovado.

Pendências: mapeamento semântico aprovado por template reutilizado em lote, fontes/imagens locais licenciadas, dados vindos de Google com consentimento/atribuição, seleção canvas, histórico unificado (desfazer textos não desfaz perfil/metadados), preview responsive completo e conta real. O campo requiresContentReview continua verdadeiro. Não publicado nesta etapa.
