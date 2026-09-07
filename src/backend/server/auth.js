/**
 * 認證與授權中介層
 *
 * 設計說明：
 * 前端的路由守衛（RequireAuth / RequireAdmin）只是體驗優化，任何人都能改
 * localStorage 繞過。真正的權限判斷一律在這裡做，且必須掛在資源路由
 * 之前，否則路由會先回應、中介層永遠不會執行。
 *
 * 本專案同時存在兩種 token：
 *   1. routes/authRoutes.js 於 /api/signin 簽發的 JWT（一般帳密登入）
 *   2. Firebase ID Token（Google / Facebook 社群登入）
 * resolveIdentity() 會依序嘗試驗證，統一輸出成 req.auth。
 */

import jwt from 'jsonwebtoken';

// 簽發／驗證共用同一把金鑰，見 routes/authRoutes.js。
// 沿用原本 json-server-auth 的預設金鑰字串作為 fallback，讓既有（搬遷前簽發的）
// token 在沒設定 JWT_SECRET_KEY 的環境下仍然有效；正式環境務必透過環境變數覆蓋。
const JSON_SERVER_JWT_SECRET = process.env.JWT_SECRET_KEY || 'json-server-auth-123456';

/** 具備後台管理權限的角色 */
export const ADMIN_ROLES = ['ADMIN', 'ACTIVITY_MANAGER'];

/** 僅限管理者寫入的資料表（一般會員只能讀） */
const ADMIN_WRITE_COLLECTIONS = ['activity', 'journal'];

/**
 * 一般會員可以「新增」但不能「修改／刪除」的資料表。
 * 例如下單後系統要送一則通知給後台，建立要開放，但只有管理者能改動或清除。
 */
const CREATE_ONLY_COLLECTIONS = ['notifications'];

/** 會改變資料的 HTTP 方法 */
const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/** 從 Authorization header 取出 Bearer token */
export const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null;
};

/** 取出 request 路徑的第一段（資料表名稱），例如 /activity/3 -> activity */
const collectionOf = (url) => (url || '').split('?')[0].split('/').filter(Boolean)[0];

/**
 * 建立身分解析器。
 * @param {object} deps
 * @param {import('@prisma/client').PrismaClient} deps.prisma
 * @param {object|null} deps.firebaseAuth  firebaseAdmin.auth()，未設定憑證時為 null
 */
export const createAuth = ({ prisma, firebaseAuth }) => {
  /** 驗證 token 並回傳 { userId, email, role, provider }，失敗回傳 null */
  const resolveIdentity = async (token) => {
    if (!token) return null;

    // 1) 本地簽發的 JWT（見 routes/authRoutes.js，會驗證簽章與有效期限）
    try {
      const payload = jwt.verify(token, JSON_SERVER_JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
      if (user) {
        return { userId: user.id, email: user.email, role: user.role || 'Member', provider: 'local' };
      }
    } catch {
      // 不是本地 JWT，往下試 Firebase
    }

    // 2) Firebase ID Token（社群登入）
    if (firebaseAuth) {
      try {
        const decoded = await firebaseAuth.verifyIdToken(token);
        const user = await prisma.user.findUnique({ where: { uuid: decoded.uid } });
        return {
          userId: user ? user.id : null,
          email: decoded.email || (user ? user.email : null),
          role: user ? user.role || 'Member' : 'Member',
          provider: 'firebase',
          uid: decoded.uid,
        };
      } catch {
        // token 無效或已過期
      }
    }

    return null;
  };

  /**
   * 解析身分並掛到 req.auth。
   * 沒有 token 或 token 無效時不擋下請求，交由後續守衛決定，
   * 讓活動列表、部落格等公開讀取維持免登入。
   */
  const attachIdentity = async (req, res, next) => {
    req.auth = await resolveIdentity(getBearerToken(req));
    next();
  };

  /** 必須登入 */
  const requireAuth = (req, res, next) => {
    if (!req.auth) return res.status(401).json({ message: '請先登入' });
    next();
  };

  /** 必須具備指定角色 */
  const requireRole = (...roles) => (req, res, next) => {
    if (!req.auth) return res.status(401).json({ message: '請先登入' });
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ message: '權限不足' });
    }
    next();
  };

  /**
   * 資料表層級的寫入守衛，掛在 json-server router 之前。
   * - activity / journal / notifications：僅 ADMIN、ACTIVITY_MANAGER 可寫入
   * - users：僅本人或管理者可修改
   * - 其他資料表（orders、reviews、favorites…）：登入即可寫入
   */
  const guardCollections = (req, res, next) => {
    if (!WRITE_METHODS.includes(req.method)) return next();

    const collection = collectionOf(req.url);
    if (!collection || collection === 'register' || collection === 'signin' || collection === 'auth') {
      return next(); // 註冊、登入、社群驗證維持公開
    }

    if (!req.auth) return res.status(401).json({ message: '請先登入' });

    const isAdmin = ADMIN_ROLES.includes(req.auth.role);

    if (ADMIN_WRITE_COLLECTIONS.includes(collection) && !isAdmin) {
      return res.status(403).json({ message: '權限不足，僅管理者可執行此操作' });
    }

    if (CREATE_ONLY_COLLECTIONS.includes(collection) && req.method !== 'POST' && !isAdmin) {
      return res.status(403).json({ message: '權限不足，僅管理者可修改此資料' });
    }

    if (collection === 'users') {
      const targetId = (req.url || '').split('?')[0].split('/').filter(Boolean)[1];
      const isSelf = targetId !== undefined && String(req.auth.userId) === String(targetId);
      if (!isSelf && !isAdmin) {
        return res.status(403).json({ message: '只能修改自己的帳號資料' });
      }
    }

    // 建立資料時以 token 中的身分為準，避免前端偽造他人的 userId
    if (req.method === 'POST' && req.body && req.auth.userId != null && collection !== 'users') {
      req.body.userId = req.auth.userId;
    }

    next();
  };

  return { resolveIdentity, attachIdentity, requireAuth, requireRole, guardCollections };
};
