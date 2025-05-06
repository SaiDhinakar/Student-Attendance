import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      allowedHosts: [
        'localhost',  
        env.HOST_IP || '127.0.0.1',
      ],
      host: '0.0.0.0',
      port: parseInt(env.FRONTEND_PORT || 5022),
    },
    preview: {
      host: '0.0.0.0',
      port: parseInt(env.FRONTEND_PORT || 5022),
    }
  }
})
