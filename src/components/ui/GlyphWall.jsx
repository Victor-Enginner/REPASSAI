/**
 * REPASS AI — PAREDE DE GLIFOS (fundo WebGL)
 *
 * Uma parede de pedra com hieróglifos gravados. O cursor funciona como uma
 * lanterna: deixa um rastro que acende os glifos por onde passa.
 * Usada como fundo do painel de identidade da tela de acesso.
 *
 * DE ONDE VEIO ("Glyph Wall", Originkit) E O QUE MUDOU
 *   O shader e os 32 glifos são os do original, sem alteração. Mudou o que
 *   envolve o desenho:
 *
 *   1. Três modos, escolhidos pelo aparelho e pela preferência do sistema:
 *        animado  — padrão: cintilação sozinha + lanterna do mouse.
 *        reativo  — sistema pede MENOS MOVIMENTO: a cintilação sozinha fica
 *                   parada, mas a lanterna segue o mouse, porque esse
 *                   movimento é provocado por quem usa (não é animação
 *                   autônoma). O laço só roda enquanto há luz a desenhar;
 *                   com o mouse parado fora do painel, não gasta GPU.
 *        parado   — celular (sem mouse): um quadro só, sem laço.
 *      A regra de acessibilidade (../backgrounds/preferencias.js) é sobre
 *      movimento que acontece SOZINHO. Ignorar o mouse também tiraria a
 *      graça do efeito sem proteger ninguém.
 *   2. Limpeza: o original nunca liberava textura, programa nem o contexto
 *      WebGL. O navegador limita a ~16 contextos vivos; entrar e sair da
 *      tela de login repetidas vezes esgotaria o limite e derrubaria os
 *      outros fundos do app. Aqui tudo é liberado ao desmontar.
 *   3. Densidade de pixels em no máximo 1,5 (era 2). O shader faz ruído
 *      fractal por pixel, então o custo cresce com a densidade. Medido em
 *      1440x900: 61 fps numa Radeon RX 580 (pior quadro 17 ms); sem placa
 *      de vídeo, com renderização por software, cai para ~6 fps.
 *   4. Sem largura/altura mínimas de 1200x800: eram do painel de
 *      pré-visualização do Originkit e estourariam a coluna do login. O
 *      tamanho vem do contêiner.
 *   5. Sem fundo próprio no contêiner: se o WebGL não estiver disponível,
 *      quem aparece é o gradiente da marca do painel, não um bloco preto.
 *
 * HEX LITERAL AQUI É PROPOSITAL
 *   Esta pasta é isenta da trava de design tokens (scripts/verificar-tokens.mjs),
 *   porque `var(--token)` não existe dentro de um shader. A cor entra por
 *   prop, e quem chama passa o valor da marca.
 */

import React, { useEffect, useRef } from 'react';
import { usaMenosMovimento, ehDispositivoDeToque } from '../backgrounds/preferencias';

const MAX_DPR = 1.5;
const TRAIL_POINTS = 16;
const ATLAS_COLS = 8;
const ATLAS_ROWS = 4;
const ATLAS_CELL = 128;
const ATLAS_PAD = 12;
const STROKE = 6;

