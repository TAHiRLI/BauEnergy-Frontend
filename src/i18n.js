import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en/translation.json";
import translationDE from "./locales/de/translation.json";
import translationRU from "./locales/ru/translation.json";

//Creating object with the variables of imported translation files
const resources = {
    en: {
        translation: translationEN,
    },
    de: {
        translation: translationDE,
    },
    ru: {
        translation: translationRU,
    },
};



//i18N Initialization
i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "de", //default language
        fallbackLng: "en",
        keySeparator: ":",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;