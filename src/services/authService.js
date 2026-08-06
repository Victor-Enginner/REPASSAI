/**
 * REPASS AI - Serviço de Autenticação (BFF + cookie HttpOnly).
 *
 * COMO FUNCIONA
 * -------------
 * 1. Login/cadastro/recuperar passam pelo backend (`/api/auth/*`).
 * 2. O backend autentica no Supabase e grava JWT em cookies HttpOnly
 *    (`repass_at`, `repass_rt`). JavaScript NÃO lê o token.
 * 3. Toda chamada à API usa `credentials: 'include'` para o browser
 *    enviar o cookie automaticamente.
 * 4. O backend valida o cookie e filtra tudo por `user_id`.
 *
 * A chave `service_role` NUNCA passa por aqui — ela fica só no servidor.
 * Tokens NÃO ficam em localStorage (XSS não rouba sessão).
 *
 * DEGRADAÇÃO ELEGANTE
 * -------------------
 * Com o Supabase desligado no backend, `estaAtivo()` devolve false e o app
 * roda single-user, como sempre rodou.
 */

import { apiUrl } from '../config.js';

const CHAVE_SESSAO_LEGADA = 'repass_sessao';

let configCache = null;

/** Opções padrão: envia cookies cross-origin para a API. */
const COM_CREDENCIAIS = { credentials: 'include' };

/**
 * Busca a configuração de auth no backend (uma vez por sessão).
 * @returns {Promise<object>}
 */
export async function obterConfig() {
  if (configCache) return configCache;
  try {
    const res = await fetch(apiUrl('/api/auth/status'), COM_CREDENCIAIS);
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

/**
 * @deprecated Sessão não vive mais no JS. Mantido por compat: sempre null.
 * @returns {null}
 */
export function obterSessao() {
  return null;
}

/**
 * @deprecated Cookies HttpOnly viajam sozinhos. Mantido para callers legados.
 * @returns {object}
 */
export function cabecalhoAuth() {
  return {};
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

async function postAuth(caminho, corpo) {
  const res = await fetch(apiUrl(caminho), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo || {}),
  });
  const dados = await res.json().catch(() => ({}));
  if (!res.ok || dados.sucesso === false) {
    throw new Error(dados.erro || dados.mensagem || `HTTP ${res.status}`);
  }
  return dados;
}

/**
 * Entra com e-mail e senha. Sessão fica só em cookie HttpOnly.
 * @returns {Promise<object>} usuário autenticado
 */
export async function entrar(email, senha) {
  limparSessaoLegada();
  const dados = await postAuth('/api/auth/login', {
    email: String(email || '').trim(),
    password: senha,
  });
  limparCacheConfig();
  return dados.usuario || null;
}

/**
 * Captura tokens do hash (link de confirmação de e-mail) e troca por cookie.
 * Os tokens passam só na memória desta chamada — nunca no localStorage.
 * @returns {Promise<object|null>}
 */
export async function capturarSessaoUrlHash() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) return null;

  try {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token') || '';
    const expires_in = params.get('expires_in');

    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (!access_token) return null;

    const dados = await postAuth('/api/auth/session', {
      access_token,
      refresh_token,
      expires_in: parseInt(expires_in, 10) || 3600,
    });
    limparCacheConfig();
    limparSessaoLegada();
    return dados.usuario || { ok: true };
  } catch {
    return null;
  }
}

/**
 * Cria conta via BFF.
 * @returns {Promise<{precisaConfirmar: boolean}>}
 */
export async function cadastrar(email, senha) {
  limparSessaoLegada();
  const redirectUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://repassai.vercel.app';

  const dados = await postAuth('/api/auth/signup', {
    email: String(email || '').trim(),
    password: senha,
    redirect_to: redirectUrl,
  });
  limparCacheConfig();
  return { precisaConfirmar: Boolean(dados.precisaConfirmar) };
}

/**
 * Solicita redefinição de senha por e-mail.
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function recuperarSenha(email) {
  const redirectUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://repassai.vercel.app';
  await postAuth('/api/auth/recover', {
    email: String(email || '').trim(),
    redirect_to: redirectUrl,
  });
}

/** Encerra a sessão (apaga cookies no servidor). */
export async function sair() {
  try {
    await postAuth('/api/auth/logout', {});
  } catch {
    // Mesmo se a rede falhar, limpa cache local.
  }
  limparSessaoLegada();
  limparCacheConfig();
}

/** Remove JWT legado do localStorage (migração one-shot). */
export function limparSessaoLegada() {
  try {
    localStorage.removeItem(CHAVE_SESSAO_LEGADA);
  } catch {
    // storage bloqueado
  }
}

/**
 * `fetch` autenticado para a API do REPASS AI.
 * Cookie HttpOnly é enviado pelo browser via credentials:include.
 */
export async function fetchAutenticado(caminho, opcoes = {}) {
  return fetch(apiUrl(caminho), {
    ...opcoes,
    credentials: 'include',
    headers: {
      ...(opcoes.headers || {}),
    },
  });
}
