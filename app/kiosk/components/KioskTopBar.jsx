"use client";
import React from "react";
import { getKioskBusinessLogo } from "../lib/kioskBusinessImage";

export default function KioskTopBar({ business, onCancelOrder, hasItems, orderType, tableNumber, onLogoClick }) {
  const logo = getKioskBusinessLogo(business);

  return (
    <div className="ttlKioskFalconTopbar">
      <button
        onClick={onLogoClick}
        className="flex items-center gap-2.5 bg-transparent border-none p-0 active:scale-95 transition"
      >
        <span className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-100">
          <img src={logo} alt={business?.businessName || "Business"} className="w-full h-full object-cover" />
        </span>
        <span className="text-sm font-bold text-slate-800 truncate max-w-[160px]">
          {business?.businessName || "Table Top Leo"}
        </span>
      </button>

      {orderType && (
        <div className="ttlKioskFalconOrderPill">
          <span className="ttlKioskFalconOrderDot" />
          {orderType === "dine-in" ? `Dine In${tableNumber ? ` · Table ${tableNumber}` : ""}` : "Takeaway"}
        </div>
      )}

      <button onClick={onCancelOrder} disabled={!hasItems} className="ttlKioskFalconCancelBtn">
        <span style={{ width: 16, height: 16, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, background: hasItems ? "rgba(161,61,61,0.1)" : "rgba(38,34,29,0.05)" }}>✕</span>
        Cancel order
      </button>
    </div>
  );
}