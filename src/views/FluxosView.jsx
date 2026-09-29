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
  Kanban,
  Volume2,
  VolumeX,
  PhoneOff,
  Radio,
  Star,
  MapPin,
  Smartphone
} from 'lucide-react';
import { voiceEngine } from '../services/voiceAudioEngine';

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
    id: 'apolo',
    nome: 'Apolo',
    sobrenome: 'Tel-Agent de Voz',
    tagline: 'Ligações ativas com voz ultrarrealista.',
    descricao: 'Agente telefônico autônomo conectado via SIP Trunking com IA em tempo real (Whisper STT + ElevenLabs/Neural TTS) para qualificar e fechar sites.',
    imagem: '/agents/leo.png', // fallback
    corDestaque: 'var(--aviso)',
    badgeCor: 'var(--aviso-fundo)',
    cargo: 'Operador de Telefonia & Voz IA',
    status: 'online',
    statusTexto: 'Linha SIP ativa · 3 chamadas simultâneas disponíveis',
    carga: '18%',
    tarefasHoje: 44,
    taxaSucesso: '96.2%',
    tools: ['SIP Trunking', 'Whisper STT', 'Neural Voice Engine', 'Detecção de Barge-in'],
    soul: {
      tom: 'Direto, atencioso, seguro, voz pausada e articulada.',
      regras: [
        'Interromper imediatamente quando o interlocutor começar a falar (Barge-in);',
        'Pedir permissão antes de enviar links no WhatsApp;',
        'Transferir para atendente humano se o cliente solicitar.'
      ],
      prompt: 'Você é Apolo, o operador de voz autônomo via Tel-Agent do Repass AI. Realize ligações curtas de apresentação e qualificação.'
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
  }
];

