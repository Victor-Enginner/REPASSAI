import React, { useState, useEffect } from 'react';
import { 
  Twitter, Linkedin, Github, Globe, ArrowUpRight, Zap, Sparkles, Check, 
  Search, Send, RefreshCw, Layers, ArrowRight, MessageSquare, PhoneCall, 
  ChevronDown, ChevronUp, DollarSign, Award, Users, ShieldCheck, CheckCircle2
} from 'lucide-react';
import ASCIIWaves from '../components/ui/ASCIIWaves';
import ScrollJourneyLine from '../components/ui/ScrollJourneyLine';
import logoOrb from '../assets/repass_logo_orb.jpg';

export default function LandingPage({ onOpenApp }) {
  const [time, setTime] = useState({ hh: '12', mm: '04', ss: '19' });
  const [nicheInput, setNicheInput] = useState('');
  
  // State para Calculadora de Faturamento Recorrente
  const [sitesPorMes, setSitesPorMes] = useState(3);
  const [precoAvista, setPrecoAvista] = useState(800);
  const [manutencaoMensal, setManutencaoMensal] = useState(120);

  // State para FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // State para Troca Mensal/Anual nos Planos
  const [billingCycle, setBillingCycle] = useState('anual');

  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');
      setTime({ hh, mm, ss });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cálculos do Modelo de Receita Recorrente
  const totalClientesEmUmAno = sitesPorMes * 12;
  const receitaRecorrenteMensal = totalClientesEmUmAno * manutencaoMensal;
  const receitaVendasAvistaAno = totalClientesEmUmAno * precoAvista;
  const receitaAnualPotencial = receitaVendasAvistaAno + (receitaRecorrenteMensal * 6);
  const numeroLiberdade = (sitesPorMes * precoAvista) + receitaRecorrenteMensal;

  const faqs = [
    {
      q: "Como eu encontro negócios sem site?",
      a: "Abra o menu Leads. Em Buscar Leads, escolha Estado, Cidade e a Categoria do nicho, defina a quantidade e clique em Varrer Agora. O REPASS AI marca automaticamente quem está sem site, com o site fora do ar ou sem certificado SSL."
    },
    {
      q: "Como gero o site de um lead?",
      a: "No card do lead encontrado na varredura, clique no botão 'Gerar site'. Em segundos o motor agêntico compila uma landing page profissional e responsiva com as cores, dados e serviços do negócio."
    },
    {
      q: "Como edito o texto ou as imagens do site?",
      a: "O site abre direto no editor split-screen. Você pode clicar no texto ou descrever a alteração desejada em linguagem natural para o Chatbot Agêntico. Cada ajuste cria um registro no histórico de versões."
    },
    {
      q: "Como publico e mando o site para o cliente?",
      a: "Defina o subdomínio ou domínio próprio, clique em Publicar e copie o link público. Mande o link para o cliente pelo WhatsApp para ele visualizar o site pronto na hora."
    },
    {
      q: "Onde ficam os roteiros de WhatsApp e de ligação?",
      a: "No módulo CRM. Ao selecionar o lead, o assistente gera instantaneamente o script persuasivo de abordagem para WhatsApp, o roteiro de ligação fria e o guia de quebra de objeções."
    },
    {
      q: "Tem que pagar domínio e hospedagem extra?",
      a: "Não! Todos os planos incluem hospedagem rápida em nuvem com subdomínio grátis. Você pode conectar seu próprio domínio customizado quando quiser."
    }
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#000000', color: '#ffffff', position: 'relative', overflowX: 'hidden' }}>
      
      {/* SVG Scroll Journey Connector Line */}
      <ScrollJourneyLine strokeColor="#6366f1" glowColor="#ec4899" />

      {/* 1. Architectural Navigation Bar Português BR (Extremo Canto Direito Preservado) */}
      <nav style={{
        height: '72px',
        width: '100%',
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.15)',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Left: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={onOpenApp}>
          <img 
            src={logoOrb} 
            alt="REPASS AI" 
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <span className="font-headline" style={{ fontSize: '24px', letterSpacing: '-0.06em' }}>
            REPASS
          </span>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} />
          <span className="mono-label" style={{ color: '#6366f1' }}>
            VERSÃO_BETA
          </span>
        </div>

        {/* Right: Circular Hairline Social Icons & Pill Button (Posicionados no Extremo Canto Direito) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '0.5px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Twitter size={15} color="rgba(255,255,255,0.7)" />
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '0.5px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Linkedin size={15} color="rgba(255,255,255,0.7)" />
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '0.5px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Github size={15} color="rgba(255,255,255,0.7)" />
            </div>
          </div>

          <button onClick={onOpenApp} className="btn-pill">
            ACESSAR PAINEL
          </button>
        </div>
      </nav>

      {/* 2. ICONIC REPASS AI HERO SECTION (2x2 Architectural Grid + ASCIIWaves Background) */}
      <section style={{
        height: 'calc(100vh - 144px)',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* OriginKit Interactive ASCII Waves Canvas Background Layer (Edge-to-Edge) */}
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.38 }}>
          <ASCIIWaves 
            color="#6366f1"
            background="#000000"
            elementSize={14}
            speed={25}
            interactionRadius={180}
          />
        </div>

        {/* The Elastically Responsive Architectural Grid Overlay */}
        <div className="relative z-10 h-full w-full grid grid-cols-1 md:grid-cols-2 grid-rows-4 md:grid-rows-2">
          {/* Cell 1: Top-Left */}
          <div className="border-b border-zinc-800/50 md:border-r p-6 md:p-10 flex items-end relative overflow-hidden">
            <span className="mono-label absolute top-4 left-4 md:top-6 md:left-6">QUADRANTE_01 // NÚCLEO</span>
            <h1 className="font-headline leading-none text-white m-0" style={{ fontSize: 'clamp(3rem, 15vw, 12rem)', lineHeight: 0.85 }}>
              RE
            </h1>
          </div>

          {/* Cell 2: Top-Right */}
          <div className="border-b border-zinc-800/50 p-6 md:p-10 flex items-end relative overflow-hidden">
            <span className="mono-label absolute top-4 left-4 md:top-6 md:left-6">QUADRANTE_02 // SISTEMA</span>
            <h1 className="font-headline leading-none text-white m-0" style={{ fontSize: 'clamp(3rem, 15vw, 12rem)', lineHeight: 0.85 }}>
              PASS
            </h1>
          </div>

          {/* Cell 3: Bottom-Left */}
          <div className="border-b border-zinc-800/50 md:border-b-0 md:border-r p-6 md:p-10 flex items-start relative overflow-hidden">
            <span className="mono-label absolute bottom-4 left-4 md:bottom-6 md:left-6">QUADRANTE_03 // NEURAL</span>
            <h1 className="font-headline leading-none text-white m-0" style={{ fontSize: 'clamp(3rem, 15vw, 12rem)', lineHeight: 0.85 }}>
              A
            </h1>
          </div>

          {/* Cell 4: Bottom-Right */}
          <div className="p-6 md:p-10 flex items-start relative overflow-hidden">
            <span className="mono-label absolute bottom-4 left-4 md:bottom-6 md:left-6">QUADRANTE_04 // OSINT</span>
            <h1 className="font-headline leading-none text-white m-0" style={{ fontSize: 'clamp(3rem, 15vw, 12rem)', lineHeight: 0.85 }}>
              I
            </h1>
          </div>
        </div>

      </section>

      {/* 3. Command Bar Português BR (Horizontal 4-Column Strip) */}
      <section style={{
        height: '72px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        borderTop: '0.5px solid rgba(255, 255, 255, 0.15)',
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.15)',
        background: '#000000'
      }}>
        {/* Cell 1: Email / Niche Input */}
        <div className="hairline-r" style={{ padding: '0 24px', display: 'flex', alignItems: 'center' }}>
          <input 
            type="text"
            value={nicheInput}
            onChange={(e) => setNicheInput(e.target.value)}
            placeholder="DIGITE_SEU_NICHO_OU_EMAIL..."
            className="font-mono"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '11px',
              letterSpacing: '0.25em'
            }}
          />
        </div>

        {/* Cell 2: JOIN BETA Button */}
        <div className="hairline-r">
          <button onClick={onOpenApp} className="btn-solid-white" style={{ width: '100%', height: '100%' }}>
            ENTRAR NA BETA
          </button>
        </div>

        {/* Cell 3: Real-Time Status Countdown Timer */}
        <div className="hairline-r" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
          <div className="font-mono" style={{ fontSize: '20px', letterSpacing: '0.15em', color: '#ffffff' }}>
            {time.hh} <span style={{ opacity: 0.2 }}>:</span> {time.mm} <span style={{ opacity: 0.2 }}>:</span> {time.ss}
          </div>
        </div>

        {/* Cell 4: System Labels Stack Português BR */}
        <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px' }}>
          <span className="mono-label" style={{ fontSize: '8px', letterSpacing: '0.4em' }}>ACESSO_GRATUITO</span>
          <span className="mono-label" style={{ fontSize: '8px', letterSpacing: '0.4em' }}>TURMA_BETA_LIMITADA</span>
          <span className="mono-label" style={{ fontSize: '8px', letterSpacing: '0.4em' }}>SEM_CARTÃO_DE_CRÉDITO</span>
        </div>
      </section>

      {/* 4. Section Guia Oficial & Copy useleadsite.com */}
      <section style={{ padding: '80px 40px 60px 80px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontFamily: 'var(--font-mono)', border: '0.5px solid rgba(99, 102, 241, 0.3)', marginBottom: '24px' }}>
          <Sparkles size={14} color="#6366f1" /> FEITO PARA O BRASIL · TUDO DENTRO DO PAINEL · SEM INSTALAR NADA
        </div>

        <h2 className="font-headline" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', color: '#ffffff', lineHeight: 1.05, maxWidth: '1100px', marginBottom: '20px' }}>
          Aprenda a usar o REPASS AI & LeadSite e feche clientes em minutos
        </h2>

        <p style={{ fontSize: '18px', color: '#cbd5e1', maxWidth: '850px', lineHeight: 1.6, marginBottom: '32px' }}>
          Este guia mostra, passo a passo, como usar cada tela: buscar negócios sem site no menu Leads, gerar e editar o site com um clique, e fechar no CRM com o script pronto.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
          <button onClick={onOpenApp} className="btn-primary" style={{ padding: '16px 36px', fontSize: '14px', borderRadius: '6px' }}>
            <Zap size={18} /> Abrir o Painel Agora
          </button>

          <a href="#passo-a-passo" className="btn-secondary" style={{ padding: '16px 28px', fontSize: '14px', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Ver o passo a passo ↓
          </a>
        </div>

        {/* 4 Cards de Estatísticas em Tempo Real */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', borderTop: '0.5px solid rgba(255, 255, 255, 0.12)', paddingTop: '32px' }}>
          <div style={{ background: '#0a0e1a', padding: '20px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <div className="font-headline" style={{ fontSize: '28px', color: '#6366f1' }}>12.000+</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>negócios analisados</div>
          </div>

          <div style={{ background: '#0a0e1a', padding: '20px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <div className="font-headline" style={{ fontSize: '28px', color: '#22c55e' }}>3.400+</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>sites publicados</div>
          </div>

          <div style={{ background: '#0a0e1a', padding: '20px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <div className="font-headline" style={{ fontSize: '28px', color: '#f59e0b' }}>4,9 / 5</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>avaliação dos usuários</div>
          </div>

          <div style={{ background: '#0a0e1a', padding: '20px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <div className="font-headline" style={{ fontSize: '28px', color: '#ec4899' }}>&lt; 30s</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>para gerar um site</div>
          </div>
        </div>
      </section>

      {/* 5. Passo a Passo em 6 Etapas */}
      <section id="passo-a-passo" style={{ padding: '80px 40px 80px 80px', maxWidth: '1400px', margin: '0 auto', borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
        
        <span className="mono-label" style={{ color: '#6366f1' }}>GUIA DE EXECUÇÃO // 6 PASSO A PASSO</span>
        <h2 className="font-headline" style={{ fontSize: '32px', color: '#ffffff', marginTop: '8px', marginBottom: '12px' }}>
          Como usar o LeadSite, do começo ao fechamento
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '40px', maxWidth: '700px' }}>
          Seis passos, na ordem exata em que você faz no painel. Siga cada um e feche seu primeiro cliente hoje.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {[
            {
              n: '1',
              title: 'Busque negócios sem site',
              desc: 'Abra o menu Leads. Em Buscar Leads, escolha Estado, Cidade e a Categoria (o nicho), defina a quantidade e clique em Buscar. O LeadSite lista os negócios e marca quem precisa de você: Sem site, Site fora do ar, Sem SSL, Sem contato.'
            },
            {
              n: '2',
              title: 'Envie os melhores para o CRM',
              desc: 'Marque os leads que valem a pena (ou use Selecionar todos) e clique em Enviar para CRM. Eles entram no seu funil, prontos para trabalhar. A partir do Starter você ainda pode Exportar CSV.'
            },
            {
              n: '3',
              title: 'Gere o site com um clique',
              desc: 'No card do lead, clique em Gerar site. Em segundos o LeadSite monta um site profissional e responsivo, com as cores, fotos e dados do negócio. Já existe um site salvo? O botão vira Regerar.'
            },
            {
              n: '4',
              title: 'Edite conversando, sem código',
              desc: 'O site abre no editor. Clique num texto para editar ou numa imagem para trocar e descreva a mudança no chat. Cada ajuste vira uma versão em Histórico de versões — dá para voltar quando quiser.'
            },
            {
              n: '5',
              title: 'Publique e mostre para o cliente',
              desc: 'Defina o endereço do site, clique em Copiar URL e mande o link para o cliente ver na hora — o link público vem em todos os planos, até no Gratuito.'
            },
            {
              n: '6',
              title: 'Aborde e feche no CRM',
              desc: 'Abra o lead no CRM e gere na hora Mensagem WhatsApp, Roteiro de ligação, Roteiro da Reunião e Quebrar Objeção de Fechamento. Marque um Novo agendamento e acompanhe tudo em Agendamentos.'
            }
          ].map(step => (
            <div key={step.n} className="glass-panel" style={{ padding: '28px', background: '#0a0e1a', borderRadius: '8px', border: '0.5px solid rgba(255,255,255,0.12)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', marginBottom: '16px' }}>
                {step.n}
              </div>
              <h3 className="font-headline" style={{ fontSize: '20px', color: '#ffffff', marginBottom: '10px' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </section>

      {/* 6. Simulador Interativo de Faturamento Recorrente (Modelo de Receita) */}
      <section id="calculadora" style={{ padding: '80px 40px 80px 80px', maxWidth: '1400px', margin: '0 auto', background: '#0a0e1a', borderTop: '0.5px solid rgba(255,255,255,0.1)', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
        
        <span className="mono-label" style={{ color: '#38bdf8' }}>MODELO DE RECEITA // PROJEÇÃO INTERATIVA</span>
        <h2 className="font-headline" style={{ fontSize: '32px', color: '#ffffff', marginTop: '8px', marginBottom: '12px' }}>
          Transforme uma venda única em receita todo mês
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '40px', maxWidth: '700px' }}>
          Você não vende só um site, vende tranquilidade. Cobre pela hospedagem, atualizações e manutenção enquanto o LeadSite faz o trabalho pesado.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          
          {/* Sliders de Ajuste */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#cbd5e1' }}>Sites vendidos / mês</span>
                <strong style={{ color: '#6366f1', fontSize: '18px' }}>{sitesPorMes}</strong>
              </div>
              <input 
                type="range" min="1" max="15" value={sitesPorMes} 
                onChange={(e) => setSitesPorMes(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1' }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                <span>1 site</span>
                <span>15 sites</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#cbd5e1' }}>Preço à vista (por site)</span>
                <strong style={{ color: '#22c55e', fontSize: '18px' }}>R$ {precoAvista.toLocaleString('pt-BR')}</strong>
              </div>
              <input 
                type="range" min="300" max="3000" step="100" value={precoAvista} 
                onChange={(e) => setPrecoAvista(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#22c55e' }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                <span>R$ 300</span>
                <span>R$ 3.000</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#cbd5e1' }}>Manutenção mensal (por cliente)</span>
                <strong style={{ color: '#ec4899', fontSize: '18px' }}>R$ {manutencaoMensal.toLocaleString('pt-BR')}</strong>
              </div>
              <input 
                type="range" min="50" max="300" step="10" value={manutencaoMensal} 
                onChange={(e) => setManutencaoMensal(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ec4899' }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                <span>R$ 50/mês</span>
                <span>R$ 300/mês</span>
              </div>
            </div>

          </div>

          {/* Quadro de Projeção Financeira */}
          <div style={{ background: '#111726', padding: '32px', borderRadius: '12px', border: '0.5px solid rgba(99, 102, 241, 0.3)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span className="mono-label" style={{ fontSize: '10px', color: '#94a3b8' }}>RECEITA RECORRENTE MENSAL (APÓS 12 MESES)</span>
              <div className="font-headline" style={{ fontSize: '32px', color: '#6366f1', marginTop: '4px' }}>
                R$ {receitaRecorrenteMensal.toLocaleString('pt-BR')} <span style={{ fontSize: '14px', color: '#94a3b8' }}>/mês ({totalClientesEmUmAno} clientes)</span>
              </div>
            </div>

            <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <span className="mono-label" style={{ fontSize: '10px', color: '#94a3b8' }}>RECEITA ANUAL POTENCIAL (VENDAS + RECORRÊNCIA)</span>
              <div className="font-headline" style={{ fontSize: '32px', color: '#22c55e', marginTop: '4px' }}>
                R$ {receitaAnualPotencial.toLocaleString('pt-BR')}
              </div>
            </div>

            <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '16px', borderRadius: '8px', border: '0.5px solid rgba(236, 72, 153, 0.3)' }}>
              <span className="mono-label" style={{ fontSize: '10px', color: '#ec4899' }}>SEU NÚMERO DA LIBERDADE (RENDA TOTAL MÊS 12)</span>
              <div className="font-headline" style={{ fontSize: '28px', color: '#ffffff', marginTop: '2px' }}>
                R$ {numeroLiberdade.toLocaleString('pt-BR')} <span style={{ fontSize: '12px', color: '#cbd5e1' }}>/mês</span>
              </div>
            </div>

            <button onClick={onOpenApp} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '6px' }}>
              Abrir o Painel e Começar Agora
            </button>
          </div>

        </div>

      </section>

      {/* 7. Tabela de Planos SaaS (Mensal / Anual) */}
      <section id="planos" style={{ padding: '80px 40px 80px 80px', maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="mono-label" style={{ color: '#6366f1' }}>PLANOS E PREÇOS // SEM FIDELIDADE</span>
          <h2 className="font-headline" style={{ fontSize: '36px', color: '#ffffff', marginTop: '8px', marginBottom: '16px' }}>
            Escolha o plano e comece a vender
          </h2>

          {/* Toggle Mensal / Anual */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0a0e1a', padding: '4px', borderRadius: '30px', border: '0.5px solid rgba(255,255,255,0.15)' }}>
            <button 
              onClick={() => setBillingCycle('mensal')}
              style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', background: billingCycle === 'mensal' ? '#6366f1' : 'transparent', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Mensal
            </button>
            <button 
              onClick={() => setBillingCycle('anual')}
              style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', background: billingCycle === 'anual' ? '#6366f1' : 'transparent', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Anual <span style={{ background: '#22c55e', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '10px' }}>-30% OFF</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>
          
          {/* Gratuito */}
          <div className="glass-panel" style={{ padding: '28px', background: '#0a0e1a', borderRadius: '8px', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 className="font-headline" style={{ fontSize: '20px', color: '#ffffff' }}>Gratuito</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 16px' }}>Para explorar a plataforma</p>
              <div className="font-headline" style={{ fontSize: '32px', color: '#ffffff' }}>Grátis</div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> 40 leads por mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> 5 categorias de negócio</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> 2 sites por mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> 10 scripts de abordagem</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> Link público para clientes</li>
              </ul>
            </div>
            <button onClick={onOpenApp} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: '4px' }}>
              Começar grátis
            </button>
          </div>

          {/* Starter */}
          <div className="glass-panel" style={{ padding: '28px', background: '#0a0e1a', borderRadius: '8px', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 className="font-headline" style={{ fontSize: '20px', color: '#ffffff' }}>Starter</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 16px' }}>Para freelancers iniciantes</p>
              <div className="font-headline" style={{ fontSize: '32px', color: '#ffffff' }}>
                {billingCycle === 'anual' ? 'R$ 33,08' : 'R$ 47,00'} <span style={{ fontSize: '13px', color: '#94a3b8' }}>/mês</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> 500 leads por mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> 12 categorias de negócio</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> 15 sites por mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> Exportação CSV</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> Suporte por e-mail</li>
              </ul>
            </div>
            <button onClick={onOpenApp} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: '4px' }}>
              Escolher Starter
            </button>
          </div>

          {/* Pro (Mais Popular) */}
          <div className="glass-panel" style={{ padding: '28px', background: '#111726', borderRadius: '8px', border: '1px solid #6366f1', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(99,102,241,0.2)' }}>
            <span style={{ position: 'absolute', top: '-12px', right: '20px', background: '#6366f1', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '3px 10px', borderRadius: '10px' }}>MAIS POPULAR</span>
            <div>
              <h3 className="font-headline" style={{ fontSize: '20px', color: '#ffffff' }}>Pro</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 16px' }}>Para freelancers ativos</p>
              <div className="font-headline" style={{ fontSize: '32px', color: '#6366f1' }}>
                {billingCycle === 'anual' ? 'R$ 66,42' : 'R$ 89,00'} <span style={{ fontSize: '13px', color: '#94a3b8' }}>/mês</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#6366f1" /> 1.500 leads por mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#6366f1" /> 29 categorias de negócio</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#6366f1" /> 50 sites por mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#6366f1" /> Domínio próprio customizável</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#6366f1" /> Suporte via WhatsApp</li>
              </ul>
            </div>
            <button onClick={onOpenApp} className="btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: '4px' }}>
              Escolher Pro
            </button>
          </div>

          {/* Agência */}
          <div className="glass-panel" style={{ padding: '28px', background: '#0a0e1a', borderRadius: '8px', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 className="font-headline" style={{ fontSize: '20px', color: '#ffffff' }}>Agência</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 16px' }}>Para agências e equipes</p>
              <div className="font-headline" style={{ fontSize: '32px', color: '#ffffff' }}>
                {billingCycle === 'anual' ? 'R$ 133,08' : 'R$ 179,00'} <span style={{ fontSize: '13px', color: '#94a3b8' }}>/mês</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> 3.000 leads por mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> Todas as categorias</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> 90 sites por mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> Retirar marca d'água</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} color="#22c55e" /> WhatsApp prioritário + Onboarding</li>
              </ul>
            </div>
            <button onClick={onOpenApp} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: '4px' }}>
              Escolher Agência
            </button>
          </div>

        </div>

      </section>

      {/* 8. FAQ Accordion */}
      <section style={{ padding: '80px 40px 80px 80px', maxWidth: '1000px', margin: '0 auto', borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="mono-label" style={{ color: '#38bdf8' }}>PERGUNTAS FREQUENTES</span>
          <h2 className="font-headline" style={{ fontSize: '32px', color: '#ffffff', marginTop: '8px' }}>
            Tire suas dúvidas antes de começar
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, index) => (
            <div 
              key={index}
              style={{
                background: '#0a0e1a',
                border: '0.5px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '700',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                {faq.q}
                {openFaqIndex === index ? <ChevronUp size={18} color="#6366f1" /> : <ChevronDown size={18} color="#94a3b8" />}
              </button>

              {openFaqIndex === index && (
                <div style={{ padding: '0 24px 20px', color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6, borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Final */}
      <footer style={{ padding: '32px 40px 32px 80px', borderTop: '0.5px solid rgba(255, 255, 255, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoOrb} alt="REPASS AI" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
          <span className="mono-label" style={{ fontSize: '10px' }}>© REPASS AI ENGINE // TODOS OS DIREITOS RESERVADOS</span>
        </div>
        <button onClick={onOpenApp} className="btn-primary" style={{ padding: '12px 28px', fontSize: '12px', borderRadius: '4px' }}>
          Abrir o Painel Gratuitamente →
        </button>
      </footer>

    </div>
  );
}
