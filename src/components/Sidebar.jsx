/**
 * REPASS AI - Navegação lateral.
 *
 * COMPORTAMENTO RESPONSIVO
 * ------------------------
 * Acima de 1024px: coluna fixa de 260px, como sempre foi.
 *
 * Abaixo disso: vira GAVETA. A largura fixa de 260px ocupava 69% de uma
 * tela de 375px, sobrando 115px para o conteúdo — e os cards de lead
 * renderizavam com 50px de largura. O público final deste produto (dono de
 * barbearia, restaurante, salão) abre link no celular, então a tela
 * precisava ser dele, não da navegação.
 *
 * A gaveta fecha ao navegar, ao tocar fora e no Esc.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import logoOrb from '../assets/repass_logo_orb.jpg';
import { useEhMobile } from '../hooks/useMediaQuery';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const [hoveredTab, setHoveredTab] = useState(null);
  const ehMobile = useEhMobile();
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const botaoAbrirRef = useRef(null);

  useEffect(() => {
    if (!ehMobile) setGavetaAberta(false);
  }, [ehMobile]);

  useEffect(() => {
    if (!gavetaAberta) return undefined;
    const aoTeclar = (e) => {
      if (e.key === 'Escape') {
        setGavetaAberta(false);
        botaoAbrirRef.current?.focus();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [gavetaAberta]);

  useEffect(() => {
    if (!ehMobile) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = gavetaAberta ? 'hidden' : original;
    return () => { document.body.style.overflow = original; };
  }, [gavetaAberta, ehMobile]);

  const navegar = (id) => {
    setCurrentTab(id);
    if (ehMobile) setGavetaAberta(false);
  };

  const menuItems = [
    { id: 'dashboard',     nome: 'Painel',            indice: '01', icon: LayoutDashboard, badge: null },
    { id: 'leads',         nome: 'Scanner de Leads',  indice: '02', icon: Search,          badge: 'OSINT' },
    { id: 'crm',           nome: 'Funil de Vendas',   indice: '03', icon: Kanban,          badge: null },
    { id: 'bulk_whatsapp', nome: 'Abordagem 1-a-1',  indice: '04', icon: MessageSquare,   badge: 'EM BREVE', highlight: false },
    { id: 'engine',        nome: 'Motor Neural',      indice: '05', icon: Cpu,             badge: 'PRO', highlight: true },
    { id: 'agendamentos',  nome: 'Agenda',            indice: '06', icon: Calendar,        badge: null },
    { id: 'projetos',      nome: 'Meus Sites',        indice: '07', icon: FolderKanban,    badge: null },
    { id: 'cobrar',        nome: 'Faturamento',       indice: '08', icon: CreditCard,      badge: null },
    { id: 'ranking',       nome: 'Indicações',        indice: '09', icon: Trophy,          badge: null },
    { id: 'templates',     nome: 'Loja de Templates', indice: '10', icon: LayoutTemplate,  badge: null },
    { id: 'wizard',        nome: 'Criar Site',        indice: '11', icon: PlusCircle,      badge: 'NEW' }
  ];

  const estiloAside = ehMobile
    ? {
        width: '272px',
        maxWidth: '85vw',
        height: '100dvh',
        position: 'fixed',
        top: 0,
        left: 0,
        transform: gavetaAberta ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.26s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 60,
        background: 'var(--bg-sidebar)',
        boxShadow: gavetaAberta ? '4px 0 32px rgba(0,0,0,0.8)' : 'none',
      }
    : {
        width: '260px',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        flexShrink: 0,
        background: 'var(--bg-sidebar)',
        zIndex: 40,
      };

  return (
    <>
      {/* Botão de abrir — móvel */}
      {ehMobile && !gavetaAberta && (
        <button
          ref={botaoAbrirRef}
          onClick={() => setGavetaAberta(true)}
          aria-label="Abrir menu de navegação"
          aria-expanded={false}
          style={{
            position: 'fixed',
            top: '14px',
            left: '14px',
            zIndex: 55,
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 14, 26, 0.94)',
            border: '0.5px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '10px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 18px rgba(0,0,0,0.45)',
          }}
        >
          <Menu size={21} color="#ffffff" />
        </button>
      )}

      {/* Overlay móvel */}
      {ehMobile && gavetaAberta && (
        <div
          onClick={() => setGavetaAberta(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 55,
          }}
        />
      )}

    <aside
      className="sidebar-container"
      aria-label="Navegação principal"
      aria-hidden={ehMobile && !gavetaAberta}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        borderRight: '0.5px solid rgba(255, 255, 255, 0.08)',
        userSelect: 'none',
        overflow: 'hidden',
        ...estiloAside,
      }}
    >
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {ehMobile && (
          <button
            onClick={() => setGavetaAberta(false)}
            aria-label="Fechar menu de navegação"
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              zIndex: 2,
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={20} color="#94a3b8" />
          </button>
        )}
        
        {/* Brand Header */}
        <motion.div 
          onClick={() => navegar('landing')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          style={{
            height: '68px',
            padding: '0 18px',
            borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={logoOrb} 
              alt="REPASS AI" 
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
            <span className="font-headline" style={{ fontSize: '17px', color: 'var(--fg-white)', letterSpacing: '-0.5px', fontWeight: '800' }}>
              REPASS
            </span>
          </div>

          <span className="mono-label" style={{ 
            fontSize: '8.5px', 
            color: 'var(--accent-indigo)', 
            background: 'rgba(99, 102, 241, 0.12)', 
            padding: '3px 8px', 
            borderRadius: '12px',
            border: '0.5px solid rgba(99, 102, 241, 0.25)',
            fontFamily: 'var(--font-mono)'
          }}>
            VERSÃO_BETA
          </span>
        </motion.div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '10px 8px', gap: '2px', position: 'relative', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isHovered = hoveredTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => navegar(item.id)}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: ehMobile ? '46px' : '40px',
                  padding: '0 10px',
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
                      background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0.04) 100%)',
                      borderLeft: '3px solid #6366f1',
                      borderRadius: '4px',
                      zIndex: -1,
                      boxShadow: 'inset 0 0 12px rgba(99, 102, 241, 0.12)'
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

                {/* Left: Icon + Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <Icon 
                    size={16} 
                    color={isActive ? '#818cf8' : (item.highlight ? '#38bdf8' : '#64748b')} 
                    style={{
                      flexShrink: 0,
                      transition: 'color 0.2s ease, transform 0.2s ease',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)'
                    }}
                  />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#ffffff' : (isHovered ? '#f1f5f9' : '#cbd5e1'),
                    letterSpacing: '-0.01em',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.nome}
                  </span>
                </div>

                {/* Right: Badge & Index */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '6px' }}>
                  {item.badge && (
                    <span style={{
                      fontSize: '8px',
                      fontWeight: '800',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      background: item.badge === 'PRO' ? 'rgba(236, 72, 153, 0.2)' : (item.badge === 'OSINT' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(99, 102, 241, 0.2)'),
                      color: item.badge === 'PRO' ? '#ec4899' : (item.badge === 'OSINT' ? '#38bdf8' : '#a5b4fc'),
                      border: `0.5px solid ${item.badge === 'PRO' ? 'rgba(236, 72, 153, 0.4)' : (item.badge === 'OSINT' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(99, 102, 241, 0.4)')}`
                    }}>
                      {item.badge}
                    </span>
                  )}

                  <span style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: isActive ? '#818cf8' : '#475569',
                    opacity: isActive ? 0.9 : 0.4,
                    letterSpacing: '0.05em',
                    transition: 'color 0.2s ease'
                  }}>
                    {item.indice}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Upgrade Footer Card */}
      <div style={{ padding: '12px', borderTop: '0.5px solid rgba(255, 255, 255, 0.08)', flexShrink: 0 }}>
        <motion.div 
          onClick={() => navegar('engine')}
          whileHover={{ scale: 1.01, translateY: -1 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(236, 72, 153, 0.12) 100%)',
            border: '0.5px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Sparkles size={13} color="#ec4899" />
            <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--fg-white)', fontFamily: 'var(--font-mono)' }}>
              REPASS PRO // ACESSO ILIMITADO
            </span>
          </div>

          <p style={{ fontSize: '10px', color: 'var(--fg-muted)', margin: 0, lineHeight: 1.4 }}>
            Varredura OSINT ilimitada & motor de IA 60fps sem bloqueios.
          </p>

          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--accent-indigo-claro)', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
            <span>ATIVAR AGORA</span>
            <ChevronRight size={12} />
          </div>
        </motion.div>
      </div>
    </aside>
    </>
  );
}
