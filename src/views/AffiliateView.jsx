import React from 'react';
import { AlertCircle, Award } from 'lucide-react';

export default function AffiliateView() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>
      <span className="mono-label">MODULE // REFERRALS_09</span>
      <h1 className="font-headline" style={{ fontSize: '32px', color: 'var(--fg-white)', marginTop: '4px' }}>Indicações</h1>
      <div role="status" className="glass-panel" style={{ display: 'flex', gap: '14px', padding: '24px', marginTop: '24px', background: 'var(--bg-surface)', color: 'var(--fg-muted)' }}>
        <AlertCircle size={20} aria-hidden="true" />
        <div>
          <strong style={{ color: 'var(--fg-white)' }}>Programa de indicações ainda não configurado</strong>
          <p style={{ lineHeight: 1.5 }}>O REPASS ainda não criou links individuais, contabilizou indicações ou registrou comissões. Nenhuma receita ou taxa de conversão está disponível.</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '18px', color: 'var(--fg-muted)', fontSize: '12px' }}>
        <Award size={15} aria-hidden="true" /> Integração de parceiros pendente
      </div>
    </div>
  );
}
