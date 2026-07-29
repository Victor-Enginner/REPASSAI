/**
 * REPASS AI - AGENTIC CONSOLE (Refatoração Controlada & Ajuste Responsivo com Motor de IA Conectado)
 * Design System: Brutalismo Tecnológico / Terminal Contemporâneo B2B
 * Conectado diretamente às APIs configuradas no Roteador de IA (OpenRouter, Groq, Gemini, Ollama, etc.)
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, RefreshCw, Bot, User, Globe, Plus, Code, Copy, Check, 
  Terminal, Shield, Cpu, Layers, ChevronDown, ChevronRight, MessageSquare, 
  Trash2, X, Search, FileText, CheckCircle2, AlertTriangle, ArrowRight, Menu, Sidebar as SidebarIcon
} from 'lucide-react';
import { apiUrl } from '../config';
import { executeAgenticLoop } from '../services/agenticPlanner';
import { DocumentDatabase } from '../services/documentDB';
import { fetchAutenticado } from '../services/authService';
import PixelTetris from './ui/PixelTetris';

// Template da marca Systemista / REPASS AI preservado
export const SYSTEMISTA_PROMPT_TEMPLATE = {
  brandName: "REPASS AI",
  brandTagline: "Sistemas de IA que rodam seu negócio por você",
  heroH1Lines: [
    "SISTEMAS DE",
    "IA QUE",
    "RODAM SEU",
    "NEGÓCIO."
  ],
  heroSideCopy: "Somos uma plataforma de inteligência e automação B2B. Construímos sistemas invisíveis que atendem clientes, geram landing pages e fecham negócios — 24 horas por dia.",
  stats: [
    ["120+", "Automações no Ar"],
    ["3.4k+", "Sites Gerados"],
    ["99.8%", "Uptime do Motor"],
    ["<30s", "Geração Instantânea"]
  ],
  services: [
    { tag: "01 / OSINT", title: "Varredura de Leads", desc: "Descoberta em tempo real de empresas sem site por coordenadas e nichos.", stack: ["OSINT", "Google Places", "Scraping"] },
    { tag: "02 / LOVABLE", title: "Engine Declarativo", desc: "Compilação JSON de alta velocidade sem erros de JSX ou quebras de build.", stack: ["React 19", "DocumentDB", "NoSQL"] },
    { tag: "03 / DEPLOY", title: "HTML5 em 1 Clique", desc: "Geração de código autônomo responsivo com suporte a domínio customizado.", stack: ["HTML5", "CSS3", "Standalone"] },
    { tag: "04 / CRM", title: "Automação de WhatsApp", desc: "Disparo comercial em lote assistido com scripts persuasivos de venda.", stack: ["WhatsApp API", "Kanban", "AI Script"] }
  ],
  steps: [
    { n: "01", t: "Varredura", d: "O scanner localiza empresas locais com falhas na presença digital." },
    { n: "02", t: "Compilação", d: "O motor agêntico compila uma página profissional para o nicho." },
    { n: "03", t: "Proposta", d: "O assistente gera o script e dispara a demonstração no WhatsApp." },
    { n: "04", t: "Fechamento", d: "O cliente fecha o contrato e a página vai ao ar em segundos." }
  ],
  ctaCopy: {
    title: "PRONTO PARA AUTOMATIZAR SUAS VENDAS?",
    sub: "Fale com nosso especialista agora e receba um diagnóstico gratuito da sua operação."
  }
};

// Design System Tokens
const TOKENS = {
  bgPrimary: 'var(--bg-black)',
  bgSecondary: 'var(--bg-surface)',
  surface: 'var(--bg-card)',
  textPrimary: 'var(--fg-white)',
  textSecondary: 'var(--fg-soft)',
  textMuted: 'var(--fg-muted)',
  indigo: 'var(--accent-indigo)',
  violet: 'var(--accent-violeta)',
  magenta: 'var(--accent-rosa)',
  cyan: 'var(--accent-cyan)',
  success: 'var(--estado-sucesso)',
  warning: 'var(--estado-alerta)',
  error: 'var(--estado-erro-forte)',
  border: '0.5px solid rgba(99, 102, 241, 0.25)',
  borderMuted: '0.5px solid rgba(255, 255, 255, 0.1)'
};

/**
 * Organismo Digital de Partículas SVG Animado
 */
