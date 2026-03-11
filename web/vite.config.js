import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const backendMode = env.VITE_BACKEND_MODE || 'local'
  const proxyTarget =
    backendMode === 'ngrok'
      ? env.VITE_NGROK_BACKEND
      : env.VITE_LOCAL_BACKEND || 'http://localhost:8080'

  console.log(`[Vite] Backend mode: ${backendMode} → ${proxyTarget}`)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: backendMode === 'ngrok',
          ws: true, // proxies WebSocket (/api/ws) as well
          headers: backendMode === 'ngrok'
            ? { 'ngrok-skip-browser-warning': 'true' }
            : {},
        },
      },
    },
  }
})
