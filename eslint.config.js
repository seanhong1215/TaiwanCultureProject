import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importPlugin from 'eslint-plugin-import'

/*
 * ESLint flat config。
 *
 * 先前的設定混用了舊版 eslintrc 的寫法（字串型 plugins、extends 陣列），
 * flat config 並不支援，等於整份設定沒有生效；再加上 no-undef / no-unused-vars
 * 被關掉，實際上幾乎抓不到任何問題。這裡改回正確的 flat config 寫法。
 */
export default [
  { ignores: ['dist', 'build', 'coverage', 'node_modules'] },

  js.configs.recommended,

  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: '18.3' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off', // 專案以 PropTypes 選擇性標註，不強制
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // 未使用的變數維持警告：既有程式碼還有一批待清理，但新程式碼會立刻被提醒
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // 後端與建置腳本：Node 環境
  {
    files: ['src/backend/**/*.js', 'scripts/**/*.{js,mjs}', '*.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off', // 這些檔案本來就靠 console 輸出
    },
  },

  // 測試：Node + 瀏覽器 + Vitest 全域
  {
    files: ['**/*.{test,spec}.{js,jsx}', 'src/tests/**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser, ...globals.vitest },
    },
    rules: {
      'no-console': 'off',
    },
  },
]
