"use client";
import { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader, Copy, Download } from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.tabletopleo.com/api";

export default function MobilePayPayments({ onBack, adminId, businessId }) {
  const [loading, setLoading] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [form, setForm] = useState({
    merchantSerialNumber: "",
    clientId: "",
    clientSecret: "",
    subscriptionKey: "",
    webhookSecret: "",
    environment: "sandbox",
    currencyCode: "DKK",
    enableQrCode: true,
  });

  const [showPasswords, setShowPasswords] = useState({
    clientSecret: false,
    subscriptionKey: false,
    webhookSecret: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const validateForm = () => {
    const newErrors = {};
    if (!form.merchantSerialNumber?.trim()) newErrors.merchantSerialNumber = "Merchant Serial Number required";
    if (!form.clientId?.trim()) newErrors.clientId = "Client ID required";
    if (!form.clientSecret?.trim()) newErrors.clientSecret = "Client Secret required";
    if (!form.subscriptionKey?.trim()) newErrors.subscriptionKey = "Subscription Key required";
    if (!form.webhookSecret?.trim()) newErrors.webhookSecret = "Webhook Secret required";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        businessId: businessId || "",
        adminId: adminId || "",
        merchantSerialNumber: form.merchantSerialNumber,
        clientId: form.clientId,
        clientSecret: form.clientSecret,
        subscriptionKey: form.subscriptionKey,
        webhookSecret: form.webhookSecret,
        environment: form.environment,
        currencyCode: form.currencyCode,
        enableQrCode: form.enableQrCode,
      };

      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_BASE_URL}/payment/mobilepay/config/save`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuccess("✓ MobilePay configuration saved successfully!");
        setConfigSaved(true);

        // Generate QR for merchant
        const qrData = {
          merchant: form.merchantSerialNumber,
          env: form.environment,
          currency: form.currencyCode,
          saved: true,
        };
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`;
        setGeneratedQR(qrUrl);
        setShowQRModal(true);

        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to save configuration");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error saving configuration. Check backend on port 6163");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: "" }));
  };

  const togglePasswordField = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="payment-config-container">
      {/* Header */}
      <div className="payment-config-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div>
          <h1 className="config-title">Mobile Pay Configuration</h1>
          <p className="config-subtitle">Setup your MobilePay Business API credentials</p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <div className="config-card">
        {/* Section 1: Merchant Credentials */}
        <div className="config-section">
          <h2 className="section-title">Merchant Credentials</h2>
          <p className="section-description">Enter your MobilePay Business API credentials</p>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Merchant Serial Number *</label>
              <input
                type="text"
                placeholder="e.g., MERCHANT123456"
                value={form.merchantSerialNumber}
                onChange={(e) => handleFieldChange("merchantSerialNumber", e.target.value)}
                disabled={configSaved}
                className={`form-input ${formErrors.merchantSerialNumber ? "input-error" : form.merchantSerialNumber ? "input-valid" : ""}`}
              />
              {formErrors.merchantSerialNumber && <span className="error-text">{formErrors.merchantSerialNumber}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Client ID *</label>
              <input
                type="text"
                placeholder="e.g., 123e4567-e89b-12d3"
                value={form.clientId}
                onChange={(e) => handleFieldChange("clientId", e.target.value)}
                disabled={configSaved}
                className={`form-input ${formErrors.clientId ? "input-error" : form.clientId ? "input-valid" : ""}`}
              />
              {formErrors.clientId && <span className="error-text">{formErrors.clientId}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Client Secret *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.clientSecret ? "text" : "password"}
                  placeholder="Your client secret"
                  value={form.clientSecret}
                  onChange={(e) => handleFieldChange("clientSecret", e.target.value)}
                  disabled={configSaved}
                  className={`form-input ${formErrors.clientSecret ? "input-error" : form.clientSecret ? "input-valid" : ""}`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordField("clientSecret")}
                  disabled={configSaved}
                >
                  {showPasswords.clientSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.clientSecret && <span className="error-text">{formErrors.clientSecret}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Subscription Key *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.subscriptionKey ? "text" : "password"}
                  placeholder="Your subscription key"
                  value={form.subscriptionKey}
                  onChange={(e) => handleFieldChange("subscriptionKey", e.target.value)}
                  disabled={configSaved}
                  className={`form-input ${formErrors.subscriptionKey ? "input-error" : form.subscriptionKey ? "input-valid" : ""}`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordField("subscriptionKey")}
                  disabled={configSaved}
                >
                  {showPasswords.subscriptionKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.subscriptionKey && <span className="error-text">{formErrors.subscriptionKey}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Webhook Secret *</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.webhookSecret ? "text" : "password"}
                placeholder="Your webhook secret"
                value={form.webhookSecret}
                onChange={(e) => handleFieldChange("webhookSecret", e.target.value)}
                disabled={configSaved}
                className={`form-input ${formErrors.webhookSecret ? "input-error" : form.webhookSecret ? "input-valid" : ""}`}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordField("webhookSecret")}
                disabled={configSaved}
              >
                {showPasswords.webhookSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formErrors.webhookSecret && <span className="error-text">{formErrors.webhookSecret}</span>}
          </div>
        </div>

        {/* Section 2: Settings */}
        <div className="config-section">
          <h2 className="section-title">Settings</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Environment</label>
              <select
                value={form.environment}
                onChange={(e) => handleFieldChange("environment", e.target.value)}
                disabled={configSaved}
                className="form-select"
              >
                <option value="sandbox">🧪 Sandbox (Testing)</option>
                <option value="production">🚀 Production (Live)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                value={form.currencyCode}
                onChange={(e) => handleFieldChange("currencyCode", e.target.value)}
                disabled={configSaved}
                className="form-select"
              >
                <option value="DKK">DKK - Danish Krone</option>
                <option value="EUR">EUR - Euro</option>
                <option value="SEK">SEK - Swedish Krona</option>
                <option value="NOK">NOK - Norwegian Krone</option>
              </select>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.enableQrCode}
                onChange={(e) => handleFieldChange("enableQrCode", e.target.checked)}
                disabled={configSaved}
              />
              <span>Enable QR Code generation for payments</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button onClick={onBack} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || configSaved}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <Loader size={16} className="spinner" /> Saving...
              </>
            ) : configSaved ? (
              <>
                <CheckCircle size={16} /> Saved ✓
              </>
            ) : (
              "Save Configuration"
            )}
          </button>
        </div>

        {/* Success Info */}
        {configSaved && (
          <div className="success-info-box">
            <CheckCircle size={20} className="success-icon" />
            <div>
              <p className="success-title">Configuration Saved!</p>
              <p className="success-description">Your MobilePay is now configured. Customers can pay using MobilePay in the payment page.</p>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && generatedQR && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowQRModal(false)}>
              ✕
            </button>

            <h2 className="modal-title">MobilePay Merchant QR Code</h2>

            <div className="qr-container">
              <img src={generatedQR} alt="MobilePay QR" className="qr-image" />
            </div>

            <div className="qr-info">
              <p><strong>Merchant:</strong> {form.merchantSerialNumber}</p>
              <p><strong>Environment:</strong> {form.environment.toUpperCase()}</p>
              <p><strong>Currency:</strong> {form.currencyCode}</p>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => copyToClipboard(generatedQR)}
                className="btn btn-secondary"
              >
                {copied ? "✓ Copied" : <Copy size={14} />} Copy Link
              </button>
              <a href={generatedQR} download="mobilepay-qr.png" className="btn btn-primary">
                <Download size={14} /> Download QR
              </a>
              <button onClick={() => setShowQRModal(false)} className="btn btn-secondary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .payment-config-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .payment-config-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 28px;
        }

        .back-button {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s;
          margin-top: -8px;
        }

        .back-button:hover {
          background: #eff6ff;
        }

        .config-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .config-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
          font-size: 13px;
        }

        .alert-success {
          background: #f0fdf4;
          border: 1px solid #86efac;
          color: #16a34a;
        }

        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .config-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 28px;
        }

        .config-section {
          margin-bottom: 28px;
        }

        .config-section:last-of-type {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .section-description {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .checkbox-group {
          gap: 10px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .form-input,
        .form-select {
          padding: 10px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          background: #fff;
        }

        .form-input:focus,
        .form-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input:disabled,
        .form-select:disabled {
          background: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .input-error {
          border-color: #ef4444 !important;
        }

        .input-valid {
          border-color: #10b981 !important;
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-toggle {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 6px;
          display: flex;
          align-items: center;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .error-text {
          font-size: 11px;
          color: #ef4444;
          font-weight: 500;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          cursor: pointer;
          user-select: none;
          font-weight: 500;
          color: #374151;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .checkbox-label input:disabled {
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: #3b82f6;
          color: #fff;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #fff;
          color: #64748b;
          border: 1.5px solid #e2e8f0;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: #94a3b8;
          color: #475569;
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        .success-info-box {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 8px;
          margin-top: 20px;
        }

        .success-icon {
          color: #16a34a;
          flex-shrink: 0;
        }

        .success-title {
          font-size: 14px;
          font-weight: 700;
          color: #16a34a;
          margin: 0 0 2px;
        }

        .success-description {
          font-size: 12px;
          color: #16a34a;
          margin: 0;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .modal-content {
          background: #fff;
          border-radius: 12px;
          padding: 28px;
          max-width: 400px;
          width: 90%;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 20px;
        }

        .qr-container {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          margin-bottom: 16px;
        }

        .qr-image {
          max-width: 100%;
          height: auto;
          display: block;
        }

        .qr-info {
          background: #f0f9ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
          font-size: 12px;
          color: #1e40af;
        }

        .qr-info p {
          margin: 4px 0;
        }

        .modal-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          .modal-actions {
            flex-direction: column;
          }
          .modal-actions .btn {
            width: 100%;
            justify-content: center;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}