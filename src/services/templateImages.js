import {inspectTemplateStructure} from './templateStructure.js';
export function validateImageUrl(value) {
 let url;try{url=new URL(value);}catch{throw new Error('Informe uma URL HTTPS válida para a imagem.');}
 if(url.protocol!=='https:' || url.username || url.password || url.port && url.port!=='443') throw new Error('A imagem precisa usar HTTPS sem credenciais ou porta personalizada.');
 const host=url.hostname.toLowerCase();
 if(!host.includes('.') || host==='localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || /^[0-9.]+$/.test(host) || host.includes(':')) throw new Error('Use um domínio público, não endereço local ou IP.');
 if([...url.searchParams.keys()].some(key=>/^(token|key|api_key|apikey|secret|password)$/i.test(key))) throw new Error('Não use URLs contendo chaves ou segredos.');
 return url.href;
}
export function replaceTemplateImage(html,index,image) {
 if(image.authorized!==true) throw new Error('Confirme que você tem autorização para usar a imagem.');
 const url=validateImageUrl(image.url);
 if(typeof image.alt!=='string' || image.alt.length>500) throw new Error('Descrição da imagem inválida.');
 const structure=inspectTemplateStructure(html),slot=structure.imageSlots[index];
 if(!Number.isInteger(index)||!slot) throw new Error('Selecione uma imagem do template.');
 const document=new DOMParser().parseFromString(html,'text/html');
 let element=document.body;for(const part of slot.path) element=element?.children[part];
 if(element?.tagName!=='IMG') throw new Error('O alvo selecionado não é uma imagem.');
 element.setAttribute('src',url);element.setAttribute('alt',image.alt);element.removeAttribute('srcset');
 element.removeAttribute('onerror');element.removeAttribute('onload');
 element.setAttribute('referrerpolicy','no-referrer');
 // Não deixa uma source do picture continuar exibindo a imagem anterior.
 for(const source of element.closest('picture')?.querySelectorAll('source')||[]) source.setAttribute('srcset',url);
 return '<!DOCTYPE html>\n'+document.documentElement.outerHTML;
}
