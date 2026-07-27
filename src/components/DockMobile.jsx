/**
 * REPASS AI - Dock de ações rápidas (somente mobile).
 *
 * Com a Sidebar virando gaveta abaixo de 1024px, trocar de tela passou a
 * exigir dois toques: abrir a gaveta, escolher. Para as 4 telas mais
 * usadas isso é atrito desnecessário.
 *
 * O dock resolve com um toque só. Fica fixo no rodapé, respeita a área
 * segura do iPhone e some no desktop, onde a Sidebar já está sempre
 * visível.
 *
 * Deliberadamente 4 itens, não 11: dock com tudo vira outra sidebar.
 */

import React from 'react';
import { Search, Kanban, PlusCircle, Cpu } from 'lucide-react';
import { useEhMobile } from '../hooks/useMediaQuery';

/** As 4 telas do fluxo principal: achar → trabalhar → entregar → configurar. */
const ITENS = [
  { id: 'leads',     nome: 'Leads',   icon: Search },
  { id: 'crm',       nome: 'Funil',   icon: Kanban },
  { id: 'editor',    nome: 'Criar',   icon: PlusCircle },
  { id: 'engine',    nome: 'Motor',   icon: Cpu },
];

/**
 * @param {object} props
 * @param {string} props.currentTab
 * @param {Function} props.setCurrentTab
 */
export default function DockMobile({ currentTab, setCurrentTab }) {
  const ehMobile = useEhMobile();

  // Na landing e no login o dock não faz sentido: não há para onde navegar.
  if (!ehMobile || currentTab === 'landing') return null;

  return (
    <nav
      aria-label="Ações rápidas"
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        // Acima da área segura do iPhone (barra de gestos).
        bottom: 'max(14px, env(safe-area-inset-bottom))',
        zIndex: 50,
        display: 'flex',
        gap: '4px',
        padding: '6px',
        borderRadius: '16px',
        background: 'rgba(10, 14, 26, 0.92)',
        border: '0.5px solid rgba(255, 255, 255, 0.16)',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55)',
        maxWidth: 'calc(100vw - 28px)',
      }}
    >
      {ITENS.map(({ id, nome, icon: Icone }) => {
        const ativo = currentTab === id;
        return (
          <button
            key={id}
            onClick={() => setCurrentTab(id)}
            aria-label={nome}
            aria-current={ativo ? 'page' : undefined}
            style={{
              minWidth: '62px',
              minHeight: '52px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 8px',
              border: 'none',
              borderRadius: '11px',
              cursor: 'pointer',
              background: ativo ? 'rgba(99, 102, 241, 0.22)' : 'transparent',
              transition: 'background 0.18s ease',
            }}
          >
            <Icone size={18} color={ativo ? '#a5b4fc' : '#94a3b8'} />
            <span style={{
              fontSize: '9.5px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.03em',
              color: ativo ? '#ffffff' : '#94a3b8',
            }}>
              {nome}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
