import React from 'react';
import { ArrowRight, AlertCircle, Sparkles, CheckCircle2, TrendingUp, ChevronRight, Phone, Globe, Layers } from 'lucide-react';
import DarkVeil from '../components/ui/DarkVeil';

export default function DashboardView({ leads, onNavigateLeads, onNavigateCRM }) {
  const totalLeads = leads.length || 40;
  const abordados = leads.filter(l => ['Abordados', 'Em Negociação', 'Agendados', 'Convertidos'].includes(l.status_crm)).length;
  const agendados = leads.filter(l => l.status_crm === 'Agendados').length;
  const followUp = leads.filter(l => l.status_crm === 'Em Negociação').length;
  const perdidos = leads.filter(l => l.status_crm === 'Perdido').length;
  const convertidos = leads.filter(l => l.status_crm === 'Convertidos').length;

  const pctAbordados = Math.round((abordados / totalLeads) * 100);
  const pctAgendados = abordados > 0 ? Math.round((agendados / abordados) * 100) : 0;
  const pctFollowUp = abordados > 0 ? Math.round((followUp / abordados) * 100) : 0;
  const pctPerdidos = abordados > 0 ? Math.round((perdidos / abordados) * 100) : 0;
  const pctConvertidos = agendados > 0 ? Math.round((convertidos / agendados) * 100) : 0;

  const recentLeads = leads.slice(0, 6);

  return (
    <div style={{ position: 'relative', padding: '36px 40px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Background WebGL Shader (React Bits DarkVeil) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '480px',
        opacity: 0.25,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <DarkVeil speed={0.4} warpAmount={0.3} scanlineIntensity={0.2} />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 className="font-headline" style={{ fontSize: '32px', color: '#ffffff', letterSpacing: '-0.04em' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Visão geral da sua operação
          </p>
        </div>

        {/* 1. Funil de Conversão (Main Panel) */}
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px', background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="font-headline" style={{ fontSize: '18px', color: '#ffffff' }}>
              Funil de conversão
            </h2>
            
            <div style={{ background: '#111726', border: '0.5px solid rgba(255,255,255,0.12)', padding: '10px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total de leads</span>
              <strong className="font-headline" style={{ fontSize: '18px', color: '#ffffff' }}>{totalLeads}</strong>
            </div>
          </div>

          {/* Trapezoids Visual Funnel Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: '12px', marginBottom: '28px' }}>
            
            {/* Total */}
            <div style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)', padding: '20px 14px', textAlign: 'center', border: '0.5px solid rgba(255,255,255,0.12)' }}>
              <div className="font-headline" style={{ fontSize: '28px', color: '#ffffff' }}>{totalLeads}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginTop: '6px' }}>Total</div>
            </div>

            {/* Abordados */}
            <div style={{ background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.05) 100%)', padding: '20px 14px', textAlign: 'center', border: '0.5px solid rgba(56, 189, 248, 0.3)' }}>
              <div className="font-headline" style={{ fontSize: '28px', color: '#38bdf8' }}>{abordados}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', marginTop: '6px' }}>Abordados</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{pctAbordados}% do total</div>
            </div>

            {/* Agendados */}
            <div style={{ background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.05) 100%)', padding: '20px 14px', textAlign: 'center', border: '0.5px solid rgba(34, 197, 94, 0.3)' }}>
              <div className="font-headline" style={{ fontSize: '28px', color: '#22c55e' }}>{agendados}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', marginTop: '6px' }}>Agendados</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{pctAgendados}% dos abordados</div>
            </div>

            {/* Follow Up */}
            <div style={{ background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)', padding: '20px 14px', textAlign: 'center', border: '0.5px solid rgba(245, 158, 11, 0.3)' }}>
              <div className="font-headline" style={{ fontSize: '28px', color: '#f59e0b' }}>{followUp}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', marginTop: '6px' }}>Follow Up</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{pctFollowUp}% dos abordados</div>
            </div>

            {/* Perdidos */}
            <div style={{ background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.05) 100%)', padding: '20px 14px', textAlign: 'center', border: '0.5px solid rgba(239, 68, 68, 0.3)' }}>
              <div className="font-headline" style={{ fontSize: '28px', color: '#ef4444' }}>{perdidos}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', marginTop: '6px' }}>Perdidos</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{pctPerdidos}% dos abordados</div>
            </div>

            {/* Convertidos */}
            <div style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.35) 0%, rgba(99, 102, 241, 0.1) 100%)', padding: '20px 14px', textAlign: 'center', border: '0.5px solid #6366f1' }}>
              <div className="font-headline" style={{ fontSize: '28px', color: '#a5b4fc' }}>{convertidos}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', marginTop: '6px' }}>Convertidos</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{pctConvertidos}% dos agendados</div>
            </div>

          </div>

          {/* Detailed Explanations of KPIs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '20px', borderTop: '0.5px solid rgba(255, 255, 255, 0.12)', fontSize: '12.5px', lineHeight: 1.6 }}>
            <div style={{ color: '#cbd5e1' }}>
              <strong style={{ color: '#6366f1' }}>● Taxa de conversão (Convertidos / Total)</strong> — É o KPI principal de qualquer funil de vendas.
            </div>
            <div style={{ color: '#cbd5e1' }}>
              <strong style={{ color: '#38bdf8' }}>● Taxa de abordagem (Abordados / Total)</strong> — Mostra o quanto do banco de leads está sendo efetivamente trabalhado.
            </div>
            <div style={{ color: '#cbd5e1' }}>
              <strong style={{ color: '#22c55e' }}>● Taxa de agendamento (Agendados / Abordados)</strong> — Mostra a eficiência da ligação fria — quantos que você abordou aceitaram uma reunião.
            </div>
            <div style={{ color: '#cbd5e1' }}>
              <strong style={{ color: '#f59e0b' }}>● Taxa de follow up (Follow Up / Abordados)</strong> — Follow up é um estado transitório, não um resultado. Ter muitos aqui pode ser sinal de pipeline parado.
            </div>
            <div style={{ color: '#cbd5e1' }}>
              <strong style={{ color: '#ef4444' }}>● Taxa de perdidos (Perdidos / Abordados)</strong> — Taxa de perda indica problema no script ou no perfil dos leads sendo abordados.
            </div>
          </div>
        </div>

        {/* 2. Bottom Grid (2 Columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
          
          {/* Column 1: Funil de Leads & Leads Recentes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Funil de Leads Bars */}
            <div className="glass-panel" style={{ padding: '24px', background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="font-headline" style={{ fontSize: '16px', color: '#ffffff' }}>Funil de leads</h3>
                <button onClick={onNavigateCRM} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Ver CRM →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Base', count: totalLeads - abordados, color: '#94a3b8' },
                  { label: 'Abordado', count: abordados, color: '#38bdf8' },
                  { label: 'Agendado', count: agendados, color: '#22c55e' },
                  { label: 'Follow Up', count: followUp, color: '#f59e0b' },
                  { label: 'Convertido', count: convertidos, color: '#6366f1' },
                  { label: 'Perdido', count: perdidos, color: '#ef4444' }
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                    <span style={{ width: '80px', color: '#cbd5e1', fontWeight: '500' }}>● {item.label}</span>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: Math.min(100, (item.count / totalLeads) * 100) + '%', background: item.color }} />
                    </div>
                    <span style={{ width: '30px', textAlign: 'right', color: '#ffffff', fontWeight: '700' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leads Recentes */}
            <div className="glass-panel" style={{ padding: '24px', background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="font-headline" style={{ fontSize: '16px', color: '#ffffff' }}>Leads recentes</h3>
                <button onClick={onNavigateLeads} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  Ver todos →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentLeads.map(l => (
                  <div key={l.id} style={{ padding: '10px 12px', background: '#111726', border: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>{l.nome}</div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>{l.categoria} · {l.cidade}</div>
                    </div>
                    <span className="badge badge-frio" style={{ fontSize: '9px' }}>Base</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column 2: Recomendações Inteligentes & Uso e Atividade */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Recomendações */}
            <div className="glass-panel" style={{ padding: '24px', background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.12)' }}>
              <h3 className="font-headline" style={{ fontSize: '16px', color: '#ffffff', marginBottom: '16px' }}>
                Recomendações
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '0.5px solid rgba(239, 68, 68, 0.3)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>🔴 Conversão abaixo de 10%</div>
                  <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '2px' }}>Gere o site antes de ligar — aumenta credibilidade</div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(56, 189, 248, 0.1)', border: '0.5px solid rgba(56, 189, 248, 0.3)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8' }}>🔵 40 leads abordados sem script</div>
                  <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '2px' }}>Use a IA para gerar roteiro antes da próxima ligação</div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '0.5px solid rgba(239, 68, 68, 0.3)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>🔴 100% dos leads usados</div>
                  <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '2px' }}>Considere upgrade para continuar prospectando</div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', border: '0.5px solid rgba(99, 102, 241, 0.3)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#a5b4fc' }}>🔵 20 leads sem site gerado</div>
                  <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '2px' }}>Mostre o produto antes de fechar — converte mais</div>
                </div>
              </div>
            </div>

            {/* Uso e Atividade */}
            <div className="glass-panel" style={{ padding: '24px', background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="font-headline" style={{ fontSize: '16px', color: '#ffffff' }}>Uso e atividade</h3>
                <span className="mono-label" style={{ color: '#22c55e' }}>Plano: Gratuito</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', fontSize: '12px' }}>
                <div style={{ background: '#111726', padding: '10px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ color: '#94a3b8', fontSize: '10px' }}>Leads este mês</div>
                  <div style={{ fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>40 / 40</div>
                </div>

                <div style={{ background: '#111726', padding: '10px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ color: '#94a3b8', fontSize: '10px' }}>Scripts este mês</div>
                  <div style={{ fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>0 / 10</div>
                </div>

                <div style={{ background: '#111726', padding: '10px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ color: '#94a3b8', fontSize: '10px' }}>Sites gerados</div>
                  <div style={{ fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>2 / 2</div>
                </div>

                <div style={{ background: '#111726', padding: '10px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ color: '#94a3b8', fontSize: '10px' }}>Edições de site</div>
                  <div style={{ fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>0 / 3</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '0.5px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#94a3b8' }}>
                <span>Mensagens WA: <strong style={{ color: '#fff' }}>0</strong></span>
                <span>Scripts ligação: <strong style={{ color: '#fff' }}>0</strong></span>
                <span>Enviadas: <strong style={{ color: '#fff' }}>0</strong></span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
