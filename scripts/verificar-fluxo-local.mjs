import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const base = 'http://127.0.0.1:3001';
try {
  const health = await page.request.get(`${base}/api/health`);
  const auth = await page.request.get(`${base}/api/auth/status`);
  console.log('API', JSON.stringify({ health: { status: health.status(), type: health.headers()['content-type'] }, auth: { status: auth.status(), type: auth.headers()['content-type'] } }));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
  await page.getByLabel('E-MAIL').waitFor({ state: 'visible', timeout: 10000 });
  console.log('LOGIN', JSON.stringify({
    email: await page.getByLabel('E-MAIL').isVisible(),
    acessoDireto: await page.getByText('Acessar Painel Direto').count(),
    modoDemo: await page.getByText('Entrar Modo Demo').count(),
  }));
  const semApi = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await semApi.route('**/api/auth/status', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<html>SPA</html>' }));
  await semApi.goto(base, { waitUntil: 'domcontentloaded' });
  await semApi.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
  await semApi.getByText('API indisponível. O acesso depende do servidor REPASS.').waitFor({ state: 'visible' });
  console.log('SEM_API', JSON.stringify({ aviso: await semApi.getByText('API indisponível. O acesso depende do servidor REPASS.').isVisible() }));
} finally {
  await browser.close();
}
