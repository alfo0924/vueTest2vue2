module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset',
        ['@babel/preset-env', {
            useBuiltIns: 'usage',
            corejs: 3,
            targets: {
                node: 'current',
                browsers: [
                    '> 1%',
                    'last 2 versions',
                    'not dead',
                    'not ie 11'
                ]
            }
        }]
    ],

    plugins: [
        // 類屬性轉換插件
        '@babel/plugin-proposal-class-properties',

        // 可選鏈操作符支援
        '@babel/plugin-proposal-optional-chaining',

        // 空值合併操作符支援
        '@babel/plugin-proposal-nullish-coalescing-operator',

        // 裝飾器支援
        ['@babel/plugin-proposal-decorators', { legacy: true }],

        // 動態導入支援
        '@babel/plugin-syntax-dynamic-import',

        // 異步生成器函數支援
        '@babel/plugin-proposal-async-generator-functions',

        // 運行時支援
        ['@babel/plugin-transform-runtime', {
            corejs: 3,
            helpers: true,
            regenerator: true,
            useESModules: true
        }],

        // Vue JSX 支援
        '@vue/babel-plugin-jsx'
    ],

    env: {
        // 開發環境配置
        development: {
            plugins: [
                // 熱重載支援
                'react-hot-loader/babel'
            ]
        },

        // 測試環境配置
        test: {
            plugins: [
                // Istanbul 代碼覆蓋率支援
                'istanbul'
            ]
        },

        // 生產環境配置
        production: {
            plugins: [
                // 移除 console.log
                'transform-remove-console'
            ]
        }
    },

    // 快取配置
    cacheDirectory: true,

    // Source Map 配置
    sourceMaps: true,

    // 配置項
    configFile: true,

    // 忽略某些文件
    ignore: [
        'node_modules',
        'dist',
        '**/*.test.js',
        '**/*.spec.js'
    ]
}