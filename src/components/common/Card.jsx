/**
 * REPASS AI — DESIGN SYSTEM PRIMITIVE // CARD
 *
 * Componente modular para containers, cartões e painéis.
 * Suporta variantes: 'glass', 'solid', 'elevated', 'hairline'
 */

import React from 'react';

export default function Card({
  children,
  variant = 'glass',
  className = '',
  style = {},
  onClick,
  ...props
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'glass': return 'glass-panel';
      case 'acrilico': return 'acrilico';
      case 'solid': return 'hairline';
      default: return 'glass-panel';
    }
  };

  const baseStyle = {
    padding: '20px',
    // Raio vindo do token: se a marca mudar de canto, muda num lugar só.
    borderRadius: 'var(--raio-lg)',
    ...style,
  };

  return (
    <div
      onClick={onClick}
      className={`${getVariantClass()} ${className}`.trim()}
      style={baseStyle}
      {...props}
    >
      {children}
    </div>
  );
}
