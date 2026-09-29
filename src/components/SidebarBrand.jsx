import React from 'react';
import RepassLivingLogo from './ui/RepassLivingLogo';

/**
 * REPASS AI — Sidebar Brand Profile Block
 *
 * Cabeçalho oficial do perfil na barra lateral:
 * - Nova logo triangular modular com micro-interação Anti Gravity no hover
 * - Nome "Victor Borsari"
 * - Subtítulo "REPASS AI · PRO"
 * - Tipografia mono e espaçamentos nativos
 */
export default function SidebarBrand({
  name = 'Victor Borsari',
  badge = 'REPASS AI · PRO',
  logoSize = 34,
  style = {}
}) {
  return (
    <div
      className="sidebar-brand-profile"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Emblema Oficial com micro-desconexão modular Anti Gravity no hover */}
      <RepassLivingLogo size={logoSize} interactive={true} />

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span
          className="font-headline"
          style={{
            fontSize: '13.5px',
            fontWeight: 700,
            color: 'var(--tinta)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {name}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: '10px',
            color: 'var(--tinta-fraca)',
            letterSpacing: 'var(--tracking-rotulo)',
            textTransform: 'uppercase',
            marginTop: '2px',
            whiteSpace: 'nowrap'
          }}
        >
          {badge}
        </span>
      </div>
    </div>
  );
}
