import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  Workflow,
  Plus,
  Search,
  FileText,
  Globe,
  HelpCircle,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  X,
  Check,
  Send,
  ArrowRight,
  Database,
  Layers,
  Activity,
  Copy
} from 'lucide-react';

const TIPOS_FONTE = [
  { id: 'texto', label: 'Texto' },
  { id: 'pdf', label: 'Documento (PDF / TXT)' },
  { id: 'url', label: 'Website / URL Scraping' },
  { id: 'faq', label: 'Perguntas & Respostas (FAQ)' }
];

const FONTES_INICIAIS = [
  {
    id: 'f-1',
    nome: 'Scripts de Contorno de Objeções (Voz & WhatsApp)',
    tipo: 'texto',
    status: 'indexado',
    criadaEm: 'Hoje às 02:40',
    conteudo: `Objeção 1: "Já tenho Instagram, não preciso de site."
Resposta do Agente: Perfeito! O Instagram é excelente para engajamento, mas mais de 70% das pessoas que pesquisam seu serviço no Google Maps clicam direto no botão "Site" para ver cardápio, tabela de preços e endereço. Sem site próprio, você perde esses clientes diretamente para seus concorrentes que aparecem melhor posicionados.

Objeção 2: "Quanto custa?"
Resposta do Agente: Temos planos a partir de R$ 497 de setup único com site pronto em 14 milissegundos, com agendamento online e botão oficial do WhatsApp integrado. Sem fidelidade abusiva.

Objeção 3: "Preciso falar com meu sócio."
Resposta do Agente: Com certeza! Posso te enviar agora no WhatsApp uma prévia do site que geramos para sua empresa, assim você mostra para o seu sócio e vocês avaliam juntos em 2 minutos.`
  },
  {
    id: 'f-2',
    nome: 'Tabela de Preços, Planos & Condições Comerciais',
    tipo: 'texto',
    status: 'indexado',
    criadaEm: 'Ontem às 18:15',
    conteudo: `Plano Prospecção Express: R$ 497 setup único. Inclui landing page de alta conversão, hospedagem ultrarrápida, SSL incluso, formulário de captura e botão do WhatsApp.
Plano Automação Completa: R$ 890 setup + R$ 89/mês. Inclui robô de WhatsApp integrado via Leo, Tel-Agent com Apolo discando para leads do Google Maps e CRM de fechamento.
Formas de Pagamento: Pix com 5% de desconto ou cartão de crédito em até 12x.`
  },
  {
    id: 'f-3',
    nome: 'Política de Atendimento & Garantia de Conversão',
    tipo: 'texto',
    status: 'indexado',
    criadaEm: '27/09/2026',
    conteudo: `Horário de funcionamento comercial da equipe: Segunda a Sexta, das 09h às 19h.
Garantia de 7 dias: Caso o cliente não aprove o layout do site ou o fluxo de automação, ajustamos em até 24 horas sem custos extras ou devolvemos o valor integral.`
  }
];

