import { Router } from 'express';
import prisma from '../../lib/prisma.js';
import { pick } from '../../lib/pick.js';

const router = Router();

const WRITABLE_FIELDS = ['message', 'timestamp'];

router.get('/', async (req, res, next) => {
  try {
    const rows = await prisma.notification.findMany({ orderBy: { id: 'asc' } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = pick(req.body, WRITABLE_FIELDS);
    const row = await prisma.notification.create({ data });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

export default router;
