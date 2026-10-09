import { chromium } from '@playwright/test';

const base = process.argv[2];
if (!base?.startsWith('https://')) throw new Error('Informe a URL HTTPS da prévia Netlify.');

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 412, height: 915 }]) {
    const page = await browser.newPage({ viewport, locale: 'pt-BR', reducedMotion: 'reduce' });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).waitFor({ state: 'visible', timeout: 20000 });
    await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
    await page.getByLabel('E-MAIL').waitFor({ state: 'visible', timeout: 20000 });
    console.log(JSON.stringify({ viewport: `${viewport.width}x${viewport.height}`, loginVisible: true, bypassVisible: await page.getByText('Entrar Modo Demo').count() > 0 || await page.getByText('Acessar Painel Direto').count() > 0, pageErrors }));
    await page.close();
  }
} finally {
  await browser.close();
}
