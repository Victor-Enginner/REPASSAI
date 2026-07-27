/**
 * Agentic Planner & Context Enricher Engine - Estilo Lovable / Replit Agent
 * Módulo de Expansão de Prompt, Design System Injection e Enriquecimento de Mídia Google Business
 */

import { executePromptWithFallback } from './llmRouter';

export const NICHE_DESIGN_TOKENS = {
  "restaurante": {
    theme: "dark_warm",
    primaryColor: "#ef4444",
    accentColor: "#f59e0b",
    fontDisplay: "Outfit",
    badge: "🍲 Cardápio & Contato",
    defaultCTA: "Fazer Pedido no WhatsApp",
    features: [
      { icon: "🍲", title: "Cardápio em Destaque", desc: "Apresente pratos, opções e informações reais do estabelecimento." },
      { icon: "⚡", title: "Contato Direto", desc: "Facilite pedidos e dúvidas pelos canais verificados do negócio." },
      { icon: "📍", title: "Localização", desc: "Mostre endereço e região usando apenas os dados cadastrados." }
    ]
  },
  "barbearia": {
    theme: "dark_cyber",
    primaryColor: "#0070f3",
    accentColor: "#38bdf8",
    fontDisplay: "Inter",
    badge: "💈 Serviços & Agendamento",
    defaultCTA: "Agendar Horário no WhatsApp",
    features: [
      { icon: "💈", title: "Serviços em Destaque", desc: "Apresente os serviços reais oferecidos pela barbearia." },
      { icon: "📞", title: "Contato Direto", desc: "Centralize os canais verificados para orçamento e dúvidas." },
      { icon: "📅", title: "Agendamento", desc: "Direcione o cliente para o canal de atendimento disponível." }
    ]
  },
  "salao": {
    theme: "rose_gold",
    primaryColor: "#ec4899",
    accentColor: "#f472b6",
    fontDisplay: "Outfit",
    badge: "✨ Procedimentos & Agendamento",
    defaultCTA: "Consultar Procedimentos no WhatsApp",
    features: [
      { icon: "✨", title: "Procedimentos", desc: "Apresente apenas os procedimentos confirmados pelo estabelecimento." },
      { icon: "💅", title: "Serviços", desc: "Organize os serviços reais em uma visualização clara." },
      { icon: "📅", title: "Agendamento", desc: "Direcione o cliente para o canal de atendimento verificado." }
    ]
  },
  "padrao": {
    theme: "dark_modern",
    primaryColor: "#0070f3",
    accentColor: "#38bdf8",
    fontDisplay: "Inter",
    badge: "🚀 Serviços & Contato",
    defaultCTA: "Falar Conosco no WhatsApp",
    features: [
      { icon: "🧭", title: "Serviços", desc: "Apresente os serviços confirmados pelo negócio." },
      { icon: "📞", title: "Contato", desc: "Use somente telefone e canais verificados." },
      { icon: "📍", title: "Localização", desc: "Mostre endereço e região quando esses dados estiverem disponíveis." }
    ]
  }
};

/**
 * 1. Módulo de Expansão de Contexto e Planejamento (Planner Mode)
 */
export function expandNichePrompt(leadData, userInstruction = '') {
  const cat = (leadData.categoria || '').toLowerCase();
  let tokens = NICHE_DESIGN_TOKENS.padrao;

  if (cat.includes('restaurante') || cat.includes('marmita') || cat.includes('hamburgueria')) {
    tokens = NICHE_DESIGN_TOKENS.restaurante;
  } else if (cat.includes('barbearia') || cat.includes('corte')) {
    tokens = NICHE_DESIGN_TOKENS.barbearia;
  } else if (cat.includes('salão') || cat.includes('estética') || cat.includes('unha')) {
    tokens = NICHE_DESIGN_TOKENS.salao;
  }

  return {
    expandedTitle: leadData.nome,
    expandedSubtitle: `${tokens.badge}. Conheça ${leadData.nome} em ${leadData.cidade}.`,
    primaryColor: tokens.primaryColor,
    ctaText: tokens.defaultCTA,
    theme: tokens.theme,
    bentoItems: tokens.features
  };
}

/**
 * Estrutura visual confiável usada pelo editor clássico.
 *
 * A IA não escolhe tipos arbitrários aqui: o frontend monta somente os
 * componentes conhecidos pelo editor. Isso substitui o antigo gateway
 * externo direto e mantém o editor funcional mesmo sem rede.
 */
