import React, { useState, useMemo } from 'react';
import {
  Users,
  BarChart3,
  Send,
  Zap,
  FileText,
  Building2,
  Users2,
  Tag,
  Columns,
  TrendingDown,
  SlidersHorizontal,
  Layers,
  Settings,
  Mail,
  ShieldCheck,
  CreditCard,
  Bot,
  Shield,
  Plus,
  Check,
  AlertCircle
} from 'lucide-react';

const CONFIGURACOES_INFO = {
  contatos: {
    titulo: 'Contatos & Empresas',
    sub: 'Diretório unificado de contatos coletados via Google Maps e convertidos em clientes.',
    icone: Users,
    botao: 'Novo Contato',
    colunas: ['Nome / Empresa', 'Telefone', 'Origem', 'Status', 'Última Interação'],
    linhas: [
      ['Barbearia Alpha Prime', '(11) 98877-6655', 'Google Maps (Scrapling)', 'Site Gerado', 'Hoje 15:30'],
      ['Auto Mecânica São Paulo', '(11) 97711-2233', 'Prospector', 'Em Negociação', 'Ontem 18:20'],
      ['Pet Shop Amigo Fiel', '(19) 99122-3344', 'Google Places', 'Contatado', '25/09/2026'],
      ['Clínica Odonto Sorriso', '(11) 96544-3322', 'Indicação', 'Fechado (R$ 890)', '24/09/2026']
    ]
  },
  relatorios: {
    titulo: 'Relatórios de Desempenho',
    sub: 'Métricas de prospecção, ligações do Tel-Agent, taxas de abertura de WhatsApp e conversões.',
    icone: BarChart3,
    metricas: [
      { label: 'Leads Mapeados', valor: '1.248', delta: '+18% este mês' },
      { label: 'Sites Compilados', valor: '342', delta: '14ms médio' },
      { label: 'Ligações de Voz IA', valor: '185', delta: '42% interesse' },
      { label: 'Faturamento Estimado', valor: 'R$ 14.850', delta: 'Ticket R$ 497' }
    ]
  },
  disparos: {
    titulo: 'Campanhas de Disparo',
    sub: 'Envio em lote segmentado via WhatsApp e discador automatizado de voz.',
    icone: Send,
    botao: 'Nova Campanha',
    colunas: ['Campanha', 'Canal', 'Disparados', 'Entregues', 'Respostas', 'Status'],
    linhas: [
      ['Barbearias Zona Leste SP', 'WhatsApp + Tel-Agent', '120', '118 (98%)', '34 (29%)', 'Concluída'],
      ['Mecânicas Campinas', 'IA Calling (Voz)', '80', '76 (95%)', '22 (28%)', 'Em Andamento'],
      ['Petshops Grande ABC', 'WhatsApp Direct', '150', '147 (98%)', '41 (27%)', 'Agendada']
    ]
  },
  automacoes: {
    titulo: 'Regras de Automação & Triggers',
    sub: 'Gatilhos de eventos automáticos (webhook, lead criado, site visualizado).',
    icone: Zap,
    botao: 'Criar Regra',
    colunas: ['Regra', 'Gatilho', 'Ação', 'Execuções', 'Status'],
    linhas: [
      ['Auto-Qualificar Lead com Nota > 4.5', 'Lead coletado no Maps', 'Iniciar discagem via Tel-Agent', '412', 'Ativa'],
      ['Enviar WhatsApp ao gerar site', 'Site gerado com sucesso', 'Disparar preview com link do R2', '289', 'Ativa'],
      ['Notificar Telegram em fechamento', 'Lead movido para Ganho', 'Disparar mensagem no canal da equipe', '38', 'Ativa']
    ]
  },
  formularios: {
    titulo: 'Formulários & Captura',
    sub: 'Páginas e widgets de captura de leads integrados diretamente ao CRM do REPASS AI.',
    icone: FileText,
    botao: 'Criar Formulário',
    colunas: ['Formulário', 'Visualizações', 'Envios', 'Taxa', 'Última Resposta'],
    linhas: [
      ['Briefing de Criação de Site Express', '320', '84', '26.2%', 'Há 20 min'],
      ['Agendamento Barbearias', '540', '198', '36.6%', 'Há 1 hora']
    ]
  },
  empresas: {
    titulo: 'Empresas do Workspace',
    sub: 'Empresas e CNPJs cadastrados sob a sua operação de agência.',
    icone: Building2,
    botao: 'Adicionar Empresa',
    colunas: ['Razão Social / Nome Fantasia', 'Segmento', 'Sites Ativos', 'Responsável'],
    linhas: [
      ['REPASS Digital Soluções Ltda', 'Agência / Tecnologia', '14 sites', 'Victor Borsari'],
      ['Studio Alpha Barbearias', 'Beleza & Estética', '3 sites', 'Marcos Oliveira']
    ]
  },
  equipe: {
    titulo: 'Equipe & Filas de Atendimento',
    sub: 'Operadores humanos e agentes de inteligência artificial atribuídos às filas.',
    icone: Users2,
    botao: 'Convidar Membro',
    colunas: ['Nome', 'E-mail / ID', 'Papel', 'Fila', 'Status'],
    linhas: [
      ['Victor Borsari', 'victor@repass.ai', 'Administrador', 'Todas as Filas', 'Online'],
      ['Sofia (Agente Voz IA)', 'tel-agent-core@system', 'Agente IA', 'Fila Prospecção Ativa', 'Online (3 linhas)'],
      ['Mateus Silva', 'mateus@repass.ai', 'Vendedor / SDR', 'Fila WhatsApp Frio', 'Ausente']
    ]
  },
  tags: {
    titulo: 'Tags & Segmentação',
    sub: 'Etiquetas para categorizar leads e clientes no CRM e nos disparos.',
    icone: Tag,
    botao: 'Nova Tag',
    colunas: ['Tag', 'Cor', 'Leads Associados', 'Ações Automáticas'],
    linhas: [
      ['Sem Site no Maps', 'Violeta', '842 leads', 'Prioridade máxima no Prospector'],
      ['Interesse Confirmado', 'Menta', '114 leads', 'Move para Funil Quente'],
      ['Objeção Preço', 'Pêssego', '48 leads', 'Entra no fluxo de desconto'],
      ['Cliente Ativo R2', 'Azul', '38 clientes', 'Hospedagem ativa']
    ]
  },
  pipelines: {
    titulo: 'Pipelines & Funis de Vendas',
    sub: 'Etapas de negociação personalizadas por nicho ou produto.',
    icone: Columns,
    botao: 'Novo Funil',
    colunas: ['Funil', 'Etapas', 'Leads em Aberto', 'Valor em Pipeline'],
    linhas: [
      ['Venda de Sites Locais (Padrão)', 'Lead Coletado → Prévia Enviada → Negociação → Fechado', '42 leads', 'R$ 21.000'],
      ['Manutenção & SEO Mensal', 'Proposta → Assinatura → Onboarding', '12 leads', 'R$ 2.400/mês']
    ]
  },
  respostas_rapidas: {
    titulo: 'Respostas Rápidas',
    sub: 'Atalhos de texto e templates para acelerar o atendimento humano e do agente.',
    icone: Send,
    botao: 'Nova Resposta',
    colunas: ['Atalho', 'Título', 'Prévia da Mensagem'],
    linhas: [
      ['/previa', 'Envio de Prévia do Site', 'Olá! Como combinado, segue o link da página exclusiva que geramos para o seu negócio: {link_site}'],
      ['/preco', 'Valores de Manutenção', 'A taxa de publicação e hospedagem rápida com certificado SSL fica por apenas R$ 89/mês sem fidelidade.'],
      ['/dominio', 'Uso de Domínio Próprio', 'Você pode conectar seu próprio endereço .com.br ou usar nosso subdomínio otimizado sem custo adicional.']
    ]
  },
  motivos_perda: {
    titulo: 'Motivos de Perda',
    sub: 'Classificação de descarte de oportunidades para análise de gargalos.',
    icone: TrendingDown,
    botao: 'Novo Motivo',
    colunas: ['Motivo', 'Ocorrências', '% do Total', 'Ação Sugerida'],
    linhas: [
      ['Já contratou outra agência', '42', '38%', 'Manter em nutrição de longo prazo'],
      ['Sem interesse em ter site', '28', '25%', 'Oferecer apenas cardápio/catálogo digital'],
      ['Orçamento insuficiente', '22', '20%', 'Mandar para fluxo de recuperação Black Friday'],
      ['Não conseguimos contato', '18', '17%', 'Retentar via discador IA em horário comercial']
    ]
  },
  campos_personalizados: {
    titulo: 'Campos Personalizados',
    sub: 'Propriedades adicionais salvas no cadastro do lead ou negócio.',
    icone: SlidersHorizontal,
    botao: 'Novo Campo',
    colunas: ['Identificador', 'Rótulo', 'Tipo', 'Obrigatório'],
    linhas: [
      ['nicho_especifico', 'Nicho Detalhado', 'Texto Curto', 'Não'],
      ['avaliacao_maps', 'Nota no Google Maps', 'Número Decimal', 'Sim'],
      ['possui_whatsapp', 'WhatsApp Confirmado', 'Booleano (Sim/Não)', 'Sim'],
      ['url_site_gerado', 'URL Publicada R2', 'Link URL', 'Não']
    ]
  },
  workspaces: {
    titulo: 'Gerenciamento de Workspaces',
    sub: 'Isole dados, leads, templates e faturamentos por projeto ou cliente.',
    icone: Layers,
    botao: 'Criar Workspace',
    colunas: ['Workspace', 'Plano', 'Leads', 'Sites', 'Membros'],
    linhas: [
      ['Victor Borsari (Principal)', 'Pro Agência', '1.248', '38 sites', '2 membros'],
      ['Operação Barbearias SP', 'Equipe', '450', '12 sites', '1 membro']
    ]
  },
  organizacao: {
    titulo: 'Organização & Marca',
    sub: 'Dados da sua agência, logo, favicon e domínio de visualização das prévias.',
    icone: Settings,
    botao: 'Salvar Alterações',
    colunas: ['Configuração', 'Valor Atual', 'Status'],
    linhas: [
      ['Nome da Marca', 'REPASS AI', 'Ativo'],
      ['Domínio de Prévia R2', 'preview.repass.ai', 'Verificado'],
      ['Timezone Padrão', 'America/Sao_Paulo (UTC-3)', 'Configurado'],
      ['Idioma da Plataforma', 'Português (Brasil)', 'Padrão']
    ]
  },
  smtp: {
    titulo: 'Configurações de E-mail / SMTP',
    sub: 'Servidor para envio de faturas, propostas e notificações de alertas.',
    icone: Mail,
    botao: 'Testar Envio SMTP',
    colunas: ['Serviço', 'Host', 'Porta', 'Remetente', 'Status'],
    linhas: [
      ['Resend / AWS SES', 'smtp.resend.com', '587 (TLS)', 'notificacoes@repass.ai', 'Conectado']
    ]
  },
  permissoes: {
    titulo: 'Papéis & Permissões (RBAC)',
    sub: 'Controle o que cada membro ou integração pode visualizar e editar.',
    icone: ShieldCheck,
    botao: 'Novo Papel',
    colunas: ['Papel', 'Membros', 'Acesso a Dados', 'Permissão de Disparo'],
    linhas: [
      ['Super Admin', '1', 'Acesso Total', 'Ilimitado'],
      ['Vendedor / Closer', '1', 'Leads atribuídos e CRM', 'WhatsApp 1-a-1'],
      ['Agente de Voz Tel-Agent', 'Sistema', 'Leads de prospecção', 'Discador Automático']
    ]
  },
  plano: {
    titulo: 'Plano & Assinatura',
    sub: 'Gerencie seu plano atual, cotas de compilação de sites e consumo de infraestrutura.',
    icone: CreditCard,
    botao: 'Alterar Plano',
    colunas: ['Recurso', 'Utilizado', 'Limite do Plano', 'Status'],
    linhas: [
      ['Compilação de Sites 14ms', '342 gerados', 'Ilimitado (Plano Pro)', 'Operacional'],
      ['Coletas no Google Maps', '1.248 leads', 'Ilimitado (Scrapling Core)', 'Operacional'],
      ['Hospedagem Cloudflare R2', '38 sites ativos', '500 sites inclusos', 'Operacional'],
      ['Linhas Simultâneas Tel-Agent', '3 canais de voz', '5 canais inclusos', 'Ativo']
    ]
  },
  ia_config: {
    titulo: 'Inteligência Artificial & Modelos',
    sub: 'Configurações de roteamento de LLM para geração de textos e agente telefônico.',
    icone: Bot,
    botao: 'Salvar Chaves',
    colunas: ['Modelo / Gateway', 'Finalidade', 'Latência Média', 'Status'],
    linhas: [
      ['Google Gemini 2.5 Flash', 'Geração de Landing Pages & Copy', '14 ms (Zero Custo)', 'Ativo (Padrão)'],
      ['Whisper + ElevenLabs', 'Agente de Ligação Tel-Agent', '450 ms (Voz Natural)', 'Ativo'],
      ['OpenAI GPT-4o Mini', 'Backup de Contingência', '320 ms', 'Configurado']
    ]
  },
  lgpd: {
    titulo: 'Privacidade & Conformidade LGPD',
    sub: 'Políticas de proteção de dados, anonimização e termos de consentimento.',
    icone: Shield,
    botao: 'Exportar Relatório LGPD',
    colunas: ['Diretriz', 'Implementação', 'Status'],
    linhas: [
      ['Origem dos Dados', 'Fontes públicas e cadastros abertos no Google Places', 'Conforme'],
      ['Opt-Out de Contatos', 'Canal imediato de descadastro por comando no WhatsApp', 'Ativo'],
      ['Armazenamento Seguro', 'Supabase com Row Level Security (RLS) & Cookies HttpOnly', 'Auditado'],
      ['Tempo de Retenção', 'Logs de auditoria preservados por 180 dias', 'Configurado']
    ]
  }
};

