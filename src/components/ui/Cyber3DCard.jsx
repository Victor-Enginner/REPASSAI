import React from 'react';
import './Cyber3DCard.css';

/**
 * REPASS AI - Componente Cyber3DCard (Baseado no efeito 3D da Uiverse por 00Kubi)
 * 
 * Envolve qualquer card com um efeito 3D responsivo ao cursor e cantos cibernéticos
 * iluminados sem sobrepor elementos visuais sobre o texto ou botões internos.
 */
export default function Cyber3DCard({ children, isHot = false, className = '', style = {} }) {
  // 25 células de rastreamento no grid 5x5
  const trackers = Array.from({ length: 25 }, (_, i) => i + 1);

  return (
    <div className={`cyber-3d-container noselect ${className}`} style={style}>
      <div className="cyber-3d-canvas">

        {/* Grid invisível de rastreamento do mouse para calcular a rotação 3D */}
        <div className="cyber-3d-tracker-grid">
          {trackers.map((num) => (
            <div key={num} className={`cyber-3d-tr cyber-3d-tr-${num}`} />
          ))}
        </div>

        {/* Card 3D propriamente dito */}
        <div className={`cyber-3d-card ${isHot ? 'cyber-3d-card-hot' : ''}`}>
          
          {/* Brilho e reflexo de vidro (glare) ao passar o mouse */}
          <div className="cyber-3d-glare" />

          {/* Cantoneiras Cibernéticas (Corner Elements) */}
          <div className={`cyber-corner-elements ${isHot ? 'cyber-corner-elements-hot' : ''}`}>
            <span />
            <span />
            <span />
            <span />
          </div>

          {/* Varredura Laser Suave (Scan Line) */}
          <div className="cyber-scan-line" />

          {/* Conteúdo Interno Preservado */}
          <div className="cyber-3d-content">
            {children}
          </div>

        </div>

      </div>
    </div>
  );
}
