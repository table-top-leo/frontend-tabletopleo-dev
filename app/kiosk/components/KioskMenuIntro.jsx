"use client";
import React, { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { getKioskBusinessLogo, getKioskFallbackImage } from "../lib/kioskBusinessImage";

const KEYFRAMES = `
@keyframes ttlKioskBgDrift {
  0%, 100% { transform: scale(1.06) translate(0,0); }
  50% { transform: scale(1.12) translate(-1%, -1%); }
}
@keyframes ttlKioskTwinkle {
  0%, 100% { opacity: 0.15; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes ttlKioskRingPulse {
  0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.35); }
  70% { box-shadow: 0 0 0 18px rgba(255,255,255,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
}
@keyframes ttlKioskIntroIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export default function KioskMenuIntro({ business }) {
  const logo = getKioskBusinessLogo(business);
  const backdrop = getKioskFallbackImage(business);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 3 + Math.random() * 4,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2.5,
      })),
    []
  );

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <style>{KEYFRAMES}</style>

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backdrop})`, animation: "ttlKioskBgDrift 16s ease-in-out infinite" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 via-slate-900/60 to-purple-950/80" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animation: `ttlKioskTwinkle ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      <div
        className="relative flex flex-col items-center text-center px-10"
        style={{ animation: "ttlKioskIntroIn 0.5s ease-out" }}
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full" style={{ animation: "ttlKioskRingPulse 2.4s ease-out infinite" }} />
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/80 relative z-10">
            <img src={logo} alt={business?.businessName || "Business"} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-200" />
          <h2 className="text-2xl font-extrabold text-white drop-shadow">{business?.businessName || "Welcome"}</h2>
          <Sparkles size={16} className="text-purple-200" />
        </div>
        <p className="text-sm text-white/80 mt-2 max-w-xs drop-shadow">
          Pick a category from the left to start browsing the menu.
        </p>
      </div>
    </div>
  );
}