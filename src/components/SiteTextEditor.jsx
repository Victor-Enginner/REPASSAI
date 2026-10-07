import React, { useMemo, useState } from 'react';
import { inspectTemplateStructure, applyTemplateTextEdits } from '../services/templateStructure';

const FONTS = ['Arial', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Courier New'];

// Documento inerte: scripts e manipuladores do template nunca executam no painel.
function parseEditable(html, slots) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const elements = slots.map(slot => {
    let element = document.body;
    for (const index of slot.path) element = element?.children[index];
    const node = element?.childNodes[slot.childIndex];
    return node?.nodeType === Node.TEXT_NODE && !element.closest('script,style,template,noscript,svg') ? {slot, element, node} : null;
  });
  return { document, elements };
}

export default function SiteTextEditor({ html, onChange, onSave, saving }) {
  const [slots] = useState(() => inspectTemplateStructure(html).textSlots);
  const [selected, setSelected] = useState(0);
  const [history, setHistory] = useState([]);
  const [notice, setNotice] = useState('');
  const parsed = useMemo(() => parseEditable(html, slots), [html, slots]);
  const record = parsed.elements[selected];
  const element = record?.element;
  function edit(change) {
    if (!element) return;
    setHistory(previous => [...previous.slice(-19), html]);
    // Mantém ícones e spans; apenas nós de texto visíveis recebem a edição.
    change(element);
    onChange('<!DOCTYPE html>\n' + parsed.document.documentElement.outerHTML);
    setNotice('Alterações no preview. Salve para gravar na conta.');
  }
  async function save() {
    setNotice('Salvando…');
    try { await onSave(); setNotice('Alterações salvas na conta.'); }
    catch (error) { setNotice(error.message || 'Não foi possível salvar. O preview continua com suas alterações.'); }
  }
  return <section aria-label="Editor visual de textos" style={{padding:20,color:'var(--tinta)',background:'var(--papel-cartao)'}}>
    <h2 style={{fontSize:18}}>Textos e fontes</h2>
    <p>Edite o conteúdo sem gastar tokens. O preview muda imediatamente.</p>
    <label>Elemento do site
      <select aria-label="Elemento do site" disabled={saving} value={selected} onChange={event=>setSelected(Number(event.target.value))} style={{width:'100%',margin:'8px 0'}}>
        {parsed.elements.map((item,index)=>item && <option key={index} value={index}>{item.element.tagName.toLowerCase()} — {item.node.textContent.trim().slice(0,80) || '(texto vazio)'}</option>)}
      </select>
    </label>
    {element ? <>
      <label>Texto
        <textarea aria-label="Texto do elemento" disabled={saving} value={record.node.textContent === '\u200B' ? '' : record.node.textContent} maxLength={10000} style={{width:'100%',minHeight:110,margin:'8px 0',boxSizing:'border-box'}} onChange={event=>{
          try {
            const next = applyTemplateTextEdits(html,[{...record.slot,expected:record.node.textContent.trim(),value:event.target.value}]);
            setHistory(previous => [...previous.slice(-19), html]);
            onChange(next);
            setNotice('Alterações no preview. Salve para gravar na conta.');
          } catch (error) { setNotice(error.message); }
        }}/>
      </label>
      <label>Fonte do elemento
        <select aria-label="Fonte do elemento" disabled={saving} value={FONTS.includes(element.style.fontFamily.replaceAll('"','')) ? element.style.fontFamily.replaceAll('"','') : ''} onChange={event=>edit(item=>{item.style.fontFamily=event.target.value;})} style={{width:'100%',margin:'8px 0'}}>
          <option value="">Fonte original do template</option>
          {FONTS.map(font=><option key={font} value={font}>{font}</option>)}
        </select>
      </label>
    </> : <p>Não há textos editáveis neste documento.</p>}
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      <button className="btn-secondary" disabled={!history.length || saving} onClick={()=>{onChange(history.at(-1));setHistory(history.slice(0,-1));setNotice('Alteração desfeita. Salve para gravar.');}}>Desfazer edição</button>
      <button className="btn-primary" disabled={saving} onClick={save}>{saving?'Salvando…':'Salvar alterações'}</button>
    </div>
    <p role="status">{notice}</p>
  </section>;
}
