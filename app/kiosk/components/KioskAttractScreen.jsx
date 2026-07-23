"use client";
import { Hand } from "lucide-react";

const FALLBACK_BG =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80";

const KioskAttractScreen = ({ business, onStart }) => {
  const bgImage = business?.cover || FALLBACK_BG;
  const name = business?.businessName || "TableTop Leo";

  return (
    <div className="k-attract" onClick={onStart} role="button" aria-label="Tap to start your order">
      <div className="k-attract-bg" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="k-attract-scrim" />
      <div className="k-attract-content">
        <div className="k-attract-logo">
          {business?.logoUrl ? (
            <img src={business.logoUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            name[0]
          )}
        </div>
        <div className="k-attract-title">Welcome to<br />{name}</div>
        <div className="k-attract-sub">
          Tap anywhere on the screen to browse the menu and place your order.
        </div>
        <button className="k-attract-cta" onClick={onStart}>
          <Hand size={26} /> Tap to Order
        </button>
        <div className="k-attract-hint">Self-service kiosk · Fast &amp; contactless ordering</div>
      </div>
    </div>
  );
};

export default KioskAttractScreen;
