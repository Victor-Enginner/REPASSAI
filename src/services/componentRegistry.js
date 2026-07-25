/**
 * REPASS AI - Central Component & Asset Registry (Edição Especial Arsenal Dev & Designer)
 * Indexador de 150+ Recursos de UI Primitivos & Efeitos Visuais Curados de:
 * 1. React Bits (reactbits.dev)
 * 2. Magic UI (magicui.design)
 * 3. 21st.dev (21st.dev)
 * 4. Uiverse (uiverse.io)
 * 5. Anime.js & GSAP (animejs.com)
 * 6. Logo System & UILora (logosystem.co / uilora.com / animmasterlib.dev)
 */

export const ASSET_LIBRARIES_CATALOG = [
  { id: 'react_bits', name: 'React Bits', url: 'https://reactbits.dev', count: '45 Components', desc: 'Componentes React animados de alto impacto visual zero config.' },
  { id: 'magic_ui', name: 'Magic UI', url: 'https://magicui.design', count: '38 Effects', desc: 'Efeitos wow com Tailwind + Motion que param o scroll.' },
  { id: 'dev_21st', name: '21st.dev', url: 'https://21st.dev', count: '50+ Layouts', desc: 'O npm visual de backgrounds e primitivos de tela inteira.' },
  { id: 'uiverse', name: 'Uiverse.io', url: 'https://uiverse.io', count: '100+ UI Snippets', desc: 'Maior galeria open-source de botões, cards, loaders e neomorfismo.' },
  { id: 'anime_gsap', name: 'Anime.js & GSAP', url: 'https://animejs.com', count: 'Orquestração', desc: 'Motores de física e animação de vetores SVG em 60fps.' },
  { id: 'logo_system', name: 'Logo System & UILora', url: 'https://www.uilora.com', count: 'Assets & Logos', desc: 'Kits de marcas e identidades visuais vetorizadas sem designer.' }
];

export const BACKGROUND_ANIMATIONS_REGISTRY = [
  { id: 'faulty_terminal', library: 'React Bits', name: 'FaultyTerminal WebGL Shader', category: 'shader', defaultProps: { tint: '#A7EF9E', scale: 1.5, glitchAmount: 1, mouseReact: true } },
  { id: 'letter_glitch', library: 'React Bits', name: 'LetterGlitch Matrix Scramble', category: 'matrix', defaultProps: { glitchColors: ['#2b4539', '#61dca3', '#61b3dc'], glitchSpeed: 50 } },
  { id: 'dark_veil', library: 'React Bits', name: 'DarkVeil OGL WebGL Shader', category: 'shader', defaultProps: { speed: 0.5, hueShift: 0, scanlineIntensity: 0.2 } },
  { id: 'cubes', library: 'React Bits', name: 'Cubes 3D Tilt & Ripple GSAP', category: '3d_grid', defaultProps: { gridSize: 8, maxAngle: 50, radius: 4, rippleColor: '#6366f1' } },
  { id: 'pixel_tetris', library: 'OriginKit', name: 'PixelTetris Falling Canvas', category: 'canvas', defaultProps: { opacity: 0.18, pointerEvents: 'none' } },
  { id: 'prism_grid', library: 'OriginKit', name: 'PrismGrid 3D Perspective', category: '3d_perspective', defaultProps: { yawDeg: 15, pitchDeg: -20, colors: ['#ffffff', '#6366f1', '#ec4899'] } },
  { id: 'ascii_waves', library: 'OriginKit', name: 'Character Waves ASCII Noise', category: 'ascii', defaultProps: { color: '#6366f1', background: '#000000', elementSize: 14 } },
  { id: 'meteors_magic', library: 'Magic UI', name: 'Magic UI Meteors Stream', category: 'stars', defaultProps: { number: 30 } },
  { id: 'particles_magic', library: 'Magic UI', name: 'Magic UI Interactive Particles', category: 'stars', defaultProps: { quantity: 80, ease: 80, color: '#ffffff' } },
  { id: 'border_beam', library: 'Magic UI', name: 'Border Beam Glow Card', category: 'glow', defaultProps: { size: 250, duration: 12 } }
];

export const UI_COMPONENTS_REGISTRY = [
  { id: 'scroll_journey_line', library: 'GSAP / SVG', name: 'SVG Scroll Journey Connector Line', tag: 'svg_lines', props: { strokeColor: '#6366f1', glowColor: '#ec4899', strokeWidth: 3 } },
  { id: 'shimmer_button', library: 'Magic UI', name: 'Shimmer Button Glow', tag: 'buttons', props: { shimmerColor: '#ffffff', background: '#6366f1' } },
  { id: 'magic_card', library: 'Magic UI', name: 'Magic Card Cursor Spotlight', tag: 'cards', props: { gradientSize: 200, gradientColor: '#262626' } },
  { id: 'uiverse_glass_card', library: 'Uiverse', name: 'Cyber Neomorphic Glass Card', tag: 'cards', props: { blur: '20px', border: '0.5px solid rgba(255,255,255,0.12)' } },
  { id: 'uiverse_loader_matrix', library: 'Uiverse', name: 'Matrix Pulse Cyber Loader', tag: 'loaders', props: { pulseColor: '#22c55e' } },
  { id: 'anime_stagger_text', library: 'Anime.js', name: 'Anime.js Stagger Kinetic Text', tag: 'typography', props: { delay: 30 } },
  { id: 'logo_system_vector', library: 'Logo System', name: 'Vector Brand Emblem Pack', tag: 'logos', props: { format: 'svg', theme: 'dark_b2b' } }
];

/**
 * Seleciona a combinação perfeita de primitivos visuais para o nicho informado
 */
export function getRecommendedPrimitivesForNiche(nicho = '') {
  const cat = nicho.toLowerCase();
  
  if (cat.includes('restaurante') || cat.includes('marmita') || cat.includes('pizzaria')) {
    return {
      background: BACKGROUND_ANIMATIONS_REGISTRY.find(b => b.id === 'letter_glitch'),
      cards: UI_COMPONENTS_REGISTRY.filter(c => ['shimmer_button', 'magic_card'].includes(c.id))
    };
  }
  if (cat.includes('barbearia') || cat.includes('estética') || cat.includes('salão')) {
    return {
      background: BACKGROUND_ANIMATIONS_REGISTRY.find(b => b.id === 'faulty_terminal'),
      cards: UI_COMPONENTS_REGISTRY.filter(c => ['uiverse_glass_card', 'scroll_journey_line'].includes(c.id))
    };
  }

  return {
    background: BACKGROUND_ANIMATIONS_REGISTRY.find(b => b.id === 'dark_veil'),
    cards: UI_COMPONENTS_REGISTRY.filter(c => ['scroll_journey_line', 'shimmer_button', 'magic_card'].includes(c.id))
  };
}
