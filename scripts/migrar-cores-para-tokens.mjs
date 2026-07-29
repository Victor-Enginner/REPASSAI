/**
 * Migra cores hex escritas à mão no JSX para tokens CSS.
 *
 * Regras de segurança que este script respeita:
 *
 * 1. Só substitui hex que é VALOR DE PROPRIEDADE CSS (`color: '#fff'`) ou que
 *    está dentro de uma string de gradiente. Hex passado como prop de
 *    componente (`<FaultyTerminal tint="#6366f1" />`) NÃO é tocado: WebGL e
 *    canvas não entendem `var(--token)` e quebrariam em silêncio.
 *
 * 2. Ignora arquivos que desenham em canvas/WebGL, dados gerados e os
 *    serviços que produzem o HTML do site do cliente — o site publicado não
 *    carrega o nosso index.css, então lá o hex literal é obrigatório.
 *
 * Uso:
 *   node scripts/migrar-cores-para-tokens.mjs --dry     (só relatório)
 *   node scripts/migrar-cores-para-tokens.mjs           (aplica)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";
import { execSync } from "node:child_process";

const MAPA = {
  "#050711": "--bg-black",
  "#0a0e1a": "--bg-surface",
  "#111726": "--bg-card",
  "#182033": "--bg-card-hover",
  "#ffffff": "--fg-white",
  "#fff": "--fg-white",
  "#94a3b8": "--fg-muted",
  "#64748b": "--fg-subtle",
  "#6366f1": "--accent-indigo",
  "#0070f3": "--accent-blue",
  "#38bdf8": "--accent-cyan",
  "#05070f": "--bg-deep",
  "#0f172a": "--bg-slate",
  "#cbd5e1": "--fg-soft",
  "#e2e8f0": "--fg-bright",
  "#f1f5f9": "--fg-lightest",
  "#000000": "--fg-black",
  "#22c55e": "--estado-sucesso",
  "#f59e0b": "--estado-alerta",
  "#f87171": "--estado-erro",
  "#a5b4fc": "--accent-indigo-suave",
  "#818cf8": "--accent-indigo-claro",
  "#ec4899": "--accent-rosa",
  "#5227ff": "--accent-violeta",
  "#10b981": "--accent-esmeralda",
  "#ef4444": "--estado-erro-forte",
  "#fca5a5": "--estado-erro-suave",
  "#4ade80": "--estado-sucesso-suave",
  "#fde047": "--estado-alerta-suave",
  "#070a14": "--bg-sidebar",
  "#475569": "--fg-fraco",
  "#f8fafc": "--fg-quase-branco",
  "#04140a": "--fg-sobre-verde",
  "#05070c": "--bg-poco",
  "#4f46e5": "--accent-indigo-forte",
  "#86efac": "--estado-sucesso-claro",
};

// Arquivos onde hex literal é obrigatório e a substituição quebraria a tela.
const PROIBIDOS = [
  /components\/ui\//,
  /data\/componentIndex\.js$/,
  /services\//,
  /SchemaRenderer\.jsx$/,
];

const seco = process.argv.includes("--dry");

const arquivos = execSync('git ls-files "src/**/*.jsx" "src/**/*.js"', {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean)
  .filter((f) => !PROIBIDOS.some((p) => p.test(f)));

// `prop: '#hex'` ou `prop: "#hex"` — valor de propriedade de estilo.
const PROP = /([a-zA-Z][a-zA-Z0-9]*)\s*:\s*(['"])(#[0-9a-fA-F]{3,8})\2/g;
// Hex dentro de string de gradiente/sombra: var() funciona nesses contextos.
const DENTRO_STRING = /(linear-gradient|radial-gradient|conic-gradient|inset)\(([^)]*)\)/g;

let totalTrocas = 0;
const porArquivo = [];

for (const arquivo of arquivos) {
  const original = readFileSync(arquivo, "utf8");
  let trocas = 0;

  let saida = original.replace(PROP, (todo, prop, aspas, hex) => {
    const token = MAPA[hex.toLowerCase()];
    if (!token) return todo;
    trocas++;
    return `${prop}: ${aspas}var(${token})${aspas}`;
  });

  saida = saida.replace(DENTRO_STRING, (todo) =>
    todo.replace(/#[0-9a-fA-F]{6}/g, (hex) => {
      const token = MAPA[hex.toLowerCase()];
      if (!token) return hex;
      trocas++;
      return `var(${token})`;
    })
  );

  if (trocas > 0) {
    porArquivo.push({ arquivo, trocas });
    totalTrocas += trocas;
    if (!seco) writeFileSync(arquivo, saida, "utf8");
  }
}

porArquivo.sort((a, b) => b.trocas - a.trocas);
for (const { arquivo, trocas } of porArquivo) {
  console.log(`${String(trocas).padStart(4)}  ${arquivo}`);
}
console.log(
  `\n${totalTrocas} substituicoes em ${porArquivo.length} arquivos` +
    (seco ? "  (simulacao, nada gravado)" : "")
);
