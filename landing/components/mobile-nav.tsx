"use client"

import { useState } from "react"
import { URL_PAINEL } from "@/lib/config"
import { GlassButton } from "@/components/ui/glass-button"

const NAV_LINKS = [
  { label: "Como funciona", href: "#passos" },
  { label: "O sistema",     href: "#telas" },
  { label: "Infraestrutura", href: "#infra" },
  { label: "Receita",       href: "#receita" },
  { label: "Planos",        href: "#planos" },
  { label: "Duvidas",       href: "#faq" },
]

const NAV_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(245,244,240,0.30)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
} as const

const BOTAO_FONTE = { fontFamily: "system-ui, -apple-system, sans-serif" }

/**
 * CTA do topo. So vira link quando existe dominio de verdade -- enquanto
 * URL_PAINEL for null ele fica inerte, em vez de apontar para lugar nenhum.
 */
function CtaPainel({ larguraTotal = false }: { larguraTotal?: boolean }) {
  return (
    <GlassButton
      tom="escuro"
      size="sm"
      href={URL_PAINEL}
      larguraTotal={larguraTotal}
      contentClassName="tracking-wide text-[11px]"
      title={URL_PAINEL ? undefined : "Defina URL_PAINEL em lib/config.ts quando o painel estiver no ar"}
    >
      ACESSAR PAINEL
    </GlassButton>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-3xl">

        {/* Barra principal */}
        <nav
          className="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06]"
          style={NAV_STYLE}
          aria-label="Navegacao principal"
        >
          <a href="#topo" className="inline-flex items-center font-pixel text-xs tracking-[0.25em] text-black/70" style={{ minHeight: 44 }}>REPASS AI</a>

          {/* Links no desktop */}
          <div className="hidden md:flex items-center gap-7" style={BOTAO_FONTE}>
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                // py-4/-my-4 amplia a area de toque para ~49px sem crescer a
                // altura da pilula: o padding e compensado pela margem negativa.
                className="inline-flex items-center py-4 -my-4 text-[11px] text-black/60 hover:text-black transition-colors duration-200 tracking-wide"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block"><CtaPainel /></div>

            {/* Hamburguer -- so no mobile */}
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="md:hidden flex flex-col justify-center items-center gap-[5px] rounded-lg hover:bg-black/[0.04] transition-colors"
              style={{ width: 44, height: 44 }}
              aria-expanded={open}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
            >
              <span
                className="block h-px bg-black/60 transition-all duration-300 origin-center"
                style={{ width: "18px", transform: open ? "translateY(6px) rotate(45deg)" : "none" }}
              />
              <span
                className="block h-px bg-black/60 transition-all duration-300"
                style={{ width: "18px", opacity: open ? 0 : 1, transform: open ? "scaleX(0)" : "none" }}
              />
              <span
                className="block h-px bg-black/60 transition-all duration-300 origin-center"
                style={{ width: "18px", transform: open ? "translateY(-6px) rotate(-45deg)" : "none" }}
              />
            </button>
          </div>
        </nav>

        {/* Gaveta no mobile */}
        <div
          className="md:hidden mt-2 overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "360px" : "0px", opacity: open ? 1 : 0 }}
        >
          <div
            className="rounded-2xl border border-black/[0.06] px-2 py-2 flex flex-col"
            style={NAV_STYLE}
          >
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={close}
                className="flex items-center px-4 text-sm text-black/60 hover:text-black hover:bg-black/[0.03] rounded-xl transition-colors tracking-wide"
                style={{ ...BOTAO_FONTE, minHeight: 44 }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-1 px-2 pb-1"><CtaPainel larguraTotal /></div>
          </div>
        </div>

      </div>
    </div>
  )
}
