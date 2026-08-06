/**
 * REPASS AI — QUANDO NÃO DESENHAR FUNDO ANIMADO
 *
 * Duas perguntas, isoladas aqui para que a decisão seja a mesma em todo
 * lugar. Espalhar `matchMedia` pelos componentes é como o comportamento
 * começa a divergir entre telas.
 */

/**
 * O sistema pede menos movimento?
 *
 * Não é preferência estética: para quem tem sensibilidade vestibular,
 * animação contínua de fundo causa desconforto real. Quando esta opção
 * está ligada, o fundo animado simplesmente não existe.
 */
export function usaMenosMovimento() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * É um aparelho de toque?
 *
 * O teste é pelo DISPOSITIVO, não pela largura da janela. Largura diz
 * quanto espaço tem; `hover: none` + `pointer: coarse` diz que não há
 * mouse — que é o que separa celular de notebook com janela estreita.
 *
 * Fundo em canvas roda a cada quadro. No celular isso disputa GPU com o
 * scroll da própria lista de leads e come bateria enquanto o usuário
 * trabalha. O conteúdo ganha.
 */
export function ehDispositivoDeToque() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}
