import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const p=await browser.newPage({viewport:{width:1360,height:768}});
 // Somente simulação de sessão na interface; não autentica no servidor.
 await p.route('**/api/auth/status',r=>r.fulfill({json:{auth_ativo:true,configurado:true,usuario:{id:'qa-interface-apenas'}}}));
 await p.goto('https://repass-ai-beta.netlify.app');
 await p.locator('[data-sidebar-item=templates]').click();
 const images=p.locator('img[alt^="Prévia de"]');
 await images.first().waitFor();
 assert.equal(await images.count(),61);
 await p.locator('button').filter({has:p.locator('img[alt^="Prévia de"]')}).first().click();
 const preview=p.locator('iframe[title^="Preview de"]');
 await preview.waitFor();
 assert.ok((await preview.getAttribute('src')).startsWith('/templates/'));
 assert.equal(await preview.getAttribute('sandbox'),'allow-scripts');
 console.log('PASS: frontend publicado renderiza 61 cartões e abre detalhe/preview estático. Sessão da interface simulada.');
}finally{await browser.close();}
