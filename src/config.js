/**
 * REPASS AI - Configuração de ambiente do frontend.
 *
 * A URL do backend nunca deve estar gravada no código: `localhost:8000`
 * funciona na máquina do dev e quebra todo o app assim que vai para a
 * Vercel. Defina VITE_API_BASE no ambiente do deploy.
 */

/**
 * Lê uma variável de ambiente do Vite de forma segura.
 *
 * `import.meta.env` só existe sob o bundler. Em Node puro (testes,
 * scripts) é undefined, e acessá-lo direto lançava TypeError. Aqui caímos
 * para process.env, o que mantém os módulos testáveis fora do Vite.
 */
function envVar(nome, padrao = '') {
  const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
  if (viteEnv && viteEnv[nome]) return viteEnv[nome];
  if (typeof process !== 'undefined' && process.env && process.env[nome]) {
    return process.env[nome];
  }
  return padrao;
}

/** URL base do backend REPASS AI, sem barra no final. */
export const API_BASE = envVar('VITE_API_BASE', 'http://localhost:8000').replace(/\/$/, '');

/**
 * Monta uma URL de endpoint da API.
 * @param {string} path Caminho iniciado por barra, ex: '/api/leads/scan'
 * @returns {string} URL absoluta
 */
export function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Domínio onde os sites gerados são publicados.
 *
 * Fica vazio de propósito enquanto o motor de deploy (Sprint 4) não
 * existir. Enquanto for vazio, a UI não deve exibir nem enviar link
 * público — hoje o "deploy" apenas baixa o HTML localmente.
 */
export const DEPLOY_DOMAIN = envVar('VITE_DEPLOY_DOMAIN', '');

/** Indica se já existe destino real de publicação configurado. */
export const deployHabilitado = () => Boolean(DEPLOY_DOMAIN);

/**
 * Monta a URL pública de um site publicado.
 * @param {string} slug Identificador do site
 * @returns {string|null} URL pública, ou null se o deploy não está ativo
 */
export function urlPublicaDoSite(slug) {
  if (!deployHabilitado()) return null;
  const limpo = (slug || 'site').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://${limpo}.${DEPLOY_DOMAIN}`;
}
