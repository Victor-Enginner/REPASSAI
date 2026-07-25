import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollJourneyLine - REPASS AI / OriginKit Primitive Component
 * Anima uma linha SVG conectora (Journey Line) que se desenha suavemente conforme o scroll da página.
 */
export default function ScrollJourneyLine({ 
  strokeColor = '#6366f1', 
  strokeWidth = 3, 
  glowColor = '#ec4899',
  className = '' 
}) {
  const pathRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentScroll = window.scrollY;
        const progress = Math.min(1, Math.max(0, currentScroll / totalHeight));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength * (1 - scrollProgress)}`;
  }, [scrollProgress]);

  return (
    <div 
      className={className} 
      style={{
        position: 'fixed',
        left: '20px',
        top: 0,
        bottom: 0,
        width: '40px',
        pointerEvents: 'none',
        zIndex: 40
      }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 40 1000" 
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="journeyGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} />
            <stop offset="50%" stopColor={glowColor} />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <filter id="lineGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Linha guia de fundo (Hairline tênue) */}
        <path
          d="M 20 0 L 20 1000"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="4 4"
        />

        {/* Linha ativa que se desenha com o scroll */}
        <path
          ref={pathRef}
          d="M 20 0 L 20 1000"
          stroke="url(#journeyGlow)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          filter="url(#lineGlowFilter)"
          style={{
            transition: 'stroke-dashoffset 0.1s ease-out'
          }}
        />
      </svg>
    </div>
  );
}
