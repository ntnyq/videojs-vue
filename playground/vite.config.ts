import { fileURLToPath, URL } from 'node:url'
import TailwindCSS from '@tailwindcss/vite'
import Vue from '@vitejs/plugin-vue'
import VueJSX from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

export default defineConfig({
  build: { manifest: true },
  plugins: [Vue(), VueJSX(), TailwindCSS()],
  resolve: { alias: { '@': fileURLToPath(new URL('src', import.meta.url)) } },
  server: { port: 5174 },
})
