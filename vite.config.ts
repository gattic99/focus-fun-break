
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
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
  ].filter(Boolean),
  server: {
    host: "::",
    port: 8080
  },
  build: {
    // Copy Phaser assets to build output
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./src"),
    },
  },
}))
