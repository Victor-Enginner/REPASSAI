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
    host: '0.0.0.0'
  }
});
