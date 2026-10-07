import { writeFile } from 'node:fs/promises';

const entrada = process.env.REPASS_BACKEND_ORIGIN?.trim();
if (!entrada) {
  throw new Error('Defina REPASS_BACKEND_ORIGIN com o endereço HTTPS público do backend antes do deploy na Netlify.');
}

let backend;
try {
  backend = new URL(entrada);
} catch {
  throw new Error('REPASS_BACKEND_ORIGIN precisa ser uma URL HTTPS válida.');
}

if (backend.protocol !== 'https:' || backend.username || backend.password || backend.search || backend.hash || backend.pathname !== '/' || /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(backend.hostname)) {
  throw new Error('REPASS_BACKEND_ORIGIN precisa ser a origem HTTPS pública, sem caminho, credenciais ou endereço privado.');
}

const destino = backend.origin;
await writeFile('dist/_redirects', `/api/*  ${destino}/api/:splat  200!\n/*  /index.html  200\n`, 'utf8');
console.log(`Netlify: /api/* encaminhado para ${destino}; fallback SPA configurado.`);
