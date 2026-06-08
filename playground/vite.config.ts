import VueJSX from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

export default defineConfig({ plugins: [VueJSX()], server: { port: 5174 } })
