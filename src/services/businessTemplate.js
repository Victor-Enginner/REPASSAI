import {applyTemplateTextEdits,inspectTemplateStructure} from './templateStructure.js';

export function applyBusinessProfile(html,profile,mapping={}) {
 const name=String(profile.name||'').trim(),description=String(profile.description||'').trim();
 if(!name || name.length>200 || description.length>3000) throw new Error('Informe um nome de até 200 caracteres e descrição de até 3000.');
 const structure=inspectTemplateStructure(html);
 if(mapping.text?.name !== undefined && mapping.text?.name===mapping.text?.description) throw new Error('Escolha trechos diferentes para nome e descrição.');
 const edits=[];
 for(const [field,index] of Object.entries(mapping.text||{})) {
  if(!['name','description'].includes(field) || !Number.isInteger(index) || !structure.textSlots[index]) throw new Error('Mapeamento de texto inválido.');
  const slot=structure.textSlots[index];
  edits.push({...slot,value:field==='name'?name:description});
 }
 const document=new DOMParser().parseFromString(applyTemplateTextEdits(html,edits),'text/html');
 document.title=name;
 function meta(selector,attributes,value) {
  let element=document.head.querySelector(selector);
  if(!element){element=document.createElement('meta');for(const [key,val] of Object.entries(attributes)) element.setAttribute(key,val);document.head.appendChild(element);}
  element.setAttribute('content',value);
 }
 meta('meta[name="description"]',{name:'description'},description);
 meta('meta[property="og:title"]',{property:'og:title'},name);
 meta('meta[property="og:description"]',{property:'og:description'},description);
 if(mapping.contact !== undefined) {
  const phone=String(profile.phone||'').replace(/[\s()+-]/g,'');
  if(!/^[1-9][0-9]{9,14}$/.test(phone)) throw new Error('Informe WhatsApp com código do país e DDD, só números.');
  const slot=structure.links[mapping.contact];
  if(!Number.isInteger(mapping.contact)||!slot) throw new Error('Mapeamento de contato inválido.');
  let element=document.body;for(const index of slot.path) element=element?.children[index];
  if(element?.tagName!=='A') throw new Error('O contato precisa apontar para um link.');
  element.setAttribute('href',`https://wa.me/${phone}`);
  element.removeAttribute('onclick');element.removeAttribute('onmousedown');
 }
 return '<!DOCTYPE html>\n'+document.documentElement.outerHTML;
}
