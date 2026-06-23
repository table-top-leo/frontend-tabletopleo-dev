import { useState, useRef } from "react";

const UPI_PROVIDERS = ["oksbi", "ybl", "paytm", "icici", "upi", "apl", "ibl", "axl"];

function validateUPIID(id) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(id);
}

function generateQRDataURL(upiId, merchantName) {
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&cu=INR`;
  // We'll render QR via a canvas-based approach using the upiString
  return upiString;
}

export default function UPIPayments({ onBack }) {
  const [merchantName, setMerchantName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [nameError, setNameError] = useState("");
  const [saved, setSaved] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [editMode, setEditMode] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const qrCanvasRef = useRef(null);

  const validate = () => {
    let valid = true;
    if (!merchantName.trim()) { setNameError("Merchant name is required."); valid = false; } else setNameError("");
    if (!upiId.trim()) { setUpiError("UPI ID is required."); valid = false; }
    else if (!validateUPIID(upiId)) { setUpiError("Enter a valid UPI ID (e.g. name@oksbi)."); valid = false; }
    else setUpiError("");
    return valid;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaved(true);
    setEditMode(false);
    setQrGenerated(false);
    setQrUrl("");
  };

  const handleEdit = () => {
    setEditMode(true);
    setQrGenerated(false);
  };

  const handleGenerateQR = () => {
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&cu=INR`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;
    setQrUrl(qrApiUrl);
    setQrGenerated(true);
  };

  const handleCopyUrl = () => {
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&cu=INR`;
    navigator.clipboard.writeText(upiString).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `upi-qr-${upiId}.png`;
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

          {/* Step 1 */}
          <div className="upi-section">
            <div className="upi-step-label">
              <span className="upi-step-num">1</span>
              Merchant Details
            </div>
            <p className="upi-step-desc">Enter your merchant name (as per bank) and UPI ID to receive payments.</p>

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
                    <button
                      key={ex}
                      className="upi-example-chip"
                      onClick={() => { if (editMode) setUpiId(ex); }}
                    >{ex}</button>
                  ))}
                </div>
              </div>
            </div>

            {editMode ? (
              <button className="upi-btn-primary" onClick={handleSave}>
                Save &amp; Continue
              </button>
            ) : (
              <div className="upi-saved-bar">
                <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#16a34a" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Details saved successfully
                <button className="upi-edit-link" onClick={handleEdit}>Edit</button>
              </div>
            )}
          </div>

          {/* Step 2 — Details after save */}
          {saved && !editMode && (
            <div className="upi-section">
              <div className="upi-step-label">
                <span className="upi-step-num">2</span>
                UPI Details
              </div>
              <div className="upi-details-grid">
                <div className="upi-detail-item">
                  <span className="upi-detail-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#94a3b8" strokeWidth="1.5" fill="none" /><path d="M8 5v4M8 11v.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </span>
                  <div>
                    <div className="upi-detail-label">Merchant Name</div>
                    <div className="upi-detail-value">{merchantName}</div>
                  </div>
                </div>
                <div className="upi-detail-item">
                  <span className="upi-detail-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="2" stroke="#94a3b8" strokeWidth="1.5" fill="none" /><path d="M2 7h12" stroke="#94a3b8" strokeWidth="1.5" /></svg>
                  </span>
                  <div>
                    <div className="upi-detail-label">UPI ID</div>
                    <div className="upi-detail-value">{upiId}</div>
                  </div>
                </div>
                <div className="upi-detail-item">
                  <span className="upi-detail-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#94a3b8" strokeWidth="1.5" fill="none" /><path d="M8 5v3l2 2" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </span>
                  <div>
                    <div className="upi-detail-label">UPI Provider</div>
                    <div className="upi-detail-value">{provider.toUpperCase() || "—"}</div>
                  </div>
                </div>
                <div className="upi-detail-item">
                  <span className="upi-detail-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#94a3b8" strokeWidth="1.5" fill="none" /><path d="M5 8l2 2 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <div>
                    <div className="upi-detail-label">Status</div>
                    <span className="upi-status-chip">Active &amp; Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — QR Code */}
          {saved && !editMode && (
            <div className="upi-section">
              <div className="upi-step-label">
                <span className="upi-step-num">3</span>
                Generate QR Code
              </div>
              <p className="upi-step-desc">Generate a QR code to display at your counter or share with customers.</p>

              {!qrGenerated ? (
                <button className="upi-btn-primary" onClick={handleGenerateQR}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="10" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
                  </svg>
                  Generate QR Code
                </button>
              ) : (
                <div className="upi-qr-area">
                  <div className="upi-qr-card">
                    <div className="upi-qr-merchant">{merchantName}</div>
                    <div className="upi-qr-sub">Scan & Pay with any UPI App</div>
                    <img
                      src={qrUrl}
                      alt="UPI QR Code"
                      className="upi-qr-img"
                      onError={(e) => { e.target.src = "data:image/svg+xml,..."; }}
                    />
                    <div className="upi-qr-id">{upiId}</div>
                  </div>
                  <div className="upi-qr-actions">
                    <button className="upi-btn-outline" onClick={handleDownloadQR}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v8M4 7l3.5 3.5L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 13h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                      Download QR
                    </button>
                    <button className="upi-btn-outline" onClick={handleCopyUrl}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 5V3.5A1.5 1.5 0 008.5 2h-5A1.5 1.5 0 002 3.5v5A1.5 1.5 0 003.5 10H5" stroke="currentColor" strokeWidth="1.5" /></svg>
                      {copySuccess ? "Copied!" : "Copy UPI URL"}
                    </button>
                    <button className="upi-btn-ghost" onClick={() => { setQrGenerated(false); setQrUrl(""); handleGenerateQR(); }}>
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Terms */}
          <div className="upi-section upi-section--terms">
            <div className="upi-terms-title">Terms &amp; Conditions</div>
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
              <span>I agree to the Terms &amp; Conditions</span>
            </label>
          </div>

          {/* Pros & Cons + Important Notes */}
          <div className="upi-info-row">
            <div className="upi-info-card upi-info-card--pros">
              <div className="upi-info-title">
                <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#16a34a" /><path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Pros
              </div>
              <ul>
                <li>Zero platform fee</li>
                <li>Instant settlement to bank</li>
                <li>Supports all UPI apps</li>
                <li>Easy to setup and use</li>
                <li>100% secure &amp; reliable</li>
              </ul>
            </div>
            <div className="upi-info-card upi-info-card--cons">
              <div className="upi-info-title">
                <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#dc2626" /><path d="M5 5l4 4M9 5L5 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                Limitations
              </div>
              <ul>
                <li>Refunds must be processed manually</li>
                <li>No automatic order cancellation on failed payment</li>
                <li>Transaction tracking depends on UPI notifications</li>
              </ul>
            </div>
            <div className="upi-info-card upi-info-card--notes">
              <div className="upi-info-title">
                <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#f59e0b" /><path d="M7 4v3M7 9v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                Important Notes
              </div>
              <ul>
                <li>UPI payments are instant and cannot be charged back</li>
                <li>Keep your UPI ID active to continue receiving payments</li>
                <li>You will receive payment notifications in your UPI app</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="upi-footer">
            <button className="upi-btn-cancel" onClick={onBack}>Cancel</button>
            <button
              className={`upi-btn-activate ${!agreed || !saved ? "upi-btn-activate--disabled" : ""}`}
              disabled={!agreed || !saved}
            >
              <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" /><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Save &amp; Activate UPI
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="upi-sidebar">
          <div className="upi-sidebar-card">
            <div className="upi-sidebar-title">How UPI Payments Work</div>
            <ol className="upi-how-list">
              <li>Customer scans your QR code</li>
              <li>Enters amount &amp; confirms</li>
              <li>Payment goes directly to your bank</li>
              <li>You receive instant notification</li>
            </ol>
          </div>

          <div className="upi-sidebar-card">
            <div className="upi-sidebar-title upi-sidebar-title--green">Transaction Charges</div>
            <div className="upi-charge-row"><span>Platform Fee</span><span className="upi-zero">₹0</span></div>
            <div className="upi-charge-row"><span>Gateway Fee</span><span className="upi-zero">₹0</span></div>
            <div className="upi-charge-row upi-charge-row--total"><span>Total Charges</span><span className="upi-zero">₹0</span></div>
            <div className="upi-direct-badge">
              <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#16a34a" /><path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              100% Direct Payment to Bank
            </div>
          </div>

          <div className="upi-sidebar-card">
            <div className="upi-sidebar-title">Supported UPI Apps</div>
            <div className="upi-apps-grid">
              {["Google Pay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"].map((app) => (
                <span key={app} className="upi-app-chip">{app}</span>
              ))}
              <span className="upi-app-chip">& More</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .upi-root {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1a1a2e;
          max-width: 1080px;
          padding: 28px 32px;
        }
        .upi-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #3b82f6; font-size: 13px; font-weight: 500;
          padding: 0; margin-bottom: 18px;
        }
        .upi-back-btn:hover { text-decoration: underline; }
        .upi-header { margin-bottom: 24px; }
        .upi-header-inner { display: flex; align-items: center; gap: 14px; }
        .upi-header-title { font-size: 19px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .upi-badge { font-size: 10px; font-weight: 600; background: #dcfce7; color: #16a34a; border-radius: 20px; padding: 2px 9px; }
        .upi-header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
        .upi-body { display: flex; gap: 24px; }
        .upi-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 18px; }
        .upi-sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; }

        .upi-section {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 12px; padding: 20px;
        }
        .upi-section--terms { background: #fafafa; }
        .upi-step-label {
          display: flex; align-items: center; gap: 10px;
          font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px;
        }
        .upi-step-num {
          width: 24px; height: 24px; border-radius: 50%;
          background: #3b82f6; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        .upi-step-desc { font-size: 12px; color: #64748b; margin: 0 0 16px; }
        .upi-form-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
        .upi-field { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 6px; }
        .upi-label { font-size: 12px; font-weight: 600; color: #374151; }
        .upi-req { color: #ef4444; }
        .upi-input-wrap { position: relative; }
        .upi-input {
          width: 100%; padding: 9px 36px 9px 12px; border-radius: 8px;
          border: 1.5px solid #e2e8f0; font-size: 13px;
          color: #0f172a; background: #fff;
          outline: none; transition: border-color 0.15s; box-sizing: border-box;
        }
        .upi-input:focus { border-color: #3b82f6; }
        .upi-input--valid { border-color: #16a34a; }
        .upi-input--error { border-color: #ef4444; }
        .upi-input:disabled { background: #f8fafc; color: #64748b; cursor: not-allowed; }
        .upi-input-check { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); }
        .upi-error-msg { font-size: 11px; color: #ef4444; }
        .upi-examples { font-size: 11px; color: #64748b; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
        .upi-example-chip {
          background: #f1f5f9; border: none; border-radius: 4px;
          padding: 2px 7px; font-size: 11px; color: #475569;
          cursor: pointer; font-family: monospace;
        }
        .upi-example-chip:hover { background: #dbeafe; color: #2563eb; }

        .upi-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 20px; background: #3b82f6; border: none;
          border-radius: 8px; color: #fff; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: background 0.15s;
        }
        .upi-btn-primary:hover { background: #2563eb; }
        .upi-saved-bar {
          display: flex; align-items: center; gap: 8px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 8px; padding: 10px 14px;
          font-size: 13px; color: #16a34a; font-weight: 500;
        }
        .upi-edit-link {
          margin-left: auto; background: none; border: none;
          color: #3b82f6; font-size: 12px; font-weight: 600;
          cursor: pointer; text-decoration: underline;
        }

        .upi-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .upi-detail-item { display: flex; align-items: flex-start; gap: 10px; }
        .upi-detail-icon { margin-top: 2px; flex-shrink: 0; }
        .upi-detail-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .upi-detail-value { font-size: 13px; font-weight: 600; color: #0f172a; }
        .upi-status-chip {
          display: inline-block; background: #dcfce7; color: #16a34a;
          border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 600;
        }

        .upi-qr-area { display: flex; gap: 20px; flex-wrap: wrap; }
        .upi-qr-card {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 12px; padding: 16px 20px;
          text-align: center; min-width: 180px;
        }
        .upi-qr-merchant { font-size: 14px; font-weight: 700; color: #0f172a; }
        .upi-qr-sub { font-size: 11px; color: #64748b; margin-bottom: 12px; }
        .upi-qr-img { width: 160px; height: 160px; border-radius: 8px; display: block; margin: 0 auto; }
        .upi-qr-id { font-size: 11px; color: #94a3b8; margin-top: 8px; font-family: monospace; }
        .upi-qr-actions { display: flex; flex-direction: column; gap: 8px; justify-content: flex-start; padding-top: 4px; }
        .upi-btn-outline {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 14px; border: 1.5px solid #3b82f6;
          background: transparent; color: #3b82f6;
          border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .upi-btn-outline:hover { background: #eff6ff; }
        .upi-btn-ghost {
          padding: 8px 14px; background: none; border: 1.5px solid #e2e8f0;
          border-radius: 8px; font-size: 12px; font-weight: 600;
          color: #64748b; cursor: pointer;
        }
        .upi-btn-ghost:hover { border-color: #94a3b8; }

        /* Terms */
        .upi-terms-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .upi-terms-list { margin: 0 0 14px; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
        .upi-terms-list li { font-size: 12px; color: #475569; line-height: 1.6; }
        .upi-agree { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: #334155; cursor: pointer; }
        .upi-agree input { width: 15px; height: 15px; accent-color: #3b82f6; }

        /* Info row */
        .upi-info-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .upi-info-card {
          border-radius: 10px; padding: 14px 16px;
          border: 1px solid #e2e8f0;
        }
        .upi-info-card--pros { background: #f0fdf4; border-color: #bbf7d0; }
        .upi-info-card--cons { background: #fef2f2; border-color: #fecaca; }
        .upi-info-card--notes { background: #fffbeb; border-color: #fde68a; }
        .upi-info-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; margin-bottom: 10px; color: #1e293b; }
        .upi-info-card ul { margin: 0; padding-left: 14px; display: flex; flex-direction: column; gap: 5px; }
        .upi-info-card ul li { font-size: 11px; color: #475569; line-height: 1.5; }

        /* Footer */
        .upi-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
        .upi-btn-cancel {
          padding: 9px 20px; border: 1.5px solid #e2e8f0;
          background: #fff; border-radius: 8px; color: #64748b;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .upi-btn-cancel:hover { border-color: #94a3b8; }
        .upi-btn-activate {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 20px; background: #3b82f6; border: none;
          border-radius: 8px; color: #fff; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: background 0.15s;
        }
        .upi-btn-activate:hover:not(.upi-btn-activate--disabled) { background: #2563eb; }
        .upi-btn-activate--disabled { opacity: 0.5; cursor: not-allowed; }

        /* Sidebar */
        .upi-sidebar-card {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 14px 16px;
        }
        .upi-sidebar-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .upi-sidebar-title--green { color: #16a34a; }
        .upi-how-list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 7px; }
        .upi-how-list li { font-size: 12px; color: #475569; }
        .upi-charge-row { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
        .upi-charge-row--total { font-weight: 700; color: #0f172a; border-bottom: none; padding-top: 8px; }
        .upi-zero { color: #16a34a; font-weight: 700; }
        .upi-direct-badge {
          display: flex; align-items: center; gap: 6px;
          background: #f0fdf4; border-radius: 6px; padding: 6px 10px;
          font-size: 11px; color: #16a34a; font-weight: 600; margin-top: 10px;
        }
        .upi-apps-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .upi-app-chip {
          background: #f1f5f9; border-radius: 20px;
          padding: 3px 10px; font-size: 11px; color: #475569;
        }

        @media (max-width: 768px) {
          .upi-body { flex-direction: column; }
          .upi-sidebar { width: 100%; }
          .upi-details-grid { grid-template-columns: 1fr; }
          .upi-info-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}