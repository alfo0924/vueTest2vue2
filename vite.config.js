import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // 插件配置
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.includes('-')
          }
        }
      }),
      // 自動導入組件
      Components({
        resolvers: [BootstrapVueNextResolver()],
        dts: true,
        dirs: [
          'src/components',
          'src/components/common',
          'src/components/movie',
          'src/components/booking',
          'src/components/wallet',
          'src/components/discount',
          'src/components/member'
        ],
        include: [/\.vue$/, /\.vue\?vue/, /\.jsx$/],
        exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/]
      })
    ],

    // 解析配置
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
        '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
        '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@api': fileURLToPath(new URL('./src/services/api', import.meta.url)),
        '@constants': fileURLToPath(new URL('./src/utils/constants', import.meta.url))
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
    },

    // 服務器配置
    server: {
      port: parseInt(env.VITE_PORT || 3000),
      host: true,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
          ws: true
        }
      },
      hmr: {
        overlay: false,
        clientPort: parseInt(env.VITE_PORT || 3000)
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' ws: http: https: data:"
      }
    },

    // 建置配置
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url))
        },
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia'],
            'bootstrap': ['bootstrap', '@popperjs/core'],
            'icons': [
              '@fortawesome/fontawesome-svg-core',
              '@fortawesome/free-solid-svg-icons',
              '@fortawesome/free-brands-svg-icons',
              '@fortawesome/vue-fontawesome'
            ],
            'utils': ['axios', 'dayjs', 'lodash'],
            'form': ['vee-validate', 'yup'],
            'chart': ['chart.js', 'vue-chartjs']
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({name}) => {
            if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]'
            }
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]'
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(name ?? '')) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            return 'assets/[ext]/[name]-[hash][extname]'
          }
        }
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log'] : []
        }
      },
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      target: 'es2015',
      reportCompressedSize: false
    },

    // CSS 配置
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/assets/styles/variables.scss";
            @import "@/assets/styles/mixins.scss";
            @import "@/assets/styles/functions.scss";
            @import "@/assets/styles/animations.scss";
          `
        }
      },
      modules: {
        localsConvention: 'camelCaseOnly',
        scopeBehaviour: 'local',
        generateScopedName: mode === 'production'
            ? '[hash:base64:5]'
            : '[name]__[local]__[hash:base64:5]'
      }
    },

    // 環境變數配置
    envPrefix: 'VITE_',
    envDir: '.',

    // 開發工具配置
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: mode !== 'production',
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __MODE__: JSON.stringify(mode),
      __DEV__: mode === 'development'
    },

    // 效能優化
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        'dayjs',
        'lodash',
        '@fortawesome/fontawesome-svg-core',
        '@fortawesome/free-solid-svg-icons',
        '@fortawesome/free-brands-svg-icons',
        '@fortawesome/vue-fontawesome',
        'bootstrap',
        '@popperjs/core',
        'vee-validate',
        'yup',
        'chart.js',
        'vue-chartjs'
      ],
      exclude: ['vue-demi'],
      entries: [
        './src/main.js'
      ],
      esbuildOptions: {
        target: 'es2015',
        jsxFactory: 'h',
        jsxFragment: 'Fragment'
      }
    },

    // 預覽配置
    preview: {
      port: parseInt(env.VITE_PORT || 3000),
      host: true,
      strictPort: true,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },

    // 測試配置
    test: {
      globals: true,
      environment: 'jsdom',
      coverage: {
        provider: 'c8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'test/',
          '**/*.d.ts',
          '**/*.test.ts',
          '**/*.spec.ts',
          'src/main.js',
          'src/router/index.js',
          'src/stores/index.js'
        ]
      },
      setupFiles: ['./test/setup.js'],
      include: ['src/**/*.{test,spec}.{js,jsx}'],
      coverage: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    },

    // 日誌配置
    logLevel: mode === 'production' ? 'error' : 'info',

    // 快取配置
    cacheDir: '.vite',

    // 依賴優化配置
    optimizeDeps: {
      force: true
    }
  }
})