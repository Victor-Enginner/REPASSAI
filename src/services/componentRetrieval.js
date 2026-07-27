/**
 * REPASS AI - Camada de Retrieval e Validação do Catálogo de Componentes.
 *
 * Este é o "R" do RAG do gerador de sites. O princípio, tirado do modelo
 * Lovable/v0: a LLM NUNCA escreve JSX. Ela recebe um conjunto pequeno de
 * componentes reais e decide apenas quais usar e com quais props.
 *
 * Fluxo:
 *   1. expandirIntencao()   - prompt vago -> nicho + seções + tom visual
 *   2. recuperarCandidatos() - índice de 104 -> os N compatíveis
 *   3. (LLM escolhe entre os candidatos, temperature 0)
 *   4. validarSchema()      - rejeita qualquer componente fora do catálogo
 *
 * O passo 4 é o que elimina alucinação: se o modelo inventar um componente,
 * o schema é rejeitado com erro explícito em vez de quebrar o build.
 */

import { COMPONENT_INDEX as indice } from '../data/componentIndex.js';
import { IDS_IMPLEMENTADOS, EXTENSOES_DE_CATALOGO } from '../components/ui/registry.js';

const IMPLEMENTADOS = new Set(IDS_IMPLEMENTADOS);

/**
 * Catálogo completo: os componentes do Site Pack mais os componentes
 * próprios (OriginKit), que não vêm do pack mas existem em src/.
 *
 * Cada entrada carrega `implementado`, que diz se há código real em
 * `src/components/ui/`. Estar no catálogo significa "disponível para
 * materializar"; estar implementado significa "renderiza hoje". O gerador
 * só pode escolher os implementados.
 */
export const CATALOGO = [
  ...indice.componentes.map((c) => ({ ...c, implementado: IMPLEMENTADOS.has(c.id) })),
  ...EXTENSOES_DE_CATALOGO.map((c) => ({ ...c, implementado: true })),
];

/** Índice por id para lookup O(1) na validação. */
const POR_ID = new Map(CATALOGO.map((c) => [c.id, c]));

export const ESTATISTICAS_CATALOGO = {
  total: CATALOGO.length,
  instalaveis: CATALOGO.filter((c) => c.instalavel).length,
  implementados: CATALOGO.filter((c) => c.implementado).length,
  porEstilo: indice.estatisticas.porEstilo,
};

/**
 * Mapa de nicho -> preferências visuais.
 *
 * Isto é a "injeção de design system" descrita no blueprint: a IA não
 * escolhe estética livremente; ela recebe a paleta e os estilos que já
 * sabemos que convertem para aquele tipo de negócio.
 */
export const PERFIS_DE_NICHO = {
  restaurante: {
    estilos: ['fluido', 'luz', 'particulas'],
    evitar: ['glitch'],
    paleta: { primaria: '#ef4444', destaque: '#f59e0b', fundo: '#0b0705' },
    tom: 'quente, apetitoso, artesanal',
    secoes: ['hero', 'cardapio', 'galeria', 'localizacao', 'cta_whatsapp'],
  },
  barbearia: {
    estilos: ['geometrico', 'luz', 'superficie'],
    evitar: ['fluido'],
    paleta: { primaria: '#0070f3', destaque: '#38bdf8', fundo: '#05070f' },
    tom: 'masculino, preciso, premium',
    secoes: ['hero', 'servicos', 'equipe', 'agendamento', 'cta_whatsapp'],
  },
  salao: {
    estilos: ['fluido', 'luz', 'card'],
    evitar: ['glitch', 'geometrico'],
    paleta: { primaria: '#ec4899', destaque: '#f472b6', fundo: '#12060d' },
    tom: 'sofisticado, acolhedor, delicado',
    secoes: ['hero', 'procedimentos', 'galeria', 'agendamento', 'cta_whatsapp'],
  },
  academia: {
    estilos: ['glitch', 'geometrico', 'particulas'],
    evitar: [],
    paleta: { primaria: '#22c55e', destaque: '#a3e635', fundo: '#040a06' },
    tom: 'energético, intenso, performance',
    secoes: ['hero', 'modalidades', 'planos', 'estrutura', 'cta_whatsapp'],
  },
  tecnologia: {
    estilos: ['glitch', 'geometrico', 'luz'],
    evitar: [],
    paleta: { primaria: '#6366f1', destaque: '#38bdf8', fundo: '#000000' },
    tom: 'técnico, futurista, denso',
    secoes: ['hero', 'produto', 'stack', 'precos', 'cta_whatsapp'],
  },
  padrao: {
    estilos: ['luz', 'card', 'superficie'],
    evitar: [],
    paleta: { primaria: '#0070f3', destaque: '#38bdf8', fundo: '#05070f' },
    tom: 'profissional, confiável, direto',
    secoes: ['hero', 'servicos', 'sobre', 'contato', 'cta_whatsapp'],
  },
};

