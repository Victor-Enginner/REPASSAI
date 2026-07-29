"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { IntroAnimation, HERO_REVEAL_MS } from "@/components/intro-animation"
import { RevealText } from "@/components/reveal-text"
import { PassosEmpilhados } from "@/components/passos-empilhados"
import { CalculadoraReceita } from "@/components/calculadora-receita"
import { MobileNav } from "@/components/mobile-nav"
import { GlassButton } from "@/components/ui/glass-button"
import { PixelIcon } from "@/components/pixel-icon"
import { URL_PAINEL, PRECOS_DEFINIDOS } from "@/lib/config"

// Video de fundo do hero. Servido pelo proprio site: antes vinha do blob da
// Vercel do template de origem, que e armazenamento de terceiro -- se o
// arquivo sumisse de la, o hero ficava sem fundo para todos os visitantes.
const VIDEO_HERO = "/video/hero.mp4"

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function BentoCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-black/[0.07] bg-white overflow-hidden transition-all duration-700 hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.03), transparent 60%)" }}
      />
      {children}
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

/** CTA que so vira link quando existe dominio de verdade. */
function BotaoPainel({ children }: { children: React.ReactNode }) {
  return (
    <GlassButton
      tom="escuro"
      href={URL_PAINEL}
      title={URL_PAINEL ? undefined : "Defina URL_PAINEL em lib/config.ts quando o painel estiver no ar"}
    >
      {children}
    </GlassButton>
  )
}

const NAV_RODAPE = [
  { href: "#passos",  label: "Como funciona" },
  { href: "#telas",   label: "O sistema" },
  { href: "#infra",   label: "Infraestrutura" },
  { href: "#receita", label: "Receita" },
  { href: "#planos",  label: "Planos" },
  { href: "#faq",     label: "Duvidas" },
]

/** Cartao de vidro sobreposto a imagem, mesmo desenho do template. */
const CARTAO_VIDRO: React.CSSProperties = {
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  background: "rgba(255,255,255,0.60)",
}

// As cinco conexoes externas do sistema. Todas marcadas como `implemented`
// em docs/repass-architecture-map.json -- nada aqui e planejado ou futuro.
// Se uma sair de producao, sai desta lista tambem.
const INFRA = [
  {
    nome: "Google Places",
    papel: "origem dos leads",
    desc: "Negocio, endereco, telefone e nota vem daqui. Quando o campo nao existe na fonte, ele fica vazio.",
  },
  {
    nome: "Motores de IA",
    papel: "geracao",
    desc: "Cadeia de provedores com rotacao: se um falha ou estoura a cota, o proximo assume. Tudo no servidor.",
  },
  {
    nome: "Supabase",
    papel: "conta e dados",
    desc: "Autenticacao e banco. Cada operador enxerga apenas os proprios leads, com o corte feito no servidor.",
  },
  {
    nome: "Cloudflare R2",
    papel: "publicacao",
    desc: "O site compilado sobe para o bucket e recebe uma URL publica. So marca como publicado depois de confirmar.",
  },
  {
    nome: "Arquivo local",
    papel: "seguranca",
    desc: "Todo HTML gerado fica preservado em disco antes de subir. Se a publicacao falhar, o trabalho nao se perde.",
  },
]

const TELAS = [
  { nome: "Dashboard",    desc: "Sua visao geral: leads encontrados, sites gerados e o andamento do funil logo ao entrar." },
  { nome: "Leads",        desc: "Onde tudo comeca. Busque por cidade e nicho e veja quem esta sem site de verdade." },
  { nome: "Editor",       desc: "Gere e edite conversando. Clique num texto ou imagem, diga o que mudar, volte pelo historico." },
  { nome: "CRM",          desc: "Seu funil visual. Mova os leads por etapa e gere mensagem de WhatsApp e roteiro de ligacao." },
  { nome: "Agendamentos", desc: "Toda reuniao marcada no CRM aparece organizada aqui, por data. Nada de esquecer follow-up." },
  { nome: "Projetos",     desc: "Todas as landing pages compiladas, com seus links publicos e arquivos, em um lugar so." },
]

