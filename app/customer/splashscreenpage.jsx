"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useCustomerLanguage } from "../context/CustomerLanguageProvider";

// Same per-type cover fallback used on the landing page, so every
// business gets a relevant, on-brand splash screen even before
// they've uploaded a custom cover photo.
const COVER_BY_TYPE = {
  "Restaurant":        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80",
  "Cafe":              "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=80",
  "Coffee":            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=80",
  "Coffee Shop":       "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=80",
  "Bakery":            "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1000&q=80",
  "Fast Food":         "https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=1000&q=80",
  "Pizza":             "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&q=80",
  "Burger":            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1000&q=80",
  "Juice Bar":         "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=1000&q=80",
  "Ice Cream":         "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1000&q=80",
  "Dessert":           "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1000&q=80",
  "Healthy":           "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&q=80",
  "Bar":               "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1000&q=80",
  "default":           "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80",
};

function getCoverImage(business) {
  if (business?.cover) return business.cover;
  const type = business?.businessType || business?.type || "";
  if (COVER_BY_TYPE[type]) return COVER_BY_TYPE[type];
  const key = Object.keys(COVER_BY_TYPE).find(
    (k) => type.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(type.toLowerCase())
  );
  return COVER_BY_TYPE[key] || COVER_BY_TYPE["default"];
}

const CustomerSplashScreen = ({ business, onContinue }) => {
  const { t } = useCustomerLanguage();
  const [leaving, setLeaving] = useState(false);
  const touchStartY = useRef(null);
  const fired = useRef(false);

  const go = () => {
    if (fired.current) return;
    fired.current = true;
    setLeaving(true);
    setTimeout(onContinue, 260);
  };

  useEffect(() => {
    const onWheel = (e) => { if (e.deltaY !== 0) go(); };
    const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      if (touchStartY.current == null) return;
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) > 30) go();
    };
    const onKey = (e) => { if (["ArrowUp", "ArrowDown", "Enter", " "].includes(e.key)) go(); };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const name = business?.businessName || "TableTop Leo";
  const coverImg = getCoverImage(business);

  return (
    <div
      onClick={go}
      className={`relative flex flex-1 w-full flex-col items-center justify-between overflow-hidden bg-black transition-opacity duration-300 ease-out ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background photo */}
      <img
        src={coverImg}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ animation: "splashZoom 9s ease-in-out infinite alternate" }}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
      {/* Gradient scrim for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />

      {/* Center content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
        <div
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-white/95 shadow-2xl"
          style={{ animation: "splashPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}
        >
          {business?.logoUrl ? (
            <img src={business.logoUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-black" style={{ color: "var(--brand, #7B3F00)" }}>
              {name[0]}
            </span>
          )}
        </div>

        <div style={{ animation: "splashRise 0.6s ease 0.15s both" }}>
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">{name}</h1>
          {(business?.businessType || business?.type) && (
            <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              {business.businessType || business.type}
            </p>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      <div
        className="relative z-10 flex flex-col items-center gap-2 pb-10"
        style={{ animation: "splashRise 0.6s ease 0.3s both" }}
      >
        <ChevronUp className="text-white/80 animate-bounce" size={22} strokeWidth={2.5} />
        <span className="text-xs font-semibold tracking-wide text-white/70">
          {t("splash.tapToBegin")}
        </span>
      </div>

      <style>{`
        @keyframes splashZoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes splashPop  { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
        @keyframes splashRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default CustomerSplashScreen;
