import React from "react";
import { formatCurrency } from "../../utils/currencyHelper";

export default function CartBar({ total, itemCount, onOpen, currencyCode }) {
  if (itemCount === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-cream via-cream/95 to-transparent">
      <button
        onClick={onOpen}
        className="w-full bg-charcoal active:bg-ink transition-colors text-cream rounded-full py-3 px-5 flex items-center justify-between shadow-lift"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span className="w-5 h-5 rounded-full bg-ember text-ink flex items-center justify-center text-[11px] font-bold">
            {itemCount}
          </span>
          View my cart
        </span>
        <span className="text-sm font-semibold text-ember-light">{formatCurrency(total, currencyCode)}</span>
      </button>
    </div>
  );
}
