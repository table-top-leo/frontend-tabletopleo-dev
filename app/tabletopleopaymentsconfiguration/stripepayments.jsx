"use client";
import { useState, useEffect } from "react";
import gatewayPaymentService from "../services/gatewayPaymentService";
import qrService from "../services/qrService";

/* ─────────────────────────────────────────────────────────
   SHARED QR SECTION COMPONENT
───────────────────────────────────────────────────────── */
function QRSection({ accentColor = "#635BFF" }) {
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrImageBase64, setQrImageBase64] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [generatingQr, setGeneratingQr] = useState(false);
  const [qrError, setQrError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const loadQr = async () => {
      try {
        const res = await qrService.getMyQrCode();
        if (res.success && res.data) {
          setQrImageBase64(res.data.qrImageBase64 || "");
          setQrUrl(res.data.qrUrl || "");
          setQrGenerated(true);
        }
      } catch { /* no QR yet */ }
    };
    loadQr();
  }, []);

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

  const handleDownload = () => {
    if (!qrImageBase64) return;
    const link = document.createElement("a");
    link.href = qrImageBase64;
    link.download = "tabletopleo-menu-qr.png";
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div style={{ marginTop: 0 }}>
      {qrError && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", color: "#dc2626", fontSize: 13, marginBottom: 12 }}>
          {qrError}
        </div>
      )}

      {!qrGenerated ? (
        <button
          onClick={handleGenerateQR}
          disabled={generatingQr}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "9px 20px", background: accentColor, border: "none",
            borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: generatingQr ? "not-allowed" : "pointer", opacity: generatingQr ? 0.6 : 1
          }}
        >
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
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", textAlign: "center", minWidth: 200 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>TableTop Leo Menu QR</div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Scan to view menu & order</div>
            <img src={qrImageBase64} alt="Menu QR" style={{ width: 180, height: 180, borderRadius: 8, display: "block", margin: "0 auto" }} />
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8, fontFamily: "monospace", wordBreak: "break-all" }}>{qrUrl}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "flex-start", paddingTop: 4 }}>
            <button onClick={handleDownload} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", border: `1.5px solid ${accentColor}`, background: "transparent", color: accentColor, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              Download QR
            </button>
            <button onClick={handleCopy} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", border: `1.5px solid ${accentColor}`, background: "transparent", color: accentColor, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {copySuccess ? "✓ Copied!" : "Copy Menu URL"}
            </button>
            <button onClick={handleGenerateQR} disabled={generatingQr} style={{ padding: "8px 14px", background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>
              {generatingQr ? "Regenerating..." : "Regenerate QR"}
            </button>
          </div>
        </div>
      )}

      {qrGenerated && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#1e40af", marginTop: 12 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="7" cy="7" r="7" fill="#3b82f6"/><path d="M7 4v3M7 9v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span>When customer scans this QR, their phone opens: <strong>{qrUrl}</strong> — showing your full menu.</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STRIPE COMPONENT
───────────────────────────────────────────────────────── */
const StripePayments =({ onBack }) => {
  const [env, setEnv] = useState("sandbox");
  const [pubKey, setPubKey] = useState("");
  const [secKey, setSecKey] = useState("");
  const [webhookKey, setWebhookKey] = useState("");
  const [showSec, setShowSec] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const STRIPE_OPTS = [
    { id: "cards", label: "Cards", sub: "Visa, Mastercard, Amex" },
    { id: "upi", label: "UPI", sub: "Google Pay, PhonePe" },
    { id: "wallets", label: "Wallets", sub: "Apple Pay, Google Pay" },
    { id: "netbanking", label: "Net Banking", sub: "All major banks" },
    { id: "intl", label: "International Cards", sub: "Global credit & debit" },
    { id: "bnpl", label: "Buy Now Pay Later", sub: "Klarna, Afterpay" },
  ];
  const [enabledOpts, setEnabledOpts] = useState(["cards", "upi", "wallets", "intl"]);
  const toggleOpt = (id) => setEnabledOpts((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  // Load existing config on mount — pre-fill publishable key
  useEffect(() => {
    const load = async () => {
      try {
        const res = await gatewayPaymentService.getStripe();
        if (res.success && res.data) {
          setPubKey(res.data.publishableKey || "");
          setEnv(res.data.environment || "sandbox");
          setSaved(true);
          setEditMode(false);
        }
      } catch { /* no config yet */ }
    };
    load();
  }, []);

  const validate = () => {
    const e = {};
    if (!pubKey.trim()) e.pubKey = "Publishable key is required.";
    else if (!pubKey.startsWith("pk_")) e.pubKey = "Must start with pk_test_ or pk_live_.";
    if (!secKey.trim()) e.secKey = "Secret key is required.";
    else if (!secKey.startsWith("sk_")) e.secKey = "Must start with sk_test_ or sk_live_.";
    if (!webhookKey.trim()) e.webhookKey = "Webhook signing secret is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const res = await gatewayPaymentService.saveStripe({
        publishableKey: pubKey.trim(),
        secretKey: secKey.trim(),
        webhookSecret: webhookKey.trim(),
        environment: env,
      });
      if (res.success) {
        setSaved(true);
        setEditMode(false);
        setSaveSuccess("Stripe configuration saved successfully!");
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

  return (
    <div className="sp-root">
      <button className="sp-back-btn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#635BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Back to Payment Methods
      </button>

      <div className="sp-header">
        <div className="sp-header-icon">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#F0EEFF" />
            <rect x="10" y="10" width="28" height="28" rx="6" fill="#635BFF" />
            <path d="M22 19c0-1.1.9-1.8 2.2-1.8 1.9 0 3.8.7 5.1 1.9l1.7-3.3C29.5 14.6 27 14 24.2 14 20.1 14 17 16.3 17 20c0 6.2 8.5 5.2 8.5 8 0 1.3-1.1 2-2.7 2-2.3 0-4.4-.9-5.9-2.3l-1.9 3.2C16.8 32.6 19.8 34 23 34c4.3 0 7.5-2.1 7.5-6 0-6.5-8.5-5.3-8.5-9z" fill="white" />
          </svg>
        </div>
        <div>
          <div className="sp-header-title">Stripe Payment Setup <span className="sp-badge">International</span></div>
          <div className="sp-header-sub">Accept global payments using Cards, Wallets, UPI & more via Stripe</div>
        </div>
      </div>

      <div className="sp-body">
        <div className="sp-main">

          {/* Step 1 */}
          <div className="sp-section">
            <div className="sp-step-label"><span className="sp-step-num">1</span>Connect Your Stripe Account</div>
            <p className="sp-step-desc">Enter your Stripe API keys. Admin ID and business ID are linked automatically.</p>

            <div className="sp-env-toggle">
              <button className={`sp-env-btn ${env === "sandbox" ? "sp-env-btn--active" : ""}`} onClick={() => { if (editMode) setEnv("sandbox"); }}>Test Mode</button>
              <button className={`sp-env-btn ${env === "live" ? "sp-env-btn--active" : ""}`} onClick={() => { if (editMode) setEnv("live"); }}>Live Mode</button>
            </div>

            {[
              { key: "pubKey", label: "Publishable Key", val: pubKey, set: setPubKey, ph: env === "sandbox" ? "pk_test_51N..." : "pk_live_51N...", type: "text" },
              { key: "secKey", label: "Secret Key", val: secKey, set: setSecKey, ph: editMode && !saved ? (env === "sandbox" ? "sk_test_51N..." : "sk_live_51N...") : "Enter new secret to update", type: showSec ? "text" : "password", eye: true },
              { key: "webhookKey", label: "Webhook Signing Secret", val: webhookKey, set: setWebhookKey, ph: "whsec_...", type: "text" },
            ].map((f) => (
              <div key={f.key} className="sp-field" style={{ marginTop: 14 }}>
                <label className="sp-label">{f.label} <span className="sp-req">*</span>
                  {f.key === "secKey" && !editMode && <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: 6 }}>(hidden for security)</span>}
                </label>
                <div className="sp-input-wrap">
                  <input
                    className={`sp-input ${errors[f.key] ? "sp-input--error" : f.val && !errors[f.key] ? "sp-input--valid" : ""}`}
                    type={f.type}
                    placeholder={f.ph}
                    value={f.val}
                    onChange={(e) => { f.set(e.target.value); setErrors((p) => ({ ...p, [f.key]: "" })); }}
                    disabled={!editMode}
                  />
                  {f.eye && (
                    <button className="sp-toggle-eye" onClick={() => setShowSec(!showSec)}>
                      {showSec
                        ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /><path d="M2 2l12 12" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" /></svg>
                        : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /></svg>
                      }
                    </button>
                  )}
                </div>
                {errors[f.key] && <div className="sp-error-msg">{errors[f.key]}</div>}
              </div>
            ))}

            {editMode ? (
              <div style={{ marginTop: 16 }}>
                <button className="sp-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : saved ? "Update Configuration" : "Save & Activate Stripe"}
                </button>
                {saveError && <div className="sp-error-banner">{saveError}</div>}
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                {saveSuccess && <div className="sp-success-banner">{saveSuccess}</div>}
                <div className="sp-saved-bar">
                  <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Stripe configuration saved & stored in database
                  <button className="sp-edit-link" onClick={() => { setEditMode(true); setSecKey(""); setWebhookKey(""); }}>Edit</button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 — Summary */}
          {saved && !editMode && (
            <div className="sp-section">
              <div className="sp-step-label"><span className="sp-step-num">2</span>Configuration Summary</div>
              <div className="sp-details-grid">
                <div><div className="sp-detail-label">Publishable Key</div><div className="sp-detail-value" style={{ fontFamily: "monospace", fontSize: 12 }}>{pubKey}</div></div>
                <div><div className="sp-detail-label">Environment</div><div className="sp-detail-value">{env === "sandbox" ? "🧪 Test Mode" : "🚀 Live Mode"}</div></div>
                <div><div className="sp-detail-label">Secret Key</div><div className="sp-detail-value">••••••••••••••••</div></div>
                <div><div className="sp-detail-label">Status</div><span className="sp-status-chip">Active</span></div>
              </div>
            </div>
          )}

          {/* Step 3 — Payment Methods */}
          {saved && !editMode && (
            <div className="sp-section">
              <div className="sp-step-label"><span className="sp-step-num">3</span>Payment Methods</div>
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
                    <div><div className="sp-opt-label">{opt.label}</div><div className="sp-opt-sub">{opt.sub}</div></div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — QR Code */}
          {saved && !editMode && (
            <div className="sp-section">
              <div className="sp-step-label"><span className="sp-step-num">4</span>Generate Menu QR Code</div>
              <p className="sp-step-desc">Generate a QR code for your restaurant. Customers scan it to view your full menu.</p>
              <QRSection accentColor="#635BFF" />
            </div>
          )}

          {/* Terms */}
          <div className="sp-section sp-section--terms">
            <div className="sp-terms-title">Terms & Conditions</div>
            <ol className="sp-terms-list">
              <li>You must have an active Stripe account.</li>
              <li>All transactions are processed securely through Stripe.</li>
              <li>TableTop Leo does not store any card or banking details.</li>
              <li>Stripe's fees and settlement policies apply.</li>
            </ol>
            <label className="sp-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I agree to the Terms & Conditions</span>
            </label>
          </div>

          <div className="sp-footer">
            <button className="sp-btn-cancel" onClick={onBack}>Cancel</button>
            <button className={`sp-btn-activate ${!agreed || !saved ? "sp-btn-activate--disabled" : ""}`}
              disabled={!agreed || !saved} onClick={() => { if (agreed && saved) onBack(); }}>
              Done — Stripe Active
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sp-sidebar">
          <div className="sp-sidebar-card">
            <div className="sp-sidebar-title">How to Get Keys</div>
            <ol className="sp-how-list">
              <li>Login to <strong>dashboard.stripe.com</strong></li>
              <li>Developers → API Keys</li>
              <li>Copy Publishable & Secret</li>
              <li>Webhooks → Add endpoint → Copy secret</li>
            </ol>
          </div>
          <div className="sp-sidebar-card">
            <div className="sp-sidebar-title sp-sidebar-title--purple">Transaction Charges</div>
            {[["Cards (India)", "2.00% + GST"], ["International", "3.00% + 30¢"], ["UPI", "0.00%"], ["Wallets", "2.00%"]].map(([k, v]) => (
              <div key={k} className="sp-charge-row"><span>{k}</span><span className={v === "0.00%" ? "sp-zero" : "sp-charge-val"}>{v}</span></div>
            ))}
          </div>
          <div className="sp-sidebar-card">
            <div className="sp-sidebar-title">Supported Methods</div>
            <div className="sp-apps-grid">
              {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "UPI", "135+ currencies"].map((a) => (
                <span key={a} className="sp-app-chip">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sp-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; max-width: 1080px; padding: 28px 32px; }
        .sp-back-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: #635BFF; font-size: 13px; font-weight: 500; padding: 0; margin-bottom: 18px; }
        .sp-back-btn:hover { text-decoration: underline; }
        .sp-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .sp-header-title { font-size: 19px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .sp-badge { font-size: 10px; font-weight: 600; background: #ede9fe; color: #7c3aed; border-radius: 20px; padding: 2px 9px; }
        .sp-header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
        .sp-body { display: flex; gap: 24px; }
        .sp-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 18px; }
        .sp-sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; }
        .sp-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
        .sp-section--terms { background: #fafafa; }
        .sp-step-label { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .sp-step-num { width: 24px; height: 24px; border-radius: 50%; background: #635BFF; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .sp-step-desc { font-size: 12px; color: #64748b; margin: 0 0 16px; }
        .sp-env-toggle { display: flex; gap: 8px; margin-bottom: 16px; }
        .sp-env-btn { padding: 6px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
        .sp-env-btn--active { border-color: #635BFF; background: #ede9fe; color: #635BFF; }
        .sp-field { display: flex; flex-direction: column; gap: 5px; }
        .sp-label { font-size: 12px; font-weight: 600; color: #374151; }
        .sp-req { color: #ef4444; }
        .sp-input-wrap { position: relative; }
        .sp-input { width: 100%; padding: 9px 40px 9px 12px; border-radius: 8px; border: 1.5px solid #e2e8f0; font-size: 13px; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .sp-input:focus { border-color: #635BFF; }
        .sp-input--valid { border-color: #16a34a; }
        .sp-input--error { border-color: #ef4444; }
        .sp-input:disabled { background: #f8fafc; color: #374151; cursor: default; }
        .sp-toggle-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; }
        .sp-error-msg { font-size: 11px; color: #ef4444; }
        .sp-error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; color: #dc2626; font-size: 13px; margin-top: 10px; }
        .sp-success-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; color: #16a34a; font-size: 13px; margin-bottom: 8px; }
        .sp-saved-bar { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #16a34a; font-weight: 500; }
        .sp-edit-link { margin-left: auto; background: none; border: none; color: #635BFF; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: underline; }
        .sp-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .sp-detail-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .sp-detail-value { font-size: 13px; font-weight: 600; color: #0f172a; }
        .sp-status-chip { display: inline-block; background: #dcfce7; color: #16a34a; border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 600; }
        .sp-opts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .sp-opt-card { display: flex; align-items: flex-start; gap: 8px; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; cursor: pointer; }
        .sp-opt-card--on { border-color: #635BFF; background: #ede9fe; }
        .sp-opt-check { margin-top: 1px; flex-shrink: 0; }
        .sp-opt-label { font-size: 12px; font-weight: 600; color: #0f172a; }
        .sp-opt-sub { font-size: 11px; color: #94a3b8; margin-top: 1px; }
        .sp-terms-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .sp-terms-list { margin: 0 0 14px; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
        .sp-terms-list li { font-size: 12px; color: #475569; line-height: 1.6; }
        .sp-agree { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: #334155; cursor: pointer; }
        .sp-agree input { width: 15px; height: 15px; accent-color: #635BFF; }
        .sp-footer { display: flex; justify-content: flex-end; gap: 10px; }
        .sp-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #635BFF; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
        .sp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .sp-btn-cancel { padding: 9px 20px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; }
        .sp-btn-activate { padding: 9px 20px; background: #635BFF; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
        .sp-btn-activate--disabled { opacity: 0.5; cursor: not-allowed; }
        .sp-sidebar-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
        .sp-sidebar-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .sp-sidebar-title--purple { color: #7c3aed; }
        .sp-how-list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 7px; }
        .sp-how-list li { font-size: 12px; color: #475569; }
        .sp-charge-row { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
        .sp-zero { color: #16a34a; font-weight: 700; }
        .sp-charge-val { font-weight: 600; color: #374151; }
        .sp-apps-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .sp-app-chip { background: #f1f5f9; border-radius: 20px; padding: 3px 9px; font-size: 11px; color: #475569; }
        @media (max-width: 768px) { .sp-body { flex-direction: column; } .sp-sidebar { width: 100%; } .sp-opts-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAYPAL COMPONENT
───────────────────────────────────────────────────────── */
function PaypalPayments({ onBack }) {
  const [clientId, setClientId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [env, setEnv] = useState("sandbox");
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [clientIdError, setClientIdError] = useState("");
  const [secretError, setSecretError] = useState("");

  // Load existing config — pre-fill client ID
  useEffect(() => {
    const load = async () => {
      try {
        const res = await gatewayPaymentService.getPaypal();
        if (res.success && res.data) {
          setClientId(res.data.paypalClientId || "");
          setEnv(res.data.environment || "sandbox");
          setSaved(true);
          setEditMode(false);
        }
      } catch { /* no config yet */ }
    };
    load();
  }, []);

  const validate = () => {
    let valid = true;
    if (!clientId.trim()) { setClientIdError("PayPal Client ID is required."); valid = false; } else setClientIdError("");
    if (!secretKey.trim()) { setSecretError("PayPal Secret Key is required."); valid = false; } else setSecretError("");
    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const res = await gatewayPaymentService.savePaypal({
        paypalClientId: clientId.trim(),
        secretKey: secretKey.trim(),
        webhookSecret: webhookSecret.trim(),
        environment: env,
      });
      if (res.success) {
        setSaved(true);
        setEditMode(false);
        setSaveSuccess("PayPal configuration saved successfully!");
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

  return (
    <div className="pp-root">
      <button className="pp-back-btn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#003087" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Back to Payment Methods
      </button>

      <div className="pp-header">
        <div className="pp-header-icon">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#EEF2FF" />
            <path d="M32 16c0 4-2.5 7-7.5 7H21l-1.5 9H16l3-18h7.5C29.5 14 32 13 32 16z" fill="#003087" />
            <path d="M34 19c0 4.5-2.8 7.5-8 7.5h-3l-1.5 8.5H18l3-19h8C33 16 34 16.5 34 19z" fill="#009CDE" />
          </svg>
        </div>
        <div>
          <div className="pp-header-title">PayPal Payment Setup <span className="pp-badge">International</span></div>
          <div className="pp-header-sub">Accept payments globally via PayPal — supports 200+ markets</div>
        </div>
      </div>

      <div className="pp-body">
        <div className="pp-main">

          {/* Step 1 */}
          <div className="pp-section">
            <div className="pp-step-label"><span className="pp-step-num">1</span>Connect Your PayPal Account</div>
            <p className="pp-step-desc">Enter your PayPal API credentials. Admin ID and business ID are linked automatically.</p>

            <div className="pp-env-toggle">
              <button className={`pp-env-btn ${env === "sandbox" ? "pp-env-btn--active" : ""}`} onClick={() => { if (editMode) setEnv("sandbox"); }}>Sandbox</button>
              <button className={`pp-env-btn ${env === "live" ? "pp-env-btn--active" : ""}`} onClick={() => { if (editMode) setEnv("live"); }}>Live</button>
            </div>

            <div className="pp-field">
              <label className="pp-label">PayPal Client ID <span className="pp-req">*</span></label>
              <input
                className={`pp-input ${clientIdError ? "pp-input--error" : clientId && !clientIdError ? "pp-input--valid" : ""}`}
                placeholder="AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRr..."
                value={clientId}
                onChange={(e) => { setClientId(e.target.value); setClientIdError(""); }}
                disabled={!editMode}
              />
              <div className="pp-hint">From developer.paypal.com → My Apps & Credentials</div>
              {clientIdError && <div className="pp-error-msg">{clientIdError}</div>}
            </div>

            <div className="pp-field" style={{ marginTop: 14 }}>
              <label className="pp-label">PayPal Secret Key <span className="pp-req">*</span>
                {!editMode && <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: 6 }}>(hidden for security)</span>}
              </label>
              <div className="pp-input-wrap">
                <input
                  className={`pp-input ${secretError ? "pp-input--error" : secretKey && !secretError ? "pp-input--valid" : ""}`}
                  type={showSecret ? "text" : "password"}
                  placeholder={editMode ? "Enter PayPal secret key" : "Enter new secret to update"}
                  value={secretKey}
                  onChange={(e) => { setSecretKey(e.target.value); setSecretError(""); }}
                  disabled={!editMode}
                />
                <button className="pp-toggle-eye" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /><path d="M2 2l12 12" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#94a3b8" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="#94a3b8" strokeWidth="1.3" /></svg>
                  }
                </button>
              </div>
              {secretError && <div className="pp-error-msg">{secretError}</div>}
            </div>

            <div className="pp-field" style={{ marginTop: 14 }}>
              <label className="pp-label">Webhook ID <span style={{ color: "#94a3b8", fontWeight: 400 }}>(Optional)</span></label>
              <input className="pp-input" placeholder="Webhook ID from PayPal dashboard" value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} disabled={!editMode} />
            </div>

            {editMode ? (
              <div style={{ marginTop: 16 }}>
                <button className="pp-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : saved ? "Update Configuration" : "Save & Activate PayPal"}
                </button>
                {saveError && <div className="pp-error-banner">{saveError}</div>}
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                {saveSuccess && <div className="pp-success-banner">{saveSuccess}</div>}
                <div className="pp-saved-bar">
                  <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  PayPal configuration saved & stored in database
                  <button className="pp-edit-link" onClick={() => { setEditMode(true); setSecretKey(""); }}>Edit</button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 — Summary */}
          {saved && !editMode && (
            <div className="pp-section">
              <div className="pp-step-label"><span className="pp-step-num">2</span>Configuration Summary</div>
              <div className="pp-details-grid">
                <div><div className="pp-detail-label">Client ID</div><div className="pp-detail-value" style={{ fontFamily: "monospace", fontSize: 11, wordBreak: "break-all" }}>{clientId.substring(0, 24)}...</div></div>
                <div><div className="pp-detail-label">Environment</div><div className="pp-detail-value">{env === "sandbox" ? "🧪 Sandbox" : "🚀 Live"}</div></div>
                <div><div className="pp-detail-label">Secret Key</div><div className="pp-detail-value">••••••••••••••••</div></div>
                <div><div className="pp-detail-label">Status</div><span className="pp-status-chip">Active</span></div>
              </div>
            </div>
          )}

          {/* Step 3 — QR Code */}
          {saved && !editMode && (
            <div className="pp-section">
              <div className="pp-step-label"><span className="pp-step-num">3</span>Generate Menu QR Code</div>
              <p className="pp-step-desc">Generate a QR code for your restaurant. Customers scan it to view your full menu.</p>
              <QRSection accentColor="#003087" />
            </div>
          )}

          {/* Terms */}
          <div className="pp-section pp-section--terms">
            <div className="pp-terms-title">Terms & Conditions</div>
            <ol className="pp-terms-list">
              <li>You must have an active PayPal Business account.</li>
              <li>All transactions are processed securely through PayPal.</li>
              <li>TableTop Leo does not store any PayPal credentials.</li>
              <li>PayPal's fees and settlement policies apply.</li>
            </ol>
            <label className="pp-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I agree to the Terms & Conditions</span>
            </label>
          </div>

          <div className="pp-footer">
            <button className="pp-btn-cancel" onClick={onBack}>Cancel</button>
            <button className={`pp-btn-activate ${!agreed || !saved ? "pp-btn-activate--disabled" : ""}`}
              disabled={!agreed || !saved} onClick={() => { if (agreed && saved) onBack(); }}>
              Done — PayPal Active
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="pp-sidebar">
          <div className="pp-sidebar-card">
            <div className="pp-sidebar-title">How to Get Credentials</div>
            <ol className="pp-how-list">
              <li>Go to <strong>developer.paypal.com</strong></li>
              <li>My Apps & Credentials</li>
              <li>Create or select an App</li>
              <li>Copy Client ID & Secret</li>
            </ol>
          </div>
          <div className="pp-sidebar-card">
            <div className="pp-sidebar-title pp-sidebar-title--blue">Transaction Charges</div>
            {[["Domestic", "2.9% + ₹3"], ["International", "4.4% + fixed"], ["Currency Conversion", "3.00%"]].map(([k, v]) => (
              <div key={k} className="pp-charge-row"><span>{k}</span><span className="pp-charge-val">{v}</span></div>
            ))}
          </div>
          <div className="pp-sidebar-card">
            <div className="pp-sidebar-title">Why PayPal?</div>
            <ul className="pp-how-list" style={{ listStyle: "disc" }}>
              <li>200+ markets worldwide</li>
              <li>Trusted by millions globally</li>
              <li>Buyer & seller protection</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .pp-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; max-width: 1080px; padding: 28px 32px; }
        .pp-back-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: #003087; font-size: 13px; font-weight: 500; padding: 0; margin-bottom: 18px; }
        .pp-back-btn:hover { text-decoration: underline; }
        .pp-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .pp-header-title { font-size: 19px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .pp-badge { font-size: 10px; font-weight: 600; background: #dbeafe; color: #1e40af; border-radius: 20px; padding: 2px 9px; }
        .pp-header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
        .pp-body { display: flex; gap: 24px; }
        .pp-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 18px; }
        .pp-sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; }
        .pp-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
        .pp-section--terms { background: #fafafa; }
        .pp-step-label { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .pp-step-num { width: 24px; height: 24px; border-radius: 50%; background: #003087; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .pp-step-desc { font-size: 12px; color: #64748b; margin: 0 0 16px; }
        .pp-env-toggle { display: flex; gap: 8px; margin-bottom: 16px; }
        .pp-env-btn { padding: 6px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
        .pp-env-btn--active { border-color: #003087; background: #eff6ff; color: #003087; }
        .pp-field { display: flex; flex-direction: column; gap: 5px; }
        .pp-label { font-size: 12px; font-weight: 600; color: #374151; }
        .pp-req { color: #ef4444; }
        .pp-input-wrap { position: relative; }
        .pp-input { width: 100%; padding: 9px 40px 9px 12px; border-radius: 8px; border: 1.5px solid #e2e8f0; font-size: 13px; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .pp-input:focus { border-color: #003087; }
        .pp-input--valid { border-color: #16a34a; }
        .pp-input--error { border-color: #ef4444; }
        .pp-input:disabled { background: #f8fafc; color: #374151; cursor: default; }
        .pp-toggle-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; }
        .pp-hint { font-size: 11px; color: #94a3b8; }
        .pp-error-msg { font-size: 11px; color: #ef4444; }
        .pp-error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; color: #dc2626; font-size: 13px; margin-top: 10px; }
        .pp-success-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; color: #16a34a; font-size: 13px; margin-bottom: 8px; }
        .pp-saved-bar { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #16a34a; font-weight: 500; }
        .pp-edit-link { margin-left: auto; background: none; border: none; color: #003087; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: underline; }
        .pp-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pp-detail-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .pp-detail-value { font-size: 13px; font-weight: 600; color: #0f172a; }
        .pp-status-chip { display: inline-block; background: #dcfce7; color: #16a34a; border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 600; }
        .pp-terms-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .pp-terms-list { margin: 0 0 14px; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
        .pp-terms-list li { font-size: 12px; color: #475569; line-height: 1.6; }
        .pp-agree { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: #334155; cursor: pointer; }
        .pp-agree input { width: 15px; height: 15px; accent-color: #003087; }
        .pp-footer { display: flex; justify-content: flex-end; gap: 10px; }
        .pp-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #003087; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
        .pp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .pp-btn-cancel { padding: 9px 20px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; }
        .pp-btn-activate { padding: 9px 20px; background: #003087; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
        .pp-btn-activate--disabled { opacity: 0.5; cursor: not-allowed; }
        .pp-sidebar-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
        .pp-sidebar-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .pp-sidebar-title--blue { color: #003087; }
        .pp-how-list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 7px; }
        .pp-how-list li { font-size: 12px; color: #475569; }
        .pp-charge-row { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
        .pp-charge-val { font-weight: 600; color: #374151; }
        @media (max-width: 768px) { .pp-body { flex-direction: column; } .pp-sidebar { width: 100%; } }
      `}</style>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────
   EXPORT ROUTER
───────────────────────────────────────────────────────── */
export default function StripePaypalPayments({ onBack, initialTab = "stripe" }) {
  const [tab] = useState(initialTab);
  if (tab === "stripe") return <StripePayments onBack={onBack} />;
  if (tab === "paypal") return <PaypalPayments onBack={onBack} />;
  return null;
}


