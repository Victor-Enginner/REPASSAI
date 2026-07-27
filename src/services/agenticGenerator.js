/**
 * REPASS AI - Gerador Agêntico com Loop Fechado de Auto-Correção.
 *
 * Equivalente funcional do sandbox do Replit/Lovable — sem container.
 *
 * Aquelas plataformas precisam de um Linux virtualizado porque a IA delas
 * gera código arbitrário: só executando dá para saber se compila. Aqui a IA
 * emite um schema JSON validado contra um catálogo fechado de componentes,
 * então a validação substitui a compilação: roda em microssegundos, custa
 * zero e nunca falha em runtime.
 *
 * Ciclo:
 *   1. prepararGeracao()  -> nicho, paleta, seções e candidatos (retrieval)
 *   2. montarPrompt()     -> restrições negativas + few-shot + catálogo
 *   3. LLM (temperature 0)-> schema JSON
 *   4. validarSchema()    -> aprova ou lista erros
 *   5. se reprovou, devolve os erros ao modelo e repete (até MAX_TENTATIVAS)
 *   6. se esgotar, cai no schema determinístico local (nunca quebra a UI)
 */

// Extensões explícitas: mantém o módulo executável em Node puro (testes),
// não só via resolver do Vite.
import { prepararGeracao, validarSchema, recuperarCandidatos } from './componentRetrieval.js';
import { executePromptWithFallback } from './llmRouter.js';

/** Tentativas de auto-correção antes de desistir e usar o fallback local. */
export const MAX_TENTATIVAS = 3;

/**
 * Instruções de sistema do gerador.
 *
 * Aplica as três travas do blueprint de engenharia de IA:
 *  - restrições negativas (proíbe texto fora do JSON)
 *  - isolamento de saída (só JSON, nada de markdown ou explicação)
 *  - ancoragem por exemplo (few-shot com o formato exato)
 */
const SYSTEM_PROMPT = `Você é o compilador de landing pages do REPASS AI.

REGRAS ABSOLUTAS:
1. Responda EXCLUSIVAMENTE com um objeto JSON válido. Nada antes, nada depois.
2. PROIBIDO: markdown, cercas de código, comentários, explicações, saudações.
3. Você NÃO escreve HTML, CSS nem JSX. Você apenas escolhe componentes do
   catálogo fornecido e define as props deles.
4. Use SOMENTE ids que aparecem no catálogo. Inventar um id é erro fatal.
5. Use SOMENTE props listadas para aquele componente.
6. Não invente números sobre o negócio (avaliação, anos de mercado, número de
   clientes). Use apenas os dados fornecidos; se não houver, omita.

FORMATO EXATO DA RESPOSTA:
{
  "titulo": "string",
  "subtitulo": "string",
  "blocos": [
    { "componenteId": "id_do_catalogo", "secao": "hero", "props": { "speed": 3 } }
  ]
}`;

/**
 * Monta o prompt do usuário com o contexto recuperado.
 *
 * @param {object} preparo Saída de prepararGeracao()
 * @param {string[]} [errosAnteriores] Erros da tentativa anterior, se houver
 * @returns {string}
 */
function montarPrompt(preparo, errosAnteriores = []) {
  const { spec, contextoLLM } = preparo;
  const n = spec.negocio;

  const dadosNegocio = [
    n.nome && `nome: ${n.nome}`,
    n.cidade && `cidade: ${n.cidade}`,
    typeof n.avaliacao === 'number' && `avaliação no Google: ${n.avaliacao}`,
    typeof n.reviewsCount === 'number' && `nº de avaliações: ${n.reviewsCount}`,
  ].filter(Boolean).join('\n');

  const correcao = errosAnteriores.length
    ? `\n\nSUA RESPOSTA ANTERIOR FOI REJEITADA. Corrija exatamente estes erros:\n${
        errosAnteriores.map((e) => `- ${e}`).join('\n')
      }\nGere um novo JSON corrigido.`
    : '';

  return `Pedido do usuário: "${spec.promptOriginal}"

Nicho identificado: ${spec.nicho}
Tom visual: ${spec.tom}
Paleta obrigatória: primária ${spec.paleta.primaria}, destaque ${spec.paleta.destaque}, fundo ${spec.paleta.fundo}
Seções esperadas: ${spec.secoes.join(', ')}
${dadosNegocio ? `\nDados reais do negócio:\n${dadosNegocio}` : ''}

CATÁLOGO DE FUNDOS DISPONÍVEIS:
${contextoLLM.fundos}

CATÁLOGO DE COMPONENTES DISPONÍVEIS:
${contextoLLM.componentes}

Monte a landing page escolhendo 1 fundo e de 2 a 4 componentes.${correcao}`;
}

