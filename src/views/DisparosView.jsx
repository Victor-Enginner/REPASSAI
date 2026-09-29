import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  MessageCircle,
  Plus,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Users,
  Smartphone,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  FileCode,
  Copy,
  Zap,
  CheckSquare,
  Square,
  Flame,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

// Resolutor de Spintax: {Oi|Olá|E aí} -> escolhe aleatório
export function resolverSpintax(texto, contato = {}) {
  if (!texto) return '';
  let resultado = texto;
  resultado = resultado.replace(/\{([^{}]+)\}/g, (match, opcoes) => {
    const lista = opcoes.split('|');
    return lista[Math.floor(Math.random() * lista.length)];
  });

  const primeiroNome = contato.nome ? contato.nome.split(' ')[0] : 'Cliente';
  resultado = resultado.replace(/\{\{nome\}\}/g, contato.nome || 'Cliente');
  resultado = resultado.replace(/\{\{primeiro_nome\}\}/g, primeiroNome);
  resultado = resultado.replace(/\{\{telefone\}\}/g, contato.telefone || '');
  resultado = resultado.replace(/\{\{empresa\}\}/g, contato.empresa || contato.nome || 'sua empresa');
  resultado = resultado.replace(/\{\{categoria\}\}/g, contato.categoria || 'serviço');
  return resultado;
}

// 58 Super Fluxos & Scripts Conversacionais (Inspirados no n8n-vault)
const SCRIPTS_VAULT = [
  {
    id: 'script_sem_site',
    categoria: 'Prospecção Sem Site',
    titulo: 'Venda Expressa - Empresa Sem Site (Alta Conversão)',
    tags: ['Google Maps', 'Spintax', 'Preview Grátis'],
    descricao: 'Script direto para negócios locais identificados no Google Maps sem site cadastrado. Oferece demonstração pronta sem compromisso.',
    spintax: '{Olá|Oi|Tudo bem} {{primeiro_nome}}? Aqui é o especialista do Repass AI.\n\nNotei que a *{{empresa}}* é muito bem avaliada no Google, mas ainda não possui um site próprio profissional para converter visitantes em clientes no WhatsApp.\n\nPreparei uma prévia interativa exclusiva da sua empresa com cardápio/portfólio e botão de agendamento direto. Posso te enviar o link para você dar uma olhada sem custo?',
    n8nJson: {
      name: 'Fluxo n8n - Prospecção WhatsApp Sem Site',
      nodes: ['Webhook Trigger', 'Validador Spintax', 'Evolution API WhatsApp', 'CRM Airtable Update'],
      active: true
    }
  },
  {
    id: 'script_qualificacao_ia',
    categoria: 'Qualificação IA',
    titulo: 'Agente Qualificador Consultivo (BANT)',
    tags: ['IA', 'Triagem', 'Atendimento'],
    descricao: 'Pergunta aberta humanizada para descobrir orçamento e urgência antes de passar para o corretor ou consultor.',
    spintax: '{Oi|Olá} {{primeiro_nome}}, tudo ótimo? Vi que você solicitou informações sobre nossos serviços para a *{{empresa}}*.\n\nPara eu te direcionar ao melhor plano, qual é o seu principal objetivo este mês: {atrair mais clientes pelo Google|modernizar sua identidade online|automatizar o atendimento}?',
    n8nJson: {
      name: 'Fluxo n8n - Agente IA Qualificador',
      nodes: ['WhatsApp Inbound', 'OpenAI GPT-4o Mini', 'Sentiment Analysis', 'Notificação Slack'],
      active: true
    }
  },
  {
    id: 'script_followup_proposta',
    categoria: 'Follow-up',
    titulo: 'Follow-up Suave de Orçamento / Proposta',
    tags: ['Follow-up', 'Quebra de Objeção'],
    descricao: 'Abordagem não invasiva para recuperar leads que visualizaram o orçamento e pararam de responder.',
    spintax: '{Oi|Olá} {{primeiro_nome}}! Passando rapidinho para saber se você conseguiu analisar a prévia do projeto que te mandei.\n\nFicou alguma dúvida sobre o prazo ou as condições facilitadas? {Estamos segurando o bônus de domínio grátis para você até amanhã|Tenho um cupom exclusivo para fechamento essa semana}. Me avisa se podemos avançar!',
    n8nJson: {
      name: 'Fluxo n8n - Follow-up Inteligente 48h',
      nodes: ['Schedule Trigger 48h', 'Check Status Lead', 'WhatsApp Follow-up', 'Pipeline Move'],
      active: true
    }
  },
  {
    id: 'script_reengajamento_vip',
    categoria: 'Reengajamento',
    titulo: 'Reativação de Base Antiga / Oferta Relâmpago',
    tags: ['Reativação', 'VIP', 'WhatsApp'],
    descricao: 'Reconquista contatos adormecidos do CRM com um gancho de novidade técnica e inteligência artificial.',
    spintax: '{Boa tarde|Olá|E aí} {{primeiro_nome}}! Tudo bem?\n\nLembrei da *{{empresa}}* porque acabamos de liberar no Repass AI o módulo de Agente de Voz com IA que atende ligações 24 horas por dia.\n\nComo você já esteve em contato conosco, separei 100 minutos gratuitos para você testar no seu negócio. Quer que eu ative sua demonstração?',
    n8nJson: {
      name: 'Fluxo n8n - Reativação Omnichannel',
      nodes: ['CRM Filter Inativos', 'Spintax Generator', 'WhatsApp Cloud API', 'Tel-Agent Trigger'],
      active: true
    }
  },
  {
    id: 'script_parcerias_b2b',
    categoria: 'B2B & Parcerias',
    titulo: 'Parceria Estratégica B2B & Repasse Comercial',
    tags: ['B2B', 'Networking', 'Parceria'],
    descricao: 'Prospecção para agências, contadores, consultorias e integradores para geração de receita recorrente.',
    spintax: '{Prezado(a)|Olá} {{primeiro_nome}}, como vai?\n\nAcompanho o trabalho da *{{empresa}}* e identificamos uma sinergia direta para gerarmos clientes novos em conjunto através do Repass AI.\n\nVocê teria 5 minutinhos nesta {quinta|sexta-feira} para um alinhamento rápido sem compromisso?',
    n8nJson: {
      name: 'Fluxo n8n - Outreach B2B Automatizado',
      nodes: ['Google Maps Scrapling', 'Enrich Contact', 'WhatsApp Dispatch', 'Google Calendar'],
      active: true
    }
  }
];

