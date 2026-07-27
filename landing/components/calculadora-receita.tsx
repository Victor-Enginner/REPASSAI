"use client"

import { useState } from "react"

// A matematica e a mesma da LandingPage.jsx do painel, portada sem mudanca:
// nenhum numero aqui e promessa -- e projecao do que o proprio operador
// digita nos controles.
const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

function Controle({
  label, valor, min, max, passo, sufixo, onChange,
}: {
  label: string; valor: number; min: number; max: number
  passo: number; sufixo: string; onChange: (v: number) => void
}) {
  const id = `ctrl-${label.replace(/\s+/g, "-").toLowerCase()}`
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <label htmlFor={id} className="text-xs text-black/40 tracking-widest uppercase">{label}</label>
        <span className="text-lg font-light tabular-nums">{sufixo === "R$" ? brl(valor) : valor}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={passo}
        value={valor}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-11 accent-black cursor-pointer"
        style={{ minHeight: 44 }}
      />
      <div className="flex justify-between text-[11px] text-black/25 mt-1">
        <span>{sufixo === "R$" ? brl(min) : min}</span>
        <span>{sufixo === "R$" ? brl(max) : max}</span>
      </div>
    </div>
  )
}

export function CalculadoraReceita() {
  const [sitesPorMes, setSitesPorMes]           = useState(3)
  const [precoAvista, setPrecoAvista]           = useState(800)
  const [manutencaoMensal, setManutencaoMensal] = useState(120)

  const totalClientesEmUmAno   = sitesPorMes * 12
  const receitaRecorrenteMensal = totalClientesEmUmAno * manutencaoMensal
  const receitaVendasAvistaAno  = totalClientesEmUmAno * precoAvista
  const receitaAnualPotencial   = receitaVendasAvistaAno + receitaRecorrenteMensal * 6
  const numeroLiberdade         = sitesPorMes * precoAvista + receitaRecorrenteMensal

  const resultados = [
    { rotulo: "Receita recorrente mensal", valor: receitaRecorrenteMensal, nota: `${sitesPorMes}/mes x 12 = ${totalClientesEmUmAno} clientes` },
    { rotulo: "Receita anual potencial",   valor: receitaAnualPotencial,   nota: "vendas a vista + manutencao" },
    { rotulo: "Seu numero da liberdade",   valor: numeroLiberdade,         nota: "renda mensal total apos 12 meses", destaque: true },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div className="space-y-8">
        <Controle label="Sites vendidos / mes" valor={sitesPorMes}      min={1}  max={15}   passo={1}  sufixo=""   onChange={setSitesPorMes} />
        <Controle label="Preco a vista"        valor={precoAvista}      min={300} max={3000} passo={50} sufixo="R$" onChange={setPrecoAvista} />
        <Controle label="Manutencao mensal"    valor={manutencaoMensal} min={50}  max={300}  passo={10} sufixo="R$" onChange={setManutencaoMensal} />
      </div>

      <div className="space-y-3">
        {resultados.map(r => (
          <div
            key={r.rotulo}
            className={`rounded-2xl border p-7 ${r.destaque ? "border-black/15 bg-white" : "border-black/[0.07] bg-white/60"}`}
          >
            <div className="text-xs text-black/40 tracking-widest uppercase mb-2">{r.rotulo}</div>
            <div className={`font-light tabular-nums ${r.destaque ? "text-4xl" : "text-3xl"}`}>{brl(r.valor)}</div>
            <div className="text-[11px] text-black/30 mt-2">{r.nota}</div>
          </div>
        ))}
        <p className="text-[11px] text-black/30 leading-relaxed pt-2">
          Projecao calculada a partir dos valores que voce escolheu acima. Nao e
          promessa de resultado nem media de usuarios.
        </p>
      </div>
    </div>
  )
}
