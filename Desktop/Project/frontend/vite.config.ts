/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Vendor chunk boundaries per Phase 16.5 §4.8. Function form so chunks that
// are not yet imported (e.g. charts before the dashboard exists) produce no
// empty-chunk warnings.
function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined;
  // @mui/@emotion before the react check — '@emotion/react' would otherwise
  // match the react pattern and split emotion across two chunks (circular).
  if (id.includes('@mui') || id.includes('@emotion')) return 'vendor-mui';
  if (id.includes('@tanstack')) return 'vendor-query';
  if (id.includes('framer-motion')) return 'vendor-motion';
  if (id.includes('react-router')) return 'vendor-react';
  if (
    id.includes('node_modules/react/') ||
    id.includes('node_modules/react-dom/') ||
    id.includes('node_modules/scheduler/')
  ) {
    return 'vendor-react';
  }
  return undefined;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: { manualChunks },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000/api/v1',
      VITE_ENV_NAME: 'test',
    },
  },
});
