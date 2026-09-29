import React, { useState } from 'react';
import {
  MessageCircle,
  PhoneCall,
  Mail,
  Bot,
  CheckCircle2,
  AlertCircle,
  Radio,
  Settings,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function CanaisView() {
  const [canais, setCanais] = useState([
    {
      id: 'tel_agent',
      nome: 'IA Calling Agent (Tel-Agent / Voz)',
      tipo: 'Voz & Telefonia',
      status: 'conectado',
      descricao: 'Agente telefônico autônomo com LLM em tempo real e detecção de voz para prospecção ativa.',
      referencia: 'github.com/Dpro-at/Tel-Agent',
      detalhes: 'SIP Trunking Ativo · STT Whisper / TTS ElevenLabs · 3 linhas simultâneas',
      icone: PhoneCall
    },
    {
      id: 'whatsapp_evo',
      nome: 'WhatsApp API (Instância Principal)',
      tipo: 'Mensageria Instantânea',
      status: 'conectado',
      descricao: 'Envio de abordagens 1-a-1 com imagem do site compilado e link de prévia hospedado no R2.',
      detalhes: '+55 11 99882-1234 · 98% entregabilidade · QR Code validado',
      icone: MessageCircle
    },
    {
      id: 'maps_scrapling',
      nome: 'Google Maps Prospector (Scrapling Core)',
      tipo: 'Motor de Coleta',
      status: 'conectado',
      descricao: 'Scraper invisível indetectável de estabelecimentos locais sem custo por requisição.',
      referencia: 'github.com/d4vinci/Scrapling',
      detalhes: 'Bypasses Cloudflare & Bot-Detection · Extrai Telefone, WhatsApp e Instagram',
      icone: Bot
    },
    {
      id: 'smtp_notif',
      nome: 'E-mail Transacional / SMTP',
      tipo: 'Notificações',
      status: 'pendente',
      descricao: 'Notificações de novos leads quentes e relatórios semanais de vendas.',
      detalhes: 'Servidor smtp.resend.com (Aguardando verificação de DNS)',
      icone: Mail
    }
  ]);

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <MessageCircle size={22} style={{ color: 'var(--iris-violeta)' }} />
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
              Canais & Conectores
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 'var(--raio-pill)',
                backgroundColor: 'var(--sucesso-fundo)',
                color: 'var(--sucesso)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              3 ONLINE
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--tinta-media)', margin: 0 }}>
            Gerencie os canais de voz por IA (Tel-Agent), WhatsApp, scrapers e mensageria integrados ao seu Workspace.
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
          Conectar Novo Canal
        </button>
      </div>

      {/* Grid de Canais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '18px' }}>
        {canais.map((canal) => {
          const Icone = canal.icone;
          const isConectado = canal.status === 'conectado';

          return (
            <div
              key={canal.id}
              style={{
                backgroundColor: 'var(--papel-cartao)',
                border: '1px solid var(--aro-cor)',
                borderRadius: 'var(--raio-lg)',
                padding: '22px',
                boxShadow: 'var(--sombra-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--raio-md)',
                      backgroundColor: 'var(--papel-fundo)',
                      border: '1px solid var(--aro-cor)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icone size={20} style={{ color: 'var(--iris-violeta)' }} />
                  </div>

                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 'var(--raio-pill)',
                      backgroundColor: isConectado ? 'var(--sucesso-fundo)' : 'var(--sobre-08)',
                      color: isConectado ? 'var(--sucesso)' : 'var(--tinta-fraca)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isConectado ? 'var(--sucesso)' : 'var(--tinta-fraca)'
                      }}
                    />
                    {isConectado ? 'CONECTADO' : 'PENDENTE'}
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--tinta)' }}>
                  {canal.nome}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '10px' }}>
                  {canal.tipo}
                </span>

                <p style={{ fontSize: '12.5px', color: 'var(--tinta-media)', lineHeight: 1.4, margin: '0 0 14px 0' }}>
                  {canal.descricao}
                </p>

                {canal.referencia && (
                  <div style={{ fontSize: '11px', color: 'var(--iris-violeta)', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                    Referência: {canal.referencia}
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--aro-cor)',
                  paddingTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--tinta-fraca)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {canal.detalhes}
                </span>

                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: 'var(--raio-md)',
                    border: '1px solid var(--aro-cor)',
                    backgroundColor: 'var(--papel-fundo)',
                    color: 'var(--tinta)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Settings size={13} />
                  Configurar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
