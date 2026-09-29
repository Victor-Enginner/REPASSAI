import React, { useState } from 'react';
import {
  GitBranch,
  Play,
  Plus,
  ArrowRight,
  Bot,
  Search,
  PhoneCall,
  MessageSquare,
  Kanban,
  CheckCircle2,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';

export default function FluxosView() {
  const [fluxos, setFluxos] = useState([
    {
      id: 'fluxo-1',
      nome: 'Varredura Maps + Ligação IA + Disparo WhatsApp',
      descricao: 'Prospecta barbearias sem site em SP, liga pelo Tel-Agent para qualificar e envia link da landing gerada.',
      status: 'ativo',
      passos: [
        { tipo: 'prospector', titulo: 'Prospector Scrapling', sub: 'Busca nicho no Google Maps sem custo de API', icone: Search },
        { tipo: 'gerador', titulo: 'Compilador 14ms', sub: 'Gera landing page e publica no Cloudflare R2', icone: Sparkles },
        { tipo: 'calling', titulo: 'Ligação IA (Tel-Agent)', sub: 'Liga pro lead e confirma interesse em receber prévia', icone: PhoneCall },
        { tipo: 'whatsapp', titulo: 'Disparo WhatsApp', sub: 'Envia mensagem personalizada com o link pronto', icone: MessageSquare },
        { tipo: 'crm', titulo: 'Pipeline CRM', sub: 'Move para estágio "Interessado" automaticamente', icone: Kanban },
      ],
      leadsProcessados: 142,
      conversoes: 38
    },
    {
      id: 'fluxo-2',
      nome: 'Recuperação de Leads Frios',
      descricao: 'Reaborda negócios que visualizaram o site gerado mas não responderam em 48h.',
      status: 'pausado',
      passos: [
        { tipo: 'gatilho', titulo: 'Inatividade 48h', sub: 'Lead visualizou o site no R2 mas não agendou', icone: Sliders },
        { tipo: 'ia', titulo: 'Oferta Especial IA', sub: 'Gera desconto de hospedagem ou domínio incluso', icone: Bot },
        { tipo: 'whatsapp', titulo: 'Disparo WhatsApp', sub: 'Mensagem de reengajamento com urgência', icone: MessageSquare }
      ],
      leadsProcessados: 64,
      conversoes: 11
    }
  ]);

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <GitBranch size={22} style={{ color: 'var(--iris-violeta)' }} />
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
              Fluxos de Automação
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 'var(--raio-pill)',
                backgroundColor: 'var(--iris-veil)',
                color: 'var(--tinta)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              MOTOR AGÊNTICO
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--tinta-media)', margin: 0 }}>
            Orquestre a jornada de prospecção, ligações de voz com IA, geração de site e CRM em fluxos contínuos.
          </p>
        </div>

        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: 'var(--acao-fundo)',
            color: 'var(--acao-texto)',
            borderRadius: 'var(--raio-md)',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--sombra-md)'
          }}
        >
          <Plus size={16} />
          Criar Novo Fluxo
        </button>
      </div>

      {/* Lista de Fluxos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {fluxos.map((fluxo) => (
          <div
            key={fluxo.id}
            style={{
              backgroundColor: 'var(--papel-cartao)',
              border: '1px solid var(--aro-cor)',
              borderRadius: 'var(--raio-lg)',
              padding: '20px 24px',
              boxShadow: 'var(--sombra-sm)'
            }}
          >
            {/* Topo do Card de Fluxo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--tinta)' }}>
                    {fluxo.nome}
                  </h3>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: 'var(--raio-pill)',
                      backgroundColor: fluxo.status === 'ativo' ? 'var(--sucesso-fundo)' : 'var(--sobre-08)',
                      color: fluxo.status === 'ativo' ? 'var(--sucesso)' : 'var(--tinta-fraca)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {fluxo.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--tinta-media)', margin: '4px 0 0 0' }}>
                  {fluxo.descricao}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>CONVERSÃO</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tinta)' }}>
                    {fluxo.conversoes} / {fluxo.leadsProcessados} ({Math.round((fluxo.conversoes / fluxo.leadsProcessados) * 100)}%)
                  </div>
                </div>

                <button
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--raio-md)',
                    border: '1px solid var(--aro-cor)',
                    backgroundColor: 'var(--papel-fundo)',
                    color: 'var(--tinta)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Editar Fluxo
                </button>
              </div>
            </div>

            {/* Pipeline de Passos Visuais */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                overflowX: 'auto',
                padding: '16px 0',
                borderTop: '1px solid var(--aro-cor)'
              }}
            >
              {fluxo.passos.map((passo, pIdx) => {
                const Icone = passo.icone;
                return (
                  <React.Fragment key={pIdx}>
                    <div
                      style={{
                        minWidth: '180px',
                        padding: '12px 14px',
                        backgroundColor: 'var(--papel-fundo)',
                        borderRadius: 'var(--raio-md)',
                        border: '1px solid var(--aro-cor)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icone size={14} style={{ color: 'var(--iris-violeta)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tinta)' }}>
                          {passo.titulo}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--tinta-media)', lineHeight: 1.3 }}>
                        {passo.sub}
                      </span>
                    </div>

                    {pIdx < fluxo.passos.length - 1 && (
                      <ArrowRight size={16} style={{ color: 'var(--tinta-fantasma)', flexShrink: 0 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
