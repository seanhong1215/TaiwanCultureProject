import { Router } from 'express';
import prisma from '../../lib/prisma.js';
import { pick, toNumberOrNull } from '../../lib/pick.js';

const router = Router();

const WRITABLE_FIELDS = [
  'id',
  'userId',
  'activityId',
  'createdAt',
  'activityName',
  'activityLocation',
  'activityPeriod',
  'adultCount',
  'childCount',
  'adultPrice',
  'childPrice',
  'timeSlot',
  'totalAmount',
  'paymentStatus',
  'reservedStatus',
  'actImage',
  'paymentData',
  'contactName',
  'reviewed',
];

const USER_PUBLIC_FIELDS = { id: true, email: true, name: true, role: true, avatar: true };

// _sort 來自 query string，不能直接塞進 Prisma orderBy——白名單擋掉不存在的欄位名稱
const SORTABLE_FIELDS = new Set(['id', 'createdAt', 'totalAmount']);

// 前端建立訂單時用的是 `last_bookable_date`（底線命名，對齊 db.json 的舊欄位），
// Prisma 這邊 mapping 到 lastBookableDate，寫入前先轉個名。
const toOrderData = (body) => {
  const data = pick(body, WRITABLE_FIELDS);
  if ('userId' in data) data.userId = toNumberOrNull(data.userId);
  if ('activityId' in data) data.activityId = toNumberOrNull(data.activityId);
  if (body?.last_bookable_date !== undefined) data.lastBookableDate = body.last_bookable_date;
  if ('createdAt' in data && typeof data.createdAt === 'string') {
    const parsed = new Date(data.createdAt.includes('T') ? data.createdAt : data.createdAt.replace(' ', 'T'));
    data.createdAt = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  return data;
};

// 對外回傳的形狀補回 `last_bookable_date` / `orderId`，維持跟舊 API 一致
const toResponseShape = (order) => {
  if (!order) return order;
  const { lastBookableDate, ...rest } = order;
  return { ...rest, last_bookable_date: lastBookableDate, orderId: order.id };
};

router.get('/', async (req, res, next) => {
  try {
    const { userId, _page, _limit, _sort, _order } = req.query;
    const where = userId !== undefined ? { userId: Number(userId) } : {};

    // 產生訂單編號時用：?_sort=id&_order=desc&_limit=1（沒有 _page)
    if (_sort && SORTABLE_FIELDS.has(_sort) && !_page) {
      const limit = _limit ? Number(_limit) : undefined;
      const rows = await prisma.order.findMany({
        where,
        orderBy: { [_sort]: _order === 'desc' ? 'desc' : 'asc' },
        take: limit,
      });
      return res.json(rows.map(toResponseShape));
    }

    if (_page && _limit) {
      const page = Number(_page);
      const limit = Number(_limit);
      const [rows, total] = await Promise.all([
        prisma.order.findMany({ where, orderBy: { createdAt: 'asc' }, skip: (page - 1) * limit, take: limit }),
        prisma.order.count({ where }),
      ]);
      res.set('X-Total-Count', String(total));
      return res.json(rows.map(toResponseShape));
    }

    const rows = await prisma.order.findMany({ where, orderBy: { createdAt: 'asc' } });
    res.json(rows.map(toResponseShape));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { _expand } = req.query;
    const include = _expand === 'user' ? { user: { select: USER_PUBLIC_FIELDS } } : undefined;
    const row = await prisma.order.findUnique({ where: { id: req.params.id }, include });
    if (!row) return res.status(404).json({});
    res.json(toResponseShape(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const row = await prisma.order.create({ data: toOrderData(req.body) });
    res.status(201).json(toResponseShape(row));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const row = await prisma.order.update({ where: { id: req.params.id }, data: toOrderData(req.body) });
    res.json(toResponseShape(row));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
});

export default router;
