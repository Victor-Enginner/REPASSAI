import { chromium } from '@playwright/test';

const origin = 'https://repass-ai-beta.netlify.app';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
const page = await context.newPage();
const requests = [];
const errors = [];

page.on('response', async (response) => {
  if (!response.url().includes('/api/')) return;
  requests.push({ path: new URL(response.url()).pathname, status: response.status(), type: response.headers()['content-type'] || '' });
});
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text());
});

try {
  const health = await context.request.get(`${origin}/api/health`);
  const auth = await context.request.get(`${origin}/api/auth/status`);
  console.log('API', JSON.stringify({
    health: { status: health.status(), type: health.headers()['content-type'] },
    auth: { status: auth.status(), type: auth.headers()['content-type'] },
  }));

  await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('LANDING', JSON.stringify({ title: await page.title(), buttons: await page.getByRole('button').allTextContents() }));
  const entry = page.getByRole('button', { name: /ACESSAR PAINEL/i }).first();
  if (await entry.count()) await entry.click();
  await page.waitForTimeout(500);
  console.log('APOS_ENTRAR', JSON.stringify({ headings: await page.locator('h1, h2').allTextContents(), buttons: await page.getByRole('button').allTextContents(), text: (await page.locator('main').first().innerText().catch(() => '')).slice(0, 900) }));
  const demo = page.getByRole('button', { name: /Entrar Modo Demo/i }).first();
  if (await demo.count()) await demo.click();
  await page.waitForTimeout(1500);

  const menu = page.getByLabel('Navegação principal');
  console.log('MENU', JSON.stringify({ visible: await menu.isVisible().catch(() => false), items: await menu.getByRole('button').allTextContents().catch(() => []) }));
  const names = ['Painel', 'Prospector', 'Funil de Vendas', 'Abordagem 1-a-1', 'Motor Neural', 'Agenda', 'Meus Sites', 'Faturamento', 'Indicações', 'Loja de Templates', 'Criar Site'];
  for (const name of names) {
    const button = menu.getByRole('button', { name: new RegExp(name, 'i') }).first();
    if (!await button.count()) {
      console.log('ABA', JSON.stringify({ name, result: 'ausente' }));
      continue;
    }
    await button.click();
    await page.waitForTimeout(650);
    console.log('ABA', JSON.stringify({ name, heading: (await page.locator('main h1').first().textContent().catch(() => ''))?.trim(), crashed: await page.getByText('ESTA ABA FALHOU').count(), recentApi: requests.slice(-4) }));
  }
  console.log('ERRORS', JSON.stringify(errors.slice(0, 30)));
} finally {
  await browser.close();
}
