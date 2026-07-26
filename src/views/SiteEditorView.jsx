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

        {/* Right Side: Live Website Preview (Systemista Glitch or React Bits) */}
        <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', background: '#050711', gap: '20px' }}>

          {/* Motor agêntico: catálogo real + validação anti-alucinação */}
          <div style={{ width: '100%', maxWidth: '840px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '12px', flexWrap: 'wrap', marginBottom: schemaAgentico ? '16px' : 0,
            }}>
              <span className="mono-label" style={{ color: '#6366f1' }}>
                MOTOR AGÊNTICO // CATÁLOGO VALIDADO
              </span>
              <button
                onClick={() => gerarComMotorAgentico()}
                disabled={gerando}
                className="btn-primary"
                style={{ padding: '9px 18px', fontSize: '11px', opacity: gerando ? 0.6 : 1 }}
              >
                {gerando ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                {gerando ? 'Gerando...' : 'Gerar com IA'}
              </button>
            </div>

            {schemaAgentico && (
              <>
                <SchemaRenderer schema={schemaAgentico} lead={targetLead} />

                {traceGeracao.length > 0 && (
                  <details style={{ marginTop: '12px' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                      Rastro da geração ({traceGeracao.length} passos)
                    </summary>
                    <div style={{
                      marginTop: '8px', background: '#05070f', padding: '12px',
                      border: '0.5px solid rgba(255,255,255,0.12)', fontSize: '11px',
                      color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)',
                      lineHeight: 1.7, maxHeight: '180px', overflowY: 'auto',
                    }}>
                      {traceGeracao.map((t, i) => <div key={i}>{t}</div>)}
                    </div>
                  </details>
                )}
              </>
            )}
          </div>

          <div style={{
            width: '100%',
            maxWidth: '840px',
            background: '#0a0e1a',
            color: '#ffffff',
            border: '0.5px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            
            {/* If Systemista Glitch Theme is active */}
            {systemista ? (
              <div>
                {/* Nav */}
                <div style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
                  <div className="font-headline" style={{ fontSize: '18px', color: '#fff', letterSpacing: '-0.04em' }}>
                    ■ {systemista.brandName}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>
                    <span>Serviços</span>
                    <span>Como funciona</span>
                    <span>Cases</span>
                    <span>Preços</span>
                  </div>
                  <button className="btn-solid-white" style={{ padding: '8px 16px', fontSize: '10px' }}>
                    FALE CONOSCO →
                  </button>
                </div>

                {/* Systemista Hero */}
                <div style={{ padding: '60px 32px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <span className="mono-label" style={{ border: '0.5px solid rgba(255,255,255,0.2)', padding: '4px 10px', fontSize: '9px', marginBottom: '20px', display: 'inline-block' }}>
                      ● AGORA ACEITANDO NOVOS PROJETOS
                    </span>

                    <h1 className="font-headline" style={{ fontSize: '38px', lineHeight: 0.95, color: '#ffffff', margin: '20px 0' }}>
                      {systemista.heroH1Lines[0]} <br />
                      {systemista.heroH1Lines[1]} <br />
                      <span style={{ color: '#ec4899' }}>{systemista.heroH1Lines[2]}</span> <br />
                      {systemista.heroH1Lines[3]}
                    </h1>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                      <input type="text" placeholder="voce@empresa.com" className="font-mono" style={{ padding: '10px 14px', background: '#111726', border: '0.5px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', width: '220px' }} />
                      <button className="btn-solid-white" style={{ padding: '10px 20px', fontSize: '10px' }}>AGENDAR CALL →</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, textAlign: 'right' }}>
                      {systemista.heroSideCopy}
                    </p>
                  </div>
                </div>

                {/* Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
                  {systemista.stats.map(([num, lbl], i) => (
                    <div key={i} className="hairline-r" style={{ padding: '20px', textAlign: 'center' }}>
                      <div className="font-headline" style={{ fontSize: '28px', color: '#6366f1' }}>{num}</div>
                      <div className="mono-label" style={{ fontSize: '8px', marginTop: '4px' }}>{lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Services Grid */}
                <div style={{ padding: '40px 32px' }}>
                  <span className="mono-label" style={{ marginBottom: '20px', display: 'block' }}>01 // NOSSOS SERVIÇOS</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {systemista.services.map(s => (
                      <div key={s.tag} style={{ background: '#111726', border: '0.5px solid rgba(255,255,255,0.1)', padding: '20px' }}>
                        <span className="mono-label" style={{ fontSize: '8px', color: '#ec4899' }}>{s.tag}</span>
                        <h3 className="font-headline" style={{ fontSize: '18px', color: '#fff', margin: '8px 0' }}>{s.title}</h3>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* React Bits Standard Canvas Preview */
              <div>
                <ReactBitsCanvas particleCount={45} speed={1.2} />
                <div style={{ position: 'relative', zIndex: 10, padding: '40px 32px' }}>
                  <div style={{ padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-headline" style={{ fontSize: '20px', color: '#fff' }}>
                      {heroComponent?.title || targetLead.nome}
                    </span>
                    <button className="btn-primary" style={{ fontSize: '11px' }}>
                      {heroComponent?.ctaText || 'Pedir no WhatsApp'}
                    </button>
                  </div>

                  <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <h1 className="font-headline" style={{ fontSize: '38px', color: '#fff', marginBottom: '16px' }}>
                      {heroComponent?.title || targetLead.nome}
                    </h1>
                    <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '520px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
                      {heroComponent?.subtitle || `Referência em ${targetLead.categoria} em ${targetLead.cidade}.`}
                    </p>
                    <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '13px' }}>
                      💬 {heroComponent?.ctaText || 'Pedir no WhatsApp'}
                    </button>
                  </div>

                  <OriginKitBentoGrid items={bentoItems} />
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
