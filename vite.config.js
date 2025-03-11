import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? 'taiwan-culture-project' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' ? 'https://taiwan-culture-project.onrender.com' : 'http://localhost:3002', // 對應 JSON Server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      '@': '/src', // 設置 @ 為 src 目錄的別名
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/frontend/assets/css/variables.scss" as *;`, // 引入全局變數文件
      },
    },
  }
})
