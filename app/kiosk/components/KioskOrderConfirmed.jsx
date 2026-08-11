"use client";
import React from "react";
import { KioskLeoMark } from "./KioskLogo";
import KioskFloatingBubbles from "./KioskFloatingBubbles";
import KioskConfetti from "./KioskConfetti";
import { formatCurrency } from "../../utils/currencyHelper";
import { downloadKioskReceipt } from "../lib/kioskReceipt";

export default function KioskOrderConfirmed({ confirmedData, business, cart, currencyCode, emailSent, onTrack, onOpenEmail, onOpenRating }) {
  const isDineIn = confirmedData?.orderType === "DINE_IN" || confirmedData?.orderType === "dine-in";
  const grandTotal = Number(confirmedData?.grandTotal ?? 0);

  return (
    <div className="ttlKioskMagpieScreen">
      <KioskFloatingBubbles count={12} />
      <KioskConfetti count={44} />

      <div className="ttlKioskMagpieCheckWrap">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h2 className="ttlKioskMagpieTitle">Order confirmed!</h2>
      <p className="ttlKioskMagpieSub">
        {isDineIn ? "We'll bring it straight to your table." : "We'll call your name when it's ready for pickup."}
      </p>

      <div className="ttlKioskMagpieOrderBox">
        <p className="ttlKioskMagpieOrderLabel">Order number</p>
        <p className="ttlKioskMagpieOrderNum">#{confirmedData?.orderNumber || confirmedData?.orderId}</p>
      </div>

      <div className="ttlKioskMagpieMeta">
        <KioskLeoMark size={18} />
        {isDineIn ? `Table ${confirmedData?.tableNumber || "-"}` : "Takeaway"}
        {confirmedData?.customerName && (<><span>·</span>{confirmedData.customerName}</>)}
      </div>

      <div className="ttlKioskMagpiePoints">
        🎉 Total paid — {formatCurrency(grandTotal, currencyCode)}
      </div>

      <button onClick={onTrack} className="ttlKioskPillBtn ttlKioskPillBtnPrimary" style={{ maxWidth: 260, marginBottom: 10 }}>
        Track my order
      </button>

      <div className="ttlKioskMagpieActionRow">
        <button onClick={onOpenEmail} className="ttlKioskMagpieSecondary">
          {emailSent ? "Emailed ✓" : "Email invoice"}
        </button>
        <button onClick={() => downloadKioskReceipt({ confirmedData, business, cart, currencyCode })} className="ttlKioskMagpieSecondary">
          Download bill
        </button>
      </div>

      <button onClick={onOpenRating} className="ttlKioskMagpieRateLink">
        Rate your experience
      </button>
    </div>
  );
}
