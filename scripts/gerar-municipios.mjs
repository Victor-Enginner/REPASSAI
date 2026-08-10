/**
 * Gera src/data/municipiosBR.json a partir da API de localidades do IBGE.
 *
 * POR QUE UM ARQUIVO, E NÃO UMA CHAMADA EM TEMPO DE EXECUÇÃO
 *   A lista de municípios muda de anos em anos, não de minutos em minutos.
 *   Consultar o IBGE a cada abertura do Scanner colocaria um serviço de
 *   terceiros no caminho crítico da tela principal: se ele cair ou ficar
 *   lento, o operador não consegue escolher cidade — que é o primeiro passo
 *   de toda a varredura. O arquivo é gerado uma vez e versionado.
 *
 * COMO ATUALIZAR
 *   node scripts/gerar-municipios.mjs
 *
 * O formato de saída é { "SP": ["Adamantina", ...], ... } — agrupado por UF
 * porque a tela sempre pergunta o estado antes da cidade, e assim a busca
 * do <select> é um acesso direto em vez de um filtro sobre 5.571 itens.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, '..');
const destino = path.join(raiz, 'src', 'data', 'municipiosBR.json');

const URL_IBGE =
  'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome';

console.log('Consultando o IBGE...');

const resposta = await fetch(URL_IBGE);
if (!resposta.ok) {
  console.error(`IBGE respondeu ${resposta.status}. Nada foi escrito.`);
  process.exit(1);
}

const municipios = await resposta.json();

if (!Array.isArray(municipios) || municipios.length < 5000) {
  // O Brasil tem 5.571 municípios. Um retorno muito menor significa resposta
  // parcial ou formato mudado — sobrescrever o arquivo bom com um quebrado é
  // pior do que falhar aqui.
  console.error(
    `Resposta suspeita: ${municipios?.length} municípios. Esperado ~5.571. Nada foi escrito.`,
  );
  process.exit(1);
}

const porUF = {};
const semUF = [];

for (const m of municipios) {
  // O caminho da UF varia dentro da MESMA resposta. Municípios antigos vêm
  // por `microrregiao`; os criados recentemente têm `microrregiao: null` e
  // só trazem `regiao-imediata` — com HÍFEN, não sublinhado. Escrever a
  // chave com sublinhado devolve `undefined` sem erro nenhum, e o município
  // some calado: foi assim que "Boa Esperança do Norte" (MT) se perdeu.
  const uf =
    m?.microrregiao?.mesorregiao?.UF?.sigla ||
    m?.['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla ||
    null;

  if (!uf) {
    semUF.push(m?.nome ?? '(sem nome)');
    continue;
  }

  (porUF[uf] ||= []).push(m.nome);
}

if (semUF.length) {
  // Falhar é melhor que gravar uma lista furada: um município ausente vira
  // uma cidade que o operador simplesmente não consegue escolher, sem nada
  // na tela explicando o motivo.
  console.error(`${semUF.length} municípios sem UF identificável:`);
  for (const nome of semUF.slice(0, 10)) console.error(`  - ${nome}`);
  console.error('Nada foi escrito. Verifique o formato da resposta do IBGE.');
  process.exit(1);
}

// Ordem alfabética respeitando acento — 'Águas' tem de vir junto de 'Aguaí',
// não no fim da lista. `localeCompare` com pt-BR resolve; ordenação por
// código de caractere não.
for (const uf of Object.keys(porUF)) {
  porUF[uf].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

const ordenadoPorUF = Object.fromEntries(
  Object.keys(porUF)
    .sort()
    .map((uf) => [uf, porUF[uf]]),
);

fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, JSON.stringify(ordenadoPorUF), 'utf-8');

const total = Object.values(ordenadoPorUF).reduce((s, l) => s + l.length, 0);
const kb = (fs.statSync(destino).size / 1024).toFixed(0);

console.log(`${total} municípios em ${Object.keys(ordenadoPorUF).length} UFs.`);
console.log(`Escrito em src/data/municipiosBR.json (${kb} KB).`);
