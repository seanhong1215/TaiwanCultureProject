import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import jsonServer from 'json-server';
import jsonServerAuth from 'json-server-auth';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Firebase Admin
import firebaseAdmin from 'firebase-admin';

import { createAuth, ADMIN_ROLES } from './auth.js';

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

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://seanhong1215.github.io']
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

const router = jsonServer.router(path.join(process.cwd(), 'src/backend/json/db.json'));
app.use(jsonServer.defaults());
app.db = router.db;

// 認證／授權中介層
const { attachIdentity, requireAuth, requireRole, guardCollections } = createAuth({
  getDb: () => router.db,
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
    res.status(200).json({
      message: 'Token verified',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
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
// ⚠️ 順序很重要：這兩層必須在 json-server 的 router 之前。
// router 會直接回應請求，掛在它後面的中介層永遠不會執行。
app.use('/api', attachIdentity);
app.use('/api', guardCollections);

// 後台專用路由（示範角色守衛）。
// 同樣要在 router 之前註冊，否則 json-server 會先把 /api/admin/... 當成
// 一個不存在的資料表回應掉，這個 handler 永遠不會被呼叫。
app.get('/api/admin/summary', requireRole(...ADMIN_ROLES), (req, res) => {
  const db = router.db;
  res.json({
    users: db.get('users').size().value(),
    activity: db.get('activity').size().value(),
    orders: db.get('orders').size().value(),
  });
});

// json-server-auth 提供 /api/register、/api/signin
app.use('/api', jsonServerAuth);
app.use('/api', router);

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

app.get('/', (req, res) => res.send('Welcome to the JSON Server!'));

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
