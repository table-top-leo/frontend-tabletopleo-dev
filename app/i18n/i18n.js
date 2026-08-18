// app/i18n/i18n.js
//
// i18next instance dedicated to the CUSTOMER UI. Initialized once (guarded
// below) and reused across the whole customer flow via CustomerLanguageProvider.
// This is intentionally a plain i18next instance (not the app-wide default
// export some setups use) so it can never collide with any i18n the admin
// dashboard might add later.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE_CODE, FALLBACK_LANGUAGE_CODE } from "./languageConfig";

import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import te from "./locales/te/translation.json";
import ta from "./locales/ta/translation.json";
import kn from "./locales/kn/translation.json";
import ml from "./locales/ml/translation.json";
import mr from "./locales/mr/translation.json";
import bn from "./locales/bn/translation.json";
import gu from "./locales/gu/translation.json";
import pa from "./locales/pa/translation.json";
import ur from "./locales/ur/translation.json";
import da from "./locales/da/translation.json";

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

// Next.js can execute this module more than once across HMR/route
// transitions — guard so we never re-init (which would reset the language
// back to default mid-session).
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE_CODE,
    fallbackLng: FALLBACK_LANGUAGE_CODE,
    supportedLngs: Object.keys(resources),
    interpolation: { escapeValue: false }, // React already escapes
    returnNull: false,
    returnEmptyString: false,
    // Never render a bare translation key (e.g. "menu.title") to the
    // customer if a key is missing in the active language — fall back to
    // the English string, and only fall back to the raw key as an
    // absolute last resort during development.
    parseMissingKeyHandler: (key) => {
      const fallbackValue = i18n.getResource(FALLBACK_LANGUAGE_CODE, "translation", key);
      return fallbackValue || key;
    },
    react: { useSuspense: false },
  });
}

export default i18n;
