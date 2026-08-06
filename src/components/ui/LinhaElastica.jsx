/**
 * REPASS AI — LINHA ELÁSTICA
 *
 * Um traço reto que se curva na direção do cursor quando ele se aproxima
 * e volta ao lugar com balanço amortecido, como um elástico solto.
 *
 * NÃO é o componente do 77lib — é uma implementação própria com o mesmo
 * comportamento. Se um dia o original entrar no projeto, trocar é
 * substituir este arquivo: quem usa só conhece as props.
 *
 * DUAS DECISÕES QUE IMPORTAM
 * --------------------------
 *
 * 1. NENHUM setState por quadro.
 *    A mola roda em requestAnimationFrame escrevendo o atributo `d` do
 *    <path> direto no DOM. Um `useState` a cada quadro obrigaria o React
 *    a reconciliar a árvore 60 vezes por segundo — foi exatamente o que
 *    tornou o card 3D caro. Física em ref, render em DOM.
 *
 * 2. O ponteiro é ouvido na JANELA, não no SVG.
 *    A linha fica sobre a grade do hero, onde existem campo de e-mail e
 *    botão. Se ela capturasse ponteiro, roubaria clique. É
 *    `pointer-events: none` e escuta no window — a linha reage sem
 *    nunca atrapalhar.
 *
 * A MOLA
 * ------
 *   força     = (alvo − atual) × rigidez
 *   velocidade = (velocidade + força) × amortecimento
 *   atual     += velocidade
 *
 * Amortecimento < 1 é o que produz o vaivém: a linha passa do ponto,
 * volta, passa de novo com menos força, até parar. Com 1.0 ela oscilaria
 * para sempre; com 0.5 ela chega dura, sem balanço nenhum.
 */

import React, { useEffect, useRef } from 'react';

