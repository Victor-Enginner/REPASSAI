/**
 * REPASS AI - Cliente do Motor Neural.
 *
 * MUDANÇA DE ARQUITETURA
 * ----------------------
 * Antes este arquivo chamava OpenRouter/Groq/Gemini direto do navegador,
 * com as chaves digitadas pelo usuário. Isso tinha três problemas:
 *
 *   1. A chave trafegava no navegador e aparecia no DevTools → Network.
 *      Num SaaS multi-tenant, qualquer cliente veria a chave.
 *   2. O cliente descobria qual modelo estava sendo usado.
 *   3. Sem rotação de chaves, um 429 derrubava a geração.
 *
 * Agora tudo isso vive em `backend/llm_gateway.py`. Este módulo só fala com
 * o nosso próprio backend e recebe texto puro. O frontend não sabe — e não
 * deve saber — qual provedor ou modelo respondeu.
 *
 * SEGURANÇA
 * ---------
 * O system prompt NÃO sai do navegador. O cliente manda só `modo` (allowlist
 * no servidor). Qualquer `system_prompt` no body é ignorado pelo backend.
 */

import { apiUrl } from '../config.js';
import { fetchAutenticado } from './authService.js';

/** Modos aceitos pelo backend (espelho de SYSTEM_PROMPTS em app_api.py). */
export const MODOS_IA = Object.freeze({
  SCHEMA_SITE: 'schema_site',
  COPY_COMERCIAL: 'copy_comercial',
  ASSISTENTE: 'assistente',
  CHAT: 'chat',
  SCHEMA_FALLBACK: 'schema_fallback',
});

/**
 * Executa um prompt no motor de IA do servidor.
 *
 * @param {string} prompt
 * @param {string} [modoOuSystemLegado] Modo allowlisted (`schema_site`, `chat`…).
 *        Strings longas legadas (antigo system prompt) caem em `assistente`.
 * @param {object} [_configLegado] Ignorado. Mantido para não quebrar
 *        chamadas antigas que passavam configuração de provedores.
 * @param {object} [opcoes]
 * @param {number} [opcoes.temperature=0] 0 = determinístico (padrão do
 *        gerador de schema; o mesmo prompt sempre produz o mesmo site).
 * @param {string} [opcoes.modo] Sobrescreve o modo quando o 2º arg é legado.
 * @returns {Promise<{success:boolean, provider:string|null, model:string|null,
 *          output:string, error?:string, logs:string[]}>}
 */
export async function executePromptWithFallback(
  prompt,
  modoOuSystemLegado = MODOS_IA.ASSISTENTE,
  _configLegado = null,
  opcoes = {}
) {
  const temperature = typeof opcoes.temperature === 'number' ? opcoes.temperature : 0;
  const logs = ['Consultando o motor neural do REPASS AI...'];
  const modo = resolverModo(opcoes.modo || modoOuSystemLegado);

  try {
    const res = await fetchAutenticado('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, modo, temperature }),
    });

    const dados = await res.json().catch(() => ({}));

    if (!res.ok || !dados.sucesso) {
      const erro = dados.erro || `Motor indisponível (HTTP ${res.status}).`;
      return {
        success: false,
        provider: null,
        model: null,
        output: '',
        error: erro,
        logs: [...logs, `Falha: ${erro}`],
      };
    }

    return {
      success: true,
      // Provedor e modelo ficam no servidor de propósito. O rótulo genérico
      // é o que a interface mostra.
      provider: 'REPASS Neural Engine',
      model: 'auto',
      output: dados.texto || '',
      logs: [...logs, 'Resposta recebida.'],
    };
  } catch (err) {
    const erro = `Backend REPASS AI inacessível: ${err.message}`;
    return {
      success: false,
      provider: null,
      model: null,
      output: '',
      error: erro,
      logs: [...logs, erro],
    };
  }
}

/**
 * Aceita modo curto ou string legada (antigo system prompt do front).
 * @param {unknown} valor
 * @returns {string}
 */
function resolverModo(valor) {
  if (typeof valor !== 'string' || !valor.trim()) return MODOS_IA.ASSISTENTE;
  const chave = valor.trim().toLowerCase();
  const permitidos = new Set(Object.values(MODOS_IA));
  if (permitidos.has(chave)) return chave;
  // Chamadas antigas passavam o system prompt inteiro no 2º argumento.
  return MODOS_IA.ASSISTENTE;
}

/**
 * Consulta o status do motor, sem revelar provedores ou modelos.
 *
 * @returns {Promise<{motores_configurados:number, motores_prontos:number,
 *          chaves_em_rotacao:number, operacional:boolean}>}
 */
export async function obterStatusDoMotor() {
  try {
    const res = await fetch(apiUrl('/api/ai/status'));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      motores_configurados: 0,
      motores_prontos: 0,
      chaves_em_rotacao: 0,
      operacional: false,
    };
  }
}
