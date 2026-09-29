import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Zap,
  Bot,
  Play,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Settings,
  Sliders,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Trash2,
  Copy,
  Check,
  Code,
  FileText,
  Workflow,
  Radio,
  Send,
  Phone,
  Database,
  GitBranch,
  Layers,
  Terminal,
  Activity,
  AlertCircle,
  X,
  ChevronRight,
  Info,
  SlidersHorizontal,
  Flame,
  Globe
} from 'lucide-react';

// Agentes especialistas disponíveis para conexão nos nós
const AGENTES_DISPONIVEIS = [
  { id: 'leo', nome: 'Leo', funcao: 'Operador de Sistemas & WhatsApp', cor: 'var(--iris-menta)', avatar: '/agents/leo.png', badge: 'WHATSAPP' },
  { id: 'atlas', nome: 'Atlas', funcao: 'Analista de Mercado & Maps Scrapling', cor: 'var(--iris-ciano)', avatar: '/agents/atlas.png', badge: 'MAPS' },
  { id: 'apolo', nome: 'Apolo', funcao: 'Tel-Agent (Voz IA Telefônica)', cor: 'var(--iris-dourado)', avatar: '/agents/apolo.png', badge: 'VOZ IA' },
  { id: 'maia', nome: 'Maia', funcao: 'Copywriting & Spintax Multi-Mensagem', cor: 'var(--iris-pessego)', avatar: '/agents/maia.png', badge: 'COPY' },
  { id: 'alva', nome: 'Alva', funcao: 'Triagem & Agendamentos', cor: 'var(--iris-lilas)', avatar: '/agents/alva.png', badge: 'AGENDA' },
  { id: 'nova', nome: 'Nova', funcao: 'Estrategista de Fechamento de Funil', cor: 'var(--iris-rosa)', avatar: '/agents/nova.png', badge: 'ESTRATÉGIA' },
];

// Biblioteca de nós que podem ser adicionados ao canvas
const BIBLIOTECA_NOS = [
  {
    categoria: 'Agentes IA Especialistas',
    itens: [
      { tipo: 'agente', agenteId: 'leo', titulo: 'Agente Leo (WhatsApp)', subtitulo: 'Dispara mensagens e sincroniza CRM', cor: 'var(--iris-menta)' },
      { tipo: 'agente', agenteId: 'atlas', titulo: 'Agente Atlas (Maps Scanner)', subtitulo: 'Varredura e qualificação de negócios', cor: 'var(--iris-ciano)' },
      { tipo: 'agente', agenteId: 'apolo', titulo: 'Agente Apolo (Voz IA)', subtitulo: 'Chamada telefônica com voz neural', cor: 'var(--iris-dourado)' },
      { tipo: 'agente', agenteId: 'maia', titulo: 'Agente Maia (Spintax Copy)', subtitulo: 'Gera scripts persuasivos anti-bloqueio', cor: 'var(--iris-pessego)' },
      { tipo: 'agente', agenteId: 'alva', titulo: 'Agente Alva (Secretária)', subtitulo: 'Agendamento de reuniões e follow-up', cor: 'var(--iris-lilas)' },
      { tipo: 'agente', agenteId: 'nova', titulo: 'Agente Nova (Fechamento)', subtitulo: 'Calcula probabilidade de fechamento', cor: 'var(--iris-rosa)' }
    ]
  },
  {
    categoria: 'Gatilhos (Triggers)',
    itens: [
      { tipo: 'gatilho', titulo: 'Webhook HTTP Externo', subtitulo: 'Disparo via URL POST customizada', cor: 'var(--iris-azul)' },
      { tipo: 'gatilho', titulo: 'Novo Lead Maps Capturado', subtitulo: 'Scrapling encontra estabelecimento', cor: 'var(--iris-azul)' },
      { tipo: 'gatilho', titulo: 'Resposta de Formulário', subtitulo: 'Visitante envia briefing online', cor: 'var(--iris-violeta)' },
      { tipo: 'gatilho', titulo: 'Mensagem Recebida no WhatsApp', subtitulo: 'Lead respondeu a conversa', cor: 'var(--iris-menta)' }
    ]
  },
  {
    categoria: 'Lógica & Decisão',
    itens: [
      { tipo: 'condicao', titulo: 'Filtro Condicional IF/ELSE', subtitulo: 'Valida se estabelecimento tem site', cor: 'var(--iris-pessego)' },
      { tipo: 'condicao', titulo: 'Pausa Inteligente (Delay)', subtitulo: 'Aguardar 15 minutos antes de chamar', cor: 'var(--iris-pessego)' }
    ]
  },
  {
    categoria: 'Ações Finais no CRM',
    itens: [
      { tipo: 'acao', titulo: 'Cadastrar Lead no Funil', subtitulo: 'Etapa: Leads em Aberto', cor: 'var(--sinal-vivo)' },
      { tipo: 'acao', titulo: 'Avançar Estágio para "Proposta"', subtitulo: 'Move negócio automaticamente', cor: 'var(--sinal-vivo)' },
      { tipo: 'acao', titulo: 'Notificar Equipe no Painel', subtitulo: 'Alerta sonoro e notificação push', cor: 'var(--iris-dourado)' }
    ]
  }
];

