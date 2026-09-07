import { Router } from 'express';
import prisma from '../../lib/prisma.js';
import { pick, toNumberOrNull } from '../../lib/pick.js';

const router = Router();

const WRITABLE_FIELDS = [
  'city',
  'images',
  'rating',
  'startDate',
  'endDate',
  'price',
  'eventType',
  'status',
  'eventAddress',
  'content',
  'activityDetails',
];

const toActivityData = (body) => {
  const data = pick(body, WRITABLE_FIELDS);
  if ('price' in data) data.price = toNumberOrNull(data.price);
  if ('rating' in data) data.rating = toNumberOrNull(data.rating) ?? 0;
  return data;
};

// GET /api/activity          -> 全部
// GET /api/activity?_page=&_limit= -> 分頁
router.get('/', async (req, res, next) => {
  try {
    const { _page, _limit } = req.query;
    if (_page && _limit) {
      const page = Number(_page);
      const limit = Number(_limit);
      const [rows, total] = await Promise.all([
        prisma.activity.findMany({ orderBy: { id: 'asc' }, skip: (page - 1) * limit, take: limit }),
        prisma.activity.count(),
      ]);
      res.set('X-Total-Count', String(total));
      return res.json(rows);
    }
    const rows = await prisma.activity.findMany({ orderBy: { id: 'asc' } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(404).json({});
    const row = await prisma.activity.findUnique({ where: { id } });
    if (!row) return res.status(404).json({});
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const row = await prisma.activity.create({ data: toActivityData(req.body) });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await prisma.activity.update({ where: { id }, data: toActivityData(req.body) });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.activity.delete({ where: { id } });
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
});

export default router;
