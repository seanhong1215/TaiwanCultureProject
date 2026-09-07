/**
 * 日期格式化工具
 *
 * 原本的實作用 Intl.DateTimeFormat('en-US') 產生字串後再把 "/" 換成 "-"，
 * 導致 formatDate(d, 'YYYY-MM-DD') 實際回傳的是 "03-22-2025"（MM-DD-YYYY），
 * 且結果會隨執行環境的 locale 改變。這裡改用本地時間欄位直接組字串，
 * 輸出與 locale 無關、也不會像 toISOString() 那樣被 UTC 位移影響日期。
 */

const pad = (value) => String(value).padStart(2, '0');

/**
 * 將輸入正規化為 Date；無效值回傳 null。
 * null / undefined / 空字串必須先擋掉——new Date(null) 會得到 1970-01-01，
 * 是一個「合法」的 Date，會讓缺資料的欄位顯示成錯誤日期而非空白。
 */
const toDate = (value) => {
  if (value === null || value === undefined || value === '') return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** 取出本地時區的年／月／日 */
const partsOf = (date) => ({
  year: String(date.getFullYear()),
  month: pad(date.getMonth() + 1),
  day: pad(date.getDate()),
});

const FORMATTERS = {
  'YYYY-MM-DD': ({ year, month, day }) => `${year}-${month}-${day}`,
  'YYYY/MM/DD': ({ year, month, day }) => `${year}/${month}/${day}`,
  'MM/DD/YYYY': ({ year, month, day }) => `${month}/${day}/${year}`,
  'DD-MM-YYYY': ({ year, month, day }) => `${day}-${month}-${year}`,
};

/**
 * 格式化日期。
 * @param {Date|string|number} date 日期
 * @param {'YYYY-MM-DD'|'YYYY/MM/DD'|'MM/DD/YYYY'|'DD-MM-YYYY'} [format]
 * @returns {string} 格式化後字串；日期無效時回傳空字串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const parsed = toDate(date);
  if (!parsed) return '';

  const formatter = FORMATTERS[format] || FORMATTERS['YYYY-MM-DD'];
  return formatter(partsOf(parsed));
}

const EN_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * 長格式日期，例如 2025年03月22日。
 * 預約流程各步驟原本各自重複這段組字串邏輯，統一收斂到這裡。
 *
 * 「年月日」漢字格式中文、日文都通用，只有 language 為 'en' 時
 * 才需要換成英文月份寫法；不傳 language 時維持原本的中文輸出，
 * 呼叫端（Step1/2/4）不需要跟著改。
 * @param {string} [language] i18next 的語言代碼，例如 'en'、'jp'、'zhCn'
 * @returns {string} 日期無效時回傳空字串
 */
export function formatDateZh(date, language) {
  const parsed = toDate(date);
  if (!parsed) return '';

  const { year, month, day } = partsOf(parsed);

  if (language === 'en') {
    return `${EN_MONTH_NAMES[Number(month) - 1]} ${Number(day)}, ${year}`;
  }

  return `${year}年${month}月${day}日`;
}

/**
 * 「年＋月」格式，例如 2025年03月，用於日曆標題這類只需要顯示到月份的地方。
 * @param {string} [language] i18next 的語言代碼，例如 'en'、'jp'、'zhCn'
 * @returns {string} 日期無效時回傳空字串
 */
export function formatMonthYear(date, language) {
  const parsed = toDate(date);
  if (!parsed) return '';

  const { year, month } = partsOf(parsed);

  if (language === 'en') {
    return `${EN_MONTH_NAMES[Number(month) - 1]} ${year}`;
  }

  return `${year}年${month}月`;
}
