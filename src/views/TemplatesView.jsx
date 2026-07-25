import React from 'react';
import { LayoutTemplate, Sparkles, ArrowRight, Check, Eye, ExternalLink, Code2, Layers, Palette } from 'lucide-react';
import { ASSET_LIBRARIES_CATALOG } from '../services/componentRegistry';

export default function TemplatesView({ onSelectTemplate }) {
  const templates = [
    {
      id: 'template_restaurante',
      title: 'Gastronomia & Delivery VIP',
      nicho: 'Restaurante / Marmitaria',
      color: '#ef4444',
      badge: 'LetterGlitch + Magic Card',
      desc: 'Ideal para restaurantes, pizzarias e marmitarias artesanais com foco em pedidos rápidos via WhatsApp.'
    },
    {
      id: 'template_barbearia',
      title: 'Barbearia Cyber Dark',
      nicho: 'Barbearia & Estética Masculina',
      color: '#0070f3',
      badge: 'FaultyTerminal WebGL + Glass Card',
      desc: 'Design escuro e moderno para barbearias premium com botão de agendamento rápido sem fila.'
    },
    {
      id: 'template_salao',
      title: 'Estética & Beleza Premium',
      nicho: 'Salão de Beleza / Estética',
      color: '#ec4899',
      badge: 'Soft Aurora + Border Beam',
      desc: 'Layout sofisticado com galeria de procedimentos e prova social integrada.'
    },
    {
      id: 'template_academia',
      title: 'Fitness & Performance',
      nicho: 'Academia / Crossfit / Pilates',
      color: '#f59e0b',
      badge: 'Meteors Stream + Shimmer Button',
      desc: 'Página de alta energia para academias com tabela de planos e chamada para aula experimental.'
    },
    {
      id: 'template_mecanica',
      title: 'Auto Center & Resgate',
      nicho: 'Oficina Mecânica / Auto',
      color: '#38bdf8',
      badge: 'Dark Veil + Tilted Cards',
      desc: 'Foco total em orçamento rápido via WhatsApp e serviços de emergência 24h.'
    },
    {
      id: 'template_odonto',
      title: 'Saúde & Odontologia VIP',
      nicho: 'Clínica Odontológica / Saúde',
      color: '#22c55e',
      badge: 'Clean Glass + Scroll Journey Line',
      desc: 'Aparência corporativa e confiável para dentistas e médicos com agendamento de consultas.'
    }
  ];

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="mono-label">MODULE // TEMPLATES_PRO_10</span>
          <h1 className="font-headline" style={{ fontSize: '32px', color: '#ffffff', marginTop: '4px' }}>
            BIBLIOTECA DE TEMPLATES PRO & ARSENAL DE ASSETS
          </h1>
          <p style={{ fontSize: '13.5px', color: '#94a3b8', marginTop: '4px' }}>
            Modelos de alta conversão pré-configurados com o arsenal React Bits, Magic UI, 21st.dev e Uiverse
          </p>
        </div>

        <div style={{ background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.12)', padding: '10px 18px', borderRadius: '4px' }}>
          <span className="mono-label" style={{ color: '#6366f1' }}>6 TEMPLATES PRONTOS · 150+ ASSETS INTEGRADOS</span>
        </div>
      </div>

      {/* Arsenal de Referências Dev & Designer */}
      <div style={{ marginBottom: '40px' }}>
        <h2 className="font-headline" style={{ fontSize: '18px', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#6366f1" /> Arsenal de Referências & Galeria de Componentes Integrais
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {ASSET_LIBRARIES_CATALOG.map((lib) => (
            <a
              key={lib.id}
              href={lib.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel"
              style={{
                padding: '16px',
                background: '#0a0e1a',
                border: '0.5px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="mono-label" style={{ color: '#38bdf8', fontSize: '10px' }}>{lib.count}</span>
                  <ExternalLink size={12} color="#94a3b8" />
                </div>
                <h3 className="font-headline" style={{ fontSize: '15px', color: '#ffffff', marginBottom: '4px' }}>
                  {lib.name}
                </h3>
                <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                  {lib.desc}
                </p>
              </div>
              <div style={{ marginTop: '12px', fontSize: '10px', color: '#6366f1', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                {lib.url.replace('https://', '')} ↗
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <h2 className="font-headline" style={{ fontSize: '18px', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={18} color="#ec4899" /> Templates Pré-Construídos para Negócios Locais
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {templates.map(tpl => (
          <div 
            key={tpl.id}
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              height: '320px',
              background: '#0a0e1a',
              border: '0.5px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="mono-label" style={{ color: tpl.color }}>{tpl.badge}</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{tpl.nicho}</span>
              </div>

              <h3 className="font-headline" style={{ fontSize: '20px', color: '#ffffff', marginBottom: '8px' }}>
                {tpl.title}
              </h3>

              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                {tpl.desc}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => onSelectTemplate(tpl)}
                className="btn-primary" 
                style={{ flex: 1, justifyContent: 'center', fontSize: '11px', borderRadius: '4px' }}
              >
                <Sparkles size={13} /> Usar Template
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
