import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts'],
      outDirs: ['dist', { dir: 'dist', moduleFormat: 'cjs' }],
      entryRoot: resolve(__dirname, 'src'),
      compilerOptions: { rootDir: resolve(__dirname, 'src') },
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'SirForms',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'React',
        },
      },
    },
    minify: 'terser',
    sourcemap: true,
  },
})