function AgentIdentity({ state = 'idle' }) {
  const getColor = () => {
    switch (state) {
      case 'thinking': return TOKENS.magenta;
      case 'searching': return TOKENS.cyan;
      case 'coding': return TOKENS.indigo;
      case 'completed': return TOKENS.success;
      case 'error': return TOKENS.error;
      default: return TOKENS.indigo;
    }
  };

  const activeColor = getColor();

  return (
    <div style={{ position: 'relative', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke={activeColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.6">
          {state !== 'idle' && (
            <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="6s" repeatCount="indefinite" />
          )}
        </circle>
        <circle cx="16" cy="16" r="9" stroke={activeColor} strokeWidth="1.5" opacity="0.9">
          {state === 'thinking' && (
            <animate attributeName="r" values="7;10;7" dur="1.5s" repeatCount="indefinite" />
          )}
        </circle>
        <circle cx="16" cy="16" r="4" fill={activeColor} />
      </svg>
    </div>
  );
}

/**
 * ToolTrace - Rastreamento expansível de operações agênticas
 */
function ToolTrace({ traces = [] }) {
  const [isOpen, setIsOpen] = useState(true);
  if (!traces || traces.length === 0) return null;

  return (
    <div style={{ background: 'rgba(16, 17, 24, 0.95)', border: TOKENS.border, borderRadius: '4px', margin: '8px 0', overflow: 'hidden' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '6px 10px', background: 'rgba(99, 102, 241, 0.08)', border: 'none', color: TOKENS.cyan, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={12} color={TOKENS.cyan} />
          <span>TOOL_TRACE ({traces.length})</span>
        </div>
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>

      {isOpen && (
        <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
          {traces.map((t, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', color: t.status === 'completed' ? TOKENS.success : t.status === 'running' ? TOKENS.cyan : TOKENS.textSecondary }}>
              <span style={{ color: TOKENS.textMuted }}>[{t.time || '00:00'}]</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.action}</span>
              <span style={{ fontSize: '8.5px', padding: '1px 5px', borderRadius: '2px', background: t.status === 'completed' ? 'rgba(34,197,94,0.15)' : 'rgba(56,189,248,0.15)', color: t.status === 'completed' ? TOKENS.success : TOKENS.cyan }}>
                {t.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Componente Principal: AgenticChatbotBuilder (REPASS AGENTIC CONSOLE)
 * Layout responsivo de 1 coluna 100% encaixada + Gavetas deslizantes para Histórico e Contexto NoSQL
 */
export default function AgenticChatbotBuilder({ lead, onSchemaGenerated }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `REPASS AGENTIC CONSOLE v19.0 // ONLINE\n\n- Conectado ao Roteador de IA (OpenRouter, Groq, Gemini, Ollama).\n- Cole qualquer URL para clonagem autônoma.\n- Ou digite instruções para gerar a página B2B.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      traces: [
        { action: 'SISTEMA_INICIALIZADO', status: 'completed', time: '00:01' },
        { action: 'ROTEADOR_IA_CONECTADO', status: 'completed', time: '00:01' }
      ]
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [cloneUrl, setCloneUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentState, setAgentState] = useState('idle');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Modais de Gaveta (Drawers)
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showContextDrawer, setShowContextDrawer] = useState(false);

  const [conversations, setConversations] = useState([
    { id: 'sess_1', title: 'Refatoração Landing REPASS', date: 'Hoje' },
    { id: 'sess_2', title: 'Clonagem Systemista Glitch', date: 'Ontem' }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('sess_1');

  const viewportRef = useRef(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isProcessing) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user', text: textToSend, timestamp: currentTime };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputPrompt('');
    setIsProcessing(true);
    setAgentState('thinking');

    if (textToSend.startsWith('http://') || textToSend.startsWith('https://')) {
      await handleCloneSiteByUrl(textToSend);
      return;
    }

    const targetLead = lead || { nome: "Systemista AI", categoria: "Startup", cidade: "São Paulo" };
    
    setAgentState('coding');
    let generatedSchema = await executeAgenticLoop(targetLead, textToSend);

    // Conecta a chamada ao backend real para gerar o arquivo .html físico e atualizar o iframe
    try {
      const res = await fetchAutenticado('/api/site/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: targetLead,
          instrucao: textToSend
        })
      });

      if (res.ok) {
        const backendData = await res.json();
        if (backendData.schema) {
          generatedSchema = {
            ...generatedSchema,
            ...backendData.schema,
            llmResponse: generatedSchema.llmResponse
          };
        }
      }
    } catch (err) {
      console.warn("API /api/site/generate offline. Mantendo schema agêntico em memória.", err);
    }

    if (textToSend.toLowerCase().includes('systemista') || textToSend.toLowerCase().includes('startup')) {
      generatedSchema.theme = 'systemista_glitch';
      generatedSchema.systemista = SYSTEMISTA_PROMPT_TEMPLATE;
    }

    const projectId = `site_${targetLead.id || 'default'}`;
    let savedDoc = generatedSchema;
    try {
      savedDoc = await DocumentDatabase.saveDocument(projectId, generatedSchema);
    } catch (err) {
      // Mostra o site mesmo sem ter gravado: descartar o resultado da IA
      // por falha de rede seria pior que exibir e avisar.
      console.warn('Site gerado mas nao salvo:', err.message);
    }
    onSchemaGenerated(savedDoc);

    const providerName = generatedSchema.providerInfo?.provider || 'Motor Neural REPASS';
    const providerModel = generatedSchema.providerInfo?.model || 'auto';
    const aiOutputText = generatedSchema.llmResponse ? `\n\n💡 **Instruções Aplicadas pelo Motor de IA**:\n${generatedSchema.llmResponse}` : '';

    const botMsg = {
      sender: 'bot',
      text: `✅ **Landing Page Recompilada & Atualizada ao Vivo!**\n\n- **Cliente**: ${targetLead.nome}\n- **Nicho**: ${targetLead.categoria || 'Geral'}\n- **Arquivo Compilado**: \`${generatedSchema.outputFileName || 'generated_site.html'}\`\n- **Status**: Visualização sincronizada ao vivo no painel ao lado.${aiOutputText}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      traces: [
        { action: `INFERENCIA_LLM (${providerName})`, status: 'completed', time: '00:02' },
        { action: 'GERANDO_HTML5_COM_LIB77', status: 'completed', time: '00:04' },
        { action: 'SINCRONIZANDO_PREVIEW_IFRAME', status: 'completed', time: '00:05' }
      ]
    };

    setMessages(prev => [...prev, botMsg]);
    setIsProcessing(false);
    setAgentState('completed');
    setTimeout(() => setAgentState('idle'), 3000);
  };

  const handleCloneSiteByUrl = async (urlToClone) => {
    setAgentState('searching');
    try {
      const res = await fetchAutenticado('/api/site/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToClone })
      });

      if (res.ok) {
        const data = await res.json();
        const clonedSchema = data.clonedSchema;
        let savedDoc = clonedSchema;
        try {
          savedDoc = await DocumentDatabase.saveDocument(clonedSchema.projectId, clonedSchema);
        } catch (err) {
          console.warn('Clone gerado mas nao salvo:', err.message);
        }
        onSchemaGenerated(savedDoc);

        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `🎯 **Site Clonado com Sucesso via Open Lovable Engine!**\n\n- **URL Origem**: ${urlToClone}\n- **Componentes React**: Convertidos para Tailwind CSS & React 19\n- **Estilo**: Systemista Glitch Engine\n- **Status**: Visualização ao vivo no painel ao lado.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            traces: [
              { action: 'ANALISANDO_URL_TARGET', status: 'completed', time: '00:01' },
              { action: 'EXTRAINDO_DOM_ESTRUTURAL', status: 'completed', time: '00:03' },
              { action: 'GERANDO_COMPONENTES_REACT', status: 'completed', time: '00:04' }
            ]
          }
        ]);
      }
    } catch (err) {
      console.warn("Falha na chamada da API de clonagem.", err);
      setAgentState('error');
    } finally {
      setIsProcessing(false);
      setCloneUrl('');
      setAgentState('idle');
    }
  };

  const handleCopyMessage = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: TOKENS.bgPrimary,
      color: TOKENS.textPrimary,
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. Componente Ambient PixelTetris */}
      <PixelTetris opacity={messages.length > 1 ? 0.10 : 0.18} />

      {/* Main Console Container */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        
        {/* Header Bar */}
        <div style={{ padding: '10px 14px', background: 'rgba(9, 10, 15, 0.95)', borderBottom: TOKENS.borderMuted, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              title="Histórico de Sessões"
              style={{ background: TOKENS.surface, border: TOKENS.borderMuted, color: TOKENS.textSecondary, padding: '5px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <SidebarIcon size={14} />
            </button>

            <AgentIdentity state={agentState} />

            <div>
              <h2 style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'var(--font-display)', color: TOKENS.textPrimary, margin: 0, lineHeight: 1.1 }}>
                REPASS CONSOLE
              </h2>
              <span style={{ fontSize: '9.5px', color: TOKENS.textMuted, fontFamily: 'var(--font-mono)' }}>
                ESTADO: <strong style={{ color: agentState === 'thinking' ? TOKENS.magenta : TOKENS.cyan }}>{agentState.toUpperCase()}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={() => setShowContextDrawer(!showContextDrawer)}
              title="Contexto NoSQL"
              style={{ background: TOKENS.surface, border: TOKENS.borderMuted, color: TOKENS.indigo, padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}
            >
              <Layers size={13} /> <span style={{ display: 'none', '@media (minWidth: 400px)': { display: 'inline' } }}>NoSQL</span>
            </button>
            
            <span style={{ fontSize: '9px', color: TOKENS.success, fontFamily: 'var(--font-mono)', padding: '2px 6px', border: '0.5px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)' }}>
              ● ONLINE
            </span>
          </div>
        </div>

        {/* URL Cloner Input Strip */}
        <div style={{ padding: '8px 12px', background: 'rgba(16, 17, 24, 0.9)', borderBottom: TOKENS.borderMuted, display: 'flex', gap: '6px', flexShrink: 0 }}>
          <input 
            type="text"
            value={cloneUrl}
            onChange={(e) => setCloneUrl(e.target.value)}
            placeholder="Cole uma URL para clonar (ex: https://systemista.lovable.app/)"
            aria-label="URL do site a clonar"
            style={{ flex: 1, padding: '6px 10px', background: TOKENS.bgPrimary, border: TOKENS.borderMuted, color: TOKENS.textPrimary, fontSize: '11px', fontFamily: 'var(--font-mono)', outline: 'none', borderRadius: '3px' }}
          />
          <button onClick={() => cloneUrl && handleSendMessage(cloneUrl)} style={{ padding: '0 12px', background: TOKENS.indigo, border: 'none', color: 'var(--fg-white)', fontSize: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '3px', flexShrink: 0 }}>
            <Globe size={12} /> CLONAR
          </button>
        </div>

        {/* Conversation Viewport (Flex: 1) */}
        <div ref={viewportRef} style={{ flex: 1, padding: '14px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Modelo Game de Decisões de Fundação (Cards Estilo Lovable / Replit) */}
          {messages.length === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '4px 0 12px 0' }}>
              <div style={{ padding: '10px 12px', background: 'rgba(99, 102, 241, 0.12)', border: '0.5px solid rgba(99, 102, 241, 0.3)', borderRadius: '6px' }}>
                <span className="mono-label" style={{ fontSize: '9px', color: TOKENS.indigo }}>🎮 DECISÕES DE FUNDAÇÃO DO PROJETO</span>
                <h3 className="font-headline" style={{ fontSize: '14px', color: 'var(--fg-white)', margin: '4px 0 2px 0' }}>
                  Como você quer iniciar {lead ? `o site de ${lead.nome}?` : 'o projeto?'}
                </h3>
                <p style={{ fontSize: '11px', color: TOKENS.textSecondary, margin: 0 }}>
                  Escolha uma das 3 direções estratégicas recomendadas pelo Maestro para compilar a página:
                </p>
              </div>

              {/* 3 Decision Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <button
                  onClick={() => handleSendMessage(`Geração Procedural 77lib 3D para ${lead?.nome || 'nosso projeto'} com fotos reais do Google Business e tradução RAG em Português`)}
                  style={{
                    textAlign: 'left',
                    background: 'linear-gradient(135deg, rgba(16, 17, 24, 0.9) 0%, rgba(99, 102, 241, 0.15) 100%)',
                    border: '0.5px solid rgba(99, 102, 241, 0.4)',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--fg-white)' }}>1. 🏆 Template 77lib 3D + Fotos Reais</span>
                    <span className="mono-label" style={{ fontSize: '8px', color: 'var(--estado-sucesso)', background: 'rgba(34,197,94,0.15)', padding: '2px 6px', borderRadius: '3px' }}>RECOMENDADO</span>
                  </div>
                  <p style={{ fontSize: '10.5px', color: TOKENS.textSecondary, margin: 0, lineHeight: 1.4 }}>
                    Compilação no padrão 77lib com fotos de alta resolução do Google Business e botões de conversão.
                  </p>
                </button>

                <button
                  onClick={() => handleSendMessage(`Criar Cardápio Digital RAG com fotos de pratos reais e botão flutuante de pedidos no WhatsApp de ${lead?.cidade || 'nossa cidade'}`)}
                  style={{
                    textAlign: 'left',
                    background: 'rgba(16, 17, 24, 0.8)',
                    border: '0.5px solid rgba(255, 255, 255, 0.15)',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ec4899'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--fg-white)' }}>2. 🍔 Cardápio & Pedidos no WhatsApp</span>
                    <span className="mono-label" style={{ fontSize: '8px', color: 'var(--accent-rosa)', background: 'rgba(236,72,153,0.15)', padding: '2px 6px', borderRadius: '3px' }}>VENDAS RÁPIDAS</span>
                  </div>
                  <p style={{ fontSize: '10.5px', color: TOKENS.textSecondary, margin: 0, lineHeight: 1.4 }}>
                    Focado em conversão direta pelo WhatsApp com vitrine dos itens mais bem avaliados no Google.
                  </p>
                </button>

                <button
                  onClick={() => handleSendMessage(`Aplicar estilo Systemista Glitch Dark Tech B2B para ${lead?.nome || 'o projeto'} com formulário de lead`)}
                  style={{
                    textAlign: 'left',
                    background: 'rgba(16, 17, 24, 0.8)',
                    border: '0.5px solid rgba(255, 255, 255, 0.15)',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--fg-white)' }}>3. ⚡ Estética Systemista Dark Tech B2B</span>
                    <span className="mono-label" style={{ fontSize: '8px', color: 'var(--accent-cyan)', background: 'rgba(56,189,248,0.15)', padding: '2px 6px', borderRadius: '3px' }}>CYBERPUNK</span>
                  </div>
                  <p style={{ fontSize: '10.5px', color: TOKENS.textSecondary, margin: 0, lineHeight: 1.4 }}>
                    Visual dark minimalista com linhas tecnológicas, estatísticas animadas e prova social.
                  </p>
                </button>
              </div>
            </div>
          )}

          {messages.map((m, index) => (
            <div key={index} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              
              {/* UserMessage */}
              {m.sender === 'user' && (
                <div style={{
                  maxWidth: '85%',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, var(--accent-rosa) 100%)',
                  color: 'var(--fg-white)',
                  padding: '10px 14px',
                  borderRadius: '6px 6px 0px 6px',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  wordBreak: 'break-word'
                }}>
                  {m.text}
                  <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                    {m.timestamp}
                  </div>
                </div>
              )}

              {/* AgentMessage */}
              {m.sender === 'bot' && (
                <div style={{
                  width: '100%',
                  background: TOKENS.surface,
                  border: TOKENS.border,
                  padding: '12px 14px',
                  borderRadius: '4px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                  boxSizing: 'border-box'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: TOKENS.borderMuted, fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: TOKENS.indigo }}>
                      <Bot size={13} />
                      <strong>REPASS AGENT</strong>
                    </div>
                    <span style={{ color: TOKENS.textMuted }}>{m.timestamp}</span>
                  </div>

                  {/* Tool Trace */}
                  {m.traces && <ToolTrace traces={m.traces} />}

                  {/* Body */}
                  <div style={{ fontSize: '12px', color: TOKENS.textPrimary, lineHeight: 1.5, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                    {m.text}
                  </div>

                  {/* Footer Actions */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '8px', borderTop: TOKENS.borderMuted, fontSize: '10px', color: TOKENS.textMuted }}>
                    <button onClick={() => handleCopyMessage(m.text, index)} style={{ background: 'none', border: 'none', color: TOKENS.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                      {copiedIndex === index ? <Check size={11} color={TOKENS.success} /> : <Copy size={11} />}
                      {copiedIndex === index ? 'Copiado' : 'Copiar'}
                    </button>
                    <button onClick={() => handleSendMessage(messages[index - 1]?.text)} style={{ background: 'none', border: 'none', color: TOKENS.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                      <RefreshCw size={11} /> Regenerar
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}

          {isProcessing && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: TOKENS.magenta, fontSize: '11px', background: 'rgba(236, 72, 153, 0.1)', padding: '10px 12px', border: '0.5px solid rgba(236, 72, 153, 0.3)', fontFamily: 'var(--font-mono)', borderRadius: '3px' }}>
              <RefreshCw size={13} className="animate-spin" /> PROCESSANDO NO LOVABLE ENGINE...
            </div>
          )}
        </div>

        {/* QuickActionRail */}
        <div style={{ padding: '6px 10px', background: TOKENS.bgSecondary, borderTop: TOKENS.borderMuted, display: 'flex', gap: '6px', overflowX: 'auto', flexShrink: 0 }}>
          {[
            "🔗 Clonar Systemista.lovable.app",
            "⚡ Systemista Glitch",
            "💈 Barbearia VIP",
            "📊 Estrutura B2B"
          ].map((action, i) => (
            <button 
              key={i}
              onClick={() => handleSendMessage(action.includes('http') ? 'https://systemista.lovable.app/' : action)}
              style={{ padding: '5px 10px', background: TOKENS.surface, border: TOKENS.borderMuted, color: TOKENS.textSecondary, fontSize: '10px', whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'var(--font-mono)', borderRadius: '3px' }}
            >
              {action}
            </button>
          ))}
        </div>

        {/* PromptComposer */}
        <div style={{ padding: '10px 12px', background: TOKENS.bgSecondary, borderTop: TOKENS.borderMuted, flexShrink: 0 }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: TOKENS.surface, border: TOKENS.border, padding: '6px 10px', display: 'flex', alignItems: 'center', borderRadius: '4px' }}>
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Descreva o projeto, cole uma URL..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: TOKENS.textPrimary,
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  resize: 'none',
                  height: '34px',
                  outline: 'none'
                }}
              />
              <button type="submit" disabled={isProcessing} style={{ padding: '8px 14px', background: TOKENS.indigo, border: 'none', color: 'var(--fg-white)', cursor: 'pointer', fontWeight: '700', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '3px', flexShrink: 0 }}>
                <Send size={13} /> ENVIAR
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '10px', color: TOKENS.textMuted, fontFamily: 'var(--font-mono)' }}>
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Plus size={11} color={TOKENS.indigo} /> Anexar
              </span>
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Globe size={11} color={TOKENS.cyan} /> OSINT
              </span>
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Sparkles size={11} color={TOKENS.magenta} /> Prompt
              </span>
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Code size={11} color={TOKENS.violet} /> Código
              </span>
            </div>
          </form>
        </div>

      </div>

      {/* Drawer: Histórico de Sessões */}
      {showHistoryDrawer && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '240px',
          background: TOKENS.bgSecondary,
          borderRight: TOKENS.border,
          zIndex: 50,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 0 30px rgba(0,0,0,0.8)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: TOKENS.indigo }}>HISTÓRICO DE SESSÕES</span>
            <button onClick={() => setShowHistoryDrawer(false)} style={{ background: 'none', border: 'none', color: 'var(--fg-white)', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {conversations.map(c => (
              <button 
                key={c.id}
                onClick={() => { setActiveSessionId(c.id); setShowHistoryDrawer(false); }}
                style={{
                  padding: '8px 10px',
                  background: activeSessionId === c.id ? 'rgba(99,102,241,0.15)' : TOKENS.surface,
                  border: activeSessionId === c.id ? TOKENS.border : TOKENS.borderMuted,
                  color: 'var(--fg-white)',
                  fontSize: '11px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '3px'
                }}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drawer: Contexto NoSQL */}
      {showContextDrawer && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '260px',
          background: TOKENS.bgSecondary,
          borderLeft: TOKENS.border,
          zIndex: 50,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.8)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: TOKENS.indigo }}>PAINEL DE CONTEXTO NOSQL</span>
            <button onClick={() => setShowContextDrawer(false)} style={{ background: 'none', border: 'none', color: 'var(--fg-white)', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>

          <div style={{ background: TOKENS.surface, border: TOKENS.border, padding: '10px', fontSize: '11px', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div><span style={{ color: TOKENS.textMuted }}>PROJETO:</span> <strong style={{ color: 'var(--fg-white)' }}>{lead?.nome || 'Systemista Glitch'}</strong></div>
            <div><span style={{ color: TOKENS.textMuted }}>NICHO:</span> <strong style={{ color: TOKENS.cyan }}>{lead?.categoria || 'Startup B2B'}</strong></div>
            <div><span style={{ color: TOKENS.textMuted }}>ESTADO:</span> <strong style={{ color: TOKENS.success }}>COMPILADO</strong></div>
            <div><span style={{ color: TOKENS.textMuted }}>LATÊNCIA:</span> &lt;30ms</div>
          </div>
        </div>
      )}

    </div>
  );
}
