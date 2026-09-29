import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Search,
  Filter,
  MoreVertical,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCheck,
  Clock,
  Volume2,
  ExternalLink,
  Tag
} from 'lucide-react';

export default function AtendimentosView() {
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState('1');
  const [mensagemTexto, setMensagemTexto] = useState('');
  const [filtroCanal, setFiltroCanal] = useState('todos');

  const atendimentos = [
    {
      id: '1',
      nome: 'Barbearia Vintage Cuts',
      contato: '+55 11 98765-4321',
      canal: 'calling_agent',
      canalNome: 'IA Calling (Tel-Agent)',
      ultimaMsg: 'Agente IA apresentou proposta da landing page. Cliente demonstrou interesse.',
      hora: '14:22',
      status: 'qualificado',
      duracaoLigacao: '1m 45s',
      gravacaoDisponivel: true,
      score: 92,
      mensagens: [
        { autor: 'sistema', texto: 'Chamada iniciada via Tel-Agent (Disparo Automático - Prospector)', hora: '14:20' },
        { autor: 'ia', texto: 'Olá! Falo com o responsável pela Barbearia Vintage Cuts?', hora: '14:20' },
        { autor: 'lead', texto: 'Sim, é o Marcos. Quem tá falando?', hora: '14:21' },
        { autor: 'ia', texto: 'Oi Marcos, aqui é a Sofia da REPASS. Notei que sua barbearia é muito bem avaliada no Google Maps mas ainda não possui um site próprio para agendamento online. Montamos uma prévia gratuita do seu site hoje, posso te enviar pelo WhatsApp para você dar uma olhada?', hora: '14:21' },
        { autor: 'lead', texto: 'Pode mandar sim, nesse mesmo número aqui.', hora: '14:22' },
        { autor: 'sistema', texto: 'Lead qualificado com sucesso. Prévia do site enviada via WhatsApp.', hora: '14:22' }
      ]
    },
    {
      id: '2',
      nome: 'Oficina Mecânica Precision',
      contato: '+55 16 99123-8877',
      canal: 'whatsapp',
      canalNome: 'WhatsApp',
      ultimaMsg: 'Qual é o valor para manter o site e o agendamento no ar?',
      hora: '13:50',
      status: 'negociando',
      score: 85,
      mensagens: [
        { autor: 'sistema', texto: 'Mensagem de abordagem enviada com prévia do site', hora: '13:30' },
        { autor: 'lead', texto: 'Gostei do modelo que vocês montaram com os serviços de freio e motor.', hora: '13:45' },
        { autor: 'lead', texto: 'Qual é o valor para manter o site e o agendamento no ar?', hora: '13:50' }
      ]
    },
    {
      id: '3',
      nome: 'Pet Shop Bichos & Mimos',
      contato: '+55 11 97766-5544',
      canal: 'calling_agent',
      canalNome: 'IA Calling (Tel-Agent)',
      ultimaMsg: 'Tentativa de contato - Caixa postal detectada.',
      hora: '11:15',
      status: 'retentar',
      duracaoLigacao: '20s',
      score: 65,
      mensagens: [
        { autor: 'sistema', texto: 'Chamada discada. Caixa postal detectada pelo detector de voz (AMD). Reagendado para daqui 2 horas.', hora: '11:15' }
      ]
    }
  ];

  const atual = atendimentos.find((a) => a.id === atendimentoSelecionado) || atendimentos[0];

  const filtrados = atendimentos.filter((a) => {
    if (filtroCanal === 'todos') return true;
    return a.canal === filtroCanal;
  });

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', margin: 0, overflow: 'hidden' }}>
      {/* Coluna Esquerda: Lista de Conversas e Chamadas */}
      <div
        style={{
          width: '360px',
          borderRight: '1px solid var(--aro-cor)',
          backgroundColor: 'var(--papel-elevado)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}
      >
        {/* Cabeçalho da Lista */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--aro-cor)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} style={{ color: 'var(--iris-violeta)' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--tinta)' }}>Atendimentos</h2>
            </div>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: 'var(--raio-pill)',
                backgroundColor: 'var(--sobre-08)',
                color: 'var(--tinta-media)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {filtrados.length} ativos
            </span>
          </div>

          {/* Filtros rápidos de Canal */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setFiltroCanal('todos')}
              style={{
                flex: 1,
                padding: '6px 8px',
                fontSize: '11px',
                borderRadius: 'var(--raio-sm)',
                border: '1px solid var(--aro-cor)',
                backgroundColor: filtroCanal === 'todos' ? 'var(--papel-cartao)' : 'transparent',
                color: filtroCanal === 'todos' ? 'var(--tinta)' : 'var(--tinta-fraca)',
                fontWeight: filtroCanal === 'todos' ? 600 : 500,
                cursor: 'pointer'
              }}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroCanal('calling_agent')}
              style={{
                flex: 1.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '6px 8px',
                fontSize: '11px',
                borderRadius: 'var(--raio-sm)',
                border: '1px solid var(--aro-cor)',
                backgroundColor: filtroCanal === 'calling_agent' ? 'var(--papel-cartao)' : 'transparent',
                color: filtroCanal === 'calling_agent' ? 'var(--iris-violeta)' : 'var(--tinta-fraca)',
                fontWeight: filtroCanal === 'calling_agent' ? 600 : 500,
                cursor: 'pointer'
              }}
            >
              <PhoneCall size={12} />
              IA Voice
            </button>
            <button
              onClick={() => setFiltroCanal('whatsapp')}
              style={{
                flex: 1.1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '6px 8px',
                fontSize: '11px',
                borderRadius: 'var(--raio-sm)',
                border: '1px solid var(--aro-cor)',
                backgroundColor: filtroCanal === 'whatsapp' ? 'var(--papel-cartao)' : 'transparent',
                color: filtroCanal === 'whatsapp' ? 'var(--sucesso)' : 'var(--tinta-fraca)',
                fontWeight: filtroCanal === 'whatsapp' ? 600 : 500,
                cursor: 'pointer'
              }}
            >
              <MessageSquare size={12} />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Lista de Itens */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filtrados.map((item) => {
            const selecionado = item.id === atendimentoSelecionado;
            return (
              <div
                key={item.id}
                onClick={() => setAtendimentoSelecionado(item.id)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--raio-md)',
                  marginBottom: '6px',
                  cursor: 'pointer',
                  backgroundColor: selecionado ? 'var(--papel-cartao)' : 'transparent',
                  border: selecionado ? '1px solid var(--aro-cor)' : '1px solid transparent',
                  boxShadow: selecionado ? 'var(--sombra-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.canal === 'calling_agent' ? (
                      <PhoneOutgoing size={13} style={{ color: 'var(--iris-violeta)' }} />
                    ) : (
                      <MessageSquare size={13} style={{ color: 'var(--sucesso)' }} />
                    )}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tinta)' }}>
                      {item.nome}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>
                    {item.hora}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--tinta-media)',
                    margin: '0 0 8px 0',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {item.ultimaMsg}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: 'var(--raio-sm)',
                      backgroundColor: 'var(--sobre-08)',
                      color: 'var(--tinta-media)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {item.canalNome}
                  </span>

                  {item.duracaoLigacao && (
                    <span style={{ fontSize: '11px', color: 'var(--tinta-fraca)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} /> {item.duracaoLigacao}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coluna Central: Histórico de Conversa / Transcrição da Ligação */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--papel-fundo)' }}>
        {/* Topo do Atendimento Ativo */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: 'var(--papel-cartao)',
            borderBottom: '1px solid var(--aro-cor)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--tinta)' }}>
                {atual.nome}
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: 'var(--raio-pill)',
                  backgroundColor: atual.status === 'qualificado' ? 'var(--sucesso-fundo)' : 'var(--sobre-08)',
                  color: atual.status === 'qualificado' ? 'var(--sucesso)' : 'var(--tinta-media)',
                  fontWeight: 600
                }}
              >
                {atual.status.toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>
              {atual.contato} · {atual.canalNome}
            </span>
          </div>

          {atual.gravacaoDisponivel && (
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--raio-md)',
                border: '1px solid var(--aro-cor)',
                backgroundColor: 'var(--papel-fundo)',
                color: 'var(--tinta)',
                cursor: 'pointer'
              }}
            >
              <Volume2 size={14} style={{ color: 'var(--iris-violeta)' }} />
              Ouvir Áudio da Chamada IA
            </button>
          )}
        </div>

        {/* Mensagens / Transcrição */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {atual.mensagens.map((msg, idx) => {
            const isSistema = msg.autor === 'sistema';
            const isIA = msg.autor === 'ia';
            const isLead = msg.autor === 'lead';

            if (isSistema) {
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: 'center',
                    padding: '6px 14px',
                    borderRadius: 'var(--raio-pill)',
                    backgroundColor: 'var(--sobre-08)',
                    fontSize: '11px',
                    color: 'var(--tinta-fraca)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {msg.texto}
                </div>
              );
            }

            return (
              <div
                key={idx}
                style={{
                  alignSelf: isLead ? 'flex-start' : 'flex-end',
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isLead ? 'flex-start' : 'flex-end'
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--raio-lg)',
                    borderTopLeftRadius: isLead ? '4px' : 'var(--raio-lg)',
                    borderTopRightRadius: isLead ? 'var(--raio-lg)' : '4px',
                    backgroundColor: isLead ? 'var(--papel-cartao)' : 'var(--acao-fundo)',
                    color: isLead ? 'var(--tinta)' : 'var(--acao-texto)',
                    border: isLead ? '1px solid var(--aro-cor)' : '1px solid transparent',
                    boxShadow: 'var(--sombra-sm)',
                    fontSize: '13.5px',
                    lineHeight: 1.45
                  }}
                >
                  {isIA && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontSize: '10px', color: 'var(--iris-lilas)', fontFamily: 'var(--font-mono)' }}>
                      <Bot size={12} /> Agente de Voz IA
                    </div>
                  )}
                  {msg.texto}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--tinta-fantasma)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  {msg.hora}
                </span>
              </div>
            );
          })}
        </div>

        {/* Input de Envio Manual ou Intervenção */}
        <div style={{ padding: '16px 20px', backgroundColor: 'var(--papel-cartao)', borderTop: '1px solid var(--aro-cor)', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={mensagemTexto}
            onChange={(e) => setMensagemTexto(e.target.value)}
            placeholder="Digite uma mensagem ou comando de IA..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--raio-md)',
              border: '1px solid var(--aro-cor)',
              backgroundColor: 'var(--papel-fundo)',
              color: 'var(--tinta)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
              backgroundColor: 'var(--acao-fundo)',
              color: 'var(--acao-texto)',
              border: 'none',
              borderRadius: 'var(--raio-md)',
              cursor: 'pointer'
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
