import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Copy, ExternalLink, Check, History, Layout, Palette, Phone, Image, ArrowLeft, Zap, RefreshCw, Database, Terminal, Download, DollarSign, MessageSquare } from 'lucide-react';
import { executeAgenticLoop } from '../services/agenticPlanner';
import { gerarLandingPage } from '../services/agenticGenerator';
import SchemaRenderer from '../components/SchemaRenderer';
import { DocumentDatabase } from '../mock/documentDB';
import { downloadStandaloneHTML } from '../services/siteDeployer';
import AgenticChatbotBuilder from '../components/AgenticChatbotBuilder';
import ReactBitsCanvas from '../components/ui/ReactBitsCanvas';
import { OriginKitBentoGrid } from '../components/ui/OriginKitComponents';
import { urlPublicaDoSite } from '../config';

export default function SiteEditorView({ lead, onBack }) {
  const targetLead = lead || {
    id: "lead_123",
    nome: "SYSTEMISTA AI",
    categoria: "Startup",
    cidade: "São Paulo",
    estado: "SP",
    telefone: "(11) 9 9123-4567",
    whatsapp: "https://wa.me/5511991234567"
  };

  const [docSchema, setDocSchema] = useState(null);
  const [copied, setCopied] = useState(false);

  // Schema do motor agêntico novo (retrieval -> LLM -> validação).
  const [schemaAgentico, setSchemaAgentico] = useState(null);
  const [gerando, setGerando] = useState(false);
  const [traceGeracao, setTraceGeracao] = useState([]);

  const projectId = `site_${targetLead.id || 'default'}`;

  useEffect(() => {
    const existingDoc = DocumentDatabase.getDocument(projectId);
    if (existingDoc) {
      setDocSchema(existingDoc);
    } else {
      initAgenticPipeline();
    }
  }, [projectId]);

  const initAgenticPipeline = async () => {
    const schema = await executeAgenticLoop(targetLead);
    const saved = DocumentDatabase.saveDocument(projectId, schema);
    setDocSchema(saved);
  };

  /**
   * Roda o ciclo agêntico e renderiza o resultado com o SchemaRenderer.
   *
   * Diferente do pipeline antigo, aqui a IA escolhe entre componentes que
   * existem de fato no catálogo e o schema passa pela validação antes de
   * chegar à tela.
   */
  const gerarComMotorAgentico = async (instrucaoLivre = '') => {
    setGerando(true);
    setTraceGeracao([]);

    const instrucao = instrucaoLivre.trim()
      || `site para ${targetLead.categoria || 'negócio local'} em ${targetLead.cidade || 'sua cidade'}`;

    const resultado = await gerarLandingPage(instrucao, targetLead);
    setSchemaAgentico(resultado.schema);
    setTraceGeracao(resultado.trace);
    setGerando(false);
  };

  const handleDownloadHTML = () => {
    if (docSchema) {
      downloadStandaloneHTML(docSchema);
    }
  };

  /**
   * Copia a URL pública do site.
   *
   * Enquanto o motor de deploy (Sprint 4) não existir, não há URL pública
   * — copiar um link inexistente para mandar ao cliente é pior que não
   * ter o botão. Nesse caso o HTML é baixado no lugar.
   */
  const copyUrl = () => {
    const publicUrl = urlPublicaDoSite(targetLead.nome);
    if (!publicUrl) {
      handleDownloadHTML();
      return;
    }
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const heroComponent = docSchema?.components?.find(c => c.type === 'HeroAnimated')?.props;
  const bentoItems = docSchema?.components?.find(c => c.type === 'BentoGridOriginKit')?.props?.items;
  const systemista = docSchema?.systemista;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000000', color: '#ffffff' }}>
      
      {/* Editor Top Bar */}
      <header style={{
        background: '#0a0e1a',
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.12)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
            <ArrowLeft size={14} /> Voltar
          </button>
          <div>
            <h2 className="font-headline" style={{ fontSize: '15px', color: '#ffffff' }}>
              CHATBOT AGÊNTICO BUILDER · {targetLead.nome}
            </h2>
            <span className="mono-label" style={{ fontSize: '9px', color: '#6366f1' }}>⚡ LOVABLE-STYLE AGENTIC LOOP</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => alert(`📱 ROTEIRO DE ABORDAGEM P/ WHATSAPP:\n\n"Oi, tudo bem? Encontrei o ${targetLead.nome} pesquisando ${targetLead.categoria} em ${targetLead.cidade}.\n\nMontei uma versão moderna e com fotos reais do estabelecimento de vocês para acelerar o atendimento pelo WhatsApp: ${window.location.href}\n\nO que achou do visual?"`)} 
            className="btn-secondary" 
            style={{ padding: '8px 14px', fontSize: '11px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
          >
            <MessageSquare size={14} /> Ver Roteiro de Abordagem
          </button>

          <button 
            onClick={() => alert(`💰 LINK DE COBRANÇA MENSALIDADE:\n\nFormato de Assinatura R$ 97,00/mês gerado para ${targetLead.nome}.`)} 
            className="btn-secondary" 
            style={{ padding: '8px 14px', fontSize: '11px', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)' }}
          >
            <DollarSign size={14} /> Cobrar Mensalidade
          </button>

          <button onClick={handleDownloadHTML} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '11px' }}>
            <Download size={14} /> Baixar HTML5
          </button>

          <button onClick={copyUrl} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '11px' }}>
            {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
            {copied ? 'Link Copiado!' : 'Copiar URL'}
          </button>

          <a href={targetLead.whatsapp} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '8px 18px', fontSize: '11px', textDecoration: 'none' }}>
            <ExternalLink size={14} /> Testar no Cliente
          </a>
        </div>
      </header>

      {/* Main Split Screen */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '420px 1fr', overflow: 'hidden' }}>
        
        {/* Left Side: Agentic Chatbot Builder Interactive Panel */}
        <AgenticChatbotBuilder 
          lead={targetLead} 
          onSchemaGenerated={(updatedSchema) => setDocSchema(updatedSchema)} 
        />

        {/* Right Side: Full Live Interactive Iframe Preview (Estilo Emergent / Lovable) */}
        <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#050711', padding: '20px', boxSizing: 'border-box' }}>
          
          {/* Viewport Header Controls */}
          <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mono-label" style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                ● PREVIEW AO VIVO // 77LIB ENGINE
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {targetLead.nome} ({targetLead.cidade} - {targetLead.estado})
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  const slug = targetLead.nome.toLowerCase().replace(/[^a-z0-9]/g, '_');
                  window.open(apiUrl(`/api/site/preview_html?file=generated_${slug}.html`), '_blank');
                }}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                <ExternalLink size={12} /> Abrir em Nova Aba
              </button>
            </div>
          </div>

          {/* Live Interactive Iframe Frame */}
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            height: 'calc(100vh - 140px)',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <iframe
              key={targetLead.id || targetLead.nome}
              src={docSchema?.previewUrl ? apiUrl(docSchema.previewUrl) : apiUrl(`/api/site/preview_html?file=generated_${targetLead.nome.toLowerCase().replace(/[^a-z0-9]/g, '_')}.html`)}
              srcDoc={docSchema?.htmlContent || undefined}
              title={`Preview de ${targetLead.nome}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#ffffff'
              }}
            />
          </div>

        </div>

      </div>

    </div>
  );
}
