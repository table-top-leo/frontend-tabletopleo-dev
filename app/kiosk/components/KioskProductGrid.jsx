"use client";
import React from "react";
import { Plus } from "lucide-react";
import { formatCurrency } from "../../utils/currencyHelper";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";

export default function KioskProductGrid({ categoryName, products, currencyCode, onAdd }) {
  return (
    <div className="px-8 py-6">
      <h2 className="text-3xl font-extrabold text-slate-900">{categoryName}</h2>
      <p className="text-sm text-slate-500 mt-1">Freshly made, just for you.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 240px))",
          gap: "16px",
          justifyContent: "start",
          marginTop: "24px",
        }}
      >
        {products.map((p) => {
          const unavailable = p.available === false;
          return (
            <div
              key={p.id}
              style={{ width: "100%" }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="relative w-full aspect-[4/3]">
                <img
                  src={p.img || FALLBACK_IMG}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  style={{ opacity: unavailable ? 0.55 : 1 }}
                />
                {unavailable ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-1 rounded-full">Unavailable</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onAdd(p)}
                    className="absolute -bottom-3.5 right-2.5 w-8 h-8 rounded-full bg-purple-600 shadow-md flex items-center justify-center active:scale-90 transition"
                  >
                    <Plus size={15} color="#fff" strokeWidth={2.8} />
                  </button>
                )}
              </div>

              <div className="px-3 pt-2.5 pb-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-bold text-slate-900 leading-tight">{p.name}</h3>
                  <span className="text-[13px] font-extrabold text-purple-600 whitespace-nowrap flex-shrink-0">
                    {formatCurrency(p.price, currencyCode)}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-snug line-clamp-2 min-h-[2.1em]">
                  {p.desc || "\u00A0"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-16">No items in this category yet.</p>
      )}
    </div>
  );
}