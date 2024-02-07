/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), splitVendorChunkPlugin(), mkcert()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: true,
    hmr: {
      path: '/ws',
      protocol: 'wss'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/testHelpers/setupTests.ts'],
    exclude: [...configDefaults.exclude],
    testTimeout: 30000,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['clover', 'lcov'],
      reportsDirectory: './target/coverage'
    },
    poolOptions: {
      threads: {
        maxThreads: 6,
        minThreads: 3
      }
    }
  },
  resolve: {
    mainFields: []
  }
});