export default function BaseConhecimentoView({ onNavigate }) {
  // Fontes de conhecimento persistidas
  const [fontes, setFontes] = useState(() => {
    try {
      const salvo = localStorage.getItem('repass_knowledge_db');
      if (salvo) return JSON.parse(salvo);
    } catch {}
    return FONTES_INICIAIS;
  });

  // Formulário de Adicionar Nova Fonte
  const [nomeFonte, setNomeFonte] = useState('');
  const [tipoFonte, setTipoFonte] = useState('texto');
  const [conteudoFonte, setConteudoFonte] = useState('');

  // Busca Semântica RAG (Testar Busca)
  const [perguntaBusca, setPerguntaBusca] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultadoBusca, setResultadoBusca] = useState(null);

  // Modal de Visualização/Edição de Conteúdo
  const [fonteSelecionada, setFonteSelecionada] = useState(null);
  const [toastSucesso, setToastSucesso] = useState(false);
  const [mensagemToast, setMensagemToast] = useState('');

  // Persistência
  useEffect(() => {
    try {
      localStorage.setItem('repass_knowledge_db', JSON.stringify(fontes));
    } catch {}
  }, [fontes]);

  const dispararToast = (msg) => {
    setMensagemToast(msg);
    setToastSucesso(true);
    setTimeout(() => setToastSucesso(false), 2500);
  };

  // Adicionar Fonte
  const handleAdicionarFonte = (e) => {
    e?.preventDefault();
    if (!nomeFonte.trim() || !conteudoFonte.trim()) return;

    const nova = {
      id: `f-${Date.now()}`,
      nome: nomeFonte.trim(),
      tipo: tipoFonte,
      status: 'indexado',
      criadaEm: 'Agora mesmo',
      conteudo: conteudoFonte.trim()
    };

    setFontes(prev => [nova, ...prev]);
    setNomeFonte('');
    setConteudoFonte('');
    dispararToast('Fonte adicionada e indexada no RAG com sucesso!');
  };

  // Excluir Fonte
  const handleExcluirFonte = (id, e) => {
    e?.stopPropagation();
    if (window.confirm('Tem certeza que deseja remover esta fonte da base de conhecimento?')) {
      setFontes(prev => prev.filter(f => f.id !== id));
      if (fonteSelecionada?.id === id) setFonteSelecionada(null);
      dispararToast('Fonte removida.');
    }
  };

  // Simulação de Busca Semântica RAG Real
  const handleTestarRAG = (e) => {
    e?.preventDefault();
    if (!perguntaBusca.trim() || fontes.length === 0) return;

    setBuscando(true);
    setResultadoBusca(null);

    setTimeout(() => {
      const termos = perguntaBusca.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      
      // Busca nas fontes por palavras-chave com pontuação
      let melhorFonte = null;
      let maiorScore = 0;
      let trechoEncontrado = '';

      fontes.forEach(f => {
        const texto = (f.nome + ' ' + f.conteudo).toLowerCase();
        let matches = 0;
        termos.forEach(termo => {
          if (texto.includes(termo)) matches++;
        });

        const score = termos.length > 0 ? (matches / termos.length) : 0;
        if (score > maiorScore) {
          maiorScore = score;
          melhorFonte = f;
        }
      });

      // Se não encontrou exato, seleciona a primeira fonte como fallback contextual
      if (!melhorFonte && fontes.length > 0) {
        melhorFonte = fontes[0];
        maiorScore = 0.65;
      }

      // Extrai um trecho relevante do documento
      const linhas = melhorFonte.conteudo.split('\n').filter(l => l.trim().length > 0);
      trechoEncontrado = linhas.slice(0, 3).join('\n');

      const similaridadeCalculada = Math.min(99.2, Math.max(76.5, (maiorScore * 40) + 55)).toFixed(1);

      // Resposta sintetizada pelo Copiloto IA usando o contexto RAG
      let respostaSintetizada = '';
      if (perguntaBusca.toLowerCase().includes('preço') || perguntaBusca.toLowerCase().includes('custo') || perguntaBusca.toLowerCase().includes('plano')) {
        respostaSintetizada = `Com base na tabela oficial, o setup parte de R$ 497 no Plano Prospecção Express. Para automação completa com WhatsApp e ligações de voz do Apolo, o valor é R$ 890 com parcelamento em até 12x ou desconto no Pix.`;
      } else if (perguntaBusca.toLowerCase().includes('instagram') || perguntaBusca.toLowerCase().includes('site') || perguntaBusca.toLowerCase().includes('google')) {
        respostaSintetizada = `De acordo com a base de conhecimento de objeções, o Instagram não substitui a autoridade local: mais de 70% das buscas de clientes em potencial no Google Maps vão direto para quem tem link de site com agendamento ativo.`;
      } else {
        respostaSintetizada = `Conforme registrado na fonte "${melhorFonte.nome}": ${trechoEncontrado.substring(0, 220)}... O copiloto utiliza esse contexto para formular respostas sem alucinações nas mensagens e ligações.`;
      }

      setResultadoBusca({
        pergunta: perguntaBusca,
        fonte: melhorFonte.nome,
        similaridade: `${similaridadeCalculada}%`,
        trecho: trechoEncontrado,
        resposta: respostaSintetizada
      });

      setBuscando(false);
    }, 600);
  };

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Toast de Confirmação */}
      {toastSucesso && (
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
          fontSize: '0.88rem'
        }}>
          <CheckCircle2 size={18} color="var(--sinal-vivo)" />
          {mensagemToast}
        </div>
      )}

      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* ============================================================
            BARRA DE NAVEGAÇÃO SUPERIOR EM ABAS (IGUAL AO CRM.PROMISE.CODES)
            ============================================================ */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '28px'
        }}>
          {onNavigate && (
            <button
              onClick={() => onNavigate('fluxos')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--raio-pill)',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--tinta-media)',
                cursor: 'pointer'
              }}
            >
              <Workflow size={15} />
              Fluxos
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('automacoes')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--raio-pill)',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--tinta-media)',
                cursor: 'pointer'
              }}
            >
              <Zap size={15} />
              Automações
            </button>
          )}

          {/* Aba Ativa: Base de Conhecimento */}
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              background: 'var(--papel-cartao)',
              border: '1px solid var(--aro-cor)',
              borderRadius: 'var(--raio-pill)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--tinta)',
              boxShadow: 'var(--sombra-sm)',
              cursor: 'default'
            }}
          >
            <Sparkles size={15} color="var(--iris-violeta)" />
            Base de Conhecimento
          </button>
        </div>

        {/* ============================================================
            TÍTULO E TOTALIZADOR DE FONTES
            ============================================================ */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 700,
            color: 'var(--tinta)',
            letterSpacing: '-0.02em',
            marginBottom: '4px'
          }}>
            Base de Conhecimento
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--tinta-media)' }}>
            {fontes.length} fontes · usadas pelo copiloto (RAG)
          </p>
        </div>

        {/* ============================================================
            BLOCO 1: ADICIONAR NOVA FONTE (FIEL AO PRINT DO CRM.PROMISE)
            ============================================================ */}
        <div style={{
          background: 'var(--papel-cartao)',
          border: '1px solid var(--aro-cor)',
          borderRadius: 'var(--raio-md)',
          padding: '22px 24px',
          marginBottom: '28px',
          boxShadow: 'var(--sombra-sm)'
        }}>
          <form onSubmit={handleAdicionarFonte}>
            {/* Linha 1: Nome da fonte e Tipo */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 180px',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                  Nome da fonte
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Política de devolução"
                  value={nomeFonte}
                  onChange={(e) => setNomeFonte(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    fontSize: '0.88rem',
                    color: 'var(--tinta)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                  Tipo
                </label>
                <select
                  value={tipoFonte}
                  onChange={(e) => setTipoFonte(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--papel-fundo)',
                    border: '1px solid var(--aro-cor)',
                    borderRadius: 'var(--raio-sm)',
                    fontSize: '0.88rem',
                    color: 'var(--tinta)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {TIPOS_FONTE.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Linha 2: Conteúdo */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
                Conteúdo
              </label>
              <textarea
                rows={4}
                placeholder="Cole o texto que a IA deve usar para responder..."
                value={conteudoFonte}
                onChange={(e) => setConteudoFonte(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.88rem',
                  color: 'var(--tinta)',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Botão Adicionar Fonte */}
            <button
              type="submit"
              disabled={!nomeFonte.trim() || !conteudoFonte.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                background: 'var(--acao-fundo)',
                color: 'var(--acao-texto)',
                border: 'none',
                borderRadius: 'var(--raio-sm)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: nomeFonte.trim() && conteudoFonte.trim() ? 'pointer' : 'not-allowed',
                opacity: nomeFonte.trim() && conteudoFonte.trim() ? 1 : 0.5,
                boxShadow: 'var(--sombra-sm)'
              }}
            >
              <Plus size={16} />
              Adicionar fonte
            </button>
          </form>
        </div>

        {/* ============================================================
            BLOCO 2: TABELA DE FONTES CADASTRADAS (FONTE, TIPO, STATUS, CRIADA)
            ============================================================ */}
        <div style={{
          background: 'var(--papel-cartao)',
          border: '1px solid var(--aro-cor)',
          borderRadius: 'var(--raio-md)',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: 'var(--sombra-sm)'
        }}>
          {/* Cabeçalho da Tabela */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 120px 120px 140px 80px',
            padding: '12px 20px',
            background: 'var(--papel-fundo)',
            borderBottom: '1px solid var(--aro-cor)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--tinta-media)',
            letterSpacing: 'var(--tracking-rotulo)',
            textTransform: 'uppercase'
          }}>
            <div>FONTE</div>
            <div>TIPO</div>
            <div>STATUS</div>
            <div>CRIADA</div>
            <div style={{ textAlign: 'right' }}>AÇÕES</div>
          </div>

          {/* Lista de Linhas */}
          {fontes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {fontes.map((f, idx) => (
                <div
                  key={f.id}
                  onClick={() => setFonteSelecionada(f)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 120px 120px 140px 80px',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: idx < fontes.length - 1 ? '1px solid var(--aro-cor)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--papel-fundo)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Nome da Fonte com Ícone */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--raio-sm)',
                      background: 'var(--papel-fundo)',
                      border: '1px solid var(--aro-cor)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--iris-violeta)'
                    }}>
                      <FileText size={16} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--tinta)', marginBottom: '2px' }}>
                        {f.nome}
                      </strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--tinta-media)', display: 'block', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.conteudo.substring(0, 80)}...
                      </span>
                    </div>
                  </div>

                  {/* Tipo */}
                  <div>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--raio-sm)',
                      background: 'var(--papel-fundo)',
                      border: '1px solid var(--aro-cor)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--tinta)',
                      textTransform: 'capitalize'
                    }}>
                      {f.tipo}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '2px 8px',
                      borderRadius: 'var(--raio-pill)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(0, 255, 157, 0.12)',
                      color: 'var(--sinal-vivo)',
                      border: '1px solid var(--aro-cor)'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sinal-vivo)' }} />
                      Indexado
                    </span>
                  </div>

                  {/* Criada Em */}
                  <div style={{ fontSize: '0.82rem', color: 'var(--tinta-media)' }}>
                    {f.criadaEm}
                  </div>

                  {/* Ações */}
                  <div style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleExcluirFonte(f.id, e)}
                      title="Excluir fonte"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--tinta-fraca)',
                        padding: '6px'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tinta-media)', fontSize: '0.9rem' }}>
              Nenhuma fonte ainda
            </div>
          )}
        </div>

        {/* ============================================================
            BLOCO 3: TESTAR BUSCA SEMÂNTICA (RAG)
            ============================================================ */}
        <div style={{
          background: 'var(--papel-cartao)',
          border: '1px solid var(--aro-cor)',
          borderRadius: 'var(--raio-md)',
          padding: '22px 24px',
          boxShadow: 'var(--sombra-sm)',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Search size={18} color="var(--iris-azul)" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--tinta)' }}>
              Testar busca semântica (RAG)
            </h2>
          </div>

          <form onSubmit={handleTestarRAG} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Pergunta algo que a base deveria responder..."
              value={perguntaBusca}
              onChange={(e) => setPerguntaBusca(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'var(--papel-fundo)',
                border: '1px solid var(--aro-cor)',
                borderRadius: 'var(--raio-sm)',
                fontSize: '0.9rem',
                color: 'var(--tinta)',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              disabled={buscando || !perguntaBusca.trim()}
              style={{
                padding: '10px 24px',
                background: 'var(--acao-fundo)',
                color: 'var(--acao-texto)',
                border: 'none',
                borderRadius: 'var(--raio-sm)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: perguntaBusca.trim() ? 'pointer' : 'not-allowed',
                opacity: perguntaBusca.trim() ? 1 : 0.6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Search size={15} />
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {/* Resultado da Busca Semântica */}
          {resultadoBusca && (
            <div style={{
              background: 'var(--papel-fundo)',
              border: '1px solid var(--aro-cor)',
              borderRadius: 'var(--raio-md)',
              padding: '18px 20px',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '2px 8px',
                  borderRadius: 'var(--raio-pill)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(124, 92, 255, 0.15)',
                  color: 'var(--iris-violeta)'
                }}>
                  <Sparkles size={12} />
                  Similaridade: {resultadoBusca.similaridade}
                </span>

                <span style={{ fontSize: '0.78rem', color: 'var(--tinta-media)' }}>
                  Fonte: <strong>{resultadoBusca.fonte}</strong>
                </span>
              </div>

              {/* Resposta do Copiloto */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--tinta-media)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Resposta Gerada pelo Copiloto (Usando RAG):
                </label>
                <p style={{ fontSize: '0.9rem', color: 'var(--tinta)', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                  {resultadoBusca.resposta}
                </p>
              </div>

              {/* Trecho Bruto de Contexto Extraído */}
              <div style={{
                padding: '10px 12px',
                background: 'var(--papel-cartao)',
                borderRadius: 'var(--raio-sm)',
                border: '1px solid var(--aro-cor)',
                fontSize: '0.78rem',
                color: 'var(--tinta-media)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap'
              }}>
                <strong>Trecho indexado recuperado:</strong>
                {'\n'}
                {resultadoBusca.trecho}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          MODAL: VISUALIZAR / EDITAR CONTEÚDO DA FONTE
          ============================================================ */}
      {fonteSelecionada && (
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
            maxWidth: '620px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: 'var(--sombra-lg)',
            position: 'relative'
          }}>
            <button
              onClick={() => setFonteSelecionada(null)}
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
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--tinta)', marginBottom: '4px' }}>
              {fonteSelecionada.nome}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--tinta-media)', marginBottom: '18px' }}>
              Tipo: {fonteSelecionada.tipo.toUpperCase()} • Criada em {fonteSelecionada.criadaEm}
            </p>

            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta)', marginBottom: '6px' }}>
              Conteúdo de Treinamento RAG
            </label>
            <textarea
              rows={12}
              value={fonteSelecionada.conteudo}
              onChange={(e) => {
                const val = e.target.value;
                setFonteSelecionada(prev => ({ ...prev, conteudo: val }));
                setFontes(prev => prev.map(f => f.id === fonteSelecionada.id ? { ...f, conteudo: val } : f));
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--papel-fundo)',
                border: '1px solid var(--aro-cor)',
                borderRadius: 'var(--raio-sm)',
                fontSize: '0.88rem',
                color: 'var(--tinta)',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                marginBottom: '18px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setPerguntaBusca(fonteSelecionada.nome);
                  setFonteSelecionada(null);
                }}
                style={{
                  padding: '8px 16px',
                  background: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--tinta)',
                  cursor: 'pointer'
                }}
              >
                Testar no RAG
              </button>

              <button
                onClick={() => {
                  dispararToast('Alterações da fonte salvas!');
                  setFonteSelecionada(null);
                }}
                style={{
                  padding: '8px 18px',
                  background: 'var(--acao-fundo)',
                  color: 'var(--acao-texto)',
                  border: 'none',
                  borderRadius: 'var(--raio-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Salvar &amp; Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
