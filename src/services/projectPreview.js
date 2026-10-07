// Abrir um documento nunca implica gerar ou sobrescrever esse documento.
export function resolveProjectId(lead) {
  return lead?.projectId || (lead?.id ? `site_${lead.id}` : null);
}

export function classifyProjectPreview(document) {
  if (!document || typeof document !== 'object') return 'missing';
  if (typeof document.htmlContent === 'string' && document.htmlContent.trim()) return 'html';
  if (Array.isArray(document.blocos) && document.blocos.length) return 'blocks';
  if (typeof document.outputFileName === 'string' && /^[a-zA-Z0-9_-]+\.html$/.test(document.outputFileName)) return 'file';
  if (Array.isArray(document.components) && document.components.some(item => item?.type === 'HeroAnimated')) return 'legacy';
  return 'unsupported';
}
