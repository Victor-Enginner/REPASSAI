import React from 'react';
import { Calendar, Clock, CheckCircle2, Phone, User, MessageSquare, Video } from 'lucide-react';

export default function AppointmentsView({ leads }) {
  const agendados = leads.filter(l => l.status_crm === 'Agendados');

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <span className="mono-label">MODULE // SCHEDULE_APPOINTMENTS_06</span>
          <h1 className="font-headline" style={{ fontSize: '32px', color: '#ffffff', marginTop: '4px' }}>
            AGENDA DE REUNIÕES & DEMOS
          </h1>
          <p style={{ fontSize: '13.5px', color: '#94a3b8', marginTop: '4px' }}>
            Acompanhe suas reuniões agendadas com tomadores de decisão
          </p>
        </div>

        <div style={{ background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.12)', padding: '10px 18px' }}>
          <span className="mono-label" style={{ color: '#f59e0b' }}>{agendados.length} DEMOS AGENDADAS</span>
        </div>
      </div>

      {/* Appointments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {agendados.map(lead => (
          <div 
            key={lead.id}
            className="glass-panel"
            style={{
              padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 160px 180px',
              alignItems: 'center',
              gap: '20px',
              background: '#0a0e1a',
              border: '0.5px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <div>
              <h3 className="font-headline" style={{ fontSize: '16px', color: '#ffffff' }}>
                {lead.nome}
              </h3>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                {lead.categoria} · {lead.cidade}, {lead.estado}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ffffff' }}>
                <Clock size={13} color="#f59e0b" /> Hoje às 15:30h
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                Apresentação de protótipo de site
              </div>
            </div>

            <div>
              <span className="badge badge-morno">
                ● Demo Agendada
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <a 
                href={lead.whatsapp} 
                target="_blank" 
                rel="noreferrer"
                className="btn-secondary" 
                style={{ padding: '8px 14px', fontSize: '10px', textDecoration: 'none' }}
              >
                <Video size={13} /> Entrar na Sala
              </a>
            </div>

          </div>
        ))}

        {agendados.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Nenhum agendamento pendente no momento. Mova leads para a coluna "Agendados" no CRM.
          </div>
        )}
      </div>

    </div>
  );
}
