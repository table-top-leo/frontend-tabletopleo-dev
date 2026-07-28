import React from "react";
import QRCode from "react-qr-code";

/* ---------------- UPI — real QR generated from the live payment session ---------------- */
export function UpiPanel({ paymentData, loading, upiRef, onUpiRefChange }) {
  if (loading) {
    return (
      <div className="pt-3 flex items-center justify-center py-4">
        <span className="w-5 h-5 rounded-full border-2 border-ember/30 border-t-ember animate-spin" />
      </div>
    );
  }
  if (!paymentData?.upiString) {
    return <p className="pt-3 text-[11px] text-muted">Select this method to generate a payment QR.</p>;
  }
  return (
    <div className="pt-3 flex flex-col items-center gap-2.5">
      <div className="bg-white p-3 rounded-xl border border-charcoal/10">
        <QRCode value={paymentData.upiString} size={128} fgColor="#16120d" />
      </div>
      <p className="text-[10.5px] text-muted text-center leading-snug">
        Scan with any UPI app, then enter the transaction ID below to confirm.
      </p>
      <input
        value={upiRef}
        onChange={(e) => onUpiRefChange(e.target.value)}
        placeholder="UPI transaction ID"
        className="w-full bg-white border border-charcoal/15 rounded-lg px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ember focus:ring-2 focus:ring-ember/20 text-center font-mono"
      />
    </div>
  );
}
export function isUpiValid(upiRef) {
  return !!(upiRef && upiRef.trim().length > 0);
}

/* ---------------- Card / International Card — real gateway redirect ---------------- */
export function GatewayPanel({ label, loading }) {
  return (
    <div className="pt-3 flex items-center gap-3 bg-white rounded-lg border border-charcoal/10 px-3.5 py-3">
      <div className="w-9 h-9 rounded-full bg-sand text-charcoal/60 flex items-center justify-center shrink-0">
        {loading ? (
          <span className="w-4 h-4 rounded-full border-2 border-ember/30 border-t-ember animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="4" y="10" width="16" height="10" rx="1.5" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <p className="text-xs text-muted leading-snug">
        {loading
          ? `Preparing your secure ${label} checkout…`
          : `Tap the button below to pay with ${label} in a secure checkout window.`}
      </p>
    </div>
  );
}

/* ---------------- Pay at Counter ---------------- */
export function CounterPanel() {
  return (
    <div className="pt-3 flex items-center gap-3 bg-white rounded-lg border border-charcoal/10 px-3.5 py-3">
      <div className="w-9 h-9 rounded-full bg-sand text-charcoal/60 flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 21s-7-4.4-9.5-9C1 8.5 2.8 5 6.5 5c2 0 3.3 1 5.5 3.2C14.2 6 15.5 5 17.5 5 21.2 5 23 8.5 21.5 12 19 16.6 12 21 12 21Z" />
        </svg>
      </div>
      <p className="text-xs text-muted leading-snug">
        Show this screen at the counter — a team member will collect payment there.
      </p>
    </div>
  );
}
