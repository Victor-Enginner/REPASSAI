import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  Kanban, 
  Cpu, 
  Calendar, 
  FolderKanban, 
  CreditCard, 
  Trophy, 
  LayoutTemplate, 
  PlusCircle,
  MessageSquare,
  Sparkles,
  Zap,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import logoOrb from '../assets/repass_logo_orb.jpg';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const [hoveredTab, setHoveredTab] = useState(null);

  const menuItems = [
    { id: 'dashboard', label: 'PAINEL_01', icon: LayoutDashboard, badge: null },
    { id: 'leads', label: 'LEADS_OSINT_02', icon: Search, badge: 'OSINT' },
    { id: 'crm', label: 'CRM_VENDAS_03', icon: Kanban, badge: null },
    { id: 'bulk_whatsapp', label: 'DISPARO_WHATSAPP_04', icon: MessageSquare, badge: 'HOT', highlight: true },
    { id: 'engine', label: 'MOTOR_DE_IA_05', icon: Cpu, badge: 'PRO', highlight: true },
    { id: 'agendamentos', label: 'AGENDA_06', icon: Calendar, badge: null },
    { id: 'projetos', label: 'PROJETOS_07', icon: FolderKanban, badge: null },
    { id: 'cobrar', label: 'FATURAMENTO_08', icon: CreditCard, badge: null },
    { id: 'ranking', label: 'RANKING_09', icon: Trophy, badge: null },
    { id: 'templates', label: 'TEMPLATES_10', icon: LayoutTemplate, badge: null },
    { id: 'editor', label: 'CRIAR_SITE_11', icon: PlusCircle, badge: 'NEW' }
  ];

  return (
    <aside className="sidebar-container" style={{
      width: '260px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 0,
      zIndex: 40,
      flexShrink: 0,
      background: 'rgba(9, 10, 15, 0.92)',
      backdropFilter: 'blur(20px)',
      borderRight: '0.5px solid rgba(255, 255, 255, 0.1)',
      userSelect: 'none'
    }}>
      <div>
        
        {/* Brand Header com a Logo da Imagem ao lado do texto REPASS AI */}
        <motion.div 
          onClick={() => setCurrentTab('landing')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          style={{
            height: '72px',
            padding: '0 20px',
            borderBottom: '0.5px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={logoOrb} 
              alt="REPASS AI" 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
            <span className="font-headline" style={{ fontSize: '18px', color: '#ffffff', letterSpacing: '-0.5px', fontWeight: '800' }}>
              REPASS
            </span>
          </div>

          <span className="mono-label" style={{ 
            fontSize: '9px', 
            color: '#6366f1', 
            background: 'rgba(99, 102, 241, 0.12)', 
            padding: '3px 8px', 
            borderRadius: '12px',
            border: '0.5px solid rgba(99, 102, 241, 0.25)',
            fontFamily: 'var(--font-mono)'
          }}>
            VERSÃO_BETA
          </span>
        </motion.div>

        {/* Navigation Menu com Indicador Indigo Clássico */}
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '12px 8px', gap: '2px', position: 'relative' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isHovered = hoveredTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  outline: 'none',
                  zIndex: 1
                }}
              >
                {/* Active Gliding Pill Background Animation */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)',
                      borderLeft: '3px solid #6366f1',
                      borderRadius: '4px',
                      zIndex: -1,
                      boxShadow: 'inset 0 0 12px rgba(99, 102, 241, 0.15)'
                    }}
                  />
                )}

                {/* Hover Glow Effect */}
                {!isActive && isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: '4px',
                      zIndex: -1
                    }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon 
                    size={16} 
                    color={isActive ? '#6366f1' : (item.highlight ? '#38bdf8' : '#94a3b8')} 
                    style={{
                      transition: 'color 0.2s ease, transform 0.2s ease',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                  <span style={{ 
                    fontSize: '11.5px', 
                    fontFamily: 'var(--font-mono)',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#ffffff' : (isHovered ? '#f1f5f9' : '#cbd5e1'),
                    letterSpacing: '0.2px',
                    transition: 'color 0.2s ease'
                  }}>
                    {item.label}
                  </span>
                </div>

                {/* Badge Indicator */}
                {item.badge && (
                  <span style={{
                    fontSize: '8.5px',
                    fontWeight: '800',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: item.badge === 'PRO' ? 'rgba(236, 72, 153, 0.2)' : (item.badge === 'OSINT' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(99, 102, 241, 0.2)'),
                    color: item.badge === 'PRO' ? '#ec4899' : (item.badge === 'OSINT' ? '#38bdf8' : '#a5b4fc'),
                    border: `0.5px solid ${item.badge === 'PRO' ? 'rgba(236, 72, 153, 0.4)' : (item.badge === 'OSINT' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(99, 102, 241, 0.4)')}`
                  }}>
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Upgrade Footer Card Português BR */}
      <div style={{ padding: '14px', borderTop: '0.5px solid rgba(255, 255, 255, 0.1)' }}>
        <motion.div 
          onClick={() => setCurrentTab('engine')}
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
            border: '0.5px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={14} color="#ec4899" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              REPASS PRO // ACESSO ILIMITADO
            </span>
          </div>

          <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            Varredura OSINT ilimitada & motor de IA 60fps sem bloqueios.
          </p>

          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#6366f1', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
            <span>ATIVAR AGORA</span>
            <ChevronRight size={12} />
          </div>
        </motion.div>
      </div>
    </aside>
  );
}
