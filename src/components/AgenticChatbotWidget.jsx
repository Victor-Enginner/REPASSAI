/**
 * REPASS AI - Widget Flutuante do Chatbot Agêntico.
 * 
 * Fica discretamente posicionado no canto inferior direito de todas as telas.
 * Ao clicar no ícone neon redondo, abre um modal moderno de bate-papo com o
 * Assistente Pessoal do REPASS AI.
 */

import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, RefreshCw } from 'lucide-react';
import { apiUrl } from '../config';
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

    // Detecta se o usuário colou uma URL para clonagem
    const urlMatch = userMsg.match(/https?:\/\/[^\s]+/);

    if (urlMatch) {
      const urlToClone = urlMatch[0];
      try {
        const res = await fetch(apiUrl('/api/site/clone'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToClone })
        });

        if (res.ok) {
          const data = await res.json();
          const cloned = data.clonedSchema || {};
          const brandName = cloned.systemista?.brandName || 'NOVO SITE';
          setMessages(prev => [
            ...prev,
            {
              sender: 'agent',
              text: `🎯 **Página clonada com sucesso!**\n\nExtraí a estrutura de **${urlToClone}** via Open Lovable Engine.\n\n- **Projeto**: ${brandName}\n- **Componentes**: React 19 + Tailwind CSS\n\nAbrindo o Editor de Sites você poderá pré-visualizar e publicar este layout.`
            }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            { sender: 'agent', text: `Recebi a URL ${urlToClone}. Processando extração de layout...` }
          ]);
        }
      } catch (err) {
        setMessages(prev => [
          ...prev,
          { sender: 'agent', text: `Desculpe, ocorreu uma falha ao tentar conectar ao clonador para a URL ${urlToClone}.` }
        ]);
      } finally {
        setIsThinking(false);
      }
      return;
    }

    try {
      const res = await executePromptWithFallback(
        userMsg,
        'Você é o Assistente Pessoal do REPASS AI. Responda de forma direta, amigável e profissional em português.'
      );
      const text = typeof res === 'string' ? res : (res?.output || res?.texto || 'Entendido! Como posso ajudar mais?');
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
          background: 'linear-gradient(135deg, var(--accent-esmeralda) 0%, #059669 100%)',
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
              background: 'linear-gradient(90deg, var(--bg-slate) 0%, #1e1b4b 100%)',
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
                  background: 'var(--accent-esmeralda)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={18} color="#fff" />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--fg-white)', margin: 0, fontWeight: 700 }}>
                  REPASS ASSISTANT
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--estado-sucesso)' }} />
                  <span style={{ fontSize: '10px', color: 'var(--fg-muted)' }}>Assistente Pessoal do Site</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}
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
                  color: 'var(--fg-white)',
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
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-esmeralda)', fontSize: '11px' }}>
                <RefreshCw size={12} className="animate-spin" /> Pensando...
              </div>
            )}
          </div>

          {/* Form de Envio */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '12px',
              background: 'var(--bg-deep)',
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
              aria-label="Mensagem para o assistente"
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'var(--bg-surface)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: 'var(--fg-white)',
                fontSize: '12px'
              }}
            />
            <button
              type="submit"
              aria-label="Enviar mensagem"
              disabled={isThinking}
              style={{
                padding: '10px 14px',
                background: 'var(--accent-esmeralda)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--fg-white)',
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
