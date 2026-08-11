import React, { useState } from 'react';
import { 
  Plus, 
  Send, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import { generatePersonalizedScript, buildWhatsAppWebLink, podeAbordar } from '../services/whatsappBulkEngine';
import GradualBlur from '../components/ui/GradualBlur';

export default function CRMView({ leads, setLeads, onGenerateSite }) {
  const [selectedLeadForScript, setSelectedLeadForScript] = useState(null);
  const [copied, setCopied] = useState(false);

  const columns = [
    { id: 'Leads em Aberto', title: 'Leads em Aberto', color: 'var(--accent-cyan)' },
    { id: 'Em Negociação', title: 'Em Negociação', color: 'var(--accent-indigo)' },
    { id: 'Agendados', title: 'Agendados', color: 'var(--estado-alerta)' },
    { id: 'Convertidos', title: 'Convertidos / Fechado', color: 'var(--estado-sucesso)' }
  ];

  const handleMoveStage = (leadId, newStage) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status_crm: newStage } : l));
  };

  const copyScriptText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', padding: '32px 40px', maxWidth: '1600px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Ambient Background Grid para sangrar sob a Sidebar glassmórfica */}
      <div style={{
        position: 'fixed',
        inset: 0,
        /* 100% e não 100vw: `vw` conta a barra de rolagem e sobra sempre a
           largura dela. Ver App.jsx. */
        width: '100%',
        height: '100vh',
        opacity: 0.2,
        pointerEvents: 'none',
        zIndex: 0,
        background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.25) 0%, transparent 70%)'
      }} />
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span className="mono-label">PIPELINE // SALES_CRM_03</span>
          <h1 className="font-headline" style={{ fontSize: '32px', color: 'var(--fg-white)', marginTop: '4px' }}>
            CRM DE FECHAMENTO
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--fg-muted)', marginTop: '4px' }}>
            Acompanhe suas prospecções e feche novos clientes com roteiros de abordagem em 1 clique
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="mono-label" style={{ border: '0.5px solid var(--sobre-20)', padding: '8px 16px', color: 'var(--fg-white)' }}>
            TOTAL LEADS // {leads.length}
          </span>
        </div>
      </div>

      {/* Kanban Board Columns - Enquadramento Fixo com GradualBlur */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '20px', alignItems: 'stretch' }}>
        {columns.map(col => {
          const colLeads = leads.filter(l => l.status_crm === col.id);

          return (
            <div 
              key={col.id}
              className="glass-panel"
              style={{
                borderRadius: '12px',
                padding: '20px',
                height: 'calc(100vh - 200px)',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-surface)',
                border: '0.5px solid var(--sobre-12)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Column Header (Fixo no topo da coluna) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '0.5px solid var(--sobre-12)', flexShrink: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                  <h2 className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--fg-white)' }}>
                    {col.title}
                  </h2>
                </div>
                <span className="mono-label" style={{ background: 'var(--sobre-06)', padding: '2px 8px', color: 'var(--fg-white)', borderRadius: '4px' }}>
                  {colLeads.length}
                </span>
              </div>

              {/* Column Cards (Scroll interno suave) */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '4px',
                paddingBottom: '5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative',
                zIndex: 1
              }}>
                {colLeads.length === 0 ? (
                  <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    NENHUM LEAD NESTA ETAPA
                  </div>
                ) : (
                  colLeads.map(lead => {
                    const script = generatePersonalizedScript(lead);
                    const { permitido } = podeAbordar(lead);
                    const waLink = permitido
                      ? buildWhatsAppWebLink(lead.telefone, script)
                      : null;

                    return (
                      <div 
                        key={lead.id}
                        className="cursor-target"
                        style={{
                          background: 'var(--bg-card)',
                          border: '0.5px solid var(--sobre-12)',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          position: 'relative',
                          transition: 'transform 0.15s ease, border-color 0.15s ease'
                        }}
                      >
                        {/* Top Row: Title & Temperature */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                          {/*
                            `minWidth: 0` não é detalhe: filho de flex nasce com
                            `min-width: auto`, o que o proíbe de encolher abaixo
                            da própria palavra mais longa. Numa coluna de funil
                            de 126px, "RESTAURANTE BARÃO" empurrava 52px para
                            fora do cartão — medido a 320px. Com o mínimo em
                            zero, o nome quebra em duas linhas e a coluna
                            respeita a largura que tem.
                          */}
                          <div style={{ minWidth: 0 }}>
                            <h3 className="font-headline" style={{ fontSize: '15px', color: 'var(--fg-white)', lineHeight: 1.2 }}>
                              {lead.nome}
                            </h3>
                            <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '4px' }}>
                              {lead.categoria} · {lead.cidade}
                            </div>
                          </div>

                          <span className={`badge badge-${lead.temperatura.toLowerCase()}`}>
                            {lead.temperatura}
                          </span>
                        </div>

                        {/* Phone & Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--fg-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                            <Phone size={12} style={{ flexShrink: 0 }} /> {lead.telefone || 'Sem telefone'}
                          </span>
                          {/*
                            As mesmas quatro classes de presença do Scanner.
                            Este cartão ainda perguntava "tem site: sim ou não",
                            então um lead que só tem Instagram aparecia aqui
                            como "Tem site" — verde — enquanto no Scanner
                            aparecia como oportunidade. Duas telas discordando
                            sobre o mesmo lead corroem a confiança nas duas.
                          */}
                          <span className={
                            lead.status_site === 'tem_site' ? 'badge badge-tem-site'
                            : lead.status_site === 'sem_site' ? 'badge badge-sem-site'
                            : 'badge badge-meio-site'
                          }>
                            {{
                              sem_site: 'Sem site',
                              so_rede_social: 'Só rede social',
                              site_inseguro: 'Site sem HTTPS',
                              tem_site: 'Tem site',
                            }[lead.status_site] || 'Sem site'}
                          </span>
                        </div>

                        {/* Quick Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(120px, 100%), 1fr))', gap: '8px', marginTop: '4px' }}>
                          {waLink ? (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary"
                              style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center', textDecoration: 'none' }}
                            >
                              <MessageSquare size={12} color="var(--estado-sucesso)" /> WhatsApp
                            </a>
                          ) : (
                            <span
                              title={lead.is_demo ? 'Lead de demonstração' : 'Sem telefone no perfil do Google'}
                              className="btn-secondary"
                              style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center', opacity: 0.4, cursor: 'not-allowed' }}
                            >
                              <MessageSquare size={12} color="var(--fg-subtle)" /> Sem telefone
                            </span>
                          )}

                          <button 
                            onClick={() => setSelectedLeadForScript(lead)}
                            className="btn-secondary" 
                            style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center' }}
                          >
                            <Sparkles size={12} color="var(--accent-indigo)" /> Script IA
                          </button>
                        </div>

                        {/* Move Stage Buttons */}
                        <div style={{ display: 'flex', gap: '4px', paddingTop: '8px', borderTop: '0.5px solid var(--hairline-color)' }}>
                          {col.id !== 'Em Negociação' && (
                            <button 
                              onClick={() => handleMoveStage(lead.id, 'Em Negociação')}
                              style={{ flex: 1, padding: '4px', background: 'var(--estado-sucesso-suave)', border: '0.5px solid rgba(79, 70, 229, 0.2)', color: 'var(--accent-indigo)', fontSize: '9px', fontFamily: 'var(--font-mono)', cursor: 'pointer', borderRadius: '4px' }}
                            >
                              → Negociar
                            </button>
                          )}
                          {col.id !== 'Agendados' && (
                            <button 
                              onClick={() => handleMoveStage(lead.id, 'Agendados')}
                              style={{ flex: 1, padding: '4px', background: 'var(--estado-alerta-suave)', border: '0.5px solid rgba(217, 119, 6, 0.2)', color: 'var(--estado-alerta)', fontSize: '9px', fontFamily: 'var(--font-mono)', cursor: 'pointer', borderRadius: '4px' }}
                            >
                              → Agendar
                            </button>
                          )}
                          {col.id !== 'Convertidos' && (
                            <button 
                              onClick={() => handleMoveStage(lead.id, 'Convertidos')}
                              style={{ flex: 1, padding: '4px', background: 'var(--estado-sucesso-suave)', border: '0.5px solid rgba(22, 163, 74, 0.2)', color: 'var(--estado-sucesso)', fontSize: '9px', fontFamily: 'var(--font-mono)', cursor: 'pointer', borderRadius: '4px' }}
                            >
                              ✓ Fechar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* GradualBlur no Rodapé da Coluna para desfoque gradual suave */}
              <GradualBlur
                target="parent"
                position="bottom"
                height="5rem"
                strength={2.5}
                divCount={6}
                curve="bezier"
                exponential={true}
                opacity={1}
              />
            </div>
          );
        })}
      </div>

      {/* AI Script Modal High Contrast */}
      {selectedLeadForScript && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '0.5px solid var(--hairline-color)',
            borderRadius: '8px',
            padding: '28px',
            maxWidth: '540px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <span className="mono-label" style={{ color: 'var(--accent-indigo)' }}>NEURAL SCRIPT // {selectedLeadForScript.nome}</span>
              <button onClick={() => setSelectedLeadForScript(null)} style={{ background: 'none', border: 'none', color: 'var(--fg-bright)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <h3 className="font-headline" style={{ fontSize: '20px', color: 'var(--fg-white)', marginBottom: '12px' }}>
              Roteiro de Abordagem IA
            </h3>

            <div style={{ background: 'var(--bg-surface)', padding: '16px', border: '0.5px solid var(--hairline-color)', fontSize: '13px', color: 'var(--fg-bright)', lineHeight: 1.6, fontFamily: 'monospace', marginBottom: '20px', whiteSpace: 'pre-line', maxHeight: '280px', overflowY: 'auto' }}>
              {generatePersonalizedScript(selectedLeadForScript)}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => copyScriptText(generatePersonalizedScript(selectedLeadForScript))}
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {copied ? <Check size={14} color="var(--estado-sucesso)" /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>

              <a
                href={
                  podeAbordar(selectedLeadForScript).permitido
                    ? buildWhatsAppWebLink(
                        selectedLeadForScript.telefone,
                        generatePersonalizedScript(selectedLeadForScript)
                      )
                    : undefined
                }
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!podeAbordar(selectedLeadForScript).permitido}
                title={podeAbordar(selectedLeadForScript).motivo || ''}
                className="btn-primary"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  textDecoration: 'none',
                  opacity: podeAbordar(selectedLeadForScript).permitido ? 1 : 0.4,
                  pointerEvents: podeAbordar(selectedLeadForScript).permitido ? 'auto' : 'none',
                }}
              >
                <Send size={14} /> Abrir WhatsApp Web
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
