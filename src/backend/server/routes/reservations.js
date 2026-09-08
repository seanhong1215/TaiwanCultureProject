import { Router } from 'express';
import prisma from '../../lib/prisma.js';

const router = Router();

/**
 * 這個 collection 在 db.json 裡的形狀是「id + 動態日期 key」平鋪在同一層，
 * 例如 { id: 1, "2026-12-20": { price, remaining } }。Prisma 那邊用
 * activityId + dates(Json) 存，這裡在 API 邊界把它攤平／收合回原本形狀，
 * 前端（useEnsureReservationData／useReservationDataQuery）才不用改。
 */
const flatten = (reservation) => ({ id: reservation.activityId, ...reservation.dates });

// GET /api/reservations/:id —— :id 其實是 activityId（沿用舊資料的慣例，
// reservation.id 原本就跟 activity.id 一一對應）
router.get('/:id', async (req, res, next) => {
  try {
    const activityId = Number(req.params.id);
    if (Number.isNaN(activityId)) return res.status(404).json({});
    const row = await prisma.reservation.findUnique({ where: { activityId } });
    if (!row) return res.status(404).json({});
    res.json(flatten(row));
  } catch (err) {
    next(err);
  }
});

// POST /api/reservations —— body 同樣是 { id: activityId, ...dates }
router.post('/', async (req, res, next) => {
  try {
    const { id, ...dates } = req.body || {};
    const activityId = Number(id);
    if (Number.isNaN(activityId)) return res.status(400).json({ message: '缺少有效的活動 id' });

    const row = await prisma.reservation.upsert({
      where: { activityId },
      create: { activityId, dates },
      update: { dates },
    });
    res.status(201).json(flatten(row));
  } catch (err) {
    next(err);
  }
});

export default router;
