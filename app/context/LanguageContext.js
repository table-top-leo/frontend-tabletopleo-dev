"use client";
// app/context/LanguageContext.js
//
// Admin/merchant language state — now backed by i18next (see
// app/i18n/adminI18n.js) instead of a bespoke in-file dictionary, so it
// works exactly like the customer-facing language system
// (CustomerLanguageProvider). The public API of useLanguage() is
// unchanged on purpose: { languageCode, languageName, setLanguage, t,
// languages, loadingLangs } — every existing page that already calls
// t("someKey") keeps working with zero changes.
//
// This stays a completely separate i18next instance/localStorage key from
// the customer-facing app/context/CustomerLanguageProvider.jsx — an admin
// switching their dashboard language never affects a customer's session,
// and vice versa.

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import api from "../services/axiosInterceptor";
import adminI18n from "../i18n/adminI18n";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", region: "Global", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "South Asia", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "South Asia", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "South Asia", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "South Asia", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "South Asia", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", region: "South Asia", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "South Asia", flag: "🇧🇩" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "South Asia", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "South Asia", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اردو", region: "South Asia", flag: "🇵🇰" },
  { code: "da", name: "Danish", nativeName: "Dansk", region: "Europe", flag: "🇩🇰" },
];

const LanguageContext = createContext({
  languageCode: "en",
  languageName: "English",
  setLanguage: () => {},
  t: (key) => key,
  languages: SUPPORTED_LANGUAGES,
  loadingLangs: false,
});

function LanguageProviderInner({ children }) {
  const { t, i18n } = useTranslation();
  const [languageCode, setLangCode] = useState("en");
  const [languageName, setLangName] = useState("English");

  // On mount, restore whatever the merchant last saved — from ttl_user if
  // present (existing storage), otherwise default to English.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ttl_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.languageCode && SUPPORTED_LANGUAGES.some((l) => l.code === u.languageCode)) {
          setLangCode(u.languageCode);
          setLangName(u.languageName || "English");
          i18n.changeLanguage(u.languageCode);
        }
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = useCallback(async (code, name) => {
    setLangCode(code);
    setLangName(name);
    i18n.changeLanguage(code);
    // Persist in localStorage — same ttl_user field the rest of the admin
    // app already reads, so nothing else about the login/session flow changes.
    try {
      const stored = localStorage.getItem("ttl_user");
      if (stored) {
        const u = JSON.parse(stored);
        u.languageCode = code;
        u.languageName = name;
        localStorage.setItem("ttl_user", JSON.stringify(u));
      }
    } catch { /* ignore */ }
    // Save to backend — unchanged from the previous implementation.
    try {
      await api.put("/api/admin/language", { languageCode: code, languageName: name });
    } catch { /* non-fatal — language still applied locally */ }
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{ languageCode, languageName, setLanguage, t, languages: SUPPORTED_LANGUAGES, loadingLangs: false }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageProvider({ children }) {
  return (
    <I18nextProvider i18n={adminI18n}>
      <LanguageProviderInner>{children}</LanguageProviderInner>
    </I18nextProvider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;
