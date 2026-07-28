import React from "react";
import Logo from "./Logo";
import FloatingBubbles from "./FloatingBubbles";

const ORDER_TYPES = [
  { id: "dine-in", icon: "table", label: "Dine In", tagline: "We'll bring it to your table" },
  { id: "takeaway", icon: "bag", label: "Takeaway", tagline: "Grab it and go" },
];

const ICONS = {
  table: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 8h18M3 8l1.5 11h15L21 8M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  bag: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function OrderTypeScreen({ onSelect, onBack }) {
  return (
    <div className="relative w-full h-full bg-ink flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(224,151,63,0.16),transparent_55%)]" />
      <FloatingBubbles count={10} />

      <button
        onClick={onBack}
        className="absolute top-5 left-5 text-cream/50 text-xs flex items-center gap-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      <div className="relative flex flex-col items-center w-full">
        <Logo size={40} light stacked />

        <h2 className="font-display font-semibold text-cream text-2xl mt-8 mb-1 text-center">
          How would you like
          <br /> to enjoy today?
        </h2>
        <p className="text-cream/50 text-xs mb-8">Choose one to continue</p>

        <div className="w-full flex flex-col gap-3.5 max-w-sm">
          {ORDER_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className="group relative flex items-center gap-4 bg-ink2 border border-white/10 rounded-2xl px-5 py-4 text-left active:scale-[0.98] transition-transform overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-active:opacity-100 bg-gradient-to-r from-ember/15 to-transparent transition-opacity" />
              <div className="relative w-14 h-14 rounded-xl bg-ember/15 text-ember-light flex items-center justify-center shrink-0">
                {ICONS[type.icon]}
              </div>
              <div className="relative flex-1">
                <p className="text-cream font-display font-semibold text-lg">{type.label}</p>
                <p className="text-cream/45 text-xs mt-0.5">{type.tagline}</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="relative text-cream/30">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
