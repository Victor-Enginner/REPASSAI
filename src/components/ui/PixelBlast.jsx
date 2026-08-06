/**
 * REPASS AI — PIXEL BLAST
 *
 * Malha de pixels gerada por ruído FBM, com ondas circulares que saem de
 * onde o usuário clica. Origem: 77lib (lic:1d6166ae2853), adaptado.
 *
 * O QUE MUDOU EM RELAÇÃO AO ORIGINAL
 * ----------------------------------
 * A lógica e o timing do shader estão intactos, como pede a licença. O
 * que foi adaptado é o entorno:
 *
 *  1. three.js vem do npm, não do CDN.
 *     O original carregava <script src="cdn.jsdelivr.net/three">. A CSP
 *     do app é `script-src 'self'` — o CDN seria bloqueado e o efeito
 *     nunca apareceria em produção. O projeto já tinha three@0.180.
 *
 *  2. O CSS global foi descartado.
 *     O pacote vinha com reset em `*`, `html` e `body` e um @import de
 *     fonte. Aplicar isso aqui atropelaria o design system inteiro. Só o
 *     que é do efeito sobreviveu, e escopado na classe do container.
 *
 *  3. As cores entram por prop.
 *     Eram fixas (#33c7ff sobre #070714/#050510). Agora vêm de fora, o
 *     que deixa o efeito seguir o tema claro/escuro da marca.
 *
 *  4. O clique é ouvido na JANELA, não no canvas.
 *     Esta camada é `pointer-events: none` — ela não pode roubar clique
 *     de botão nenhum. Ouvindo no window, a onda dispara de qualquer
 *     lugar que o usuário toque na interface, e a UI continua clicável.
 *     Ficou melhor que o original: a tela inteira vira superfície.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MAX_CLIQUES = 10;

const FORMATOS = { square: 0, circle: 1, triangle: 2, diamond: 3 };

const VERTEX_SRC = /* glsl */ `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

/* Shader original, sem alteração de lógica nem de timing. */
const FRAGMENT_SRC = /* glsl */ `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;

uniform int   uShapeType;
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 10;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  float feed = base + (uDensity - 0.5) * 0.3;

  float speed     = uRippleSpeed;
  float thickness = uRippleThickness;
  const float dampT     = 1.0;
  const float dampR     = 10.0;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      float cellPixelSize = 8.0 * pixelSize;
      vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution))) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uClickTimes[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = speed * t;
      float ring  = exp(-pow((r - waveR) / thickness, 2.0));
      float atten = exp(-dampT * t) * exp(-dampR * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;

  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;

  vec3 srgbColor = mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, color)
  );

  fragColor = vec4(srgbColor, M);
}
`;

export default function PixelBlast({
  cor = '#7c5cff',
  fundo = 'transparent',
  variante = 'square',
  pixelSize = 4,
  escalaDoPadrao = 2,
  densidade = 1,
  jitter = 0,
  ondas = true,
  velocidadeDaOnda = 0.4,
  espessuraDaOnda = 0.12,
  intensidadeDaOnda = 1.5,
  velocidade = 0.5,
  desvanecerBorda = 0.25,
}) {
  const containerRef = useRef(null);

  /*
    A cor entra por ref e não pela lista de dependências do efeito: trocar
    de tema deve atualizar o uniform, não derrubar o contexto WebGL e
    reconstruir a cena inteira. Reconstruir pisca a tela.
  */
  const corRef = useRef(cor);
  corRef.current = cor;
  const uniformsRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    // Defesa em profundidade: FundoDaAba já não monta este componente
    // quando o sistema pede menos movimento, mas o efeito não deve
    // depender de quem o chama para respeitar a preferência.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: document.createElement('canvas'),
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      // Sem WebGL (VM, driver antigo, GPU bloqueada) o fundo simplesmente
      // não existe. Um enfeite jamais pode derrubar uma tela de trabalho.
      return undefined;
    }

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uResolution: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(corRef.current) },
      uClickPos: {
        value: Array.from({ length: MAX_CLIQUES }, () => new THREE.Vector2(-1, -1)),
      },
      uClickTimes: { value: new Float32Array(MAX_CLIQUES) },
      uShapeType: { value: FORMATOS[variante] ?? 0 },
      uPixelSize: { value: pixelSize * renderer.getPixelRatio() },
      uScale: { value: escalaDoPadrao },
      uDensity: { value: densidade },
      uPixelJitter: { value: jitter },
      uEnableRipples: { value: ondas ? 1 : 0 },
      uRippleSpeed: { value: velocidadeDaOnda },
      uRippleThickness: { value: espessuraDaOnda },
      uRippleIntensity: { value: intensidadeDaOnda },
      uEdgeFade: { value: desvanecerBorda },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SRC,
      fragmentShader: FRAGMENT_SRC,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      glslVersion: THREE.GLSL3,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    const clock = new THREE.Clock();

    const ajustarTamanho = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
      uniforms.uPixelSize.value = pixelSize * renderer.getPixelRatio();
    };
    ajustarTamanho();

    const ro = new ResizeObserver(ajustarTamanho);
    ro.observe(el);

    /*
      Onda a partir do clique.

      O original escutava no próprio canvas. Aqui a camada é
      `pointer-events: none`, então o canvas nunca receberia evento — e,
      se recebesse, estaria roubando cliques dos botões. Escutando no
      window em fase de captura, a onda nasce de qualquer toque na
      interface sem interferir em nada.
    */
    let ix = 0;
    const aoClicar = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const escalaX = renderer.domElement.width / rect.width;
      const escalaY = renderer.domElement.height / rect.height;
      const fx = (e.clientX - rect.left) * escalaX;
      // O eixo Y do WebGL cresce para cima; o do DOM, para baixo.
      const fy = (rect.height - (e.clientY - rect.top)) * escalaY;
      uniforms.uClickPos.value[ix].set(fx, fy);
      uniforms.uClickTimes.value[ix] = uniforms.uTime.value;
      ix = (ix + 1) % MAX_CLIQUES;
    };
    window.addEventListener('pointerdown', aoClicar, { passive: true, capture: true });

    // Fora da tela não desenha: aba de fundo não pode consumir GPU.
    let visivel = true;
    const io = new IntersectionObserver(([entrada]) => { visivel = entrada.isIntersecting; }, { threshold: 0.01 });
    io.observe(el);

    const aoTrocarDeAba = () => { visivel = !document.hidden; };
    document.addEventListener('visibilitychange', aoTrocarDeAba);

    let raf = 0;
    const desenhar = () => {
      if (visivel) {
        uniforms.uTime.value = clock.getElapsedTime() * velocidade;
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(desenhar);
    };
    raf = requestAnimationFrame(desenhar);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointerdown', aoClicar, { capture: true });
      document.removeEventListener('visibilitychange', aoTrocarDeAba);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
      uniformsRef.current = null;
    };
    // Só reconstrói se a FORMA do efeito mudar. Cor fica fora, de
    // propósito — ver o comentário em corRef.
  }, [
    variante, pixelSize, escalaDoPadrao, densidade, jitter,
    ondas, velocidadeDaOnda, espessuraDaOnda, intensidadeDaOnda,
    velocidade, desvanecerBorda,
  ]);

  // Troca de tema: atualiza o uniform da cor sem tocar na cena.
  useEffect(() => {
    uniformsRef.current?.uColor.value.set(cor);
  }, [cor]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: fundo }}
    />
  );
}
