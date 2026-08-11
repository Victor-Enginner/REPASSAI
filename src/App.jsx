import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import FaultyTerminal from './components/ui/FaultyTerminal';
import ViewErrorBoundary from './components/ViewErrorBoundary';
import DockMobile from './components/DockMobile';
import CursorPersonalizado from './components/CursorPersonalizado';
import AgenticChatbotWidget from './components/AgenticChatbotWidget';
import { useEhMobile } from './hooks/useMediaQuery';
import { INITIAL_LEADS } from './mock/leadsData';
import { obterConfig, limparCacheConfig, capturarSessaoUrlHash, limparSessaoLegada, fetchAutenticado } from './services/authService';
import { ThemeProvider } from './theme/ThemeContext';
import FundoDaAba from './components/backgrounds/FundoDaAba';

/**
 * Carregamento sob demanda das views.
 *
 * ESTRATÉGIA DE PERFORMANCE
 * -------------------------
 * 1. `React.lazy` divide cada view em seu próprio chunk. O bundle inicial
 *    deixa de carregar as 13 telas de uma vez — sai do ar mais rápido.
 *
 * 2. Assim que o navegador fica ocioso, pré-carregamos TODOS os chunks em
 *    segundo plano. Quando você clica numa aba, o código já está em
 *    memória e a troca é imediata.
 *
 * Por que NÃO usamos "keep-alive" (manter todas montadas com display:none):
 * views como o disparo de WhatsApp e o editor têm canvas/WebGL animando.
 * Mantidas montadas, elas continuariam consumindo GPU escondidas — o
 * oposto do objetivo. Desmontar ao sair é mais barato que animar invisível.
 */
const VIEW_LOADERS = {
  dashboard: () => import('./views/DashboardView'),
  leads: () => import('./views/LeadsView'),
  crm: () => import('./views/CRMView'),
  bulk_whatsapp: () => import('./views/BulkWhatsAppView'),
  engine: () => import('./views/AIEngineView'),
  agendamentos: () => import('./views/AppointmentsView'),
  projetos: () => import('./views/ProjectsView'),
  cobrar: () => import('./views/BillingView'),
  ranking: () => import('./views/AffiliateView'),
  templates: () => import('./views/TemplatesView'),
  editor: () => import('./views/SiteEditorView'),
  wizard: () => import('./views/CreateSiteWizardView'),
  landing: () => import('./views/LandingPage'),
};

const DashboardView = lazy(VIEW_LOADERS.dashboard);
const LeadsView = lazy(VIEW_LOADERS.leads);
const CRMView = lazy(VIEW_LOADERS.crm);
const BulkWhatsAppView = lazy(VIEW_LOADERS.bulk_whatsapp);
const AIEngineView = lazy(VIEW_LOADERS.engine);
const AppointmentsView = lazy(VIEW_LOADERS.agendamentos);
const ProjectsView = lazy(VIEW_LOADERS.projetos);
const BillingView = lazy(VIEW_LOADERS.cobrar);
const AffiliateView = lazy(VIEW_LOADERS.ranking);
const TemplatesView = lazy(VIEW_LOADERS.templates);
const SiteEditorView = lazy(VIEW_LOADERS.editor);
const CreateSiteWizardView = lazy(VIEW_LOADERS.wizard);
const LandingPage = lazy(VIEW_LOADERS.landing);
const LoginView = lazy(() => import('./views/LoginView'));

/**
 * Placeholder de transição.
 *
 * Transparente de propósito: o FaultyTerminal continua visível por baixo,
 * então a troca de aba não pisca uma tela preta.
 */
function CarregandoView() {
  return <div style={{ minHeight: '100vh' }} aria-busy="true" />;
}

