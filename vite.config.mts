/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import vitest from 'eslint-plugin-vitest';
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import eslint from 'vite-plugin-eslint';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  const eslintPlugin = [
    {
      ...eslint({ failOnWarning: false, failOnError: false }),
      apply: () => env.npm_lifecycle_event === 'dev'
    },
    { ...eslint({ failOnWarning: false, failOnError: false }), apply: () => env?.npm_lifecycle_event === 'ci' }
  ];

  return {
    // vite config
    build: {
      outDir: 'build'
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    },
    optimizeDeps: {
      include: ['./src/**/*.{js,jsx,ts,tsx}']
    },
    plugins: [react(), tsconfigPaths(), splitVendorChunkPlugin(), mkcert(), vitest, ...eslintPlugin],
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json', '.mjs', '.mts']
    },
    rules: {
      ...vitest.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
      'vitest/max-nested-describe': ['error', { max: 3 }] // you can also modify rules' behavior using option like this
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: {
        overlay: false,
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
        all: true,
        include: ['src/**/*.tsx'],
        provider: 'v8',
        reporter: ['cobertura', 'clover', 'lcov'],
        reportsDirectory: './coverage'
      },
      poolOptions: {
        threads: {
          maxThreads: 6,
          minThreads: 3
        }
      }
    }
  };
});
