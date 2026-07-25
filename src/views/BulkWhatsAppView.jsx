import React, { useState } from 'react';
import { Send, ArrowLeft, CheckCircle, RefreshCw, MessageSquare, Play, Sparkles } from 'lucide-react';
import { generateBulkScripts } from '../services/whatsappBulkEngine';
import PrismGrid from '../components/ui/PrismGrid';

export default function BulkWhatsAppView({ leads, onBack }) {
  const [targetLeads, setTargetLeads] = useState(leads.slice(0, 5));
  const [scripts, setScripts] = useState(() => generateBulkScripts(leads.slice(0, 5)));
  const [progress, setProgress] = useState(0);
  const [isFiring, setIsFiring] = useState(false);
  const [sentLeadIds, setSentLeadIds] = useState([]);

  const handleStartBulkFire = () => {
    setIsFiring(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index >= targetLeads.length) {
        clearInterval(interval);
        setIsFiring(false);
        return;
      }
      const lead = targetLeads[index];
      setSentLeadIds(prev => [...prev, lead.id]);
      setProgress(((index + 1) / targetLeads.length) * 100);
      window.open(lead.whatsapp, '_blank');
      index++;
    }, 2500);
  };

  return (
    <div style={{ position: 'relative', padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Background Layer: OriginKit PrismGrid (BackgroundBoxes) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '600px',
        opacity: 0.22,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <PrismGrid 
          boxSize={45} 
          borderWidth={1} 
          borderColor="rgba(99, 102, 241, 0.2)"
          colors={{ paletteCount: 6, color1: "#6366f1", color2: "#38bdf8", color3: "#ec4899" }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <button onClick={onBack} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                <ArrowLeft size={13} /> Voltar
              </button>
              <span className="mono-label">MODULE // BULK_WHATSAPP_04</span>
            </div>

            <h1 className="font-headline" style={{ fontSize: '32px', color: '#ffffff', letterSpacing: '-0.04em' }}>
              DISPARO DE WHATSAPP EM LOTE ASSISTIDO
            </h1>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '6px' }}>
              Dispare abordagens comerciais customizadas por IA para múltiplos clientes em 1 clique
            </p>
          </div>

          <div style={{ background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.15)', padding: '12px 20px', borderRadius: '4px', textAlign: 'right' }}>
            <span className="mono-label" style={{ fontSize: '11px', color: '#22c55e' }}>
              {sentLeadIds.length} de {targetLeads.length} Disparados
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '28px', background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="mono-label" style={{ color: '#ffffff' }}>PROGRESSO DO DISPARO EM LOTE</span>
            <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '700' }}>{Math.round(progress)}%</span>
          </div>
          
          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#6366f1', transition: 'width 0.3s ease' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button 
              onClick={handleStartBulkFire}
              disabled={isFiring}
              className="btn-primary" 
              style={{ padding: '12px 28px', fontSize: '12px' }}
            >
              {isFiring ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              {isFiring ? 'Enviando Lote...' : 'Iniciar Disparo Comercial em Lote'}
            </button>
          </div>
        </div>

        {/* Leads List Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {targetLeads.map((lead) => {
            const isSent = sentLeadIds.includes(lead.id);
            const leadScript = scripts[lead.id] || "Olá! Vi seu perfil no Google e gostaria de apresentar uma oportunidade.";

            return (
              <div 
                key={lead.id}
                className="glass-panel"
                style={{
                  padding: '20px 24px',
                  display: 'grid',
                  gridTemplateColumns: '40px 1.8fr 2.5fr 160px',
                  alignItems: 'center',
                  gap: '20px',
                  background: '#0a0e1a',
                  border: isSent ? '1px solid #22c55e' : '0.5px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <div>
                  <input type="checkbox" checked={true} readOnly style={{ width: '18px', height: '18px' }} />
                </div>

                <div>
                  <h3 className="font-headline" style={{ fontSize: '16px', color: '#ffffff' }}>
                    {lead.nome}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                    {lead.categoria} · {lead.cidade}, {lead.estado} · <strong style={{ color: '#ffffff' }}>{lead.telefone}</strong>
                  </div>
                </div>

                <div style={{ background: '#111726', padding: '12px 16px', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '4px', fontSize: '11.5px', color: '#ffffff', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
                  {leadScript}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <a 
                    href={lead.whatsapp} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ padding: '10px 16px', fontSize: '11px', textDecoration: 'none', width: '100%', justifyContent: 'center' }}
                  >
                    <Send size={13} /> {isSent ? 'Reenviar' : 'DISPARAR WHATSAPP'}
                  </a>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