/**
 * Extrai o objeto JSON de uma resposta de LLM.
 *
 * Modelos frequentemente embrulham o JSON em cercas de markdown mesmo sendo
 * proibido. Em vez de falhar, recortamos o primeiro objeto balanceado.
 *
 * @param {string} texto
 * @returns {{ok: boolean, valor?: object, erro?: string}}
 */
export function extrairJSON(texto) {
  if (!texto || typeof texto !== 'string') {
    return { ok: false, erro: 'Resposta vazia do modelo.' };
  }

  let limpo = texto.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const inicio = limpo.indexOf('{');
  if (inicio === -1) return { ok: false, erro: 'Nenhum objeto JSON na resposta.' };

  // Varre contando chaves para achar o fim do primeiro objeto balanceado,
  // ignorando chaves dentro de string.
  let profundidade = 0;
  let emString = false;
  let escapado = false;

  for (let i = inicio; i < limpo.length; i += 1) {
    const c = limpo[i];

    if (escapado) { escapado = false; continue; }
    if (c === '\\') { escapado = true; continue; }
    if (c === '"') { emString = !emString; continue; }
    if (emString) continue;

    if (c === '{') profundidade += 1;
    else if (c === '}') {
      profundidade -= 1;
      if (profundidade === 0) {
        try {
          return { ok: true, valor: JSON.parse(limpo.slice(inicio, i + 1)) };
        } catch (e) {
          return { ok: false, erro: `JSON malformado: ${e.message}` };
        }
      }
    }
  }

  return { ok: false, erro: 'Objeto JSON incompleto (chaves não fecham).' };
}

/**
 * Schema determinístico local, usado quando a IA não está disponível ou não
 * converge. Escolhe componentes reais pelo perfil do nicho — nunca quebra.
 *
 * @param {object} preparo
 * @returns {object} schema já validado
 */
export function gerarSchemaLocal(preparo) {
  const { spec } = preparo;
  const fundo = preparo.candidatos.fundos[0];
  const componentes = preparo.candidatos.componentes.slice(0, 3);

  const blocos = [];
  if (fundo) blocos.push({ componenteId: fundo.id, secao: 'hero', props: {} });
  componentes.forEach((c, i) => {
    blocos.push({ componenteId: c.id, secao: spec.secoes[i + 1] || 'conteudo', props: {} });
  });

  const nome = spec.negocio.nome || 'Seu Negócio';
  const cidade = spec.negocio.cidade;

  // Frase por nicho. Sem promessa que não podemos sustentar e sem número
  // inventado — só entra dado que veio de fonte verificada.
  const CHAMADAS = {
    restaurante: 'Sabor de verdade, feito na hora',
    barbearia: 'Corte, barba e acabamento premium',
    salao: 'Cuidado e beleza com hora marcada',
    academia: 'Treino sério, resultado real',
    tecnologia: 'Tecnologia que resolve de verdade',
    padrao: 'Atendimento profissional e direto',
  };

  const chamada = CHAMADAS[spec.nicho] || CHAMADAS.padrao;

  return {
    titulo: nome,
    subtitulo: cidade ? `${chamada} em ${cidade}.` : `${chamada}.`,
    blocos,
  };
}

/**
 * Executa o ciclo agêntico completo.
 *
 * @param {string} promptUsuario Pedido em linguagem natural
 * @param {object} [lead] Dados reais do lead
 * @param {object} [opcoes]
 * @param {object} [opcoes.config] Configuração de provedores de IA
 * @param {number} [opcoes.maxTentativas]
 * @returns {Promise<{sucesso:boolean, schema:object, origem:string,
 *          tentativas:number, trace:string[], avisos:string[]}>}
 */
