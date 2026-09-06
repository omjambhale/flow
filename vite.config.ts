import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Two entries: "/" is the partner onboarding flow (static), "/dashboard/" is the React dashboard (v2).
export default defineConfig({
  plugins: [react()],
  server: { port: 4173, host: '127.0.0.1' },
  build: {
    rollupOptions: {
      input: {
        flow: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard/index.html'),
      },
      output: {
        manualChunks: { 'react-vendor': ['react', 'react-dom'] },
      },
    },
  },
})
