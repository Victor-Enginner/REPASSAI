/**
 * Sincroniza o backlog do REPASS AI com o Linear.
 *
 * Lê os CSVs de `docs/linear/` e cria as issues pela API do Linear, criando
 * projetos e etiquetas que ainda não existirem.
 *
 * É IDEMPOTENTE: uma issue com o mesmo título não é criada de novo. Pode
 * rodar quantas vezes quiser; só entra o que falta.
 *
 * A chave nunca passa por aqui em texto: é lida de LINEAR_API_KEY no
 * ambiente. Gere a sua em Linear → Settings → Security & access →
 * Personal API keys.
 *
 * Uso:
 *   set LINEAR_API_KEY=lin_api_xxx      (Windows CMD)
 *   $env:LINEAR_API_KEY="lin_api_xxx"   (PowerShell)
 *   node scripts/linear-sync.mjs --dry   simula, não cria nada
 *   node scripts/linear-sync.mjs         cria de verdade
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");
const CSVS = ["backlog-repass-ai.csv", "backlog-repass-ai-2.csv"];

const API = "https://api.linear.app/graphql";
const CHAVE = process.env.LINEAR_API_KEY;
const SECO = process.argv.includes("--dry");

// O Linear aceita 0–4. O CSV usa nome, que é mais legível para quem edita.
const PRIORIDADE = { Urgent: 1, High: 2, Medium: 3, Low: 4, "": 0 };

/** Executa uma consulta GraphQL e devolve `data`, ou lança com a mensagem real. */
async function consultar(query, variables = {}) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: CHAVE },
    body: JSON.stringify({ query, variables }),
  });
  const corpo = await res.json();
  if (corpo.errors) {
    // A mensagem do Linear diz exatamente o que faltou; repassar ajuda mais
    // que um "falhou" genérico.
    throw new Error(corpo.errors.map((e) => e.message).join(" | "));
  }
  return corpo.data;
}

/**
 * Lê um CSV respeitando aspas e quebras de linha dentro de campo.
 *
 * As descrições têm vírgula, aspas e parágrafos — dividir por `split(",")`
 * quebraria tudo e o erro só apareceria como issue truncada no Linear.
 */
function lerCsv(texto) {
  const linhas = [];
  let campo = "";
  let linha = [];
  let dentroDeAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (dentroDeAspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') dentroDeAspas = false;
      else campo += c;
    } else if (c === '"') dentroDeAspas = true;
    else if (c === ",") { linha.push(campo); campo = ""; }
    else if (c === "\n") { linha.push(campo); linhas.push(linha); linha = []; campo = ""; }
    else if (c !== "\r") campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }

  const [cabecalho, ...resto] = linhas.filter((l) => l.some((c) => c.trim()));
  return resto.map((l) => Object.fromEntries(cabecalho.map((k, i) => [k, l[i] ?? ""])));
}

/** Descobre o time, os estados do fluxo, as etiquetas e os projetos existentes. */
async function carregarContexto() {
  const d = await consultar(`{
    teams(first: 10) {
      nodes {
        id key name
        states(first: 50) { nodes { id name type } }
        labels(first: 100) { nodes { id name } }
        projects(first: 100) { nodes { id name } }
      }
    }
  }`);

  const times = d.teams.nodes;
  const time = times.find((t) => t.key === "REP") || times[0];
  if (!time) throw new Error("Nenhum time encontrado nesta conta do Linear.");

  return {
    time,
    estados: new Map(time.states.nodes.map((s) => [s.name.toLowerCase(), s.id])),
    etiquetas: new Map(time.labels.nodes.map((l) => [l.name.toLowerCase(), l.id])),
    projetos: new Map(time.projects.nodes.map((p) => [p.name.toLowerCase(), p.id])),
  };
}

