import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * REPASS AI — Nova Logo Oficial Geométrica Modular (Anti Gravity Living Emblem)
 *
 * Emblema triangular de alta precisão formado por 3 segmentos geométricos
 * interligados com simetria rotacional de 120° (referência oficial aprovada).
 *
 * Comportamento "Anti Gravity Vivo":
 * - Estado de repouso: Presença elegante, ultra-nítida e sofisticada com halo sutil.
 * - Hover tátil: Micro-desconexão controlada dos 3 módulos geométricos
 *   (translate radial suave + micro-rotação de alinhamento modular)
 *   retornando com amortecimento físico elástico (tecnologia transformer silenciosa).
 * - Adaptação nativa a Dark UI e Light Mode com alto contraste e legibilidade.
 */
export default function RepassLivingLogo({
  size = 32,
  className = '',
  style = {},
  showWordmark = false,
  wordmarkSize = 18,
  subtitle = 'AI OPERATING SYSTEM',
  interactive = true,
  onClick
}) {
  const [isHovered, setIsHovered] = useState(false);
  const logoId = useRef(`repass-brand-${Math.random().toString(36).substr(2, 7)}`).current;

  // Curva de amortecimento modular (tecnologia suave de 350ms)
  const springTransition = {
    type: 'spring',
    stiffness: 340,
    damping: 24,
    mass: 0.6
  };

  return (
    <div
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onClick={onClick}
      className={`repass-brand-emblem-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: showWordmark ? '12px' : 0,
        cursor: onClick || interactive ? 'pointer' : 'default',
        userSelect: 'none',
        position: 'relative',
        ...style
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {/* Halo Atmosférico Anti-Gravity Vivo (Respiração Subterrânea Muito Sutil) */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.65 : [0.18, 0.32, 0.18],
            scale: isHovered ? 1.2 : [0.95, 1.05, 0.95]
          }}
          transition={{
            duration: isHovered ? 0.3 : 3.8,
            repeat: isHovered ? 0 : Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            inset: '-10%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--iris-violeta) 0%, var(--iris-ciano) 45%, transparent 72%)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Emblema Vetorial Oficial dos 3 Módulos Triangulares */}
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="REPASS AI Official Emblem"
          style={{
            position: 'relative',
            zIndex: 1,
            overflow: 'visible'
          }}
        >
          <defs>
            {/* Gradiente Holográfico Suave para Arestas */}
            <linearGradient id={`${logoId}-iris`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--iris-violeta)" />
              <stop offset="50%" stopColor="var(--iris-ciano)" />
              <stop offset="100%" stopColor="var(--iris-menta)" />
            </linearGradient>

            {/* Specular Glare suave no hover */}
            <linearGradient id={`${logoId}-specular`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.75)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.15)" />
            </linearGradient>
          </defs>

          {/* MÓDULO 1: Segmento Superior Esquerdo (Arm Left) */}
          <motion.g
            animate={{
              x: isHovered ? -3.0 : 0,
              y: isHovered ? -2.2 : 0,
              rotate: isHovered ? -1.8 : 0
            }}
            transition={springTransition}
            style={{ transformOrigin: '35% 35%' }}
          >
            <path
              d="M 46.25 10.71 L 59.14 10.88 L 49.02 26.87 L 55.77 27.09 L 38.14 55.28 L 37.87 55.55 L 30.08 55.50 L 45.97 29.59 L 38.19 29.43 L 17.84 61.32 L 5.00 61.32 L 15.61 43.74 L 24.53 29.70 L 24.48 29.43 L 15.83 29.38 L 23.23 17.19 L 23.50 16.92 L 34.27 16.92 L 27.91 26.98 L 36.34 27.04 L 46.25 10.71 Z"
              fill="var(--tinta)"
            />
            {/* Filete de luz iridescente sutil */}
            <motion.path
              d="M 46.25 10.71 L 59.14 10.88 L 49.02 26.87 L 55.77 27.09 L 38.14 55.28"
              stroke={`url(#${logoId}-iris)`}
              strokeWidth="0.8"
              opacity={isHovered ? 0.9 : 0.35}
            />
          </motion.g>

          {/* MÓDULO 2: Segmento Direito (Arm Right) */}
          <motion.g
            animate={{
              x: isHovered ? 3.4 : 0,
              y: isHovered ? -0.8 : 0,
              rotate: isHovered ? 1.8 : 0
            }}
            transition={springTransition}
            style={{ transformOrigin: '72% 48%' }}
          >
            <path
              d="M 63.66 10.71 L 83.74 43.63 L 83.90 43.80 L 84.39 43.09 L 87.93 37.27 L 95.05 48.75 L 88.91 57.62 L 82.81 47.71 L 78.40 54.73 L 87.00 68.77 L 79.11 79.60 L 70.95 65.13 L 67.41 70.08 L 50.76 42.44 L 55.60 34.11 L 71.98 60.83 L 72.26 61.10 L 72.42 60.94 L 75.90 55.82 L 65.34 37.00 L 56.64 22.41 L 63.66 10.71 Z"
              fill="var(--tinta)"
            />
            {/* Filete de luz iridescente sutil */}
            <motion.path
              d="M 63.66 10.71 L 83.74 43.63 L 87.93 37.27 L 95.05 48.75"
              stroke={`url(#${logoId}-iris)`}
              strokeWidth="0.8"
              opacity={isHovered ? 0.9 : 0.35}
            />
          </motion.g>

          {/* MÓDULO 3: Segmento Inferior (Arm Bottom) */}
          <motion.g
            animate={{
              x: isHovered ? -0.4 : 0,
              y: isHovered ? 3.4 : 0,
              rotate: isHovered ? 1.0 : 0
            }}
            transition={springTransition}
            style={{ transformOrigin: '42% 76%' }}
          >
            <path
              d="M 21.43 59.36 L 57.45 59.36 L 61.59 66.11 L 28.18 66.32 L 32.15 72.91 L 71.28 72.96 L 77.32 83.03 L 38.95 83.19 L 42.65 89.18 L 28.72 89.29 L 23.23 80.42 L 33.95 80.36 L 30.52 74.32 L 30.25 74.05 L 12.62 74.05 L 6.69 64.42 L 24.15 64.37 L 24.10 63.88 L 21.38 59.63 L 21.43 59.36 Z"
              fill="var(--tinta)"
            />
            {/* Filete de luz iridescente sutil */}
            <motion.path
              d="M 12.62 74.05 L 30.25 74.05 L 71.28 72.96 L 77.32 83.03"
              stroke={`url(#${logoId}-iris)`}
              strokeWidth="0.8"
              opacity={isHovered ? 0.9 : 0.35}
            />
          </motion.g>
        </svg>
      </div>

      {/* Tipografia de Apoio (Wordmark REPASS AI) */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="font-headline"
              style={{
                fontSize: `${wordmarkSize}px`,
                letterSpacing: '-0.04em',
                color: 'var(--fg-bright)',
                lineHeight: 1
              }}
            >
              REPASS
            </span>
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'var(--accent-indigo)',
                display: 'inline-block'
              }}
            />
            <span
              className="mono-label"
              style={{
                color: 'var(--accent-indigo)',
                fontSize: `${Math.max(9, wordmarkSize * 0.45)}px`,
                letterSpacing: '0.15em'
              }}
            >
              AI
            </span>
          </div>

          {subtitle && (
            <span
              className="mono-label"
              style={{
                fontSize: `${Math.max(7.5, wordmarkSize * 0.38)}px`,
                letterSpacing: '0.28em',
                color: 'var(--fg-muted)',
                marginTop: '3px'
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
