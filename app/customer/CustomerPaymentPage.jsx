"use client";
import { ArrowLeft, CreditCard } from "lucide-react";
import { FaGooglePay, FaPaypal, FaStripe, FaCcVisa } from "react-icons/fa";
import { SiPhonepe, SiRazorpay, SiPatreon } from "react-icons/si";
import QRCode from "react-qr-code";

const METHODS = [
  { id: "upi",      name: "UPI",      sub: "Pay using any UPI app",          icon: "📱" },
  { id: "razorpay", name: "Razorpay", sub: "Cards, UPI, Net Banking",        icon: "💳" },
  { id: "stripe",   name: "Stripe",   sub: "Cards, Wallets, UPI",            icon: "⚡" },
  { id: "paypal",   name: "PayPal",   sub: "Pay with PayPal",                icon: "🅿️" },
];

const CustomerPaymentPage = ({ total, orderId, business, method, onMethodSelect, onBack, onPay }) => {
  const upiUrl = `upi://pay?pa=brewbeans@oksbi&pn=${encodeURIComponent(business.name)}&am=${total}&cu=INR&tn=Order%23${orderId}`;

  return (
    <div className="cw-screen">
      <div className="cx-topbar">
        <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20} /></button>
        <span className="cx-topbar-title">Payment</span>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ flex: 1, overflow: "auto", paddingBottom: 16 }}>
        <div className="cx-section">
          <div className="order-summary-box">
            <div className="osb-title">Order Summary</div>
            <div className="osb-row"><span className="osb-label">Order ID</span><span className="osb-value">{orderId}</span></div>
            <div className="osb-row"><span className="osb-label">Business</span><span className="osb-value">{business.name}</span></div>
            <div className="osb-row"><span className="osb-label">Amount</span><span className="osb-amount">₹{total}</span></div>
          </div>
        </div>

        <div className="cx-section" style={{ paddingTop: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>Select Payment Method</div>
          {METHODS.map(m => (
            <div key={m.id} className={`pay-method ${method === m.id ? "selected" : ""}`} onClick={() => onMethodSelect(m.id)}>
              <div className="pay-method-radio">
                {method === m.id && <div className="pay-method-radio-dot" />}
              </div>
              <div className="pay-method-icon">{m.icon}</div>
              <div className="pay-method-info">
                <div className="pay-method-name">{m.name}</div>
                <div className="pay-method-sub">{m.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {method === "upi" && (
          <div style={{ animation: "fadeIn 0.22s ease" }}>
            <div style={{ padding: "0 16px 8px", fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>Scan & Pay</div>
            <div className="upi-qr-box">
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Pay to <strong style={{ color: "var(--text-primary)" }}>{business.name}</strong></div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Amount</div>
              <div className="upi-amount">₹{total}</div>
              <div style={{ background: "#fff", padding: 12, borderRadius: 12, border: "1.5px solid var(--border)" }}>
                <QRCode value={upiUrl} size={140} fgColor="#7B3F00" />
              </div>
              <div className="upi-id-row">UPI ID: brewbeans@oksbi</div>
              <div className="upi-apps">
                {[
                  { label: "Google Pay", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" },
                  { label: "PhonePe",   img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.png/512px-PhonePe_Logo.png" },
                  { label: "Paytm",     img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png" },
                  { label: "BHIM",      img: "https://upload.wikimedia.org/wikipedia/en/thumb/4/44/BHIM_logo.svg/512px-BHIM_logo.svg.png" },
                ].map(app => (
                  <div key={app.label} className="upi-app">
                    <img src={app.img} alt={app.label} style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 8, background: "#fff", border: "1px solid var(--border)", padding: 2 }} onError={e => { e.target.style.display = "none"; }} />
                    <span>{app.label}</span>
                  </div>
                ))}
              </div>
              <div className="upi-hint">Scan using any UPI App to make the payment</div>
            </div>
          </div>
        )}

        {method === "razorpay" && (
          <div style={{ margin: "0 16px", animation: "fadeIn 0.22s ease" }}>
            <div style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💳</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Pay with Razorpay</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>Secure payment — Cards, Net Banking, UPI & Wallets</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--brand)" }}>₹{total}</div>
            </div>
          </div>
        )}

        {method === "stripe" && (
          <div style={{ margin: "0 16px", animation: "fadeIn 0.22s ease" }}>
            <div style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Pay with Stripe</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>Visa, Mastercard, Apple Pay, Google Pay & more</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--brand)" }}>₹{total}</div>
            </div>
          </div>
        )}

        {method === "paypal" && (
          <div style={{ margin: "0 16px", animation: "fadeIn 0.22s ease" }}>
            <div style={{ background: "#e8f4fd", border: "1.5px solid #b3d7f5", borderRadius: "var(--radius-lg)", padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🅿️</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#003087", marginBottom: 6 }}>Pay with PayPal</div>
              <div style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>Fast, safe and secure — available in 200+ markets</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#003087" }}>₹{total}</div>
            </div>
          </div>
        )}
      </div>

      <div className="cx-sticky-bottom">
        <button className="cta-btn" disabled={!method} onClick={onPay} style={{ opacity: method ? 1 : 0.5 }}>
          {method ? `Pay Now — ₹${total}` : "Select a Payment Method"}
        </button>
      </div>
    </div>
  );
};

export default CustomerPaymentPage;
