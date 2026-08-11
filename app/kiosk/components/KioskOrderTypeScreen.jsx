"use client";
import React, { useEffect } from "react";
import KioskLogo from "./KioskLogo";
import KioskFloatingBubbles from "./KioskFloatingBubbles";

const ALL_TYPES = [
  {
    id: "dine-in", label: "Dine In", tagline: "Grab a table, we'll bring it over",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 8h18M3 8l1.5 11h15L21 8M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "takeaway", label: "Takeaway", tagline: "Pick up at the counter",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 8h12l-1 12H7L6 8Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function KioskOrderTypeScreen({ dineInEnabled = true, takeawayEnabled = true, onSelect, onBack }) {
  const visible = ALL_TYPES.filter((t) => (t.id === "dine-in" ? dineInEnabled : takeawayEnabled));
  const types = visible.length > 0 ? visible : ALL_TYPES;

  // If the business only accepts one order type, skip straight past this
  // screen — nothing for the customer to choose.
  useEffect(() => {
    if (types.length === 1) onSelect(types[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types.length]);

  if (types.length === 1) return null;

  return (
    <div className="ttlKioskRobinScreen">
      <div className="ttlKioskGlowTop" />
      <KioskFloatingBubbles count={10} />

      <button onClick={onBack} className="ttlKioskBackLink ttlKioskLogoLight" style={{ position: "absolute", top: 20, left: 20 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      <div className="ttlKioskRobinInner">
        <KioskLogo size={40} light stacked />
        <h2 className="ttlKioskRobinTitle">How would you like to enjoy today?</h2>
        <p className="ttlKioskRobinSub">Choose one to continue</p>

        <div className="ttlKioskRobinOptions">
          {types.map((type) => (
            <button key={type.id} onClick={() => onSelect(type.id)} className="ttlKioskRobinCard">
              <div className="ttlKioskRobinIconWrap">{type.icon}</div>
              <div>
                <p className="ttlKioskRobinLabel">{type.label}</p>
                <p className="ttlKioskRobinTagline">{type.tagline}</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ttlKioskRobinChevron">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
