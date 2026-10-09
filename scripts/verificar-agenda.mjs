import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
const catalog='backend/data/templates_store';
const templates=await Promise.all((await readdir(catalog)).filter(f=>f.endsWith('.json')).map(async f=>JSON.parse(await readFile(catalog+'/'+f,'utf8'))));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1360,height:768}});
 await page.route('**/api/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(new URL(route.request().url()).pathname==='/api/auth/status'?{auth_ativo:true,configurado:true,usuario:{id:'agenda-qa'}}:{leads:[],sites:[],templates})}));
 await page.goto('http://127.0.0.1:4188');
 await page.locator('[data-sidebar-item="agendamentos"]').click();
 await page.getByRole('button',{name:'Novo compromisso'}).click();
 await page.getByLabel('Título',{exact:true}).fill('Entrega QA');
 await page.getByRole('dialog').locator('select').selectOption('projeto');
 await page.getByRole('button',{name:'Salvar compromisso'}).click();
 await page.getByRole('heading',{name:'Entrega QA'}).waitFor();
 await page.reload();
 await page.locator('[data-sidebar-item="agendamentos"]').click();
 await page.getByRole('heading',{name:'Entrega QA'}).waitFor();
 await page.getByRole('button',{name:'Editar Entrega QA'}).click();
 await page.getByLabel('Título',{exact:true}).fill('Entrega revisada');
 await page.getByRole('button',{name:'Salvar compromisso'}).click();
 await page.getByRole('heading',{name:'Entrega revisada'}).waitFor();
 for(const [width,height] of [[390,844],[768,1024],[1360,768],[1920,1080]]){
   await page.setViewportSize({width,height});
   await page.waitForTimeout(250);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await page.screenshot({path:'docs/agenda-'+width+'.png',fullPage:true});
 }
 await page.setViewportSize({width:1360,height:768});
 await page.getByRole('button',{name:'Próximo mês'}).click();
 assert.equal(await page.locator('.agenda-day').count(),42);
 await page.getByRole('button',{name:'Hoje',exact:true}).click();
 page.on('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Excluir Entrega revisada'}).click();
 await page.getByText('Dia livre. Planeje sua próxima entrega.').waitFor();
 await page.locator('[data-sidebar-item="templates"]').click();
 const images=page.locator('img[alt^="Prévia de"]');
 await images.first().waitFor();
 await images.evaluateAll(imgs=>imgs.forEach(img=>img.loading='eager'));
 await page.waitForFunction(()=>[...document.querySelectorAll('img[alt^="Prévia de"]')].every(i=>i.complete&&i.naturalWidth>0));
 assert.equal(await page.locator('iframe').count(),0);
 await page.screenshot({path:'docs/templates-estaticos.png',fullPage:false});
 console.log('PASS: miniaturas carregadas; nenhum iframe na grade.');
 console.log('PASS: criar, editar, persistir após F5, excluir, navegar meses e 4 resoluções. API simulada.');
}finally{await browser.close();}
