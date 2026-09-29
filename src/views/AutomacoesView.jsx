import React, { useState, useEffect, useMemo } from 'react';
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
  X
} from 'lucide-react';

// Agentes de inteligência do Repass AI conectados aos nós
const AGENTES_DISPONIVEIS = [
  { id: 'leo', nome: 'Leo', funcao: 'Operador de Sistemas & WhatsApp', cor: 'var(--iris-menta)', avatar: '/agents/leo.png' },
  { id: 'atlas', nome: 'Atlas', funcao: 'Analista de Mercado & Maps Scrapling', cor: 'var(--iris-ciano)', avatar: '/agents/atlas.png' },
  { id: 'apolo', nome: 'Apolo', funcao: 'Tel-Agent (Voz IA Telefônica)', cor: 'var(--iris-dourado)', avatar: '/agents/apolo.png' },
  { id: 'maia', nome: 'Maia', funcao: 'Copywriting & Spintax Multi-Mensagem', cor: 'var(--iris-pessego)', avatar: '/agents/maia.png' },
  { id: 'alva', nome: 'Alva', funcao: 'Triagem & Agendamentos', cor: 'var(--iris-lilas)', avatar: '/agents/alva.png' },
  { id: 'nova', nome: 'Nova', funcao: 'Estrategista de Fechamento de Funil', cor: 'var(--iris-rosa)', avatar: '/agents/nova.png' },
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
      { id: 'n-1', tipo: 'gatilho', titulo: 'Novo Lead Maps Capturado', subtitulo: 'Webhook / Scrapling Scanner', x: 40, y: 120, cor: 'var(--iris-azul)' },
      { id: 'n-2', tipo: 'agente', agenteId: 'atlas', titulo: 'Agente Atlas (Validador)', subtitulo: 'Verifica Nota Google e Presença Web', x: 300, y: 120, cor: 'var(--iris-ciano)' },
      { id: 'n-3', tipo: 'condicao', titulo: 'Não possui site oficial?', subtitulo: 'Filtro IF/ELSE', x: 570, y: 120, cor: 'var(--iris-pessego)' },
      { id: 'n-4', tipo: 'agente', agenteId: 'apolo', titulo: 'Agente Apolo (Voz IA)', subtitulo: 'Dispara ligação via Tel-Agent SIP', x: 830, y: 80, cor: 'var(--iris-dourado)' },
      { id: 'n-5', tipo: 'acao', titulo: 'Atualizar CRM para "Proposta"', subtitulo: 'Move negócio no funil B2B', x: 1100, y: 80, cor: 'var(--sinal-vivo)' }
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
      { id: 'n-11', tipo: 'gatilho', titulo: 'Submissão de Formulário', subtitulo: 'Formulários & Captação', x: 40, y: 120, cor: 'var(--iris-violeta)' },
      { id: 'n-12', tipo: 'agente', agenteId: 'maia', titulo: 'Agente Maia (Spintax Copy)', subtitulo: 'Gera variação humanizada de mensagem', x: 300, y: 120, cor: 'var(--iris-pessego)' },
      { id: 'n-13', tipo: 'agente', agenteId: 'leo', titulo: 'Agente Leo (WhatsApp Dispatcher)', subtitulo: 'Dispara mensagem oficial de conexão', x: 570, y: 120, cor: 'var(--iris-menta)' },
      { id: 'n-14', tipo: 'acao', titulo: 'Cadastrar Lead no CRM', subtitulo: 'Coluna: Leads em Aberto', x: 840, y: 120, cor: 'var(--sinal-vivo)' }
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
      { id: 'n-21', tipo: 'gatilho', titulo: 'Disparo Manual pelo Atendente', subtitulo: 'Botão "Rodar Automação"', x: 40, y: 120, cor: 'var(--iris-lilas)' },
      { id: 'n-22', tipo: 'agente', agenteId: 'alva', titulo: 'Agente Alva (Secretária Executiva)', subtitulo: 'Valida horários vagos e envia link', x: 320, y: 120, cor: 'var(--iris-lilas)' },
      { id: 'n-23', tipo: 'acao', titulo: 'Registrar Evento no Google Agenda', subtitulo: 'Envia convite para e-mail e WhatsApp', x: 620, y: 120, cor: 'var(--sinal-vivo)' }
    ]
  }
];

