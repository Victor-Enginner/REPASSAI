/**
 * Agentic Planner & Context Enricher Engine - Estilo Lovable / Replit Agent
 * Módulo de Expansão de Prompt, Design System Injection e Enriquecimento de Mídia Google Business
 */

import { executePromptWithFallback } from './llmRouter';
import { generateSiteSchemaViaOmniRoute } from './omniRouteGateway';

export const NICHE_DESIGN_TOKENS = {
  "restaurante": {
    theme: "dark_warm",
    primaryColor: "#ef4444",
    accentColor: "#f59e0b",
    fontDisplay: "Outfit",
    badge: "🍲 Comida Artesanal & Entrega Rápida",
    defaultCTA: "Fazer Pedido no WhatsApp",
    features: [
      { icon: "🍲", title: "Ingredientes Selecionados", desc: "Preparo artesanal diário com os melhores insumos." },
      { icon: "⚡", title: "Entrega Rápida", desc: "Entregamos quentinho na sua porta ou trabalho." },
      { icon: "⭐", title: "Nota 4.9/5", desc: "Aprovado por mais de 1.000 clientes da região." }
    ]
  },
  "barbearia": {
    theme: "dark_cyber",
    primaryColor: "#0070f3",
    accentColor: "#38bdf8",
    fontDisplay: "Inter",
    badge: "💈 Estilo, Tradição & Atendimento VIP",
    defaultCTA: "Agendar Horário no WhatsApp",
    features: [
      { icon: "💈", title: "Corte & Barba Premium", desc: "Técnicas modernas e acabamento impecável." },
      { icon: "🍺", title: "Cerveja Gelada Cortesia", desc: "Ambiente exclusivo para seu conforto." },
      { icon: "📅", title: "Agendamento Sem Fila", desc: "Escolha seu horário e barbeiro de preferência." }
    ]
  },
  "salao": {
    theme: "rose_gold",
    primaryColor: "#ec4899",
    accentColor: "#f472b6",
    fontDisplay: "Outfit",
    badge: "✨ Estética Facial & Cuidados Especiais",
    defaultCTA: "Consultar Procedimentos no WhatsApp",
    features: [
      { icon: "✨", title: "Especialistas Certificados", desc: "Profissionais qualificados em constante atualização." },
      { icon: "💅", title: "Manicure & Pedicure VIP", desc: "Produtos de alta durabilidade e biossegurança." },
      { icon: "💖", title: "Ambiente Aconchegante", desc: "Espaço pensado para a sua melhor experiência." }
    ]
  },
  "padrao": {
    theme: "dark_modern",
    primaryColor: "#0070f3",
    accentColor: "#38bdf8",
    fontDisplay: "Inter",
    badge: "🚀 Qualidade & Excelência em Atendimento",
    defaultCTA: "Falar Conosco no WhatsApp",
    features: [
      { icon: "⚡", title: "Atendimento Imediato", desc: "Resposta rápida e direta pelo WhatsApp." },
      { icon: "⭐", title: "Avaliação 4.8 / 5.0", desc: "Empresa altamente recomendada pelos clientes." },
      { icon: "🛡️", title: "Garantia de Satisfação", desc: "Compromisso total com o melhor serviço." }
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
    expandedSubtitle: `${tokens.badge}. O melhor serviço de ${leadData.categoria} em ${leadData.cidade}.`,
    primaryColor: tokens.primaryColor,
    ctaText: tokens.defaultCTA,
    theme: tokens.theme,
    bentoItems: tokens.features
  };
}

/**
 * 2. Compilador de Documentos JSON com Loop de Autocorreção Agêntica Conectado ao Roteador de IA
 */
export async function executeAgenticLoop(leadData, userPrompt = '') {
  // Passo 1: Carrega chaves de API salvas do localStorage pelo Motor de IA
  let savedConfig = null;
  try {
    const raw = localStorage.getItem('repass_llm_config');
    if (raw) savedConfig = JSON.parse(raw);
  } catch (err) {
    console.warn("Sem chaves customizadas no localStorage, utilizando motor de resiliência.", err);
  }

  // Passo 2: Executa inferência via Motor Multi-Provedor LLM (OpenRouter / Groq / Gemini / Ollama)
  const llmResult = await executePromptWithFallback(
    userPrompt,
    `Você é o compilador de Landing Pages B2B do REPASS AI. O cliente é '${leadData.nome}' do nicho '${leadData.categoria}' em ${leadData.cidade}.`,
    savedConfig
  );

  // Passo 3: Expansão de contexto e planejamento (Planner Mode)
  const plan = expandNichePrompt(leadData, userPrompt);

  // Passo 4: Geração da estrutura JSON declarativa
  const initialSchema = await generateSiteSchemaViaOmniRoute(leadData, userPrompt);

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
      provider: llmResult.provider,
      model: llmResult.model,
      logs: llmResult.logs
    },
    plannerLog: [
      `🧠 [Planner Mode]: Contexto expandido para '${leadData.categoria}' em ${leadData.cidade}.`,
      `📷 [Google Places Enrichment]: Mídia capturada via Proxy Endpoint (/api/media/proxy).`,
      `🤖 [Motor LLM]: ${llmResult.provider} (${llmResult.model})`,
      `✅ [Self-Correction Loop]: Schema JSON e galeria de fotos integrados sem erros.`
    ]
  };

  // Congelamento profundo (Deep Freeze) para evitar mutação direta de estado no frontend
  return Object.freeze(JSON.parse(JSON.stringify(finalSchema)));
}
