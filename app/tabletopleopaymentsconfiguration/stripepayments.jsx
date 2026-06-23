import { useState } from "react";

/* ─────────────────────────────────────────────────────────
   STRIPE COMPONENT
───────────────────────────────────────────────────────── */
function StripePayments({ onBack }) {
  const [env, setEnv] = useState("test");
  const [pubKey, setPubKey] = useState("");
  const [secKey, setSecKey] = useState("");
  const [webhookKey, setWebhookKey] = useState("");
  const [showSec, setShowSec] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const STRIPE_OPTS = [
    { id: "cards", label: "Cards", sub: "Visa, Mastercard, Amex", logos: ["VISA", "MC", "AMEX"] },
    { id: "upi", label: "UPI", sub: "Google Pay, PhonePe, Paytm" },
    { id: "wallets", label: "Wallets", sub: "Apple Pay, Google Pay" },
    { id: "netbanking", label: "Net Banking", sub: "All major banks in India" },
    { id: "intl", label: "International Cards", sub: "Global credit & debit cards" },
    { id: "bnpl", label: "Buy Now, Pay Later", sub: "Klarna, Afterpay & more" },
  ];
  const [enabledOpts, setEnabledOpts] = useState(["cards", "upi", "wallets", "netbanking", "intl", "bnpl"]);
  const toggleOpt = (id) => setEnabledOpts((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const validate = () => {
    const e = {};
    if (!pubKey.trim()) e.pubKey = "Publishable key is required.";
    else if (!pubKey.startsWith("pk_")) e.pubKey = "Should start with 'pk_test_' or 'pk_live_'.";
    if (!secKey.trim()) e.secKey = "Secret key is required.";
    else if (!secKey.startsWith("sk_")) e.secKey = "Should start with 'sk_test_' or 'sk_live_'.";
    if (!webhookKey.trim()) e.webhookKey = "Webhook signing secret is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleVerify = () => {
    if (!validate()) return;
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setVerified(true); }, 1500);
  };

  const handleGenerateQR = () => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent("https://buy.stripe.com/brewbeanscafe")}`;
    setQrUrl(url); setQrGenerated(true);
  };

  return (
    <div className="sp-root">
      <button className="sp-back-btn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Back to Payment Methods
      </button>

      <div className="sp-header">
        <div className="sp-header-icon sp-header-icon--stripe">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#F0EEFF" />
            <rect x="10" y="10" width="28" height="28" rx="6" fill="#635BFF" />
            <path d="M22 19c0-1.1.9-1.8 2.2-1.8 1.9 0 3.8.7 5.1 1.9l1.7-3.3C29.5 14.6 27 14 24.2 14 20.1 14 17 16.3 17 20c0 6.2 8.5 5.2 8.5 8 0 1.3-1.1 2-2.7 2-2.3 0-4.4-.9-5.9-2.3l-1.9 3.2C16.8 32.6 19.8 34 23 34c4.3 0 7.5-2.1 7.5-6 0-6.5-8.5-5.3-8.5-9z" fill="white" />
          </svg>
        </div>
        <div>
          <div className="sp-header-title">Stripe Payment Setup <span className="sp-badge sp-badge--stripe">Recommended</span></div>
          <div className="sp-header-sub">Accept global payments using Cards, Wallets, UPI &amp; more via Stripe</div>
        </div>
      </div>

      <div className="sp-body">
        <div className="sp-main">
          {/* Step 1 */}
          <div className="sp-section">
            <div className="sp-step-label"><span className="sp-step-num">1</span>Connect Your Stripe Account</div>
            <p className="sp-step-desc">Enter your Stripe API keys to start accepting payments.</p>

            <div className="sp-env-toggle">
              <button className={`sp-env-btn ${env === "test" ? "sp-env-btn--active" : ""}`} onClick={() => setEnv("test")}>Test Mode</button>
              <button className={`sp-env-btn ${env === "live" ? "sp-env-btn--active" : ""}`} onClick={() => setEnv("live")}>Live Mode</button>
            </div>

            {[
              { key: "pubKey", label: "Publishable Key", val: pubKey, set: setPubKey, ph: env === "test" ? "pk_test_51N..." : "pk_live_51N...", type: "text" },
              { key: "secKey", label: "Secret Key", val: secKey, set: setSecKey, ph: env === "test" ? "sk_test_51N..." : "sk_live_51N...", type: showSec ? "text" : "password", eye: true },
              { key: "webhookKey", label: "Webhook Signing Secret", val: webhookKey, set: setWebhookKey, ph: "whsec_51N...", type: "text" },
            ].map((f) => (
              <div key={f.key} className="sp-field" style={{ marginTop: 14 }}>
                <label className="sp-label">{f.label} <span className="sp-req">*</span></label>
                <div className="sp-input-wrap">
                  <input
                    className={`sp-input ${errors[f.key] ? "sp-input--error" : f.val && !errors[f.key] ? "sp-input--valid" : ""}`}
                    type={f.type}
                    placeholder={f.ph}
                    value={f.val}
                    onChange={(e) => { f.set(e.target.value); setErrors((p) => ({ ...p, [f.key]: "" })); setVerified(false); }}
                  />
                  {f.eye && (
                    <button className="sp-toggle-eye" onClick={() => setShowSec(!showSec)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /></svg>
                    </button>
                  )}
                </div>
                {errors[f.key] && <div className="sp-error-msg">{errors[f.key]}</div>}
              </div>
            ))}

            <div className="sp-hint-link">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" stroke="#3b82f6" strokeWidth="1.2" /><path d="M7 4v3M7 9v.5" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" /></svg>
              How to get your keys? Go to your Stripe Dashboard → Developers → API Keys
              <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" className="sp-ext-link">Open Stripe Dashboard ↗</a>
            </div>

            <div className="sp-verify-row">
              <button className="sp-btn-primary" onClick={handleVerify} disabled={verifying}>
                {verifying ? "Verifying..." : "Verify & Save Keys"}
              </button>
              {verified && (
                <div className="sp-verified-badge">
                  <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Connection Successful! Your Stripe account has been verified.
                </div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          {verified && (
            <div className="sp-section">
              <div className="sp-step-label"><span className="sp-step-num">2</span>Business &amp; Settlement Details</div>
              <div className="sp-details-grid">
                {[
                  ["Business Name", "Brew & Beans Cafe"],
                  ["Currency", "INR (Indian Rupee)"],
                  ["Business Email", "owner@brewbeans.com"],
                  ["Payout Schedule", "Automatic Daily Payouts"],
                  ["Country", "India"],
                  ["Stripe Account Status", "Active"],
                ].map(([k, v]) => (
                  <div key={k} className="sp-detail-item">
                    <div className="sp-detail-label">{k}</div>
                    <div className={`sp-detail-value ${k === "Stripe Account Status" ? "sp-status-active" : ""}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {verified && (
            <div className="sp-section">
              <div className="sp-step-label"><span className="sp-step-num">3</span>Payment Methods You'll Accept</div>
              <div className="sp-opts-grid">
                {STRIPE_OPTS.map((opt) => (
                  <label key={opt.id} className={`sp-opt-card ${enabledOpts.includes(opt.id) ? "sp-opt-card--on" : ""}`}>
                    <input type="checkbox" checked={enabledOpts.includes(opt.id)} onChange={() => toggleOpt(opt.id)} style={{ display: "none" }} />
                    <div className="sp-opt-check">
                      {enabledOpts.includes(opt.id)
                        ? <svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="3" fill="#635BFF" /><path d="M3.5 7l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="3" fill="none" stroke="#cbd5e1" strokeWidth="1.5" /></svg>
                      }
                    </div>
                    <div>
                      <div className="sp-opt-label">{opt.label}</div>
                      <div className="sp-opt-sub">{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {verified && (
            <div className="sp-section">
              <div className="sp-step-label"><span className="sp-step-num">4</span>Payment Link / QR Code <span className="sp-optional">(Optional)</span></div>
              {!qrGenerated
                ? <button className="sp-btn-primary" onClick={handleGenerateQR}>Generate Payment QR</button>
                : (
                  <div className="sp-qr-area">
                    <div className="sp-qr-card">
                      <div className="sp-qr-merchant">Brew &amp; Beans Cafe</div>
                      <div className="sp-qr-sub">Scan &amp; Pay with any UPI or Card</div>
                      <img src={qrUrl} alt="Stripe QR" className="sp-qr-img" />
                    </div>
                    <div className="sp-qr-btns">
                      <button className="sp-btn-outline" onClick={() => { const a = document.createElement("a"); a.href = qrUrl; a.download = "stripe-qr.png"; a.click(); }}>Download QR</button>
                      <button className="sp-btn-ghost" onClick={() => setQrGenerated(false)}>Regenerate</button>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Terms */}
          <div className="sp-section sp-section--terms">
            <div className="sp-terms-title">Terms &amp; Conditions</div>
            <ol className="sp-terms-list">
              <li>You must have a valid Stripe account to use this service.</li>
              <li>All transactions are processed securely through Stripe.</li>
              <li>TableTop Leo does not store any card or bank details.</li>
              <li>Stripe payouts are subject to their settlement cycle and policies.</li>
              <li>You are responsible for complying with local tax regulations.</li>
              <li>Chargeback and refund policies are handled by Stripe.</li>
              <li>International transactions may be subject to additional fees.</li>
            </ol>
            <label className="sp-agree"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /><span>I agree to the Terms &amp; Conditions</span></label>
          </div>

          {/* Pros/Cons */}
          <div className="sp-info-row">
            <div className="sp-info-card sp-info-card--pros">
              <div className="sp-info-title"><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#16a34a" /><path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>Pros</div>
              <ul><li>Global payment acceptance</li><li>Multiple payment methods</li><li>Strong fraud protection</li><li>Recurring payments support</li><li>Automatic payouts</li></ul>
            </div>
            <div className="sp-info-card sp-info-card--cons">
              <div className="sp-info-title"><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#dc2626" /><path d="M5 5l4 4M9 5L5 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>Cons</div>
              <ul><li>Transaction fees apply</li><li>Payout may take 1–2 days</li><li>Complex for very small businesses</li><li>Disputes &amp; chargebacks possible</li></ul>
            </div>
            <div className="sp-info-card sp-info-card--notes">
              <div className="sp-info-title"><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#f59e0b" /><path d="M7 4v3M7 9v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>Important Notes</div>
              <ul><li>Use Live Mode keys in production environment only</li><li>Keep your API keys secure</li><li>Test all payments in Test Mode before going live</li></ul>
            </div>
          </div>

          <div className="sp-footer">
            <button className="sp-btn-cancel" onClick={onBack}>Cancel</button>
            <button className={`sp-btn-activate sp-btn-activate--stripe ${!agreed || !verified ? "sp-btn-activate--disabled" : ""}`} disabled={!agreed || !verified}>
              <svg width="15" height="15" viewBox="0 0 15 15"><rect x="2" y="5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none" /><path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              Save &amp; Activate Stripe
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sp-sidebar">
          <div className="sp-sidebar-card">
            <div className="sp-sidebar-title">How Stripe Payments Work</div>
            <ol className="sp-how-list">
              <li>Customer adds items to cart</li>
              <li>Chooses Stripe at checkout</li>
              <li>Enters payment details securely</li>
              <li>Payment is processed by Stripe</li>
              <li>Funds are settled to your bank account</li>
            </ol>
          </div>
          <div className="sp-sidebar-card">
            <div className="sp-sidebar-title sp-sidebar-title--orange">Transaction Fees (India)</div>
            {[
              ["Domestic Cards", "2.00% + GST"],
              ["International Cards", "3.50% + GST"],
              ["UPI", "1.00% + GST"],
              ["Wallets", "1.00% + GST"],
              ["Net Banking", "0.90% + GST"],
              ["EMI / BNPL", "2.99% + GST"],
            ].map(([k, v]) => (
              <div key={k} className="sp-charge-row"><span>{k}</span><span className="sp-charge-val">{v}</span></div>
            ))}
            <div className="sp-charge-note">* GST additional as applicable</div>
          </div>
          <div className="sp-sidebar-card">
            <div className="sp-sidebar-title">Settlement Information</div>
            {[["Payout Time", "1–2 Business Days"], ["Payout Currency", "INR"], ["Minimum Payout", "₹1.00"], ["Payout Method", "Direct to Bank Account"]].map(([k, v]) => (
              <div key={k} className="sp-settle-row"><span className="sp-settle-key">{k}</span><span className="sp-settle-val">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAYPAL COMPONENT
───────────────────────────────────────────────────────── */
function PayPalPayments({ onBack }) {
  const [accountType, setAccountType] = useState("business");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const PP_OPTS = [
    { id: "ppbalance", label: "PayPal Balance", sub: "PayPal users can pay using their PayPal balance" },
    { id: "cards", label: "Credit / Debit Cards", sub: "Accept all major credit and debit cards" },
    { id: "paylater", label: "Pay Later", sub: "Customers can pay later with PayPal" },
    { id: "intl", label: "International Payments", sub: "Accept payments from 200+ countries and regions" },
  ];
  const [enabledOpts, setEnabledOpts] = useState(["ppbalance", "cards", "paylater", "intl"]);
  const toggleOpt = (id) => setEnabledOpts((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const validate = () => {
    const e = {};
    if (!clientId.trim()) e.clientId = "Client ID is required.";
    if (!clientSecret.trim()) e.clientSecret = "Client Secret is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleVerify = () => {
    if (!validate()) return;
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setVerified(true); }, 1500);
  };

  const handleGenerateQR = () => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent("https://www.paypal.com/paypalme/brewbeanscafe")}`;
    setQrUrl(url); setQrGenerated(true);
  };

  return (
    <div className="pp-root">
      <button className="pp-back-btn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Back to Payment Methods
      </button>

      <div className="pp-header">
        <div className="pp-header-icon">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#EEF4FF" />
            <path d="M32 16c0 4-2.5 7-7.5 7H21l-1.5 9H16l3-18h7.5C29.5 14 32 13 32 16z" fill="#003087" />
            <path d="M34 19c0 4.5-2.8 7.5-8 7.5h-3l-1.5 8.5H18l3-19h8C33 16 34 16.5 34 19z" fill="#009CDE" />
          </svg>
        </div>
        <div>
          <div className="pp-header-title">PayPal Payment Setup <span className="pp-badge">Recommended</span></div>
          <div className="pp-header-sub">Accept payments globally using PayPal, Credit Cards, and more.</div>
        </div>
      </div>

      <div className="pp-body">
        <div className="pp-main">
          {/* Step 1 */}
          <div className="pp-section">
            <div className="pp-step-label"><span className="pp-step-num">1</span>Connect Your PayPal Account</div>
            <p className="pp-step-desc">Connect your PayPal account to start accepting payments.</p>

            <div className="pp-env-toggle" style={{ marginBottom: 16 }}>
              <button className={`pp-env-btn ${accountType === "business" ? "pp-env-btn--active" : ""}`} onClick={() => setAccountType("business")}>Business Account</button>
              <button className={`pp-env-btn ${accountType === "personal" ? "pp-env-btn--active" : ""}`} onClick={() => setAccountType("personal")}>Personal Account</button>
            </div>

            <div className="pp-field">
              <label className="pp-label">Client ID <span className="pp-req">*</span></label>
              <input
                className={`pp-input ${errors.clientId ? "pp-input--error" : clientId && !errors.clientId ? "pp-input--valid" : ""}`}
                placeholder="AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
                value={clientId}
                onChange={(e) => { setClientId(e.target.value); setErrors((p) => ({ ...p, clientId: "" })); setVerified(false); }}
              />
              {errors.clientId && <div className="pp-error-msg">{errors.clientId}</div>}
            </div>

            <div className="pp-field" style={{ marginTop: 14 }}>
              <label className="pp-label">Client Secret <span className="pp-req">*</span></label>
              <div className="pp-input-wrap">
                <input
                  className={`pp-input ${errors.clientSecret ? "pp-input--error" : clientSecret && !errors.clientSecret ? "pp-input--valid" : ""}`}
                  type={showSecret ? "text" : "password"}
                  placeholder="••••••••••••••••••••••••"
                  value={clientSecret}
                  onChange={(e) => { setClientSecret(e.target.value); setErrors((p) => ({ ...p, clientSecret: "" })); setVerified(false); }}
                />
                <button className="pp-toggle-eye" onClick={() => setShowSecret(!showSecret)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /></svg>
                </button>
              </div>
              {errors.clientSecret && <div className="pp-error-msg">{errors.clientSecret}</div>}
            </div>

            <div className="pp-verify-row">
              <button className="pp-btn-primary" onClick={handleVerify} disabled={verifying}>
                {verifying ? "Verifying..." : "Verify & Save Credentials"}
              </button>
              {verified && (
                <div className="pp-verified-badge">
                  <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Connection Successful! Your PayPal account has been verified.
                </div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          {verified && (
            <div className="pp-section">
              <div className="pp-step-label"><span className="pp-step-num">2</span>Business &amp; Account Details</div>
              <div className="pp-details-grid">
                {[
                  ["Business Name", "Brew & Beans Cafe"],
                  ["Account Status", "Verified"],
                  ["Email", "payments@brewbeans.com"],
                  ["Account Type", "Business"],
                  ["Country / Region", "India"],
                  ["Currency", "INR (Indian Rupee)"],
                ].map(([k, v]) => (
                  <div key={k} className="pp-detail-item">
                    <div className="pp-detail-label">{k}</div>
                    <div className={`pp-detail-value ${k === "Account Status" ? "pp-status-active" : ""}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {verified && (
            <div className="pp-section">
              <div className="pp-step-label"><span className="pp-step-num">3</span>Payment Methods You'll Accept</div>
              <div className="pp-opts-grid">
                {PP_OPTS.map((opt) => (
                  <label key={opt.id} className={`pp-opt-card ${enabledOpts.includes(opt.id) ? "pp-opt-card--on" : ""}`}>
                    <input type="checkbox" checked={enabledOpts.includes(opt.id)} onChange={() => toggleOpt(opt.id)} style={{ display: "none" }} />
                    <div className="pp-opt-check">
                      {enabledOpts.includes(opt.id)
                        ? <svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="3" fill="#003087" /><path d="M3.5 7l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="3" fill="none" stroke="#cbd5e1" strokeWidth="1.5" /></svg>
                      }
                    </div>
                    <div>
                      <div className="pp-opt-label">{opt.label}</div>
                      <div className="pp-opt-sub">{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {verified && (
            <div className="pp-section">
              <div className="pp-step-label"><span className="pp-step-num">4</span>Payment Link / QR Code <span className="pp-optional">(Optional)</span></div>
              {!qrGenerated
                ? <button className="pp-btn-primary" onClick={handleGenerateQR}>Generate QR Code</button>
                : (
                  <div className="pp-qr-area">
                    <div className="pp-qr-card">
                      <div className="pp-qr-merchant">PayPal QR Code</div>
                      <div className="pp-qr-sub">Brew &amp; Beans Cafe</div>
                      <img src={qrUrl} alt="PayPal QR" className="pp-qr-img" />
                    </div>
                    <div className="pp-qr-btns">
                      <button className="pp-btn-outline" onClick={() => { const a = document.createElement("a"); a.href = qrUrl; a.download = "paypal-qr.png"; a.click(); }}>Download QR</button>
                      <button className="pp-btn-ghost" onClick={() => setQrGenerated(false)}>Regenerate</button>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Terms */}
          <div className="pp-section pp-section--terms">
            <div className="pp-terms-title">Terms &amp; Conditions</div>
            <ol className="pp-terms-list">
              <li>You must have a valid PayPal business account.</li>
              <li>All transactions are processed securely by PayPal.</li>
              <li>TableTop Leo does not store any card or bank details.</li>
              <li>Payouts are subject to PayPal's policies and review.</li>
              <li>Refunds and chargebacks are handled by PayPal.</li>
              <li>You are responsible for complying with local laws.</li>
              <li>International transactions may incur additional fees.</li>
            </ol>
            <label className="pp-agree"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /><span>I agree to the Terms &amp; Conditions</span></label>
          </div>

          {/* Pros/Cons */}
          <div className="pp-info-row">
            <div className="pp-info-card pp-info-card--pros">
              <div className="pp-info-title"><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#16a34a" /><path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>Pros</div>
              <ul><li>Global trust and acceptance</li><li>Supports multiple currencies</li><li>Buyer protection included</li><li>Easy integration</li><li>Fast settlements</li></ul>
            </div>
            <div className="pp-info-card pp-info-card--cons">
              <div className="pp-info-title"><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#dc2626" /><path d="M5 5l4 4M9 5L5 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>Cons</div>
              <ul><li>Higher transaction fees</li><li>Payouts may take 1–3 days</li><li>Account holds for new sellers</li><li>Currency conversion charges</li></ul>
            </div>
            <div className="pp-info-card pp-info-card--notes">
              <div className="pp-info-title"><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#f59e0b" /><path d="M7 4v3M7 9v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>Important Notes</div>
              <ul><li>Ensure your PayPal account is verified</li><li>Use Live Mode keys in production</li><li>Test all payments in Sandbox before going live</li></ul>
            </div>
          </div>

          <div className="pp-footer">
            <button className="pp-btn-cancel" onClick={onBack}>Cancel</button>
            <button className={`pp-btn-activate ${!agreed || !verified ? "pp-btn-activate--disabled" : ""}`} disabled={!agreed || !verified}>
              <svg width="15" height="15" viewBox="0 0 15 15"><rect x="2" y="5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none" /><path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              Save &amp; Activate PayPal
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="pp-sidebar">
          <div className="pp-sidebar-card">
            <div className="pp-sidebar-title">How PayPal Payments Work</div>
            <ol className="pp-how-list">
              <li>Customer adds items to cart</li>
              <li>Selects PayPal at checkout</li>
              <li>Completes payment securely on PayPal</li>
              <li>Payment is received in your PayPal account</li>
              <li>You can transfer funds to your bank</li>
            </ol>
          </div>
          <div className="pp-sidebar-card">
            <div className="pp-sidebar-title pp-sidebar-title--orange">Transaction Fees (India)</div>
            {[["Domestic Transactions", "3.50% + ₹2.00"], ["International Transactions", "4.40% + ₹2.00"], ["International Cards", "4.40% + ₹2.00"], ["Currency Conversion", "3.00%"]].map(([k, v]) => (
              <div key={k} className="pp-charge-row"><span>{k}</span><span className="pp-charge-val">{v}</span></div>
            ))}
            <div className="pp-charge-note">* GST additional as applicable</div>
          </div>
          <div className="pp-sidebar-card">
            <div className="pp-sidebar-title">Settlement Information</div>
            {[["Payout Time", "1–3 Business Days"], ["Payout Currency", "INR"], ["Minimum Payout", "₹1.00"], ["Payout Method", "Direct to Bank Account"]].map(([k, v]) => (
              <div key={k} className="pp-settle-row"><span className="pp-settle-key">{k}</span><span className="pp-settle-val">{v}</span></div>
            ))}
          </div>
          <div className="pp-sidebar-card">
            <div className="pp-sidebar-title">Supported Currencies</div>
            <div className="pp-curr-grid">
              {["INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "JPY"].map((c) => (
                <span key={c} className="pp-curr-chip">{c}</span>
              ))}
              <span className="pp-curr-chip">+ More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   WRAPPER — exported default
───────────────────────────────────────────────────────── */
export default function StripePaypalPayments({ onBack, initialTab = "stripe" }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <div>
      {tab === "stripe" ? <StripePayments onBack={onBack} /> : <PayPalPayments onBack={onBack} />}
      <style>{`
        /* ── Shared styles for both Stripe (sp-) and PayPal (pp-) ── */
        .sp-root, .pp-root {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1a1a2e; max-width: 1080px; padding: 28px 32px;
        }
        .sp-back-btn, .pp-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #3b82f6; font-size: 13px; font-weight: 500;
          padding: 0; margin-bottom: 18px;
        }
        .sp-back-btn:hover, .pp-back-btn:hover { text-decoration: underline; }
        .sp-header, .pp-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .sp-header-title, .pp-header-title { font-size: 19px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .sp-badge, .pp-badge { font-size: 10px; font-weight: 600; background: #dbeafe; color: #2563eb; border-radius: 20px; padding: 2px 9px; }
        .sp-badge--stripe { background: #ede9fe; color: #7c3aed; }
        .sp-header-sub, .pp-header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
        .sp-body, .pp-body { display: flex; gap: 24px; }
        .sp-main, .pp-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 18px; }
        .sp-sidebar, .pp-sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; }

        .sp-section, .pp-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
        .sp-section--terms, .pp-section--terms { background: #fafafa; }
        .sp-step-label, .pp-step-label { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .sp-step-num { width: 24px; height: 24px; border-radius: 50%; background: #635BFF; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .pp-step-num { width: 24px; height: 24px; border-radius: 50%; background: #003087; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .sp-optional, .pp-optional { font-size: 11px; font-weight: 400; color: #94a3b8; margin-left: 4px; }
        .sp-step-desc, .pp-step-desc { font-size: 12px; color: #64748b; margin: 0 0 16px; }

        .sp-env-toggle, .pp-env-toggle { display: flex; background: #f1f5f9; border-radius: 8px; padding: 3px; width: fit-content; margin-bottom: 16px; }
        .sp-env-btn, .pp-env-btn { padding: 6px 16px; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; background: transparent; color: #64748b; transition: all 0.15s; }
        .sp-env-btn--active { background: #fff; color: #635BFF; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .pp-env-btn--active { background: #fff; color: #003087; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

        .sp-field, .pp-field { display: flex; flex-direction: column; gap: 5px; }
        .sp-label, .pp-label { font-size: 12px; font-weight: 600; color: #374151; }
        .sp-req, .pp-req { color: #ef4444; }
        .sp-input-wrap, .pp-input-wrap { position: relative; }
        .sp-input, .pp-input {
          width: 100%; padding: 9px 40px 9px 12px; border-radius: 8px;
          border: 1.5px solid #e2e8f0; font-size: 13px;
          color: #0f172a; background: #fff;
          outline: none; transition: border-color 0.15s; box-sizing: border-box;
        }
        .sp-input:focus { border-color: #635BFF; }
        .pp-input:focus { border-color: #003087; }
        .sp-input--valid, .pp-input--valid { border-color: #16a34a; }
        .sp-input--error, .pp-input--error { border-color: #ef4444; }
        .sp-toggle-eye, .pp-toggle-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; }
        .sp-error-msg, .pp-error-msg { font-size: 11px; color: #ef4444; }
        .sp-hint-link { font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
        .sp-ext-link { color: #3b82f6; text-decoration: underline; margin-left: 6px; }

        .sp-verify-row, .pp-verify-row { display: flex; align-items: center; gap: 14px; margin-top: 16px; flex-wrap: wrap; }
        .sp-verified-badge, .pp-verified-badge { display: flex; align-items: center; gap: 7px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 9px 14px; font-size: 12px; color: #16a34a; font-weight: 500; }

        .sp-details-grid, .pp-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .sp-detail-label, .pp-detail-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .sp-detail-value, .pp-detail-value { font-size: 13px; font-weight: 600; color: #0f172a; }
        .sp-status-active, .pp-status-active { display: inline-block; background: #dcfce7; color: #16a34a; border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 600; }

        .sp-opts-grid, .pp-opts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .sp-opt-card, .pp-opt-card { display: flex; align-items: flex-start; gap: 8px; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; cursor: pointer; transition: border-color 0.15s; }
        .sp-opt-card--on { border-color: #635BFF; background: #faf5ff; }
        .pp-opt-card--on { border-color: #003087; background: #eff6ff; }
        .sp-opt-check, .pp-opt-check { margin-top: 1px; flex-shrink: 0; }
        .sp-opt-label, .pp-opt-label { font-size: 12px; font-weight: 600; color: #0f172a; }
        .sp-opt-sub, .pp-opt-sub { font-size: 11px; color: #94a3b8; margin-top: 1px; }

        .sp-qr-area, .pp-qr-area { display: flex; gap: 20px; flex-wrap: wrap; }
        .sp-qr-card, .pp-qr-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; text-align: center; }
        .sp-qr-merchant, .pp-qr-merchant { font-size: 14px; font-weight: 700; color: #0f172a; }
        .sp-qr-sub, .pp-qr-sub { font-size: 11px; color: #64748b; margin-bottom: 12px; }
        .sp-qr-img, .pp-qr-img { width: 150px; height: 150px; border-radius: 8px; display: block; margin: 0 auto; }
        .sp-qr-btns, .pp-qr-btns { display: flex; flex-direction: column; gap: 8px; padding-top: 4px; }

        .sp-terms-title, .pp-terms-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .sp-terms-list, .pp-terms-list { margin: 0 0 14px; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
        .sp-terms-list li, .pp-terms-list li { font-size: 12px; color: #475569; line-height: 1.6; }
        .sp-agree, .pp-agree { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: #334155; cursor: pointer; }
        .sp-agree input, .pp-agree input { width: 15px; height: 15px; accent-color: #635BFF; }
        .pp-agree input { accent-color: #003087; }

        .sp-info-row, .pp-info-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .sp-info-card, .pp-info-card { border-radius: 10px; padding: 14px 16px; border: 1px solid #e2e8f0; }
        .sp-info-card--pros, .pp-info-card--pros { background: #f0fdf4; border-color: #bbf7d0; }
        .sp-info-card--cons, .pp-info-card--cons { background: #fef2f2; border-color: #fecaca; }
        .sp-info-card--notes, .pp-info-card--notes { background: #fffbeb; border-color: #fde68a; }
        .sp-info-title, .pp-info-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; margin-bottom: 10px; color: #1e293b; }
        .sp-info-card ul, .pp-info-card ul { margin: 0; padding-left: 14px; display: flex; flex-direction: column; gap: 5px; }
        .sp-info-card ul li, .pp-info-card ul li { font-size: 11px; color: #475569; line-height: 1.5; }

        .sp-footer, .pp-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
        .sp-btn-cancel, .pp-btn-cancel { padding: 9px 20px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; }
        .sp-btn-primary, .pp-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #635BFF; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .pp-btn-primary { background: #003087; }
        .sp-btn-primary:hover { background: #4f46e5; }
        .pp-btn-primary:hover { background: #00256e; }
        .sp-btn-primary:disabled, .pp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .sp-btn-outline, .pp-btn-outline { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border: 1.5px solid #635BFF; background: transparent; color: #635BFF; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .pp-btn-outline { border-color: #003087; color: #003087; }
        .sp-btn-ghost, .pp-btn-ghost { padding: 8px 14px; background: none; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
        .sp-btn-activate { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #635BFF; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
        .sp-btn-activate--stripe { background: #635BFF; }
        .pp-btn-activate { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #003087; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
        .sp-btn-activate--disabled, .pp-btn-activate--disabled { opacity: 0.5; cursor: not-allowed; }

        .sp-sidebar-card, .pp-sidebar-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
        .sp-sidebar-title, .pp-sidebar-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .sp-sidebar-title--orange, .pp-sidebar-title--orange { color: #d97706; }
        .sp-how-list, .pp-how-list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 7px; }
        .sp-how-list li, .pp-how-list li { font-size: 12px; color: #475569; }
        .sp-charge-row, .pp-charge-row { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
        .sp-charge-val, .pp-charge-val { font-weight: 600; color: #374151; }
        .sp-charge-note, .pp-charge-note { font-size: 10px; color: #94a3b8; margin-top: 6px; }
        .sp-settle-row, .pp-settle-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9; }
        .sp-settle-key, .pp-settle-key { font-size: 11px; color: #94a3b8; }
        .sp-settle-val, .pp-settle-val { font-size: 11px; font-weight: 600; color: #0f172a; }
        .pp-curr-grid { display: flex; flex-wrap: wrap; gap: 5px; }
        .pp-curr-chip { background: #f1f5f9; border-radius: 20px; padding: 3px 8px; font-size: 11px; color: #475569; font-weight: 500; }

        @media (max-width: 768px) {
          .sp-body, .pp-body { flex-direction: column; }
          .sp-sidebar, .pp-sidebar { width: 100%; }
          .sp-details-grid, .pp-details-grid { grid-template-columns: 1fr; }
          .sp-opts-grid, .pp-opts-grid { grid-template-columns: 1fr 1fr; }
          .sp-info-row, .pp-info-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}