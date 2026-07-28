import React from "react";
import { LeoMark } from "./Logo";
import FloatingBubbles from "./FloatingBubbles";

export default function ProcessingScreen({ method }) {
  return (
    <div className="relative w-full h-full bg-ink flex flex-col items-center justify-center px-8 text-center overflow-hidden">
      <FloatingBubbles count={10} />
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-cream/10" />
        <div className="absolute inset-0 rounded-full border-4 border-ember border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <LeoMark size={40} ring={false} />
        </div>
      </div>
      <div className="relative">
        <h2 className="font-display font-semibold text-cream text-lg mb-1">
          Processing payment
        </h2>
        <p className="text-cream/50 text-xs">
          Please don't tap away while we confirm your {method || "payment"}...
        </p>
      </div>
    </div>
  );
}