/**
 * Views baratas de manter montadas (keep-alive).
 *
 * São telas sem canvas, WebGL, iframe ou timer: mantidas em memória com
 * `display: none`, custam praticamente nada e voltam instantâneas, sem
 * refazer requisição nem perder o que estava na tela.
 *
 * As DEMAIS (Leads, Dashboard, Disparo, Editor, Templates, Landing) ficam
 * de fora de propósito — todas têm shader, iframe ou conexão SSE que
 * continuaria consumindo recurso escondida. Para elas, desmontar ao sair
 * é mais barato que animar invisível.
 */
const VIEWS_KEEP_ALIVE = new Set([
  'crm', 'engine', 'agendamentos', 'projetos', 'cobrar', 'ranking', 'wizard',
]);

/**
 * Envelope de keep-alive com fronteira de Suspense própria.
 *
 * Depois da primeira visita a view permanece montada; a troca de aba só
 * alterna `display`. `hidden` tira do leitor de tela e da navegação por
 * teclado enquanto está oculta.
 *
 * O `Suspense` PRECISA ficar aqui dentro, um por view. Com uma única
 * fronteira compartilhada lá em cima, qualquer chunk ainda carregando
 * suspendia a subárvore inteira e o React escondia junto todas as views
 * em keep-alive — a tela ficava em branco sem motivo.
 */
function PainelKeepAlive({ ativo, children }) {
  return (
    <div style={{ display: ativo ? 'block' : 'none' }} hidden={!ativo}>
      <Suspense fallback={<CarregandoView />}>{children}</Suspense>
    </div>
  );
}

/** Fronteira de Suspense para as views que desmontam ao sair. */
function PainelSimples({ children }) {
  return <Suspense fallback={<CarregandoView />}>{children}</Suspense>;
}

