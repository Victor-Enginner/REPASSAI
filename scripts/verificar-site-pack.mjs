import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const report = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', error => console.log('Preview/page error:', error.message.slice(0, 400)));
  page.on('console', message => { if (message.type() === 'error' && /three|Content Security|WebGL|shader/i.test(message.text())) console.log('Preview diagnostic:', message.text().slice(0, 400)); });
  await page.route('**/api/**', route => {
    const pathname = new URL(route.request().url()).pathname;
    const data = pathname === '/api/auth/status'
      ? { auth_ativo: true, configurado: true, usuario: { id: 'qa-synthetic' }, oauth_providers: [] }
      : { templates: [], leads: [], sites: [] };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });
  await page.goto('http://127.0.0.1:4188', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('button', { name: /Loja de Templates/ }).first().click();
  await page.getByRole('button', { name: /Site Pack · 14/ }).click();
  await page.locator('section[aria-label="Site Pack em validação"] article').first().waitFor();
  assert.equal(await page.locator('section[aria-label="Site Pack em validação"] article').count(), 14);
  await page.getByRole('button', { name: 'Ver análise técnica' }).first().click();
  await page.getByRole('status').filter({ hasText: 'Preview pendente' }).waitFor();
  await page.getByRole('button', { name: 'Voltar aos projetos' }).click();
  await page.getByRole('button', { name: 'Visualizar e conferir' }).click();
  const frameElement = page.locator('iframe[title^="Preview Background"]');
  assert.equal(await frameElement.getAttribute('sandbox'), 'allow-scripts');
  for (const [name, width, height] of [['Mobile',390,844],['Tablet',768,1024],['Notebook',1360,768],['Desktop',1920,1080]]) {
    await page.setViewportSize({ width, height });
    await page.getByRole('button', { name: new RegExp(`^${name} ·`) }).click();
    await page.waitForTimeout(1500);
    const bounds = await frameElement.boundingBox();
    assert.equal(Math.round(bounds.width), width);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, `Overflow do REPASS em ${name}`);
    const frame = await frameElement.elementHandle().then(h => h.contentFrame());
    await frame.getByText('ANIMMASTER', { exact: true }).waitFor();
    await frame.locator('canvas').waitFor({ timeout: 20000 });
    const render = await frame.evaluate(() => ({ canvas: document.querySelectorAll('canvas').length, overflow: document.documentElement.scrollWidth > innerWidth + 1 }));
    assert.equal(render.overflow, false, `Overflow do template em ${name}`);
    report.push({ dispositivo: name, width, height, ...render, observado: 'Preview experimental; aprovação visual pendente' });
    await page.screenshot({ path: `docs/site-pack-${name.toLowerCase()}.png`, fullPage: true });
  }
  await fs.writeFile('docs/QA_SITE_PACK_2026-10-05.json', JSON.stringify({ api: 'simulada; não valida produção', projetos_listados: 14, nextjs_pendentes: 13, preview_html: report }, null, 2));
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
