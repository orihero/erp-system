import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
// import Backend from 'i18next-http-backend'; // keep this out

// Import language files
import enTranslation from "./locales/en.json";
import ruTranslation from "./locales/ru.json";
import uzTranslation from "./locales/uz.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ru: {
        translation: ruTranslation,
      },
      uz: {
        translation: uzTranslation,
      },
    },
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
