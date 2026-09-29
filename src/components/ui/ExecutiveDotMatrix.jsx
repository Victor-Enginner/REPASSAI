import React, { useEffect, useRef, useState } from 'react';

/**
 * REPASS AI — Executive B2B Dot Matrix Canvas
 *
 * Grade de micro-pontos milimétricos técnicos de altíssima precisão.
 * Em repouso: pontos sutis de tinta sobre papel (--papel / #f5f4f0).
 * Ao passar o mouse: onda radial iridescente iluminando os pontos
 * na assinatura cromática da marca (violeta -> ciano -> menta -> dourado).
 */
export default function ExecutiveDotMatrix({
  dotSpacing = 26,
  dotRadius = 1.6,
  interactionRadius = 220,
  idleWave = true,
  theme = 'light',
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false, speed: 0 });
  const lastPointerRef = useRef({ x: -9999, y: -9999, time: performance.now() });
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Escuta redimensionamento fluido
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setSize({
          w: Math.max(1, Math.floor(cr.width)),
          h: Math.max(1, Math.floor(cr.height))
        });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Rastreamento global do cursor com detecção de bounding box
  useEffect(() => {
    const handleMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const inBounds =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inBounds) {
        const now = performance.now();
        const dt = Math.max(1, now - lastPointerRef.current.time);
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;
        const dx = curX - lastPointerRef.current.x;
        const dy = curY - lastPointerRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = Math.min(1.5, (dist / dt) * 1.2);

        pointerRef.current = {
          x: curX,
          y: curY,
          active: true,
          speed: speed
        };
        lastPointerRef.current = { x: curX, y: curY, time: now };
      } else {
        pointerRef.current.active = false;
      }
    };

    const handleLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('blur', handleLeave);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('blur', handleLeave);
    };
  }, []);

  // Loop de renderização em alta performance (HTML5 2D Canvas a 60fps)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = size;
    if (w === 0 || h === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const cols = Math.ceil(w / dotSpacing) + 1;
    const rows = Math.ceil(h / dotSpacing) + 1;

    let animId = 0;
    const startTime = performance.now();

    const draw = (now) => {
      ctx.clearRect(0, 0, w, h);

      const elapsed = (now - startTime) / 1000;
      const pointer = pointerRef.current;

      for (let j = 0; j < rows; j++) {
        const y = j * dotSpacing;
        for (let i = 0; i < cols; i++) {
          const x = i * dotSpacing;

          // Efeito de onda calma em repouso
          let idleFactor = 0;
          if (idleWave) {
            const wave = Math.sin((x * 0.008) + (y * 0.008) - (elapsed * 1.5));
            idleFactor = (wave + 1) * 0.5; // 0..1
          }

          // Cálculo de proximidade do cursor
          let cursorFactor = 0;
          if (pointer.active) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < interactionRadius) {
              const linearFalloff = 1 - (dist / interactionRadius);
              // Curva suave quadrática
              cursorFactor = linearFalloff * linearFalloff;
            }
          }

          // Dimensões e cores do ponto
          const isDark = theme === 'dark';
          let r = dotRadius;
          let fillStyle = isDark ? 'rgba(245, 244, 240, 0.13)' : 'rgba(17, 17, 17, 0.11)';

          if (cursorFactor > 0.02) {
            // Expansão tátil sutil sob o ponteiro
            r = dotRadius + cursorFactor * (isDark ? 2.0 : 1.8);

            if (cursorFactor > 0.65) {
              // Núcleo: Violeta/Íris saturado
              fillStyle = isDark
                ? `rgba(167, 139, 250, ${0.7 + cursorFactor * 0.3})`
                : `rgba(124, 92, 255, ${0.45 + cursorFactor * 0.5})`;
            } else if (cursorFactor > 0.35) {
              // Zona intermediária: Ciano elétrico
              fillStyle = isDark
                ? `rgba(86, 216, 230, ${0.6 + cursorFactor * 0.35})`
                : `rgba(86, 216, 230, ${0.35 + cursorFactor * 0.5})`;
            } else {
              // Borda da onda: Menta / Lilás suave
              fillStyle = isDark
                ? `rgba(124, 231, 196, ${0.4 + cursorFactor * 0.4})`
                : `rgba(124, 231, 196, ${0.25 + cursorFactor * 0.4})`;
            }
          } else if (idleFactor > 0.8) {
            // Pulso sutil no repouso
            r = dotRadius + 0.3;
            fillStyle = isDark ? 'rgba(167, 139, 250, 0.28)' : 'rgba(124, 92, 255, 0.19)';
          }

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = fillStyle;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [size, dotSpacing, dotRadius, interactionRadius, idleWave, theme]);

  return (
    <div
      ref={containerRef}
      className={`executive-dot-matrix-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
}
