/**
 * REPASS AI - FlowFieldBackground (campo de fluxo com rastros).
 *
 * Partículas seguem um campo vetorial e reagem ao cursor, deixando trilhas.
 * O rastro vem de não limpar o canvas: a cada quadro pintamos um retângulo
 * semitransparente por cima, então o que foi desenhado antes desvanece.
 *
 * PORTADO da versão original em TypeScript + Tailwind (`cn()`, classes
 * utilitárias) para a stack real deste projeto: JSX puro com estilos inline.
 * A lógica de animação é idêntica; só a camada de estilo mudou.
 *
 * Guardas de performance, conforme o checklist dos 16ms do blueprint:
 *   - respeita `prefers-reduced-motion`
 *   - pausa quando a aba sai de foco (`document.hidden`)
 *   - usa `ResizeObserver` em vez de escutar `resize` da janela
 *   - cancela o rAF e remove listeners no cleanup
 */

import React, { useEffect, useRef } from 'react';

/**
 * @param {object} props
 * @param {string} [props.color='#6366f1'] Cor das partículas
 * @param {number} [props.trailOpacity=0.15] 0–1. Menor = rastro mais longo
 * @param {number} [props.particleCount=600] Quantidade de partículas
 * @param {number} [props.speed=1] Multiplicador de velocidade
 * @param {string} [props.background='#000000'] Cor de fundo do canvas
 * @param {string} [props.className]
 */
export default function FlowFieldBackground({
  color = '#6366f1',
  trailOpacity = 0.15,
  particleCount = 600,
  speed = 1,
  background = '#000000',
  className = '',
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const prefereMenosMovimento =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let largura = container.clientWidth;
    let altura = container.clientHeight;
    let particulas = [];
    let frameId = null;
    const mouse = { x: -10000, y: -10000 };

    // Converte o hex para rgb uma vez só, para montar o rgba do rastro sem
    // recalcular a cada quadro.
    const hex = background.replace('#', '');
    const bgR = parseInt(hex.substring(0, 2) || '00', 16) || 0;
    const bgG = parseInt(hex.substring(2, 4) || '00', 16) || 0;
    const bgB = parseInt(hex.substring(4, 6) || '00', 16) || 0;
    const corDoRastro = `rgba(${bgR}, ${bgG}, ${bgB}, ${trailOpacity})`;

    class Particula {
      constructor() {
        this.reset(true);
      }

      reset(inicial = false) {
        this.x = Math.random() * largura;
        this.y = Math.random() * altura;
        this.vx = 0;
        this.vy = 0;
        // Idade inicial aleatória evita que todas nasçam e morram juntas.
        this.idade = inicial ? Math.random() * 150 : 0;
        this.vida = Math.random() * 200 + 100;
      }

      atualizar() {
        // Campo de fluxo: o ângulo depende só da posição, o que gera as
        // correntes contínuas características do efeito.
        const angulo = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;

        this.vx += Math.cos(angulo) * 0.2 * speed;
        this.vy += Math.sin(angulo) * 0.2 * speed;

        // Repulsão pelo cursor
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distancia = Math.hypot(dx, dy);
        const raio = 150;

        if (distancia < raio && distancia > 0) {
          const forca = (raio - distancia) / raio;
          this.vx -= dx * forca * 0.05;
          this.vy -= dy * forca * 0.05;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Atrito: sem isso a velocidade cresce indefinidamente.
        this.vx *= 0.95;
        this.vy *= 0.95;

        this.idade += 1;
        if (this.idade > this.vida) {
          this.reset();
          return;
        }

        if (this.x < 0) this.x = largura;
        if (this.x > largura) this.x = 0;
        if (this.y < 0) this.y = altura;
        if (this.y > altura) this.y = 0;
      }

      desenhar(context) {
        // Nasce e morre em fade, para não haver aparição seca.
        const alpha = 1 - Math.abs(this.idade / this.vida - 0.5) * 2;
        context.globalAlpha = Math.max(0, alpha);
        context.fillRect(this.x, this.y, 1.5, 1.5);
      }
    }

    const iniciar = () => {
      // Limita o DPR a 2: em telas 3x o custo triplica sem ganho visível
      // num efeito de partículas.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(largura * dpr));
      canvas.height = Math.max(1, Math.floor(altura * dpr));
      canvas.style.width = `${largura}px`;
      canvas.style.height = `${altura}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = background;
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, largura, altura);

      particulas = Array.from({ length: particleCount }, () => new Particula());
    };

    const animar = () => {
      if (document.hidden) {
        frameId = requestAnimationFrame(animar);
        return;
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = corDoRastro;
      ctx.fillRect(0, 0, largura, altura);

      ctx.fillStyle = color;
      for (const p of particulas) {
        p.atualizar();
        p.desenhar(ctx);
      }
      ctx.globalAlpha = 1;

      frameId = requestAnimationFrame(animar);
    };

    iniciar();

    if (prefereMenosMovimento) {
      // Sem animação: desenha um quadro estático e para por aqui.
      ctx.fillStyle = color;
      particulas.forEach((p) => p.desenhar(ctx));
      ctx.globalAlpha = 1;
    } else {
      frameId = requestAnimationFrame(animar);
    }

    const observer = new ResizeObserver(() => {
      const l = container.clientWidth;
      const a = container.clientHeight;
      if (l === largura && a === altura) return;
      largura = l;
      altura = a;
      iniciar();
    });
    observer.observe(container);

    const aoMover = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const aoSair = () => {
      mouse.x = -10000;
      mouse.y = -10000;
    };

    container.addEventListener('mousemove', aoMover);
    container.addEventListener('mouseleave', aoSair);

    return () => {
      observer.disconnect();
      container.removeEventListener('mousemove', aoMover);
      container.removeEventListener('mouseleave', aoSair);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [color, trailOpacity, particleCount, speed, background]);

  return (
    <div
      ref={containerRef}
      className={className}
      // Puramente decorativo: fica fora da árvore de acessibilidade.
      aria-hidden="true"
      style={{ position: 'relative', width: '100%', height: '100%', background, overflow: 'hidden' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
