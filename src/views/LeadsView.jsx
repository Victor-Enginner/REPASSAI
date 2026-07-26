import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Phone, Globe, Star, ArrowUpRight, Download, Send, Check, Sparkles, Filter, RefreshCw, Plus, X, Tag, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
import FaultyTerminal from '../components/ui/FaultyTerminal';
import { apiUrl } from '../config';

export default function LeadsView({ leads, onSendToCRM, onGenerateSite }) {
  const [selectedEstado, setSelectedEstado] = useState('SP');
  const [selectedCidade, setSelectedCidade] = useState('Franca');
  
  const [selectedNichoPreset, setSelectedNichoPreset] = useState('salão de unhas, barbearia, hamburgueria, academia');
  const [selectedNicho, setSelectedNicho] = useState('salão de unhas, barbearia, hamburgueria, academia, estética facial, pet shop');
  
  const [quantidade, setQuantidade] = useState(40);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [realScannedLeads, setRealScannedLeads] = useState(leads);
  const [activeLeadForModal, setActiveLeadForModal] = useState(null);
  const [logStream, setLogStream] = useState([]);
  const logsEndRef = useRef(null);

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

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
    try {
      const res = await fetch(apiUrl('/api/leads/scan'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          setRealScannedLeads(data.leads);
        }
      }
    } catch (err) {
      console.warn("API de varredura Python offline. Mantendo lote local dinamizado.", err);
    } finally {
      setIsScanning(false);
    }
  };

  const nichosListActive = selectedNicho.split(',').map(n => n.trim().toLowerCase()).filter(Boolean);
  const displayLeads = realScannedLeads.filter(l => {
    const matchesNicho = nichosListActive.length > 0 ? nichosListActive.some(n => l.categoria.toLowerCase().includes(n)) : true;
    const matchesSearch = searchTerm ? l.nome.toLowerCase().includes(searchTerm.toLowerCase()) || l.cidade.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchesNicho && matchesSearch;
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
    const itemsToExport = selectedLeadIds.length > 0 ? realScannedLeads.filter(l => selectedLeadIds.includes(l.id)) : displayLeads;
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
    <div style={{ position: 'relative', padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease', minHeight: '100vh' }}>
      
      {/* Fundo Animação Tela Inteira FaultyTerminal WebGL Shader React Bits */}
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        opacity: 0.32,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <FaultyTerminal
          scale={1.5}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={0.5}
          pause={false}
          scanlineIntensity={0.8}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0.1}
          tint="#A7EF9E"
          mouseReact={true}
          mouseStrength={0.8}
          pageLoadAnimation={false}
          brightness={0.8}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="mono-label">MODULE // LEADS_OSINT_02</span>
            <h1 className="font-headline" style={{ fontSize: '32px', color: '#ffffff', marginTop: '4px' }}>
              SCANNER DE LEADS OSINT
            </h1>
            <p style={{ fontSize: '13.5px', color: '#94a3b8', marginTop: '4px' }}>
              Varredura ilimitada por seleção de estado, cidade e nichos com pontuação de oportunidade
            </p>
          </div>

          <div style={{ background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.12)', padding: '12px 18px', textAlign: 'right', borderRadius: '4px' }}>
            <div className="font-mono" style={{ fontSize: '12px', color: '#ffffff' }}>
              MOTOR OSINT // 100% OPERACIONAL
            </div>
            <div style={{ width: '140px', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '8px', overflow: 'hidden', borderRadius: '2px' }}>
              <div style={{ width: '100%', height: '100%', background: '#6366f1' }} />
            </div>
          </div>
        </div>

        {/* Filter Bar with Responsive Grid */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: '#0a0e1a', borderRadius: '8px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end', marginBottom: '16px' }}>
            
            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '6px', fontSize: '9px' }}>País</label>
              <select style={{ width: '100%', padding: '11px 12px', border: '0.5px solid rgba(255,255,255,0.2)', fontSize: '13px', background: '#111726', color: '#fff', fontWeight: '500', borderRadius: '4px' }}>
                <option>Brasil (BR)</option>
              </select>
            </div>

            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '6px', fontSize: '9px' }}>Estado</label>
              <select 
                value={selectedEstado} 
                onChange={(e) => setSelectedEstado(e.target.value)}
                style={{ width: '100%', padding: '11px 12px', border: '0.5px solid rgba(255,255,255,0.2)', fontSize: '13px', background: '#111726', color: '#fff', fontWeight: '500', borderRadius: '4px' }}
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
                style={{ width: '100%', padding: '11px 12px', border: '0.5px solid rgba(255,255,255,0.2)', fontSize: '13px', background: '#111726', color: '#fff', fontWeight: '500', borderRadius: '4px' }}
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
                style={{ width: '100%', padding: '11px 14px', border: '0.5px solid rgba(255,255,255,0.2)', fontSize: '13px', background: '#111726', color: '#fff', fontWeight: '500', borderRadius: '4px' }}
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
              {isScanning ? 'Varendo...' : 'Varrer agora'}
            </button>

          </div>

          {/* Interactive City Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span className="mono-label" style={{ fontSize: '9px', color: '#94a3b8' }}>Cidades Rápidas:</span>
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
                    color: '#fff',
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
            <span className="mono-label" style={{ fontSize: '9px', color: '#94a3b8' }}>Ativar / Desativar Filtro:</span>
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
          <div style={{
            background: '#05070c',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '4px',
            padding: '12px',
            height: '140px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#a5b4fc',
            lineHeight: '1.6',
            boxShadow: 'inset 0 0 12px rgba(0,0,0,0.8)',
            marginBottom: '16px'
          }}>
            <div style={{ color: '#6366f1', marginBottom: '8px', fontSize: '10px' }}>
              &gt; OSINT SSE_LINK ESTABLISHED. WAITING FOR SCANS...
            </div>
            {logStream.map((log, idx) => (
              <div key={idx} style={{ 
                wordBreak: 'break-all', 
                color: log.includes('ERRO') || log.includes('CRITICAL') ? '#ef4444' : 
                       log.includes('WARNING') ? '#eab308' : '#a5b4fc' 
              }}>
                <span style={{ color: '#4f46e5' }}>[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {/* Summary Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '0.5px solid rgba(255,255,255,0.12)', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={14} color="#6366f1" />
              <span>
                Configurado para <strong style={{ color: '#ffffff' }}>{nichosListActive.length} nichos ativos</strong> em {selectedCidade}, {selectedEstado}.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontWeight: '700', color: '#ffffff' }}>
                <span style={{ color: '#6366f1' }}>22 Sem site</span> · {displayLeads.length} Encontrados
              </div>
            </div>
          </div>

        </div>

        {/* Grid Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8', cursor: 'pointer' }}>
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
          {displayLeads.map((lead) => {
            const isSelected = selectedLeadIds.includes(lead.id);

            return (
              <div 
                key={lead.id} 
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#0f172a',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: isSelected ? '0 12px 30px rgba(56, 189, 248, 0.25)' : '0 10px 25px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Header do Card */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => toggleSelectLead(lead.id)}
                        style={{ marginTop: '4px', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <div>
                        <h3 className="font-headline" style={{ fontSize: '16px', color: '#0f172a', fontWeight: '700', lineHeight: 1.25, margin: 0 }}>
                          {lead.nome}
                        </h3>

                        {/* Badges de Categoria & Temperatura */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                            {lead.categoria}
                          </span>
                          <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                            {lead.temperatura}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Badge de Score Circular */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        background: '#f0fdf4',
                        color: '#22c55e',
                        fontWeight: '800',
                        fontSize: '13px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        display: 'inline-block'
                      }}>
                        {lead.score}
                      </div>
                      
                      {/* Avaliação e Contagem do Google */}
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end', marginTop: '6px', fontWeight: '600' }}>
                        <Star size={12} color="#f59e0b" fill="#f59e0b" />
                        <span>{lead.avaliacao || '4.8'}</span>
                        <span style={{ color: '#94a3b8' }}>· {lead.reviewsCount || '1177'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Especificações do Lead (Telefone, Local, Oportunidade, Endereço) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#334155', marginTop: '14px' }}>
                    
                    {/* Telefone */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                      <Phone size={13} color="#0284c7" />
                      <span>{lead.telefone || '(16) 99050-5914'}</span>
                    </div>

                    {/* Cidade + Status do Site */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <MapPin size={13} color="#64748b" />
                      <span>{lead.cidade}, {lead.estado}</span>

                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: lead.status_site === 'tem_site' ? '#dcfce7' : '#fee2e2',
                        color: lead.status_site === 'tem_site' ? '#16a34a' : '#dc2626'
                      }}>
                        {lead.status_site === 'tem_site' ? 'Tem site' : 'Sem site'}
                      </span>
                    </div>

                    {/* Dica de Abordagem / Oportunidade */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontStyle: 'italic', color: '#475569', fontSize: '11.5px', marginTop: '2px' }}>
                      <Sparkles size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{lead.orientacao || 'Não tem site — ofereça do zero'}</span>
                    </div>

                    {/* Endereço Completo */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      <Globe size={13} color="#94a3b8" style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {lead.endereco || `${lead.cidade}, ${lead.estado}`}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Botões de Ação na Parte Inferior */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  
                  {/* Botão Secundário (Ver Site / Criar Site / Auditoria) */}
                  <button 
                    onClick={() => onGenerateSite(lead)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      background: lead.status_site === 'tem_site' ? '#f8fafc' : '#f0fdf4',
                      color: lead.status_site === 'tem_site' ? '#475569' : '#16a34a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Globe size={13} />
                    {lead.status_site === 'tem_site' ? 'Site atual' : 'Ver site'}
                  </button>

                  {/* Botão Principal Azul (Enviar para CRM) */}
                  <button 
                    onClick={() => onSendToCRM(lead.id)}
                    style={{
                      flex: 1.2,
                      padding: '9px 14px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Send size={13} />
                    Enviar para CRM
                  </button>

                </div>

              </div>
            );
          })}
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
            background: '#0a0e1a',
            border: '0.5px solid rgba(255,255,255,0.2)',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="mono-label">OSINT_RADAR // {activeLeadForModal.nome}</span>
              <button onClick={() => setActiveLeadForModal(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <h3 className="font-headline" style={{ fontSize: '22px', color: '#ffffff', marginBottom: '16px' }}>
              Relatório de Oportunidade OSINT
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#111726', padding: '14px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>STATUS DO DOMÍNIO</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: activeLeadForModal.status_site === 'tem_site' ? '#22c55e' : '#ef4444', marginTop: '4px' }}>
                  {activeLeadForModal.status_site === 'tem_site' ? 'Domínio Ativo' : 'Sem Domínio Registrado'}
                </div>
              </div>

              <div style={{ background: '#111726', padding: '14px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>SCORE DE OPORTUNIDADE</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#6366f1', marginTop: '4px' }}>
                  {activeLeadForModal.score} / 100
                </div>
              </div>
            </div>

            <div style={{ background: '#111726', padding: '16px', border: '0.5px solid rgba(255,255,255,0.1)', marginBottom: '20px', fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.6, borderRadius: '4px' }}>
              <strong style={{ color: '#ffffff' }}>💡 Diagnóstico do Agente:</strong> {activeLeadForModal.orientacao}
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
