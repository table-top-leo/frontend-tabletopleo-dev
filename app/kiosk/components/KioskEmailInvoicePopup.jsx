"use client";
import { useState } from "react";
import { X, Mail, Send, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6163";

const KioskEmailInvoicePopup = ({ onClose, orderId, orderNumber }) => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const isValid = EMAIL_RE.test(email.trim());

  const handleSend = async () => {
    setTouched(true);
    if (!isValid || !orderId) return;
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
      } else {
        setError(data.message || "Couldn't send the receipt. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="k-popup-overlay" onClick={onClose}>
      <div className="k-popup" onClick={(e) => e.stopPropagation()}>
        <button className="k-popup-close" onClick={onClose}><X size={20} /></button>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div className="k-popup-icon" style={{ background: "var(--k-success-bg)" }}>
              <CheckCircle2 size={48} color="var(--k-success)" />
            </div>
            <div className="k-popup-title">Receipt Sent!</div>
            <div className="k-popup-sub">We've emailed your invoice to <strong>{email}</strong>.</div>
            <button className="k-btn k-btn-primary k-btn-lg k-btn-block" style={{ marginTop: 26 }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="k-popup-icon" style={{ background: "var(--k-brand-tint)" }}>
              <Mail size={40} color="var(--k-brand)" />
            </div>
            <div className="k-popup-title">Email My Receipt</div>
            <div className="k-popup-sub">
              {orderNumber ? `Order #${orderNumber} confirmed. ` : ""}Enter your email and we'll send the invoice instantly.
            </div>

            <div style={{ marginTop: 24 }}>
              <input
                type="email"
                className="k-field-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onBlur={() => setTouched(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                style={{ borderColor: touched && !isValid ? "var(--k-danger)" : undefined }}
              />
              {touched && !isValid && <p style={{ color: "var(--k-danger)", fontSize: 13, marginTop: 6 }}>Please enter a valid email address.</p>}
              {error && <p style={{ color: "var(--k-danger)", fontSize: 13, marginTop: 6 }}>{error}</p>}
            </div>

            <button className="k-btn k-btn-primary k-btn-lg k-btn-block" style={{ marginTop: 20 }} disabled={sending} onClick={handleSend}>
              {sending ? <><Loader2 size={18} style={{ animation: "k-spin .7s linear infinite" }} /> Sending...</> : <><Send size={18} /> Send Receipt</>}
            </button>

            <button className="k-btn k-btn-ghost k-btn-block" style={{ marginTop: 10 }} onClick={onClose}>Skip for now</button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, color: "var(--k-ink-mute)", marginTop: 14 }}>
              <ShieldCheck size={14} color="var(--k-success)" /> Your email is safe with us.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KioskEmailInvoicePopup;
