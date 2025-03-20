
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'FocusFlow',
        short_name: 'FocusFlow',
        description: 'Stay focused, take mindful breaks, and boost productivity.',
        theme_color: '#9b87f5',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 8080
  },
  build: {
    rollupOptions: {
      // Externalize Phaser to avoid bundling issues
      external: ['phaser']
    }
  },
  optimizeDeps: {
    // Make sure Phaser is included in the optimization
    include: ['phaser']
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
