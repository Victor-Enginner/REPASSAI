/**
 * REPASS AI — DESIGN SYSTEM PRIMITIVE // MODAL
 *
 * Componente modular para diálogos e janelas modais padronizadas.
 */

import React from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '520px',
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--hairline-color)',
        borderRadius: '10px',
        padding: '28px',
        maxWidth: maxWidth,
        width: '100%',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {subtitle ? (
            <span className="mono-label" style={{ color: 'var(--accent-indigo)' }}>{subtitle}</span>
          ) : <div />}
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            style={{ background: 'none', border: 'none', color: 'var(--fg-bright)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
          >
            ✕
          </button>
        </div>

        {title && (
          <h3 className="font-headline" style={{ fontSize: '20px', color: 'var(--fg-bright)', marginBottom: '16px' }}>
            {title}
          </h3>
        )}

        {children}
      </div>
    </div>
  );
}