export default function LinhaElastica({
  /** 'vertical' = a linha corre de cima a baixo e entorta para os lados. */
  orientacao = 'vertical',
  /**
   * Onde a linha fica, de 0 a 1, no eixo transversal ao seu comprimento.
   *
   * Não é sempre 0.5: na grade do hero, a divisa entre os quadrantes 1 e
   * 2 fica no meio quando são 2 colunas, mas a um quarto da altura
   * quando a grade colapsa para 4 linhas empilhadas.
   */
  posicao = 0.5,
  cor = 'var(--aro-cor)',
  corAtiva = 'var(--iris-violeta)',
  espessura = 1,
  /** Distância em px a partir da qual o cursor começa a puxar a linha. */
  raioDeInfluencia = 140,
  /** O quanto a linha chega a entortar, no máximo, em px. */
  deslocamentoMaximo = 54,
  rigidez = 0.14,
  amortecimento = 0.82,
}) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return undefined;

    const vertical = orientacao === 'vertical';
    let larg = 0;
    let alt = 0;

    /* Estado da mola. Fica em variáveis locais, fora do React. */
    let atual = 0;      // deslocamento aplicado agora
    let velocidade = 0;
    let alvo = 0;       // para onde o cursor está puxando
    let posNoEixo = 0.5; // onde, ao longo da linha, está o "bico" da curva

    const eixo = () => (vertical ? larg * posicao : alt * posicao);

    const reta = () => {
      const p = eixo();
      return vertical ? `M ${p} 0 L ${p} ${alt}` : `M 0 ${p} L ${larg} ${p}`;
    };

    /*
      Bézier quadrática. O ponto de controle vai ao DOBRO do deslocamento
      desejado porque, numa quadrática, a curva passa na metade do
      caminho entre o controle e a corda — sem o fator 2 a linha
      entortaria só metade do pedido.
    */
    const curva = (d, t) => {
      const p = eixo();
      if (vertical) {
        return `M ${p} 0 Q ${p + d * 2} ${alt * t} ${p} ${alt}`;
      }
      return `M 0 ${p} Q ${larg * t} ${p + d * 2} ${larg} ${p}`;
    };

    const medir = () => {
      const r = svg.getBoundingClientRect();
      larg = r.width;
      alt = r.height;
      path.setAttribute('d', reta());
    };
    medir();

    const ro = new ResizeObserver(medir);
    ro.observe(svg);

    // Sem movimento e sem cursor, a linha é só uma linha.
    const semMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const semCursor = window.matchMedia?.('(hover: none) and (pointer: coarse)').matches;
    if (semMovimento || semCursor) {
      return () => ro.disconnect();
    }

    const aoMover = (e) => {
      const r = svg.getBoundingClientRect();
      if (!r.width || !r.height) return;

      // Distância do cursor até a linha, no eixo em que ela entorta.
      const centro = vertical
        ? r.left + r.width * posicao
        : r.top + r.height * posicao;
      const doCursor = vertical ? e.clientX : e.clientY;
      const distancia = doCursor - centro;

      // Quão longe está ao longo do comprimento da linha (0..1).
      const aoLongo = vertical
        ? (e.clientY - r.top) / r.height
        : (e.clientX - r.left) / r.width;

      // Fora do trecho da linha, ou longe demais, ela volta ao repouso.
      const dentro = aoLongo >= -0.15 && aoLongo <= 1.15;
      const proximidade = 1 - Math.min(Math.abs(distancia) / raioDeInfluencia, 1);

      if (!dentro || proximidade <= 0) {
        alvo = 0;
        return;
      }

      posNoEixo = Math.max(0.08, Math.min(0.92, aoLongo));
      // O sinal da distância define o lado; a proximidade, a força.
      alvo = Math.sign(distancia) * proximidade * deslocamentoMaximo;
    };

    const aoSair = () => { alvo = 0; };

    window.addEventListener('pointermove', aoMover, { passive: true });
    window.addEventListener('pointerleave', aoSair, { passive: true });
    window.addEventListener('blur', aoSair);

    let raf = 0;
    let parado = false;
    const passo = () => {
      const forca = (alvo - atual) * rigidez;
      velocidade = (velocidade + forca) * amortecimento;
      atual += velocidade;

      // Parou de valer a pena desenhar: volta à reta exata e dorme.
      const emRepouso = Math.abs(atual) < 0.05 && Math.abs(velocidade) < 0.05 && alvo === 0;
      if (emRepouso) {
        if (!parado) {
          atual = 0;
          velocidade = 0;
          path.setAttribute('d', reta());
          path.setAttribute('stroke', cor);
          // A opacidade também volta. Sem isto a linha ficava presa no
          // último valor da animação e, parada, aparecia mais apagada
          // que os hairlines vizinhos da mesma grade.
          path.setAttribute('stroke-opacity', '1');
          path.setAttribute('stroke-width', String(espessura));
          parado = true;
        }
      } else {
        parado = false;
        path.setAttribute('d', curva(atual, posNoEixo));

        /*
          Quanto mais esticada, mais a linha aparece: assume a cor da
          marca, ganha opacidade e engrossa um pouco.

          Elástico de verdade afina quando estica — aqui ela engrossa, de
          propósito. Em repouso a linha vale 1px porque precisa somar com
          os outros hairlines da grade; esticada, ela precisa vencer o
          ruído do fundo ASCII, senão o movimento acontece e ninguém vê.
        */
        const intensidade = Math.min(Math.abs(atual) / deslocamentoMaximo, 1);
        path.setAttribute('stroke', intensidade > 0.06 ? corAtiva : cor);
        path.setAttribute('stroke-opacity', String(0.35 + intensidade * 0.65));
        path.setAttribute('stroke-width', String(espessura * (1 + intensidade * 0.9)));
      }

      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', aoMover);
      window.removeEventListener('pointerleave', aoSair);
      window.removeEventListener('blur', aoSair);
    };
  }, [orientacao, posicao, cor, corAtiva, espessura, raioDeInfluencia, deslocamentoMaximo, rigidez, amortecimento]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        // Nunca captura ponteiro: há campo e botão sob esta camada.
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <path
        ref={pathRef}
        fill="none"
        stroke={cor}
        strokeWidth={espessura}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
