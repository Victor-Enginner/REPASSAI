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

import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useMediaQuery, useEhMobile } from '../hooks/useMediaQuery';

const StickyCursor = lazy(() => import('./ui/StickyCursor'));

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

  const [elementoAtivo, setElementoAtivo] = useState(null);

  useEffect(() => {
    if (!ativo) return undefined;

    // Delegação: um listener para todos os alvos, presentes e futuros.
    const aoEntrar = (e) => {
      const alvo = e.target?.closest?.(SELETOR_ALVO) || null;
      setElementoAtivo((atual) => (atual === alvo ? atual : alvo));
    };

    document.addEventListener('mouseover', aoEntrar, { passive: true });
    return () => document.removeEventListener('mouseover', aoEntrar);
  }, [ativo]);

  /**
   * Repassa a entrada/saída ao elemento.
   *
   * O `StickyCursor` escuta `mouseenter`/`mouseleave` no próprio alvo, e
   * esses eventos NÃO borbulham — por isso a detecção acima usa
   * `mouseover`. O problema é a ordem: quando descobrimos o alvo e o React
   * monta o listener, o `mouseenter` real já aconteceu e se perdeu.
   *
   * Aqui reemitimos o par no momento certo, depois do listener existir.
   * Assim o componente recebe exatamente os eventos que espera, sem
   * precisar alterar a lógica dele.
   */
  useEffect(() => {
    if (!ativo || !elementoAtivo) return undefined;

    // `setTimeout(0)` e não `requestAnimationFrame`: o que precisamos é
    // "depois do commit do React", não "no próximo quadro visual". rAF
    // fica suspenso quando a aba não está compondo, o que atrasaria o
    // repasse sem motivo.
    const id = setTimeout(() => {
      elementoAtivo.dispatchEvent(new MouseEvent('mouseenter'));
    }, 0);

    return () => {
      clearTimeout(id);
      elementoAtivo.dispatchEvent(new MouseEvent('mouseleave'));
    };
  }, [ativo, elementoAtivo]);

  // Esconde o cursor nativo só enquanto este componente está no ar.
  useEffect(() => {
    if (!ativo) return undefined;
    document.documentElement.classList.add('cursor-personalizado-ativo');
    return () => document.documentElement.classList.remove('cursor-personalizado-ativo');
  }, [ativo]);

  if (!ativo) return null;

  // Objeto novo a cada mudança de alvo: o `StickyCursor` depende de
  // `stickyElement` no array de dependências do efeito dele, então trocar
  // a identidade é o que faz ele reassinar os listeners no elemento certo.
  // Sem isso, mudar apenas `.current` não dispararia nada.
  const refDoAlvo = { current: elementoAtivo };

  return (
    <Suspense fallback={null}>
      <StickyCursor
        stickyElement={refDoAlvo}
        cor="#6366f1"
        tamanho={12}
        tamanhoHover={54}
      />
    </Suspense>
  );
}
