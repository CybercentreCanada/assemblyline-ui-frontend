import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translationEN from "./locales/en/translation.json";
import translationFR from "./locales/fr/translation.json";


const resources = {
  en: {
    translation: translationEN
  },
  fr: {
    translation: translationFR
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    keySeparator: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'cookie']
    },
    resources,
  });

export default i18n;