function AppMain() {
  const ehMobile = useEhMobile();
  const [currentTab, setCurrentTab] = useState(() => {
    const telaDeAuditoria = import.meta.env.DEV
      && new URLSearchParams(window.location.search).get('audit') === 'leads';
    return telaDeAuditoria ? 'leads' : 'landing';
  });
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [selectedLeadForEditor, setSelectedLeadForEditor] = useState(null);

  /**
   * Migração de segurança, executada uma vez por navegador.
   *
   * Versões antigas permitiam guardar configuração de gateways de IA no
   * localStorage. O fluxo atual usa somente o backend, então removemos
   * qualquer resíduo que possa ter ficado salvo em uma instalação existente.
   */
  useEffect(() => {
    // Remove JWT legado do localStorage (migração → cookie HttpOnly).
    limparSessaoLegada();
    try {
      const chavesLegadas = [
        `${'OMNI'}${'ROUTE'}_API_KEY`,
        ['repass', 'llm', 'config'].join('_'),
      ];
      chavesLegadas.forEach((chave) => localStorage.removeItem(chave));
    } catch {
      // storage bloqueado
    }

    // Link de confirmação de e-mail: troca hash por cookie no backend.
    capturarSessaoUrlHash().then((usuario) => {
      if (usuario) setCurrentTab('dashboard');
    });
  }, []);

  /**
   * Abas leves já visitadas. Uma vez aqui, a view continua montada e a
   * troca passa a ser só um toggle de `display` — sem remontar nada.
   */
  const [visitadasLeves, setVisitadasLeves] = useState(
    () => new Set(VIEWS_KEEP_ALIVE.has('leads') ? ['leads'] : [])
  );

  useEffect(() => {
    if (!VIEWS_KEEP_ALIVE.has(currentTab)) return;
    setVisitadasLeves(prev => (prev.has(currentTab) ? prev : new Set(prev).add(currentTab)));
  }, [currentTab]);

  /**
   * True se a view leve deve estar no DOM.
   *
   * Inclui `currentTab` explicitamente: `visitadasLeves` só é atualizado
   * no efeito, que roda DEPOIS do render. Sem isso, a primeira visita a
   * uma aba leve renderizaria vazia por um quadro — um piscar visível.
   */
  const montarLeve = (id) => id === currentTab || visitadasLeves.has(id);

  /**
   * Aquece os chunks das demais views quando o navegador está ocioso.
   *
   * Roda depois da primeira pintura, então não atrasa o carregamento
   * inicial — e garante clique instantâneo em qualquer aba depois disso.
   */
  useEffect(() => {
    let cancelado = false;

    const aquecer = () => {
      if (cancelado) return;
      Object.entries(VIEW_LOADERS).forEach(([id, carregar]) => {
        if (id !== currentTab) carregar().catch(() => {});
      });
    };

    const agendar = window.requestIdleCallback
      ? window.requestIdleCallback(aquecer, { timeout: 3000 })
      : window.setTimeout(aquecer, 1200);

    return () => {
      cancelado = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(agendar);
      else window.clearTimeout(agendar);
    };
    // Só precisa aquecer uma vez, no início da sessão.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Estado da autenticação.
   *
   * `null` enquanto verifica. Com o Supabase desligado no backend,
   * `auth_ativo` vem false e o app segue single-user — sem tela de login.
   */
  const [authConfig, setAuthConfig] = useState(null);

  const recarregarAuth = useCallback(async () => {
    limparCacheConfig();
    setAuthConfig(await obterConfig());
  }, []);

  useEffect(() => {
    obterConfig().then(setAuthConfig);
  }, []);

  // Ao entrar ou recarregar, o funil volta do servidor. Leads pertencem ao
  // usuário do cookie HttpOnly; o cliente nunca envia nem escolhe user_id.
  useEffect(() => {
    if (!authConfig?.usuario) return;
    let cancelado = false;

    fetchAutenticado('/api/leads')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((dados) => {
        if (!cancelado && Array.isArray(dados.leads)) setLeads(dados.leads);
      })
      .catch((erro) => {
        console.warn('[Leads] Não foi possível restaurar o funil:', erro);
      });

    return () => {
      cancelado = true;
    };
  }, [authConfig?.usuario?.id]);

  // 🚪 Auth gate disabled – o aplicativo agora funciona em modo single‑user sem necessidade de login.
  // O efeito que redirecionava a página de login foi removido.
  // Todas as rotas são acessíveis diretamente.


  /**
   * Recebe o resultado da varredura e o guarda no estado do aplicativo.
   *
   * Precisa viver aqui, e não dentro do LeadsView: aquela aba desmonta ao
   * trocar de menu, então guardar lá fazia a varredura inteira desaparecer
   * quando o operador ia ao Funil e voltava.
   *
   * Leads já enviados ao CRM são preservados — a varredura nova não pode
   * apagar o trabalho de triagem que já foi feito.
   */
  const handleLeadsScanned = (novosLeads) => {
    setLeads((anteriores) => {
      const trabalhados = anteriores.filter((l) => l.enviado_crm);
      const idsTrabalhados = new Set(trabalhados.map((l) => l.id));
      return [...trabalhados, ...novosLeads.filter((l) => !idsTrabalhados.has(l.id))];
    });
  };

  const handleSendToCRM = (leadId) => {
    // Não troca de aba: enviar para o CRM é ação de triagem em lote. Levar o
    // operador ao funil a cada envio o obrigava a voltar e reencontrar onde
    // estava na lista.
    //
    // `enviado_crm` é um marcador próprio, e não um valor de `status_crm`,
    // porque esse campo tem vocabulários diferentes em cada origem: o backend
    // devolve "Base", o gerador local usa "Leads em Aberto" e o painel fala
    // em "Abordados". Filtrar por ele deixava a lista errada — e marcar
    // "Abordados" escondia o lead do quadro, que não tem essa coluna.
    setLeads(prev => prev.map(l => (
      l.id === leadId
        ? { ...l, enviado_crm: true, status_crm: 'Leads em Aberto' }
        : l
    )));
  };

  const handleUpdateLeadStatus = async (leadId, novoStatus) => {
    const lead = leads.find((item) => item.id === leadId);

    // Exemplos de demonstração não viram registros comerciais. No modo local
    // sem conta mantemos o comportamento de teste apenas em memória.
    if (lead?.is_demo || !authConfig?.usuario) {
      setLeads((prev) => prev.map((item) => (
        item.id === leadId ? { ...item, status_crm: novoStatus } : item
      )));
      return { persistido: false, modo: 'local' };
    }

    const res = await fetchAutenticado('/api/leads/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId, status: novoStatus }),
    });
    const dados = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(dados.mensagem || 'Não foi possível salvar o estágio.');
    }

    setLeads((prev) => prev.map((item) => (
      item.id === leadId ? { ...item, ...dados.lead } : item
    )));
    return { persistido: true, modo: 'servidor' };
  };

  const handleGenerateSite = (lead) => {
    setSelectedLeadForEditor(lead);
    setCurrentTab('editor');
  };

  // Auth gate disabled – acesso direto ao aplicativo sem necessidade de login.
  // O bloco que exibia a tela de login foi removido.

  return (
    /*
      Casca do app transparente, de propósito.

      Aqui havia `background: '#05070f'` fixo — um painel preto por cima
      de tudo, que anulava o tema claro e deixava texto tinta sobre preto
      (1.07 de contraste). O fundo agora é o do <body>, que segue o tema,
      e a atmosfera iridescente aparece por trás.
      A largura é `100%`, não `100vw`. `100vw` é a largura da JANELA, barra
      de rolagem inclusa: como a página rola na vertical, a barra ocupa ~6px
      e o casco ficava 6px mais largo que o espaço disponível — em todas as
      abas, medido a 768px. Pequeno, mas suficiente para a página tremer na
      horizontal. `100%` respeita o espaço real do pai.
    */
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden', position: 'relative', background: 'transparent' }}>

      {/*
        Fundo da aba atual.

        Montado UMA vez, aqui, e não dentro de cada view: quem decide o
        efeito é o registro em FundoDaAba.jsx. Fica em z-index 0, abaixo
        do <main> (10) e da Sidebar (40).
      */}
      <FundoDaAba aba={currentTab} />

      {/* Sidebar Transparente em TODAS as sessões do aplicativo */}
      {currentTab !== 'landing' && currentTab !== 'login' && (
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}

      <main style={{
        flex: 1,
        minWidth: 0,
        marginLeft: (currentTab !== 'landing' && currentTab !== 'login' && !ehMobile) ? '260px' : 0,
        overflowY: 'auto',
        position: 'relative',
        zIndex: 10,
        transform: 'translateZ(0)',
        willChange: 'contents'
      }}>
        {/* Isola falhas por aba: uma view quebrada não derruba o app todo. */}
        <ViewErrorBoundary nome={currentTab}>
            {currentTab === 'landing' && (
              <PainelSimples>
                <LandingPage onOpenApp={() => setCurrentTab('login')} />
              </PainelSimples>
            )}

            {currentTab === 'login' && (
              <PainelSimples>
                <LoginView
                  onAutenticado={() => {
                    recarregarAuth();
                    setCurrentTab('dashboard');
                  }}
                  onVoltarLanding={() => setCurrentTab('landing')}
                  onBypass={() => setCurrentTab('dashboard')}
                />
              </PainelSimples>
            )}

            {currentTab === 'dashboard' && (
              <PainelSimples>
                <DashboardView
                  leads={leads}
                  onNavigateLeads={() => setCurrentTab('leads')}
                  onNavigateCRM={() => setCurrentTab('crm')}
                />
              </PainelSimples>
            )}

            {currentTab === 'leads' && (
              <PainelSimples>
                <LeadsView
                  leads={leads}
                  onLeadsScanned={handleLeadsScanned}
                  onSendToCRM={handleSendToCRM}
                  onGenerateSite={handleGenerateSite}
                />
              </PainelSimples>
            )}

            {montarLeve('wizard') && (
              <PainelKeepAlive ativo={currentTab === 'wizard'}>
                <CreateSiteWizardView
                  onClose={() => setCurrentTab('leads')}
                  /*
                    Os dois levam ao EDITOR, não à lista de projetos.

                    Iam para 'projetos': o lead era guardado em
                    `selectedLeadForEditor` e nunca usado, porque quem lê essa
                    variável é o editor. Na prática o botão "Gerar" do wizard
                    era decorativo — navegava para uma lista vazia e nenhuma
                    geração acontecia. É o editor que roda o loop agêntico.
                  */
                  onGenerateSite={(customLead) => {
                    setSelectedLeadForEditor(customLead);
                    setCurrentTab('editor');
                  }}
                  onGenerate={(customLead) => {
                    setSelectedLeadForEditor(customLead);
                    setCurrentTab('editor');
                  }}
                />
              </PainelKeepAlive>
            )}

            {currentTab === 'editor' && (
              <PainelSimples>
                <SiteEditorView
                  lead={selectedLeadForEditor || leads[0]}
                  onBack={() => setCurrentTab('projetos')}
                />
              </PainelSimples>
            )}

            {montarLeve('crm') && (
              <PainelKeepAlive ativo={currentTab === 'crm'}>
                <CRMView
                  leads={leads}
                  setLeads={setLeads}
                  onGenerateSite={handleGenerateSite}
                />
              </PainelKeepAlive>
            )}

            {montarLeve('engine') && (
              <PainelKeepAlive ativo={currentTab === 'engine'}>
                <AIEngineView />
              </PainelKeepAlive>
            )}

            {currentTab === 'bulk_whatsapp' && (
              <PainelSimples>
                <BulkWhatsAppView
                  leads={leads}
                  onUpdateLeadStatus={handleUpdateLeadStatus}
                  onBack={() => setCurrentTab('crm')}
                />
              </PainelSimples>
            )}

            {currentTab === 'templates' && (
              <PainelSimples>
                <TemplatesView
                  onSelectTemplate={(tpl) => {
                    setSelectedLeadForEditor({ id: tpl.id, nome: tpl.title, categoria: tpl.nicho, cidade: 'Goiânia' });
                    setCurrentTab('editor');
                  }}
                />
              </PainelSimples>
            )}

            {montarLeve('projetos') && (
              <PainelKeepAlive ativo={currentTab === 'projetos'}>
                <ProjectsView
                  onEditSite={(leadObj) => {
                    setSelectedLeadForEditor(leadObj);
                    setCurrentTab('editor');
                  }}
                  onNavigateWizard={() => setCurrentTab('wizard')}
                />
              </PainelKeepAlive>
            )}

            {montarLeve('agendamentos') && (
              <PainelKeepAlive ativo={currentTab === 'agendamentos'}>
                <AppointmentsView leads={leads} />
              </PainelKeepAlive>
            )}

            {montarLeve('cobrar') && (
              <PainelKeepAlive ativo={currentTab === 'cobrar'}>
                <BillingView />
              </PainelKeepAlive>
            )}

            {montarLeve('ranking') && (
              <PainelKeepAlive ativo={currentTab === 'ranking'}>
                <AffiliateView />
              </PainelKeepAlive>
            )}
        </ViewErrorBoundary>

        {/* Widget Flutuante do Chatbot Agentico (Escondido em Landing e Login) */}
        {currentTab !== 'landing' && currentTab !== 'login' && (
          <AgenticChatbotWidget />
        )}
      </main>

      {/* Atalho para as 4 telas do fluxo principal. Só no celular. */}
      <DockMobile currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Cursor de alvo. Só em desktop com mouse e sem reduced-motion. */}
      <CursorPersonalizado />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppMain />
    </ThemeProvider>
  );
}
