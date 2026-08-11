"use client";
import React from "react";
import { KioskLeoMark } from "./KioskLogo";
import KioskFloatingBubbles from "./KioskFloatingBubbles";

export default function KioskWelcomeScreen({ business, onStart }) {
  const bg = business?.coverImageUrl || business?.logoUrl || "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80";
  const badge = business?.logoUrl || bg;

  return (
    <button onClick={onStart} className="ttlKioskOwlWelcome" aria-label="Tap anywhere to start your order">
      <img src={bg} alt="" className="ttlKioskOwlBg" draggable={false} />
      <div className="ttlKioskOwlOverlay1" />
      <div className="ttlKioskOwlOverlay2" />
      <KioskFloatingBubbles count={16} />

      <div className="ttlKioskOwlContent">
        <div className="ttlKioskOwlBadgeWrap">
          <div className="ttlKioskOwlBadge">
            <img src={badge} alt="" draggable={false} />
          </div>
          <div className="ttlKioskOwlBadgeMark">
            <KioskLeoMark size={34} />
          </div>
        </div>

        <p className="ttlKioskOwlEyebrow">Self-service Kiosk</p>

        <h1 className="ttlKioskOwlTitle">
          Welcome to
          <br />
          <span>{business?.businessName || "Table Top Leo"}</span>
        </h1>

        <p className="ttlKioskOwlSub">Tap anywhere on the screen to browse the menu and place your order.</p>

        <div className="ttlKioskOwlLive">
          <span className="ttlKioskOwlDot" />
          Fast &amp; contactless ordering
        </div>

        <div className="ttlKioskOwlTap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Tap to begin</span>
        </div>
      </div>
    </button>
  );
}
