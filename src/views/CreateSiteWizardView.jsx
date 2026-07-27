/**
 * REPASS AI - MÓDULO // CRIAR SITE (Fiel à estrutura do useleadsite.com/criar)
 * 
 * Interface limpa, intuitiva e focada na seleção rápida de leads e modelos
 * sem complexidade desnecessária.
 */

import React, { useState } from 'react';
import { Sparkles, Link as LinkIcon, Users, Lock, Zap, ChevronUp, ArrowUp, Check, Search } from 'lucide-react';

export default function CreateSiteWizardView({ leads = [], onGenerateSite, onBack }) {
  const [activeTab, setActiveTab] = useState('lead'); // 'descrever' | 'google' | 'lead'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || '');
  
  const [selectedModel, setSelectedModel] = useState('simples'); // 'simples' | 'completo' | 'sistema'
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Filtra lista de leads
  const filteredLeads = leads.filter(l => 
    (l.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.cidade || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  const handleExecuteGenerate = () => {
    if (onGenerateSite) {
      onGenerateSite(selectedLead);
    }
  };

  const modelOptions = [
    {
      id: 'simples',
      title: 'Site simples',
      icon: Zap,
      desc: 'Rápido e direto. Cria sites bonitos e focados em alta conversão.',
      locked: false
    },
    {
      id: 'completo',
      title: 'Site completo',
      icon: Sparkles,
      desc: 'A opção ideal pra sites completos, com efeitos visuais e edições ilimitadas.',
      locked: false
    },
    {
      id: 'sistema',
      title: 'Sistema Agêntico',
      icon: Zap,
      desc: 'Site completo com portal de agendamentos, pedidos e atendimento via WhatsApp.',
      locked: false
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #f4f7fb 0%, #e2e8f0 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      color: '#0f172a',
      animation: 'fadeIn 0.3s ease'
    }}>
      
      {/* Estrela/Ícone Central do Topo */}
      <div style={{ marginBottom: '20px', position: 'relative', zIndex: 10 }}>
        <div style={{
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42 Z" fill="#000000" />
          </svg>
        </div>
      </div>

      {/* Título & Subtítulo */}
      <div style={{ textAlign: 'center', maxWidth: '640px', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontSize: '34px', fontWeight: '800', fontFamily: 'var(--font-headline)', color: '#0f172a', letterSpacing: '-0.8px', margin: 0 }}>
          Site pra negócio fora da busca
        </h1>
        <p style={{ fontSize: '14.5px', color: '#64748b', marginTop: '10px', lineHeight: 1.5 }}>
          Descreva o negócio, cole um link do Google ou escolha um lead existente — sem precisar buscar primeiro
        </p>
      </div>

      {/* Card Principal Neumorphism / Glass Window */}
      <div style={{
        width: '100%',
        maxWidth: '680px',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.08), 0 8px 25px rgba(0,0,0,0.03)',
        padding: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Abas Superiores das Opções */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '14px',
          marginBottom: '20px'
        }}>
          
          {/* Aba Descrever */}
          <button 
            onClick={() => setActiveTab('descrever')}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'descrever' ? '#0070f3' : 'transparent',
              color: activeTab === 'descrever' ? '#fff' : '#64748b',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={14} /> Descrever
          </button>

          {/* Aba Link do Google */}
          <button 
            onClick={() => setActiveTab('google')}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'google' ? '#0070f3' : 'transparent',
              color: activeTab === 'google' ? '#fff' : '#64748b',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <LinkIcon size={14} /> Link do Google
          </button>

          {/* Aba Lead Existente (Ativa) */}
          <button 
            onClick={() => setActiveTab('lead')}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'lead' ? '#0070f3' : 'transparent',
              color: activeTab === 'lead' ? '#fff' : '#64748b',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={14} /> Lead existente
          </button>
        </div>

        {/* Conteúdo Interno: Busca & Seleção de Leads */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          
          {/* Campo de Busca */}
          <div style={{ position: 'relative' }}>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar lead por nome ou cidade..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                borderRadius: '14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none'
              }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Lista de Leads */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
            {filteredLeads.map(lead => {
              const isSelected = selectedLeadId === lead.id;
              const initial = (lead.nome || 'L').charAt(0).toUpperCase();

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: isSelected ? '#f1f5f9' : '#ffffff',
                    border: isSelected ? '1px solid #cbd5e1' : '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#475569'
                  }}>
                    {initial}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                      {lead.nome}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                      {lead.categoria} · {lead.cidade}
                    </div>
                  </div>

                  {isSelected && <Check size={16} color="#0070f3" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé do Card: Seletor de Modelo Pop-up & Botão Gerar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9',
          position: 'relative'
        }}>
          
          {/* Seletor de Modelo Dropdown Pop-up */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={14} color="#0070f3" />
              <span>Selecionar modelo</span>
              <ChevronUp size={14} color="#64748b" style={{ transform: isModelDropdownOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {/* Menu Pop-up de Modelos */}
            {isModelDropdownOpen && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                marginBottom: '8px',
                width: '320px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                padding: '8px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {modelOptions.map(opt => {
                  const IconComp = opt.icon;
                  const isOptSelected = selectedModel === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (!opt.locked) {
                          setSelectedModel(opt.id);
                          setIsModelDropdownOpen(false);
                        }
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: isOptSelected ? '#f8fafc' : 'transparent',
                        opacity: opt.locked ? 0.5 : 1,
                        cursor: opt.locked ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <IconComp size={16} color={isOptSelected ? '#0070f3' : '#64748b'} style={{ marginTop: '2px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {opt.title} {opt.locked && <Lock size={12} color="#94a3b8" />}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                          {opt.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Escolha um modelo pra começar
          </span>

          {/* Botão Gerar */}
          <button
            onClick={handleExecuteGenerate}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: '#0070f3',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0, 112, 243, 0.35)'
            }}
          >
            <ArrowUp size={15} /> Gerar
          </button>
        </div>

      </div>

    </div>
  );
}