export default function GenericWorkspaceView({ tabId }) {
  const baseConfig = CONFIGURACOES_INFO[tabId] || CONFIGURACOES_INFO.contatos;
  const Icone = baseConfig.icone || Settings;

  const config = useMemo(() => {
    if (tabId !== 'equipe') return baseConfig;
    try {
      const cadastrados = JSON.parse(localStorage.getItem('repass_usuarios_registrados') || '[]');
      const linhasCadastrados = cadastrados.map(u => [
        u.nome || u.email.split('@')[0],
        u.email,
        u.role || 'Operador',
        'Fila Geral B2B',
        u.status || 'Online'
      ]);

      // Garante que zevatron1337 esteja visivel para o Victor
      const temZevatron = cadastrados.some(u => u.email.includes('zevatron1337'));
      const zevatronLinha = !temZevatron
        ? [['Zevatron (Membro)', 'zevatron1337@gmail.com', 'Operador Convidado', 'Fila Comercial', 'Cadastrado']]
        : [];

      return {
        ...baseConfig,
        linhas: [...linhasCadastrados, ...zevatronLinha, ...baseConfig.linhas]
      };
    } catch {
      return baseConfig;
    }
  }, [tabId, baseConfig]);

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Icone size={22} style={{ color: 'var(--iris-violeta)' }} />
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--tinta)' }}>
              {config.titulo}
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--tinta-media)', margin: 0 }}>
            {config.sub}
          </p>
        </div>

        {config.botao && (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: 'var(--acao-fundo)',
              color: 'var(--acao-texto)',
              borderRadius: 'var(--raio-md)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--sombra-md)'
            }}
          >
            <Plus size={16} />
            {config.botao}
          </button>
        )}
      </div>

      {/* Se houver métricas (ex: relatórios) */}
      {config.metricas && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {config.metricas.map((m, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--papel-cartao)',
                border: '1px solid var(--aro-cor)',
                borderRadius: 'var(--raio-lg)',
                padding: '20px',
                boxShadow: 'var(--sombra-sm)'
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--tinta-fraca)', fontFamily: 'var(--font-mono)' }}>
                {m.label}
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--tinta)', margin: '6px 0 2px 0' }}>
                {m.valor}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--sucesso)', fontWeight: 600 }}>
                {m.delta}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tabela de Dados */}
      {config.colunas && (
        <div
          style={{
            backgroundColor: 'var(--papel-cartao)',
            border: '1px solid var(--aro-cor)',
            borderRadius: 'var(--raio-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--sombra-sm)'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--papel-fundo)', borderBottom: '1px solid var(--aro-cor)' }}>
                  {config.colunas.map((col, idx) => (
                    <th
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        fontWeight: 600,
                        color: 'var(--tinta-fraca)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: 'var(--tracking-rotulo)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {config.linhas.map((linha, lIdx) => (
                  <tr
                    key={lIdx}
                    style={{
                      borderBottom: lIdx < config.linhas.length - 1 ? '1px solid var(--aro-cor)' : 'none',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    {linha.map((celula, cIdx) => (
                      <td
                        key={cIdx}
                        style={{
                          padding: '14px 16px',
                          color: cIdx === 0 ? 'var(--tinta)' : 'var(--tinta-media)',
                          fontWeight: cIdx === 0 ? 600 : 400
                        }}
                      >
                        {celula}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
