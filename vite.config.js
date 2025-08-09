import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    proxy: {
      '/api/lazybird': {
        target: 'https://api.lazybird.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/lazybird/, ''),
        secure: true
      }
    }
  }
});