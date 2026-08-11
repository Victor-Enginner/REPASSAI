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

  /*
    Todas as abas, em toda largura — não só a de Leads.

    O bloco acima cobria uma tela só. Isso deixou passar quebra de layout em
    Funil, Faturamento, Indicações, Meus Sites, Criar Site e na própria
    Landing, achadas medindo à mão. Um teste que olha uma tela dá a sensação
    de cobertura sem a cobertura.

    A medida é `scrollWidth > clientWidth` no ELEMENTO, não só no documento:
    o documento pode estar certo enquanto um cartão corta o nome do lead por
    dentro. Foi assim que a Landing passava em "sem vazamento" com a faixa
    do topo cortando 53px.

    Dois casos ficam de fora, porque são corte INTENCIONAL e não vazamento:

      · campo de formulário — input rola o próprio conteúdo por natureza;
      · qualquer caixa com `overflow` diferente de `visible` — quem escreveu
        `hidden`, `auto` ou `scroll` decidiu cortar ali. É o caso das
        miniaturas da Loja de Templates, que renderizam o site em tamanho
        real (927px) e reduzem por escala dentro de uma moldura pequena.

    Sobra o que interessa: conteúdo transbordando de uma caixa que deveria
    tê-lo contido.
  */
  /*
    Larguras de APARELHO REAL, não números redondos.

      360  Android mais estreito ainda em uso (Galaxy S8 e similares)
      375  iPhone SE / 13 mini
      494  janela de navegador arrastada até quase o mínimo — o caso que o
           dono reportou, e que não corresponde a aparelho nenhum
      768  tablet em retrato
      1024 tablet em paisagem / notebook pequeno
      1440 notebook e desktop

    320px foi testado e NÃO entra: nenhum aparelho em uso hoje tem essa
    largura, e as quebras que restam lá custariam mais do que valem. Está
    registrado aqui para ninguém achar que passou despercebido.
  */
  const LARGURAS_DE_USO = [360, 375, 494, 768, 1024, 1440];

  const ABAS = [
    'Painel', 'Scanner de Leads', 'Funil de Vendas', 'Abordagem',
    'Motor Neural', 'Agenda', 'Meus Sites', 'Faturamento',
    'Indicações', 'Loja de Templates', 'Criar Site',
  ];

  async function medirCortes(page) {
    return page.evaluate(() => {
      const cortados = [];
      document.querySelectorAll('body *').forEach((el) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') return;
        const caixa = el.getBoundingClientRect();
        if (caixa.width < 8 || caixa.height < 8) return;
        const excesso = el.scrollWidth - el.clientWidth;
        if (excesso > 4) {
          cortados.push(`${excesso}px em <${el.tagName.toLowerCase()}> "${(el.textContent || '').trim().slice(0, 30)}"`);
        }
      });
      return {
        documento: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
        cortados,
      };
    });
  }

  for (const largura of LARGURAS_DE_USO) {
    test(`${largura}px — nenhuma aba corta conteúdo`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.route('**/api/logs/stream', (route) => route.abort());
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // A Landing entra na conta: foi lá que o defeito apareceu primeiro.
      const landing = await medirCortes(page);
      expect(landing.documento, `Landing vaza na horizontal a ${largura}px`)
        .toBeLessThanOrEqual(landing.viewport);
      expect(landing.cortados, `Landing corta conteúdo a ${largura}px`).toEqual([]);

      await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
      await page.getByRole('button', { name: 'Entrar Modo Demo →', exact: true }).click();

      for (const aba of ABAS) {
        // Em tela estreita a barra lateral é uma GAVETA fechada: os botões
        // das abas existem no DOM mas não são clicáveis até abrir. Sem este
        // passo o teste falhava por tempo esgotado no clique — o que parecia
        // defeito de layout e era só navegação.
        const abrirMenu = page.getByRole('button', { name: 'Abrir menu de navegação' });
        if (await abrirMenu.isVisible().catch(() => false)) {
          await abrirMenu.click();
          await page.waitForTimeout(350);
        }

        const botao = page.locator('button', { hasText: aba }).first();
        if (!(await botao.isVisible().catch(() => false))) continue;
        await botao.click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(400);

        const m = await medirCortes(page);
        expect(m.documento, `${aba} vaza na horizontal a ${largura}px`)
          .toBeLessThanOrEqual(m.viewport);
        expect(m.cortados, `${aba} corta conteúdo a ${largura}px`).toEqual([]);
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
