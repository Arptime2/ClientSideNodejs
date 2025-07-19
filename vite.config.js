import { defineConfig } from 'vite';

export default defineConfig({
  base: '/client-side-nodejs-repl/',
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    include: ['@webcontainer/api'],
  },
});

