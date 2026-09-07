#!/usr/bin/env node
/**
 * 一次性資料搬遷：src/backend/json/db.json → Postgres（透過 Prisma）。
 *
 * 搬遷順序依外鍵相依性排列：users → activities → journals → reviews →
 * favorites → profiles → reservations → orders → notifications。
 *
 * 刻意不搬的 collection（確認是死資料，詳見專案調查紀錄）：
 * tickets（全空）、payments（全空）、userStats（只有 1 筆、無人讀取）、
 * vouchers（無人讀取）、頂層 rewards（用途不明、與 user.rewards 重複）。
 *
 * 已知的髒資料：orders 裡有 1 筆缺 userId/activityId 的紀錄
 * （ORD202503140015），搬遷時保留該筆但關聯欄位存 null，
 * 冗餘欄位（activityName/actImage 等）維持原樣不受影響。
 *
 * 用法：
 *   node scripts/migrate-to-postgres.mjs          # 正式寫入
 *   node scripts/migrate-to-postgres.mjs --dry-run # 只印出筆數，不寫入
 *
 * 前提：.env 的 DATABASE_URL 已指向 Supabase，且已跑過
 * `npx prisma migrate dev` 建好資料表。
 */

import fs from 'node:fs';
import prisma from '../src/backend/lib/prisma.js';

const DB_PATH = 'src/backend/json/db.json';
const dryRun = process.argv.includes('--dry-run');

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

// "2025-03-03 09:56:40" 這種空格分隔格式，不是所有 JS 引擎都能正確解析，
// 轉成 ISO 的 'T' 分隔格式才穩定。
const toDate = (str, fallback = new Date()) => {
  if (!str) return fallback;
  const isoish = str.includes('T') ? str : str.replace(' ', 'T');
  const d = new Date(isoish);
  return Number.isNaN(d.getTime()) ? fallback : d;
};

// db.json 是無 schema 的檔案，少數欄位（目前發現 activity.price）
// 混了字串跟數字兩種型別，寫進 Postgres 前要統一轉型。
const toNumberOrNull = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
};

const summary = {};
const record = (name, count) => {
  summary[name] = count;
};

async function migrateUsers() {
  const rows = db.users ?? [];
  if (!dryRun) {
    for (const u of rows) {
      await prisma.user.create({
        data: {
          id: u.id,
          email: u.email,
          password: u.password,
          name: u.name,
          role: u.role ?? 'USER',
          avatar: u.avatar ?? null,
          uuid: u.uuid ?? null,
          signInHistory: u.signInHistory ?? [],
          currentStreak: u.currentStreak ?? 0,
          rewards: u.rewards ?? undefined,
          tickets: u.tickets ?? undefined,
          createdAt: toDate(u.createdAt),
        },
      });
    }
  }
  record('users', rows.length);
}

async function migrateActivities() {
  const rows = db.activity ?? [];
  if (!dryRun) {
    for (const a of rows) {
      await prisma.activity.create({
        data: {
          id: a.id,
          city: a.city ?? null,
          images: a.images ?? null,
          rating: toNumberOrNull(a.rating) ?? 0,
          startDate: a.startDate ?? null,
          endDate: a.endDate ?? null,
          price: toNumberOrNull(a.price),
          eventType: a.eventType ?? null,
          status: a.status ?? null,
          eventAddress: a.eventAddress ?? null,
          content: a.content ?? {},
          activityDetails: a.activityDetails ?? undefined,
        },
      });
    }
  }
  record('activities', rows.length);
}

async function migrateJournals() {
  const rows = db.journal ?? [];
  if (!dryRun) {
    for (const j of rows) {
      await prisma.journal.create({
        data: {
          id: j.id,
          title: j.title,
          date: j.date ?? null,
          content: j.content ?? '',
          images: j.images ?? null,
        },
      });
    }
  }
  record('journals', rows.length);
}

async function migrateReviews() {
  const rows = db.reviews ?? [];
  const activityIds = new Set((db.activity ?? []).map((a) => a.id));
  if (!dryRun) {
    for (const r of rows) {
      await prisma.review.create({
        data: {
          id: r.id,
          avatar: r.avatar ?? null,
          name: r.name ?? null,
          rating: r.rating ?? null,
          activityTitle: r.activityTitle ?? null,
          imageFiles: r.imageFiles ?? undefined,
          reviewContent: r.reviewContent ?? null,
          activityId: activityIds.has(r.activityId) ? r.activityId : null,
        },
      });
    }
  }
  record('reviews', rows.length);
}

