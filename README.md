# 體驗台灣好文化 — 文化體驗活動訂票平台

一個完整的活動訂票電商網站，包含前台訂票流程、會員中心與管理後台。
以 React + Vite 建置前端，Express + json-server 提供 API，並串接 Firebase Auth 與 Cloudinary。

**線上 Demo**：https://seanhong1215.github.io/taiwan-culture-project
**後端 API**：https://taiwan-culture-project.onrender.com
*（後端部署於 Render 免費方案，閒置後首次請求約需 30 秒喚醒。）*

---

## 測試帳號

| 身分 | 帳號 | 密碼 | 可進入 |
|------|------|------|--------|
| 一般會員 | `user001@gmail.com` | `demo1234` | 前台 + 會員中心 |
| 活動管理員 | `admin123@gmail.com` | `demo1234` | 後台（活動 / 部落格） |
| 系統管理員 | `admin@gmail.com` | `demo1234` | 後台全部功能 |

> 後台入口：`/#/admin/login`
> 付款步驟為模擬流程，請勿輸入真實信用卡號。

---

## 主要功能

**前台**
- 活動瀏覽、關鍵字／日期／地區／類型／價格多條件篩選、分頁
- 四步驟訂票流程（填寫資料 → 確認訂單 → 付款 → 完成）
- 部落格文章列表與內文
- Email／Google／Facebook 三種登入方式
- 中／英／日三語系切換（目前覆蓋前台首頁與導覽列）

**會員中心**
- 個人資料維護、頭像上傳（Cloudinary）
- 訂單查詢與明細、活動收藏
- 每日簽到與積分兌換
- 活動評價、訊息與通知

**管理後台**
- 儀表板統計圖表（Recharts）
- 活動 / 部落格 / 會員 / 訂單 / 評價管理
- 角色權限：`ADMIN`（全部）與 `ACTIVITY_MANAGER`（活動與部落格）

---

## 技術重點

### 1. 後端才是權限的真正防線

前端的路由守衛（`RequireAuth` / `RequireAdmin`）只讀 localStorage，任何人都能在
DevTools 改一行就進到後台。因此授權判斷全部下放到
[`src/backend/server/auth.js`](src/backend/server/auth.js)：

- `resolveIdentity()` 驗證 **簽章與有效期限**，同時支援兩種 token
  （json-server-auth 簽發的 JWT／社群登入的 Firebase ID Token）
- `guardCollections()` 依資料表與 HTTP 方法決定權限：活動與文章僅管理者可寫入、
  使用者只能改自己的帳號、建立資料時以 token 身分覆寫 `userId` 防止偽造
- 中介層必須掛在 json-server 的 router **之前** —— router 會直接回應請求，
  掛在它之後的中介層永遠不會執行（這是本專案修過的一個實際漏洞）

### 2. 首屏 bundle 從 2 MB 降到 347 kB (gzip)

| | 拆分前 | 拆分後 |
|---|---|---|
| entry chunk | 2,001 kB | 57 kB |
| 首屏同步載入（JS+CSS） | 約 2,354 kB | 1,270 kB |
| 首屏 gzip 後 | — | **347 kB** |

做法：
- 路由層 `React.lazy` + `Suspense`，訪客看首頁不再下載整個後台
- `vite.config.js` 依「套件名稱」而非路徑片段做 `manualChunks`
  （用路徑比對會連巢狀的 `recharts/node_modules/react-is` 一起吃進來，
  而 `react-is` 是首屏共用套件，會把整包 recharts 反向拖進首屏）
- Firebase SDK 改為動態 `import()`，只在按下社群登入時才下載（省 247 kB）
- CI 會執行 [`scripts/check-bundle-size.mjs`](scripts/check-bundle-size.mjs)，
  首屏 gzip 超過 400 kB 就讓建置失敗

### 3. 付款資料不落地

