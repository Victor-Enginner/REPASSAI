// ─────────────────────────────────────────────────────────────────────────────
// Configuracao publica da landing. Nada de segredo aqui: este arquivo vai
// inteiro para o navegador.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * URL do painel do REPASS AI.
 *
 * Enquanto for `null`, todos os CTAs "Acessar painel" ficam inertes em vez de
 * apontar para um endereco que nao resolve. O projeto ja enviou `sobresite.io`
 * e `cdn.repass.ai` para clientes, ambos NXDOMAIN -- por isso o padrao aqui e
 * nao ter link, e nao ter um link chutado.
 *
 * Troque por uma URL real (ex.: a `.vercel.app` do deploy, ou o dominio
 * proprio quando existir) e os botoes voltam a funcionar sozinhos.
 */
export const URL_PAINEL: string | null = null

/**
 * Tabela de planos. Os valores e limites ainda nao foram definidos pelo dono,
 * entao a secao aparece marcada como placeholder. Vire `true` somente depois
 * de montar a grade com os precos reais.
 */
export const PRECOS_DEFINIDOS = false
