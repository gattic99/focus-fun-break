
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'time-for-break.mp3', 'time-for-focus.mp3'],
      manifest: {
        name: 'FocusFlow',
        short_name: 'FocusFlow',
        description: 'Productivity timer with focus and break sessions',
        theme_color: '#8B5CF6',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64',
            type: 'image/x-icon'
          },
          // For a production app, you should add more icon sizes:
          // 192x192, 512x512, maskable icons, etc.
        ]
      }
    })
  ].filter(Boolean),
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        content: "./src/content.tsx",
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "styles.css",
      },
      // Add Phaser as an external dependency
      external: ['phaser']
    },
  },
  optimizeDeps: {
    include: ['phaser'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
