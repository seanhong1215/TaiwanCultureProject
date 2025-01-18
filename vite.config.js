import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? 'taiwan-culture-project' : '/',
  plugins: [react()],
  publicDir: 'public', // 默認為 public 資料夾,
  build: {
    outDir: "dist",
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
