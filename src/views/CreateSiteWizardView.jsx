import React, { useState } from 'react';
import { Sparkles, Link as LinkIcon, Users, Lock, Zap, ChevronUp, ArrowUp, Check } from 'lucide-react';

export default function CreateSiteWizardView({ leads, onProceedToEditor }) {
  const [activeTab, setActiveTab] = useState('lead'); // 'descrever' | 'google' | 'lead'
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || '');
  const [descriptionText, setDescriptionText] = useState('');
  const [googleLink, setGoogleLink] = useState('');
  
  const [selectedModel, setSelectedModel] = useState('simples'); // 'simples' | 'completo' | 'sistema'
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(true); // Open by default as in screenshot

  const handleGenerate = () => {
    let targetLead = leads.find(l => l.id === selectedLeadId) || leads[0];

    if (activeTab === 'descrever' && descriptionText) {
      targetLead = {
        ...targetLead,
        nome: descriptionText.split('\n')[0] || "Novo Negócio",
        orientacao: descriptionText
      };
    }

    onProceedToEditor(targetLead);
  };

  const modelOptions = [
    {
      id: 'simples',
      title: 'Site simples',
      icon: Zap,
      desc: 'Rápido e econômico. Cria sites bonitos e diretos, ótimo pra começar.',
      locked: false
    },
    {
      id: 'completo',
      title: 'Site completo',
      icon: Sparkles,
      desc: 'A opção ideal pra sites bonitos, com edições precisas e inúmeras possibilidades de efeitos.',
      locked: false // Desbloqueado no nosso motor sem limites!
    },
    {
      id: 'sistema',
      title: 'Sistema',
      icon: Lock,
      desc: 'Utilize quando precisar de um site completo que também contenha portal administrativo para seu cliente gerenciar agendamentos, pedidos, reservas e outros.',
      locked: false // Desbloqueado no nosso motor sem limites!
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #f0f7ff 0%, #e2ecf7 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      animation: 'fadeIn 0.3s ease'
    }}>
      
      {/* Background Particles Grid */}
      <div className="bg-particles" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />

      {/* Center Top Logo */}
      <div style={{ marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <div className="animate-glow" style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
          border: '1px solid rgba(0, 112, 243, 0.2)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 16px 36px rgba(0, 112, 243, 0.15)'
        }}>
          <Sparkles size={38} color="#0f172a" />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div style={{ textAlign: 'center', maxWidth: '680px', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontSize: '38px', fontWeight: '800', fontFamily: 'var(--font-display)', color: '#0f172a', letterSpacing: '-0.8px' }}>
          Site pra negócio fora da busca
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px', lineHeight: 1.5 }}>
          Descreva o negócio, cole um link do Google ou escolha um lead existente — sem precisar buscar primeiro
        </p>
      </div>

      {/* Central Interactive Wizard Window (Matching input_file_0.png & input_file_1.png) */}
      <div style={{
        width: '100%',
        maxWidth: '720px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.95)',
        boxShadow: '0 30px 70px -15px rgba(0, 70, 150, 0.12), 0 10px 30px rgba(0,0,0,0.03)',
        padding: '16px',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Top Segmented Tabs Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          background: '#e2e8f0',
          padding: '4px',
          borderRadius: '16px',
          marginBottom: '20px'
        }}>
          
          <button 
            onClick={() => setActiveTab('descrever')}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'descrever' ? '#0070f3' : 'transparent',
              color: activeTab === 'descrever' ? '#fff' : '#64748b',
              fontSize: '13px',
              fontWeight: '700',
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

          <button 
            onClick={() => setActiveTab('google')}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'google' ? '#0070f3' : 'transparent',
              color: activeTab === 'google' ? '#fff' : '#64748b',
              fontSize: '13px',
              fontWeight: '700',
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

          <button 
            onClick={() => setActiveTab('lead')}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'lead' ? '#0070f3' : '#transparent',
              color: activeTab === 'lead' ? '#fff' : '#64748b',
              fontSize: '13px',
              fontWeight: '700',
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

        {/* Tab Content Box */}
        <div style={{ padding: '0 8px 16px 8px', minHeight: '140px' }}>
          
          {activeTab === 'lead' && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                Selecione o Lead para Gerar o Site:
              </label>
              <select 
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: '#fff',
                  color: '#0f172a',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.nome} — {lead.categoria} ({lead.cidade}, {lead.estado})
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'descrever' && (
            <div>
              <textarea 
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                placeholder="Descreva o negócio em poucas palavras. Ex: Barbearia Vip com agendamento de cabelo e barba em São Paulo..."
                style={{
                  width: '100%',
                  height: '110px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'none'
                }}
              />
            </div>
          )}

          {activeTab === 'google' && (
            <div>
              <input 
                type="text"
                value={googleLink}
                onChange={(e) => setGoogleLink(e.target.value)}
                placeholder="Cole a URL do perfil do Google Maps (ex: https://maps.google.com/?cid=...)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px'
                }}
              />
            </div>
          )}

        </div>

        {/* Model Selector Popup Dropdown (Matching exact design input_file_1.png) */}
        {isModelDropdownOpen && (
          <div style={{
            position: 'absolute',
            bottom: '70px',
            left: '20px',
            width: '320px',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px -10px rgba(0, 50, 120, 0.15)',
            padding: '14px',
            zIndex: 50,
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {modelOptions.map(m => {
                const Icon = m.icon;
                const isSelected = selectedModel === m.id;
                return (
                  <div 
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setIsModelDropdownOpen(false);
                    }}
                    style={{
                      background: isSelected ? '#f8fafc' : '#transparent',
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #0070f3' : '1px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon size={16} color={isSelected ? '#0070f3' : '#475569'} />
                      <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>{m.title}</h4>
                      {m.locked && <Lock size={12} color="#94a3b8" />}
                    </div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                      {m.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Action Bar inside Card */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9'
        }}>
          
          <button 
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: '700',
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} color="#0070f3" />
            Selecionar modelo <ChevronUp size={14} />
          </button>

          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Escolha um modelo pra começar
          </span>

          <button 
            onClick={handleGenerate}
            className="btn-primary" 
            style={{ padding: '9px 22px', fontSize: '13.5px' }}
          >
            <ArrowUp size={16} /> Gerar
          </button>

        </div>

      </div>

    </div>
  );
}
