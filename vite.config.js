import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/taiwan-culture-project/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' ? 'https://taiwan-culture-project.onrender.com' : 'http://localhost:3001', // 對應 JSON Server URL
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
  },
  build: {
    // 拆掉單一 2MB bundle：先做路由層 lazy loading（見 router/index.jsx），
    // 再把體積大且各自只有少數頁面用到的第三方套件獨立成 chunk，
    // 讓首頁不必為了「某個後台頁面才用到的圖表庫」付出下載成本。
    rollupOptions: {
      output: {
        // 依「套件名稱」而非路徑片段分組。
        //
        // 兩個踩過的坑：
        // 1) 物件形式（{ 'vendor-charts': ['recharts'] }）會把傳遞相依一起
        //    拉進同一個 chunk，只要其中有任何模組出現在首屏路徑，整個 chunk
        //    就會被提升成 entry 的靜態相依。
        // 2) 用 id.includes('/recharts/') 比對，會連巢狀的
        //    recharts/node_modules/react-is 一起吃進來，而 react-is 是
        //    react-bootstrap 首屏就要用的共用套件 —— 同樣造成整包被提升。
        // 因此這裡取「最後一個 node_modules 之後的套件名」再做精確比對，
        // 共用套件會留在預設 chunk，不會把整包 vendor 拖進首屏。
        manualChunks(id) {
          const marker = 'node_modules/';
          const index = id.lastIndexOf(marker);
          if (index === -1) return undefined;

          const rest = id.slice(index + marker.length);
          const segments = rest.split('/');
          const pkg = rest.startsWith('@') ? `${segments[0]}/${segments[1]}` : segments[0];

          if (pkg === 'quill' || pkg === 'react-quill') return 'vendor-editor';
          if (pkg === 'recharts' || pkg === 'victory-vendor' || pkg.startsWith('d3-')) return 'vendor-charts';
          if (pkg === 'leaflet') return 'vendor-map';
          if (pkg === 'swiper') return 'vendor-carousel';
          if (pkg === 'firebase' || pkg.startsWith('@firebase/')) return 'vendor-firebase';
          if (pkg === 'sweetalert2') return 'vendor-alert';
          if (pkg === 'bootstrap' || pkg === 'react-bootstrap') return 'vendor-bootstrap';
          if (pkg === 'i18next' || pkg === 'react-i18next') return 'vendor-i18n';
          if (pkg === 'react' || pkg === 'react-dom' || pkg === 'scheduler') return 'vendor-react';
          if (pkg === 'react-router' || pkg === 'react-router-dom') return 'vendor-react';
          if (pkg === 'react-datepicker' || pkg === 'date-fns') return 'vendor-datepicker';
          if (pkg === '@tanstack/react-query' || pkg === '@tanstack/query-core') return 'vendor-query';

          // 其餘第三方套件統一進 vendor。
          // 少了這個保底，被 entry 與某個 lazy 頁面「同時使用」的共用模組
          // 會被 Rollup 併進那個 lazy chunk，導致整包（例如 recharts）
          // 反過來被 entry 靜態相依而在首頁就下載。
          return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/frontend/utils/**', 'src/backend/server/**'],
    },
  },
})
