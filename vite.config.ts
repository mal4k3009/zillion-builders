import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/whatsapp': {
        target: 'https://wpauto.jenilpatel.co.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/whatsapp/, ''),
        secure: false,
      }
    }
  }
});
