import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * REPASS AI — Living Holographic Brand Asset
 *
 * Baseado na identidade geométrica oficial (isométrica, facetas cristalinas
 * e refração iridescente / RGB spectrum dos pôsteres da marca).
 *
 * Características interativas:
 * 1. Física 3D tátil sob o cursor (perspective tilt + micro-rotação X/Y).
 * 2. Refletor especular móvel que desliza pelas facetas conforme o mouse passa.
 * 3. Espectro RGB vivo ("Sistema Vivo"): transição contínua entre violeta,
 *    azul, ciano, menta, dourado e rosa.
 * 4. Estado de trabalho (`isWorking={true}`): acelera a pulsação cromática
 *    quando uma operação de IA / varredura está em andamento.
 */
export default function RepassLivingLogo({
  size = 32,
  className = '',
  style = {},
  showWordmark = false,
  wordmarkSize = 18,
  subtitle = 'AI OPERATING SYSTEM',
  isWorking = false,
  interactive = true,
  onClick
}) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Converte para coordenadas centradas (-0.5 a +0.5)
    const tiltX = (y - 0.5) * -22; // Invertido para rotação natural
    const tiltY = (x - 0.5) * 22;

    setTilt({ x: tiltX, y: tiltY, active: true });
    setGlarePos({ x: Math.round(x * 100), y: Math.round(y * 100) });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, active: false });
    setGlarePos({ x: 50, y: 50 });
  };

  const logoId = useRef(`repass-logo-${Math.random().toString(36).substr(2, 9)}`).current;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`repass-living-logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: showWordmark ? '12px' : 0,
        cursor: onClick ? 'pointer' : 'default',
        perspective: '800px',
        userSelect: 'none',
        ...style
      }}
    >
      <motion.div
        animate={{
          rotateX: tilt.active ? tilt.x : 0,
          rotateY: tilt.active ? tilt.y : 0,
          scale: tilt.active ? 1.06 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 20,
          mass: 0.5
        }}
        style={{
          width: size,
          height: size,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow atmosférico vivo pulsante atrás do emblema */}
        <motion.div
          animate={{
            opacity: isWorking ? [0.6, 0.95, 0.6] : tilt.active ? 0.75 : [0.25, 0.45, 0.25],
            scale: isWorking ? [1, 1.25, 1] : tilt.active ? 1.15 : [0.95, 1.05, 0.95]
          }}
          transition={{
            duration: isWorking ? 1.2 : 3.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            inset: '-15%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--iris-violeta) 0%, var(--iris-ciano) 40%, transparent 75%)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Vetor do Emblema Isométrico Oficial do REPASS AI */}
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="REPASS AI Logo"
          style={{
            position: 'relative',
            zIndex: 1,
            overflow: 'visible',
            filter: 'drop-shadow(0 4px 12px rgba(124, 92, 255, 0.25))'
          }}
        >
          <defs>
            {/* Espectro Iridescente Principal */}
            <linearGradient id={`${logoId}-iris`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--iris-violeta)" />
              <stop offset="22%" stopColor="var(--iris-azul)" />
              <stop offset="48%" stopColor="var(--iris-ciano)" />
              <stop offset="68%" stopColor="var(--iris-menta)" />
              <stop offset="86%" stopColor="var(--iris-dourado)" />
              <stop offset="100%" stopColor="var(--iris-pessego)" />
            </linearGradient>

            {/* Brilho Especular Interativo (acompanha o cursor) */}
            <linearGradient
              id={`${logoId}-specular`}
              x1={`${glarePos.x - 40}%`}
              y1={`${glarePos.y - 40}%`}
              x2={`${glarePos.x + 40}%`}
              y2={`${glarePos.y + 40}%`}
            >
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
              <stop offset="45%" stopColor="rgba(255, 255, 255, 0.3)" />
              <stop offset="70%" stopColor="rgba(255, 255, 255, 0.05)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>

            {/* Sombra de Faceta / Profundidade Isométrica */}
            <linearGradient id={`${logoId}-depth`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0.35)" />
            </linearGradient>

            {/* Máscara de chanfro e aresta afiada */}
            <linearGradient id={`${logoId}-edge`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--iris-ciano)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.9)" />
              <stop offset="100%" stopColor="var(--iris-rosa)" />
            </linearGradient>
          </defs>

          {/* FACETAS DA FITA SUPERIOR (Chevron Alto do R) */}
          {/* Corpo Principal Superior */}
          <path
            d="M50 14L84 33.5L68 43L50 32.5L32 43L16 33.5L50 14Z"
            fill={`url(#${logoId}-iris)`}
          />
          {/* Chanfro de Luz Superior */}
          <path
            d="M50 14L84 33.5L78 37L50 21L22 37L16 33.5L50 14Z"
            fill={`url(#${logoId}-specular)`}
            opacity="0.85"
          />

          {/* HASTE LATERAL E LOOP CENTRAL (Conexão do R) */}
          <path
            d="M16 33.5L32 43V60L16 51V33.5Z"
            fill={`url(#${logoId}-depth)`}
            opacity="0.75"
          />
          <path
            d="M16 33.5L32 43V60L16 51V33.5Z"
            fill={`url(#${logoId}-iris)`}
            opacity="0.85"
          />

          {/* FACETAS DA FITA INFERIOR INTERLIGADA (Perna e Losango do R) */}
          <path
            d="M50 48L68 58.5L84 49V68L50 87.5L34 78V60L50 69.5L66 60L50 51L34 60L34 78L50 87.5L84 68V49L68 58.5L50 48Z"
            fill={`url(#${logoId}-iris)`}
          />

          {/* Perna Diagonal Direita Projetada para Frente */}
          <path
            d="M50 51L68 40.5L84 49.5L66 60L50 51Z"
            fill={`url(#${logoId}-iris)`}
          />
          <path
            d="M66 60L84 70.5L72 77.5L56 67L66 60Z"
            fill={`url(#${logoId}-specular)`}
            opacity="0.9"
          />
          <path
            d="M56 67L72 77.5L60 85L44 74.5L56 67Z"
            fill={`url(#${logoId}-depth)`}
            opacity="0.85"
          />

          {/* LINHAS DE ARESTA DE PRECISÃO (Prismatic Wireframe Glow) */}
          <path
            d="M50 14L84 33.5L68 43L50 32.5L32 43L16 33.5L50 14Z"
            stroke={`url(#${logoId}-edge)`}
            strokeWidth="1.2"
            strokeLinejoin="round"
            opacity="0.8"
          />
          <path
            d="M50 48L68 58.5L50 69.5L32 59L50 48Z"
            stroke={`url(#${logoId}-edge)`}
            strokeWidth="1.2"
            strokeLinejoin="round"
            opacity="0.75"
          />
          <path
            d="M50 69.5L50 87.5"
            stroke={`url(#${logoId}-edge)`}
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Ponto de Reflexo Dinâmico Central (Micro-lens flare) */}
          <circle
            cx={glarePos.x * 0.6 + 20}
            cy={glarePos.y * 0.6 + 20}
            r="3.5"
            fill="white"
            filter="drop-shadow(0 0 4px var(--iris-ciano))"
            opacity={tilt.active ? 0.9 : 0.4}
          />
        </svg>
      </motion.div>

      {/* Tipografia de Apoio Opcional (Wordmark "REPASS AI") */}
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
