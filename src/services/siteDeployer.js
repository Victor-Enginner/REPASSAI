/**
 * REPASS AI - Standalone Site Compiler & Deploy Engine (Sprint 4)
 * Compila o schema JSON do DocumentDB em um arquivo HTML5 autônomo e de alta conversão.
 */

export function compileDocumentToStandaloneHTML(docSchema) {
  const meta = docSchema.meta || {};
  const heroComp = docSchema.components?.find(c => c.type === 'HeroAnimated')?.props || {};
  const bentoComp = docSchema.components?.find(c => c.type === 'BentoGridOriginKit')?.props?.items || [];

  const title = heroComp.title || meta.title || "Seu Negócio";
  const subtitle = heroComp.subtitle || `Referência em ${meta.nicho || 'serviços'} em ${meta.cidade || 'sua região'}.`;
  const ctaText = heroComp.ctaText || "Pedir no WhatsApp";
  const ctaColor = heroComp.ctaColor || "#0070f3";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${meta.cidade || 'Oficial'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Outfit:wght@600;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background-color: #0b0f19; color: #ffffff; min-height: 100vh; line-height: 1.6; }
    .container { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
    header { padding: 24px 0; display: flex; justify-space: between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: #fff; }
    .btn-cta { background: ${ctaColor}; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 30px; font-weight: 700; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 6px 20px rgba(0,112,243,0.4); transition: transform 0.2s; }
    .btn-cta:hover { transform: translateY(-2px); }
    .hero { padding: 90px 0 60px 0; text-align: center; }
    .hero h1 { font-family: 'Outfit', sans-serif; font-size: 48px; font-weight: 800; line-height: 1.15; margin-bottom: 20px; }
    .hero p { font-size: 18px; color: #94a3b8; max-width: 620px; margin: 0 auto 32px auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 60px 0; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; transition: border-color 0.2s; }
    .card:hover { border-color: ${ctaColor}; }
    .card-icon { font-size: 28px; margin-bottom: 12px; }
    .card-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
    .card-desc { font-size: 13.5px; color: #94a3b8; }
    footer { border-top: 1px solid rgba(255,255,255,0.08); padding: 32px 0; text-align: center; font-size: 13px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">${title}</div>
      <a href="https://wa.me/5500000000000" class="btn-cta">💬 ${ctaText}</a>
    </header>

    <section class="hero">
      <h1>${title}</h1>
      <p>${subtitle}</p>
      <a href="https://wa.me/5500000000000" class="btn-cta" style="padding: 16px 36px; font-size: 16px;">
        💬 ${ctaText}
      </a>
    </section>

    <section class="grid">
      ${bentoComp.map(item => `
        <div class="card">
          <div class="card-icon">${item.icon || '⭐'}</div>
          <div class="card-title">${item.title}</div>
          <div class="card-desc">${item.desc}</div>
        </div>
      `).join('')}
    </section>

    <footer>
      © ${new Date().getFullYear()} ${title} · ${meta.cidade || 'Região'}. Desenvolvido via REPASS AI Engine.
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Dispara o download imediato do arquivo HTML compilado no navegador do usuário
 */
export function downloadStandaloneHTML(docSchema) {
  const htmlContent = compileDocumentToStandaloneHTML(docSchema);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `index_${docSchema.projectId || 'site'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
