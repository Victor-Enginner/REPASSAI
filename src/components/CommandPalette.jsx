import React, { useState, useEffect, useRef } from 'react';
import { SECOES_MENU } from './Sidebar';
import {
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
  ChevronRight,
  ArrowRight,
  Calendar,
  Globe,
  Award,
  Layout,
  PlusCircle
} from 'lucide-react';

export const COMMAND_ITEMS = [
  // SUÍTE REPASS [8 MÓDULOS]
  { id: 'dashboard', nome: '01 Painel (Dashboard)', categoria: 'Suíte REPASS', grupo: 'Principal', icon: LayoutDashboard },
  { id: 'prospector', nome: '02 Prospector [OSINT]', categoria: 'Suíte REPASS', grupo: 'Prospecção', icon: Crosshair },
  { id: 'crm', nome: '03 Funil de Vendas (CRM)', categoria: 'Suíte REPASS', grupo: 'Vendas', icon: Kanban },
  { id: 'disparos', nome: '04 Abordagem 1-a-1 (WhatsApp)', categoria: 'Suíte REPASS', grupo: 'Disparos', icon: Send },
  { id: 'agendamentos', nome: '05 Agenda & Calls (Meet)', categoria: 'Suíte REPASS', grupo: 'Comercial', icon: Calendar },
  { id: 'projetos', nome: '06 Meus Sites (Landing Pages)', categoria: 'Suíte REPASS', grupo: 'Sites', icon: Globe },
  { id: 'templates', nome: '07 Loja de Templates & 57 Fluxos N8N', categoria: 'Suíte REPASS', grupo: 'Templates', icon: Layout },
  { id: 'wizard', nome: '08 Criar Site [Wizard]', categoria: 'Suíte REPASS', grupo: 'Sites', icon: PlusCircle },

  // AUTOMAÇÃO & IA
  { id: 'engine', nome: 'Motor Neural [PRO]', categoria: 'IA Agêntica & Comunicação', grupo: 'Inteligência Artificial', icon: Sparkles },
  { id: 'automacoes', nome: 'Estúdio de Automações (n8n)', categoria: 'Automação & IA', grupo: 'Fluxos', icon: Zap },
  { id: 'conhecimento', nome: 'Base de Conhecimento (RAG)', categoria: 'Automação & IA', grupo: 'Conhecimento', icon: Sparkles },
  { id: 'formularios', nome: 'Formulários & Captura', categoria: 'Automação & IA', grupo: 'Briefing', icon: FileText },
  { id: 'atendimentos', nome: 'Atendimentos Omnichannel', categoria: 'Atendimento', grupo: 'Omnichannel', icon: MessageSquare },
  { id: 'contatos', nome: 'Contatos & Diretório', categoria: 'Comercial', grupo: 'Contatos', icon: Users },
  { id: 'relatorios', nome: 'Relatórios & Métricas', categoria: 'Análise', grupo: 'BI', icon: BarChart3 },

  // GESTÃO & CRESCIMENTO
  { id: 'cobrar', nome: 'Faturamento & Cobranças', categoria: 'Gestão & Crescimento', grupo: 'Financeiro', icon: CreditCard },
  { id: 'ranking', nome: 'Indicações & Afiliados', categoria: 'Gestão & Crescimento', grupo: 'Crescimento', icon: Award },

  // AJUSTES · WORKSPACE
  { id: 'empresas', nome: 'Empresas', categoria: 'Ajustes · Workspace', grupo: 'Workspace', icon: Building2 },
  { id: 'canais', nome: 'Canais (WhatsApp / Ligação IA)', categoria: 'Ajustes · Workspace', grupo: 'Workspace', icon: MessageCircle },
  { id: 'equipe', nome: 'Equipe & Filas', categoria: 'Ajustes · Workspace', grupo: 'Workspace', icon: Users2 },
  { id: 'tags', nome: 'Tags & Segmentos', categoria: 'Ajustes · Workspace', grupo: 'Workspace', icon: Tag },
  { id: 'pipelines', nome: 'Pipelines', categoria: 'Ajustes · Workspace', grupo: 'Workspace', icon: Columns },
  { id: 'respostas_rapidas', nome: 'Respostas rápidas', categoria: 'Ajustes · Workspace', grupo: 'Workspace', icon: Send },
  { id: 'motivos_perda', nome: 'Motivos de perda', categoria: 'Ajustes · Workspace', grupo: 'Workspace', icon: TrendingDown },
  { id: 'campos_personalizados', nome: 'Campos personalizados', categoria: 'Ajustes · Workspace', grupo: 'Workspace', icon: SlidersHorizontal },

  // AJUSTES · CONFIGURAÇÕES
  { id: 'workspaces', nome: 'Workspaces', categoria: 'Ajustes · Configurações', grupo: 'Configurações', icon: Layers },
  { id: 'organizacao', nome: 'Organização', categoria: 'Ajustes · Configurações', grupo: 'Configurações', icon: Settings },
  { id: 'smtp', nome: 'E-mail / SMTP', categoria: 'Ajustes · Configurações', grupo: 'Configurações', icon: Mail },
  { id: 'permissoes', nome: 'Papéis & Permissões', categoria: 'Ajustes · Configurações', grupo: 'Configurações', icon: ShieldCheck },
  { id: 'plano', nome: 'Plano & Assinatura', categoria: 'Ajustes · Configurações', grupo: 'Configurações', icon: CreditCard },
  { id: 'ia_config', nome: 'IA & Conhecimento', categoria: 'Ajustes · Configurações', grupo: 'Configurações', icon: Bot },
  { id: 'lgpd', nome: 'Privacidade & LGPD', categoria: 'Ajustes · Configurações', grupo: 'Configurações', icon: Shield },
].filter(item => SECOES_MENU.some(section => section.itens.some(entry => entry.id === item.id)))
  .map(item => {
    const section = SECOES_MENU.find(section => section.itens.some(entry => entry.id === item.id));
    const entry = section.itens.find(entry => entry.id === item.id);
    return { ...item, nome: entry.nome, categoria: section.titulo };
  }).sort((a, b) => Number(a.id === 'engine') - Number(b.id === 'engine'));

