import React from "react";

export function LeoMark({ size = 36, ring = true }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-ember to-ember-deep text-ink shrink-0 ${
        ring ? "ring-2 ring-ember-light/40" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 48 48"
        width={size * 0.62}
        height={size * 0.62}
        fill="none"
        stroke="#0d0c0b"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* minimal geometric lion face monogram */}
        <path d="M24 8c-6 0-8 5-8 9 0 2 .5 3.5 1.5 5-3 .5-6 3-6 7 0 1.2.9 2 2 2 1 0 1.6-.6 2.2-1.4C17 32 20 33.5 24 33.5s7-1.5 8.3-3.9c.6.8 1.2 1.4 2.2 1.4 1.1 0 2-.8 2-2 0-4-3-6.5-6-7 1-1.5 1.5-3 1.5-5 0-4-2-9-8-9Z" />
        <circle cx="19.5" cy="19" r="1.1" fill="#0d0c0b" stroke="none" />
        <circle cx="28.5" cy="19" r="1.1" fill="#0d0c0b" stroke="none" />
        <path d="M22 23c.6.6 1.4.6 2 0" />
      </svg>
    </div>
  );
}

export default function Logo({ size = 36, stacked = false, light = false }) {
  const textColor = light ? "text-cream" : "text-charcoal";
  const subColor = light ? "text-ember-light" : "text-ember-deep";
  return (
    <div className={`flex items-center gap-2.5 ${stacked ? "flex-col text-center" : ""}`}>
      <LeoMark size={size} />
      <div className={stacked ? "" : "leading-tight"}>
        <p className={`font-display font-semibold tracking-wide ${textColor}`} style={{ fontSize: size * 0.42 }}>
          Table Top <span className={subColor}>Leo</span>
        </p>
      </div>
    </div>
  );
}
