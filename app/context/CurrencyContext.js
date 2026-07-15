"use client";
// app/context/CurrencyContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { getCurrencySymbol } from "../utils/currencyHelper";

const CurrencyContext = createContext({
  currencyCode:   "INR",
  currencySymbol: "₹",
  setCurrency:    () => {},
  formatAmount:   (n) => `₹${n}`,
});

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState("INR");

  // On mount — read from ttl_user in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ttl_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user?.currencyCode) setCurrencyCode(user.currencyCode);
      }
    } catch {}

    // Also listen for storage changes (e.g. login in another tab)
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
    // Also persist into ttl_user so it survives refresh
    try {
      const stored = localStorage.getItem("ttl_user");
      if (stored) {
        const user = JSON.parse(stored);
        user.currencyCode = code;
        localStorage.setItem("ttl_user", JSON.stringify(user));
      }
    } catch {}
  };

  const currencySymbol = getCurrencySymbol(currencyCode);

  const formatAmount = (amount) => {
    const { formatCurrency } = require("../utils/currencyHelper");
    return formatCurrency(amount, currencyCode);
  };

  return (
    <CurrencyContext.Provider value={{ currencyCode, currencySymbol, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export default CurrencyContext;
