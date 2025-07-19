import { defineConfig } from 'vite';

export default defineConfig({
  base: '/client-side-nodejs-repl/',
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: {
    target: 'esnext',
  },
});
