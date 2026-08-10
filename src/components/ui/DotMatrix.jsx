/**
 * REPASS AI — MATRIZ DE PONTOS (fundo WebGL)
 *
 * Grade de pontos que acende do centro para fora, com cintilação aleatória.
 * Usada como fundo do painel de identidade da tela de acesso.
 *
 * DE ONDE VEIO E O QUE MUDOU
 *   O shader é o efeito "dot matrix" que circula em bibliotecas de UI. A
 *   versão original carregava o Three.js por <script> de um CDN. Aqui isso
 *   não funcionaria e nem deveria:
 *
 *   1. O index.html declara `script-src 'self'`. O navegador BLOQUEIA script
 *      de outro domínio — o fundo simplesmente não apareceria, sem erro
 *      visível na tela.
 *   2. `three` já é dependência do projeto (package.json). Buscar uma
 *      segunda cópia pela rede é peso e risco sem ganho.
 *   3. Script de terceiro sem `integrity` é justamente a lacuna que
 *      docs/SEGURANCA.md registra em aberto. Não vale abrir uma nova.
 *
 *   Por isso: `import * as THREE from 'three'`, empacotado com o resto.
 *
 * HEX LITERAL AQUI É PROPOSITAL
 *   Esta pasta é isenta da trava de design tokens (scripts/verificar-tokens.mjs),
 *   porque `var(--token)` não existe dentro de um shader. A cor entra por
 *   prop, e quem chama passa o valor da marca.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usaMenosMovimento, ehDispositivoDeToque } from '../backgrounds/preferencias';

/** Converte '#rrggbb' em THREE.Vector3 normalizado (0..1). */
function paraVetorDeCor(hex) {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

const VERTEX_SHADER = `
  precision mediump float;
  uniform vec2 u_resolution;
  out vec2 fragCoord;
  void main() {
    gl_Position = vec4(position, 1.0);
    fragCoord = (position.xy + 1.0) * 0.5 * u_resolution;
    fragCoord.y = u_resolution.y - fragCoord.y;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  in vec2 fragCoord;

  uniform float u_time;
  uniform float u_opacities[10];
  uniform vec3 u_colors[6];
  uniform float u_total_size;
  uniform float u_dot_size;
  uniform vec2 u_resolution;

  out vec4 fragColor;

  float PHI = 1.61803398874989484820459;
  float random(vec2 xy) {
      return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
  }

  void main() {
      vec2 st = fragCoord.xy;
      st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
      st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

      float opacity = step(0.0, st.x) * step(0.0, st.y);

      vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

      float frequency = 5.0;
      float show_offset = random(st2);
      float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
      opacity *= u_opacities[int(rand * 10.0)];
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

      vec3 color = u_colors[int(show_offset * 6.0)];

      float animation_speed_factor = 3.0;
      vec2 center_grid = u_resolution / 2.0 / u_total_size;
      float dist_from_center = distance(center_grid, st2);

      float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

      opacity *= step(timing_offset_intro, u_time * animation_speed_factor);
      opacity *= clamp((1.0 - step(timing_offset_intro + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);

      fragColor = vec4(color, opacity);
      fragColor.rgb *= fragColor.a;
  }
`;

export default function DotMatrix({
  cores = ['#7c5cff', '#56d8e6', '#7c5cff', '#a78bfa', '#56d8e6', '#7c5cff'],
  tamanhoDoPonto = 6,
  espacamento = 20,
  className,
  style,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Fundo animado é enfeite. Quem pediu menos movimento não recebe
    // movimento, e celular não gasta GPU e bateria com isto enquanto o
    // operador trabalha. Mesma decisão dos outros fundos do projeto.
    if (usaMenosMovimento() || ehDispositivoDeToque()) return undefined;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    let renderer;
    let geometry;
    let material;
    let quadroAgendado = 0;
    let ativo = true;

    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      // Sem WebGL (máquina antiga, driver bloqueado) o painel fica só com o
      // gradiente de fundo. Falha silenciosa é correta aqui: é decoração,
      // e derrubar a tela de LOGIN por causa dela seria desproporcional.
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_opacities: { value: [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0] },
      u_colors: { value: cores.slice(0, 6).map(paraVetorDeCor) },
      u_total_size: { value: espacamento },
      u_dot_size: { value: tamanhoDoPonto },
    };

    material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
      transparent: true,
    });

    geometry = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    /*
      A resolução do shader é o dobro do tamanho em CSS, sempre — não o
      devicePixelRatio da máquina. Amarrar a densidade da grade ao monitor
      faria os pontos saírem do tamanho de um bico de caneta numa tela
      Retina e de uma moeda numa tela comum. Aqui a grade é a mesma em
      qualquer aparelho; o pixelRatio cuida só da nitidez.
    */
    const redimensionar = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      uniforms.u_resolution.value.set(w * 2, h * 2);
    };

    // Observa o CONTÊINER, não a janela: o painel muda de tamanho quando o
    // layout passa de duas colunas para uma, sem a janela mudar de tamanho.
    const observador = new ResizeObserver(redimensionar);
    observador.observe(container);
    redimensionar();

    const inicio = performance.now();
    const desenhar = () => {
      if (!ativo) return;
      quadroAgendado = requestAnimationFrame(desenhar);
      uniforms.u_time.value = (performance.now() - inicio) / 1000;
      renderer.render(scene, camera);
    };
    desenhar();

    return () => {
      ativo = false;
      if (quadroAgendado) cancelAnimationFrame(quadroAgendado);
      observador.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
    // As cores vêm de um literal no chamador; comparar por conteúdo evita
    // recriar o contexto WebGL a cada render do pai.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cores.join(','), tamanhoDoPonto, espacamento]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={className}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
