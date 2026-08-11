"use client";
import React from "react";

export default function KioskIdleOverlay({ onStayHere }) {
  return (
    <div className="ttlKioskIdleOverlay">
      <div className="ttlKioskIdleCard">
        <h3 style={{ fontFamily: "var(--kiosk-font-display)", fontWeight: 600, fontSize: 17, color: "var(--kiosk-charcoal)", margin: "0 0 6px" }}>
          Still there?
        </h3>
        <p style={{ fontSize: 13, color: "var(--kiosk-muted)", margin: "0 0 18px" }}>
          This kiosk will reset for the next customer soon.
        </p>
        <button onClick={onStayHere} className="ttlKioskPillBtn ttlKioskPillBtnPrimary">
          I'm still ordering
        </button>
      </div>
    </div>
  );
}
