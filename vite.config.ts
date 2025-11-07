import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
  },
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/index.scss" as *;`,
      },
    },
  },
  server: {
    allowedHosts: ['testing-storybrand-frontend.bakano.ec'],
  },
})