送出訂單時只保留持卡人、卡別與卡號末四碼，
完整卡號、有效期限與 CVV 不會離開表單元件
（[`src/frontend/utils/payment.js`](src/frontend/utils/payment.js)）。
`toSafePaymentRecord()` 採白名單而非黑名單，表單日後新增欄位也不會誤帶進資料庫。

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | React 18、React Router 7、Vite 6 |
| UI | Bootstrap 5、React Bootstrap、SCSS、Lucide Icons |
| 表單 | React Hook Form |
| 視覺化 | Recharts、Leaflet、Swiper |
| 多語系 | i18next / react-i18next |
| 後端 | Express 4、json-server + json-server-auth |
| 驗證 | Firebase Auth（社群登入）+ JWT |
| 圖片 | Cloudinary |
| 測試 | Vitest、React Testing Library |
| 部署 | GitHub Pages（前端）、Render（後端） |

---

## 本機啟動

需求：Node.js 18 以上。

```bash
git clone https://github.com/seanhong1215/taiwan-culture-project.git
cd taiwan-culture-project
npm install
cp .env.example .env      # 填入自己的 Firebase / Cloudinary 設定
```

前後端需要各開一個終端機：

```bash
npm run server            # 後端 API，http://localhost:3001
npm run dev               # 前端，http://localhost:5173
```

> 沒有 Firebase 憑證檔也能啟動 —— 服務會印出警告並停用社群登入，
> 其餘功能（Email 登入、訂票、後台）不受影響。

### 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動前端開發伺服器 |
| `npm run server` | 啟動後端 API |
| `npm run build` | 建置正式版到 `dist/` |
| `npm run preview` | 預覽建置結果 |
| `npm run lint` | ESLint 檢查 |
| `npm test` | 單元測試（watch 模式） |
| `npm run test:run` | 單元測試（跑一次，CI 用） |
| `npm run coverage` | 測試覆蓋率報告 |
| `npm run check-bundle` | 檢查首屏 bundle 是否超出預算 |
| `npm run refresh-demo-dates` | 把 demo 活動日期整體平移到未來（見下方說明） |
| `npm run deploy` | 部署前端到 GitHub Pages |

> **維護 demo 資料**：種子資料的活動日期是固定的，時間一久就全部過期，
> 造訪者會發現每個活動都無法選日期。執行 `npm run refresh-demo-dates`
> 會把所有活動日期整體往後平移（保留彼此的相對間隔），並依活動日期
> 重建 `reservations`，確保日曆上可選的日期與活動日期一致。

---

## 專案結構

```
src/
├── backend/
│   ├── json/db.json            # json-server 資料來源
│   └── server/
│       ├── server.js           # Express 進入點
│       ├── auth.js             # 認證與授權中介層
│       └── auth.test.js
└── frontend/
    ├── main.jsx / App.jsx      # 進入點與根元件
    ├── router/                 # 路由設定（含 lazy loading）
    ├── layouts/                # FrontendLayout / AdminLayout / MemberCenterLayout
    ├── pages/
    │   ├── Home/               # 前台與會員中心
    │   └── Admin/              # 管理後台
    ├── components/             # 共用元件
    ├── utils/                  # api / date / payment 等工具
    ├── i18n/                   # 中英日語系檔
    └── assets/                 # SCSS、圖片、Firebase 設定
```

更完整的架構、資料表與 API 說明請見 [ARCHITECTURE.md](ARCHITECTURE.md)。

---

## 測試

```bash
npm run test:run
```

目前涵蓋：

- `payment.js` — 付款資料脫敏（含「不得輸出敏感欄位」的迴歸測試）
- `date.js` — 日期格式化（原實作的 `YYYY-MM-DD` 會回傳 `MM-DD-YYYY`，由測試抓出）
- `auth.js` — 授權中介層：token 驗簽、角色權限、跨使用者存取防護
- `RouteGuards` — 前台／後台路由守衛的導向行為

---

## 已知限制

- **資料庫**：json-server 沒有交易機制，不適合正式營運，後續應遷移至 PostgreSQL / MongoDB
- **社群登入 token**：Firebase ID Token 約 1 小時到期；目前由 axios interceptor
  接到 401 後自動清除憑證並導回登入頁，尚未實作 refresh token
- **i18n**：語系檔僅覆蓋前台首頁與導覽列，其餘頁面仍為寫死中文
- **SEO**：因部署於 GitHub Pages 而採用 HashRouter，網址含 `#`，不利於搜尋引擎索引
- **測試覆蓋**：目前集中在工具函式與授權邏輯，頁面元件的整合測試尚未補齊
