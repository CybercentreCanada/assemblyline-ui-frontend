/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tsconfigPaths(), mkcert()],
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json', '.mjs', '.mts']
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [path.join(__dirname, './src/tests/vitest.setup.mts')],
      include: ['**/*.test.{ts,tsx}'],
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
