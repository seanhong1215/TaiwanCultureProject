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

// 初始化 i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zhCn', // 默認語言
    fallbackLng: 'jp', // 找不到翻譯，使用日文
    interpolation: {
      escapeValue: false // 關閉 XSS 轉義
    }
  });

  export default i18n;
