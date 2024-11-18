import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add these aliases
      'sockjs-client': 'sockjs-client/dist/sockjs.min.js',
    }
  },
  define: {
    global: 'window',
  },
  optimizeDeps: {
    include: ['sockjs-client']
  }
})
