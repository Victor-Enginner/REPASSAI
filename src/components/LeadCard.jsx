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
 * - `ElectricBorder`: entra APENAS em lead com score >= 80. Assim a borda
 *   elétrica passa a significar "oportunidade quente" e o operador aprende
 *   a ler a tela sem precisar de legenda. Se aparecesse em todo card, seria
 *   só enfeite e o olho pararia de registrar.
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
import Cyber3DCard from './ui/Cyber3DCard';

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
        <input
          type="checkbox"
          checked={selecionado}
          onChange={() => onAlternarSelecao(lead.id)}
          aria-label={`Selecionar ${lead.nome}`}
          style={{ marginTop: '3px', width: '17px', height: '17px', accentColor: '#6366f1', flexShrink: 0, cursor: 'pointer' }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="font-headline" style={{
            fontSize: '16px', color: '#ffffff', lineHeight: 1.25, margin: 0,
            letterSpacing: '-0.02em', fontWeight: 800
          }}>
            {lead.nome}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500 }}>
              {lead.categoria}{lead.cidade ? ` · ${lead.cidade}` : ''}
            </span>

            {ehDemo ? (
              <span style={{
                fontSize: '9.5px', fontWeight: 800, fontFamily: 'var(--font-mono)',
                padding: '2px 8px', borderRadius: '4px',
                background: 'rgba(245, 158, 11, 0.16)', color: '#fbbf24',
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
              <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700 }}>{nota}</span>
              {avaliacoes !== null && (
                <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
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
          background: lead.score >= LIMIAR_QUENTE ? 'rgba(34,197,94,0.16)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${lead.score >= LIMIAR_QUENTE ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)'}`,
        }}>
          <span style={{
            fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)',
            color: lead.score >= LIMIAR_QUENTE ? '#22c55e' : '#cbd5e1',
          }}>
            {lead.score ?? '—'}
          </span>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '2px 0' }} />

      {/* Contato e diagnóstico */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <Phone size={13} color={lead.telefone ? '#818cf8' : '#475569'} style={{ flexShrink: 0 }} />
          <span style={{
            color: lead.telefone ? '#ffffff' : '#64748b',
            fontFamily: lead.telefone ? 'var(--font-mono)' : 'inherit',
            fontWeight: lead.telefone ? 700 : 400,
            fontStyle: lead.telefone ? 'normal' : 'italic',
          }}>
            {lead.telefone || 'Sem telefone no perfil do Google'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <MapPin size={13} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ lineHeight: 1.4 }}>{lead.endereco || `${lead.cidade || ''}${lead.estado ? `, ${lead.estado}` : ''}`}</span>
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
            fontSize: '11.5px', color: '#a5b4fc', fontStyle: 'italic',
            lineHeight: 1.5, marginTop: '4px',
            background: 'rgba(99, 102, 241, 0.08)',
            padding: '8px 12px',
            borderRadius: '6px',
            borderLeft: '2px solid #6366f1'
          }}>
            <Lightbulb size={13} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{lead.orientacao}</span>
          </div>
        )}
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
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
    ? 'rgba(99, 102, 241, 0.55)'
    : 'rgba(255, 255, 255, 0.12)';

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
      <Cyber3DCard isHot={ehQuente} style={{ padding: '20px' }}>
        <Conteudo {...props} />
      </Cyber3DCard>
    </article>
  );
}
