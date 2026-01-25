import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/muensterdiscovery/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['ridey_traurig-192.png', 'ridey_happy-512.png'],
      manifest: {
        name: 'Münster Discovery',
        short_name: 'MünsterDiscovery',
        description: 'Entdecke Münster auf interaktive Weise!',
        start_url: '/muensterdiscovery/#/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'ridey_traurig-192.png',  // ← NORMALER NAME!
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'ridey_happy-512.png',  // ← NORMALER NAME!
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'ridey_happy-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})
