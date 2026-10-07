import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try {
 const page=await browser.newPage();
 let requests=0;
 await page.route('**/api/**',route=>{requests++;return route.fulfill({status:503,json:{mensagem:'API indisponível no teste'}});});
 await page.goto('http://127.0.0.1:4188');
 requests=0;
 const result=await page.evaluate(async()=>{
  const {executeAgenticLoop}=await import('/src/services/agenticPlanner.js');
  const {gerarLandingPage}=await import('/src/services/agenticGenerator.js');
  const lead={id:'zero-token',nome:'Empresa QA',categoria:'Barbearia',cidade:'Franca'};
  const classic=await executeAgenticLoop(lead);
  const modern=await gerarLandingPage('Site para barbearia',lead);
  return {classicProvider:classic.providerInfo.provider,components:classic.components.length,origin:modern.origem,attempts:modern.tentativas,blocks:modern.schema.blocos.length};
 });
 assert.equal(requests,0);
 assert.equal(result.attempts,0);
 assert.ok(result.components>0 && result.blocks>0);
 assert.equal(result.classicProvider,'Motor local determinístico');
 console.log('PASS: ambos os motores geram estruturas localmente com zero requisições API/LLM por padrão.',JSON.stringify(result));
}finally{await browser.close();}
