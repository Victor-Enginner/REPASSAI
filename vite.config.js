import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Componentes do React Bits importam de 'motion/react', que é o
      // pacote novo do Framer Motion. A API é a mesma do 'framer-motion'
      // que já está instalado — o alias libera 7 componentes do catálogo
      // sem adicionar dependência nova.
      'motion/react': 'framer-motion',
    },
  },
  server: {
    port: 3000,
    open: true,
    // O Vite escutava só em `localhost`, que no Windows resolve para ::1.
    // O Playwright espera o servidor em 127.0.0.1 (IPv4): a checagem falhava,
    // ele subia um SEGUNDO servidor, e `scripts/dev.mjs` mata quem estiver na
    // porta 3000 — os dois se derrubavam e a suíte visual expirava em 120s.
    // Escutar nos dois endereços resolve sem mudar nada do uso diário.
    host: '0.0.0.0',

    /*
      `/api` encaminhado para o backend — o mesmo arranjo do nginx em
      produção (docker/nginx.conf).

      Sem isto o frontend chama o backend em `localhost:8000`, que é a
      máquina de QUEM ABRE a página. Funciona no computador do operador e
      quebra em qualquer outro: por um túnel público, o visitante tentaria
      falar com o próprio computador dele e não acharia nada.

      Com o encaminhamento, o app usa caminho relativo e UMA porta serve
      tudo — que é a condição para expor por túnel, e é também o que já
      acontece em produção. Dev e produção param de divergir.

      `/api/logs/stream` é fluxo contínuo (SSE): sem desligar o buffer, as
      linhas do console de varredura chegariam todas juntas no fim.
    */
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
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

  // O `vite preview` (build de produção servido localmente) precisa do mesmo
  // encaminhamento — senão a versão compilada, que é a que vai ao túnel,
  // ficaria sem backend.
  preview: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        timeout: 300000,
        proxyTimeout: 300000,
      },
    },
  }
});
