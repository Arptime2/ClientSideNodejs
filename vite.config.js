import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/client-side-nodejs-repl/',
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@webcontainer/api': path.resolve(__dirname, 'node_modules/@webcontainer/api/dist/index.js'),
    },
  },
});
