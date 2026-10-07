import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch();
try {
  for (const format of ['html', 'legacy', 'missing']) {
    const page = await browser.newPage();
    let writes = 0;
    await page.route('**/api/**', async route => {
      const url = new URL(route.request().url());
      if (route.request().method() === 'POST') writes++;
      let body = {};
      if (url.pathname === '/api/auth/status') body = {auth_ativo:true,configurado:true,usuario:{id:'qa-opening'}};
      if (url.pathname === '/api/sites') body = {sites:[{projectId:'custom_existing',meta:{title:'Projeto QA'}}]};
      if (url.pathname === '/api/sites/detail') {
        assert.equal(url.searchParams.get('id'), 'custom_existing');
        if (format === 'missing') return route.fulfill({status:404,json:{mensagem:'Não encontrado'}});
        body = {site:{projectId:'custom_existing',...(format === 'html' ? {htmlContent:'<h1>Conteúdo salvo QA</h1>'} : {components:[{type:'HeroAnimated',props:{title:'Legado recuperado QA'}}]})}};
      }
      await route.fulfill({json:body});
    });
    await page.goto('http://127.0.0.1:4188');
    await page.locator('[data-sidebar-item=projetos]').click();
    await page.getByText('Projeto QA', {exact:true}).click();
    if (format === 'html') {
      const iframe = page.locator('iframe[title="Preview de Projeto QA"]');
      await iframe.waitFor();
      assert.equal(await iframe.getAttribute('sandbox'),'allow-scripts');
      await page.frameLocator('iframe[title="Preview de Projeto QA"]').getByText('Conteúdo salvo QA').waitFor();
    } else if (format === 'legacy') {
      await page.frameLocator('iframe[title="Preview de Projeto QA"]').getByRole('heading', {name:'Legado recuperado QA'}).waitFor();
    } else {
      await page.getByRole('alert').filter({hasText:'Este projeto não foi encontrado'}).waitFor();
    }
    assert.equal(writes,0,'Abrir projeto não pode gravar nem gerar novamente');
    await page.close();
  }
  console.log('PASS: HTML salvo, formato antigo e projeto ausente; identidade preservada e zero POST ao abrir (API simulada).');
} finally { await browser.close(); }
