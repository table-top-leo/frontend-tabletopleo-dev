"use client";
import React from "react";
import { Tag } from "lucide-react";

// Deterministic placeholder art per category (real menu has no per-category
// icon field) — a small solid swatch, not a stock photo standing in for the
// merchant's real product photography.
const SWATCHES = ["#e0973f", "#5c7a52", "#a13d3d", "#b5652a", "#3f5c39", "#95897a"];

export default function KioskSidebar({ categories, activeCategory, onSelectCategory, onHome, onOffers, offersCount }) {
  return (
    <div className="ttlKioskCardamomSidebar">
      <div className="ttlKioskCardamomSidebarScroll ttlKioskNoScroll">
        <button onClick={onOffers} className="ttlKioskCardamomCatBtn">
          <span className={`ttlKioskCardamomCatImg ${activeCategory === "offers" ? "ttlKioskCardamomCatActive" : ""}`} style={{ background: "var(--kiosk-sand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Tag size={20} color="var(--kiosk-ember-deep)" />
          </span>
          <span className={`ttlKioskCardamomCatLabel ${activeCategory === "offers" ? "ttlKioskCardamomCatActive" : ""}`}>
            Offers{offersCount > 0 ? ` (${offersCount})` : ""}
          </span>
        </button>

        {categories.map((cat, i) => {
          const isActive = activeCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => onSelectCategory(cat.id)} className="ttlKioskCardamomCatBtn">
              <span className={`ttlKioskCardamomCatImg ${isActive ? "ttlKioskCardamomCatActive" : ""}`} style={{ background: SWATCHES[i % SWATCHES.length] }} />
              <span className={`ttlKioskCardamomCatLabel ${isActive ? "ttlKioskCardamomCatActive" : ""}`}>{cat.name}</span>
            </button>
          );
        })}
      </div>

      <button onClick={onHome} className="ttlKioskCardamomHomeBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11.5L12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Home</span>
      </button>
    </div>
  );
}
