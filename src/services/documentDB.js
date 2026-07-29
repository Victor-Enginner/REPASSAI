/**
 * Persistência de sites — Supabase via backend.
 *
 * Substitui `src/mock/documentDB.js`, que gravava no `localStorage`. Aquele
 * mock tinha duas consequências caras em produção:
 *
 *   1. O cliente limpava o cache do navegador e perdia todos os sites.
 *   2. Um `projectId` no localStorage sem documento correspondente abria o
 *      editor vazio — a "tela cinza".
 *
 * O navegador não fala com o Postgres direto: o `schema.sql` revoga acesso de
 * `anon` e `authenticated` a todas as tabelas. Tudo passa pelo backend, que
 * usa a chave de serviço e filtra por `user_id`.
 *
 * Toda função aqui é assíncrona — ir à rede não tem como ser síncrono. As
 * telas usam `useEffect` + estado de carregamento.
 */

import { fetchAutenticado } from './authService';

const CHAVE_LEGADA = 'LEADSITE_DOCUMENTS_DB';
const CHAVE_MIGRACAO = 'REPASS_MIGRACAO_SITES_FEITA';

/** Erro de persistência com mensagem já pronta para a tela. */
export class ErroPersistencia extends Error {
  constructor(mensagem, status = 0) {
    super(mensagem);
    this.name = 'ErroPersistencia';
    this.status = status;
  }
}

/**
 * Traduz a resposta do backend, transformando falha em erro legível.
 *
 * @param {Response} res resposta do fetch
 * @param {string} acao verbo usado na mensagem de erro
 * @returns {Promise<object>} corpo JSON da resposta
 */
async function lerResposta(res, acao) {
  if (res.status === 401) {
    throw new ErroPersistencia('Sua sessao expirou. Entre novamente.', 401);
  }
  if (res.status === 404) {
    throw new ErroPersistencia('Este site nao existe mais.', 404);
  }
  if (!res.ok) {
    let mensagem = `Nao foi possivel ${acao} agora. Tente em instantes.`;
    try {
      const corpo = await res.json();
      if (corpo?.mensagem) mensagem = corpo.mensagem;
    } catch {
      // Resposta sem JSON: a mensagem padrão já serve.
    }
    throw new ErroPersistencia(mensagem, res.status);
  }
  return res.json();
}

/**
 * Lista os sites do usuário autenticado, mais recentes primeiro.
 *
 * @returns {Promise<Array<object>>}
 */
export async function listDocuments() {
  const res = await fetchAutenticado('/api/sites');
  const dados = await lerResposta(res, 'carregar seus sites');
  return dados.sites || [];
}

/**
 * Carrega um site pelo identificador do projeto.
 *
 * @param {string} projectId slug do projeto
 * @returns {Promise<object|null>} documento, ou null se não existir
 */
export async function getDocument(projectId) {
  if (!projectId) return null;
  const res = await fetchAutenticado(
    `/api/sites/detail?id=${encodeURIComponent(projectId)}`
  );
  try {
    const dados = await lerResposta(res, 'abrir este site');
    return dados.site || null;
  } catch (erro) {
    // "Não existe" é resposta válida, não falha: quem chama decide o que
    // mostrar. Antes isso virava tela cinza.
    if (erro.status === 404) return null;
    throw erro;
  }
}

/**
 * Salva (cria ou atualiza) um site e registra a versão.
 *
 * O número da versão é decidido pelo servidor — duas abas abertas não podem
 * gravar a mesma versão.
 *
 * @param {string} projectId slug do projeto
 * @param {object} documentSchema schema declarativo do site
 * @returns {Promise<object>} documento salvo
 */
export async function saveDocument(projectId, documentSchema) {
  const res = await fetchAutenticado('/api/sites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, schema: documentSchema }),
  });
  const dados = await lerResposta(res, 'salvar este site');
  return dados.site;
}

/**
 * Sobe para o Supabase os sites que ficaram no localStorage.
 *
 * Roda uma vez por navegador. O localStorage antigo NÃO é apagado: se a
 * migração falhar pela metade, o dado original continua lá para uma segunda
 * tentativa. Perder trabalho do cliente é pior que duplicar registro.
 *
 * @returns {Promise<{migrados: number, falhas: number}>}
 */
export async function migrarDoLocalStorage() {
  let bruto = null;
  try {
    if (localStorage.getItem(CHAVE_MIGRACAO)) return { migrados: 0, falhas: 0 };
    bruto = localStorage.getItem(CHAVE_LEGADA);
  } catch {
    return { migrados: 0, falhas: 0 };
  }
  if (!bruto) return { migrados: 0, falhas: 0 };

  let antigos = {};
  try {
    antigos = JSON.parse(bruto) || {};
  } catch {
    return { migrados: 0, falhas: 0 };
  }

  let migrados = 0;
  let falhas = 0;
  for (const [projectId, doc] of Object.entries(antigos)) {
    if (!projectId || !doc) continue;
    try {
      // `history` era do mock; o servidor mantém o próprio histórico.
      const { history, ...schema } = doc;
      await saveDocument(projectId, schema);
      migrados++;
    } catch {
      falhas++;
    }
  }

  if (falhas === 0) {
    try {
      localStorage.setItem(CHAVE_MIGRACAO, new Date().toISOString());
    } catch {
      // Sem localStorage a migração roda de novo — o upsert por slug
      // torna isso idempotente.
    }
  }
  return { migrados, falhas };
}

/**
 * Fachada com o mesmo nome do mock antigo, para não espalhar renomeação.
 * Diferença: todos os métodos agora devolvem Promise.
 */
export const DocumentDatabase = {
  listDocuments,
  getDocument,
  saveDocument,
  migrarDoLocalStorage,
};
