import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {rankTemplates} from '../src/services/templateSelection.js';
const catalog=JSON.parse(await readFile(new URL('../public/templates/catalog.json',import.meta.url),'utf8')).templates;
for(const categoria of ['Barbearia','Restaurante','Cafeteria','Advocacia','Imobiliária','Academia','Software']) {
 const ranked=rankTemplates(catalog,{categoria});
 assert.equal(ranked.length,61);assert.ok(ranked[0].score>0);
 assert.ok(ranked[0].reasons.length);assert.deepEqual(ranked,rankTemplates(catalog,{categoria}));
 console.log(categoria,'=>',ranked[0].template.slug);
}
assert.equal(rankTemplates(catalog,{categoria:'xyzsemcategoria'})[0].score,0);
console.log('PASS: ranking local reproduzível e nenhuma recomendação fabricada para categoria desconhecida.');
