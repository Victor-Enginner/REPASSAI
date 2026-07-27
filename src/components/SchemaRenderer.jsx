/**
 * REPASS AI - Renderer Declarativo de Schema.
 *
 * Recebe o schema JSON validado pelo gerador agêntico e monta React real.
 * Este é o último elo do ciclo: prompt -> retrieval -> LLM -> validação ->
 * ESTE ARQUIVO -> página na tela.
 *
 * Nunca faz eval, nunca injeta HTML de string. Só monta componentes que
 * existem no registro de implementações, com props filtradas.
 */

import React, { Suspense } from 'react';
import { obterImplementacao, filtrarProps } from './ui/registry.js';

/**
 * Barreira de erro por bloco.
 *
 * Um shader WebGL que falha (driver antigo, contexto perdido, celular sem
 * suporte) não pode derrubar a página inteira do cliente. Cada bloco é
 * isolado: se quebrar, o resto continua de pé.
 */
class BlocoErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro) {
    console.warn(`[SchemaRenderer] Bloco "${this.props.id}" falhou:`, erro);
  }

  render() {
    if (this.state.erro) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

/** Placeholder enquanto o chunk do componente carrega. */
function CarregandoBloco() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, #05070f 0%, #0a0e1a 100%)',
      }}
    />
  );
}

/**
 * Renderiza um único bloco do schema.
 * @param {{bloco: object, indice: number}} props
 */
function Bloco({ bloco }) {
  const impl = obterImplementacao(bloco.componenteId);

  // Componente do catálogo ainda não materializado em src/. Em produção
  // não mostramos nada; em dev avisamos para não passar despercebido.
  if (!impl) {
    if (import.meta.env?.DEV) {
      return (
        <div
          style={{
            padding: '14px 18px',
            border: '1px dashed #f59e0b',
            color: '#fbbf24',
            fontFamily: 'monospace',
            fontSize: '12px',
            borderRadius: '4px',
          }}
        >
          [dev] "{bloco.componenteId}" está no catálogo mas não foi implementado em
          src/components/ui/. Rode: npm run scaffold:component {bloco.componenteId}
        </div>
      );
    }
    return null;
  }

  const Componente = impl.componente;
  const { props } = filtrarProps(bloco.componenteId, bloco.props);

  return (
    <BlocoErrorBoundary id={bloco.componenteId}>
      <Suspense fallback={<CarregandoBloco />}>
        <Componente {...props} />
      </Suspense>
    </BlocoErrorBoundary>
  );
}

/**
 * Renderiza a landing page inteira a partir do schema validado.
 *
 * Estrutura em duas camadas, conforme o mandato de acessibilidade do
 * blueprint:
 *   - camada visual (canvas/WebGL) em z-index alto, `aria-hidden`
 *   - camada semântica (h1, p, botão) em z-index acima e legível por
 *     leitor de tela
 *
 * Sem isso o site gerado é uma caixa preta para leitor de tela e para o
 * indexador do Google.
 *
 * @param {object} props
 * @param {object} props.schema Schema já validado
 * @param {object} [props.lead] Dados reais do negócio
 * @param {string} [props.altura] Altura do bloco visual
 */
export default function SchemaRenderer({ schema, lead = {}, altura = '520px' }) {
  if (!schema || !Array.isArray(schema.blocos)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
        Nenhum schema para renderizar.
      </div>
    );
  }

  const fundos = schema.blocos.filter((b) => obterImplementacao(b.componenteId)?.ehFundo);
  const conteudos = schema.blocos.filter((b) => !obterImplementacao(b.componenteId)?.ehFundo);

  const titulo = schema.titulo || lead.nome || 'Seu Negócio';
  const subtitulo = schema.subtitulo || '';
  const whatsapp = lead.whatsapp || null;

  return (
    <article
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#05070f',
        color: '#ffffff',
        border: '0.5px solid rgba(255,255,255,0.12)',
      }}
    >
      {/* ---- Camada visual: decorativa, invisível para leitor de tela ---- */}
      <div
        aria-hidden="true"
        style={{ position: 'relative', width: '100%', height: altura, overflow: 'hidden' }}
      >
        {fundos.map((bloco, i) => (
          <div key={`fundo-${bloco.componenteId}-${i}`} style={{ position: 'absolute', inset: 0 }}>
            <Bloco bloco={bloco} indice={i} />
          </div>
        ))}
      </div>

      {/* ---- Camada semântica: o que realmente comunica e indexa ---- */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 'clamp(20px, 5vw, 48px)',
          pointerEvents: 'none',
        }}
      >
        <h1
          style={{
            // Tipografia fluida: o blueprint pede clamp() em vez de px fixo,
            // que é o que quebrava o layout no celular.
            fontSize: 'clamp(28px, 6vw, 56px)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            margin: 0,
            textShadow: '0 2px 24px rgba(0,0,0,0.6)',
          }}
        >
          {titulo}
        </h1>

        {subtitulo && (
          <p
            style={{
              fontSize: 'clamp(14px, 2.2vw, 19px)',
              color: '#cbd5e1',
              maxWidth: '46ch',
              marginTop: '16px',
              lineHeight: 1.55,
              textShadow: '0 1px 12px rgba(0,0,0,0.7)',
            }}
          >
            {subtitulo}
          </p>
        )}

        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Falar no WhatsApp com ${titulo}`}
            style={{
              pointerEvents: 'auto',
              marginTop: '28px',
              background: '#22c55e',
              color: '#04140a',
              padding: '14px 30px',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '15px',
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(34,197,94,0.35)',
            }}
          >
            Falar no WhatsApp
          </a>
        )}
      </div>

      {/* ---- Blocos de conteúdo, no fluxo normal do documento ---- */}
      {conteudos.length > 0 && (
        <section style={{ position: 'relative', padding: 'clamp(20px, 4vw, 36px)' }}>
          {conteudos.map((bloco, i) => (
            <div key={`bloco-${bloco.componenteId}-${i}`} style={{ marginBottom: '24px' }}>
              <Bloco bloco={bloco} indice={i} />
            </div>
          ))}
        </section>
      )}

      <footer
        style={{
          position: 'relative',
          padding: '18px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748b',
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
        }}
      >
        {titulo}
        {lead.cidade ? ` · ${lead.cidade}` : ''}
        {lead.telefone ? ` · ${lead.telefone}` : ''}
      </footer>
    </article>
  );
}
