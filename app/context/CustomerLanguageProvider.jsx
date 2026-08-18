"use client";
// app/context/CustomerLanguageProvider.jsx
//
// Language state for the CUSTOMER ordering flow only (landing → tracking).
// This is intentionally separate from app/context/LanguageContext.js, which
// is the ADMIN dashboard's own language system (keyed off `ttl_user` and
// persisted via /api/admin/language). Customers aren't logged in, so this
// provider persists to its own localStorage key instead, namespaced per
// business exactly like the existing `ttl_customer_identity_${businessId}`
// key — a language picked while ordering from one restaurant never leaks
// into another business's kiosk/QR session.
//
// Built on i18next/react-i18next (../i18n/i18n.js) rather than a bespoke
// dictionary, per the project's i18n requirements — SUPPORTED_LANGUAGES in
// languageConfig.js is the single place to add a new language later.

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../i18n/i18n";
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE_CODE,
  customerLanguageStorageKey,
  getLanguageMeta,
} from "../i18n/languageConfig";

const CustomerLanguageContext = createContext({
  languageCode: DEFAULT_LANGUAGE_CODE,
  languages: SUPPORTED_LANGUAGES,
  setLanguageCode: () => {},
});

export function CustomerLanguageProvider({ businessId, children }) {
  const [languageCode, setLanguageCodeState] = useState(DEFAULT_LANGUAGE_CODE);
  const storageKey = customerLanguageStorageKey(businessId);

  // On mount (and whenever the business changes), restore this business's
  // previously-chosen language. Falls back to English if none is saved —
  // never assumes a language from country/currency (those stay independent).
  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(storageKey);
    } catch {
      /* localStorage unavailable (SSR / privacy mode) — default to English */
    }
    const code = saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved) ? saved : DEFAULT_LANGUAGE_CODE;
    setLanguageCodeState(code);
    i18n.changeLanguage(code);
    document.documentElement.dir = getLanguageMeta(code).dir;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const setLanguageCode = useCallback(
    (code) => {
      if (!SUPPORTED_LANGUAGES.some((l) => l.code === code)) return;
      setLanguageCodeState(code);
      i18n.changeLanguage(code);
      document.documentElement.dir = getLanguageMeta(code).dir;
      try {
        localStorage.setItem(storageKey, code);
      } catch {
        /* non-fatal — language just won't persist across reloads */
      }
    },
    [storageKey]
  );

  // Reset document direction back to ltr when the customer flow unmounts
  // (e.g. navigating away entirely), so it never leaks into another part
  // of the app that isn't language-aware.
  useEffect(() => {
    return () => {
      document.documentElement.dir = "ltr";
    };
  }, []);

  return (
    <CustomerLanguageContext.Provider value={{ languageCode, languages: SUPPORTED_LANGUAGES, setLanguageCode }}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </CustomerLanguageContext.Provider>
  );
}

// Convenience hook: gives components both the active language metadata AND
// the `t()` translate function in one place, without importing two hooks.
export function useCustomerLanguage() {
  const ctx = useContext(CustomerLanguageContext);
  const { t } = useTranslation();
  return { ...ctx, t };
}
