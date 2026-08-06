/**
 * REPASS AI — DESIGN SYSTEM PRIMITIVE // BADGE
 *
 * Componente modular para etiquetas e indicadores de status.
 * Suporta tipos: 'quente', 'morno', 'frio', 'sem_site', 'tem_site', 'sucesso', 'alerta', 'erro'
 */

import React from 'react';

export default function Badge({
  children,
  type = 'neutral',
  className = '',
  style = {},
  ...props
}) {
  const getTypeClass = () => {
    switch (type.toLowerCase()) {
      case 'quente': return 'badge-quente';
      case 'morno': return 'badge-morno';
      case 'frio': return 'badge-frio';
      case 'sem_site': case 'sem-site': return 'badge-sem-site';
      case 'tem_site': case 'tem-site': return 'badge-tem-site';
      default: return 'badge';
    }
  };

  return (
    <span
      className={`badge ${getTypeClass()} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </span>
  );
}
