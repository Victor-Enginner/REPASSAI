import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Phone, Globe, Star, ArrowUpRight, Download, Send, Check, Sparkles, Filter, RefreshCw, Plus, X, Tag, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
import FaultyTerminal from '../components/ui/FaultyTerminal';

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
    const eventSource = new EventSource('http://localhost:8000/api/logs/stream');
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
      const res = await fetch('http://localhost:8000/api/leads/scan', {
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

        {/* Lead Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {displayLeads.map((lead) => {
            const isSelected = selectedLeadIds.includes(lead.id);

            return (
              <div 
                key={lead.id} 
                className="glass-panel" 
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isSelected ? '1px solid #6366f1' : '0.5px solid rgba(255, 255, 255, 0.12)',
                  background: '#111726',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => toggleSelectLead(lead.id)}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <h3 className="font-headline" style={{ fontSize: '15px', color: '#ffffff', lineHeight: 1.2, wordBreak: 'break-word' }}>
                          {lead.nome}
                        </h3>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{lead.categoria}</span>
                          <span className={`badge badge-${lead.temperatura.toLowerCase()}`}>{lead.temperatura}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="font-headline" style={{ fontSize: '18px', color: '#22c55e' }}>{lead.score}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end', marginTop: '2px' }}>
                        <Star size={10} color="#f59e0b" fill="#f59e0b" /> {lead.avaliacao}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#94a3b8', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={12} /> {lead.telefone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <MapPin size={12} /> {lead.cidade}, {lead.estado}
                      <span className={lead.status_site === 'tem_site' ? 'badge badge-tem-site' : 'badge badge-sem-site'}>
                        {lead.status_site === 'tem_site' ? 'Tem site' : 'Sem site'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button 
                    onClick={() => setActiveLeadForModal(lead)}
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '7px 8px', fontSize: '10px', justifyContent: 'center', borderRadius: '4px' }}
                  >
                    <Eye size={12} /> Auditoria OSINT
                  </button>

                  <button 
                    onClick={() => onGenerateSite(lead)}
                    className="btn-primary" 
                    style={{ flex: 1, padding: '7px 10px', fontSize: '10px', justifyContent: 'center', borderRadius: '4px' }}
                  >
                    Gerar Site
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
