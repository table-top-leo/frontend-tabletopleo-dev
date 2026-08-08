import { useState, useEffect } from "react";
import UPIPayments from "../tabletopleopaymentsconfiguration/upipayments";
import RazorPayPayments from "../tabletopleopaymentsconfiguration/razorpaypayments";
import StripePaypalPayments from "../tabletopleopaymentsconfiguration/stripepayments";
import MobilePayPayments from "../tabletopleopaymentsconfiguration/mobilepaypayments";
import { SiRazorpay, SiStripe } from "react-icons/si";

const PAYMENT_METHODS = [
  {
    id: "upi",
    name: "UPI Payments",
    desc: "Direct bank transfer via UPI",
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#FFF3EA" />
        <path d="M24 8L36 16V32L24 40L12 32V16L24 8Z" fill="#ED752E" opacity="0.12" />
        <path d="M18 20L24 14L30 20V30L24 34L18 30V20Z" fill="#ED752E" />
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
      <div style={{ width: 32, height: 32, borderRadius: 7, background: "#EAF3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SiRazorpay size={17} color="#0C2451" />
      </div>
    ),
    features: ["Cards, UPI, Net Banking", "Wallets & EMI", "Secure & Reliable"],
    badge: "Recommended",
  },
  {
    id: "stripe",
    name: "Stripe",
    desc: "Accept global payments in 135+ currencies",
    icon: (
      <div style={{ width: 32, height: 32, borderRadius: 7, background: "#F0EEFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SiStripe size={18} color="#635BFF" />
      </div>
    ),
    features: ["Cards, Apple Pay", "Google Pay, Link", "Global payment support"],
    badge: "International",
  },
  {
    id: "mobilepay",
    name: "Mobile Pay",
    desc: "Tap-to-pay checkout via Apple Pay & Google Pay",
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#F5F0FF" />
        <rect x="16" y="9" width="16" height="30" rx="4" fill="#7C3AED" opacity="0.15" />
        <rect x="18" y="11" width="12" height="26" rx="2.5" fill="#7C3AED" />
        <circle cx="24" cy="33.5" r="1.6" fill="white" />
      </svg>
    ),
    features: ["Apple Pay & Google Pay", "Tap-to-pay ready", "Fast, tokenized checkout"],
    badge: "New",
  },
  // {
  //   id: "paypal",
  //   name: "PayPal",
  //   desc: "Accept payments globally via PayPal",
  //   icon: (
  //     <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
  //       <rect width="48" height="48" rx="10" fill="#F0F4FF" />
  //       <path d="M32 16c0 4-2.5 7-7.5 7H21l-1.5 9H16l3-18h7.5C29.5 14 32 13 32 16z" fill="#003087" />
  //       <path d="M34 19c0 4.5-2.8 7.5-8 7.5h-3l-1.5 8.5H18l3-19h8C33 16 34 16.5 34 19z" fill="#009CDE" />
  //     </svg>
  //   ),
  //   features: ["International payments", "Buyer protection", "Trusted worldwide"],
  //   badge: "International",
  // },
];

const PaymentSetup =() =>{
  const [activePage,         setActivePage]         = useState(null);
  const [enabledMethods,     setEnabledMethods]     = useState(["upi"]);
  const [payAtCounterSaved,  setPayAtCounterSaved]  = useState(false);
  const [payAtCounterDraft,  setPayAtCounterDraft]  = useState(false);
  const [pacInitialLoading,  setPacInitialLoading]  = useState(true);
  const [pacLoading,         setPacLoading]         = useState(false);
  const [pacMsg,             setPacMsg]             = useState("");

  // Which gateways this business's country actually allows — fetched from
  // the backend (never guessed in the frontend). null while loading, so we
  // don't flash "unavailable" on every card before we know the real answer.
  const [availableGateways, setAvailableGateways] = useState(null);
  const [countryLabel,      setCountryLabel]      = useState("");

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const token = localStorage.getItem("ttl_token");
        const res = await fetch(`http://localhost:6163/api/payment/available-methods`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.success && data?.data) {
          setAvailableGateways((data.data.availableGateways || []).map((g) => g.toLowerCase()));
          setCountryLabel(data.data.countryCode || "");
        }
      } catch {
        // If this fails, fall back to showing every card enabled rather
        // than accidentally locking a merchant out of Payment Setup.
        setAvailableGateways(["upi", "razorpay", "stripe", "mobilepay"]);
      }
    };
    loadAvailability();
  }, []);

  const payAtCounterDirty = payAtCounterDraft !== payAtCounterSaved;

  // Load the currently SAVED Pay at Counter status from the backend once,
  // on mount, so the toggle always reflects what's actually in the DB.
  useEffect(() => {
    const loadStatus = async () => {
      setPacInitialLoading(true);
      try {
        const token = localStorage.getItem("ttl_token");
        const res = await fetch(`http://localhost:6163/api/payment/pay-at-counter/my-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const current = data?.data === true;
        setPayAtCounterSaved(current);
        setPayAtCounterDraft(current);
      } catch {
        // If the status can't be loaded, default to false rather than
        // guessing — the admin can still toggle + save to set it.
        setPayAtCounterSaved(false);
        setPayAtCounterDraft(false);
      } finally {
        setPacInitialLoading(false);
      }
    };
    loadStatus();
  }, []);

  const handleSavePayAtCounter = async () => {
    setPacLoading(true);
    setPacMsg("");
    try {
      const token = localStorage.getItem("ttl_token");
      const res = await fetch(
        `http://localhost:6163/api/payment/pay-at-counter/toggle?enabled=${payAtCounterDraft}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save.");
      setPayAtCounterSaved(payAtCounterDraft);
      setPacMsg(data?.message || (payAtCounterDraft ? "Pay at Counter enabled." : "Pay at Counter disabled."));
    } catch (e) {
      setPacMsg(e.message || "Failed to update. Please try again.");
    } finally {
      setPacLoading(false);
    }
  };

  const toggleMethod = (id) => {
    setEnabledMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  if (activePage === "upi") return <UPIPayments onBack={() => setActivePage(null)} />;
  if (activePage === "razorpay") return <RazorPayPayments onBack={() => setActivePage(null)} />;
  if (activePage === "stripe") return <StripePaypalPayments onBack={() => setActivePage(null)} initialTab="stripe" />;
  if (activePage === "paypal") return <StripePaypalPayments onBack={() => setActivePage(null)} initialTab="paypal" />;
  if (activePage === "mobilepay") return <MobilePayPayments onBack={() => setActivePage(null)} />;

  return (
    <div className="ps-root">
      <div className="ps-header">
        <div>
          <h1 className="ps-title">Payment Setup</h1>
          <p className="ps-subtitle">Enable and configure the payment methods you want to accept.</p>
        </div>
      </div>

      {availableGateways && countryLabel && (
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12.5, color:"#1e40af", fontWeight:600 }}>
          ℹ️ Showing gateways available for businesses in <strong>{countryLabel}</strong>.
        </div>
      )}

      <div className="ps-section-label">
        <span className="ps-section-dot" />
        Select Payment Methods
      </div>

      <div className="ps-grid">
        {PAYMENT_METHODS.map((m) => {
          const enabled = enabledMethods.includes(m.id);
          const isAvailable = !availableGateways || availableGateways.includes(m.id);
          return (
            <div key={m.id} className={`ps-card ${enabled ? "ps-card--active" : ""}`} style={!isAvailable ? { opacity:0.45, filter:"grayscale(1)", pointerEvents:"none" } : undefined}>
              <div className="ps-card-top">
                <div className="ps-card-icon">{m.icon}</div>
                <div className="ps-card-meta">
                  <div className="ps-card-name">{m.name}</div>
                  <span className="ps-card-badge">{isAvailable ? m.badge : "Not available in your country"}</span>
                </div>
                <label className="ps-toggle">
                  <input
                    type="checkbox"
                    checked={enabled}
                    disabled={!isAvailable}
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
                onClick={() => isAvailable && setActivePage(m.id)}
                disabled={!isAvailable}
                style={!isAvailable ? { cursor:"not-allowed" } : undefined}
              >
                {isAvailable ? "Get Started" : "Unavailable"}
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

      {/* ── PAY AT COUNTER SECTION ───────────────────────────── */}
      <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"18px 20px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
              🏪
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", marginBottom:3 }}>Pay at Counter</div>
              <div style={{ fontSize:12, color:"#64748b", lineHeight:1.5 }}>
                Allow customers to place an order now and pay cash or card at the counter. No online gateway needed.
              </div>
            </div>
          </div>
          <div style={{ flexShrink:0 }}>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor: pacInitialLoading ? "default" : "pointer" }}>
              <div
                onClick={() => {
                  if (pacInitialLoading || pacLoading) return;
                  // Only stage the change locally — nothing is sent to the
                  // backend here. The DB value changes only when the admin
                  // clicks "Save" below.
                  setPayAtCounterDraft((v) => !v);
                  setPacMsg("");
                }}
                style={{
                  width:44, height:24, borderRadius:12,
                  background: payAtCounterDraft ? "#16a34a" : "#d1d5db",
                  position:"relative", cursor: pacInitialLoading ? "default" : "pointer",
                  transition:"background 0.2s",
                  flexShrink:0,
                  opacity: pacInitialLoading ? 0.6 : 1,
                }}
              >
                <div style={{
                  position:"absolute", top:3, left: payAtCounterDraft ? 22 : 2,
                  width:18, height:18, borderRadius:"50%", background:"#fff",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.2)",
                  transition:"left 0.2s",
                }}/>
              </div>
              <span style={{ fontSize:13, fontWeight:600, color: payAtCounterDraft ? "#16a34a" : "#6b7280" }}>
                {pacInitialLoading ? "Loading..." : payAtCounterDraft ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
        </div>

        {payAtCounterDirty && !pacInitialLoading && (
          <div style={{ marginTop:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:"10px 12px" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"#92400e" }}>
              You have unsaved changes to Pay at Counter. Save to apply — customers won&apos;t see this until you do.
            </span>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button
                type="button"
                onClick={() => { setPayAtCounterDraft(payAtCounterSaved); setPacMsg(""); }}
                disabled={pacLoading}
                style={{ padding:"7px 14px", borderRadius:7, border:"1.5px solid #e2e8f0", background:"#fff", color:"#475569", fontSize:12.5, fontWeight:600, cursor:"pointer" }}
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSavePayAtCounter}
                disabled={pacLoading}
                style={{ padding:"7px 16px", borderRadius:7, border:"none", background:"#16a34a", color:"#fff", fontSize:12.5, fontWeight:600, cursor: pacLoading ? "default" : "pointer", opacity: pacLoading ? 0.7 : 1 }}
              >
                {pacLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {pacMsg && (
          <div style={{ marginTop:10, fontSize:12, fontWeight:600, color: pacMsg.toLowerCase().includes("fail") ? "#dc2626" : "#16a34a", background: pacMsg.toLowerCase().includes("fail") ? "#fef2f2" : "#f0fdf4", padding:"6px 12px", borderRadius:7 }}>
            {pacMsg}
          </div>
        )}
      </div>

      <div className="ps-terms">
        <div className="ps-terms-title">Terms &amp; Conditions</div>        <ol className="ps-terms-list">
          <li>You are responsible for ensuring your payment provider accounts are active and compliant.</li>
          <li>TableTop Leo does not store or process any card or bank details directly.</li>
          <li>All transaction fees are charged by the respective payment providers.</li>
          <li>Refunds and chargebacks are governed by the policies of each payment provider.</li>
          <li>You must comply with applicable laws and regulations for accepting online payments.</li>
          <li>TableTop Leo reserves the right to disable payment methods in case of misuse.</li>
        </ol>
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