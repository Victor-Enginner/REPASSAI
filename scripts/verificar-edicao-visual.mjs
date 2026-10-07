import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch();
try {
 const page = await browser.newPage({viewport:{width:1360,height:768}});
 let saved = {projectId:'site_visual',meta:{title:'Visual QA'},htmlContent:'<!doctype html><html><body><h1>Título inicial</h1><p>Descrição <span>original</span><svg aria-label="Ícone preservado"><circle r="4"></circle></svg></p></body></html>'};
 let writes=0; let failSave=false;
 await page.route('**/api/**', async route=>{
  const request=route.request(), path=new URL(request.url()).pathname;
  let body={};
  if(path==='/api/auth/status') body={auth_ativo:true,configurado:true,usuario:{id:'qa-visual'}};
  if(path==='/api/sites' && request.method()==='GET') body={sites:[saved]};
  if(path==='/api/sites/detail') body={site:saved};
  if(request.method()==='POST') {
   assert.equal(path,'/api/sites','Edição visual não chama gerador/LLM'); writes++;
   if(failSave) return route.fulfill({status:503,json:{mensagem:'Falha simulada ao salvar'}});
   const payload=request.postDataJSON(); assert.equal(payload.projectId,'site_visual');
   saved={...payload.schema,projectId:payload.projectId}; body={site:saved};
  }
  await route.fulfill({json:body});
 });
 async function open(){await page.goto('http://127.0.0.1:4188');await page.locator('[data-sidebar-item=projetos]').click();await page.getByText('Visual QA',{exact:true}).click();await page.getByLabel('Texto do elemento').waitFor();}
 await open();
 assert.equal(writes,0);
 await page.getByLabel('Texto do elemento').fill('Título editado <script>alert(1)</script>');
 await page.getByLabel('Fonte do elemento').selectOption('Georgia');
 const frame=page.frameLocator('iframe[title="Preview de Visual QA"]');
 await frame.getByRole('heading',{name:'Título editado <script>alert(1)</script>'}).waitFor();
 assert.equal(await frame.locator('script').count(),0);
 await page.getByRole('button',{name:'Salvar alterações',exact:true}).click();
 await page.getByText('Alterações salvas na conta.',{exact:true}).waitFor();
 assert.ok(saved.htmlContent.includes('Georgia'));
 await open();
 assert.equal(await page.getByLabel('Texto do elemento').inputValue(),'Título editado <script>alert(1)</script>');
 failSave=true;
 await page.getByLabel('Texto do elemento').fill('Rascunho preservado');
 await page.getByRole('button',{name:'Salvar alterações',exact:true}).click();
 await page.getByText('Falha simulada ao salvar',{exact:false}).waitFor();
 assert.equal(await page.getByLabel('Texto do elemento').inputValue(),'Rascunho preservado');
 assert.equal(writes,2);
 await page.getByLabel('Elemento do site').selectOption({label:'span — original'});
 await page.getByLabel('Texto do elemento').fill('');
 assert.equal(await page.getByLabel('Texto do elemento').inputValue(),'');
 await page.getByLabel('Texto do elemento').fill('alterada no span');
 await frame.getByText('Descrição alterada no span',{exact:true}).waitFor();
 assert.equal(await frame.locator('svg circle').count(),1);
 await page.getByRole('button',{name:'Desfazer edição',exact:true}).click();
 assert.equal(await page.getByLabel('Texto do elemento').inputValue(),'');
 await page.getByRole('button',{name:'Desfazer edição',exact:true}).click();
 assert.equal(await page.getByLabel('Texto do elemento').inputValue(),'original');
 console.log('PASS: texto literal, fonte, salvar/reabrir, falha sem perda, span/SVG preservados e apagar/desfazer; API simulada, sem IA.');
}finally{await browser.close();}