const GLYPHS = [
  'M50 40 C30 38 32 8 50 8 C68 8 70 38 50 40 Z M50 40 V92 M24 50 H76',
  'M14 40 Q50 14 86 40 Q50 58 14 40 Z M43 40 A7 7 0 1 0 57 40 A7 7 0 1 0 43 40 M40 54 L34 84 M52 56 Q70 70 60 84 Q52 90 46 82',
  'M20 50 A30 30 0 1 0 80 50 A30 30 0 1 0 20 50 M45 50 A5 5 0 1 0 55 50 A5 5 0 1 0 45 50',
  'M20 90 V14 H80 V90 H50 V40',
  'M50 92 V20 Q50 8 58 12 Q66 30 56 48 M50 60 L40 52 M50 44 L40 36',
  'M20 70 H70 Q86 70 86 60 Q86 52 74 52 H40 Q30 52 28 40 M40 52 V70',
  'M10 76 Q24 60 38 76 T66 76 Q78 76 82 62 Q86 50 76 46 M76 46 L70 36 M76 46 L84 38',
  'M30 90 L40 70 Q20 60 26 36 Q30 20 46 22 Q60 22 64 36 Q70 60 88 84 M46 22 L40 14 M36 34 A3 3 0 1 0 42 34 A3 3 0 1 0 36 34 M40 70 L60 72 M50 71 L48 92 M58 72 L62 92',
  'M18 70 Q18 34 50 34 Q82 34 82 70 Z',
  'M14 40 H86 Q86 72 50 72 Q14 72 14 40 Z',
  'M26 14 H74 Q84 14 84 26 V74 Q84 86 74 86 H26 Q16 86 16 74 V26 Q16 14 26 14 Z M16 94 H84',
  'M44 92 L36 84 M44 92 L52 84 M44 88 V28 L56 18 Q62 14 66 22 L58 30',
  'M50 12 V88 M18 32 L82 68 M82 32 L18 68',
  'M40 92 V20 H60 V92 M34 30 H66 M34 40 H66 M34 50 H66 M30 92 H70',
  'M50 92 V56 M50 56 Q30 50 26 20 Q42 30 50 56 Q58 30 74 20 Q70 50 50 56 M50 56 L50 18',
  'M50 10 Q70 25 50 40 Q30 55 50 70 Q70 85 50 95 M50 10 Q30 25 50 40 Q70 55 50 70 Q30 85 50 95',
  'M30 20 V70 Q30 84 50 84 H84 Q88 84 86 78 L60 66 Q54 64 54 56 V20',
  'M14 60 H60 L80 30 M60 60 Q70 76 86 76',
  'M36 36 A12 12 0 1 0 60 36 A12 12 0 1 0 36 36 M48 48 Q30 60 34 78 Q50 88 72 72 L86 60 M40 82 L36 94 M56 84 L60 94',
  'M14 50 Q50 24 86 50 Q50 76 14 50 Z',
  'M34 10 V90 M66 10 V90 M34 26 H66 M34 42 H66 M34 58 H66 M34 74 H66',
  'M20 80 L50 24 L80 80 Z M10 90 H90',
  'M12 70 Q14 44 36 44 H70 Q84 44 86 30 M86 30 Q92 40 88 54 L80 70 M20 70 V90 M70 56 V90 M36 44 Q34 30 46 28',
  'M26 44 A24 24 0 1 0 74 44 A24 24 0 1 0 26 44 M18 86 H82 M40 66 V86 M60 66 V86',
  'M8 42 L16 34 L24 42 L32 34 L40 42 L48 34 L56 42 L64 34 L72 42 L80 34 L88 42 M8 62 L16 54 L24 62 L32 54 L40 62 L48 54 L56 62 L64 54 L72 62 L80 54 L88 62',
  'M10 38 H90 M10 50 H90 M10 62 H90',
  'M12 36 H88 V64 H12 Z',
  'M8 50 H92 M20 38 V62 M40 38 V62 M60 38 V62 M80 38 V62',
  'M10 38 H90 V62 H10 Z M22 50 H78',
  'M8 56 Q20 40 32 56 T56 56 T80 56 Q86 48 92 44',
  'M16 40 H84 M16 60 H84 M28 40 V60 M72 40 V60',
  'M8 50 H86 M72 38 L90 50 L72 62 M8 38 V62',
];

const VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG_SRC = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uDpr;
uniform float uTime;
uniform float uSize;
uniform float uReach;
uniform float uHover;
uniform vec3  uBg;
uniform vec3  uGlyph;
uniform vec3  uAccent;
uniform vec3  uPts[${TRAIL_POINTS + 1}];
uniform sampler2D uAtlas;

float h11(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = h21(i);
    float b = h21(i + vec2(1.0, 0.0));
    float c = h21(i + vec2(0.0, 1.0));
    float d = h21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        s += a * vnoise(p);
        p = p * 2.03 + 17.1;
        a *= 0.5;
    }
    return s;
}

float fall(float x) {
    x = clamp(x, 0.0, 1.0);
    float k = 1.0 - x * x;
    return k * k;
}

float lightAt(vec2 q, float r) {
    float m = 0.0;
    for (int i = 0; i < ${TRAIL_POINTS + 1}; i++) {
        vec3 P = uPts[i];
        if (P.z <= 0.0) continue;
        m = max(m, P.z * fall(length(q - P.xy) / r));
    }
    return m;
}

