import React from 'react';
import { ShieldCheck, Zap, Star, ArrowRight, CheckCircle2, Image as ImageIcon } from 'lucide-react';

/**
 * OriginKit Bento Grid - Cartões Neomórficos & UI Avançada
 */
export function OriginKitBentoGrid({ items = [] }) {
  const defaultItems = [
    { icon: "⚡", title: "Atendimento Imediato", desc: "Orçamentos e agendamentos diretos no WhatsApp sem espera." },
    { icon: "⭐", title: "Nota 4.8 / 5.0", desc: "Empresa altamente recomendada por clientes da região." },
    { icon: "🛡️", title: "Garantia de Qualidade", desc: "Equipe qualificada e compromisso total com a satisfação." }
  ];

  const list = items.length > 0 ? items : defaultItems;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      margin: '32px 0'
    }}>
      {list.map((item, idx) => (
        <div 
          key={idx}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            transition: 'transform 0.2s ease, border-color 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>{item.title}</h4>
          <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5 }}>{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * GallerySection - Renderização Inteligente de Fotos do Google Business / Media RAG Fallback
 */
export function GallerySection({ images = [], backupPrompt = "Ambiente Real" }) {
  const defaultImages = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80"
  ];

  const displayImages = images && images.length > 0 ? images : defaultImages;

  return (
    <section style={{ padding: '48px 24px', background: 'rgba(9, 10, 15, 0.95)', borderTop: '0.5px solid rgba(255,255,255,0.1)', borderBottom: '0.5px solid rgba(255,255,255,0.1)', margin: '40px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          ● MÍDIA REAL // GOOGLE BUSINESS
        </span>
        <h2 className="font-headline" style={{ fontSize: '28px', color: '#ffffff', marginTop: '6px' }}>
          Conheça Nosso Ambiente
        </h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
          {backupPrompt}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        {displayImages.map((src, index) => (
          <div 
            key={index} 
            style={{ 
              overflow: 'hidden', 
              borderRadius: '12px', 
              border: '0.5px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              height: '180px',
              position: 'relative'
            }}
          >
            <img 
              src={src} 
              alt={`Ambiente Real ${index + 1}`} 
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
