import React from 'react';
import { AlertCircle, CreditCard } from 'lucide-react';

export default function BillingView() {
  return (
    <div style={{ padding: '28px 36px', maxWidth: '1240px', margin: '0 auto', minHeight: '100vh' }}>
      <span className="mono-label">MODULE // BILLING_08</span>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--tinta)' }}>Faturamento</h1>
      <div role="status" style={{ display: 'flex', gap: '14px', marginTop: '24px', padding: '24px', backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-lg)', color: 'var(--tinta-media)' }}>
        <AlertCircle size={20} aria-hidden="true" />
        <div>
          <strong style={{ display: 'block', color: 'var(--tinta)', marginBottom: '6px' }}>Cobranças ainda não configuradas</strong>
          <p style={{ margin: 0, lineHeight: 1.5 }}>Nenhuma fatura ou assinatura pode ser exibida até que o REPASS tenha um provedor de cobrança e registros persistidos. Esta tela não emite cobranças.</p>
        </div>
      </div>
      <div style={{ marginTop: '18px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--tinta-fraca)', fontSize: '12px' }}>
        <CreditCard size={15} aria-hidden="true" /> Integração financeira pendente
      </div>
    </div>
  );
}
