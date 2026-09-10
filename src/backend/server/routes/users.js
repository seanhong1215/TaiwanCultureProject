import { Router } from 'express';
import prisma from '../../lib/prisma.js';
import { pick } from '../../lib/pick.js';
import { ADMIN_ROLES } from '../auth.js';

const router = Router();

// 密碼雜湊絕不回傳給前端——原本 json-server-auth 每筆回應都會夾帶
// bcrypt hash，這裡用 select 白名單順手補上這個安全性問題。
const PUBLIC_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatar: true,
  uuid: true,
  signInHistory: true,
  currentStreak: true,
  rewards: true,
  tickets: true,
  createdAt: true,
};

const WRITABLE_FIELDS = ['name', 'role', 'avatar', 'uuid', 'signInHistory', 'currentStreak', 'rewards', 'tickets'];

router.get('/', async (req, res, next) => {
  try {
    const { _page, _limit, uuid, email } = req.query;
    const where = {};
    if (uuid !== undefined) where.uuid = String(uuid);
    if (email !== undefined) where.email = String(email);

    if (_page && _limit) {
      const page = Number(_page);
      const limit = Number(_limit);
      const [rows, total] = await Promise.all([
        prisma.user.findMany({ where, select: PUBLIC_FIELDS, orderBy: { id: 'asc' }, skip: (page - 1) * limit, take: limit }),
        prisma.user.count({ where }),
      ]);
      res.set('X-Total-Count', String(total));
      return res.json(rows);
    }

    const rows = await prisma.user.findMany({ where, select: PUBLIC_FIELDS, orderBy: { id: 'asc' } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(404).json({});
    const row = await prisma.user.findUnique({ where: { id }, select: PUBLIC_FIELDS });
    if (!row) return res.status(404).json({});
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = pick(req.body, WRITABLE_FIELDS);

    // guardCollections 只檢查「本人或管理者」，沒管「改了什麼欄位」——
    // 沒有這一段，一般會員會可以自己 PATCH role 把自己升成 ADMIN。
    // 只有本來就是管理者的請求，才能把 role 改成管理者角色。
    if (ADMIN_ROLES.includes(data.role) && !ADMIN_ROLES.includes(req.auth?.role)) {
      delete data.role;
    }

    const row = await prisma.user.update({ where: { id }, data, select: PUBLIC_FIELDS });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

export default router;
