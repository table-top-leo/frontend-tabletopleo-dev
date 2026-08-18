// app/i18n/languageConfig.js
//
// Single source of truth for every language the CUSTOMER-facing UI
// supports. Add a new language by adding one entry here + one
// app/i18n/locales/<code>/translation.json file — nothing else needs to
// change (LanguageSelector, i18n.js, and CustomerLanguageProvider all read
// this list dynamically).
//
// This is intentionally separate from the admin dashboard's
// app/context/LanguageContext.js (which is a different, admin-only system
// keyed off `ttl_user` and backed by `/api/admin/language`). Customers are
// not logged in and must not share that storage/state.

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", dir: "ltr" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", dir: "ltr" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", dir: "ltr" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", dir: "ltr" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", dir: "ltr" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", dir: "ltr" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", dir: "ltr" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", dir: "ltr" },
  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl" },
  { code: "da", name: "Danish", nativeName: "Dansk", dir: "ltr" },
];

export const DEFAULT_LANGUAGE_CODE = "en";
export const FALLBACK_LANGUAGE_CODE = "en";

// Storage key for the customer's language choice. Deliberately distinct
// from the admin's `ttl_user` key, and namespaced per business like the
// existing `ttl_customer_identity_${businessId}` key, so a language chosen
// while ordering from one business never leaks into another's session.
export const customerLanguageStorageKey = (businessId) =>
  businessId ? `ttl_customer_language_${businessId}` : "ttl_customer_language";

export function getLanguageMeta(code) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
}
