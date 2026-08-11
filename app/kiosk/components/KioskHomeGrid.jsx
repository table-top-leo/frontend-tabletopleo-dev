"use client";
import React from "react";

const SWATCHES = ["#e0973f", "#5c7a52", "#a13d3d", "#b5652a", "#3f5c39", "#95897a"];

export default function KioskHomeGrid({ categories, onSelectCategory }) {
  return (
    <div className="ttlKioskHeronHomeGrid">
      <p className="ttlKioskHeronEyebrow">Browse the menu</p>
      <h2 className="ttlKioskHeronTitle">What are you craving?</h2>

      <div className="ttlKioskHeronGrid">
        {categories.map((cat, i) => (
          <button key={cat.id} onClick={() => onSelectCategory(cat.id)} className={`ttlKioskHeronCard ${i === 0 ? "ttlKioskHeronWide" : ""}`}>
            <div className="ttlKioskHeronCardImg" style={{ background: SWATCHES[i % SWATCHES.length] }} />
            <div className="ttlKioskHeronCardLabel">{cat.name}</div>
          </button>
        ))}
        {categories.length === 0 && (
          <p style={{ gridColumn: "span 2", textAlign: "center", color: "var(--kiosk-muted)", fontSize: 13, padding: "40px 0" }}>
            No categories are set up for this business yet.
          </p>
        )}
      </div>
    </div>
  );
}
