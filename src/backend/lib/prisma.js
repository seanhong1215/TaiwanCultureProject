import { PrismaClient } from '@prisma/client';

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
