/**
 * REPASS AI - Card de Lead.
 *
 * É a peça onde o operador passa a maior parte do tempo, então ela carrega
 * a hierarquia visual do produto inteiro.
 *
 * EFEITOS COM SIGNIFICADO, NÃO DECORAÇÃO
 * --------------------------------------
 * - `SpotlightCard`: luz acompanha o cursor. Dá vida sem competir com o
 *   conteúdo.
 * - Oportunidade quente: um fio verde discreto na borda esquerda preserva
 *   a leitura da grade e mantém o significado do estado.
 *
 * INTEGRIDADE DE DADOS
 * --------------------
 * Nota e nº de avaliações só renderizam se forem número de verdade.
 * Ausência é ausência: a linha some, não vira "sem avaliações" nem "0".
 * Lead de demonstração é marcado e tem as ações bloqueadas.
 */

import React from 'react';
import { Phone, MapPin, Globe, Send, Star, Lightbulb, FlaskConical } from 'lucide-react';
import SpotlightCard from './ui/SpotlightCard';

/** Score a partir do qual o lead é tratado como oportunidade quente. */
const LIMIAR_QUENTE = 80;

/** Conteúdo interno do card, sem a moldura. */
function Conteudo({ lead, selecionado, onAlternarSelecao, onEnviarCRM, onGerarSite }) {
  const ehDemo = Boolean(lead.is_demo);
  const temSite = lead.status_site === 'tem_site';

  // Só é número se for número. `0` é válido; `null`/`undefined` não.
  const nota = typeof lead.avaliacao === 'number' ? lead.avaliacao : null;
  const avaliacoes = typeof lead.reviewsCount === 'number' ? lead.reviewsCount : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Topo: seleção, nome e score */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <label
          aria-label={`Selecionar ${lead.nome}`}
          style={{
            width: '44px',
            height: '44px',
            margin: '-10px -8px -10px -10px',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={selecionado}
            onChange={() => onAlternarSelecao(lead.id)}
            style={{ width: '17px', height: '17px', accentColor: 'var(--accent-indigo)', cursor: 'pointer' }}
          />
        </label>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="font-headline" style={{
            fontSize: '16px', color: 'var(--fg-white)', lineHeight: 1.25, margin: 0,
            letterSpacing: '-0.02em', fontWeight: 800
          }}>
            {lead.nome}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--fg-soft)', fontWeight: 500 }}>
              {lead.categoria}{lead.cidade ? ` · ${lead.cidade}` : ''}
            </span>

            {ehDemo ? (
              <span style={{
                fontSize: '9.5px', fontWeight: 800, fontFamily: 'var(--font-mono)',
                padding: '2px 8px', borderRadius: '4px',
                background: 'rgba(245, 158, 11, 0.16)', color: 'var(--estado-alerta)',
                border: '0.5px solid rgba(245, 158, 11, 0.4)',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
              }}>
                <FlaskConical size={10} /> DEMONSTRAÇÃO
              </span>
            ) : (
              <span className={`badge badge-${(lead.temperatura || '').toLowerCase()}`}>
                {lead.temperatura}
              </span>
            )}
          </div>

          {/* Reputação: some inteira quando não há dado verificado. */}
          {nota !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '7px' }}>
              <Star size={13} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontSize: '12px', color: 'var(--fg-white)', fontWeight: 700 }}>{nota}</span>
              {avaliacoes !== null && (
                <span style={{ fontSize: '11.5px', color: 'var(--fg-muted)' }}>
                  · {avaliacoes.toLocaleString('pt-BR')} avaliações
                </span>
              )}
            </div>
          )}
        </div>

        {/* Score */}
        <div style={{
          flexShrink: 0, minWidth: '44px', height: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '6px', padding: '0 8px',
          background: lead.score >= LIMIAR_QUENTE ? 'var(--estado-sucesso-suave)' : 'var(--bg-surface)',
          border: `1px solid ${lead.score >= LIMIAR_QUENTE ? 'rgba(22,163,74,0.3)' : 'var(--hairline-color)'}`,
        }}>
          <span style={{
            fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)',
            color: lead.score >= LIMIAR_QUENTE ? 'var(--estado-sucesso)' : 'var(--fg-muted)',
          }}>
            {lead.score ?? '—'}
          </span>
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--hairline-color)', margin: '2px 0' }} />

      {/* Contato e diagnóstico */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <Phone size={13} color={lead.telefone ? 'var(--accent-indigo)' : 'var(--fg-subtle)'} style={{ flexShrink: 0 }} />
          <span style={{
            color: lead.telefone ? 'var(--fg-bright)' : 'var(--fg-subtle)',
            fontFamily: lead.telefone ? 'var(--font-mono)' : 'inherit',
            fontWeight: lead.telefone ? 700 : 400,
            fontStyle: lead.telefone ? 'normal' : 'italic',
          }}>
            {lead.telefone || 'Sem telefone no perfil do Google'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', fontSize: '12px', color: 'var(--fg-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <MapPin size={13} color="var(--fg-subtle)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span data-testid="lead-address" style={{ lineHeight: 1.4, overflowWrap: 'anywhere' }}>{lead.endereco || `${lead.cidade || ''}${lead.estado ? `, ${lead.estado}` : ''}`}</span>
          </div>

          <span
            className={temSite ? 'badge badge-tem-site' : 'badge badge-sem-site'}
            style={{ flexShrink: 0, padding: '3px 9px', borderRadius: '4px', fontWeight: 800 }}
          >
            {temSite ? 'Tem site' : 'Sem site'}
          </span>
        </div>

        {lead.orientacao && (
          <div style={{
            display: 'flex', gap: '8px', alignItems: 'flex-start',
            fontSize: '11.5px', color: 'var(--accent-indigo-forte)', fontStyle: 'italic',
            lineHeight: 1.5, marginTop: '4px',
            background: 'var(--bg-surface)',
            padding: '8px 12px',
            borderRadius: '6px',
            borderLeft: '2px solid var(--accent-indigo)'
          }}>
            <Lightbulb size={13} color="var(--accent-indigo)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{lead.orientacao}</span>
          </div>
        )}
      </div>

      {/* Ações */}
      <div data-testid="lead-actions" style={{ display: 'flex', gap: '10px', marginTop: '8px', minWidth: 0 }}>
        <button
          onClick={() => onGerarSite(lead)}
          disabled={ehDemo}
          className="btn-secondary"
          style={{ flex: 1, justifyContent: 'center', padding: '10px 14px', fontSize: '11.5px', opacity: ehDemo ? 0.4 : 1, cursor: ehDemo ? 'not-allowed' : 'pointer' }}
          title={ehDemo ? 'Lead de demonstração' : undefined}
        >
          <Globe size={14} /> {temSite ? 'Ver site' : 'Criar site'}
        </button>

        <button
          onClick={() => onEnviarCRM(lead.id)}
          disabled={ehDemo}
          className="btn-primary"
          style={{ flex: 1.3, justifyContent: 'center', padding: '10px 14px', fontSize: '11.5px', opacity: ehDemo ? 0.4 : 1, cursor: ehDemo ? 'not-allowed' : 'pointer' }}
          title={ehDemo ? 'Configure a GOOGLE_PLACES_API_KEY para varrer leads reais' : undefined}
        >
          <Send size={14} /> Enviar para CRM
        </button>
      </div>
    </div>
  );
}

export default function LeadCard(props) {
  const { lead, selecionado } = props;
  const ehQuente = (lead.score ?? 0) >= LIMIAR_QUENTE && !lead.is_demo;

  const corDestaque = selecionado
    ? 'var(--accent-indigo)'   // era rgba(99,102,241,.55), índigo fora da paleta
    : 'var(--sobre-12)';

  return (
    <article
      aria-label={`Lead: ${lead.nome}`}
      style={{
        borderRadius: '14px',
        outline: selecionado ? `1.5px solid ${corDestaque}` : 'none',
        outlineOffset: '2px',
        transition: 'outline-color 0.18s ease',
      }}
    >
      {/*
        O SpotlightCard substitui a inclinação 3D e a varredura contínua.
        Ele atualiza variáveis CSS diretamente, sem re-render do React em
        cada movimento do cursor. Na grade de leads, o movimento reforça
        o foco sem inclinar telefone, endereço ou ações.
      */}
      <SpotlightCard
        className={`lead-card ${ehQuente ? 'lead-quente' : ''}`}
        spotlightColor="var(--sobre-10)"
      >
        <Conteudo {...props} />
      </SpotlightCard>
    </article>
  );
}
