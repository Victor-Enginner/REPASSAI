import React, { useState } from 'react';
import { Share2, Copy, Check, DollarSign, Users, Award, Zap } from 'lucide-react';

export default function AffiliateView() {
  const [copied, setCopied] = useState(false);
  const affiliateLink = "https://repassai.com/?ref=afiliado_vip_123";

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <span className="mono-label">MODULE // AFFILIATE_NETWORK_10</span>
          <h1 className="font-headline" style={{ fontSize: '32px', color: 'var(--fg-white)', marginTop: '4px' }}>
            PROGRAMA DE AFILIADOS REPASS AI
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--fg-muted)', marginTop: '4px' }}>
            Ganhe 30% de comissão recorrente por cada indicação ativa da plataforma
          </p>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '0.5px solid rgba(255, 255, 255, 0.12)', padding: '10px 18px' }}>
          <span className="mono-label" style={{ color: 'var(--estado-sucesso)' }}>COMISSÃO RECORRENTE // 30%</span>
        </div>
      </div>

      {/* Affiliate Link Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', background: 'var(--bg-surface)' }}>
        <span className="mono-label" style={{ marginBottom: '8px', display: 'block' }}>SEU LINK EXCLUSIVO DE AFILIADO</span>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            readOnly 
            aria-label="Seu link de afiliado"
            value={affiliateLink} 
            className="font-mono"
            style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-card)', border: '0.5px solid rgba(255,255,255,0.15)', color: 'var(--fg-white)', fontSize: '13px' }}
          />
          <button onClick={copyLink} className="btn-primary">
            {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar Link'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
          <span className="mono-label">INDICAÇÕES ATIVAS</span>
          <div className="font-headline" style={{ fontSize: '36px', color: 'var(--fg-white)', marginTop: '8px' }}>14</div>
          <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '4px' }}>Assinantes ativos gerando comissão</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
          <span className="mono-label">RECEITA RECORRENTE / MÊS</span>
          <div className="font-headline" style={{ fontSize: '36px', color: 'var(--estado-sucesso)', marginTop: '8px' }}>R$ 1.247,40</div>
          <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '4px' }}>Pago mensalmente via PIX</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
          <span className="mono-label">TAXA DE CONVERSÃO</span>
          <div className="font-headline" style={{ fontSize: '36px', color: 'var(--accent-indigo)', marginTop: '8px' }}>18.4%</div>
          <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '4px' }}>Cliques convertidos em assinaturas</div>
        </div>
      </div>

    </div>
  );
}
