import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'https://bleach-porcupine-parasail.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
