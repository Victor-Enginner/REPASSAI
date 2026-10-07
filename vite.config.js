import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const PORT = Number(process.env.VITE_PORT) || 3001;
const BACKEND_PORT = Number(process.env.BACKEND_PORT) || 8001;

export default defineConfig({
  plugins: [react(), {
    name: 'repass-site-pack-preview-local',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/__local-site-pack/background-animations-2') return next();
        try {
          const data = JSON.parse(readFileSync(new URL('./src/data/sitePackValidation.json', import.meta.url), 'utf8'));
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('Content-Security-Policy', 'sandbox allow-scripts');
          res.end(data.previewHTML);
        } catch {
          res.statusCode = 503;
          res.end('Preview local indisponível. Prepare o catálogo Site Pack.');
        }
      });
    },
  }],
  resolve: {
    alias: {
      'motion/react': 'framer-motion',
    },
  },
  server: {
    port: PORT,
    open: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${BACKEND_PORT}`,
        changeOrigin: true,
        timeout: 300000,
        proxyTimeout: 300000,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req) => {
            if (req.url?.startsWith('/api/logs/stream')) {
              proxyRes.headers['x-accel-buffering'] = 'no';
            }
          });
        },
      },
    },
  },

  preview: {
    port: PORT,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${BACKEND_PORT}`,
        changeOrigin: true,
        timeout: 300000,
        proxyTimeout: 300000,
      },
    },
  }
});
