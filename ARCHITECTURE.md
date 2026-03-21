# 台灣文化體驗專案 — 架構文件

> 適用對象：協作此專案的工程師
> 最後更新：2026-03-21

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
| 模擬資料庫 | json-server + json-server-auth | 0.17 / 2.1 |
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
│   │       ├── api.js        # 所有 API 呼叫函式
│   │       └── constants.js  # 角色常數、localStorage key 常數
│   └── backend/
│       ├── server/
│       │   └── server.js     # Express 伺服器主檔
│       └── json/
│           └── db.json       # json-server 資料庫
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
# 安裝依賴
npm install

# 開發模式（前端 Vite dev server，port 5173）
npm run dev

# 啟動後端伺服器（port 3001）
npm run start

# 建置前端
npm run build

# 部署至 GitHub Pages
npm run deploy
```

> 開發時需同時啟動前端（`npm run dev`）與後端（`npm run start`）兩個 terminal。

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
| `userId` | json-server 的用戶 id |
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

後端使用 **Express.js** 包裝 **json-server**，提供額外的自定義端點：

### 自定義端點

| Method | 路徑 | 說明 | 需要驗證 |
|--------|------|------|----------|
| POST | `/api/auth` | 驗證 Firebase ID Token，回傳用戶資料 | 否 |
| GET | `/get-signature` | 取得 Cloudinary 上傳簽名 | 是（Bearer Token）|
| POST | `/upload-to-cloudinary` | 上傳圖片到 Cloudinary | 是（Bearer Token）|

### json-server 端點

由 `db.json` 自動產生 RESTful API，主要資源：

| 資源 | 路徑 | 說明 |
|------|------|------|
| 用戶 | `/api/users` | 用戶資料（權限 644：owner讀寫，他人唯讀）|
| 活動 | `/api/activity` | 活動資料 |
| 部落格 | `/api/journal` | 文章資料 |
| 訂單 | `/api/orders` | 訂單資料 |
| 收藏 | `/api/favorites` | 收藏清單 |
| 評價 | `/api/reviews` | 活動評價 |
| 預約 | `/api/reservations` | 預約記錄 |
| 個人檔案 | `/api/profiles` | 用戶個人資料 |
| 通知 | `/api/notifications` | 系統通知 |

### json-server-auth 權限格式

```
users: 644
       ^^^
       |||_ 公開：可讀（4）
       ||__ 已登入：可讀（4）
       |___ 擁有者：可讀寫（6）
```

> ⚠️ 公開使用者無法直接 `POST /api/users`，建立新用戶需透過 `/api/register`。

---

## 8. 資料庫結構

`db.json` 主要資料結構（json-server 格式）：

```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "password": "$2a$10$...",  // bcrypt hash
      "name": "用戶名稱",
      "role": "Member",           // ADMIN | ACTIVITY_MANAGER | Member
      "avatar": "/img/avatar/image-6.png",
      "uuid": "firebase-uid",     // 社群登入用戶才有
      "rewards": {
        "points": 0,
        "signInPoints": 0,
        "countedOrderIds": []     // 已計算積分的訂單 id 列表
      }
    }
  ],
  "activity": [...],
  "journal": [...],
  "orders": [
    {
      "id": "ORD202403210001",
      "userId": 1,
      "activityName": "...",
      "paymentData": { "contactName": "..." },
      "reservedStatus": "reserved | in_progress | finished | cancel",
      "paymentStatus": "PENDING | PAID",
      "totalAmount": 500
    }
  ]
}
```

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
  → POST /api/signin（json-server-auth）
  → 回傳 { accessToken, user }
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

> ⚠️ 社群登入儲存的是 **Firebase ID Token**，而非 json-server JWT。
> 這表示 json-server-auth 的需要 JWT 的保護路由對社群登入用戶無效，需另行處理。

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

所有 API 呼叫集中在 `src/frontend/utils/api.js`。

### 重要函式

```js
// 社群登入用戶建立（先查找再建立）
createMember(user)
// 流程：GET /api/users?uuid → POST /api/register → PATCH /api/users/:id

// 圖片上傳（需登入 token）
uploadImageToCloudinary(file)
// 流程：GET /get-signature → POST /upload-to-cloudinary

// 訂單建立（自動產生訂單編號 ORDyyyymmddXXXX）
createOrder(orderData)
```

### Axios 基礎設定

```js
axios.defaults.baseURL = process.env.NODE_ENV === 'production'
  ? 'https://taiwan-culture-project.onrender.com'
  : 'http://localhost:3001'
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
- 需在 Render 環境變數設定 `.env` 中的所有變數
- Firebase Admin SDK 金鑰 JSON 需另外上傳或設為環境變數

---

## 14. 已知問題與注意事項

### 社群登入 Token 問題
社群登入（Google/Facebook）儲存的是 Firebase ID Token（約 1 小時過期），而非 json-server 的長效 JWT。
**影響**：圖片上傳等需要 Bearer Token 的功能，對社群登入用戶可能失效。
**臨時解法**：目前以 token 存在與否判斷登入狀態，不驗證 token 效期。

### Facebook 登入需手動設定
Facebook 登入需要在以下兩處手動設定才能使用：
1. **Firebase Console** → Authentication → Sign-in method → 啟用 Facebook，填入 App ID & Secret
2. **Meta Developer Console** → Facebook Login → Settings → 加入 OAuth 重新導向 URI：
   `https://taiwancultureproject.firebaseapp.com/__/auth/handler`

### json-server 限制
- 沒有真實的資料庫事務（transaction）
- 生產環境不適合大量資料（建議遷移至 MongoDB / PostgreSQL）
- 圖片上傳依賴 Cloudinary，本地開發需有效的 API Key

### findDOMNode 警告
React Bootstrap 和 ReactQuill 在 React 18 中會產生 `findDOMNode` 棄用警告。
已在 `main.jsx` 過濾（僅開發環境），不影響功能。

### 積分系統設計
積分 = `signInPoints`（簽到累積）+ `countedOrderIds.length × 100`（訂單）
每日簽到 +10 點，連續 7 天 bonus +50 點。
`countedOrderIds` 追蹤已計算積分的訂單 id，防止重複計算。
