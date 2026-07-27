import React from 'react';

/**
 * REPASS AI - GlowBorder Component
 * 
 * Borda animada em gradiente neon contínuo (Cyan, Verde Neon, Indigo)
 * 100% CSS puro sem Tailwind.
 * 
 * Props:
 * @param {React.ReactNode} children - Conteúdo interno envolvido pela borda brilhante.
 * @param {number} [duration=10] - Duração da animação em segundos.
 * @param {string|string[]} [color=['#38bdf8', '#22c55e', '#6366f1']] - Cor(es) do brilho.
 * @param {number} [borderRadius=16] - Raio da borda em px.
 * @param {number} [borderWidth=1.5] - Espessura da borda em px.
 * @param {object} [style] - Estilos inline adicionais.
 * @param {string} [className=''] - Classes CSS adicionais.
 */
export default function GlowBorder({
  children,
  duration = 10,
  color = ['#38bdf8', '#22c55e', '#6366f1'],
  borderRadius = 16,
  borderWidth = 1.5,
  style = {},
  className = '',
}) {
  const colorArray = Array.isArray(color) ? color : [color];
  const colorString = colorArray.join(', ');

  return (
    <div
      className={`glow-border-container ${className}`}
      style={{
        position: 'relative',
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
        overflow: 'hidden',
        boxShadow: `0 0 20px ${colorArray[0]}22`,
        ...style,
      }}
    >
      {/* Camada da Borda Animada */}
      <div
        style={{
          position: 'absolute',
          inset: `-${borderWidth * 2}px`,
          borderRadius: `${borderRadius + borderWidth}px`,
          background: `conic-gradient(from 0deg at 50% 50%, ${colorString}, ${colorArray[0]})`,
          animation: `glow-border-spin ${duration}s linear infinite`,
          zIndex: 0,
          opacity: 0.85,
        }}
      />

      {/* Conteúdo Interno Isolado */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: `${borderRadius - borderWidth}px`,
          background: 'inherit',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes glow-border-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