export default function CommandPalette({ isOpen, onClose, onSelectTab }) {
  const [busca, setBusca] = useState('');
  const [indiceFoco, setIndiceFoco] = useState(0);
  const inputRef = useRef(null);

  const filtrados = COMMAND_ITEMS.filter((item) =>
    item.nome.toLowerCase().includes(busca.toLowerCase()) ||
    item.grupo.toLowerCase().includes(busca.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setBusca('');
      setIndiceFoco(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setIndiceFoco(0);
  }, [busca]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndiceFoco((prev) => (prev < filtrados.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndiceFoco((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtrados[indiceFoco]) {
          onSelectTab(filtrados[indiceFoco].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtrados, indiceFoco, onClose, onSelectTab]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        paddingLeft: '16px',
        paddingRight: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--papel-cartao)',
          border: '1px solid var(--aro-cor)',
          borderRadius: 'var(--raio-lg)',
          boxShadow: 'var(--sombra-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
          animation: 'palettePop 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Campo de Busca Superior */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--aro-cor)',
            position: 'relative'
          }}
        >
          <Search size={18} style={{ color: 'var(--tinta-fraca)' }} />
          <input
            ref={inputRef}
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar páginas, comandos..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              color: 'var(--tinta)',
              padding: 0
            }}
          />
          <kbd
            style={{
              padding: '2px 7px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              borderRadius: 'var(--raio-sm)',
              border: '1px solid var(--aro-cor)',
              backgroundColor: 'var(--papel-fundo)',
              color: 'var(--tinta-fraca)',
              lineHeight: 1.4
            }}
          >
            esc
          </kbd>
        </div>

        {/* Lista de Resultados */}
        <div
          style={{
            overflowY: 'auto',
            padding: '10px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          <div
            style={{
              padding: '8px 12px 4px 12px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: 'var(--tracking-rotulo)',
              textTransform: 'uppercase',
              color: 'var(--tinta-fantasma)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {busca ? 'Resultados' : 'Páginas'}
          </div>

          {filtrados.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: 'var(--tinta-fraca)',
                fontSize: '14px'
              }}
            >
              Nenhuma página encontrada para &ldquo;{busca}&rdquo;.
            </div>
          ) : (
            filtrados.map((item, index) => {
              const Icone = item.icon;
              const focado = index === indiceFoco;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  onMouseEnter={() => setIndiceFoco(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--raio-md)',
                    cursor: 'pointer',
                    backgroundColor: focado ? 'var(--papel-fundo)' : 'transparent',
                    color: focado ? 'var(--tinta)' : 'var(--tinta-media)',
                    transition: 'background-color 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icone
                      size={17}
                      style={{
                        color: focado ? 'var(--iris-violeta)' : 'var(--tinta-fraca)',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: focado ? 600 : 500 }}>
                        {item.nome}
                      </span>
                      {busca && (
                        <span style={{ fontSize: '11px', color: 'var(--tinta-fantasma)' }}>
                          {item.categoria}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    size={15}
                    style={{
                      color: focado ? 'var(--tinta)' : 'var(--tinta-fantasma)',
                      opacity: focado ? 1 : 0.6
                    }}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé com dicas de teclado */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--aro-cor)',
            backgroundColor: 'var(--papel-fundo)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--tinta-fraca)',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <span>Navegue com ↑ ↓</span>
          <span>Selecione com ↵</span>
        </div>
      </div>
    </div>
  );
}
