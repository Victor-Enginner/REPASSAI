import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Send, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Filter,
  Search,
  LayoutGrid,
  List,
  Download,
  PhoneCall,
  Volume2,
  VolumeX,
  Bot,
  User,
  MoreVertical,
  Settings,
  ChevronDown,
  Layers,
  ArrowLeft,
  X,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import { generatePersonalizedScript, buildWhatsAppWebLink, podeAbordar } from '../services/whatsappBulkEngine';
import { dispararChamadaTelAgent, reproduzirAudioTelAgent, pararAudioTelAgent } from '../services/telAgentService';
import GradualBlur from '../components/ui/GradualBlur';

const DEFAULT_PIPELINES = [
  {
    id: 'b2b-repass',
    nome: 'B2B Repass AI',
    tipo: 'VENDAS',
    corTipo: 'var(--sucesso)',
    etapas: [
      { id: 'Novo', title: 'Novo', color: 'var(--iris-violeta)' },
      { id: 'Em contato', title: 'Em contato', color: 'var(--accent-cyan)' },
      { id: 'Proposta', title: 'Proposta', color: 'var(--estado-alerta)' },
      { id: 'Fechamento', title: 'Fechamento', color: 'var(--accent-indigo)' },
      { id: 'Convertidos', title: 'Ganhos / Fechado', color: 'var(--estado-sucesso)' }
    ]
  },
  {
    id: 'maps-osint',
    nome: 'Prospecção Google Maps',
    tipo: 'VENDAS',
    corTipo: 'var(--sucesso)',
    etapas: [
      { id: 'Leads em Aberto', title: 'Leads em Aberto', color: 'var(--accent-cyan)' },
      { id: 'Em Negociação', title: 'Em Negociação', color: 'var(--accent-indigo)' },
      { id: 'Agendados', title: 'Agendados', color: 'var(--estado-alerta)' },
      { id: 'Convertidos', title: 'Convertidos / Fechado', color: 'var(--estado-sucesso)' }
    ]
  },
  {
    id: 'processos-onboarding',
    nome: 'Processos & Ativação de Sites',
    tipo: 'PROCESSOS',
    corTipo: 'var(--iris-lilas)',
    etapas: [
      { id: 'Briefing', title: 'Briefing / Domínio', color: 'var(--iris-violeta)' },
      { id: 'Compilação', title: 'Em Compilação', color: 'var(--accent-indigo)' },
      { id: 'Revisão', title: 'Revisão Cliente', color: 'var(--estado-alerta)' },
      { id: 'Publicado', title: 'Publicado R2', color: 'var(--estado-sucesso)' }
    ]
  }
];

