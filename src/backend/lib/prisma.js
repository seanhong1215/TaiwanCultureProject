import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 獨立腳本（scripts/*.mjs）直接 import 這個模組時不會經過 server.js 的
// dotenv.config()，這裡補上確保 DATABASE_URL 一定讀得到。
// server.js 本身也會呼叫一次，dotenv.config() 呼叫多次是安全的
// （後面呼叫遇到已存在的 key 會直接略過，不會覆蓋掉）。
dotenv.config();

// 開發模式下 vite/nodemon 熱重載會重複載入這個模組，
// 若每次都 new PrismaClient() 會耗盡 Postgres 連線數；
// 用 globalThis 快取單一實例是 Prisma 官方建議的作法。
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

export default prisma;
