import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index.html'),
        clientes: path.resolve(__dirname, 'src/clientes.html'),
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});