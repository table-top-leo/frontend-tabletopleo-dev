"use client";
// app/context/CurrencyContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { getCurrencySymbol } from "../utils/currencyHelper";
import { getBusinessInformation } from "../services/businessService";

const CurrencyContext = createContext({
  currencyCode:   null,
  currencySymbol: "",
  setCurrency:    () => {},
  formatAmount:   (n) => `${n}`,
  currencyReady:  false,
});

export function CurrencyProvider({ children }) {
  // No hardcoded "INR" default — an unverified currency is worse than none.
  // A Danish/US/German merchant silently seeing ₹ everywhere is exactly the
  // bug this fixes. Starts null; only ever set from a real, confirmed
  // source (cached ttl_user, or a fresh backend lookup).
  const [currencyCode, setCurrencyCode] = useState(null);
  const [currencyReady, setCurrencyReady] = useState(false);

  const verifyFromBackend = async () => {
    try {
      const stored = localStorage.getItem("ttl_user");
      const user = stored ? JSON.parse(stored) : null;
      if (!user?.adminId) { setCurrencyReady(true); return; }

      const res = await getBusinessInformation(user.adminId);
      const backendCode = res?.data?.currencyCode;
      if (backendCode) {
        setCurrencyCode(backendCode);
        // Cache it so next load is instant — but the backend remains the
        // authority; this cache is just a fast first-paint, not a source
        // of truth in its own right.
        try {
          user.currencyCode = backendCode;
          localStorage.setItem("ttl_user", JSON.stringify(user));
        } catch {}
      }
    } catch {
      // Network hiccup — leave currencyCode as whatever we already had
      // (possibly null); components should treat null as "still loading",
      // never silently substitute INR.
    } finally {
      setCurrencyReady(true);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ttl_user");
      const user = stored ? JSON.parse(stored) : null;
      if (user?.currencyCode) {
        // Fast path — trust the cached value for instant first paint...
        setCurrencyCode(user.currencyCode);
        setCurrencyReady(true);
        // ...but still quietly confirm against the backend in case the
        // merchant changed their business currency since this was cached.
        verifyFromBackend();
      } else {
        // No cached value at all — this is exactly the scenario that used
        // to silently fall back to INR. Now it asks the backend directly.
        verifyFromBackend();
      }
    } catch {
      verifyFromBackend();
    }

    const onStorage = () => {
      try {
        const stored = localStorage.getItem("ttl_user");
        if (stored) {
          const user = JSON.parse(stored);
          if (user?.currencyCode) setCurrencyCode(user.currencyCode);
        }
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setCurrency = (code) => {
    setCurrencyCode(code);
    try {
      const stored = localStorage.getItem("ttl_user");
      if (stored) {
        const user = JSON.parse(stored);
        user.currencyCode = code;
        localStorage.setItem("ttl_user", JSON.stringify(user));
      }
    } catch {}
  };

  const currencySymbol = currencyCode ? getCurrencySymbol(currencyCode) : "";

  const formatAmount = (amount) => {
    if (!currencyCode) return String(amount);
    const { formatCurrency } = require("../utils/currencyHelper");
    return formatCurrency(amount, currencyCode);
  };

  return (
    <CurrencyContext.Provider value={{ currencyCode, currencySymbol, setCurrency, formatAmount, currencyReady }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export default CurrencyContext;