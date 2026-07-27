/**
 * REPASS AI - Registro de Implementações Reais.
 *
 * O catálogo (`componentIndex.js`) lista os 104 componentes DISPONÍVEIS no
 * Site Pack. Este arquivo lista os que estão de fato IMPLEMENTADOS em
 * `src/components/ui/`. São coisas diferentes, e confundir as duas faz a IA
 * escolher um componente que não existe no código.
 *
 * Regra: o gerador só pode escolher ids presentes aqui.
 *
 * Para materializar mais componentes do Site Pack:
 *   npm run scaffold:component <id-do-catalogo>
 */

import { lazy } from 'react';

/**
 * Componentes pesados (WebGL/Canvas) entram por lazy import.
 *
 * É o princípio de lazy loading do blueprint: não carregar shader nenhum
 * no bundle inicial. Cada um só é baixado quando um schema realmente o usa.
 */
const FaultyTerminal = lazy(() => import('./FaultyTerminal.jsx'));
const LetterGlitch = lazy(() => import('./LetterGlitch.jsx'));
const DarkVeil = lazy(() => import('./DarkVeil.jsx'));
const Cubes = lazy(() => import('./Cubes.jsx'));
const PixelTetris = lazy(() => import('./PixelTetris.jsx'));
const PrismGrid = lazy(() => import('./PrismGrid.jsx'));
const ASCIIWaves = lazy(() => import('./ASCIIWaves.jsx'));
const ReactBitsCanvas = lazy(() => import('./ReactBitsCanvas.jsx'));
const ScrollJourneyLine = lazy(() => import('./ScrollJourneyLine.jsx'));
const OriginKitBentoGrid = lazy(() =>
  import('./OriginKitComponents.jsx').then((m) => ({ default: m.OriginKitBentoGrid }))
);

/**
 * Registro id -> implementação.
 *
 * `propsPermitidas` são as props que o componente realmente aceita,
 * conferidas na assinatura de cada arquivo. O renderer descarta o resto:
 * prop inventada pela IA vira `undefined` no React e some silenciosamente,
 * o que esconderia o erro.
 */
