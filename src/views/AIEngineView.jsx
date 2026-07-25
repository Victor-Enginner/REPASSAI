import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Shield, Key, RefreshCw, CheckCircle2, AlertCircle, Play, Server, Terminal, Sparkles, Layers, Globe } from 'lucide-react';
import { DEFAULT_CONFIG, executePromptWithFallback } from '../services/llmRouter';

export default function AIEngineView() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('repass_llm_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [testPrompt, setTestPrompt] = useState('Crie uma frase de impacto para uma barbearia premium em São Paulo.');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('repass_llm_config', JSON.stringify(config));
    } catch (err) {
      console.warn("Falha ao salvar chaves no localStorage:", err);
    }
  }, [config]);

  const handleToggleProvider = (id) => {
    setConfig(prev => ({
      ...prev,
      providers: prev.providers.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    }));
  };

  const handleUpdateApiKey = (id, key) => {
    setConfig(prev => ({
      ...prev,
      providers: prev.providers.map(p => p.id === id ? { ...p, apiKey: key } : p)
    }));
  };

  const handleRunTest = async () => {
    setIsRunningTest(true);
    setTestResults(null);

    const res = await executePromptWithFallback(testPrompt, "Você é o assistente IA do REPASS AI.", config);
    setTestResults(res);
    setIsRunningTest(false);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header with Dark Cyberpunk Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0b0f19 0%, #111827 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: '#fff',
        marginBottom: '28px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        border: '0.5px solid rgba(255,255,255,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '0.5px solid rgba(56, 189, 248, 0.3)', marginBottom: '12px' }}>
              <Zap size={14} /> Laboratório Digital · Motor de IA sem Limites
            </div>

            <h1 className="font-headline" style={{ fontSize: '32px', color: '#ffffff', letterSpacing: '-0.5px' }}>
              Roteador Multi-Provedor de IA (LLM Engine)
            </h1>

            <p style={{ fontSize: '14px', color: '#cbd5e1', maxWidth: '750px', marginTop: '8px', lineHeight: 1.6 }}>
              Bem-vindo ao seu painel de chaves de IA. Cole suas chaves do <strong>OpenRouter, Groq, Hugging Face ou Gemini</strong>. Se qualquer chave bater no limite de requisições, o sistema aciona automaticamente o próximo provedor em fração de segundos com <strong>Zero Bloqueios</strong>.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ background: '#10b981', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '6px 14px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> FALLBACK DE CHAVES ATIVO
            </span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Providers Config, Right Live Test & Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: '28px' }}>
        
        {/* Left Side: Providers Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className="font-headline" style={{ fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#6366f1" /> Provedores Conectados & Cadeia de Prioridades
          </h2>

          {config.providers.map((prov, index) => (
            <div 
              key={prov.id}
              className="glass-panel"
              style={{
                borderRadius: '12px',
                padding: '20px',
                background: '#0a0e1a',
                border: prov.enabled ? '0.5px solid rgba(255, 255, 255, 0.15)' : '0.5px dashed rgba(255, 255, 255, 0.08)',
                opacity: prov.enabled ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-headline" style={{ fontSize: '16px', color: '#ffffff' }}>{prov.name}</h3>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Modelo Padrão: <code style={{ color: '#38bdf8' }}>{prov.model}</code></span>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: prov.enabled ? '#22c55e' : '#94a3b8' }}>
                  <input 
                    type="checkbox" 
                    checked={prov.enabled} 
                    onChange={() => handleToggleProvider(prov.id)} 
                  />
                  {prov.enabled ? 'Habilitado' : 'Desativado'}
                </label>
              </div>

              {/* API Key Input */}
              {prov.id !== 'ollama' && (
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <Key size={12} color="#6366f1" /> Chave de API ({prov.id.toUpperCase()})
                  </label>
                  <input 
                    type="password"
                    value={prov.apiKey}
                    onChange={(e) => handleUpdateApiKey(prov.id, e.target.value)}
                    placeholder="Cole sua API Key aqui..."
                    style={{ width: '100%', padding: '10px 14px', background: '#111726', borderRadius: '4px', border: '0.5px solid rgba(255, 255, 255, 0.2)', fontSize: '12px', fontFamily: 'monospace', color: '#ffffff', outline: 'none' }}
                  />
                </div>
              )}

              {prov.id === 'ollama' && (
                <div style={{ background: '#111726', borderRadius: '4px', padding: '10px 14px', fontSize: '11.5px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', border: '0.5px solid rgba(56,189,248,0.2)' }}>
                  <Server size={14} /> Rodando localmente via Ollama na porta 11434. 100% Gratuito sem limite.
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Side: Live Test & Router Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '20px', background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.15)' }}>
            <h2 className="font-headline" style={{ fontSize: '16px', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={16} color="#6366f1" /> Testar Roteador ao Vivo
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea 
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Insira um prompt de teste..."
                style={{ width: '100%', height: '80px', background: '#111726', border: '0.5px solid rgba(255, 255, 255, 0.2)', padding: '10px', fontSize: '12px', color: '#ffffff', resize: 'none', outline: 'none' }}
              />

              <button 
                onClick={handleRunTest}
                disabled={isRunningTest}
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', opacity: isRunningTest ? 0.7 : 1, padding: '12px' }}
              >
                {isRunningTest ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                {isRunningTest ? 'Executando Cadeia de Fallback...' : 'Disparar Teste de Roteador'}
              </button>
            </div>
          </div>

          {/* Execution Logs Terminal */}
          <div style={{
            background: '#0a0e1a',
            borderRadius: '12px',
            padding: '20px',
            color: '#38bdf8',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            minHeight: '260px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '0.5px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', borderBottom: '0.5px solid rgba(255, 255, 255, 0.12)', paddingBottom: '10px', marginBottom: '12px' }}>
              <Terminal size={14} color="#6366f1" /> Console de Roteamento & Logs em Tempo Real
            </div>

            {testResults ? (
              <div>
                <div style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: '8px' }}>
                  ✅ RESPOSTA OBTIDA VIA: {testResults.provider} ({testResults.model})
                </div>

                <div style={{ color: '#ffffff', background: '#111726', padding: '12px', border: '0.5px solid rgba(255,255,255,0.1)', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                  {testResults.output}
                </div>

                <div style={{ color: '#cbd5e1', fontSize: '11px' }}>
                  <strong style={{ color: '#ffffff' }}>Rastro da Execução (Fallback Chain):</strong>
                  {testResults.logs.map((log, i) => (
                    <div key={i} style={{ marginTop: '4px' }}>{log}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '60px' }}>
                Clique em "Disparar Teste" para ver a ordem de execução do roteador e o chaveamento automático de provedores.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
