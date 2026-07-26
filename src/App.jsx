import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './views/LandingPage';
import DashboardView from './views/DashboardView';
import LeadsView from './views/LeadsView';
import CreateSiteWizardView from './views/CreateSiteWizardView';
import SiteEditorView from './views/SiteEditorView';
import CRMView from './views/CRMView';
import AIEngineView from './views/AIEngineView';
import BulkWhatsAppView from './views/BulkWhatsAppView';
import TemplatesView from './views/TemplatesView';
import ProjectsView from './views/ProjectsView';
import AppointmentsView from './views/AppointmentsView';
import BillingView from './views/BillingView';
import AffiliateView from './views/AffiliateView';
import FaultyTerminal from './components/ui/FaultyTerminal';
import { INITIAL_LEADS } from './mock/leadsData';

export default function App() {
  const [currentTab, setCurrentTab] = useState('landing');
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [selectedLeadForEditor, setSelectedLeadForEditor] = useState(null);

  const handleSendToCRM = (leadId) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status_crm: 'Abordados' } : l));
    setCurrentTab('crm');
  };

  const handleGenerateSite = (lead) => {
    setSelectedLeadForEditor(lead);
    setCurrentTab('editor');
  };

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
        {currentTab === 'landing' && (
          <LandingPage onOpenApp={() => setCurrentTab('dashboard')} />
        )}

        {/* System Keep-Alive Tab Cache - Transição instantânea 0ms de troca de abas sem recarregar o DOM */}
        {currentTab !== 'landing' && (
          <>
            <div style={{ display: currentTab === 'dashboard' ? 'block' : 'none' }}>
              <DashboardView 
                leads={leads} 
                onNavigateLeads={() => setCurrentTab('leads')} 
                onNavigateCRM={() => setCurrentTab('crm')} 
              />
            </div>

            <div style={{ display: currentTab === 'leads' ? 'block' : 'none' }}>
              <LeadsView 
                leads={leads} 
                onSendToCRM={handleSendToCRM} 
                onGenerateSite={handleGenerateSite} 
              />
            </div>

            <div style={{ display: currentTab === 'wizard' ? 'block' : 'none' }}>
              <CreateSiteWizardView 
                onClose={() => setCurrentTab('leads')}
                onGenerate={(customLead) => {
                  setSelectedLeadForEditor(customLead);
                  setCurrentTab('editor');
                }}
              />
            </div>

            <div style={{ display: currentTab === 'editor' ? 'block' : 'none' }}>
              <SiteEditorView 
                lead={selectedLeadForEditor} 
                onBack={() => setCurrentTab('leads')} 
              />
            </div>

            <div style={{ display: currentTab === 'crm' ? 'block' : 'none' }}>
              <CRMView 
                leads={leads} 
                setLeads={setLeads} 
                onGenerateSite={handleGenerateSite} 
              />
            </div>

            <div style={{ display: currentTab === 'engine' ? 'block' : 'none' }}>
              <AIEngineView />
            </div>

            <div style={{ display: currentTab === 'bulk_whatsapp' ? 'block' : 'none' }}>
              <BulkWhatsAppView leads={leads} onBack={() => setCurrentTab('crm')} />
            </div>

            <div style={{ display: currentTab === 'templates' ? 'block' : 'none' }}>
              <TemplatesView 
                onSelectTemplate={(tpl) => {
                  setSelectedLeadForEditor({ id: tpl.id, nome: tpl.title, categoria: tpl.nicho, cidade: 'Goiânia' });
                  setCurrentTab('editor');
                }} 
              />
            </div>

            <div style={{ display: currentTab === 'projetos' ? 'block' : 'none' }}>
              <ProjectsView onGenerateSite={handleGenerateSite} />
            </div>

            <div style={{ display: currentTab === 'agendamentos' ? 'block' : 'none' }}>
              <AppointmentsView />
            </div>

            <div style={{ display: currentTab === 'cobrar' ? 'block' : 'none' }}>
              <BillingView />
            </div>

            <div style={{ display: currentTab === 'ranking' ? 'block' : 'none' }}>
              <AffiliateView />
            </div>
          </>
        )}
      </main>

    </div>
  );
}
