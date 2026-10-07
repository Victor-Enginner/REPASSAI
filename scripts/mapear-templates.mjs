import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {inspectTemplateStructure} from '../src/services/templateStructure.js';
const catalog=JSON.parse(await readFile(new URL('../public/templates/catalog.json',import.meta.url),'utf8')).templates;
assert.equal(catalog.length,61);
const browser=await chromium.launch();
try {
 const page=await browser.newPage();
 // Documento inerte em aba vazia; rede bloqueada para garantir análise sem efeitos externos.
 await page.route('**/*',route=>route.abort());
 const manifest={version:1,templates:[]};
 for(const item of catalog) {
  assert.match(item.slug,/^[a-zA-Z0-9_-]+$/);
  const html=await readFile(new URL(`../public/templates/${item.slug}.html`,import.meta.url),'utf8');
  const structure=await page.evaluate(inspectTemplateStructure,html);
  for(const slot of structure.textSlots) assert.ok(slot.path.every(Number.isInteger));
  manifest.templates.push({slug:item.slug,title:item.titulo,sha256:createHash('sha256').update(html).digest('hex'),...structure});
 }
 await writeFile(new URL('../public/templates/structure.json',import.meta.url),JSON.stringify(manifest),'utf8');
 const totals=manifest.templates.reduce((sum,item)=>({text:sum.text+item.textSlots.length,images:sum.images+item.imageSlots.length,sections:sum.sections+item.sections.length}),{text:0,images:0,sections:0});
 console.log(JSON.stringify({templates:manifest.templates.length,...totals,network:'blocked',templateScriptsExecuted:0}));
}finally{await browser.close();}