/** Palavras que indicam cada nicho, para classificar entrada livre. */
const SINAIS_DE_NICHO = {
  restaurante: ['restaurante', 'hamburgueria', 'pizzaria', 'lanche', 'marmita', 'comida', 'bar', 'bistro', 'cafe', 'padaria', 'açaí', 'sorvete'],
  barbearia: ['barbearia', 'barbeiro', 'corte', 'cabelo masculino', 'barba'],
  salao: ['salao', 'salão', 'unha', 'manicure', 'estetica', 'estética', 'beleza', 'sobrancelha', 'cilios', 'cabelereiro', 'sapato', 'moda', 'boutique'],
  academia: ['academia', 'gym', 'crossfit', 'pilates', 'treino', 'fitness', 'musculacao', 'luta'],
  tecnologia: ['software', 'saas', 'app', 'tech', 'startup', 'agencia digital', 'marketing', 'ti'],
};

/**
 * Classifica um texto livre em um nicho conhecido.
 * @param {string} texto Descrição do negócio ou categoria do lead
 * @returns {string} chave de PERFIS_DE_NICHO
 */
export function classificarNicho(texto) {
  const t = (texto || '').toLowerCase();
  let melhor = 'padrao';
  let melhorScore = 0;

  for (const [nicho, sinais] of Object.entries(SINAIS_DE_NICHO)) {
    const score = sinais.reduce((acc, s) => acc + (t.includes(s) ? 1 : 0), 0);
    if (score > melhorScore) {
      melhorScore = score;
      melhor = nicho;
    }
  }
  return melhor;
}

/**
 * Expande um prompt vago em uma especificação estruturada.
 *
 * É o "Planner Mode": "site pra loja de sapatos femininos" vira nicho,
 * paleta, tom e lista de seções — antes de qualquer geração.
 *
 * @param {string} promptUsuario
 * @param {object} [lead] Dados reais do lead, quando houver
 * @returns {object} especificação
 */
export function expandirIntencao(promptUsuario, lead = {}) {
  const base = `${promptUsuario || ''} ${lead.categoria || ''} ${lead.nome || ''}`;
  const nicho = classificarNicho(base);
  const perfil = PERFIS_DE_NICHO[nicho];

  return {
    nicho,
    perfil,
    promptOriginal: promptUsuario || '',
    negocio: {
      nome: lead.nome || null,
      cidade: lead.cidade || null,
      telefone: lead.telefone || null,
      // Só entram números que vieram de fonte verificada. Nunca inventar
      // avaliação ou contagem de clientes para estampar no site.
      avaliacao: typeof lead.avaliacao === 'number' ? lead.avaliacao : null,
      reviewsCount: typeof lead.reviewsCount === 'number' ? lead.reviewsCount : null,
    },
    secoes: perfil.secoes,
    paleta: perfil.paleta,
    tom: perfil.tom,
  };
}

/**
 * Pontua um componente contra uma consulta.
 * Determinístico de propósito — mesma entrada, mesmo resultado.
 */
function pontuar(componente, termos, perfil) {
  let score = 0;

  for (const termo of termos) {
    if (componente.id.includes(termo)) score += 5;
    if (componente.nome.toLowerCase().includes(termo)) score += 4;
    if (componente.keywords.includes(termo)) score += 3;
    else if (componente.keywords.some((k) => k.includes(termo))) score += 1;
  }

  if (perfil) {
    if (perfil.estilos.includes(componente.estilo)) score += 6;
    if (perfil.evitar.includes(componente.estilo)) score -= 8;
  }

  // Componente rico em props é mais controlável pela IA (mais superfície
  // para ajustar sem tocar em código).
  score += Math.min(componente.totalProps, 8) * 0.25;

  return score;
}

