/**
 * REPASS AI - MODULE // BULK_WHATSAPP_04
 *
 * Abordagem comercial assistida em lote.
 *
 * Só entram no lote leads com telefone de fonte verificada (Google
 * Places). Leads de demonstração e leads sem telefone válido ficam
 * separados, visíveis e não disparáveis — disparar para número
 * inventado atinge um terceiro sem relação com o negócio abordado.
 */

import React, { useState, useMemo } from 'react';
import { Send, ArrowLeft, RefreshCw, Play, ShieldAlert, Pause } from 'lucide-react';
import { generateBulkScripts } from '../services/whatsappBulkEngine';
import FlowFieldBackground from '../components/ui/FlowFieldBackground';

/** Intervalo entre aberturas de aba, para não ser bloqueado pelo navegador. */
const INTERVALO_MS = 2500;

export default function BulkWhatsAppView({ leads = [], onBack }) {
  const { prontos, bloqueados } = useMemo(
    () => generateBulkScripts(leads),
    [leads]
  );

  const [progress, setProgress] = useState(0);
  const [isFiring, setIsFiring] = useState(false);
  const [sentLeadIds, setSentLeadIds] = useState([]);

  /**
   * Abre as conversas em sequência espaçada.
   * O envio final é sempre manual, dentro do WhatsApp — isto monta a
   * conversa, não envia mensagem sozinho.
   */
  const handleStartBulkFire = () => {
    if (!prontos.length || isFiring) return;
    setIsFiring(true);

    let index = 0;
    const interval = setInterval(() => {
      if (index >= prontos.length) {
        clearInterval(interval);
        setIsFiring(false);
        return;
      }
      const alvo = prontos[index];
      setSentLeadIds((prev) => [...prev, alvo.id]);
      setProgress(((index + 1) / prontos.length) * 100);
      window.open(alvo.link, '_blank', 'noopener,noreferrer');
      index += 1;
    }, INTERVALO_MS);
  };

  return (
    <div style={{ position: 'relative', padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', animation: 'fadeIn 0.3s ease' }}>

      {/* Campo de fluxo com rastros cobrindo toda a viewport para sangrar sob a Sidebar */}
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        opacity: 0.45,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <FlowFieldBackground
          color="#818cf8"
          background="#05070f"
          trailOpacity={0.1}
          particleCount={520}
          speed={0.8}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <button onClick={onBack} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                <ArrowLeft size={13} /> Voltar
              </button>
              <span className="mono-label">MODULE // BULK_WHATSAPP_04</span>
            </div>

            <h1 className="font-headline" style={{ fontSize: 'clamp(22px, 4vw, 32px)', color: '#ffffff', letterSpacing: '-0.04em' }}>
              ABORDAGEM EM LOTE ASSISTIDA
            </h1>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '6px', maxWidth: '620px' }}>
              Abre as conversas já com a mensagem montada. O envio final é seu, dentro do WhatsApp.
            </p>
          </div>

          <div style={{ background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.15)', padding: '12px 20px', borderRadius: '4px', textAlign: 'right' }}>
            <span className="mono-label" style={{ fontSize: '11px', color: '#22c55e' }}>
              {sentLeadIds.length} de {prontos.length} abertos
            </span>
          </div>
        </div>

        {/* Aviso de leads bloqueados */}
        {bloqueados.length > 0 && (
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', background: 'rgba(239, 68, 68, 0.06)', border: '0.5px solid rgba(239, 68, 68, 0.35)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <ShieldAlert size={18} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fca5a5', marginBottom: '6px' }}>
                {bloqueados.length} lead{bloqueados.length > 1 ? 's' : ''} fora do lote
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {bloqueados.slice(0, 6).map((b) => (
                  <div key={b.id} style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                    <strong style={{ color: '#ffffff' }}>{b.nome}</strong> — {b.motivo}
                  </div>
                ))}
                {bloqueados.length > 6 && (
                  <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    e mais {bloqueados.length - 6}…
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progresso */}
        <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '28px', background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="mono-label" style={{ color: '#ffffff' }}>PROGRESSO DO LOTE</span>
            <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '700' }}>{Math.round(progress)}%</span>
          </div>

          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#6366f1', transition: 'width 0.3s ease' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              onClick={handleStartBulkFire}
              disabled={isFiring || prontos.length === 0}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '12px', opacity: (isFiring || !prontos.length) ? 0.5 : 1 }}
            >
              {isFiring ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              {isFiring
                ? 'Abrindo conversas…'
                : prontos.length
                  ? `Abrir ${prontos.length} conversa${prontos.length > 1 ? 's' : ''}`
                  : 'Nenhum lead elegível'}
            </button>
          </div>
        </div>

        {/* Lista de leads elegíveis */}
        {prontos.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', background: '#0a0e1a', border: '0.5px dashed rgba(255,255,255,0.2)' }}>
            <Pause size={22} color="#64748b" />
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '12px' }}>
              Nenhum lead com telefone verificado. Rode uma varredura real para liberar o disparo.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {prontos.map((alvo) => {
              const isSent = sentLeadIds.includes(alvo.id);

              return (
                <div
                  key={alvo.id}
                  className="glass-panel"
                  style={{
                    padding: '20px 24px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(160px, 1.8fr) minmax(0, 2.5fr) 160px',
                    alignItems: 'center',
                    gap: '20px',
                    background: '#0a0e1a',
                    border: isSent ? '1px solid #22c55e' : '0.5px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <div>
                    <h3 className="font-headline" style={{ fontSize: '16px', color: '#ffffff' }}>
                      {alvo.nome}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                      <strong style={{ color: '#ffffff' }}>{alvo.telefone}</strong>
                    </div>
                  </div>

                  <div style={{ background: '#111726', padding: '12px 16px', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '4px', fontSize: '11.5px', color: '#ffffff', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
                    {alvo.mensagem}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <a
                      href={alvo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ padding: '10px 16px', fontSize: '11px', textDecoration: 'none', width: '100%', justifyContent: 'center' }}
                    >
                      <Send size={13} /> {isSent ? 'Reabrir' : 'Abrir conversa'}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