export default function AutomacoesView({ leads = [], setLeads, onNavigate }) {
  // Aba ativa: 'canvas' (Estúdio visual de nós com conexão a Agentes) | 'n8n_embed' (n8n completo embutido) | 'regras' (Lista rápida / Aramise)
  const [abaAtiva, setAbaAtiva] = useState('canvas');
  
  // Lista de fluxos persistida
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

  // Configuração da URL do n8n (Localhost ou Cloud)
  const [n8nUrl, setN8nUrl] = useState(() => {
    try {
      return localStorage.getItem('repass_n8n_url') || 'http://localhost:5678';
    } catch {
      return 'http://localhost:5678';
    }
  });
  const [n8nConectando, setN8nConectando] = useState(false);
  const [n8nStatus, setN8nStatus] = useState('pronto'); // 'pronto' | 'conectado' | 'fallback'

  // Estados de execução de teste
  const [executandoTeste, setExecutandoTeste] = useState(false);
  const [noAtivoExecucao, setNoAtivoExecucao] = useState(null);
  const [logExecucao, setLogExecucao] = useState(null);

  // Modal Nova Automação
  const [modalNovaAberta, setModalNovaAberta] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoGatilho, setNovoGatilho] = useState('manual');
  const [novoAgente, setNovoAgente] = useState('leo');

  // Modal JSON n8n
  const [modalJsonAberta, setModalJsonAberta] = useState(false);
  const [copiadoJson, setCopiadoJson] = useState(false);

  // Salva no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('repass_automacoes_db', JSON.stringify(fluxos));
    } catch {}
  }, [fluxos]);

  const handleSalvarN8nUrl = (url) => {
    setN8nUrl(url);
    try {
      localStorage.setItem('repass_n8n_url', url);
    } catch {}
  };

  // Simulação de execução nó a nó com feedback luminoso
  const handleTestarFluxo = () => {
    if (executandoTeste || !fluxoAtual?.nos?.length) return;
    setExecutandoTeste(true);
    setLogExecucao('Iniciando orquestração inteligente do fluxo...');

    let etapa = 0;
    const interval = setInterval(() => {
      if (etapa < fluxoAtual.nos.length) {
        const no = fluxoAtual.nos[etapa];
        setNoAtivoExecucao(no.id);
        setLogExecucao(`[${new Date().toLocaleTimeString()}] Executando: "${no.titulo}" (${no.subtitulo})`);
        etapa++;
      } else {
        clearInterval(interval);
        setNoAtivoExecucao(null);
        setExecutandoTeste(false);
        setLogExecucao(`✓ Fluxo concluído com 100% de sucesso! Agentes sincronizados e CRM atualizado.`);

        // Incrementa execuções
        setFluxos(prev => prev.map(f => f.id === fluxoAtual.id ? { ...f, execucoes: f.execucoes + 1, ultimaExecucao: 'Agora mesmo' } : f));
      }
    }, 800);
  };

  // Criar nova automação
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
        { id: `n-${Date.now()}-1`, tipo: 'gatilho', titulo: `Gatilho: ${novoGatilho.toUpperCase()}`, subtitulo: 'Disparo inicial do evento', x: 40, y: 120, cor: 'var(--iris-azul)' },
        { id: `n-${Date.now()}-2`, tipo: 'agente', agenteId: agenteEscolhido.id, titulo: `Agente ${agenteEscolhido.nome}`, subtitulo: agenteEscolhido.funcao, x: 340, y: 120, cor: agenteEscolhido.cor },
        { id: `n-${Date.now()}-3`, tipo: 'acao', titulo: 'Disparo de Ação & Log CRM', subtitulo: 'Execução das ferramentas ativas', x: 640, y: 120, cor: 'var(--sinal-vivo)' }
      ]
    };

    setFluxos(prev => [novo, ...prev]);
    setFluxoSelecionadoId(novo.id);
    setNovoNome('');
    setModalNovaAberta(false);
  };

  // Toggle ativo/inativo
  const handleToggleAtivo = (id, e) => {
    e?.stopPropagation();
    setFluxos(prev => prev.map(f => f.id === id ? { ...f, ativo: !f.ativo } : f));
  };

  // Exportar formato oficial JSON n8n
  const jsonExportN8n = useMemo(() => {
    return JSON.stringify({
      name: fluxoAtual?.nome || 'Repass_AI_Workflow',
      nodes: (fluxoAtual?.nos || []).map((no, idx) => ({
        parameters: { agent: no.agenteId || 'system', action: no.titulo },
        name: no.titulo,
        type: no.tipo === 'gatilho' ? 'n8n-nodes-base.webhook' : 'n8n-nodes-base.aiAgent',
        typeVersion: 1,
        position: [no.x, no.y]
      })),
      connections: {},
      settings: { executionOrder: 'v1' },
      meta: { templateCredsSetupCompleted: true, instanceId: 'repass-ai-n8n-bridge' }
    }, null, 2);
  }, [fluxoAtual]);

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* ============================================================
          HEADER PRINCIPAL COM SELETOR DE MODOS E INTEGRAÇÃO N8N
          ============================================================ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--aro-cor)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--tinta)',
              letterSpacing: '-0.02em'
            }}>
              Automações &amp; Orquestrador n8n
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
            Crie pipelines inteligentes conectando os Agentes do Repass AI (Leo, Atlas, Apolo, Maia) a gatilhos webhooks e ferramentas sem sair da plataforma.
          </p>
        </div>

        {/* Botões de Ação Topo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Seletor de Abas */}
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
              <Terminal size={14} />
              n8n Embutido (Local/Cloud)
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
          ABA 1: ESTÚDIO DE FLUXOS VISUAIS COM NÓS E AGENTES
          ============================================================ */}
      {abaAtiva === 'canvas' && (
        <div>
          {/* Barra de Controle do Fluxo Selecionado */}
          <div style={{
            background: 'var(--papel-cartao)',
            border: '1px solid var(--aro-cor)',
            borderRadius: 'var(--raio-md)',
            padding: '14px 20px',
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
                onChange={(e) => setFluxoSelecionadoId(e.target.value)}
                style={{
                  padding: '8px 14px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--tinta)',
                  outline: 'none',
                  minWidth: '280px'
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

            {/* Ações da Barra: Testar, JSON n8n, Ir aos Agentes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setModalJsonAberta(true)}
                title="Ver JSON compatível com n8n"
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
                  Ver Mesa dos Agentes
                </button>
              )}

              <button
                onClick={handleTestarFluxo}
                disabled={executandoTeste}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
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

          {/* Canvas dos Nós Estilo n8n */}
          <div style={{
            background: 'var(--papel-cartao)',
            border: '1px solid var(--aro-cor)',
            borderRadius: 'var(--raio-lg)',
            minHeight: '380px',
            position: 'relative',
            overflowX: 'auto',
            padding: '40px 30px',
            boxShadow: 'var(--sombra-sm)',
            backgroundImage: 'radial-gradient(var(--aro-cor) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
            {/* Linha de Conexão Estilizada entre Nós */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              minWidth: 'max-content',
              padding: '20px 0'
            }}>
              {fluxoAtual.nos.map((no, idx) => {
                const agenteInfo = no.agenteId ? AGENTES_DISPONIVEIS.find(a => a.id === no.agenteId) : null;
                const estaExecutando = noAtivoExecucao === no.id;

                return (
                  <React.Fragment key={no.id}>
                    {/* Nó Individual */}
                    <div style={{
                      width: '240px',
                      background: 'var(--papel-elevado)',
                      border: estaExecutando ? `2px solid ${no.cor || 'var(--iris-violeta)'}` : '1px solid var(--aro-cor)',
                      borderRadius: 'var(--raio-md)',
                      padding: '16px',
                      boxShadow: estaExecutando ? 'var(--halo-iris)' : 'var(--sombra-md)',
                      transform: estaExecutando ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.25s ease',
                      position: 'relative'
                    }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: no.cor || 'var(--tinta-media)'
                        }}>
                          {no.tipo === 'gatilho' ? 'Gatilho' : no.tipo === 'agente' ? 'Agente IA' : no.tipo === 'condicao' ? 'Condicional' : 'Ação Final'}
                        </span>

                        {agenteInfo && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            borderRadius: 'var(--raio-pill)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: 'var(--papel-fundo)',
                            color: 'var(--tinta)'
                          }}>
                            <Bot size={10} />
                            {agenteInfo.nome}
                          </span>
                        )}
                      </div>

                      {/* Título e Subtítulo do Nó */}
                      <h4 style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: 'var(--tinta)',
                        marginBottom: '6px',
                        lineHeight: 1.3
                      }}>
                        {no.titulo}
                      </h4>

                      <p style={{
                        fontSize: '0.78rem',
                        color: 'var(--tinta-media)',
                        lineHeight: 1.4,
                        marginBottom: '12px'
                      }}>
                        {no.subtitulo}
                      </p>

                      {/* Rodapé do Nó com Indicador de Conexão */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--aro-cor)',
                        fontSize: '0.75rem',
                        color: 'var(--tinta-fraca)'
                      }}>
                        <span>Saída JSON</span>
                        {estaExecutando && (
                          <span style={{ color: 'var(--sinal-vivo)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Activity size={12} />
                            Ativo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Conector Visual entre os Nós */}
                    {idx < fluxoAtual.nos.length - 1 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: estaExecutando ? 'var(--iris-violeta)' : 'var(--tinta-fantasma)',
                        transition: 'color 0.2s ease'
                      }}>
                        <ArrowRight size={22} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Painel Flutuante de Logs de Execução */}
            {logExecucao && (
              <div style={{
                marginTop: '30px',
                background: 'var(--papel-fundo)',
                border: '1px solid var(--aro-cor)',
                borderRadius: 'var(--raio-md)',
                padding: '12px 18px',
                fontSize: '0.85rem',
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
        </div>
      )}

      {/* ============================================================
          ABA 2: N8N EMBUTIDO (SEM PRECISAR ABRIR OUTRA ABA)
          ============================================================ */}
      {abaAtiva === 'n8n_embed' && (
        <div style={{
          background: 'var(--papel-cartao)',
          border: '1px solid var(--aro-cor)',
          borderRadius: 'var(--raio-lg)',
          padding: '24px',
          boxShadow: 'var(--sombra-sm)'
        }}>
          {/* Top Bar da Conexão n8n */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--aro-cor)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--raio-sm)',
                background: 'rgba(255, 110, 80, 0.12)',
                color: 'var(--iris-pessego)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={20} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--tinta)' }}>
                  Instância n8n Conectada (Webview Integrada)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--tinta-media)' }}>
                  O n8n roda incorporado dentro do Repass AI. Conecte sua instância local (`localhost:5678`) ou na nuvem.
                </p>
              </div>
            </div>

            {/* Input da URL do n8n */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={n8nUrl}
                onChange={(e) => handleSalvarN8nUrl(e.target.value)}
                placeholder="http://localhost:5678 ou https://seu-n8n.com"
                style={{
                  width: '260px',
                  padding: '8px 12px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--tinta)',
                  outline: 'none'
                }}
              />

              <button
                onClick={() => {
                  setN8nConectando(true);
                  setTimeout(() => setN8nConectando(false), 800);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--tinta)',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} className={n8nConectando ? 'spin' : ''} />
                Recarregar
              </button>

              <a
                href={n8nUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--tinta)',
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={14} />
                Abrir Externo
              </a>
            </div>
          </div>

          {/* Iframe Embutido Seguro do n8n com Fallback Elegante */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '680px',
            borderRadius: 'var(--raio-md)',
            overflow: 'hidden',
            border: '1px solid var(--aro-cor)',
            background: 'var(--papel-fundo)'
          }}>
            <iframe
              src={n8nUrl}
              title="n8n Automation Engine"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />

            {/* Guia de Inicialização do n8n caso localhost não esteja ligado ainda */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: 'var(--papel-cartao)',
              border: '1px solid var(--aro-cor)',
              borderRadius: 'var(--raio-md)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--sombra-md)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Terminal size={18} color="var(--iris-violeta)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--tinta)' }}>
                  Para rodar o n8n no seu computador com 1 comando: <strong>npx n8n</strong> ou via Docker <strong>docker run -it --rm -p 5678:5678 n8nio/n8n</strong>
                </span>
              </div>

              <span style={{ fontSize: '0.8rem', color: 'var(--iris-azul)', fontWeight: 600 }}>
                Porta Padrão: 5678
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          ABA 3: LISTA DE REGRAS E GATILHOS (ESTILO ARAMISE / CRM)
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
                    Editar Nós
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
          MODAL: NOVA AUTOMAÇÃO (COMO NO PRINT 1 ENVIADO PELO USUÁRIO)
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

            {/* Input Nome */}
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

            {/* Select Gatilho (Igual ao print 1 do usuário) */}
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

            {/* Conexão com Agente IA */}
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
          MODAL: EXPORTAR JSON N8N COMPATÍVEL
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
              JSON Compatível com n8n
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