/** Títulos das issues que já existem, para não duplicar em execuções repetidas. */
async function titulosExistentes(timeId) {
  const vistos = new Set();
  let cursor = null;
  for (;;) {
    const d = await consultar(
      `query($id: String!, $cursor: String) {
        team(id: $id) {
          issues(first: 100, after: $cursor) {
            nodes { title }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { id: timeId, cursor }
    );
    const p = d.team.issues;
    p.nodes.forEach((i) => vistos.add(i.title.trim().toLowerCase()));
    if (!p.pageInfo.hasNextPage) return vistos;
    cursor = p.pageInfo.endCursor;
  }
}

/** Devolve o id da etiqueta, criando-a se ainda não existir. */
async function garantirEtiqueta(ctx, nome) {
  const chave = nome.toLowerCase();
  if (ctx.etiquetas.has(chave)) return ctx.etiquetas.get(chave);
  if (SECO) return null;
  const d = await consultar(
    `mutation($input: IssueLabelCreateInput!) {
      issueLabelCreate(input: $input) { issueLabel { id } }
    }`,
    { input: { name: nome, teamId: ctx.time.id } }
  );
  const id = d.issueLabelCreate.issueLabel.id;
  ctx.etiquetas.set(chave, id);
  return id;
}

/** Devolve o id do projeto, criando-o se ainda não existir. */
async function garantirProjeto(ctx, nome) {
  if (!nome) return null;
  const chave = nome.toLowerCase();
  if (ctx.projetos.has(chave)) return ctx.projetos.get(chave);
  if (SECO) return null;
  const d = await consultar(
    `mutation($input: ProjectCreateInput!) {
      projectCreate(input: $input) { project { id } }
    }`,
    { input: { name: nome, teamIds: [ctx.time.id] } }
  );
  const id = d.projectCreate.project.id;
  ctx.projetos.set(chave, id);
  return id;
}

/** Casa o status do CSV com um estado do fluxo do time. */
function acharEstado(ctx, status) {
  const s = (status || "Todo").toLowerCase();
  const tentativas = {
    done: ["done", "concluído", "concluido", "completo"],
    todo: ["todo", "a fazer", "para fazer"],
    backlog: ["backlog", "ideias"],
  }[s] || [s];
  for (const nome of tentativas) {
    if (ctx.estados.has(nome)) return ctx.estados.get(nome);
  }
  return null; // sem estado explícito o Linear usa o padrão do time
}

async function main() {
  if (!CHAVE) {
    console.error(
      "\nLINEAR_API_KEY nao esta definida.\n\n" +
      "  1. Linear -> Settings -> Security & access -> Personal API keys\n" +
      "  2. PowerShell:  $env:LINEAR_API_KEY=\"lin_api_...\"\n" +
      "  3. node scripts/linear-sync.mjs --dry\n"
    );
    process.exit(1);
  }

  const issues = CSVS.flatMap((arquivo) => {
    const caminho = join(RAIZ, "docs", "linear", arquivo);
    if (!existsSync(caminho)) {
      console.warn(`  aviso: ${arquivo} nao encontrado, ignorando`);
      return [];
    }
    return lerCsv(readFileSync(caminho, "utf8"));
  });

  console.log(`\n${issues.length} issues nos CSVs${SECO ? "  (SIMULACAO)" : ""}`);

  const ctx = await carregarContexto();
  console.log(`Time: ${ctx.time.name} (${ctx.time.key})`);
  console.log(`Estados: ${[...ctx.estados.keys()].join(", ")}`);

  const jaExistem = await titulosExistentes(ctx.time.id);
  console.log(`${jaExistem.size} issues ja no Linear\n`);

  let criadas = 0, puladas = 0, falhas = 0;

  for (const linha of issues) {
    const titulo = (linha.Title || "").trim();
    if (!titulo) continue;

    if (jaExistem.has(titulo.toLowerCase())) {
      puladas++;
      continue;
    }

    const etiquetas = (linha.Labels || "")
      .split(",").map((e) => e.trim()).filter(Boolean);

    try {
      const labelIds = [];
      for (const e of etiquetas) {
        const id = await garantirEtiqueta(ctx, e);
        if (id) labelIds.push(id);
      }
      const projectId = await garantirProjeto(ctx, (linha.Project || "").trim());
      const stateId = acharEstado(ctx, linha.Status);
      const estimate = Number(linha.Estimate) || undefined;

      if (SECO) {
        console.log(`  [simulado] ${titulo.slice(0, 62)}`);
        criadas++;
        continue;
      }

      await consultar(
        `mutation($input: IssueCreateInput!) {
          issueCreate(input: $input) { success issue { identifier } }
        }`,
        {
          input: {
            teamId: ctx.time.id,
            title: titulo,
            description: linha.Description || "",
            priority: PRIORIDADE[linha.Priority] ?? 0,
            ...(estimate ? { estimate } : {}),
            ...(labelIds.length ? { labelIds } : {}),
            ...(projectId ? { projectId } : {}),
            ...(stateId ? { stateId } : {}),
          },
        }
      );
      criadas++;
      console.log(`  criada  ${titulo.slice(0, 62)}`);
    } catch (erro) {
      falhas++;
      console.error(`  FALHOU  ${titulo.slice(0, 48)} -> ${erro.message.slice(0, 90)}`);
    }
  }

  console.log(
    `\n${criadas} criada(s) | ${puladas} ja existiam | ${falhas} falha(s)` +
    (SECO ? "  (nada foi gravado)" : "")
  );
}

main().catch((e) => {
  console.error(`\nErro: ${e.message}\n`);
  process.exit(1);
});
