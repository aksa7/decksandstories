import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const root = import.meta.dirname;

// Multi-page static build. Entry points are the existing HTML files;
// they get progressively rebuilt through phases F2–F7.
export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        submit: resolve(root, 'submit/index.html'),
        thankyou: resolve(root, 'thank-you/index.html'),
      },
    },
  },
});
