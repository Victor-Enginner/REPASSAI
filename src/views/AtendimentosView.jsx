import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCheck, Info, MessageCircle, Search, Send, X } from 'lucide-react';
import './AtendimentosView.css';

// Modelo para o futuro adaptador. Todos os contatos e históricos são fictícios.
const DEMO = [
  { id: 'salon', name: 'Barbearia Vintage Cuts', initials: 'BV', unread: 2, tone: 'sage', messages: [
    { id: 's1', direction: 'incoming', text: 'Olá! Gostaria de um site para mostrar os cortes e receber agendamentos.', time: '14:20', status: 'received' },
    { id: 's2', direction: 'outgoing', text: 'Claro! Podemos criar uma página com seus serviços, fotos da barbearia e um botão de agendamento.', time: '14:21', status: 'read' },
    { id: 's3', direction: 'incoming', text: 'Gostei da ideia. Tenho fotos do espaço e a nossa logo. Posso mandar por aqui?', time: '14:22', status: 'received' },
  ] },
  { id: 'garage', name: 'Oficina Mecânica Precision', initials: 'OP', unread: 0, tone: 'sand', messages: [
    { id: 'o1', direction: 'incoming', text: 'Gostei da prévia com nossos serviços de freio e motor.', time: '13:45', status: 'received' },
    { id: 'o2', direction: 'incoming', text: 'Como podemos incluir um formulário de orçamento no site?', time: '13:50', status: 'received' },
  ] },
  { id: 'pet', name: 'Bichos & Mimos', initials: 'BM', unread: 0, tone: 'lavender', messages: [
    { id: 'p1', direction: 'incoming', text: 'Quero uma página com os produtos e os horários do pet shop.', time: '11:15', status: 'received' },
  ] },
];
function Avatar({ contact }) { return <span className={'inbox-avatar inbox-avatar--' + contact.tone} aria-hidden="true">{contact.initials}</span>; }

export default function AtendimentosView() {
  const [conversations, setConversations] = useState(DEMO);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [drafts, setDrafts] = useState({});
  const [info, setInfo] = useState(false);
  const [notice, setNotice] = useState('');
  const end = useRef(null);
  const selected = conversations.find(c => c.id === selectedId);
  const draft = drafts[selectedId] || '';
  const visible = conversations.filter(c => c.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')) && (filter !== 'unread' || c.unread > 0));
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [selectedId, selected?.messages.length]);
  function select(contact) {
    setSelectedId(contact.id); setInfo(false); setNotice('');
    setConversations(previous => previous.map(c => c.id === contact.id ? { ...c, unread: 0 } : c));
  }
  function simulate(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!selected || !text || text.length > 4000) return;
    const message = { id: crypto.randomUUID(), direction: 'outgoing', text, status: 'local', time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setConversations(previous => previous.map(c => c.id === selectedId ? { ...c, messages: [...c.messages, message] } : c));
    setDrafts(previous => ({ ...previous, [selectedId]: '' }));
    setNotice('Mensagem simulada neste navegador. Nada foi enviado ao WhatsApp.');
  }
  return <div className={'inbox ' + (selected ? 'inbox--open' : '')}>
    <aside className="inbox-list" aria-label="Conversas">
      <header className="inbox-list-header"><span className="inbox-eyebrow">RELACIONAMENTO COM CLIENTES</span><h1>Atendimentos <MessageCircle size={23} /></h1><span className="inbox-demo">Demonstração</span></header>
      <div className="inbox-connection">WhatsApp não conectado<small>Conexão por QR code: próxima etapa</small></div>
      <label className="inbox-search"><Search size={18} /><input aria-label="Buscar conversa" placeholder="Pesquisar conversas" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <div className="inbox-filters" role="group" aria-label="Filtrar conversas"><button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Todas</button><button aria-pressed={filter === 'unread'} onClick={() => setFilter('unread')}>Não lidas</button></div>
      <div className="inbox-conversations">{visible.map(c => { const last = c.messages.at(-1); return <button key={c.id} className={'inbox-row ' + (c.id === selectedId ? 'is-selected' : '')} aria-pressed={c.id === selectedId} onClick={() => select(c)}>
        <Avatar contact={c} /><span className="inbox-row-body"><span className="inbox-row-top"><strong>{c.name}</strong><time>{last.time}</time></span><span className="inbox-row-bottom"><span>{last.direction === 'outgoing' ? 'Você: ' : ''}{last.text}</span>{c.unread > 0 && <b aria-label={c.unread + ' mensagens não lidas'}>{c.unread}</b>}</span></span>
      </button>; })}{!visible.length && <p className="inbox-empty-list">Nenhuma conversa encontrada.</p>}</div>
      <footer className="inbox-list-footer">Dados fictícios · sem sincronização externa</footer>
    </aside>
    <section className="inbox-chat" aria-label={selected ? 'Conversa com ' + selected.name : 'Selecione uma conversa'}>
      {selected ? <>
        <header className="inbox-chat-header"><button className="inbox-icon inbox-back" aria-label="Voltar às conversas" onClick={() => setSelectedId(null)}><ArrowLeft size={22} /></button><Avatar contact={selected} /><div className="inbox-contact"><h2>{selected.name}</h2><span>Conversa de demonstração · WhatsApp desconectado</span></div><button className="inbox-icon" aria-label="Informações da conversa" aria-expanded={info} onClick={() => setInfo(v => !v)}><Info size={21} /></button></header>
        {info && <div className="inbox-info"><strong>Sobre esta conversa</strong><p>Contato e histórico fictícios. A integração futura deverá fornecer identificadores do provedor, mensagens, mídias, horários e estados de entrega.</p><button className="inbox-icon" aria-label="Fechar informações" onClick={() => setInfo(false)}><X size={18} /></button></div>}
        <div className="inbox-history" role="log" aria-label="Histórico de mensagens" aria-live="polite"><span className="inbox-date">EXEMPLO DE CONVERSA</span><p className="inbox-history-note">Demonstração: nenhuma mensagem foi recebida ou enviada pelo WhatsApp.</p>
          {selected.messages.map(m => <div key={m.id} className={'inbox-bubble inbox-bubble--' + m.direction}><p>{m.text}</p><span className="inbox-message-meta"><time>{m.time}</time>{m.direction === 'outgoing' && (m.status === 'local' ? <span>Somente local</span> : <CheckCheck size={16} aria-label="Leitura simulada" />)}</span></div>)}<div ref={end} />
        </div>
        <form className="inbox-compose" onSubmit={simulate}><div className="inbox-compose-input"><textarea aria-label="Escrever mensagem de demonstração" rows={1} maxLength={4000} value={draft} placeholder="Escreva uma mensagem de demonstração" onChange={e => setDrafts(previous => ({ ...previous, [selectedId]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); simulate(e); } }} /></div><button className="inbox-send" type="submit" aria-label="Simular envio de mensagem" disabled={!draft.trim()}><Send size={21} /></button><span className="inbox-compose-caption" role="status">{notice || 'Envio real indisponível · Enter simula; Shift+Enter quebra a linha'}</span></form>
      </> : <div className="inbox-welcome"><div className="inbox-welcome-icon"><MessageCircle size={56} strokeWidth={1.2} /></div><span className="inbox-eyebrow">SEU SITE COMEÇA COM UMA CONVERSA</span><h2>Mais perto dos seus clientes.</h2><p>Organize ideias, referências e pedidos de site em um só lugar. Selecione uma conversa para experimentar a nova interface.</p><span className="inbox-demo">Preview de interface · sem conexão com WhatsApp</span></div>}
    </section>
  </div>;
}
