/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          entryFileNames: `[name].js`,
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      }
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    },
    optimizeDeps: {
      include: ['./src/**/*.{js,jsx,ts,tsx}']
    },
    plugins: [react(), tsconfigPaths(), mkcert()],
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json', '.mjs', '.mts']
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
