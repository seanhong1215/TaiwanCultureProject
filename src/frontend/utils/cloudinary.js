/**
 * 幫 Cloudinary 圖片網址加上轉換參數，讓瀏覽器改抓自動優化格式
 * （WebP/AVIF）並依實際顯示寬度縮圖，而不是直接下載原始上傳檔——
 * Lighthouse 抓到首頁光是活動卡片縮圖就傳輸了超過 7MB 的原圖，
 * 其中一張單張就有 2.8MB，是拖垮 LCP／Speed Index 的主因。
 *
 * 不需要重新上傳圖片：Cloudinary 支援在網址路徑裡直接夾帶轉換參數，
 * 第一次請求時即時產生對應版本、之後都走 CDN 快取。
 *
 * 非 Cloudinary 網址（本地測試資料、其他來源圖片等）原樣返回。
 *
 * @param {string} url 原始圖片網址
 * @param {number} [width] 目標顯示寬度（CSS px）；會直接當 Cloudinary 的 w_ 參數
 * @returns {string}
 */
export function cloudinaryOptimize(url, width) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;

  const marker = '/upload/';
  const index = url.indexOf(marker);
  if (index === -1) return url;

  const transform = `f_auto,q_auto${width ? `,w_${width}` : ''}`;
  return `${url.slice(0, index + marker.length)}${transform}/${url.slice(index + marker.length)}`;
}
