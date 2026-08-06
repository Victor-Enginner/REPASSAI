import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromium } from 'playwright';
import { navigation, snapshot } from 'lighthouse';

const browser = await puppeteer.launch({
  executablePath: chromium.executablePath(),
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

const config = {
  extends: 'lighthouse:default',
  settings: { onlyCategories: ['accessibility'] },
};

async function pontuacao(resultado) {
  return Math.round((resultado?.lhr?.categories?.accessibility?.score || 0) * 100);
}

async function clicarPorNome(page, nome) {
  const limite = Date.now() + 30_000;
  while (Date.now() < limite) {
    const candidatos = await page.$$('button, a');
    for (const candidato of candidatos) {
      const texto = await candidato.evaluate((el) => (el.innerText || el.textContent || '').replace(/\s+/g, ' '));
      if (texto.includes(nome)) {
        await candidato.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Ação não encontrada: ${nome}`);
}

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:3000/?audit=leads', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="leads-controls"]');

  const painel = await snapshot(page, { config });

  const site = await navigation(
    page,
    'http://127.0.0.1:8000/api/site/preview_html',
    { config },
  );

  const resumo = {
    criterio_minimo: 90,
    painel: await pontuacao(painel),
    site_gerado: await pontuacao(site),
    gerado_em: new Date().toISOString(),
  };

  await fs.mkdir(path.resolve('lighthouse-reports'), { recursive: true });
  await fs.writeFile(
    path.resolve('lighthouse-reports', 'acessibilidade.json'),
    `${JSON.stringify(resumo, null, 2)}\n`,
  );
  console.log(JSON.stringify(resumo, null, 2));

  if (resumo.painel < 90 || resumo.site_gerado < 90) process.exitCode = 1;
} finally {
  await browser.close();
}
