import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1360, height: 768 } });
  let loggedIn = true;
  let failLogout = false;
  let logoutRequests = 0;
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let status = 200;
    let data = { leads: [], sites: [] };
    if (path === '/api/auth/logout') {
      logoutRequests++;
      status = failLogout ? 503 : 200;
      data = { sucesso: !failLogout };
      if (!failLogout) loggedIn = false;
    } else if (path === '/api/auth/status') {
      data = { auth_ativo: true, configurado: true, usuario: loggedIn ? { id: 'synthetic-user' } : null, oauth_providers: ['google'] };
    }
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
  });
  await page.goto(process.env.AUDIT_URL || 'http://127.0.0.1:4183', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Sair da conta' }).waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Sair da conta' }).waitFor();
  failLogout = true;
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await page.getByRole('alert').filter({ hasText: 'Não foi possível sair' }).waitFor();
  assert.equal(loggedIn, true);
  failLogout = false;
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await page.getByRole('button', { name: /ACESSAR PAINEL/i }).first().waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.getByRole('button', { name: 'Sair da conta' }).count(), 0);
  assert.equal(logoutRequests, 2);
  console.log('PASS: F5 mantém sessão; saída falha é explícita; saída bem-sucedida não restaura conta após F5 (API simulada).');
} finally {
  await browser.close();
}
