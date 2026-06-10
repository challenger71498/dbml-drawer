import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const sourcePath = (path: string) => new URL(path, import.meta.url).pathname

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/app': sourcePath('./src/app'),
      '@/pages': sourcePath('./src/pages'),
      '@/shared': sourcePath('./src/shared'),
    },
  },
  server: {
    port: 5173,
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
