/**
 * REPASS AI - Hook de media query.
 *
 * Responde em JavaScript ao mesmo breakpoint que o CSS usa, para casos em
 * que o layout muda de comportamento (e não só de aparência) — como a
 * Sidebar, que vira gaveta no celular.
 *
 * Usa `matchMedia` em vez de escutar `resize`: o navegador só avisa quando
 * a condição realmente muda de estado, em vez de disparar a cada pixel
 * arrastado.
 */

import { useState, useEffect } from 'react';

/** Ponto onde o layout deixa de comportar a Sidebar fixa. */
export const BREAKPOINT_MOBILE = 1024;

/**
 * @param {string} consulta Media query CSS, ex: '(max-width: 1024px)'
 * @returns {boolean}
 */
export function useMediaQuery(consulta) {
  const [combina, setCombina] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(consulta).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mql = window.matchMedia(consulta);

    // Lê sempre de `mql.matches`, nunca do `e.matches` do evento: assim a
    // fonte da verdade é uma só, independente de quem disparou.
    const sincronizar = () => setCombina(mql.matches);

    // Sincroniza no mount: entre o useState inicial e o efeito, a largura
    // pode ter mudado (rotação de tela, abrir devtools).
    sincronizar();

    mql.addEventListener('change', sincronizar);

    // Redes de segurança.
    //
    // O `change` do matchMedia é o caminho correto e funciona em navegador
    // real. Mas nem todo ambiente o entrega: em janelas embutidas, WebViews
    // e ferramentas de automação o evento pode simplesmente não chegar — e
    // aí a interface fica presa no layout errado, que é pior do que lento.
    //
    // `ResizeObserver` observa o ELEMENTO, não a janela, então dispara
    // mesmo quando o evento de janela não vem. É o mais confiável dos três.
    window.addEventListener('resize', sincronizar);
    window.addEventListener('orientationchange', sincronizar);

    let observador = null;
    if (typeof ResizeObserver !== 'undefined') {
      observador = new ResizeObserver(sincronizar);
      observador.observe(document.documentElement);
    }

    // Chamar setState com o mesmo valor é descartado pelo React, então
    // ter três fontes não causa re-render extra.
    return () => {
      mql.removeEventListener('change', sincronizar);
      window.removeEventListener('resize', sincronizar);
      window.removeEventListener('orientationchange', sincronizar);
      observador?.disconnect();
    };
  }, [consulta]);

  return combina;
}

/** Atalho: true quando a tela é estreita demais para a Sidebar fixa. */
export function useEhMobile() {
  return useMediaQuery(`(max-width: ${BREAKPOINT_MOBILE}px)`);
}
