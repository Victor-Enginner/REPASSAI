import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {inspectTemplateStructure,applyTemplateTextEdits} from '../src/services/templateStructure.js';
const browser=await chromium.launch();
try {
 const page=await browser.newPage();
 await page.route('**/*',route=>route.abort());
 const manifest=JSON.parse(await readFile(new URL('../public/templates/structure.json',import.meta.url),'utf8'));
 assert.equal(manifest.templates.length,61);
 for(const template of manifest.templates) {
  const html=await readFile(new URL(`../public/templates/${template.slug}.html`,import.meta.url),'utf8');
  const actual=await page.evaluate(inspectTemplateStructure,html);
  assert.deepEqual(actual.textSlots,template.textSlots);
  assert.deepEqual(actual.imageSlots,template.imageSlots);
 }
 const result=await page.evaluate(({inspect,apply})=>{
  const inspectFn=(0,eval)(`(${inspect})`), applyFn=(0,eval)(`(${apply})`);
  const html='<html><body><section><h1>Empresa <span>original</span></h1><img src="https://example.com/photo.jpg"></section><script>window.attack=true</script></body></html>';
  const map=inspectFn(html), slot=map.textSlots[1];
  const output=applyFn(html,[{...slot,expected:slot.text,value:'<script>Não executar</script>'}]);
  const doc=new DOMParser().parseFromString(output,'text/html');
  let rejected=false;try{applyFn(html,[{...slot,expected:'Texto mudou',value:'Errado'}]);}catch{rejected=true;}
  return {literal:doc.querySelector('span').textContent,scripts:doc.querySelectorAll('script').length,image:doc.querySelector('img').getAttribute('src'),rejected,executed:window.attack===true};
 },{inspect:inspectTemplateStructure.toString(),apply:applyTemplateTextEdits.toString()});
 assert.equal(result.literal,'<script>Não executar</script>');
 assert.equal(result.scripts,1);assert.equal(result.executed,false);assert.equal(result.rejected,true);
 assert.equal(result.image,'https://example.com/photo.jpg');
 console.log('PASS: mapas dos 61 templates reproduzíveis; edição local preserva estrutura/imagem, trata texto literalmente e rejeita mapa desatualizado.');
}finally{await browser.close();}
