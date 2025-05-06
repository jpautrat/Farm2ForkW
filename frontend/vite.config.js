import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api requests to the backend server
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        // Optional: Remove the '/api' prefix before forwarding
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