export const IMPLEMENTACOES = {
  // --- Vindos do catálogo do Site Pack ---
  faulty_terminal: {
    componente: FaultyTerminal,
    categoria: 'background',
    ehFundo: true,
    propsPermitidas: ['scale', 'gridMul', 'digitSize', 'timeScale', 'pause', 'scanlineIntensity',
      'glitchAmount', 'flickerAmount', 'noiseAmp', 'chromaticAberration', 'dither', 'curvature',
      'tint', 'mouseReact', 'mouseStrength', 'dpr', 'pageLoadAnimation', 'brightness', 'className'],
  },
  letter_glitch: {
    componente: LetterGlitch,
    categoria: 'background',
    ehFundo: true,
    propsPermitidas: ['glitchColors', 'className', 'glitchSpeed', 'centerVignette',
      'outerVignette', 'smooth', 'characters'],
  },
  dark_veil: {
    componente: DarkVeil,
    categoria: 'background',
    ehFundo: true,
    propsPermitidas: ['hueShift', 'noiseIntensity', 'scanlineIntensity', 'speed',
      'scanlineFrequency', 'warpAmount', 'resolutionScale'],
  },
  cubes: {
    componente: Cubes,
    categoria: 'component',
    ehFundo: false,
    propsPermitidas: ['gridSize', 'cubeSize', 'maxAngle', 'radius', 'easing', 'duration',
      'cellGap', 'borderStyle', 'faceColor', 'shadow', 'autoAnimate', 'rippleOnClick',
      'rippleColor', 'rippleSpeed'],
  },

  // --- Componentes próprios (OriginKit), fora do Site Pack ---
  pixel_tetris: {
    componente: PixelTetris,
    categoria: 'background',
    ehFundo: true,
    proprio: true,
    nome: 'PixelTetris',
    estilo: 'particulas',
    descricao: 'Blocos caindo em canvas, respeita prefers-reduced-motion.',
    propsPermitidas: ['boardColor', 'colors', 'movement', 'cellSize', 'gap', 'rounded',
      'dropSpeed', 'opacity', 'className'],
  },
  prism_grid: {
    componente: PrismGrid,
    categoria: 'background',
    ehFundo: true,
    proprio: true,
    nome: 'PrismGrid',
    estilo: 'geometrico',
    descricao: 'Grade em perspectiva 3D com paleta configurável.',
    propsPermitidas: ['backgroundColor', 'boxSize', 'borderWidth', 'borderColor', 'colors',
      'yawDeg', 'pitchDeg', 'className'],
  },
  ascii_waves: {
    componente: ASCIIWaves,
    categoria: 'background',
    ehFundo: true,
    proprio: true,
    nome: 'ASCIIWaves',
    estilo: 'glitch',
    descricao: 'Ondas em caracteres ASCII reagindo ao cursor.',
    propsPermitidas: ['characters', 'elementSize', 'color', 'direction', 'background',
      'invert', 'waveTension', 'speed', 'noiseScale', 'intensity', 'className'],
  },
  react_bits_canvas: {
    componente: ReactBitsCanvas,
    categoria: 'background',
    ehFundo: true,
    proprio: true,
    nome: 'ReactBitsCanvas',
    estilo: 'particulas',
    descricao: 'Campo de partículas leve em canvas 2D.',
    propsPermitidas: ['particleCount', 'speed', 'color', 'className'],
  },
  scroll_journey_line: {
    componente: ScrollJourneyLine,
    categoria: 'component',
    ehFundo: false,
    proprio: true,
    nome: 'ScrollJourneyLine',
    estilo: 'geometrico',
    descricao: 'Linha SVG que conecta seções conforme a rolagem.',
    propsPermitidas: ['strokeColor', 'glowColor', 'strokeWidth', 'className'],
  },
  bento_grid: {
    componente: OriginKitBentoGrid,
    categoria: 'component',
    ehFundo: false,
    proprio: true,
    nome: 'OriginKitBentoGrid',
    estilo: 'card',
    descricao: 'Grade neomórfica de cartões com ícone, título e descrição.',
    propsPermitidas: ['items'],
  },
};

/** Ids com implementação real. */
export const IDS_IMPLEMENTADOS = Object.keys(IMPLEMENTACOES);

/**
 * Componentes próprios expostos como entradas de catálogo, para o retrieval
 * conseguir encontrá-los junto com os do Site Pack.
 */
export const EXTENSOES_DE_CATALOGO = Object.entries(IMPLEMENTACOES)
  .filter(([, v]) => v.proprio)
  .map(([id, v]) => ({
    id,
    nome: v.nome,
    arquivo: v.nome,
    categoria: v.categoria,
    estilo: v.estilo,
    dependencias: [],
    dependenciasFaltando: [],
    instalavel: true,
    props: v.propsPermitidas.map((p) => ({ nome: p, tipo: '', padrao: '', descricao: '' })),
    totalProps: v.propsPermitidas.length,
    usageExample: '',
    temFonte: true,
    linhasFonte: 0,
    keywords: [id, v.nome.toLowerCase(), v.estilo, v.categoria],
    caminhoOrigem: `src/components/ui/${v.nome}.jsx`,
    descricao: v.descricao,
  }));

/**
 * Busca a implementação de um id.
 * @param {string} id
 * @returns {object|null}
 */
export function obterImplementacao(id) {
  return IMPLEMENTACOES[id] || null;
}

/**
 * Filtra as props recebidas, mantendo só as que o componente aceita.
 *
 * @param {string} id
 * @param {object} props
 * @returns {{props: object, descartadas: string[]}}
 */
export function filtrarProps(id, props = {}) {
  const impl = IMPLEMENTACOES[id];
  if (!impl) return { props: {}, descartadas: Object.keys(props) };

  const permitidas = new Set(impl.propsPermitidas);
  const limpas = {};
  const descartadas = [];

  for (const [chave, valor] of Object.entries(props || {})) {
    if (permitidas.has(chave)) limpas[chave] = valor;
    else descartadas.push(chave);
  }
  return { props: limpas, descartadas };
}
