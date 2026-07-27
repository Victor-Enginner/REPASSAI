import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import FaultyTerminal from './components/ui/FaultyTerminal';
import ViewErrorBoundary from './components/ViewErrorBoundary';
import DockMobile from './components/DockMobile';
import CursorPersonalizado from './components/CursorPersonalizado';
import { INITIAL_LEADS } from './mock/leadsData';
import { obterConfig, limparCacheConfig } from './services/authService';

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

export default function App() {
  const [currentTab, setCurrentTab] = useState('leads');
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [selectedLeadForEditor, setSelectedLeadForEditor] = useState(null);

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

  const handleSendToCRM = (leadId) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status_crm: 'Abordados' } : l));
    setCurrentTab('crm');
  };

  const handleGenerateSite = (lead) => {
    setSelectedLeadForEditor(lead);
    setCurrentTab('editor');
  };

  // Modo multiusuário ligado e ninguém logado -> tela de acesso.
  // Enquanto `authConfig` é null estamos só verificando; não mostramos
  // login para não piscar a tela de quem roda single-user.
  if (authConfig?.auth_ativo && !authConfig?.usuario) {
    return (
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#05070f' }} />}>
        <LoginView onAutenticado={recarregarAuth} />
      </Suspense>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden', position: 'relative', background: '#05070f' }}>

      {/* Background Matrix Terminal Fixo Global (FaultyTerminal) - Permanece vivo em TODAS as abas sangrando atrás da Sidebar transparente */}
      {currentTab !== 'landing' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          opacity: 0.38,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden'
        }}>
          <FaultyTerminal
            scale={1.5}
            gridMul={[2, 1]}
            digitSize={1.2}
            timeScale={0.5}
            pause={false}
            scanlineIntensity={0.8}
            glitchAmount={1}
            flickerAmount={1}
            noiseAmp={1}
            chromaticAberration={0}
            dither={0}
            curvature={0.1}
            tint="#A7EF9E"
            mouseReact={true}
            mouseStrength={0.8}
            pageLoadAnimation={false}
            brightness={0.8}
          />
        </div>
      )}

      {/* Sidebar Transparente em TODAS as sessões do aplicativo */}
      {currentTab !== 'landing' && (
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}

      <main style={{
        flex: 1,
        minWidth: 0,
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
                <LandingPage onOpenApp={() => setCurrentTab('dashboard')} />
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
                  onSendToCRM={handleSendToCRM}
                  onGenerateSite={handleGenerateSite}
                />
              </PainelSimples>
            )}

            {montarLeve('wizard') && (
              <PainelKeepAlive ativo={currentTab === 'wizard'}>
                <CreateSiteWizardView
                  onClose={() => setCurrentTab('leads')}
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
                  onBack={() => setCurrentTab('leads')}
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
                <BulkWhatsAppView leads={leads} onBack={() => setCurrentTab('crm')} />
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
                <ProjectsView onGenerateSite={handleGenerateSite} />
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
      </main>

      {/* Atalho para as 4 telas do fluxo principal. Só no celular. */}
      <DockMobile currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Cursor de alvo. Só em desktop com mouse e sem reduced-motion. */}
      <CursorPersonalizado />

    </div>
  );
}