export async function gerarLandingPage(promptUsuario, lead = {}, opcoes = {}) {
  const maxTentativas = opcoes.maxTentativas ?? MAX_TENTATIVAS;
  const trace = [];

  const preparo = prepararGeracao(promptUsuario, lead);
  trace.push(`[Planner] Nicho "${preparo.spec.nicho}" · paleta ${preparo.spec.paleta.primaria} · ${preparo.spec.secoes.length} seções.`);
  trace.push(`[Retrieval] ${preparo.candidatos.fundos.length} fundos e ${preparo.candidatos.componentes.length} componentes recuperados do catálogo.`);

  let erros = [];

  for (let tentativa = 1; tentativa <= maxTentativas; tentativa += 1) {
    trace.push(`[Ciclo ${tentativa}/${maxTentativas}] Consultando modelo (temperature 0)...`);

    const resposta = await executePromptWithFallback(
      montarPrompt(preparo, erros),
      SYSTEM_PROMPT,
      opcoes.config || null,
      { temperature: 0 }
    );

    if (!resposta.success) {
      trace.push(`[Ciclo ${tentativa}] IA indisponível: ${resposta.error}`);
      break;
    }

    trace.push(`[Ciclo ${tentativa}] Resposta de ${resposta.provider} (${resposta.model}).`);

    const extraido = extrairJSON(resposta.output);
    if (!extraido.ok) {
      erros = [extraido.erro];
      trace.push(`[Ciclo ${tentativa}] ✗ ${extraido.erro} — devolvendo erro ao modelo.`);
      continue;
    }

    const validacao = validarSchema(extraido.valor);
    if (validacao.valido) {
      trace.push(`[Ciclo ${tentativa}] ✓ Schema aprovado: ${validacao.schema.blocos.length} blocos.`);
      validacao.avisos.forEach((a) => trace.push(`[Aviso] ${a}`));
      return {
        sucesso: true,
        schema: { ...extraido.valor, ...validacao.schema },
        origem: `IA (${resposta.provider})`,
        tentativas: tentativa,
        trace,
        avisos: validacao.avisos,
      };
    }

    erros = validacao.erros;
    trace.push(`[Ciclo ${tentativa}] ✗ ${erros.length} erro(s) de validação — auto-correção acionada.`);
    erros.forEach((e) => trace.push(`   → ${e}`));
  }

  // Esgotou o loop: entrega o schema local determinístico. O usuário sempre
  // recebe uma página válida; o trace explica por que a IA não foi usada.
  const local = gerarSchemaLocal(preparo);
  const validacaoLocal = validarSchema(local);
  trace.push(`[Fallback] Motor local determinístico: ${validacaoLocal.schema?.blocos.length || 0} blocos.`);

  return {
    sucesso: false,
    schema: validacaoLocal.valido ? { ...local, ...validacaoLocal.schema } : local,
    origem: 'Motor local determinístico',
    tentativas: maxTentativas,
    trace,
    avisos: validacaoLocal.avisos || [],
  };
}

/**
 * Aplica um ajuste incremental a um schema existente ("deixe mais escuro",
 * "troca o fundo"). Mantém o resto da página intacto.
 *
 * @param {object} schemaAtual
 * @param {string} instrucao
 * @param {object} [opcoes]
 * @returns {Promise<object>} mesmo formato de gerarLandingPage
 */
export async function ajustarLandingPage(schemaAtual, instrucao, opcoes = {}) {
  const trace = [`[Editor] Ajuste solicitado: "${instrucao}"`];

  const candidatos = recuperarCandidatos({ consulta: instrucao, limite: 10 });
  const catalogo = candidatos
    .map((c) => `- id: "${c.id}" (${c.categoria}/${c.estilo})`)
    .join('\n');

  const prompt = `Schema atual:
${JSON.stringify(schemaAtual, null, 2)}

Ajuste pedido: "${instrucao}"

Componentes relevantes disponíveis:
${catalogo}

Devolva o schema COMPLETO já ajustado, no mesmo formato.`;

  const resposta = await executePromptWithFallback(
    prompt, SYSTEM_PROMPT, opcoes.config || null, { temperature: 0 }
  );

  if (!resposta.success) {
    trace.push(`[Editor] IA indisponível: ${resposta.error}. Schema mantido.`);
    return { sucesso: false, schema: schemaAtual, origem: 'inalterado', tentativas: 0, trace, avisos: [] };
  }

  const extraido = extrairJSON(resposta.output);
  if (!extraido.ok) {
    trace.push(`[Editor] Resposta inválida: ${extraido.erro}. Schema mantido.`);
    return { sucesso: false, schema: schemaAtual, origem: 'inalterado', tentativas: 1, trace, avisos: [] };
  }

  const validacao = validarSchema(extraido.valor);
  if (!validacao.valido) {
    trace.push(`[Editor] Schema rejeitado: ${validacao.erros[0]}. Schema mantido.`);
    return { sucesso: false, schema: schemaAtual, origem: 'inalterado', tentativas: 1, trace, avisos: [] };
  }

  trace.push(`[Editor] ✓ Ajuste aplicado via ${resposta.provider}.`);
  return {
    sucesso: true,
    schema: { ...extraido.valor, ...validacao.schema },
    origem: `IA (${resposta.provider})`,
    tentativas: 1,
    trace,
    avisos: validacao.avisos,
  };
}
