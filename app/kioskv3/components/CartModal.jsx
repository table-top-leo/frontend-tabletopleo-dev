import React from "react";
import { formatCurrency } from "../../utils/currencyHelper";

export default function CartModal({
  cart,
  onClose,
  onIncrement,
  onDecrement,
  onContinue,
  total,
  currencyCode,
}) {
  return (
    <div className="absolute inset-0 bg-ink/50 flex items-end z-30">
      <div className="w-full bg-cream rounded-t-3xl max-h-[82%] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-charcoal/8">
          <h3 className="font-display font-semibold text-charcoal text-base">Your order</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center text-charcoal/60"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-1.5">
          {cart.length === 0 ? (
            <p className="text-sm text-muted text-center py-10">Your cart is empty</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 border-b border-charcoal/6">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover bg-sand"
                  draggable={false}
                  onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-charcoal truncate">{item.name}</p>
                  <p className="text-xs text-muted">{formatCurrency(item.price, currencyCode)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onDecrement(item.id)}
                    className="w-7 h-7 rounded-full border border-charcoal/20 flex items-center justify-center text-charcoal/70 active:bg-charcoal/5"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-charcoal">{item.qty}</span>
                  <button
                    onClick={() => onIncrement(item.id)}
                    className="w-7 h-7 rounded-full bg-ember text-ink flex items-center justify-center active:bg-ember-deep"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-3.5 border-t border-charcoal/8">
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-muted">Total</span>
            <span className="font-bold text-charcoal">{formatCurrency(total, currencyCode)}</span>
          </div>
          <button
            onClick={onContinue}
            disabled={cart.length === 0}
            className={`w-full rounded-full py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              cart.length === 0
                ? "bg-charcoal/10 text-charcoal/30"
                : "bg-ember text-ink active:bg-ember-deep"
            }`}
          >
            Continue
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
