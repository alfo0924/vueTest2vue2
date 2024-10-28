module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2021: true
    },

    extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        '@vue/prettier'
    ],

    parserOptions: {
        parser: '@babel/eslint-parser',
        ecmaVersion: 2021,
        sourceType: 'module'
    },

    rules: {
        // Vue 相關規則
        'vue/multi-word-component-names': 'off',
        'vue/no-v-html': 'off',
        'vue/require-default-prop': 'error',
        'vue/require-prop-types': 'error',
        'vue/order-in-components': ['error', {
            order: [
                'name',
                'components',
                'props',
                'data',
                'computed',
                'watch',
                'methods',
                'lifecycle hooks',
                'routing hooks'
            ]
        }],

        // JavaScript 相關規則
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-unused-vars': ['warn', {
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: true
        }],
        'no-undef': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'arrow-body-style': ['error', 'as-needed'],
        'arrow-parens': ['error', 'as-needed'],
        'arrow-spacing': ['error', { before: true, after: true }],

        // 程式碼風格
        'indent': ['error', 2, {
            SwitchCase: 1,
            VariableDeclarator: 1,
            outerIIFEBody: 1
        }],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single', {
            avoidEscape: true,
            allowTemplateLiterals: true
        }],
        'semi': ['error', 'never'],
        'comma-dangle': ['error', 'never'],
        'key-spacing': ['error', {
            beforeColon: false,
            afterColon: true
        }],
        'keyword-spacing': ['error', {
            before: true,
            after: true
        }],
        'space-before-function-paren': ['error', {
            anonymous: 'always',
            named: 'never',
            asyncArrow: 'always'
        }],
        'space-before-blocks': ['error', 'always'],
        'space-in-parens': ['error', 'never'],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'computed-property-spacing': ['error', 'never'],

        // ES6+ 特性
        'no-duplicate-imports': 'error',
        'no-const-assign': 'error',
        'prefer-template': 'error',
        'template-curly-spacing': ['error', 'never'],
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-destructuring': ['error', {
            array: true,
            object: true
        }, {
            enforceForRenamedProperties: false
        }],
        'no-useless-constructor': 'error',
        'no-useless-rename': 'error',

        // 最佳實踐
        'eqeqeq': ['error', 'always'],
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-return-await': 'error',
        'require-await': 'error',
        'max-len': ['error', {
            code: 100,
            ignoreUrls: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true
        }],
        'max-lines-per-function': ['warn', {
            max: 50,
            skipBlankLines: true,
            skipComments: true
        }],
        'complexity': ['warn', 10]
    },

    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)'
            ],
            env: {
                jest: true
            }
        }
    ]
}