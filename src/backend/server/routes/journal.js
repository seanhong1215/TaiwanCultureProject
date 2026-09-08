import { Router } from 'express';
import prisma from '../../lib/prisma.js';
import { pick } from '../../lib/pick.js';

const router = Router();

const WRITABLE_FIELDS = ['title', 'date', 'content', 'images', 'status'];

router.get('/', async (req, res, next) => {
  try {
    const { _page, _limit } = req.query;
    if (_page && _limit) {
      const page = Number(_page);
      const limit = Number(_limit);
      const [rows, total] = await Promise.all([
        prisma.journal.findMany({ orderBy: { id: 'asc' }, skip: (page - 1) * limit, take: limit }),
        prisma.journal.count(),
      ]);
      res.set('X-Total-Count', String(total));
      return res.json(rows);
    }
    const rows = await prisma.journal.findMany({ orderBy: { id: 'asc' } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(404).json({});
    const row = await prisma.journal.findUnique({ where: { id } });
    if (!row) return res.status(404).json({});
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const row = await prisma.journal.create({ data: pick(req.body, WRITABLE_FIELDS) });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

// 前端 updatedJournal 用 PUT（json-server 的 PUT 是整筆覆蓋，
// 但前端每次都會帶齊 title/date/content/images/status，效果等同全量更新）
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await prisma.journal.update({ where: { id }, data: pick(req.body, WRITABLE_FIELDS) });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.journal.delete({ where: { id } });
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
});

export default router;
