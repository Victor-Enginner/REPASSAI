// Análise estrutural local. Não executa código do template e não chama IA.
export function inspectTemplateStructure(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  function pathFor(element) {
    const parts=[];
    while(element && element !== doc.body) {
      const parent=element.parentElement;
      if(!parent) break;
      parts.unshift([...parent.children].indexOf(element)); element=parent;
    }
    return parts;
  }
  const forbidden='script,style,template,noscript,svg';
  const textNodes=[];
  const walker=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()) {
    const node=walker.currentNode, parent=node.parentElement;
    if(!parent || parent.closest(forbidden) || !node.textContent.trim()) continue;
    textNodes.push({path:pathFor(parent),childIndex:[...parent.childNodes].indexOf(node),text:node.textContent.trim().slice(0,500),tag:parent.tagName.toLowerCase(),region:parent.closest('header,footer,nav,section,main')?.tagName.toLowerCase()||'body'});
  }
  const imageSlots=[...doc.body.querySelectorAll('img')].map(image=>({path:pathFor(image),alt:image.getAttribute('alt')||'',source:image.getAttribute('src')||'',hasResponsiveSource:!!(image.getAttribute('srcset')||image.closest('picture'))}));
  const links=[...doc.body.querySelectorAll('a[href]')].map(link=>({path:pathFor(link),text:link.textContent.trim().slice(0,120),href:link.getAttribute('href')}));
  const dependencies=new Set();
  for(const element of doc.querySelectorAll('[src],link[href]')) {
    const raw=element.getAttribute('src')||element.getAttribute('href');
    try { const url=new URL(raw); if(['https:','http:'].includes(url.protocol)) dependencies.add(url.hostname); }catch{}
  }
  return {
    version:1,
    title:doc.title,
    textSlots:textNodes,
    imageSlots,
    links,
    sections:[...doc.body.querySelectorAll('section')].map(section=>({path:pathFor(section),heading:section.querySelector('h1,h2,h3')?.textContent.trim().slice(0,200)||'',id:section.id})),
    externalHosts:[...dependencies].sort(),
    capabilities:{canvas:doc.querySelectorAll('canvas').length,modelViewer:doc.querySelectorAll('model-viewer').length,scripts:doc.querySelectorAll('script').length,forms:doc.querySelectorAll('form').length},
    // Estrutura não equivale a aprovação visual ou autorização de uso das imagens.
    requiresReview:true
  };
}

export function applyTemplateTextEdits(html, edits) {
  if(!Array.isArray(edits) || edits.length > 1000) throw new Error('Lista de alterações inválida.');
  const doc=new DOMParser().parseFromString(html,'text/html');
  for(const edit of edits) {
    if(!Array.isArray(edit.path) || edit.path.length>100 || !edit.path.every(index=>Number.isInteger(index)&&index>=0)
      || !Number.isInteger(edit.childIndex) || edit.childIndex<0 || typeof edit.value!=='string' || edit.value.length>10000) throw new Error('Campo editável inválido.');
    let element=doc.body;
    for(const index of edit.path) element=element?.children[index];
    const node=element?.childNodes[edit.childIndex];
    if(!node || node.nodeType!==Node.TEXT_NODE || element.closest('script,style,template,noscript,svg')) throw new Error('O campo não é um texto editável.');
    if(typeof edit.expected==='string' && node.textContent.trim()!==edit.expected) throw new Error('O template mudou. Atualize o mapa antes de editar.');
    node.textContent=edit.value;
  }
  return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
}
