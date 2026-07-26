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
      
      {/* Background Matrix Grid Fixo Global - Sangra atrás da Sidebar Transparente em TODAS as abas */}
      {currentTab !== 'landing' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(to right, rgba(34, 197, 94, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 197, 94, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          opacity: 0.85
        }}>
          {/* Radial Ambient Dark Blur Gradient */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 15% 25%, rgba(34, 197, 94, 0.08) 0%, rgba(5, 7, 15, 0.85) 60%, rgba(5, 7, 15, 0.98) 100%)'
          }} />
        </div>
      )}

      {/* Sidebar Transparente em TODAS as sessões do aplicativo */}
      {currentTab !== 'landing' && (
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}

      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        {currentTab === 'landing' && (
          <LandingPage onOpenApp={() => setCurrentTab('dashboard')} />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView 
            leads={leads} 
            onNavigateLeads={() => setCurrentTab('leads')} 
            onNavigateCRM={() => setCurrentTab('crm')} 
          />
        )}

        {currentTab === 'leads' && (
          <LeadsView 
            leads={leads} 
            onSendToCRM={handleSendToCRM} 
            onGenerateSite={handleGenerateSite} 
          />
        )}

        {currentTab === 'wizard' && (
          <CreateSiteWizardView 
            onClose={() => setCurrentTab('leads')}
            onGenerate={(customLead) => {
              setSelectedLeadForEditor(customLead);
              setCurrentTab('editor');
            }}
          />
        )}

        {currentTab === 'editor' && (
          <SiteEditorView 
            lead={selectedLeadForEditor} 
            onBack={() => setCurrentTab('leads')} 
          />
        )}

        {currentTab === 'crm' && (
          <CRMView 
            leads={leads} 
            setLeads={setLeads} 
            onGenerateSite={handleGenerateSite} 
          />
        )}

        {currentTab === 'engine' && (
          <AIEngineView />
        )}

        {currentTab === 'bulk_whatsapp' && (
          <BulkWhatsAppView leads={leads} onBack={() => setCurrentTab('crm')} />
        )}

        {currentTab === 'templates' && (
          <TemplatesView 
            onSelectTemplate={(tpl) => {
              setSelectedLeadForEditor({ id: tpl.id, nome: tpl.title, categoria: tpl.nicho, cidade: 'Goiânia' });
              setCurrentTab('editor');
            }}
          />
        )}

        {currentTab === 'projetos' && (
          <ProjectsView onEditSite={handleGenerateSite} />
        )}

        {currentTab === 'agendamentos' && (
          <AppointmentsView leads={leads} />
        )}

        {currentTab === 'cobrar' && (
          <BillingView />
        )}

        {currentTab === 'afiliado' && (
          <AffiliateView />
        )}
      </main>

    </div>
  );
}