const FAQ = [
  {
    q: "De onde vem os dados dos leads?",
    a: "Da API do Google Places. Telefone, nota e numero de avaliacoes so aparecem quando existem na fonte — o REPASS AI nunca preenche esses campos por conta propria. Se o campo esta vazio, e porque o dado nao existe.",
  },
  {
    q: "Como o site do cliente e gerado?",
    a: "O motor agentico monta um schema validado escolhendo os componentes, e o compilador transforma esse schema em HTML responsivo com os dados daquele negocio. Leva segundos.",
  },
  {
    q: "O que acontece quando eu publico?",
    a: "O HTML sobe para o Cloudflare R2 e recebe uma URL publica. O site so aparece marcado como publicado depois que a subida e confirmada — nao existe link que promete e nao abre.",
  },
  {
    q: "Preciso instalar alguma coisa?",
    a: "Nao. Tudo roda no navegador, e o processamento pesado e as chaves de API ficam no servidor.",
  },
  {
    q: "Meus leads ficam visiveis para outros usuarios?",
    a: "Nao. Cada operador enxerga apenas os proprios leads, e o isolamento e feito no servidor, por usuario — nao no navegador.",
  },
  {
    q: "Posso usar meu proprio dominio nos sites que eu gerar?",
    a: "O link publico sai em todos os planos. Dominio proprio do cliente esta no roteiro e ainda nao esta liberado — quando estiver, isto aqui muda.",
  },
]

