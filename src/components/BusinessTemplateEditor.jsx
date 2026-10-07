import React,{useMemo,useState} from 'react';
import {inspectTemplateStructure} from '../services/templateStructure';
import {applyBusinessProfile} from '../services/businessTemplate';

export default function BusinessTemplateEditor({html,profile={},onApply,disabled}) {
 const [name,setName]=useState(profile.name||'');
 const [description,setDescription]=useState(profile.description||'');
 const [phone,setPhone]=useState(profile.phone||'');
 const [nameSlot,setNameSlot]=useState(''),[descriptionSlot,setDescriptionSlot]=useState(''),[contactSlot,setContactSlot]=useState('');
 const [notice,setNotice]=useState('');
 const map=useMemo(()=>inspectTemplateStructure(html),[html]);
 const style={width:'100%',boxSizing:'border-box',margin:'6px 0 12px'};
 function selector(label,value,setValue,items) {return <label>{label}<select aria-label={label} disabled={disabled} value={value} onChange={event=>setValue(event.target.value)} style={style}><option value="">Não alterar este campo no layout</option>{items.map((item,index)=><option key={index} value={index}>{item.text?.slice(0,80)||item.href||'(sem texto)'}</option>)}</select></label>;}
 function apply(){try{
  const next={name,description,phone},mapping={text:{}};
  if(nameSlot!=='')mapping.text.name=Number(nameSlot);
  if(descriptionSlot!=='')mapping.text.description=Number(descriptionSlot);
  if(contactSlot!=='')mapping.contact=Number(contactSlot);
  const htmlContent=applyBusinessProfile(html,next,mapping);
  onApply({htmlContent,companyProfile:next,companyMapping:mapping,requiresContentReview:true});
  setNotice('Marca aplicada ao preview. Revise os outros textos e salve as alterações.');
 }catch(error){setNotice(error.message);}}
 return <section aria-label="Dados da empresa" style={{padding:20,background:'var(--papel-cartao)',color:'var(--tinta)'}}>
  <h2 style={{fontSize:18}}>Adaptar à empresa</h2>
  <p>Defina dados reais e escolha os trechos do template. Não usa IA nem busca fotos automaticamente.</p>
  <label>Nome da empresa<input aria-label="Nome da empresa" value={name} maxLength={200} disabled={disabled} onChange={event=>setName(event.target.value)} style={style}/></label>
  <label>Descrição da empresa<textarea aria-label="Descrição da empresa" value={description} maxLength={3000} disabled={disabled} onChange={event=>setDescription(event.target.value)} style={style}/></label>
  <label>WhatsApp da empresa<input aria-label="WhatsApp da empresa" value={phone} disabled={disabled} onChange={event=>setPhone(event.target.value)} placeholder="5511999999999" style={style}/></label>
  {selector('Trecho para nome',nameSlot,setNameSlot,map.textSlots)}
  {selector('Trecho para descrição',descriptionSlot,setDescriptionSlot,map.textSlots)}
  {selector('Link para WhatsApp',contactSlot,setContactSlot,map.links)}
  <button className="btn-secondary" disabled={disabled} onClick={apply}>Aplicar marca ao preview</button>
  <p role="status">{notice}</p>
 </section>;
}
