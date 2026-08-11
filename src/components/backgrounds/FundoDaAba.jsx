/**
 * REPASS AI — FUNDO POR ABA
 *
 * Uma camada de fundo por view, escolhida por um registro declarativo.
 *
 * POR QUE ISSO EXISTE
 * -------------------
 * Sem isto, "dar um fundo próprio para cada aba" significa espalhar um
 * bloco de <div position:fixed> dentro de cada view — foi o que já
 * acontecia na Abordagem 1-a-1. Onze views, onze blocos, cada um com seu
 * z-index, sua opacidade e sua própria decisão sobre mobile. Trocar um
 * efeito viraria caçar código em arquivo de tela.
 *
 * Aqui a view não sabe que tem fundo. Ela só desenha conteúdo. O fundo é
 * montado uma vez, ao lado do <main>, e o REGISTRO abaixo é o único lugar
 * onde se decide o que aparece em cada aba.
 *
 * COMO TROCAR O FUNDO DE UMA ABA
 * ------------------------------
 * Mude uma linha em REGISTRO. É isso.
 *
 * COMO ADICIONAR UM EFEITO NOVO (ex.: um da 77lib)
 * -----------------------------------------------
 *   1. Ponha o componente em src/components/ui/
 *   2. Declare um lazy() na lista EFEITOS
 *   3. Aponte a aba para ele no REGISTRO
 *
 * TRÊS REGRAS QUE O SISTEMA GARANTE SOZINHO
 * -----------------------------------------
 *   · quem pediu menos movimento não recebe animação nenhuma
 *   · em tela de toque o fundo animado não roda (é GPU cara e bateria)
 *   · nada disso entra no bundle inicial: cada efeito é lazy
 */