/**
 * Recupera os componentes mais compatíveis com a intenção.
 *
 * @param {object} opcoes
 * @param {string} [opcoes.consulta] Texto livre
 * @param {object} [opcoes.perfil] Perfil de nicho (de expandirIntencao)
 * @param {'background'|'component'} [opcoes.categoria] Filtro de categoria
 * @param {number} [opcoes.limite=8] Quantos devolver
 * @param {boolean} [opcoes.somenteInstalaveis=true] Ignora componentes cujas
 *        dependências npm não estão instaladas — sugerir um deles quebraria o build.
 * @param {boolean} [opcoes.somenteImplementados=true] Ignora componentes que
 *        existem no catálogo mas ainda não foram materializados em
 *        src/components/ui/ — o renderer não conseguiria montá-los.
 * @returns {Array} componentes ordenados por relevância
 */
export function recuperarCandidatos({
  consulta = '',
  perfil = null,
  categoria = null,
  limite = 8,
  somenteInstalaveis = true,
  somenteImplementados = true,
} = {}) {
  const termos = consulta
    .toLowerCase()
    .split(/[^a-z0-9à-ú]+/)
    .filter((t) => t.length > 2);

  let pool = CATALOGO;
  if (somenteInstalaveis) pool = pool.filter((c) => c.instalavel);
  if (somenteImplementados) pool = pool.filter((c) => c.implementado);
  if (categoria) pool = pool.filter((c) => c.categoria === categoria);

  return pool
    .map((c) => ({ componente: c, score: pontuar(c, termos, perfil) }))
    // Com pool pequeno, score 0 ainda é candidato válido: melhor oferecer
    // um componente neutro do que devolver lista vazia ao modelo.
    .filter((r) => (pool.length > 20 ? r.score > 0 : true))
    .sort((a, b) => b.score - a.score || a.componente.id.localeCompare(b.componente.id))
    .slice(0, limite)
    .map((r) => ({ ...r.componente, _score: Number(r.score.toFixed(2)) }));
}

/**
 * Monta o bloco de contexto que vai no prompt da LLM.
 *
 * Enviamos apenas id, props e tipos — nunca o código-fonte completo. Isso
 * mantém o prompt pequeno (economia de token) e deixa claro para o modelo
 * que a única saída aceitável é escolha + props.
 *
 * @param {Array} candidatos Saída de recuperarCandidatos
 * @returns {string} contexto pronto para injeção no prompt
 */
export function montarContextoParaLLM(candidatos) {
  return candidatos
    .map((c) => {
      const props = c.props
        .slice(0, 10)
        .map((p) => `    - ${p.nome}: ${p.tipo || 'any'}${p.padrao ? ` (padrão: ${p.padrao})` : ''}`)
        .join('\n');
      return `- id: "${c.id}"\n  nome: ${c.nome}\n  categoria: ${c.categoria}\n  estilo: ${c.estilo}\n  props:\n${props || '    (sem props documentadas)'}`;
    })
    .join('\n\n');
}

/**
 * Normalizadores de forma por componente.
 *
 * Validar o NOME da prop não basta: a LLM acerta `items` mas entrega os
 * objetos com as chaves erradas, e o componente renderiza vazio sem erro
 * nenhum. Aqui convertemos para a forma que o componente realmente lê.
 */
const NORMALIZADORES = {
  bento_grid: (props) => {
    if (!Array.isArray(props.items)) return props;
    return {
      ...props,
      items: props.items.map((item) => {
        if (!item || typeof item !== 'object') return item;
        return {
          icon: item.icon ?? item.icone ?? '•',
          title: item.title ?? item.titulo ?? item.nome ?? '',
          desc: item.desc ?? item.descricao ?? item.descrição ?? item.description ?? '',
        };
      }),
    };
  },
};

/** Detecta URL de contato / telefone embutido em valor gerado pela IA. */
const PADRAO_CONTATO_INVENTADO = /(wa\.me|whatsapp\.com|tel:|https?:\/\/)/i;

/**
 * Remove dados de contato inventados pela LLM.
 *
 * Mesmo instruída a não inventar, ela produz coisas como
 * "https://wa.me/551499999999". Se isso chegar ao site do cliente, ele
 * divulga um número que não é dele — que pode ser de um terceiro real.
 * Contato só entra a partir do lead verificado, nunca do texto gerado.
 */
