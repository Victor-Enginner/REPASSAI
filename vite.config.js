import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const PORT = Number(process.env.VITE_PORT) || 3001;
const BACKEND_PORT = Number(process.env.BACKEND_PORT) || 8001;

export default defineConfig({
  plugins: [react()],
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
