import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Phone,
  MessageSquare,
  Tag,
  User,
  MoreVertical,
  X,
  Check,
  Download,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import { buildWhatsAppWebLink } from '../services/whatsappBulkEngine';
import { dispararChamadaTelAgent } from '../services/telAgentService';

const CONTATOS_INICIAIS = [
  {
    id: 'cnt-vitor-borsari',
    nome: 'VITOR BORSARI SILVA',
    sub: 'reydowin',
    telefone: '+5516993241822',
    canal: 'WhatsApp',
    tags: ['Cliente', 'VIP'],
    responsavel: 'Victor Borsari',
    valor: 0,
    ultimoContato: '-'
  },
  {
    id: 'cnt-barbearia-vintage',
    nome: 'Barbearia Vintage Club',
    sub: 'contato@barbeariavintage.com.br',
    telefone: '+5516998823140',
    canal: 'Tel-Agent (Voz IA)',
    tags: ['Lead Maps', 'Proposta'],
    responsavel: 'Victor Borsari',
    valor: 1850,
    ultimoContato: 'Ontem às 16:40'
  },
  {
    id: 'cnt-odontologia-prime',
    nome: 'Dra. Camila Ramos - Odonto Prime',
    sub: 'clinica@odontoprime.com',
    telefone: '+5516997120044',
    canal: 'WhatsApp',
    tags: ['Em Negociação'],
    responsavel: 'Victor Borsari',
    valor: 2400,
    ultimoContato: 'Hoje às 11:20'
  }
];

