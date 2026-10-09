import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto('http://127.0.0.1:4179/?audit=leads', { waitUntil: 'domcontentloaded' });
  const motor = page.locator('[data-sidebar-item="fluxos"]');
  await motor.waitFor();
  await page.locator('aside.sidebar-container').screenshot({ path: join(tmpdir(), 'repass-sidebar-drag-preview.png') });
  const heading = page.locator('[data-sidebar-section="suite"] [data-sidebar-heading]');
  await motor.scrollIntoViewIfNeeded();
  const start = await motor.boundingBox();
  assert.ok(start, 'Agentes IA precisa estar visível');
  await page.mouse.move(start.x + 40, start.y + start.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(380);
  const end = await heading.boundingBox();
  assert.ok(end, 'Seção principal precisa estar visível');
  await page.mouse.move(end.x + 35, end.y + end.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(250);

  const suiteOrder = await page.locator('[data-sidebar-section="suite"] [data-sidebar-item]')
    .evaluateAll(items => items.map(item => item.dataset.sidebarItem));
  assert.ok(suiteOrder.includes('fluxos'), `Motor não foi movido para a suíte: ${suiteOrder.join(', ')}`);
  assert.equal(await page.locator('[data-sidebar-section="ia"] [data-sidebar-item="fluxos"]').count(), 0);
  assert.equal(await motor.getAttribute('aria-current'), null, 'Soltar não deve abrir a aba');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await motor.waitFor();
  const savedOrder = await page.locator('[data-sidebar-section="suite"] [data-sidebar-item]')
    .evaluateAll(items => items.map(item => item.dataset.sidebarItem));
  assert.deepEqual(savedOrder, suiteOrder, 'Ordem personalizada não persistiu após recarregar');
  await page.getByRole('button', { name: 'Restaurar' }).click();
  assert.equal(await page.locator('[data-sidebar-section="ia"] [data-sidebar-item="fluxos"]').count(), 1);
  await motor.focus();
  await page.keyboard.press('Alt+Shift+ArrowUp');
  assert.equal(await page.locator('[data-sidebar-section="suite"] [data-sidebar-item="fluxos"]').count(), 1,
    'Atalho de teclado não moveu a aba entre seções');
  await motor.click();
  assert.equal(await motor.getAttribute('aria-current'), 'page', 'Clique normal precisa continuar navegando');
  console.log('Sidebar: arrastar, persistir, restaurar, teclado e clique — OK');
  const mobile = await browser.newPage({ viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true });
  await mobile.goto('http://127.0.0.1:4179/?audit=leads', { waitUntil: 'domcontentloaded' });
  await mobile.getByRole('button', { name: 'Abrir menu de navegação' }).click();
  await mobile.waitForTimeout(350);
  await mobile.screenshot({ path: join(tmpdir(), 'repass-sidebar-glass-mobile.png') });
  const mobileMotor = mobile.locator('[data-sidebar-item="fluxos"]');
  await mobileMotor.scrollIntoViewIfNeeded();
  const grip = await mobileMotor.locator('[data-drag-handle]').boundingBox();
  const target = await mobile.locator('[data-sidebar-section="suite"] [data-sidebar-item="relatorios"]').boundingBox();
  const cdp = await mobile.context().newCDPSession(mobile);
  const touch = { x: grip.x + grip.width / 2, y: grip.y + grip.height / 2 };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch] });
  await mobile.waitForTimeout(380);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: target.x + 40, y: target.y + target.height / 2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mobile.waitForTimeout(250);
  assert.equal(await mobile.locator('[data-sidebar-section="suite"] [data-sidebar-item="fluxos"]').count(), 1);
  assert.equal(await mobileMotor.getAttribute('aria-current'), null);
  await mobile.getByRole('button', { name: 'Restaurar' }).click();
  await mobile.locator('[data-sidebar-item="dashboard"]').tap();
  assert.equal(await mobile.locator('aside').getAttribute('aria-hidden'), 'true');
  console.log('Mobile: alça touch, arraste entre seções e navegação — OK');
} finally {
  await browser.close();
}

