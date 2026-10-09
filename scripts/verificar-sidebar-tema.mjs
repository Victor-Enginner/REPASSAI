import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:4179/?audit=leads');
  const sidebar = page.locator('aside.repass-glass');
  await sidebar.waitFor();
  const theme = () => page.locator('html').getAttribute('data-theme');
  const color = () => sidebar.evaluate(el => getComputedStyle(el).getPropertyValue('--sidebar-glass-text').trim());
  if (await theme() === 'dark') await sidebar.getByTitle('Modo Claro').click();
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  assert.equal(await color(), '#19283b');
  await sidebar.screenshot({ path: join(tmpdir(), 'repass-sidebar-light.png') });
  await sidebar.getByTitle('Modo Escuro').click();
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  assert.equal(await color(), '#edf3fc');
  await page.reload();
  await sidebar.waitFor();
  assert.equal(await theme(), 'dark');
  assert.equal(await color(), '#edf3fc');
  await sidebar.screenshot({ path: join(tmpdir(), 'repass-sidebar-dark.png') });
  console.log('Tema da sidebar: claro, escuro e persistência — OK');
} finally { await browser.close(); }
