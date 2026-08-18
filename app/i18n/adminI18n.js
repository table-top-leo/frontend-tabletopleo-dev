// app/i18n/adminI18n.js
//
// i18next instance dedicated to the MERCHANT/ADMIN dashboard — separate
// from app/i18n/i18n.js (the customer-facing instance) so the two can
// never collide or share state. Same architecture as the customer i18n:
// load every locale bundle up front, default to English, fall back to
// English for any missing key.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales-admin/en/translation.json";
import hi from "./locales-admin/hi/translation.json";
import te from "./locales-admin/te/translation.json";
import ta from "./locales-admin/ta/translation.json";
import kn from "./locales-admin/kn/translation.json";
import ml from "./locales-admin/ml/translation.json";
import mr from "./locales-admin/mr/translation.json";
import bn from "./locales-admin/bn/translation.json";
import gu from "./locales-admin/gu/translation.json";
import pa from "./locales-admin/pa/translation.json";
import ur from "./locales-admin/ur/translation.json";
import da from "./locales-admin/da/translation.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  ta: { translation: ta },
  kn: { translation: kn },
  ml: { translation: ml },
  mr: { translation: mr },
  bn: { translation: bn },
  gu: { translation: gu },
  pa: { translation: pa },
  ur: { translation: ur },
  da: { translation: da },
};

// Guard against re-initialization across HMR/route transitions, which
// would otherwise silently reset the merchant's chosen language.
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    supportedLngs: Object.keys(resources),
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
    parseMissingKeyHandler: (key) => {
      const fallbackValue = i18n.getResource("en", "translation", key);
      return fallbackValue || key;
    },
    react: { useSuspense: false },
  });
}

export default i18n;
