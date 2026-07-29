import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Phone, Globe, Star, ArrowUpRight, Download, Send, Check, Sparkles, Filter, RefreshCw, Plus, X, Tag, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiUrl } from '../config';
import { cabecalhoAuth } from '../services/authService';
import LeadCard from '../components/LeadCard';

function gerarLeadsLocalmente(cidade, estado, nichosStr, qtd = 20) {
  const nichos = (nichosStr || 'Serviços').split(',').map(n => n.trim()).filter(Boolean);
  const sufixos = ['Especializada', 'VIP', 'Prime', 'Express', 'Gourmet', 'Imperial', 'Master', 'Studio', 'Centro', 'Premium'];
  
  const resultados = [];
  const total = Math.min(qtd || 20, 30);
  
  for (let i = 0; i < total; i++) {
    const nicho = nichos[i % nichos.length] || 'Serviços';
    const sufixo = sufixos[i % sufixos.length];
    const nichoCap = nicho.charAt(0).toUpperCase() + nicho.slice(1);
    const nome = `${nichoCap} ${sufixo} ${cidade}`;
    const semSite = i % 2 === 0 || i % 3 === 0;
    const ddd = estado === 'SP' ? '16' : (estado === 'GO' ? '62' : (estado === 'RJ' ? '21' : '31'));
    
    resultados.push({
      id: `scanned-${Date.now()}-${i}`,
      nome: nome,
      categoria: nichoCap,
      cidade: cidade,
      estado: estado,
      bairro: 'Centro',
      // NUNCA inventar contato. O código anterior sorteava os dígitos do
      // telefone, e um número sorteado pertence a alguém — o operador
      // mandaria mensagem comercial para um estranho achando que era o lead.
      is_demo: true,
      telefone: null,
      whatsapp: null,
      site: semSite ? null : `https://${nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
      status_site: semSite ? 'sem_site' : 'tem_site',
      score: semSite ? 100 : Math.floor(60 + Math.random() * 30),
      temperatura: 'Quente',
      avaliacao: (4.2 + Math.random() * 0.7).toFixed(1),
      reviewsCount: Math.floor(20 + Math.random() * 500),
      endereco: `Av. Principal, ${100 + i * 25} - Centro, ${cidade} - ${estado}`,
      orientacao: 'Exemplo de layout — rode a varredura real para dados verdadeiros.',
      // 'Base' é o mesmo valor que o backend usa para lead recém-varrido.
      // Com 'Leads em Aberto' eles caíam direto na primeira coluna do funil
      // sem ninguém ter enviado nada, esvaziando o sentido do botão.
      status_crm: 'Base',
      criado_em: new Date().toISOString()
    });
  }
  
  return resultados;
}

export default function LeadsView({ leads, onLeadsScanned, onSendToCRM, onGenerateSite }) {
  const [selectedEstado, setSelectedEstado] = useState('SP');
  const [selectedCidade, setSelectedCidade] = useState('Franca');
  
  const [selectedNichoPreset, setSelectedNichoPreset] = useState('salão de unhas, barbearia, hamburgueria, academia');
  const [selectedNicho, setSelectedNicho] = useState('salão de unhas, barbearia, hamburgueria, academia, estética facial, pet shop');
  
  const [quantidade, setQuantidade] = useState(40);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  // Os leads da varredura NÃO ficam em estado local desta view.
  //
  // Ficavam, e isso causava dois defeitos: a aba desmonta ao trocar de menu,
  // então a varredura sumia ao ir no Funil e voltar; e o card não reagia ao
  // "Enviar para CRM", porque o App atualizava a lista dele enquanto a tela
  // continuava desenhando a cópia local. Agora existe uma fonte de verdade só.
  const [activeLeadForModal, setActiveLeadForModal] = useState(null);
  const [logStream, setLogStream] = useState([]);
  const logBoxRef = useRef(null);

  useEffect(() => {
    const eventSource = new EventSource(apiUrl('/api/logs/stream'));
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) {
          setLogStream(prev => [...prev.slice(-49), data.message]);
        }
      } catch (err) {}
    };
    return () => eventSource.close();
  }, []);

  // Mantém o log rolado no fim SEM mexer na rolagem da página.
  //
  // Antes isto usava `scrollIntoView`, que rola TODOS os ancestrais roláveis
  // — inclusive o documento. Como o backend emite uma linha de log por lugar
  // encontrado, a página descia sozinha durante a varredura inteira e o
  // operador perdia de vista os controles.
  //
  // Mexer só no `scrollTop` do próprio console resolve: o contêiner rola,
  // a página fica parada.
  useEffect(() => {
    const caixa = logBoxRef.current;
    if (!caixa) return;

    // Se o operador subiu o log para reler algo, não arrasta ele de volta.
    const estaNoFim = caixa.scrollHeight - caixa.scrollTop - caixa.clientHeight < 40;
    if (estaNoFim) caixa.scrollTop = caixa.scrollHeight;
  }, [logStream]);

  const OPCOES_NICHOS_DROPDOWN = [
    { label: 'Todos os Nichos (Varredura Ampla)', value: 'salão de unhas, barbearia, hamburgueria, academia, estética facial, pet shop, odontologia, oficina mecânica' },
    { label: 'Salão de Unhas & Estética Facial', value: 'salão de unhas, estética facial, manicure, spa' },
    { label: 'Barbearia & Estilo VIP', value: 'barbearia, corte masculino, barba' },
    { label: 'Hamburgueria & Gastronomia', value: 'hamburgueria, restaurante, lanchonete, marmita' },
    { label: 'Pet Shop & Cuidados Animais', value: 'pet shop, banho e tosa, clínica veterinária' },
    { label: 'Academias & Fitness', value: 'academia, crossfit, pilates' },
    { label: 'Odontologia & Saúde', value: 'odontologia, dentista, consultório médico' },
    { label: 'Oficina Mecânica & Auto', value: 'oficina mecânica, auto center, funilaria' },
    { label: 'Pizzarias & Delivery', value: 'pizzaria, delivery, restaurante' },
    { label: 'Imobiliária & Corretores', value: 'imobiliária, corretor de imóveis, vendas' }
  ];

  const CIDADES_SUGERIDAS = [
    { nome: 'Franca', estado: 'SP' },
    { nome: 'São Paulo', estado: 'SP' },
    { nome: 'Goiânia', estado: 'GO' },
    { nome: 'Campinas', estado: 'SP' },
    { nome: 'Ribeirão Preto', estado: 'SP' },
    { nome: 'Rio de Janeiro', estado: 'RJ' },
    { nome: 'Belo Horizonte', estado: 'MG' }
  ];

  const NICHOS_SUGERIDOS = [
    'salão de unhas',
    'barbearia',
    'hamburgueria',
    'estética facial',
    'pet shop',
    'academia',
    'odontologia',
    'oficina mecânica',
    'pizzaria',
    'imobiliária'
  ];

  const handleNichoDropdownChange = (e) => {
    const val = e.target.value;
    setSelectedNichoPreset(val);
    setSelectedNicho(val);
  };

  const toggleNichoChip = (nicho) => {
    const list = selectedNicho.split(',').map(n => n.trim().toLowerCase()).filter(Boolean);
    if (list.includes(nicho.toLowerCase())) {
      const updated = list.filter(n => n !== nicho.toLowerCase());
      setSelectedNicho(updated.join(', '));
    } else {
      const updated = [...list, nicho.toLowerCase()];
      setSelectedNicho(updated.join(', '));
    }
  };

  const handleSelectCityChip = (cidadeObj) => {
    setSelectedCidade(cidadeObj.nome);
    setSelectedEstado(cidadeObj.estado);
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    const logInicio = `[OSINT SCANNER] Iniciando varredura em ${selectedCidade}, ${selectedEstado} (${selectedNicho})...`;
    setLogStream(prev => [...prev.slice(-49), logInicio]);

    try {
      const res = await fetch(apiUrl('/api/leads/scan'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...cabecalhoAuth()
        },
        body: JSON.stringify({
          estado: selectedEstado,
          cidade: selectedCidade,
          nichos: selectedNicho,
          max_results: quantidade
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.leads && data.leads.length > 0) {
          onLeadsScanned(data.leads);
          setLogStream(prev => [...prev.slice(-49), `[OSINT SUCCESS] Varredura concluída! ${data.leads.length} leads encontrados em ${selectedCidade}, ${selectedEstado}.`]);
          return;
        }
      }

      // A varredura falhou. Dizer o motivo real importa: antes o app
      // apresentava exemplos como se fossem o resultado da busca, e o
      // operador não tinha como saber que aqueles negócios não existem.
      const motivo = res.status === 429
        ? 'muitas varreduras seguidas — aguarde um minuto'
        : res.status === 401
          ? 'sessao expirada, faca login novamente'
          : `a busca real nao respondeu (HTTP ${res.status})`;
      const localLeads = gerarLeadsLocalmente(selectedCidade, selectedEstado, selectedNicho, quantidade);
      onLeadsScanned(localLeads);
      setLogStream(prev => [...prev.slice(-49), `[OSINT AVISO] Varredura real indisponivel: ${motivo}. Exibindo ${localLeads.length} exemplos de layout — NAO sao negocios reais.`]);
    } catch (err) {
      console.warn("API de varredura offline. Exibindo exemplos de layout.", err);
      const localLeads = gerarLeadsLocalmente(selectedCidade, selectedEstado, selectedNicho, quantidade);
      onLeadsScanned(localLeads);
      setLogStream(prev => [...prev.slice(-49), `[OSINT AVISO] Backend fora do ar. Exibindo ${localLeads.length} exemplos de layout — NAO sao negocios reais.`]);
    } finally {
      setIsScanning(false);
    }
  };

  const nichosListActive = selectedNicho.split(',').map(n => n.trim().toLowerCase()).filter(Boolean);

  /**
   * Leads exibidos.
   *
   * O seletor de nicho define O QUE VARRER, não o que mostrar. Antes esta
   * lista refiltrava por nicho resultados que o backend JÁ tinha filtrado
   * por nicho — e como a comparação era `categoria.includes(nicho)`, um
   * lead de categoria "Restaurante" nunca casava com o nicho "hamburgueria"
   * que o produziu. Resultado: "Todos os Nichos" exibia 0 encontrados.
   *
   * Aqui sobra apenas a busca textual, que é filtro de exibição de fato.
   */
  // Lead enviado ao CRM sai da triagem: continuar aparecendo aqui faz o
  // operador abordar o mesmo negócio duas vezes.
  //
  // O critério é o marcador `enviado_crm`, não `status_crm`: este último vem
  // como "Base" do backend, "Leads em Aberto" do gerador local e "Abordados"
  // do painel, então filtrar por ele descartava os 36 leads reais da varredura.
  const emTriagem = leads.filter((l) => !l.enviado_crm);

  const displayLeads = emTriagem.filter((l) => {
    if (!searchTerm) return true;
    const alvo = `${l.nome || ''} ${l.cidade || ''} ${l.categoria || ''}`.toLowerCase();
    return alvo.includes(searchTerm.toLowerCase());
  });

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === displayLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(displayLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter(i => i !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleExportCSV = () => {
    const itemsToExport = selectedLeadIds.length > 0 ? leads.filter(l => selectedLeadIds.includes(l.id)) : displayLeads;
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Nome,Categoria,Cidade,Estado,Telefone,Status Site,Score"].join(",") + "\n"
      + itemsToExport.map(e => `"${e.nome}","${e.categoria}","${e.cidade}","${e.estado}","${e.telefone}","${e.status_site}",${e.score}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_repassai.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ position: 'relative', padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="mono-label">MODULE // LEADS_OSINT_02</span>
            <h1 className="font-headline" style={{ fontSize: '32px', color: 'var(--fg-white)', marginTop: '4px' }}>
              SCANNER DE LEADS OSINT
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--fg-muted)', marginTop: '4px' }}>
              Varredura ilimitada por seleção de estado, cidade e nichos com pontuação de oportunidade
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '0.5px solid rgba(255, 255, 255, 0.12)', padding: '12px 18px', textAlign: 'right', borderRadius: '4px' }}>
            <div className="font-mono" style={{ fontSize: '12px', color: 'var(--fg-white)' }}>
              MOTOR OSINT // 100% OPERACIONAL
            </div>
            <div style={{ width: '140px', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '8px', overflow: 'hidden', borderRadius: '2px' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--accent-indigo)' }} />
            </div>
          </div>
        </div>

        {/* Filter Bar with Responsive Grid */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end', marginBottom: '16px' }}>
            
            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '6px', fontSize: '9px' }}>País</label>
              <select style={{ width: '100%', padding: '11px 12px', border: '0.5px solid rgba(255,255,255,0.2)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--fg-white)', fontWeight: '500', borderRadius: '4px' }}>
                <option>Brasil (BR)</option>
              </select>
            </div>

            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '6px', fontSize: '9px' }}>Estado</label>
              <select 
                value={selectedEstado} 
                onChange={(e) => setSelectedEstado(e.target.value)}
                style={{ width: '100%', padding: '11px 12px', border: '0.5px solid rgba(255,255,255,0.2)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--fg-white)', fontWeight: '500', borderRadius: '4px' }}
              >
                <option value="SP">São Paulo (SP)</option>
                <option value="GO">Goiás (GO)</option>
                <option value="RJ">Rio de Janeiro (RJ)</option>
                <option value="MG">Minas Gerais (MG)</option>
              </select>
            </div>

            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '6px', fontSize: '9px' }}>Cidade</label>
              <select 
                value={selectedCidade} 
                onChange={(e) => setSelectedCidade(e.target.value)}
                style={{ width: '100%', padding: '11px 12px', border: '0.5px solid rgba(255,255,255,0.2)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--fg-white)', fontWeight: '500', borderRadius: '4px' }}
              >
                <option value="Franca">Franca</option>
                <option value="São Paulo">São Paulo</option>
                <option value="Goiânia">Goiânia</option>
                <option value="Campinas">Campinas</option>
                <option value="Ribeirão Preto">Ribeirão Preto</option>
                <option value="Rio de Janeiro">Rio de Janeiro</option>
                <option value="Belo Horizonte">Belo Horizonte</option>
              </select>
            </div>

            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '6px', fontSize: '9px' }}>Nicho para Varredura (Selecione na Lista)</label>
              <select 
                value={selectedNichoPreset} 
                onChange={handleNichoDropdownChange}
                style={{ width: '100%', padding: '11px 14px', border: '0.5px solid rgba(255,255,255,0.2)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--fg-white)', fontWeight: '500', borderRadius: '4px' }}
              >
                {OPCOES_NICHOS_DROPDOWN.map(opt => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleRunScan} className="btn-primary" style={{ height: '44px', justifyContent: 'center', fontSize: '12px', borderRadius: '4px' }}>
              {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              {isScanning ? 'Varrendo...' : 'Varrer agora'}
            </button>

          </div>

          {/* Interactive City Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span className="mono-label" style={{ fontSize: '9px', color: 'var(--fg-muted)' }}>Cidades Rápidas:</span>
            {CIDADES_SUGERIDAS.map(c => {
              const isSelected = selectedCidade.toLowerCase() === c.nome.toLowerCase();
              return (
                <button
                  key={c.nome}
                  onClick={() => handleSelectCityChip(c)}
                  style={{
                    padding: '4px 10px',
                    border: isSelected ? '0.5px solid #6366f1' : '0.5px solid rgba(255,255,255,0.15)',
                    background: isSelected ? '#6366f1' : '#111726',
                    color: 'var(--fg-white)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  {c.nome}, {c.estado}
                </button>
              );
            })}
          </div>

          {/* Interactive Niche Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span className="mono-label" style={{ fontSize: '9px', color: 'var(--fg-muted)' }}>Ativar / Desativar Filtro:</span>
            {NICHOS_SUGERIDOS.map(nicho => {
              const isSelected = nichosListActive.includes(nicho.toLowerCase());
              return (
                <button
                  key={nicho}
                  onClick={() => toggleNichoChip(nicho)}
                  style={{
                    padding: '4px 10px',
                    border: isSelected ? '0.5px solid #6366f1' : '0.5px solid rgba(255,255,255,0.15)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : '#111726',
                    color: isSelected ? '#a5b4fc' : '#94a3b8',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '4px'
                  }}
                >
                  {isSelected ? <Check size={11} color="#6366f1" /> : <Plus size={11} />}
                  {nicho}
                </button>
              );
            })}
          </div>
          {/* SSE Live Log Terminal */}
          <div ref={logBoxRef} style={{
            background: 'var(--bg-poco)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '4px',
            padding: '12px',
            height: '140px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--accent-indigo-suave)',
            lineHeight: '1.6',
            boxShadow: 'inset 0 0 12px rgba(0,0,0,0.8)',
            marginBottom: '16px'
          }}>
            <div style={{ color: 'var(--accent-indigo)', marginBottom: '8px', fontSize: '10px' }}>
              &gt; OSINT SSE_LINK ESTABLISHED. WAITING FOR SCANS...
            </div>
            {logStream.map((log, idx) => (
              <div key={idx} style={{ 
                wordBreak: 'break-all', 
                color: log.includes('ERRO') || log.includes('CRITICAL') ? '#ef4444' : 
                       log.includes('WARNING') ? '#eab308' : '#a5b4fc' 
              }}>
                <span style={{ color: 'var(--accent-indigo-forte)' }}>[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>

          {/* Summary Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '0.5px solid rgba(255,255,255,0.12)', fontSize: '12px', color: 'var(--fg-muted)', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={14} color="#6366f1" />
              <span>
                Configurado para <strong style={{ color: 'var(--fg-white)' }}>{nichosListActive.length} nichos ativos</strong> em {selectedCidade}, {selectedEstado}.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontWeight: '700', color: 'var(--fg-white)' }}>
                {/* Contado dos dados reais. Antes era "22" fixo no código,
                    que mentia para o operador em toda varredura. */}
                <span style={{ color: 'var(--accent-indigo)' }}>
                  {displayLeads.filter(l => l.status_site !== 'tem_site').length} Sem site
                </span> · {displayLeads.length} Encontrados
              </div>
            </div>
          </div>

        </div>

        {/* Grid Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fg-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={selectedLeadIds.length === displayLeads.length && displayLeads.length > 0} 
              onChange={toggleSelectAll} 
            />
            Selecionar todos ({selectedLeadIds.length} selecionados)
          </label>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleExportCSV} className="btn-secondary" style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '4px' }}>
              <Download size={14} /> Exportar CSV
            </button>

            <button 
              onClick={() => {
                const targets = selectedLeadIds.length > 0 ? selectedLeadIds : [displayLeads[0]?.id];
                targets.forEach(id => id && onSendToCRM(id));
              }}
              className="btn-primary" 
              style={{ fontSize: '11px', padding: '8px 20px', borderRadius: '4px' }}
            >
              <Send size={14} /> Enviar para CRM
            </button>
          </div>
        </div>

        {/* Lead Cards Grid - Redesenhado no estilo fiel da UseLeadSite */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {displayLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              selecionado={selectedLeadIds.includes(lead.id)}
              onAlternarSelecao={toggleSelectLead}
              onEnviarCRM={onSendToCRM}
              onGerarSite={onGenerateSite}
            />
          ))}
        </div>

      </div>

      {/* OSINT Deep Audit Modal */}
      {activeLeadForModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '0.5px solid rgba(255,255,255,0.2)',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="mono-label">OSINT_RADAR // {activeLeadForModal.nome}</span>
              <button onClick={() => setActiveLeadForModal(null)} style={{ background: 'none', border: 'none', color: 'var(--fg-white)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <h3 className="font-headline" style={{ fontSize: '22px', color: 'var(--fg-white)', marginBottom: '16px' }}>
              Relatório de Oportunidade OSINT
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '14px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--fg-muted)' }}>STATUS DO DOMÍNIO</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: activeLeadForModal.status_site === 'tem_site' ? '#22c55e' : '#ef4444', marginTop: '4px' }}>
                  {activeLeadForModal.status_site === 'tem_site' ? 'Domínio Ativo' : 'Sem Domínio Registrado'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '14px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--fg-muted)' }}>SCORE DE OPORTUNIDADE</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-indigo)', marginTop: '4px' }}>
                  {activeLeadForModal.score} / 100
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '16px', border: '0.5px solid rgba(255,255,255,0.1)', marginBottom: '20px', fontSize: '12.5px', color: 'var(--fg-soft)', lineHeight: 1.6, borderRadius: '4px' }}>
              <strong style={{ color: 'var(--fg-white)' }}>💡 Diagnóstico do Agente:</strong> {activeLeadForModal.orientacao}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { onSendToCRM(activeLeadForModal.id); setActiveLeadForModal(null); }} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', borderRadius: '4px' }}>
                <Send size={13} /> Enviar p/ CRM
              </button>
              <button onClick={() => { onGenerateSite(activeLeadForModal); setActiveLeadForModal(null); }} className="btn-primary" style={{ flex: 1, justifyContent: 'center', borderRadius: '4px' }}>
                <Sparkles size={13} /> Criar Site Agora
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
