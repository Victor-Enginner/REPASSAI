"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// O estilo de vidro vive em app/globals.css, no bloco `.glass-button*`.
// O componente so aplica as classes; quem desenha o vidro e o CSS.

const glassButtonVariants = cva(
  "glass-button relative isolate cursor-pointer rounded-full transition-all",
  {
    variants: {
      size: {
        default: "text-base font-medium",
        sm: "text-sm font-medium",
        lg: "text-lg font-medium",
        icon: "h-11 w-11",
      },
      tom: {
        claro: "glass-button--claro",
        escuro: "glass-button--escuro",
      },
    },
    defaultVariants: {
      size: "default",
      tom: "claro",
    },
  }
)

const glassButtonTextVariants = cva(
  "glass-button-text relative block select-none tracking-tight",
  {
    variants: {
      size: {
        // Os paddings garantem os 44px minimos de alvo de toque.
        default: "px-6 py-3.5",
        sm: "px-5 py-3",
        lg: "px-8 py-4",
        icon: "flex h-11 w-11 items-center justify-center",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type VariantesRaiz = VariantProps<typeof glassButtonVariants>

export interface GlassButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantesRaiz {
  contentClassName?: string
  /**
   * Quando presente, renderiza um `<a>` em vez de `<button>`.
   * Quando `null`, o botao vira um rotulo inerte -- e o que impede a landing
   * de exibir um CTA que aponta para uma URL que ainda nao existe.
   */
  href?: string | null
  larguraTotal?: boolean
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, tom, contentClassName, href, larguraTotal, title, ...props }, ref) => {
    const classesRaiz = glassButtonVariants({ size, tom })
    const conteudo = (
      <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>
        {children}
      </span>
    )

    return (
      <div
        className={cn(
          "glass-button-wrap rounded-full",
          larguraTotal && "w-full",
          className
        )}
      >
        {href === undefined ? (
          <button className={classesRaiz} ref={ref} title={title} {...props}>
            {conteudo}
          </button>
        ) : href === null ? (
          // Sem destino: nao e link nem botao, so um rotulo legivel.
          <span className={cn(classesRaiz, "glass-button--inerte")} title={title} aria-disabled="true">
            {conteudo}
          </span>
        ) : (
          <a className={classesRaiz} href={href} title={title}>
            {conteudo}
          </a>
        )}
        <div className="glass-button-shadow rounded-full" aria-hidden="true" />
      </div>
    )
  }
)
GlassButton.displayName = "GlassButton"

export { GlassButton, glassButtonVariants }
