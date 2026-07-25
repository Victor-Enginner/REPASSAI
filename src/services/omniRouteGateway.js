/**
 * OmniRoute AI Gateway Service - Interface de Roteamento de IA Unificada
 * Integração com OmniRoute (Free AI Gateway) + Fallback para Grafo de LLMs
 */

export const OMNIROUTE_CONFIG = {
  baseUrl: 'https://api.omniroute.ai/v1/chat/completions',
  apiKey: localStorage.getItem('OMNIROUTE_API_KEY') || 'free_gateway_key',
  defaultModel: 'omniroute-auto-free', // Seleciona automaticamente o melhor modelo gratuito
  enableFallback: true
};

export async function generateSiteSchemaViaOmniRoute(leadData, userPrompt = '') {
  const systemPrompt = `Você é o compilador de sites do LeadSite integrado ao OmniRoute AI Gateway.
Sua tarefa é gerar um documento JSON estruturado para uma Landing Page de alta conversão.
A resposta DEVE ser estritamente um JSON válido no seguinte formato:
{
  "projectId": "site_${Date.now()}",
  "theme": "dark_modern",
  "meta": {
    "title": "${leadData.nome}",
    "nicho": "${leadData.categoria}",
    "cidade": "${leadData.cidade}"
  },
  "components": [
    {
      "id": "hero-1",
      "type": "HeroAnimated",
      "props": {
        "title": "${leadData.nome}",
        "subtitle": "Atendimento rápido e excelência em ${leadData.categoria} em ${leadData.cidade}.",
        "ctaText": "Pedir no WhatsApp",
        "ctaColor": "#22c55e",
        "particleBg": "react_bits_starfield"
      }
    },
    {
      "id": "features-1",
      "type": "BentoGridOriginKit",
      "props": {
        "items": [
          {"icon": "⚡", "title": "Atendimento 24/7", "desc": "Resposta rápida no WhatsApp"},
          {"icon": "⭐", "title": "Avaliação 4.8/5", "desc": "Aprovado por clientes da região"},
          {"icon": "🛡️", "title": "Garantia de Qualidade", "desc": "Serviço profissional certificado"}
        ]
      }
    }
  ]
}`;

  try {
    // Tentativa 1: Tentar OmniRoute Gateway
    const response = await fetch(OMNIROUTE_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OMNIROUTE_CONFIG.apiKey}`,
        'X-OmniRoute-Optimization': 'tokens-max-saving'
      },
      body: JSON.stringify({
        model: OMNIROUTE_CONFIG.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Gere a estrutura JSON do site para ${leadData.nome}. ${userPrompt}` }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("OmniRoute Gateway offline ou sem chave. Ativando Motor Local de Resiliência...", err);
  }

  // Fallback Resiliente Instantâneo
  return {
    projectId: `site_${leadData.id || Date.now()}`,
    theme: 'dark_modern',
    meta: {
      title: leadData.nome,
      nicho: leadData.categoria,
      cidade: leadData.cidade
    },
    components: [
      {
        id: "hero-1",
        type: "HeroAnimated",
        props: {
          title: leadData.nome,
          subtitle: `Referência em ${leadData.categoria} em ${leadData.cidade}. Atendimento personalizado e rápido pelo WhatsApp.`,
          ctaText: "Fazer Pedido / Agendar",
          ctaColor: "#0070f3",
          particleBg: "react_bits_starfield"
        }
      },
      {
        id: "features-1",
        type: "BentoGridOriginKit",
        props: {
          items: [
            { icon: "⚡", title: "Atendimento Imediato", desc: "Agendamento e orçamentos num clique" },
            { icon: "⭐", title: "Qualidade Premium", desc: "Estrutura moderna e equipe qualificada" },
            { icon: "🛡️", title: "Satisfação Garantida", desc: "Avaliado com nota máxima na região" }
          ]
        }
      }
    ]
  };
}
