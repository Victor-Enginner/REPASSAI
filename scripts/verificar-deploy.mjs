import { chromium } from 'playwright';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('https://repass-ai-beta.netlify.app/', { waitUntil: 'domcontentloaded' });
  const entry = page.getByRole('button', { name: /ACESSAR PAINEL/i }).first();
  await entry.waitFor({ timeout: 60000 });
  await entry.click();
  await page.getByRole('textbox').first().waitFor({ timeout: 30000 });
  await page.screenshot({ path: join(tmpdir(), 'repass-deploy-login.png') });
  console.log(JSON.stringify({ landing: 'OK', login: 'OK', errors }));
} finally {
  await browser.close();
}
