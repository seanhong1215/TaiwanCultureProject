import { Router } from 'express';
import prisma from '../../lib/prisma.js';
import { pick, toNumberOrNull } from '../../lib/pick.js';

const router = Router();

const WRITABLE_FIELDS = ['lastName', 'firstName', 'nickName', 'gender', 'birthday', 'country', 'countryCode', 'phoneNumber', 'userId'];

// 密碼雜湊不隨 _expand=user 外洩
const USER_PUBLIC_FIELDS = { id: true, email: true, name: true, role: true, avatar: true };

router.get('/', async (req, res, next) => {
  try {
    const { userId, _expand } = req.query;
    const where = userId !== undefined ? { userId: Number(userId) } : {};
    const include = _expand === 'user' ? { user: { select: USER_PUBLIC_FIELDS } } : undefined;
    const rows = await prisma.profile.findMany({ where, include, orderBy: { id: 'asc' } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = pick(req.body, WRITABLE_FIELDS);
    data.userId = toNumberOrNull(data.userId);
    const row = await prisma.profile.create({ data });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = pick(req.body, WRITABLE_FIELDS);
    if ('userId' in data) data.userId = toNumberOrNull(data.userId);
    const row = await prisma.profile.update({ where: { id }, data });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

export default router;