export default function CRMView({ leads, setLeads, onGenerateSite }) {
  // Pipelines
  const [pipelines, setPipelines] = useState(DEFAULT_PIPELINES);
  const [selectedPipelineId, setSelectedPipelineId] = useState('b2b-repass');
  const [pipelineDropdownOpen, setPipelineDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'lista' | 'gerenciar_pipelines'

  // Filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAtendente, setFiltroAtendente] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');

  // Modais
  const [selectedLeadForScript, setSelectedLeadForScript] = useState(null);
  const [modalNovoNegocio, setModalNovoNegocio] = useState(false);
  const [modalNovoPipeline, setModalNovoPipeline] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tel-Agent Live Session Modal
  const [telAgentSessao, setTelAgentSessao] = useState(null);
  const [isCallingTelAgent, setIsCallingTelAgent] = useState(false);
  const [audioTocando, setAudioTocando] = useState(false);

  // Formulário Novo Negócio
  const [novoNegocioNome, setNovoNegocioNome] = useState('');
  const [novoNegocioCategoria, setNovoNegocioCategoria] = useState('Barbearia');
  const [novoNegocioCidade, setNovoNegocioCidade] = useState('Franca');
  const [novoNegocioTelefone, setNovoNegocioTelefone] = useState('');
  const [novoNegocioValor, setNovoNegocioValor] = useState('1500');
  const [novoNegocioEtapa, setNovoNegocioEtapa] = useState('');

  // Formulário Novo Pipeline
  const [novoPipelineNome, setNovoPipelineNome] = useState('');
  const [novoPipelineTipo, setNovoPipelineTipo] = useState('VENDAS');

  const pipelineAtivo = useMemo(() => {
    return pipelines.find(p => p.id === selectedPipelineId) || pipelines[0];
  }, [pipelines, selectedPipelineId]);

  // Atribui valores e etapas aos leads se não possuírem
  const leadsEnriquecidos = useMemo(() => {
    return leads.map((lead, idx) => {
      // Normaliza status para o pipeline ativo se necessário
      const etapaValida = pipelineAtivo.etapas.some(e => e.id === lead.status_crm);
      const statusFinal = etapaValida 
        ? lead.status_crm 
        : (pipelineAtivo.etapas[0]?.id || 'Novo');

      return {
        ...lead,
        status_crm: statusFinal,
        valor: lead.valor || (1200 + ((idx * 350) % 3500)),
        atendente: lead.atendente || (idx % 2 === 0 ? 'Sofia IA (Tel-Agent)' : 'Victor Borsari')
      };
    });
  }, [leads, pipelineAtivo]);

  // Filtra leads pelo termo de busca e atendente
  const leadsFiltrados = useMemo(() => {
    return leadsEnriquecidos.filter(l => {
      if (searchTerm) {
        const termo = searchTerm.toLowerCase();
        const texto = `${l.nome || ''} ${l.cidade || ''} ${l.categoria || ''}`.toLowerCase();
        if (!texto.includes(termo)) return false;
      }
      if (filtroAtendente !== 'todos') {
        if (l.atendente !== filtroAtendente) return false;
      }
      return true;
    });
  }, [leadsEnriquecidos, searchTerm, filtroAtendente]);

  // Métricas do Top Bar
  const metricas = useMemo(() => {
    const etapasGanhos = ['Convertidos', 'Publicado', 'Convertidos / Fechado'];
    let emAbertoTotal = 0;
    let ganhosTotal = 0;
    let ganhosQtd = 0;

    leadsFiltrados.forEach(l => {
      if (etapasGanhos.includes(l.status_crm)) {
        ganhosTotal += Number(l.valor || 0);
        ganhosQtd += 1;
      } else {
        emAbertoTotal += Number(l.valor || 0);
      }
    });

    const totalFinalizados = leadsFiltrados.length;
    const taxaGanho = totalFinalizados > 0 
      ? Math.round((ganhosQtd / totalFinalizados) * 100) 
      : 0;

    return {
      emAberto: emAbertoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
      ganhos: ganhosTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
      taxaGanho: taxaGanho > 0 ? `${taxaGanho}%` : '-'
    };
  }, [leadsFiltrados]);

  const handleMoveStage = (leadId, newStage) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status_crm: newStage } : l));
  };

  const copyScriptText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Disparo de Chamada Tel-Agent com voz e sessão em tempo real
  const handleIniciarTelAgent = async (lead) => {
    setIsCallingTelAgent(true);
    const sessao = await dispararChamadaTelAgent(lead);
    setTelAgentSessao(sessao);
    setIsCallingTelAgent(false);

    // Reproduz áudio do agente de voz no navegador
    const textoFalar = sessao?.transcricao?.find(m => m.autor === 'ia')?.texto || 'Olá, tudo bem? Falo com o responsável?';
    setAudioTocando(true);
    reproduzirAudioTelAgent(
      textoFalar,
      () => setAudioTocando(true),
      () => setAudioTocando(false)
    );
  };

  const handlePararAudioTelAgent = () => {
    pararAudioTelAgent();
    setAudioTocando(false);
  };

  const handleConfirmarQualificacaoTelAgent = (novoStatus) => {
    if (telAgentSessao?.lead_id) {
      handleMoveStage(telAgentSessao.lead_id, novoStatus);
    }
    handlePararAudioTelAgent();
    setTelAgentSessao(null);
  };

  const handleCriarNegocio = (e) => {
    e.preventDefault();
    if (!novoNegocioNome) return;

    const novoId = `negocio_${Date.now()}`;
    const etapaInicial = novoNegocioEtapa || pipelineAtivo.etapas[0]?.id || 'Novo';

    const novo = {
      id: novoId,
      nome: novoNegocioNome,
      categoria: novoNegocioCategoria,
      cidade: novoNegocioCidade,
      estado: 'SP',
      telefone: novoNegocioTelefone || '(16) 99123-4567',
      whatsapp: novoNegocioTelefone ? `https://wa.me/55${novoNegocioTelefone.replace(/\D/g, '')}` : null,
      status_crm: etapaInicial,
      temperatura: 'Quente',
      status_site: 'sem_site',
      score: 95,
      valor: Number(novoNegocioValor) || 1500,
      atendente: 'Sofia IA (Tel-Agent)',
      enviado_crm: true,
      is_demo: false,
      criado_em: new Date().toISOString()
    };

    setLeads(prev => [novo, ...prev]);
    setModalNovoNegocio(false);
    setNovoNegocioNome('');
    setNovoNegocioTelefone('');
  };

  const handleCriarPipeline = (e) => {
    e.preventDefault();
    if (!novoPipelineNome) return;

    const novoId = `pipe_${Date.now()}`;
    const novo = {
      id: novoId,
      nome: novoPipelineNome,
      tipo: novoPipelineTipo,
      corTipo: novoPipelineTipo === 'VENDAS' ? 'var(--sucesso)' : 'var(--iris-lilas)',
      etapas: [
        { id: 'Novo', title: 'Novo', color: 'var(--iris-violeta)' },
        { id: 'Em contato', title: 'Em contato', color: 'var(--accent-cyan)' },
        { id: 'Proposta', title: 'Proposta', color: 'var(--estado-alerta)' },
        { id: 'Convertidos', title: 'Fechado', color: 'var(--estado-sucesso)' }
      ]
    };

    setPipelines(prev => [...prev, novo]);
    setSelectedPipelineId(novoId);
    setModalNovoPipeline(false);
    setNovoPipelineNome('');
    setViewMode('kanban');
  };

  return (
    <div style={{ position: 'relative', padding: '24px 32px', maxWidth: '1680px', margin: '0 auto', animation: 'fadeIn 0.25s ease' }}>
      
      {/* ============================================================== */}
      {/* TOP BAR EXECUTIVO DO CRM (Referência Exata das Telas do Usuário) */}
      {/* ============================================================== */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '14px 20px',
          background: 'var(--papel-cartao)',
          border: '1px solid var(--aro-cor)',
          borderRadius: 'var(--raio-md)',
          boxShadow: 'var(--sombra-sm)',
          marginBottom: '24px'
        }}
      >
        {/* Esquerda: Seletor de Pipeline + Métricas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Dropdown do Pipeline Ativo */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setPipelineDropdownOpen(!pipelineDropdownOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--raio-pill)',
                border: '1px solid var(--aro-cor)',
                background: 'var(--papel-elevado)',
                color: 'var(--tinta)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <span>{pipelineAtivo.nome}</span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: 'var(--raio-pill)',
                  backgroundColor: 'var(--sucesso-fundo)',
                  color: pipelineAtivo.corTipo || 'var(--sucesso)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {pipelineAtivo.tipo}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--tinta-fraca)' }} />
            </button>

            {/* Menu Popover de Pipelines */}
            {pipelineDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '240px',
                  backgroundColor: 'var(--papel-cartao)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-md)',
                  boxShadow: 'var(--sombra-lg)',
                  zIndex: 50,
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {pipelines.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPipelineId(p.id);
                      setPipelineDropdownOpen(false);
                      if (viewMode === 'gerenciar_pipelines') setViewMode('kanban');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--raio-sm)',
                      border: 'none',
                      backgroundColor: p.id === selectedPipelineId ? 'var(--papel-elevado)' : 'transparent',
                      color: 'var(--tinta)',
                      fontSize: '12.5px',
                      fontWeight: p.id === selectedPipelineId ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{p.nome}</span>
                    <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: 'var(--raio-pill)', backgroundColor: 'var(--sobre-08)', color: 'var(--tinta-media)' }}>
                      {p.tipo}
                    </span>
                  </button>
                ))}

                <div style={{ height: '1px', backgroundColor: 'var(--aro-cor)', margin: '4px 0' }} />

                <button
                  onClick={() => {
                    setPipelineDropdownOpen(false);
                    setModalNovoPipeline(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--raio-sm)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--tinta-media)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={13} />
                  Novo pipeline
                </button>

                <button
                  onClick={() => {
                    setPipelineDropdownOpen(false);
                    setViewMode('gerenciar_pipelines');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--raio-sm)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--tinta-media)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <Settings size={13} />
                  Gerenciar pipelines
                </button>
              </div>
            )}
          </div>

          {/* Métricas do Funil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', borderLeft: '1px solid var(--aro-cor)', paddingLeft: '18px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>Em aberto</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tinta)' }}>{metricas.emAberto}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>Ganhos</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sucesso)' }}>{metricas.ganhos}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>Taxa de ganho</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tinta)' }}>{metricas.taxaGanho}</div>
            </div>
          </div>

        </div>

        {/* Direita: Busca, Filtros, Visualizações e Botão Novo Negócio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Busca de Negócio */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--tinta-fraca)' }} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar negócio..."
              style={{
                padding: '7px 12px 7px 30px',
                borderRadius: 'var(--raio-md)',
                border: '1px solid var(--aro-cor)',
                backgroundColor: 'var(--papel-fundo)',
                color: 'var(--tinta)',
                fontSize: '12.5px',
                width: '180px',
                outline: 'none'
              }}
            />
          </div>

          {/* Filtro Atendente */}
          <button
            onClick={() => setFiltroAtendente(filtroAtendente === 'todos' ? 'Sofia IA (Tel-Agent)' : 'todos')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: 'var(--raio-md)',
              border: '1px solid var(--aro-cor)',
              backgroundColor: filtroAtendente !== 'todos' ? 'var(--papel-elevado)' : 'var(--papel-cartao)',
              color: 'var(--tinta)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Filter size={13} style={{ color: 'var(--tinta-fraca)' }} />
            {filtroAtendente === 'todos' ? 'Atendente' : 'Sofia IA'}
          </button>

          {/* Alternador Kanban / Lista */}
          <div style={{ display: 'flex', borderRadius: 'var(--raio-md)', border: '1px solid var(--aro-cor)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                border: 'none',
                backgroundColor: viewMode === 'kanban' ? 'var(--papel-elevado)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--tinta)' : 'var(--tinta-fraca)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={13} />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('lista')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                border: 'none',
                borderLeft: '1px solid var(--aro-cor)',
                backgroundColor: viewMode === 'lista' ? 'var(--papel-elevado)' : 'transparent',
                color: viewMode === 'lista' ? 'var(--tinta)' : 'var(--tinta-fraca)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <List size={13} />
              Lista
            </button>
          </div>

          {/* Botão Novo Negócio */}
          <button
            onClick={() => setModalNovoNegocio(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--raio-md)',
              border: 'none',
              backgroundColor: 'var(--acao-fundo)',
              color: 'var(--acao-texto)',
              fontWeight: 600,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: 'var(--sombra-sm)'
            }}
          >
            <Plus size={14} />
            Novo negócio
          </button>

        </div>
      </div>

      {/* ============================================================== */}
      {/* MODO 1: TELA DE GERENCIAR PIPELINES (Referência Imagem 4 & 5) */}
      {/* ============================================================== */}
      {viewMode === 'gerenciar_pipelines' && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--raio-pill)',
                  border: '1px solid var(--aro-cor)',
                  backgroundColor: 'var(--papel-cartao)',
                  color: 'var(--tinta)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}
              >
                <ArrowLeft size={13} />
                Voltar ao Funil Kanban
              </button>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--tinta)' }}>
                Pipelines
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--tinta-media)', marginTop: '4px' }}>
                Funis de venda e processos, com escopo por empresa.
              </p>
            </div>

            <button
              onClick={() => setModalNovoPipeline(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: 'var(--raio-md)',
                border: 'none',
                backgroundColor: 'var(--acao-fundo)',
                color: 'var(--acao-texto)',
                fontWeight: 600,
                fontSize: '12.5px',
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              Novo pipeline
            </button>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
            COMPARTILHADOS COM A CONTA
          </div>

          {/* Lista de Pipelines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pipelines.map(pipe => {
              const totalAbertos = leadsEnriquecidos.filter(l => pipe.etapas.some(e => e.id === l.status_crm)).length;

              return (
                <div
                  key={pipe.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--raio-lg)',
                    border: '1px solid var(--aro-cor)',
                    backgroundColor: 'var(--papel-cartao)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tinta)' }}>
                        {pipe.nome}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: 'var(--raio-pill)',
                          backgroundColor: 'var(--sucesso-fundo)',
                          color: pipe.corTipo || 'var(--sucesso)',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {pipe.tipo}
                      </span>
                    </div>

                    {/* Badges de Etapas */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {pipe.etapas.map(et => (
                        <span
                          key={et.id}
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: 'var(--raio-pill)',
                            border: '1px solid var(--aro-cor)',
                            backgroundColor: 'var(--papel-elevado)',
                            color: et.color,
                            fontWeight: 600
                          }}
                        >
                          {et.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>
                      {totalAbertos} aberto(s)
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPipelineId(pipe.id);
                        setViewMode('kanban');
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        borderRadius: 'var(--raio-md)',
                        border: '1px solid var(--aro-cor)',
                        backgroundColor: 'var(--papel-fundo)',
                        color: 'var(--tinta)',
                        cursor: 'pointer'
                      }}
                    >
                      Abrir Funil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODO 2: KANBAN BOARD DAS ETAPAS DO PIPELINE ATIVO */}
      {/* ============================================================== */}
      {viewMode === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${pipelineAtivo.etapas.length}, minmax(280px, 1fr))`, gap: '16px', overflowX: 'auto', paddingBottom: '20px' }}>
          {pipelineAtivo.etapas.map(col => {
            const colLeads = leadsFiltrados.filter(l => l.status_crm === col.id);
            const totalColuna = colLeads.reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

            return (
              <div 
                key={col.id}
                style={{
                  borderRadius: 'var(--raio-lg)',
                  padding: '16px',
                  minHeight: 'calc(100vh - 230px)',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--papel-elevado)',
                  border: '1px solid var(--aro-cor)',
                  position: 'relative'
                }}
              >
                {/* Cabeçalho da Coluna com Nome, Contagem e Valor Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--aro-cor)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                      <h3 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--tinta)' }}>
                        {col.title}
                      </h3>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>
                        {colLeads.length}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--tinta-media)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      {totalColuna.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setNovoNegocioEtapa(col.id);
                      setModalNovoNegocio(true);
                    }}
                    title="Adicionar negócio nesta etapa"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--raio-sm)',
                      border: '1px solid var(--aro-cor)',
                      backgroundColor: 'var(--papel-cartao)',
                      color: 'var(--tinta-fraca)',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Cards da Coluna */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                  {colLeads.length === 0 ? (
                    <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--tinta-fraca)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                      Nenhum negócio nesta etapa
                    </div>
                  ) : (
                    colLeads.map(lead => {
                      const script = generatePersonalizedScript(lead);
                      const { permitido } = podeAbordar(lead);
                      const waLink = permitido ? buildWhatsAppWebLink(lead.telefone, script) : null;

                      return (
                        <div 
                          key={lead.id}
                          style={{
                            backgroundColor: 'var(--papel-cartao)',
                            border: '1px solid var(--aro-cor)',
                            borderRadius: 'var(--raio-md)',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            boxShadow: 'var(--sombra-sm)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Topo do Card: Nome e Valor */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: 'var(--tinta)', lineHeight: 1.3 }}>
                                {lead.nome}
                              </h4>
                              <div style={{ fontSize: '11px', color: 'var(--tinta-fraca)', marginTop: '2px' }}>
                                {lead.categoria} · {lead.cidade}
                              </div>
                            </div>
                            <span 
                              style={{ 
                                fontSize: '11.5px', 
                                fontWeight: 700, 
                                color: 'var(--tinta)', 
                                fontFamily: 'var(--font-mono)',
                                padding: '2px 6px',
                                borderRadius: 'var(--raio-sm)',
                                backgroundColor: 'var(--sobre-08)'
                              }}
                            >
                              {(lead.valor || 1500).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                            </span>
                          </div>

                          {/* Telefone e Atendente */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--tinta-media)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={11} style={{ color: 'var(--tinta-fraca)' }} />
                              {lead.telefone || 'Sem telefone'}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--tinta-fraca)' }}>
                              {lead.atendente}
                            </span>
                          </div>

                          {/* Botões de Ação Rápida: TEL-AGENT IA + WhatsApp + Script */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6px', paddingTop: '4px' }}>
                            
                            {/* Disparo Tel-Agent de Voz IA */}
                            <button
                              onClick={() => handleIniciarTelAgent(lead)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                padding: '6px 8px',
                                fontSize: '10.5px',
                                fontWeight: 600,
                                borderRadius: 'var(--raio-sm)',
                                border: '1px solid var(--aro-cor)',
                                backgroundColor: 'var(--iris-violeta)',
                                color: 'var(--branco)',
                                cursor: 'pointer'
                              }}
                            >
                              <PhoneCall size={11} />
                              Ligar (Tel-Agent)
                            </button>

                            {/* WhatsApp Web */}
                            {waLink ? (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  padding: '6px 8px',
                                  fontSize: '10.5px',
                                  fontWeight: 600,
                                  borderRadius: 'var(--raio-sm)',
                                  border: '1px solid var(--aro-cor)',
                                  backgroundColor: 'var(--sucesso-fundo)',
                                  color: 'var(--sucesso)',
                                  textDecoration: 'none'
                                }}
                              >
                                <MessageSquare size={11} />
                                WhatsApp
                              </a>
                            ) : (
                              <button
                                onClick={() => setSelectedLeadForScript(lead)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  padding: '6px 8px',
                                  fontSize: '10.5px',
                                  fontWeight: 500,
                                  borderRadius: 'var(--raio-sm)',
                                  border: '1px solid var(--aro-cor)',
                                  backgroundColor: 'var(--papel-fundo)',
                                  color: 'var(--tinta-media)',
                                  cursor: 'pointer'
                                }}
                              >
                                <Sparkles size={11} />
                                Script IA
                              </button>
                            )}

                          </div>

                          {/* Mudança de Estágio no Funil */}
                          <div style={{ display: 'flex', gap: '4px', paddingTop: '6px', borderTop: '1px solid var(--aro-cor)' }}>
                            {pipelineAtivo.etapas.map(et => {
                              if (et.id === col.id) return null;
                              return (
                                <button
                                  key={et.id}
                                  onClick={() => handleMoveStage(lead.id, et.id)}
                                  title={`Mover para ${et.title}`}
                                  style={{
                                    flex: 1,
                                    padding: '4px 2px',
                                    borderRadius: 'var(--raio-sm)',
                                    border: '1px solid var(--aro-cor)',
                                    backgroundColor: 'var(--papel-fundo)',
                                    color: 'var(--tinta-media)',
                                    fontSize: '9.5px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  → {et.title}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODO 3: VISUALIZAÇÃO EM LISTA TABULAR */}
      {/* ============================================================== */}
      {viewMode === 'lista' && (
        <div style={{ borderRadius: 'var(--raio-lg)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-cartao)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-elevado)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>NEGÓCIO</th>
                <th style={{ padding: '12px 16px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>ETAPA</th>
                <th style={{ padding: '12px 16px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>VALOR</th>
                <th style={{ padding: '12px 16px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>CONTATO</th>
                <th style={{ padding: '12px 16px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>ATENDENTE</th>
                <th style={{ padding: '12px 16px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)', fontSize: '11px', textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {leadsFiltrados.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--aro-cor)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--tinta)' }}>{lead.nome}</div>
                    <div style={{ fontSize: '11px', color: 'var(--tinta-fraca)' }}>{lead.categoria} · {lead.cidade}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: 'var(--raio-pill)', border: '1px solid var(--aro-cor)', fontWeight: 600 }}>
                      {lead.status_crm}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--tinta)' }}>
                    {(lead.valor || 1500).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--tinta-media)' }}>
                    {lead.telefone || '-'}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--tinta-media)' }}>
                    {lead.atendente}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => handleIniciarTelAgent(lead)}
                        style={{ padding: '6px 10px', borderRadius: 'var(--raio-sm)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--iris-violeta)', color: 'var(--branco)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Ligar IA
                      </button>
                      <button
                        onClick={() => setSelectedLeadForScript(lead)}
                        style={{ padding: '6px 10px', borderRadius: 'var(--raio-sm)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-fundo)', color: 'var(--tinta)', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Script
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: SESSÃO ATIVA TEL-AGENT COM VOZ IA E QUALIFICAÇÃO CRM */}
      {/* ============================================================== */}
      {telAgentSessao && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-lg)', maxWidth: '640px', width: '100%', padding: '24px', boxShadow: 'var(--sombra-lg)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--aro-cor)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={18} style={{ color: 'var(--iris-violeta)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--tinta)' }}>
                  Tel-Agent // Chamada em Andamento
                </h3>
              </div>
              <button 
                onClick={() => {
                  handlePararAudioTelAgent();
                  setTelAgentSessao(null);
                }} 
                style={{ background: 'none', border: 'none', color: 'var(--tinta-fraca)', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            {/* Informações da Ligação */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--papel-fundo)', borderRadius: 'var(--raio-md)', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tinta)' }}>{telAgentSessao.lead_nome}</div>
                <div style={{ fontSize: '12px', color: 'var(--tinta-fraca)' }}>{telAgentSessao.telefone}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {audioTocando ? (
                  <button 
                    onClick={handlePararAudioTelAgent}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: 'var(--raio-pill)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--estado-alerta)', color: 'var(--branco)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <VolumeX size={13} />
                    Pausar Voz
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      const msg = telAgentSessao.transcricao.find(m => m.autor === 'ia')?.texto || 'Olá!';
                      reproduzirAudioTelAgent(msg, () => setAudioTocando(true), () => setAudioTocando(false));
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: 'var(--raio-pill)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--iris-violeta)', color: 'var(--branco)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Volume2 size={13} />
                    Ouvir Áudio da Chamada
                  </button>
                )}
                <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--raio-pill)', backgroundColor: 'var(--sucesso-fundo)', color: 'var(--sucesso)', fontWeight: 700 }}>
                  CONECTADA
                </span>
              </div>
            </div>

            {/* Transcrição da Conversa */}
            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', backgroundColor: 'var(--papel-elevado)', borderRadius: 'var(--raio-md)', marginBottom: '20px' }}>
              {telAgentSessao.transcricao.map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    alignSelf: item.autor === 'ia' ? 'flex-end' : (item.autor === 'lead' ? 'flex-start' : 'center'),
                    maxWidth: item.autor === 'sistema' ? '100%' : '80%',
                    padding: item.autor === 'sistema' ? '4px 10px' : '8px 12px',
                    borderRadius: 'var(--raio-md)',
                    backgroundColor: item.autor === 'ia' ? 'var(--iris-violeta)' : (item.autor === 'lead' ? 'var(--papel-cartao)' : 'var(--sobre-08)'),
                    color: item.autor === 'ia' ? 'var(--branco)' : (item.autor === 'lead' ? 'var(--tinta)' : 'var(--tinta-fraca)'),
                    fontSize: '12px',
                    lineHeight: 1.4
                  }}
                >
                  <div style={{ fontSize: '9.5px', opacity: 0.8, marginBottom: '2px', fontFamily: 'var(--font-mono)' }}>
                    {item.autor === 'ia' ? 'Sofia IA (Tel-Agent)' : (item.autor === 'lead' ? 'Cliente' : 'Sistema')} · {item.tempo}
                  </div>
                  {item.texto}
                </div>
              ))}
            </div>

            {/* Ações de Qualificação e Movimentação no CRM */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleConfirmarQualificacaoTelAgent('Proposta')}
                style={{ flex: 1, padding: '10px', borderRadius: 'var(--raio-md)', border: 'none', backgroundColor: 'var(--sucesso)', color: 'var(--branco)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                ✓ Qualificar & Mover para Proposta
              </button>
              <button
                onClick={() => handleConfirmarQualificacaoTelAgent('Em contato')}
                style={{ flex: 1, padding: '10px', borderRadius: 'var(--raio-md)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-fundo)', color: 'var(--tinta)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                Reagendar / Em Contato
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CRIAR NOVO NEGÓCIO */}
      {/* ============================================================== */}
      {modalNovoNegocio && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <form onSubmit={handleCriarNegocio} style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-lg)', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: 'var(--sombra-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--tinta)' }}>Novo Negócio</h3>
              <button type="button" onClick={() => setModalNovoNegocio(false)} style={{ background: 'none', border: 'none', color: 'var(--tinta-fraca)', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--tinta-media)', display: 'block', marginBottom: '4px' }}>Nome da Empresa / Cliente</label>
                <input 
                  type="text" 
                  required 
                  value={novoNegocioNome} 
                  onChange={(e) => setNovoNegocioNome(e.target.value)} 
                  placeholder="Ex: Studio VIP Barbearia"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--raio-sm)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-fundo)', color: 'var(--tinta)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--tinta-media)', display: 'block', marginBottom: '4px' }}>Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  value={novoNegocioTelefone} 
                  onChange={(e) => setNovoNegocioTelefone(e.target.value)} 
                  placeholder="(16) 99123-4567"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--raio-sm)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-fundo)', color: 'var(--tinta)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--tinta-media)', display: 'block', marginBottom: '4px' }}>Valor do Negócio (R$)</label>
                  <input 
                    type="number" 
                    value={novoNegocioValor} 
                    onChange={(e) => setNovoNegocioValor(e.target.value)} 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--raio-sm)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-fundo)', color: 'var(--tinta)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--tinta-media)', display: 'block', marginBottom: '4px' }}>Etapa Inicial</label>
                  <select
                    value={novoNegocioEtapa}
                    onChange={(e) => setNovoNegocioEtapa(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--raio-sm)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-fundo)', color: 'var(--tinta)', fontSize: '13px' }}
                  >
                    {pipelineAtivo.etapas.map(et => (
                      <option key={et.id} value={et.id}>{et.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '10px', borderRadius: 'var(--raio-md)', border: 'none', backgroundColor: 'var(--acao-fundo)', color: 'var(--acao-texto)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              Salvar Negócio no Funil
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CRIAR NOVO PIPELINE */}
      {/* ============================================================== */}
      {modalNovoPipeline && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <form onSubmit={handleCriarPipeline} style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-lg)', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: 'var(--sombra-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--tinta)' }}>Novo Pipeline</h3>
              <button type="button" onClick={() => setModalNovoPipeline(false)} style={{ background: 'none', border: 'none', color: 'var(--tinta-fraca)', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--tinta-media)', display: 'block', marginBottom: '4px' }}>Nome do Pipeline</label>
                <input 
                  type="text" 
                  required 
                  value={novoPipelineNome} 
                  onChange={(e) => setNovoPipelineNome(e.target.value)} 
                  placeholder="Ex: Pós-Venda & Renovação"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--raio-sm)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-fundo)', color: 'var(--tinta)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--tinta-media)', display: 'block', marginBottom: '4px' }}>Escopo / Tipo</label>
                <select
                  value={novoPipelineTipo}
                  onChange={(e) => setNovoPipelineTipo(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--raio-sm)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-fundo)', color: 'var(--tinta)', fontSize: '13px' }}
                >
                  <option value="VENDAS">VENDAS</option>
                  <option value="PROCESSOS">PROCESSOS</option>
                  <option value="ONBOARDING">ONBOARDING</option>
                </select>
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '10px', borderRadius: 'var(--raio-md)', border: 'none', backgroundColor: 'var(--acao-fundo)', color: 'var(--acao-texto)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              Criar Pipeline
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ROTEIRO IA / WHATSAPP */}
      {/* ============================================================== */}
      {selectedLeadForScript && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-lg)', maxWidth: '540px', width: '100%', padding: '24px', boxShadow: 'var(--sombra-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--iris-violeta)', fontFamily: 'var(--font-mono)' }}>
                ROTEIRO IA // {selectedLeadForScript.nome}
              </div>
              <button onClick={() => setSelectedLeadForScript(null)} style={{ background: 'none', border: 'none', color: 'var(--tinta-fraca)', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ backgroundColor: 'var(--papel-fundo)', padding: '16px', borderRadius: 'var(--raio-md)', fontSize: '13px', color: 'var(--tinta)', lineHeight: 1.6, whiteSpace: 'pre-line', maxHeight: '280px', overflowY: 'auto', marginBottom: '20px' }}>
              {generatePersonalizedScript(selectedLeadForScript)}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => copyScriptText(generatePersonalizedScript(selectedLeadForScript))}
                style={{ flex: 1, padding: '10px', borderRadius: 'var(--raio-md)', border: '1px solid var(--aro-cor)', backgroundColor: 'var(--papel-fundo)', color: 'var(--tinta)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {copied ? <Check size={14} style={{ color: 'var(--sucesso)' }} /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>

              <a
                href={
                  podeAbordar(selectedLeadForScript).permitido
                    ? buildWhatsAppWebLink(selectedLeadForScript.telefone, generatePersonalizedScript(selectedLeadForScript))
                    : undefined
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--raio-md)',
                  backgroundColor: 'var(--sucesso)',
                  color: 'var(--branco)',
                  fontWeight: 600,
                  fontSize: '12px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Send size={14} /> Abrir WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
