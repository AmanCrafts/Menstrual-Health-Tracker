import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add base configuration to ensure proper path resolution
  // This ensures assets are correctly referenced
  base: '/',
  // Enable SPA mode with history fallback
  server: {
    historyApiFallback: true
  },
  build: {
    // Output directory (default is 'dist')
    outDir: 'dist',
    // Enable source maps for debugging in production
    sourcemap: true,
    // Ensure that assets are loaded correctly
    assetsInlineLimit: 4096
  }
})
