import { useState } from "react";
import UPIPayments from "../tabletopleopaymentsconfiguration/upipayments";
import RazorPayPayments from "../tabletopleopaymentsconfiguration/razorpaypayments";
import StripePaypalPayments from "../tabletopleopaymentsconfiguration/stripepayments";

const PAYMENT_METHODS = [
  {
    id: "upi",
    name: "UPI Payments",
    desc: "Direct bank transfer via UPI",
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#F0F4FF" />
        <path d="M24 8L36 16V32L24 40L12 32V16L24 8Z" fill="#0066CC" opacity="0.15" />
        <path d="M18 20L24 14L30 20V30L24 34L18 30V20Z" fill="#0066CC" />
        <path d="M24 14V34M18 20L30 30M30 20L18 30" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    features: ["Direct bank transfer", "Instant settlement", "Zero platform fee"],
    badge: "Popular in India",
  },
  {
    id: "razorpay",
    name: "Razorpay",
    desc: "Cards, UPI, Net Banking, Wallets & more",
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#F0F4FF" />
        <path d="M14 34L22 14H28L32 22L26 26L30 34H24L21 28L18 34H14Z" fill="#3395FF" />
      </svg>
    ),
    features: ["Cards, UPI, Net Banking", "Wallets & EMI", "Secure & Reliable"],
    badge: "Recommended",
  },
  {
    id: "stripe",
    name: "Stripe",
    desc: "Accept global payments in 135+ currencies",
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#F0F4FF" />
        <rect x="10" y="10" width="28" height="28" rx="6" fill="#635BFF" />
        <path d="M22 19c0-1.1.9-1.8 2.2-1.8 1.9 0 3.8.7 5.1 1.9l1.7-3.3C29.5 14.6 27 14 24.2 14 20.1 14 17 16.3 17 20c0 6.2 8.5 5.2 8.5 8 0 1.3-1.1 2-2.7 2-2.3 0-4.4-.9-5.9-2.3l-1.9 3.2C16.8 32.6 19.8 34 23 34c4.3 0 7.5-2.1 7.5-6 0-6.5-8.5-5.3-8.5-9z" fill="white" />
      </svg>
    ),
    features: ["Cards, Apple Pay", "Google Pay, Link", "Global payment support"],
    badge: "International",
  },
  {
    id: "paypal",
    name: "PayPal",
    desc: "Accept payments globally via PayPal",
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#F0F4FF" />
        <path d="M32 16c0 4-2.5 7-7.5 7H21l-1.5 9H16l3-18h7.5C29.5 14 32 13 32 16z" fill="#003087" />
        <path d="M34 19c0 4.5-2.8 7.5-8 7.5h-3l-1.5 8.5H18l3-19h8C33 16 34 16.5 34 19z" fill="#009CDE" />
      </svg>
    ),
    features: ["International payments", "Buyer protection", "Trusted worldwide"],
    badge: "International",
  },
];

