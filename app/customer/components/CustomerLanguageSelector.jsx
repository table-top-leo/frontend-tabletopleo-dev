"use client";
// app/customer/components/CustomerLanguageSelector.jsx
//
// Compact "🌐 English ▾" pill for the customer landing page. Opens a list of
// every SUPPORTED_LANGUAGES entry by native name (not flags — a flag isn't
// a reliable proxy for a language, e.g. Hindi vs Telugu are both spoken in
// India). Selecting a language calls setLanguageCode(), which re-renders
// the whole customer flow instantly via CustomerLanguageProvider — no
// navigation, no page reload, and the customer stays on whatever screen
// they're currently on.

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useCustomerLanguage } from "../../context/CustomerLanguageProvider";

export default function CustomerLanguageSelector({ variant = "dark" }) {
  const { languageCode, languages, setLanguageCode } = useCustomerLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const active = languages.find((l) => l.code === languageCode) || languages[0];

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isDark = variant === "dark";

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 11px", borderRadius: 11,
          background: isDark ? "rgba(0,0,0,0.38)" : "var(--surface-2)",
          backdropFilter: isDark ? "blur(4px)" : undefined,
          border: isDark ? "1px solid rgba(255,255,255,0.25)" : "1.5px solid var(--border-light)",
          cursor: "pointer", touchAction: "manipulation",
        }}
      >
        <Globe size={15} color={isDark ? "#fff" : "var(--text-secondary)"} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: isDark ? "#fff" : "var(--text-primary)", whiteSpace: "nowrap" }}>
          {active.nativeName}
        </span>
        <ChevronDown size={13} color={isDark ? "rgba(255,255,255,0.8)" : "var(--text-muted)"} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 40,
            width: 200, maxHeight: 320, overflowY: "auto",
            background: "var(--surface, #fff)", borderRadius: 14,
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)", border: "1px solid var(--border-light, #eee)",
            padding: 6,
          }}
        >
          {languages.map((lang) => {
            const isActive = lang.code === languageCode;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isActive}
                onClick={() => { setLanguageCode(lang.code); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 8, padding: "9px 10px", borderRadius: 9, border: "none",
                  background: isActive ? "var(--surface-2, #f5f5f5)" : "transparent",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 800 : 600, color: "var(--text-primary, #111)" }}>
                    {lang.nativeName}
                  </span>
                  {lang.nativeName !== lang.name && (
                    <span style={{ fontSize: 10.5, color: "var(--text-muted, #888)" }}>{lang.name}</span>
                  )}
                </span>
                {isActive && <Check size={14} color="var(--brand, #ea580c)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
