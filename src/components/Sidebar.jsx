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
import { motion } from 'framer-motion';
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
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import RepassLivingLogo from './ui/RepassLivingLogo';
import { useEhMobile } from '../hooks/useMediaQuery';

export const SECOES_MENU = [
  {
    titulo: 'PRINCIPAL',
    itens: [
      { id: 'dashboard', nome: 'Dashboard', icon: LayoutDashboard },
      { id: 'atendimentos', nome: 'Atendimentos', icon: MessageSquare, badge: 'NOVO' },
      { id: 'crm', nome: 'CRM', icon: Kanban },
      { id: 'contatos', nome: 'Contatos', icon: Users },
      { id: 'relatorios', nome: 'Relatórios', icon: BarChart3 },
      { id: 'disparos', nome: 'Disparos', icon: Send },
    ]
  },
  {
    titulo: 'AUTOMAÇÃO & IA',
    itens: [
      { id: 'fluxos', nome: 'Fluxos', icon: GitBranch, badge: 'PRO' },
      { id: 'automacoes', nome: 'Automações', icon: Zap },
      { id: 'conhecimento', nome: 'Base de Conhecimento', icon: Sparkles },
      { id: 'formularios', nome: 'Formulários', icon: FileText },
      { id: 'prospector', nome: 'Prospector', icon: Crosshair, badge: 'MAPS' },
    ]
  },
  {
    titulo: 'AJUSTES · WORKSPACE',
    itens: [
      { id: 'empresas', nome: 'Empresas', icon: Building2 },
      { id: 'canais', nome: 'Canais', icon: MessageCircle, badge: 'IA VOZ' },
      { id: 'equipe', nome: 'Equipe & Filas', icon: Users2 },
      { id: 'tags', nome: 'Tags', icon: Tag },
      { id: 'pipelines', nome: 'Pipelines', icon: Columns },
      { id: 'respostas_rapidas', nome: 'Respostas rápidas', icon: Send },
      { id: 'motivos_perda', nome: 'Motivos de perda', icon: TrendingDown },
      { id: 'campos_personalizados', nome: 'Campos personalizados', icon: SlidersHorizontal },
    ]
  },
  {
    titulo: 'AJUSTES · CONFIGURAÇÕES',
    itens: [
      { id: 'workspaces', nome: 'Workspaces', icon: Layers },
      { id: 'organizacao', nome: 'Organização', icon: Settings },
      { id: 'smtp', nome: 'E-mail / SMTP', icon: Mail },
      { id: 'permissoes', nome: 'Papéis & Permissões', icon: ShieldCheck },
      { id: 'plano', nome: 'Plano & Assinatura', icon: CreditCard },
      { id: 'ia_config', nome: 'IA & Conhecimento', icon: Bot },
      { id: 'lgpd', nome: 'Privacidade & LGPD', icon: Shield },
    ]
  }
];

export default function Sidebar({ currentTab, setCurrentTab, onOpenCommandPalette }) {
  const { theme, toggleTheme } = useTheme();
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
        width: '276px',
        maxWidth: '85vw',
        height: '100dvh',
        position: 'fixed',
        top: 0,
        left: 0,
        transform: gavetaAberta ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.26s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 60,
        background: 'var(--papel-elevado)',
        boxShadow: gavetaAberta ? 'var(--sombra-md)' : 'none',
      }
    : {
        width: '260px',
        height: '100vh',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
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
        className="sidebar-container"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RepassLivingLogo size={32} />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: 'var(--tinta)',
                  lineHeight: 1.2
                }}
              >
                Victor Borsari
              </span>
              <span
                style={{
                  fontSize: '10.5px',
                  color: 'var(--tinta-fraca)',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                REPASS AI · PRO
              </span>
            </div>
          </div>

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
        <div style={{ padding: '10px 12px 6px 12px', flexShrink: 0 }}>
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
          {SECOES_MENU.map((secao, sIdx) => (
            <div key={sIdx}>
              {/* Título da Seção */}
              <div
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
                    <button
                      key={item.id}
                      onClick={() => navegar(item.id)}
                      style={{
                        position: 'relative',
                        width: '100%',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: 'none',
                        borderRadius: 'var(--raio-md)',
                        cursor: 'pointer',
                        backgroundColor: ativo ? 'var(--sobre-08)' : 'transparent',
                        color: ativo ? 'var(--tinta)' : 'var(--tinta-media)',
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
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Rodapé: Quick Switcher / Status */}
        <div
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
            <span>API 8000 ONLINE</span>
          </div>

          <span style={{ fontSize: '10px', color: 'var(--tinta-fantasma)' }}>
            v20.0-PRO
          </span>
        </div>
      </aside>
    </>
  );
}
