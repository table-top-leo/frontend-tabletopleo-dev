import React from "react";
import { LeoMark } from "./Logo";
import FloatingBubbles from "./FloatingBubbles";

// Per-business-type fallback photo when no cover image is uploaded —
// keeps the landing screen relevant/on-brand for every business.
const COVER_BY_TYPE = {
  "Restaurant":  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
  "Cafe":        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
  "Coffee":      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
  "Bakery":      "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80",
  "Fast Food":   "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  "Pizza":       "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
  "Burger":      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  "Dessert":     "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80",
  "default":     "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
};

function getCoverImage(business) {
  if (business?.cover) return business.cover;
  const type = business?.businessType || business?.type || "";
  if (COVER_BY_TYPE[type]) return COVER_BY_TYPE[type];
  const key = Object.keys(COVER_BY_TYPE).find(
    (k) => type.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(type.toLowerCase())
  );
  return COVER_BY_TYPE[key] || COVER_BY_TYPE.default;
}

export default function WelcomeScreen({ business, onStart }) {
  const name = business?.businessName || "TableTop Leo";
  const bg = getCoverImage(business);
  const badge = business?.logoUrl || bg;

  return (
    <button
      onClick={onStart}
      className="relative w-full h-full overflow-hidden text-left"
      aria-label="Tap anywhere to start your order"
    >
      <img
        src={bg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* cinematic warm-dark overlay so text stays legible over the photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/55 to-ink/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
      <FloatingBubbles count={16} />

      <div className="relative h-full flex flex-col items-center justify-center px-8 text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-ember/50 shadow-lift bg-ink2">
            <img src={badge} alt="" className="w-full h-full object-cover" draggable={false} />
          </div>
          <div className="absolute -bottom-2 -right-2">
            <LeoMark size={34} />
          </div>
        </div>

        <p className="uppercase tracking-[0.35em] text-ember-light text-[11px] font-semibold mb-3">
          Self-service Kiosk
        </p>

        <h1 className="font-display font-semibold text-cream text-[34px] leading-[1.15] drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]">
          Welcome to
          <br />
          <span className="text-ember-light">{name}</span>
        </h1>

        <p className="text-cream/85 text-sm mt-4 max-w-[260px] leading-relaxed">
          Tap anywhere on the screen to browse the menu and place your order.
        </p>

        <div className="mt-10 flex items-center gap-2 text-cream/70 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
          Fast &amp; contactless ordering
        </div>

        <div className="absolute bottom-10 flex flex-col items-center gap-2 text-cream/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce">
            <path d="M12 4v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] uppercase tracking-widest">Tap to begin</span>
        </div>
      </div>
    </button>
  );
}
