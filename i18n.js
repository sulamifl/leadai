import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// initReactI18next подключаем всегда (и на сервере, и на клиенте),
// чтобы useTranslation() работал во время SSR/prerender.
i18n.use(initReactI18next);

// i18next-http-backend и i18next-browser-languagedetector используют
// browser-only API (document/window) и не могут выполняться на сервере,
// поэтому подключаем их только в браузере.
if (typeof window !== 'undefined') {
  i18n.use(Backend).use(LanguageDetector);
}

i18n.init({
  fallbackLng: 'en', // Язык по умолчанию
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false, // React уже по умолчанию экранирует значения
  },
  ...(typeof window !== 'undefined'
    ? {
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json', // Путь к вашим JSON файлам с переводами
        },
      }
    : {}),
});

export default i18n;
