/**
 * REPASS AI - Navegação Lateral Moderna com Categorias e Command Palette.
 *
 * Estrutura visual baseada nas imagens de referência:
 * - Cabeçalho: Victor Borsari + Workspace
 * - Busca Rápida: Ctrl+K Command Palette
 * - Grupos: Principal, Automação & IA, Ajustes · Workspace, Ajustes · Configurações
 * - Suporte a Drawer Mobile responsivo e tema claro/escuro.
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import './SidebarGlass.css';
import {
  Menu,
  X,
  Search,
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Users,
  BarChart3,
  Send,
  GitBranch,
  Zap,
  Sparkles,
  FileText,
  Crosshair,
  Building2,
  MessageCircle,
  Users2,
  Tag,
  Columns,
  TrendingDown,
  SlidersHorizontal,
  Layers,
  Settings,
  Mail,
  ShieldCheck,
  CreditCard,
  Bot,
  Shield,
  Sun,
  Moon,
  ChevronDown,
  Calendar,
  Globe,
  Award,
  Layout,
  PlusCircle,
  ArrowUpRight,
  GripVertical,
  LogOut
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import SidebarBrand from './SidebarBrand';
import { useEhMobile } from '../hooks/useMediaQuery';
import { moveSidebarItem, restoreSidebarOrder, saveSidebarOrder } from './sidebarOrder';

export const SECOES_MENU = [
  {
    id: 'suite',
    titulo: 'PRINCIPAL',
    itens: [
      { id: 'dashboard', nome: 'Dashboard', icon: LayoutDashboard },
      { id: 'atendimentos', nome: 'Atendimentos', icon: MessageSquare },
      { id: 'crm', nome: 'CRM', icon: Kanban },
      { id: 'contatos', nome: 'Contatos', icon: Users },
      { id: 'relatorios', nome: 'Relatórios', icon: BarChart3 },
      { id: 'disparos', nome: 'Disparos', icon: Send },
    ]
  },
  {
    id: 'sites',
    titulo: 'SITES & TEMPLATES',
    itens: [
      { id: 'agendamentos', nome: 'Agenda', icon: Calendar },
      { id: 'projetos', nome: 'Meus Sites', icon: Globe },
      { id: 'templates', nome: 'Loja de Templates', icon: Layout, badge: '57 FLUXOS' },
      { id: 'wizard', nome: 'Criar Site', icon: PlusCircle, badge: 'NEW' },
    ]
  },
  {
    id: 'ia',
    titulo: 'AUTOMAÇÃO & IA',
    itens: [
      { id: 'automacoes', nome: 'Automações', icon: Zap },
      { id: 'conhecimento', nome: 'Base de Conhecimento', icon: Sparkles },
      { id: 'formularios', nome: 'Formulários', icon: FileText },
      { id: 'prospector', nome: 'Prospector', icon: Crosshair },
    ]
  },
  {
    id: 'workspace',
    titulo: 'AJUSTES · WORKSPACE',
    itens: [
      { id: 'empresas', nome: 'Empresas', icon: Building2 },
      { id: 'canais', nome: 'Canais', icon: MessageCircle },
      { id: 'equipe', nome: 'Equipe & Filas', icon: Users2 },
      { id: 'pipelines', nome: 'Pipelines', icon: Columns },
      { id: 'respostas_rapidas', nome: 'Respostas rápidas', icon: Send },
      { id: 'motivos_perda', nome: 'Motivos de perda', icon: TrendingDown },
    ]
  },
  {
    id: 'sistema',
    titulo: 'AJUSTES · CONFIGURAÇÕES',
    itens: [
      { id: 'workspaces', nome: 'Workspaces', icon: Layers },
      { id: 'organizacao', nome: 'Organização', icon: Settings },
      { id: 'smtp', nome: 'E-mail / SMTP', icon: Mail },
      { id: 'lgpd', nome: 'Privacidade & LGPD', icon: Shield },
    ]
  },
  {
    id: 'neural',
    titulo: 'MOTOR NEURAL',
    fixed: true,
    itens: [{ id: 'engine', nome: 'Motor Neural [PRO]', icon: Sparkles, badge: 'LLM', fixed: true }]
  },
  {
    id: 'gestao',
    titulo: 'GESTÃO & CRESCIMENTO',
    itens: [
      { id: 'cobrar', nome: 'Faturamento', icon: CreditCard },
      { id: 'ranking', nome: 'Indicações', icon: Award },
    ]
  }
];

export default function Sidebar({ currentTab, setCurrentTab, onOpenCommandPalette, onLogout }) {
  const [saindo, setSaindo] = useState(false);
  const [erroSaida, setErroSaida] = useState('');
  async function encerrarConta() {
    setSaindo(true);
    setErroSaida('');
    try { await onLogout(); }
    catch { setErroSaida('Não foi possível sair. Verifique sua conexão e tente novamente.'); }
    finally { setSaindo(false); }
  }
  const reducedMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();
  const ehMobile = useEhMobile();
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const botaoAbrirRef = useRef(null);
  const navRef = useRef(null);
  const dragRef = useRef(null);
  const scrollFrameRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [sections, setSections] = useState(() => restoreSidebarOrder(SECOES_MENU, window.localStorage));
  const sectionsRef = useRef(sections);
  const [dragPreview, setDragPreview] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  const updateSections = (next) => {
    sectionsRef.current = next;
    setSections(next);
  };

  const updateDropPosition = (x, y) => {
    const hit = document.elementFromPoint(x, y);
    const sectionElement = hit?.closest?.('[data-sidebar-section]');
    const drag = dragRef.current;
    if (!sectionElement || !drag?.active) return;
    const sectionId = sectionElement.dataset.sidebarSection;
    const itemElement = hit.closest('[data-sidebar-item]');
    let beforeId = null;
    if (itemElement) {
      const itemId = itemElement.dataset.sidebarItem;
      if (itemId === drag.id) return;
      const section = sectionsRef.current.find(candidate => candidate.id === sectionId);
      const index = section?.itens.findIndex(candidate => candidate.id === itemId) ?? -1;
      if (index >= 0) {
        const beforeMiddle = y < itemElement.getBoundingClientRect().top + itemElement.getBoundingClientRect().height / 2;
        beforeId = beforeMiddle ? itemId : (section.itens[index + 1]?.id || null);
      }
    } else if (hit.closest('[data-sidebar-heading]')) {
      beforeId = sectionsRef.current.find(candidate => candidate.id === sectionId)?.itens[0]?.id || null;
      if (beforeId === drag.id) beforeId = null;
    }
    const next = moveSidebarItem(sectionsRef.current, drag.id, sectionId, beforeId);
    if (next !== sectionsRef.current) updateSections(next);
  };

  const scrollWhileDragging = () => {
    const drag = dragRef.current;
    const nav = navRef.current;
    if (!drag?.active || !nav) return;
    const bounds = nav.getBoundingClientRect();
    if (drag.y < bounds.top + 38 && drag.y >= bounds.top) nav.scrollTop -= 10;
    if (drag.y > bounds.bottom - 38 && drag.y <= bounds.bottom) nav.scrollTop += 10;
    updateDropPosition(drag.x, drag.y);
    scrollFrameRef.current = requestAnimationFrame(scrollWhileDragging);
  };

  const endDrag = (event, cancelled = false) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    clearTimeout(drag.timer);
    if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current = null;
    if (drag.active) {
      if (cancelled) updateSections(drag.originalSections);
      else {
        saveSidebarOrder(sectionsRef.current, window.localStorage);
        setAnnouncement(`${drag.name} reposicionado. Ordem salva neste navegador.`);
      }
      suppressClickRef.current = true;
      setDragPreview(null);
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
    dragRef.current = null;
    if (drag.captureElement?.isConnected && drag.captureElement.hasPointerCapture?.(event.pointerId)) {
      drag.captureElement.releasePointerCapture(event.pointerId);
    }
  };

  const beginPress = (event, item) => {
    if (item.fixed) return;
    if (!event.isPrimary || event.button !== 0) return;
    if (event.pointerType === 'touch' && !event.target.closest('[data-drag-handle]')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const press = {
      id: item.id, name: item.nome, pointerId: event.pointerId,
      captureElement: event.currentTarget,
      startX: event.clientX, startY: event.clientY,
      x: event.clientX, y: event.clientY,
      originalSections: sectionsRef.current, active: false, timer: null,
    };
    dragRef.current = press;
    press.timer = window.setTimeout(() => {
      if (dragRef.current !== press) return;
      press.active = true;
      suppressClickRef.current = true;
      setDragPreview({ id: item.id, name: item.nome, x: press.x, y: press.y });
      setAnnouncement(`${item.nome} selecionado. Arraste para reorganizar.`);
      scrollFrameRef.current = requestAnimationFrame(scrollWhileDragging);
    }, event.pointerType === 'touch' ? 320 : 240);
  };

  const continueDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag.x = event.clientX;
    drag.y = event.clientY;
    if (!drag.active) {
      if (Math.hypot(drag.x - drag.startX, drag.y - drag.startY) > 8) clearTimeout(drag.timer);
      return;
    }
    event.preventDefault();
    setDragPreview({ id: drag.id, name: drag.name, x: drag.x, y: drag.y });
    updateDropPosition(drag.x, drag.y);
  };

  const moveWithKeyboard = (event, itemId) => {
    if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const all = sectionsRef.current;
    const sectionIndex = all.findIndex(section => section.itens.some(item => item.id === itemId));
    const section = all[sectionIndex];
    const index = section?.itens.findIndex(item => item.id === itemId) ?? -1;
    if (index < 0) return;
    let targetSection = section;
    let beforeId = null;
    if (event.shiftKey) {
      targetSection = all[sectionIndex + (event.key === 'ArrowUp' ? -1 : 1)];
      if (!targetSection) return;
      beforeId = event.key === 'ArrowUp' ? null : (targetSection.itens[0]?.id || null);
    } else if (event.key === 'ArrowUp') {
      beforeId = section.itens[index - 1]?.id;
      if (!beforeId) return;
    } else {
      if (index === section.itens.length - 1) return;
      beforeId = section.itens[index + 2]?.id || null;
    }
    const next = moveSidebarItem(all, itemId, targetSection.id, beforeId);
    if (next !== all) {
      updateSections(next);
      saveSidebarOrder(next, window.localStorage);
      setAnnouncement(`Aba movida para ${targetSection.titulo}. Ordem salva neste navegador.`);
    }
  };

  useEffect(() => {
    window.addEventListener('pointermove', continueDrag, { passive: false });
    const onUp = (event) => endDrag(event);
    const onCancel = (event) => endDrag(event, true);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', continueDrag);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  });

  useEffect(() => () => {
    if (dragRef.current?.timer) clearTimeout(dragRef.current.timer);
    if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
  }, []);

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
    // Normalização: se for prospector mapeia para leads se necessário
    setCurrentTab(id === 'prospector' ? 'leads' : id);
    if (ehMobile) setGavetaAberta(false);
  };

  const isTabActive = (itemId) => {
    if (itemId === 'prospector' && currentTab === 'leads') return true;
    return currentTab === itemId;
  };

  const estiloAside = ehMobile
    ? {
        width: '340px',
        maxWidth: 'calc(100vw - 28px)',
        height: 'calc(100dvh - 28px)',
        position: 'fixed',
        top: '14px',
        left: '14px',
        transform: gavetaAberta ? 'translateX(0)' : 'translateX(calc(-100% - 28px))',
        transition: 'transform 0.26s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 60,
        background: 'var(--papel-elevado)',
        boxShadow: gavetaAberta ? 'var(--sombra-md)' : 'none',
      }
    : {
        width: '248px',
        height: 'calc(100dvh - 16px)',
        position: 'fixed',
        top: '8px',
        bottom: '8px',
        left: '6px',
        flexShrink: 0,
        background: 'var(--papel-elevado)',
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
          style={{
            position: 'fixed',
            top: '14px',
            left: '14px',
            zIndex: 55,
            width: '44px',
            height: '44px',
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
          <Menu size={20} color="var(--tinta)" />
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
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 55,
          }}
        />
      )}

      <aside
        className="sidebar-container repass-glass"
        inert={ehMobile && !gavetaAberta ? '' : undefined}
        aria-label="Navegação principal"
        aria-hidden={ehMobile && !gavetaAberta}
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRight: '1px solid var(--aro-cor)',
          userSelect: 'none',
          overflow: 'hidden',
          ...estiloAside,
        }}
      >
        {/* Cabeçalho do Perfil / Workspace */}
        <div
          className="repass-glass-header"
          style={{
            height: '62px',
            padding: '0 16px',
            borderBottom: '1px solid var(--aro-cor)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            backgroundColor: 'var(--papel-cartao)'
          }}
        >
          <SidebarBrand badge="REPASS [VERSÃO_BETA]" />

          {ehMobile ? (
            <button
              onClick={() => setGavetaAberta(false)}
              aria-label="Fechar menu"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--tinta-media)'
              }}
            >
              <X size={18} />
            </button>
          ) : (
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                color: 'var(--tinta-media)',
                borderRadius: 'var(--raio-sm)'
              }}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          )}
        </div>

        {/* Botão de Busca Rápida / Command Palette */}
        <div className="repass-glass-search" style={{ padding: '10px 12px 6px 12px', flexShrink: 0 }}>
          <button
            onClick={onOpenCommandPalette}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'var(--papel-fundo)',
              border: '1px solid var(--aro-cor)',
              borderRadius: 'var(--raio-md)',
              color: 'var(--tinta-fraca)',
              fontSize: '12px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} />
              <span>Buscar páginas...</span>
            </div>
            <kbd
              style={{
                padding: '1px 5px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--papel-cartao)',
                borderRadius: 'var(--raio-sm)',
                border: '1px solid var(--aro-cor)'
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Lista de Navegação com Categorias */}
        <nav
          ref={navRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '6px 10px 20px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', padding: '0 10px 2px' }}>
            <span style={{ color: 'var(--tinta-fraca)', fontSize: '10px', lineHeight: 1.3 }}>
              Segure e arraste para organizar
            </span>
            <button
              type="button"
              onClick={() => {
                updateSections(SECOES_MENU);
                saveSidebarOrder(SECOES_MENU, window.localStorage);
                setAnnouncement('Ordem original restaurada.');
              }}
              style={{ background: 'none', border: 0, color: 'var(--tinta-media)', fontSize: '10px', cursor: 'pointer', padding: '4px 0', textDecoration: 'underline' }}
            >
              Restaurar
            </button>
          </div>
          {sections.map((secao) => (
            <div key={secao.id} data-sidebar-section={secao.id}>
              {/* Título da Seção */}
              <div
                data-sidebar-heading
                style={{
                  padding: '4px 10px 6px 10px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  letterSpacing: 'var(--tracking-rotulo)',
                  color: 'var(--tinta-fantasma)',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {secao.titulo}
              </div>

              {/* Itens da Seção */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {secao.itens.map((item) => {
                  const Icon = item.icon;
                  const ativo = isTabActive(item.id);

                  return (
                    <motion.div key={item.id} layout={!reducedMotion} transition={{ layout: { duration: 0.18, ease: 'easeOut' } }}>
                    <button
                      type="button"
                      className="repass-glass-item"
                      data-sidebar-item={item.id}
                      onPointerDown={(event) => beginPress(event, item)}
                      onKeyDown={(event) => moveWithKeyboard(event, item.id)}
                      onClick={(event) => {
                        if (suppressClickRef.current) { event.preventDefault(); return; }
                        navegar(item.id);
                      }}
                      aria-label={item.fixed ? `${item.nome}. Opção fixa.` : `${item.nome}. Segure e arraste, ou use Alt e setas para mover.`}
                      aria-current={ativo ? 'page' : undefined}
                      style={{
                        position: 'relative',
                        width: '100%',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: 'none',
                        borderRadius: 'var(--raio-md)',
                        cursor: item.fixed ? 'pointer' : dragPreview?.id === item.id ? 'grabbing' : 'grab',
                        backgroundColor: ativo ? 'var(--sobre-08)' : 'transparent',
                        color: ativo ? 'var(--tinta)' : 'var(--tinta-media)',
                        opacity: dragPreview?.id === item.id ? 0.3 : 1,
                        boxShadow: 'none',
                        outline: 'none',
                        transition: 'background-color 0.12s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon
                          size={17}
                          style={{
                            color: ativo ? 'var(--tinta)' : 'var(--tinta-fraca)',
                            flexShrink: 0
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13.5px',
                            fontWeight: ativo ? 600 : 500,
                            letterSpacing: '-0.01em',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.nome}
                        </span>
                      </div>

                      {item.badge && (
                        <span
                          style={{
                            fontSize: '8px',
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 5px',
                            borderRadius: 'var(--raio-sm)',
                            backgroundColor: item.badge === 'PRO' || item.badge === 'IA VOZ'
                              ? 'var(--iris-veil)'
                              : 'var(--sobre-08)',
                            color: 'var(--tinta)',
                            fontWeight: 600
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      {!item.fixed && <GripVertical
                        data-drag-handle
                        size={13}
                        aria-hidden="true"
                        style={{ color: 'var(--tinta-fantasma)', flexShrink: 0, marginLeft: '4px', touchAction: 'none' }}
                      />}
                    </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <span role="status" aria-live="polite" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
          {announcement}
        </span>

        {/* Rodapé da Sidebar: Card fixo REPASS PRO // ACESSO ILIMITADO */}
        <div
          className="repass-glass-pro"
          style={{
            margin: '8px 10px',
            padding: '12px 14px',
            borderRadius: 'var(--raio-md)',
            backgroundColor: 'var(--sobre-04)',
            border: '1px solid var(--aro-cor)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--tinta)',
                letterSpacing: '0.04em'
              }}
            >
              REPASS PRO // ACESSO ILIMITADO
            </span>
            <span
              style={{
                fontSize: '8px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 5px',
                borderRadius: 'var(--raio-sm)',
                backgroundColor: 'var(--iris-veil)',
                color: 'var(--tinta)',
                fontWeight: 700
              }}
            >
              PRO
            </span>
          </div>

          <p
            style={{
              fontSize: '11px',
              color: 'var(--tinta-fraca)',
              lineHeight: 1.45,
              margin: 0
            }}
          >
            Varredura OSINT ilimitada &amp; motor de IA 60fps sem bloqueios.
          </p>

          <button
            onClick={() => navegar('cobrar')}
            style={{
              marginTop: '2px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              borderRadius: 'var(--raio-sm)',
              border: '1px solid var(--aro-cor)',
              backgroundColor: 'var(--sobre-08)',
              color: 'var(--tinta)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Ativar Plano</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {onLogout && <div style={{ padding: '8px 14px', flexShrink: 0 }}>
          <button type="button" onClick={encerrarConta} disabled={saindo}
            style={{ width: '100%', padding: '10px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', color: 'var(--tinta)', background: 'var(--papel-cartao)', border: '1px solid var(--aro-cor)', borderRadius: 'var(--raio-sm)', cursor: 'pointer' }}>
            <LogOut size={16} aria-hidden="true" />{saindo ? 'Saindo…' : 'Sair da conta'}
          </button>
          {erroSaida && <p role="alert" style={{ fontSize: '12px', color: 'var(--tinta)', margin: '8px 0' }}>{erroSaida}</p>}
        </div>}
        {/* Rodapé: Quick Switcher / Status */}
        <div
          className="repass-glass-footer"
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--aro-cor)',
            backgroundColor: 'var(--papel-cartao)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--tinta-fraca)',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--sucesso)'
              }}
            />
            <span>API ONLINE</span>
          </div>

          <span style={{ fontSize: '10px', color: 'var(--tinta-fantasma)' }}>
            v20.0-PRO
          </span>
        </div>
      </aside>
      {dragPreview && createPortal(
        <div
          className="repass-glass-drag"
          aria-hidden="true"
          style={{
            position: 'fixed', left: dragPreview.x + 12, top: dragPreview.y - 18,
            zIndex: 1000, pointerEvents: 'none', padding: '9px 12px',
            borderRadius: 'var(--raio-md)', background: 'var(--papel-elevado)',
            color: 'var(--tinta)', border: '1px solid var(--aro-cor)',
            boxShadow: 'var(--sombra-md)', fontSize: '13px', fontWeight: 600,
            fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
          }}
        >
          {dragPreview.name}
        </div>, document.body
      )}
    </>
  );
}
