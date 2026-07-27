import React from 'react';
import { FolderKanban, Globe, ExternalLink, Download, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { DocumentDatabase } from '../mock/documentDB';
import { downloadStandaloneHTML } from '../services/siteDeployer';
import { urlPublicaDoSite } from '../config';

export default function ProjectsView({ onEditSite }) {
  // O método é listDocuments(). `getAllDocuments` não existe na classe e
  // lançava TypeError, derrubando o app inteiro ao abrir esta aba.
  const documents = DocumentDatabase.listDocuments() || [];

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <span className="mono-label">MODULE // PROJECTS_PORTFOLIO_07</span>
          <h1 className="font-headline" style={{ fontSize: '32px', color: '#ffffff', marginTop: '4px' }}>
            PORTFÓLIO DE SITES GERADOS
          </h1>
          <p style={{ fontSize: '13.5px', color: '#94a3b8', marginTop: '4px' }}>
            Gerencie todas as landing pages compiladas, links públicos e arquivos HTML5
          </p>
        </div>

        <div style={{ background: '#0a0e1a', border: '0.5px solid rgba(255, 255, 255, 0.12)', padding: '10px 18px' }}>
          <span className="mono-label" style={{ color: '#6366f1' }}>{documents.length} PROJETOS REGISTRADOS</span>
        </div>
      </div>

      {/* Projects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {documents.map(doc => {
          const meta = doc.meta || {};
          // null enquanto não houver motor de deploy configurado (Sprint 4).
          const publicUrl = urlPublicaDoSite(meta.title);

          return (
            <div 
              key={doc.projectId}
              className="glass-panel"
              style={{
                padding: '20px 24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                alignItems: 'center',
                gap: '20px',
                background: '#0a0e1a',
                border: '0.5px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <div>
                <h3 className="font-headline" style={{ fontSize: '16px', color: '#ffffff' }}>
                  {meta.title || doc.projectId}
                </h3>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  {meta.nicho || 'Geral'} · {meta.cidade || 'Brasil'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6366f1', fontFamily: 'monospace' }}>
                  <Globe size={13} /> {publicUrl}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                  Última edição: {new Date(doc.updatedAt).toLocaleString()}
                </div>
              </div>

              <div>
                <span className="badge badge-tem-site">
                  ● Publicado v{doc.version}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => downloadStandaloneHTML(doc)}
                  className="btn-secondary" 
                  style={{ padding: '6px 10px', fontSize: '10px' }}
                  title="Baixar HTML5"
                >
                  <Download size={13} />
                </button>

                <button 
                  onClick={() => onEditSite({ id: doc.projectId.replace('site_', ''), nome: meta.title || doc.projectId, categoria: meta.nicho, cidade: meta.cidade })}
                  className="btn-primary" 
                  style={{ padding: '6px 14px', fontSize: '10px' }}
                >
                  <Edit3 size={13} /> Editor Live
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
