import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.AUDIT_URL || 'http://127.0.0.1:4181';
const out = 'test-results/responsivo-login';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
let failed = false;
try {
  for (const [width, height] of [[320, 700], [390, 844], [768, 1024], [1024, 768], [1360, 768], [1920, 1080]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await page.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ auth_ativo: true, configurado: true, usuario: null, oauth_providers: ['google', 'github'] }) }));
    await page.goto(base, { waitUntil: 'networkidle' });
    const nestedScrollers = await page.evaluate(() => [...document.querySelectorAll('body, body *')]
      .filter(el => el.scrollHeight > el.clientHeight + 1 && ['auto', 'scroll'].includes(getComputedStyle(el).overflowY)).length);
    console.log(JSON.stringify({ width, landingNestedScrollers: nestedScrollers }));
    failed ||= nestedScrollers > 0;
    await page.screenshot({ path: `${out}/${width}-landing.png` });
    await page.getByRole('button', { name: /ACESSAR PAINEL/i }).first().click();
    await page.getByRole('button', { name: /Continuar com Google/ }).waitFor();
    const checks = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      icons: [...document.querySelectorAll('button')].filter(b => b.textContent.includes('Continuar com')).every(b => b.querySelector('svg')),
      dockOnLogin: !!document.querySelector('nav[aria-label="Ações rápidas"]'),
    }));
    await page.screenshot({ path: `${out}/${width}-login.png`, fullPage: true });
    console.log(JSON.stringify({ width, height, ...checks }));
    failed ||= checks.overflow || !checks.icons || checks.dockOnLogin;
    await page.close();
  }
  const session = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await session.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(
    route.request().url().includes('/auth/status')
      ? { auth_ativo: true, configurado: true, usuario: { id: 'test-session', email: 'test@example.invalid' }, oauth_providers: ['google', 'github'] }
      : { leads: [], sites: [] }
  ) }));
  await session.goto(base, { waitUntil: 'networkidle' });
  await session.reload({ waitUntil: 'networkidle' });
  const loginAfterReload = await session.getByRole('button', { name: /Continuar com Google/ }).count();
  const landingAfterReload = await session.getByRole('button', { name: /ACESSAR PAINEL/i }).count();
  console.log(JSON.stringify({ restoredAuthenticatedUI: !loginAfterReload && !landingAfterReload, simulatedSession: true }));
  failed ||= !!loginAfterReload || !!landingAfterReload;
  await session.close();
} finally { await browser.close(); }
if (failed) process.exitCode = 1;
