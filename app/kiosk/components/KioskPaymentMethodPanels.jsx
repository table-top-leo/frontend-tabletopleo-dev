"use client";
import React from "react";
import QRCode from "react-qr-code";
import { formatCurrency } from "../../utils/currencyHelper";

const APP_ICON_URLS = {
  PhonePe: "https://img.icons8.com/color/96/000000/phone-pe.png",
  "Google Pay": "https://img.icons8.com/color/96/000000/google-pay.png",
  Paytm: "https://img.icons8.com/color/96/000000/paytm.png",
  BHIM: "https://img.icons8.com/color/96/000000/bhim.png",
};

export function KioskAppIconRow({ apps = [] }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
      {apps.map((name) => (
        <div key={name} style={{ width: 34, height: 34, borderRadius: 10, background: "#fff", border: "1px solid rgba(38,34,29,0.12)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {APP_ICON_URLS[name]
            ? <img src={APP_ICON_URLS[name]} alt={name} style={{ width: "70%", height: "70%", objectFit: "contain" }} />
            : <span style={{ fontSize: 11, fontWeight: 700, color: "var(--kiosk-muted)" }}>{name[0]}</span>}
        </div>
      ))}
    </div>
  );
}

export function KioskUpiPanel({ total, currencyCode, businessName, paymentData, upiRef, setUpiRef, confirming, onConfirm }) {
  return (
    <div className="ttlKioskKestrelSummaryBox">
      <p style={{ fontSize: 12.5, color: "var(--kiosk-muted)", margin: 0 }}>Scan to pay <strong style={{ color: "var(--kiosk-charcoal)" }}>{businessName}</strong></p>
      <p className="ttlKioskKestrelAmount">{formatCurrency(total, currencyCode)}</p>
      {paymentData?.upiString ? (
        <div className="ttlKioskKestrelQrWrap" style={{ margin: "0 auto 14px" }}>
          <QRCode value={paymentData.upiString} size={150} fgColor="#7B3F00" />
        </div>
      ) : (
        <p style={{ fontSize: 12, color: "var(--kiosk-muted)" }}>Preparing UPI request…</p>
      )}
      <KioskAppIconRow apps={["PhonePe", "Google Pay", "Paytm", "BHIM"]} />
      <div style={{ marginTop: 16, textAlign: "left" }}>
        <label className="ttlKioskTigerFieldLabel">
          Enter UPI transaction ID after payment <span className="ttlKioskTigerReq">*</span>
        </label>
        <input
          className="ttlKioskThymeField"
          value={upiRef}
          onChange={(e) => setUpiRef(e.target.value)}
          placeholder="e.g. 320876543210"
        />
      </div>
      <button
        className="ttlKioskPillBtn ttlKioskPillBtnPrimary"
        style={{ marginTop: 14 }}
        disabled={confirming || !upiRef.trim()}
        onClick={onConfirm}
      >
        {confirming ? "Verifying…" : "I've paid — confirm order"}
      </button>
    </div>
  );
}

export function KioskGatewaySummaryPanel({ label, total, currencyCode, apps, confirming, onPay }) {
  return (
    <div className="ttlKioskKestrelSummaryBox">
      <p style={{ fontSize: 12.5, color: "var(--kiosk-muted)", margin: "0 0 6px" }}>{label}</p>
      <p className="ttlKioskKestrelAmount">{formatCurrency(total, currencyCode)}</p>
      <KioskAppIconRow apps={apps} />
      <button className="ttlKioskPillBtn ttlKioskPillBtnPrimary" style={{ marginTop: 16 }} disabled={confirming} onClick={onPay}>
        {confirming ? "Processing…" : `Pay ${formatCurrency(total, currencyCode)}`}
      </button>
    </div>
  );
}

export function KioskCounterPanel() {
  return (
    <div className="ttlKioskThymeCounterRow">
      <div className="ttlKioskThymeCounterIcon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 21s-7-4.4-9.5-9C1 8.5 2.8 5 6.5 5c2 0 3.3 1 5.5 3.2C14.2 6 15.5 5 17.5 5 21.2 5 23 8.5 21.5 12 19 16.6 12 21 12 21Z" />
        </svg>
      </div>
      <p style={{ fontSize: 12, color: "var(--kiosk-muted)", lineHeight: 1.4, margin: 0 }}>
        Show this screen at the counter — a team member will collect payment there.
      </p>
    </div>
  );
}