function limparContatosInventados(valor, ref, avisos) {
  if (typeof valor === 'string') {
    if (PADRAO_CONTATO_INVENTADO.test(valor)) {
      avisos.push(`${ref}: contato/URL gerado pela IA foi removido ("${valor.slice(0, 48)}").`);
      return '';
    }
    return valor;
  }

  if (Array.isArray(valor)) {
    return valor.map((v) => limparContatosInventados(v, ref, avisos));
  }

  if (valor && typeof valor === 'object') {
    const saida = {};
    for (const [k, v] of Object.entries(valor)) {
      const limpo = limparContatosInventados(v, ref, avisos);
      // Chave que existia só para carregar link inventado é descartada.
      if (limpo !== '' || typeof v !== 'string') saida[k] = limpo;
    }
    return saida;
  }

  return valor;
}

/**
 * Valida um schema gerado contra o catálogo real.
 *
 * Esta é a barreira anti-alucinação. Um componente inexistente, uma prop
 * desconhecida ou uma dependência ausente viram erro explícito em vez de
 * um build quebrado em produção.
 *
 * @param {object} schema Schema declarativo produzido pela LLM
 * @returns {{valido: boolean, erros: string[], avisos: string[], schema: object}}
 */
export function validarSchema(schema) {
  const erros = [];
  const avisos = [];

  if (!schema || typeof schema !== 'object') {
    return { valido: false, erros: ['Schema ausente ou não é um objeto.'], avisos, schema: null };
  }

  const blocos = Array.isArray(schema.blocos) ? schema.blocos : null;
  if (!blocos) {
    return { valido: false, erros: ['Schema precisa de um array "blocos".'], avisos, schema: null };
  }

  const blocosValidados = [];

  blocos.forEach((bloco, i) => {
    const ref = `blocos[${i}]`;

    if (!bloco || typeof bloco !== 'object' || !bloco.componenteId) {
      erros.push(`${ref}: falta "componenteId".`);
      return;
    }

    const componente = POR_ID.get(bloco.componenteId);
    if (!componente) {
      erros.push(`${ref}: componente "${bloco.componenteId}" não existe no catálogo (alucinação rejeitada).`);
      return;
    }

    if (!componente.instalavel) {
      erros.push(
        `${ref}: "${bloco.componenteId}" exige dependências não instaladas: ${componente.dependenciasFaltando.join(', ')}.`
      );
      return;
    }

    // Props desconhecidas são removidas, não fatais: o componente ainda
    // renderiza com os defaults dele.
    const nomesValidos = new Set(componente.props.map((p) => p.nome));
    const propsRecebidas = bloco.props && typeof bloco.props === 'object' ? bloco.props : {};
    const propsLimpas = {};

    for (const [chave, valor] of Object.entries(propsRecebidas)) {
      if (nomesValidos.has(chave)) {
        propsLimpas[chave] = valor;
      } else if (componente.props.length > 0) {
        avisos.push(`${ref}: prop "${chave}" não existe em ${componente.nome} — descartada.`);
      } else {
        propsLimpas[chave] = valor;
      }
    }

    // 1. Tira contato/URL que a IA tenha inventado.
    let propsFinais = limparContatosInventados(propsLimpas, ref, avisos);

    // 2. Ajusta a forma das props para o que o componente realmente lê.
    const normalizar = NORMALIZADORES[bloco.componenteId];
    if (normalizar) propsFinais = normalizar(propsFinais);

    blocosValidados.push({
      componenteId: bloco.componenteId,
      nome: componente.nome,
      categoria: componente.categoria,
      secao: bloco.secao || null,
      props: propsFinais,
    });
  });

  if (blocosValidados.length === 0 && erros.length === 0) {
    erros.push('Schema não produziu nenhum bloco válido.');
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos,
    schema: erros.length === 0 ? { ...schema, blocos: blocosValidados } : null,
  };
}

/**
 * Pipeline completo de recuperação, pronto para alimentar o gerador.
 *
 * @param {string} promptUsuario
 * @param {object} [lead]
 * @returns {object} especificação + candidatos + contexto de prompt
 */
export function prepararGeracao(promptUsuario, lead = {}) {
  const spec = expandirIntencao(promptUsuario, lead);

  const fundos = recuperarCandidatos({
    consulta: `${spec.nicho} ${spec.tom} ${promptUsuario}`,
    perfil: spec.perfil,
    categoria: 'background',
    limite: 5,
  });

  const componentes = recuperarCandidatos({
    consulta: `${spec.nicho} ${spec.tom} ${promptUsuario}`,
    perfil: spec.perfil,
    categoria: 'component',
    limite: 10,
  });

  return {
    spec,
    candidatos: { fundos, componentes },
    contextoLLM: {
      fundos: montarContextoParaLLM(fundos),
      componentes: montarContextoParaLLM(componentes),
    },
  };
}
