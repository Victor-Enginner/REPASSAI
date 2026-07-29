import React from 'react';
import { CreditCard, Check, Zap, ShieldCheck, Sparkles } from 'lucide-react';

export default function BillingView() {
  const plans = [
    {
      name: 'PRO STARTER',
      price: 'R$ 147',
      period: '/mês',
      color: 'var(--accent-indigo)',
      features: [
        'Até 200 Leads OSINT / mês',
        'Motor de IA Declarativo NoSQL',
        'Gerador de Sites em 1 clique',
        'Download de código HTML5 autônomo',
        'CRM de Fechamento integrado'
      ]
    },
    {
      name: 'AGENCY SCALER',
      price: 'R$ 297',
      period: '/mês',
      color: 'var(--accent-cyan)',
      popular: true,
      features: [
        'Leads OSINT Ilimitados',
        'Roteador Multi-Provedor LLM (Zero Rate Limits)',
        'Disparo de WhatsApp em Lote Assistido',
        'Biblioteca de 105 Recursos Primitivos',
        'Mapeamento de Domínio Customizado'
      ]
    },
    {
      name: 'ENTERPRISE AI',
      price: 'R$ 597',
      period: '/mês',
      color: 'var(--estado-sucesso)',
      features: [
        'Tudo do plano Agency Scaler',
        'Conexão WhatsApp Cloud API Oficial',
        'Acesso prioritário a novos modelos LLM',
        'Gerente de Conta dedicado',
        'SLA de Suporte de 1 hora'
      ]
    }
  ];

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <span className="mono-label">MODULE // BILLING_PRICING_08</span>
          <h1 className="font-headline" style={{ fontSize: '32px', color: 'var(--fg-white)', marginTop: '4px' }}>
            PLANOS DE ASSINATURA & FATURAMENTO
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--fg-muted)', marginTop: '4px' }}>
            Escolha o plano ideal para escalar a sua operação de vendas de sites B2B
          </p>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '0.5px solid rgba(255, 255, 255, 0.12)', padding: '10px 18px' }}>
          <span className="mono-label" style={{ color: 'var(--estado-sucesso)' }}>ASSINATURA ATIVA // AGENCY PRO</span>
        </div>
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        {plans.map(p => (
          <div 
            key={p.name}
            className="glass-panel"
            style={{
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              background: 'var(--bg-surface)',
              border: p.popular ? `1px solid ${p.color}` : '0.5px solid rgba(255, 255, 255, 0.12)',
              position: 'relative'
            }}
          >
            {p.popular && (
              <span className="mono-label" style={{ position: 'absolute', top: '-12px', right: '20px', background: p.color, color: 'var(--fg-white)', padding: '2px 10px' }}>
                MAIS POPULAR
              </span>
            )}

            <div>
              <span className="mono-label" style={{ color: p.color }}>{p.name}</span>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '16px 0 24px 0' }}>
                <span className="font-headline" style={{ fontSize: '42px', color: 'var(--fg-white)' }}>{p.price}</span>
                <span style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>{p.period}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fg-soft)' }}>
                    <Check size={14} color={p.color} /> {f}
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: p.color }}>
              Ativar Plano {p.name}
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}
