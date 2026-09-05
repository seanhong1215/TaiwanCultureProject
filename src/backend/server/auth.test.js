import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { createAuth, ADMIN_ROLES } from './auth.js';

const SECRET = 'json-server-auth-123456';

const USERS = [
  { id: 1, email: 'admin@test.com', role: 'ADMIN' },
  { id: 2, email: 'manager@test.com', role: 'ACTIVITY_MANAGER' },
  { id: 3, email: 'member@test.com', role: 'Member' },
  { id: 4, email: 'social@test.com', role: 'Member', uuid: 'firebase-uid-4' },
];

/** 模擬 lowdb 的 chainable API：db.get('users').find({...}).value() */
const fakeDb = {
  get: (collection) => ({
    find: (query) => ({
      value: () => {
        if (collection !== 'users') return undefined;
        const [key, expected] = Object.entries(query)[0];
        return USERS.find((u) => u[key] === expected);
      },
    }),
  }),
};

/** 簽發一個與 json-server-auth 相同格式的 token */
const tokenFor = (userId, options = {}) =>
  jwt.sign({ email: 'x@test.com' }, SECRET, { subject: String(userId), expiresIn: '1h', ...options });

/** 依序執行中介層，回傳 { status, body, passed } */
const run = async (middlewares, req) => {
  const result = { status: null, body: null, passed: false };
  const res = {
    status(code) { result.status = code; return this; },
    json(payload) { result.body = payload; return this; },
  };

  for (const mw of middlewares) {
    let advanced = false;
    // eslint-disable-next-line no-await-in-loop
    await mw(req, res, () => { advanced = true; });
    if (!advanced) return result;
  }
  result.passed = true;
  return result;
};

describe('createAuth', () => {
  let auth;
  let firebaseAuth;

  beforeEach(() => {
    firebaseAuth = { verifyIdToken: vi.fn() };
    auth = createAuth({ getDb: () => fakeDb, firebaseAuth });
  });

  const request = (overrides) => ({ method: 'GET', url: '/', headers: {}, body: {}, ...overrides });
  const withToken = (token, overrides) =>
    request({ headers: { authorization: `Bearer ${token}` }, ...overrides });

  describe('resolveIdentity', () => {
    it('接受 json-server-auth 簽發的有效 token', async () => {
      const identity = await auth.resolveIdentity(tokenFor(1));
      expect(identity).toMatchObject({ userId: 1, role: 'ADMIN', provider: 'local' });
    });

    it('拒絕簽章不符的 token（不能只解碼不驗簽）', async () => {
      const forged = jwt.sign({ email: 'x' }, 'wrong-secret', { subject: '1' });
      firebaseAuth.verifyIdToken.mockRejectedValue(new Error('invalid'));
      expect(await auth.resolveIdentity(forged)).toBeNull();
    });

    it('拒絕已過期的 token', async () => {
      const expired = tokenFor(1, { expiresIn: '-1s' });
      firebaseAuth.verifyIdToken.mockRejectedValue(new Error('expired'));
      expect(await auth.resolveIdentity(expired)).toBeNull();
    });

    it('本地 JWT 驗證失敗時退回 Firebase ID Token', async () => {
      firebaseAuth.verifyIdToken.mockResolvedValue({ uid: 'firebase-uid-4', email: 'social@test.com' });
      const identity = await auth.resolveIdentity('firebase-token');
      expect(identity).toMatchObject({ userId: 4, role: 'Member', provider: 'firebase' });
    });

    it('沒有 token 回傳 null', async () => {
      expect(await auth.resolveIdentity(null)).toBeNull();
    });
  });

  describe('guardCollections', () => {
    const chain = () => [auth.attachIdentity, auth.guardCollections];

    it('未登入者可以讀取公開資料', async () => {
      const result = await run(chain(), request({ method: 'GET', url: '/activity' }));
      expect(result.passed).toBe(true);
    });

    it('未登入者不能寫入', async () => {
      firebaseAuth.verifyIdToken.mockRejectedValue(new Error('no token'));
      const result = await run(chain(), request({ method: 'POST', url: '/orders' }));
      expect(result.status).toBe(401);
    });

    it('註冊與登入不受守衛影響', async () => {
      for (const url of ['/register', '/signin']) {
        // eslint-disable-next-line no-await-in-loop
        const result = await run(chain(), request({ method: 'POST', url }));
        expect(result.passed).toBe(true);
      }
    });

    // 這是修正前最嚴重的漏洞：前端只用 localStorage 判斷角色，後端完全沒擋
    it.each(['POST', 'PATCH', 'DELETE'])('一般會員不能以 %s 修改活動資料', async (method) => {
      const result = await run(chain(), withToken(tokenFor(3), { method, url: '/activity/5' }));
      expect(result.status).toBe(403);
    });

    it.each(ADMIN_ROLES)('%s 可以修改活動資料', async (role) => {
      const user = USERS.find((u) => u.role === role);
      const result = await run(chain(), withToken(tokenFor(user.id), { method: 'PATCH', url: '/activity/5' }));
      expect(result.passed).toBe(true);
    });

    it('一般會員可以建立自己的訂單', async () => {
      const result = await run(chain(), withToken(tokenFor(3), { method: 'POST', url: '/orders' }));
      expect(result.passed).toBe(true);
    });

    it('建立資料時以 token 身分覆寫 userId，避免偽造他人資料', async () => {
      const req = withToken(tokenFor(3), { method: 'POST', url: '/orders', body: { userId: 1, total: 100 } });
      await run(chain(), req);
      expect(req.body.userId).toBe(3);
    });

    it('會員可以建立通知（下單後通知後台），但不能修改或刪除', async () => {
      const create = await run(chain(), withToken(tokenFor(3), { method: 'POST', url: '/notifications' }));
      expect(create.passed).toBe(true);

      const remove = await run(chain(), withToken(tokenFor(3), { method: 'DELETE', url: '/notifications/1' }));
      expect(remove.status).toBe(403);
    });

    it('管理者可以刪除通知', async () => {
      const result = await run(chain(), withToken(tokenFor(1), { method: 'DELETE', url: '/notifications/1' }));
      expect(result.passed).toBe(true);
    });

    it('會員只能修改自己的帳號', async () => {
      const own = await run(chain(), withToken(tokenFor(3), { method: 'PATCH', url: '/users/3' }));
      expect(own.passed).toBe(true);

      const other = await run(chain(), withToken(tokenFor(3), { method: 'PATCH', url: '/users/1' }));
      expect(other.status).toBe(403);
    });

    it('管理者可以修改其他人的帳號', async () => {
      const result = await run(chain(), withToken(tokenFor(1), { method: 'PATCH', url: '/users/3' }));
      expect(result.passed).toBe(true);
    });
  });

  describe('requireRole', () => {
    it('未登入回 401', async () => {
      firebaseAuth.verifyIdToken.mockRejectedValue(new Error('no token'));
      const result = await run([auth.attachIdentity, auth.requireRole(...ADMIN_ROLES)], request({}));
      expect(result.status).toBe(401);
    });

    it('角色不符回 403', async () => {
      const result = await run([auth.attachIdentity, auth.requireRole(...ADMIN_ROLES)], withToken(tokenFor(3)));
      expect(result.status).toBe(403);
    });

    it('角色相符則放行', async () => {
      const result = await run([auth.attachIdentity, auth.requireRole(...ADMIN_ROLES)], withToken(tokenFor(1)));
      expect(result.passed).toBe(true);
    });
  });
});
