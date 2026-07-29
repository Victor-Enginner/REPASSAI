/**
 * REPASS AI - Barreira de Erro por View.
 *
 * POR QUE ISTO EXISTE
 * -------------------
 * Sem barreira, um erro em QUALQUER view derruba a árvore React inteira e
 * o app vira tela branca — parece que "não inicia mais nada", quando na
 * verdade só uma aba está quebrada.
 *
 * Foi exatamente o que aconteceu: `ProjectsView` chamava um método
 * inexistente do DocumentDatabase, lançava TypeError e matava o aplicativo
 * todo.
 *
 * Com esta barreira, a aba quebrada mostra um aviso e o resto do sistema
 * continua funcionando. Isso importa ainda mais quando há mais de uma
 * pessoa (ou agente) editando o mesmo projeto.
 */

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ViewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    // O stack completo vai para o console, para diagnóstico.
    console.error(`[REPASS] View "${this.props.nome || '?'}" quebrou:`, erro, info);
  }

  componentDidUpdate(prevProps) {
    // Ao trocar de aba, limpa o erro para a nova view tentar montar.
    if (prevProps.nome !== this.props.nome && this.state.erro) {
      this.setState({ erro: null });
    }
  }

  render() {
    if (!this.state.erro) return this.props.children;

    return (
      <div style={{ padding: 'clamp(24px, 5vw, 48px)', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.06)',
          border: '0.5px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '4px',
          padding: 'clamp(20px, 4vw, 32px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <AlertTriangle size={20} color="#f87171" />
            <h2 className="font-headline" style={{ fontSize: '20px', color: 'var(--estado-erro-suave)', margin: 0 }}>
              ESTA ABA FALHOU
            </h2>
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--fg-soft)', lineHeight: 1.65, marginBottom: '16px' }}>
            O módulo <strong style={{ color: 'var(--fg-white)' }}>{this.props.nome || 'desconhecido'}</strong> encontrou
            um erro e foi isolado. O restante do sistema continua funcionando —
            use a barra lateral para navegar normalmente.
          </p>

          <pre style={{
            background: 'var(--bg-deep)',
            border: '0.5px solid rgba(255,255,255,0.12)',
            padding: '12px',
            fontSize: '11.5px',
            color: 'var(--estado-erro)',
            fontFamily: 'var(--font-mono, monospace)',
            whiteSpace: 'pre-wrap',
            overflowX: 'auto',
            marginBottom: '18px',
          }}>
            {String(this.state.erro?.message || this.state.erro)}
          </pre>

          <button
            onClick={() => this.setState({ erro: null })}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '9px 16px' }}
          >
            <RotateCcw size={13} /> Tentar montar novamente
          </button>
        </div>
      </div>
    );
  }
}
