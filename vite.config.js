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
    open: true
  }
});
