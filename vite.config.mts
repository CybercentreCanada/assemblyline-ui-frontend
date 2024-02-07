/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    },
    plugins: [react(), tsconfigPaths(), splitVendorChunkPlugin(), mkcert()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: {
        path: '/ws',
        protocol: 'wss'
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/tests/setupTests.ts'],
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
    ...(mode === 'development' && {
      resolve: {
        mainFields: []
      }
    })
  };
});
