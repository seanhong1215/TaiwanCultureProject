/**
 * 訂票流程的暫存資料。
 *
 * 四個步驟原本完全靠 react-router 的 location.state 傳遞資料，
 * 只要使用者在流程中重新整理（或不小心按到 F5），state 就會消失，
 * 畫面直接被導回活動列表，先前填的人數、時段、聯絡資訊全部要重來。
 *
 * 這裡把流程資料另外存一份到 sessionStorage：
 * - 用 sessionStorage 而非 localStorage：訂票是一次性的流程，
 *   關掉分頁就該結束，也避免同一台電腦的下一位使用者看到別人的資料。
 * - 加上時效：擱置太久的草稿（例如隔天才回來）不應該再被還原，
 *   活動名額與價格可能都變了。
 */

const STORAGE_KEY = 'bookingDraft';
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 小時

/** sessionStorage 在無痕視窗或封鎖 cookie 時可能直接拋錯 */
const safeSession = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

/** 儲存目前的流程資料 */
export const saveBookingDraft = (data) => {
  if (!data || typeof data !== 'object') return;

  const storage = safeSession();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch (error) {
    // 容量已滿之類的狀況不該讓訂票流程中斷
    console.warn('暫存訂票資料失敗:', error);
  }
};

/** 讀取流程資料；不存在、格式壞掉或已過期都回傳 null */
export const loadBookingDraft = () => {
  const storage = safeSession();
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const { savedAt, data } = JSON.parse(raw);
    if (!data || typeof savedAt !== 'number') return null;

    if (Date.now() - savedAt > MAX_AGE_MS) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    // 內容不是合法 JSON 就當作沒有草稿
    return null;
  }
};

/** 流程結束（完成預約或使用者主動離開）時清除 */
export const clearBookingDraft = () => {
  const storage = safeSession();
  if (!storage) return;

  try {
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('清除訂票暫存資料失敗:', error);
  }
};

/**
 * 取得這一步該使用的資料。
 * 優先用 router 傳來的 state；沒有（重新整理）時退回暫存草稿。
 */
export const resolveBookingData = (routerState) => {
  if (routerState && Object.keys(routerState).length > 0) return routerState;
  return loadBookingDraft() ?? {};
};
