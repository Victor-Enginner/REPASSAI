/**
 * REPASS AI - CENTRAL DE ABORDAGEM 1-A-1 (MODULE // ABORDAGEM_04)
 * 
 * Console comercial de abordagem individual 1 por 1 para leads captados.
 * Elimina disparos automatizados em massa, garantindo 100% de segurança,
 * ética e personalização de atendimento via WhatsApp oficial.
 */

import React, { useState } from 'react';
import { MessageSquare, Phone, MapPin, Sparkles, ArrowLeft, Send, CheckCircle2, Calendar, Zap, Filter, Flame } from 'lucide-react';
import FlowFieldBackground from '../components/ui/FlowFieldBackground';
import { generateSingleScript } from '../services/whatsappBulkEngine';

export default function BulkWhatsAppView({ leads = [], setLeads, onBack }) {
  const [filtro, setFiltro] = useState('todos');
  const [scriptModalLead, setScriptModalLead] = useState(null);
  const [scriptGerado, setScriptGerado] = useState('');

  // Atualiza o estágio do lead no CRM global
  const handleAtualizarStatus = (leadId, novoStatus) => {
    if (!setLeads) return;
    setLeads((prevLeads) =>
      prevLeads.map((l) => (l.id === leadId ? { ...l, status_crm: novoStatus } : l))
    );
  };

  // Gerador de Script IA 1-a-1
  const handleAbrirScriptIA = (lead) => {
    const script = generateSingleScript(lead);
    setScriptGerado(script);
    setScriptModalLead(lead);
  };

  // Filtragem de leads
  const leadsFiltrados = leads.filter((l) => {
    if (filtro === 'quente') return (l.score ?? 0) >= 80;
    if (filtro === 'sem_site') return l.status_site === 'sem_site';
    if (filtro === 'negociacao') return l.status_crm === 'Em Negociação';
    return true;
  });

  return (
    <div style={{ position: 'relative', padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', animation: 'fadeIn 0.3s ease' }}>

      {/* Fundo dinâmico com rastros cibernéticos */}
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        opacity: 0.35,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <FlowFieldBackground
          color="#818cf8"
          background="#05070f"
          trailOpacity={0.1}
          particleCount={450}
          speed={0.8}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* Header da Central de Abordagem */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              {onBack && (
                <button onClick={onBack} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                  <ArrowLeft size={13} /> Voltar
                </button>
              )}
              <span className="mono-label">MODULE // ABORDAGEM_INDIVIDUAL_04</span>
            </div>

            <h1 className="font-headline" style={{ fontSize: 'clamp(22px, 4vw, 32px)', color: '#ffffff', letterSpacing: '-0.04em' }}>
              CENTRAL DE ABORDAGEM 1-A-1
            </h1>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '6px', maxWidth: '620px' }}>
              Aborde os leads captados 1 por 1 com scripts gerados por IA, links diretos e atualização imediata do funil comercial.
            </p>
          </div>

          <div style={{ background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.15)', padding: '12px 20px', borderRadius: '8px', textAlign: 'right' }}>
            <span className="mono-label" style={{ fontSize: '11px', color: '#38bdf8' }}>
              {leads.length} LEADS NO FUNIL DE ABORDAGEM
            </span>
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFiltro('todos')}
            className={filtro === 'todos' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            Todos ({leads.length})
          </button>
          <button
            onClick={() => setFiltro('quente')}
            className={filtro === 'quente' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <Flame size={13} color="#ef4444" /> Quentes (Score 80+)
          </button>
          <button
            onClick={() => setFiltro('sem_site')}
            className={filtro === 'sem_site' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            Sem Site
          </button>
          <button
            onClick={() => setFiltro('negociacao')}
            className={filtro === 'negociacao' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            Em Negociação
          </button>
        </div>

        {/* Grid dos Cards de Abordagem 1-a-1 */}
        {leadsFiltrados.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', background: '#0a0e1a', borderRadius: '12px', border: '0.5px dashed rgba(255,255,255,0.2)' }}>
            <MessageSquare size={32} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', color: '#ffffff', fontWeight: 700 }}>Nenhum lead encontrado neste filtro</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
              Rode o Scanner OSINT para capturar novos estabelecimentos na cidade desejada.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px'
          }}>
            {leadsFiltrados.map((lead) => {
              const temTelefone = Boolean(lead.telefone);
              const ehQuente = (lead.score ?? 0) >= 80;
              const ehSemSite = lead.status_site === 'sem_site';
              const numLimpo = lead.telefone ? lead.telefone.replace(/\D/g, '') : '';
              const linkWhatsApp = numLimpo
                ? `https://wa.me/55${numLimpo}?text=${encodeURIComponent(generateSingleScript(lead))}`
                : null;

              return (
                <div
                  key={lead.id}
                  className="glass-panel cursor-target"
                  style={{
                    padding: '24px',
                    borderRadius: '14px',
                    background: 'rgba(10, 14, 26, 0.85)',
                    border: ehQuente 
                      ? '1px solid rgba(239, 68, 68, 0.4)' 
                      : '0.5px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: ehQuente ? '0 10px 30px rgba(239, 68, 68, 0.1)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    gap: '16px'
                  }}
                >
                  {/* Topo: Nome, Categoria e Badges */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <h2 className="font-headline" style={{ fontSize: '18px', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        {lead.nome}
                      </h2>
                      {ehQuente && (
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '0.05em'
                        }}>
                          QUENTE
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{lead.categoria || 'Comércio Local'}</span>
                      <span>•</span>
                      <span>{lead.cidade || 'Franca'}</span>
                    </div>
                  </div>

                  {/* Telefone & Status do Site */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ffffff', fontWeight: 600 }}>
                      <Phone size={14} color="#38bdf8" />
                      {lead.telefone || <span style={{ color: '#64748b', fontSize: '11px' }}>SEM TELEFONE</span>}
                    </div>

                    <span style={{
                      background: ehSemSite ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: ehSemSite ? '#f87171' : '#4ade80',
                      border: ehSemSite ? '0.5px solid rgba(239, 68, 68, 0.3)' : '0.5px solid rgba(34, 197, 94, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 800
                    }}>
                      {ehSemSite ? 'SEM SITE' : 'TEM SITE'}
                    </span>
                  </div>

                  {/* Botões de Ação Principal: WhatsApp & Script IA */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {linkWhatsApp ? (
                      <a
                        href={linkWhatsApp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ padding: '10px', fontSize: '11px', textDecoration: 'none', justifyContent: 'center', background: '#22c55e', color: '#04140a' }}
                      >
                        <MessageSquare size={13} /> Abrir WhatsApp
                      </a>
                    ) : (
                      <button
                        disabled
                        className="btn-secondary"
                        style={{ padding: '10px', fontSize: '11px', opacity: 0.5, justifyContent: 'center' }}
                      >
                        Sem Telefone
                      </button>
                    )}

                    <button
                      onClick={() => handleAbrirScriptIA(lead)}
                      className="btn-secondary"
                      style={{ padding: '10px', fontSize: '11px', justifyContent: 'center', color: '#818cf8', borderColor: 'rgba(129, 140, 248, 0.4)' }}
                    >
                      <Sparkles size={13} /> Script IA
                    </button>
                  </div>

                  {/* Estágios de Transição no CRM Comercial */}
                  <div style={{ paddingTop: '12px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Mover Estágio no Funil:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                      <button
                        onClick={() => handleAtualizarStatus(lead.id, 'Em Negociação')}
                        style={{
                          padding: '6px 4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: '0.5px solid rgba(99, 102, 241, 0.4)',
                          background: lead.status_crm === 'Em Negociação' ? '#6366f1' : 'rgba(99, 102, 241, 0.1)',
                          color: lead.status_crm === 'Em Negociação' ? '#ffffff' : '#818cf8',
                          cursor: 'pointer'
                        }}
                      >
                        ➔ Negociação
                      </button>
                      <button
                        onClick={() => handleAtualizarStatus(lead.id, 'Agendado')}
                        style={{
                          padding: '6px 4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: '0.5px solid rgba(234, 179, 8, 0.4)',
                          background: lead.status_crm === 'Agendado' ? '#eab308' : 'rgba(234, 179, 8, 0.1)',
                          color: lead.status_crm === 'Agendado' ? '#000000' : '#fde047',
                          cursor: 'pointer'
                        }}
                      >
                        ➔ Agendar
                      </button>
                      <button
                        onClick={() => handleAtualizarStatus(lead.id, 'Fechados / Ganhos')}
                        style={{
                          padding: '6px 4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: '0.5px solid rgba(34, 197, 94, 0.4)',
                          background: lead.status_crm === 'Fechados / Ganhos' ? '#22c55e' : 'rgba(34, 197, 94, 0.1)',
                          color: lead.status_crm === 'Fechados / Ganhos' ? '#04140a' : '#4ade80',
                          cursor: 'pointer'
                        }}
                      >
                        ✔ Fechar
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Visualização de Script IA 1-a-1 */}
        {scriptModalLead && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '560px',
              width: '100%',
              background: '#0a0e1a',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(129, 140, 248, 0.4)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#818cf8" />
                  <h3 style={{ fontSize: '16px', color: '#ffffff', fontWeight: 800 }}>
                    Script IA // {scriptModalLead.nome}
                  </h3>
                </div>
                <button
                  onClick={() => setScriptModalLead(null)}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  Fechar
                </button>
              </div>

              <div style={{
                background: '#050711',
                padding: '16px',
                borderRadius: '8px',
                border: '0.5px solid rgba(255,255,255,0.12)',
                fontSize: '13px',
                color: '#e2e8f0',
                lineHeight: 1.6,
                fontFamily: 'var(--font-mono)',
                marginBottom: '20px',
                whiteSpace: 'pre-wrap'
              }}>
                {scriptGerado}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(scriptGerado);
                    alert('Script copiado para a área de transferência!');
                  }}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '12px' }}
                >
                  Copiar Texto
                </button>
                {scriptModalLead.telefone && (
                  <a
                    href={`https://wa.me/55${scriptModalLead.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(scriptGerado)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ padding: '10px 18px', fontSize: '12px', textDecoration: 'none', background: '#22c55e', color: '#04140a' }}
                  >
                    <MessageSquare size={14} /> Abrir no WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
