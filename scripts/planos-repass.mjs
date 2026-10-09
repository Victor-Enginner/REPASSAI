import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

// Preparação local: não cria cobrança, não altera assinaturas e não ativa planos.
const { values } = parseArgs({ options: {
  plano: { type: 'string' }, json: { type: 'boolean', default: false }, link: { type: 'string' }
} });
const catalog = JSON.parse(await readFile(new URL('../config/planos-repass.json', import.meta.url), 'utf8'));
const ids = new Set();
for (const plan of catalog.plans) {
  if (ids.has(plan.id) || !Number.isSafeInteger(plan.price_cents) || plan.price_cents < 0) throw new Error('Catálogo inválido.');
  ids.add(plan.id);
  for (const key of ['leads_month', 'sites_month']) {
    if (!Number.isSafeInteger(plan[key]) || plan[key] < 0) throw new Error(`Limite inválido: ${plan.id}/${key}`);
  }
}
const plans = values.plano ? catalog.plans.filter(plan => plan.id === values.plano) : catalog.plans;
if (!plans.length) throw new Error('Plano inválido. Use gratuito, starter, pro ou agencia.');
if (values.link) {
  const url = new URL(values.link);
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !(url.hostname === 'appmax.com.br' || url.hostname.endsWith('.appmax.com.br') ||
        (url.hostname === 'pay.finaliza.shop' && /^\/pl\/[a-z0-9]+$/.test(url.pathname) && !url.search && !url.hash)) ||
      url.hostname === 'admin.appmax.com.br' || url.hostname === 'docs.appmax.com.br') {
    throw new Error('Informe um link público HTTPS da Appmax, sem credenciais. O endereço admin não é um checkout.');
  }
  if (plans.length !== 1 || plans[0].price_cents === 0) throw new Error('Para conferir um link, selecione um plano pago com --plano.');
  console.log('Estrutura da URL aceita. Não verifica disponibilidade, valor, recorrência, titularidade nem pagamento.');
}
const format = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const records = plans.map(plan => ({
  internal_plan_id: plan.id,
  product_name: `REPASS AI — ${plan.name}`,
  price_cents: plan.price_cents,
  currency: catalog.currency,
  billing_interval: catalog.billing_interval,
  description: [
    plan.audience, `${plan.leads_month.toLocaleString('pt-BR')} leads por mês`,
    plan.all_categories ? 'Todas as categorias de negócio' : `${plan.categories_count} categorias de negócio`,
    `${plan.sites_month} sites por mês`,
    ...(plan.approach_scripts_month === null ? [] : [`${plan.approach_scripts_month} scripts de abordagem por mês`]),
    ...plan.features
  ].join('. ') + '.',
  digital_product: true,
  requires_gateway: plan.price_cents > 0
}));
if (values.json) console.log(JSON.stringify(records, null, 2));
else for (const product of records) {
  console.log(`\n${product.product_name}\nValor: ${format.format(product.price_cents / 100)}/mês\nDescrição: ${product.description}\nProduto digital: sim\n${product.requires_gateway ? 'Cobrança mensal recorrente: confirmar no módulo Assinaturas da Appmax.' : 'Gratuito: cadastro interno, sem link de cobrança.'}`);
}
