"use client";
// app/tabletopleopaymentsconfiguration/razorpaypayments.jsx
// UPDATED — Shows existing keys on load + QR code generation after save

import { useState, useEffect } from "react";
import gatewayPaymentService from "../services/gatewayPaymentService";
import qrService from "../services/qrService";

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
  const [webhookSecret, setWebhookSecret] = useState("");
  const [env, setEnv] = useState("sandbox");
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [enabledOpts, setEnabledOpts] = useState(["cards", "upi", "netbanking", "wallets"]);
  const [agreed, setAgreed] = useState(false);

  // Save states
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [keyIdError, setKeyIdError] = useState("");
  const [keySecError, setKeySecError] = useState("");

  // QR states
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrImageBase64, setQrImageBase64] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [generatingQr, setGeneratingQr] = useState(false);
  const [qrError, setQrError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // ── Load existing config on mount ─────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await gatewayPaymentService.getRazorpay();
        if (res.success && res.data) {
          // publishableKey field stores Razorpay Key ID
          setKeyId(res.data.publishableKey || "");
          setEnv(res.data.environment || "sandbox");
          setSaved(true);
          setEditMode(false);
        }
      } catch { /* no config yet — show empty form */ }

      // Also load existing QR if any
      try {
        const qrRes = await qrService.getMyQrCode();
        if (qrRes.success && qrRes.data) {
          setQrImageBase64(qrRes.data.qrImageBase64 || "");
          setQrUrl(qrRes.data.qrUrl || "");
          setQrGenerated(true);
        }
      } catch { /* no QR yet */ }
    };
    load();
  }, []);

  const toggleOpt = (id) => setEnabledOpts((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );

  const validate = () => {
    let valid = true;
    if (!keyId.trim()) { setKeyIdError("Razorpay Key ID is required."); valid = false; }
    else if (!keyId.startsWith("rzp_")) { setKeyIdError("Must start with rzp_test_ or rzp_live_."); valid = false; }
    else setKeyIdError("");
    if (!keySecret.trim()) { setKeySecError("Razorpay Key Secret is required."); valid = false; }
    else setKeySecError("");
    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const res = await gatewayPaymentService.saveRazorpay({
        keyId: keyId.trim(),
        keySecret: keySecret.trim(),
        webhookSecret: webhookSecret.trim(),
        environment: env,
      });
      if (res.success) {
        setSaved(true);
        setEditMode(false);
        setSaveSuccess("Razorpay configuration saved successfully!");
        setTimeout(() => setSaveSuccess(""), 3000);
      } else {
        setSaveError(res.message || "Failed to save.");
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  // ── Generate QR (same API as UPI) ─────────────────────
  const handleGenerateQR = async () => {
    setGeneratingQr(true);
    setQrError("");
    try {
      const res = await qrService.generateQrCode();
      if (res.success && res.data) {
        setQrImageBase64(res.data.qrImageBase64);
        setQrUrl(res.data.qrUrl);
        setQrGenerated(true);
      } else {
        setQrError(res.message || "Failed to generate QR.");
      }
    } catch (err) {
      setQrError(err.response?.data?.message || "QR generation failed. Make sure payment is configured.");
    } finally {
      setGeneratingQr(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrImageBase64) return;
    const link = document.createElement("a");
    link.href = qrImageBase64;
    link.download = `tabletopleo-razorpay-qr.png`;
    link.click();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="rzp-root">
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
          <div className="rzp-header-title">Razorpay Payment Setup <span className="rzp-badge">Recommended</span></div>
          <div className="rzp-header-sub">Accept Cards, UPI, Net Banking, Wallets & more via Razorpay</div>
        </div>
      </div>

      <div className="rzp-body">
        <div className="rzp-main">

          {/* Step 1 — API Keys */}
          <div className="rzp-section">
            <div className="rzp-step-label"><span className="rzp-step-num">1</span>Connect Your Razorpay Account</div>
            <p className="rzp-step-desc">Enter your Razorpay API keys. Admin ID and business ID are linked automatically from your account.</p>

            <div className="rzp-env-toggle">
              <button className={`rzp-env-btn ${env === "sandbox" ? "rzp-env-btn--active" : ""}`} onClick={() => { if (editMode) setEnv("sandbox"); }}>Test Mode</button>
              <button className={`rzp-env-btn ${env === "live" ? "rzp-env-btn--active" : ""}`} onClick={() => { if (editMode) setEnv("live"); }}>Live Mode</button>
            </div>

            <div className="rzp-field">
              <label className="rzp-label">Razorpay Key ID <span className="rzp-req">*</span></label>
              <input
                className={`rzp-input ${keyIdError ? "rzp-input--error" : keyId && !keyIdError ? "rzp-input--valid" : ""}`}
                placeholder="rzp_test_xxxxxxxxxxxx"
                value={keyId}
                onChange={(e) => { setKeyId(e.target.value); setKeyIdError(""); }}
                disabled={!editMode}
              />
              <div className="rzp-hint">Razorpay Dashboard → Settings → API Keys</div>
              {keyIdError && <div className="rzp-error-msg">{keyIdError}</div>}
            </div>

            <div className="rzp-field" style={{ marginTop: 14 }}>
              <label className="rzp-label">Razorpay Key Secret <span className="rzp-req">*</span>
                {!editMode && <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: 6 }}>(hidden for security)</span>}
              </label>
              <div className="rzp-input-wrap">
                <input
                  className={`rzp-input ${keySecError ? "rzp-input--error" : keySecret && !keySecError ? "rzp-input--valid" : ""}`}
                  type={showSecret ? "text" : "password"}
                  placeholder={editMode ? "••••••••••••••••••••" : "Enter new secret to update"}
                  value={keySecret}
                  onChange={(e) => { setKeySecret(e.target.value); setKeySecError(""); }}
                  disabled={!editMode}
                />
                <button className="rzp-toggle-eye" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /><path d="M2 2l12 12" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /></svg>
                  }
                </button>
              </div>
              <div className="rzp-hint">Secret keys are never shown again after saving for security.</div>
              {keySecError && <div className="rzp-error-msg">{keySecError}</div>}
            </div>

            <div className="rzp-field" style={{ marginTop: 14 }}>
              <label className="rzp-label">Webhook Secret <span style={{ color: "#94a3b8", fontWeight: 400 }}>(Optional)</span></label>
              <input className="rzp-input" placeholder="whsec_..." value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} disabled={!editMode} />
            </div>

            {editMode ? (
              <div style={{ marginTop: 16 }}>
                <button className="rzp-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : saved ? "Update Configuration" : "Save & Activate Razorpay"}
                </button>
                {saveError && <div className="rzp-error-banner">{saveError}</div>}
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                {saveSuccess && <div className="rzp-success-banner">{saveSuccess}</div>}
                <div className="rzp-saved-bar">
                  <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Razorpay configuration saved & stored in database
                  <button className="rzp-edit-link" onClick={() => { setEditMode(true); setKeySecret(""); }}>Edit</button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 — Summary */}
          {saved && !editMode && (
            <div className="rzp-section">
              <div className="rzp-step-label"><span className="rzp-step-num">2</span>Configuration Summary</div>
              <div className="rzp-details-grid">
                <div className="rzp-detail-item">
                  <div className="rzp-detail-label">Key ID</div>
                  <div className="rzp-detail-value" style={{ fontFamily: "monospace", fontSize: 12 }}>{keyId}</div>
                </div>
                <div className="rzp-detail-item">
                  <div className="rzp-detail-label">Environment</div>
                  <div className="rzp-detail-value">{env === "sandbox" ? "🧪 Test Mode" : "🚀 Live Mode"}</div>
                </div>
                <div className="rzp-detail-item">
                  <div className="rzp-detail-label">Secret Key</div>
                  <div className="rzp-detail-value">••••••••••••••••</div>
                </div>
                <div className="rzp-detail-item">
                  <div className="rzp-detail-label">Status</div>
                  <span className="rzp-status-chip">Active</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Payment Methods */}
          {saved && !editMode && (
            <div className="rzp-section">
              <div className="rzp-step-label"><span className="rzp-step-num">3</span>Payment Methods</div>
              <div className="rzp-opts-grid">
                {PAYMENT_OPTS.map((opt) => (
                  <label key={opt.id} className={`rzp-opt-card ${enabledOpts.includes(opt.id) ? "rzp-opt-card--on" : ""}`}>
                    <input type="checkbox" checked={enabledOpts.includes(opt.id)} onChange={() => toggleOpt(opt.id)} style={{ display: "none" }} />
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
          {saved && !editMode && (
            <div className="rzp-section">
              <div className="rzp-step-label"><span className="rzp-step-num">4</span>Generate Menu QR Code</div>
              <p className="rzp-step-desc">Generate a QR code for your restaurant. Customers scan it to view your full menu.</p>

              {qrError && <div className="rzp-error-banner">{qrError}</div>}

              {!qrGenerated ? (
                <button className="rzp-btn-primary" onClick={handleGenerateQR} disabled={generatingQr}>
                  {generatingQr ? "Generating..." : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="10" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
                      </svg>
                      Generate QR Code
                    </>
                  )}
                </button>
              ) : (
                <div className="rzp-qr-area">
                  <div className="rzp-qr-card">
                    <div className="rzp-qr-title">TableTop Leo Menu QR</div>
                    <div className="rzp-qr-sub">Scan to view menu & order</div>
                    <img src={qrImageBase64} alt="Menu QR Code" className="rzp-qr-img" />
                    <div className="rzp-qr-url">{qrUrl}</div>
                  </div>
                  <div className="rzp-qr-actions">
                    <button className="rzp-btn-outline" onClick={handleDownloadQR}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                      Download QR
                    </button>
                    <button className="rzp-btn-outline" onClick={handleCopyUrl}>
                      {copySuccess ? "✓ Copied!" : "Copy Menu URL"}
                    </button>
                    <button className="rzp-btn-ghost" onClick={handleGenerateQR} disabled={generatingQr}>
                      {generatingQr ? "Regenerating..." : "Regenerate QR"}
                    </button>
                  </div>
                </div>
              )}

              {qrGenerated && (
                <div className="rzp-qr-info">
                  <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#3b82f6"/><path d="M7 4v3M7 9v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span>When customer scans this QR, their phone opens: <strong>{qrUrl}</strong> — showing your full menu.</span>
                </div>
              )}
            </div>
          )}

          {/* Terms */}
          <div className="rzp-section rzp-section--terms">
            <div className="rzp-terms-title">Terms & Conditions</div>
            <ol className="rzp-terms-list">
              <li>You must have an active Razorpay account.</li>
              <li>All transactions are processed securely through Razorpay.</li>
              <li>TableTop Leo does not store any card or bank details.</li>
              <li>Settlement times are as per Razorpay's settlement cycle.</li>
              <li>Chargeback and refund policies are handled by Razorpay.</li>
            </ol>
            <label className="rzp-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I agree to the Terms & Conditions</span>
            </label>
          </div>

          <div className="rzp-footer">
            <button className="rzp-btn-cancel" onClick={onBack}>Cancel</button>
            <button className={`rzp-btn-activate ${!agreed || !saved ? "rzp-btn-activate--disabled" : ""}`}
              disabled={!agreed || !saved} onClick={() => { if (agreed && saved) onBack(); }}>
              Done — Razorpay Active
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="rzp-sidebar">
          <div className="rzp-sidebar-card">
            <div className="rzp-sidebar-title">How to Get API Keys</div>
            <ol className="rzp-how-list">
              <li>Login to <strong>razorpay.com</strong></li>
              <li>Settings → API Keys</li>
              <li>Generate Test/Live keys</li>
              <li>Paste Key ID & Secret here</li>
            </ol>
          </div>
          <div className="rzp-sidebar-card">
            <div className="rzp-sidebar-title rzp-sidebar-title--orange">Transaction Charges</div>
            {[["Cards", "2.00% + GST"], ["UPI", "0.00%"], ["Wallets", "1.50% + GST"], ["Net Banking", "0.90% + GST"], ["International", "3.50% + GST"]].map(([k, v]) => (
              <div key={k} className="rzp-charge-row"><span>{k}</span><span className={v === "0.00%" ? "rzp-zero" : "rzp-charge-val"}>{v}</span></div>
            ))}
          </div>
          <div className="rzp-sidebar-card">
            <div className="rzp-sidebar-title">Supported Methods</div>
            <div className="rzp-apps-grid">
              {["Visa", "Mastercard", "RuPay", "GPay", "UPI", "Paytm", "NetBanking", "EMI"].map((a) => (
                <span key={a} className="rzp-app-chip">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rzp-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; max-width: 1080px; padding: 28px 32px; }
        .rzp-back-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: #3b82f6; font-size: 13px; font-weight: 500; padding: 0; margin-bottom: 18px; }
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
        .rzp-step-desc { font-size: 12px; color: #64748b; margin: 0 0 16px; }
        .rzp-env-toggle { display: flex; gap: 8px; margin-bottom: 16px; }
        .rzp-env-btn { padding: 6px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
        .rzp-env-btn--active { border-color: #3b82f6; background: #eff6ff; color: #2563eb; }
        .rzp-field { display: flex; flex-direction: column; gap: 5px; }
        .rzp-label { font-size: 12px; font-weight: 600; color: #374151; }
        .rzp-req { color: #ef4444; }
        .rzp-input-wrap { position: relative; }
        .rzp-input { width: 100%; padding: 9px 40px 9px 12px; border-radius: 8px; border: 1.5px solid #e2e8f0; font-size: 13px; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .rzp-input:focus { border-color: #3b82f6; }
        .rzp-input--valid { border-color: #16a34a; }
        .rzp-input--error { border-color: #ef4444; }
        .rzp-input:disabled { background: #f8fafc; color: #374151; cursor: default; }
        .rzp-toggle-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; }
        .rzp-hint { font-size: 11px; color: #94a3b8; }
        .rzp-error-msg { font-size: 11px; color: #ef4444; }
        .rzp-error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; color: #dc2626; font-size: 13px; margin-top: 10px; }
        .rzp-success-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; color: #16a34a; font-size: 13px; margin-bottom: 8px; }
        .rzp-saved-bar { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #16a34a; font-weight: 500; }
        .rzp-edit-link { margin-left: auto; background: none; border: none; color: #3b82f6; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: underline; }
        .rzp-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rzp-detail-item {}
        .rzp-detail-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .rzp-detail-value { font-size: 13px; font-weight: 600; color: #0f172a; }
        .rzp-status-chip { display: inline-block; background: #dcfce7; color: #16a34a; border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 600; }
        .rzp-opts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .rzp-opt-card { display: flex; align-items: flex-start; gap: 8px; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; cursor: pointer; }
        .rzp-opt-card--on { border-color: #3b82f6; background: #eff6ff; }
        .rzp-opt-check { margin-top: 1px; flex-shrink: 0; }
        .rzp-opt-label { font-size: 12px; font-weight: 600; color: #0f172a; }
        .rzp-opt-sub { font-size: 11px; color: #94a3b8; margin-top: 1px; }
        .rzp-qr-area { display: flex; gap: 20px; flex-wrap: wrap; }
        .rzp-qr-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; text-align: center; min-width: 200px; }
        .rzp-qr-title { font-size: 14px; font-weight: 700; color: #0f172a; }
        .rzp-qr-sub { font-size: 11px; color: #64748b; margin-bottom: 12px; }
        .rzp-qr-img { width: 180px; height: 180px; border-radius: 8px; display: block; margin: 0 auto; }
        .rzp-qr-url { font-size: 10px; color: #94a3b8; margin-top: 8px; font-family: monospace; word-break: break-all; }
        .rzp-qr-actions { display: flex; flex-direction: column; gap: 8px; justify-content: flex-start; padding-top: 4px; }
        .rzp-qr-info { display: flex; gap: 8px; align-items: flex-start; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #1e40af; margin-top: 12px; }
        .rzp-terms-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .rzp-terms-list { margin: 0 0 14px; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
        .rzp-terms-list li { font-size: 12px; color: #475569; line-height: 1.6; }
        .rzp-agree { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: #334155; cursor: pointer; }
        .rzp-agree input { width: 15px; height: 15px; accent-color: #3b82f6; }
        .rzp-footer { display: flex; justify-content: flex-end; gap: 10px; }
        .rzp-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #3b82f6; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
        .rzp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .rzp-btn-outline { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border: 1.5px solid #3b82f6; background: transparent; color: #3b82f6; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .rzp-btn-outline:hover { background: #eff6ff; }
        .rzp-btn-ghost { padding: 8px 14px; background: none; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
        .rzp-btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; }
        .rzp-btn-cancel { padding: 9px 20px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; }
        .rzp-btn-activate { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #3b82f6; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
        .rzp-btn-activate--disabled { opacity: 0.5; cursor: not-allowed; }
        .rzp-sidebar-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
        .rzp-sidebar-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .rzp-sidebar-title--orange { color: #d97706; }
        .rzp-how-list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 7px; }
        .rzp-how-list li { font-size: 12px; color: #475569; }
        .rzp-charge-row { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
        .rzp-zero { color: #16a34a; font-weight: 700; }
        .rzp-charge-val { font-weight: 600; color: #374151; }
        .rzp-apps-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .rzp-app-chip { background: #f1f5f9; border-radius: 20px; padding: 3px 9px; font-size: 11px; color: #475569; }
        @media (max-width: 768px) { .rzp-body { flex-direction: column; } .rzp-sidebar { width: 100%; } .rzp-opts-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}
