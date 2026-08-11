"use client";
import React from "react";
import { formatCurrency } from "../../utils/currencyHelper";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80";

export default function KioskCartModal({ cart, subtotal, gst, total, taxEnabled, currencyCode, onClose, onIncrement, onDecrement, onRemove, onContinue }) {
  return (
    <div className="ttlKioskCloveModal">
      <div className="ttlKioskCloveSheet">
        <div className="ttlKioskCloveHeader">
          <h3>Your order</h3>
          <button onClick={onClose} className="ttlKioskCloveClose">✕</button>
        </div>

        <div className="ttlKioskCloveList ttlKioskNoScroll">
          {cart.length === 0 ? (
            <p className="ttlKioskCloveEmpty">Your cart is empty</p>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.comboGroupKey || ""}`} className="ttlKioskCloveRow">
                <img src={item.img || FALLBACK_IMG} alt={item.name} className="ttlKioskCloveThumb" draggable={false} />
                <div className="ttlKioskCloveInfo">
                  <p className="ttlKioskCloveName">{item.name}</p>
                  <p className="ttlKioskClovePrice">
                    {formatCurrency(item.price, currencyCode)}
                    {item.offerTitle && <span style={{ color: "var(--kiosk-moss)", fontWeight: 700 }}> · {item.offerTitle}</span>}
                  </p>
                </div>
                {item.comboGroupKey ? (
                  <button onClick={() => onRemove(item.id)} className="ttlKioskCloveStepBtn" aria-label="Remove">✕</button>
                ) : (
                  <div className="ttlKioskCloveStepper">
                    <button onClick={() => (item.qty > 1 ? onDecrement(item.id) : onRemove(item.id))} className="ttlKioskCloveStepBtn">−</button>
                    <span className="ttlKioskCloveQty">{item.qty}</span>
                    <button onClick={() => onIncrement(item.id)} className="ttlKioskCloveStepBtn ttlKioskCloveStepAdd">+</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="ttlKioskCloveFooter">
          <div className="ttlKioskCloveTotalRow">
            <span className="ttlKioskCloveMuted">Subtotal</span>
            <span>{formatCurrency(subtotal, currencyCode)}</span>
          </div>
          {taxEnabled && (
            <div className="ttlKioskCloveTotalRow">
              <span className="ttlKioskCloveMuted">Tax</span>
              <span>{formatCurrency(gst, currencyCode)}</span>
            </div>
          )}
          <div className="ttlKioskCloveTotalRow ttlKioskCloveGrand">
            <span>Total</span>
            <span>{formatCurrency(total, currencyCode)}</span>
          </div>
          <button onClick={onContinue} disabled={cart.length === 0} className="ttlKioskPillBtn ttlKioskPillBtnPrimary" style={{ marginTop: 4 }}>
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
