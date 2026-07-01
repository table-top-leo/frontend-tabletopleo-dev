"use client";
import { CheckCircle2, MapPin } from "lucide-react";

const METHOD_LABEL = { upi: "UPI", razorpay: "Razorpay", stripe: "Stripe", paypal: "PayPal" };

const CustomerOrderSuccess = ({ orderId, total, method, onTrack, onHome }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="cw-screen">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 16px", gap: 18, overflow: "auto" }}>
        <div className="success-dots">
          <div className="success-dot" />
          <div className="success-dot" />
          <div className="success-dot" />
        </div>

        <div className="success-circle">
          <CheckCircle2 size={50} color="#16a34a" fill="#dcfce7" strokeWidth={2} />
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>Order Confirmed!</div>
          <div style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 260 }}>
            Thank you! Your order has been placed successfully.
          </div>
        </div>

        <div className="success-info-box" style={{ width: "100%" }}>
          <div className="sib-row">
            <span className="sib-label">Order ID</span>
            <span className="sib-value" style={{ fontFamily: "monospace", color: "var(--brand)" }}>{orderId}</span>
          </div>
          <div className="sib-row">
            <span className="sib-label">Amount Paid</span>
            <span className="sib-value" style={{ color: "var(--brand)" }}>₹{total}</span>
          </div>
          <div className="sib-row">
            <span className="sib-label">Payment Method</span>
            <span className="sib-value">{METHOD_LABEL[method] || method || "—"}</span>
          </div>
          <div className="sib-row">
            <span className="sib-label">Date & Time</span>
            <span className="sib-value" style={{ fontSize: 12 }}>{dateStr}, {timeStr}</span>
          </div>
        </div>

        <div style={{ width: "100%" }}>
          <div className="est-time-box">
            <div className="est-time-label">Estimated Preparation Time</div>
            <div className="est-time-value">15 – 20 Minutes</div>
          </div>
        </div>
      </div>

      <div className="cx-sticky-bottom" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button className="cta-btn" onClick={onTrack}>Track Order</button>
        <button onClick={onHome} style={{ background: "none", border: "none", color: "var(--brand)", fontSize: 14, fontWeight: 700, padding: "8px 0", cursor: "pointer" }}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default CustomerOrderSuccess;
