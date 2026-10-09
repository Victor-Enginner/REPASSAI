import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1360, height: 768 } });
  await page.route('**/api/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(new URL(route.request().url()).pathname === '/api/auth/status' ? { auth_ativo: true, configurado: true, usuario: { id: 'test-user' } } : { leads: [], sites: [] }) }));
  await page.goto('http://127.0.0.1:4188', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Atendimentos/ }).first().click();
  await page.getByRole('button', { name: /Barbearia Vintage Cuts/ }).click();
  const field = page.getByRole('textbox', { name: 'Escrever mensagem de demonstração' });
  await field.fill('Teste local do briefing');
  await field.press('Enter');
  await page.getByRole('log').getByText('Teste local do briefing', { exact: true }).waitFor();
  assert.ok(await page.getByRole('status').filter({ hasText: 'Nada foi enviado' }).count());
  await field.fill('Rascunho da barbearia');
  await page.getByRole('button', { name: /Oficina Mecânica Precision/ }).click();
  assert.equal(await field.inputValue(), '');
  await page.getByRole('button', { name: /Barbearia Vintage Cuts/ }).click();
  assert.equal(await field.inputValue(), 'Rascunho da barbearia');
  await page.screenshot({ path: 'docs/atendimentos-desktop.png', fullPage: true });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.screenshot({ path: 'docs/atendimentos-dark.png', fullPage: true });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  for (const [width, height] of [[390,844],[768,1024],[1360,768],[1920,1080]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(350);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    const rect = await field.boundingBox();
    await page.screenshot({ path: `docs/atendimentos-${width}.png`, fullPage: true });
    assert.ok(rect && rect.y >= 0 && rect.y + rect.height < height, 'Composer deve permanecer visível: ' + JSON.stringify({ width, height, rect }));
    if (width === 390) {
      await page.screenshot({ path: 'docs/atendimentos-mobile.png', fullPage: true });
      await page.getByRole('button', { name: 'Voltar às conversas' }).click();
      await page.getByRole('textbox', { name: 'Buscar conversa' }).fill('Não existe');
      await page.getByText('Nenhuma conversa encontrada.').waitFor();
      await page.getByRole('textbox', { name: 'Buscar conversa' }).fill('Barbearia');
      await page.getByRole('button', { name: /Barbearia Vintage Cuts/ }).click();
    }
  }
  console.log('PASS: simulação explícita, rascunhos por contato, busca, voltar no mobile e layout em 4 tamanhos; API simulada.');
} finally { await browser.close(); }
