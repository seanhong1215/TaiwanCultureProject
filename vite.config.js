import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? 'taiwan-culture-project' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // 設置 @ 為 src 目錄的別名
    },
  },
})
