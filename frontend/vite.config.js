import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
  '/usuario': {
    target: 'http://127.0.0.1:8081',
    changeOrigin: true,
    headers: {
      Origin: 'http://localhost:8082',
    },
  },
  '/transaccion': {
    target: 'http://127.0.0.1:8081',
    changeOrigin: true,
    headers: {
      Origin: 'http://localhost:8082',
    },
  },
  '/analisis-financiero': {
    target: 'http://127.0.0.1:8081',
    changeOrigin: true,
    headers: {
      Origin: 'http://localhost:8082',
    },
  },
},
  },
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
