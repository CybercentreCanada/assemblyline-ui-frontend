import { defineConfig } from 'tsdown';

export default defineConfig({
  // Entry point
  entry: ['src/index.ts'],

  // Output format
  format: ['esm'],

  // Output directory
  outDir: 'dist',

  // Clean output folder before build
  clean: true,

  // Source maps
  sourcemap: true,

  // Minify output? (optional, false for library)
  minify: false,

  // Generate TypeScript declaration files
  dts: true
});
