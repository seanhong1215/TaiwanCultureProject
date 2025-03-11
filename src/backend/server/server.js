import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import jsonServer from 'json-server';
import jsonServerAuth from 'json-server-auth';
import express from 'express';
import * as jwtDecode from 'jwt-decode';
import cors from 'cors';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 讀取 .env 檔案
dotenv.config();

// Cloudinary 設定
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// 設定 multer 儲存檔案的路徑
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath); // 儲存到 uploads 目錄
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 使用 Date.now() 作為檔名
  }
});

// 使用 import.meta.url 來獲取當前檔案的 URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);  // 獲取檔案所在的目錄

// 確保 uploads 目錄存在，如果不存在則創建
const uploadDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


// 創建 Express 應用
const app = express();
// 設定 Multer 存儲配置（記憶體存儲）
const upload = multer({ storage: storage });

app.use(cors()); // 允許跨域請求
app.use(express.json()); // 允許 json 解析

// 創建 JSON Server
const router = jsonServer.router("src/backend/json/db.json");
const middlewares = jsonServer.defaults();

// 使用 json-server 相關 middleware
app.use(middlewares);
app.use("/api", jsonServer.bodyParser);
app.use("/api", jsonServerAuth); 
app.use("/api", router);

// 取得上傳簽名
app.get('/get-signature', (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp },
    cloudinary.config().api_secret
  );

  res.json({
    signature,
    timestamp,
    apiKey: cloudinary.config().api_key
  });
});

// 上傳圖片到 Cloudinary
app.post('/upload-to-cloudinary', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or file size exceeds 500 KB' });
    }
    
    if (!req.file.path) {
      return res.status(400).json({ error: 'File path is undefined' });
    }

    const formData = new FormData();

          // 傳遞文件路徑
          formData.append('file', fs.createReadStream(req.file.path)); // 使用 fs.createReadStream 處理文件路徑
          formData.append('upload_preset', 'bennyhong');
          formData.append('folder', 'uploads');  // 設定 asset_folder 為 'uploads'
          
          // 上傳到 Cloudinary
          const cloudinaryResponse = await axios.post(
            'https://api.cloudinary.com/v1_1/dwjbzadev/image/upload', formData,
            {
              headers: {
                ...formData.getHeaders(),  // 確保 headers 包含 multipart/form-data
              },
            }
          );
    
          // 上傳成功後刪除臨時檔案
          fs.unlinkSync(req.file.path);
    
          res.json(cloudinaryResponse.data);

  } catch (error) {
      console.error("上傳到 Cloudinary 時出錯:", error);
      // 提供更詳細的錯誤信息
      if (error.code === 'ENOENT') {
        return res.status(500).json({ error: '文件路徑不存在' });
      }
      res.status(500).json({ error: error.message });
  }

});

// json-server 網站首頁
app.get('/', (req, res) => {
  res.send('Welcome to the JSON Server!');
});

// 設定權限
const rules = jsonServerAuth.rewriter({
  // Permission rule
  users: 644,
  userStats: 666,
  signIns: 644,
  // Other rules
  // '/posts/:category': '/posts?category=:category',
});
app.use(rules);

// 資料庫設定
app.db = router.db;

// 設定 JWT 權限保護
app.use((req, res, next) => {
  if (req.method === "POST") {
    const token = req.header("Authorization")
      ? req.header("Authorization").replace("Bearer ", "")
      : null;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const intSub = Number(decoded.sub);
        req.body.userId = intSub;
        return next();
      } catch (err) {
        console.error("Invalid Token:", err.message);
        return res.status(401).json({ error: "Unauthorized" });
      }
    }
  }
  next();
});

// 啟動伺服器
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});