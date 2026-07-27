/**
 * REPASS AI - Widget Flutuante do Chatbot Agêntico.
 * 
 * Fica discretamente posicionado no canto inferior direito de todas as telas.
 * Ao clicar no ícone neon redondo, abre um modal moderno de bate-papo com o
 * Assistente Pessoal do REPASS AI.
 */

import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, RefreshCw } from 'lucide-react';
import { executePromptWithFallback } from '../services/llmRouter';

export default function AgenticChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: 'Olá! Sou o Assistente Pessoal do REPASS AI. Como posso te ajudar hoje?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsThinking(true);

    try {
      const res = await executePromptWithFallback(
        userMsg,
        'Você é o Assistente Pessoal do REPASS AI. Responda de forma direta, amigável e profissional em português.'
      );
      const text = typeof res === 'string' ? res : res?.texto || 'Entendido! Como posso ajudar mais?';
      setMessages(prev => [...prev, { sender: 'agent', text }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'agent', text: 'Desculpe, ocorreu um pequeno imprevisto na conexão. Pode tentar novamente?' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante Verde Neon (Canto Inferior Direito) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir assistente pessoal do site"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          border: '2px solid #34d399',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isOpen ? <X size={26} color="#ffffff" /> : <MessageSquare size={26} color="#ffffff" />}
      </button>

      {/* Modal Popup Flutuante do Chatbot Agêntico */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '92px',
            right: '24px',
            zIndex: 999,
            width: 'clamp(300px, 90vw, 380px)',
            height: '500px',
            background: 'rgba(10, 14, 26, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Header do Widget */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={18} color="#fff" />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', color: '#fff', margin: 0, fontWeight: 700 }}>
                  REPASS ASSISTANT
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Assistente Pessoal do Site</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Histórico de Mensagens */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  background: m.sender === 'user' ? '#6366f1' : 'rgba(255,255,255,0.06)',
                  border: m.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '12.5px',
                  lineHeight: 1.5
                }}
              >
                {m.text}
              </div>
            ))}
            {isThinking && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '11px' }}>
                <RefreshCw size={12} className="animate-spin" /> Pensando...
              </div>
            )}
          </div>

          {/* Form de Envio */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '12px',
              background: '#05070f',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua dúvida ou instrução..."
              style={{
                flex: 1,
                padding: '10px 14px',
                background: '#0a0e1a',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <button
              type="submit"
              disabled={isThinking}
              style={{
                padding: '10px 14px',
                background: '#10b981',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
