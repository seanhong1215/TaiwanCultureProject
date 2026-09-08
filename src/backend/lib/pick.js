/**
 * 從 req.body 挑出白名單欄位，其餘一律丟棄。
 *
 * db.json／json-server 沒有 schema，前端隨便夾帶什麼欄位都會被存下來；
 * Prisma 對 Postgres 是嚴格 schema，多餘欄位會直接丟例外。用這個小工具
 * 在寫入前做白名單過濾，行為上更接近原本 json-server「多餘欄位安靜地
 * 被忽略」的寬鬆特性，同時避免 guardCollections 強塞的 userId 等欄位
 * 打到沒有該欄位的 model（例如 reviews）。
 *
 * undefined 的欄位不會被列進回傳物件，讓 PATCH 只更新真的有帶的欄位。
 */
export const pick = (source, keys) => {
  const result = {};
  if (!source || typeof source !== 'object') return result;
  for (const key of keys) {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
};

/** 轉成數字；空字串／null／undefined／無法轉換一律回傳 null（不是 0）。 */
export const toNumberOrNull = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
};
