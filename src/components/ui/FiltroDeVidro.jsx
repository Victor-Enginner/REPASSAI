/**
 * REPASS AI — FILTRO DE VIDRO LÍQUIDO
 *
 * Define os filtros SVG que a folha de estilo consome por `url(#...)`.
 * Não desenha nada: é só a definição, montada uma vez por tela que usa o
 * material de vidro.
 *
 * POR QUE UM FILTRO SVG, E NÃO SÓ backdrop-filter
 * -----------------------------------------------
 * `backdrop-filter: blur()` faz vidro FOSCO: o que está atrás fica borrado,
 * mas continuo reto. Vidro de verdade não borra — ele ENTORTA. A diferença
 * entre "caixa translúcida" e "vidro" é a refração, e refração exige
 * deslocar os pixels do fundo, que é o que `feDisplacementMap` faz.
 *
 * MEDIDO ANTES DE ESCREVER
 * ------------------------
 * `CSS.supports('backdrop-filter','url(#x)')` responde `true` no Chrome 148.
 * Onde responder false (Safari e Firefox hoje), o `@supports` na folha de
 * estilo mantém só o desfoque e o brilho da borda — o cartão continua
 * bonito, sem a ondulação.
 *
 * ESCALA BAIXA DE PROPÓSITO
 * -------------------------
 * O componente de referência usava `scale="200"`. Num cartão de 380px isso
 * arrasta o fundo por meia tela: o texto atrás vira borrão ilegível e o
 * efeito parece defeito de renderização. Aqui a escala é 18 — o suficiente
 * para a luz do fundo ondular na borda, longe de embaralhar conteúdo.
 *
 * `baseFrequency` bem baixa (0.008) dá ondas LONGAS, de água parada. Valores
 * altos dão granulado, que lê como ruído sujo e não como vidro.
 */

import React from 'react';

export default function FiltroDeVidro() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter id="repass-vidro-liquido" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.014"
            numOctaves="2"
            seed="7"
            result="ruido"
          />
          {/* Suaviza o ruído antes de usá-lo como mapa. Sem isto, o
              deslocamento fica pontilhado em vez de ondulado. */}
          <feGaussianBlur in="ruido" stdDeviation="2.4" result="mapa" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="mapa"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
