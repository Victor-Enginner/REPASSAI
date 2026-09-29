import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  Plus,
  Search,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Edit3,
  Bot
} from 'lucide-react';

export default function BaseConhecimentoView() {
  const [documentos, setDocumentos] = useState([
    {
      id: 'doc-1',
      titulo: 'Scripts de Contorno de Objeções (Voz & WhatsApp)',
      categoria: 'Vendas & Abordagem',
      atualizado: 'Hoje, 14:10',
      trechos: 14,
      status: 'indexado',
      descricao: 'Respostas para "já tenho Instagram", "não preciso de site", "quanto custa" e "fala com meu sócio".'
    },
    {
      id: 'doc-2',
      titulo: 'Tabela de Preços & Planos de Manutenção',
      categoria: 'Comercial',
      atualizado: 'Ontem',
      trechos: 8,
      status: 'indexado',
      descricao: 'Valores padrão de setup (R$ 497 a R$ 997) e mensalidades de hospedagem e suporte (R$ 89/mês).'
    },
    {
      id: 'doc-3',
      titulo: 'Proposta de Valor: Negócios Locais sem Site',
      categoria: 'Conhecimento Geral',
      atualizado: '25/09/2026',
      trechos: 22,
      status: 'indexado',
      descricao: 'Estatísticas de buscas no Google Maps, conversão de clientes por agendamento direto e credibilidade.'
    }
  ]);

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Sparkles size={22} style={{ color: 'var(--iris-violeta)' }} />
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
              Base de Conhecimento (RAG)
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
              MEMÓRIA DA IA
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--tinta-media)', margin: 0 }}>
            Alimente o Agente de Voz (Tel-Agent) e o Atendimento com documentos, FAQs e regras comerciais para respostas precisas.
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
          Adicionar Documento
        </button>
      </div>

      {/* Grid de Documentos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '18px' }}>
        {documentos.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: 'var(--papel-cartao)',
              border: '1px solid var(--aro-cor)',
              borderRadius: 'var(--raio-lg)',
              padding: '20px 22px',
              boxShadow: 'var(--sombra-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--raio-sm)',
                    backgroundColor: 'var(--sobre-08)',
                    color: 'var(--tinta-media)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {doc.categoria}
                </span>

                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'var(--sucesso)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600
                  }}
                >
                  <CheckCircle2 size={13} /> INDEXADO
                </span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--tinta)' }}>
                {doc.titulo}
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--tinta-media)', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                {doc.descricao}
              </p>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--aro-cor)',
                paddingTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: 'var(--tinta-fraca)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <span>{doc.trechos} vetores · {doc.atualizado}</span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--tinta-media)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--tinta-fraca)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
