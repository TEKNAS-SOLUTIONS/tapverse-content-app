import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    testTimeout: 10000, // 10 seconds for integration tests
  },
  server: {
    host: '0.0.0.0', // Allow external connections on dev server
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Backend on same server
        changeOrigin: true,
      },
    },
  },
});

