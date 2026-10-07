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
  Workflow, Zap, Layers, FileJson, CheckCircle2, ChevronRight, Filter, X
} from 'lucide-react';
import { apiUrl } from '../config';
import { SUPER_FLUXOS_N8N, CATEGORIAS_N8N, obterJsonN8N } from '../data/superFluxosN8N';
const SitePackValidation = import.meta.env.DEV ? React.lazy(() => import('../components/SitePackValidation')) : null;

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
    <div style={{ border: '0.5px solid var(--sobre-12)', borderRadius: '4px', background: 'var(--bg-surface)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', borderBottom: '0.5px solid var(--sobre-10)', gap: '10px',
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

/** Grade leve: captura estática; preview interativo somente ao abrir. */
function CartaoTemplate({ template, onAbrir }) {
  return (
    <button
      onClick={() => onAbrir(template.slug)}
      style={{
        textAlign: 'left', padding: 0, cursor: 'pointer',
        background: 'var(--bg-surface)', border: '0.5px solid var(--sobre-14)',
        borderRadius: '6px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.18s ease, transform 0.18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--sobre-14)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Miniatura: o template real, escalado e sem interação. */}
      <div style={{ position: 'relative', height: '190px', overflow: 'hidden', background: 'var(--bg-deep)' }}>
        <img
          src={`/template-thumbnails/${encodeURIComponent(template.slug)}.jpg`}
          alt={`Prévia de ${template.titulo}`}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top',
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
              fontSize: '9.5px', color: 'var(--fg-subtle)', border: '0.5px solid var(--sobre-14)',
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

  // Estados do Cofre dos 57 Super Fluxos N8N
  const [secaoAtiva, setSecaoAtiva] = useState('sites'); // 'sites' | 'n8n'
  const [categoriaN8N, setCategoriaN8N] = useState('Todos');
  const [buscaN8N, setBuscaN8N] = useState('');
  const [fluxoSelecionadoModal, setFluxoSelecionadoModal] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);

  const baixarJsonN8N = (fluxo) => {
    const jsonStr = obterJsonN8N(fluxo);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fluxo.id}-${fluxo.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copiarJsonN8N = async (fluxo) => {
    try {
      const jsonStr = obterJsonN8N(fluxo);
      await navigator.clipboard.writeText(jsonStr);
      setCopiadoId(fluxo.id);
      setTimeout(() => setCopiadoId(null), 1800);
    } catch {
      setCopiadoId(null);
    }
  };

  const fluxosFiltradosN8N = SUPER_FLUXOS_N8N.filter((f) => {
    const matchCat = categoriaN8N === 'Todos' || f.categoria === categoriaN8N;
    if (!matchCat) return false;
    if (!buscaN8N.trim()) return true;
    const alvo = `${f.titulo} ${f.descricao} ${f.tags.join(' ')} ${f.gatilho}`.toLowerCase();
    return alvo.includes(buscaN8N.toLowerCase());
  });

  const carregarCatalogo = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      let res = await fetch('/templates/catalog.json');
      if (!res.ok) res = await fetch(apiUrl('/api/templates'));
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
        let res = await fetch(`/templates/${encodeURIComponent(slugAberto)}.json`);
        if (!res.ok) res = await fetch(apiUrl(`/api/templates/detail?slug=${encodeURIComponent(slugAberto)}`));
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
    const urlPreview = detalhe?.publicado_estatico ? `/templates/${encodeURIComponent(slugAberto)}.html` : apiUrl(`/api/templates/preview?slug=${encodeURIComponent(slugAberto)}`);

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
                  href={detalhe.publicado_estatico ? `/templates/${encodeURIComponent(detalhe.slug)}.zip` : apiUrl(`/api/templates/zip?slug=${encodeURIComponent(detalhe.slug)}`)}
                  className="btn-primary"
                  style={{ marginTop: '10px', fontSize: '11.5px', padding: '10px 18px', textDecoration: 'none', display: 'inline-flex' }}
                >
                  <Download size={13} /> Baixar .zip
                </a>
              </div>
            </div>

            {/* Preview / Código */}
            <div style={{ border: '0.5px solid var(--sobre-14)', borderRadius: '6px', overflow: 'hidden', marginBottom: '22px', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '0.5px solid var(--sobre-10)', gap: '10px', flexWrap: 'wrap' }}>
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
                        background: abaPreview === id ? 'var(--sobre-10)' : 'transparent',
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
                  loading="lazy"
                  sandbox="allow-scripts"
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '540px', border: 0, display: 'block', background: 'var(--papel-cartao)' }}
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
                    background: 'var(--bg-deep)', border: '0.5px solid var(--sobre-12)',
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
            <div style={{ border: '0.5px solid var(--sobre-14)', borderRadius: '6px', background: 'var(--bg-surface)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '4px', padding: '10px 14px', borderBottom: '0.5px solid var(--sobre-10)' }}>
                {[['instrucoes', 'INSTRUÇÕES'], ['requisitos', 'REQUISITOS']].map(([id, rotulo]) => (
                  <button
                    key={id}
                    onClick={() => setAbaInfo(id)}
                    style={{
                      border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: '3px',
                      fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em',
                      fontFamily: 'var(--font-mono, monospace)',
                      background: abaInfo === id ? 'var(--sobre-10)' : 'transparent',
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
                  <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))' }}>
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
                            background: c.cor, border: '0.5px solid var(--sobre-20)', display: 'inline-block',
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

  // ------------------------------------------------------------------ GRADE PRINCIPAL
  return (
    <div style={{ padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 40px)', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.25s ease' }}>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div>
          <span className="mono-label" style={{ color: 'var(--accent-indigo)' }}>MODULE // TEMPLATES_10</span>
          <h1 className="font-headline" style={{ fontSize: 'clamp(23px, 4.5vw, 32px)', color: 'var(--fg-white)', marginTop: '8px', letterSpacing: '-0.03em' }}>
            {secaoAtiva === 'sitepack' ? 'SITE PACK // VALIDAÇÃO LOCAL' : secaoAtiva === 'sites' ? 'LOJA DE TEMPLATES // LANDING PAGES' : 'COFRE DOS 57 SUPER FLUXOS N8N REAIS'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '6px', maxWidth: '68ch', lineHeight: 1.6 }}>
            {secaoAtiva === 'sitepack' ? 'Projetos extraídos, análise técnica e previews experimentais. Nenhum item está aprovado para publicação.' : secaoAtiva === 'sites'
              ? 'Landing pages prontas de alta conversão por nicho (Estética, Odonto, Advocacia, Imobiliária, Gastronomia sem taxa) com preview ao vivo e download do código.'
              : 'Repositório completo de automações N8N (WhatsApp, Agentes IA, CRM, Webhooks) prontas para importação direta com cópia de JSON e download do arquivo .json.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--sobre-14)', padding: '10px 18px', borderRadius: '4px' }}>
            <span className="mono-label" style={{ color: 'var(--accent-indigo)' }}>
              {secaoAtiva === 'sitepack' ? '14 EM VALIDAÇÃO' : secaoAtiva === 'sites'
                ? `${templates.length} ${templates.length === 1 ? 'TEMPLATE' : 'TEMPLATES'}`
                : `${SUPER_FLUXOS_N8N.length} FLUXOS N8N`}
            </span>
          </div>
        </div>
      </div>

      {/* Seletor de Abas Principais */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--sobre-14)', paddingBottom: '14px', marginBottom: '22px' }}>
        {import.meta.env.DEV && <button className="btn-secondary" aria-pressed={secaoAtiva === 'sitepack'} onClick={() => setSecaoAtiva('sitepack')}>
          <Eye size={15} /> Site Pack · 14 em validação
        </button>}
        <button
          onClick={() => setSecaoAtiva('sites')}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: secaoAtiva === 'sites' ? 'var(--sobre-12)' : 'transparent',
            color: secaoAtiva === 'sites' ? 'var(--fg-white)' : 'var(--fg-subtle)',
            transition: 'all 0.15s ease'
          }}
        >
          <LayoutTemplate size={15} />
          <span>Landing Pages de Alta Conversão</span>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'var(--sobre-08)', color: 'var(--accent-indigo)' }}>
            {templates.length}
          </span>
        </button>

        <button
          onClick={() => setSecaoAtiva('n8n')}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: secaoAtiva === 'n8n' ? 'var(--sobre-12)' : 'transparent',
            color: secaoAtiva === 'n8n' ? 'var(--fg-white)' : 'var(--fg-subtle)',
            transition: 'all 0.15s ease'
          }}
        >
          <Workflow size={15} />
          <span>Cofre dos 57 Super Fluxos N8N Reais</span>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'var(--iris-veil)', color: 'var(--tinta)', fontWeight: 800 }}>
            57 FLUXOS
          </span>
        </button>
      </div>

      {import.meta.env.DEV && secaoAtiva === 'sitepack' && <React.Suspense fallback={<p>Carregando projetos…</p>}><SitePackValidation /></React.Suspense>}

      {/* SEÇÃO 1: LANDING PAGES DE ALTA CONVERSÃO */}
      {secaoAtiva === 'sites' && (
        <div>
          {/* Busca + importação */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '12px', marginBottom: '22px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)' }} />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, descrição ou tecnologia…"
                aria-label="Buscar template"
                style={{
                  width: '100%', padding: '11px 12px 11px 34px', background: 'var(--bg-surface)',
                  border: '0.5px solid var(--sobre-14)', borderRadius: '4px',
                  color: 'var(--fg-white)', fontSize: '12.5px', fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <textarea
                value={entradaImport}
                onChange={(e) => setEntradaImport(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) importar(); }}
                rows={entradaImport.includes('\n') ? 5 : 1}
                placeholder="Cole slugs ou comandos npx — um por linha. Ctrl+Enter importa."
                style={{
                  flex: 1, minWidth: 0, padding: '11px 12px', background: 'var(--bg-surface)',
                  border: '0.5px solid var(--sobre-14)', borderRadius: '4px',
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
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--sobre-08)', border: '0.5px solid var(--sucesso)', borderRadius: '4px', padding: '12px 14px', marginBottom: '16px' }}>
              <Check size={15} style={{ flexShrink: 0, color: 'var(--sucesso)' }} />
              <span style={{ fontSize: '12.5px', color: 'var(--estado-sucesso)' }}>{resumoImport}</span>
            </div>
          )}

          {erro && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'var(--sobre-08)', border: '0.5px solid var(--perigo)', borderRadius: '4px', padding: '14px', marginBottom: '20px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px', color: 'var(--perigo)' }} />
              <span style={{ fontSize: '12.5px', color: 'var(--estado-erro)', lineHeight: 1.6 }}>{erro}</span>
            </div>
          )}

          {carregando ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--fg-subtle)' }}>
              <RefreshCw size={20} className="animate-spin" />
              <p style={{ marginTop: '12px', fontSize: '13px' }}>Carregando catálogo…</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center', border: '0.5px dashed var(--sobre-20)', borderRadius: '6px', background: 'var(--bg-surface)' }}>
              <LayoutTemplate size={26} style={{ color: 'var(--fg-subtle)' }} />
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '18px' }}>
              {filtrados.map((t) => (
                <CartaoTemplate key={t.slug} template={t} onAbrir={setSlugAberto} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEÇÃO 2: COFRE DOS 57 SUPER FLUXOS N8N REAIS */}
      {secaoAtiva === 'n8n' && (
        <div>
          {/* Barra de Filtros e Busca de Fluxos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)' }} />
              <input
                value={buscaN8N}
                onChange={(e) => setBuscaN8N(e.target.value)}
                placeholder="Buscar fluxo por nome, gatilho, tags ou funcionalidade (ex: WhatsApp, RAG, Maps, SIP, PIX)..."
                aria-label="Buscar fluxo n8n"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 36px',
                  background: 'var(--bg-surface)',
                  border: '0.5px solid var(--sobre-14)',
                  borderRadius: '4px',
                  color: 'var(--fg-white)',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Pílulas de Categoria */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIAS_N8N.map((cat) => {
                const ativo = categoriaN8N === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoriaN8N(cat)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: ativo ? 700 : 500,
                      cursor: 'pointer',
                      border: ativo ? '1px solid var(--accent-indigo)' : '1px solid var(--sobre-14)',
                      backgroundColor: ativo ? 'var(--sobre-12)' : 'var(--bg-surface)',
                      color: ativo ? 'var(--fg-white)' : 'var(--fg-subtle)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de Cards dos Fluxos N8N */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: '16px' }}>
            {fluxosFiltradosN8N.map((fluxo) => {
              const estaCopiado = copiadoId === fluxo.id;
              return (
                <div
                  key={fluxo.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '0.5px solid var(--sobre-14)',
                    borderRadius: '6px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'border-color 0.18s ease, transform 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-indigo)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--sobre-14)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* Cabeçalho do Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo-suave)', fontWeight: 700 }}>
                      {fluxo.id.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '3px',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: 'var(--sobre-08)',
                        color: fluxo.complexidade === 'Avançado' ? 'var(--iris-dourado)' : 'var(--iris-ciano)'
                      }}
                    >
                      {fluxo.complexidade.toUpperCase()}
                    </span>
                  </div>

                  {/* Título & Descrição */}
                  <div>
                    <h3 className="font-headline" style={{ fontSize: '14.5px', color: 'var(--fg-white)', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                      {fluxo.titulo}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: 0, lineHeight: 1.55 }}>
                      {fluxo.descricao}
                    </p>
                  </div>

                  {/* Metadados: Gatilho & Nós */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'var(--fg-subtle)', borderTop: '0.5px solid var(--sobre-10)', paddingTop: '10px', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Zap size={13} style={{ color: 'var(--accent-indigo)' }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                        {fluxo.gatilho}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Layers size={13} style={{ color: 'var(--iris-menta)' }} />
                      <span>{fluxo.nodes} nós</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {fluxo.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '9.5px',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor: 'var(--sobre-06)',
                          color: 'var(--fg-subtle)',
                          border: '0.5px solid var(--sobre-10)'
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Ações: Copiar JSON, Baixar .json, Ver JSON */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '0.5px solid var(--sobre-10)', paddingTop: '12px' }}>
                    <button
                      onClick={() => copiarJsonN8N(fluxo)}
                      className="btn-secondary"
                      style={{
                        flex: 1,
                        fontSize: '11px',
                        padding: '7px 10px',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {estaCopiado ? <Check size={12} style={{ color: 'var(--sucesso)' }} /> : <Copy size={12} />}
                      <span>{estaCopiado ? 'Copiado!' : 'Copiar JSON'}</span>
                    </button>

                    <button
                      onClick={() => baixarJsonN8N(fluxo)}
                      className="btn-primary"
                      style={{
                        fontSize: '11px',
                        padding: '7px 12px',
                        gap: '6px'
                      }}
                      title="Baixar arquivo .json para importar no n8n"
                    >
                      <Download size={12} />
                      <span>.json</span>
                    </button>

                    <button
                      onClick={() => setFluxoSelecionadoModal(fluxo)}
                      className="btn-secondary"
                      style={{
                        fontSize: '11px',
                        padding: '7px 10px'
                      }}
                      title="Inspecionar código do workflow"
                    >
                      <FileJson size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Inspeção de JSON N8N */}
      {fluxoSelecionadoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'var(--sobre-40)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setFluxoSelecionadoModal(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '780px',
              backgroundColor: 'var(--bg-deep)',
              border: '1px solid var(--sobre-16)',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px var(--sobre-40)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--sobre-12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>
                  {fluxoSelecionadoModal.id.toUpperCase()} // N8N WORKFLOW SCHEMA
                </span>
                <h3 className="font-headline" style={{ fontSize: '16px', color: 'var(--fg-white)', margin: '4px 0 0 0' }}>
                  {fluxoSelecionadoModal.titulo}
                </h3>
              </div>
              <button
                onClick={() => setFluxoSelecionadoModal(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--fg-subtle)', cursor: 'pointer', padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Código JSON com formatação */}
            <div style={{ padding: '16px 20px', maxHeight: '55vh', overflowY: 'auto' }}>
              <pre
                style={{
                  margin: 0,
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-indigo-suave)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {obterJsonN8N(fluxoSelecionadoModal)}
              </pre>
            </div>

            {/* Rodapé do Modal */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--sobre-12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface)' }}>
              <span style={{ fontSize: '11px', color: 'var(--fg-subtle)' }}>
                Compatível com n8n Desktop, Self-Hosted e Cloud (v1+)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => copiarJsonN8N(fluxoSelecionadoModal)}
                  className="btn-secondary"
                  style={{ fontSize: '11.5px', padding: '8px 14px', gap: '6px' }}
                >
                  <Copy size={13} />
                  <span>Copiar JSON</span>
                </button>
                <button
                  onClick={() => baixarJsonN8N(fluxoSelecionadoModal)}
                  className="btn-primary"
                  style={{ fontSize: '11.5px', padding: '8px 16px', gap: '6px' }}
                >
                  <Download size={13} />
                  <span>Baixar .json</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nota de rodapé da Loja de Templates */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '28px', padding: '14px', background: 'var(--bg-surface)', border: '0.5px solid var(--sobre-12)', borderRadius: '4px' }}>
        <Cpu size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-indigo)' }} />
        <span style={{ fontSize: '11.5px', color: 'var(--fg-subtle)', lineHeight: 1.65 }}>
          {secaoAtiva === 'sitepack' ? 'Área disponível apenas em desenvolvimento. Preview sem acesso à sessão do REPASS; builds Next.js aguardam sandbox e revisão de licença.' : secaoAtiva === 'sites'
            ? 'O token do registry fica no backend e nunca é enviado ao navegador. O comando de instalação exibido usa um marcador no lugar da chave.'
            : 'Os 57 super fluxos n8n podem ser importados com um clique copiando o JSON para a área de transferência e colando (Ctrl+V) na tela do n8n.'}
        </span>
      </div>
    </div>
  );
}
