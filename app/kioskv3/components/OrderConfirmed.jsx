import React, { useState } from "react";
import { LeoMark } from "./Logo";
import FloatingBubbles from "./FloatingBubbles";
import Confetti from "./Confetti";
import { downloadReceipt } from "../utils/receipt";

const POINTS_MESSAGES = [
  "You're roar-some! 🦁",
  "Nice pick — that's a chef favorite",
  "Kitchen's already fired up",
];

export default function OrderConfirmed({ order, onTrack, onOpenEmail, onOpenRating, emailSent }) {
  const [showConfetti] = useState(true);
  const points = Math.max(15, Math.round(order.total));
  const fact = POINTS_MESSAGES[Math.abs(Number(order.number) || 0) % POINTS_MESSAGES.length];

  return (
    <div className="relative w-full h-full bg-ink flex flex-col items-center justify-center px-7 text-center overflow-hidden">
      <FloatingBubbles count={12} />
      {showConfetti && <Confetti count={44} />}

      <div className="relative flex flex-col items-center w-full">
        <div className="w-20 h-20 rounded-full bg-moss flex items-center justify-center text-cream mb-5 shadow-lift">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="font-display font-semibold text-cream text-2xl mb-1">Order confirmed!</h2>
        <p className="text-cream/55 text-sm mb-4 max-w-[240px]">
          {order.orderType === "dine-in"
            ? "We'll bring it straight to your table."
            : "We'll call your name when it's ready for pickup."}
        </p>

        <div className="bg-ink2 border border-white/10 rounded-2xl px-7 py-4 mb-3 w-full max-w-[260px]">
          <p className="text-[10px] text-cream/40 uppercase tracking-wide">Order number</p>
          <p className="font-display font-semibold text-3xl text-ember-light">#{order.number}</p>
        </div>

        <div className="flex items-center gap-2 text-cream/50 text-xs mb-3">
          <LeoMark size={18} ring={false} />
          {order.orderType === "dine-in" ? `Table ${order.tableNumber}` : "Takeaway"}
          <span className="text-cream/25">·</span>
          {order.guest?.name}
        </div>

        <div className="flex items-center gap-1.5 bg-ember/12 border border-ember/25 rounded-full px-3.5 py-1.5 mb-7">
          <span className="text-sm">🎉</span>
          <span className="text-[11px] font-semibold text-ember-light">
            +{points} Leo Points earned — {fact}
          </span>
        </div>

        <button
          onClick={onTrack}
          className="w-full max-w-[260px] rounded-full py-3.5 text-sm font-semibold bg-ember text-ink active:bg-ember-deep mb-2.5"
        >
          Track my order
        </button>

        <div className="flex items-center gap-2 w-full max-w-[260px]">
          <button
            onClick={onOpenEmail}
            className="flex-1 rounded-full py-2.5 text-xs font-semibold border border-white/15 text-cream/75 active:bg-white/5 flex items-center justify-center gap-1.5"
          >
            {emailSent ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5c7a52" strokeWidth="3">
                  <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Emailed
              </>
            ) : (
              "Email invoice"
            )}
          </button>
          <button
            onClick={() => downloadReceipt(order)}
            className="flex-1 rounded-full py-2.5 text-xs font-semibold border border-white/15 text-cream/75 active:bg-white/5"
          >
            Download bill
          </button>
        </div>

        <button
          onClick={onOpenRating}
          className="mt-3 text-[11px] text-cream/40 underline underline-offset-2"
        >
          Rate your experience
        </button>
      </div>
    </div>
  );
}
