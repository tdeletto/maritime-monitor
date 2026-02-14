import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
  },
  plugins: [],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    'process.env.NODE_ENV': '"development"',
  },
});
