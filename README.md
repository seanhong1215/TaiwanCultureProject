# 體驗台灣好文化 團隊專案

**專案簡介：**

本專案是一個 React 前端應用程式，旨在為使用者提供一個沉浸式的平台，探索台灣各地的人文風情。

## 專案簡介
```bash
your-project-name/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   ├── assets/
│   ├── pages/
│   ├── utils/
│   └── main.jsx
├── vite.config.js
├── package.json
└── package-lock.json
```

* **public:** 放置靜態檔案，如 index.html。
* **src:** 存放源碼：
  * **components:** 共用元件
  * **assets:** 靜態資源（圖片、SCSS）
  * **layouts:** 頁面佈局
  * **pages:** 各個頁面
  * **main.js:** 應用程式入口
* **vite.config.js:** Vite 配置
* **package.json:** 依賴管理

## 開發環境設置

1. 安裝 ```Node.js``` 和 ```npm:``` 請確保您的系統已安裝 ```Node.js``` (版本 v16 以上) 和 ```npm。```
2. ```clone 專案:```
   ```bash
   git clone [https://github.com/your-username/your-project-name.git](https://github.com/your-username/your-project-name.git)
   ```
3. **安裝依賴:**
  ```bash
  cd your-project-name
  npm install
```
4. **啟動開發伺服器:**
  ```bash
  npm run dev
```

常用指令
- ```npm run dev:``` 啟動開發模式，自動監聽檔案變更並重新載入。
- ```npm run build:``` 執行編譯，生成生產環境所需的檔案。
- ```npm run deploy:``` 部署到 GitHub Pages。

資料夾結構說明
- ```assets:``` 存放靜態資源，如圖片、樣式檔案。
- ```layouts:``` 放置頁面共用的佈局元件。
- ```pages:``` 放置各個獨立頁面。

注意事項
- ```SCSS:``` 我們使用 ```SCSS``` 作為樣式預處理器。
- 頁面路由: 請參考 ```React Router``` 的文件，設定頁面路由。
- 部署: 確保已在 ```GitHub``` 上建立對應的 ```repository```，並設置好部署腳本。

部署到 GitHub Pages (Windows)
1. 初始化 Git:
```bash
git init
git add .
git commit -m 'first commit'
git branch -M main
git remote add origin [https://github.com/your-username/your-project-name.git](https://github.com/your-username/your-project-name.git)
git push -u origin main
```
2. 執行部署指令:
```bash
npm run deploy
```

提醒:

- 部署腳本: 請確保 ```npm run deploy``` 指令的具體內容是正確的，並且已配置好 ```GitHub Pages``` 的部署設定。
- ```.gitignore:``` 這個檔案用來指定哪些檔案不需要提交到版本控制系統，請不要隨意修改。
- 開發模式: 在開發過程中，請保持 ```npm run dev``` 執行，這樣才能實時看到修改後的效果。

建議:
- 版本控制: 勤於提交程式碼，以便追蹤變更。
- 程式碼風格: 建議遵循統一的程式碼風格指南，例如 ```Airbnb JavaScript Style Guide。```
- 除錯工具: 善用瀏覽器的開發者工具來除錯。

更多資訊:
- ```Vite``` 官方文件: https://vitejs.dev/
- ```React``` 官方文件: https://reactjs.org/
- 本文件將持續更新，敬請關注。



  