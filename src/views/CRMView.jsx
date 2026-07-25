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
import { generatePersonalizedScript, buildWhatsAppWebLink } from '../services/whatsappBulkEngine';

export default function CRMView({ leads, setLeads, onGenerateSite }) {
  const [selectedLeadForScript, setSelectedLeadForScript] = useState(null);
  const [copied, setCopied] = useState(false);

  const columns = [
    { id: 'Leads em Aberto', title: 'Leads em Aberto', color: '#38bdf8' },
    { id: 'Em Negociação', title: 'Em Negociação', color: '#6366f1' },
    { id: 'Agendados', title: 'Agendados', color: '#f59e0b' },
    { id: 'Convertidos', title: 'Convertidos / Fechado', color: '#22c55e' }
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
    <div style={{ padding: '32px 40px', maxWidth: '1600px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <span className="mono-label">PIPELINE // SALES_CRM_03</span>
          <h1 className="font-headline" style={{ fontSize: '32px', color: '#ffffff', marginTop: '4px' }}>
            CRM DE FECHAMENTO
          </h1>
          <p style={{ fontSize: '13.5px', color: '#94a3b8', marginTop: '4px' }}>
            Acompanhe suas prospecções e feche novos clientes com roteiros de abordagem em 1 clique
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="mono-label" style={{ border: '0.5px solid rgba(255,255,255,0.2)', padding: '8px 16px', color: '#ffffff' }}>
            TOTAL LEADS // {leads.length}
          </span>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', alignItems: 'flex-start' }}>
        {columns.map(col => {
          const colLeads = leads.filter(l => l.status_crm === col.id);

          return (
            <div 
              key={col.id}
              className="glass-panel"
              style={{
                borderRadius: '0px',
                padding: '16px',
                minHeight: '600px',
                background: '#0a0e1a',
                border: '0.5px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '0.5px solid rgba(255, 255, 255, 0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                  <h2 className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>
                    {col.title}
                  </h2>
                </div>
                <span className="mono-label" style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', color: '#ffffff' }}>
                  {colLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {colLeads.map(lead => {
                  const script = generatePersonalizedScript(lead);
                  const waLink = buildWhatsAppWebLink(lead.telefone, script);

                  return (
                    <div 
                      key={lead.id}
                      style={{
                        background: '#111726',
                        border: '0.5px solid rgba(255, 255, 255, 0.12)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        position: 'relative'
                      }}
                    >
                      {/* Top Row: Title & Temperature */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div>
                          <h3 className="font-headline" style={{ fontSize: '15px', color: '#ffffff', lineHeight: 1.2 }}>
                            {lead.nome}
                          </h3>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                            {lead.categoria} · {lead.cidade}
                          </div>
                        </div>

                        <span className={`badge badge-${lead.temperatura.toLowerCase()}`}>
                          {lead.temperatura}
                        </span>
                      </div>

                      {/* Phone & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {lead.telefone}
                        </span>
                        <span className={lead.status_site === 'tem_site' ? 'badge badge-tem-site' : 'badge badge-sem-site'}>
                          {lead.status_site === 'tem_site' ? 'Tem site' : 'Sem site'}
                        </span>
                      </div>

                      {/* Quick Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                        <a 
                          href={waLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-secondary" 
                          style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center', textDecoration: 'none' }}
                        >
                          <MessageSquare size={12} color="#22c55e" /> WhatsApp
                        </a>

                        <button 
                          onClick={() => setSelectedLeadForScript(lead)}
                          className="btn-secondary" 
                          style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center' }}
                        >
                          <Sparkles size={12} color="#6366f1" /> Script IA
                        </button>
                      </div>

                      {/* Move Stage Buttons */}
                      <div style={{ display: 'flex', gap: '4px', paddingTop: '8px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
                        {col.id !== 'Em Negociação' && (
                          <button 
                            onClick={() => handleMoveStage(lead.id, 'Em Negociação')}
                            style={{ flex: 1, padding: '4px', background: 'rgba(99, 102, 241, 0.15)', border: '0.5px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: '9px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                          >
                            → Negociação
                          </button>
                        )}
                        {col.id !== 'Agendados' && (
                          <button 
                            onClick={() => handleMoveStage(lead.id, 'Agendados')}
                            style={{ flex: 1, padding: '4px', background: 'rgba(245, 158, 11, 0.15)', border: '0.5px solid rgba(245, 158, 11, 0.3)', color: '#fde047', fontSize: '9px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                          >
                            → Agendar
                          </button>
                        )}
                        {col.id !== 'Convertidos' && (
                          <button 
                            onClick={() => handleMoveStage(lead.id, 'Convertidos')}
                            style={{ flex: 1, padding: '4px', background: 'rgba(34, 197, 94, 0.15)', border: '0.5px solid rgba(34, 197, 94, 0.3)', color: '#86efac', fontSize: '9px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                          >
                            ✓ Fechar
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* AI Script Modal High Contrast */}
      {selectedLeadForScript && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#0a0e1a',
            border: '0.5px solid rgba(255,255,255,0.2)',
            maxWidth: '540px',
            width: '100%',
            padding: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="mono-label">SCRIPT_GENERATOR // {selectedLeadForScript.nome}</span>
              <button onClick={() => setSelectedLeadForScript(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <h3 className="font-headline" style={{ fontSize: '20px', color: '#ffffff', marginBottom: '12px' }}>
              Roteiro de Abordagem IA
            </h3>

            <div style={{ background: '#111726', padding: '16px', border: '0.5px solid rgba(255,255,255,0.12)', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, fontFamily: 'monospace', marginBottom: '20px', whiteSpace: 'pre-line' }}>
              {generatePersonalizedScript(selectedLeadForScript)}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => copyScriptText(generatePersonalizedScript(selectedLeadForScript))}
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>

              <a 
                href={buildWhatsAppWebLink(selectedLeadForScript.telefone, generatePersonalizedScript(selectedLeadForScript))}
                target="_blank" 
                rel="noreferrer"
                className="btn-primary" 
                style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
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
