import React, { useState, useEffect, useMemo } from 'react';
import ModuleScope from '../components/ModuleScope';
import './SiteWorkspace.css';
import {
  FileText,
  Plus,
  Trash2,
  Eye,
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  GripVertical,
  ExternalLink,
  Sparkles,
  Send,
  Save,
  Layers,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Code
} from 'lucide-react';

const TIPOS_CAMPOS = [
  { id: 'nome', label: 'Nome' },
  { id: 'texto_curto', label: 'Texto curto' },
  { id: 'texto_longo', label: 'Texto longo' },
  { id: 'numero', label: 'Número' },
  { id: 'valor_brl', label: 'Valor (R$)' },
  { id: 'data', label: 'Data' },
  { id: 'email', label: 'E-mail' },
  { id: 'telefone', label: 'Telefone' },
  { id: 'selecao_unica', label: 'Seleção única' },
  { id: 'selecao_multipla', label: 'Seleção múltipla' },
  { id: 'sim_nao', label: 'Sim/Não' },
  { id: 'url', label: 'URL' }
];

const CAMPOS_MAP_CRM = [
  { id: 'nenhum', label: 'Não mapear' },
  { id: 'nome', label: 'Nome do contato' },
  { id: 'telefone', label: 'Telefone do contato' },
  { id: 'email', label: 'E-mail do contato' },
  { id: 'empresa', label: 'Empresa / Negócio' },
  { id: 'segmento', label: 'Segmento / Nicho' },
  { id: 'valor', label: 'Valor estimado (R$)' },
  { id: 'notas', label: 'Observações / Briefing' }
];

const PIPELINES_OPCOES = [
  { id: 'none', label: 'Não criar lead' },
  { id: 'b2b_repass', label: 'B2B Repass AI' },
  { id: 'maps_prospecting', label: 'Prospecção Fria (Maps)' },
  { id: 'inbound_qualificacao', label: 'Qualificação Inbound' }
];

const CORES_PALETA = [
  'var(--iris-violeta)',
  'var(--iris-azul)',
  'var(--iris-ciano)',
  'var(--iris-menta)',
  'var(--iris-pessego)',
  'var(--iris-rosa)'
];

const FORMULARIOS_INICIAIS = [
  {
    id: 'form-my-briefing',
    titulo: 'Briefing de criação de site',
    descricao: 'Formulário oficial de diagnóstico para novos clientes e levantamento de necessidades.',
    agradecimento: 'Prévia concluída. Nenhum dado foi enviado.',
    corDestaque: 'var(--iris-violeta)',
    pipeline: 'b2b_repass',
    status: 'rascunho', // 'rascunho' | 'publicado'
    envios: 0,
    criadoEm: 'Hoje às 03:40',
    campos: [
      {
        id: 'c-1',
        pergunta: 'Qual é o segmento do negócio?',
        tipo: 'texto_curto',
        obrigatorio: true,
        mapearPara: 'segmento',
        placeholder: 'Ex: Barbearia, Odontologia, Oficina mecânica...',
        opcoes: []
      },
      {
        id: 'c-2',
        pergunta: 'Qual o seu nome completo?',
        tipo: 'nome',
        obrigatorio: true,
        mapearPara: 'nome',
        placeholder: 'Seu nome ou da sua empresa',
        opcoes: []
      },
      {
        id: 'c-3',
        pergunta: 'WhatsApp comercial para contato',
        tipo: 'telefone',
        obrigatorio: true,
        mapearPara: 'telefone',
        placeholder: '(11) 99999-9999',
        opcoes: []
      }
    ]
  },
  {
    id: 'form-prospeccao-express',
    titulo: 'Diagnóstico de Presença Digital',
    descricao: 'Avaliação express de autoridade local no Google Maps e velocidade de carregamento de site.',
    agradecimento: 'Prévia concluída. Nenhuma proposta foi enviada.',
    corDestaque: 'var(--iris-azul)',
    pipeline: 'b2b_repass',
    status: 'rascunho',
    envios: 0,
    criadoEm: '27/09/2026',
    campos: [
      {
        id: 'c-101',
        pergunta: 'Nome da sua Empresa no Google Maps',
        tipo: 'texto_curto',
        obrigatorio: true,
        mapearPara: 'empresa',
        placeholder: 'Ex: Barbearia Vintage SP',
        opcoes: []
      },
      {
        id: 'c-102',
        pergunta: 'Telefone celular com WhatsApp',
        tipo: 'telefone',
        obrigatorio: true,
        mapearPara: 'telefone',
        placeholder: '(11) 98888-7777',
        opcoes: []
      },
      {
        id: 'c-103',
        pergunta: 'Você já possui site no ar atualmente?',
        tipo: 'sim_nao',
        obrigatorio: false,
        mapearPara: 'notas',
        placeholder: '',
        opcoes: ['Sim', 'Não']
      }
    ]
  }
];

