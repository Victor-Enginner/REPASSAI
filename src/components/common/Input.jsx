/**
 * REPASS AI — DESIGN SYSTEM PRIMITIVE // INPUT
 *
 * Componente modular para campos de formulário (Text, Select, Textarea).
 */

import React from 'react';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  fullWidth = true,
  style = {},
  className = '',
  ...props
}) {
  /*
    A aparência vem da classe `.campo` (index.css) — inclusive o anel de
    foco iridescente. Aqui ficam só as duas coisas que dependem de prop:
    a largura e a borda de erro.
  */
  const baseInputStyle = {
    width: fullWidth ? '100%' : 'auto',
    ...(error ? { borderColor: 'var(--erro)' } : null),
    ...style,
  };

  return (
    <label style={{ display: 'block', marginBottom: '14px', width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <span className="mono-label" style={{ fontSize: '10px', color: 'var(--fg-subtle)', display: 'block', marginBottom: '7px' }}>
          {label}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={baseInputStyle}
        className={`campo ${className}`.trim()}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '11px', color: 'var(--estado-erro)', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
    </label>
  );
}
