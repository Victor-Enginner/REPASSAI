import React, { useState, useEffect, useRef } from 'react';
import {
  GitBranch,
  Bot,
  Sparkles,
  Plus,
  Play,
  Pause,
  MessageSquare,
  PhoneCall,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Zap,
  Flame,
  ArrowRight,
  Layers,
  Activity,
  Cpu,
  UserCheck,
  Sliders,
  ChevronRight,
  X,
  FileCode,
  Copy,
  RefreshCw,
  ExternalLink,
  Kanban
} from 'lucide-react';

// Elenco de Especialistas baseado no AGENT_FOUNDRY_GEN01 e Agentes Money
const AGENTES_FOUNDRY = [
  {
    id: 'leo',
    nome: 'Leo',
    sobrenome: 'Operador de Sistemas',
    tagline: 'Sua operação. No controle.',
    descricao: 'Conecta sistemas, automatiza rotinas e mantém sua operação fluindo com precisão 24/7. Especialista em WhatsApp, CRM, reconciliação de tarefas e follow-ups.',
    imagem: '/agents/leo.png',
    corDestaque: 'var(--sucesso)',
    badgeCor: 'var(--sucesso-fundo)',
    cargo: 'Operações & Automações',
    status: 'online',
    statusTexto: 'Respondendo clientes no WhatsApp e atualizando CRM',
    carga: '38%',
    tarefasHoje: 194,
    taxaSucesso: '99.4%',
    tools: ['WhatsApp API', 'CRM Pipelines', 'E-mail Transacional', 'Reconciliador de Pedidos'],
    soul: {
      tom: 'Objetivo, calmo, preciso, sem rodeios ou floreios.',
      regras: [
        'Nunca agir fora das tools registradas;',
        'Nunca prometer resultados financeiros irreais;',
        'Confirmar antes de executar ações de alto impacto;',
        'Registrar logs de cada interação no CRM.'
      ],
      prompt: 'Você é Leo, o operador autônomo do Repass AI. Sua função é garantir que nenhum lead fique sem resposta, reconciliando mensagens entre WhatsApp e o CRM.'
    }
  },
  {
    id: 'atlas',
    nome: 'Atlas',
    sobrenome: 'Analista de Mercado',
    tagline: 'Seu analista. Em tempo real.',
    descricao: 'Pesquisa, cruza sinais e transforma dados brutos do Google Maps e concorrentes em decisões claras para o seu negócio no Brasil e América Latina.',
    imagem: '/agents/atlas.png',
    corDestaque: 'var(--iris-ciano)',
    badgeCor: 'rgba(86, 216, 230, 0.15)',
    cargo: 'Inteligência Estratégica & Dados',
    status: 'online',
    statusTexto: 'Cruzando fontes do Google Maps e avaliações de estabelecimentos',
    carga: '54%',
    tarefasHoje: 86,
    taxaSucesso: '97.8%',
    tools: ['Google Maps Scrapling', 'Cruzamento de Dados', 'Análise de Sentimento', 'Relatórios Executivos'],
    soul: {
      tom: 'Analítico, denso, fundamentado em evidências numéricas.',
      regras: [
        'Apresentar conclusão primeiro, depois justificativa;',
        'Indicar grau de confiança de cada inferência;',
        'Destacar gaps de presença digital de concorrentes.'
      ],
      prompt: 'Você é Atlas, analista de inteligência de mercado do Repass AI. Analise dados de mercado local, identifique padrões de clientes sem site e oportunidades.'
    }
  },
  {
    id: 'alva',
    nome: 'Alva',
    sobrenome: 'Assistente Executiva',
    tagline: 'Sua assistente. Do seu lado.',
    descricao: 'Entende seu contexto, organiza suas prioridades, agenda reuniões e te ajuda a focar no que realmente gera receita e conversão todos os dias.',
    imagem: '/agents/alva.png',
    corDestaque: 'var(--iris-rosa)',
    badgeCor: 'rgba(255, 178, 122, 0.15)',
    cargo: 'Assistente Executiva & Pessoal',
    status: 'online',
    statusTexto: 'Organizando tarefas prioritárias e alinhamento de agenda',
    carga: '22%',
    tarefasHoje: 142,
    taxaSucesso: '99.8%',
    tools: ['Agenda & Calendário', 'Priorização de Tarefas', 'Triagem de Mensagens', 'Memória Contextual'],
    soul: {
      tom: 'Calmo, próximo, brasileiro, acolhedor sem infantilização.',
      regras: [
        'Soar natural brasileiro sem caricaturas;',
        'Usar frases curtas em conversas operacionais;',
        'Assumir postura de colega competente e prestativa.'
      ],
      prompt: 'Você é Alva, assistente executiva do Repass AI. Auxilie na organização diária, prioridades de fechamento de propostas e atendimento.'
    }
  },
  {
    id: 'maia',
    nome: 'Maia',
    sobrenome: 'Criadora de Conteúdo',
    tagline: 'Seu conteúdo. Com propósito.',
    descricao: 'Planeja, cria e adapta conteúdos para cada canal (Instagram, Reels, LinkedIn, WhatsApp), mantendo a identidade e autoridade da sua marca.',
    imagem: '/agents/maia.png',
    corDestaque: 'var(--iris-violeta)',
    badgeCor: 'rgba(124, 92, 255, 0.15)',
    cargo: 'Head de Conteúdo & Copywriting',
    status: 'online',
    statusTexto: 'Gerando roteiros persuasivos e pautas para redes sociais',
    carga: '47%',
    tarefasHoje: 68,
    taxaSucesso: '98.5%',
    tools: ['Roteiros de Reels', 'Spintax Generator', 'Copywriting Comercial', 'Carrosséis Educativos'],
    soul: {
      tom: 'Criativo, envolvente, humano, empático e focado em engajamento.',
      regras: [
        'Evitar clichês genéricos de IA como "no mundo de hoje";',
        'Focar em ganchos fortes nos primeiros 3 segundos;',
        'Adaptar a linguagem ao público-alvo de cada canal.'
      ],
      prompt: 'Você é Maia, especialista em conteúdo e roteiros comerciais do Repass AI. Crie copys magnéticas com spintax e foco em conversão.'
    }
  },
  {
    id: 'nova',
    nome: 'Nova',
    sobrenome: 'Estrategista de Negócios',
    tagline: 'Do problema à solução.',
    descricao: 'Pesquisa, compara caminhos e transforma informação em direção estratégica para decisões mais inteligentes, precificação e fechamento no Brasil.',
    imagem: '/agents/nova.png',
    corDestaque: 'var(--iris-azul)',
    badgeCor: 'rgba(91, 140, 255, 0.15)',
    cargo: 'Estratégia & Resolução de Gargalos',
    status: 'online',
    statusTexto: 'Mapeando gargalos do pipeline comercial de prospecção',
    carga: '31%',
    tarefasHoje: 52,
    taxaSucesso: '99.0%',
    tools: ['Diagnóstico de Funil', 'Benchmark de Preços', 'Modelagem de Solução', 'Plano de Ação'],
    soul: {
      tom: 'Curioso, visionário, estruturado e pragmático.',
      regras: [
        'Decompor problemas complexos em etapas acionáveis;',
        'Comparar pelo menos 2 cenários antes de indicar o melhor caminho;',
        'Preservar foco na geração de margem de lucro.'
      ],
      prompt: 'Você é Nova, estrategista de negócios do Repass AI. Identifique os gargalos de conversão e desenhe soluções práticas de escala.'
    }
  },
  {
    id: 'apolo',
    nome: 'Apolo',
    sobrenome: 'Tel-Agent de Voz',
    tagline: 'Ligações ativas com voz ultrarrealista.',
    descricao: 'Agente telefônico autônomo conectado via SIP Trunking com IA em tempo real (Whisper STT + ElevenLabs TTS) para confirmar interesse e fechar sites.',
    imagem: '/agents/leo.png', // fallback
    corDestaque: 'var(--aviso)',
    badgeCor: 'var(--aviso-fundo)',
    cargo: 'Operador de Telefonia & Voz IA',
    status: 'online',
    statusTexto: 'Linha SIP ativa · 3 chamadas simultâneas disponíveis',
    carga: '18%',
    tarefasHoje: 44,
    taxaSucesso: '96.2%',
    tools: ['SIP Trunking', 'Whisper STT', 'ElevenLabs TTS', 'Detecção de Barge-in'],
    soul: {
      tom: 'Direto, atencioso, seguro, voz pausada e articulada.',
      regras: [
        'Interromper imediatamente quando o interlocutor começar a falar;',
        'Pedir permissão antes de enviar links no WhatsApp;',
        'Transferir para atendente humano se o cliente solicitar.'
      ],
      prompt: 'Você é Apolo, o operador de voz autônomo via Tel-Agent do Repass AI. Realize ligações curtas de apresentação e qualificação.'
    }
  }
];

