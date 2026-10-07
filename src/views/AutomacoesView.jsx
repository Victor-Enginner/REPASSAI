import React, { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Trash2, CheckCircle2 } from 'lucide-react';
import ModuleScope from '../components/ModuleScope';
import useLocalDrafts from '../hooks/useLocalDrafts';
import './SiteWorkspace.css';
const stages=['Briefing','Referências e conteúdo','Seleção de template','Criação do site','Revisão responsiva','Aprovação do cliente','Entrega'];
export default function AutomacoesView({userId,onNavigate}) {
 const [flows,save,error]=useLocalDrafts('pipelines-sites',userId);
 const [active,setActive]=useState(null),[name,setName]=useState(''),[step,setStep]=useState('');
 const flow=flows.find(f=>f.id===active)||flows[0];
 function create(e){e.preventDefault();if(!name.trim())return;const f={id:crypto.randomUUID(),name:name.trim(),steps:stages.map(title=>({id:crypto.randomUUID(),title,done:false}))};if(save([...flows,f])){setActive(f.id);setName('');}}
 function update(steps){save(flows.map(f=>f.id===flow.id?{...f,steps}:f));}
 function move(i,n){const a=[...flow.steps];if(i+n<0||i+n>=a.length)return;[a[i],a[i+n]]=[a[i+n],a[i]];update(a);}
 return <main className="site-workspace"><ModuleScope module="automacoes" onNavigate={onNavigate}/>
 <p className="workspace-notice">Planejador manual de produção. Marcar uma etapa não executa a geração ou publica o site. Rascunhos antigos de agentes foram preservados, mas não são usados aqui.</p>
 {error&&<p role="alert">{error}</p>}
 <div className="workspace-columns"><aside className="workspace-panel"><h3>Projetos e pipelines</h3><form onSubmit={create}><label>Nome do pipeline<input maxLength={120} required value={name} onChange={e=>setName(e.target.value)}/></label><button className="btn-primary"><Plus size={14}/> Criar pipeline</button></form>
 {!flows.length&&<p className="workspace-empty">Crie seu primeiro pipeline de entrega.</p>}{flows.map(f=><button className={'workspace-list-item '+(flow?.id===f.id?'selected':'')} key={f.id} onClick={()=>setActive(f.id)}><strong>{f.name}</strong><small>{f.steps.filter(s=>s.done).length}/{f.steps.length} etapas concluídas</small></button>)}</aside>
 <section className="workspace-panel">{flow?<><header className="workspace-row"><h2>{flow.name}</h2><button aria-label="Excluir pipeline" onClick={()=>{if(confirm('Excluir este pipeline?'))save(flows.filter(f=>f.id!==flow.id));}}><Trash2 size={16}/></button></header><ol className="workspace-stages">{flow.steps.map((s,i)=><li key={s.id}><span className="workspace-step-number">{i+1}</span><label><input type="checkbox" checked={s.done} onChange={()=>update(flow.steps.map(item=>item.id===s.id?{...item,done:!item.done}:item))}/><span>{s.title}</span></label><div className="workspace-row"><button disabled={i===0} aria-label={'Subir '+s.title} onClick={()=>move(i,-1)}><ArrowUp size={14}/></button><button disabled={i===flow.steps.length-1} aria-label={'Descer '+s.title} onClick={()=>move(i,1)}><ArrowDown size={14}/></button><button aria-label={'Remover '+s.title} onClick={()=>update(flow.steps.filter(item=>item.id!==s.id))}><Trash2 size={14}/></button></div></li>)}</ol><form className="workspace-row" onSubmit={e=>{e.preventDefault();if(step.trim()&&flow.steps.length<40&&save(flows.map(f=>f.id===flow.id?{...f,steps:[...f.steps,{id:crypto.randomUUID(),title:step.trim(),done:false}]}:f)))setStep('');}}><input aria-label="Nova etapa" maxLength={120} value={step} onChange={e=>setStep(e.target.value)} placeholder="Adicionar etapa de revisão..."/><button type="submit"><Plus size={16}/> Adicionar</button></form><p className="workspace-empty"><CheckCircle2 size={14}/> Progresso informado manualmente, sem métricas de execução fictícias.</p></>:<p className="workspace-empty">Selecione ou crie um pipeline.</p>}</section></div></main>;
}
