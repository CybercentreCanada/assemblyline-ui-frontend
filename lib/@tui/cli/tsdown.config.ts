import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'dist',
  clean: true,
  dts: true,
  banner: {
    js: '#!/usr/bin/env node'
  }
});
