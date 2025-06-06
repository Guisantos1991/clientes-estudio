// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // raiz do projeto
  publicDir: 'public', // onde ficam os arquivos estáticos
  build: {
    outDir: 'dist', // saída do build
    emptyOutDir: true,
  },
});