const PaymentSetup =() =>{
  const [activePage, setActivePage] = useState(null);
  const [enabledMethods, setEnabledMethods] = useState(["upi"]);

  const toggleMethod = (id) => {
    setEnabledMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  if (activePage === "upi") return <UPIPayments onBack={() => setActivePage(null)} />;
  if (activePage === "razorpay") return <RazorPayPayments onBack={() => setActivePage(null)} />;
  if (activePage === "stripe") return <StripePaypalPayments onBack={() => setActivePage(null)} initialTab="stripe" />;
  if (activePage === "paypal") return <StripePaypalPayments onBack={() => setActivePage(null)} initialTab="paypal" />;

  return (
    <div className="ps-root">
      <div className="ps-header">
        <div>
          <h1 className="ps-title">Payment Setup</h1>
          <p className="ps-subtitle">Enable and configure the payment methods you want to accept.</p>
        </div>
      </div>

      <div className="ps-section-label">
        <span className="ps-section-dot" />
        Select Payment Methods
      </div>

      <div className="ps-grid">
        {PAYMENT_METHODS.map((m) => {
          const enabled = enabledMethods.includes(m.id);
          return (
            <div key={m.id} className={`ps-card ${enabled ? "ps-card--active" : ""}`}>
              <div className="ps-card-top">
                <div className="ps-card-icon">{m.icon}</div>
                <div className="ps-card-meta">
                  <div className="ps-card-name">{m.name}</div>
                  <span className="ps-card-badge">{m.badge}</span>
                </div>
                <label className="ps-toggle">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleMethod(m.id)}
                  />
                  <span className="ps-toggle-track" />
                </label>
              </div>
              <p className="ps-card-desc">{m.desc}</p>
              <ul className="ps-card-features">
                {m.features.map((f) => (
                  <li key={f}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="7" fill="#E6F4EA" />
                      <path d="M4 7l2 2 4-4" stroke="#1A8A3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="ps-configure-btn"
                onClick={() => setActivePage(m.id)}
              >
                Configure
              </button>
            </div>
          );
        })}
      </div>

      {enabledMethods.length > 0 && (
        <div className="ps-summary">
          <div className="ps-summary-label">Active payment methods</div>
          <div className="ps-summary-chips">
            {enabledMethods.map((id) => {
              const m = PAYMENT_METHODS.find((x) => x.id === id);
              return (
                <span key={id} className="ps-chip">
                  {m?.icon}
                  {m?.name}
                  <button
                    className="ps-chip-remove"
                    onClick={() => toggleMethod(id)}
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="ps-terms">
        <div className="ps-terms-title">Terms &amp; Conditions</div>
        <ol className="ps-terms-list">
          <li>You are responsible for ensuring your payment provider accounts are active and compliant.</li>
          <li>TableTop Leo does not store or process any card or bank details directly.</li>
          <li>All transaction fees are charged by the respective payment providers.</li>
          <li>Refunds and chargebacks are governed by the policies of each payment provider.</li>
          <li>You must comply with applicable laws and regulations for accepting online payments.</li>
          <li>TableTop Leo reserves the right to disable payment methods in case of misuse.</li>
        </ol>
      </div>

      <div className="ps-footer">
        <button className="ps-btn-cancel">Cancel</button>
        <button className="ps-btn-save">Save Configuration &amp; Continue</button>
      </div>

      <style>{`
        .ps-root {
          padding: 32px 36px;
          max-width: 960px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1a1a2e;
        }
        .ps-header { margin-bottom: 28px; }
        .ps-title { font-size: 22px; font-weight: 700; margin: 0 0 4px; color: #0f172a; }
        .ps-subtitle { font-size: 13px; color: #64748b; margin: 0; }
        .ps-section-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: #334155;
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-bottom: 16px;
        }
        .ps-section-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #3b82f6;
        }
        .ps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }
        .ps-card {
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
          display: flex; flex-direction: column; gap: 10px;
        }
        .ps-card--active {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
        }
        .ps-card-top { display: flex; align-items: center; gap: 10px; }
        .ps-card-icon { flex-shrink: 0; }
        .ps-card-meta { flex: 1; min-width: 0; }
        .ps-card-name { font-size: 14px; font-weight: 600; color: #0f172a; }
        .ps-card-badge {
          font-size: 10px; font-weight: 600;
          background: #eff6ff; color: #2563eb;
          border-radius: 4px; padding: 1px 6px;
          display: inline-block; margin-top: 2px;
        }
        .ps-card-desc { font-size: 12px; color: #64748b; margin: 0; line-height: 1.5; }
        .ps-card-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }
        .ps-card-features li {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #475569;
        }
        .ps-configure-btn {
          margin-top: auto;
          width: 100%;
          padding: 8px 0;
          border: 1.5px solid #3b82f6;
          background: transparent;
          color: #3b82f6;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .ps-configure-btn:hover { background: #3b82f6; color: #fff; }

        /* Toggle */
        .ps-toggle { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
        .ps-toggle input { opacity: 0; width: 0; height: 0; }
        .ps-toggle-track {
          position: absolute; inset: 0;
          background: #cbd5e1; border-radius: 20px; cursor: pointer;
          transition: background 0.2s;
        }
        .ps-toggle-track::after {
          content: ''; position: absolute;
          left: 3px; top: 3px;
          width: 14px; height: 14px;
          background: #fff; border-radius: 50%;
          transition: transform 0.2s;
        }
        .ps-toggle input:checked + .ps-toggle-track { background: #3b82f6; }
        .ps-toggle input:checked + .ps-toggle-track::after { transform: translateX(16px); }

        /* Summary */
        .ps-summary {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 14px 16px;
          margin-bottom: 24px;
        }
        .ps-summary-label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
        .ps-summary-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .ps-chip {
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1px solid #dbeafe;
          border-radius: 20px; padding: 4px 10px;
          font-size: 12px; font-weight: 500; color: #1e40af;
        }
        .ps-chip svg { width: 18px; height: 18px; }
        .ps-chip-remove {
          background: none; border: none; cursor: pointer;
          color: #94a3b8; font-size: 16px; line-height: 1;
          padding: 0; margin-left: 2px;
        }
        .ps-chip-remove:hover { color: #ef4444; }

        /* Terms */
        .ps-terms {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 18px 20px;
          margin-bottom: 24px;
        }
        .ps-terms-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .ps-terms-list {
          margin: 0; padding-left: 18px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .ps-terms-list li { font-size: 12px; color: #475569; line-height: 1.6; }

        /* Footer */
        .ps-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; }
        .ps-btn-cancel {
          padding: 9px 20px; border-radius: 8px;
          border: 1.5px solid #e2e8f0; background: #fff;
          color: #475569; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .ps-btn-cancel:hover { border-color: #94a3b8; }
        .ps-btn-save {
          padding: 9px 22px; border-radius: 8px;
          background: #3b82f6; border: none;
          color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .ps-btn-save:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}
export default PaymentSetup;