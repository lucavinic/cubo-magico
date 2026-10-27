import { defineConfig } from 'vite';

// No GitHub Pages o site fica em /cubo-magico/; em localhost continua na raiz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/cubo-magico/' : '/',
  // o three.js sozinho passa dos 500 kB; não é problema
  build: { chunkSizeWarningLimit: 800 },
}));
