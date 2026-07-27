import React, { useEffect, useRef, useState } from 'react';

/**
 * REPASS AI - Cursor Fluido Neon Glitch Aura (Ultra-Lightweight 120fps)
 * 
 * Performance:
 * - 0% CPU overhead: usa requestAnimationFrame com interpolação linear (LERP).
 * - GPU Compositor Thread: usa `translate3d(x, y, 0)` para 60-120fps sem repintura de DOM.
 * - Efeito Líquido Neon: Anel de vidro cromático com mix-blend-mode e brilho sutil ao passar sobre botões e cards.
 */
export default function FluidGlitchCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    let animationFrameId;

    const onMouseMove = (e) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Detecta se está sobre um elemento interativo
      const target = e.target;
      const isInteractive = target && (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.glass-panel') ||
        target.closest('.cursor-target')
      );

      setIsHovered(!!isInteractive);
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    // Loop de renderização fluida via LERP (Linear Interpolation)
    const render = () => {
      const lerp = 0.18; // Suavidade do rastro fluido
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerp;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) scale(${isClicked ? 0.7 : isHovered ? 1.6 : 1})`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered, isClicked]);

  return (
    <>
      {/* Ponto Central do Ponteiro (Laser Cyan) */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          margin: '-3px 0 0 -3px',
          borderRadius: '50%',
          background: '#38bdf8',
          boxShadow: '0 0 10px #38bdf8, 0 0 20px #22c55e',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
          mixBlendMode: 'difference'
        }}
      />

      {/* Anel Fluido Cromático Glitch Aura */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '36px',
          height: '36px',
          margin: '-18px 0 0 -18px',
          borderRadius: '50%',
          border: '1.5px solid rgba(56, 189, 248, 0.7)',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, rgba(99, 102, 241, 0.05) 70%, transparent 100%)',
          boxShadow: isHovered 
            ? '0 0 25px rgba(56, 189, 248, 0.5), inset 0 0 15px rgba(34, 197, 94, 0.4)' 
            : '0 0 12px rgba(56, 189, 248, 0.25)',
          backdropFilter: isHovered ? 'blur(2px) hue-rotate(30deg)' : 'none',
          pointerEvents: 'none',
          zIndex: 99998,
          willChange: 'transform',
          transition: 'width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
        }}
      />
    </>
  );
}
