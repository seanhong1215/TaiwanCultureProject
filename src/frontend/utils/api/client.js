import axios from 'axios';

/**
 * 共用的 axios 實例與攔截器。
 *
 * 原本這些設定與全部 56 個 API 函式擠在同一個 491 行的 api.js 裡，
 * 找一個「訂單相關」的函式得先滑過收藏、評價、會員管理才找得到。
 * 這裡把 axios 設定獨立出來，各領域的 API 模組（./activity、./order…）
 * 都從這裡取得同一個已設定好 baseURL 與攔截器的實例。
 */

// 使用 Vite 的 import.meta.env 而非 process.env：瀏覽器沒有 process，
// 且 API 位址改由環境變數注入，換部署環境不必改程式碼。
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.PROD ? 'https://taiwan-culture-project.onrender.com' : 'http://localhost:3001');

// 自動帶入 token（前台用 token，後台用 admin_token）
axios.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  const memberToken = localStorage.getItem('token');
  const token = adminToken || memberToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 後端回 401 代表 token 過期或無效（社群登入的 Firebase ID Token 約 1 小時到期）。
// 清掉本地憑證並導回對應的登入入口，避免使用者卡在「看起來已登入但每個操作都失敗」的狀態。
const MEMBER_KEYS = ['token', 'userId', 'userName', 'userEmail', 'userAvatar', 'userRole'];
const ADMIN_KEYS = ['admin_token', 'admin_userId', 'admin_userName', 'admin_userEmail', 'admin_userAvatar', 'admin_userRole'];

const clearSession = (keys) => keys.forEach((key) => localStorage.removeItem(key));

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminArea = window.location.hash.startsWith('#/admin');
      if (isAdminArea) {
        clearSession(ADMIN_KEYS);
        window.location.hash = '#/admin/login';
      } else {
        clearSession(MEMBER_KEYS);
        window.location.hash = '#/';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
