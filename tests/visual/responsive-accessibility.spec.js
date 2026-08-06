import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const tamanhos = [375, 768, 1024, 1440];

async function abrirLeads(page) {
  await page.route('**/api/logs/stream', (route) => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
  await page.getByRole('button', { name: 'Entrar Modo Demo →', exact: true }).click();

  if ((page.viewportSize()?.width || 1440) <= 1024) {
    await page.getByRole('button', { name: 'Leads', exact: true }).click();
  } else {
    await page.getByRole('button', { name: 'Scanner de Leads OSINT 02', exact: true }).click();
  }
  await expect(page.getByTestId('leads-controls')).toBeVisible();
}

test.describe('Responsividade e acessibilidade', () => {
  for (const largura of tamanhos) {
    test(`${largura}px sem vazamento e com conteúdo acessível`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: largura <= 768 ? 900 : 1000 });
      await abrirLeads(page);

      const medidas = await page.evaluate(() => {
        const interativos = [...document.querySelectorAll('button, a[href], input, select, textarea')]
          .filter((el) => {
            const estilo = getComputedStyle(el);
            const caixa = el.getBoundingClientRect();
            return estilo.display !== 'none' && estilo.visibility !== 'hidden'
              && caixa.width > 0 && caixa.height > 0;
          })
          .map((el) => {
            const alvo = el.matches('input[type="checkbox"], input[type="radio"]') && el.closest('label')
              ? el.closest('label')
              : el;
            const caixa = alvo.getBoundingClientRect();
            return {
              nome: el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 40) || el.tagName,
              largura: caixa.width,
              altura: caixa.height,
            };
          });
        return {
          documento: document.documentElement.scrollWidth,
          viewport: document.documentElement.clientWidth,
          pequenos: interativos.filter((el) => el.largura < 44 || el.altura < 44),
        };
      });

      expect(medidas.documento).toBeLessThanOrEqual(medidas.viewport);
      if (largura <= 1024) expect(medidas.pequenos).toEqual([]);

      for (const rotulo of ['País', 'Estado', 'Cidade', 'Nicho para Varredura (Selecione na Lista)']) {
        await expect(page.getByLabel(rotulo, { exact: true })).toHaveCount(1);
      }

      if (largura === 375) {
        const cards = page.locator('article[aria-label^="Lead:"]');
        await expect(cards).toHaveCount(15);
        const caixas = await cards.evaluateAll((itens) => itens.slice(0, 2).map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, width: r.width };
        }));
        expect(Math.abs(caixas[0].x - caixas[1].x)).toBeLessThan(2);
        expect(caixas[0].width).toBeLessThanOrEqual(375);

        const ultimo = cards.last();
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        const dock = page.getByRole('navigation', { name: 'Ações rápidas' });
        const [caixaUltimo, caixaDock] = await Promise.all([ultimo.boundingBox(), dock.boundingBox()]);
        expect(caixaUltimo.y + caixaUltimo.height).toBeLessThanOrEqual(caixaDock.y);

        const primeiro = cards.first();
        await primeiro.getByTestId('lead-address').evaluate((el) => {
          el.textContent = 'Avenida com um endereço extremamente longo sem espaço quebrável '.repeat(8);
        });
        const extremo = await primeiro.evaluate((card) => {
          const acoes = card.querySelector('[data-testid="lead-actions"]');
          const c = card.getBoundingClientRect();
          const a = acoes.getBoundingClientRect();
          return {
            documento: document.documentElement.scrollWidth,
            viewport: document.documentElement.clientWidth,
            acoesDentro: a.left >= c.left && a.right <= c.right,
          };
        });
        expect(extremo.documento).toBeLessThanOrEqual(extremo.viewport);
        expect(extremo.acoesDentro).toBe(true);
      }
    });
  }

  test('teclado, foco visível e auditoria Axe no painel', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await abrirLeads(page);

    await page.keyboard.press('Tab');
    const foco = await page.evaluate(() => {
      const el = document.activeElement;
      const estilo = el ? getComputedStyle(el) : null;
      return {
        tag: el?.tagName,
        outlineStyle: estilo?.outlineStyle,
        outlineWidth: estilo?.outlineWidth,
        boxShadow: estilo?.boxShadow,
      };
    });
    expect(foco.tag).not.toBe('BODY');
    expect(
      (foco.outlineStyle !== 'none' && foco.outlineWidth !== '0px')
      || foco.boxShadow !== 'none'
    ).toBe(true);

    const resultado = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(resultado.violations).toEqual([]);
  });
});
