import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Prisma } from '@prisma/client';

// Firebase Admin
import firebaseAdmin from 'firebase-admin';

import prisma from '../lib/prisma.js';
import { createAuth, ADMIN_ROLES } from './auth.js';
import authRoutes from './routes/authRoutes.js';
import activityRoutes from './routes/activity.js';
import journalRoutes from './routes/journal.js';
import userRoutes from './routes/users.js';
import favoriteRoutes from './routes/favorites.js';
import profileRoutes from './routes/profiles.js';
import reservationRoutes from './routes/reservations.js';
import reviewRoutes from './routes/reviews.js';
import orderRoutes from './routes/orders.js';
import notificationRoutes from './routes/notifications.js';

// 讀取 .env 檔案
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* -------------------------------------------------------------------------- */
/* Firebase Admin SDK                                                          */
/* -------------------------------------------------------------------------- */
// 憑證檔缺少時只停用社群登入，不讓整個服務啟動失敗，
// 讓沒有憑證的協作者（或面試官）仍能 clone 下來跑起前後台。
let firebaseAuth = null;
const serviceAccountPath = path.resolve(
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './taiwancultureproject-firebase-adminsdk-fbsvc-c2a2519d47.json'
);

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(serviceAccount) });
    firebaseAuth = firebaseAdmin.auth();
    console.log('[firebase] Admin SDK 已啟用');
  } catch (error) {
    console.warn('[firebase] 憑證解析失敗，社群登入已停用：', error.message);
  }
} else {
  console.warn(`[firebase] 找不到憑證檔 ${serviceAccountPath}，社群登入已停用`);
}

/* -------------------------------------------------------------------------- */
/* Cloudinary                                                                  */
/* -------------------------------------------------------------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/* -------------------------------------------------------------------------- */
/* 檔案上傳（multer）                                                           */
/* -------------------------------------------------------------------------- */
const MAX_UPLOAD_BYTES = 500 * 1024; // 500 KB
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
  }),
  // 原本錯誤訊息宣稱有 500 KB 限制，但實際未設定，這裡補上真正的限制
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('僅允許上傳圖片檔'));
    }
    cb(null, true);
  },
});

/* -------------------------------------------------------------------------- */
/* Express                                                                     */
/* -------------------------------------------------------------------------- */
const app = express();

app.use(express.json());

// 開發模式下白名單寫死單一 port 很脆弱——Vite 只要那個 port 被佔用
// 就會自動換一個（5174、5181...），CORS 直接擋掉整個網站看起來像資料庫壞了。
// 開發環境沒有真正的安全疑慮，直接放行任何 localhost port。
const isLocalhost = (origin) => /^http:\/\/localhost:\d+$/.test(origin);
const corsOrigin =
  process.env.NODE_ENV === 'production'
    ? ['https://seanhong1215.github.io']
    : (origin, callback) => callback(null, !origin || isLocalhost(origin));
app.use(cors({ origin: corsOrigin, credentials: true }));

// 認證／授權中介層
const { attachIdentity, requireAuth, requireRole, guardCollections } = createAuth({
  prisma,
  firebaseAuth,
});

/* -------------------------------------------------------------------------- */
/* 社群登入：驗證 Firebase ID Token                                             */
/* -------------------------------------------------------------------------- */
app.post('/api/auth', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'No token provided' });
  if (!firebaseAuth) return res.status(503).json({ message: '社群登入未啟用（缺少 Firebase 憑證）' });

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const { uid, email } = decodedToken;

    // 帳號連結：verifyIdToken 已經證明使用者擁有這個 email。
    // 如果已經有同 email 的帳號但 uuid 對不上（例如先前用 Google 註冊、
    // 這次改用 Facebook），直接把 uuid 更新成當前 provider 的。
    // 沒有這段的話，createMember 會用 uuid 查不到 → 走註冊 → 撞到
    // 「此 email 已被註冊」400，社群登入直接失敗、進不去。
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.uuid !== uid) {
        await prisma.user.update({ where: { id: existing.id }, data: { uuid: uid } });
      }
    }

    res.status(200).json({
      message: 'Token verified',
      user: {
        uid,
        email: email || null,
        name: decodedToken.name || '',
        picture: decodedToken.picture || '',
      },
    });
  } catch (error) {
    res.status(401).json({ message: 'Token 無效', error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 授權守衛                                                                     */
/* -------------------------------------------------------------------------- */
// ⚠️ 順序很重要：這兩層必須在下面各資源路由之前掛上，
// 否則路由會先回應請求，guardCollections 永遠不會執行。
app.use('/api', attachIdentity);
app.use('/api', guardCollections);

// 後台專用路由（示範角色守衛）
app.get('/api/admin/summary', requireRole(...ADMIN_ROLES), async (req, res, next) => {
  try {
    const [users, activity, orders] = await Promise.all([
      prisma.user.count(),
      prisma.activity.count(),
      prisma.order.count(),
    ]);
    res.json({ users, activity, orders });
  } catch (err) {
    next(err);
  }
});

// /api/register、/api/signin（取代原本的 json-server-auth）
app.use('/api', authRoutes);

app.use('/api/activity', activityRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

/* -------------------------------------------------------------------------- */
/* 圖片上傳                                                                     */
/* -------------------------------------------------------------------------- */
app.post(
  '/upload-to-cloudinary',
  attachIdentity,
  requireAuth,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: '沒有收到檔案' });

    try {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'uploads' });
      res.json(result);
    } catch (error) {
      console.error('上傳到 Cloudinary 時出錯:', error);
      res.status(500).json({ error: error.message });
    } finally {
      // 無論成功失敗都清掉暫存檔，避免磁碟殘留
      fs.promises.unlink(req.file.path).catch(() => {});
    }
  }
);

app.get('/', (req, res) => res.send('Taiwan Culture Project API'));

/**
 * 給 GitHub Actions 的 keep-alive 排程打的端點（見 .github/workflows/keep-alive.yml）。
 *
 * 故意真的查一次資料庫，不是單純回 200：
 * - Render 免費方案閒置 15 分鐘會把整個服務停機，下一個請求要重新喚醒（30-60 秒）
 * - Supabase 免費方案的 Postgres 連續 7 天沒有資料庫活動會直接把專案暫停
 * 只 ping 這支路由本身擋得住第一個，擋不住第二個；查一次資料庫兩個一起解決。
 */
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', db: 'unreachable', message: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 錯誤處理                                                                     */
/* -------------------------------------------------------------------------- */
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: '圖片超過 500 KB 上限' });
  }
  // express.json() 解析失敗屬於用戶端送錯格式，應回 400 而非 500
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: '請求內容不是有效的 JSON' });
  }
  // Prisma 已知的錯誤代碼：查無資料 / 唯一鍵衝突，換成對應的 HTTP 狀態碼
  // 而不是一律回 500（見 https://pris.ly/d/prisma-error-reference）
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: '找不到資料' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: '資料重複（唯一鍵衝突）', fields: err.meta?.target });
    }
  }
  if (err) {
    console.error('未處理的錯誤：', err.message);
    return res.status(500).json({ error: err.message });
  }
  next();
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
