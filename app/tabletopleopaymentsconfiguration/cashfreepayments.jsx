"use client";
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

export default function CashfreePayments({ onBack }) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
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
  const [clientIdError, setClientIdError] = useState("");
  const [clientSecretError, setClientSecretError] = useState("");

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
        const res = await gatewayPaymentService.getCashfree();
        if (res.success && res.data) {
          // publishableKey field stores the Cashfree Client ID
          setClientId(res.data.publishableKey || "");
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
    if (!clientId.trim()) { setClientIdError("Cashfree Client ID is required."); valid = false; }
    else setClientIdError("");
    if (!clientSecret.trim()) { setClientSecretError("Cashfree Client Secret is required."); valid = false; }
    else setClientSecretError("");
    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const res = await gatewayPaymentService.saveCashfree({
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        webhookSecret: webhookSecret.trim(),
        environment: env,
      });
      if (res.success) {
        setSaved(true);
        setEditMode(false);
        setSaveSuccess("Cashfree configuration saved successfully!");
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

  // ── Generate QR (same API as every other gateway) ─────
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
    link.download = `tabletopleo-cashfree-qr.png`;
    link.click();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="cf-root">
      <button className="cf-back-btn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Payment Methods
      </button>

      <div className="cf-header">
        <div className="cf-header-icon">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#EAFBF3" />
            <path d="M14 24c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-3.2 0-6-1.5-7.8-3.8" stroke="#12B76A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M20 24l3 3 6-6" stroke="#12B76A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="cf-header-title">Cashfree Payment Setup</div>
          <div className="cf-header-sub">Accept Cards, UPI, Net Banking, Wallets & more via Cashfree</div>
        </div>
      </div>

      <div className="cf-body">
        <div className="cf-main">

          {/* Step 1 — API Keys */}
          <div className="cf-section">
            <div className="cf-step-label"><span className="cf-step-num">1</span>Connect Your Cashfree Account</div>
            <p className="cf-step-desc">Enter your Cashfree API keys. Admin ID and business ID are linked automatically from your account.</p>

            <div className="cf-env-toggle">
              <button className={`cf-env-btn ${env === "sandbox" ? "cf-env-btn--active" : ""}`} onClick={() => { if (editMode) setEnv("sandbox"); }}>Test Mode</button>
              <button className={`cf-env-btn ${env === "live" ? "cf-env-btn--active" : ""}`} onClick={() => { if (editMode) setEnv("live"); }}>Live Mode</button>
            </div>

            <div className="cf-field">
              <label className="cf-label">Cashfree Client ID <span className="cf-req">*</span></label>
              <input
                className={`cf-input ${clientIdError ? "cf-input--error" : clientId && !clientIdError ? "cf-input--valid" : ""}`}
                placeholder="TEST10xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={clientId}
                onChange={(e) => { setClientId(e.target.value); setClientIdError(""); }}
                disabled={!editMode}
              />
              <div className="cf-hint">Cashfree Merchant Dashboard → Developers → API Keys</div>
              {clientIdError && <div className="cf-error-msg">{clientIdError}</div>}
            </div>

            <div className="cf-field" style={{ marginTop: 14 }}>
              <label className="cf-label">Cashfree Client Secret <span className="cf-req">*</span>
                {!editMode && <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: 6 }}>(hidden for security)</span>}
              </label>
              <div className="cf-input-wrap">
                <input
                  className={`cf-input ${clientSecretError ? "cf-input--error" : clientSecret && !clientSecretError ? "cf-input--valid" : ""}`}
                  type={showSecret ? "text" : "password"}
                  placeholder={editMode ? "••••••••••••••••••••" : "Enter new secret to update"}
                  value={clientSecret}
                  onChange={(e) => { setClientSecret(e.target.value); setClientSecretError(""); }}
                  disabled={!editMode}
                />
                <button className="cf-toggle-eye" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /><path d="M2 2l12 12" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /></svg>
                  }
                </button>
              </div>
              <div className="cf-hint">Secret keys are never shown again after saving for security.</div>
              {clientSecretError && <div className="cf-error-msg">{clientSecretError}</div>}
            </div>

            <div className="cf-field" style={{ marginTop: 14 }}>
              <label className="cf-label">Webhook Secret <span style={{ color: "#94a3b8", fontWeight: 400 }}>(Optional)</span></label>
              <input className="cf-input" placeholder="whsec_..." value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} disabled={!editMode} />
            </div>

            {editMode ? (
              <div style={{ marginTop: 16 }}>
                <button className="cf-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : saved ? "Update Configuration" : "Save & Activate Cashfree"}
                </button>
                {saveError && <div className="cf-error-banner">{saveError}</div>}
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                {saveSuccess && <div className="cf-success-banner">{saveSuccess}</div>}
                <div className="cf-saved-bar">
                  <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Cashfree configuration saved & stored in database
                  <button className="cf-edit-link" onClick={() => { setEditMode(true); setClientSecret(""); }}>Edit</button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 — Summary */}
          {saved && !editMode && (
            <div className="cf-section">
              <div className="cf-step-label"><span className="cf-step-num">2</span>Configuration Summary</div>
              <div className="cf-details-grid">
                <div className="cf-detail-item">
                  <div className="cf-detail-label">Client ID</div>
                  <div className="cf-detail-value" style={{ fontFamily: "monospace", fontSize: 12 }}>{clientId}</div>
                </div>
                <div className="cf-detail-item">
                  <div className="cf-detail-label">Environment</div>
                  <div className="cf-detail-value">{env === "sandbox" ? "🧪 Test Mode" : "🚀 Live Mode"}</div>
                </div>
                <div className="cf-detail-item">
                  <div className="cf-detail-label">Client Secret</div>
                  <div className="cf-detail-value">••••••••••••••••</div>
                </div>
                <div className="cf-detail-item">
                  <div className="cf-detail-label">Status</div>
                  <span className="cf-status-chip">Active</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Payment Methods */}
          {saved && !editMode && (
            <div className="cf-section">
              <div className="cf-step-label"><span className="cf-step-num">3</span>Payment Methods</div>
              <div className="cf-opts-grid">
                {PAYMENT_OPTS.map((opt) => (
                  <label key={opt.id} className={`cf-opt-card ${enabledOpts.includes(opt.id) ? "cf-opt-card--on" : ""}`}>
                    <input type="checkbox" checked={enabledOpts.includes(opt.id)} onChange={() => toggleOpt(opt.id)} style={{ display: "none" }} />
                    <div className="cf-opt-check">
                      {enabledOpts.includes(opt.id)
                        ? <svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="3" fill="#12B76A" /><path d="M3.5 7l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="3" fill="none" stroke="#cbd5e1" strokeWidth="1.5" /></svg>
                      }
                    </div>
                    <div>
                      <div className="cf-opt-label">{opt.label}</div>
                      <div className="cf-opt-sub">{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — QR Code */}
          {saved && !editMode && (
            <div className="cf-section">
              <div className="cf-step-label"><span className="cf-step-num">4</span>Generate Menu QR Code</div>
              <p className="cf-step-desc">Generate a QR code for your restaurant. Customers scan it to view your full menu.</p>

              {qrError && <div className="cf-error-banner">{qrError}</div>}

              {!qrGenerated ? (
                <button className="cf-btn-primary" onClick={handleGenerateQR} disabled={generatingQr}>
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
                <div className="cf-qr-area">
                  <div className="cf-qr-card">
                    <div className="cf-qr-title">TableTop Leo Menu QR</div>
                    <div className="cf-qr-sub">Scan to view menu & order</div>
                    <img src={qrImageBase64} alt="Menu QR Code" className="cf-qr-img" />
                    <div className="cf-qr-url">{qrUrl}</div>
                  </div>
                  <div className="cf-qr-actions">
                    <button className="cf-btn-outline" onClick={handleDownloadQR}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                      Download QR
                    </button>
                    <button className="cf-btn-outline" onClick={handleCopyUrl}>
                      {copySuccess ? "✓ Copied!" : "Copy Menu URL"}
                    </button>
                    <button className="cf-btn-ghost" onClick={handleGenerateQR} disabled={generatingQr}>
                      {generatingQr ? "Regenerating..." : "Regenerate QR"}
                    </button>
                  </div>
                </div>
              )}

              {qrGenerated && (
                <div className="cf-qr-info">
                  <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#12B76A"/><path d="M7 4v3M7 9v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span>When customer scans this QR, their phone opens: <strong>{qrUrl}</strong> — showing your full menu.</span>
                </div>
              )}
            </div>
          )}

          {/* Terms */}
          <div className="cf-section cf-section--terms">
            <div className="cf-terms-title">Terms & Conditions</div>
            <ol className="cf-terms-list">
              <li>You must have an active Cashfree Payments account.</li>
              <li>All transactions are processed securely through Cashfree.</li>
              <li>TableTop Leo does not store any card or bank details.</li>
              <li>Settlement times are as per Cashfree's settlement cycle.</li>
              <li>Chargeback and refund policies are handled by Cashfree.</li>
            </ol>
            <label className="cf-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I agree to the Terms & Conditions</span>
            </label>
          </div>

          <div className="cf-footer">
            <button className="cf-btn-cancel" onClick={onBack}>Cancel</button>
            <button className={`cf-btn-activate ${!agreed || !saved ? "cf-btn-activate--disabled" : ""}`}
              disabled={!agreed || !saved} onClick={() => { if (agreed && saved) onBack(); }}>
              Done — Cashfree Active
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="cf-sidebar">
          <div className="cf-sidebar-card">
            <div className="cf-sidebar-title">How to Get API Keys</div>
            <ol className="cf-how-list">
              <li>Login to <strong>merchant.cashfree.com</strong></li>
              <li>Developers → API Keys</li>
              <li>Generate Test/Live keys</li>
              <li>Paste Client ID & Secret here</li>
            </ol>
          </div>
          <div className="cf-sidebar-card">
            <div className="cf-sidebar-title cf-sidebar-title--green">Transaction Charges</div>
            <p style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
              Cashfree's fees vary by payment method and your plan. Check your{" "}
              <strong>Cashfree Merchant Dashboard → Settlements → Pricing</strong> for your exact rates.
            </p>
          </div>
          <div className="cf-sidebar-card">
            <div className="cf-sidebar-title">Supported Methods</div>
            <div className="cf-apps-grid">
              {["Visa", "Mastercard", "RuPay", "GPay", "UPI", "Paytm", "NetBanking", "EMI"].map((a) => (
                <span key={a} className="cf-app-chip">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cf-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; max-width: 1080px; padding: 28px 32px; }
        .cf-back-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: #3b82f6; font-size: 13px; font-weight: 500; padding: 0; margin-bottom: 18px; }
        .cf-back-btn:hover { text-decoration: underline; }
        .cf-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .cf-header-title { font-size: 19px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .cf-header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
        .cf-body { display: flex; gap: 24px; }
        .cf-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 18px; }
        .cf-sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; }
        .cf-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
        .cf-section--terms { background: #fafafa; }
        .cf-step-label { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .cf-step-num { width: 24px; height: 24px; border-radius: 50%; background: #12B76A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .cf-step-desc { font-size: 12px; color: #64748b; margin: 0 0 16px; }
        .cf-env-toggle { display: flex; gap: 8px; margin-bottom: 16px; }
        .cf-env-btn { padding: 6px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
        .cf-env-btn--active { border-color: #12B76A; background: #EAFBF3; color: #0E9F5B; }
        .cf-field { display: flex; flex-direction: column; gap: 5px; }
        .cf-label { font-size: 12px; font-weight: 600; color: #374151; }
        .cf-req { color: #ef4444; }
        .cf-input-wrap { position: relative; }
        .cf-input { width: 100%; padding: 9px 40px 9px 12px; border-radius: 8px; border: 1.5px solid #e2e8f0; font-size: 13px; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .cf-input:focus { border-color: #12B76A; }
        .cf-input--valid { border-color: #16a34a; }
        .cf-input--error { border-color: #ef4444; }
        .cf-input:disabled { background: #f8fafc; color: #374151; cursor: default; }
        .cf-toggle-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; }
        .cf-hint { font-size: 11px; color: #94a3b8; }
        .cf-error-msg { font-size: 11px; color: #ef4444; }
        .cf-error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; color: #dc2626; font-size: 13px; margin-top: 10px; }
        .cf-success-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; color: #16a34a; font-size: 13px; margin-bottom: 8px; }
        .cf-saved-bar { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #16a34a; font-weight: 500; }
        .cf-edit-link { margin-left: auto; background: none; border: none; color: #12B76A; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: underline; }
        .cf-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .cf-detail-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .cf-detail-value { font-size: 13px; font-weight: 600; color: #0f172a; }
        .cf-status-chip { display: inline-block; background: #dcfce7; color: #16a34a; border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 600; }
        .cf-opts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .cf-opt-card { display: flex; align-items: flex-start; gap: 8px; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; cursor: pointer; }
        .cf-opt-card--on { border-color: #12B76A; background: #EAFBF3; }
        .cf-opt-check { margin-top: 1px; flex-shrink: 0; }
        .cf-opt-label { font-size: 12px; font-weight: 600; color: #0f172a; }
        .cf-opt-sub { font-size: 11px; color: #94a3b8; margin-top: 1px; }
        .cf-qr-area { display: flex; gap: 20px; flex-wrap: wrap; }
        .cf-qr-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; text-align: center; min-width: 200px; }
        .cf-qr-title { font-size: 14px; font-weight: 700; color: #0f172a; }
        .cf-qr-sub { font-size: 11px; color: #64748b; margin-bottom: 12px; }
        .cf-qr-img { width: 180px; height: 180px; border-radius: 8px; display: block; margin: 0 auto; }
        .cf-qr-url { font-size: 10px; color: #94a3b8; margin-top: 8px; font-family: monospace; word-break: break-all; }
        .cf-qr-actions { display: flex; flex-direction: column; gap: 8px; justify-content: flex-start; padding-top: 4px; }
        .cf-qr-info { display: flex; gap: 8px; align-items: flex-start; background: #EAFBF3; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #0E9F5B; margin-top: 12px; }
        .cf-terms-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .cf-terms-list { margin: 0 0 14px; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
        .cf-terms-list li { font-size: 12px; color: #475569; line-height: 1.6; }
        .cf-agree { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: #334155; cursor: pointer; }
        .cf-agree input { width: 15px; height: 15px; accent-color: #12B76A; }
        .cf-footer { display: flex; justify-content: flex-end; gap: 10px; }
        .cf-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #12B76A; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
        .cf-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .cf-btn-outline { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border: 1.5px solid #12B76A; background: transparent; color: #0E9F5B; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .cf-btn-outline:hover { background: #EAFBF3; }
        .cf-btn-ghost { padding: 8px 14px; background: none; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
        .cf-btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; }
        .cf-btn-cancel { padding: 9px 20px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; }
        .cf-btn-activate { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #12B76A; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
        .cf-btn-activate--disabled { opacity: 0.5; cursor: not-allowed; }
        .cf-sidebar-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
        .cf-sidebar-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .cf-sidebar-title--green { color: #0E9F5B; }
        .cf-how-list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 7px; }
        .cf-how-list li { font-size: 12px; color: #475569; }
        .cf-apps-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .cf-app-chip { background: #f1f5f9; border-radius: 20px; padding: 3px 9px; font-size: 11px; color: #475569; }
        @media (max-width: 768px) { .cf-body { flex-direction: column; } .cf-sidebar { width: 100%; } .cf-opts-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}
