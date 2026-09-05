# 開發規範

## 分支策略

```
master ──────────●───────────────────●──────────  穩定版，隨時可展示 / 部署
                 ↑                   ↑
                 │ merge --no-ff     │
dev    ──●───●───●───●───●───●───●───●──────────  整合分支
         ↑       ↑           ↑
         │       │           │ merge --no-ff
         └───────┴───────────┴──  feature/xxx     功能分支
```

| 分支 | 用途 | 規則 |
|------|------|------|
| `master` | 對外展示與部署的穩定版 | 只從 `dev` 合併，不直接提交 |
| `dev` | 功能整合 | 只從 `feature/*` 合併，不直接提交 |
| `feature/*` | 單一功能或修正 | 從 `dev` 開出，完成後合併回 `dev` |
| `gh-pages` | GitHub Pages 部署產物 | 由 `npm run deploy` 自動更新，不手動修改 |

### 分支命名

以用途為前綴，後接 kebab-case 的簡短描述：

```
feature/booking-flow      新功能
fix/token-expiry          問題修正
refactor/api-modules      重構
docs/architecture         文件
chore/deps-upgrade        雜項維護
```

## 開發流程

```bash
# 1. 從最新的 dev 開分支
git checkout dev
git pull origin dev
git checkout -b feature/your-feature

# 2. 開發並提交（提交前請確認以下三項都通過）
npm run lint
npm run test:run
npm run build

# 3. 推上遠端並發 PR 進 dev
git push -u origin feature/your-feature
```

PR 通過 CI 與檢視後合併進 `dev`；累積到一個可展示的狀態時，再由 `dev` 合併進 `master`。

合併一律使用 `--no-ff`，讓每個功能在歷史上維持一個可辨識、可整段回退的區塊：

```bash
git checkout dev
git merge --no-ff feature/your-feature
git branch -d feature/your-feature
git push origin dev --delete feature/your-feature
```

## Commit 訊息

採用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <簡短描述，不加句號>

<選填：為什麼要改，而不是改了什麼。程式碼本身已說明改了什麼>
```

| type | 用於 |
|------|------|
| `feat` | 新功能 |
| `fix` | 問題修正 |
| `perf` | 效能改善 |
| `refactor` | 重構（不改變外部行為） |
| `test` | 測試 |
| `docs` | 文件 |
| `build` | 建置工具與相依套件 |
| `ci` | CI 設定 |
| `chore` | 其他雜項 |

範例：

```
fix(security): 付款流程不再儲存完整卡號、有效期限與 CVV

送出訂單時原本把整份表單當作 paymentData 一併寫入資料庫，
其中包含完整卡號與安全碼，違反 PCI-DSS。
```

## 提交前檢查

CI 會執行以下項目，建議在本機先跑過一次：

| 指令 | 檢查內容 |
|------|----------|
| `npm run lint` | ESLint，不得有 error |
| `npm run test:run` | 單元測試全數通過 |
| `npm run build` | 建置成功 |
| `npm run check-bundle` | 首屏 bundle gzip 後不超過 400 kB |

### 加入新的第三方套件時

大型套件請確認它不會被打進首屏。若該套件只有特定頁面用得到：

1. 確認使用它的頁面是以 `React.lazy` 載入（見 `src/frontend/router/index.jsx`）
2. 在 `vite.config.js` 的 `manualChunks` 中為它指定獨立 chunk
3. 執行 `npm run build && npm run check-bundle` 確認首屏體積沒有增加

## 不要提交的東西

- `.env`、Firebase 憑證 JSON（已列入 `.gitignore`）
- 任何真實的個資、卡號或金鑰
- `dist/`、`node_modules/`
