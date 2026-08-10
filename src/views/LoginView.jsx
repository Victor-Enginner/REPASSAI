/**
 * REPASS AI - MODULE // AUTH_00
 *
 * Tela de acesso do modo multiusuário.
 *
 * Só aparece quando o Supabase está configurado no backend. Com o modo
 * desligado, o app segue single-user e esta tela nunca entra no caminho.
 *
 * LAYOUT: duas colunas em tela larga — painel de identidade à esquerda,
 * formulário à direita. Abaixo de 900px vira uma coluna só e o painel de
 * identidade encolhe para uma faixa: numa tela de celular, o que importa é
 * o campo de e-mail estar visível sem rolar.
 *
 * O painel escuro sobre um produto de tema claro é escolha, não descuido: é
 * o contraste que separa "entrar no sistema" de "navegar no sistema". O
 * formulário continua no papel da marca.
 */

import React, { useState } from 'react';
import { LogIn, UserPlus, RefreshCw, AlertCircle, MailCheck, ShieldCheck, KeyRound, Radar, Zap, Globe } from 'lucide-react';
import { entrar, cadastrar, recuperarSenha } from '../services/authService';
import DotMatrix from '../components/ui/DotMatrix';

/** Provas curtas do produto. Números medidos, não promessa de marketing. */
const DESTAQUES = [
  { Icone: Radar, titulo: 'Varredura nacional', texto: '5.571 cidades, 27 estados. Encontra quem ainda não tem site.' },
  { Icone: Zap, titulo: 'Site em 14 ms', texto: 'Sem IA no caminho da geração — e por isso sem custo por site.' },
  { Icone: Globe, titulo: 'Publicação direta', texto: 'Da varredura ao site no ar, dentro do mesmo painel.' },
];

