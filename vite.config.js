import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This will expose the server on your network
    port: 5173
  },
  build: {
    outDir: 'build' // Change output directory to 'build' for Render deployment
  }
})
