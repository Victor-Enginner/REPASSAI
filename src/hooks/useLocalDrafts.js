import {useState} from 'react';
export default function useLocalDrafts(module,userId){
 const key=userId?'repass.sites.v1.'+module+'.'+userId:null;
 const [error,setError]=useState('');
 const [data,setData]=useState(()=>{try{const a=key?JSON.parse(localStorage.getItem(key)||'[]'):[];return Array.isArray(a)?a.filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string'&&(module!=='pipelines-sites'||(Array.isArray(x.steps)&&x.steps.every(s=>s&&typeof s.id==='string'&&typeof s.title==='string'&&typeof s.done==='boolean')))).slice(0,300):[];}catch{return [];}});
 function save(next){if(!key){setError('Entre na sua conta para salvar os rascunhos.');return false;}if(next.length>300){setError('Limite de 300 rascunhos neste navegador.');return false;}try{localStorage.setItem(key,JSON.stringify(next));setData(next);setError('');return true;}catch{setError('Armazenamento cheio ou indisponível. Alteração não salva.');return false;}}
 return [data,save,error];
}
