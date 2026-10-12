import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    cssTarget: 'chrome90',
    outDir: 'dist-legacy',
    rolldownOptions: { input: 'legacy.html' },
    target: 'chrome90',
  },
})
