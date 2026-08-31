"use client";
import React, { useMemo } from "react";
import { Plus } from "lucide-react";
import { formatCurrency } from "../../utils/currencyHelper";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";

// Shown only when a product has no itemDescription from the backend yet —
// keeps the card layout consistent instead of leaving a blank gap, without
// inventing anything specific (ingredients, nutrition, etc.) about the item.
const FALLBACK_DESC = "Freshly prepared, made just for you.";

// Soft pink/blush floating particles — same drifting-bubble mechanism as
// the kiosk welcome screen (KioskFloatingBubbles), re-themed here in blush
// tones instead of ember, so the menu page feels alive without pulling in
// a second unrelated color family.
function MenuBackgroundArt({ count = 16 }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 8 + Math.random() * 26,
        duration: 11 + Math.random() * 12,
        delay: -(Math.random() * 16),
        drift: -34 + Math.random() * 68,
        opacity: 0.12 + Math.random() * 0.28,
      })),
    [count]
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* Soft blurred color mesh — blush, mauve, a whisper of lavender. One
          hue family, just varied in depth, so it stays calm rather than busy. */}
      <div style={{ position: "absolute", top: "-12%", left: "-8%", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,114,182,0.28), transparent 70%)", filter: "blur(70px)" }} />
      <div style={{ position: "absolute", bottom: "-16%", right: "-6%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(216,180,254,0.30), transparent 70%)", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", top: "38%", right: "18%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,207,232,0.35), transparent 70%)", filter: "blur(60px)" }} />

      {bubbles.map((b) => (
        <span
          key={b.id}
          className="ttlKioskMenuBlushBubble"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            "--bubble-drift": `${b.drift}px`,
            "--bubble-opacity": b.opacity,
          }}
        />
      ))}

      <style>{`
        @keyframes ttlKioskMenuBubbleFloat {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          8%   { opacity: var(--bubble-opacity, 0.4); }
          85%  { opacity: var(--bubble-opacity, 0.4); }
          100% { transform: translateY(-680px) translateX(var(--bubble-drift, 20px)) scale(1.15); opacity: 0; }
        }
        .ttlKioskMenuBlushBubble {
          position: absolute;
          bottom: -60px;
          border-radius: 9999px;
          background: radial-gradient(circle at 32% 28%, rgba(244,114,182,0.5), rgba(244,114,182,0.03) 70%);
          animation-name: ttlKioskMenuBubbleFloat;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default function KioskProductGrid({ categoryName, products, currencyCode, onAdd }) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100%",
        background: "linear-gradient(160deg, #fdf2f8 0%, #fbeff6 38%, #f8f0fb 100%)",
        overflow: "hidden",
      }}
    >
      <MenuBackgroundArt />

      <div className="px-8 py-6" style={{ position: "relative", zIndex: 1 }}>
        <h2 className="text-3xl font-extrabold" style={{ color: "#3b1f33", letterSpacing: "-0.01em" }}>{categoryName}</h2>
        <p className="text-sm mt-1" style={{ color: "#a8748f" }}>Freshly made, just for you.</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
            marginTop: "28px",
          }}
        >
          {products.map((p) => {
            const unavailable = p.available === false;
            return (
              <div
                key={p.id}
                style={{
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 18px 40px -16px rgba(190,24,93,0.18), 0 2px 8px rgba(190,24,93,0.06)",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                }}
              >
                <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                  <img
                    src={p.img || FALLBACK_IMG}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    style={{ opacity: unavailable ? 0.55 : 1 }}
                  />
                  {unavailable ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-1 rounded-full">Unavailable</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onAdd(p)}
                      className="absolute -bottom-4 right-3 active:scale-90 transition"
                      style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "linear-gradient(135deg, #ec4899, #d946ef)",
                        boxShadow: "0 8px 20px rgba(217,70,239,0.45)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "3px solid #fff",
                      }}
                    >
                      <Plus size={17} color="#fff" strokeWidth={3} />
                    </button>
                  )}
                </div>

                <div className="px-4 pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[16px] font-bold leading-tight" style={{ color: "#3b1f33" }}>{p.name}</h3>
                    <span className="text-[16px] font-extrabold whitespace-nowrap flex-shrink-0" style={{ color: "#d946ef" }}>
                      {formatCurrency(p.price, currencyCode)}
                    </span>
                  </div>
                  <p className="text-[13px] mt-1.5 leading-snug line-clamp-2 min-h-[2.6em]" style={{ color: "#a8748f" }}>
                    {p.desc || FALLBACK_DESC}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && (
          <p className="text-center text-sm py-16" style={{ color: "#c599b3" }}>No items in this category yet.</p>
        )}
      </div>
    </div>
  );
}