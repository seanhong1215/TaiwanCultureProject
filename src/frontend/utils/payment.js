/**
 * 付款資料處理工具
 *
 * 安全原則（PCI-DSS）：
 * 完整卡號、有效期限、安全碼（CVV）一律不得離開表單、不得寫入資料庫。
 * 送出訂單時只保留「可供對帳與客服辨識」的最小欄位：持卡人、卡別、卡號末四碼。
 */

const CARD_BRAND_PATTERNS = [
  { brand: 'VISA', pattern: /^4/ },
  { brand: 'MasterCard', pattern: /^5[1-5]/ },
  { brand: 'JCB', pattern: /^35/ },
  { brand: 'AMEX', pattern: /^3[47]/ },
];

/** 取出卡號中的數字 */
const digitsOf = (cardNumber = '') => String(cardNumber).replace(/\D/g, '');

/** 依卡號前綴判斷卡別，無法判斷時回傳 'UNKNOWN' */
export const detectCardBrand = (cardNumber) => {
  const digits = digitsOf(cardNumber);
  const matched = CARD_BRAND_PATTERNS.find(({ pattern }) => pattern.test(digits));
  return matched ? matched.brand : 'UNKNOWN';
};

/** 取卡號末四碼，不足四碼回傳空字串 */
export const getCardLast4 = (cardNumber) => {
  const digits = digitsOf(cardNumber);
  return digits.length >= 4 ? digits.slice(-4) : '';
};

/** 產生顯示用遮罩卡號，例如 **** **** **** 1111 */
export const maskCardNumber = (cardNumber) => {
  const last4 = getCardLast4(cardNumber);
  return last4 ? `**** **** **** ${last4}` : '';
};

/**
 * 將付款表單轉為可安全儲存的紀錄。
 * 刻意不使用展開運算子，避免日後表單新增欄位時把敏感資料一併帶進資料庫。
 */
export const toSafePaymentRecord = (formData = {}) => ({
  contactName: formData.contactName || '',
  cardBrand: detectCardBrand(formData.cardNumber),
  cardLast4: getCardLast4(formData.cardNumber),
});
