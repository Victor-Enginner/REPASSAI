// Referência visual histórica. Contém dados fictícios e não deve ser ligada ao produto.
import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  FileText,
  Zap,
  Check,
  AlertCircle,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function BillingView() {
  const [planoSelecionado, setPlanoSelecionado] = useState('free');
  const [formasPagamento, setFormasPagamento] = useState([]);

  const faturas = [
    {
      id: 'INV-2026-09-54B06CFF',
      periodo: '2026-09',
      vencimento: '28/09/2026',
      status: 'Pago',
      valor: 'R$ 0'
    }
  ];

  const planos = [
    {
      id: 'free',
      nome: 'Free',
      preco: 'Grátis',
      periodo: '',
      isAtual: true,
      features: ['Até 3 agentes', '1 canal ativo', '1 empresa', '1.000 mensagens/mês']
    },
    {
      id: 'pro',
      nome: 'Pro',
      preco: 'R$ 99',
      periodo: '/mês',
      isAtual: false,
      features: ['Até 10 agentes de IA', '3 canais (WhatsApp + Voz)', '5 empresas', '10.000 mensagens/mês']
    },
    {
      id: 'business',
      nome: 'Business',
      preco: 'R$ 299',
      periodo: '/mês',
      isAtual: false,
      features: ['Agentes de IA ilimitados', 'Canais ilimitados', 'Empresas ilimitadas', 'Disparos ilimitados']
    }
  ];

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1240px', margin: '0 auto', animation: 'fadeIn 0.2s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--tinta)' }}>
          Plano & Assinatura
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--tinta-media)', margin: 0 }}>
          Assinatura, faturas e formas de pagamento de Victor Borsari.
        </p>
      </div>

      {/* Card do Plano Atual e Consumo */}
      <div
        style={{
          backgroundColor: 'var(--papel-cartao)',
          border: '1px solid var(--aro-cor)',
          borderRadius: 'var(--raio-lg)',
          padding: '24px 28px',
          boxShadow: 'var(--sombra-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '36px',
          marginBottom: '32px'
        }}
      >
        {/* Lado Esquerdo: Valor e Renovação */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--tinta-media)', fontWeight: 600 }}>
            Plano Free
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '6px 0 8px 0' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--tinta)' }}>
              R$ 0
            </span>
            <span style={{ fontSize: '14px', color: 'var(--tinta-fraca)' }}>
              /mês
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--tinta-fraca)' }}>
            Renova em 28 de out. de 2026
          </span>
        </div>

        {/* Lado Direito: Barras de Consumo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Agentes */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--tinta-media)' }}>Agentes</span>
              <span style={{ fontWeight: 600, color: 'var(--tinta)', fontFamily: 'var(--font-mono)' }}>1 / 3</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--papel-fundo)', borderRadius: 'var(--raio-pill)', overflow: 'hidden' }}>
              <div style={{ width: '33.3%', height: '100%', backgroundColor: 'var(--tinta)', borderRadius: 'var(--raio-pill)' }} />
            </div>
          </div>

          {/* Canais */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--tinta-media)' }}>Canais</span>
              <span style={{ fontWeight: 600, color: 'var(--tinta)', fontFamily: 'var(--font-mono)' }}>0 / 1</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--papel-fundo)', borderRadius: 'var(--raio-pill)', overflow: 'hidden' }}>
              <div style={{ width: '0%', height: '100%', backgroundColor: 'var(--tinta)', borderRadius: 'var(--raio-pill)' }} />
            </div>
          </div>

          {/* Empresas (100% atingido) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--tinta-media)' }}>Empresas</span>
              <span style={{ fontWeight: 700, color: 'var(--erro)', fontFamily: 'var(--font-mono)' }}>1 / 1 · 100%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--papel-fundo)', borderRadius: 'var(--raio-pill)', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--erro)', borderRadius: 'var(--raio-pill)' }} />
            </div>
          </div>

          {/* Mensagens */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--tinta-media)' }}>Mensagens</span>
              <span style={{ fontWeight: 600, color: 'var(--tinta)', fontFamily: 'var(--font-mono)' }}>0 / 1.000</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--papel-fundo)', borderRadius: 'var(--raio-pill)', overflow: 'hidden' }}>
              <div style={{ width: '0%', height: '100%', backgroundColor: 'var(--tinta)', borderRadius: 'var(--raio-pill)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Seção: Formas de Pagamento */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: 'var(--tracking-rotulo)', textTransform: 'uppercase', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', margin: 0 }}>
            FORMAS DE PAGAMENTO
          </h2>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--raio-md)',
              border: '1px solid var(--aro-cor)',
              backgroundColor: 'var(--papel-cartao)',
              color: 'var(--tinta)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
            Adicionar
          </button>
        </div>

        {/* Box Pontilhado */}
        <div
          style={{
            border: '1px dashed var(--aro-cor-forte)',
            borderRadius: 'var(--raio-lg)',
            backgroundColor: 'var(--papel-cartao)',
            padding: '28px',
            textAlign: 'center',
            color: 'var(--tinta-fraca)',
            fontSize: '13px'
          }}
        >
          Nenhuma forma de pagamento cadastrada.
        </div>
      </div>

      {/* Seção: Faturas */}
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: 'var(--tracking-rotulo)', textTransform: 'uppercase', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', margin: '0 0 12px 0' }}>
          FATURAS
        </h2>

        <div
          style={{
            backgroundColor: 'var(--papel-cartao)',
            border: '1px solid var(--aro-cor)',
            borderRadius: 'var(--raio-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--sombra-sm)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--papel-fundo)', borderBottom: '1px solid var(--aro-cor)' }}>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>FATURA</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>PERÍODO</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>VENCIMENTO</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>STATUS</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>VALOR</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {faturas.map((fat) => (
                <tr key={fat.id}>
                  <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--tinta)', fontWeight: 600 }}>
                    {fat.id}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--tinta-media)' }}>
                    {fat.periodo}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--tinta-media)' }}>
                    {fat.vencimento}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--raio-pill)',
                        backgroundColor: 'var(--sucesso-fundo)',
                        color: 'var(--sucesso)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--sucesso)' }} />
                      {fat.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--tinta)' }}>
                    {fat.valor}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      title="Baixar recibo"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--aro-cor)',
                        padding: '5px 8px',
                        borderRadius: 'var(--raio-sm)',
                        cursor: 'pointer',
                        color: 'var(--tinta-media)'
                      }}
                    >
                      <Download size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção: Mudar de Plano */}
      <div>
        <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: 'var(--tracking-rotulo)', textTransform: 'uppercase', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', margin: '0 0 16px 0' }}>
          MUDAR DE PLANO
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {planos.map((p) => {
            const isAtual = p.id === planoSelecionado;

            return (
              <div
                key={p.id}
                style={{
                  backgroundColor: 'var(--papel-cartao)',
                  border: isAtual ? '2px solid var(--tinta)' : '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-lg)',
                  padding: '24px',
                  boxShadow: 'var(--sombra-sm)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '180px'
                }}
              >
                {isAtual && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '20px',
                      backgroundColor: 'var(--tinta)',
                      color: 'var(--papel)',
                      fontSize: '10px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 8px',
                      borderRadius: 'var(--raio-pill)',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Plano atual
                  </span>
                )}

                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--tinta-media)' }}>
                    {p.nome}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', margin: '8px 0 16px 0' }}>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--tinta)' }}>
                      {p.preco}
                    </span>
                    {p.periodo && (
                      <span style={{ fontSize: '13px', color: 'var(--tinta-fraca)' }}>
                        {p.periodo}
                      </span>
                    )}
                  </div>
                </div>

                {!isAtual && (
                  <button
                    onClick={() => setPlanoSelecionado(p.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '11px',
                      borderRadius: 'var(--raio-md)',
                      backgroundColor: 'var(--acao-fundo)',
                      color: 'var(--acao-texto)',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'opacity 0.15s ease'
                    }}
                  >
                    <Zap size={14} />
                    Fazer upgrade
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