export default function FluxosView() {
  const [abaAtiva, setAbaAtiva] = useState('escritorio'); // 'escritorio', 'criador', 'elenco', 'fluxos_legado'
  const [agenteSelecionado, setAgenteSelecionado] = useState(null);
  const [chatModalAgente, setChatModalAgente] = useState(null);
  const [mensagensChat, setMensagensChat] = useState([]);
  const [inputChat, setInputChat] = useState('');
  const [agenteDigitando, setAgenteDigitando] = useState(false);

  // Estado do Configurador Conversacional (Elohia Style)
  const [conversaArquiteto, setConversaArquiteto] = useState([
    {
      remetente: 'ia',
      texto: 'Boa, vamos nessa! 👏 Antes de falar de tecnologia, quero entender o seu contexto.\n\nQual é a situação que mais te consome hoje? Aquela tarefa repetitiva que come sua semana, ou a bola que sempre cai no mesmo lugar. Pode falar do seu jeito — me conta o problema, não a solução.'
    }
  ]);
  const [inputArquiteto, setInputArquiteto] = useState('');
  const [arquitetoPensando, setArquitetoPensando] = useState(false);

  // Rascunho ao Vivo do Agente sendo criado
  const [rascunhoAoVivo, setRascunhoAoVivo] = useState({
    nome: 'Agente em criação...',
    cargo: 'Definindo papel estratégico...',
    descricao: 'O arquiteto está analisando suas respostas para compilar a identidade, o tom de voz e as ferramentas ideais.',
    tom: 'Aguardando detalhes da conversa...',
    tools: ['WhatsApp API', 'CRM Pipelines'],
    regras: [],
    prontidao: 20
  });

  const chatFimRef = useRef(null);
  useEffect(() => {
    chatFimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversaArquiteto, mensagensChat]);

  // Enviar mensagem no chat do Arquiteto (Entrevista com IA)
  const handleEnviarArquiteto = (textoCustomizado) => {
    const texto = textoCustomizado || inputArquiteto;
    if (!texto.trim()) return;

    const novasMensagens = [...conversaArquiteto, { remetente: 'usuario', texto }];
    setConversaArquiteto(novasMensagens);
    setInputArquiteto('');
    setArquitetoPensando(true);

    setTimeout(() => {
      let respostaIa = '';
      if (novasMensagens.length === 2) {
        respostaIa = 'Entendi perfeitamente o problema! É a falta de constância e o tempo perdido fazendo manualmente aquilo que a IA pode rodar 24h por dia.\n\nAgora me diz: em quais canais você quer que esse agente atue com prioridade? (Ex: WhatsApp oficial, ligação por voz via Tel-Agent, minerando leads no Google Maps, ou direto no CRM?)';
        setRascunhoAoVivo(prev => ({
          ...prev,
          nome: 'SDR Autônomo de Vendas',
          cargo: 'Especialista em Prospecção & Qualificação',
          descricao: `Agente focado em resolver: "${texto.slice(0, 80)}...". Opera de forma proativa para gerar negócios qualificados.`,
          tom: 'Consultivo, humanizado e focado em fechamento',
          prontidao: 50
        }));
      } else if (novasMensagens.length === 4) {
        respostaIa = 'Excelente escolha de canais. Já configurei o acesso às ferramentas correspondentes!\n\nÚltima pergunta para travar a personalidade: qual o tom de voz ideal e existe alguma regra inegociável? (Ex: "nunca dar desconto sem autorização", "ser super amigável e usar emojis moderados")';
        setRascunhoAoVivo(prev => ({
          ...prev,
          tools: ['WhatsApp API', 'Google Maps Scrapling', 'Tel-Agent Voz', 'CRM Pipelines'],
          regras: [
            'Nunca passar valores sem qualificar o tamanho do negócio;',
            'Simular digitação humanizada;',
            'Atualizar o status no CRM após cada interação.'
          ],
          prontidao: 80
        }));
      } else {
        respostaIa = 'Perfeito! O rascunho do seu Agente foi 100% compilado com Soul, Tools, Persona e Memória. Ele já está pronto para assumir uma mesa no Escritório Virtual e começar a operar!';
        setRascunhoAoVivo(prev => ({
          ...prev,
          nome: 'Orion - SDR Comercial',
          prontidao: 100
        }));
      }

      setConversaArquiteto(prev => [...prev, { remetente: 'ia', texto: respostaIa }]);
      setArquitetoPensando(false);
    }, 1200);
  };

  // Abrir chat direto com qualquer agente
  const handleAbrirChatAgente = (agente) => {
    setChatModalAgente(agente);
    setMensagensChat([
      {
        remetente: 'agente',
        texto: `Olá! Eu sou ${agente.nome} (${agente.cargo}). ${agente.tagline}\n\nComo posso assumir suas tarefas ou te ajudar na operação agora?`
      }
    ]);
  };

  const handleEnviarChatAgente = () => {
    if (!inputChat.trim() || !chatModalAgente) return;
    const msgUser = inputChat;
    setMensagensChat(prev => [...prev, { remetente: 'usuario', texto: msgUser }]);
    setInputChat('');
    setAgenteDigitando(true);

    setTimeout(() => {
      let resposta = '';
      if (chatModalAgente.id === 'leo') {
        resposta = `Entendido. Já verifiquei a fila do WhatsApp e o status dos contatos no CRM. Identifiquei 14 leads aguardando resposta sobre propostas. Quer que eu inicie a abordagem agora?`;
      } else if (chatModalAgente.id === 'atlas') {
        resposta = `Cruzei os dados das últimas buscas no Google Maps. Encontrei 38 estabelecimentos com alta avaliação mas sem site cadastrado na região. As oportunidades estão prontas para disparo.`;
      } else if (chatModalAgente.id === 'maia') {
        resposta = `Criei uma variação com Spintax para sua campanha: "{Olá|Oi} {{primeiro_nome}}, notei que a *{{empresa}}* é referência no bairro, mas não tem site oficial...". Ficou com gancho excelente!`;
      } else {
        resposta = `Com certeza! Já estou processando sua solicitação dentro das minhas diretrizes de ${chatModalAgente.cargo}. Tudo registrado nos logs.`;
      }

      setMensagensChat(prev => [...prev, { remetente: 'agente', texto: resposta }]);
      setAgenteDigitando(false);
    }, 1100);
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto', animation: 'fadeIn 0.25s ease' }}>

      {/* CABEÇALHO DA CENTRAL DE AGENTES */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
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
                backgroundColor: 'rgba(124, 92, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--iris-violeta)'
              }}
            >
              <Bot size={22} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
              Equipe de Agentes & Automações IA
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--raio-pill)',
                backgroundColor: 'var(--sucesso-fundo)',
                color: 'var(--sucesso)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--sucesso)' }} />
              6 AGENTES OPERANDO EM TEMPO REAL
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--tinta-media)', margin: 0 }}>
            Em vez de montar fluxogramas manuais cansativos, comande especialistas autônomos com personalidade, ferramentas e metas de negócio.
          </p>
        </div>

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--papel-fundo)', padding: '4px', borderRadius: 'var(--raio-md)', border: '1px solid var(--papel-borda)' }}>
          <button
            onClick={() => setAbaAtiva('escritorio')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--raio-sm)',
              border: 'none',
              backgroundColor: abaAtiva === 'escritorio' ? 'var(--iris-violeta)' : 'transparent',
              color: abaAtiva === 'escritorio' ? 'var(--acao-texto)' : 'var(--tinta-media)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Activity size={15} />
            Escritório Virtual (Sala 3D)
          </button>

          <button
            onClick={() => setAbaAtiva('criador')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--raio-sm)',
              border: 'none',
              backgroundColor: abaAtiva === 'criador' ? 'var(--iris-violeta)' : 'transparent',
              color: abaAtiva === 'criador' ? 'var(--acao-texto)' : 'var(--tinta-media)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={15} />
            Configurador com IA (Rascunho)
          </button>

          <button
            onClick={() => setAbaAtiva('elenco')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--raio-sm)',
              border: 'none',
              backgroundColor: abaAtiva === 'elenco' ? 'var(--iris-violeta)' : 'transparent',
              color: abaAtiva === 'elenco' ? 'var(--acao-texto)' : 'var(--tinta-media)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <UserCheck size={15} />
            Elenco de Especialistas
          </button>
        </div>
      </div>

      {/* =========================================================================
          ABA 1: ESCRITÓRIO VIRTUAL (SALA DOS AGENTES COM ESTAÇÕES E CARDS)
          Inspirado em Elohia Sala 3D (media_1790660754365.png) + Ever-Gauzy
         ========================================================================= */}
      {abaAtiva === 'escritorio' && (
        <div>
          {/* BANNER DE STATUS OPERACIONAL DO ESCRITÓRIO */}
          <div
            style={{
              padding: '16px 22px',
              backgroundColor: 'var(--vidro-fundo)',
              border: '1px solid var(--vidro-borda)',
              borderRadius: 'var(--raio-lg)',
              backdropFilter: 'blur(16px)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--sucesso)',
                  boxShadow: '0 0 10px var(--sucesso)'
                }}
              />
              <div>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--tinta)' }}>
                  Sala Virtual da Agência Ativa
                </span>
                <div style={{ fontSize: '12px', color: 'var(--tinta-media)' }}>
                  6 mesas operando simultaneamente · 542 tarefas autônomas concluídas hoje · Sem sobrecarga humana
                </div>
              </div>
            </div>

            <button
              onClick={() => setAbaAtiva('criador')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                backgroundColor: 'var(--acao-fundo)',
                color: 'var(--acao-texto)',
                border: 'none',
                borderRadius: 'var(--raio-md)',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Plus size={15} />
              Contratar Novo Agente com IA
            </button>
          </div>

          {/* GRID DE MESAS / ESTAÇÕES DE TRABALHO DOS AGENTES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}
          >
            {AGENTES_FOUNDRY.map(agente => (
              <div
                key={agente.id}
                style={{
                  backgroundColor: 'var(--vidro-fundo)',
                  border: '1px solid var(--vidro-borda)',
                  borderRadius: 'var(--raio-lg)',
                  padding: '20px',
                  backdropFilter: 'blur(16px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Linha decorativa de topo com a cor da persona */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    backgroundColor: agente.corDestaque
                  }}
                />

                {/* Topo do Card do Agente */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                    {/* Retrato / Avatar */}
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: 'var(--raio-md)',
                        overflow: 'hidden',
                        border: '2px solid var(--papel-borda)',
                        flexShrink: 0,
                        backgroundColor: 'var(--papel-fundo)'
                      }}
                    >
                      <img
                        src={agente.imagem}
                        alt={agente.nome}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Identidade */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
                          {agente.nome} <span style={{ fontWeight: 400, color: 'var(--tinta-media)', fontSize: '13px' }}>{agente.sobrenome}</span>
                        </h3>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--raio-pill)',
                            backgroundColor: 'var(--sucesso-fundo)',
                            color: 'var(--sucesso)',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          ONLINE
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', fontWeight: 600, color: agente.corDestaque, marginTop: '2px' }}>
                        {agente.cargo}
                      </div>

                      <p style={{ fontSize: '12px', color: 'var(--tinta-media)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                        "{agente.tagline}"
                      </p>
                    </div>
                  </div>

                  {/* Status atual em tempo real */}
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--papel-fundo)',
                      border: '1px solid var(--papel-borda)',
                      borderRadius: 'var(--raio-sm)',
                      fontSize: '12px',
                      color: 'var(--tinta)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '14px'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: agente.corDestaque,
                        boxShadow: `0 0 6px ${agente.corDestaque}`
                      }}
                    />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {agente.statusTexto}
                    </span>
                  </div>

                  {/* Métricas do Agente (Estilo Ever-Gauzy) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px',
                      padding: '10px 0',
                      borderTop: '1px solid var(--papel-borda)',
                      borderBottom: '1px solid var(--papel-borda)',
                      marginBottom: '14px',
                      textAlign: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--tinta-fraca)', fontWeight: 600 }}>CARGA</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--tinta)' }}>{agente.carga}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--tinta-fraca)', fontWeight: 600 }}>TAREFAS HOJE</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--tinta)' }}>{agente.tarefasHoje}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--tinta-fraca)', fontWeight: 600 }}>PRECISÃO</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--sucesso)' }}>{agente.taxaSucesso}</div>
                    </div>
                  </div>

                  {/* Ferramentas / Capabilities Conectadas */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {agente.tools.map(tool => (
                      <span
                        key={tool}
                        style={{
                          fontSize: '10.5px',
                          padding: '2px 7px',
                          borderRadius: 'var(--raio-pill)',
                          backgroundColor: 'var(--vidro-fundo)',
                          color: 'var(--tinta-media)',
                          border: '1px solid var(--vidro-borda)'
                        }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ações da Mesa */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleAbrirChatAgente(agente)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: 'var(--acao-fundo)',
                      color: 'var(--acao-texto)',
                      border: 'none',
                      borderRadius: 'var(--raio-sm)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <MessageSquare size={13} />
                    Conversar
                  </button>

                  <button
                    onClick={() => setAgenteSelecionado(agente)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--papel-fundo)',
                      color: 'var(--tinta)',
                      border: '1px solid var(--papel-borda)',
                      borderRadius: 'var(--raio-sm)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Ver Soul / Prompt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 2: CONFIGURADOR CONVERSACIONAL DE AGENTES (COM RASCUNHO AO VIVO)
          Exatamente como na Elohia (media_1790660867580.png)
         ========================================================================= */}
      {abaAtiva === 'criador' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>

          {/* COLUNA ESQUERDA: CHAT DE ENTREVISTA COM O ARQUITETO IA */}
          <div
            style={{
              backgroundColor: 'var(--vidro-fundo)',
              border: '1px solid var(--vidro-borda)',
              borderRadius: 'var(--raio-lg)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              height: '650px',
              overflow: 'hidden'
            }}
          >
            {/* Header do Chat Arquiteto */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--papel-borda)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(124, 92, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--iris-violeta)'
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
                  Arquiteto de Agentes IA
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--tinta-media)' }}>
                  Entrevista inteligente para compilar Soul, Persona, Tools e Memória
                </span>
              </div>
            </div>

            {/* Mensagens da Entrevista */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {conversaArquiteto.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: msg.remetente === 'usuario' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '12px 16px',
                      borderRadius: 'var(--raio-md)',
                      backgroundColor: msg.remetente === 'usuario' ? 'var(--iris-violeta)' : 'var(--papel-fundo)',
                      color: msg.remetente === 'usuario' ? 'var(--acao-texto)' : 'var(--tinta)',
                      border: msg.remetente === 'usuario' ? 'none' : '1px solid var(--papel-borda)',
                      fontSize: '13.5px',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {msg.texto}
                  </div>
                </div>
              ))}

              {arquitetoPensando && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--iris-violeta)', fontSize: '12.5px' }}>
                  <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Arquiteto analisando resposta e atualizando rascunho ao vivo...
                </div>
              )}
              <div ref={chatFimRef} />
            </div>

            {/* Pílulas de Sugestão Rápida */}
            <div style={{ padding: '8px 16px', borderTop: '1px solid var(--papel-borda)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {[
                'SDR para prospectar clínicas no Google Maps e vender sites',
                'Atendente WhatsApp 24/7 para responder dúvidas de orçamento',
                'Criador de pautas diárias e roteiros de Reels'
              ].map(sugestao => (
                <button
                  key={sugestao}
                  onClick={() => handleEnviarArquiteto(sugestao)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--raio-pill)',
                    backgroundColor: 'var(--papel-fundo)',
                    border: '1px solid var(--papel-borda)',
                    color: 'var(--tinta-media)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  + {sugestao}
                </button>
              ))}
            </div>

            {/* Input do Chat */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--papel-borda)', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={inputArquiteto}
                onChange={(e) => setInputArquiteto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEnviarArquiteto()}
                placeholder="Descreva o que você precisa ou responda à pergunta acima..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  backgroundColor: 'var(--papel-fundo)',
                  border: '1px solid var(--papel-borda)',
                  borderRadius: 'var(--raio-md)',
                  color: 'var(--tinta)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleEnviarArquiteto()}
                style={{
                  padding: '10px 18px',
                  backgroundColor: 'var(--acao-fundo)',
                  color: 'var(--acao-texto)',
                  border: 'none',
                  borderRadius: 'var(--raio-md)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Enviar
              </button>
            </div>
          </div>

          {/* COLUNA DIREITA: RASCUNHO AO VIVO (LIVE AGENT SPEC COMPILER) */}
          <div
            style={{
              backgroundColor: 'var(--papel)',
              border: '1px solid var(--papel-borda)',
              borderRadius: 'var(--raio-lg)',
              padding: '24px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--papel-borda)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--iris-violeta)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                RASCUNHO AO VIVO · COMPILADOR DO AGENTE
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--sucesso)', fontFamily: 'var(--font-mono)' }}>
                {rascunhoAoVivo.prontidao}%
              </span>
            </div>

            {/* Barra de Prontidão */}
            <div style={{ height: '5px', backgroundColor: 'var(--papel-borda)', borderRadius: 'var(--raio-pill)', overflow: 'hidden' }}>
              <div style={{ width: `${rascunhoAoVivo.prontidao}%`, height: '100%', backgroundColor: 'var(--sucesso)', transition: 'width 0.3s ease' }} />
            </div>

            {/* Identidade */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Identidade do Agente
              </label>
              <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--tinta)' }}>
                {rascunhoAoVivo.nome}
              </h4>
              <div style={{ fontSize: '12.5px', color: 'var(--iris-violeta)', fontWeight: 600 }}>
                {rascunhoAoVivo.cargo}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--tinta-media)', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                {rascunhoAoVivo.descricao}
              </p>
            </div>

            {/* Tom de Voz (Soul) */}
            <div style={{ borderTop: '1px solid var(--papel-borda)', paddingTop: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Soul & Tom de Voz
              </label>
              <div style={{ fontSize: '12.5px', color: 'var(--tinta)' }}>
                {rascunhoAoVivo.tom}
              </div>
            </div>

            {/* Tools Atribuídas */}
            <div style={{ borderTop: '1px solid var(--papel-borda)', paddingTop: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Ferramentas Conectadas (Capabilities)
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {rascunhoAoVivo.tools.map(tool => (
                  <span
                    key={tool}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: 'var(--raio-pill)',
                      backgroundColor: 'var(--papel-fundo)',
                      color: 'var(--tinta)',
                      border: '1px solid var(--papel-borda)',
                      fontWeight: 600
                    }}
                  >
                    ✓ {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Regras Invioláveis */}
            {rascunhoAoVivo.regras.length > 0 && (
              <div style={{ borderTop: '1px solid var(--papel-borda)', paddingTop: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Regras Invioláveis
                </label>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--tinta-media)', lineHeight: 1.5 }}>
                  {rascunhoAoVivo.regras.map((regra, i) => (
                    <li key={i}>{regra}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botão de Contratação */}
            <button
              disabled={rascunhoAoVivo.prontidao < 80}
              onClick={() => {
                alert(`Agente ${rascunhoAoVivo.nome} criado com sucesso e posicionado na mesa da Sala Virtual!`);
                setAbaAtiva('escritorio');
              }}
              style={{
                marginTop: '10px',
                padding: '12px',
                backgroundColor: rascunhoAoVivo.prontidao >= 80 ? 'var(--sucesso)' : 'var(--papel-borda)',
                color: 'var(--acao-texto)',
                border: 'none',
                borderRadius: 'var(--raio-md)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: rascunhoAoVivo.prontidao >= 80 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} />
              Contratar e Ativar no Escritório
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 3: ELENCO DE ESPECIALISTAS (AGENT_FOUNDRY_GEN01)
         ========================================================================= */}
      {abaAtiva === 'elenco' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {AGENTES_FOUNDRY.map(agente => (
            <div
              key={agente.id}
              style={{
                backgroundColor: 'var(--vidro-fundo)',
                border: '1px solid var(--vidro-borda)',
                borderRadius: 'var(--raio-lg)',
                padding: '24px',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ width: '100%', height: '180px', borderRadius: 'var(--raio-md)', overflow: 'hidden', marginBottom: '16px' }}>
                  <img src={agente.imagem} alt={agente.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--tinta)' }}>
                  {agente.nome} · {agente.sobrenome}
                </h3>
                <div style={{ fontSize: '13px', fontWeight: 600, color: agente.corDestaque, marginBottom: '8px' }}>
                  {agente.cargo}
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--tinta-media)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  {agente.descricao}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleAbrirChatAgente(agente)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: 'var(--acao-fundo)',
                    color: 'var(--acao-texto)',
                    border: 'none',
                    borderRadius: 'var(--raio-sm)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Conversar
                </button>
                <button
                  onClick={() => setAgenteSelecionado(agente)}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--papel-fundo)',
                    color: 'var(--tinta)',
                    border: '1px solid var(--papel-borda)',
                    borderRadius: 'var(--raio-sm)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Ficha Soul
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          MODAL: FICHA DE PERSONA / SOUL DO AGENTE
         ========================================================================= */}
      {agenteSelecionado && (
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
          onClick={() => setAgenteSelecionado(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--papel)',
              border: '1px solid var(--papel-borda)',
              borderRadius: 'var(--raio-lg)',
              width: '100%',
              maxWidth: '640px',
              padding: '28px',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={agenteSelecionado.imagem} alt={agenteSelecionado.nome} style={{ width: '44px', height: '44px', borderRadius: 'var(--raio-md)', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
                    {agenteSelecionado.nome} · {agenteSelecionado.sobrenome}
                  </h3>
                  <span style={{ fontSize: '12px', color: agenteSelecionado.corDestaque, fontWeight: 600 }}>
                    {agenteSelecionado.cargo}
                  </span>
                </div>
              </div>
              <button onClick={() => setAgenteSelecionado(null)} style={{ background: 'none', border: 'none', color: 'var(--tinta-fraca)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Tom de Voz & Postura (Soul)
              </label>
              <div style={{ fontSize: '13px', color: 'var(--tinta)' }}>
                {agenteSelecionado.soul.tom}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Regras Inegociáveis
              </label>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: 'var(--tinta-media)', lineHeight: 1.5 }}>
                {agenteSelecionado.soul.regras.map((regra, i) => (
                  <li key={i}>{regra}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                System Prompt Compilado (AGENT_FOUNDRY_GEN01)
              </label>
              <pre
                style={{
                  backgroundColor: 'var(--papel-fundo)',
                  padding: '12px',
                  borderRadius: 'var(--raio-md)',
                  color: 'var(--iris-ciano)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {agenteSelecionado.soul.prompt}
              </pre>
            </div>

            <button
              onClick={() => {
                setAgenteSelecionado(null);
                handleAbrirChatAgente(agenteSelecionado);
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--acao-fundo)',
                color: 'var(--acao-texto)',
                border: 'none',
                borderRadius: 'var(--raio-md)',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Testar Agente em Conversa Direta
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHAT INTERATIVO DIRETO COM O AGENTE
         ========================================================================= */}
      {chatModalAgente && (
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
          onClick={() => setChatModalAgente(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--papel)',
              border: '1px solid var(--papel-borda)',
              borderRadius: 'var(--raio-lg)',
              width: '100%',
              maxWidth: '680px',
              height: '620px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--papel-borda)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={chatModalAgente.imagem} alt={chatModalAgente.nome} style={{ width: '36px', height: '36px', borderRadius: 'var(--raio-sm)', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
                    Conversa com {chatModalAgente.nome}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--sucesso)', fontWeight: 600 }}>
                    ● Online · {chatModalAgente.cargo}
                  </span>
                </div>
              </div>
              <button onClick={() => setChatModalAgente(null)} style={{ background: 'none', border: 'none', color: 'var(--tinta-fraca)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Mensagens */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mensagensChat.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.remetente === 'usuario' ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: 'var(--raio-md)',
                      backgroundColor: m.remetente === 'usuario' ? 'var(--iris-violeta)' : 'var(--papel-fundo)',
                      color: m.remetente === 'usuario' ? 'var(--acao-texto)' : 'var(--tinta)',
                      border: m.remetente === 'usuario' ? 'none' : '1px solid var(--papel-borda)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {m.texto}
                  </div>
                </div>
              ))}
              {agenteDigitando && (
                <div style={{ fontSize: '12px', color: 'var(--iris-ciano)' }}>
                  {chatModalAgente.nome} está processando...
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--papel-borda)', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEnviarChatAgente()}
                placeholder={`Envie uma instrução ou mensagem para ${chatModalAgente.nome}...`}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  backgroundColor: 'var(--papel-fundo)',
                  border: '1px solid var(--papel-borda)',
                  borderRadius: 'var(--raio-md)',
                  color: 'var(--tinta)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleEnviarChatAgente}
                style={{
                  padding: '10px 18px',
                  backgroundColor: 'var(--acao-fundo)',
                  color: 'var(--acao-texto)',
                  border: 'none',
                  borderRadius: 'var(--raio-md)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
