const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  DKK: "kr",
  AED: "د.إ",
  SAR: "﷼",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  JPY: "¥",
  CNY: "¥",
  CHF: "CHF",
  NOK: "kr",
  SEK: "kr",
  MYR: "RM",
  THB: "฿",
  PHP: "₱",
  IDR: "Rp",
  PKR: "₨",
  BDT: "৳",
  LKR: "₨",
  NPR: "₨",
  MXN: "$",
  BRL: "R$",
  ZAR: "R",
  NGN: "₦",
  KES: "KSh",
  EGP: "E£",
  TRY: "₺",
  RUB: "₽",
  KWD: "د.ك",
  OMR: "﷼",
  QAR: "﷼",
  BHD: ".د.ب",
  NZD: "NZ$",
};

// Codes where symbol goes after the amount e.g. "250 kr"
const SUFFIX_CODES = new Set(["DKK", "NOK", "SEK"]);

/**
 * Get just the symbol string for a currency code.
 * Falls back to the code itself if unknown.
 */
export function getCurrencySymbol(code = "INR") {
  return CURRENCY_SYMBOLS[code?.toUpperCase()] || code || "₹";
}

/**
 * Format a number with the correct currency symbol.
 * Examples:
 *   formatCurrency(250, "INR")  → "₹250"
 *   formatCurrency(250, "DKK")  → "250 kr"
 *   formatCurrency(1500, "USD") → "$1,500"
 */
export function formatCurrency(amount, code = "INR") {
  const upper  = (code || "INR").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[upper] || upper;
  const num    = Number(amount || 0);

  // Locales that use different number formatting
  const localeMap = {
    INR: "en-IN",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    DKK: "da-DK",
    JPY: "ja-JP",
  };
  const locale = localeMap[upper] || "en-US";
  const decimals = upper === "JPY" ? 0 : 2;

  const formatted = num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return SUFFIX_CODES.has(upper)
    ? `${formatted} ${symbol}`
    : `${symbol}${formatted}`;
}

// Auto-map country name → currency code
export const COUNTRY_CURRENCY_MAP = {
  "India":                "INR",
  "Denmark":              "DKK",
  "United States":        "USD",
  "United Kingdom":       "GBP",
  "Germany":              "EUR",
  "France":               "EUR",
  "Spain":                "EUR",
  "Italy":                "EUR",
  "Portugal":             "EUR",
  "Netherlands":          "EUR",
  "Belgium":              "EUR",
  "Austria":              "EUR",
  "Finland":              "EUR",
  "Greece":               "EUR",
  "Luxembourg":           "EUR",
  "Malta":                "EUR",
  "Ireland":              "EUR",
  "Cyprus":               "EUR",
  "United Arab Emirates": "AED",
  "Saudi Arabia":         "SAR",
  "Australia":            "AUD",
  "Canada":               "CAD",
  "Singapore":            "SGD",
  "Japan":                "JPY",
  "Norway":               "NOK",
  "Sweden":               "SEK",
  "Switzerland":          "CHF",
  "China":                "CNY",
  "Malaysia":             "MYR",
  "Thailand":             "THB",
  "Philippines":          "PHP",
  "Indonesia":            "IDR",
  "Pakistan":             "PKR",
  "Bangladesh":           "BDT",
  "Sri Lanka":            "LKR",
  "Nepal":                "NPR",
  "Mexico":               "MXN",
  "Brazil":               "BRL",
  "South Africa":         "ZAR",
  "Nigeria":              "NGN",
  "Kenya":                "KES",
  "Egypt":                "EGP",
  "Turkey":               "TRY",
  "Russia":               "RUB",
  "Kuwait":               "KWD",
  "Oman":                 "OMR",
  "Qatar":                "QAR",
  "Bahrain":              "BHD",
  "New Zealand":          "NZD",
};

export const CURRENCIES = [
  { code:"INR", label:"INR — Indian Rupee (₹)" },
  { code:"USD", label:"USD — US Dollar ($)" },
  { code:"EUR", label:"EUR — Euro (€)" },
  { code:"GBP", label:"GBP — British Pound (£)" },
  { code:"DKK", label:"DKK — Danish Krone (kr)" },
  { code:"AED", label:"AED — UAE Dirham (د.إ)" },
  { code:"SAR", label:"SAR — Saudi Riyal (﷼)" },
  { code:"AUD", label:"AUD — Australian Dollar (A$)" },
  { code:"CAD", label:"CAD — Canadian Dollar (C$)" },
  { code:"SGD", label:"SGD — Singapore Dollar (S$)" },
  { code:"JPY", label:"JPY — Japanese Yen (¥)" },
  { code:"NOK", label:"NOK — Norwegian Krone (kr)" },
  { code:"SEK", label:"SEK — Swedish Krona (kr)" },
  { code:"CHF", label:"CHF — Swiss Franc (CHF)" },
  { code:"MYR", label:"MYR — Malaysian Ringgit (RM)" },
  { code:"THB", label:"THB — Thai Baht (฿)" },
  { code:"PHP", label:"PHP — Philippine Peso (₱)" },
  { code:"IDR", label:"IDR — Indonesian Rupiah (Rp)" },
  { code:"PKR", label:"PKR — Pakistani Rupee (₨)" },
  { code:"BDT", label:"BDT — Bangladeshi Taka (৳)" },
  { code:"MXN", label:"MXN — Mexican Peso ($)" },
  { code:"BRL", label:"BRL — Brazilian Real (R$)" },
  { code:"ZAR", label:"ZAR — South African Rand (R)" },
  { code:"NGN", label:"NGN — Nigerian Naira (₦)" },
  { code:"EGP", label:"EGP — Egyptian Pound (E£)" },
  { code:"TRY", label:"TRY — Turkish Lira (₺)" },
  { code:"RUB", label:"RUB — Russian Ruble (₽)" },
  { code:"KWD", label:"KWD — Kuwaiti Dinar (د.ك)" },
  { code:"NZD", label:"NZD — New Zealand Dollar (NZ$)" },
];
