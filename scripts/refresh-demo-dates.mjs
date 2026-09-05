#!/usr/bin/env node
/**
 * 把 demo 資料的日期整體平移到「現在」。
 *
 * 種子資料的活動日期都停在 2025 年，隨著時間過去全部變成已過期 ——
 * 造訪 demo 的人會發現每個活動都無法選日期，等於看不到訂票流程。
 * 這支腳本把所有日期往後平移同一個位移量（保留活動之間的相對間隔），
 * 讓最早的活動落在今天之後幾天。
 *
 * 用法：node scripts/refresh-demo-dates.mjs [--days-ahead 7] [--dry-run]
 */

import fs from 'node:fs';

const DB_PATH = 'src/backend/json/db.json';

// 只平移「活動排程」相關欄位。
// createdAt / timestamp 是歷史紀錄，往前推反而會出現「未來才建立的訂單」。
const SCHEDULE_FIELDS = ['startDate', 'endDate', 'last_bookable_date'];
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const daysAheadIndex = args.indexOf('--days-ahead');
const daysAhead = daysAheadIndex === -1 ? 7 : Number(args[daysAheadIndex + 1]);

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

/**
 * 收集所有需要平移的排程日期。
 *
 * 有兩種形態要處理：
 *   1. 欄位值 —— { startDate: '2025-05-14' }
 *   2. 物件的 key —— reservations 用日期字串當 key：{ '2025-05-14': { price } }
 * 只搬第一種會讓活動日期與可預約日期對不起來，日曆上每一天都會是 disabled。
 */
const collect = (node, out) => {
  if (Array.isArray(node)) return node.forEach((n) => collect(n, out));
  if (!node || typeof node !== 'object') return;

  for (const [key, value] of Object.entries(node)) {
    if (SCHEDULE_FIELDS.includes(key) && typeof value === 'string' && DATE_ONLY.test(value)) {
      out.push({ kind: 'value', node, key, value });
    }
    if (DATE_ONLY.test(key)) {
      out.push({ kind: 'key', node, key, value: key });
    }
    collect(value, out);
  }
};

const entries = [];
collect(db, entries);

if (entries.length === 0) {
  console.log('找不到可平移的排程日期');
  process.exit(0);
}

// 位移量以「活動」的最早日期為錨點。
// 若改用全部資料的最小值，會被訂單裡更早的歷史日期拉偏，
// 導致活動被推到一兩年後的未來。
const anchorEntries = [];
collect(db.activity, anchorEntries);
const anchorSource = anchorEntries.length > 0 ? anchorEntries : entries;

const DAY_MS = 24 * 60 * 60 * 1000;
const times = anchorSource.map((e) => new Date(`${e.value}T00:00:00`).getTime());
const earliest = Math.min(...times);

const target = new Date();
target.setHours(0, 0, 0, 0);
target.setDate(target.getDate() + daysAhead);

const offsetDays = Math.round((target.getTime() - earliest) / DAY_MS);

if (offsetDays <= 0) {
  console.log(`最早的活動日期已經在今天 +${daysAhead} 天之後，不需要平移`);
  process.exit(0);
}

const shift = (value) => {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const samples = [];
for (const entry of entries) {
  const next = shift(entry.value);
  if (samples.length < 6) {
    samples.push(`${entry.kind === 'key' ? '[key]' : `${entry.key}:`} ${entry.value} -> ${next}`);
  }
  if (dryRun) continue;

  if (entry.kind === 'key') {
    // 改 key 要保留原本的值，並移除舊 key
    entry.node[next] = entry.node[entry.key];
    delete entry.node[entry.key];
  } else {
    entry.node[entry.key] = next;
  }
}

const keyCount = entries.filter((e) => e.kind === 'key').length;
console.log(`平移 ${offsetDays} 天，共 ${entries.length} 個日期（其中 ${keyCount} 個是日期 key）`);
samples.forEach((s) => console.log('  ', s));

/*
 * 重建 reservations。
 *
 * 種子資料裡的 reservations 日期跟活動的 startDate / endDate 對不起來
 * （例如活動 1 排在 05-14，可預約日期卻寫 01-01），因此活動詳情頁的日曆
 * 每一天都是 disabled，訂票流程根本走不下去。
 * 這裡直接依每個活動的日期區間重新產生，讓兩者必定一致。
 */
const buildReservations = () => {
  const pad = (n) => String(n).padStart(2, '0');
  const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  return db.activity.map((activity) => {
    const record = { id: activity.id };
    const cursor = new Date(`${activity.startDate}T00:00:00`);
    const end = new Date(`${activity.endDate}T00:00:00`);

    while (cursor <= end) {
      record[toKey(cursor)] = { price: Number(activity.price), remaining: 10 };
      cursor.setDate(cursor.getDate() + 1);
    }
    return record;
  });
};

const rebuilt = buildReservations();
const mismatched = db.activity.filter((a) => {
  const record = rebuilt.find((r) => r.id === a.id);
  return !record || !record[a.startDate];
}).length;

console.log(`\n重建 reservations：${db.reservations.length} 筆 -> ${rebuilt.length} 筆，對不上的活動 ${mismatched} 個`);

if (dryRun) {
  console.log('\n(--dry-run，未寫入檔案)');
} else {
  db.reservations = rebuilt;
  fs.writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`);
  console.log(`\n已寫入 ${DB_PATH}`);
}
