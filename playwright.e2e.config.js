import { defineConfig, devices } from '@playwright/test';

// E2E_BASE_URL permite apontar a suíte para outro painel (ex.: reproduzir um bug
// contra uma build antiga numa porta paralela).
const BASE = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';

/**
 * Suíte e2e de jornada — separada da visual (playwright.config.js) porque
 * mede outra coisa: se o app FUNCIONA de ponta a ponta contra o backend
 * real, não se ele PARECE igual ao snapshot.
 *
 * Roda contra `npm run dev` (Vite :3000 + API :8000). Se já houver um
 * servidor na 3000 ele é reaproveitado — `scripts/dev.mjs` mata quem
 * estiver na porta, então não suba um segundo.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: BASE,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
