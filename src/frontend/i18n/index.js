import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import jp from './jp.json';
import zhCn from './zhCn.json';

const resources = {
  en: {
    translation: en
  },
  jp: {
    translation: jp
  },
  zhCn: {
    translation: zhCn
  }
};

// 記住使用者上次選的語言，重新整理後不會又跳回預設語言
const STORAGE_KEY = 'language';
const savedLanguage = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // 無痕視窗等環境可能無法存取 localStorage
  }
})();

// 初始化 i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage && resources[savedLanguage] ? savedLanguage : 'zhCn', // 預設語言：繁體中文
    fallbackLng: 'zhCn', // 找不到翻譯時，退回內容最完整的繁體中文，而不是顯示 key 本身
    interpolation: {
      escapeValue: false // 關閉 XSS 轉義
    }
  });

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // 無法寫入時（無痕視窗等）就不記住，不影響本次瀏覽的切換
  }
});

export default i18n;
