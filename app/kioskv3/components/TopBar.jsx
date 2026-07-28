import React from "react";
import Logo from "./Logo";

export default function TopBar({ onCancelOrder, hasItems, orderType, tableNumber }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-cream/95 backdrop-blur border-b border-charcoal/8">
      <Logo size={30} />

      {orderType && (
        <div className="hidden sm:flex items-center gap-1.5 bg-charcoal/5 rounded-full px-3 py-1.5 text-[11px] font-medium text-charcoal/70">
          <span className="w-1.5 h-1.5 rounded-full bg-moss" />
          {orderType === "dine-in" ? `Dine In · Table ${tableNumber ?? "-"}` : "Takeaway"}
        </div>
      )}

      <button
        onClick={onCancelOrder}
        disabled={!hasItems}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          hasItems
            ? "border-claret/30 text-claret active:bg-claret/5"
            : "border-charcoal/10 text-charcoal/25"
        }`}
      >
        <span
          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            hasItems ? "bg-claret/10 text-claret" : "bg-charcoal/5 text-charcoal/20"
          }`}
        >
          ✕
        </span>
        Cancel order
      </button>
    </div>
  );
}