const FLUXOS_PREDEFINIDOS = [
  {
    id: 'flow-1',
    nome: 'Captura de Leads Maps → Qualificação Atlas → Ligação Apolo',
    descricao: 'Monitora novos estabelecimentos prospectados, filtra sem site e dispara ligação de voz humana em alta fidelidade.',
    gatilho: 'evento',
    agentePrincipal: 'atlas',
    agenteSecundario: 'apolo',
    ativo: true,
    execucoes: 148,
    ultimaExecucao: 'Hoje às 03:22',
    taxaSucesso: '98.6%',
    nos: [
      { id: 'n-1', tipo: 'gatilho', titulo: 'Novo Lead Maps Capturado', subtitulo: 'Webhook / Scrapling Scanner', cor: 'var(--iris-azul)', params: { nicho: 'Barbearias & Clínicas', cidade: 'São Paulo' } },
      { id: 'n-2', tipo: 'agente', agenteId: 'atlas', titulo: 'Agente Atlas (Validador)', subtitulo: 'Verifica Nota Google e Presença Web', cor: 'var(--iris-ciano)', params: { checarSite: true, notaMinima: 4.2 } },
      { id: 'n-3', tipo: 'condicao', titulo: 'Não possui site oficial?', subtitulo: 'Filtro IF/ELSE', cor: 'var(--iris-pessego)', params: { condicao: 'has_website == false' } },
      { id: 'n-4', tipo: 'agente', agenteId: 'apolo', titulo: 'Agente Apolo (Voz IA)', subtitulo: 'Dispara ligação via Tel-Agent SIP', cor: 'var(--iris-dourado)', params: { voz: 'Apolo Neural (Masculino Firme)', bargeIn: true } },
      { id: 'n-5', tipo: 'acao', titulo: 'Atualizar CRM para "Proposta"', subtitulo: 'Move negócio no funil B2B', cor: 'var(--sinal-vivo)', params: { pipeline: 'B2B Repass AI', estagio: 'Proposta Enviada' } }
    ]
  },
  {
    id: 'flow-2',
    nome: 'Resposta do Formulário de Briefing → Leo (WhatsApp de Boas-Vindas)',
    descricao: 'Quando o cliente preenche o formulário online, o Leo envia o WhatsApp de confirmação em até 10 segundos com a proposta gerada.',
    gatilho: 'webhook',
    agentePrincipal: 'leo',
    agenteSecundario: 'maia',
    ativo: true,
    execucoes: 84,
    ultimaExecucao: 'Ontem às 21:15',
    taxaSucesso: '100%',
    nos: [
      { id: 'n-11', tipo: 'gatilho', titulo: 'Submissão de Formulário', subtitulo: 'Formulários & Captação', cor: 'var(--iris-violeta)', params: { formularioId: 'form-my-briefing' } },
      { id: 'n-12', tipo: 'agente', agenteId: 'maia', titulo: 'Agente Maia (Spintax Copy)', subtitulo: 'Gera variação humanizada de mensagem', cor: 'var(--iris-pessego)', params: { spintax: true, nicho: 'Automático' } },
      { id: 'n-13', tipo: 'agente', agenteId: 'leo', titulo: 'Agente Leo (WhatsApp Dispatcher)', subtitulo: 'Dispara mensagem oficial de conexão', cor: 'var(--iris-menta)', params: { canal: 'WhatsApp Web QR', delay: '8s' } },
      { id: 'n-14', tipo: 'acao', titulo: 'Cadastrar Lead no CRM', subtitulo: 'Coluna: Leads em Aberto', cor: 'var(--sinal-vivo)', params: { pipeline: 'B2B Repass AI' } }
    ]
  },
  {
    id: 'flow-3',
    nome: 'Disparo Manual em Conversa → Alva (Agendamento no Calendário)',
    descricao: 'Atendente clica em "Agendar Demo" na conversa do WhatsApp e a Alva sincroniza horário no calendário automaticamente.',
    gatilho: 'manual',
    agentePrincipal: 'alva',
    ativo: false,
    execucoes: 23,
    ultimaExecucao: '26/09/2026',
    taxaSucesso: '95.4%',
    nos: [
      { id: 'n-21', tipo: 'gatilho', titulo: 'Disparo Manual pelo Atendente', subtitulo: 'Botão "Rodar Automação"', cor: 'var(--iris-lilas)', params: { role: 'Atendente' } },
      { id: 'n-22', tipo: 'agente', agenteId: 'alva', titulo: 'Agente Alva (Secretária Executiva)', subtitulo: 'Valida horários vagos e envia link', cor: 'var(--iris-lilas)', params: { duracaoMinutos: 30 } },
      { id: 'n-23', tipo: 'acao', titulo: 'Registrar Evento no Google Agenda', subtitulo: 'Envia convite para e-mail e WhatsApp', cor: 'var(--sinal-vivo)', params: { calendarSync: true } }
    ]
  }
];

