/* 77lib lic:1d6166ae2853 */

/**
 * Sticky Cursor — cursor que segue o mouse e, ao passar sobre o elemento
 * alvo, gruda no centro dele, estica na direção do ponteiro e rotaciona.
 *
 * Origem: registry privado 77lib (`sticky-cursor`).
 *
 * ADAPTAÇÕES FEITAS (e apenas estas)
 * ----------------------------------
 * 1. TypeScript → JSX. O projeto não usa TS; os tipos foram removidos,
 *    nada mais.
 * 2. `cor` e `tamanho` viraram props, com os valores originais como
 *    padrão. Necessário porque o preto original é invisível sobre o tema
 *    escuro do REPASS AI.
 *
 * A LÓGICA E O TIMING DA ANIMAÇÃO ESTÃO INTACTOS: mesmos valores de
 * spring (damping 20, stiffness 300, mass 0.5), mesmas faixas de
 * transform, mesmos 0.1s de retorno da escala.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, transform, animate } from 'framer-motion';

/**
 * @param {object} props
 * @param {{current: HTMLElement|null}} props.stickyElement Elemento em que o cursor gruda
 * @param {string} [props.cor='black'] Cor do cursor
 * @param {number} [props.tamanho=15] Diâmetro em repouso
 * @param {number} [props.tamanhoHover=60] Diâmetro sobre o alvo
 */
export default function StickyCursor({
  stickyElement,
  cor = 'black',
  tamanho = 15,
  tamanhoHover = 60,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const cursor = useRef(null);
  const cursorSize = isHovered ? tamanhoHover : tamanho;

  const mouse = { x: useMotionValue(0), y: useMotionValue(0) };
  const scale = { x: useMotionValue(1), y: useMotionValue(1) };

  const smoothOptions = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothMouse = {
    x: useSpring(mouse.x, smoothOptions),
    y: useSpring(mouse.y, smoothOptions),
  };

  useEffect(() => {
    const el = stickyElement.current;

    const rotate = (distance) => {
      const angle = Math.atan2(distance.y, distance.x);
      if (cursor.current) animate(cursor.current, { rotate: `${angle}rad` }, { duration: 0 });
    };

    const onMouseMove = (e) => {
      const { clientX, clientY } = e;

      // Sem alvo ativo o cursor apenas segue o ponteiro.
      if (!el) {
        mouse.x.set(clientX - cursorSize / 2);
        mouse.y.set(clientY - cursorSize / 2);
        return;
      }

      const { left, top, height, width } = el.getBoundingClientRect();
      const center = { x: left + width / 2, y: top + height / 2 };

      if (isHovered) {
        const distance = { x: clientX - center.x, y: clientY - center.y };
        rotate(distance);
        const absDistance = Math.max(Math.abs(distance.x), Math.abs(distance.y));
        scale.x.set(transform(absDistance, [0, height / 2], [1, 1.3]));
        scale.y.set(transform(absDistance, [0, width / 2], [1, 0.8]));
        mouse.x.set(center.x - cursorSize / 2 + distance.x * 0.1);
        mouse.y.set(center.y - cursorSize / 2 + distance.y * 0.1);
      } else {
        mouse.x.set(clientX - cursorSize / 2);
        mouse.y.set(clientY - cursorSize / 2);
      }
    };

    const onEnter = () => setIsHovered(true);
    const onLeave = () => {
      setIsHovered(false);
      if (cursor.current) animate(cursor.current, { scaleX: 1, scaleY: 1 }, { duration: 0.1 });
    };

    if (el) {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    }
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      if (el) {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      }
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isHovered, stickyElement, cursorSize, mouse.x, mouse.y, scale.x, scale.y]);

  const template = ({ rotate, scaleX, scaleY }) =>
    `rotate(${rotate}) scaleX(${scaleX}) scaleY(${scaleY})`;

  return (
    <motion.div
      ref={cursor}
      transformTemplate={template}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: smoothMouse.y,
        left: smoothMouse.x,
        width: tamanho,
        height: tamanho,
        backgroundColor: cor,
        borderRadius: '50%',
        pointerEvents: 'none',
        scaleX: scale.x,
        scaleY: scale.y,
        zIndex: 9999,
      }}
      animate={{ width: cursorSize, height: cursorSize }}
    />
  );
}
