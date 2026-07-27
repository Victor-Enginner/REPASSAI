/**
 * REPASS AI - Cursor personalizado (somente desktop com mouse).
 *
 * O `StickyCursor` gruda em UM elemento por vez, recebido por ref. O app
 * tem dezenas de alvos (cards, botões, itens de menu), então este wrapper
 * descobre qual deles está sob o ponteiro e entrega o ref correspondente.
 *
 * A descoberta usa delegação de evento no `document`: um único listener
 * em vez de um por alvo. Isso importa porque a lista de leads remonta a
 * cada varredura — com listener por elemento, cada remontagem vazaria
 * handlers.
 *
 * GUARDAS (todas obrigatórias)
 * ----------------------------
 * 1. `(pointer: fine)` — só onde existe mouse.
 * 2. Largura ≥ 1024px — guardar apenas pelo ponteiro é frágil: notebook
 *    com tela sensível ao toque reporta ponteiro fino, e janela estreita
 *    no desktop também. Cursor customizado numa tela de 375px é errado
 *    independentemente do tipo de ponteiro.
 * 3. `prefers-reduced-motion` — quem pediu menos movimento não recebe um
 *    elemento animando permanentemente na tela.
 * 4. `React.lazy` — não entra no bundle inicial. Quem abre no celular
 *    (a maioria do público final) nunca paga por isso.
 *
 * O cursor nativo é escondido apenas enquanto o componente está montado.
 * Se qualquer guarda falhar, o mouse do sistema continua normal.
 */

import React, { lazy, Suspense } from 'react';
import { useMediaQuery, useEhMobile } from '../hooks/useMediaQuery';

const FluidGlitchCursor = lazy(() => import('./ui/FluidGlitchCursor'));

/**
 * Elementos em que o cursor gruda.
 *
 * Resolvido por seletor em vez de espalhar `className="cursor-target"`
 * por dezenas de arquivos: menos edição, e um alvo novo passa a funcionar
 * sozinho ao usar as classes que o projeto já tem.
 *
 * Restrito ao que é acionável de verdade — grudar em qualquer `<div>`
 * faria o efeito perder sentido e virar ruído.
 */
const SELETOR_ALVO = [
  '.cursor-target',
  '.btn-primary',
  '.btn-secondary',
  '.lead-card',
  'aside nav button',
  'nav[aria-label="Ações rápidas"] button',
].join(', ');

export default function CursorPersonalizado() {
  const temMouse = useMediaQuery('(pointer: fine)');
  const ehMobile = useEhMobile();
  const preferMenosMovimento = useMediaQuery('(prefers-reduced-motion: reduce)');

  const ativo = temMouse && !ehMobile && !preferMenosMovimento;

  if (!ativo) return null;

  return (
    <Suspense fallback={null}>
      <FluidGlitchCursor />
    </Suspense>
  );
}
