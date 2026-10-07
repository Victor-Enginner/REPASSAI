import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try {
 for(const width of [390,768,1360,1920]) {
  const page=await browser.newPage({viewport:{width,height:900}});
  let writes=0; const models=[];
  await page.route('**/api/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   if(route.request().method()==='POST') writes++;
   if(path==='/api/auth/status') return route.fulfill({json:{auth_ativo:true,configurado:true,usuario:{id:'qa-briefing'}}});
   if(path==='/api/sites/detail') return route.fulfill({status:404,json:{mensagem:'Novo projeto'}});
   await route.fulfill({json:{sites:[],leads:[]}});
  });
  page.on('response',response=>{const path=new URL(response.url()).pathname;if(/^\/templates\/[^/]+\.html$/.test(path)&&response.ok())models.push(path);});
  await page.goto('http://127.0.0.1:4188');
  await page.locator('[data-sidebar-item=wizard]').waitFor({state:'attached'});
  const menu=page.getByRole('button',{name:'Abrir menu de navegação',exact:true});
  if(await menu.isVisible()) await menu.click();
  await page.locator('[data-sidebar-item=wizard]').click();
  await page.getByRole('button',{name:'Descrever',exact:true}).click();
  await page.locator('textarea').fill('Barbearia com agendamento e apresentação de serviços');
  await page.getByRole('button',{name:'Gerar',exact:true}).click();
  await page.getByLabel('Editor visual de textos').waitFor();
  await page.getByText('A copy original do template ainda não representa sua empresa.',{exact:false}).waitFor();
  assert.equal(writes,0);
  assert.ok(models.includes('/templates/aura-template-empire-owl-salon.html'));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  assert.equal(overflow,false,`Overflow do painel em ${width}px`);
  await page.getByRole('button',{name:/Voltar/}).first().click();
  const openMenu=page.getByRole('button',{name:'Abrir menu de navegação',exact:true});
  if(await openMenu.isVisible()) await openMenu.click();
  await page.locator('[data-sidebar-item=wizard]').click();
  await page.getByRole('button',{name:'Gerar',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Gerar',exact:true}).isEnabled(),true);
  await page.close();
 }
 console.log('PASS: briefing escolhe HTML real sem POST, aviso de revisão e painel sem overflow em 390/768/1360/1920 (API simulada).');
}finally{await browser.close();}
