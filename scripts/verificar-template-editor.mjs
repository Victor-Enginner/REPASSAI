import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try {
 const page=await browser.newPage();
 let writes=0, loadedTemplate=false;
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(route.request().method()==='POST') writes++;
  if(path==='/api/auth/status') return route.fulfill({json:{auth_ativo:true,configurado:true,usuario:{id:'qa-template'}}});
  if(path==='/api/sites/detail') return route.fulfill({status:404,json:{mensagem:'Novo projeto'}});
  await route.fulfill({json:{sites:[]}});
 });
 page.on('response',response=>{if(/\/templates\/[^/]+\.html$/.test(new URL(response.url()).pathname)&&response.ok())loadedTemplate=true;});
 await page.goto('http://127.0.0.1:4188');
 await page.locator('[data-sidebar-item=templates]').click();
 await page.locator('button').filter({has:page.locator('img[alt^="Prévia de"]')}).first().click();
 await page.getByRole('button',{name:'Usar este template no editor'}).click();
 await page.getByLabel('Editor visual de textos').waitFor();
 assert.ok(loadedTemplate);
 assert.equal(writes,0,'Template não pode disparar geração/IA nem salvar automaticamente');
 assert.ok((await page.locator('iframe[title^="Preview de"]').getAttribute('srcdoc')).length>1000);
 console.log('PASS: template real do catálogo no editor, texto editável e zero POST ao abrir (sessão/API simuladas).');
}finally{await browser.close();}
