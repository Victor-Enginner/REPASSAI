"use client"

import { useEffect, useState } from "react"

// Os quatro blocos do hero antigo do REPASS AI: RE / PASS na primeira
// linha, A / I na segunda. Cada letra entra em sequencia, nunca o bloco
// inteiro de uma vez -- e o detalhe que o dono queria preservar.
const GROUPS = [
  ["R", "E"],
  ["P", "A", "S", "S"],
  ["A"],
  ["I"],
]
const LETTERS = GROUPS.flat()

const LETTER_IN_STAGGER  = 90    // ms entre a entrada de cada letra
const LETTER_IN_DUR      = 700   // duracao da transicao de entrada
const HOLD_DURATION      = 400   // tempo parado, totalmente visivel
const LETTERS_IN_TOTAL   = LETTER_IN_STAGGER * (LETTERS.length - 1) + LETTER_IN_DUR + HOLD_DURATION

const LETTER_OUT_STAGGER = 55    // ms entre a saida de cada letra
const LETTER_OUT_DUR     = 450   // duracao do fade de saida
const LETTERS_OUT_TOTAL  = LETTER_OUT_STAGGER * (LETTERS.length - 1) + LETTER_OUT_DUR

const CURTAIN_DELAY      = LETTERS_IN_TOTAL + 100
const CURTAIN_DURATION   = 1300  // casa com a transicao CSS da cortina
const ANIM_TOTAL         = CURTAIN_DELAY + LETTERS_OUT_TOTAL + 1400

// Momento em que a cortina termina de subir -- o fundo ja esta visivel.
export const INTRO_DURATION_MS = CURTAIN_DELAY + CURTAIN_DURATION
// Um pouco antes do fim, para o hero comecar a aparecer com sobreposicao.
export const HERO_REVEAL_MS = CURTAIN_DELAY + CURTAIN_DURATION - 150

type Phase = "idle" | "in" | "out" | "done"

export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [curtainUp, setCurtainUp] = useState(false)
  // Quem pediu menos movimento no sistema operacional pula a intro inteira.
  const [reduzido, setReduzido] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduzido(true)
      onDone()
      setPhase("done")
      return
    }

    // Atraso minimo para o browser pintar antes de iniciar a transicao.
    const t0 = setTimeout(() => setPhase("in"), 80)
    const t1 = setTimeout(() => setPhase("out"), LETTERS_IN_TOTAL)
    const t2 = setTimeout(() => setCurtainUp(true), CURTAIN_DELAY)
    const t3 = setTimeout(() => onDone(), HERO_REVEAL_MS)
    const t4 = setTimeout(() => setPhase("done"), ANIM_TOTAL)

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onDone])

  if (reduzido || phase === "done") return null

  // Indice global continuo, para o stagger atravessar os blocos sem reiniciar.
  let indiceGlobal = -1

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" aria-hidden="true">

      {/* Cortina branco-gelo, retrai para cima e revela o hero */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          bottom: curtainUp ? "100%" : "0%",
          transition: curtainUp ? "bottom 1.3s cubic-bezier(0.76, 0, 0.24, 1)" : "none",
          background: "#f5f4f1",
        }}
      />

      {/* RE PASS / A I */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="flex flex-col items-center" style={{ gap: "0.02em" }}>
          {[GROUPS.slice(0, 2), GROUPS.slice(2)].map((linha, li) => (
            <div key={li} className="flex" style={{ gap: "0.28em" }}>
              {linha.map((grupo, gi) => (
                <div key={gi} className="flex" style={{ gap: "0.02em" }}>
                  {grupo.map((letra) => {
                    indiceGlobal += 1
                    const idx = indiceGlobal
                    const inDelay  = idx * LETTER_IN_STAGGER
                    const outDelay = idx * LETTER_OUT_STAGGER

                    const isIdle = phase === "idle"
                    const isIn   = phase === "in"
                    const isOut  = phase === "out"

                    const opacity    = isIdle ? 0 : isIn ? 1 : 0
                    const blur       = isIdle ? 36 : isIn ? 0 : 24
                    const translateY = isIdle ? 48 : isIn ? 0 : -20

                    const transition = isOut
                      ? `opacity ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${outDelay}ms,
                         filter  ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${outDelay}ms,
                         transform ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${outDelay}ms`
                      : isIn
                      ? `opacity ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${inDelay}ms,
                         filter  ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${inDelay}ms,
                         transform ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${inDelay}ms`
                      : "none"

                    return (
                      <span
                        key={`${li}-${gi}-${idx}`}
                        className="font-sans font-bold text-[#111] leading-[0.86] select-none"
                        style={{
                          // 6 caracteres de largura util: cabe RE + PASS na linha 1.
                          fontSize: "min(calc((100vw - 48px) / 6), 22vh)",
                          letterSpacing: "-0.02em",
                          opacity,
                          filter: `blur(${blur}px)`,
                          transform: `translateY(${translateY}px)`,
                          transition,
                          willChange: "opacity, filter, transform",
                        }}
                      >
                        {letra}
                      </span>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
