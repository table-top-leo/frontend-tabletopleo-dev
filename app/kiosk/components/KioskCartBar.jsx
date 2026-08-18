"use client";
import React from "react";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { formatCurrency } from "../../utils/currencyHelper";

export default function KioskCartBar({ total, itemCount, currencyCode, onOpen }) {
  if (itemCount === 0) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent">
      <button
        onClick={onOpen}
        className="w-full flex items-center justify-between bg-purple-600 rounded-full pl-5 pr-5 py-4 shadow-lg shadow-purple-600/30 active:scale-[0.99] transition"
      >
        <span className="flex items-center gap-3">
          <span className="relative">
            <ShoppingBag size={20} color="#fff" />
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-purple-700 text-[10px] font-extrabold flex items-center justify-center">
              {itemCount}
            </span>
          </span>
          <span className="text-white font-bold text-sm">View my cart</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-white font-extrabold text-sm">{formatCurrency(total, currencyCode)}</span>
          <ChevronRight size={18} color="#fff" />
        </span>
      </button>
    </div>
  );
}