export default function FormulariosView({ leads = [], setLeads, onNavigate, userId }) {
  const storageKey = userId ? 'repass.sites.v1.formularios.' + userId : null;
  const [formularios, setFormularios] = useState(() => {
    try {
      const salvo = storageKey ? localStorage.getItem(storageKey) : null;
      if (salvo) { const data=JSON.parse(salvo); if(Array.isArray(data)) return data.filter(f=>f&&typeof f.id==='string'&&typeof f.titulo==='string'&&Array.isArray(f.campos)).slice(0,300); }
    } catch {}
    return FORMULARIOS_INICIAIS;
  });

  const [modo, setModo] = useState('lista'); // 'lista' | 'editor'
  const [formularioAtivo, setFormularioAtivo] = useState(null);

  // Estados de criação rápida na lista
  const [mostrandoCriarInline, setMostrandoCriarInline] = useState(false);
  const [nomeNovoForm, setNomeNovoForm] = useState('');

  // Modais de Preview e Compartilhamento
  const [modalPreviewAberta, setModalPreviewAberta] = useState(false);
  const [modalShareAberta, setModalShareAberta] = useState(false);
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [copiadoEmbed, setCopiadoEmbed] = useState(false);
  const [notificacaoSalvo, setNotificacaoSalvo] = useState(false);

  // Estado das respostas durante o preview/teste
  const [respostasPreview, setRespostasPreview] = useState({});
  const [envioSucessoPreview, setEnvioSucessoPreview] = useState(false);

  // Persistência local automática
  useEffect(() => {
    try {
      if(storageKey) localStorage.setItem(storageKey, JSON.stringify(formularios));
    } catch {}
  }, [formularios, storageKey]);

  // Abre editor para um formulário específico
  const abrirEditor = (form) => {
    setFormularioAtivo(JSON.parse(JSON.stringify(form)));
    setModo('editor');
  };

  // Criação rápida de formulário
  const handleCriarInline = () => {
    if (!nomeNovoForm.trim()) return;
    const novo = {
      id: `form-${Date.now()}`,
      titulo: nomeNovoForm.trim(),
      descricao: '',
      agradecimento: 'Obrigado pelo envio! Nossa equipe entrará em contato em breve.',
      corDestaque: 'var(--iris-violeta)',
      pipeline: 'b2b_repass',
      status: 'rascunho',
      envios: 0,
      criadoEm: 'Agora',
      campos: [
        {
          id: `c-${Date.now()}-1`,
          pergunta: 'Ex: Qual seu nome completo?',
          tipo: 'nome',
          obrigatorio: true,
          mapearPara: 'nome',
          placeholder: 'Texto de ajuda (opcional)',
          opcoes: []
        },
        {
          id: `c-${Date.now()}-2`,
          pergunta: 'Ex: Qual seu telefone WhatsApp?',
          tipo: 'telefone',
          obrigatorio: true,
          mapearPara: 'telefone',
          placeholder: '(11) 99999-9999',
          opcoes: []
        }
      ]
    };

    setFormularios(prev => [novo, ...prev]);
    setNomeNovoForm('');
    setMostrandoCriarInline(false);
    abrirEditor(novo);
  };

  // Salvar rascunho / alterações no editor
  const handleSalvarEditor = (statusOpcional) => {
    if (!formularioAtivo) return;
    const atualizado = {
      ...formularioAtivo,
      status: statusOpcional || formularioAtivo.status
    };

    setFormularios(prev => prev.map(f => f.id === atualizado.id ? atualizado : f));
    setFormularioAtivo(atualizado);

    setNotificacaoSalvo(true);
    setTimeout(() => setNotificacaoSalvo(false), 2500);
  };

  // Adicionar campo no editor
  const handleAdicionarCampo = () => {
    if (!formularioAtivo) return;
    const novoCampo = {
      id: `c-${Date.now()}`,
      pergunta: 'Novo campo',
      tipo: 'texto_curto',
      obrigatorio: false,
      mapearPara: 'nenhum',
      placeholder: 'Texto de ajuda (opcional)',
      opcoes: []
    };

    setFormularioAtivo(prev => ({
      ...prev,
      campos: [...prev.campos, novoCampo]
    }));
  };

  // Alterar campo no editor
  const handleAlterarCampo = (campoId, patch) => {
    setFormularioAtivo(prev => ({
      ...prev,
      campos: prev.campos.map(c => c.id === campoId ? { ...c, ...patch } : c)
    }));
  };

  // Remover campo
  const handleRemoverCampo = (campoId) => {
    setFormularioAtivo(prev => ({
      ...prev,
      campos: prev.campos.filter(c => c.id !== campoId)
    }));
  };

  // Reordenar campos
  const handleMoverCampo = (index, direcao) => {
    if (!formularioAtivo) return;
    const novaLista = [...formularioAtivo.campos];
    const destino = index + direcao;
    if (destino < 0 || destino >= novaLista.length) return;
    const item = novaLista.splice(index, 1)[0];
    novaLista.splice(destino, 0, item);
    setFormularioAtivo(prev => ({ ...prev, campos: novaLista }));
  };

  // Excluir formulário da lista
  const handleExcluirFormulario = (formId, e) => {
    e?.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este formulário?')) {
      setFormularios(prev => prev.filter(f => f.id !== formId));
      if (formularioAtivo?.id === formId) {
        setModo('lista');
        setFormularioAtivo(null);
      }
    }
  };

  // Duplicar formulário
  const handleDuplicarFormulario = (form, e) => {
    e?.stopPropagation();
    const duplicado = {
      ...JSON.parse(JSON.stringify(form)),
      id: `form-${Date.now()}`,
      titulo: `${form.titulo} (Cópia)`,
      status: 'rascunho',
      envios: 0,
      criadoEm: 'Agora'
    };
    setFormularios(prev => [duplicado, ...prev]);
  };

  // Testar campos não envia dados ao CRM ou incrementa respostas reais.
  const handleSubmeterPreview = (e) => {
    e.preventDefault();
    setEnvioSucessoPreview(true);
  };

  // Sem endpoint público: não emitir link ou embed que não funciona.
  const urlPublica = typeof window !== 'undefined'
    ? ''
    : '';

  const codigoEmbed = '';

  return (
    <div className="forms-workspace" style={{ padding: '24px 32px', minHeight: '100vh', boxSizing: 'border-box' }}>
      <ModuleScope module="formularios" onNavigate={onNavigate}/>
      
      {/* ============================================================
          TOAST DE CONFIRMAÇÃO DE SALVAMENTO
          ============================================================ */}
      {notificacaoSalvo && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '32px',
          zIndex: 9999,
          background: 'var(--papel-elevado)',
          color: 'var(--tinta)',
          border: '1px solid var(--sinal-vivo)',
          padding: '12px 20px',
          borderRadius: 'var(--raio-md)',
          boxShadow: 'var(--sombra-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.9rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={18} color="var(--sinal-vivo)" />
          Alterações salvas com sucesso!
        </div>
      )}

      {/* ============================================================
          MODO 1: LISTAGEM DE FORMULÁRIOS
          ============================================================ */}
      {modo === 'lista' && (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Top Bar da Listagem */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--tinta)',
                letterSpacing: '-0.02em',
                marginBottom: '4px'
              }}>
                Formulários
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--tinta-media)' }}>
                Crie formulários inteligentes de briefing, diagnóstico e captação para qualificar e converter leads automaticamente.
              </p>
            </div>

            <button
              onClick={() => setMostrandoCriarInline(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: 'var(--acao-fundo)',
                color: 'var(--acao-texto)',
                border: 'none',
                borderRadius: 'var(--raio-md)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                boxShadow: 'var(--sombra-sm)'
              }}
            >
              <Plus size={16} />
              Novo formulário
            </button>
          </div>

          {/* Caixa de Criação Rápida Inline (como no print 3) */}
          {mostrandoCriarInline && (
            <div style={{
              background: 'var(--papel-cartao)',
              border: '1px solid var(--aro-cor)',
              borderRadius: 'var(--raio-md)',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--sombra-sm)'
            }}>
              <input
                type="text"
                autoFocus
                placeholder="Nome do formulário..."
                value={nomeNovoForm}
                onChange={(e) => setNomeNovoForm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCriarInline();
                  if (e.key === 'Escape') setMostrandoCriarInline(false);
                }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  color: 'var(--tinta)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />

              <button
                onClick={handleCriarInline}
                disabled={!nomeNovoForm.trim()}
                style={{
                  padding: '10px 20px',
                  background: 'var(--acao-fundo)',
                  color: 'var(--acao-texto)',
                  border: 'none',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: nomeNovoForm.trim() ? 'pointer' : 'not-allowed',
                  opacity: nomeNovoForm.trim() ? 1 : 0.5
                }}
              >
                Criar
              </button>

              <button
                onClick={() => {
                  setMostrandoCriarInline(false);
                  setNomeNovoForm('');
                }}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  color: 'var(--tinta-media)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Lista de Cards de Formulários */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {formularios.map(form => (
              <div
                key={form.id}
                onClick={() => abrirEditor(form)}
                style={{
                  background: 'var(--papel-cartao)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--sombra-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--aro-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--aro-cor)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--raio-sm)',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: form.corDestaque || 'var(--iris-violeta)'
                  }}>
                    <FileText size={20} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--tinta)', fontSize: '1rem' }}>
                        {form.titulo}
                      </span>

                      {/* Badge de Status */}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 8px',
                        borderRadius: 'var(--raio-pill)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: form.status === 'publicado' ? 'rgba(0, 255, 157, 0.12)' : 'rgba(255, 178, 122, 0.15)',
                        color: form.status === 'publicado' ? 'var(--sinal-vivo)' : 'var(--iris-pessego)',
                        border: '1px solid var(--aro-cor)'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: form.status === 'publicado' ? 'var(--sinal-vivo)' : 'var(--iris-pessego)'
                        }} />
                        {form.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--tinta-media)' }}>
                      <span>{form.envios || 0} envios</span>
                      <span>•</span>
                      <span>{form.campos?.length || 0} perguntas</span>
                      {form.pipeline && form.pipeline !== 'none' && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--iris-azul)' }}>
                            Pipeline: {PIPELINES_OPCOES.find(p => p.id === form.pipeline)?.label || 'CRM'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações do Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setFormularioAtivo(form);
                      setRespostasPreview({});
                      setEnvioSucessoPreview(false);
                      setModalPreviewAberta(true);
                    }}
                    title="Visualizar formulário"
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      border: '1px solid var(--aro-cor)',
                      borderRadius: 'var(--raio-sm)',
                      color: 'var(--tinta-media)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <Eye size={14} />
                    Visualizar
                  </button>

                  <button
                    onClick={(e) => handleDuplicarFormulario(form, e)}
                    title="Duplicar formulário"
                    style={{
                      padding: '8px',
                      background: 'transparent',
                      border: '1px solid var(--aro-cor)',
                      borderRadius: 'var(--raio-sm)',
                      color: 'var(--tinta-media)',
                      cursor: 'pointer'
                    }}
                  >
                    <Copy size={14} />
                  </button>

                  <button
                    onClick={(e) => handleExcluirFormulario(form.id, e)}
                    title="Excluir formulário"
                    style={{
                      padding: '8px',
                      background: 'transparent',
                      border: '1px solid var(--aro-cor)',
                      borderRadius: 'var(--raio-sm)',
                      color: 'var(--tinta-fraca)',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          MODO 2: CONSTRUTOR / EDITOR (Visual como nos prints 1 e 2)
          ============================================================ */}
      {modo === 'editor' && formularioAtivo && (
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* Header Superior do Construtor */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '20px',
            marginBottom: '24px',
            borderBottom: '1px solid var(--aro-cor)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                onClick={() => {
                  setModo('lista');
                  setFormularioAtivo(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--tinta-media)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  padding: '6px 8px',
                  borderRadius: 'var(--raio-sm)'
                }}
              >
                <ArrowLeft size={16} />
                Formulários
              </button>

              <span style={{ color: 'var(--aro-cor)' }}>|</span>

              {/* Badge de Rascunho / Publicado */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: 'var(--raio-pill)',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: formularioAtivo.status === 'publicado' ? 'rgba(0, 255, 157, 0.12)' : 'rgba(255, 178, 122, 0.15)',
                color: formularioAtivo.status === 'publicado' ? 'var(--sinal-vivo)' : 'var(--iris-pessego)',
                border: '1px solid var(--aro-cor)'
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: formularioAtivo.status === 'publicado' ? 'var(--sinal-vivo)' : 'var(--iris-pessego)'
                }} />
                {formularioAtivo.status === 'publicado' ? 'Publicado' : 'Rascunho'}
              </span>
            </div>

            {/* Ações da Barra Superior Direita */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => {
                  setRespostasPreview({});
                  setEnvioSucessoPreview(false);
                  setModalPreviewAberta(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: 'var(--papel-cartao)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-md)',
                  color: 'var(--tinta)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <Eye size={15} />
                Visualizar
              </button>

              <button
                disabled
                title="Publicação ainda não conectada. Use Visualizar para testar localmente."
                onClick={() => setModalShareAberta(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: 'var(--papel-cartao)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-md)',
                  color: 'var(--tinta)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <Share2 size={15} />
                Compartilhar
              </button>

              <button
                onClick={() => {
                  const novoStatus = formularioAtivo.status === 'publicado' ? 'rascunho' : 'publicado';
                  handleSalvarEditor(novoStatus);
                }}
                disabled
                title="A publicação depende de conectar o recebimento de respostas ao servidor."
                style={{
                  padding: '8px 16px',
                  background: formularioAtivo.status === 'publicado' ? 'var(--papel-cartao)' : 'var(--iris-violeta)',
                  color: formularioAtivo.status === 'publicado' ? 'var(--tinta)' : 'var(--acao-texto)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {formularioAtivo.status === 'publicado' ? 'Despublicar' : 'Publicar'}
              </button>

              <button
                onClick={() => handleSalvarEditor()}
                style={{
                  padding: '8px 18px',
                  background: 'var(--acao-fundo)',
                  color: 'var(--acao-texto)',
                  border: 'none',
                  borderRadius: 'var(--raio-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: 'var(--sombra-sm)'
                }}
              >
                Salvar rascunho
              </button>
            </div>
          </div>

          {/* Grid de 2 Colunas: Configurações (Esquerda) vs Campos (Direita) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: '32px',
            alignItems: 'start'
          }}>
            
            {/* ---------------- COLUNA ESQUERDA: CONFIGURAÇÕES ---------------- */}
            <div style={{
              background: 'var(--papel-cartao)',
              border: '1px solid var(--aro-cor)',
              borderRadius: 'var(--raio-md)',
              padding: '24px',
              boxShadow: 'var(--sombra-sm)',
              position: 'sticky',
              top: '20px'
            }}>
              <h2 style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--tinta-media)',
                letterSpacing: 'var(--tracking-rotulo)',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                Configurações
              </h2>

              {/* Título */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                  Título *
                </label>
                <input
                  type="text"
                  value={formularioAtivo.titulo}
                  onChange={(e) => setFormularioAtivo(prev => ({ ...prev, titulo: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    color: 'var(--tinta)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Descrição */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                  Descrição
                </label>
                <textarea
                  rows={3}
                  placeholder="Opcional."
                  value={formularioAtivo.descricao}
                  onChange={(e) => setFormularioAtivo(prev => ({ ...prev, descricao: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    color: 'var(--tinta)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Mensagem de Agradecimento */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                  Mensagem de agradecimento
                </label>
                <textarea
                  rows={3}
                  placeholder="Exibida após envio"
                  value={formularioAtivo.agradecimento}
                  onChange={(e) => setFormularioAtivo(prev => ({ ...prev, agradecimento: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    color: 'var(--tinta)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Cor de Destaque */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '8px' }}>
                  Cor de destaque
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {CORES_PALETA.map(cor => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setFormularioAtivo(prev => ({ ...prev, corDestaque: cor }))}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--raio-sm)',
                        background: cor,
                        border: formularioAtivo.corDestaque === cor ? '2px solid var(--tinta)' : '1px solid var(--aro-cor)',
                        cursor: 'pointer',
                        transform: formularioAtivo.corDestaque === cor ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Pipeline (criar lead ao submeter) */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                  Pipeline (criar lead ao submeter)
                </label>
                <select
                  value={formularioAtivo.pipeline}
                  onChange={(e) => setFormularioAtivo(prev => ({ ...prev, pipeline: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    color: 'var(--tinta)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  {PIPELINES_OPCOES.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--tinta-media)', marginTop: '6px' }}>
                  Quando o visitante responder, criará automaticamente o contato no funil comercial do CRM.
                </span>
              </div>
            </div>

            {/* ---------------- COLUNA DIREITA: CAMPOS ---------------- */}
            <div>
              {/* Header da seção de Campos */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--tinta-media)',
                    letterSpacing: 'var(--tracking-rotulo)',
                    textTransform: 'uppercase'
                  }}>
                    Campos
                  </h2>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'var(--papel-fundo)',
                    padding: '2px 8px',
                    borderRadius: 'var(--raio-pill)',
                    color: 'var(--tinta-media)'
                  }}>
                    {formularioAtivo.campos.length}
                  </span>
                </div>

                <button
                  onClick={handleAdicionarCampo}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    color: 'var(--tinta)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} />
                  Adicionar campo
                </button>
              </div>

              {/* Lista de Cards de Campos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formularioAtivo.campos.map((campo, index) => (
                  <div
                    key={campo.id}
                    style={{
                      background: 'var(--papel-cartao)',
                      border: '1px solid var(--aro-cor)',
                      borderRadius: 'var(--raio-md)',
                      padding: '20px',
                      boxShadow: 'var(--sombra-sm)',
                      position: 'relative'
                    }}
                  >
                    {/* Linha de Topo do Card de Campo */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid var(--aro-cor)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoverCampo(index, -1)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              color: index === 0 ? 'var(--tinta-fantasma)' : 'var(--tinta-media)',
                              padding: '0'
                            }}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={index === formularioAtivo.campos.length - 1}
                            onClick={() => handleMoverCampo(index, 1)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: index === formularioAtivo.campos.length - 1 ? 'not-allowed' : 'pointer',
                              color: index === formularioAtivo.campos.length - 1 ? 'var(--tinta-fantasma)' : 'var(--tinta-media)',
                              padding: '0'
                            }}
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        <span style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: 'var(--papel-fundo)',
                          border: '1px solid var(--aro-cor)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--tinta)'
                        }}>
                          {index + 1}
                        </span>

                        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--tinta)' }}>
                          {campo.pergunta || 'Novo campo'}
                        </span>
                      </div>

                      {/* Lado Direito: Toggle Obrigatório e Botão Remover */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--tinta-media)' }}>
                          <input
                            type="checkbox"
                            checked={!!campo.obrigatorio}
                            onChange={(e) => handleAlterarCampo(campo.id, { obrigatorio: e.target.checked })}
                            style={{ cursor: 'pointer' }}
                          />
                          Obrigatório
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoverCampo(campo.id)}
                          title="Remover campo"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--tinta-fraca)',
                            padding: '4px'
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Inputs do Campo (Linha 1: Pergunta e Tipo) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 200px',
                      gap: '16px',
                      marginBottom: '14px'
                    }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-media)', marginBottom: '6px' }}>
                          Pergunta
                        </label>
                        <input
                          type="text"
                          value={campo.pergunta}
                          onChange={(e) => handleAlterarCampo(campo.id, { pergunta: e.target.value })}
                          placeholder="Ex: Qual o seu segmento oficial?"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'var(--papel-fundo)',
                            border: '1px solid var(--aro-cor)',
                            borderRadius: 'var(--raio-sm)',
                            color: 'var(--tinta)',
                            fontSize: '0.88rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-media)', marginBottom: '6px' }}>
                          Tipo
                        </label>
                        <select
                          value={campo.tipo}
                          onChange={(e) => handleAlterarCampo(campo.id, { tipo: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'var(--papel-fundo)',
                            border: '1px solid var(--aro-cor)',
                            borderRadius: 'var(--raio-sm)',
                            color: 'var(--tinta)',
                            fontSize: '0.88rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        >
                          {TIPOS_CAMPOS.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Inputs do Campo (Linha 2: Mapear para e Placeholder) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-media)', marginBottom: '6px' }}>
                          Mapear para
                        </label>
                        <select
                          value={campo.mapearPara}
                          onChange={(e) => handleAlterarCampo(campo.id, { mapearPara: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'var(--papel-fundo)',
                            border: '1px solid var(--aro-cor)',
                            borderRadius: 'var(--raio-sm)',
                            color: 'var(--tinta)',
                            fontSize: '0.88rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        >
                          {CAMPOS_MAP_CRM.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--tinta-media)', marginTop: '4px' }}>
                          Crie campos personalizados em Ajustes &gt; Campos personalizados para mapeá-los aqui.
                        </span>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-media)', marginBottom: '6px' }}>
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={campo.placeholder || ''}
                          onChange={(e) => handleAlterarCampo(campo.id, { placeholder: e.target.value })}
                          placeholder="Texto de ajuda (opcional)"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'var(--papel-fundo)',
                            border: '1px solid var(--aro-cor)',
                            borderRadius: 'var(--raio-sm)',
                            color: 'var(--tinta)',
                            fontSize: '0.88rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Botão no Rodapé: + Adicionar campo com borda tracejada */}
                <button
                  type="button"
                  onClick={handleAdicionarCampo}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'transparent',
                    border: '1px dashed var(--aro-cor-forte)',
                    borderRadius: 'var(--raio-md)',
                    color: 'var(--tinta-media)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--aro-hover)';
                    e.currentTarget.style.color = 'var(--tinta)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--aro-cor-forte)';
                    e.currentTarget.style.color = 'var(--tinta-media)';
                  }}
                >
                  <Plus size={16} />
                  Adicionar campo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 1: PREVIEW INTERATIVO AO VIVO DO FORMULÁRIO
          ============================================================ */}
      {modalPreviewAberta && formularioAtivo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--papel-cartao)',
            border: '1px solid var(--aro-cor)',
            borderRadius: 'var(--raio-lg)',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: 'var(--sombra-lg)',
            position: 'relative'
          }}>
            {/* Botão Fechar Modal */}
            <button
              onClick={() => setModalPreviewAberta(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--tinta-media)'
              }}
            >
              <X size={20} />
            </button>

            {/* Faixa superior de destaque com a cor selecionada */}
            <div style={{
              width: '100%',
              height: '6px',
              borderRadius: 'var(--raio-pill)',
              background: formularioAtivo.corDestaque || 'var(--iris-violeta)',
              marginBottom: '20px'
            }} />

            {!envioSucessoPreview ? (
              <form onSubmit={handleSubmeterPreview}>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--tinta)',
                  marginBottom: '8px'
                }}>
                  {formularioAtivo.titulo}
                </h3>

                {formularioAtivo.descricao && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--tinta-media)', marginBottom: '24px' }}>
                    {formularioAtivo.descricao}
                  </p>
                )}

                {/* Renderização de cada pergunta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
                  {formularioAtivo.campos.map(c => (
                    <div key={c.id}>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                        {c.pergunta} {c.obrigatorio && <span style={{ color: 'var(--iris-rosa)' }}>*</span>}
                      </label>

                      {c.tipo === 'texto_longo' ? (
                        <textarea
                          rows={3}
                          required={c.obrigatorio}
                          placeholder={c.placeholder}
                          value={respostasPreview[c.id] || ''}
                          onChange={(e) => setRespostasPreview({ ...respostasPreview, [c.id]: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background: 'var(--papel-fundo)',
                            border: '1px solid var(--aro-cor)',
                            borderRadius: 'var(--raio-sm)',
                            color: 'var(--tinta)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      ) : c.tipo === 'sim_nao' ? (
                        <div style={{ display: 'flex', gap: '16px' }}>
                          {['Sim', 'Não'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                              <input
                                type="radio"
                                name={c.id}
                                value={opt}
                                required={c.obrigatorio}
                                checked={respostasPreview[c.id] === opt}
                                onChange={(e) => setRespostasPreview({ ...respostasPreview, [c.id]: e.target.value })}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={c.tipo === 'email' ? 'email' : c.tipo === 'numero' ? 'number' : 'text'}
                          required={c.obrigatorio}
                          placeholder={c.placeholder}
                          value={respostasPreview[c.id] || ''}
                          onChange={(e) => setRespostasPreview({ ...respostasPreview, [c.id]: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background: 'var(--papel-fundo)',
                            border: '1px solid var(--aro-cor)',
                            borderRadius: 'var(--raio-sm)',
                            color: 'var(--tinta)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: formularioAtivo.corDestaque || 'var(--iris-violeta)',
                    color: 'var(--acao-texto)',
                    border: 'none',
                    borderRadius: 'var(--raio-md)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={16} />
                  Enviar formulário
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(0, 255, 157, 0.15)',
                  color: 'var(--sinal-vivo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px auto'
                }}>
                  <Check size={28} />
                </div>

                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--tinta)', marginBottom: '8px' }}>
                  Teste local concluído
                </h4>

                <p style={{ fontSize: '0.92rem', color: 'var(--tinta-media)', marginBottom: '24px' }}>
                  {formularioAtivo.agradecimento || 'Obrigado pelo envio! Nossa equipe entrará em contato.'}
                </p>

                {formularioAtivo.pipeline && formularioAtivo.pipeline !== 'none' && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--raio-sm)',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    fontSize: '0.8rem',
                    color: 'var(--iris-azul)',
                    marginBottom: '20px'
                  }}>
                    ✓ Novo lead registrado automaticamente no funil comercial do CRM!
                  </div>
                )}

                <button
                  onClick={() => {
                    setRespostasPreview({});
                    setEnvioSucessoPreview(false);
                  }}
                  style={{
                    padding: '8px 18px',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    color: 'var(--tinta)'
                  }}
                >
                  Enviar outra resposta
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: COMPARTILHAR / EMBED EM WEBSITES
          ============================================================ */}
      {modalShareAberta && formularioAtivo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--papel-cartao)',
            border: '1px solid var(--aro-cor)',
            borderRadius: 'var(--raio-lg)',
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            boxShadow: 'var(--sombra-lg)',
            position: 'relative'
          }}>
            <button
              onClick={() => setModalShareAberta(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--tinta-media)'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--tinta)', marginBottom: '8px' }}>
              Compartilhar Formulário
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--tinta-media)', marginBottom: '20px' }}>
              Compartilhe o link direto com clientes ou incorpore o formulário no seu site gerado pelo Repass AI.
            </p>

            {/* Link Direto */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                Link direto
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={urlPublica}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    fontSize: '0.85rem',
                    color: 'var(--tinta)'
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(urlPublica);
                    setCopiadoLink(true);
                    setTimeout(() => setCopiadoLink(false), 2000);
                  }}
                  style={{
                    padding: '8px 14px',
                    background: 'var(--acao-fundo)',
                    color: 'var(--acao-texto)',
                    border: 'none',
                    borderRadius: 'var(--raio-sm)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copiadoLink ? <Check size={14} /> : <Copy size={14} />}
                  {copiadoLink ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Código Embed */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                Código Embed (Iframe para sites)
              </label>
              <textarea
                rows={3}
                readOnly
                value={codigoEmbed}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--tinta)',
                  resize: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '8px'
                }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codigoEmbed);
                  setCopiadoEmbed(true);
                  setTimeout(() => setCopiadoEmbed(false), 2000);
                }}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--tinta)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {copiadoEmbed ? <Check size={14} /> : <Code size={14} />}
                {copiadoEmbed ? 'Código Embed Copiado!' : 'Copiar Iframe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
