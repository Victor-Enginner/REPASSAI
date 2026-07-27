/**
 * REPASS AI - Motor de Abordagem Comercial no WhatsApp.
 *
 * REGRAS DE INTEGRIDADE (não relaxar sem decisão explícita de produto):
 *
 * 1. Nunca afirmar que um site já foi construído/publicado enquanto não
 *    houver deploy real. Mandar link morto para o dono de um negócio
 *    queima a reputação do operador no primeiro contato.
 * 2. Nunca montar link para telefone que não veio de fonte verificada.
 *    Número inventado com DDD válido acerta um terceiro sem relação
 *    nenhuma com o negócio abordado.
 * 3. Leads em modo demo (`is_demo`) são bloqueados para disparo.
 *
 * A mensagem segue o padrão validado em produção: contexto real
 * observado, apresentação breve, oportunidade verificável e uma pergunta
 * de diagnóstico. A proposta comercial só entra depois da resposta humana.
 */

/** Motivos de bloqueio de disparo, para a UI explicar ao operador. */
export const MOTIVO_BLOQUEIO = {
  DEMO: 'Lead de demonstração — configure a GOOGLE_PLACES_API_KEY para varrer leads reais.',
  SEM_TELEFONE: 'Este lead não tem telefone no perfil do Google.',
  TELEFONE_INVALIDO: 'O telefone deste lead não tem formato brasileiro válido.',
};

/**
 * Normaliza um telefone brasileiro para o formato aceito pelo wa.me.
 * @param {string} telefoneRaw Telefone como veio da fonte
 * @returns {string|null} Dígitos com DDI, ou null se inválido
 */
export function normalizarTelefone(telefoneRaw) {
  if (!telefoneRaw) return null;

  let digitos = String(telefoneRaw).replace(/\D/g, '');
  if (digitos.startsWith('55')) digitos = digitos.slice(2);

  // 10 dígitos = fixo (DDD + 8), 11 = móvel (DDD + 9). Qualquer outra
  // contagem indica dado corrompido ou fabricado.
  if (digitos.length !== 10 && digitos.length !== 11) return null;

  return `55${digitos}`;
}

/**
 * Verifica se um lead pode receber abordagem comercial.
 * @param {object} lead
 * @returns {{permitido: boolean, motivo: string|null}}
 */
export function podeAbordar(lead) {
  if (!lead) return { permitido: false, motivo: MOTIVO_BLOQUEIO.SEM_TELEFONE };
  if (lead.is_demo) return { permitido: false, motivo: MOTIVO_BLOQUEIO.DEMO };
  if (!lead.telefone) return { permitido: false, motivo: MOTIVO_BLOQUEIO.SEM_TELEFONE };
  if (!normalizarTelefone(lead.telefone)) {
    return { permitido: false, motivo: MOTIVO_BLOQUEIO.TELEFONE_INVALIDO };
  }
  return { permitido: true, motivo: null };
}

/**
 * Descreve a reputação do lead usando apenas números que existem de fato.
 * @param {object} lead
 * @returns {string}
 */
function resumoDaReputacao(lead) {
  const { avaliacao, reviewsCount } = lead;
  if (typeof avaliacao === 'number' && typeof reviewsCount === 'number') {
    return `vi a reputação de vocês no Google: nota ${avaliacao} em ${reviewsCount} avaliações.`;
  }
  return 'vi o perfil de vocês no Google.';
}

/** Oportunidade observável, conforme o motivo detectado na varredura. */
const OPORTUNIDADE = {
  sem_site:
    'Percebi que o perfil do Google ainda não tem um site próprio vinculado, o que pode dificultar que uma busca vire atendimento.',
  so_rede_social:
    'Reparei que o principal link do perfil leva a uma rede social, e há espaço para transformar essas buscas em conversas e agendamentos.',
  poucas_reviews:
    'A nota é muito boa; há espaço para aproveitar melhor cada cliente satisfeito e fortalecer essa reputação no Google.',
  geral:
    'Queria entender como está hoje a presença digital e o atendimento de vocês.',
};

/**
 * Gera a mensagem inicial de abordagem para um lead.
 *
 * Prefere a mensagem já montada pelo backend (que teve acesso aos dados
 * completos do Places). Só reconstrói localmente se ela não vier.
 *
 * @param {object} lead
 * @returns {string}
 */
export function generatePersonalizedScript(lead) {
  if (lead?.mensagem_sugerida) return lead.mensagem_sugerida;

  const nome = lead?.nome || 'seu negócio';
  const nicho = (lead?.categoria || 'negócios locais').toLowerCase();
  const cidade = lead?.cidade || 'sua região';
  const motivo = OPORTUNIDADE[lead?.motivo_abordagem] || OPORTUNIDADE.geral;

  return [
    `Oi, tudo bem? Encontrei ${nome} pesquisando ${nicho} em ${cidade} e ${resumoDaReputacao(lead || {})}`,
    `Ajudo negócios locais a organizar presença digital e atendimento no WhatsApp. ${motivo}`,
    'Hoje os novos contatos de vocês chegam mais pelo WhatsApp ou pelo Instagram?',
  ].join(' ');
}

/**
 * Monta os scripts de um lote, separando o que pode e o que não pode ser
 * abordado — para a UI nunca disparar às cegas.
 *
 * @param {object[]} leads
 * @returns {{prontos: object[], bloqueados: object[]}}
 */
export function generateBulkScripts(leads = []) {
  const prontos = [];
  const bloqueados = [];

  leads.forEach((lead) => {
    const { permitido, motivo } = podeAbordar(lead);
    if (permitido) {
      prontos.push({
        id: lead.id,
        nome: lead.nome,
        telefone: lead.telefone,
        mensagem: generatePersonalizedScript(lead),
        link: buildWhatsAppWebLink(lead.telefone, generatePersonalizedScript(lead)),
      });
    } else {
      bloqueados.push({ id: lead.id, nome: lead.nome, motivo });
    }
  });

  return { prontos, bloqueados };
}

/**
 * Monta o link do WhatsApp Web com a mensagem pré-preenchida.
 *
 * @param {string} phoneRaw Telefone de fonte verificada
 * @param {string} message Mensagem a pré-preencher
 * @returns {string|null} URL, ou null se o telefone for inválido
 */
export function buildWhatsAppWebLink(phoneRaw, message) {
  const telefone = normalizarTelefone(phoneRaw);
  if (!telefone) return null;
  return `https://web.whatsapp.com/send?phone=${telefone}&text=${encodeURIComponent(message)}`;
}