export default function ContatosView({ leads = [], onNavigate }) {
  // Carrega contatos persistidos ou iniciais
  const [contatos, setContatos] = useState(() => {
    try {
      const salvo = localStorage.getItem('repass_contatos_db');
      if (salvo) return JSON.parse(salvo);
    } catch {}
    return CONTATOS_INICIAIS;
  });

  const [busca, setBusca] = useState('');
  const [filtroTag, setFiltroTag] = useState('todas');
  const [modalNovo, setModalNovo] = useState(false);
  const [modalFiltrosAberto, setModalFiltrosAberto] = useState(false);
  const [contatoParaEditar, setContatoParaEditar] = useState(null);

  // Form State
  const [formNome, setFormNome] = useState('');
  const [formSub, setFormSub] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formCanal, setFormCanal] = useState('WhatsApp');
  const [formTag, setFormTag] = useState('Lead');
  const [formResponsavel, setFormResponsavel] = useState('Victor Borsari');
  const [formValor, setFormValor] = useState('0');

  // Salva no localStorage a cada alteração
  useEffect(() => {
    try {
      localStorage.setItem('repass_contatos_db', JSON.stringify(contatos));
    } catch {}
  }, [contatos]);

  // Se houver novos leads no sistema, sincroniza como contatos automaticamente
  useEffect(() => {
    if (!leads || leads.length === 0) return;
    setContatos(atuais => {
      const telefonesExistentes = new Set(atuais.map(c => c.telefone));
      const novos = [];
      leads.forEach(l => {
        if (l.telefone && !telefonesExistentes.has(l.telefone)) {
          telefonesExistentes.add(l.telefone);
          novos.push({
            id: `cnt-${l.id || Math.random().toString(36).slice(2, 8)}`,
            nome: l.nome || 'Lead Sem Nome',
            sub: l.categoria ? `${l.categoria} · ${l.cidade || 'Brasil'}` : (l.email || '-'),
            telefone: l.telefone,
            canal: 'Google Maps',
            tags: [l.categoria || 'Prospector', l.status || 'Novo'],
            responsavel: 'Victor Borsari',
            valor: l.ticket_medio ? Number(l.ticket_medio) : 1500,
            ultimoContato: 'Varredura OSINT'
          });
        }
      });
      return novos.length > 0 ? [...atuais, ...novos] : atuais;
    });
  }, [leads]);

  // Contatos Filtrados por busca e tag
  const contatosFiltrados = useMemo(() => {
    return contatos.filter(c => {
      const matchBusca =
        !busca.trim() ||
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.sub.toLowerCase().includes(busca.toLowerCase()) ||
        c.telefone.includes(busca) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(busca.toLowerCase())));

      const matchTag =
        filtroTag === 'todas' ||
        (c.tags && c.tags.includes(filtroTag));

      return matchBusca && matchTag;
    });
  }, [contatos, busca, filtroTag]);

  // Tags disponíveis
  const todasTags = useMemo(() => {
    const setTags = new Set(['todas']);
    contatos.forEach(c => {
      if (Array.isArray(c.tags)) c.tags.forEach(t => setTags.add(t));
    });
    return Array.from(setTags);
  }, [contatos]);

  // Salvar novo contato ou edição
  const salvarContato = (e) => {
    e.preventDefault();
    if (!formNome.trim()) return;

    if (contatoParaEditar) {
      setContatos(prev => prev.map(c => c.id === contatoParaEditar.id ? {
        ...c,
        nome: formNome.trim(),
        sub: formSub.trim() || '-',
        telefone: formTelefone.trim() || '-',
        canal: formCanal,
        tags: [formTag],
        responsavel: formResponsavel,
        valor: Number(formValor) || 0
      } : c));
    } else {
      const novo = {
        id: `cnt-${Date.now()}`,
        nome: formNome.trim(),
        sub: formSub.trim() || '-',
        telefone: formTelefone.trim() || '-',
        canal: formCanal,
        tags: [formTag],
        responsavel: formResponsavel,
        valor: Number(formValor) || 0,
        ultimoContato: 'Hoje às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setContatos(prev => [novo, ...prev]);
    }

    fecharModal();
  };

  const abrirEdicao = (c) => {
    setContatoParaEditar(c);
    setFormNome(c.nome);
    setFormSub(c.sub === '-' ? '' : c.sub);
    setFormTelefone(c.telefone === '-' ? '' : c.telefone);
    setFormCanal(c.canal || 'WhatsApp');
    setFormTag(c.tags?.[0] || 'Cliente');
    setFormResponsavel(c.responsavel || 'Victor Borsari');
    setFormValor(String(c.valor || 0));
    setModalNovo(true);
  };

  const fecharModal = () => {
    setModalNovo(false);
    setContatoParaEditar(null);
    setFormNome('');
    setFormSub('');
    setFormTelefone('');
    setFormValor('0');
  };

  const removerContato = (id) => {
    setContatos(prev => prev.filter(c => c.id !== id));
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const cabecalho = ['Nome', 'Detalhe/Email', 'Telefone', 'Canal', 'Tags', 'Responsável', 'Valor', 'Último Contato'];
    const linhas = contatosFiltrados.map(c => [
      c.nome,
      c.sub,
      c.telefone,
      c.canal,
      (c.tags || []).join(' | '),
      c.responsavel,
      `R$ ${Number(c.valor || 0).toLocaleString('pt-BR')}`,
      c.ultimoContato
    ]);
    const csvContent = [cabecalho, ...linhas].map(e => e.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `repass-contatos-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Gerador de cor de avatar com base no nome
  const getAvatarLetter = (name) => {
    return (name && name[0] ? name[0].toUpperCase() : 'C');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1600px', margin: '0 auto', color: 'var(--tinta)' }}>
      
      {/* 1. TOPO: Título, Contador, Busca, Filtros e Botão Novo Contato */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em', color: 'var(--tinta)' }}>
            Contatos
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--tinta-fraca)', fontWeight: 500 }}>
            {contatosFiltrados.length} contatos · Victor Borsari
          </div>
        </div>

        {/* Barra de Ações Direitas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Campo de Busca de Contatos */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} color="var(--tinta-fraca)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar contato"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--raio-md)',
                border: '1px solid var(--aro-cor)',
                backgroundColor: 'var(--papel-cartao)',
                color: 'var(--tinta)',
                fontSize: '13px',
                outline: 'none',
                boxShadow: 'var(--sombra-sm)'
              }}
            />
          </div>

          {/* Botão de Filtros */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setModalFiltrosAberto(o => !o)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: 'var(--raio-md)',
                border: '1px solid var(--aro-cor)',
                backgroundColor: 'var(--papel-cartao)',
                color: 'var(--tinta)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--sombra-sm)'
              }}
            >
              <Filter size={14} color="var(--tinta-media)" />
              Filtros
              {filtroTag !== 'todas' && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-indigo)' }} />
              )}
            </button>

            {/* Menu Popover de Filtros */}
            {modalFiltrosAberto && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  backgroundColor: 'var(--papel-cartao)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-md)',
                  boxShadow: 'var(--sombra-md)',
                  zIndex: 40,
                  minWidth: '180px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--tinta-fantasma)', padding: '4px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Filtrar por Tag
                </div>
                {todasTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setFiltroTag(tag);
                      setModalFiltrosAberto(false);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '6px 10px',
                      borderRadius: 'var(--raio-sm)',
                      border: 'none',
                      backgroundColor: filtroTag === tag ? 'var(--sobre-08)' : 'transparent',
                      color: filtroTag === tag ? 'var(--accent-indigo)' : 'var(--tinta)',
                      fontSize: '12px',
                      fontWeight: filtroTag === tag ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {tag === 'todas' ? 'Todas as Tags' : tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botão Exportar CSV */}
          <button
            onClick={exportarCSV}
            title="Exportar contatos para CSV"
            style={{
              padding: '9px 12px',
              borderRadius: 'var(--raio-md)',
              border: '1px solid var(--aro-cor)',
              backgroundColor: 'var(--papel-cartao)',
              color: 'var(--tinta)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--sombra-sm)'
            }}
          >
            <Download size={14} />
          </button>

          {/* Botão + Novo Contato */}
          <button
            onClick={() => {
              setContatoParaEditar(null);
              setModalNovo(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: 'var(--raio-pill)',
              border: 'none',
              backgroundColor: 'var(--acao-fundo)',
              color: 'var(--acao-texto)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--sombra-sm)'
            }}
          >
            <Plus size={15} />
            Novo contato
          </button>

        </div>
      </div>

      {/* 2. TABELA DE CONTATOS (Fiel ao print do usuário) */}
      <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', overflow: 'hidden', boxShadow: 'var(--sombra-sm)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-fundo)' }}>
                <th style={{ padding: '12px 20px', fontSize: '10.5px', fontWeight: 800, color: 'var(--tinta-fraca)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  CONTATO
                </th>
                <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 800, color: 'var(--tinta-fraca)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  CANAL
                </th>
                <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 800, color: 'var(--tinta-fraca)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  TAGS
                </th>
                <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 800, color: 'var(--tinta-fraca)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  RESPONSÁVEL
                </th>
                <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 800, color: 'var(--tinta-fraca)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  VALOR
                </th>
                <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 800, color: 'var(--tinta-fraca)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ÚLTIMO CONTATO
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '10.5px', fontWeight: 800, color: 'var(--tinta-fraca)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody>
              {contatosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--tinta-fraca)' }}>
                    Nenhum contato encontrado.
                  </td>
                </tr>
              ) : (
                contatosFiltrados.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--sobre-06)',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    
                    {/* CONTATO (Avatar + Nome em Caixa Alta / Subtítulo) */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: index % 2 === 0 ? 'var(--sucesso-fundo)' : 'var(--sobre-10)',
                            color: index % 2 === 0 ? 'var(--sucesso)' : 'var(--accent-indigo)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '14px',
                            flexShrink: 0
                          }}
                        >
                          {getAvatarLetter(item.nome)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--tinta)', letterSpacing: '-0.01em' }}>
                            {item.nome}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--tinta-fraca)', marginTop: '2px', fontWeight: 500 }}>
                            {item.sub}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CANAL (Telefone / WhatsApp) */}
                    <td style={{ padding: '14px 16px', color: 'var(--tinta-media)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      <span style={{ fontSize: '12px' }}>{item.telefone || '-'}</span>
                    </td>

                    {/* TAGS */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {item.tags && item.tags.length > 0 ? (
                          item.tags.map((t, tidx) => (
                            <span
                              key={tidx}
                              style={{
                                padding: '3px 8px',
                                borderRadius: 'var(--raio-pill)',
                                backgroundColor: 'var(--sobre-08)',
                                color: 'var(--tinta-media)',
                                fontSize: '11px',
                                fontWeight: 600
                              }}
                            >
                              {t}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--tinta-fantasma)' }}>-</span>
                        )}
                      </div>
                    </td>

                    {/* RESPONSÁVEL */}
                    <td style={{ padding: '14px 16px', color: 'var(--tinta-media)', fontSize: '12px', fontWeight: 500 }}>
                      {item.responsavel || '-'}
                    </td>

                    {/* VALOR */}
                    <td style={{ padding: '14px 16px', color: 'var(--tinta)', fontWeight: 800, fontSize: '13px' }}>
                      R$ {Number(item.valor || 0).toLocaleString('pt-BR')}
                    </td>

                    {/* ÚLTIMO CONTATO */}
                    <td style={{ padding: '14px 16px', color: 'var(--tinta-fraca)', fontSize: '12px', fontWeight: 500 }}>
                      {item.ultimoContato || '-'}
                    </td>

                    {/* AÇÕES (WhatsApp, Ligação, Editar, Excluir) */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {item.telefone && item.telefone !== '-' && (
                          <>
                            <a
                              href={buildWhatsAppWebLink(item.telefone, `Olá ${item.nome.split(' ')[0]}, tudo bem? Aqui é o Victor da REPASS AI.`)}
                              target="_blank"
                              rel="noreferrer"
                              title="Abrir conversa no WhatsApp"
                              style={{
                                padding: '6px',
                                borderRadius: 'var(--raio-sm)',
                                backgroundColor: 'var(--sucesso-fundo)',
                                color: 'var(--sucesso)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none'
                              }}
                            >
                              <MessageSquare size={13} />
                            </a>

                            <button
                              onClick={() => {
                                dispararChamadaTelAgent({
                                  nome: item.nome,
                                  telefone: item.telefone,
                                  categoria: item.tags?.[0] || 'Geral'
                                });
                              }}
                              title="Disparar ligação Tel-Agent Voz IA"
                              style={{
                                padding: '6px',
                                borderRadius: 'var(--raio-sm)',
                                border: 'none',
                                backgroundColor: 'var(--sobre-08)',
                                color: 'var(--accent-indigo)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Phone size={13} />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => abrirEdicao(item)}
                          title="Editar contato"
                          style={{
                            padding: '6px',
                            borderRadius: 'var(--raio-sm)',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--tinta-media)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => removerContato(item.id)}
                          title="Remover contato"
                          style={{
                            padding: '6px',
                            borderRadius: 'var(--raio-sm)',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--erro)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL DE NOVO CONTATO / EDIÇÃO */}
      {modalNovo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--papel-cartao)',
              border: '1px solid var(--aro-cor)',
              borderRadius: 'var(--raio-lg)',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: 'var(--sombra-lg)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
                {contatoParaEditar ? 'Editar Contato' : 'Novo Contato'}
              </h3>
              <button
                onClick={fecharModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tinta-media)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={salvarContato} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', marginBottom: '5px' }}>
                  NOME COMPLETO *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VITOR BORSARI SILVA"
                  value={formNome}
                  onChange={e => setFormNome(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--raio-sm)',
                    border: '1px solid var(--aro-cor)',
                    backgroundColor: 'var(--papel-fundo)',
                    color: 'var(--tinta)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', marginBottom: '5px' }}>
                  IDENTIFICADOR / E-MAIL / USERNAME
                </label>
                <input
                  type="text"
                  placeholder="Ex: reydowin ou contato@empresa.com"
                  value={formSub}
                  onChange={e => setFormSub(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--raio-sm)',
                    border: '1px solid var(--aro-cor)',
                    backgroundColor: 'var(--papel-fundo)',
                    color: 'var(--tinta)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', marginBottom: '5px' }}>
                  TELEFONE / WHATSAPP
                </label>
                <input
                  type="text"
                  placeholder="Ex: +5516993241822"
                  value={formTelefone}
                  onChange={e => setFormTelefone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--raio-sm)',
                    border: '1px solid var(--aro-cor)',
                    backgroundColor: 'var(--papel-fundo)',
                    color: 'var(--tinta)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', marginBottom: '5px' }}>
                    TAG / STATUS
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cliente, VIP, Lead"
                    value={formTag}
                    onChange={e => setFormTag(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--raio-sm)',
                      border: '1px solid var(--aro-cor)',
                      backgroundColor: 'var(--papel-fundo)',
                      color: 'var(--tinta)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', marginBottom: '5px' }}>
                    VALOR ESTIMADO (R$)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 1500"
                    value={formValor}
                    onChange={e => setFormValor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--raio-sm)',
                      border: '1px solid var(--aro-cor)',
                      backgroundColor: 'var(--papel-fundo)',
                      color: 'var(--tinta)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={fecharModal}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--raio-sm)',
                    border: '1px solid var(--aro-cor)',
                    backgroundColor: 'transparent',
                    color: 'var(--tinta)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--raio-sm)',
                    border: 'none',
                    backgroundColor: 'var(--acao-fundo)',
                    color: 'var(--acao-texto)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {contatoParaEditar ? 'Salvar Alterações' : 'Criar Contato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