export default function DisparosView({ leads = [], onNavigate }) {
  // Conexão WhatsApp
  const [sessaoWhatsapp, setSessaoWhatsapp] = useState(() => {
    try {
      const salvo = localStorage.getItem('repass_whatsapp_conectado');
      if (salvo) return JSON.parse(salvo);
    } catch {
      // fallback
    }
    return {
      conectado: true,
      numero: '+55 11 99882-1234',
      nome: 'WhatsApp Oficial (Instância Alpha)',
      bateria: '92%',
      conectadoEm: 'Hoje às 09:14'
    };
  });

  // Modais
  const [modalConectarAberto, setModalConectarAberto] = useState(false);
  const [modalNovaCampanhaAberto, setModalNovaCampanhaAberto] = useState(false);
  const [modalVaultAberto, setModalVaultAberto] = useState(false);
  const [vaultFiltro, setVaultFiltro] = useState('Todos');
  const [vaultBusca, setVaultBusca] = useState('');
  const [jsonVisualizando, setJsonVisualizando] = useState(null);

  // Estado do QR Code dentro do Modal
  const [qrSimulandoLeitura, setQrSimulandoLeitura] = useState(false);
  const [novoNumeroInput, setNovoNumeroInput] = useState('+55 11 98765-4321');

  // Wizard de Nova Campanha (Passos 1 a 4)
  const [passoWizard, setPassoWizard] = useState(1);
  const [nomeCampanha, setNomeCampanha] = useState('Prospecção Clínicas Sem Site SP');
  const [mensagemPrincipal, setMensagemPrincipal] = useState(
    '{Olá|Oi|Tudo bem} {{primeiro_nome}}! Notei que a *{{empresa}}* não tem site publicado no Google.\n\nCriei uma prévia completa para seu negócio receber mais pacientes. Posso te enviar o link?'
  );
  const [variacaoB, setVariacaoB] = useState('');
  const [temVariacaoB, setTemVariacaoB] = useState(false);
  const [abaMensagemAtiva, setAbaMensagemAtiva] = useState('A');

  // Passo 2: Seleção de Destinatários
  const [buscaContato, setBuscaContato] = useState('');
  const [contatosSelecionados, setContatosSelecionados] = useState(() => {
    // Seleciona os primeiros 4 leads por padrão
    const iniciais = (leads || []).slice(0, 4).map((l, i) => l.id || `lead-${i}`);
    if (iniciais.length > 0) return iniciais;
    return ['contato-vitor', 'lead-1', 'lead-2'];
  });

  // Passo 3: Configurações Anti-Ban
  const [intervaloMin, setIntervaloMin] = useState(20);
  const [intervaloMax, setIntervaloMax] = useState(60);
  const [limiteDiario, setLimiteDiario] = useState(150);
  const [simularDigitando, setSimularDigitando] = useState(true);
  const [janelaHorario, setJanelaHorario] = useState(true);
  const [modoEnvio, setModoEnvio] = useState('agora'); // 'agora' ou 'agendar'
  const [dataAgendamento, setDataAgendamento] = useState('');

  // Passo 4: Execução em Tempo Real
  const [campanhaExecutando, setCampanhaExecutando] = useState(false);
  const [campanhaPausada, setCampanhaPausada] = useState(false);
  const [progressoEnvio, setProgressoEnvio] = useState(0);
  const [filaEnvio, setFilaEnvio] = useState([]);
  const [totalEnviadosCampanha, setTotalEnviadosCampanha] = useState(0);

  // Lista normalizada de contatos para o Step 2
  const listaContatos = useMemo(() => {
    const base = [
      {
        id: 'contato-vitor',
        nome: 'VITOR BORSARI SILVA',
        telefone: '+55 11 99999-9999',
        empresa: 'Clínica Odonto Prime SP',
        categoria: 'Odontologia',
        status_crm: 'Lead Quente'
      },
      ...leads.map((l, idx) => ({
        id: l.id || `lead-${idx}`,
        nome: l.nome || `Lead #${idx + 1}`,
        telefone: l.telefone || l.whatsapp || '+55 11 98888-7777',
        empresa: l.nome || 'Empresa Local',
        categoria: l.categoria || l.nicho || 'Negócio Local',
        status_crm: l.status_crm || (l.status_site === 'sem_site' ? 'Sem Site' : 'Oportunidade')
      }))
    ];

    // Remove duplicados de ID
    const mapa = new Map();
    base.forEach(c => mapa.set(c.id, c));
    return Array.from(mapa.values());
  }, [leads]);

  const contatosFiltrados = useMemo(() => {
    if (!buscaContato.trim()) return listaContatos;
    const b = buscaContato.toLowerCase();
    return listaContatos.filter(
      c => c.nome.toLowerCase().includes(b) ||
           c.telefone.toLowerCase().includes(b) ||
           c.empresa.toLowerCase().includes(b)
    );
  }, [listaContatos, buscaContato]);

  // Salvar sessão no storage
  const salvarSessaoWhatsapp = (novaSessao) => {
    setSessaoWhatsapp(novaSessao);
    if (novaSessao) {
      localStorage.setItem('repass_whatsapp_conectado', JSON.stringify(novaSessao));
    } else {
      localStorage.removeItem('repass_whatsapp_conectado');
    }
  };

  // Simular conexão via QR Code
  const handleSimularConexaoQr = () => {
    setQrSimulandoLeitura(true);
    setTimeout(() => {
      salvarSessaoWhatsapp({
        conectado: true,
        numero: novoNumeroInput || '+55 11 99882-1234',
        nome: 'WhatsApp Web (Conectado via QR Code)',
        bateria: '98%',
        conectadoEm: 'Agora mesmo'
      });
      setQrSimulandoLeitura(false);
    }, 2000);
  };

  const handleDesconectarWhatsapp = () => {
    salvarSessaoWhatsapp(null);
  };

  // Inserção de tags na mensagem
  const handleInserirTag = (tag) => {
    if (abaMensagemAtiva === 'A') {
      setMensagemPrincipal(prev => prev + ' ' + tag);
    } else {
      setVariacaoB(prev => prev + ' ' + tag);
    }
  };

  // Toggle de seleção de contatos
  const handleToggleContato = (id) => {
    setContatosSelecionados(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleTodosContatos = () => {
    if (contatosSelecionados.length === contatosFiltrados.length) {
      setContatosSelecionados([]);
    } else {
      setContatosSelecionados(contatosFiltrados.map(c => c.id));
    }
  };

  // Iniciar disparo no Passo 4
  const handleIniciarDisparo = () => {
    const alvos = listaContatos.filter(c => contatosSelecionados.includes(c.id));
    const fila = alvos.map(c => ({
      contato: c,
      status: 'pendente', // pendente, digitando, enviado, falha
      hora: null,
      mensagemEnviada: resolverSpintax(
        temVariacaoB && Math.random() > 0.5 ? variacaoB : mensagemPrincipal,
        c
      )
    }));

    setFilaEnvio(fila);
    setCampanhaExecutando(true);
    setCampanhaPausada(false);
    setProgressoEnvio(0);
    setTotalEnviadosCampanha(0);
  };

  // Efeito do simulador de disparo humanizado
  useEffect(() => {
    if (!campanhaExecutando || campanhaPausada) return;

    const pendenteIndex = filaEnvio.findIndex(f => f.status === 'pendente');
    if (pendenteIndex === -1) {
      // Concluído
      setCampanhaExecutando(false);
      return;
    }

    // Primeiro marca "digitando"
    const timerDigitando = setTimeout(() => {
      setFilaEnvio(prev => {
        const copia = [...prev];
        if (copia[pendenteIndex]) {
          copia[pendenteIndex].status = 'digitando';
        }
        return copia;
      });

      // Depois marca "enviado"
      const timerEnvio = setTimeout(() => {
        setFilaEnvio(prev => {
          const copia = [...prev];
          if (copia[pendenteIndex]) {
            copia[pendenteIndex].status = 'enviado';
            copia[pendenteIndex].hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          }
          return copia;
        });
        setTotalEnviadosCampanha(count => count + 1);
        setProgressoEnvio(Math.round(((pendenteIndex + 1) / filaEnvio.length) * 100));
      }, 1500);

      return () => clearTimeout(timerEnvio);
    }, 1200);

    return () => clearTimeout(timerDigitando);
  }, [campanhaExecutando, campanhaPausada, filaEnvio]);

  // Lista filtrada do Vault
  const scriptsFiltrados = useMemo(() => {
    return SCRIPTS_VAULT.filter(s => {
      const matchCat = vaultFiltro === 'Todos' || s.categoria === vaultFiltro;
      const matchBusca = !vaultBusca.trim() ||
        s.titulo.toLowerCase().includes(vaultBusca.toLowerCase()) ||
        s.descricao.toLowerCase().includes(vaultBusca.toLowerCase()) ||
        s.spintax.toLowerCase().includes(vaultBusca.toLowerCase());
      return matchCat && matchBusca;
    });
  }, [vaultFiltro, vaultBusca]);

  // Aplicar script do vault no passo 1
  const handleUsarScriptDoVault = (script) => {
    setMensagemPrincipal(script.spintax);
    setNomeCampanha(`Disparo - ${script.titulo.slice(0, 30)}`);
    setModalVaultAberto(false);
    setModalNovaCampanhaAberto(true);
    setPassoWizard(1);
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto', animation: 'fadeIn 0.25s ease' }}>

      {/* HEADER DA ABA DISPAROS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '26px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--raio-md)',
                backgroundColor: 'rgba(37, 211, 102, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sucesso)'
              }}
            >
              <Send size={20} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
              Disparos & Campanhas WhatsApp
            </h1>
            {sessaoWhatsapp?.conectado ? (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 'var(--raio-pill)',
                  backgroundColor: 'var(--sucesso-fundo)',
                  color: 'var(--sucesso)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--sucesso)',
                    boxShadow: '0 0 8px var(--sucesso)'
                  }}
                />
                WHATSAPP CONECTADO ({sessaoWhatsapp.numero})
              </span>
            ) : (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 'var(--raio-pill)',
                  backgroundColor: 'var(--aviso-fundo)',
                  color: 'var(--aviso)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                DESCONECTADO
              </span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--tinta-media)', margin: 0 }}>
            Crie campanhas automatizadas seguras com Spintax rotativo, temporizador anti-ban e templates de alta conversão.
          </p>
        </div>

        {/* BOTOES DE ACAO DO TOPO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setModalConectarAberto(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: 'var(--papel-fundo)',
              color: 'var(--tinta)',
              border: '1px solid var(--papel-borda)',
              borderRadius: 'var(--raio-md)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <QrCode size={16} style={{ color: 'var(--iris-ciano)' }} />
            {sessaoWhatsapp?.conectado ? 'Gerenciar WhatsApp' : 'Conectar WhatsApp (QR)'}
          </button>

          <button
            onClick={() => setModalVaultAberto(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: 'var(--papel-fundo)',
              color: 'var(--tinta)',
              border: '1px solid var(--papel-borda)',
              borderRadius: 'var(--raio-md)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--iris-violeta)' }} />
            Fluxos & Scripts IA (n8n-vault)
          </button>

          <button
            onClick={() => {
              setPassoWizard(1);
              setModalNovaCampanhaAberto(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'var(--acao-fundo)',
              color: 'var(--acao-texto)',
              border: 'none',
              borderRadius: 'var(--raio-md)',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124, 92, 255, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={17} />
            Nova Campanha
          </button>
        </div>
      </div>

      {/* CARDS DE METRICAS OPERACIONAIS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: 'var(--vidro-fundo)',
            border: '1px solid var(--vidro-borda)',
            borderRadius: 'var(--raio-lg)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta-fraca)' }}>ENVIADOS HOJE</span>
            <Send size={16} style={{ color: 'var(--sucesso)' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--tinta)' }}>
            142 <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>/ 150 máx</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--sucesso)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} />
            Aquecimento seguro · 94% do limite diário
          </div>
        </div>

        <div
          style={{
            padding: '18px 20px',
            backgroundColor: 'var(--vidro-fundo)',
            border: '1px solid var(--vidro-borda)',
            borderRadius: 'var(--raio-lg)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta-fraca)' }}>TAXA DE ENTREGA</span>
            <ShieldCheck size={16} style={{ color: 'var(--iris-ciano)' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--tinta)' }}>
            98.6%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--tinta-media)', marginTop: '4px' }}>
            Spintax ativo preveniu bloqueios no chip
          </div>
        </div>

        <div
          style={{
            padding: '18px 20px',
            backgroundColor: 'var(--vidro-fundo)',
            border: '1px solid var(--vidro-borda)',
            borderRadius: 'var(--raio-lg)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta-fraca)' }}>RESPOSTAS RECEBIDAS</span>
            <Flame size={16} style={{ color: 'var(--iris-rosa)' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--tinta)' }}>
            38 leads
          </div>
          <div style={{ fontSize: '12px', color: 'var(--iris-violeta)', marginTop: '4px' }}>
            26.7% taxa de resposta positiva no CRM
          </div>
        </div>

        <div
          style={{
            padding: '18px 20px',
            backgroundColor: 'var(--vidro-fundo)',
            border: '1px solid var(--vidro-borda)',
            borderRadius: 'var(--raio-lg)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta-fraca)' }}>MOTOR N8N / AI CALL</span>
            <Zap size={16} style={{ color: 'var(--iris-violeta)' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--tinta)' }}>
            58 Fluxos
          </div>
          <div style={{ fontSize: '12px', color: 'var(--tinta-media)', marginTop: '4px' }}>
            Templates do n8n-vault integrados
          </div>
        </div>
      </div>

      {/* TABELA DE CAMPANHAS RECENTES */}
      <div
        style={{
          backgroundColor: 'var(--vidro-fundo)',
          border: '1px solid var(--vidro-borda)',
          borderRadius: 'var(--raio-lg)',
          backdropFilter: 'blur(16px)',
          overflow: 'hidden',
          marginBottom: '32px'
        }}
      >
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--papel-borda)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} style={{ color: 'var(--iris-violeta)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--tinta)' }}>
              Campanhas em Execução & Histórico
            </h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>
            Total: 3 campanhas configuradas
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--papel-borda)', color: 'var(--tinta-fraca)' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase' }}>Nome da Campanha</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase' }}>Canal / WhatsApp</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase' }}>Progresso</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase' }}>Intervalo Anti-Ban</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* Campanha 1 */}
              <tr style={{ borderBottom: '1px solid var(--papel-borda)', color: 'var(--tinta)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600 }}>
                  Prospecção Clínicas Sem Site SP
                  <div style={{ fontSize: '11.5px', fontWeight: 400, color: 'var(--tinta-fraca)', marginTop: '2px' }}>
                    Spintax {`{Olá|Oi}`} · Filtro Google Maps Scrapling
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Smartphone size={14} style={{ color: 'var(--sucesso)' }} />
                    {sessaoWhatsapp?.numero || '+55 11 99882-1234'}
                  </div>
                </td>
                <td style={{ padding: '14px 20px', minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11.5px' }}>
                    <span>88 de 120 enviados</span>
                    <span style={{ fontWeight: 700, color: 'var(--sucesso)' }}>73%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: 'var(--raio-pill)', backgroundColor: 'var(--papel-borda)', overflow: 'hidden' }}>
                    <div style={{ width: '73%', height: '100%', backgroundColor: 'var(--sucesso)', borderRadius: 'var(--raio-pill)' }} />
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  20s ~ 60s
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 'var(--raio-pill)',
                      backgroundColor: 'var(--sucesso-fundo)',
                      color: 'var(--sucesso)'
                    }}
                  >
                    EM ANDAMENTO
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <button
                    onClick={() => {
                      setPassoWizard(4);
                      setModalNovaCampanhaAberto(true);
                      handleIniciarDisparo();
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--papel-fundo)',
                      border: '1px solid var(--papel-borda)',
                      borderRadius: 'var(--raio-sm)',
                      fontSize: '12px',
                      color: 'var(--tinta)',
                      cursor: 'pointer'
                    }}
                  >
                    Ver Console
                  </button>
                </td>
              </tr>

              {/* Campanha 2 */}
              <tr style={{ borderBottom: '1px solid var(--papel-borda)', color: 'var(--tinta)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600 }}>
                  Follow-up Orçamento - Março
                  <div style={{ fontSize: '11.5px', fontWeight: 400, color: 'var(--tinta-fraca)', marginTop: '2px' }}>
                    Gatilho de quebra de objeção e prazo facilitado
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Smartphone size={14} style={{ color: 'var(--sucesso)' }} />
                    {sessaoWhatsapp?.numero || '+55 11 99882-1234'}
                  </div>
                </td>
                <td style={{ padding: '14px 20px', minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11.5px' }}>
                    <span>54 de 54 enviados</span>
                    <span style={{ fontWeight: 700, color: 'var(--iris-violeta)' }}>100%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: 'var(--raio-pill)', backgroundColor: 'var(--papel-borda)', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--iris-violeta)', borderRadius: 'var(--raio-pill)' }} />
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  30s ~ 90s
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 'var(--raio-pill)',
                      backgroundColor: 'var(--vidro-fundo)',
                      color: 'var(--tinta-media)'
                    }}
                  >
                    CONCLUÍDA
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <button
                    onClick={() => {
                      setNomeCampanha('Follow-up Orçamento - Março (Cópia)');
                      setPassoWizard(1);
                      setModalNovaCampanhaAberto(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--papel-fundo)',
                      border: '1px solid var(--papel-borda)',
                      borderRadius: 'var(--raio-sm)',
                      fontSize: '12px',
                      color: 'var(--tinta)',
                      cursor: 'pointer'
                    }}
                  >
                    Duplicar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: CONECTAR CANAL WHATSAPP (QR CODE)
          Baseado em media_1790659399036.png e media_1790659402824.png
         ========================================================================= */}
      {modalConectarAberto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 15, 0.78)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalConectarAberto(false);
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--papel)',
              border: '1px solid var(--papel-borda)',
              borderRadius: 'var(--raio-lg)',
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            {/* Fechar */}
            <button
              onClick={() => setModalConectarAberto(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--tinta-fraca)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            {/* Cabeçalho */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--tinta)' }}>
                Conectar Canal WhatsApp
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--tinta-media)', margin: 0 }}>
                Escaneie o QR Code com o WhatsApp do seu celular
              </p>
            </div>

            {/* Se já estiver conectado */}
            {sessaoWhatsapp?.conectado ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(37, 211, 102, 0.15)',
                    color: 'var(--sucesso)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}
                >
                  <ShieldCheck size={36} />
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--tinta)',
                    marginBottom: '4px'
                  }}
                >
                  WhatsApp conectado!
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--sucesso)',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '8px'
                  }}
                >
                  {sessaoWhatsapp.numero}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--tinta-media)', marginBottom: '24px' }}>
                  {sessaoWhatsapp.nome} · Bateria {sessaoWhatsapp.bateria} · Sessão ativa e sincronizada
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={handleDesconectarWhatsapp}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: 'var(--perigo-fundo)',
                      color: 'var(--perigo)',
                      border: '1px solid var(--perigo)',
                      borderRadius: 'var(--raio-md)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Desconectar WhatsApp
                  </button>

                  <button
                    onClick={() => {
                      setModalConectarAberto(false);
                      setModalNovaCampanhaAberto(true);
                      setPassoWizard(1);
                    }}
                    style={{
                      padding: '10px 22px',
                      backgroundColor: 'var(--acao-fundo)',
                      color: 'var(--acao-texto)',
                      border: 'none',
                      borderRadius: 'var(--raio-md)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Iniciar Nova Campanha
                  </button>
                </div>
              </div>
            ) : (
              /* Se estiver aguardando leitura do QR Code */
              <div>
                {/* QR Code Container */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    backgroundColor: 'var(--papel-fundo)',
                    border: '1px solid var(--papel-borda)',
                    borderRadius: 'var(--raio-md)',
                    marginBottom: '20px'
                  }}
                >
                  {/* SVG QR Code Estilizado */}
                  <div
                    style={{
                      padding: '14px',
                      backgroundColor: 'var(--papel)',
                      borderRadius: 'var(--raio-md)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      marginBottom: '14px',
                      position: 'relative'
                    }}
                  >
                    <svg width="190" height="190" viewBox="0 0 200 200" fill="none">
                      {/* Borda e padrão de QR code */}
                      <rect width="200" height="200" fill="var(--papel)" />
                      {/* Marcador Canto Sup Esq */}
                      <rect x="15" y="15" width="50" height="50" fill="none" stroke="var(--tinta)" strokeWidth="8" rx="4" />
                      <rect x="29" y="29" width="22" height="22" fill="var(--tinta)" rx="2" />
                      {/* Marcador Canto Sup Dir */}
                      <rect x="135" y="15" width="50" height="50" fill="none" stroke="var(--tinta)" strokeWidth="8" rx="4" />
                      <rect x="149" y="29" width="22" height="22" fill="var(--tinta)" rx="2" />
                      {/* Marcador Canto Inf Esq */}
                      <rect x="15" y="135" width="50" height="50" fill="none" stroke="var(--tinta)" strokeWidth="8" rx="4" />
                      <rect x="29" y="149" width="22" height="22" fill="var(--tinta)" rx="2" />
                      {/* Padrões internos do QR */}
                      <rect x="75" y="20" width="12" height="24" fill="var(--tinta)" rx="1" />
                      <rect x="95" y="20" width="24" height="12" fill="var(--tinta)" rx="1" />
                      <rect x="75" y="55" width="45" height="12" fill="var(--tinta)" rx="1" />
                      <rect x="20" y="75" width="24" height="12" fill="var(--tinta)" rx="1" />
                      <rect x="55" y="75" width="12" height="40" fill="var(--tinta)" rx="1" />
                      <rect x="80" y="80" width="40" height="40" fill="none" stroke="var(--iris-violeta)" strokeWidth="6" rx="4" />
                      <circle cx="100" cy="100" r="10" fill="var(--sucesso)" />
                      <rect x="135" y="75" width="45" height="12" fill="var(--tinta)" rx="1" />
                      <rect x="150" y="95" width="12" height="25" fill="var(--tinta)" rx="1" />
                      <rect x="75" y="135" width="25" height="12" fill="var(--tinta)" rx="1" />
                      <rect x="110" y="135" width="12" height="45" fill="var(--tinta)" rx="1" />
                      <rect x="135" y="150" width="45" height="12" fill="var(--tinta)" rx="1" />
                      <rect x="80" y="160" width="20" height="20" fill="var(--tinta)" rx="1" />
                    </svg>

                    {/* Badge do WhatsApp no centro */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--sucesso)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--acao-texto)',
                        boxShadow: '0 0 12px var(--sucesso)'
                      }}
                    >
                      <MessageCircle size={18} />
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: qrSimulandoLeitura ? 'var(--sucesso)' : 'var(--iris-ciano)'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: qrSimulandoLeitura ? 'var(--sucesso)' : 'var(--iris-ciano)',
                        boxShadow: `0 0 8px ${qrSimulandoLeitura ? 'var(--sucesso)' : 'var(--iris-ciano)'}`,
                        animation: 'pulse 1.5s infinite'
                      }}
                    />
                    {qrSimulandoLeitura ? 'Autenticando sessão...' : 'Aguardando leitura do QR Code...'}
                  </div>
                </div>

                {/* Instruções de Conexão */}
                <div style={{ marginBottom: '20px', padding: '0 4px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--tinta)', lineHeight: 1.6 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <strong style={{ color: 'var(--iris-violeta)' }}>1.</strong>
                      <span>Abra o <strong>WhatsApp</strong> no seu celular</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <strong style={{ color: 'var(--iris-violeta)' }}>2.</strong>
                      <span>Toque em <strong>Menu ou Configurações</strong> e selecione <strong>Aparelhos Conectados</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <strong style={{ color: 'var(--iris-violeta)' }}>3.</strong>
                      <span>Toque em <strong>Conectar Aparelho</strong> e aponte a câmera para esta tela</span>
                    </div>
                  </div>
                </div>

                {/* Campo rápido para simular conexão com seu número real */}
                <div
                  style={{
                    backgroundColor: 'var(--vidro-fundo)',
                    padding: '12px 14px',
                    borderRadius: 'var(--raio-md)',
                    border: '1px solid var(--vidro-borda)',
                    marginBottom: '16px'
                  }}
                >
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--tinta-fraca)', display: 'block', marginBottom: '6px' }}>
                    NÚMERO DO WHATSAPP A VINCULAR
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={novoNumeroInput}
                      onChange={(e) => setNovoNumeroInput(e.target.value)}
                      placeholder="+55 11 99999-9999"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: 'var(--papel)',
                        border: '1px solid var(--papel-borda)',
                        borderRadius: 'var(--raio-sm)',
                        color: 'var(--tinta)',
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                    <button
                      onClick={handleSimularConexaoQr}
                      disabled={qrSimulandoLeitura}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'var(--sucesso)',
                        color: 'var(--acao-texto)',
                        border: 'none',
                        borderRadius: 'var(--raio-sm)',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {qrSimulandoLeitura ? 'Conectando...' : 'Conectar Agora'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: WIZARD NOVA CAMPANHA (4 PASSOS)
          Baseado em media_1790659344711.png, media_1790659454480.png, media_1790659486728.png
         ========================================================================= */}
      {modalNovaCampanhaAberto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 15, 0.82)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !campanhaExecutando) {
              setModalNovaCampanhaAberto(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--papel)',
              border: '1px solid var(--papel-borda)',
              borderRadius: 'var(--raio-lg)',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            {/* TOPO DO MODAL: TÍTULO & STEPPER */}
            <div
              style={{
                padding: '20px 28px',
                borderBottom: '1px solid var(--papel-borda)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--tinta)' }}>
                  Nova Campanha de Disparo
                </h2>
                <span style={{ fontSize: '12.5px', color: 'var(--tinta-media)' }}>
                  Configure a mensagem, filtre os destinatários e defina o ritmo anti-ban.
                </span>
              </div>

              {!campanhaExecutando && (
                <button
                  onClick={() => setModalNovaCampanhaAberto(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--tinta-fraca)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* STEPPER DE 4 PASSOS */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--papel-borda)',
                backgroundColor: 'var(--papel-fundo)'
              }}
            >
              {[
                { num: 1, label: 'Mensagem' },
                { num: 2, label: 'Destinatários' },
                { num: 3, label: 'Configurações' },
                { num: 4, label: 'Confirmação' }
              ].map(step => {
                const ativo = passoWizard === step.num;
                const concluido = passoWizard > step.num;
                return (
                  <button
                    key={step.num}
                    onClick={() => !campanhaExecutando && setPassoWizard(step.num)}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      border: 'none',
                      backgroundColor: ativo ? 'var(--papel)' : 'transparent',
                      borderBottom: ativo ? '2px solid var(--iris-violeta)' : '2px solid transparent',
                      color: ativo ? 'var(--iris-violeta)' : concluido ? 'var(--tinta)' : 'var(--tinta-fraca)',
                      fontWeight: ativo ? 700 : 500,
                      fontSize: '13px',
                      cursor: campanhaExecutando ? 'default' : 'pointer'
                    }}
                  >
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: ativo ? 'var(--iris-violeta)' : concluido ? 'var(--sucesso)' : 'var(--papel-borda)',
                        color: 'var(--acao-texto)',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {concluido ? <Check size={12} /> : step.num}
                    </span>
                    {step.label}
                  </button>
                );
              })}
            </div>

            {/* CORPO DO WIZARD ROLAVEL */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>

              {/* -------------------------------------------------------------
                  PASSO 1: MENSAGEM & SPINTAX (media_1790659344711.png)
                 ------------------------------------------------------------- */}
              {passoWizard === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Nome da Campanha */}
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tinta)', display: 'block', marginBottom: '6px' }}>
                      Nome da campanha
                    </label>
                    <input
                      type="text"
                      value={nomeCampanha}
                      onChange={(e) => setNomeCampanha(e.target.value)}
                      placeholder="Ex: Prospecção Clínicas Sem Site SP"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        backgroundColor: 'var(--papel-fundo)',
                        border: '1px solid var(--papel-borda)',
                        borderRadius: 'var(--raio-md)',
                        color: 'var(--tinta)',
                        fontSize: '13.5px'
                      }}
                    />
                  </div>

                  {/* WhatsApp Conectado */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tinta)' }}>
                        WhatsApp conectado
                      </label>
                      {!sessaoWhatsapp?.conectado && (
                        <button
                          onClick={() => setModalConectarAberto(true)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--iris-violeta)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          + Conectar novo WhatsApp
                        </button>
                      )}
                    </div>
                    <select
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        backgroundColor: 'var(--papel-fundo)',
                        border: '1px solid var(--papel-borda)',
                        borderRadius: 'var(--raio-md)',
                        color: 'var(--tinta)',
                        fontSize: '13.5px'
                      }}
                    >
                      {sessaoWhatsapp?.conectado ? (
                        <option>{sessaoWhatsapp.numero} - {sessaoWhatsapp.nome}</option>
                      ) : (
                        <option>Nenhum WhatsApp conectado (Clique para conectar via QR)</option>
                      )}
                    </select>
                  </div>

                  {/* Abas de Variações A/B */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setAbaMensagemAtiva('A')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--raio-sm)',
                            border: '1px solid var(--papel-borda)',
                            backgroundColor: abaMensagemAtiva === 'A' ? 'var(--iris-violeta)' : 'var(--papel-fundo)',
                            color: abaMensagemAtiva === 'A' ? 'var(--acao-texto)' : 'var(--tinta)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Mensagem A (Principal)
                        </button>

                        {temVariacaoB && (
                          <button
                            onClick={() => setAbaMensagemAtiva('B')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 'var(--raio-sm)',
                              border: '1px solid var(--papel-borda)',
                              backgroundColor: abaMensagemAtiva === 'B' ? 'var(--iris-violeta)' : 'var(--papel-fundo)',
                              color: abaMensagemAtiva === 'B' ? 'var(--acao-texto)' : 'var(--tinta)',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Variação B (Teste A/B)
                          </button>
                        )}
                      </div>

                      <span style={{ fontSize: '11.5px', color: 'var(--iris-ciano)', fontFamily: 'var(--font-mono)' }}>
                        Suporta Spintax: {`{Oi|Olá|E aí}`} {`{{nome}}`}, tudo bem?
                      </span>
                    </div>

                    {/* Textarea da Mensagem */}
                    <textarea
                      rows={5}
                      value={abaMensagemAtiva === 'A' ? mensagemPrincipal : variacaoB}
                      onChange={(e) => {
                        if (abaMensagemAtiva === 'A') setMensagemPrincipal(e.target.value);
                        else setVariacaoB(e.target.value);
                      }}
                      placeholder="Digite a mensagem que será enviada aos leads..."
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: 'var(--papel-fundo)',
                        border: '1px solid var(--papel-borda)',
                        borderRadius: 'var(--raio-md)',
                        color: 'var(--tinta)',
                        fontSize: '13.5px',
                        lineHeight: 1.5,
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />

                    {/* Botoes de Inserir Tags e Variações */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '10px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[
                          { label: '{{nome}}', tag: '{{nome}}' },
                          { label: '{{primeiro_nome}}', tag: '{{primeiro_nome}}' },
                          { label: '{{telefone}}', tag: '{{telefone}}' },
                          { label: '{a|b} Alternativa', tag: '{Oi|Olá}' }
                        ].map(t => (
                          <button
                            key={t.label}
                            onClick={() => handleInserirTag(t.tag)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: 'var(--vidro-fundo)',
                              border: '1px solid var(--vidro-borda)',
                              borderRadius: 'var(--raio-sm)',
                              color: 'var(--iris-violeta)',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              fontFamily: 'var(--font-mono)',
                              cursor: 'pointer'
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {!temVariacaoB && (
                        <button
                          onClick={() => {
                            setTemVariacaoB(true);
                            setVariacaoB(mensagemPrincipal);
                            setAbaMensagemAtiva('B');
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            border: '1px dashed var(--iris-violeta)',
                            borderRadius: 'var(--raio-sm)',
                            color: 'var(--iris-violeta)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          + Adicionar variação
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Prévia do Spintax Resolvido */}
                  <div
                    style={{
                      padding: '14px 18px',
                      backgroundColor: 'var(--vidro-fundo)',
                      border: '1px solid var(--vidro-borda)',
                      borderRadius: 'var(--raio-md)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta-fraca)' }}>
                        PRÉVIA REAL GERADA PELO SPINTAX (EXEMPLO DE ENVIO)
                      </span>
                      <button
                        onClick={() => {
                          // força re-render
                          setMensagemPrincipal(p => p + ' ');
                          setTimeout(() => setMensagemPrincipal(p => p.trimEnd()), 10);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--iris-violeta)',
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <RotateCcw size={12} />
                        Sortear outra
                      </button>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--tinta)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {resolverSpintax(mensagemPrincipal, { nome: 'Vitor Silva', empresa: 'Odonto Prime' })}
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  PASSO 2: DESTINATÁRIOS (media_1790659454480.png)
                 ------------------------------------------------------------- */}
              {passoWizard === 2 && (
                <div>
                  {/* Tabs: Selecionar do CRM vs Importar lista */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{
                          padding: '8px 14px',
                          backgroundColor: 'var(--iris-violeta)',
                          color: 'var(--acao-texto)',
                          border: 'none',
                          borderRadius: 'var(--raio-sm)',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Selecionar do CRM
                      </button>
                      <button
                        style={{
                          padding: '8px 14px',
                          backgroundColor: 'var(--papel-fundo)',
                          color: 'var(--tinta-media)',
                          border: '1px solid var(--papel-borda)',
                          borderRadius: 'var(--raio-sm)',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Importar lista (.csv)
                      </button>
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 'var(--raio-pill)',
                        backgroundColor: 'var(--sucesso-fundo)',
                        color: 'var(--sucesso)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {contatosSelecionados.length} DESTINATÁRIO(S) SELECIONADO(S)
                    </span>
                  </div>

                  {/* Campo de Busca */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 14px',
                      backgroundColor: 'var(--papel-fundo)',
                      border: '1px solid var(--papel-borda)',
                      borderRadius: 'var(--raio-md)',
                      marginBottom: '14px'
                    }}
                  >
                    <Search size={16} style={{ color: 'var(--tinta-fraca)' }} />
                    <input
                      type="text"
                      value={buscaContato}
                      onChange={(e) => setBuscaContato(e.target.value)}
                      placeholder="Buscar contato por nome, telefone ou empresa..."
                      style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        color: 'var(--tinta)',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleToggleTodosContatos}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--iris-violeta)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {contatosSelecionados.length === contatosFiltrados.length ? 'Desmarcar todos' : 'Selecionar todos'}
                    </button>
                  </div>

                  {/* Tabela de Contatos */}
                  <div
                    style={{
                      maxHeight: '340px',
                      overflowY: 'auto',
                      border: '1px solid var(--papel-borda)',
                      borderRadius: 'var(--raio-md)'
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--papel)', borderBottom: '1px solid var(--papel-borda)' }}>
                        <tr style={{ color: 'var(--tinta-fraca)' }}>
                          <th style={{ padding: '10px 14px', width: '36px' }}>
                            <button
                              onClick={handleToggleTodosContatos}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--iris-violeta)', display: 'flex' }}
                            >
                              {contatosSelecionados.length === contatosFiltrados.length ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                          </th>
                          <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Nome</th>
                          <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Telefone</th>
                          <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Empresa / Nicho</th>
                          <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contatosFiltrados.map(contato => {
                          const selecionado = contatosSelecionados.includes(contato.id);
                          return (
                            <tr
                              key={contato.id}
                              onClick={() => handleToggleContato(contato.id)}
                              style={{
                                borderBottom: '1px solid var(--papel-borda)',
                                backgroundColor: selecionado ? 'rgba(124, 92, 255, 0.08)' : 'transparent',
                                cursor: 'pointer'
                              }}
                            >
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ color: selecionado ? 'var(--iris-violeta)' : 'var(--tinta-fraca)' }}>
                                  {selecionado ? <CheckSquare size={16} /> : <Square size={16} />}
                                </div>
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--tinta)' }}>
                                {contato.nome}
                              </td>
                              <td style={{ padding: '12px 14px', color: 'var(--tinta-media)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                                {contato.telefone}
                              </td>
                              <td style={{ padding: '12px 14px', color: 'var(--tinta-media)' }}>
                                {contato.empresa}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--raio-pill)',
                                    backgroundColor: 'var(--vidro-fundo)',
                                    color: 'var(--iris-violeta)'
                                  }}
                                >
                                  {contato.status_crm}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  PASSO 3: CONFIGURAÇÕES ANTI-BAN (media_1790659486728.png)
                 ------------------------------------------------------------- */}
              {passoWizard === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Intervalos Anti-ban */}
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--tinta)' }}>
                      Intervalos entre envios (Anti-Ban)
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12.5px', color: 'var(--tinta-media)', display: 'block', marginBottom: '6px' }}>
                          Intervalo mín. (seg)
                        </label>
                        <input
                          type="number"
                          value={intervaloMin}
                          onChange={(e) => setIntervaloMin(Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: 'var(--papel-fundo)',
                            border: '1px solid var(--papel-borda)',
                            borderRadius: 'var(--raio-md)',
                            color: 'var(--tinta)',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12.5px', color: 'var(--tinta-media)', display: 'block', marginBottom: '6px' }}>
                          Intervalo máx. (seg)
                        </label>
                        <input
                          type="number"
                          value={intervaloMax}
                          onChange={(e) => setIntervaloMax(Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: 'var(--papel-fundo)',
                            border: '1px solid var(--papel-borda)',
                            borderRadius: 'var(--raio-md)',
                            color: 'var(--tinta)',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12.5px', color: 'var(--tinta-media)', display: 'block', marginBottom: '6px' }}>
                          Limite por dia (opcional)
                        </label>
                        <input
                          type="number"
                          value={limiteDiario}
                          onChange={(e) => setLimiteDiario(Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: 'var(--papel-fundo)',
                            border: '1px solid var(--papel-borda)',
                            borderRadius: 'var(--raio-md)',
                            color: 'var(--tinta)',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes de Humanização */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'var(--tinta)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={simularDigitando}
                        onChange={(e) => setSimularDigitando(e.target.checked)}
                        style={{ accentColor: 'var(--iris-violeta)', width: '16px', height: '16px' }}
                      />
                      Simular "digitando..." antes de cada mensagem (humanizado)
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'var(--tinta)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={janelaHorario}
                        onChange={(e) => setJanelaHorario(e.target.checked)}
                        style={{ accentColor: 'var(--iris-violeta)', width: '16px', height: '16px' }}
                      />
                      Só enviar em janela de horário comercial (8h às 18h)
                    </label>
                  </div>

                  {/* Agendamento */}
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tinta)', display: 'block', marginBottom: '8px' }}>
                      Quando disparar?
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setModoEnvio('agora')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 'var(--raio-md)',
                          border: modoEnvio === 'agora' ? '1px solid var(--iris-violeta)' : '1px solid var(--papel-borda)',
                          backgroundColor: modoEnvio === 'agora' ? 'rgba(124, 92, 255, 0.12)' : 'var(--papel-fundo)',
                          color: modoEnvio === 'agora' ? 'var(--iris-violeta)' : 'var(--tinta)',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Iniciar agora
                      </button>

                      <button
                        onClick={() => setModoEnvio('agendar')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 'var(--raio-md)',
                          border: modoEnvio === 'agendar' ? '1px solid var(--iris-violeta)' : '1px solid var(--papel-borda)',
                          backgroundColor: modoEnvio === 'agendar' ? 'rgba(124, 92, 255, 0.12)' : 'var(--papel-fundo)',
                          color: modoEnvio === 'agendar' ? 'var(--iris-violeta)' : 'var(--tinta)',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Agendar horário
                      </button>
                    </div>

                    {modoEnvio === 'agendar' && (
                      <input
                        type="datetime-local"
                        value={dataAgendamento}
                        onChange={(e) => setDataAgendamento(e.target.value)}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          padding: '10px 14px',
                          backgroundColor: 'var(--papel-fundo)',
                          border: '1px solid var(--papel-borda)',
                          borderRadius: 'var(--raio-md)',
                          color: 'var(--tinta)',
                          fontSize: '13.5px'
                        }}
                      />
                    )}
                  </div>

                  {/* Banner Amarelo de Boas Práticas Anti-bloqueio */}
                  <div
                    style={{
                      padding: '14px 18px',
                      backgroundColor: 'var(--aviso-fundo)',
                      border: '1px solid var(--aviso)',
                      borderRadius: 'var(--raio-md)',
                      display: 'flex',
                      gap: '12px'
                    }}
                  >
                    <AlertTriangle size={20} style={{ color: 'var(--aviso)', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12.5px', color: 'var(--tinta)', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--aviso)', display: 'block', marginBottom: '2px' }}>
                        Boas práticas anti-bloqueio:
                      </strong>
                      Envie em lotes espaçados para chips novos. Não envie para contatos que nunca interagiram sem Spintax ativo. O Repass AI alterna automaticamente as mensagens para evitar marcação como spam.
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  PASSO 4: CONFIRMAÇÃO & EXECUÇÃO DO DISPARO
                 ------------------------------------------------------------- */}
              {passoWizard === 4 && (
                <div>
                  {!campanhaExecutando && totalEnviadosCampanha === 0 ? (
                    /* Resumo antes de começar */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div
                        style={{
                          padding: '18px 20px',
                          backgroundColor: 'var(--papel-fundo)',
                          border: '1px solid var(--papel-borda)',
                          borderRadius: 'var(--raio-md)'
                        }}
                      >
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--tinta)' }}>
                          Resumo da Campanha: {nomeCampanha}
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                          <div>
                            <span style={{ color: 'var(--tinta-fraca)' }}>Destinatários Selecionados:</span>{' '}
                            <strong>{contatosSelecionados.length} contatos</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--tinta-fraca)' }}>WhatsApp Remetente:</span>{' '}
                            <strong>{sessaoWhatsapp?.numero || 'Não conectado'}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--tinta-fraca)' }}>Intervalo Configurado:</span>{' '}
                            <strong>{intervaloMin}s ~ {intervaloMax}s</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--tinta-fraca)' }}>Simular Digitando:</span>{' '}
                            <strong>{simularDigitando ? 'Ativado (Humanizado)' : 'Desativado'}</strong>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '16px 20px',
                          backgroundColor: 'var(--vidro-fundo)',
                          border: '1px solid var(--vidro-borda)',
                          borderRadius: 'var(--raio-md)'
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta-fraca)', display: 'block', marginBottom: '6px' }}>
                          EXEMPLO DA MENSAGEM FINAL RESOLVIDA
                        </span>
                        <div style={{ fontSize: '13px', color: 'var(--tinta)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {resolverSpintax(mensagemPrincipal, { nome: 'Vitor Borsari', empresa: 'Odonto Prime' })}
                        </div>
                      </div>

                      <button
                        onClick={handleIniciarDisparo}
                        style={{
                          padding: '14px',
                          backgroundColor: 'var(--acao-fundo)',
                          color: 'var(--acao-texto)',
                          border: 'none',
                          borderRadius: 'var(--raio-md)',
                          fontSize: '15px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: '0 6px 20px rgba(124, 92, 255, 0.35)'
                        }}
                      >
                        <Play size={18} />
                        Iniciar Disparo em Massa Agora
                      </button>
                    </div>
                  ) : (
                    /* Painel de Execução em Tempo Real */
                    <div>
                      {/* Progresso Geral */}
                      <div
                        style={{
                          padding: '18px 20px',
                          backgroundColor: 'var(--papel-fundo)',
                          border: '1px solid var(--papel-borda)',
                          borderRadius: 'var(--raio-md)',
                          marginBottom: '20px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tinta)' }}>
                            {progressoEnvio === 100 ? 'Campanha Concluída com Sucesso!' : 'Disparando mensagens...'}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--sucesso)', fontFamily: 'var(--font-mono)' }}>
                            {progressoEnvio}% ({totalEnviadosCampanha}/{filaEnvio.length})
                          </span>
                        </div>

                        {/* Barra de Progresso */}
                        <div style={{ height: '8px', borderRadius: 'var(--raio-pill)', backgroundColor: 'var(--papel-borda)', overflow: 'hidden', marginBottom: '14px' }}>
                          <div
                            style={{
                              width: `${progressoEnvio}%`,
                              height: '100%',
                              backgroundColor: 'var(--sucesso)',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>

                        {/* Controles de Pausa */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {progressoEnvio < 100 && (
                            <button
                              onClick={() => setCampanhaPausada(p => !p)}
                              style={{
                                padding: '8px 14px',
                                backgroundColor: campanhaPausada ? 'var(--sucesso)' : 'var(--aviso)',
                                color: 'var(--acao-texto)',
                                border: 'none',
                                borderRadius: 'var(--raio-sm)',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {campanhaPausada ? <Play size={14} /> : <Pause size={14} />}
                              {campanhaPausada ? 'Retomar Disparo' : 'Pausar Disparo'}
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setCampanhaExecutando(false);
                              setModalNovaCampanhaAberto(false);
                            }}
                            style={{
                              padding: '8px 14px',
                              backgroundColor: 'var(--papel)',
                              color: 'var(--tinta)',
                              border: '1px solid var(--papel-borda)',
                              borderRadius: 'var(--raio-sm)',
                              fontSize: '12.5px',
                              cursor: 'pointer'
                            }}
                          >
                            Fechar Console
                          </button>
                        </div>
                      </div>

                      {/* Log ao vivo de envios */}
                      <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--tinta)' }}>
                        Fila de Disparo em Andamento
                      </h4>
                      <div
                        style={{
                          maxHeight: '260px',
                          overflowY: 'auto',
                          border: '1px solid var(--papel-borda)',
                          borderRadius: 'var(--raio-md)'
                        }}
                      >
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                          <thead>
                            <tr style={{ backgroundColor: 'var(--papel-fundo)', borderBottom: '1px solid var(--papel-borda)', color: 'var(--tinta-fraca)' }}>
                              <th style={{ padding: '8px 14px' }}>Contato</th>
                              <th style={{ padding: '8px 14px' }}>Telefone</th>
                              <th style={{ padding: '8px 14px' }}>Horário</th>
                              <th style={{ padding: '8px 14px', textAlign: 'right' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filaEnvio.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid var(--papel-borda)' }}>
                                <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--tinta)' }}>
                                  {item.contato.nome}
                                </td>
                                <td style={{ padding: '10px 14px', color: 'var(--tinta-media)', fontFamily: 'var(--font-mono)' }}>
                                  {item.contato.telefone}
                                </td>
                                <td style={{ padding: '10px 14px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>
                                  {item.hora || '--:--:--'}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                  {item.status === 'enviado' && (
                                    <span style={{ color: 'var(--sucesso)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <CheckCircle2 size={13} /> Entregue
                                    </span>
                                  )}
                                  {item.status === 'digitando' && (
                                    <span style={{ color: 'var(--iris-ciano)', fontWeight: 600 }}>
                                      Digitando...
                                    </span>
                                  )}
                                  {item.status === 'pendente' && (
                                    <span style={{ color: 'var(--tinta-fraca)' }}>
                                      Na fila
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RODAPÉ DO WIZARD: NAVEGAÇÃO ENTRE PASSOS */}
            <div
              style={{
                padding: '16px 28px',
                borderTop: '1px solid var(--papel-borda)',
                backgroundColor: 'var(--papel-fundo)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {passoWizard > 1 && !campanhaExecutando ? (
                <button
                  onClick={() => setPassoWizard(p => p - 1)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--papel)',
                    color: 'var(--tinta)',
                    border: '1px solid var(--papel-borda)',
                    borderRadius: 'var(--raio-md)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ChevronLeft size={16} />
                  Voltar
                </button>
              ) : (
                <div />
              )}

              {passoWizard < 4 && !campanhaExecutando && (
                <button
                  onClick={() => setPassoWizard(p => p + 1)}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: 'var(--acao-fundo)',
                    color: 'var(--acao-texto)',
                    border: 'none',
                    borderRadius: 'var(--raio-md)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Próximo Passo
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: BIBLIOTECA DE FLUXOS & SCRIPTS IA (n8n-vault 58 fluxos)
         ========================================================================= */}
      {modalVaultAberto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 15, 0.82)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalVaultAberto(false);
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--papel)',
              border: '1px solid var(--papel-borda)',
              borderRadius: 'var(--raio-lg)',
              width: '100%',
              maxWidth: '860px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--papel-borda)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={18} style={{ color: 'var(--iris-violeta)' }} />
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
                    Biblioteca de Scripts & Fluxos IA (n8n-vault)
                  </h2>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--tinta-media)', margin: 0 }}>
                  58 Automações e scripts comerciais validados para prospecção fria, follow-up e fechamento de sites.
                </p>
              </div>

              <button
                onClick={() => setModalVaultAberto(false)}
                style={{ background: 'none', border: 'none', color: 'var(--tinta-fraca)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filtros e Busca */}
            <div
              style={{
                padding: '14px 24px',
                borderBottom: '1px solid var(--papel-borda)',
                backgroundColor: 'var(--papel-fundo)',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  backgroundColor: 'var(--papel)',
                  border: '1px solid var(--papel-borda)',
                  borderRadius: 'var(--raio-sm)'
                }}
              >
                <Search size={15} style={{ color: 'var(--tinta-fraca)' }} />
                <input
                  type="text"
                  value={vaultBusca}
                  onChange={(e) => setVaultBusca(e.target.value)}
                  placeholder="Filtrar por nicho, palavra-chave ou objetivo..."
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    color: 'var(--tinta)',
                    fontSize: '12.5px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Todos', 'Prospecção Sem Site', 'Qualificação IA', 'Follow-up', 'Reengajamento', 'B2B & Parcerias'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setVaultFiltro(cat)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--raio-sm)',
                      border: '1px solid var(--papel-borda)',
                      backgroundColor: vaultFiltro === cat ? 'var(--iris-violeta)' : 'var(--papel)',
                      color: vaultFiltro === cat ? 'var(--acao-texto)' : 'var(--tinta)',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Fluxos */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {scriptsFiltrados.map(script => (
                <div
                  key={script.id}
                  style={{
                    padding: '16px 20px',
                    backgroundColor: 'var(--vidro-fundo)',
                    border: '1px solid var(--vidro-borda)',
                    borderRadius: 'var(--raio-md)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--iris-violeta)',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {script.categoria}
                      </span>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '2px 0 4px 0', color: 'var(--tinta)' }}>
                        {script.titulo}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--tinta-media)', margin: 0 }}>
                        {script.descricao}
                      </p>
                    </div>

                    <button
                      onClick={() => handleUsarScriptDoVault(script)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'var(--acao-fundo)',
                        color: 'var(--acao-texto)',
                        border: 'none',
                        borderRadius: 'var(--raio-sm)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ArrowRight size={14} />
                      Usar no Disparo
                    </button>
                  </div>

                  {/* Mensagem Spintax */}
                  <div
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--papel-fundo)',
                      border: '1px solid var(--papel-borda)',
                      borderRadius: 'var(--raio-sm)',
                      fontSize: '12.5px',
                      color: 'var(--tinta)',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      marginTop: '10px'
                    }}
                  >
                    {script.spintax}
                  </div>

                  {/* Tags e nós n8n */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '11.5px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {script.tags.map(t => (
                        <span
                          key={t}
                          style={{
                            padding: '2px 6px',
                            borderRadius: 'var(--raio-pill)',
                            backgroundColor: 'var(--papel)',
                            color: 'var(--tinta-fraca)',
                            border: '1px solid var(--papel-borda)'
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => setJsonVisualizando(script.n8nJson)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--iris-ciano)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600
                      }}
                    >
                      <FileCode size={13} />
                      Ver Arquitetura n8n
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHE DO ARQUIVO N8N JSON */}
      {jsonVisualizando && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 15, 0.85)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setJsonVisualizando(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--papel)',
              border: '1px solid var(--papel-borda)',
              borderRadius: 'var(--raio-lg)',
              width: '100%',
              maxWidth: '560px',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
                {jsonVisualizando.name}
              </h3>
              <button
                onClick={() => setJsonVisualizando(null)}
                style={{ background: 'none', border: 'none', color: 'var(--tinta-fraca)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <pre
              style={{
                backgroundColor: 'var(--papel-fundo)',
                padding: '14px',
                borderRadius: 'var(--raio-md)',
                color: 'var(--iris-ciano)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: 1.5,
                overflowX: 'auto',
                maxHeight: '300px'
              }}
            >
              {JSON.stringify(jsonVisualizando, null, 2)}
            </pre>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(jsonVisualizando, null, 2));
                  alert('JSON copiado para a área de transferência!');
                }}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'var(--acao-fundo)',
                  color: 'var(--acao-texto)',
                  border: 'none',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Copiar JSON n8n
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
