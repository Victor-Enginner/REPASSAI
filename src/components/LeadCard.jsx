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

import React, { lazy, Suspense } from 'react';
import { Phone, MapPin, Globe, Send, Star, Lightbulb, FlaskConical } from 'lucide-react';
import SpotlightCard from './ui/SpotlightCard';

// Borda elétrica é pesada (SVG + filtros animados) e só aparece em parte
// dos cards — carrega sob demanda.
const ElectricBorder = lazy(() => import('./ui/ElectricBorder'));

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
    <>
      {/* Topo: seleção, nome e score */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <input
          type="checkbox"
          checked={selecionado}
          onChange={() => onAlternarSelecao(lead.id)}
          aria-label={`Selecionar ${lead.nome}`}
          style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#6366f1', flexShrink: 0, cursor: 'pointer' }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="font-headline" style={{
            fontSize: '15px', color: '#ffffff', lineHeight: 1.25, margin: 0,
            letterSpacing: '-0.01em',
          }}>
            {lead.nome}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {lead.categoria}{lead.cidade ? ` · ${lead.cidade}` : ''}
            </span>

            {ehDemo ? (
              <span style={{
                fontSize: '9px', fontWeight: 800, fontFamily: 'var(--font-mono)',
                padding: '2px 7px', borderRadius: '3px',
                background: 'rgba(245, 158, 11, 0.16)', color: '#fbbf24',
                border: '0.5px solid rgba(245, 158, 11, 0.4)',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
              }}>
                <FlaskConical size={9} /> DEMONSTRAÇÃO
              </span>
            ) : (
              <span className={`badge badge-${(lead.temperatura || '').toLowerCase()}`}>
                {lead.temperatura}
              </span>
            )}
          </div>

          {/* Reputação: some inteira quando não há dado verificado. */}
          {nota !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '7px' }}>
              <Star size={11} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: 600 }}>{nota}</span>
              {avaliacoes !== null && (
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  · {avaliacoes.toLocaleString('pt-BR')} avaliações
                </span>
              )}
            </div>
          )}
        </div>

        {/* Score */}
        <div style={{
          flexShrink: 0, minWidth: '42px', height: '30px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '5px', padding: '0 8px',
          background: lead.score >= LIMIAR_QUENTE ? 'rgba(34,197,94,0.14)' : 'rgba(255,255,255,0.05)',
          border: `0.5px solid ${lead.score >= LIMIAR_QUENTE ? 'rgba(34,197,94,0.45)' : 'rgba(255,255,255,0.14)'}`,
        }}>
          <span style={{
            fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)',
            color: lead.score >= LIMIAR_QUENTE ? '#22c55e' : '#94a3b8',
          }}>
            {lead.score ?? '—'}
          </span>
        </div>
      </div>

      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.09)', margin: '14px 0 12px' }} />

      {/* Contato e diagnóstico */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px' }}>
          <Phone size={12} color={lead.telefone ? '#6366f1' : '#475569'} style={{ flexShrink: 0 }} />
          <span style={{
            color: lead.telefone ? '#e2e8f0' : '#64748b',
            fontFamily: lead.telefone ? 'var(--font-mono)' : 'inherit',
            fontStyle: lead.telefone ? 'normal' : 'italic',
          }}>
            {lead.telefone || 'Sem telefone no perfil do Google'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', color: '#94a3b8' }}>
          <MapPin size={12} color="#64748b" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span style={{ lineHeight: 1.45 }}>{lead.endereco || `${lead.cidade || ''}${lead.estado ? `, ${lead.estado}` : ''}`}</span>
          <span
            className={temSite ? 'badge badge-tem-site' : 'badge badge-sem-site'}
            style={{ marginLeft: 'auto', flexShrink: 0 }}
          >
            {temSite ? 'Tem site' : 'Sem site'}
          </span>
        </div>

        {lead.orientacao && (
          <div style={{
            display: 'flex', gap: '7px', alignItems: 'flex-start',
            fontSize: '11px', color: '#a5b4fc', fontStyle: 'italic',
            lineHeight: 1.5, marginTop: '2px',
          }}>
            <Lightbulb size={12} color="#6366f1" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{lead.orientacao}</span>
          </div>
        )}
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button
          onClick={() => onGerarSite(lead)}
          disabled={ehDemo}
          className="btn-secondary"
          style={{ flex: 1, justifyContent: 'center', fontSize: '11px', opacity: ehDemo ? 0.4 : 1, cursor: ehDemo ? 'not-allowed' : 'pointer' }}
          title={ehDemo ? 'Lead de demonstração' : undefined}
        >
          <Globe size={13} /> {temSite ? 'Ver site' : 'Criar site'}
        </button>

        <button
          onClick={() => onEnviarCRM(lead.id)}
          disabled={ehDemo}
          className="btn-primary"
          style={{ flex: 1.3, justifyContent: 'center', fontSize: '11px', opacity: ehDemo ? 0.4 : 1, cursor: ehDemo ? 'not-allowed' : 'pointer' }}
          title={ehDemo ? 'Configure a GOOGLE_PLACES_API_KEY para varrer leads reais' : undefined}
        >
          <Send size={13} /> Enviar para CRM
        </button>
      </div>
    </>
  );
}

/**
 * @param {object} props
 * @param {object} props.lead
 * @param {boolean} props.selecionado
 * @param {Function} props.onAlternarSelecao
 * @param {Function} props.onEnviarCRM
 * @param {Function} props.onGerarSite
 */
export default function LeadCard(props) {
  const { lead, selecionado } = props;
  const ehQuente = (lead.score ?? 0) >= LIMIAR_QUENTE && !lead.is_demo;

  const corDestaque = selecionado
    ? 'rgba(99, 102, 241, 0.55)'
    : 'rgba(255, 255, 255, 0.12)';

  const miolo = (
    <SpotlightCard
      className="lead-card cursor-target"
      spotlightColor={ehQuente ? 'rgba(34, 197, 94, 0.14)' : 'rgba(99, 102, 241, 0.13)'}
    >
      <Conteudo {...props} />
    </SpotlightCard>
  );

  return (
    <article
      aria-label={`Lead: ${lead.nome}`}
      style={{
        borderRadius: '10px',
        // A borda de seleção fica no wrapper para não brigar com a borda
        // elétrica, que desenha na própria moldura.
        outline: selecionado ? `1.5px solid ${corDestaque}` : 'none',
        outlineOffset: '2px',
        transition: 'outline-color 0.18s ease',
      }}
    >
      {ehQuente ? (
        // Enquanto o chunk da borda carrega, mostra o card normal — nunca
        // um espaço vazio.
        <Suspense fallback={miolo}>
          <ElectricBorder color="#22c55e" speed={0.7} chaos={0.35} borderRadius={10}>
            {miolo}
          </ElectricBorder>
        </Suspense>
      ) : (
        miolo
      )}
    </article>
  );
}
