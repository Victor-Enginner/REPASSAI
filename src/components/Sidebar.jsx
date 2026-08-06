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
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import logoOrb from '../assets/repass_logo_orb.jpg';
import { useEhMobile } from '../hooks/useMediaQuery';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const { theme, toggleTheme } = useTheme();
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
        boxShadow: gavetaAberta ? 'var(--sombra-md)' : 'none',
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
            background: 'var(--vidro-fundo)',
            backdropFilter: 'var(--vidro-blur)',
            WebkitBackdropFilter: 'var(--vidro-blur)',
            border: 'none',
            borderRadius: 'var(--raio-md)',
            cursor: 'pointer',
            boxShadow: 'var(--vidro-brilho), var(--sombra-md)',
          }}
        >
          <Menu size={21} color="var(--tinta)" />
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
            // Scrim mais leve no claro: 70% de preto sobre papel parece
            // apagão, não sobreposição.
            background: 'rgba(17, 17, 17, 0.45)',
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
        borderRight: '0.5px solid var(--sobre-08)',
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
            <X size={20} color="var(--tinta-media)" />
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
            borderBottom: '0.5px solid var(--sobre-08)',
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
            color: 'var(--tinta-media)',
            background: 'var(--sobre-08)',
            padding: '3px 8px',
            borderRadius: 'var(--raio-pill)',
            border: '0.5px solid var(--aro-cor)',
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
                      // Véu iridescente + fio da marca na borda esquerda,
                      // no lugar do gradiente índigo chapado.
                      background: 'var(--iris-veil)',
                      borderRadius: 'var(--raio-sm)',
                      zIndex: -1,
                      boxShadow: 'inset 3px 0 0 0 var(--iris-violeta)'
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
                      background: 'var(--sobre-04)',
                      borderRadius: '4px',
                      zIndex: -1
                    }}
                  />
                )}

                {/* Left: Icon + Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <Icon 
                    size={16} 
                    color={isActive ? 'var(--accent-indigo)' : (item.highlight ? 'var(--iris-azul)' : 'var(--tinta-fraca)')}
                    style={{
                      flexShrink: 0,
                      transition: 'color 0.2s ease, transform 0.2s ease',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)'
                    }}
                  />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    // Era #cbd5e1 fixo: slate claro, escrito para fundo
                    // escuro. Sobre papel dava 1.41 de contraste.
                    color: isActive || isHovered ? 'var(--tinta)' : 'var(--tinta-media)',
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
                      fontWeight: '500',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.1em',
                      padding: '3px 6px',
                      borderRadius: 'var(--raio-sm)',
                      /*
                        Antes: três cores saturadas diferentes (rosa, ciano,
                        índigo), cada uma sobre o próprio fundo a 20% — o que
                        dava 1.00 de contraste, texto da cor exata do fundo.

                        Agora: tinta sobre véu neutro. Só 'PRO' recebe o véu
                        iridescente, porque é o único que precisa puxar o
                        olho. Etiqueta é rótulo, não semáforo.
                      */
                      background: item.badge === 'PRO' ? 'var(--iris-veil)' : 'var(--sobre-08)',
                      color: 'var(--tinta-media)',
                      border: 'none'
                    }}>
                      {item.badge}
                    </span>
                  )}

                  <span style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    // --tinta-fantasma (24%) dava 1.70 de contraste: o
                    // numerador sumia. Fantasma serve para aro e divisor,
                    // não para texto.
                    color: isActive ? 'var(--accent-indigo)' : 'var(--tinta-fraca)',
                    opacity: 1,
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

      {/* Theme Switcher Control */}
      <div style={{ padding: '8px 12px 0', flexShrink: 0 }}>
        <button
          onClick={toggleTheme}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            // Era `justify` — propriedade que não existe em CSS, então o
            // rótulo "ALTERAR" nunca chegava à direita.
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'var(--vidro-fundo)',
            backdropFilter: 'var(--vidro-blur)',
            WebkitBackdropFilter: 'var(--vidro-blur)',
            boxShadow: 'var(--vidro-brilho)',
            border: 'none',
            borderRadius: 'var(--raio-md)',
            color: 'var(--tinta)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: 'var(--tracking-rotulo)',
            cursor: 'pointer',
            marginBottom: '8px',
            transition: 'background var(--dur-quick) var(--ease-marca)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {theme === 'light' ? <Sun size={14} color="var(--iris-dourado)" /> : <Moon size={14} color="var(--iris-lilas)" />}
            <span style={{ fontWeight: 500 }}>{theme === 'light' ? 'MODO CLARO' : 'MODO ESCURO'}</span>
          </div>
          <span style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase' }}>ALTERAR</span>
        </button>
      </div>

      {/* Upgrade Footer Card */}
      <div style={{ padding: '0 12px 12px', flexShrink: 0 }}>
        <motion.div 
          onClick={() => navegar('engine')}
          whileHover={{ scale: 1.01, translateY: -1 }}
          whileTap={{ scale: 0.98 }}
          style={{
            // Véu iridescente da marca, no lugar do gradiente índigo→rosa.
            background: 'var(--iris-veil)',
            border: '0.5px solid var(--aro-cor)',
            borderRadius: 'var(--raio-md)',
            padding: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Sparkles size={13} color="var(--iris-violeta)" />
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
