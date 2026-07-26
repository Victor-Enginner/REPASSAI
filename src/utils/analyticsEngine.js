/**
 * REPASS AI - Analytics & Theme Manager (Inspirado no UseLeadSite Benchmark)
 * 
 * Gerencia:
 * 1. Persistência de Tema (Dark / Light) no localStorage sem piscar (zero FOTU).
 * 2. Telemetria de Eventos de Conversão (Varredura OSINT, Envio para CRM, Geração de Site, Disparo WhatsApp).
 * 3. Integração com Pixel do TikTok / Google Analytics / Custom SSE Webhooks.
 */

const THEME_KEY = 'repass_theme';
const TIKTOK_PIXEL_ID = 'D92RKS3C77UARCKATN30'; // Mapeado do benchmark UseLeadSite

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark';
  } catch (e) {
    return 'dark';
  }
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.warn('[ThemeManager] Falha ao salvar tema no localStorage:', e);
  }
}

export function trackEvent(eventName, payload = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[REPASS Analytics] Track: ${eventName}`, payload);

  // Envia evento via window custom event para componentes React escutarem se necessário
  window.dispatchEvent(new CustomEvent('repass_analytics', {
    detail: { eventName, payload, timestamp }
  }));

  // Simulação de disparo de pixel de conversão (TikTok / Meta / GA4)
  if (window.ttq) {
    try {
      window.ttq.track(eventName, payload);
    } catch (err) {}
  }
}