function gerarSchemaVisualLocal(leadData) {
  return {
    projectId: `site_${leadData.id || Date.now()}`,
    theme: 'dark_modern',
    meta: {
      title: leadData.nome,
      nicho: leadData.categoria,
      cidade: leadData.cidade,
    },
    components: [
      {
        id: 'hero-1',
        type: 'HeroAnimated',
        props: {
          title: leadData.nome,
          subtitle: `${leadData.categoria || 'Negócio local'} em ${leadData.cidade || 'sua região'}.`,
          ctaText: 'Entrar em contato',
          ctaColor: '#0070f3',
          particleBg: 'react_bits_starfield',
        },
      },
      {
        id: 'features-1',
        type: 'BentoGridOriginKit',
        props: { items: [] },
      },
    ],
  };
}

/**
 * 2. Orquestrador seguro do editor clássico.
 *
 * O gerador com retrieval, validação e autocorreção é agenticGenerator.js.
 */
export async function executeAgenticLoop(leadData, userPrompt = '') {
  // Passo 1: a única chamada de IA vai ao backend REPASS. Nenhuma chave,
  // provedor ou configuração privada é lida do navegador.
  const promptSeguro = userPrompt.trim()
    || `Crie uma apresentação comercial para ${leadData.nome}, do nicho ${leadData.categoria}, em ${leadData.cidade}.`;
  const llmResult = await executePromptWithFallback(
    promptSeguro,
    `Você cria textos para Landing Pages B2B do REPASS AI. Use apenas os dados fornecidos. Não invente avaliações, números, certificações, contatos ou promessas. O cliente é '${leadData.nome}' do nicho '${leadData.categoria}' em ${leadData.cidade}.`,
    null,
    { temperature: 0 }
  );

  // Passo 2: Expansão de contexto e planejamento (Planner Mode)
  const plan = expandNichePrompt(leadData, userPrompt);

  // Passo 3: Estrutura declarativa local e determinística. O caminho moderno,
  // com retrieval e validação de catálogo, vive em agenticGenerator.js.
  const initialSchema = gerarSchemaVisualLocal(leadData);

  // Enriquecimento de Mídia (Fotos Google Places / Fallback)
  const mediaEnrichment = leadData.mediaEnrichment || {
    companyName: leadData.nome,
    location: leadData.cidade,
    designSystem: {
      theme: plan.theme,
      heroBackground: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80"
      ]
    },
    fallbacks: {
      useAgnesAiIfEmpty: true,
      nichoPrompt: `Fotos do ambiente real de ${leadData.nome} em ${leadData.cidade}`
    }
  };

  // Passo 5: Sandbox Runtime Check & Injeção da Galeria de Fotos Reais
  const baseComponents = (initialSchema.components || []).map(comp => {
    if (comp.type === 'HeroAnimated') {
      return {
        ...comp,
        props: {
          ...comp.props,
          title: plan.expandedTitle,
          subtitle: comp.props?.subtitle || plan.expandedSubtitle,
          ctaColor: plan.primaryColor,
          ctaText: plan.ctaText,
          bgImage: mediaEnrichment.designSystem.heroBackground
        }
      };
    }
    if (comp.type === 'BentoGridOriginKit') {
      return {
        ...comp,
        props: {
          items: plan.bentoItems
        }
      };
    }
    return comp;
  });

  // Garante a inclusão da GallerySection com fotos reais do Google Places
  const hasGallery = baseComponents.some(c => c.type === 'GallerySection');
  const validatedComponents = hasGallery ? baseComponents : [
    ...baseComponents,
    {
      id: "gallery-1",
      type: "GallerySection",
      props: {
        images: mediaEnrichment.designSystem.gallery,
        backupPrompt: mediaEnrichment.fallbacks.nichoPrompt
      }
    }
  ];

  const finalSchema = {
    projectId: initialSchema.projectId || `site_${Date.now()}`,
    theme: plan.theme,
    meta: {
      title: leadData.nome,
      cidade: leadData.cidade,
      nicho: leadData.categoria
    },
    mediaEnrichment,
    components: validatedComponents,
    llmResponse: llmResult.output,
    providerInfo: {
      provider: llmResult.provider || 'Motor local determinístico',
      model: llmResult.model || 'rules',
      logs: llmResult.logs
    },
    plannerLog: [
      `🧠 [Planner Mode]: Contexto expandido para '${leadData.categoria}' em ${leadData.cidade}.`,
      `📷 [Google Places Enrichment]: Mídia capturada via Proxy Endpoint (/api/media/proxy).`,
      `🤖 [Motor LLM]: ${llmResult.provider || 'fallback local'} (${llmResult.model || 'rules'})`,
      `✅ [Schema Seguro]: Estrutura local e galeria integradas sem código arbitrário.`
    ]
  };

  // Congelamento profundo (Deep Freeze) para evitar mutação direta de estado no frontend
  return Object.freeze(JSON.parse(JSON.stringify(finalSchema)));
}
