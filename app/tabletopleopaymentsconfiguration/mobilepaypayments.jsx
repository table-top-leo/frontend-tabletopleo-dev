"use client";
import { useState } from "react";
import { Smartphone, ShieldCheck } from "lucide-react";
import { SiApplepay, SiGooglepay } from "react-icons/si";

export default function MobilePayPayments({ onBack }) {
  const [merchantName, setMerchantName] = useState("");
  const [merchantId,   setMerchantId]   = useState("");
  const [wallets,      setWallets]      = useState(["applepay", "googlepay"]);
  const [nameError,    setNameError]    = useState("");
  const [idError,      setIdError]      = useState("");

  const [saved,    setSaved]    = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [agreed,   setAgreed]   = useState(false);
  const [saving,   setSaving]   = useState(false);

  const WALLET_OPTIONS = [
    { id: "applepay",  label: "Apple Pay",  icon: <SiApplepay size={16} /> },
    { id: "googlepay", label: "Google Pay", icon: <SiGooglepay size={16} /> },
  ];

  const toggleWallet = (id) => {
    if (!editMode) return;
    setWallets((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
  };

  const validate = () => {
    let valid = true;
    if (!merchantName.trim()) { setNameError("Merchant name is required."); valid = false; }
    else setNameError("");

    if (!merchantId.trim()) { setIdError("Mobile Pay Merchant ID is required."); valid = false; }
    else setIdError("");

    return valid;
  };

  // UI-only for now — no backend call yet. Swap this for a real API POST
  // once the Mobile Pay integration is actually built server-side.
  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setEditMode(false);
    }, 700);
  };

  const handleEdit = () => setEditMode(true);

  return (
    <div className="mobpay-root">
      {/* Header */}
      <div className="mobpay-header">
        <button className="mobpay-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Payment Methods
        </button>
        <div className="mobpay-header-inner">
          <div className="mobpay-header-icon">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="10" fill="#F5F0FF" />
              <rect x="16" y="9" width="16" height="30" rx="4" fill="#7C3AED" opacity="0.15" />
              <rect x="18" y="11" width="12" height="26" rx="2.5" fill="#7C3AED" />
              <circle cx="24" cy="33.5" r="1.6" fill="white" />
            </svg>
          </div>
          <div>
            <div className="mobpay-header-title">
              Mobile Pay Setup
              <span className="mobpay-badge">New</span>
            </div>
            <div className="mobpay-header-sub">Accept tap-to-pay checkout via Apple Pay, Google Pay &amp; mobile wallets</div>
          </div>
        </div>
      </div>

      <div className="mobpay-body">
        <div className="mobpay-main">

          {/* Step 1 — Merchant Details */}
          <div className="mobpay-section">
            <div className="mobpay-step-label">
              <span className="mobpay-step-num">1</span>
              Merchant Details
            </div>
            <p className="mobpay-step-desc">Enter your merchant display name and Mobile Pay Merchant ID. Your admin ID and business ID are linked automatically from your account.</p>

            <div className="mobpay-form-row">
              <div className="mobpay-field">
                <label className="mobpay-label">Merchant Display Name <span className="mobpay-req">*</span></label>
                <input
                  className={`mobpay-input ${nameError ? "mobpay-input--error" : merchantName && !nameError ? "mobpay-input--valid" : ""}`}
                  placeholder="As shown at checkout (e.g. Brew & Beans Cafe)"
                  value={merchantName}
                  onChange={(e) => { setMerchantName(e.target.value); if (nameError) setNameError(""); }}
                  disabled={!editMode}
                />
                {nameError && <div className="mobpay-error-msg">{nameError}</div>}
              </div>

              <div className="mobpay-field">
                <label className="mobpay-label">Mobile Pay Merchant ID <span className="mobpay-req">*</span></label>
                <input
                  className={`mobpay-input ${idError ? "mobpay-input--error" : merchantId && !idError ? "mobpay-input--valid" : ""}`}
                  placeholder="e.g. MP-MERCHANT-00123"
                  value={merchantId}
                  onChange={(e) => { setMerchantId(e.target.value); if (idError) setIdError(""); }}
                  disabled={!editMode}
                />
                {idError && <div className="mobpay-error-msg">{idError}</div>}
              </div>
            </div>
          </div>

          {/* Step 2 — Supported Wallets */}
          <div className="mobpay-section">
            <div className="mobpay-step-label">
              <span className="mobpay-step-num">2</span>
              Supported Wallets
            </div>
            <p className="mobpay-step-desc">Choose which mobile wallets customers can pay with at checkout.</p>

            <div className="mobpay-wallet-grid">
              {WALLET_OPTIONS.map((w) => {
                const active = wallets.includes(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={`mobpay-wallet-card ${active ? "mobpay-wallet-card--active" : ""}`}
                    onClick={() => toggleWallet(w.id)}
                    disabled={!editMode}
                  >
                    <span className="mobpay-wallet-icon">{w.icon}</span>
                    {w.label}
                    {active && (
                      <svg width="14" height="14" viewBox="0 0 16 16" className="mobpay-wallet-check"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3 — Integration Keys */}
          <div className="mobpay-section">
            <div className="mobpay-step-label">
              <span className="mobpay-step-num">3</span>
              Integration Keys
            </div>
            <p className="mobpay-step-desc">These will be issued once your Mobile Pay integration is activated. Placeholder fields for now.</p>

            <div className="mobpay-form-row">
              <div className="mobpay-field">
                <label className="mobpay-label">API Key</label>
                <input className="mobpay-input" placeholder="Issued after activation" value="" disabled />
              </div>
              <div className="mobpay-field">
                <label className="mobpay-label">Webhook URL</label>
                <input className="mobpay-input" placeholder="https://yourdomain.com/webhooks/mobile-pay" value="" disabled />
              </div>
            </div>
          </div>

          {/* Save / Update button */}
          {editMode ? (
            <div>
              <button className="mobpay-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : (saved ? "Update Configuration" : "Save & Continue")}
              </button>
            </div>
          ) : (
            <div className="mobpay-saved-bar">
              <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Configuration saved
              <button className="mobpay-edit-link" onClick={handleEdit}>Edit</button>
            </div>
          )}

          {/* Terms */}
          <div className="mobpay-section mobpay-section--terms">
            <div className="mobpay-terms-title">Terms &amp; Conditions</div>
            <ol className="mobpay-terms-list">
              <li>Mobile Pay transactions are processed by the respective wallet provider (Apple Pay / Google Pay).</li>
              <li>TableTop Leo does not store or process any card details directly.</li>
              <li>Transaction fees are charged by the underlying payment processor, not TableTop Leo.</li>
              <li>You must comply with each wallet provider's merchant terms of service.</li>
            </ol>
            <label className="mobpay-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              I have read and agree to the terms above
            </label>
          </div>

          <div className="mobpay-footer">
            <button className="mobpay-btn-cancel" onClick={onBack}>Cancel</button>
            <button className={`mobpay-btn-activate ${!agreed ? "mobpay-btn-activate--disabled" : ""}`} disabled={!agreed}>
              Activate Mobile Pay
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="mobpay-sidebar">
          <div className="mobpay-sidebar-card">
            <div className="mobpay-sidebar-title">How it works</div>
            <ol className="mobpay-how-list">
              <li>Customer taps "Mobile Pay" at checkout</li>
              <li>Their phone's wallet sheet opens automatically</li>
              <li>They confirm with Face ID / fingerprint</li>
              <li>Payment is confirmed instantly</li>
            </ol>
          </div>

          <div className="mobpay-sidebar-card">
            <div className="mobpay-sidebar-title">Supported Wallets</div>
            <div className="mobpay-apps-grid">
              <span className="mobpay-app-chip"><SiApplepay size={13} /> Apple Pay</span>
              <span className="mobpay-app-chip"><SiGooglepay size={13} /> Google Pay</span>
            </div>
          </div>

          <div className="mobpay-sidebar-card">
            <div className="mobpay-sidebar-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={13} color="#16a34a" /> Secure by design
            </div>
            <p style={{ fontSize: 11.5, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              Card details never touch your servers — every transaction is tokenized by the wallet provider.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .mobpay-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; max-width: 1080px; padding: 28px 32px; }
        .mobpay-back-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: #3b82f6; font-size: 13px; font-weight: 500; padding: 0; margin-bottom: 18px; }
        .mobpay-back-btn:hover { text-decoration: underline; }
        .mobpay-header { margin-bottom: 24px; }
        .mobpay-header-inner { display: flex; align-items: center; gap: 14px; }
        .mobpay-header-title { font-size: 19px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .mobpay-badge { font-size: 10px; font-weight: 600; background: #ede9fe; color: #7c3aed; border-radius: 20px; padding: 2px 9px; }
        .mobpay-header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
        .mobpay-body { display: flex; gap: 24px; }
        .mobpay-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 18px; }
        .mobpay-sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; }
        .mobpay-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
        .mobpay-section--terms { background: #fafafa; }
        .mobpay-step-label { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .mobpay-step-num { width: 24px; height: 24px; border-radius: 50%; background: #7c3aed; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .mobpay-step-desc { font-size: 12px; color: #64748b; margin: 0 0 16px; }
        .mobpay-form-row { display: flex; gap: 16px; flex-wrap: wrap; }
        .mobpay-field { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 6px; }
        .mobpay-label { font-size: 12px; font-weight: 600; color: #374151; }
        .mobpay-req { color: #ef4444; }
        .mobpay-input { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1.5px solid #e2e8f0; font-size: 13px; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .mobpay-input:focus { border-color: #7c3aed; }
        .mobpay-input--valid { border-color: #16a34a; }
        .mobpay-input--error { border-color: #ef4444; }
        .mobpay-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
        .mobpay-error-msg { font-size: 11px; color: #ef4444; }
        .mobpay-wallet-grid { display: flex; gap: 12px; flex-wrap: wrap; }
        .mobpay-wallet-card { position: relative; display: flex; align-items: center; gap: 8px; padding: 11px 18px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 13px; font-weight: 600; color: #334155; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
        .mobpay-wallet-card--active { border-color: #7c3aed; background: #faf5ff; color: #6d28d9; }
        .mobpay-wallet-card:disabled { cursor: not-allowed; opacity: 0.7; }
        .mobpay-wallet-icon { display: flex; align-items: center; }
        .mobpay-wallet-check { margin-left: 2px; }
        .mobpay-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #7c3aed; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .mobpay-btn-primary:hover:not(:disabled) { background: #6d28d9; }
        .mobpay-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .mobpay-saved-bar { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #16a34a; font-weight: 500; }
        .mobpay-edit-link { margin-left: auto; background: none; border: none; color: #7c3aed; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: underline; }
        .mobpay-terms-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .mobpay-terms-list { margin: 0 0 14px; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
        .mobpay-terms-list li { font-size: 12px; color: #475569; line-height: 1.6; }
        .mobpay-agree { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: #334155; cursor: pointer; }
        .mobpay-agree input { width: 15px; height: 15px; accent-color: #7c3aed; }
        .mobpay-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
        .mobpay-btn-cancel { padding: 9px 20px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; }
        .mobpay-btn-cancel:hover { border-color: #94a3b8; }
        .mobpay-btn-activate { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #7c3aed; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .mobpay-btn-activate:hover:not(.mobpay-btn-activate--disabled) { background: #6d28d9; }
        .mobpay-btn-activate--disabled { opacity: 0.5; cursor: not-allowed; }
        .mobpay-sidebar-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
        .mobpay-sidebar-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .mobpay-how-list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 7px; }
        .mobpay-how-list li { font-size: 12px; color: #475569; }
        .mobpay-apps-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .mobpay-app-chip { display: inline-flex; align-items: center; gap: 5px; background: #f1f5f9; border-radius: 20px; padding: 4px 10px; font-size: 11px; font-weight: 600; color: #475569; }
        @media (max-width: 768px) {
          .mobpay-body { flex-direction: column; }
          .mobpay-sidebar { width: 100%; }
        }
      `}</style>
    </div>
  );
}