export default function LoginView({ onAutenticado, onVoltarLanding, onBypass }) {
  const [modo, setModo] = useState('entrar'); // entrar | cadastrar | recuperar
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    setErro(null);
    setAviso(null);

    if (!email.trim()) {
      setErro('Informe o seu e-mail.');
      return;
    }

    if (modo !== 'recuperar' && !senha) {
      setErro('Preencha a senha.');
      return;
    }

    if (modo === 'cadastrar' && senha.length < 6) {
      setErro('A senha precisa ter ao menos 6 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      if (modo === 'entrar') {
        const usuario = await entrar(email, senha);
        onAutenticado?.(usuario);
      } else if (modo === 'cadastrar') {
        const { precisaConfirmar } = await cadastrar(email, senha);
        if (precisaConfirmar) {
          setAviso('Conta criada. Confirme o e-mail que enviamos e depois entre.');
          setModo('entrar');
        } else {
          onAutenticado?.();
        }
      } else if (modo === 'recuperar') {
        await recuperarSenha(email);
        setAviso('Enviamos as instruções de redefinição de senha para seu e-mail.');
        setModo('entrar');
      }
    } catch (e2) {
      setErro(e2.message);
    } finally {
      setCarregando(false);
    }
  };

  const campo = {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--bg-card)',
    border: '0.5px solid var(--hairline-color)',
    borderRadius: '6px',
    color: 'var(--fg-white)',
    fontSize: '13px',
    fontFamily: 'inherit',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
  };

  const titulo = modo === 'entrar' ? 'Entrar' : modo === 'cadastrar' ? 'Criar conta' : 'Recuperar acesso';
  const subtitulo = modo === 'entrar'
    ? 'Entre para acessar seus leads.'
    : modo === 'cadastrar'
    ? 'Crie sua conta de operador.'
    : 'Digite seu e-mail para redefinir a senha.';

  return (
    <div className="login-tela">
      {/* ---------- Painel de identidade ---------- */}
      <aside className="login-painel">
        <DotMatrix />
        <div className="login-painel-veu" />

        <div className="login-painel-conteudo">
          <div>
            <span className="mono-label login-painel-rotulo">MODULE // AUTH_00</span>
            <h1 className="font-headline login-painel-marca">REPASS AI</h1>
            <p className="login-painel-frase">
              Encontra negócios locais sem site, gera a página de cada um e
              organiza a abordagem. Tudo num painel só.
            </p>
          </div>

          <ul className="login-destaques">
            {DESTAQUES.map(({ Icone, titulo: t, texto }) => (
              <li key={t} className="login-destaque">
                <span className="login-destaque-icone"><Icone size={15} /></span>
                <span>
                  <strong className="login-destaque-titulo">{t}</strong>
                  <span className="login-destaque-texto">{texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ---------- Formulário ---------- */}
      <main className="login-coluna">
        <div className="login-caixa">
          <header style={{ marginBottom: '24px' }}>
            <h2 className="font-headline" style={{ fontSize: 'clamp(24px, 4vw, 30px)', color: 'var(--fg-bright)', letterSpacing: '-0.03em', margin: 0 }}>
              {titulo}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '8px' }}>{subtitulo}</p>
          </header>

          <form onSubmit={enviar}>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '8px', marginBottom: '22px' }}>
              {[['entrar', 'ENTRAR'], ['cadastrar', 'CRIAR CONTA'], ['recuperar', 'RECUPERAR']].map(([id, rotulo]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setModo(id); setErro(null); setAviso(null); }}
                  aria-pressed={modo === id}
                  style={{
                    flex: 1, border: 'none', cursor: 'pointer', padding: '9px', borderRadius: '6px',
                    fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em',
                    fontFamily: 'var(--font-mono, monospace)',
                    background: modo === id ? 'var(--bg-card)' : 'transparent',
                    color: modo === id ? 'var(--accent-indigo)' : 'var(--fg-muted)',
                    boxShadow: modo === id ? '0 2px 6px rgba(15, 23, 42, 0.06)' : 'none',
                  }}
                >
                  {rotulo}
                </button>
              ))}
            </div>

            <label style={{ display: 'block', marginBottom: '14px' }}>
              <span className="mono-label" style={{ fontSize: '10px', color: 'var(--fg-subtle)', display: 'block', marginBottom: '7px' }}>E-MAIL</span>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" placeholder="voce@exemplo.com" style={campo}
              />
            </label>

            {modo !== 'recuperar' && (
              <label style={{ display: 'block', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <span className="mono-label" style={{ fontSize: '10px', color: 'var(--fg-subtle)' }}>SENHA</span>
                  {modo === 'entrar' && (
                    <button
                      type="button"
                      onClick={() => { setModo('recuperar'); setErro(null); setAviso(null); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <input
                  type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
                  autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                  placeholder="••••••••" style={campo} aria-label="Senha"
                />
              </label>
            )}

            {erro && (
              <div role="alert" style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', background: 'var(--estado-erro-suave)', border: '0.5px solid rgba(220,38,38,0.3)', borderRadius: '6px', padding: '11px 13px', marginBottom: '16px' }}>
                <AlertCircle size={15} color="var(--estado-erro)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '12px', color: 'var(--estado-erro)', lineHeight: 1.55 }}>{erro}</span>
              </div>
            )}

            {aviso && (
              <div role="status" style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', background: 'var(--estado-sucesso-suave)', border: '0.5px solid rgba(22,163,74,0.3)', borderRadius: '6px', padding: '11px 13px', marginBottom: '16px' }}>
                <MailCheck size={15} color="var(--estado-sucesso)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '12px', color: 'var(--estado-sucesso)', lineHeight: 1.55 }}>{aviso}</span>
              </div>
            )}

            <button
              type="submit" disabled={carregando} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '12.5px', borderRadius: '6px', opacity: carregando ? 0.6 : 1 }}
            >
              {carregando
                ? <RefreshCw size={15} className="animate-spin" />
                : modo === 'entrar' ? <LogIn size={15} /> : modo === 'cadastrar' ? <UserPlus size={15} /> : <KeyRound size={15} />}
              {carregando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : modo === 'cadastrar' ? 'Criar conta' : 'Enviar e-mail de recuperação'}
            </button>
          </form>

          <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', marginTop: '18px', padding: '13px', background: 'var(--bg-surface)', border: '0.5px solid var(--hairline-color)', borderRadius: '8px' }}>
            <ShieldCheck size={14} color="var(--estado-sucesso)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '11px', color: 'var(--fg-subtle)', lineHeight: 1.6 }}>
              Cada operador enxerga apenas os próprios leads. O isolamento é feito
              no servidor, por usuário.
            </span>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {onVoltarLanding && (
              <button
                type="button"
                onClick={onVoltarLanding}
                style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                ← Voltar ao site
              </button>
            )}
            {onBypass && (
              <button
                type="button"
                onClick={onBypass}
                style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', fontSize: '12px', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                Entrar Modo Demo →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
