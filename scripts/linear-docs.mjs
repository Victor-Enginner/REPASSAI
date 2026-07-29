/**
 * Publica a documentação do REPASS AI como Documents no Linear.
 *
 * Cada arquivo de `docs/` vira um documento pesquisável dentro do workspace,
 * ligado ao projeto correspondente quando faz sentido. O Linear renderiza
 * Markdown e diagramas Mermaid, então os fluxogramas aparecem desenhados.
 *
 * É IDEMPOTENTE: documento com o mesmo título é ATUALIZADO, não duplicado.
 * Pode rodar de novo sempre que a documentação mudar.
 *
 * A chave é lida de LINEAR_API_KEY no ambiente e nunca é gravada em disco.
 *
 * Uso:
 *   $env:LINEAR_API_KEY="lin_api_..."
 *   node scripts/linear-docs.mjs --dry
 *   node scripts/linear-docs.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.linear.app/graphql";
const CHAVE = process.env.LINEAR_API_KEY;
const SECO = process.argv.includes("--dry");

// Projeto que recebe a documentação geral. O `documentCreate` do Linear EXIGE
// um projeto pai — sem ele a chamada volta "Argument Validation Error", que
// não diz qual argumento faltou.
const PROJETO_DOCS = "Documentação";

// arquivo -> título no Linear e projeto onde ele fica
const DOCUMENTOS = [
  { arquivo: "README.md",                titulo: "REPASS AI — Visão geral",      projeto: PROJETO_DOCS },
  { arquivo: "docs/README.md",           titulo: "Índice da documentação",       projeto: PROJETO_DOCS },
  { arquivo: "docs/ROADMAP.md",          titulo: "Roadmap e prioridades",        projeto: PROJETO_DOCS },
  { arquivo: "docs/ARQUITETURA.md",      titulo: "Arquitetura do sistema",       projeto: "Motor de Sites" },
  { arquivo: "docs/GUIA_SUPABASE.md",    titulo: "Guia do Supabase",             projeto: "Persistência" },
  { arquivo: "docs/INFRASTRUCTURE.md",   titulo: "Infraestrutura e recuperação", projeto: "Deploy" },
];

async function consultar(query, variables = {}) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: CHAVE },
    body: JSON.stringify({ query, variables }),
  });
  const corpo = await res.json();
  if (corpo.errors) throw new Error(corpo.errors.map((e) => e.message).join(" | "));
  return corpo.data;
}

/**
 * Ajusta o Markdown para o Linear.
 *
 * O Linear resolve link relativo contra o próprio domínio, então
 * `[x](docs/ARQUITETURA.md)` vira um link morto dentro do workspace. Melhor
 * deixar o texto e tirar o link do que entregar link que não abre.
 */
function prepararConteudo(md, arquivo) {
  const semLinksRelativos = md.replace(
    /\[([^\]]+)\]\((?!https?:)[^)]+\)/g,
    (_, texto) => `**${texto}**`
  );
  const rodape =
    `\n\n---\n\n_Gerado de \`${arquivo}\` no repositório. ` +
    `Editar aqui não altera o arquivo — a fonte é o repositório._\n`;
  return semLinksRelativos + rodape;
}

async function main() {
  if (!CHAVE) {
    console.error(
      "\nLINEAR_API_KEY nao esta definida.\n" +
      '  $env:LINEAR_API_KEY="lin_api_..."\n'
    );
    process.exit(1);
  }

  const dados = await consultar(`{
    teams(first: 10) { nodes { id key name projects(first: 50) { nodes { id name } } } }
    documents(first: 100) { nodes { id title } }
  }`);

  const time = dados.teams.nodes.find((t) => t.key === "REP") || dados.teams.nodes[0];
  const projetos = new Map(time.projects.nodes.map((p) => [p.name.toLowerCase(), p.id]));
  const existentes = new Map(dados.documents.nodes.map((d) => [d.title.toLowerCase(), d.id]));

  console.log(`\nTime: ${time.name} (${time.key})`);

  // O projeto de documentação precisa existir ANTES dos documentos. Sem ele,
  // `projectId` vai undefined e o Linear responde "Argument Validation Error"
  // — mensagem que não diz qual argumento faltou, e custou uma rodada inteira
  // de tentativa e erro para descobrir.
  if (!projetos.has(PROJETO_DOCS.toLowerCase())) {
    if (SECO) {
      console.log(`Projeto "${PROJETO_DOCS}" seria criado.`);
      projetos.set(PROJETO_DOCS.toLowerCase(), "simulado");
    } else {
      const novo = await consultar(
        `mutation($input: ProjectCreateInput!) {
          projectCreate(input: $input) { project { id } }
        }`,
        {
          input: {
            name: PROJETO_DOCS,
            teamIds: [time.id],
            description: "Documentacao viva do projeto, sincronizada do repositorio.",
          },
        }
      );
      projetos.set(PROJETO_DOCS.toLowerCase(), novo.projectCreate.project.id);
      console.log(`Projeto "${PROJETO_DOCS}" criado.`);
    }
  }

  console.log(`${existentes.size} documento(s) ja no Linear${SECO ? "  (SIMULACAO)" : ""}\n`);

  let criados = 0, atualizados = 0, falhas = 0;

  for (const { arquivo, titulo, projeto } of DOCUMENTOS) {
    const caminho = join(RAIZ, arquivo);
    if (!existsSync(caminho)) {
      console.warn(`  ausente  ${arquivo}`);
      continue;
    }

    const conteudo = prepararConteudo(readFileSync(caminho, "utf8"), arquivo);
    const projectId = projeto ? projetos.get(projeto.toLowerCase()) : undefined;
    const jaExiste = existentes.get(titulo.toLowerCase());
    const kb = Math.round(conteudo.length / 1024);

    if (SECO) {
      console.log(`  [${jaExiste ? "atualizaria" : "criaria"}] ${titulo} (${kb} KB)`);
      jaExiste ? atualizados++ : criados++;
      continue;
    }

    try {
      if (jaExiste) {
        await consultar(
          `mutation($id: String!, $input: DocumentUpdateInput!) {
            documentUpdate(id: $id, input: $input) { success }
          }`,
          { id: jaExiste, input: { content: conteudo, ...(projectId ? { projectId } : {}) } }
        );
        atualizados++;
        console.log(`  atualizado  ${titulo} (${kb} KB)`);
      } else {
        await consultar(
          `mutation($input: DocumentCreateInput!) {
            documentCreate(input: $input) { success document { id } }
          }`,
          { input: { title: titulo, content: conteudo, ...(projectId ? { projectId } : {}) } }
        );
        criados++;
        console.log(`  criado      ${titulo} (${kb} KB)${projeto ? ` -> ${projeto}` : ""}`);
      }
    } catch (erro) {
      falhas++;
      console.error(`  FALHOU      ${titulo} -> ${erro.message.slice(0, 100)}`);
    }
  }

  console.log(
    `\n${criados} criado(s) | ${atualizados} atualizado(s) | ${falhas} falha(s)` +
    (SECO ? "  (nada foi gravado)" : "")
  );
}

main().catch((e) => {
  console.error(`\nErro: ${e.message}\n`);
  process.exit(1);
});
