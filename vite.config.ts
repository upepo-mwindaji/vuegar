// Utilities
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
  publicDir: false,
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Vuegar',
      fileName: 'vuegar',
    },
    rollupOptions: {
      external: [
        'vue',
      ],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
