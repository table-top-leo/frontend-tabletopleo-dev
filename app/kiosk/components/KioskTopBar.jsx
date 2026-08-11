"use client";
import React from "react";
import KioskLogo from "./KioskLogo";

export default function KioskTopBar({ business, onCancelOrder, hasItems, orderType, tableNumber }) {
  return (
    <div className="ttlKioskFalconTopbar">
      <KioskLogo size={30} businessName={business?.businessName} />

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
