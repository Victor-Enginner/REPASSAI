/**
 * REPASS AI — DESIGN SYSTEM PRIMITIVE // BUTTON
 *
 * Componente modular para botões do sistema.
 *
 * Variantes:
 *   primary   — tinta sólida sobre papel. A ação principal da tela.
 *   secondary — acrílico. Ação de apoio.
 *   vidro     — acrílico puro, sem rótulo mono. Para barras flutuantes.
 *   pill      — pílula pequena, como o "VERSÃO_BETA" das peças.
 *   ghost     — sem superfície, só texto.
 *
 * O halo iridescente do hover vem das classes em index.css — não há
 * estilo de cor aqui, de propósito.
 */

import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  style = {},
  onClick,
  type = 'button',
  ...props
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn-primary';
      case 'secondary': return 'btn-secondary';
      case 'vidro': return 'btn-vidro';
      case 'pill': return 'btn-pill';
      case 'ghost': return 'btn-ghost';
      default: return 'btn-primary';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm': return { padding: '6px 12px', fontSize: '10px' };
      case 'lg': return { padding: '14px 28px', fontSize: '13px' };
      default: return {};
    }
  };

  const combinedStyle = {
    ...getSizeStyle(),
    width: fullWidth ? '100%' : style.width,
    justifyContent: fullWidth ? 'center' : style.justifyContent || 'flex-start',
    opacity: disabled || loading ? 0.6 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${getVariantClass()} ${className}`.trim()}
      style={combinedStyle}
      {...props}
    >
      {loading ? 'Aguarde…' : children}
    </button>
  );
}
