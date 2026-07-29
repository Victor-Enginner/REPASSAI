/**
 * REPASS AI - MODULE // NEURAL_ENGINE
 *
 * Painel de status e teste do motor de IA.
 *
 * Por decisão de produto, esta tela NÃO expõe provedores, modelos nem
 * campos de chave de API. Tudo isso vive em `backend/llm_gateway.py`, lido
 * de `backend/.env`. Motivos:
 *
 *   - Chave de API nunca deve trafegar no navegador do cliente.
 *   - Qual modelo roda por trás é segredo comercial do REPASS AI.
 *   - A rotação de chaves só funciona no servidor.
 */

import React, { useState, useEffect } from 'react';
import { Cpu, Zap, RefreshCw, CheckCircle2, AlertCircle, Play, Terminal, ShieldCheck, KeyRound } from 'lucide-react';
import { executePromptWithFallback, obterStatusDoMotor } from '../services/llmRouter';

export default function AIEngineView() {
  const [testPrompt, setTestPrompt] = useState(
    'Crie uma frase de impacto para uma barbearia premium em São Paulo.'
  );
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [status, setStatus] = useState(null);
  const [carregandoStatus, setCarregandoStatus] = useState(true);

  const atualizarStatus = async () => {
    setCarregandoStatus(true);
    setStatus(await obterStatusDoMotor());
    setCarregandoStatus(false);
  };

  useEffect(() => {
    atualizarStatus();
  }, []);

  const handleRunTest = async () => {
    setIsRunningTest(true);
    setTestResults(null);
    const res = await executePromptWithFallback(
      testPrompt,
      'Você é o assistente do REPASS AI. Responda em português, de forma direta.',
      null,
      { temperature: 0.7 }
    );
    setTestResults(res);
    setIsRunningTest(false);
    atualizarStatus();
  };

  const operacional = status?.operacional;

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 40px)', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>

      {/* Cabeçalho */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-deep) 0%, var(--bg-surface) 100%)',
        borderRadius: '4px',
        padding: 'clamp(20px, 4vw, 32px)',
        color: 'var(--fg-white)',
        marginBottom: '28px',
        border: '0.5px solid rgba(255,255,255,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <span className="mono-label" style={{ color: 'var(--accent-indigo)' }}>MODULE // MOTOR_DE_IA_05</span>
            <h1 className="font-headline" style={{ fontSize: 'clamp(24px, 5vw, 34px)', letterSpacing: '-0.04em', marginTop: '10px' }}>
              MOTOR NEURAL REPASS AI
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--fg-muted)', maxWidth: '640px', marginTop: '10px', lineHeight: 1.6 }}>
              Cadeia de motores com rotação automática. Se um atinge o limite de uso,
              o próximo assume sem interrupção.
            </p>
          </div>

          <span style={{
            background: operacional ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: operacional ? '#22c55e' : '#f87171',
            border: `1px solid ${operacional ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
            fontSize: '11px',
            fontWeight: 800,
            padding: '8px 16px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}>
            {carregandoStatus
              ? <><RefreshCw size={14} className="animate-spin" /> VERIFICANDO</>
              : operacional
                ? <><CheckCircle2 size={14} /> MOTOR OPERACIONAL</>
                : <><AlertCircle size={14} /> MOTOR OFFLINE</>}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>

        {/* Coluna: estado da cadeia */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--fg-white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={17} color="#6366f1" /> Estado da Cadeia
          </h2>

          <div className="glass-panel" style={{ padding: '20px', background: 'var(--bg-surface)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '18px' }}>
              <div>
                <div className="mono-label" style={{ color: 'var(--fg-subtle)', fontSize: '10px' }}>MOTORES PRONTOS</div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--fg-white)', marginTop: '4px' }}>
                  {status?.motores_prontos ?? '—'}
                  <span style={{ fontSize: '14px', color: 'var(--fg-subtle)' }}> / {status?.motores_configurados ?? '—'}</span>
                </div>
              </div>
              <div>
                <div className="mono-label" style={{ color: 'var(--fg-subtle)', fontSize: '10px' }}>CHAVES EM RODÍZIO</div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--fg-white)', marginTop: '4px' }}>
                  {status?.chaves_em_rotacao ?? '—'}
                </div>
              </div>
            </div>

            <button
              onClick={atualizarStatus}
              className="btn-secondary"
              style={{ marginTop: '18px', fontSize: '12px', padding: '8px 14px' }}
            >
              <RefreshCw size={13} /> Atualizar
            </button>
          </div>

          {!carregandoStatus && !operacional && (
            <div className="glass-panel" style={{ padding: '18px', background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.35)', borderRadius: '4px', display: 'flex', gap: '12px' }}>
              <KeyRound size={17} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12.5px', color: 'var(--fg-soft)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--estado-erro-suave)', display: 'block', marginBottom: '4px' }}>
                  Nenhum motor configurado
                </strong>
                Preencha ao menos uma chave em <code style={{ color: 'var(--fg-white)' }}>backend/.env</code> e
                reinicie o backend. O modelo de referência está em <code style={{ color: 'var(--fg-white)' }}>backend/.env.example</code>.
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '18px', background: 'var(--bg-surface)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '4px', display: 'flex', gap: '12px' }}>
            <ShieldCheck size={17} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12.5px', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--fg-white)', display: 'block', marginBottom: '4px' }}>
                Credenciais protegidas no servidor
              </strong>
              As chaves nunca chegam ao navegador. A configuração dos motores é feita
              exclusivamente no ambiente do backend.
            </div>
          </div>
        </div>

        {/* Coluna: teste ao vivo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', background: 'var(--bg-surface)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--fg-white)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={16} color="#6366f1" /> Testar o Motor
            </h2>

            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Insira um prompt de teste..."
              style={{
                width: '100%', height: '86px', borderRadius: '4px',
                border: '0.5px solid rgba(255,255,255,0.15)', padding: '12px',
                fontSize: '12.5px', resize: 'vertical', background: 'var(--bg-card)',
                color: 'var(--fg-white)', fontFamily: 'inherit',
              }}
            />

            <button
              onClick={handleRunTest}
              disabled={isRunningTest}
              className="btn-primary"
              style={{ width: '100%', marginTop: '12px', justifyContent: 'center', opacity: isRunningTest ? 0.6 : 1 }}
            >
              {isRunningTest ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
              {isRunningTest ? 'Executando...' : 'Disparar Teste'}
            </button>
          </div>

          {/* Console */}
          <div style={{
            background: 'var(--bg-deep)', borderRadius: '4px', padding: '20px',
            border: '0.5px solid rgba(255,255,255,0.12)',
            fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', minHeight: '240px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--fg-subtle)', borderBottom: '0.5px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '14px' }}>
              <Terminal size={14} /> CONSOLE
            </div>

            {!testResults && (
              <div style={{ color: 'var(--fg-fraco)', textAlign: 'center', paddingTop: '56px' }}>
                Dispare um teste para ver a resposta do motor.
              </div>
            )}

            {testResults?.success && (
              <div>
                <div style={{ color: 'var(--estado-sucesso)', fontWeight: 700, marginBottom: '10px' }}>✓ RESPOSTA OBTIDA</div>
                <div style={{ color: 'var(--fg-bright)', background: 'var(--bg-card)', padding: '12px', borderRadius: '4px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {testResults.output}
                </div>
              </div>
            )}

            {testResults && !testResults.success && (
              <div>
                <div style={{ color: 'var(--estado-erro)', fontWeight: 700, marginBottom: '10px' }}>✗ FALHA NA GERAÇÃO</div>
                <div style={{ color: 'var(--estado-erro-suave)', background: 'rgba(239,68,68,0.08)', padding: '12px', borderRadius: '4px', lineHeight: 1.6 }}>
                  {testResults.error}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
