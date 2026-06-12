import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import id from './id.json';
import en from './en.json';
import ar from './ar.json';

const LANG_KEY = 'ramadan_app_language';
const savedLang = localStorage.getItem(LANG_KEY);

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      id: { translation: id },
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: savedLang || 'id',
    fallbackLng: 'id',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: LANG_KEY,
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANG_KEY, lng);
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial direction
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export default i18n;