async function migrateFavorites() {
  const rows = db.favorites ?? [];
  if (!dryRun) {
    for (const f of rows) {
      await prisma.favorite.create({
        data: {
          id: f.id,
          userId: f.userId,
          activityId: f.activityId,
          isFavorited: f.isFavorited ?? true,
        },
      });
    }
  }
  record('favorites', rows.length);
}

async function migrateProfiles() {
  const rows = db.profiles ?? [];
  if (!dryRun) {
    for (const p of rows) {
      await prisma.profile.create({
        data: {
          id: p.id,
          lastName: p.lastName ?? null,
          firstName: p.firstName ?? null,
          nickName: p.nickName ?? null,
          gender: p.gender ?? null,
          birthday: p.birthday ?? null,
          country: p.country ?? null,
          countryCode: p.countryCode ?? null,
          phoneNumber: p.phoneNumber ?? null,
          userId: p.userId,
        },
      });
    }
  }
  record('profiles', rows.length);
}

async function migrateReservations() {
  const rows = db.reservations ?? [];
  if (!dryRun) {
    for (const r of rows) {
      const { id, ...dates } = r; // 除了 id，其餘 key 全是日期
      await prisma.reservation.create({
        data: {
          id,
          activityId: id, // 既有資料裡 reservation.id 與 activity.id 一一對應
          dates,
        },
      });
    }
  }
  record('reservations', rows.length);
}

async function migrateOrders() {
  const rows = db.orders ?? [];
  const userIds = new Set((db.users ?? []).map((u) => u.id));
  const activityIds = new Set((db.activity ?? []).map((a) => a.id));
  if (!dryRun) {
    for (const o of rows) {
      await prisma.order.create({
        data: {
          id: o.id,
          userId: userIds.has(o.userId) ? o.userId : null,
          activityId: activityIds.has(o.activityId) ? o.activityId : null,
          createdAt: toDate(o.createdAt),
          activityName: o.activityName ?? null,
          lastBookableDate: o.last_bookable_date ?? null,
          activityLocation: o.activityLocation ?? null,
          activityPeriod: o.activityPeriod ?? undefined,
          adultCount: toNumberOrNull(o.adultCount),
          childCount: toNumberOrNull(o.childCount),
          adultPrice: toNumberOrNull(o.adultPrice),
          childPrice: toNumberOrNull(o.childPrice),
          timeSlot: o.timeSlot ?? null,
          totalAmount: toNumberOrNull(o.totalAmount),
          paymentStatus: o.paymentStatus ?? null,
          reservedStatus: o.reservedStatus ?? null,
          actImage: o.actImage ?? null,
          paymentData: o.paymentData ?? undefined,
          contactName: o.contactName ?? null,
          reviewed: o.reviewed ?? false,
        },
      });
    }
  }
  record('orders', rows.length);
}

async function migrateNotifications() {
  const rows = db.notifications ?? [];
  if (!dryRun) {
    for (const n of rows) {
      await prisma.notification.create({
        data: {
          id: n.id,
          message: n.message,
          timestamp: toDate(n.timestamp),
        },
      });
    }
  }
  record('notifications', rows.length);
}

// 用 create() 逐筆帶入原本的整數 id 之後，Postgres 的 SERIAL 序列
// 並不會跟著往前跳——序列仍停在 1，下一次 autoincrement 會撞到既有 id。
// 每張表搬完都要把序列手動追上目前的最大 id。
async function resetSequence(table, idColumn = 'id') {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${table}"', '${idColumn}'), COALESCE((SELECT MAX("${idColumn}") FROM "${table}"), 1))`
  );
}

async function main() {
  console.log(dryRun ? '🔍 Dry run（不會寫入資料庫）\n' : '🚀 開始搬遷資料到 Postgres\n');

  await migrateUsers();
  await migrateActivities();
  await migrateJournals();
  await migrateReviews();
  await migrateFavorites();
  await migrateProfiles();
  await migrateReservations();
  await migrateOrders();
  await migrateNotifications();

  if (!dryRun) {
    console.log('\n🔧 重設 auto-increment 序列...');
    for (const table of [
      'users',
      'activities',
      'journals',
      'reviews',
      'favorites',
      'profiles',
      'reservations',
      'notifications',
    ]) {
      await resetSequence(table);
    }
    // orders.id 是 String 主鍵（ORD 開頭），沒有序列要重設。
  }

  console.log('\n完成，各表筆數：');
  console.table(summary);
}

main()
  .catch((err) => {
    console.error('❌ 搬遷失敗:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
