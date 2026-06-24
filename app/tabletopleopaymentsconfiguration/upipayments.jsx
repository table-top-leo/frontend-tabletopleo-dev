"use client";
import { useState, useEffect } from "react";
import paymentService from "../services/paymentService";
import qrService from "../services/qrService";

function validateUPIID(id) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(id);
}

export default function UPIPayments({ onBack }) {
  const [merchantName, setMerchantName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [nameError, setNameError] = useState("");

  // State flags
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // QR state
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrImageBase64, setQrImageBase64] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  // Loading / error states
  const [saving, setSaving] = useState(false);
  const [generatingQr, setGeneratingQr] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [qrError, setQrError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // On mount: try to load existing UPI config (if admin already saved before)
  useEffect(() => {
    const loadExistingConfig = async () => {
      try {
        const res = await paymentService.getUpiConfig();
        if (res.success && res.data) {
          setMerchantName(res.data.merchantName || "");
          setUpiId(res.data.upiId || "");
          setSaved(true);
          setEditMode(false);
        }
      } catch {
        // 404 means no config yet — that's fine, just show empty form
      }
    };

    const loadExistingQr = async () => {
      try {
        const res = await qrService.getMyQrCode();
        if (res.success && res.data) {
          setQrImageBase64(res.data.qrImageBase64 || "");
          setQrUrl(res.data.qrUrl || "");
          setQrGenerated(true);
        }
      } catch {
        // No QR yet — fine
      }
    };

    loadExistingConfig();
    loadExistingQr();
  }, []);

  const validate = () => {
    let valid = true;
    if (!merchantName.trim()) {
      setNameError("Merchant name is required.");
      valid = false;
    } else setNameError("");

    if (!upiId.trim()) {
      setUpiError("UPI ID is required.");
      valid = false;
    } else if (!validateUPIID(upiId)) {
      setUpiError("Enter a valid UPI ID (e.g. name@oksbi).");
      valid = false;
    } else setUpiError("");

    return valid;
  };

  // ── SAVE: calls POST /api/payment/upi/save ──────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const res = await paymentService.saveUpiConfig({
        merchantName: merchantName.trim(),
        upiId: upiId.trim().toLowerCase(),
      });

      if (res.success) {
        setSaved(true);
        setEditMode(false);
        setQrGenerated(false);
        setQrImageBase64("");
        setSaveSuccess("UPI configuration saved successfully!");
        setTimeout(() => setSaveSuccess(""), 3000);
      } else {
        setSaveError(res.message || "Failed to save. Please try again.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save configuration. Please try again.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setQrGenerated(false);
    setSaveError("");
  };

  // ── GENERATE QR: calls POST /api/qr/generate ───────────────────────────
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
        setQrError(res.message || "Failed to generate QR code.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "QR code generation failed. Please try again.";
      setQrError(msg);
    } finally {
      setGeneratingQr(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDownloadQR = () => {
    if (!qrImageBase64) return;
    const link = document.createElement("a");
    link.href = qrImageBase64;
    link.download = `tabletopleo-qr-${upiId}.png`;
    link.click();
  };

  const provider = upiId.includes("@") ? upiId.split("@")[1] : "";
  const isValidUPI = validateUPIID(upiId);

  return (
    <div className="upi-root">
      {/* Header */}
      <div className="upi-header">
        <button className="upi-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Payment Methods
        </button>
        <div className="upi-header-inner">
          <div className="upi-header-icon">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="10" fill="#EEF2FF" />
              <path d="M24 8L36 16V32L24 40L12 32V16L24 8Z" fill="#3b82f6" opacity="0.15" />
              <path d="M18 20L24 14L30 20V30L24 34L18 30V20Z" fill="#3b82f6" />
              <path d="M24 14V34M18 20L30 30M30 20L18 30" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="upi-header-title">
              UPI Payment Setup
              <span className="upi-badge">Recommended</span>
            </div>
            <div className="upi-header-sub">Accept instant payments directly into your bank account using UPI</div>
          </div>
        </div>
      </div>

      <div className="upi-body">
        <div className="upi-main">

          {/* Step 1 — Merchant Details */}
          <div className="upi-section">
            <div className="upi-step-label">
              <span className="upi-step-num">1</span>
              Merchant Details
            </div>
            <p className="upi-step-desc">Enter your merchant name and UPI ID. Your admin ID and business ID are linked automatically from your account.</p>

            <div className="upi-form-row">
              <div className="upi-field">
                <label className="upi-label">Merchant Name <span className="upi-req">*</span></label>
                <input
                  className={`upi-input ${nameError ? "upi-input--error" : merchantName && !nameError ? "upi-input--valid" : ""}`}
                  placeholder="As per bank account (e.g. Brew & Beans Cafe)"
                  value={merchantName}
                  onChange={(e) => { setMerchantName(e.target.value); if (nameError) setNameError(""); }}
                  disabled={!editMode}
                />
                {nameError && <div className="upi-error-msg">{nameError}</div>}
              </div>

              <div className="upi-field">
                <label className="upi-label">UPI ID <span className="upi-req">*</span></label>
                <div className="upi-input-wrap">
                  <input
                    className={`upi-input ${upiError ? "upi-input--error" : isValidUPI && upiId ? "upi-input--valid" : ""}`}
                    placeholder="yourname@oksbi"
                    value={upiId}
                    onChange={(e) => { setUpiId(e.target.value.toLowerCase()); if (upiError) setUpiError(""); }}
                    disabled={!editMode}
                  />
                  {isValidUPI && upiId && (
                    <span className="upi-input-check">
                      <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  )}
                </div>
                {upiError && <div className="upi-error-msg">{upiError}</div>}
                <div className="upi-examples">
                  Examples:&nbsp;
                  {["name@oksbi", "name@ybl", "name@paytm", "name@icici"].map((ex) => (
                    <button key={ex} className="upi-example-chip" onClick={() => { if (editMode) setUpiId(ex); }}>{ex}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save / Update button */}
            {editMode ? (
              <div>
                <button className="upi-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : (saved ? "Update Configuration" : "Save & Continue")}
                </button>
                {saveError && <div className="upi-error-banner">{saveError}</div>}
              </div>
            ) : (
              <div>
                {saveSuccess && <div className="upi-success-banner">{saveSuccess}</div>}
                <div className="upi-saved-bar">
                  <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Configuration saved & stored in database
                  <button className="upi-edit-link" onClick={handleEdit}>Edit</button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 — UPI Details (after save) */}
          {saved && !editMode && (
            <div className="upi-section">
              <div className="upi-step-label">
                <span className="upi-step-num">2</span>
                Your UPI Configuration
              </div>
              <div className="upi-details-grid">
                <div className="upi-detail-item">
                  <div>
                    <div className="upi-detail-label">Merchant Name</div>
                    <div className="upi-detail-value">{merchantName}</div>
                  </div>
                </div>
                <div className="upi-detail-item">
                  <div>
                    <div className="upi-detail-label">UPI ID</div>
                    <div className="upi-detail-value">{upiId}</div>
                  </div>
                </div>
                <div className="upi-detail-item">
                  <div>
                    <div className="upi-detail-label">UPI Provider</div>
                    <div className="upi-detail-value">{provider.toUpperCase() || "—"}</div>
                  </div>
                </div>
                <div className="upi-detail-item">
                  <div>
                    <div className="upi-detail-label">Status</div>
                    <span className="upi-status-chip">Active & Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Generate QR Code */}
          {saved && !editMode && (
            <div className="upi-section">
              <div className="upi-step-label">
                <span className="upi-step-num">3</span>
                Generate Menu QR Code
              </div>
              <p className="upi-step-desc">
                Generate a QR code for your restaurant. When customers scan it, they will see your full menu with categories, products, prices, and business info.
              </p>

              {qrError && <div className="upi-error-banner">{qrError}</div>}

              {!qrGenerated ? (
                <button className="upi-btn-primary" onClick={handleGenerateQR} disabled={generatingQr}>
                  {generatingQr ? (
                    <span>Generating QR...</span>
                  ) : (
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
                <div className="upi-qr-area">
                  <div className="upi-qr-card">
                    <div className="upi-qr-merchant">{merchantName}</div>
                    <div className="upi-qr-sub">Scan to view menu & order</div>
                    <img
                      src={qrImageBase64}
                      alt="TableTop Leo Menu QR Code"
                      className="upi-qr-img"
                    />
                    <div className="upi-qr-id">{qrUrl}</div>
                  </div>
                  <div className="upi-qr-actions">
                    <button className="upi-btn-outline" onClick={handleDownloadQR}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v8M4 7l3.5 3.5L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 13h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                      Download QR
                    </button>
                    <button className="upi-btn-outline" onClick={handleCopyUrl}>
                      {copySuccess ? "Copied!" : "Copy Menu URL"}
                    </button>
                    <button className="upi-btn-ghost" onClick={handleGenerateQR} disabled={generatingQr}>
                      {generatingQr ? "Regenerating..." : "Regenerate QR"}
                    </button>
                  </div>
                </div>
              )}

              {qrGenerated && (
                <div className="upi-qr-info">
                  <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#3b82f6"/><path d="M7 4v3M7 9v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span>When a customer scans this QR code, their phone will open: <strong>{qrUrl}</strong> — showing your full menu including all categories and products.</span>
                </div>
              )}
            </div>
          )}

          {/* Terms */}
          <div className="upi-section upi-section--terms">
            <div className="upi-terms-title">Terms & Conditions</div>
            <ol className="upi-terms-list">
              <li>You must provide a valid and active UPI ID.</li>
              <li>Payments made by customers will be transferred directly to your bank account.</li>
              <li>TableTop Leo does not hold or store any customer payments.</li>
              <li>Failed transactions or delays should be resolved with your bank or UPI provider.</li>
              <li>You are responsible for issuing refunds to customers if required.</li>
              <li>Ensure compliance with all applicable laws and regulations.</li>
              <li>We reserve the right to disable UPI payments if misuse is detected.</li>
            </ol>
            <label className="upi-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I agree to the Terms & Conditions</span>
            </label>
          </div>

          {/* Footer */}
          <div className="upi-footer">
            <button className="upi-btn-cancel" onClick={onBack}>Cancel</button>
            <button
              className={`upi-btn-activate ${!agreed || !saved ? "upi-btn-activate--disabled" : ""}`}
              disabled={!agreed || !saved}
              onClick={() => {
                if (agreed && saved) {
                  onBack();
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Done — UPI Active
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="upi-sidebar">
          <div className="upi-sidebar-card">
            <div className="upi-sidebar-title">How It Works</div>
            <ol className="upi-how-list">
              <li>Enter your UPI ID and merchant name</li>
              <li>Click Save — stored in database</li>
              <li>Click Generate QR Code</li>
              <li>Print & place QR at your table/counter</li>
              <li>Customer scans → sees your full menu</li>
            </ol>
          </div>

          <div className="upi-sidebar-card">
            <div className="upi-sidebar-title">What the QR Contains</div>
            <ul className="upi-how-list" style={{ listStyle: "disc" }}>
              <li>Your business name & logo</li>
              <li>All menu categories</li>
              <li>All products with prices</li>
              <li>Business address & hours</li>
              <li>Contact information</li>
            </ul>
          </div>

          <div className="upi-sidebar-card">
            <div className="upi-sidebar-title upi-sidebar-title--green">Transaction Charges</div>
            <div className="upi-charge-row"><span>Platform Fee</span><span className="upi-zero">₹0</span></div>
            <div className="upi-charge-row"><span>Gateway Fee</span><span className="upi-zero">₹0</span></div>
            <div className="upi-charge-row upi-charge-row--total"><span>Total Charges</span><span className="upi-zero">₹0</span></div>
          </div>

          <div className="upi-sidebar-card">
            <div className="upi-sidebar-title">Supported UPI Apps</div>
            <div className="upi-apps-grid">
              {["Google Pay", "PhonePe", "Paytm", "BHIM", "Amazon Pay", "& More"].map((app) => (
                <span key={app} className="upi-app-chip">{app}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .upi-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; max-width: 1080px; padding: 28px 32px; }
        .upi-back-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: #3b82f6; font-size: 13px; font-weight: 500; padding: 0; margin-bottom: 18px; }
        .upi-back-btn:hover { text-decoration: underline; }
        .upi-header { margin-bottom: 24px; }
        .upi-header-inner { display: flex; align-items: center; gap: 14px; }
        .upi-header-title { font-size: 19px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .upi-badge { font-size: 10px; font-weight: 600; background: #dcfce7; color: #16a34a; border-radius: 20px; padding: 2px 9px; }
        .upi-header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
        .upi-body { display: flex; gap: 24px; }
        .upi-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 18px; }
        .upi-sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; }
        .upi-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
        .upi-section--terms { background: #fafafa; }
        .upi-step-label { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .upi-step-num { width: 24px; height: 24px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .upi-step-desc { font-size: 12px; color: #64748b; margin: 0 0 16px; }
        .upi-form-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
        .upi-field { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 6px; }
        .upi-label { font-size: 12px; font-weight: 600; color: #374151; }
        .upi-req { color: #ef4444; }
        .upi-input-wrap { position: relative; }
        .upi-input { width: 100%; padding: 9px 36px 9px 12px; border-radius: 8px; border: 1.5px solid #e2e8f0; font-size: 13px; color: #0f172a; background: #fff; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .upi-input:focus { border-color: #3b82f6; }
        .upi-input--valid { border-color: #16a34a; }
        .upi-input--error { border-color: #ef4444; }
        .upi-input:disabled { background: #f8fafc; color: #64748b; cursor: not-allowed; }
        .upi-input-check { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); }
        .upi-error-msg { font-size: 11px; color: #ef4444; }
        .upi-examples { font-size: 11px; color: #64748b; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
        .upi-example-chip { background: #f1f5f9; border: none; border-radius: 4px; padding: 2px 7px; font-size: 11px; color: #475569; cursor: pointer; font-family: monospace; }
        .upi-example-chip:hover { background: #dbeafe; color: #2563eb; }
        .upi-error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; color: #dc2626; font-size: 13px; margin-top: 10px; }
        .upi-success-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; color: #16a34a; font-size: 13px; margin-bottom: 8px; }
        .upi-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #3b82f6; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .upi-btn-primary:hover:not(:disabled) { background: #2563eb; }
        .upi-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .upi-saved-bar { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #16a34a; font-weight: 500; }
        .upi-edit-link { margin-left: auto; background: none; border: none; color: #3b82f6; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: underline; }
        .upi-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .upi-detail-item { display: flex; align-items: flex-start; gap: 10px; }
        .upi-detail-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .upi-detail-value { font-size: 13px; font-weight: 600; color: #0f172a; }
        .upi-status-chip { display: inline-block; background: #dcfce7; color: #16a34a; border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 600; }
        .upi-qr-area { display: flex; gap: 20px; flex-wrap: wrap; }
        .upi-qr-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; text-align: center; min-width: 180px; }
        .upi-qr-merchant { font-size: 14px; font-weight: 700; color: #0f172a; }
        .upi-qr-sub { font-size: 11px; color: #64748b; margin-bottom: 12px; }
        .upi-qr-img { width: 200px; height: 200px; border-radius: 8px; display: block; margin: 0 auto; }
        .upi-qr-id { font-size: 10px; color: #94a3b8; margin-top: 8px; font-family: monospace; word-break: break-all; }
        .upi-qr-actions { display: flex; flex-direction: column; gap: 8px; justify-content: flex-start; padding-top: 4px; }
        .upi-qr-info { display: flex; gap: 8px; align-items: flex-start; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #1e40af; margin-top: 12px; }
        .upi-btn-outline { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border: 1.5px solid #3b82f6; background: transparent; color: #3b82f6; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .upi-btn-outline:hover { background: #eff6ff; }
        .upi-btn-ghost { padding: 8px 14px; background: none; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
        .upi-btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; }
        .upi-btn-ghost:hover:not(:disabled) { border-color: #94a3b8; }
        .upi-terms-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .upi-terms-list { margin: 0 0 14px; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
        .upi-terms-list li { font-size: 12px; color: #475569; line-height: 1.6; }
        .upi-agree { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: #334155; cursor: pointer; }
        .upi-agree input { width: 15px; height: 15px; accent-color: #3b82f6; }
        .upi-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
        .upi-btn-cancel { padding: 9px 20px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; }
        .upi-btn-cancel:hover { border-color: #94a3b8; }
        .upi-btn-activate { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: #3b82f6; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .upi-btn-activate:hover:not(.upi-btn-activate--disabled) { background: #2563eb; }
        .upi-btn-activate--disabled { opacity: 0.5; cursor: not-allowed; }
        .upi-sidebar-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
        .upi-sidebar-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .upi-sidebar-title--green { color: #16a34a; }
        .upi-how-list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 7px; }
        .upi-how-list li { font-size: 12px; color: #475569; }
        .upi-charge-row { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
        .upi-charge-row--total { font-weight: 700; color: #0f172a; border-bottom: none; padding-top: 8px; }
        .upi-zero { color: #16a34a; font-weight: 700; }
        .upi-apps-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .upi-app-chip { background: #f1f5f9; border-radius: 20px; padding: 3px 10px; font-size: 11px; color: #475569; }
        @media (max-width: 768px) {
          .upi-body { flex-direction: column; }
          .upi-sidebar { width: 100%; }
          .upi-details-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
