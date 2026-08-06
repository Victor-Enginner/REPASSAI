import { expect, test } from '@playwright/test';

async function abrirScanner(page, viewport) {
  await page.route(/\.(woff2?|ttf|otf)(\?.*)?$/i, (route) => route.abort());

  await page.addInitScript(() => {
    localStorage.setItem('repass_theme', 'light');
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
  await page.getByRole('button', { name: 'Entrar Modo Demo →', exact: true }).click();

  if (viewport.width <= 1024) {
    await page.getByRole('button', { name: 'Leads', exact: true }).click();
  } else {
    await page.getByRole('button', { name: 'Scanner de Leads OSINT 02', exact: true }).click();
  }

  await expect(page.getByRole('heading', { name: 'SCANNER DE LEADS OSINT' })).toBeVisible();
  await expect(page.locator('article[aria-label^="Lead:"]')).toHaveCount(15);

  // Remove apenas fontes de instabilidade visual. Não muda layout, medidas,
  // cores ou conteúdo da tela aprovada.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
      .cursor-personalizado { display: none !important; }
    `,
  });
}

test.describe('Tela de Leads aprovada', () => {
  test('controles e terminal — tema claro', async ({ page }, testInfo) => {
    await abrirScanner(page, testInfo.project.use.viewport);

    await expect(page.getByTestId('leads-controls')).toHaveScreenshot(
      'leads-controles-claro.png',
    );
  });

  test('cards — temas claro e escuro', async ({ page }, testInfo) => {
    await abrirScanner(page, testInfo.project.use.viewport);
    const grid = page.getByTestId('leads-grid');

    await grid.scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('leads-cards-claro.png');

    if (testInfo.project.use.viewport.width <= 1024) {
      await page.getByRole('button', { name: 'Abrir menu de navegação', exact: true }).click();
    }
    await page.getByRole('button', { name: 'MODO CLARO ALTERAR', exact: true }).click();
    if (testInfo.project.use.viewport.width <= 1024) {
      await page.getByRole('button', { name: 'Fechar menu de navegação', exact: true }).click();
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await grid.scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('leads-cards-escuro.png');
  });
});
