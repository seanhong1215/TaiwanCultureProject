#!/usr/bin/env node
/**
 * 把 demo 資料的日期整體平移到「現在」。
 *
 * 種子資料的活動日期是固定的，隨著時間過去全部變成已過期 ——
 * 造訪 demo 的人會發現每個活動都無法選日期，等於看不到訂票流程。
 * 這支腳本把所有排程日期往後平移同一個位移量（保留活動之間的相對間隔），
 * 讓最早的活動落在今天之後幾天。
 *
 * 遷移到 Postgres 之後這支腳本改成直接對資料庫跑（原本是改 db.json，
 * 現在 db.json 只是搬遷腳本的種子來源，改它對線上 demo 已經沒有效果）。
 *
 * 只平移這幾個排程欄位，createdAt / timestamp 之類的歷史紀錄不動
 * （往前推反而會出現「未來才建立的訂單」）：
 *   - activity.startDate / activity.endDate
 *   - order.lastBookableDate（對應 db 的 last_bookable_date）
 *   - order.activityPeriod.{startDate,endDate}（Json 裡的巢狀欄位）
 * reservations 不用「平移」——直接依每個活動平移後的日期區間整批重建，
 * 這樣可預約日期一定跟活動日期對得起來（種子資料原本兩者對不上，
 * 活動詳情頁的日曆會整頁都是 disabled）。
 *
 * 用法：node scripts/refresh-demo-dates.mjs [--days-ahead 7] [--dry-run]
 */

import prisma from '../src/backend/lib/prisma.js';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const daysAheadIndex = args.indexOf('--days-ahead');
const daysAhead = daysAheadIndex === -1 ? 7 : Number(args[daysAheadIndex + 1]);

const shift = (value, offsetDays) => {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

async function main() {
  const activities = await prisma.activity.findMany({
    select: { id: true, startDate: true, endDate: true, price: true },
  });

  // 位移量以「活動」的最早日期為錨點，避免被訂單裡更早的歷史日期拉偏。
  const anchorDates = [];
  for (const a of activities) {
    if (a.startDate && DATE_ONLY.test(a.startDate)) anchorDates.push(a.startDate);
    if (a.endDate && DATE_ONLY.test(a.endDate)) anchorDates.push(a.endDate);
  }

  if (anchorDates.length === 0) {
    console.log('找不到可平移的活動日期');
    return;
  }

  const earliest = Math.min(...anchorDates.map((d) => new Date(`${d}T00:00:00`).getTime()));
  const target = new Date();
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + daysAhead);

  const offsetDays = Math.round((target.getTime() - earliest) / DAY_MS);

  if (offsetDays <= 0) {
    console.log(`最早的活動日期已經在今天 +${daysAhead} 天之後，不需要平移`);
    return;
  }

  console.log(dryRun ? `🔍 Dry run：平移 ${offsetDays} 天（不會寫入資料庫）\n` : `平移 ${offsetDays} 天\n`);

  // --- activity.startDate / endDate ------------------------------------
  let activityFieldCount = 0;
  const shiftedActivities = activities.map((a) => {
    const data = {};
    if (a.startDate && DATE_ONLY.test(a.startDate)) data.startDate = shift(a.startDate, offsetDays);
    if (a.endDate && DATE_ONLY.test(a.endDate)) data.endDate = shift(a.endDate, offsetDays);
    activityFieldCount += Object.keys(data).length;
    return { id: a.id, price: a.price, ...data };
  });

  console.log(`activity：${activityFieldCount} 個日期欄位`);
  shiftedActivities.slice(0, 3).forEach((a) => {
    console.log(`   #${a.id} startDate -> ${a.startDate ?? '(不變)'}, endDate -> ${a.endDate ?? '(不變)'}`);
  });

  if (!dryRun) {
    for (const a of shiftedActivities) {
      const { id, price: _price, ...data } = a;
      if (Object.keys(data).length > 0) {
        await prisma.activity.update({ where: { id }, data });
      }
    }
  }

  // --- order.lastBookableDate / activityPeriod --------------------------
  const orders = await prisma.order.findMany({
    select: { id: true, lastBookableDate: true, activityPeriod: true },
  });

  let orderFieldCount = 0;
  const shiftedOrders = [];
  for (const o of orders) {
    const data = {};
    if (o.lastBookableDate && DATE_ONLY.test(o.lastBookableDate)) {
      data.lastBookableDate = shift(o.lastBookableDate, offsetDays);
    }
    if (o.activityPeriod && typeof o.activityPeriod === 'object') {
      const period = { ...o.activityPeriod };
      let periodChanged = false;
      if (typeof period.startDate === 'string' && DATE_ONLY.test(period.startDate)) {
        period.startDate = shift(period.startDate, offsetDays);
        periodChanged = true;
      }
      if (typeof period.endDate === 'string' && DATE_ONLY.test(period.endDate)) {
        period.endDate = shift(period.endDate, offsetDays);
        periodChanged = true;
      }
      if (periodChanged) data.activityPeriod = period;
    }
    if (Object.keys(data).length > 0) {
      orderFieldCount += Object.keys(data).length;
      shiftedOrders.push({ id: o.id, data });
    }
  }

  console.log(`orders：${orderFieldCount} 個日期欄位（${shiftedOrders.length} 筆訂單）`);

  if (!dryRun) {
    for (const o of shiftedOrders) {
      await prisma.order.update({ where: { id: o.id }, data: o.data });
    }
  }

  // --- 重建 reservations --------------------------------------------------
  // 種子資料裡 reservations 的日期跟活動的 startDate/endDate 常常對不上，
  // 因此直接依每個活動平移後的日期區間重新產生，兩者保證一致。
  const toKey = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  let reservationCount = 0;
  for (const a of shiftedActivities) {
    if (!a.startDate || !a.endDate) continue;

    const dates = {};
    const cursor = new Date(`${a.startDate}T00:00:00`);
    const end = new Date(`${a.endDate}T00:00:00`);
    while (cursor <= end) {
      dates[toKey(cursor)] = { price: Number(a.price) || 0, remaining: 10 };
      cursor.setDate(cursor.getDate() + 1);
    }

    reservationCount += 1;
    if (!dryRun) {
      await prisma.reservation.upsert({
        where: { activityId: a.id },
        create: { activityId: a.id, dates },
        update: { dates },
      });
    }
  }

  console.log(`reservations：重建 ${reservationCount} 筆（依活動日期區間，remaining 固定 10）`);

  if (dryRun) {
    console.log('\n(--dry-run，未寫入資料庫)');
  } else {
    console.log('\n已寫入 Postgres');
  }
}

main()
  .catch((err) => {
    console.error('❌ 執行失敗:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
