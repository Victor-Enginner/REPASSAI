/**
 * Trava do design system: reprova cor hex escrita à mão no JSX.
 *
 * Existe porque a auditoria de 27/07/2026 mostrou o número de hex literais
 * SUBINDO de 619 para 870 entre sprints. Não foi descuido pontual: o
 * `npm run lint` era um apelido para `vite build` e nunca checou nada, então
 * nada impedia a regressão. Sem esta trava, migrar as cores é trabalho que
 * se desfaz sozinho no próximo sprint.
 *
 * Só vale para arquivos de UI do painel. Componentes WebGL/canvas, dados
 * gerados e os serviços que produzem o HTML do site do cliente continuam
 * livres: lá o hex literal é obrigatório, porque `var(--token)` não existe
 * em shader nem no site publicado, que não carrega o nosso index.css.
 *
 * Uso:  node scripts/verificar-tokens.mjs
 * Sai com código 1 se encontrar violação — serve para CI e pre-commit.
 */

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const ISENTOS = [
  /components\/ui\//,
  /data\/componentIndex\.js$/,
  /services\//,
  /SchemaRenderer\.jsx$/,
];

// Mesma regra do codemod: hex como VALOR de propriedade de estilo.
// Prop de componente (`tint="#6366f1"`) não é violação — WebGL precisa dela.
const PROP_COM_HEX = /([a-zA-Z][a-zA-Z0-9]*)\s*:\s*(['"])(#[0-9a-fA-F]{3,8})\2/g;

const arquivos = execSync('git ls-files "src/**/*.jsx" "src/**/*.js"', {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean)
  .filter((f) => !ISENTOS.some((p) => p.test(f)));

const violacoes = [];

for (const arquivo of arquivos) {
  const linhas = readFileSync(arquivo, "utf8").split("\n");
  linhas.forEach((linha, i) => {
    for (const achado of linha.matchAll(PROP_COM_HEX)) {
      violacoes.push({
        arquivo,
        linha: i + 1,
        prop: achado[1],
        hex: achado[3],
      });
    }
  });
}

if (violacoes.length === 0) {
  console.log(`OK — ${arquivos.length} arquivos de UI, nenhuma cor hex solta.`);
  process.exit(0);
}

console.error(`\nDESIGN SYSTEM: ${violacoes.length} cor(es) hex escritas a mao.\n`);
for (const v of violacoes.slice(0, 40)) {
  console.error(`  ${v.arquivo}:${v.linha}  ${v.prop}: '${v.hex}'`);
}
if (violacoes.length > 40) {
  console.error(`  ... e mais ${violacoes.length - 40}.`);
}
console.error(
  "\nUse um token de src/index.css, por exemplo color: 'var(--fg-white)'.\n" +
    "Se a cor for nova, declare o token no :root antes de usar.\n" +
    "Para migrar em lote: node scripts/migrar-cores-para-tokens.mjs\n"
);
process.exit(1);
