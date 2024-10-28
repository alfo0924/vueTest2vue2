import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // 插件配置
  plugins: [
    vue()
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
    open: true, // 自動打開瀏覽器
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 建置配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // 分割代碼配置
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'bootstrap': ['bootstrap']
        }
      }
    }
  },

  // CSS 配置
  css: {
    devSourcemap: true
  },

  // 環境變數配置
  envPrefix: 'VITE_',

  // 開發工具配置
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})