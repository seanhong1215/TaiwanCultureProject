import { Router } from 'express';
import prisma from '../../lib/prisma.js';
import { pick, toNumberOrNull } from '../../lib/pick.js';

const router = Router();

const WRITABLE_FIELDS = ['avatar', 'name', 'rating', 'activityTitle', 'imageFiles', 'reviewContent', 'activityId'];

router.get('/', async (req, res, next) => {
  try {
    const { activityId, _page, _limit } = req.query;
    const where = activityId !== undefined ? { activityId: Number(activityId) } : {};

    if (_page && _limit) {
      const page = Number(_page);
      const limit = Number(_limit);
      const [rows, total] = await Promise.all([
        prisma.review.findMany({ where, orderBy: { id: 'asc' }, skip: (page - 1) * limit, take: limit }),
        prisma.review.count({ where }),
      ]);
      res.set('X-Total-Count', String(total));
      return res.json(rows);
    }

    const rows = await prisma.review.findMany({ where, orderBy: { id: 'asc' } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = pick(req.body, WRITABLE_FIELDS);
    if ('activityId' in data) data.activityId = toNumberOrNull(data.activityId);
    if ('rating' in data) data.rating = toNumberOrNull(data.rating);
    const row = await prisma.review.create({ data });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = pick(req.body, WRITABLE_FIELDS);
    if ('activityId' in data) data.activityId = toNumberOrNull(data.activityId);
    if ('rating' in data) data.rating = toNumberOrNull(data.rating);
    const row = await prisma.review.update({ where: { id }, data });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.review.delete({ where: { id } });
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
});

export default router;
