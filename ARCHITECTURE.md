# 台灣文化體驗專案 — 架構文件

> 適用對象：協作此專案的工程師
> 最後更新：2026-09-08

---

## 目錄

1. [專案概述](#1-專案概述)
2. [技術棧](#2-技術棧)
3. [目錄結構](#3-目錄結構)
4. [環境設定](#4-環境設定)
5. [啟動方式](#5-啟動方式)
6. [前端架構](#6-前端架構)
7. [後端架構](#7-後端架構)
8. [資料庫結構](#8-資料庫結構)
9. [路由設計](#9-路由設計)
10. [身份驗證流程](#10-身份驗證流程)
11. [API 說明](#11-api-說明)
12. [樣式規範](#12-樣式規範)
13. [部署流程](#13-部署流程)
14. [已知問題與注意事項](#14-已知問題與注意事項)

---

## 1. 專案概述

**台灣文化體驗** 是一個活動訂票與文化推廣平台，提供：

- 前台：活動瀏覽、訂票、部落格、會員中心
- 後台：管理員與活動管理員的管理介面

**線上網址（Frontend）**：https://seanhong1215.github.io/taiwan-culture-project
**後端服務**：https://taiwan-culture-project.onrender.com

---

## 2. 技術棧

| 層級 | 技術 | 版本 |
|------|------|------|
| 前端框架 | React | 18.3 |
| 前端路由 | React Router | 7 |
| 建置工具 | Vite | 6 |
| UI 框架 | Bootstrap | 5.3 |
| 圖示庫 | Lucide React | 0.475 |
| 樣式 | SCSS | - |
| 表單 | React Hook Form | 7 |
| HTTP | Axios | 1.7 |
| 提示 | SweetAlert2 | 11 |
| 富文字編輯 | React Quill | 2 |
| 圖表 | Recharts | 2 |
| 地圖 | Leaflet | 1.9 |
| 輪播 | Swiper | 11 |
| 多語系 | i18next | 24 |
| 後端框架 | Express.js | 4 |
| ORM | Prisma | 6 |
| 資料庫 | PostgreSQL（Supabase 代管） | - |
| 身份驗證 | Firebase Auth + Firebase Admin SDK | 11 / 13 |
| 圖片儲存 | Cloudinary | 2 |
| 部署 | GitHub Pages（前端）+ Render（後端）| - |

---

## 3. 目錄結構

```
taiwan-culture-project/
├── public/
│   └── img/
│       ├── avatar/          # 預設頭像 image-1.png ~ image-6.png
│       └── menu/            # 導覽列背景圖
├── src/
│   ├── frontend/
│   │   ├── main.jsx         # 應用程式入口
│   │   ├── App.jsx          # 根元件
│   │   ├── assets/
│   │   │   ├── css/         # 全局 SCSS（_variables, _global, _mixins, main）
│   │   │   ├── images/      # 靜態圖片
│   │   │   └── js/
│   │   │       └── firebaseConfig.js   # Firebase 前端設定
│   │   ├── components/      # 共用元件（見第6節）
│   │   ├── i18n/            # 多語系（en, jp, zhCn）
│   │   ├── layouts/         # 版面配置（FrontendLayout, AdminLayout, MemberCenterLayout）
│   │   ├── pages/
│   │   │   ├── Admin/       # 後台頁面
│   │   │   └── Home/        # 前台頁面
│   │   ├── router/
│   │   │   └── index.jsx    # 路由設定（含 RequireAuth / RequireAdmin）
│   │   └── utils/
│   │       ├── api/          # 依領域拆分的 API 呼叫函式（activity/order/review…共 11 個模組）
│   │       │   └── client.js # 共用 axios 實例（baseURL、token 攔截器、401 自動登出）
│   │       └── constants.js  # 角色常數、localStorage key 常數
│   └── backend/
│       ├── lib/
│       │   ├── prisma.js     # PrismaClient 單例
│       │   └── pick.js       # 寫入白名單工具
│       ├── server/
│       │   ├── server.js     # Express 伺服器主檔
│       │   ├── auth.js       # 認證與授權中介層
│       │   └── routes/       # 各資源的 CRUD 路由（activity / journal / users / orders …）
│       └── json/
│           └── db.json       # 遷移前的種子資料，現在只作為一次性搬遷腳本的來源
├── prisma/
│   ├── schema.prisma          # 資料模型定義
│   └── migrations/            # migration 歷史
├── scripts/
│   └── migrate-to-postgres.mjs  # 一次性把 db.json 搬進 Postgres
├── .env                      # 環境變數（不進 git）
├── .env.example              # 環境變數範本
├── vite.config.js
└── package.json
```

---

## 4. 環境設定

複製 `.env.example` 為 `.env`，填入以下值：

```env
# Firebase Admin SDK（後端用）
FIREBASE_SERVICE_ACCOUNT_PATH=./taiwancultureproject-firebase-adminsdk-fbsvc-xxxx.json

# Cloudinary（圖片上傳）
CLOUD_NAME=你的cloud_name
API_KEY=你的api_key
API_SECRET=你的api_secret

# 伺服器
PORT=3001

# Postgres（Supabase）— Project Settings → Database → Connection string → URI
# 主機是 db.<專案 ref 亂碼>.supabase.co，不是專案顯示名稱；
# 這組 direct connection 只支援 IPv6，Render 這類沒有 IPv6 出口的環境
# 要改用 Connection Pooling（Supavisor）那組 aws-0-<region>.pooler.supabase.com
# 位址，帳號也要加上 .<專案 ref> 後綴（見第 13 節部署流程）
DATABASE_URL=postgresql://postgres:密碼@db.xxxxxxxxxxxx.supabase.co:5432/postgres

# Firebase 前端設定（VITE_ 前綴才能在 Vite 讀取）
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> ⚠️ Firebase Admin SDK 的金鑰 JSON 檔不可上傳 git，已在 `.gitignore` 排除。

---

## 5. 啟動方式

```bash
# 安裝依賴（postinstall 會自動跑 prisma generate）
npm install

# 依 prisma/schema.prisma 在你的 Postgres 建表（第一次跑，或 schema 有變動時）
npx prisma migrate dev

# 開發模式（前端 Vite dev server，port 5173）
npm run dev

# 啟動後端伺服器（port 3001）
npm run server

# 建置前端
npm run build

# 部署至 GitHub Pages
npm run deploy
```

> 開發時需同時啟動前端（`npm run dev`）與後端（`npm run server`）兩個 terminal。
> `npx prisma studio` 可以開一個圖形化介面（`localhost:5555`）直接瀏覽／編輯資料庫。

---

## 6. 前端架構

### 版面配置（Layouts）

| 元件 | 使用場景 | 包含 |
|------|----------|------|
| `FrontendLayout` | 前台所有頁面 | Header + Footer |
| `AdminLayout` | 後台所有頁面 | AdminMenu（側邊欄）+ AdminHeader |
| `MemberCenterLayout` | 會員中心 | Header + MemberMenu + Footer |

### 路由保護

```jsx
// 一般會員保護：需有 token
<RequireAuth> → 檢查 localStorage.token

// 後台保護：需有 token 且 role 為 ADMIN 或 ACTIVITY_MANAGER
<RequireAdmin> → 檢查 localStorage.token + localStorage.userRole
```

### localStorage 使用規範

| Key | 說明 |
|-----|------|
| `token` | JWT（一般登入）或 Firebase ID Token（社群登入）|
| `userId` | 資料庫 `users.id`（自增整數） |
| `userName` | 顯示名稱 |
| `userEmail` | Email |
| `userRole` | `ADMIN` / `ACTIVITY_MANAGER` / `Member` |
| `userAvatar` | 頭像 URL（可為本地路徑如 `/img/avatar/image-6.png`）|

### 共用元件說明

| 元件 | 路徑 | 說明 |
|------|------|------|
| `Header` | `components/Header` | 前台導覽列，含登入/登出/社群登入 |
| `Footer` | `components/Footer` | 頁尾 |
| `AuthModal` | `components/Modal/AuthModal` | 登入/註冊彈窗 |
| `ActivityCard` | `components/Card/ActivityCard` | 活動卡片 |
| `BlogCard` | `components/Card/BlogCard` | 部落格卡片 |
| `PageNation` | `components/PageNation` | 分頁元件 |
| `OrderModal` | `components/Modal/OrderModal` | 訂單新增/編輯彈窗 |
| `BlogModal` | `components/Modal/BlogModal` | 部落格新增/編輯彈窗（含 ReactQuill）|
| `ActivityModal` | `components/Modal/ActivityModal` | 活動新增/編輯彈窗 |

### 多語系

使用 `i18next`，支援 `en`（英文）、`jp`（日文）、`zhCn`（繁體中文）。
語系檔在 `src/frontend/i18n/`，在元件中使用 `useTranslation()` hook。

---

## 7. 後端架構

後端是 **Express.js + Prisma**。曾經用 json-server（檔案型 mock API）起步，
後來換成 Prisma + PostgreSQL（Supabase）——沒有交易機制、Render 冷啟動要重讀
整個 `db.json`，都不是能撐正式營運的東西。換底層資料庫時刻意保留原本的
REST 路徑與回應形狀，前端完全不用改。

### 自定義端點

| Method | 路徑 | 說明 | 需要驗證 |
|--------|------|------|----------|
| POST | `/api/auth` | 驗證 Firebase ID Token，回傳用戶資料 | 否 |
| POST | `/upload-to-cloudinary` | 上傳圖片到 Cloudinary | 是（Bearer Token）|
| GET | `/health` | 健康檢查（含一次 `SELECT 1`），keep-alive 排程用 | 否 |
| GET | `/api/admin/summary` | 後台統計（users/activity/orders 筆數） | 是（ADMIN / ACTIVITY_MANAGER）|

### 資源路由（`src/backend/server/routes/`）

每個資源一個檔案，包在 Express Router 裡，掛在對應的 `/api/<resource>` 前綴下：

| 資源 | 路徑 | 檔案 | 說明 |
|------|------|------|------|
| 用戶 | `/api/users` | `users.js` | 列表支援 `?uuid=`／`_page`+`_limit`；GET 回應一律不含密碼欄位 |
| 活動 | `/api/activity` | `activity.js` | 支援 `_page`+`_limit` |
| 部落格 | `/api/journal` | `journal.js` | 支援 `_page`+`_limit` |
| 訂單 | `/api/orders` | `orders.js` | 支援 `?userId=`、`_expand=user`、`_sort=id&_order=desc&_limit=1`（產生訂單編號用）|
| 收藏 | `/api/favorites` | `favorites.js` | 支援 `?userId=` |
| 評價 | `/api/reviews` | `reviews.js` | 支援 `?activityId=`、`_page`+`_limit` |
| 預約 | `/api/reservations` | `reservations.js` | 回應形狀是 `{id, "2026-12-20": {...}}` 這種日期扁平結構，內部用 `activityId` + `dates`(Json) 存 |
| 個人檔案 | `/api/profiles` | `profiles.js` | 支援 `?userId=`、`_expand=user` |
| 通知 | `/api/notifications` | `notifications.js` | 一般會員只能新增，管理者才能改／刪 |
| 註冊／登入 | `/api/register`、`/api/signin` | `authRoutes.js` | 取代原本的 json-server-auth，簽發格式不變（`{ accessToken, user }`）|

每個路由用 `pick()`（`src/backend/lib/pick.js`）挑白名單欄位才寫入資料庫，
模擬 json-server「多餘欄位安靜地被忽略」的寬鬆特性，同時擋掉 Prisma 對
未知欄位的嚴格報錯。

### 授權規則（`guardCollections`，見 `auth.js`）

```
users:         本人或管理者可寫；但只有本來就是管理者，才能把 role 改成管理者角色
activity, journal:  僅 ADMIN / ACTIVITY_MANAGER 可寫入
notifications: 一般會員可以新增（POST），只有管理者可以修改／刪除
其他資源（orders/reviews/favorites/reservations/profiles）：登入即可寫入
```

> ⚠️ 建立資料時（`POST`），伺服器一律用 token 裡的身分覆寫 `req.body.userId`，
> 避免前端偽造成別人的資料。
> ⚠️ 公開使用者無法直接 `POST /api/users`，建立新用戶需透過 `/api/register`
> （且 `role` 欄位帶 `ADMIN`/`ACTIVITY_MANAGER` 也會被伺服器忽略掉，強制當
> 一般會員）。

---

## 8. 資料庫結構

完整定義見 [`prisma/schema.prisma`](prisma/schema.prisma)。九個 model，關聯清楚的
地方（favorites/profiles/reservations）建真外鍵，深巢狀或不定形的欄位
（`activityDetails`、`rewards`、`paymentData` 等）用 Postgres 的 `Json` 型別存，
避免為了沒有查詢需求的巢狀物件過度正規化成一堆關聯表。

| Model | 對應資源 | 說明 |
|-------|----------|------|
| `User` | `/api/users` | `role`：`ADMIN` \| `ACTIVITY_MANAGER` \| `Member`；`rewards`/`tickets` 為 Json |
| `Activity` | `/api/activity` | `content`、`activityDetails`（含 `images[]`/`trip`/`map`/`sections[]`）為 Json |
| `Journal` | `/api/journal` | 純文章資料 |
| `Review` | `/api/reviews` | 透過 `activityId` 關聯 `Activity`（目前資料沒有 `userId`，留言者用 `name`/`avatar` 冗餘存）|
| `Favorite` | `/api/favorites` | `userId` + `activityId` 唯一鍵 |
| `Profile` | `/api/profiles` | 與 `User` 一對一（`userId` 唯一） |
| `Reservation` | `/api/reservations` | `activityId` 一對一；`dates`（Json）存 `{ "YYYY-MM-DD": { price, remaining } }`，API 邊界會攤平成扁平物件（見第 7 節） |
| `Order` | `/api/orders` | 主鍵是字串 `id`（如 `ORD202403210001`）；`userId`/`activityId` 皆為 nullable（見下方已知資料瑕疵）；`activityPeriod`/`paymentData` 為 Json |
| `Notification` | `/api/notifications` | 純訊息記錄 |

**已知資料瑕疵**：種子資料裡有 1 筆訂單缺 `userId`/`activityId`
（一次性搬遷腳本 `scripts/migrate-to-postgres.mjs` 已經把它們設成 `null`，
不會讓外鍵約束擋下整個搬遷；訂單本身的其餘欄位——金額、聯絡人等——不受影響）。

**種子資料搬遷**：`db.json` 現在只作為 `scripts/migrate-to-postgres.mjs`
一次性搬遷腳本的資料來源，不再是執行時讀寫的資料庫。刻意排除的死資料
collection：`tickets`、`payments`（皆為空）、`userStats`、`vouchers`（無任何
程式碼讀取）。

---

## 9. 路由設計

```
/                               前台首頁
/activity-list                  活動列表
/activity-list/:id              活動詳情
/activity-list/booking1~4       訂票流程（步驟 1-4）
/journal-list                   部落格列表
/journal-list/:id               部落格詳情

/member-center/*                [RequireAuth] 需登入
  personal-data                 個人資料
  order-management/list         訂單列表
  order-management/detail/:id   訂單詳情
  collection-list               收藏清單
  sign-in                       每日簽到
  activity-points               活動積分
  customer-support              客服支援
  center                        會員中心首頁
  activity-manager              活動管理（ACTIVITY_MANAGER 專用）
  notifications                 通知

/admin/login                    後台登入（不需驗證）
/admin/*                        [RequireAdmin] 需 ADMIN 或 ACTIVITY_MANAGER 角色
  dashboard                     總覽
  member                        用戶管理
  order-list                    訂單管理
  blog                          部落格管理
  activity-list                 活動列表管理
  activity-list/:id             活動詳情管理
  evaluation                    評價管理
```

---

## 10. 身份驗證流程

### 一般登入（Email + Password）

```
用戶輸入帳密
  → POST /api/signin（routes/authRoutes.js，bcrypt 比對密碼）
  → 回傳 { accessToken, user }（user 不含密碼欄位）
  → 存 token 至 localStorage
```

### 社群登入（Google / Facebook）

```
用戶點擊社群登入
  → Firebase signInWithPopup()
  → 取得 Firebase ID Token（getIdToken()）
  → POST /api/auth（後端驗證）
  → 後端用 Firebase Admin SDK 驗證 Token
  → 回傳 { user: { uid, email, name, picture } }
  → createMember()：查詢 /api/users?uuid=xxx
      - 已存在：直接使用
      - 不存在：POST /api/register → PATCH /api/users/:id 補充資料
  → 存 Firebase ID Token 至 localStorage.token
```

> ⚠️ 社群登入儲存的是 **Firebase ID Token**，而非本地簽發的 JWT。
> `auth.js` 的 `resolveIdentity()` 會依序嘗試兩種驗證方式（先試本地 JWT，
> 失敗再試 Firebase ID Token），所以兩種登入方式都能通過同一套授權中介層，
> 但 Firebase ID Token 約 1 小時就會過期（見第 14 節）。

### 後台登入

```
管理員輸入帳密（/admin/login 頁面）
  → POST /api/signin
  → 驗證 role 是否為 ADMIN 或 ACTIVITY_MANAGER
  → 是：存 token 等資料，導向 /admin/dashboard
  → 否：清除 token，顯示無權限提示
```

---

## 11. API 說明

API 呼叫依領域拆成 `src/frontend/utils/api/` 底下 11 個模組
（`activity.js`、`order.js`、`review.js`…），共用同一個 axios 實例
（`client.js`：baseURL、token 攔截器、401 自動清除登入狀態）。

### 重要函式

```js
// member.js — 社群登入用戶建立（先查找再建立）
createMember(user)
// 流程：GET /api/users?uuid → POST /api/register → PATCH /api/users/:id

// upload.js — 圖片上傳（需登入 token，簽名與上傳都在後端完成）
uploadImageToCloudinary(file)
// 流程：POST /upload-to-cloudinary（multipart/form-data）

// order.js — 訂單建立（自動產生訂單編號 ORDyyyymmddXXXX）
createOrder(orderData)
// 流程：GET /api/orders?_sort=id&_order=desc&_limit=1 取得上一筆訂單編號 → POST /api/orders
```

### Axios 基礎設定（`utils/api/client.js`）

```js
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.PROD ? 'https://taiwan-culture-project.onrender.com' : 'http://localhost:3001')
```

---

## 12. 樣式規範

### 主題色彩

| 變數 | 色碼 | 用途 |
|------|------|------|
| `$primary-color-5` | `#4DAAB0` | 主要品牌色 |
| `$secondary-color-5` | `#EC6800` | 強調/CTA 色 |
| `--color-primary` | `#4DAAB0` | CSS 變數（同上）|

### SCSS 檔案說明

| 檔案 | 說明 |
|------|------|
| `_variables.scss` | 顏色、字體大小變數 |
| `_global.scss` | 全局樣式、通用 class、RWD |
| `_mixins.scss` | 可重用 mixin |
| `main.scss` | 統一匯入以上三檔 |

### 按鈕使用規範

```html
<!-- 主要按鈕 -->
<button class="btn btn-primary">...</button>

<!-- 自定義主色按鈕 -->
<button class="btn btn-custom-primary">...</button>

<!-- 輪廓按鈕 -->
<button class="btn btn-custom-outline-primary">...</button>
```

### RWD 斷點（對應 Bootstrap）

| 斷點 | 像素 | 說明 |
|------|------|------|
| xs | < 576px | 手機 |
| sm | ≥ 576px | 大手機 |
| md | ≥ 768px | 平板 |
| lg | ≥ 992px | 桌機 |
| xl | ≥ 1200px | 大桌機 |

---

## 13. 部署流程

### 前端（GitHub Pages）

```bash
npm run build   # 建置到 /dist
npm run deploy  # 推送 dist 到 gh-pages 分支
```

Vite 設定：生產環境 `base: '/taiwan-culture-project/'`

> ⚠️ 使用 `HashRouter`（`#` 路由），因為 GitHub Pages 不支援 HTML5 history mode。

### 後端（Render）

- 直接部署 `src/backend/server/server.js`
- 需在 Render 環境變數設定 `.env` 中的所有變數，包含 `DATABASE_URL`
- `package.json` 有 `postinstall: prisma generate`，`npm install` 時會自動產生
  對應 Render 執行環境（Linux）的 Prisma Client，不需要額外的建置指令
- Firebase Admin SDK 金鑰 JSON 需另外上傳或設為環境變數；找不到憑證檔時
  只會停用社群登入並印警告，不會讓服務啟動失敗

> ⚠️ **Render 的 `DATABASE_URL` 不能跟本機用同一組**：Supabase 的 direct
> connection（`db.<專案ref>.supabase.co:5432`）只支援 IPv6，Render 的對外
> 網路沒有 IPv6，會連不上（`Can't reach database server`）。Render 要改用
> Connection Pooling（Supavisor）的 Session 模式：
> `postgresql://postgres.<專案ref>:密碼@aws-0-<region>.pooler.supabase.com:5432/postgres`
> ——host 換成 pooler 位址，帳號要加上 `.<專案ref>` 後綴（沒加會出現
> Supavisor 的 `no tenant identifier provided` 錯誤）。本機因為有 IPv6，
> 維持 direct connection 即可，兩邊本來就該是不同的連線字串。

### Keep-alive（`.github/workflows/keep-alive.yml`）

Render 免費方案閒置 15 分鐘會把服務停機，下次請求要重新喚醒（30-60 秒）；
Supabase 免費方案連續 7 天沒有資料庫活動會把整個專案暫停。排程每 10 分鐘
打一次 `/health`（該路由會真的查一次資料庫 `SELECT 1`），兩邊一起保持活著。

---

## 14. 已知問題與注意事項

### 社群登入 Token 問題
社群登入（Google/Facebook）儲存的是 Firebase ID Token（約 1 小時過期），而非 `/api/signin` 簽發的長效（7 天）JWT。
**影響**：圖片上傳等需要 Bearer Token 的功能，對社群登入用戶可能失效。
**臨時解法**：目前以 token 存在與否判斷登入狀態，不驗證 token 效期。

### Facebook 登入需手動設定
Facebook 登入需要在以下兩處手動設定才能使用：
1. **Firebase Console** → Authentication → Sign-in method → 啟用 Facebook，填入 App ID & Secret
2. **Meta Developer Console** → Facebook Login → Settings → 加入 OAuth 重新導向 URI：
   `https://taiwancultureproject.firebaseapp.com/__/auth/handler`

### demo 資料保鮮腳本尚未跟著換到 Postgres
`scripts/refresh-demo-dates.mjs`（把種子活動日期整體平移到未來，避免造訪者
看到全部過期）目前還是改本機的 `db.json`，遷移到 Postgres 後這支腳本對線上
demo 已經沒有效果，需要另外寫一版直接對 Postgres 跑（用 Prisma 讀出所有
活動、平移日期、`upsert` 回 `reservations`）。

### 圖片上傳依賴 Cloudinary
本地開發需有效的 Cloudinary API Key，上傳限制 500 KB。

### findDOMNode 警告
React Bootstrap 和 ReactQuill 在 React 18 中會產生 `findDOMNode` 棄用警告。
已在 `main.jsx` 過濾（僅開發環境），不影響功能。

### 積分系統設計
積分 = `signInPoints`（簽到累積）+ `countedOrderIds.length × 100`（訂單）
每日簽到 +10 點，連續 7 天 bonus +50 點。
`countedOrderIds` 追蹤已計算積分的訂單 id，防止重複計算。