export default function Pagina() {
  const [heroReady, setHeroReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [faqAberta, setFaqAberta] = useState<number | null>(0)

  const handleIntroDone = useCallback(() => setHeroReady(true), [])

  // O zoom do video comeca um pouco antes do conteudo do hero aparecer,
  // para as duas animacoes se sobreporem sem corte.
  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), HERO_REVEAL_MS)
    return () => clearTimeout(t)
  }, [])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }

  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">

      <IntroAnimation onDone={handleIntroDone} />
      <MobileNav />

      {/* ══ 1. HERO — fundo original do template (video dos cristais) ══════ */}
      <section id="topo" className="relative h-screen overflow-hidden">

        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={VIDEO_HERO}
          style={{
            transform: videoReady ? "scale(1.05)" : "scale(0.85)",
            transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Gradiente e blur progressivos subindo do rodape */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "65%", background: "linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "20%", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "38%", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "55%", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />

        <div className="h-20" />

        {/* Titulo ancorado no canto inferior esquerdo, como no template */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col px-6 md:px-12 pb-12 max-w-3xl">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-light text-[#111] leading-[1.0] tracking-tight mb-8"
            style={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(24px)",
              transform: heroReady ? "translateY(0px)" : "translateY(32px)",
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1), filter 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            Encontre o cliente,<br />entregue o site,<br />feche a venda.
          </h1>

          <div
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(16px)",
              transform: heroReady ? "translateY(0px)" : "translateY(20px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 160ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) 160ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 160ms",
            }}
          >
            <p className="text-base md:text-lg text-black/50 leading-relaxed max-w-xl" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
              O REPASS AI encontra negocios locais que ainda nao tem site, gera a
              pagina deles em segundos e te entrega a abordagem pronta.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <BotaoPainel>Acessar painel</BotaoPainel>
              <GlassButton tom="claro" href="#passos">Ver como funciona</GlassButton>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. O QUE MUDA — bento original do template, copy do REPASS ═════ */}
      <section id="plataforma" className="py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4"><Tag>PLATAFORMA</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
              {"Prospeccao e entrega\nno mesmo lugar."}
            </RevealText>
          </div>

          <div className="grid grid-cols-12 grid-rows-auto gap-3" onMouseMove={handleMouse}>
            {/* Card largo com a imagem de arco do template */}
            <BentoCard className="col-span-12 p-8 min-h-[200px] flex flex-col justify-between relative overflow-hidden" delay={0}>
              <img
                src="/images/arc.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center 70%" }}
              />
              <div className="absolute inset-0" style={{
                maskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }} />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, transparent 35%, rgba(245,244,240,0.3) 50%, rgba(245,244,240,0.75) 65%, rgba(245,244,240,0.95) 80%, rgb(245,244,240) 100%)" }}
              />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl border border-black/10 bg-white/60 flex items-center justify-center mb-6" style={{ backdropFilter: "blur(8px)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <h3 className="text-xl font-light mb-3">Varredura que devolve negocio real</h3>
                <p className="text-sm text-black/45 leading-relaxed max-w-sm">
                  Escolha o nicho e a cidade. O REPASS AI consulta a base do Google
                  Places e marca quem esta sem site — o lead ja chega qualificado.
                </p>
              </div>
            </BentoCard>

            {/* Linha de baixo */}
            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={120}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10h8M8 14h5"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Dado que veio da fonte</h3>
              <p className="text-sm text-black/45 leading-relaxed">Telefone e nota chegam da Places API. Campo vazio significa que o dado nao existe — nunca um numero por aproximacao.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={160}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Site gerado do lead</h3>
              <p className="text-sm text-black/45 leading-relaxed">A pagina nasce dos dados daquele negocio: nome, servicos, contato e cores. Nao e modelo com o nome trocado.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={200}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Abordagem no mesmo painel</h3>
              <p className="text-sm text-black/45 leading-relaxed">Mensagem de WhatsApp, roteiro de ligacao e quebra de objecao saem dentro do CRM, ja com o contexto do lead.</p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ══ 3. PASSO A PASSO — daqui em diante entram as imagens da marca ══ */}
      <section id="passos" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4"><Tag>PASSO A PASSO</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Do primeiro lead\nao fechamento."}
            </RevealText>
            <p className="mt-6 text-base text-black/45 leading-relaxed max-w-2xl">
              Seis passos, na ordem exata em que voce faz no painel.
            </p>
          </div>
          <PassosEmpilhados />
        </div>
      </section>

      {/* ══ 4. AS TELAS ═══════════════════════════════════════════════════ */}
      <section id="telas" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4"><Tag>O SISTEMA</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Cada tela, e para\nque ela serve."}
            </RevealText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" onMouseMove={handleMouse}>
            {TELAS.map((tela, i) => (
              <BentoCard key={tela.nome} className="p-8 min-h-[190px]" delay={i * 70}>
                <h3 className="text-lg font-light mb-2">{tela.nome}</h3>
                <p className="text-sm text-black/45 leading-relaxed">{tela.desc}</p>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. INFRAESTRUTURA ═════════════════════════════════════════════ */}
      <section id="infra" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="integrations" size={40} />
              <div className="mt-4"><Tag>INFRAESTRUTURA</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
                {"Ligado ao que\no negocio precisa."}
              </RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">
              Cinco conexoes, todas em producao. Nao ha catalogo de integracoes
              prometidas — o que esta aqui e o que ja roda.
            </p>
          </div>

          {/* Bloco de imagem com cartoes de vidro, no mesmo desenho do template */}
          <div className="rounded-2xl overflow-hidden border border-black/[0.07] flex flex-col md:block md:relative" onMouseMove={handleMouse}>
            <div className="relative w-full h-[280px] md:h-[480px] shrink-0">
              <img
                src="/brand/glass-weave.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>

            <div className="flex flex-col gap-3 p-4 md:absolute md:bottom-4 md:right-4 md:p-0 md:w-72">
              {/* Cartao 1 — o schema que o motor devolve */}
              <div className="rounded-xl border border-white/50 p-6" style={CARTAO_VIDRO}>
                <Tag>MOTOR DE IA</Tag>
                <h3 className="mt-3 text-lg font-light mb-2">Schema validado</h3>
                <p className="text-xs text-black/45 leading-relaxed mb-4">
                  A IA nao escreve HTML solto. Ela devolve um schema validado, e o
                  compilador transforma em pagina.
                </p>
                <div className="bg-black/[0.05] rounded-lg border border-black/[0.07] p-3 font-mono text-[11px] text-black/50 leading-relaxed">
                  <span className="text-black/25">{"// schema do site"}</span><br />
                  {"{"}<br />
                  {"  "}<span className="text-amber-700/70">fundo</span>: <span className="text-green-700/70">&apos;aurora&apos;</span>,<br />
                  {"  "}<span className="text-amber-700/70">secoes</span>: [<span className="text-green-700/70">&apos;hero&apos;</span>, <span className="text-green-700/70">&apos;menu&apos;</span>],<br />
                  {"  "}<span className="text-amber-700/70">contato</span>: <span className="text-black/35">lead.telefone</span><br />
                  {"}"}
                </div>
              </div>

              {/* Cartao 2 — o canal SSE, que o e2e confirma que transmite */}
              <div className="rounded-xl border border-white/50 p-6" style={CARTAO_VIDRO}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#00FF9D" }} />
                  <span className="text-xs text-black/40 tracking-widest">LOG AO VIVO</span>
                </div>
                <p className="text-sm text-black/45 leading-relaxed">
                  A varredura transmite por SSE: voce ve cada negocio entrando
                  enquanto a busca acontece, sem esperar o fim.
                </p>
              </div>
            </div>
          </div>

          {/* As cinco conexoes reais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3" onMouseMove={handleMouse}>
            {INFRA.map((item, i) => (
              <BentoCard key={item.nome} className="p-7" delay={i * 70}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00FF9D" }} />
                  <span className="text-[11px] tracking-widest text-black/35 uppercase">{item.papel}</span>
                </div>
                <h3 className="text-base font-light mb-1.5">{item.nome}</h3>
                <p className="text-sm text-black/45 leading-relaxed">{item.desc}</p>
              </BentoCard>
            ))}
          </div>

          <p className="mt-6 text-xs text-black/30 leading-relaxed max-w-2xl">
            Chaves de API e credenciais ficam no servidor. O navegador nunca recebe
            segredo — nem o seu, nem o do seu cliente.
          </p>
        </div>
      </section>

      {/* ══ 6. MODELO DE RECEITA ══════════════════════════════════════════ */}
      <section id="receita" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="agents" size={40} />
            <div className="mt-4"><Tag>MODELO DE RECEITA</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Transforme uma venda\nunica em receita mensal."}
            </RevealText>
            <p className="mt-6 text-base text-black/45 leading-relaxed max-w-2xl">
              Voce nao vende so um site. Cobra pela hospedagem, pelas atualizacoes e
              pela manutencao — enquanto o REPASS AI faz o trabalho pesado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-16" onMouseMove={handleMouse}>
            {[
              { p: "Passo 1", t: "Publique na hora", d: "Entregue sites responsivos em segundos, com link publico de verdade." },
              { p: "Passo 2", t: "Cobre o seu preco", d: "Voce define a tarifa. Seu cliente, seu contrato, seu lucro." },
              { p: "Passo 3", t: "Receba todo mes", d: "Manutencao e hospedagem viram uma receita que se acumula a cada cliente." },
            ].map((c, i) => (
              <BentoCard key={c.t} className="p-8 min-h-[200px]" delay={i * 90}>
                <span className="text-[11px] tracking-widest text-black/25 font-mono">{c.p}</span>
                <h3 className="text-lg font-light mt-4 mb-2">{c.t}</h3>
                <p className="text-sm text-black/45 leading-relaxed">{c.d}</p>
              </BentoCard>
            ))}
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-white p-8 md:p-12">
            <h3 className="text-2xl font-light mb-2">Quanto voce pode faturar</h3>
            <p className="text-sm text-black/40 mb-10">Ajuste os controles e veja a projecao com os seus numeros.</p>
            <CalculadoraReceita />
          </div>
        </div>
      </section>

      {/* ══ 6. PLANOS ═════════════════════════════════════════════════════ */}
      <section id="planos" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div><Tag>PLANOS</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Escolha o plano\ne comece a vender."}
            </RevealText>
          </div>

          {!PRECOS_DEFINIDOS && (
            <div className="rounded-2xl border-2 border-dashed border-black/20 bg-white/50 p-10 md:p-14 text-center">
              <div className="text-[11px] tracking-widest text-black/40 mb-4">PLACEHOLDER — NAO PUBLICAR ASSIM</div>
              <h3 className="text-2xl font-light mb-3">Tabela de planos ainda nao definida</h3>
              <p className="text-sm text-black/45 leading-relaxed max-w-lg mx-auto">
                Os nomes, valores e limites de cada plano ainda nao foram fechados.
                Esta secao fica marcada de proposito: e melhor um espaco em branco
                do que um preco errado no ar.
              </p>
              <p className="text-xs text-black/30 mt-6">
                Para preencher: <code className="font-mono">PRECOS_DEFINIDOS = true</code> em <code className="font-mono">lib/config.ts</code>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ══ 7. FAQ ════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <div><Tag>DUVIDAS</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Perguntas frequentes"}
            </RevealText>
          </div>

          <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
            {FAQ.map((item, i) => {
              const aberta = faqAberta === i
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setFaqAberta(aberta ? null : i)}
                    aria-expanded={aberta}
                    className="w-full flex items-center justify-between gap-6 text-left py-5"
                    style={{ minHeight: 44 }}
                  >
                    <span className="text-base font-light">{item.q}</span>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
                      className="shrink-0 text-black/30 transition-transform duration-300"
                      style={{ transform: aberta ? "rotate(180deg)" : "none" }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: aberta ? 320 : 0, opacity: aberta ? 1 : 0 }}
                  >
                    <p className="text-sm text-black/45 leading-relaxed pb-6 pr-10">{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ 8. CTA FINAL — imagem da marca ════════════════════════════════ */}
      <section className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] relative overflow-hidden">
        <img src="/brand/glass-hero.jpg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(245,244,240,0.82), rgba(245,244,240,0.94))" }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <RevealText className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            {"Agora e com voce.\nFaca a primeira busca."}
          </RevealText>
          <div className="mt-10 flex justify-center">
            <BotaoPainel>Acessar painel</BotaoPainel>
          </div>
        </div>
      </section>

      {/* ══ RODAPE ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-black/[0.06] px-6 md:px-12 lg:px-20 py-14">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <div className="text-sm font-medium" style={{ letterSpacing: "0.34em" }}>REPASS AI</div>
            <p className="mt-3 text-xs text-black/35 max-w-xs leading-relaxed">
              Sistema operacional de IA para prospeccao B2B.<br />
              Leads · CRM · Sites · Templates · Automacao · Execucao
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-1" aria-label="Rodape">
            {NAV_RODAPE.map(item => (
              <a key={item.href} href={item.href} className="inline-flex items-center text-xs text-black/40 hover:text-black transition-colors" style={{ minHeight: 44 }}>{item.label}</a>
            ))}
          </nav>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-black/[0.05] text-[11px] text-black/25">
          Versao beta.
        </div>
      </footer>

    </div>
  )
}
