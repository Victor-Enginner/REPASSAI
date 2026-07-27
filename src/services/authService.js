/**
 * REPASS AI - Serviço de Autenticação.
 *
 * Fala direto com a API de auth do Supabase (REST puro, sem SDK — evita
 * +80KB no bundle por algo que são três chamadas HTTP).
 *
 * COMO FUNCIONA
 * -------------
 * 1. O backend informa em `/api/auth/status` se o modo multiusuário está
 *    ligado, junto com a URL e a chave ANON (ambas públicas por natureza).
 * 2. O login acontece contra o Supabase e devolve um `access_token` (JWT).
 * 3. O token é guardado e enviado em toda chamada à API do REPASS AI.
 * 4. O backend valida o token e filtra tudo por `user_id`.
 *
 * A chave `service_role` NUNCA passa por aqui — ela fica só no servidor.
 *
 * DEGRADAÇÃO ELEGANTE
 * -------------------
 * Com o Supabase desligado no backend, `estaAtivo()` devolve false e o app
 * roda single-user, como sempre rodou. Nada de tela de login no caminho.
 */

import { apiUrl } from '../config.js';

const CHAVE_SESSAO = 'repass_sessao';

let configCache = null;

/**
 * Busca a configuração de auth no backend (uma vez por sessão).
 * @returns {Promise<object>}
 */
export async function obterConfig() {
  if (configCache) return configCache;
  try {
    const res = await fetch(apiUrl('/api/auth/status'), { headers: cabecalhoAuth() });
    configCache = await res.json();
  } catch {
    configCache = { configurado: false, auth_ativo: false, modo: 'single_user', usuario: null };
  }
  return configCache;
}

/** Força nova leitura da configuração (após login/logout). */
export function limparCacheConfig() {
  configCache = null;
}

/** Sessão salva localmente, ou null. */
export function obterSessao() {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    if (!bruto) return null;
    const sessao = JSON.parse(bruto);
    // Token expirado é o mesmo que não ter sessão.
    if (sessao?.expires_at && Date.now() / 1000 > sessao.expires_at) {
      localStorage.removeItem(CHAVE_SESSAO);
      return null;
    }
    return sessao;
  } catch {
    return null;
  }
}

function salvarSessao(sessao) {
  try {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  } catch {
    // Sem localStorage (aba anônima restrita): a sessão vale só em memória.
  }
  limparCacheConfig();
}

/**
 * Header de autorização para chamadas à API do REPASS AI.
 * @returns {object} vazio quando não há sessão
 */
export function cabecalhoAuth() {
  const sessao = obterSessao();
  return sessao?.access_token ? { Authorization: `Bearer ${sessao.access_token}` } : {};
}

/** True se o modo multiusuário está ligado no servidor. */
export async function estaAtivo() {
  const cfg = await obterConfig();
  return Boolean(cfg.auth_ativo);
}

/** Usuário logado (do backend), ou null. */
export async function usuarioAtual() {
  const cfg = await obterConfig();
  return cfg.usuario || null;
}

async function chamarSupabaseAuth(caminho, corpo) {
  const cfg = await obterConfig();
  if (!cfg.auth_ativo) {
    throw new Error('Modo multiusuário não está ativo no servidor.');
  }

  const res = await fetch(`${cfg.supabase_url}/auth/v1/${caminho}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: cfg.supabase_anon_key,
    },
    body: JSON.stringify(corpo),
  });

  const dados = await res.json().catch(() => ({}));

  if (!res.ok) {
    // O Supabase devolve a mensagem em campos diferentes por endpoint.
    const msg = dados.error_description || dados.msg || dados.message || `HTTP ${res.status}`;
    throw new Error(traduzirErro(msg));
  }
  return dados;
}

/** Traduz as mensagens mais comuns do Supabase para português. */
function traduzirErro(msg) {
  const m = String(msg).toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (m.includes('user already registered')) return 'Este e-mail já tem cadastro.';
  if (m.includes('password should be at least')) return 'A senha precisa ter ao menos 6 caracteres.';
  if (m.includes('unable to validate email')) return 'E-mail inválido.';
  return msg;
}

/**
 * Entra com e-mail e senha.
 * @returns {Promise<object>} usuário autenticado
 */
export async function entrar(email, senha) {
  const dados = await chamarSupabaseAuth('token?grant_type=password', {
    email: email.trim(),
    password: senha,
  });

  salvarSessao({
    access_token: dados.access_token,
    refresh_token: dados.refresh_token,
    expires_at: dados.expires_at,
    user: dados.user,
  });

  return dados.user;
}

/**
 * Captura tokens vindos no hash da URL (quando o usuário clica no link de confirmação do e-mail).
 */
export function capturarSessaoUrlHash() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) return null;

  try {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expires_in = params.get('expires_in');

    if (access_token) {
      const sessao = {
        access_token,
        refresh_token: refresh_token || '',
        expires_at: Math.floor(Date.now() / 1000) + (parseInt(expires_in, 10) || 3600),
        user: null
      };
      salvarSessao(sessao);
      // Limpa a hash da URL sem dar reload
      window.history.replaceState(null, '', window.location.pathname);
      return sessao;
    }
  } catch {
    // ignora erro de parse
  }
  return null;
}

/**
 * Cria conta. Passa o emailRedirectTo dinâmico (window.location.origin) para
 * que o link de confirmação do e-mail nunca redirecione pro localhost incorreto.
 *
 * @returns {Promise<{precisaConfirmar: boolean}>}
 */
export async function cadastrar(email, senha) {
  const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'https://repassai.vercel.app';
  
  const dados = await chamarSupabaseAuth('signup', {
    email: email.trim(),
    password: senha,
    options: {
      emailRedirectTo: redirectUrl
    }
  });

  // Com confirmação de e-mail ligada, o signup não devolve token.
  if (dados.access_token) {
    salvarSessao({
      access_token: dados.access_token,
      refresh_token: dados.refresh_token,
      expires_at: dados.expires_at,
      user: dados.user,
    });
    return { precisaConfirmar: false };
  }

  return { precisaConfirmar: true };
}

/**
 * Solicita redefinição de senha por e-mail no Supabase.
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function recuperarSenha(email) {
  const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'https://repassai.vercel.app';
  await chamarSupabaseAuth('recover', {
    email: email.trim(),
    options: {
      emailRedirectTo: redirectUrl
    }
  });
}

/** Encerra a sessão local. */
export function sair() {
  try {
    localStorage.removeItem(CHAVE_SESSAO);
  } catch {
    // ignora
  }
  limparCacheConfig();
}

/**
 * `fetch` autenticado para a API do REPASS AI.
 *
 * Anexa o header de sessão quando existe. Use no lugar do fetch direto em
 * qualquer rota que dependa de usuário.
 */
export async function fetchAutenticado(caminho, opcoes = {}) {
  return fetch(apiUrl(caminho), {
    ...opcoes,
    headers: {
      ...(opcoes.headers || {}),
      ...cabecalhoAuth(),
    },
  });
}
