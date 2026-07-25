/**
 * REPASS AI - Bulk WhatsApp Outreach Engine (Sprint 5)
 * Assistente de disparo comercial automatizado por lotes com scripts customizados por IA
 */

export function generatePersonalizedScript(lead) {
  const nome = lead.nome || "Cliente";
  const nicho = lead.categoria || "negócio";
  const cidade = lead.cidade || "região";

  if (lead.status_site === 'sem_site') {
    return `Olá! Vi o perfil da *${nome}* no Google em ${cidade}. Notei que vocês ainda não possuem um site oficial e estão perdendo clientes para a concorrência.\n\nMontei uma demonstração gratuita de um site moderno para vocês: https://${nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.sobresite.io\n\nPodemos conversar 2 minutos sobre como colocar no ar hoje mesmo?`;
  }

  return `Olá! Estava analisando a presença digital da *${nome}* em ${cidade}. Notei que o site atual de vocês pode dobrar a conversão de clientes no WhatsApp com algumas melhorias modernas de design.\n\nFiz um diagnóstico gratuito pra vocês: https://${nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.sobresite.io\n\nPodemos falar rapidamente?`;
}

export function generateBulkScripts(leads = []) {
  const scriptsMap = {};
  leads.forEach(l => {
    scriptsMap[l.id] = generatePersonalizedScript(l);
  });
  return scriptsMap;
}

export function buildWhatsAppWebLink(phoneRaw, message) {
  const phoneClean = (phoneRaw || '').replace(/\D/g, '');
  const phoneFormatted = phoneClean.startsWith('55') ? phoneClean : `55${phoneClean}`;
  const encodedMsg = encodeURIComponent(message);
  return `https://web.whatsapp.com/send?phone=${phoneFormatted}&text=${encodedMsg}`;
}
