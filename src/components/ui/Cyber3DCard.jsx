import React, { useRef, useState } from 'react';
import './Cyber3DCard.css';

/**
 * REPASS AI - Cyber3DCard Component
 * 
 * Card 3D dinâmico, estável e fluído para desktop e mobile.
 * Suporta rotação 3D interativa no cursor/toque sem bloqueio de cliques.
 */
export default function Cyber3DCard({ children, isHot = false, className = '', style = {} }) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Ângulo máximo de inclinação em graus (10 deg para estabilidade elegância)
    const maxRotate = 10;
    const rotateX = -((y - centerY) / centerY) * maxRotate;
    const rotateY = ((x - centerX) / centerX) * maxRotate;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleTouchMove = (e) => {
    if (!e.touches[0] || !cardRef.current) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((y - centerY) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.8
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
      className={`cyber-3d-wrapper ${className}`}
      style={{
        transform: transformStyle,
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease',
        ...style
      }}
    >
      <div className={`cyber-3d-card-body ${isHot ? 'is-hot' : ''}`}>
        
        {/* Reflexo de Vidro (Glare) Dinâmico acompanhando a posição do cursor */}
        <div
          className="cyber-3d-glare-layer"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 65%)`,
            opacity: glarePos.opacity,
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* Marcadores Ciber de Canto Alinhados */}
        <div className={`cyber-corners ${isHot ? 'corners-hot' : ''}`}>
          <span className="corner-tl" />
          <span className="corner-tr" />
          <span className="corner-bl" />
          <span className="corner-br" />
        </div>

        {/* Linha de Varredura Laser Fina no Fundo */}
        <div className="cyber-laser-scan" />

        {/* Conteúdo Real do Card */}
        <div className="cyber-card-inner">
          {children}
        </div>

      </div>
    </div>
  );
}
