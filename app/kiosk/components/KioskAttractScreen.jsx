"use client";
import { Hand, Sparkles } from "lucide-react";

// Per-business-type fallback hero photo when no cover image is uploaded —
// mirrors the same type→image mapping used on the mobile landing page,
// so every business gets a relevant, on-brand kiosk landing screen.
const HERO_BY_TYPE = {
  "Restaurant":   "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80",
  "Cafe":         "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80",
  "Coffee":       "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80",
  "Coffee Shop":  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80",
  "Bakery":       "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80",
  "Fast Food":    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80",
  "Pizza":        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&q=80",
  "Burger":       "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80",
  "Juice Bar":    "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=900&q=80",
  "Ice Cream":    "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=900&q=80",
  "Dessert":      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=900&q=80",
  "Healthy":      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80",
  "default":      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80",
};

function getHeroImage(business) {
  if (business?.cover) return business.cover;
  const type = business?.businessType || business?.type || "";
  if (HERO_BY_TYPE[type]) return HERO_BY_TYPE[type];
  const key = Object.keys(HERO_BY_TYPE).find(
    (k) => type.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(type.toLowerCase())
  );
  return HERO_BY_TYPE[key] || HERO_BY_TYPE.default;
}

const KioskAttractScreen = ({ business, onStart }) => {
  const name = business?.businessName || "TableTop Leo";
  const heroImg = getHeroImage(business);

  return (
    <div className="k-attract" onClick={onStart} role="button" aria-label="Tap to start your order">
      <div className="k-blobs">
        <div className="k-blob k-blob-1" />
        <div className="k-blob k-blob-2" />
        <div className="k-blob k-blob-3" />
        <div className="k-blob k-blob-4" />
      </div>

      <img className="k-attract-hero-img" src={heroImg} alt={name} onError={(e) => { e.target.style.display = "none"; }} />

      <div className="k-attract-content">
        <div className="k-attract-logo">
          {business?.logoUrl ? (
            <img src={business.logoUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            name[0]
          )}
        </div>

        <div className="k-attract-kicker"><Sparkles size={14} /> Welcome to {name}</div>

        <div className="k-attract-title">What would you<br />like to eat today?</div>
        <div className="k-attract-sub">
          Browse our full menu, customize your order, and pay right here — fast, fresh, and contactless.
        </div>

        <button className="k-attract-cta" onClick={onStart}>
          <Hand size={24} /> Tap to Start Ordering
        </button>
        <div className="k-attract-hint">Self-service kiosk · Ready when you are</div>
      </div>
    </div>
  );
};

export default KioskAttractScreen;
