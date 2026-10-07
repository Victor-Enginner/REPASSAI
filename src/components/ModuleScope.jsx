import React from 'react';
import { Info, ArrowUpRight } from 'lucide-react';
import './ModuleScope.css';
const modules = {
 automacoes: {title:'Planejamento de automações',scope:'Organize etapas do briefing, criação, revisão e entrega de sites.',status:'Planejador manual',note:'Este planejador não executa agentes, WhatsApp, chamadas ou workflows n8n. Os agentes antigos pertencem ao escritório 3D.'},
 conhecimento: {title:'Referências para criação de sites',scope:'Centralize identidade visual, conteúdo aprovado, requisitos e referências do projeto.',status:'Biblioteca local',note:'Busca por palavras nos textos salvos. Ainda não há embeddings, leitura automática de PDFs, scraping de URLs ou integração RAG com o gerador.'},
 formularios: {title:'Briefings de clientes',scope:'Prepare perguntas para levantar objetivos, páginas, conteúdo e necessidades do site.',status:'Editor e prévia locais',note:'A prévia é um teste. Publicação, link público, incorporação e recebimento de respostas externas ainda não estão conectados.'},
 prospector: {title:'Oportunidades de criação de sites',scope:'Encontre negócios, avalie suas informações e prepare um projeto de site.',status:'Varredura via servidor',note:'A disponibilidade depende do motor e das credenciais do servidor. Não há contato automático com os negócios nesta tela.'},
};
export default function ModuleScope({module,onNavigate}) {
 const m=modules[module];
 return <section className="module-scope" aria-label={'Contexto de '+m.title}>
   <div className="module-scope-top"><span className="mono-label">WORKSPACE // SITES</span><span className="module-scope-status">{m.status}</span></div>
   <h2>{m.title}</h2><p>{m.scope}</p>
   <div className="module-scope-note"><Info size={16}/><span>{m.note}</span></div>
   {module!=='prospector'&&<p>Salvamento local por conta, sem sincronização entre dispositivos. Não insira senhas ou credenciais. Os dados legados foram preservados, sem migração automática.</p>}
   {onNavigate&&<button className="btn-secondary" onClick={()=>onNavigate('wizard')}>Criar site <ArrowUpRight size={14}/></button>}
 </section>;
}