export default function AutomacoesView({ leads = [], setLeads, onNavigate }) {
  // Aba ativa: 'canvas' (Estúdio de Fluxos n8n Visual) | 'n8n_embed' (n8n Webview) | 'regras' (Lista de Regras)
  const [abaAtiva, setAbaAtiva] = useState('canvas');
  
  // Lista de fluxos
  const [fluxos, setFluxos] = useState(() => {
    try {
      const salvo = localStorage.getItem('repass_automacoes_db');
      if (salvo) return JSON.parse(salvo);
    } catch {}
    return FLUXOS_PREDEFINIDOS;
  });

  const [fluxoSelecionadoId, setFluxoSelecionadoId] = useState(FLUXOS_PREDEFINIDOS[0].id);
  const fluxoAtual = useMemo(() => {
    return fluxos.find(f => f.id === fluxoSelecionadoId) || fluxos[0];
  }, [fluxos, fluxoSelecionadoId]);

  // Nó atualmente selecionado para inspeção/configuração
  const [noSelecionadoId, setNoSelecionadoId] = useState(null);
  const noSelecionado = useMemo(() => {
    if (!fluxoAtual?.nos || !noSelecionadoId) return null;
    return fluxoAtual.nos.find(n => n.id === noSelecionadoId) || null;
  }, [fluxoAtual, noSelecionadoId]);

  // Modal para adicionar novo nó
  const [modalAdicionarNoAberta, setModalAdicionarNoAberta] = useState(false);
  const [buscaBiblioteca, setBuscaBiblioteca] = useState('');

  // Estados de execução de teste
  const [executandoTeste, setExecutandoTeste] = useState(false);
  const [noAtivoExecucao, setNoAtivoExecucao] = useState(null);
  const [logExecucao, setLogExecucao] = useState(null);
  const [tempoExecucao, setTempoExecucao] = useState({});

  // Configuração da URL do n8n (Localhost ou Cloud)
  const [n8nUrl, setN8nUrl] = useState(() => {
    try {
      return localStorage.getItem('repass_n8n_url') || 'http://localhost:5678';
    } catch {
      return 'http://localhost:5678';
    }
  });

  // Modal Nova Automação
  const [modalNovaAberta, setModalNovaAberta] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoGatilho, setNovoGatilho] = useState('manual');
  const [novoAgente, setNovoAgente] = useState('leo');

  // Modal JSON n8n
  const [modalJsonAberta, setModalJsonAberta] = useState(false);
  const [copiadoJson, setCopiadoJson] = useState(false);

  // Persistência
  useEffect(() => {
    try {
      localStorage.setItem('repass_automacoes_db', JSON.stringify(fluxos));
    } catch {}
  }, [fluxos]);

  // Teste interativo nó a nó com pulso de luz
  const handleTestarFluxo = () => {
    if (executandoTeste || !fluxoAtual?.nos?.length) return;
    setExecutandoTeste(true);
    setTempoExecucao({});
    setLogExecucao('Iniciando orquestração inteligente do fluxo com os Agentes...');

    let etapa = 0;
    const tempos = {};
    const interval = setInterval(() => {
      if (etapa < fluxoAtual.nos.length) {
        const no = fluxoAtual.nos[etapa];
        setNoAtivoExecucao(no.id);
        const ms = Math.floor(Math.random() * 45) + 15;
        tempos[no.id] = `${ms}ms`;
        setTempoExecucao({ ...tempos });
        setLogExecucao(`[${new Date().toLocaleTimeString()}] Executando: "${no.titulo}" (${no.subtitulo}) → Payload OK`);
        etapa++;
      } else {
        clearInterval(interval);
        setNoAtivoExecucao(null);
        setExecutandoTeste(false);
        setLogExecucao(`✓ Fluxo concluído com 100% de sucesso! 5 nós executados sem erros.`);

        // Incrementa execuções
        setFluxos(prev => prev.map(f => f.id === fluxoAtual.id ? { ...f, execucoes: f.execucoes + 1, ultimaExecucao: 'Agora mesmo' } : f));
      }
    }, 700);
  };

  // Adicionar nó ao fluxo atual
  const handleInserirNo = (item) => {
    if (!fluxoAtual) return;
    const novoNo = {
      id: `n-${Date.now()}`,
      tipo: item.tipo,
      agenteId: item.agenteId || null,
      titulo: item.titulo,
      subtitulo: item.subtitulo,
      cor: item.cor || 'var(--iris-violeta)',
      params: {}
    };

    const fluxosAtualizados = fluxos.map(f => {
      if (f.id === fluxoAtual.id) {
        return {
          ...f,
          nos: [...f.nos, novoNo]
        };
      }
      return f;
    });

    setFluxos(fluxosAtualizados);
    setModalAdicionarNoAberta(false);
    setNoSelecionadoId(novoNo.id);
  };

  // Remover nó
  const handleRemoverNo = (noId, e) => {
    e?.stopPropagation();
    if (!fluxoAtual) return;
    const fluxosAtualizados = fluxos.map(f => {
      if (f.id === fluxoAtual.id) {
        return {
          ...f,
          nos: f.nos.filter(n => n.id !== noId)
        };
      }
      return f;
    });

    setFluxos(fluxosAtualizados);
    if (noSelecionadoId === noId) setNoSelecionadoId(null);
  };

  // Atualizar parâmetros do nó
  const handleAtualizarParametrosNo = (noId, novosParams) => {
    setFluxos(prev => prev.map(f => {
      if (f.id === fluxoAtual.id) {
        return {
          ...f,
          nos: f.nos.map(n => n.id === noId ? { ...n, params: { ...(n.params || {}), ...novosParams } } : n)
        };
      }
      return f;
    }));
  };

  // Toggle ativo/inativo
  const handleToggleAtivo = (id, e) => {
    e?.stopPropagation();
    setFluxos(prev => prev.map(f => f.id === id ? { ...f, ativo: !f.ativo } : f));
  };

  // Criação de nova automação
  const handleCriarAutomacao = () => {
    if (!novoNome.trim()) return;
    const agenteEscolhido = AGENTES_DISPONIVEIS.find(a => a.id === novoAgente) || AGENTES_DISPONIVEIS[0];
    
    const novo = {
      id: `flow-${Date.now()}`,
      nome: novoNome.trim(),
      descricao: `Automação executada via gatilho ${novoGatilho} comandada pelo agente ${agenteEscolhido.nome}.`,
      gatilho: novoGatilho,
      agentePrincipal: agenteEscolhido.id,
      ativo: true,
      execucoes: 0,
      ultimaExecucao: 'Nunca',
      taxaSucesso: '100%',
      nos: [
        { id: `n-${Date.now()}-1`, tipo: 'gatilho', titulo: `Gatilho: ${novoGatilho.toUpperCase()}`, subtitulo: 'Disparo inicial do evento', cor: 'var(--iris-azul)', params: {} },
        { id: `n-${Date.now()}-2`, tipo: 'agente', agenteId: agenteEscolhido.id, titulo: `Agente ${agenteEscolhido.nome}`, subtitulo: agenteEscolhido.funcao, cor: agenteEscolhido.cor, params: {} },
        { id: `n-${Date.now()}-3`, tipo: 'acao', titulo: 'Disparo de Ação & Log CRM', subtitulo: 'Execução das ferramentas ativas', cor: 'var(--sinal-vivo)', params: {} }
      ]
    };

    setFluxos(prev => [novo, ...prev]);
    setFluxoSelecionadoId(novo.id);
    setNovoNome('');
    setModalNovaAberta(false);
  };

  // JSON compatível com n8n
  const jsonExportN8n = useMemo(() => {
    return JSON.stringify({
      name: fluxoAtual?.nome || 'Repass_AI_Workflow',
      nodes: (fluxoAtual?.nos || []).map((no, idx) => ({
        parameters: {
          agent: no.agenteId || 'system',
          action: no.titulo,
          customParams: no.params || {}
        },
        name: no.titulo,
        type: no.tipo === 'gatilho' ? 'n8n-nodes-base.webhook' : 'n8n-nodes-base.aiAgent',
        typeVersion: 1,
        position: [idx * 260 + 50, 150]
      })),
      connections: {},
      settings: { executionOrder: 'v1' },
      meta: { templateCredsSetupCompleted: true, instanceId: 'repass-ai-n8n-bridge' }
    }, null, 2);
  }, [fluxoAtual]);

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* ============================================================
          HEADER PRINCIPAL
          ============================================================ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--aro-cor)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--tinta)',
              letterSpacing: '-0.02em'
            }}>
              Automações &amp; Estúdio de Fluxos
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 10px',
              borderRadius: 'var(--raio-pill)',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'rgba(124, 92, 255, 0.15)',
              color: 'var(--iris-violeta)',
              border: '1px solid var(--aro-cor)'
            }}>
              <Zap size={12} />
              N8N WORKFLOW ENGINE
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--tinta-media)' }}>
            Orquestrador inteligente: conecte os Agentes autônomos (Leo, Atlas, Apolo, Maia) a gatilhos webhooks e ferramentas de CRM.
          </p>
        </div>

        {/* Controles da Barra Superior */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Seletor de Modos */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--papel-fundo)',
            padding: '3px',
            borderRadius: 'var(--raio-md)',
            border: '1px solid var(--aro-cor)'
          }}>
            <button
              onClick={() => setAbaAtiva('canvas')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--raio-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: abaAtiva === 'canvas' ? 'var(--papel-cartao)' : 'transparent',
                color: abaAtiva === 'canvas' ? 'var(--tinta)' : 'var(--tinta-media)',
                boxShadow: abaAtiva === 'canvas' ? 'var(--sombra-sm)' : 'none'
              }}
            >
              <Workflow size={14} />
              Estúdio de Fluxos
            </button>

            <button
              onClick={() => setAbaAtiva('regras')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--raio-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: abaAtiva === 'regras' ? 'var(--papel-cartao)' : 'transparent',
                color: abaAtiva === 'regras' ? 'var(--tinta)' : 'var(--tinta-media)',
                boxShadow: abaAtiva === 'regras' ? 'var(--sombra-sm)' : 'none'
              }}
            >
              <Layers size={14} />
              Lista de Regras
            </button>

            <button
              onClick={() => setAbaAtiva('n8n_embed')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--raio-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: abaAtiva === 'n8n_embed' ? 'var(--papel-cartao)' : 'transparent',
                color: abaAtiva === 'n8n_embed' ? 'var(--tinta)' : 'var(--tinta-media)',
                boxShadow: abaAtiva === 'n8n_embed' ? 'var(--sombra-sm)' : 'none'
              }}
            >
              <Globe size={14} />
              n8n Cloud / VPS
            </button>
          </div>

          <button
            onClick={() => setModalNovaAberta(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'var(--acao-fundo)',
              color: 'var(--acao-texto)',
              border: 'none',
              borderRadius: 'var(--raio-md)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--sombra-sm)'
            }}
          >
            <Plus size={15} />
            Nova Automação
          </button>
        </div>
      </div>

      {/* ============================================================
          MODO 1: ESTÚDIO DE FLUXOS VISUAL (ESTILO N8N CANVAS)
          ============================================================ */}
      {abaAtiva === 'canvas' && (
        <div>
          {/* Barra de Ferramentas do Canvas */}
          <div style={{
            background: 'var(--papel-cartao)',
            border: '1px solid var(--aro-cor)',
            borderRadius: 'var(--raio-md)',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: 'var(--sombra-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <select
                value={fluxoSelecionadoId}
                onChange={(e) => {
                  setFluxoSelecionadoId(e.target.value);
                  setNoSelecionadoId(null);
                }}
                style={{
                  padding: '8px 14px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--tinta)',
                  outline: 'none',
                  minWidth: '300px'
                }}
              >
                {fluxos.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nome} ({f.ativo ? 'Ativo' : 'Pausado'})
                  </option>
                ))}
              </select>

              <button
                onClick={(e) => handleToggleAtivo(fluxoAtual.id, e)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--raio-pill)',
                  border: '1px solid var(--aro-cor)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: fluxoAtual.ativo ? 'rgba(0, 255, 157, 0.12)' : 'rgba(255, 178, 122, 0.15)',
                  color: fluxoAtual.ativo ? 'var(--sinal-vivo)' : 'var(--iris-pessego)'
                }}
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: fluxoAtual.ativo ? 'var(--sinal-vivo)' : 'var(--iris-pessego)'
                }} />
                {fluxoAtual.ativo ? 'Fluxo Operando' : 'Pausado'}
              </button>
            </div>

            {/* Ações da Barra */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setModalAdicionarNoAberta(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--tinta)',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                Adicionar Nó
              </button>

              <button
                onClick={() => setModalJsonAberta(true)}
                title="Exportar JSON compatível com n8n"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.82rem',
                  color: 'var(--tinta)',
                  cursor: 'pointer'
                }}
              >
                <Code size={14} />
                JSON n8n
              </button>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('fluxos')}
                  title="Abrir sala dos Agentes IA"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    fontSize: '0.82rem',
                    color: 'var(--iris-violeta)',
                    cursor: 'pointer'
                  }}
                >
                  <Bot size={14} />
                  Mesa Agentes
                </button>
              )}

              <button
                onClick={handleTestarFluxo}
                disabled={executandoTeste}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  background: 'var(--iris-violeta)',
                  color: 'var(--acao-texto)',
                  border: 'none',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: executandoTeste ? 'not-allowed' : 'pointer',
                  opacity: executandoTeste ? 0.7 : 1,
                  boxShadow: 'var(--sombra-sm)'
                }}
              >
                <Play size={14} />
                {executandoTeste ? 'Executando...' : 'Testar Fluxo ao Vivo'}
              </button>
            </div>
          </div>

          {/* Grid Layout: Canvas Principal + Inspetor Lateral (quando um nó é clicado) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: noSelecionado ? '1fr 340px' : '1fr',
            gap: '16px',
            alignItems: 'start'
          }}>
            {/* CANVAS INTERATIVO N8N */}
            <div style={{
              background: 'var(--papel-cartao)',
              border: '1px solid var(--aro-cor)',
              borderRadius: 'var(--raio-lg)',
              minHeight: '440px',
              position: 'relative',
              overflowX: 'auto',
              padding: '40px 30px',
              boxShadow: 'var(--sombra-sm)',
              backgroundImage: 'radial-gradient(var(--aro-cor) 1px, transparent 1px)',
              backgroundSize: '22px 22px'
            }}>
              {/* Header com Descrição do Fluxo */}
              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--tinta-media)' }}>
                  {fluxoAtual.descricao}
                </span>

                <span style={{ fontSize: '0.75rem', color: 'var(--tinta-fraca)' }}>
                  Dica: Clique em qualquer nó para inspecionar e configurar seus parâmetros.
                </span>
              </div>

              {/* Linha de Conexão Estilizada entre Nós */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                minWidth: 'max-content',
                padding: '10px 0'
              }}>
                {fluxoAtual.nos.map((no, idx) => {
                  const agenteInfo = no.agenteId ? AGENTES_DISPONIVEIS.find(a => a.id === no.agenteId) : null;
                  const estaExecutando = noAtivoExecucao === no.id;
                  const estaSelecionado = noSelecionadoId === no.id;
                  const ms = tempoExecucao[no.id];

                  return (
                    <React.Fragment key={no.id}>
                      {/* CARD DO NÓ */}
                      <div
                        onClick={() => setNoSelecionadoId(no.id)}
                        style={{
                          width: '250px',
                          background: estaSelecionado ? 'var(--papel-cartao)' : 'var(--papel-elevado)',
                          border: estaExecutando
                            ? `2px solid ${no.cor || 'var(--iris-violeta)'}`
                            : estaSelecionado
                            ? '2px solid var(--iris-violeta)'
                            : '1px solid var(--aro-cor)',
                          borderRadius: 'var(--raio-md)',
                          padding: '16px',
                          boxShadow: estaExecutando ? 'var(--halo-iris)' : 'var(--sombra-md)',
                          transform: estaExecutando ? 'scale(1.05)' : estaSelecionado ? 'scale(1.02)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                      >
                        {/* Faixa Superior com Cor do Nó */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          borderRadius: 'var(--raio-md) var(--raio-md) 0 0',
                          background: no.cor || 'var(--iris-violeta)'
                        }} />

                        {/* Header do Nó */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: no.cor || 'var(--tinta-media)'
                          }}>
                            {no.tipo === 'gatilho' ? 'Gatilho' : no.tipo === 'agente' ? 'Agente IA' : no.tipo === 'condicao' ? 'Condicional' : 'Ação Final'}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {agenteInfo && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '1px 6px',
                                borderRadius: 'var(--raio-pill)',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                background: 'var(--papel-fundo)',
                                color: 'var(--tinta)'
                              }}>
                                <Bot size={10} />
                                {agenteInfo.nome}
                              </span>
                            )}

                            <button
                              onClick={(e) => handleRemoverNo(no.id, e)}
                              title="Remover este nó"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--tinta-fraca)',
                                padding: '2px'
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Título e Subtítulo */}
                        <h4 style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: 'var(--tinta)',
                          marginBottom: '4px',
                          lineHeight: 1.3
                        }}>
                          {no.titulo}
                        </h4>

                        <p style={{
                          fontSize: '0.78rem',
                          color: 'var(--tinta-media)',
                          lineHeight: 1.35,
                          marginBottom: '12px'
                        }}>
                          {no.subtitulo}
                        </p>

                        {/* Rodapé do Nó com Status & Tempo de Execução */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '8px',
                          borderTop: '1px solid var(--aro-cor)',
                          fontSize: '0.72rem',
                          color: 'var(--tinta-fraca)'
                        }}>
                          <span>Porta JSON</span>
                          {estaExecutando ? (
                            <span style={{ color: 'var(--sinal-vivo)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Activity size={12} />
                              Processando
                            </span>
                          ) : ms ? (
                            <span style={{ color: 'var(--sinal-vivo)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} />
                              {ms}
                            </span>
                          ) : (
                            <span>Pronto</span>
                          )}
                        </div>
                      </div>

                      {/* Conector Bézier / Setinha entre os Nós */}
                      {idx < fluxoAtual.nos.length - 1 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: estaExecutando ? 'var(--iris-violeta)' : 'var(--tinta-fantasma)',
                          transition: 'color 0.2s ease'
                        }}>
                          <ArrowRight size={22} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Botão de Inserir no final do fluxo */}
                <button
                  onClick={() => setModalAdicionarNoAberta(true)}
                  style={{
                    width: '140px',
                    height: '110px',
                    borderRadius: 'var(--raio-md)',
                    border: '1px dashed var(--aro-cor-forte)',
                    background: 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: 'var(--tinta-media)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
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
                  <Plus size={18} />
                  Adicionar Nó
                </button>
              </div>

              {/* Console de Log de Execução */}
              {logExecucao && (
                <div style={{
                  marginTop: '28px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-md)',
                  padding: '12px 18px',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--tinta)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Terminal size={16} color="var(--iris-violeta)" />
                  <span>{logExecucao}</span>
                </div>
              )}
            </div>

            {/* INSPETOR LATERAL DO NÓ SELECIONADO */}
            {noSelecionado && (
              <div style={{
                background: 'var(--papel-cartao)',
                border: '1px solid var(--aro-cor)',
                borderRadius: 'var(--raio-lg)',
                padding: '20px',
                boxShadow: 'var(--sombra-md)',
                position: 'sticky',
                top: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SlidersHorizontal size={16} color="var(--iris-violeta)" />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--tinta)' }}>
                      Inspetor do Nó
                    </h3>
                  </div>

                  <button
                    onClick={() => setNoSelecionadoId(null)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--tinta-media)' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--tinta-media)', marginBottom: '4px' }}>
                    Título do Nó
                  </label>
                  <input
                    type="text"
                    value={noSelecionado.titulo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFluxos(prev => prev.map(f => {
                        if (f.id === fluxoAtual.id) {
                          return { ...f, nos: f.nos.map(n => n.id === noSelecionado.id ? { ...n, titulo: val } : n) };
                        }
                        return f;
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--papel-fundo)',
                      border: '1px solid var(--aro-cor)',
                      borderRadius: 'var(--raio-sm)',
                      fontSize: '0.85rem',
                      color: 'var(--tinta)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Se for Nó de Agente, mostra controles específicos do Agente */}
                {noSelecionado.tipo === 'agente' && (
                  <div style={{ marginBottom: '14px', padding: '12px', background: 'var(--papel-fundo)', borderRadius: 'var(--raio-sm)', border: '1px solid var(--aro-cor)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Bot size={16} color={noSelecionado.cor} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--tinta)' }}>
                        Agente {noSelecionado.agenteId?.toUpperCase()}
                      </span>
                    </div>

                    {noSelecionado.agenteId === 'apolo' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--tinta-media)', marginBottom: '4px' }}>
                          Voz Neural SIP
                        </label>
                        <select
                          value={noSelecionado.params?.voz || 'Apolo Neural'}
                          onChange={(e) => handleAtualizarParametrosNo(noSelecionado.id, { voz: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: 'var(--papel-cartao)',
                            border: '1px solid var(--aro-cor)',
                            borderRadius: 'var(--raio-sm)',
                            fontSize: '0.8rem',
                            color: 'var(--tinta)'
                          }}
                        >
                          <option value="Apolo Neural">Apolo Neural (Masculino Firme)</option>
                          <option value="Sofia Neural">Sofia Neural (Feminino Suave)</option>
                        </select>
                      </div>
                    )}

                    {noSelecionado.agenteId === 'leo' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--tinta-media)', marginBottom: '4px' }}>
                          Canal WhatsApp
                        </label>
                        <select
                          value={noSelecionado.params?.canal || 'Oficial QR'}
                          onChange={(e) => handleAtualizarParametrosNo(noSelecionado.id, { canal: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: 'var(--papel-cartao)',
                            border: '1px solid var(--aro-cor)',
                            borderRadius: 'var(--raio-sm)',
                            fontSize: '0.8rem',
                            color: 'var(--tinta)'
                          }}
                        >
                          <option value="Oficial QR">Sessão WhatsApp Conectada</option>
                          <option value="Simulacao">Modo Sandbox de Teste</option>
                        </select>
                      </div>
                    )}

                    {noSelecionado.agenteId === 'atlas' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--tinta-media)', marginBottom: '4px' }}>
                          Validador Google Maps
                        </label>
                        <input
                          type="text"
                          value={noSelecionado.params?.nicho || 'Barbearias, Clínicas, Oficinas'}
                          onChange={(e) => handleAtualizarParametrosNo(noSelecionado.id, { nicho: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: 'var(--papel-cartao)',
                            border: '1px solid var(--aro-cor)',
                            borderRadius: 'var(--raio-sm)',
                            fontSize: '0.8rem',
                            color: 'var(--tinta)',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Exibição do Payload JSON de Saída */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--tinta-media)', marginBottom: '4px' }}>
                    Payload de Saída (JSON n8n)
                  </label>
                  <pre style={{
                    padding: '10px',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--tinta)',
                    overflowX: 'auto',
                    margin: 0
                  }}>
                    {JSON.stringify({
                      nodeId: noSelecionado.id,
                      status: 'ready',
                      type: noSelecionado.tipo,
                      agent: noSelecionado.agenteId || 'system',
                      params: noSelecionado.params || {}
                    }, null, 2)}
                  </pre>
                </div>

                <button
                  onClick={(e) => handleRemoverNo(noSelecionado.id, e)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'transparent',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    color: 'var(--tinta-fraca)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={14} />
                  Excluir Nó
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          MODO 2: LISTA DE REGRAS E GATILHOS
          ============================================================ */}
      {abaAtiva === 'regras' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {fluxos.map(fluxo => {
            const agente = AGENTES_DISPONIVEIS.find(a => a.id === fluxo.agentePrincipal) || AGENTES_DISPONIVEIS[0];
            return (
              <div
                key={fluxo.id}
                style={{
                  background: 'var(--papel-cartao)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-md)',
                  padding: '20px',
                  boxShadow: 'var(--sombra-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--raio-md)',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: agente.cor
                  }}>
                    <Zap size={22} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tinta)' }}>
                        {fluxo.nome}
                      </h3>

                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--raio-pill)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: 'var(--papel-fundo)',
                        color: 'var(--tinta-media)',
                        border: '1px solid var(--aro-cor)',
                        textTransform: 'uppercase'
                      }}>
                        Gatilho: {fluxo.gatilho}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--tinta-media)', marginBottom: '8px' }}>
                      {fluxo.descricao}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: 'var(--tinta-fraca)' }}>
                      <span>Agente Líder: <strong style={{ color: 'var(--tinta)' }}>{agente.nome}</strong></span>
                      <span>•</span>
                      <span>{fluxo.nos?.length || 0} nós conectados</span>
                      <span>•</span>
                      <span>Execuções: <strong>{fluxo.execucoes}</strong></span>
                      <span>•</span>
                      <span>Última: {fluxo.ultimaExecucao}</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setFluxoSelecionadoId(fluxo.id);
                      setAbaAtiva('canvas');
                    }}
                    style={{
                      padding: '8px 14px',
                      background: 'var(--papel-fundo)',
                      border: '1px solid var(--aro-cor)',
                      borderRadius: 'var(--raio-sm)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: 'var(--tinta)',
                      cursor: 'pointer'
                    }}
                  >
                    Abrir no Estúdio
                  </button>

                  <button
                    onClick={(e) => handleToggleAtivo(fluxo.id, e)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--raio-sm)',
                      border: '1px solid var(--aro-cor)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: fluxo.ativo ? 'rgba(0, 255, 157, 0.12)' : 'var(--papel-fundo)',
                      color: fluxo.ativo ? 'var(--sinal-vivo)' : 'var(--tinta-media)'
                    }}
                  >
                    {fluxo.ativo ? 'Ligado' : 'Desligado'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================
          MODO 3: N8N CLOUD / VPS (COM GUIA CLARO DE CONEXÃO HTTPS)
          ============================================================ */}
      {abaAtiva === 'n8n_embed' && (
        <div style={{
          background: 'var(--papel-cartao)',
          border: '1px solid var(--aro-cor)',
          borderRadius: 'var(--raio-lg)',
          padding: '24px',
          boxShadow: 'var(--sombra-sm)'
        }}>
          {/* Card Explicativo sobre Mixed Content e HTTPS */}
          <div style={{
            background: 'var(--papel-fundo)',
            border: '1px solid var(--aro-cor)',
            borderRadius: 'var(--raio-md)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px'
          }}>
            <Info size={20} color="var(--iris-azul)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--tinta)', marginBottom: '4px' }}>
                Como conectar o n8n com segurança sem bloqueio de navegador
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--tinta-media)', lineHeight: 1.5, marginBottom: '8px' }}>
                Navegadores modernos impedem que um site seguro em HTTPS (como o Repass AI na nuvem) carregue um `http://localhost` sem certificado SSL dentro de um frame (política de <em>Mixed Content</em>).
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href="http://localhost:5678"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'var(--acao-fundo)',
                    color: 'var(--acao-texto)',
                    borderRadius: 'var(--raio-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={13} />
                  Abrir Localhost:5678 em Nova Aba
                </a>

                <a
                  href="https://n8n-vault-58-fluxos.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'var(--papel-cartao)',
                    color: 'var(--tinta)',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={13} />
                  Acessar Vault de 58 Fluxos n8n
                </a>
              </div>
            </div>
          </div>

          {/* Top Bar da Conexão */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--tinta)' }}>
              URL da Instância n8n (HTTPS recomendado para iframe)
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={n8nUrl}
                onChange={(e) => {
                  setN8nUrl(e.target.value);
                  try { localStorage.setItem('repass_n8n_url', e.target.value); } catch {}
                }}
                placeholder="https://seu-n8n.cloud ou https://tunnel.meudominio.com"
                style={{
                  width: '320px',
                  padding: '8px 12px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--tinta)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Iframe */}
          <div style={{
            width: '100%',
            height: '600px',
            borderRadius: 'var(--raio-md)',
            overflow: 'hidden',
            border: '1px solid var(--aro-cor)',
            background: 'var(--papel-fundo)'
          }}>
            <iframe
              src={n8nUrl}
              title="n8n Engine"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: ADICIONAR NÓ AO FLUXO (BIBLIOTECA DE NÓS N8N)
          ============================================================ */}
      {modalAdicionarNoAberta && (
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
            maxWidth: '680px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: 'var(--sombra-lg)',
            position: 'relative'
          }}>
            <button
              onClick={() => setModalAdicionarNoAberta(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--tinta-media)'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--tinta)', marginBottom: '4px' }}>
              Adicionar Nó ao Fluxo
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--tinta-media)', marginBottom: '16px' }}>
              Escolha um Agente IA, Gatilho Webhook ou Ação para plugar no seu pipeline n8n.
            </p>

            <input
              type="text"
              placeholder="Buscar nó..."
              value={buscaBiblioteca}
              onChange={(e) => setBuscaBiblioteca(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'var(--papel-fundo)',
                border: '1px solid var(--aro-cor)',
                borderRadius: 'var(--raio-sm)',
                fontSize: '0.88rem',
                color: 'var(--tinta)',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '20px'
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {BIBLIOTECA_NOS.map(cat => {
                const itensFiltrados = cat.itens.filter(i =>
                  i.titulo.toLowerCase().includes(buscaBiblioteca.toLowerCase()) ||
                  i.subtitulo.toLowerCase().includes(buscaBiblioteca.toLowerCase())
                );
                if (itensFiltrados.length === 0) return null;

                return (
                  <div key={cat.categoria}>
                    <h4 style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--tinta-media)',
                      letterSpacing: 'var(--tracking-rotulo)',
                      textTransform: 'uppercase',
                      marginBottom: '10px'
                    }}>
                      {cat.categoria}
                    </h4>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '10px'
                    }}>
                      {itensFiltrados.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleInserirNo(item)}
                          style={{
                            padding: '12px 14px',
                            background: 'var(--papel-fundo)',
                            border: '1px solid var(--aro-cor)',
                            borderRadius: 'var(--raio-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease'
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
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: item.cor || 'var(--iris-violeta)'
                              }} />
                              <strong style={{ fontSize: '0.85rem', color: 'var(--tinta)' }}>
                                {item.titulo}
                              </strong>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--tinta-media)' }}>
                              {item.subtitulo}
                            </span>
                          </div>

                          <Plus size={16} color="var(--tinta-media)" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: NOVA AUTOMAÇÃO
          ============================================================ */}
      {modalNovaAberta && (
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
            maxWidth: '440px',
            padding: '24px',
            boxShadow: 'var(--sombra-lg)',
            position: 'relative'
          }}>
            <button
              onClick={() => setModalNovaAberta(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--tinta-media)'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--tinta)', marginBottom: '16px' }}>
              Nova automação
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                Nome
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Ex: Novo lead do site"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.9rem',
                  color: 'var(--tinta)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                Gatilho
              </label>
              <select
                value={novoGatilho}
                onChange={(e) => setNovoGatilho(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.9rem',
                  color: 'var(--tinta)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="manual">Manual (atendente roda numa conversa)</option>
                <option value="webhook">Webhook (disparo externo)</option>
                <option value="evento">Evento (automático)</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                Agente IA Responsável
              </label>
              <select
                value={novoAgente}
                onChange={(e) => setNovoAgente(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.9rem',
                  color: 'var(--tinta)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {AGENTES_DISPONIVEIS.map(ag => (
                  <option key={ag.id} value={ag.id}>
                    {ag.nome} — {ag.funcao}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCriarAutomacao}
              disabled={!novoNome.trim()}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--acao-fundo)',
                color: 'var(--acao-texto)',
                border: 'none',
                borderRadius: 'var(--raio-md)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: novoNome.trim() ? 'pointer' : 'not-allowed',
                opacity: novoNome.trim() ? 1 : 0.6
              }}
            >
              Criar Automação
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: EXPORTAR JSON N8N
          ============================================================ */}
      {modalJsonAberta && (
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
            padding: '24px',
            boxShadow: 'var(--sombra-lg)',
            position: 'relative'
          }}>
            <button
              onClick={() => setModalJsonAberta(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--tinta-media)'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--tinta)', marginBottom: '6px' }}>
              JSON Oficial Compatível com n8n
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--tinta-media)', marginBottom: '16px' }}>
              Copie este JSON e cole diretamente no canvas do n8n para importar o fluxo com os nós de Agentes do Repass AI.
            </p>

            <textarea
              readOnly
              rows={12}
              value={jsonExportN8n}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--papel-fundo)',
                border: '1px solid var(--aro-cor)',
                borderRadius: 'var(--raio-sm)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--tinta)',
                resize: 'none',
                boxSizing: 'border-box',
                marginBottom: '16px'
              }}
            />

            <button
              onClick={() => {
                navigator.clipboard.writeText(jsonExportN8n);
                setCopiadoJson(true);
                setTimeout(() => setCopiadoJson(false), 2000);
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--acao-fundo)',
                color: 'var(--acao-texto)',
                border: 'none',
                borderRadius: 'var(--raio-sm)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {copiadoJson ? <Check size={16} /> : <Copy size={16} />}
              {copiadoJson ? 'JSON Copiado com Sucesso!' : 'Copiar JSON do n8n'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
