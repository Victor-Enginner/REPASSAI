import React, { useState, useEffect } from 'react';
import { FolderKanban, Globe, ExternalLink, Download, Edit3, Clock, Sparkles } from 'lucide-react';
import { DocumentDatabase } from '../services/documentDB';
import { downloadStandaloneHTML } from '../services/siteDeployer';
import { urlPublicaDoSite } from '../config';

export default function ProjectsView({ onEditSite, onNavigateWizard }) {
  const [documents, setDocuments] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Os sites saíram do localStorage e passaram a viver no Supabase, então a
  // leitura virou assíncrona. Sem estado de carregamento a tela piscaria
  // "nenhum site" antes da resposta chegar.
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        await DocumentDatabase.migrarDoLocalStorage();
        const lista = await DocumentDatabase.listDocuments();
        if (ativo) setDocuments(lista);
      } catch (e) {
        if (ativo) setErro(e.message || 'Nao foi possivel carregar seus sites.');
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => { ativo = false; };
  }, []);

  // Exemplos no formato antigo para demonstração de portfólio completo
  const SITES_FORMATO_ANTIGO = [
    {
      id: "matheus-rosaria-bar",
      nome: "Matheus & Rosaria Bar",
      categoria: "Restaurante",
      cidade: "Franca",
      estado: "SP",
      formato: "antigo",
      status: "Não publicado"
    },
    {
      id: "cozinha-fazenda",
      nome: "Restaurante Cozinha da Fazenda",
      categoria: "Restaurante",
      cidade: "Franca",
      estado: "SP",
      formato: "antigo",
      status: "Não publicado"
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--fg-lightest)',
      color: 'var(--bg-slate)',
      padding: '40px 48px',
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header Meus Projetos (Estilo useleadsite.com) */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-headline)', color: 'var(--bg-slate)', margin: 0 }}>
            Meus projetos
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--fg-subtle)', marginTop: '6px' }}>
            Tudo que você criou. Abra pra editar conversando, com preview ao vivo.
          </p>
        </div>

        {/* Caixa Principal de Projetos Criados */}
        <div style={{
          background: 'var(--fg-white)',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          padding: '24px',
          marginBottom: '32px'
        }}>
          {carregando ? (
            <div style={{
              border: '2px dashed var(--fg-soft)',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--fg-subtle)',
              fontSize: '14px'
            }}>
              Carregando seus sites…
            </div>
          ) : erro ? (
            <div style={{
              border: '2px solid var(--estado-erro-suave)',
              borderRadius: '16px',
              padding: '32px 24px',
              textAlign: 'center',
              color: 'var(--estado-erro-forte)',
              fontSize: '14px'
            }}>
              {erro}
            </div>
          ) : documents.length === 0 ? (
            <div style={{
              border: '2px dashed var(--fg-soft)',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--fg-subtle)',
              fontSize: '14px'
            }}>
              Nenhum projeto ainda. Vá em{' '}
              <button 
                onClick={onNavigateWizard} 
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: '700', cursor: 'pointer', padding: 0, fontSize: '14px' }}
              >
                Criar site
              </button>{' '}
              para começar.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {documents.map(doc => {
                const meta = doc.meta || {};
                const leadObj = {
                  id: doc.projectId.replace('site_', ''),
                  nome: meta.title || doc.projectId,
                  categoria: meta.nicho || 'Geral',
                  cidade: meta.cidade || 'Brasil'
                };

                return (
                  <div
                    key={doc.projectId}
                    onClick={() => onEditSite(leadObj)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '14px',
                      background: 'var(--fg-quase-branco)',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(0, 112, 243, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-blue)'
                      }}>
                        <Globe size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--bg-slate)' }}>
                          {meta.title || doc.projectId}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--fg-subtle)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                          <span>{meta.nicho || 'Geral'} · {meta.cidade || 'Brasil'}</span>
                          <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>• Formato novo</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {doc.publicado && doc.url_publica ? (
                        <a
                          href={doc.url_publica}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: 'var(--estado-sucesso-suave)',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '0.5px solid rgba(34, 197, 94, 0.3)',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          Publicado <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--fg-muted)', background: 'var(--fg-bright)', padding: '3px 8px', borderRadius: '6px' }}>
                          Não publicado
                        </span>
                      )}
                      <ExternalLink size={15} color="#64748b" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Seção Sites no Formato Antigo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Clock size={15} color="#64748b" />
            <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--fg-fraco)', margin: 0 }}>
              Sites no formato antigo
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
              — abra pra ver, editar pede regerar no formato novo
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SITES_FORMATO_ANTIGO.map(site => (
              <div
                key={site.id}
                onClick={() => onEditSite(site)}
                style={{
                  padding: '14px 20px',
                  borderRadius: '14px',
                  background: 'var(--fg-white)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--fg-lightest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--fg-subtle)'
                  }}>
                    <Globe size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--bg-slate)' }}>
                      {site.nome}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '1px', display: 'flex', gap: '8px' }}>
                      <span style={{ background: 'var(--fg-lightest)', padding: '1px 6px', borderRadius: '4px', color: 'var(--fg-subtle)', fontSize: '10px' }}>
                        Formato antigo
                      </span>
                      <span>{site.status}</span>
                    </div>
                  </div>
                </div>

                <ExternalLink size={14} color="#94a3b8" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
