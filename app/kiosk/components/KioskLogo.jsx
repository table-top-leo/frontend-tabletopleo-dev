"use client";
import React from "react";

export function KioskLeoMark({ size = 36 }) {
  return (
    <div className="ttlKioskLeoMark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size * 0.62} height={size * 0.62} fill="none" stroke="#0d0c0b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 8c-6 0-8 5-8 9 0 2 .5 3.5 1.5 5-3 .5-6 3-6 7 0 1.2.9 2 2 2 1 0 1.6-.6 2.2-1.4C17 32 20 33.5 24 33.5s7-1.5 8.3-3.9c.6.8 1.2 1.4 2.2 1.4 1.1 0 2-.8 2-2 0-4-3-6.5-6-7 1-1.5 1.5-3 1.5-5 0-4-2-9-8-9Z" />
        <circle cx="19.5" cy="19" r="1.1" fill="#0d0c0b" stroke="none" />
        <circle cx="28.5" cy="19" r="1.1" fill="#0d0c0b" stroke="none" />
        <path d="M22 23c.6.6 1.4.6 2 0" />
      </svg>
    </div>
  );
}

export default function KioskLogo({ size = 36, stacked = false, light = false, businessName }) {
  return (
    <div className={`ttlKioskLogoRow ${stacked ? "ttlKioskLogoStacked" : ""}`}>
      <KioskLeoMark size={size} />
      <p className={`ttlKioskLogoText ${light ? "ttlKioskLogoLight" : "ttlKioskLogoDark"}`} style={{ fontSize: size * 0.4 }}>
        {businessName || "Table Top Leo"}
      </p>
    </div>
  );
}
