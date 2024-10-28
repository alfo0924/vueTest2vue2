import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  // 插件配置
  plugins: [
    vue(),
    // 自動導入組件
    Components({
      resolvers: [BootstrapVueNextResolver()],
      dts: true,
      dirs: ['src/components']
    })
  ],

  // 解析配置
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
  },

  // 服務器配置
  server: {
    port: 8080, // 改用 8080 端口
    host: true,
    open: true, // 自動打開瀏覽器
    cors: true, // 啟用 CORS
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      }
    }
  },

  // 建置配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    // 分割代碼配置
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'bootstrap': ['bootstrap', '@popperjs/core'],
          'icons': ['@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons']
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
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/styles/variables.scss";
        `
      }
    }
  },

  // 環境變數配置
  envPrefix: 'VITE_',

  // 開發工具配置
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: process.env.NODE_ENV !== 'production',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  // 效能優化
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/vue-fontawesome',
      'bootstrap',
      '@popperjs/core'
    ]
  },

  // 預覽配置
  preview: {
    port: 8080,
    host: true,
    strictPort: true
  },

  // 測試配置
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
})