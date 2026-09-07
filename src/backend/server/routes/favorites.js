import { Router } from 'express';
import prisma from '../../lib/prisma.js';
import { pick, toNumberOrNull } from '../../lib/pick.js';

const router = Router();

const WRITABLE_FIELDS = ['userId', 'activityId', 'isFavorited'];

router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query;
    const where = userId !== undefined ? { userId: Number(userId) } : {};
    const rows = await prisma.favorite.findMany({ where, orderBy: { id: 'asc' } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = pick(req.body, WRITABLE_FIELDS);
    data.userId = toNumberOrNull(data.userId);
    data.activityId = toNumberOrNull(data.activityId);
    const row = await prisma.favorite.create({ data });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.favorite.delete({ where: { id } });
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
});

export default router;
