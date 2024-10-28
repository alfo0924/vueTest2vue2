import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// PWA 支援
import { VitePWA } from 'vite-plugin-pwa'

// 自動導入組件
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  // 插件配置
  plugins: [
    vue(),
    // PWA 配置
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '市民卡系統',
        short_name: '市民卡',
        description: '智慧城市服務平台',
        theme_color: '#1976D2',
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    // 自動導入組件配置
    Components({
      resolvers: [BootstrapVueNextResolver()],
      dts: true
    })
  ],

  // 解析配置
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // 服務器配置
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 建置配置
  build: {
    // 輸出目錄
    outDir: 'dist',
    // 資源目錄
    assetsDir: 'assets',
    // 清空輸出目錄
    emptyOutDir: true,
    // source map
    sourcemap: process.env.NODE_ENV === 'development',
    // 分割代碼配置
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'bootstrap': ['bootstrap', '@popperjs/core'],
          'fontawesome': ['@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons']
        }
      }
    },
    // 最小化配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
      }
    }
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/styles/variables.scss";
        `
      }
    }
  },

  // 預覽配置
  preview: {
    port: 8080,
    host: true
  },

  // 測試配置
  test: {
    globals: true,
    environment: 'jsdom'
  },

  // 優化配置
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'bootstrap',
      '@popperjs/core'
    ]
  },

  // 環境變數配置
  envPrefix: 'VITE_',

  // 效能優化
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})