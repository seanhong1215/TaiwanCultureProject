# 體驗台灣好文化 — 文化體驗活動訂票平台

一個完整的活動訂票電商網站，包含前台訂票流程、會員中心與管理後台。
以 React + Vite 建置前端，Express + Prisma + PostgreSQL（Supabase）提供 API，
並串接 Firebase Auth 與 Cloudinary。

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
  （自建 `/api/signin` 簽發的 JWT／社群登入的 Firebase ID Token）
- `guardCollections()` 依資料表與 HTTP 方法決定權限：活動與文章僅管理者可寫入、
  使用者只能改自己的帳號（且不能自己把 `role` 改成管理者）、
  建立資料時以 token 身分覆寫 `userId` 防止偽造
- 中介層必須掛在各資源路由 **之前** —— 路由會直接回應請求，
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

### 4. 從 json-server 換成 Prisma + PostgreSQL，前端零改動

專案最初用 json-server（檔案型 mock API）起步方便，但沒有交易機制、
Render 免費方案每次冷啟動都要重新讀整個 `db.json`，也不是能拿去正式營運的東西。
換成 Prisma + Supabase（PostgreSQL）時刻意保留了原本的 REST 路徑與回應形狀
（例如 `_page`/`_limit`、`_expand=user`、`reservations` 的日期扁平結構），
前端 11 個 `api/*.js` 模組完全不用改一行：

- 深巢狀／不定形欄位（`activityDetails`、`rewards`、`paymentData`）用 Postgres 的 `Json` 型別存，
  不用為了一個沒有查詢需求的巢狀物件過度正規化成一堆關聯表
- 每個路由用白名單（`pick()`）挑欄位寫入，行為上模擬 json-server「多餘欄位安靜地被忽略」的
  寬鬆特性，同時擋掉 Prisma 對未知欄位的嚴格報錯
- 重寫時順手補了一個舊架構就存在的權限漏洞：`guardCollections` 原本只檢查
  「本人或管理者」能不能 PATCH `/users/:id`，沒檢查改了哪個欄位——
  一般會員原本可以自己把 `role` 改成 `ADMIN`
- 一次性資料搬遷腳本（[`scripts/migrate-to-postgres.mjs`](scripts/migrate-to-postgres.mjs)）
  用 `--dry-run` 先核對筆數，正式寫入時保留原本的整數 id 以維持既有的外鍵關聯，
  寫入後再手動 `setval()` 把 Postgres 的 auto-increment 序列追上最大 id
- 部署到 Render 時連不上 Supabase：Supabase 的 direct connection 只支援
  IPv6，Render 的對外網路沒有 IPv6 出口。改用 Supavisor 的 Session pooler
  （IPv4 相容）解決，本機保留 direct connection——兩邊環境不同，本來就該用
  不同的連線字串，不是設定錯誤

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | React 18、React Router 7、Vite 6 |
| UI | Bootstrap 5、React Bootstrap、SCSS、Lucide Icons |
| 表單 | React Hook Form |
| 視覺化 | Recharts、Leaflet、Swiper |
| 多語系 | i18next / react-i18next |
| 後端 | Express 4、Prisma 6 |
| 資料庫 | PostgreSQL（Supabase） |
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
npm install                # postinstall 會自動跑 prisma generate
cp .env.example .env       # 填入自己的 Firebase / Cloudinary / DATABASE_URL 設定
npx prisma migrate dev     # 依 prisma/schema.prisma 在你的 Postgres 建表
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
| `npm run prisma:migrate` | 依 schema 變更建立並套用新的 migration |
| `npm run prisma:studio` | 開啟 Prisma Studio 圖形化檢視／編輯資料庫 |
| `npm run db:migrate-data` | 一次性把 `db.json` 的種子資料搬進 Postgres（`--dry-run` 先核對筆數） |

> **維護 demo 資料**：種子資料的活動日期是固定的，時間一久就全部過期，
> 造訪者會發現每個活動都無法選日期。執行 `npm run refresh-demo-dates`
> 會把所有活動日期整體往後平移（保留彼此的相對間隔），並依活動日期
> 重建 `reservations`，確保日曆上可選的日期與活動日期一致。
> 直接對 `DATABASE_URL` 指到的 Postgres 跑（用 `.env` 裡的連線字串），
> 不會動到 `db.json`——定期在本機跑一次就能讓線上 demo 的日期保持新鮮。

---

## 專案結構

```
src/
├── backend/
│   ├── json/db.json            # 遷移前的種子資料（現只作為一次性搬遷腳本的來源，不再是執行時的資料庫）
│   ├── lib/
│   │   ├── prisma.js           # PrismaClient 單例
│   │   └── pick.js             # 寫入白名單工具
│   └── server/
│       ├── server.js           # Express 進入點
│       ├── auth.js             # 認證與授權中介層
│       ├── auth.test.js
│       └── routes/             # 各資源的 CRUD 路由（activity / journal / users / orders …）
prisma/
├── schema.prisma               # 資料模型定義
└── migrations/                 # migration 歷史
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

更完整的架構、資料表與 API 說明請見 [ARCHITECTURE.md](ARCHITECTURE.md)，
分支策略與 commit 規範請見 [CONTRIBUTING.md](CONTRIBUTING.md)。

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

- **後端仍部署在 Render 免費方案**：GitHub Actions 排程每 10 分鐘打一次
  `/health`，讓 Render 不會閒置到觸發 15 分鐘的休眠門檻，也順便讓 Supabase
  免費方案不會因為連續 7 天沒有資料庫活動而暫停專案。GitHub Actions 的排程
  時間本身不保證準點，遇到延遲或跳過一次時還是可能踩到冷啟動
- **社群登入 token**：Firebase ID Token 約 1 小時到期；目前由 axios interceptor
  接到 401 後自動清除憑證並導回登入頁，尚未實作 refresh token
- **i18n**：語系檔僅覆蓋前台首頁與導覽列，其餘頁面仍為寫死中文
- **SEO**：因部署於 GitHub Pages 而採用 HashRouter，網址含 `#`，不利於搜尋引擎索引
- **測試覆蓋**：目前集中在工具函式與授權邏輯，頁面元件的整合測試尚未補齊
