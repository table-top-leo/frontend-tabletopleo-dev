"use client";
import React, { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.tabletopleo.com";

export default function KioskEmailInvoiceModal({ open, orderId, orderNumber, onClose }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;
  const isValid = EMAIL_RE.test(email.trim());

  const handleSend = async () => {
    if (!isValid) { setError("Enter a valid email address"); return; }
    if (!orderId) { setError("Order ID not found. Try downloading the bill instead."); return; }
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/customer/order/${orderId}/invoice/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.data?.emailSent === true) {
        setSent(true);
      } else if (res.ok && data.data?.emailSent === false) {
        setError("Email saved but invoice not sent yet. Please try again shortly.");
      } else {
        setError(data.message || "Failed to send invoice. Please try again.");
      }
    } catch {
      setError("Network error — please check the connection.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="ttlKioskThymeOverlay">
      <div className="ttlKioskThymeCard ttlKioskPopIn">
        <div className="ttlKioskThymeTop">
          <div className={`ttlKioskThymeIconWrap ${sent ? "ttlKioskWrenDone" : ""}`}>
            {sent ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="14" rx="2.4" />
                <path d="M3.5 6.5L12 13l8.5-6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          {sent ? (
            <>
              <h3 className="ttlKioskThymeTitle">Invoice sent!</h3>
              <p className="ttlKioskThymeSub">Check {email} in a moment.</p>
            </>
          ) : (
            <>
              <h3 className="ttlKioskThymeTitle">Email your invoice?</h3>
              <p className="ttlKioskThymeSub" style={{ marginBottom: 14 }}>Order #{orderNumber || orderId} — we'll send a copy of your bill.</p>
              <input
                autoFocus
                className="ttlKioskThymeInput"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                placeholder="you@email.com"
                inputMode="email"
              />
              {error && <p className="ttlKioskThymeErr">{error}</p>}
            </>
          )}
        </div>
        {!sent && (
          <div className="ttlKioskThymeActions">
            <button onClick={onClose} className="ttlKioskThymeSkip">Not now</button>
            <button onClick={handleSend} disabled={sending} className="ttlKioskThymeSend">{sending ? "Sending…" : "Send invoice"}</button>
          </div>
        )}
        {sent && (
          <div className="ttlKioskThymeActions">
            <button onClick={onClose} className="ttlKioskThymeSend" style={{ flex: 1, borderLeft: "none" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
