import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1360,height:768}});
 await page.route('**/api/**',r=>r.fulfill({json:{auth_ativo:true,configurado:true,usuario:{id:'modules-qa'},leads:[],sites:[]}}));
 await page.goto('http://127.0.0.1:4188');
 for(const [id,title] of [['automacoes','Planejamento de automações'],['conhecimento','Referências para criação de sites'],['formularios','Briefings de clientes'],['prospector','Oportunidades de criação de sites']]){
   await page.locator('[data-sidebar-item="'+id+'"]').click();
   await page.getByRole('heading',{name:title,exact:true}).waitFor();
   assert.equal(await page.locator('.module-scope').count(),1);
   if(id==='automacoes'){
     await page.getByLabel('Nome do pipeline').fill('Site de teste');
     await page.getByRole('button',{name:'Criar pipeline',exact:true}).click();
     await page.getByRole('heading',{name:'Site de teste',exact:true}).waitFor();
     assert.equal(await page.locator('.workspace-stages li').count(),7);
     await page.getByLabel('Briefing',{exact:true}).check();
     await page.getByLabel('Nova etapa').fill('Conferir SEO');
     await page.getByRole('button',{name:'Adicionar',exact:true}).click();
     assert.equal(await page.locator('.workspace-stages li').count(),8);
   }
   if(id==='conhecimento'){
     await page.getByRole('button',{name:'Nova referência',exact:true}).click();
     await page.getByLabel('Título',{exact:true}).fill('Identidade visual');
     await page.getByLabel('Projeto',{exact:true}).fill('Site de teste');
     await page.getByLabel('Conteúdo',{exact:true}).fill('Paleta azul e tipografia serifada.');
     await page.getByRole('button',{name:'Salvar referência',exact:true}).click();
     await page.getByRole('heading',{name:'Identidade visual',exact:true}).waitFor();
     await page.getByLabel('Buscar referências').fill('não existe');
     await page.getByText('Nenhuma referência encontrada. Cadastre a identidade e o conteúdo do seu projeto.').waitFor();
     await page.getByLabel('Buscar referências').fill('');
   }
   for(const [width,height] of [[390,844],[768,1024],[1360,768],[1920,1080]]){
      await page.setViewportSize({width,height});
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Overflow: '+id+' '+width);
      await page.screenshot({path:'docs/modulo-'+id+'-'+width+'.png',fullPage:false});
   }
   await page.setViewportSize({width:1360,height:768});
   await page.screenshot({path:'docs/revisao-'+id+'.png',fullPage:false});
   if(id==='conhecimento') assert.equal(await page.getByText('Scripts de Contorno de Objeções (Voz & WhatsApp)',{exact:true}).count(),0);
   if(id==='prospector') assert.equal(await page.getByText('MOTOR OSINT // 100% OPERACIONAL',{exact:true}).count(),0);
 }
 await page.reload();
 await page.locator('[data-sidebar-item="automacoes"]').click();
 await page.getByRole('heading',{name:'Site de teste',exact:true}).waitFor();
 assert.equal(await page.getByLabel('Briefing',{exact:true}).isChecked(),true);
 console.log('PASS: quatro abas abrem; contexto visível; sem exemplos comerciais automáticos ou disponibilidade fictícia. API simulada.');
}finally{await browser.close();}
