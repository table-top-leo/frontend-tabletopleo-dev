"use client";
import React from "react";
import { Tag, Home } from "lucide-react";
import { getKioskBusinessLogo } from "../lib/kioskBusinessImage";

const KEYFRAMES = `
@keyframes ttlKioskRowIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes ttlKioskLogoGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(147,51,234,0.25); }
  50% { box-shadow: 0 0 0 8px rgba(147,51,234,0); }
}
@keyframes ttlKioskDotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}
`;

export default function KioskSidebar({ business, categories, items, activeCategory, onSelectCategory, onHome, onOffers, offersCount }) {
  const logo = getKioskBusinessLogo(business);

  const thumbFor = (catId) => {
    const first = items.find((it) => it.catId === catId && it.img);
    return first?.img || null;
  };

  const rows = [{ id: "offers", isOffers: true }, ...categories];

  return (
    <div className="w-64 h-full bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
      <style>{KEYFRAMES}</style>

      <div className="flex flex-col items-center pt-6 pb-4 px-4 flex-shrink-0">
        <div
          className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-100 shadow-sm"
          style={{ animation: "ttlKioskLogoGlow 2.6s ease-in-out infinite" }}
        >
          <img src={logo} alt={business?.businessName || "Business"} className="w-full h-full object-cover" />
        </div>
        <p className="mt-2 text-xs font-bold text-slate-700 text-center leading-tight truncate max-w-full">
          {business?.businessName || "Table Top Leo"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 no-scrollbar">
        {rows.map((row, i) => {
          const active = row.isOffers ? activeCategory === "offers" : activeCategory === row.id;
          const thumb = row.isOffers ? null : thumbFor(row.id);
          const label = row.isOffers ? `Offers${offersCount > 0 ? ` (${offersCount})` : ""}` : row.name;

          return (
            <button
              key={row.id}
              onClick={() => (row.isOffers ? onOffers() : onSelectCategory(row.id))}
              style={{ animation: "ttlKioskRowIn 0.35s ease-out both", animationDelay: `${i * 45}ms` }}
              className={`relative w-full flex items-center gap-3 pl-3 pr-2.5 py-2.5 rounded-2xl mb-1.5 transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-purple-100 to-sky-50 shadow-sm"
                  : "hover:bg-slate-50 hover:translate-x-0.5"
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-purple-500 to-sky-400 transition-all duration-300 ${
                  active ? "w-1 h-7 opacity-100" : "w-0 h-7 opacity-0"
                }`}
              />

              {row.isOffers ? (
                <span
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    active ? "bg-purple-500 shadow-md shadow-purple-500/30 scale-105" : "bg-purple-50"
                  }`}
                >
                  <Tag size={20} className={active ? "text-white" : "text-purple-500"} />
                </span>
              ) : (
                <span
                  className={`w-11 h-11 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 transition-all duration-200 ${
                    active ? "ring-2 ring-purple-400 scale-105 shadow-md" : ""
                  }`}
                >
                  {thumb ? (
                    <img src={thumb} alt={row.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-slate-300 text-[10px] font-bold">
                      {row.name?.[0]}
                    </span>
                  )}
                </span>
              )}

              <span className={`text-sm font-semibold text-left truncate flex-1 ${active ? "text-purple-700" : "text-slate-700"}`}>
                {label}
              </span>

              {active && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"
                  style={{ animation: "ttlKioskDotPulse 1.4s ease-in-out infinite" }}
                />
              )}
            </button>
          );
        })}

        {categories.length === 0 && (
          <p className="text-xs text-slate-400 text-center px-2 py-6">No categories yet.</p>
        )}
      </div>

      <div className="p-3 border-t border-slate-200 flex-shrink-0">
        <button
          onClick={onHome}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 py-3 text-sm font-bold text-slate-600 active:scale-95 hover:bg-slate-100 transition"
        >
          <Home size={17} />
          Home
        </button>
      </div>
    </div>
  );
}