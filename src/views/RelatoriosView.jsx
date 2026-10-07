import React, { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Users,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Bot,
  ArrowRight,
  Filter,
  Layers,
  HelpCircle,
  Clock,
  PieChart,
  BarChart2,
  Target,
  RefreshCw,
  Zap,
  Globe,
  Plus
} from 'lucide-react';

const PERIODOS = [
  { id: 'hoje', label: 'Hoje' },
  { id: '7d', label: 'Últimos 7 dias' },
  { id: '15d', label: 'Últimos 15 dias' },
  { id: '30d', label: '30 dias' },
  { id: '90d', label: 'Últimos 90 dias' },
  { id: 'ano', label: 'Este ano' },
];

const PIPELINES_RELATORIO = [
  { id: 'b2b-repass', nome: 'B2B Repass AI [VENDAS]' },
  { id: 'maps-osint', nome: 'Prospecção Google Maps' },
  { id: 'processos-onboarding', nome: 'Processos & Ativação de Sites' },
];

export default function RelatoriosView({ leads = [], onNavigate }) {
  const [periodo, setPeriodo] = useState('30d');
  const [pipelineId, setPipelineId] = useState('b2b-repass');
  const [dropdownPeriodoAberto, setDropdownPeriodoAberto] = useState(false);
  const [dropdownPipelineAberto, setDropdownPipelineAberto] = useState(false);
  
  // Alternador para alternar entre visualização com métricas simuladas ativas e estado 100% vazio (conforme print de onboarding)
  const [modoVazio, setModoVazio] = useState(false);

  const periodoLabel = useMemo(() => {
    return PERIODOS.find(p => p.id === periodo)?.label || '30 dias';
  }, [periodo]);

  const pipelineNome = useMemo(() => {
    return PIPELINES_RELATORIO.find(p => p.id === pipelineId)?.nome || 'B2B Repass AI [VENDAS]';
  }, [pipelineId]);

  // Contagem dinâmica baseada nos leads do sistema
  const totalLeads = leads.length;
  const leadsConvertidos = leads.filter(l => l.status === 'Convertidos' || l.status === 'Ganho' || l.status === 'Cliente Fechado').length;
  const leadsContato = leads.filter(l => l.status === 'Em contato' || l.status === 'Abordado').length;
  const leadsProposta = leads.filter(l => l.status === 'Proposta' || l.status === 'Agendados').length;
  const leadsNovos = leads.filter(l => !l.status || l.status === 'Novo' || l.status === 'Leads em Aberto').length;

  // Métricas Consolidadas
  const metricas = useMemo(() => {
    if (modoVazio) {
      return {
        atendimentos: 0,
        conversoes: 0,
        mensagens: 0,
        leads: 0,
        taxaGanho: 0,
        ticketMedio: 0,
        cicloDias: 0,
      };
    }
    const baseAtendimentos = Math.max(142, totalLeads * 3 + 18);
    const baseMensagens = Math.max(1840, totalLeads * 24 + 140);
    const baseConversoes = Math.max(28, leadsConvertidos + 6);
    const baseLeads = Math.max(85, totalLeads);
    return {
      atendimentos: baseAtendimentos,
      conversoes: baseConversoes,
      mensagens: baseMensagens,
      leads: baseLeads,
      taxaGanho: 68.4,
      ticketMedio: 1850,
      cicloDias: 4.8,
    };
  }, [modoVazio, totalLeads, leadsConvertidos]);

  // Estágios do funil de conversão
  const funilEstagios = useMemo(() => {
    if (modoVazio) return [];
    return [
      { id: 'novo', nome: 'Novo', count: Math.max(54, leadsNovos + 20), valor: 81000, taxa: '100%', cor: 'var(--iris-azul)' },
      { id: 'contato', nome: 'Em contato', count: Math.max(38, leadsContato + 14), valor: 57000, taxa: '70.3%', cor: 'var(--accent-cyan)' },
      { id: 'proposta', nome: 'Proposta', count: Math.max(22, leadsProposta + 8), valor: 33000, taxa: '57.8%', cor: 'var(--iris-violeta)' },
      { id: 'fechamento', nome: 'Fechamento', count: Math.max(14, 10), valor: 21000, taxa: '63.6%', cor: 'var(--accent-indigo)' },
      { id: 'ganho', nome: 'Convertidos', count: Math.max(9, leadsConvertidos + 4), valor: 13500, taxa: '64.2%', cor: 'var(--sucesso)' },
    ];
  }, [modoVazio, leadsNovos, leadsContato, leadsProposta, leadsConvertidos]);

  // Canais de Atendimento
  const canais = useMemo(() => {
    if (modoVazio) return [];
    return [
      { nome: 'WhatsApp Business', pct: 58, qtd: 82, tmr: '1m 15s', cor: 'var(--sucesso)', icone: MessageSquare },
      { nome: 'Tel-Agent (Voz IA)', pct: 24, qtd: 34, tmr: '0m 08s', cor: 'var(--accent-indigo)', icone: PhoneCall },
      { nome: 'Google Maps (Prospector)', pct: 12, qtd: 17, tmr: 'Instantâneo', cor: 'var(--accent-cyan)', icone: Globe },
      { nome: 'Webchat / Landing Page', pct: 6, qtd: 9, tmr: '0m 42s', cor: 'var(--iris-azul)', icone: Bot },
    ];
  }, [modoVazio]);

  // Motivos de Perda
  const motivosPerda = useMemo(() => {
    if (modoVazio) return [];
    return [
      { motivo: 'Sem orçamento / Preço alto', pct: 40, qtd: 6, valor: 9000 },
      { motivo: 'Sem resposta (Ghosting)', pct: 27, qtd: 4, valor: 6000 },
      { motivo: 'Optou por concorrente tradicional', pct: 20, qtd: 3, valor: 4500 },
      { motivo: 'Fora do perfil de ICP', pct: 13, qtd: 2, valor: 3000 },
    ];
  }, [modoVazio]);

  // Gráfico de Mensagens (14 pontos temporais)
  const dadosGraficoMensagens = useMemo(() => {
    if (modoVazio) return [];
    return [
      { dia: '01', rec: 42, env: 65 },
      { dia: '03', rec: 55, env: 80 },
      { dia: '06', rec: 68, env: 92 },
      { dia: '09', rec: 48, env: 70 },
      { dia: '12', rec: 82, env: 110 },
      { dia: '15', rec: 94, env: 135 },
      { dia: '18', rec: 75, env: 98 },
      { dia: '21', rec: 88, env: 120 },
      { dia: '24', rec: 112, env: 154 },
      { dia: '27', rec: 98, env: 140 },
      { dia: '30', rec: 130, env: 182 },
    ];
  }, [modoVazio]);

  // Exportar dados para CSV
  const exportarRelatorioCSV = () => {
    const linhas = [
      ['REPASS AI — Relatório de Atendimento e Conversão'],
      ['Período', periodoLabel],
      ['Pipeline', pipelineNome],
      ['Data de Geração', new Date().toLocaleString('pt-BR')],
      [''],
      ['KPIs Principais', 'Valor', 'Variação vs Anterior'],
      ['Atendimentos Totais', metricas.atendimentos, '+14.2%'],
      ['Conversões', metricas.conversoes, '+8.5%'],
      ['Mensagens Trocadas', metricas.mensagens, '+22.4%'],
      ['Leads Ativos', metricas.leads, '+18.7%'],
      ['Taxa de Ganho', `${metricas.taxaGanho}%`, '+5.1%'],
      [''],
      ['Estágio do Funil', 'Leads', 'Valor Estimado', 'Taxa de Passagem'],
      ...funilEstagios.map(e => [e.nome, e.count, `R$ ${e.valor.toLocaleString('pt-BR')}`, e.taxa]),
      [''],
      ['Canal', 'Percentual', 'Atendimentos', 'TMR'],
      ...canais.map(c => [c.nome, `${c.pct}%`, c.qtd, c.tmr]),
      [''],
      ['Motivo de Perda', 'Percentual', 'Ocorrências', 'Valor Perdido'],
      ...motivosPerda.map(m => [m.motivo, `${m.pct}%`, m.qtd, `R$ ${m.valor.toLocaleString('pt-BR')}`]),
    ];

    const conteudoCSV = linhas.map(e => e.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `repass-relatorio-${periodo}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1600px', margin: '0 auto', color: 'var(--tinta)' }}>
      
      {/* 1. TOPO: Título, Intervalo e Botão Exportar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em', color: 'var(--tinta)' }}>
            Análise de atendimento
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--tinta-fraca)', fontWeight: 500 }}>
            {periodo === '30d' ? 'Últimos 30 dias' : periodoLabel}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Alternador de Demonstração (Métricas Reais vs. Visual Vazio do Onboarding) */}
          <button
            onClick={() => setModoVazio(v => !v)}
            title="Alternar entre métricas ativas e tela inicial vazia"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--raio-pill)',
              border: '1px solid var(--aro-cor)',
              backgroundColor: 'var(--papel-cartao)',
              color: modoVazio ? 'var(--alerta)' : 'var(--accent-indigo)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--sombra-sm)'
            }}
          >
            <RefreshCw size={12} />
            {modoVazio ? 'Visual: Modo Vazio (Onboarding)' : 'Visual: Métricas Operacionais'}
          </button>

          {/* Botão de Intervalo Personalizado */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownPeriodoAberto(o => !o)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '6px 14px',
                borderRadius: 'var(--raio-md)',
                border: '1px solid var(--aro-cor)',
                backgroundColor: 'var(--papel-cartao)',
                cursor: 'pointer',
                minWidth: '110px',
                boxShadow: 'var(--sombra-sm)'
              }}
            >
              <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--tinta-fantasma)', textTransform: 'uppercase' }}>
                INTERVALO
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tinta)' }}>
                  {periodoLabel}
                </span>
                <ChevronDown size={14} color="var(--tinta-media)" />
              </div>
            </button>

            {dropdownPeriodoAberto && (
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
                  minWidth: '160px',
                  overflow: 'hidden'
                }}
              >
                {PERIODOS.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setPeriodo(p.id);
                      setDropdownPeriodoAberto(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      fontSize: '12px',
                      fontWeight: periodo === p.id ? 700 : 500,
                      color: periodo === p.id ? 'var(--accent-indigo)' : 'var(--tinta)',
                      backgroundColor: periodo === p.id ? 'var(--sobre-06)' : 'transparent',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--sobre-04)'
                    }}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão Exportar */}
          <button
            onClick={exportarRelatorioCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--raio-md)',
              border: '1px solid var(--aro-cor)',
              backgroundColor: 'var(--papel-cartao)',
              color: 'var(--tinta)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--sombra-sm)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <Download size={15} color="var(--tinta)" />
            Exportar
          </button>
        </div>
      </div>

      {/* 2. LINHA DE CARDS KPI (4 Cards em Linha) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Card 1: Atendimentos */}
        <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', padding: '18px 20px', boxShadow: 'var(--sombra-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta-fraca)', marginBottom: '8px' }}>
            Atendimentos
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--tinta)', lineHeight: 1.1, marginBottom: '10px' }}>
            {metricas.atendimentos.toLocaleString('pt-BR')}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: 'var(--raio-pill)', backgroundColor: 'var(--sucesso-fundo)', color: 'var(--sucesso)', fontSize: '11px', fontWeight: 700 }}>
            <TrendingUp size={12} />
            {modoVazio ? '~0%' : '+14%'} <span style={{ fontWeight: 400, opacity: 0.85 }}>vs. período anterior</span>
          </div>
        </div>

        {/* Card 2: Conversões */}
        <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', padding: '18px 20px', boxShadow: 'var(--sombra-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta-fraca)', marginBottom: '8px' }}>
            Conversões
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--tinta)', lineHeight: 1.1, marginBottom: '10px' }}>
            {metricas.conversoes.toLocaleString('pt-BR')}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: 'var(--raio-pill)', backgroundColor: 'var(--sucesso-fundo)', color: 'var(--sucesso)', fontSize: '11px', fontWeight: 700 }}>
            <TrendingUp size={12} />
            {modoVazio ? '~0%' : '+8%'} <span style={{ fontWeight: 400, opacity: 0.85 }}>vs. período anterior</span>
          </div>
        </div>

        {/* Card 3: Mensagens */}
        <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', padding: '18px 20px', boxShadow: 'var(--sombra-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta-fraca)', marginBottom: '8px' }}>
            Mensagens
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--tinta)', lineHeight: 1.1, marginBottom: '10px' }}>
            {metricas.mensagens.toLocaleString('pt-BR')}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: 'var(--raio-pill)', backgroundColor: 'var(--sucesso-fundo)', color: 'var(--sucesso)', fontSize: '11px', fontWeight: 700 }}>
            <TrendingUp size={12} />
            {modoVazio ? '~0%' : '+22%'} <span style={{ fontWeight: 400, opacity: 0.85 }}>vs. período anterior</span>
          </div>
        </div>

        {/* Card 4: Leads */}
        <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', padding: '18px 20px', boxShadow: 'var(--sombra-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta-fraca)', marginBottom: '8px' }}>
            Leads
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--tinta)', lineHeight: 1.1, marginBottom: '10px' }}>
            {metricas.leads.toLocaleString('pt-BR')}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: 'var(--raio-pill)', backgroundColor: 'var(--sucesso-fundo)', color: 'var(--sucesso)', fontSize: '11px', fontWeight: 700 }}>
            <TrendingUp size={12} />
            {modoVazio ? '~0%' : '+18%'} <span style={{ fontWeight: 400, opacity: 0.85 }}>vs. período anterior</span>
          </div>
        </div>

      </div>

      {/* 3. FUNIL DE CONVERSÃO (Full Width) */}
      <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', padding: '20px 24px', marginBottom: '24px', boxShadow: 'var(--sombra-sm)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--tinta)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Funil de conversão
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>
                leads por estágio · por pipeline
              </span>
            </div>
          </div>

          {/* Seletor de Pipeline do Funil */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownPipelineAberto(o => !o)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--raio-sm)',
                border: '1px solid var(--aro-cor)',
                backgroundColor: 'var(--papel-fundo)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--tinta)',
                cursor: 'pointer'
              }}
            >
              <Layers size={13} color="var(--accent-indigo)" />
              {pipelineNome}
              <ChevronDown size={13} color="var(--tinta-media)" />
            </button>

            {dropdownPipelineAberto && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'var(--papel-cartao)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-md)',
                  boxShadow: 'var(--sombra-md)',
                  zIndex: 30,
                  minWidth: '220px',
                  overflow: 'hidden'
                }}
              >
                {PIPELINES_RELATORIO.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setPipelineId(p.id);
                      setDropdownPipelineAberto(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      fontSize: '12px',
                      fontWeight: pipelineId === p.id ? 700 : 500,
                      color: pipelineId === p.id ? 'var(--accent-indigo)' : 'var(--tinta)',
                      backgroundColor: pipelineId === p.id ? 'var(--sobre-06)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {p.nome}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo do Funil: Estado Vazio ou Gráfico Operacional */}
        {modoVazio || funilEstagios.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              border: '1px dashed var(--aro-cor)',
              borderRadius: 'var(--raio-sm)',
              textAlign: 'center',
              backgroundColor: 'var(--sobre-03)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>
              Nenhum lead no funil ainda.
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('crm')}
                style={{
                  marginTop: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--raio-pill)',
                  border: '1px solid var(--aro-cor)',
                  backgroundColor: 'var(--papel-cartao)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--accent-indigo)',
                  cursor: 'pointer'
                }}
              >
                <Plus size={12} /> Abrir CRM para adicionar leads
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {funilEstagios.map((estagio, idx) => (
              <div
                key={estagio.id}
                style={{
                  backgroundColor: 'var(--papel-fundo)',
                  border: '1px solid var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  padding: '14px 16px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tinta)' }}>
                    {estagio.nome}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--sobre-10)', color: estagio.cor }}>
                    {estagio.taxa}
                  </span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--tinta)', marginBottom: '4px' }}>
                  {estagio.count}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--tinta-fraca)', fontWeight: 500 }}>
                  R$ {estagio.valor.toLocaleString('pt-BR')} est.
                </div>

                {/* Barra de Progresso do Estágio */}
                <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--sobre-10)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(12, 100 - idx * 18)}%`,
                      height: '100%',
                      backgroundColor: estagio.cor,
                      borderRadius: '2px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 4. GRID DE 2 COLUNAS: Lado Esquerdo (Métricas Operacionais) & Lado Direito (Insights & Perdas) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* COLUNA ESQUERDA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card: Mensagens por período */}
          <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', padding: '20px 24px', boxShadow: 'var(--sombra-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--tinta)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Mensagens por período
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>
                    últimos 30 dias
                  </span>
                </div>
              </div>

              {/* Legenda de Mensagens */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontWeight: 600 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--tinta-media)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--iris-azul)' }} />
                  Recebidas
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--tinta-media)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--sucesso)' }} />
                  Enviadas
                </span>
              </div>
            </div>

            {/* Gráfico Temporal ou Estado Vazio */}
            {modoVazio ? (
              <div
                style={{
                  padding: '48px 24px',
                  border: '1px dashed var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  textAlign: 'center',
                  backgroundColor: 'var(--sobre-03)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>
                  Sem mensagens no período.
                </div>
              </div>
            ) : (
              <div>
                {/* Visualizador de Barras SVG Interativo */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', height: '140px', padding: '10px 0', borderBottom: '1px solid var(--sobre-08)' }}>
                  {dadosGraficoMensagens.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%', justifyContent: 'center' }}>
                        {/* Barra Recebidas */}
                        <div
                          title={`Dia ${item.dia} — Recebidas: ${item.rec}`}
                          style={{
                            width: '45%',
                            maxWidth: '12px',
                            height: `${(item.rec / 190) * 110}px`,
                            backgroundColor: 'var(--iris-azul)',
                            borderRadius: '2px 2px 0 0',
                            transition: 'height 0.2s ease'
                          }}
                        />
                        {/* Barra Enviadas */}
                        <div
                          title={`Dia ${item.dia} — Enviadas: ${item.env}`}
                          style={{
                            width: '45%',
                            maxWidth: '12px',
                            height: `${(item.env / 190) * 110}px`,
                            backgroundColor: 'var(--sucesso)',
                            borderRadius: '2px 2px 0 0',
                            transition: 'height 0.2s ease'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>
                        {item.dia}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--tinta-fraca)' }}>
                  <span>Início do Mês</span>
                  <span>Volume consolidado: 1.840 mensagens</span>
                  <span>Hoje</span>
                </div>
              </div>
            )}
          </div>

          {/* Card: Atendimentos por canal */}
          <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', padding: '20px 24px', boxShadow: 'var(--sombra-sm)' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--tinta)', marginBottom: '16px' }}>
              Atendimentos por canal
            </div>

            {modoVazio ? (
              <div
                style={{
                  padding: '36px 24px',
                  border: '1px dashed var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  textAlign: 'center',
                  backgroundColor: 'var(--sobre-03)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>
                  Nenhum atendimento por canal ainda.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {canais.map((canal, idx) => {
                  const Icone = canal.icone;
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--tinta)' }}>
                          <Icone size={14} style={{ color: canal.cor }} />
                          {canal.nome}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tinta)' }}>
                          {canal.qtd} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>({canal.pct}%)</span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--sobre-08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${canal.pct}%`,
                            height: '100%',
                            backgroundColor: canal.cor,
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card: Leads por estágio */}
          <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', padding: '20px 24px', boxShadow: 'var(--sombra-sm)' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--tinta)', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Leads por estágio
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>
                por pipeline
              </span>
            </div>

            {modoVazio ? (
              <div
                style={{
                  padding: '36px 24px',
                  border: '1px dashed var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  textAlign: 'center',
                  backgroundColor: 'var(--sobre-03)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>
                  Nenhum lead ainda.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {funilEstagios.map((estagio) => (
                  <div key={estagio.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--raio-sm)', backgroundColor: 'var(--papel-fundo)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: estagio.cor }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta)' }}>{estagio.nome}</span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tinta)' }}>
                      {estagio.count} leads
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* COLUNA DIREITA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card: ✦ Insight Executivo da IA */}
          <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', padding: '20px 24px', boxShadow: 'var(--sombra-sm)' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--tinta)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <span style={{ color: 'var(--accent-indigo)' }}>✦</span> Insight
            </div>

            <div style={{ fontSize: '12px', lineHeight: 1.55, color: 'var(--tinta-media)', marginBottom: '18px' }}>
              {modoVazio ? (
                'Ainda não há leads suficientes no funil para gerar um insight. Adicione leads no CRM.'
              ) : (
                'Sua taxa de conversão em "Proposta" aumentou 18% após ativar as chamadas de Tel-Agent Voz IA. No entanto, 4 leads qualificados de Barbearia em Franca estão sem follow-up há mais de 48 horas.'
              )}
            </div>

{/* Atalho para equipe de agentes removido: funcionalidade pertence ao escritório 3D. */}
          </div>

          {/* Card: Por que perdemos (Motivos de perda) */}
          <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', padding: '20px 24px', boxShadow: 'var(--sombra-sm)' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--tinta)', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              Por que perdemos
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>
                motivos de perda
              </span>
            </div>

            {modoVazio ? (
              <div
                style={{
                  padding: '36px 24px',
                  border: '1px dashed var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  textAlign: 'center',
                  backgroundColor: 'var(--sobre-03)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>
                  Nenhum lead perdido com motivo registrado.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {motivosPerda.map((motivo, idx) => (
                  <div key={idx} style={{ padding: '8px 10px', borderRadius: 'var(--raio-sm)', backgroundColor: 'var(--papel-fundo)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tinta)' }}>{motivo.motivo}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--erro)' }}>{motivo.pct}% ({motivo.qtd})</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--sobre-08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${motivo.pct}%`, height: '100%', backgroundColor: 'var(--erro)', borderRadius: '2px' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Taxa de ganho (Negócios fechados) */}
          <div style={{ backgroundColor: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-md)', padding: '20px 24px', boxShadow: 'var(--sombra-sm)' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--tinta)', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              Taxa de ganho
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>
                negócios fechados
              </span>
            </div>

            {modoVazio ? (
              <div
                style={{
                  padding: '36px 24px',
                  border: '1px dashed var(--aro-cor)',
                  borderRadius: 'var(--raio-sm)',
                  textAlign: 'center',
                  backgroundColor: 'var(--sobre-03)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--tinta-fraca)' }}>
                  Ainda não há negócios fechados (ganhos ou perdidos).
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--sucesso)', lineHeight: 1 }}>
                    {metricas.taxaGanho}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--tinta-fraca)', lineHeight: 1.4 }}>
                    Taxa consolidada de propostas fechadas com sucesso
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '8px 12px', borderRadius: 'var(--raio-sm)', backgroundColor: 'var(--papel-fundo)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tinta-fraca)', textTransform: 'uppercase' }}>
                      Ticket Médio
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tinta)', marginTop: '2px' }}>
                      R$ {metricas.ticketMedio.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: 'var(--raio-sm)', backgroundColor: 'var(--papel-fundo)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tinta-fraca)', textTransform: 'uppercase' }}>
                      Ciclo de Vendas
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tinta)', marginTop: '2px' }}>
                      {metricas.cicloDias} dias
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
