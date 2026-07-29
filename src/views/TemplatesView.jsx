/**
 * REPASS AI - MODULE // TEMPLATES_10
 *
 * Loja de templates prontos.
 *
 * Grade de templates -> página de detalhe com preview ao vivo, código,
 * comando de instalação, prompts de integração/customização, DESIGN.md,
 * requisitos e download do .zip.
 *
 * Os dados vêm do catálogo local do backend (`/api/templates`), alimentado
 * pela importação a partir do registry privado.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutTemplate, ArrowLeft, Copy, Check, Download, ExternalLink,
  Code2, Eye, Sparkles, Search, Plus, RefreshCw, AlertCircle, Cpu,
} from 'lucide-react';
import { apiUrl } from '../config';

/** Formata centavos em reais. */
function precoBR(centavos) {
  return ((centavos || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Um template sem preço definido não mostra selo nenhum.
 *
 * Antes o valor vinha fixo do backend e TODO template aparecia por
 * "R$ 19,90", inclusive os que ainda não tiveram preço decidido. Anunciar
 * um valor que ninguém escolheu é pior que não anunciar.
 */
function temPreco(centavos) {
  return Number(centavos) > 0;
}

/** Botão que copia um texto e confirma visualmente. */
function BotaoCopiar({ texto, rotulo = 'Copiar', estilo = {} }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // Clipboard bloqueado (contexto não seguro). Silencioso de propósito:
      // o texto continua visível na tela para cópia manual.
      setCopiado(false);
    }
  };

  return (
    <button onClick={copiar} className="btn-secondary" style={{ fontSize: '11px', padding: '7px 12px', ...estilo }}>
      {copiado ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
      {copiado ? 'Copiado!' : rotulo}
    </button>
  );
}

/** Bloco de prompt com cabeçalho e botão de copiar. */
function BlocoPrompt({ titulo, conteudo, monospace = false }) {
  if (!conteudo) return null;
  return (
    <div style={{ border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '4px', background: 'var(--bg-surface)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.1)', gap: '10px',
      }}>
        <span className="mono-label" style={{ fontSize: '10px', color: 'var(--fg-subtle)' }}>{titulo}</span>
        <BotaoCopiar texto={conteudo} rotulo="Copiar prompt" />
      </div>
      <div style={{
        padding: '14px',
        fontSize: '11.5px',
        lineHeight: 1.65,
        color: 'var(--fg-soft)',
        whiteSpace: 'pre-wrap',
        maxHeight: '260px',
        overflowY: 'auto',
        fontFamily: monospace ? 'var(--font-mono, monospace)' : 'inherit',
      }}>
        {conteudo}
      </div>
    </div>
  );
}

/** Cartão da grade, com miniatura viva do próprio template. */
function CartaoTemplate({ template, onAbrir }) {
  return (
    <button
      onClick={() => onAbrir(template.slug)}
      style={{
        textAlign: 'left', padding: 0, cursor: 'pointer',
        background: 'var(--bg-surface)', border: '0.5px solid rgba(255,255,255,0.14)',
        borderRadius: '6px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.18s ease, transform 0.18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Miniatura: o template real, escalado e sem interação. */}
      <div style={{ position: 'relative', height: '190px', overflow: 'hidden', background: 'var(--bg-deep)' }}>
        <iframe
          src={apiUrl(`/api/templates/preview?slug=${encodeURIComponent(template.slug)}`)}
          title={template.titulo}
          loading="lazy"
          tabIndex={-1}
          scrolling="no"
          style={{
            width: '1280px', height: '820px', border: 0,
            transform: 'scale(0.30)', transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
        />
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          background: 'rgba(5,7,15,0.86)', color: 'var(--accent-indigo-suave)',
          fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.08em',
          padding: '4px 9px', borderRadius: '3px',
          fontFamily: 'var(--font-mono, monospace)',
        }}>
          TEMPLATE
        </span>
        {temPreco(template.preco_centavos) && (
          <span style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'var(--accent-indigo)', color: 'var(--fg-white)',
            fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '3px',
          }}>
            {precoBR(template.preco_centavos)}
          </span>
        )}
      </div>

      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 className="font-headline" style={{ fontSize: '14.5px', color: 'var(--fg-white)', lineHeight: 1.25, margin: 0 }}>
          {template.titulo}
        </h3>
        <p style={{ fontSize: '11.5px', color: 'var(--fg-muted)', lineHeight: 1.5, margin: 0 }}>
          {(template.descricao || '').slice(0, 105)}
          {(template.descricao || '').length > 105 ? '…' : ''}
        </p>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '8px' }}>
          {(template.tecnologias || []).slice(0, 4).map((t) => (
            <span key={t} style={{
              fontSize: '9.5px', color: 'var(--fg-subtle)', border: '0.5px solid rgba(255,255,255,0.14)',
              padding: '2px 7px', borderRadius: '3px', fontFamily: 'var(--font-mono, monospace)',
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

export default function TemplatesView({ onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');

  const [slugAberto, setSlugAberto] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [abaPreview, setAbaPreview] = useState('preview');   // preview | codigo
  const [abaInfo, setAbaInfo] = useState('instrucoes');      // instrucoes | requisitos

  const [importando, setImportando] = useState(false);
  const [entradaImport, setEntradaImport] = useState('');
  const [resumoImport, setResumoImport] = useState(null);

  const carregarCatalogo = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch(apiUrl('/api/templates'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const dados = await res.json();
      setTemplates(dados.templates || []);
    } catch (e) {
      setErro(`Não foi possível carregar o catálogo: ${e.message}. O backend está rodando?`);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarCatalogo(); }, [carregarCatalogo]);

  useEffect(() => {
    if (!slugAberto) { setDetalhe(null); return undefined; }
    let cancelado = false;
    (async () => {
      try {
        const res = await fetch(apiUrl(`/api/templates/detail?slug=${encodeURIComponent(slugAberto)}`));
        const dados = await res.json();
        if (!cancelado) setDetalhe(res.ok ? dados : null);
      } catch {
        if (!cancelado) setDetalhe(null);
      }
    })();
    return () => { cancelado = true; };
  }, [slugAberto]);

  const importar = async () => {
    if (!entradaImport.trim()) return;
    setImportando(true);
    setErro(null);
    try {
      const res = await fetch(apiUrl('/api/templates/import'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: entradaImport.trim() }),
      });
      const dados = await res.json();
      if (!res.ok || !dados.sucesso) throw new Error(dados.erro || `HTTP ${res.status}`);

      // Resposta de lote traz contagem; a de item único traz o template.
      if (typeof dados.importados === 'number') {
        const falhas = dados.falhas || [];
        setResumoImport(
          `${dados.importados} de ${dados.total} importados.` +
          (falhas.length ? ` ${falhas.length} falharam.` : '')
        );
        if (falhas.length) {
          setErro(
            'Não importados: ' +
            falhas.slice(0, 5).map((f) => `${f.entrada} (${f.erro})`).join(' · ') +
            (falhas.length > 5 ? ` e mais ${falhas.length - 5}` : '')
          );
        }
      } else {
        setResumoImport('1 template importado.');
      }

      setEntradaImport('');
      await carregarCatalogo();
    } catch (e) {
      setErro(`Falha ao importar: ${e.message}`);
    } finally {
      setImportando(false);
    }
  };

  const filtrados = templates.filter((t) => {
    if (!busca.trim()) return true;
    const alvo = `${t.titulo} ${t.descricao} ${(t.tecnologias || []).join(' ')}`.toLowerCase();
    return alvo.includes(busca.toLowerCase());
  });

  // ---------------------------------------------------------------- DETALHE
  if (slugAberto) {
    const urlPreview = apiUrl(`/api/templates/preview?slug=${encodeURIComponent(slugAberto)}`);

    return (
      <div style={{ padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 40px)', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.25s ease' }}>
        <button onClick={() => setSlugAberto(null)} className="btn-secondary" style={{ fontSize: '11px', padding: '7px 13px', marginBottom: '20px' }}>
          <ArrowLeft size={13} /> BIBLIOTECA
        </button>

        {!detalhe ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: '13px' }}>
            <RefreshCw size={20} className="animate-spin" />
            <p style={{ marginTop: '12px' }}>Carregando template…</p>
          </div>
        ) : (
          <>
            {/* Cabeçalho */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap', marginBottom: '22px' }}>
              <div style={{ flex: '1 1 420px' }}>
                <h1 className="font-headline" style={{ fontSize: 'clamp(22px, 4vw, 30px)', color: 'var(--fg-white)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>
                  {detalhe.titulo}
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '10px', lineHeight: 1.6, maxWidth: '68ch' }}>
                  {detalhe.descricao}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--fg-white)' }}>
                  {temPreco(detalhe.preco_centavos)
                    ? precoBR(detalhe.preco_centavos)
                    : <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fg-subtle)' }}>
                        Sem preço definido
                      </span>}
                </div>
                <a
                  href={apiUrl(`/api/templates/zip?slug=${encodeURIComponent(detalhe.slug)}`)}
                  className="btn-primary"
                  style={{ marginTop: '10px', fontSize: '11.5px', padding: '10px 18px', textDecoration: 'none', display: 'inline-flex' }}
                >
                  <Download size={13} /> Baixar .zip
                </a>
              </div>
            </div>

            {/* Preview / Código */}
            <div style={{ border: '0.5px solid rgba(255,255,255,0.14)', borderRadius: '6px', overflow: 'hidden', marginBottom: '22px', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.1)', gap: '10px', flexWrap: 'wrap' }}>
                <a href={urlPreview} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: '11px', padding: '7px 12px', textDecoration: 'none' }}>
                  <ExternalLink size={12} /> Ver completo
                </a>

                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-deep)', padding: '3px', borderRadius: '4px' }}>
                  {[['preview', 'PREVIEW', Eye], ['codigo', 'CÓDIGO', Code2]].map(([id, rotulo, Icone]) => (
                    <button
                      key={id}
                      onClick={() => setAbaPreview(id)}
                      style={{
                        border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: '3px',
                        fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em',
                        fontFamily: 'var(--font-mono, monospace)',
                        background: abaPreview === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: abaPreview === id ? '#fff' : '#64748b',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      <Icone size={11} /> {rotulo}
                    </button>
                  ))}
                </div>
              </div>

              {abaPreview === 'preview' ? (
                <iframe
                  src={urlPreview}
                  title={`Preview de ${detalhe.titulo}`}
                  style={{ width: '100%', height: '540px', border: 0, display: 'block', background: 'var(--fg-white)' }}
                />
              ) : (
                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="mono-label" style={{ fontSize: '10px', color: 'var(--fg-subtle)' }}>
                      {detalhe.arquivo} · {(detalhe.tamanho_html || 0).toLocaleString('pt-BR')} caracteres
                    </span>
                    <BotaoCopiar texto={detalhe.comando_instalacao} rotulo="Copiar comando" />
                  </div>
                  <pre style={{
                    background: 'var(--bg-deep)', border: '0.5px solid rgba(255,255,255,0.12)',
                    padding: '14px', fontSize: '11.5px', color: 'var(--accent-indigo-suave)',
                    fontFamily: 'var(--font-mono, monospace)', whiteSpace: 'pre-wrap',
                    overflowX: 'auto', margin: 0, borderRadius: '4px',
                  }}>
                    {detalhe.comando_instalacao}
                  </pre>
                  <p style={{ fontSize: '11px', color: 'var(--fg-subtle)', marginTop: '10px', lineHeight: 1.6 }}>
                    Substitua <code style={{ color: 'var(--fg-soft)' }}>SEU_TOKEN</code> pelo token do registry.
                    O token real fica no backend e não é exposto aqui.
                  </p>
                </div>
              )}
            </div>

            {/* Instruções / Requisitos */}
            <div style={{ border: '0.5px solid rgba(255,255,255,0.14)', borderRadius: '6px', background: 'var(--bg-surface)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '4px', padding: '10px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
                {[['instrucoes', 'INSTRUÇÕES'], ['requisitos', 'REQUISITOS']].map(([id, rotulo]) => (
                  <button
                    key={id}
                    onClick={() => setAbaInfo(id)}
                    style={{
                      border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: '3px',
                      fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em',
                      fontFamily: 'var(--font-mono, monospace)',
                      background: abaInfo === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: abaInfo === id ? '#fff' : '#64748b',
                    }}
                  >
                    {rotulo}
                  </button>
                ))}
              </div>

              <div style={{ padding: '16px' }}>
                {abaInfo === 'instrucoes' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <BlocoPrompt titulo="PROMPT DE INTEGRAÇÃO" conteudo={detalhe.prompts?.integracao} />
                    <BlocoPrompt titulo="PROMPT DE CUSTOMIZAÇÃO" conteudo={detalhe.prompts?.customizacao} />
                    <BlocoPrompt titulo="DESIGN.MD (COMO FUNCIONA)" conteudo={detalhe.prompts?.design_md} monospace />

                    {onSelectTemplate && (
                      <button
                        onClick={() => onSelectTemplate({ id: detalhe.slug, title: detalhe.titulo, nicho: 'Geral' })}
                        className="btn-primary"
                        style={{ justifyContent: 'center', fontSize: '12px', padding: '11px' }}
                      >
                        <Sparkles size={14} /> Usar este template no editor
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    <div>
                      <div className="mono-label" style={{ fontSize: '10px', color: 'var(--fg-subtle)', marginBottom: '10px' }}>TECNOLOGIAS</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {(detalhe.tecnologias || []).map((t) => (
                          <span key={t} style={{ fontSize: '10.5px', color: 'var(--accent-indigo-suave)', border: '0.5px solid rgba(99,102,241,0.4)', padding: '4px 9px', borderRadius: '3px', fontFamily: 'var(--font-mono, monospace)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mono-label" style={{ fontSize: '10px', color: 'var(--fg-subtle)', marginBottom: '10px' }}>TIPOGRAFIA</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {(detalhe.fontes || []).length
                          ? detalhe.fontes.map((f) => <span key={f} style={{ fontSize: '11.5px', color: 'var(--fg-soft)' }}>{f}</span>)
                          : <span style={{ fontSize: '11.5px', color: 'var(--fg-subtle)' }}>Nenhuma fonte externa</span>}
                      </div>
                    </div>

                    <div>
                      <div className="mono-label" style={{ fontSize: '10px', color: 'var(--fg-subtle)', marginBottom: '10px' }}>PALETA DETECTADA</div>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {(detalhe.paleta || []).slice(0, 12).map((c, i) => (
                          <span key={`${c.cor}-${i}`} title={`${c.cor} · ${c.usos} usos`} style={{
                            width: '24px', height: '24px', borderRadius: '3px',
                            background: c.cor, border: '0.5px solid rgba(255,255,255,0.2)', display: 'inline-block',
                          }} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mono-label" style={{ fontSize: '10px', color: 'var(--fg-subtle)', marginBottom: '10px' }}>REQUISITOS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(detalhe.requisitos || []).map((r) => (
                          <span key={r} style={{ fontSize: '11.5px', color: 'var(--fg-soft)' }}>→ {r}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------------ GRADE
  return (
    <div style={{ padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 40px)', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.25s ease' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <span className="mono-label" style={{ color: 'var(--accent-indigo)' }}>MODULE // TEMPLATES_10</span>
          <h1 className="font-headline" style={{ fontSize: 'clamp(23px, 4.5vw, 32px)', color: 'var(--fg-white)', marginTop: '8px', letterSpacing: '-0.03em' }}>
            LOJA DE TEMPLATES
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '6px', maxWidth: '62ch', lineHeight: 1.6 }}>
            Landing pages prontas com preview ao vivo, prompts de integração e download do código.
          </p>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '0.5px solid rgba(255,255,255,0.14)', padding: '10px 18px', borderRadius: '4px' }}>
          <span className="mono-label" style={{ color: 'var(--accent-indigo)' }}>
            {templates.length} {templates.length === 1 ? 'TEMPLATE' : 'TEMPLATES'}
          </span>
        </div>
      </div>

      {/* Busca + importação */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '22px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, descrição ou tecnologia…"
            aria-label="Buscar template"
            style={{
              width: '100%', padding: '11px 12px 11px 34px', background: 'var(--bg-surface)',
              border: '0.5px solid rgba(255,255,255,0.14)', borderRadius: '4px',
              color: 'var(--fg-white)', fontSize: '12.5px', fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          {/*
            Textarea, não input: o registry não tem endpoint de listagem, então
            a forma prática de montar um catálogo grande é colar de uma vez a
            lista de comandos npx copiada da interface — um por linha.
          */}
          <textarea
            value={entradaImport}
            onChange={(e) => setEntradaImport(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) importar(); }}
            rows={entradaImport.includes('\n') ? 5 : 1}
            placeholder="Cole slugs ou comandos npx — um por linha. Ctrl+Enter importa."
            style={{
              flex: 1, minWidth: 0, padding: '11px 12px', background: 'var(--bg-surface)',
              border: '0.5px solid rgba(255,255,255,0.14)', borderRadius: '4px',
              color: 'var(--fg-white)', fontSize: '12.5px', fontFamily: 'var(--font-mono, monospace)',
              resize: 'vertical', lineHeight: 1.5,
            }}
          />
          <button
            onClick={importar}
            disabled={importando || !entradaImport.trim()}
            className="btn-primary"
            style={{ fontSize: '11.5px', padding: '10px 16px', opacity: (importando || !entradaImport.trim()) ? 0.5 : 1, whiteSpace: 'nowrap' }}
          >
            {importando ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
            {importando
              ? 'Importando…'
              : entradaImport.includes('\n')
                ? `Importar ${entradaImport.split('\n').filter(l => l.trim()).length}`
                : 'Importar'}
          </button>
        </div>
      </div>

      {resumoImport && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(34,197,94,0.07)', border: '0.5px solid rgba(34,197,94,0.35)', borderRadius: '4px', padding: '12px 14px', marginBottom: '16px' }}>
          <Check size={15} color="#22c55e" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '12.5px', color: 'var(--estado-sucesso-claro)' }}>{resumoImport}</span>
        </div>
      )}

      {erro && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(239,68,68,0.07)', border: '0.5px solid rgba(239,68,68,0.35)', borderRadius: '4px', padding: '14px', marginBottom: '20px' }}>
          <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '12.5px', color: 'var(--estado-erro-suave)', lineHeight: 1.6 }}>{erro}</span>
        </div>
      )}

      {carregando ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--fg-subtle)' }}>
          <RefreshCw size={20} className="animate-spin" />
          <p style={{ marginTop: '12px', fontSize: '13px' }}>Carregando catálogo…</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ padding: '56px 24px', textAlign: 'center', border: '0.5px dashed rgba(255,255,255,0.2)', borderRadius: '6px', background: 'var(--bg-surface)' }}>
          <LayoutTemplate size={26} color="#475569" />
          <p style={{ fontSize: '13.5px', color: 'var(--fg-muted)', marginTop: '14px' }}>
            {busca ? 'Nenhum template encontrado para esta busca.' : 'Catálogo vazio.'}
          </p>
          {!busca && (
            <p style={{ fontSize: '12px', color: 'var(--fg-subtle)', marginTop: '8px', lineHeight: 1.6 }}>
              Cole o comando <code style={{ color: 'var(--accent-indigo-suave)' }}>npx shadcn@latest add …</code> no campo acima
              para importar o primeiro.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {filtrados.map((t) => (
            <CartaoTemplate key={t.slug} template={t} onAbrir={setSlugAberto} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '28px', padding: '14px', background: 'var(--bg-surface)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '4px' }}>
        <Cpu size={15} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '11.5px', color: 'var(--fg-subtle)', lineHeight: 1.65 }}>
          O token do registry fica no backend e nunca é enviado ao navegador.
          O comando de instalação exibido usa um marcador no lugar da chave.
        </span>
      </div>
    </div>
  );
}
