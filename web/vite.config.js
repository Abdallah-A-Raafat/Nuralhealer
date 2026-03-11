import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Derive proxy target from VITE_API_BASE_URL — strip the /api suffix.
  // Works for both local (http://localhost:8080/api) and ngrok (https://xxx.ngrok-free.dev/api)
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  const proxyTarget = apiBaseUrl.replace(/\/api$/, '')
  const isHttps = proxyTarget.startsWith('https')

  console.log(`[Vite] Proxying /api → ${proxyTarget}`)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: isHttps,
          ws: true,
          headers: isHttps ? { 'ngrok-skip-browser-warning': 'true' } : {},
        },
      },
    },
  }
})
