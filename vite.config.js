import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Network Atlas — Vite config.
// `base: './'` makes the production build use relative asset URLs so the app can
// be served from any sub-path (or opened from the file system after `vite build`).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 8753, open: false },
});
