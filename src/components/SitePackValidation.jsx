import React, { useState } from 'react';
import { Eye, ArrowLeft, Search, AlertCircle } from 'lucide-react';
import catalogo from '../data/sitePackValidation.json';

const tamanhos = [
  ['Mobile', 390, 844], ['Tablet', 768, 1024],
  ['Notebook', 1360, 768], ['Desktop', 1920, 1080],
];

export default function SitePackValidation() {
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(null);
  const [tamanho, setTamanho] = useState(tamanhos[2]);
  const projetos = catalogo.projetos.filter(p => `${p.titulo} ${p.framework}`.toLowerCase().includes(busca.toLowerCase()));
  return (
    <section aria-label="Site Pack em validação" style={{ color: 'var(--fg-white)' }}>
      <h2>Site Pack · Em validação</h2>
      <p style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>
        14 projetos extraídos. Estes itens ainda não estão aprovados para geração, venda ou publicação.
        O pacote de animação é um componente visual, não um site completo.
      </p>
      {aberto ? <>
        <button className="btn-secondary" onClick={() => setAberto(null)}><ArrowLeft size={16} /> Voltar aos projetos</button>
        <h3>{aberto.titulo}</h3>
        <p>{aberto.framework} · {aberto.assets} assets · Licença: {aberto.licenca}</p>
        <ul>{aberto.observacoes.map(item => <li key={item}>{item}</li>)}</ul>
        <p>Rotas identificadas: {aberto.rotas.join(', ') || 'Documento HTML'}</p>
        {aberto.previewDisponivel ? <>
          <p>Preview experimental isolado no navegador. Não equivale a aprovação visual ou funcional.</p>
          <div role="group" aria-label="Tamanho do preview" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {tamanhos.map(device => <button key={device[0]} className="btn-secondary" aria-pressed={tamanho[0] === device[0]} onClick={() => setTamanho(device)}>
              {device[0]} · {device[1]}×{device[2]}
            </button>)}
          </div>
          <div style={{ maxWidth: '100%', overflow: 'auto', border: '1px solid var(--sobre-14)', borderRadius: 8 }}>
            <iframe key={tamanho[0]} title={`Preview ${aberto.titulo} — ${tamanho[0]}`} src="/__local-site-pack/background-animations-2"
              sandbox="allow-scripts" referrerPolicy="no-referrer"
              style={{ width: tamanho[1], minWidth: tamanho[1], maxWidth: 'none', height: tamanho[2], border: 0, display: 'block', background: 'var(--bg-deep)' }} />
          </div>
        </> : <p role="status" style={{ lineHeight: 1.6 }}>
          <AlertCircle size={16} /> Preview pendente: este projeto precisa de build em ambiente isolado.
          Docker não está disponível nesta máquina. Nenhum código deste projeto foi executado.
        </p>}
      </> : <>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '20px 0' }}>
          <Search size={16} />
          <input aria-label="Buscar projetos do Site Pack" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar projeto ou tecnologia" style={{ width: '100%', minWidth: 0, padding: 12, color: 'var(--fg-white)', background: 'var(--bg-surface)', border: '1px solid var(--sobre-14)', borderRadius: 8 }} />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
          {projetos.map(p => <article key={p.id} style={{ padding: 20, background: 'var(--bg-surface)', border: '1px solid var(--sobre-14)', borderRadius: 8 }}>
            <small style={{ color: 'var(--accent-indigo-suave)' }}>{p.status} · {p.framework}</small>
            <h3 style={{ overflowWrap: 'anywhere' }}>{p.titulo}</h3>
            <p>{p.assets} assets · {p.rotas.length} rotas identificadas</p>
            <p style={{ color: 'var(--fg-muted)' }}>{p.previewDisponivel ? 'Preview experimental disponível' : 'Preview aguardando ambiente isolado'}</p>
            <button className="btn-secondary" onClick={() => setAberto(p)}><Eye size={16} /> {p.previewDisponivel ? 'Visualizar e conferir' : 'Ver análise técnica'}</button>
          </article>)}
        </div>
        {!projetos.length && <p role="status">Nenhum projeto encontrado.</p>}
      </>}
    </section>
  );
}
