import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/source/**/*.test.ts', 'tests/playground/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    watch: false,
  },
})
