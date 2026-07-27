"use client"

import { useEffect, useRef, useState } from "react"

// Os passos reais do REPASS AI, na ordem exata em que o operador faz no
// painel. Cada texto descreve so o que o produto ja faz hoje -- nada aqui
// e promessa de funcionalidade futura.
const PASSOS = [
  {
    n: "01",
    label: "LEADS",
    title: "Encontre negocios que precisam de voce",
    desc: "Escolha o nicho e a cidade. O REPASS AI consulta a base do Google Places e devolve negocios reais, com telefone e nota quando existem na fonte. Quem esta sem site aparece marcado.",
    grad: "/brand/grad-1.jpg",
  },
  {
    n: "02",
    label: "CRM",
    title: "Mande os melhores para o funil",
    desc: "Marque os leads que valem a pena e envie para o CRM. Eles entram no seu funil visual, prontos para trabalhar, organizados por etapa.",
    grad: "/brand/grad-2.jpg",
  },
  {
    n: "03",
    label: "EDITOR",
    title: "Gere o site com um clique",
    desc: "No card do lead, clique em Gerar site. O motor agentico escolhe os componentes, monta o schema e compila uma landing page responsiva com os dados daquele negocio.",
    grad: "/brand/grad-3.jpg",
  },
  {
    n: "04",
    label: "EDICAO",
    title: "Ajuste conversando, sem codigo",
    desc: "Clique num texto ou numa imagem e descreva a mudanca. Cada ajuste vira uma versao no historico, entao da para voltar quando quiser.",
    grad: "/brand/grad-4.jpg",
  },
  {
    n: "05",
    label: "PUBLICACAO",
    title: "Publique e mande o link",
    desc: "O HTML sobe para o Cloudflare R2 e recebe uma URL publica de verdade. O link so aparece como publicado quando a subida foi confirmada.",
    grad: "/brand/grad-1.jpg",
  },
  {
    n: "06",
    label: "FECHAMENTO",
    title: "Aborde e feche",
    desc: "Abra o lead no CRM e gere na hora a mensagem de WhatsApp, o roteiro de ligacao e a quebra de objecao. Marque o agendamento e acompanhe tudo em um lugar so.",
    grad: "/brand/grad-2.jpg",
  },
]

const STICKY_TOP   = 80   // casa com o top do primeiro card
const STICKY_STEP  = 16   // cada card empilha 16px mais abaixo
const SCALE_STEP   = 0.03 // reducao de escala por card empilhado em cima
const OFFSET_STEP  = 8    // px empurrados para baixo por card empilhado

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

export function PassosEmpilhados() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  // depth[i] = quantos cards estao empilhados em cima do card i
  const [depth, setDepth] = useState<number[]>(PASSOS.map(() => 0))

  useEffect(() => {
    function onScroll() {
      const nextDepth = PASSOS.map((_, i) => {
        let count = 0
        for (let j = i + 1; j < PASSOS.length; j++) {
          const el = cardRefs.current[j]
          if (!el) continue
          const rect = el.getBoundingClientRect()
          const stickyTopJ = STICKY_TOP + j * STICKY_STEP
          if (rect.top <= stickyTopJ + 2) count++
        }
        return count
      })
      setDepth(nextDepth)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <ol className="flex flex-col list-none" style={{ perspective: "1400px", perspectiveOrigin: "50% 0%" }}>
      {PASSOS.map((passo, i) => {
        const d          = depth[i]
        const scale      = 1 - d * SCALE_STEP
        const translateY = d * OFFSET_STEP

        return (
          <li
            key={passo.n}
            ref={el => { cardRefs.current[i] = el }}
            className="sticky mb-4"
            style={{ top: `${STICKY_TOP + i * STICKY_STEP}px`, zIndex: 10 + i }}
          >
            <div
              style={{
                transform:       `scale(${scale}) translateY(${translateY}px)`,
                transformOrigin: "top center",
                transition:      "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
                willChange:      "transform",
              }}
            >
              <div className="group relative bg-[#faf9f7] rounded-2xl border border-black/[0.07] overflow-hidden">

                {/* Gradiente da marca -- topo no mobile, direita no desktop */}
                <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none hidden md:block" aria-hidden="true">
                  <img src={passo.grad} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #faf9f7 0%, rgba(250,249,247,0.4) 45%, transparent 75%)" }} />
                </div>

                <div className="relative z-10 p-8 md:p-10">
                  <div className="md:max-w-[58%]">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[11px] tracking-widest text-black/25 font-mono">{passo.n}</span>
                      <Tag>{passo.label}</Tag>
                    </div>
                    <h3 className="text-xl md:text-2xl font-light mb-3 leading-snug">{passo.title}</h3>
                    <p className="text-sm text-black/45 leading-relaxed">{passo.desc}</p>
                  </div>
                </div>

              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
