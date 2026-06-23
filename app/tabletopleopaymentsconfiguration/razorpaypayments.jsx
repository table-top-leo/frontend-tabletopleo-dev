import { useState } from "react";

const PAYMENT_OPTS = [
  { id: "cards", label: "Cards", sub: "Visa, MasterCard, RuPay" },
  { id: "upi", label: "UPI", sub: "Google Pay, PhonePe, Paytm" },
  { id: "netbanking", label: "Net Banking", sub: "All major banks" },
  { id: "wallets", label: "Wallets", sub: "Paytm, PhonePe, Amazon Pay" },
  { id: "emi", label: "EMI", sub: "Credit Card EMI" },
  { id: "intl", label: "International Cards", sub: "Visa, MasterCard, Amex" },
];

export default function RazorPayPayments({ onBack }) {
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [keyIdError, setKeyIdError] = useState("");
  const [keySecError, setKeySecError] = useState("");
  const [enabledOpts, setEnabledOpts] = useState(["cards", "upi", "netbanking", "wallets"]);
  const [agreed, setAgreed] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const toggleOpt = (id) => setEnabledOpts((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );

  const validateAndVerify = () => {
    let valid = true;
    if (!keyId.trim()) { setKeyIdError("Razorpay Key ID is required."); valid = false; } else setKeyIdError("");
    if (!keyId.startsWith("rzp_")) { setKeyIdError("Key ID should start with 'rzp_test_' or 'rzp_live_'."); valid = false; }
    if (!keySecret.trim()) { setKeySecError("Razorpay Key Secret is required."); valid = false; } else setKeySecError("");
    if (!valid) return;
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setVerified(true); }, 1500);
  };

  const handleGenerateQR = () => {
    const upiString = `upi://pay?pa=brewbeans@razorpay&pn=Brew%20%26%20Beans%20Cafe&cu=INR`;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`);
    setQrGenerated(true);
  };

  return (
    <div className="rzp-root">
      {/* Header */}
      <button className="rzp-back-btn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Payment Methods
      </button>

      <div className="rzp-header">
        <div className="rzp-header-icon">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#EEF2FF" />
            <path d="M14 34L22 14H28L32 22L26 26L30 34H24L21 28L18 34H14Z" fill="#3395FF" />
          </svg>
        </div>
        <div>
          <div className="rzp-header-title">
            Razorpay Payment Setup
            <span className="rzp-badge">Recommended</span>
          </div>
          <div className="rzp-header-sub">Accept payments using Cards, UPI, Net Banking, Wallets &amp; more via Razorpay</div>
        </div>
      </div>

      <div className="rzp-body">
        <div className="rzp-main">

          {/* Step 1 */}
          <div className="rzp-section">
            <div className="rzp-step-label">
              <span className="rzp-step-num">1</span>
              Connect Your Razorpay Account
            </div>
            <p className="rzp-step-desc">Enter your Razorpay API keys to start accepting payments.</p>

            <div className="rzp-field">
              <label className="rzp-label">Razorpay Key ID <span className="rzp-req">*</span></label>
              <input
                className={`rzp-input ${keyIdError ? "rzp-input--error" : keyId && !keyIdError ? "rzp-input--valid" : ""}`}
                placeholder="rzp_test_xxxxxxxxxxxx"
                value={keyId}
                onChange={(e) => { setKeyId(e.target.value); setKeyIdError(""); setVerified(false); }}
              />
              <div className="rzp-hint">Find this in your Razorpay Dashboard → Settings → API Keys</div>
              {keyIdError && <div className="rzp-error-msg">{keyIdError}</div>}
            </div>

            <div className="rzp-field" style={{ marginTop: 14 }}>
              <label className="rzp-label">Razorpay Key Secret <span className="rzp-req">*</span></label>
              <div className="rzp-input-wrap">
                <input
                  className={`rzp-input ${keySecError ? "rzp-input--error" : keySecret && !keySecError ? "rzp-input--valid" : ""}`}
                  type={showSecret ? "text" : "password"}
                  placeholder="••••••••••••••••••••••••"
                  value={keySecret}
                  onChange={(e) => { setKeySecret(e.target.value); setKeySecError(""); setVerified(false); }}
                />
                <button className="rzp-toggle-eye" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /><path d="M2 2l12 12" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /></svg>
                  }
                </button>
              </div>
              <div className="rzp-hint">Keep this key secret and never share it publicly.</div>
              {keySecError && <div className="rzp-error-msg">{keySecError}</div>}
            </div>

            <div className="rzp-verify-row">
              <button className="rzp-btn-primary" onClick={validateAndVerify} disabled={verifying}>
                {verifying ? "Verifying..." : "Verify & Save Keys"}
              </button>
              {verified && (
                <div className="rzp-verified-badge">
                  <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Connection Successful! Your Razorpay account has been verified.
                </div>
              )}
            </div>
          </div>

          {/* Step 2 — Account Details */}
          {verified && (
            <div className="rzp-section">
              <div className="rzp-step-label">
                <span className="rzp-step-num">2</span>
                Account Details
              </div>
              <div className="rzp-details-grid">
                <div className="rzp-detail-item">
                  <div className="rzp-detail-label">Account Name</div>
                  <div className="rzp-detail-value">Brew &amp; Beans Cafe</div>
                </div>
                <div className="rzp-detail-item">
                  <div className="rzp-detail-label">Business Type</div>
                  <div className="rzp-detail-value">Restaurant / Cafe</div>
                </div>
                <div className="rzp-detail-item">
                  <div className="rzp-detail-label">Account Email</div>
                  <div className="rzp-detail-value">owner@brewbeans.com</div>
                </div>
                <div className="rzp-detail-item">
                  <div className="rzp-detail-label">Razorpay Account Status</div>
                  <span className="rzp-status-chip">Active</span>
                </div>
                <div className="rzp-detail-item">
                  <div className="rzp-detail-label">Contact Number</div>
                  <div className="rzp-detail-value">+91 98765 43210</div>
                </div>
                <div className="rzp-detail-item">
                  <div className="rzp-detail-label">Country</div>
                  <div className="rzp-detail-value">India</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Payment Methods */}
          {verified && (
            <div className="rzp-section">
              <div className="rzp-step-label">
                <span className="rzp-step-num">3</span>
                Payment Methods You'll Accept
              </div>
              <p className="rzp-step-desc">Enable the payment methods you want to offer to your customers.</p>
              <div className="rzp-opts-grid">
                {PAYMENT_OPTS.map((opt) => (
                  <label key={opt.id} className={`rzp-opt-card ${enabledOpts.includes(opt.id) ? "rzp-opt-card--on" : ""}`}>
                    <input
                      type="checkbox"
                      checked={enabledOpts.includes(opt.id)}
                      onChange={() => toggleOpt(opt.id)}
                      style={{ display: "none" }}
                    />
                    <div className="rzp-opt-check">
                      {enabledOpts.includes(opt.id)
                        ? <svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="3" fill="#3b82f6" /><path d="M3.5 7l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="3" fill="none" stroke="#cbd5e1" strokeWidth="1.5" /></svg>
                      }
                    </div>
                    <div>
                      <div className="rzp-opt-label">{opt.label}</div>
                      <div className="rzp-opt-sub">{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — QR Code */}
          {verified && (
            <div className="rzp-section">
              <div className="rzp-step-label">
                <span className="rzp-step-num">4</span>
                Generate Payment QR <span className="rzp-optional">(Optional)</span>
              </div>
              <p className="rzp-step-desc">Generate a payment QR code to receive payments instantly.</p>
              {!qrGenerated ? (
                <button className="rzp-btn-primary" onClick={handleGenerateQR}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="9" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="1" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="10" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
                  </svg>
                  Generate QR Code
                </button>
              ) : (
                <div className="rzp-qr-area">
                  <div className="rzp-qr-card">
                    <div className="rzp-qr-merchant">Brew &amp; Beans Cafe</div>
                    <div className="rzp-qr-sub">Scan &amp; Pay with any UPI App</div>
                    <img src={qrUrl} alt="Razorpay QR" className="rzp-qr-img" />
                    <div className="rzp-qr-id">UPI ID: brewbeans@razorpay</div>
                  </div>
                  <div className="rzp-qr-btns">
                    <button className="rzp-btn-outline" onClick={() => { const a = document.createElement("a"); a.href = qrUrl; a.download = "razorpay-qr.png"; a.click(); }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                      Download QR
                    </button>
                    <button className="rzp-btn-ghost" onClick={() => setQrGenerated(false)}>Regenerate</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Terms */}
          <div className="rzp-section rzp-section--terms">
            <div className="rzp-terms-title">Terms &amp; Conditions</div>
            <ol className="rzp-terms-list">
              <li>You must have an active Razorpay account to use this service.</li>
              <li>All transactions are processed securely through Razorpay.</li>
              <li>TableTop Leo does not store any card or bank details.</li>
              <li>Settlement times are as per Razorpay's settlement cycle.</li>
              <li>Chargeback and refund policies are handled by Razorpay.</li>
              <li>You are responsible for complying with local tax regulations.</li>
              <li>Razorpay's terms and policies apply in addition to ours.</li>
            </ol>
            <label className="rzp-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I agree to the Terms &amp; Conditions</span>
            </label>
          </div>

          {/* Pros & Cons */}
          <div className="rzp-info-row">
            <div className="rzp-info-card rzp-info-card--pros">
              <div className="rzp-info-title">
                <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#16a34a" /><path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Pros
              </div>
              <ul>
                <li>Secure &amp; Trusted Payment Gateway</li>
                <li>Supports multiple payment methods</li>
                <li>Automatic fraud detection</li>
                <li>Fast settlements to your bank</li>
                <li>Excellent success rate</li>
              </ul>
            </div>
            <div className="rzp-info-card rzp-info-card--cons">
              <div className="rzp-info-title">
                <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#dc2626" /><path d="M5 5l4 4M9 5L5 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                Limitations
              </div>
              <ul>
                <li>Razorpay gateway charges are non-refundable</li>
                <li>Failed payments due to insufficient balance are not retried automatically</li>
                <li>International transactions may have additional charges</li>
              </ul>
            </div>
            <div className="rzp-info-card rzp-info-card--notes">
              <div className="rzp-info-title">
                <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#f59e0b" /><path d="M7 4v3M7 9v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                Important Notes
              </div>
              <ul>
                <li>Ensure your business details in Razorpay are correct</li>
                <li>Keep your API keys secure and never share them</li>
                <li>Test keys are for development only — use live keys for production</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="rzp-footer">
            <button className="rzp-btn-cancel" onClick={onBack}>Cancel</button>
            <button
              className={`rzp-btn-activate ${!agreed || !verified ? "rzp-btn-activate--disabled" : ""}`}
              disabled={!agreed || !verified}
            >
              <svg width="15" height="15" viewBox="0 0 15 15"><rect x="2" y="5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none" /><path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              Save &amp; Activate Razorpay
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="rzp-sidebar">
          <div className="rzp-sidebar-card">
            <div className="rzp-sidebar-title">How Payments Work</div>
            <ol className="rzp-how-list">
              <li>Customer adds items to cart</li>
              <li>Customer chooses Razorpay at checkout</li>
              <li>Customer makes payment securely</li>
              <li>Payment is received in your Razorpay account</li>
              <li>You can settle funds to your bank</li>
            </ol>
          </div>

          <div className="rzp-sidebar-card">
            <div className="rzp-sidebar-title rzp-sidebar-title--orange">Transaction Charges</div>
            {[
              ["Cards (Credit/Debit)", "2.00% + GST"],
              ["UPI", "0.00%"],
              ["Wallets", "1.50% + GST"],
              ["Net Banking", "0.90% + GST"],
              ["International Cards", "3.50% + GST"],
              ["EMI Transactions", "2.00% + GST"],
            ].map(([k, v]) => (
              <div key={k} className="rzp-charge-row">
                <span>{k}</span>
                <span className={v === "0.00%" ? "rzp-zero" : "rzp-charge-val"}>{v}</span>
              </div>
            ))}
            <div className="rzp-charge-note">* GST extra as applicable</div>
          </div>

          <div className="rzp-sidebar-card">
            <div className="rzp-sidebar-title">Supported Payment Methods</div>
            <div className="rzp-apps-grid">
              {["Visa", "Mastercard", "RuPay", "GPay", "UPI", "Paytm", "Amazon Pay", "NetBanking", "EMI", "Amex"].map((a) => (
                <span key={a} className="rzp-app-chip">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rzp-root {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1a1a2e;
          max-width: 1080px;
          padding: 28px 32px;
        }
        .rzp-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #3b82f6; font-size: 13px; font-weight: 500;
          padding: 0; margin-bottom: 18px;
        }
        .rzp-back-btn:hover { text-decoration: underline; }
        .rzp-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .rzp-header-title { font-size: 19px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .rzp-badge { font-size: 10px; font-weight: 600; background: #dbeafe; color: #2563eb; border-radius: 20px; padding: 2px 9px; }
        .rzp-header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
        .rzp-body { display: flex; gap: 24px; }
        .rzp-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 18px; }
        .rzp-sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; }

        .rzp-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
        .rzp-section--terms { background: #fafafa; }
        .rzp-step-label { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .rzp-step-num { width: 24px; height: 24px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .rzp-optional { font-size: 11px; font-weight: 400; color: #94a3b8; margin-left: 4px; }
        .rzp-step-desc { font-size: 12px; color: #64748b; margin: 0 0 16px; }

        .rzp-field { display: flex; flex-direction: column; gap: 5px; }
        .rzp-label { font-size: 12px; font-weight: 600; color: #374151; }
        .rzp-req { color: #ef4444; }
        .rzp-input-wrap { position: relative; }
        .rzp-input {
          width: 100%; padding: 9px 40px 9px 12px; border-radius: 8px;
          border: 1.5px solid #e2e8f0; font-size: 13px;
          color: #0f172a; background: #fff;
          outline: none; transition: border-color 0.15s; box-sizing: border-box;
        }
        .rzp-input:focus { border-color: #3b82f6; }
        .rzp-input--valid { border-color: #16a34a; }
        .rzp-input--error { border-color: #ef4444; }
        .rzp-toggle-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; }
        .rzp-hint { font-size: 11px; color: #94a3b8; }
        .rzp-error-msg { font-size: 11px; color: #ef4444; }

        .rzp-verify-row { display: flex; align-items: center; gap: 14px; margin-top: 16px; flex-wrap: wrap; }
        .rzp-verified-badge { display: flex; align-items: center; gap: 7px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 9px 14px; font-size: 12px; color: #16a34a; font-weight: 500; }

        .rzp-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rzp-detail-item {}
        .rzp-detail-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .rzp-detail-value { font-size: 13px; font-weight: 600; color: #0f172a; }
        .rzp-status-chip { display: inline-block; background: #dcfce7; color: #16a34a; border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 600; }

        .rzp-opts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .rzp-opt-card {
          display: flex; align-items: flex-start; gap: 8px;
          border: 1.5px solid #e2e8f0; border-radius: 8px;
          padding: 10px 12px; cursor: pointer;
          transition: border-color 0.15s;
        }
        .rzp-opt-card--on { border-color: #3b82f6; background: #eff6ff; }
        .rzp-opt-check { margin-top: 1px; flex-shrink: 0; }
        .rzp-opt-label { font-size: 12px; font-weight: 600; color: #0f172a; }
        .rzp-opt-sub { font-size: 11px; color: #94a3b8; margin-top: 1px; }

        .rzp-qr-area { display: flex; gap: 20px; flex-wrap: wrap; }
        .rzp-qr-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; text-align: center; }
        .rzp-qr-merchant { font-size: 14px; font-weight: 700; color: #0f172a; }
        .rzp-qr-sub { font-size: 11px; color: #64748b; margin-bottom: 12px; }
        .rzp-qr-img { width: 150px; height: 150px; border-radius: 8px; display: block; margin: 0 auto; }
        .rzp-qr-id { font-size: 11px; color: #94a3b8; margin-top: 8px; font-family: monospace; }
        .rzp-qr-btns { display: flex; flex-direction: column; gap: 8px; justify-content: flex-start; padding-top: 4px; }

        .rzp-terms-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .rzp-terms-list { margin: 0 0 14px; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
        .rzp-terms-list li { font-size: 12px; color: #475569; line-height: 1.6; }
        .rzp-agree { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: #334155; cursor: pointer; }
        .rzp-agree input { width: 15px; height: 15px; accent-color: #3b82f6; }

        .rzp-info-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .rzp-info-card { border-radius: 10px; padding: 14px 16px; border: 1px solid #e2e8f0; }
        .rzp-info-card--pros { background: #f0fdf4; border-color: #bbf7d0; }
        .rzp-info-card--cons { background: #fef2f2; border-color: #fecaca; }
        .rzp-info-card--notes { background: #fffbeb; border-color: #fde68a; }
        .rzp-info-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; margin-bottom: 10px; color: #1e293b; }
        .rzp-info-card ul { margin: 0; padding-left: 14px; display: flex; flex-direction: column; gap: 5px; }
        .rzp-info-card ul li { font-size: 11px; color: #475569; line-height: 1.5; }

        .rzp-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
        .rzp-btn-cancel { padding: 9px 20px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; }
        .rzp-btn-cancel:hover { border-color: #94a3b8; }
        .rzp-btn-activate { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #3b82f6; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .rzp-btn-activate:hover:not(.rzp-btn-activate--disabled) { background: #2563eb; }
        .rzp-btn-activate--disabled { opacity: 0.5; cursor: not-allowed; }

        .rzp-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #3b82f6; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .rzp-btn-primary:hover { background: #2563eb; }
        .rzp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .rzp-btn-outline { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border: 1.5px solid #3b82f6; background: transparent; color: #3b82f6; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .rzp-btn-outline:hover { background: #eff6ff; }
        .rzp-btn-ghost { padding: 8px 14px; background: none; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
        .rzp-btn-ghost:hover { border-color: #94a3b8; }

        .rzp-sidebar-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
        .rzp-sidebar-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .rzp-sidebar-title--orange { color: #d97706; }
        .rzp-how-list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 7px; }
        .rzp-how-list li { font-size: 12px; color: #475569; }
        .rzp-charge-row { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
        .rzp-zero { color: #16a34a; font-weight: 700; }
        .rzp-charge-val { font-weight: 600; color: #374151; }
        .rzp-charge-note { font-size: 10px; color: #94a3b8; margin-top: 6px; }
        .rzp-apps-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .rzp-app-chip { background: #f1f5f9; border-radius: 20px; padding: 3px 9px; font-size: 11px; color: #475569; }

        @media (max-width: 768px) {
          .rzp-body { flex-direction: column; }
          .rzp-sidebar { width: 100%; }
          .rzp-details-grid { grid-template-columns: 1fr; }
          .rzp-opts-grid { grid-template-columns: 1fr 1fr; }
          .rzp-info-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}