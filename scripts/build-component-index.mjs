/**
 * REPASS AI - Indexador do Catálogo de Componentes (camada de Retrieval do RAG).
 *
 * Lê os arquivos .txt do Site Pack (React Bits e afins), extrai metadados
 * estruturados e grava um índice JSON consultável em src/data/componentIndex.json.
 *
 * PORQUÊ ISTO EXISTE
 * ------------------
 * O motor de geração nunca deve deixar a LLM escrever JSX livre — é de onde
 * vem alucinação e erro de compilação. A LLM escolhe APENAS entre componentes
 * que existem neste índice, e só define props. Se ela inventar um componente,
 * a validação rejeita porque o id não está no catálogo.
 *
 * O índice também registra as dependências npm de cada componente e se elas
 * estão instaladas, para nunca sugerirmos algo que quebra o build.
 *
 * Uso:  node scripts/build-component-index.mjs [caminho-do-site-pack]
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const SITE_PACK_PADRAO = 'D:\\Site Pack Assets';
const PASTAS = [
  { dir: 'Backgrounds Animations', categoria: 'background' },
  { dir: 'Components Animations', categoria: 'component' },
];

/** Converte "Magic Bento" -> "magic_bento" */
function slugify(texto) {
  return texto
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Extrai as dependências npm declaradas no arquivo.
 * Cobre "### Dependencies: ogl" e a variante sem dois-pontos.
 */
function extrairDependencias(texto) {
  const m = texto.match(/^###\s*Dependencies:?\s*(.+)$/m);
  if (!m) return [];
  return m[1].trim().split(/\s+/).filter(Boolean);
}

/** Extrai o nome do componente: "### Component: MagicBento" */
function extrairNomeComponente(texto, fallback) {
  const m = texto.match(/^###\s*Component:?\s*(.+)$/m);
  if (m) return m[1].trim();
  const t = texto.match(/^##\s*Integrate the <(\w+)\s*\/>/m);
  return t ? t[1] : fallback;
}

/** Captura o conteúdo de uma seção "### Titulo" até o próximo "###". */
function extrairSecao(texto, titulo) {
  const re = new RegExp(`^###\\s*${titulo}\\s*$([\\s\\S]*?)(?=^###\\s|\\Z)`, 'm');
  const m = texto.match(re);
  return m ? m[1].trim() : '';
}

/** Pega o primeiro bloco de código de um trecho markdown. */
function extrairBlocoCodigo(trecho) {
  const m = trecho.match(/```(?:jsx?|tsx?|bash)?\n([\s\S]*?)```/);
  return m ? m[1].trim() : '';
}

/**
 * Faz o parse da tabela markdown de props.
 * Formato: | Prop | Type | Default | Description |
 */
function extrairProps(trecho) {
  const linhas = trecho.split('\n').filter((l) => l.trim().startsWith('|'));
  const props = [];
  // Alguns arquivos repetem a mesma prop na tabela; manter a primeira
  // ocorrência evita inflar o prompt com linhas duplicadas.
  const vistos = new Set();

  for (const linha of linhas) {
    const celulas = linha.split('|').map((c) => c.trim()).filter((c, i, arr) => !(i === 0 && !c) && !(i === arr.length - 1 && !c));
    if (celulas.length < 2) continue;

    const nome = celulas[0].replace(/`/g, '').trim();
    // Ignora cabeçalho e linha separadora
    if (!nome || /^-+$/.test(nome) || /^prop$/i.test(nome)) continue;
    if (vistos.has(nome)) continue;
    vistos.add(nome);

    props.push({
      nome,
      tipo: (celulas[1] || '').replace(/`/g, '').trim(),
      padrao: (celulas[2] || '').replace(/`/g, '').trim(),
      descricao: (celulas[3] || '').trim(),
    });
  }
  return props;
}

/**
 * Gera os termos de busca do componente.
 * O retrieval é por palavra-chave sobre este campo — sem servidor de
 * embeddings, sem custo por chamada, e determinístico (que é o que
 * queremos para geração reproduzível).
 */
function gerarKeywords({ nomeArquivo, nomeComponente, props, deps, categoria }) {
  const termos = new Set();

  // Quebra CamelCase: "MagicBento" -> ["magic", "bento"]
  const partes = nomeComponente.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s+/);
  partes.forEach((p) => p && termos.add(p.toLowerCase()));
  nomeArquivo.split(/[\s\-_()]+/).forEach((p) => p && termos.add(p.toLowerCase()));

  termos.add(categoria);
  deps.forEach((d) => termos.add(d.toLowerCase()));
  props.slice(0, 12).forEach((p) => termos.add(p.nome.toLowerCase()));

  return [...termos].filter((t) => t.length > 2);
}

/** Classifica o efeito visual a partir do nome, para filtros de alto nível. */
function inferirEstilo(nome) {
  const n = nome.toLowerCase();
  const regras = [
    [/glitch|faulty|terminal|matrix|scramble|decay/, 'glitch'],
    [/particle|star|galaxy|dot|pixel|snow|ballpit|meta ?ball/, 'particulas'],
    [/wave|silk|liquid|fluid|aurora|plasma|ether|ripple|threads/, 'fluido'],
    [/prism|beam|ray|light|glow|laser|spotlight|lightning|orb/, 'luz'],
    [/grid|cube|dither|shape|mansory|masonry/, 'geometrico'],
    [/card|profile|tilt|reflective|folder|stack/, 'card'],
    [/menu|nav|dock|sidebar|pill|bubble|staggered/, 'navegacao'],
    [/cursor|trail|magnet|hover|crosshair/, 'cursor'],
    [/carousel|gallery|slider|circular|dome|flying|swap/, 'galeria'],
    [/text|counter|typewriter|split/, 'tipografia'],
    [/border|button|glass|specular|shiny/, 'superficie'],
  ];
  for (const [re, estilo] of regras) if (re.test(n)) return estilo;
  return 'diverso';
}

/**
 * Pacotes resolvidos por alias no vite.config.js.
 * 'motion' é o nome novo do Framer Motion: os componentes importam de
 * 'motion/react' e o alias aponta para o 'framer-motion' já instalado.
 */
const ALIASES = { motion: 'framer-motion' };

function lerDependenciasInstaladas() {
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
  const instaladas = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ]);

  for (const [alias, alvo] of Object.entries(ALIASES)) {
    if (instaladas.has(alvo)) instaladas.add(alias);
  }
  return instaladas;
}

function main() {
  const sitePack = process.argv[2] || SITE_PACK_PADRAO;
  const instaladas = lerDependenciasInstaladas();

  if (!existsSync(sitePack)) {
    console.error(`[indexador] Site Pack não encontrado em: ${sitePack}`);
    console.error('Passe o caminho: node scripts/build-component-index.mjs "D:\\Site Pack Assets"');
    process.exit(1);
  }

  const componentes = [];
  const idsVistos = new Set();

  for (const { dir, categoria } of PASTAS) {
    const caminhoPasta = join(sitePack, dir);
    if (!existsSync(caminhoPasta)) {
      console.warn(`[indexador] pasta ausente, pulando: ${caminhoPasta}`);
      continue;
    }

    for (const arquivo of readdirSync(caminhoPasta)) {
      if (!arquivo.toLowerCase().endsWith('.txt')) continue;

      const caminho = join(caminhoPasta, arquivo);
      const texto = readFileSync(caminho, 'utf8');
      const nomeArquivo = basename(arquivo, '.txt');

      const nomeComponente = extrairNomeComponente(texto, nomeArquivo.replace(/\s+/g, ''));
      const deps = extrairDependencias(texto);
      const props = extrairProps(extrairSecao(texto, 'Props'));
      const usage = extrairBlocoCodigo(extrairSecao(texto, 'Usage Example'));
      const fonte = extrairSecao(texto, 'Full Component Source');

      let id = slugify(nomeArquivo);
      // Evita colisão entre pastas (ex.: "Particles" existe nas duas)
      if (idsVistos.has(id)) id = `${categoria}_${id}`;
      idsVistos.add(id);

      const faltando = deps.filter((d) => !instaladas.has(d));

      componentes.push({
        id,
        nome: nomeComponente,
        arquivo: nomeArquivo,
        categoria,
        estilo: inferirEstilo(nomeArquivo),
        dependencias: deps,
        dependenciasFaltando: faltando,
        instalavel: faltando.length === 0,
        props,
        totalProps: props.length,
        usageExample: usage,
        temFonte: fonte.length > 0,
        linhasFonte: fonte ? fonte.split('\n').length : 0,
        keywords: gerarKeywords({ nomeArquivo, nomeComponente, props, deps, categoria }),
        caminhoOrigem: join(dir, arquivo),
      });
    }
  }

  componentes.sort((a, b) => a.id.localeCompare(b.id));

  const porEstilo = {};
  const porDep = {};
  componentes.forEach((c) => {
    porEstilo[c.estilo] = (porEstilo[c.estilo] || 0) + 1;
    (c.dependencias.length ? c.dependencias : ['(nenhuma)']).forEach((d) => {
      porDep[d] = (porDep[d] || 0) + 1;
    });
  });

  const indice = {
    versao: 1,
    // Sem timestamp: o índice precisa ser determinístico para o git não
    // acusar diff a cada rebuild sem mudança real de conteúdo.
    origem: sitePack,
    total: componentes.length,
    instalaveis: componentes.filter((c) => c.instalavel).length,
    estatisticas: { porEstilo, porDependencia: porDep },
    componentes,
  };

  const destinoDir = join(REPO_ROOT, 'src', 'data');
  mkdirSync(destinoDir, { recursive: true });

  // Emitimos um módulo ES em vez de .json: import de JSON exige import
  // attributes no Node 24+, o que quebraria os testes fora do Vite.
  const destino = join(destinoDir, 'componentIndex.js');
  const cabecalho = [
    '/**',
    ' * ARQUIVO GERADO — não editar à mão.',
    ' * Origem: scripts/build-component-index.mjs',
    ' * Regenerar com: npm run build:index',
    ' */',
    '',
    'export const COMPONENT_INDEX = ',
  ].join('\n');
  writeFileSync(destino, `${cabecalho}${JSON.stringify(indice, null, 2)};\n\nexport default COMPONENT_INDEX;\n`, 'utf8');

  console.log(`[indexador] ${indice.total} componentes indexados (${indice.instalaveis} instaláveis)`);
  console.log('[indexador] por estilo:', porEstilo);
  console.log('[indexador] por dependência:', porDep);

  const quebrados = componentes.filter((c) => !c.instalavel);
  if (quebrados.length) {
    const faltantes = [...new Set(quebrados.flatMap((c) => c.dependenciasFaltando))];
    console.log(`\n[indexador] ${quebrados.length} componentes exigem deps NÃO instaladas: ${faltantes.join(', ')}`);
    console.log('[indexador] eles ficam marcados instalavel:false e o retrieval os ignora por padrão.');
  }
  console.log(`\n[indexador] índice gravado em src/data/componentIndex.json`);
}

main();
