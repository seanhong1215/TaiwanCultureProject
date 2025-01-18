import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? 'taiwan-culture-project' : '/',
  plugins: [react()],
  build: {
    assetsInlineLimit: 0, // 禁用內聯資源，確保所有文件打包到 dist
  },
  resolve: {
    alias: {
      '@': '/src', // 設置 @ 為 src 目錄的別名
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "src/assets/css/_variables.scss";`
      }
    }
  }
})