import React, { Suspense, lazy, useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { usaMenosMovimento, ehDispositivoDeToque } from './preferencias';

/* ============================================================
   EFEITOS DISPONÍVEIS
   ============================================================
   Todo efeito entra por lazy(): fundo é enfeite, não pode atrasar o
   primeiro render de uma tela de trabalho.
   ============================================================ */

const PixelBlast = lazy(() => import('../ui/PixelBlast.jsx'));
const CampoDeFluxo = lazy(() => import('../ui/FlowFieldBackground.jsx'));
const VeuEscuro = lazy(() => import('../ui/DarkVeil.jsx'));
const GradeDePrisma = lazy(() => import('../ui/PrismGrid.jsx'));
const OndasASCII = lazy(() => import('../ui/ASCIIWaves.jsx'));
const RuidoDeLetras = lazy(() => import('../ui/LetterGlitch.jsx'));

/* ============================================================
   REGISTRO — aba → fundo
   ============================================================
   `null` significa NEUTRO: nada é desenhado e aparece a atmosfera
   iridescente da marca, que já vive em body::before (index.css). Neutro
   não é ausência de design — é o fundo padrão do REPASS AI.
   ============================================================ */

const NEUTRO = null;

const REGISTRO = {
  // --- Telas de trabalho pesado: fundo com presença ---
  //     Opacidade menor no Funil: lá são três colunas de cartão, e o
  //     padrão de pixels atrás de tanto conteúdo vira ruído.
  leads: { efeito: 'pixel-blast', opacidade: 0.5 },
  crm:   { efeito: 'pixel-blast', opacidade: 0.34 },

  // --- Abordagem: já tinha o campo de fluxo embutido na view;
  //     agora vem daqui, e a view voltou a ser só conteúdo.
  //
  //     0.28 -> 0.52. Aqui a opacidade do fundo não é gosto: os cartões
  //     desta aba são de VIDRO, e vidro só aparece quando existe algo atrás
  //     para refratar. Com o fundo fraco, a refração não tinha o que
  //     entortar e o cartão lia como retângulo cinza. O fundo é o que faz
  //     o material existir. ---
  bulk_whatsapp: { efeito: 'campo-de-fluxo', opacidade: 0.52 },

  // --- Painel: grade de prisma reagindo ao cursor ---
  //     `interativo` liga os eventos de ponteiro NESTA camada. Sem isso o
  //     efeito existe e nunca acende: o contêiner de fundo é
  //     `pointer-events: none` por padrão, e o componente acende a célula
  //     ouvindo `pointermove` no próprio elemento.
  //
  //     Ligar aqui não rouba clique do conteúdo: a grade fica em z-index 0,
  //     abaixo de tudo. Ela só recebe ponteiro onde não há cartão em cima —
  //     que é exatamente onde a grade aparece.
  dashboard: { efeito: 'grade-de-prisma', opacidade: 0.38, interativo: true },

  // --- Neutro (atmosfera da marca) ---
  wizard:        NEUTRO,   // pedido explícito: Criar Site fica neutro
  agendamentos:  NEUTRO,
  projetos:      NEUTRO,
  cobrar:        NEUTRO,
  templates:     NEUTRO,
  ranking:       NEUTRO,
  engine:        NEUTRO,
  editor:        NEUTRO,
  landing:       NEUTRO,
  login:         NEUTRO,
};

/* ============================================================
   FÁBRICA DE EFEITOS
   ============================================================
   Cada efeito recebe as cores do tema ATUAL. Fundo em canvas não
   entende var(--), então a cor precisa chegar resolvida — é por isso
   que este componente lê o tema em vez de deixar tudo no CSS.
   ============================================================ */

function montarEfeito(nome, tema) {
  const escuro = tema === 'dark';

  switch (nome) {
    /*
      Pixel Blast (77lib), remapeado para a marca.

      O original era ciano #33c7ff sobre preto #070714/#050510 — sobre o
      papel quente isso vira uma placa preta no meio da identidade. Aqui:

        · a cor dos pixels é o violeta da marca (no escuro, o lilás, que
          tem mais presença sobre grafite);
        · o fundo deixou de ser preto e virou o mesmo halo iridescente da
          atmosfera — violeta em cima, ciano embaixo — apenas mais denso,
          para o efeito ter sobre o que aparecer.

      A lógica e o timing do shader não foram tocados.
    */
    case 'pixel-blast':
      return (
        <PixelBlast
          cor={escuro ? '#a78bfa' : '#7c5cff'}
          fundo={
            escuro
              ? 'radial-gradient(56rem 32rem at 50% 0%, rgba(124, 92, 255, 0.22), transparent 62%),' +
                'radial-gradient(50rem 35rem at 50% 120%, rgba(86, 216, 230, 0.16), transparent 60%)'
              : 'radial-gradient(56rem 32rem at 50% 0%, rgba(124, 92, 255, 0.16), transparent 62%),' +
                'radial-gradient(50rem 35rem at 50% 120%, rgba(255, 178, 122, 0.14), transparent 60%)'
          }
          variante="square"
          pixelSize={4}
          escalaDoPadrao={2}
          densidade={1}
          ondas
          velocidadeDaOnda={0.4}
          espessuraDaOnda={0.12}
          intensidadeDaOnda={1.5}
          velocidade={0.5}
          desvanecerBorda={0.25}
        />
      );

    case 'campo-de-fluxo':
      return (
        <CampoDeFluxo
          color={escuro ? '#a78bfa' : '#7c5cff'}
          background={escuro ? '#0b0c10' : '#f5f4f0'}
          trailOpacity={0.1}
          particleCount={450}
          speed={0.8}
        />
      );

    case 'veu-escuro':
      return <VeuEscuro />;

    /*
      Grade de prisma (OriginKit), remapeada para a identidade.

      O padrão do componente é fundo PRETO com células brancas, rosa-chiclete
      e mostarda — uma placa preta no meio do papel quente, e três cores que
      não pertencem à marca.

      Duas mudanças, nenhuma na lógica do efeito:

        · `backgroundColor: 'transparent'` — a grade deixa de pintar fundo e
          passa a desenhar SOBRE o papel. É o que faz ela parecer parte da
          folha, e não um retângulo colado por cima.
        · a paleta vira a família iridescente da marca. No tema claro os
          tons são os pastéis; no escuro, os mesmos matizes um pouco mais
          vivos, porque sobre grafite o pastel some.

      `borderColor` usa token: aqui é DOM, não shader, então `var(--)`
      resolve — e a linha da grade acompanha o tema sozinha.
    */
    case 'grade-de-prisma':
      return (
        <GradeDePrisma
          backgroundColor="transparent"
          boxSize={48}
          borderWidth={1}
          borderColor="var(--sobre-08)"
          colors={{
            paletteCount: 6,
            color1: escuro ? '#a78bfa' : '#7c5cff',
            color2: escuro ? '#56d8e6' : '#56d8e6',
            color3: escuro ? '#c4b5fd' : '#b8a5ff',
            color4: escuro ? '#7c5cff' : '#ffb27a',
            color5: escuro ? '#8ee7f2' : '#9fe8f0',
            color6: escuro ? '#a5b4fc' : '#5b8cff',
          }}
        />
      );

    case 'ondas-ascii':
      return <OndasASCII />;

    case 'ruido-de-letras':
      return <RuidoDeLetras />;

    default:
      // Nome desconhecido no registro cai em neutro em vez de quebrar a
      // tela. Fundo nunca pode derrubar uma view de trabalho.
      return null;
  }
}

/* ============================================================
   COMPONENTE
   ============================================================ */

export default function FundoDaAba({ aba }) {
  const { theme } = useTheme();

  const desligado = useMemo(
    () => usaMenosMovimento() || ehDispositivoDeToque(),
    []
  );

  const config = REGISTRO[aba] ?? NEUTRO;
  if (!config || desligado) return null;

  const efeito = montarEfeito(config.efeito, theme);
  if (!efeito) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        // Fundo decorativo não intercepta ponteiro. A exceção é o efeito que
        // REAGE ao cursor: sem receber `pointermove` ele nunca acende, e o
        // operador veria uma grade morta achando que quebrou.
        pointerEvents: config.interativo ? 'auto' : 'none',
        overflow: 'hidden',
        opacity: config.opacidade ?? 0.3,
        // A troca de aba não deve piscar: o fundo entra por transição.
        transition: 'opacity var(--dur-flow) var(--ease-suave)',
      }}
    >
      {/* Sem fallback: um placeholder piscando atrás do conteúdo chama
          mais atenção do que a ausência momentânea do efeito. */}
      <Suspense fallback={null}>{efeito}</Suspense>
    </div>
  );
}

/** Exportado para teste e para a tela de ajustes, se um dia existir. */
export { REGISTRO };