float atlas(vec2 uv, float bias) { return texture2D(uAtlas, uv, bias).r; }

void main() {
    vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
    float W = uSize;

    float cx = floor(p.x / W);
    float xin = p.x - cx * W;
    float oy = h11(cx + 3.7) * W;
    float yy = p.y + oy;
    float cy = floor(yy / W);
    vec2 local = vec2(xin / W, yy / W - cy);

    float split = step(0.62, h21(vec2(cx + 11.3, cy - 7.1)));
    float gid;
    float hc;
    vec2 auv;
    vec2 centre;
    float edgeY;
    if (split > 0.5) {
        float sub = floor(local.y * 2.0);
        float ly = fract(local.y * 2.0);
        hc = h21(vec2(cx * 1.7 + sub * 5.3, cy + sub * 3.1));
        gid = 24.0 + floor(hc * 8.0);
        auv = vec2(local.x, (${ATLAS_PAD}.0 + (30.0 + ly * 40.0) * 1.04) / ${ATLAS_CELL}.0);
        centre = vec2((cx + 0.5) * W, (cy + (sub + 0.5) * 0.5) * W - oy);
        edgeY = ly;
    } else {
        hc = h21(vec2(cx, cy));
        gid = floor(hc * 24.0);
        auv = local;
        centre = vec2((cx + 0.5) * W, (cy + 0.5) * W - oy);
        edgeY = local.y;
    }
    float flip = step(0.5, h11(cx + 9.1));
    if (flip > 0.5) auv.x = 1.0 - auv.x;
    float sgn = flip > 0.5 ? -1.0 : 1.0;

    float empty = step(h21(vec2(cx - 5.3, cy + 2.9)), 0.06);
    float mask = step(0.03, local.x) * step(local.x, 0.97)
               * step(0.03, edgeY) * step(edgeY, 0.97) * (1.0 - empty);

    vec2 cell = vec2(mod(gid, ${ATLAS_COLS}.0), floor(gid / ${ATLAS_COLS}.0));
    vec2 uv = (cell + auv) / vec2(${ATLAS_COLS}.0, ${ATLAS_ROWS}.0);

    float c = atlas(uv, 0.0) * mask;
    float soft = atlas(uv, 1.5) * mask;
    float glow = atlas(uv, 3.0) * mask;
    vec2 ex = vec2(3.0 / ${ATLAS_COLS * ATLAS_CELL}.0, 0.0);
    vec2 ey = vec2(0.0, 3.0 / ${ATLAS_ROWS * ATLAS_CELL}.0);
    float gx = (atlas(uv + ex, 1.0) - atlas(uv - ex, 1.0)) * sgn * mask;
    float gy = (atlas(uv + ey, 1.0) - atlas(uv - ey, 1.0)) * mask;

    float n = fbm(p / 38.0);
    float colTone = 0.86 + 0.26 * h11(cx + 1.3);
    vec3 stone = uBg * colTone * (0.72 + 0.56 * n);
    stone *= 0.93 + 0.07 * vnoise(vec2(xin / 5.0 + cx * 7.0, p.y / 160.0));
    stone *= 0.95 + 0.05 * h21(floor(p));
    float gd = min(xin, W - xin);
    stone *= mix(0.3, 1.0, smoothstep(0.6, 2.6, gd));
    stone *= 1.0 + 0.35 * smoothstep(2.4, 3.2, xin) * (1.0 - smoothstep(3.2, 5.5, xin));

    float spot = lightAt(p, uReach * 1.25) * uHover;
    float cellL = lightAt(centre, uReach) * uHover;
    float jitter = (h21(centre * 0.013 + 4.1) - 0.5) * 0.35;
    float lit = smoothstep(0.3, 0.7, cellL + jitter);

    float th = h21(centre * 0.021 + 9.7);
    float tw = step(0.95, th) * pow(max(0.0, sin(uTime * (0.35 + 0.7 * fract(th * 13.0)) + th * 40.0)), 6.0);
    lit = max(lit, tw * 0.8);

    vec2 dl = (uPts[0].z > 0.0 ? uPts[0].xy : p + vec2(-240.0, -320.0)) - p;
    vec2 ld = dl / max(length(dl), 1.0);
    float edge = clamp((gx * ld.x + gy * ld.y) * 2.0, -1.0, 1.0);

    vec3 col = stone * (1.0 + 1.1 * spot) + uAccent * stone * spot * 0.6;
    col *= 1.0 - 0.55 * c;
    col -= col * 0.45 * max(-edge, 0.0);
    col += uGlyph * (0.08 * c + 0.22 * max(edge, 0.0) * (0.3 + spot));

    vec3 gold = uAccent * (1.05 * c + 0.55 * glow + 0.25 * soft) + vec3(1.0, 0.95, 0.85) * 0.12 * c * c;
    col += gold * lit;

    gl_FragColor = vec4(col, 1.0);
}
`;

const numero = (v, padrao) => (typeof v === 'number' && Number.isFinite(v) ? v : padrao);

/** Converte '#rgb', '#rrggbb', 'hsl(...)' ou 'rgb(...)' em [r, g, b] de 0 a 1. */
function paraRgb(entrada, padrao) {
  if (!entrada) return padrao;
  let str = String(entrada).trim();
  const comVar = str.match(/^var\([^,]+,\s*(.+)\)$/);
  if (comVar) str = comVar[1].trim();

  if (str.charAt(0) === '#') {
    let hex = str.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
        return [r / 255, g / 255, b / 255];
      }
    }
    return padrao;
  }

  const hsl = str.match(/^hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%[\s,]+([\d.]+)%/);
  if (hsl) {
    const h = parseFloat(hsl[1]) / 360;
    const s = parseFloat(hsl[2]) / 100;
    const l = parseFloat(hsl[3]) / 100;
    const k = (n) => {
      const a = s * Math.min(l, 1 - l);
      const t = (n + h * 12) % 12;
      return l - a * Math.max(-1, Math.min(t - 3, 9 - t, 1));
    };
    return [k(0), k(8), k(4)];
  }

  const m = str.match(/[\d.]+/g);
  if (m && m.length >= 3) {
    return [
      Math.min(255, parseFloat(m[0])) / 255,
      Math.min(255, parseFloat(m[1])) / 255,
      Math.min(255, parseFloat(m[2])) / 255,
    ];
  }
  return padrao;
}

function compilar(gl, tipo, fonte) {
  const sh = gl.createShader(tipo);
  if (!sh) return null;
  gl.shaderSource(sh, fonte);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('GlyphWall shader:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/** Desenha os 32 glifos numa grade 8x4 de texturas; o shader amostra daqui. */
function montarAtlas() {
  const cv = document.createElement('canvas');
  cv.width = ATLAS_COLS * ATLAS_CELL;
  cv.height = ATLAS_ROWS * ATLAS_CELL;
  const ctx = cv.getContext('2d');
  if (!ctx) return cv;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = '#fff';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const escala = (ATLAS_CELL - ATLAS_PAD * 2) / 100;
  GLYPHS.forEach((d, i) => {
    const x = (i % ATLAS_COLS) * ATLAS_CELL + ATLAS_PAD;
    const y = Math.floor(i / ATLAS_COLS) * ATLAS_CELL + ATLAS_PAD;
    ctx.setTransform(escala, 0, 0, escala, x, y);
    ctx.lineWidth = STROKE;
    ctx.stroke(new Path2D(d));
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

/**
 * Props (todas opcionais). Os padrões são o preset "Custom Style" escolhido
 * no Originkit: fundo preto e destaque lilás.
 *   fundo, corDoGlifo, destaque — cores
 *   tamanho  — lado de cada bloco de pedra, em px
 *   velocidade — ritmo da cintilação (50 = normal)
 *   brilho   — intensidade da luz do cursor, em % (100 = normal)
 *   alcance  — raio da luz do cursor, em px
 *   rastro   — quanto tempo o rastro demora a apagar, em ms
 */
export default function GlyphWall({
  fundo = '#000000',
  corDoGlifo = '#A9B8C9',
  destaque = '#B57AF2',
  tamanho = 50,
  velocidade = 50,
  brilho = 107,
  alcance = 180,
  rastro = 900,
  className,
  style,
}) {
  const raizRef = useRef(null);

  // A cada render os valores mais novos ficam aqui; o laço de desenho lê
  // daqui sem precisar reiniciar o WebGL quando uma prop muda.
  const valoresRef = useRef(null);
  valoresRef.current = {
    bg: paraRgb(fundo, [0, 0, 0]),
    glifo: paraRgb(corDoGlifo, [0.663, 0.722, 0.788]),
    destaque: paraRgb(destaque, [0.71, 0.478, 0.949]),
    tamanho: Math.max(20, numero(tamanho, 50)),
    velocidade: Math.max(0, numero(velocidade, 50)) / 50,
    brilho: Math.max(0, numero(brilho, 107)) / 100,
    alcance: Math.max(10, numero(alcance, 180)),
    rastro: Math.max(0, numero(rastro, 900)),
  };

  useEffect(() => {
    // Celular não tem mouse: um quadro só. Quem pediu menos movimento ao
    // sistema mantém a lanterna do mouse, mas sem cintilação autônoma.
    const parado = ehDispositivoDeToque();
    const congelado = usaMenosMovimento();

    const raiz = raizRef.current;
    if (!raiz) return undefined;

    // O canvas nasce AQUI, um novo a cada montagem, e não no JSX. Motivo: o
    // React em desenvolvimento (StrictMode) monta, desmonta e monta de novo.
    // A limpeza abaixo devolve o contexto WebGL ao navegador; se o canvas
    // fosse o mesmo, a segunda montagem receberia o contexto já perdido e
    // todo shader falharia com "info log: null".
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    raiz.appendChild(canvas);

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false });
    if (!gl) {
      // Sem WebGL o painel fica só com o gradiente. Falha silenciosa é
      // correta: é decoração, e derrubar a tela de LOGIN por ela seria
      // desproporcional.
      canvas.remove();
      return undefined;
    }

    const vs = compilar(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const programa = gl.createProgram();
    if (!vs || !fs || !programa) {
      canvas.remove();
      return undefined;
    }

    gl.attachShader(programa, vs);
    gl.attachShader(programa, fs);
    gl.linkProgram(programa);
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
      console.error('GlyphWall link:', gl.getProgramInfoLog(programa));
      canvas.remove();
      return undefined;
    }
    gl.useProgram(programa);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(programa, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const textura = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textura);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, montarAtlas());
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const u = {
      res: gl.getUniformLocation(programa, 'uRes'),
      dpr: gl.getUniformLocation(programa, 'uDpr'),
      time: gl.getUniformLocation(programa, 'uTime'),
      size: gl.getUniformLocation(programa, 'uSize'),
      reach: gl.getUniformLocation(programa, 'uReach'),
      hover: gl.getUniformLocation(programa, 'uHover'),
      bg: gl.getUniformLocation(programa, 'uBg'),
      glyph: gl.getUniformLocation(programa, 'uGlyph'),
      accent: gl.getUniformLocation(programa, 'uAccent'),
      pts: gl.getUniformLocation(programa, 'uPts'),
      atlas: gl.getUniformLocation(programa, 'uAtlas'),
    };
    gl.uniform1i(u.atlas, 0);

    // O cursor é lido na janela inteira: a lanterna segue o mouse mesmo
    // quando ele passa por cima do texto do painel.
    const ponteiro = { x: 0, y: 0, tem: false, saiu: true };
    let quadro = 0;
    const aoMover = (e) => {
      ponteiro.x = e.clientX;
      ponteiro.y = e.clientY;
      ponteiro.tem = true;
      ponteiro.saiu = false;
      // No modo reativo o laço dorme quando não há luz; o mouse acorda.
      if (congelado && !quadro) quadro = requestAnimationFrame(desenhar);
    };
    const aoSair = () => {
      ponteiro.saiu = true;
    };
    if (!parado) {
      window.addEventListener('pointermove', aoMover, { passive: true });
      document.documentElement.addEventListener('pointerleave', aoSair);
      window.addEventListener('blur', aoSair);
    }

    const trilha = [];
    const cabeca = { x: 0, y: 0, t: -1e9, dentro: false };
    const pontos = new Float32Array((TRAIL_POINTS + 1) * 3);

    let ultimo = performance.now();
    let relogio = 0;

    function desenhar(agora) {
      // O ResizeObserver e o mouse também chamam esta função; cancelar o
      // quadro pendente evita dois laços rodando em paralelo.
      if (quadro) {
        cancelAnimationFrame(quadro);
        quadro = 0;
      }
      const dt = Math.max(0, Math.min(0.05, (agora - ultimo) / 1000));
      ultimo = agora;
      const v = valoresRef.current;
      // Congelado: o relógio da cintilação não anda.
      if (!congelado) relogio = (relogio + dt * v.velocidade) % 3600;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const cw = canvas.clientWidth || 1;
      const ch = canvas.clientHeight || 1;
      const bw = Math.max(1, Math.round(cw * dpr));
      const bh = Math.max(1, Math.round(ch * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        gl.viewport(0, 0, bw, bh);
      }

      let dentro = false;
      let lx = 0;
      let ly = 0;
      if (ponteiro.tem && !ponteiro.saiu) {
        const r = raiz.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          lx = ((ponteiro.x - r.left) * raiz.offsetWidth) / r.width;
          ly = ((ponteiro.y - r.top) * raiz.offsetHeight) / r.height;
          dentro = lx >= 0 && ly >= 0 && lx <= cw && ly <= ch;
        }
      }
      if (dentro) {
        cabeca.x = lx;
        cabeca.y = ly;
        cabeca.t = agora;
        const cauda = trilha[trilha.length - 1];
        const passo = Math.max(8, v.alcance * 0.25);
        if (!cauda || Math.hypot(cauda.x - lx, cauda.y - ly) > passo) {
          trilha.push({ x: lx, y: ly, t: agora });
          if (trilha.length > TRAIL_POINTS) trilha.shift();
        }
      }
      cabeca.dentro = dentro;

      const apagar = (t) => {
        if (v.rastro <= 0) return 0;
        const w = Math.max(0, Math.min(1, 1 - (agora - t) / v.rastro));
        return w * w * (3 - 2 * w);
      };
      pontos[0] = cabeca.x;
      pontos[1] = cabeca.y;
      pontos[2] = cabeca.dentro ? 1 : apagar(cabeca.t);
      for (let i = 0; i < TRAIL_POINTS; i++) {
        const p = trilha[i];
        const o = (i + 1) * 3;
        pontos[o] = p ? p.x : 0;
        pontos[o + 1] = p ? p.y : 0;
        pontos[o + 2] = p ? apagar(p.t) : 0;
      }

      gl.uniform2f(u.res, bw, bh);
      gl.uniform1f(u.dpr, bw / cw);
      gl.uniform1f(u.time, relogio);
      gl.uniform1f(u.size, v.tamanho);
      gl.uniform1f(u.reach, v.alcance);
      gl.uniform1f(u.hover, v.brilho);
      gl.uniform3f(u.bg, v.bg[0], v.bg[1], v.bg[2]);
      gl.uniform3f(u.glyph, v.glifo[0], v.glifo[1], v.glifo[2]);
      gl.uniform3f(u.accent, v.destaque[0], v.destaque[1], v.destaque[2]);
      gl.uniform3fv(u.pts, pontos);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (parado) return;
      // Animado: sempre. Reativo: só enquanto o mouse está no painel ou o
      // rastro ainda está apagando; depois disso o laço dorme.
      const haLuz = dentro || agora - cabeca.t < v.rastro + 100;
      if (!congelado || haLuz) quadro = requestAnimationFrame(desenhar);
    }

    // Modos parado e reativo: o ResizeObserver dispara ao começar a observar
    // (primeiro quadro) e de novo quando o painel muda de tamanho, porque
    // redimensionar a janela zera o canvas. O modo animado já redesenha
    // todo quadro.
    let observador = null;
    if (parado || congelado) {
      observador = new ResizeObserver(() => desenhar(performance.now()));
      observador.observe(canvas);
    } else {
      quadro = requestAnimationFrame(desenhar);
    }

    return () => {
      cancelAnimationFrame(quadro);
      observador?.disconnect();
      window.removeEventListener('pointermove', aoMover);
      document.documentElement.removeEventListener('pointerleave', aoSair);
      window.removeEventListener('blur', aoSair);
      gl.deleteTexture(textura);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(programa);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      // Devolve o contexto ao navegador já, em vez de esperar o coletor de
      // lixo — o limite de contextos vivos é pequeno.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={raizRef}
      className={className}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}
    />
  );
}