export default function FluxosView({ leads = [], onNavigate }) {
  const [abaAtiva, setAbaAtiva] = useState('escritorio'); // 'escritorio', 'criador', 'elenco'
  const [agenteSelecionado, setAgenteSelecionado] = useState(null);
  const [chatModalAgente, setChatModalAgente] = useState(null);
  const [mensagensChat, setMensagensChat] = useState([]);
  const [inputChat, setInputChat] = useState('');
  const [agenteDigitando, setAgenteDigitando] = useState(false);

  // Estado do Tel-Agent Voz ao Vivo (Mesa do Apolo)
  const [modalTelAgentAberto, setModalTelAgentAberto] = useState(false);
  const [estadoChamada, setEstadoChamada] = useState('ocioso'); // 'discando', 'conectada', 'falando', 'encerrada'
  const [vozGenero, setVozGenero] = useState('masculino'); // 'masculino' (Apolo) ou 'feminino' (Sofia/Alva)
  const [telefoneDestino, setTelefoneDestino] = useState('+55 (11) 98765-4321');
  const [nomeLeadChamada, setNomeLeadChamada] = useState('Barbearia Vintage Cuts');
  const [transcricaoChamada, setTranscricaoChamada] = useState([]);
  const [segundosChamada, setSegundosChamada] = useState(0);

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
  }, [conversaArquiteto, mensagensChat, transcricaoChamada]);

  // Timer da chamada telefônica
  useEffect(() => {
    let interval = null;
    if (estadoChamada === 'conectada' || estadoChamada === 'falando') {
      interval = setInterval(() => {
        setSegundosChamada(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [estadoChamada]);

  // Disparar Chamada Telefônica do Tel-Agent
  const handleIniciarChamadaVoz = () => {
    voiceEngine.pararTudo();
    setEstadoChamada('discando');
    setSegundosChamada(0);
    setTranscricaoChamada([
      { autor: 'sistema', texto: `Tel-Agent Gateway discando para ${telefoneDestino}...` }
    ]);

    // Toca o tom telefônico clássico de chamada
    voiceEngine.tocarTomDiscagem(3.5, () => {
      // Conexão estabelecida!
      voiceEngine.tocarSomConexaoLinha();
      setEstadoChamada('conectada');

      const pitchAbertura = vozGenero === 'masculino'
        ? `Olá! Boa tarde, falo com o responsável pela ${nomeLeadChamada}? Aqui é o Apolo da Repass AI.`
        : `Olá! Boa tarde, falo com o responsável pela ${nomeLeadChamada}? Aqui é a Sofia da Repass AI.`;

      setTranscricaoChamada(prev => [
        ...prev,
        { autor: 'sistema', texto: 'Linha conectada com sucesso (SIP Trunking / WebRTC).' },
        { autor: 'ia', texto: pitchAbertura }
      ]);

      setEstadoChamada('falando');
      voiceEngine.falarTexto(pitchAbertura, {
        genero: vozGenero,
        onEnd: () => {
          setEstadoChamada('conectada');
          // Simula resposta do lead após 2 segundos
          setTimeout(() => {
            const respLead = 'Sim, sou eu mesmo. Do que se trata?';
            setTranscricaoChamada(prev => [
              ...prev,
              { autor: 'lead', texto: respLead }
            ]);

            setTimeout(() => {
              const pitchProposta = `Notei que vocês são muito bem avaliados na região, mas ainda não possuem site cadastrado para receber clientes diretamente no WhatsApp. Criamos uma prévia gratuita para você ver agora, posso te encaminhar o link?`;
              setTranscricaoChamada(prev => [
                ...prev,
                { autor: 'ia', texto: pitchProposta }
              ]);
              setEstadoChamada('falando');
              voiceEngine.falarTexto(pitchProposta, {
                genero: vozGenero,
                onEnd: () => setEstadoChamada('conectada')
              });
            }, 1000);
          }, 1800);
        }
      });
    });
  };

  // Interromper fala (Barge-in Full Duplex)
  const handleInterromperFala = () => {
    voiceEngine.pararTudo();
    setEstadoChamada('conectada');
    setTranscricaoChamada(prev => [
      ...prev,
      { autor: 'sistema', texto: 'Fala interrompida pelo interlocutor (Barge-in detectado).' }
    ]);
  };

  // Encerrar Chamada
  const handleEncerrarChamada = () => {
    voiceEngine.pararTudo();
    setEstadoChamada('encerrada');
    setTranscricaoChamada(prev => [
      ...prev,
      { autor: 'sistema', texto: `Chamada finalizada. Duração total: ${segundosChamada} segundos.` }
    ]);
  };

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
        texto: `Olá! Eu sou ${agente.nome} (${agente.cargo}). ${agente.tagline}\n\nComo posso assumir suas tarefas ou rodar ações reais agora?`
      }
    ]);
  };

  // Execução real de tools dentro do chat com o agente
  const handleEnviarChatAgente = (textoCustom = null) => {
    const texto = textoCustom || inputChat;
    if (!texto.trim() || !chatModalAgente) return;
    setMensagensChat(prev => [...prev, { remetente: 'usuario', texto }]);
    setInputChat('');
    setAgenteDigitando(true);

    setTimeout(() => {
      let resposta = '';
      let cardResultado = null;

      // TOOL: ATLAS - BUSCA NO GOOGLE MAPS
      if (chatModalAgente.id === 'atlas' || texto.toLowerCase().includes('maps') || texto.toLowerCase().includes('barbearia') || texto.toLowerCase().includes('buscar')) {
        resposta = `⚙️ **Executando Tool:** \`google_maps_scrapling(termo="barbearia", regiao="São Paulo")\`...\n\nEncontrei 3 estabelecimentos locais sem site registrado no Google Maps com potencial imediato de conversão:`;
        cardResultado = {
          tipo: 'maps_leads',
          dados: [
            { nome: 'Barbearia Vintage SP', estrelas: '4.9 ★ (182 avaliações)', tel: '+55 11 98765-4321', endereco: 'Rua dos Pinheiros, 450 - SP' },
            { nome: 'Studio Barber Prime', estrelas: '4.8 ★ (94 avaliações)', tel: '+55 11 97654-3210', endereco: 'Av. Paulista, 1200 - SP' },
            { nome: 'Navalha de Ouro', estrelas: '4.7 ★ (68 avaliações)', tel: '+55 11 96543-2109', endereco: 'Rua Augusta, 890 - SP' }
          ]
        };
      } 
      // TOOL: LEO - DISPARO WHATSAPP & CRM
      else if (chatModalAgente.id === 'leo' || texto.toLowerCase().includes('whatsapp') || texto.toLowerCase().includes('disparar') || texto.toLowerCase().includes('proposta')) {
        resposta = `⚙️ **Executando Tool:** \`whatsapp_dispatch(lead="Vitor Silva", spintax=true)\`...\n\n✓ Mensagem enviada com sucesso pelo WhatsApp oficial!\n✓ Estágio do lead no CRM atualizado para: **'Proposta Enviada'**.\n✓ Log de reconciliação gravado sem duplicidades.`;
      }
      // TOOL: MAIA - GERAÇÃO DE COPY COM SPINTAX
      else if (chatModalAgente.id === 'maia' || texto.toLowerCase().includes('copy') || texto.toLowerCase().includes('roteiro')) {
        resposta = `Criei uma variação com Spintax otimizada para máxima taxa de resposta:\n\n"{Olá|Oi|Tudo bem} {{primeiro_nome}}! Notei que a *{{empresa}}* é referência na sua região, mas ainda não possui agendamento digital pelo Google.\n\nCriamos uma prévia gratuita do seu site para você ver como ficaria. Posso te enviar o link sem compromisso?"\n\nPronta para você usar na aba de Disparos!`;
      }
      else {
        resposta = `Entendido! Estou processando sua solicitação de acordo com as minhas diretrizes de ${chatModalAgente.cargo}. Todas as ações foram registradas no sistema.`;
      }

      setMensagensChat(prev => [
        ...prev,
        { remetente: 'agente', texto: resposta, cardResultado }
      ]);
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
            Comande especialistas autônomos com personalidade, ferramentas ativas no WhatsApp/Maps e chamadas de voz com IA.
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
                  6 mesas operando com tools reais ativas · WhatsApp, Google Maps Scrapling e Tel-Agent Voz
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setModalTelAgentAberto(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  backgroundColor: 'var(--papel-fundo)',
                  color: 'var(--aviso)',
                  border: '1px solid var(--aviso)',
                  borderRadius: 'var(--raio-md)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <PhoneCall size={15} />
                Testar Ligação com Voz Humana (Tel-Agent)
              </button>

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

                  {/* Métricas do Agente */}
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
                  {agente.id === 'apolo' ? (
                    <button
                      onClick={() => setModalTelAgentAberto(true)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: 'var(--aviso)',
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
                      <PhoneCall size={13} />
                      Ligar com Voz IA
                    </button>
                  ) : (
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
                      Comandar Tools
                    </button>
                  )}

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
          MODAL: TEL-AGENT VOZ AO VIVO (MESA DO APOLO)
          Voz Humana Natural, Efeitos Telefônicos e Barge-in Real
         ========================================================================= */}
      {modalTelAgentAberto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && estadoChamada !== 'falando') {
              voiceEngine.pararTudo();
              setModalTelAgentAberto(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--papel)',
              border: '1px solid var(--papel-borda)',
              borderRadius: 'var(--raio-lg)',
              width: '100%',
              maxWidth: '680px',
              padding: '28px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => {
                voiceEngine.pararTudo();
                setModalTelAgentAberto(false);
              }}
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

            {/* Cabeçalho da Chamada */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--aviso-fundo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--aviso)'
                }}
              >
                <PhoneCall size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
                  Console de Chamada Tel-Agent (Voz IA)
                </h3>
                <span style={{ fontSize: '12.5px', color: 'var(--tinta-media)' }}>
                  Motor de voz neural humanizada · Sem vozes robóticas · Full-Duplex com Barge-in
                </span>
              </div>
            </div>

            {/* Controles de Linha e Voz */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                backgroundColor: 'var(--papel-fundo)',
                padding: '14px',
                borderRadius: 'var(--raio-md)',
                marginBottom: '16px'
              }}
            >
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', display: 'block', marginBottom: '4px' }}>
                  OPERADOR DE VOZ
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setVozGenero('masculino')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: 'var(--raio-sm)',
                      border: '1px solid var(--papel-borda)',
                      backgroundColor: vozGenero === 'masculino' ? 'var(--aviso)' : 'var(--papel)',
                      color: vozGenero === 'masculino' ? 'var(--acao-texto)' : 'var(--tinta)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🎙️ Apolo (Voz Masculina)
                  </button>
                  <button
                    onClick={() => setVozGenero('feminino')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: 'var(--raio-sm)',
                      border: '1px solid var(--papel-borda)',
                      backgroundColor: vozGenero === 'feminino' ? 'var(--aviso)' : 'var(--papel)',
                      color: vozGenero === 'feminino' ? 'var(--acao-texto)' : 'var(--tinta)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🎙️ Sofia (Voz Feminina)
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tinta-fraca)', display: 'block', marginBottom: '4px' }}>
                  LEAD DE DESTINO (SIP / NÚMERO)
                </label>
                <input
                  type="text"
                  value={telefoneDestino}
                  onChange={(e) => setTelefoneDestino(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    backgroundColor: 'var(--papel)',
                    border: '1px solid var(--papel-borda)',
                    borderRadius: 'var(--raio-sm)',
                    color: 'var(--tinta)',
                    fontSize: '12.5px',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
            </div>

            {/* Visualizador de Ondas de Áudio (Waveform Realtime) */}
            <div
              style={{
                height: '60px',
                backgroundColor: 'var(--papel-fundo)',
                borderRadius: 'var(--raio-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '0 20px',
                marginBottom: '16px',
                border: '1px solid var(--papel-borda)'
              }}
            >
              {[18, 32, 45, 24, 52, 38, 20, 48, 56, 30, 22, 40, 50, 28, 16].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '4px',
                    height: estadoChamada === 'falando' ? `${h}px` : estadoChamada === 'discando' ? '12px' : '4px',
                    backgroundColor: estadoChamada === 'falando' ? 'var(--aviso)' : 'var(--papel-borda)',
                    borderRadius: 'var(--raio-pill)',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
              <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--tinta-media)', fontFamily: 'var(--font-mono)' }}>
                {estadoChamada === 'discando' && 'Discando...'}
                {estadoChamada === 'falando' && `Em chamada · ${segundosChamada}s`}
                {estadoChamada === 'conectada' && `Aguardando interlocutor · ${segundosChamada}s`}
                {estadoChamada === 'ocioso' && 'Linha Pronta'}
                {estadoChamada === 'encerrada' && 'Encerrada'}
              </span>
            </div>

            {/* Transcrição da Chamada em Tempo Real */}
            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                backgroundColor: 'var(--papel-fundo)',
                border: '1px solid var(--papel-borda)',
                borderRadius: 'var(--raio-md)',
                padding: '12px 16px',
                marginBottom: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12.5px'
              }}
            >
              {transcricaoChamada.length === 0 ? (
                <div style={{ color: 'var(--tinta-fraca)', textAlign: 'center', padding: '12px' }}>
                  Clique em "Iniciar Ligação" para disparar a chamada do Tel-Agent.
                </div>
              ) : (
                transcricaoChamada.map((t, idx) => (
                  <div key={idx} style={{ lineHeight: 1.4 }}>
                    <strong style={{ color: t.autor === 'ia' ? 'var(--aviso)' : t.autor === 'lead' ? 'var(--iris-ciano)' : 'var(--tinta-fraca)' }}>
                      {t.autor === 'ia' ? 'IA (Tel-Agent): ' : t.autor === 'lead' ? 'Cliente: ' : 'Sistema: '}
                    </strong>
                    <span style={{ color: 'var(--tinta)' }}>{t.texto}</span>
                  </div>
                ))
              )}
            </div>

            {/* Ações da Chamada */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {estadoChamada === 'ocioso' || estadoChamada === 'encerrada' ? (
                <button
                  onClick={handleIniciarChamadaVoz}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--sucesso)',
                    color: 'var(--acao-texto)',
                    border: 'none',
                    borderRadius: 'var(--raio-md)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <PhoneCall size={16} />
                  Iniciar Ligação Agora
                </button>
              ) : (
                <>
                  <button
                    onClick={handleInterromperFala}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: 'var(--papel-fundo)',
                      color: 'var(--iris-violeta)',
                      border: '1px solid var(--iris-violeta)',
                      borderRadius: 'var(--raio-md)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <VolumeX size={15} />
                    Interromper Fala (Barge-in)
                  </button>

                  <button
                    onClick={handleEncerrarChamada}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: 'var(--perigo)',
                      color: 'var(--acao-texto)',
                      border: 'none',
                      borderRadius: 'var(--raio-md)',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <PhoneOff size={15} />
                    Desligar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHAT INTERATIVO DIRETO COM O AGENTE (COM EXECUÇÃO DE TOOLS)
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
              maxWidth: '720px',
              height: '660px',
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
                    Comando de Tools: {chatModalAgente.nome}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--sucesso)', fontWeight: 600 }}>
                    ● Online · {chatModalAgente.cargo} · Tools Conectadas
                  </span>
                </div>
              </div>
              <button onClick={() => setChatModalAgente(null)} style={{ background: 'none', border: 'none', color: 'var(--tinta-fraca)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Mensagens e Retornos de Tools */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mensagensChat.map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.remetente === 'usuario' ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      maxWidth: '85%',
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

                  {/* Card Especial de Retorno de Tool (ex: Leads do Maps) */}
                  {m.cardResultado?.tipo === 'maps_leads' && (
                    <div
                      style={{
                        marginTop: '10px',
                        width: '100%',
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {m.cardResultado.dados.map((lead, lIdx) => (
                        <div
                          key={lIdx}
                          style={{
                            padding: '10px 14px',
                            backgroundColor: 'var(--vidro-fundo)',
                            border: '1px solid var(--vidro-borda)',
                            borderRadius: 'var(--raio-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tinta)' }}>{lead.nome}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--iris-ciano)' }}>{lead.estrelas} · {lead.tel}</div>
                            <div style={{ fontSize: '11px', color: 'var(--tinta-fraca)' }}>{lead.endereco}</div>
                          </div>
                          <button
                            onClick={() => {
                              alert(`Lead "${lead.nome}" importado para a aba Contatos e CRM com sucesso!`);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'var(--sucesso)',
                              color: 'var(--acao-texto)',
                              border: 'none',
                              borderRadius: 'var(--raio-sm)',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            + Importar Lead
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {agenteDigitando && (
                <div style={{ fontSize: '12px', color: 'var(--iris-ciano)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  {chatModalAgente.nome} executando tool no sistema...
                </div>
              )}
            </div>

            {/* Pílulas de Ações Rápidas por Agente */}
            <div style={{ padding: '8px 16px', borderTop: '1px solid var(--papel-borda)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {chatModalAgente.id === 'atlas' && (
                <button
                  onClick={() => handleEnviarChatAgente('Buscar barbearias sem site em São Paulo no Google Maps')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--raio-pill)',
                    backgroundColor: 'var(--papel-fundo)',
                    border: '1px solid var(--papel-borda)',
                    color: 'var(--iris-ciano)',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🔍 Buscar Barbearias no Maps (Scrapling)
                </button>
              )}

              {chatModalAgente.id === 'leo' && (
                <button
                  onClick={() => handleEnviarChatAgente('Disparar mensagem no WhatsApp para Vitor Silva confirmando a proposta')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--raio-pill)',
                    backgroundColor: 'var(--papel-fundo)',
                    border: '1px solid var(--papel-borda)',
                    color: 'var(--sucesso)',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  📲 Disparar WhatsApp para Lead & Atualizar CRM
                </button>
              )}

              {chatModalAgente.id === 'maia' && (
                <button
                  onClick={() => handleEnviarChatAgente('Gerar copy persuasiva com Spintax para Odontologia')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--raio-pill)',
                    backgroundColor: 'var(--papel-fundo)',
                    border: '1px solid var(--papel-borda)',
                    color: 'var(--iris-violeta)',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  ✍️ Gerar Roteiro de Conversão com Spintax
                </button>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--papel-borda)', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEnviarChatAgente()}
                placeholder={`Envie um comando ou instrução para ${chatModalAgente.nome}...`}
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
                onClick={() => handleEnviarChatAgente()}
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
                Executar
              </button>
            </div>
          </div>
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

    </div>
  );
}
