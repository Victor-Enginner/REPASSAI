/**
 * REPASS AI — TOKENS DE DESIGN (lado JavaScript)
 *
 * ATENÇÃO AO ESCOPO DESTE ARQUIVO.
 *
 * As cores de tema NÃO moram aqui. Elas moram em `themes.css`, como
 * custom properties, e é de lá que vêm — inclusive para o JS, via
 * `var(--nome)` em style inline. Duplicar a paleta nos dois lugares foi
 * exatamente o que fez o tema escuro divergir do claro na versão
 * anterior: dois arquivos com a mesma informação sempre desandam.
 *
 * O que mora aqui são os valores que o JS precisa como DADO — para
 * medir, animar, interpolar ou passar a uma biblioteca (framer-motion,
 * canvas, gráficos) — e que CSS var() não resolve.
 */

/** Espectro iridescente da marca, em ordem de onda (violeta → pêssego).
 *  Espelha `--iris-*`. Existe em JS porque canvas, gráficos e
 *  interpolação de cor precisam do hex, não de uma var(). */
export const espectroIris = [
  '#7c5cff', // violeta
  '#5b8cff', // azul
  '#56d8e6', // ciano
  '#7ce7c4', // menta
  '#ffcf6b', // dourado
  '#ffb27a', // pêssego
];

/** Movimento. Em ms, para passar direto a framer-motion (que usa
 *  segundos — divida por 1000) e a setTimeout de orquestração. */
export const motion = {
  instant: 90,
  quick: 180,
  flow: 320,
  easeMarca: [0.22, 1, 0.36, 1],
  easeSuave: [0.4, 0, 0.2, 1],
};

/** Nomes de tema válidos. Fonte da verdade para o toggle e para o
 *  script anti-flash — se um dia entrar um terceiro tema, entra aqui. */
export const TEMAS = ['light', 'dark'];
export const TEMA_PADRAO = 'light';

/** Chave única de persistência. Repetida como string literal em
 *  `public/theme-init.js`, que roda antes do bundle e não pode
 *  importar — se mudar aqui, mude lá. */
export const CHAVE_TEMA = 'repass_theme';

/**
 * Tokens estruturais. Espelham as custom properties de mesmo nome
 * para uso em style inline, onde `var()` é aceito mas o valor bruto
 * às vezes é necessário (cálculo de layout, medida em canvas).
 */
export const designTokens = {
  fonts: {
    headline: "'Geist', 'Inter Tight', sans-serif",
    body: "'Geist', 'Inter', sans-serif",
    mono: "'Geist Mono', 'JetBrains Mono', monospace",
  },

  tracking: {
    marca: '0.34em',
    rotulo: '0.2em',
    headline: '-0.03em',
  },

  radii: {
    none: '0px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    pill: '9999px',
  },

  /** Para uso em style inline. Preferir sempre a classe `.acrilico`
   *  no CSS — isto é a saída de emergência, não o caminho padrão. */
  acrilico: {
    blur: 'blur(18px) saturate(1.6)',
    fundo: 'var(--vidro-fundo)',
    brilho: 'var(--vidro-brilho)',
  },

  espectro: espectroIris,
  motion,
};

export default designTokens;
