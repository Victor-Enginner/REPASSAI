import React,{useMemo,useState} from 'react';
import {inspectTemplateStructure} from '../services/templateStructure';
import {replaceTemplateImage,validateImageUrl} from '../services/templateImages';
export default function TemplateImageEditor({html,onApply,disabled}) {
 const images=useMemo(()=>inspectTemplateStructure(html).imageSlots,[html]);
 const [index,setIndex]=useState(0),[url,setUrl]=useState(''),[alt,setAlt]=useState(''),[authorized,setAuthorized]=useState(false),[notice,setNotice]=useState('');
 const style={width:'100%',boxSizing:'border-box',margin:'6px 0 12px'};
 function apply(){try{const source=validateImageUrl(url);const htmlContent=replaceTemplateImage(html,index,{url:source,alt,authorized});onApply({htmlContent,imageRecord:{index,url:source,alt,authorizationDeclared:true}});setNotice('Imagem aplicada ao preview. Confira o carregamento e salve.');}catch(error){setNotice(error.message);}}
 return <section aria-label="Imagens da empresa" style={{padding:20,background:'var(--papel-cartao)',color:'var(--tinta)'}}>
  <h2 style={{fontSize:18}}>Imagens da empresa</h2>
  {!images.length?<p>Este template não tem imagens IMG. Fundos CSS e modelos 3D exigem outro mapeamento.</p>:<>
  <label>Imagem do template<select aria-label="Imagem do template" value={index} disabled={disabled} style={style} onChange={event=>setIndex(Number(event.target.value))}>{images.map((image,i)=><option key={i} value={i}>{i+1} — {image.alt||image.source.slice(0,80)||'Sem descrição'}</option>)}</select></label>
  <label>URL da imagem<input aria-label="URL da imagem" value={url} disabled={disabled} style={style} onChange={event=>setUrl(event.target.value)} placeholder="https://seu-dominio.com/foto.jpg"/></label>
  <label>Descrição acessível<input aria-label="Descrição acessível" maxLength={500} value={alt} disabled={disabled} style={style} onChange={event=>setAlt(event.target.value)}/></label>
  <label><input type="checkbox" checked={authorized} disabled={disabled} onChange={event=>setAuthorized(event.target.checked)}/>Tenho autorização para usar esta imagem</label>
  <p>A imagem continuará hospedada na origem. Links externos podem expirar ou bloquear carregamento.</p>
  <button className="btn-secondary" disabled={disabled} onClick={apply}>Aplicar imagem ao preview</button>
  </>}
  <p role="status">{notice}</p>
 </section>;
}
