import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['bin/lowfy.ts'],
  outDir: 'dist/bin',
  sourcemap: false,
  splitting: false,
});
