"use client";

import { useState } from "react";
import { X, Mail, MailCheck, Send, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6163";

const CustomerEmailInvoicePopup = ({ onClose, orderNumber, orderId }) => {
  const [email,   setEmail]   = useState("");
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const isValid = EMAIL_RE.test(email.trim());

  const handleSend = async () => {
    setTouched(true);
    if (!isValid) return;
    if (!orderId) { setError("Order ID not found. Please try downloading the invoice instead."); return; }

    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/customer/order/${orderId}/invoice/send-email`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.data?.emailSent === true) {
        setSent(true);
      } else if (res.ok && data.data?.emailSent === false) {
        setError("Email saved but invoice not sent yet. Please wait a moment and try again.");
      } else {
        setError(data.message || "Failed to send invoice. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        backdropFilter: "blur(2px)", animation: "eiFadeIn 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 22, width: "100%", maxWidth: 400,
          maxHeight: "90vh", overflowY: "auto", position: "relative",
          animation: "eiPopIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12, width: 30, height: 30,
            borderRadius: "50%", background: "#F3F4F6", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#6B7280", zIndex: 5,
          }}
        >
          <X size={16} />
        </button>

        {sent ? (
          <div style={{
            padding: "48px 24px 44px", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 14, textAlign: "center",
            animation: "eiFadeIn 0.25s ease",
          }}>
            <div style={{
              width: 84, height: 84, borderRadius: "50%",
              background: "linear-gradient(135deg, #ECFDF5, #DCFCE7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "eiPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              <CheckCircle2 size={44} color="#16a34a" strokeWidth={2} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1008" }}>
              Bill Sent Successfully! ✅
            </div>
            <div style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.6, maxWidth: 270 }}>
              We've emailed the invoice to <strong style={{ color: "#1a1008" }}>{email}</strong>. Please check your inbox (and spam folder, just in case).
            </div>
            <button
              onClick={onClose}
              style={{ marginTop: 8, padding: "10px 28px", borderRadius: 12, border: "none", background: "#16a34a", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        ) : (
          <div style={{ padding: "28px 20px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>

            {/* icon */}
            <div style={{
              width: 84, height: 84, borderRadius: "50%", background: "#EAF7EC",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              <Mail size={34} color="#16a34a" strokeWidth={1.8} />
              <div style={{
                position: "absolute", bottom: 14, right: 14, width: 20, height: 20, borderRadius: "50%",
                background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #fff",
              }}>
                <CheckCircle2 size={12} color="#fff" strokeWidth={3} fill="#16a34a" />
              </div>
            </div>

            {/* heading */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1008", marginBottom: 6 }}>
                Order Confirmed! 🎉
              </div>
              <div style={{ fontSize: 13.5, color: "#6b7280" }}>
                {orderNumber ? `Order #${orderNumber} placed successfully.` : "Your order has been placed successfully."}
              </div>
            </div>

            <div style={{ width: "100%", borderTop: "1px solid #eee", margin: "2px 0" }} />

            {/* send invoice row */}
            <div style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: "#FDECE3", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MailCheck size={19} color="#F2701D" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "#1a1008" }}>
                  Send invoice to your email
                </div>
                <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 2 }}>
                  Enter your email and we'll send the invoice instantly.
                </div>
              </div>
            </div>

            {/* email input */}
            <div style={{ width: "100%" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", boxSizing: "border-box",
                border: touched && !isValid ? "1.5px solid #ef4444" : "1.5px solid #F5D9C2",
                borderRadius: 14, padding: "12px 14px", background: "#fff",
              }}>
                <Mail size={16} color="#9CA3AF" strokeWidth={2} style={{ flexShrink: 0 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onBlur={() => setTouched(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Enter your email address"
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: "#1a1008", background: "transparent" }}
                />
              </div>
              {touched && !isValid && !error && (
                <span style={{ fontSize: 11.5, color: "#ef4444", marginTop: 5, display: "block" }}>
                  Please enter a valid email address.
                </span>
              )}
              {error && (
                <span style={{ fontSize: 11.5, color: "#ef4444", marginTop: 5, display: "block" }}>
                  {error}
                </span>
              )}
            </div>

            {/* send button */}
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 0", borderRadius: 14, border: "none",
                cursor: sending ? "default" : "pointer",
                background: "linear-gradient(135deg, #F2701D, #F0A500)",
                color: "#fff", fontSize: 15, fontWeight: 800,
                boxShadow: "0 6px 16px rgba(242,112,29,0.32)",
                opacity: sending ? 0.85 : 1,
              }}
            >
              {sending ? <><Loader2 size={16} style={{ animation: "spin .7s linear infinite" }} /> Sending...</> : <><Send size={16} /> Send Invoice</>}
            </button>

            {/* skip */}
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "4px 0" }}
            >
              Skip for now
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#6b7280" }}>
              <ShieldCheck size={14} color="#16a34a" /> Your email is safe with us.
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes eiFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes eiPopIn  { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes spin     { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CustomerEmailInvoicePopup;