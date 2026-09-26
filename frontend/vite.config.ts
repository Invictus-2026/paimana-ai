import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  preview: { proxy: { '/api': { target: process.env.PAIMANA_BACKEND_URL || 'http://127.0.0.1:8000', changeOrigin: true, ws: true } } },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.PAIMANA_BACKEND_URL || 'http://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
