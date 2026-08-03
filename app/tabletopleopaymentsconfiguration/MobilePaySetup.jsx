"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, ShieldCheck, Smartphone, AlertCircle, CheckCircle, Loader } from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default function MobilePaySetup({ onBack, adminId, businessId }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const [formData, setFormData] = useState({
    businessId: businessId || "",
    merchantSerialNumber: "",
    clientId: "",
    clientSecret: "",
    subscriptionKey: "",
    webhookSecret: "",
    environment: "sandbox",
    currencyCode: "DKK",
    enableQrCode: true,
  });

  const [showSecrets, setShowSecrets] = useState({
    clientSecret: false,
    subscriptionKey: false,
    webhookSecret: false,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load existing configuration
  useEffect(() => {
    if (businessId && !editMode) {
      loadConfiguration();
    }
  }, [businessId, editMode]);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/payment/mobilepay/config/${businessId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success && response.data.data) {
        const config = response.data.data;
        setFormData((prev) => ({
          ...prev,
          businessId: config.businessId,
          merchantSerialNumber: config.merchantSerialNumber,
          clientId: config.clientId,
          environment: config.environment,
          currencyCode: config.currencyCode || "DKK",
          enableQrCode: config.enableQrCode !== false,
        }));
        setSaved(true);
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.merchantSerialNumber?.trim()) {
      newErrors.merchantSerialNumber = "Merchant Serial Number is required";
    }
    if (!formData.clientId?.trim()) {
      newErrors.clientId = "Client ID is required";
    }
    if (!formData.clientSecret?.trim()) {
      newErrors.clientSecret = "Client Secret is required";
    }
    if (!formData.subscriptionKey?.trim()) {
      newErrors.subscriptionKey = "Subscription Key is required";
    }
    if (!formData.webhookSecret?.trim()) {
      newErrors.webhookSecret = "Webhook Secret is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyCredentials = async () => {
    if (!validateForm()) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      // Call backend to verify credentials
      const response = await axios.post(
        `${API_BASE_URL}/payment/mobilepay/config/verify`,
        {
          merchantSerialNumber: formData.merchantSerialNumber,
          clientId: formData.clientId,
          clientSecret: formData.clientSecret,
          subscriptionKey: formData.subscriptionKey,
          environment: formData.environment,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        setVerificationResult({ success: true, message: "Credentials verified successfully!" });
        setStep(2);
      } else {
        setVerificationResult({
          success: false,
          message: response.data.message || "Credential verification failed",
        });
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        message: error.response?.data?.message || "Failed to verify credentials",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        ...formData,
        adminId,
      };

      const response = saved
        ? await axios.put(`${API_BASE_URL}/payment/mobilepay/config/update`, payload, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
        : await axios.post(`${API_BASE_URL}/payment/mobilepay/config/save`, payload, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });

      if (response.data.success) {
        setSaved(true);
        setEditMode(false);
        setSuccessMessage("MobilePay configuration saved successfully!");
        setStep(3);

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to save configuration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleActivateMobilePay = async () => {
    if (!agreed) {
      setErrorMessage("Please agree to the terms and conditions");
      return;
    }

    try {
      // Additional activation logic if needed
      setSuccessMessage("MobilePay activated successfully!");
      setTimeout(() => onBack(), 2000);
    } catch (error) {
      setErrorMessage("Failed to activate MobilePay");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const renderInputField = (label, field, type = "text", placeholder = "") => (
    <div className="mp-form-group">
      <label className="mp-label">
        {label} <span className="mp-required">*</span>
      </label>
      <div className="mp-input-wrapper">
        <input
          type={
            ["clientSecret", "subscriptionKey", "webhookSecret"].includes(field)
              ? showSecrets[field]
                ? "text"
                : "password"
              : type
          }
          placeholder={placeholder}
          value={formData[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          disabled={!editMode}
          className={`mp-input ${errors[field] ? "mp-input--error" : formData[field] ? "mp-input--filled" : ""}`}
        />
        {["clientSecret", "subscriptionKey", "webhookSecret"].includes(field) && editMode && (
          <button
            type="button"
            className="mp-toggle-secret"
            onClick={() => toggleSecretVisibility(field)}
          >
            {showSecrets[field] ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {errors[field] && <div className="mp-error-text">{errors[field]}</div>}
    </div>
  );

  return (
    <div className="mp-setup-container">
      {/* Header */}
      <div className="mp-setup-header">
        <button className="mp-back-button" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8l4-4"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <div>
          <h1 className="mp-setup-title">MobilePay Business Setup</h1>
          <p className="mp-setup-subtitle">
            Configure your MobilePay Business Account for seamless payments
          </p>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mp-alert mp-alert--success">
          <CheckCircle size={16} />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mp-alert mp-alert--error">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {/* Stepper */}
      <div className="mp-stepper">
        <div className={`mp-step ${step >= 1 ? "mp-step--active" : ""} ${step > 1 ? "mp-step--completed" : ""}`}>
          <div className="mp-step-number">1</div>
          <div className="mp-step-label">Credentials</div>
        </div>
        <div className="mp-step-line"></div>
        <div className={`mp-step ${step >= 2 ? "mp-step--active" : ""} ${step > 2 ? "mp-step--completed" : ""}`}>
          <div className="mp-step-number">2</div>
          <div className="mp-step-label">Verify</div>
        </div>
        <div className="mp-step-line"></div>
        <div className={`mp-step ${step >= 3 ? "mp-step--active" : ""}`}>
          <div className="mp-step-number">3</div>
          <div className="mp-step-label">Activate</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mp-setup-content">
        {/* Step 1: Credentials */}
        {step === 1 && (
          <div className="mp-section">
            <div className="mp-section-header">
              <div className="mp-section-icon">📋</div>
              <div>
                <h2 className="mp-section-title">Merchant Credentials</h2>
                <p className="mp-section-desc">
                  Enter your MobilePay Business API credentials. These are available in your MobilePay merchant dashboard.
                </p>
              </div>
            </div>

            <div className="mp-form">
              <div className="mp-form-row">
                {renderInputField(
                  "Merchant Serial Number",
                  "merchantSerialNumber",
                  "text",
                  "e.g., MERCHANTID123456"
                )}
              </div>

              <div className="mp-form-row">
                {renderInputField("Client ID", "clientId", "text", "e.g., 123e4567-e89b-12d3-a456")}
              </div>

              <div className="mp-form-row">
                <div style={{ flex: 1 }}>
                  {renderInputField("Client Secret", "clientSecret", "password")}
                </div>
                <div style={{ flex: 1 }}>
                  {renderInputField("Subscription Key", "subscriptionKey", "password")}
                </div>
              </div>

              <div className="mp-form-row">
                {renderInputField("Webhook Secret", "webhookSecret", "password")}
              </div>

              <div className="mp-form-row">
                <div className="mp-form-group">
                  <label className="mp-label">Environment</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => handleInputChange("environment", e.target.value)}
                    disabled={!editMode}
                    className="mp-input"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="production">Production (Live)</option>
                  </select>
                </div>
                <div className="mp-form-group">
                  <label className="mp-label">Currency</label>
                  <select
                    value={formData.currencyCode}
                    onChange={(e) => handleInputChange("currencyCode", e.target.value)}
                    disabled={!editMode}
                    className="mp-input"
                  >
                    <option value="DKK">DKK (Danish Krone)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="SEK">SEK (Swedish Krona)</option>
                    <option value="NOK">NOK (Norwegian Krone)</option>
                  </select>
                </div>
              </div>

              <div className="mp-form-group">
                <label className="mp-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.enableQrCode}
                    onChange={(e) => handleInputChange("enableQrCode", e.target.checked)}
                    disabled={!editMode}
                  />
                  <span>Enable QR Code generation for payments</span>
                </label>
              </div>
            </div>

            {verificationResult && (
              <div className={`mp-verification-result ${verificationResult.success ? "mp-success" : "mp-error"}`}>
                {verificationResult.success ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {verificationResult.message}
              </div>
            )}

            <div className="mp-section-actions">
              {editMode ? (
                <button
                  className="mp-btn mp-btn--primary"
                  onClick={handleVerifyCredentials}
                  disabled={verifying || loading}
                >
                  {verifying ? (
                    <>
                      <Loader size={14} className="mp-spinner" /> Verifying...
                    </>
                  ) : (
                    "Verify Credentials →"
                  )}
                </button>
              ) : (
                <button className="mp-btn mp-btn--secondary" onClick={() => setEditMode(true)}>
                  Edit Credentials
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && (
          <div className="mp-section">
            <div className="mp-section-header">
              <div className="mp-section-icon">⚙️</div>
              <div>
                <h2 className="mp-section-title">Configuration</h2>
                <p className="mp-section-desc">
                  Save your MobilePay configuration to enable payments in your restaurant.
                </p>
              </div>
            </div>

            <div className="mp-config-info">
              <div className="mp-info-card">
                <strong>Merchant Serial Number:</strong>
                <code>{formData.merchantSerialNumber}</code>
              </div>
              <div className="mp-info-card">
                <strong>Environment:</strong>
                <code>{formData.environment}</code>
              </div>
              <div className="mp-info-card">
                <strong>Currency:</strong>
                <code>{formData.currencyCode}</code>
              </div>
              <div className="mp-info-card">
                <strong>QR Codes:</strong>
                <code>{formData.enableQrCode ? "Enabled" : "Disabled"}</code>
              </div>
            </div>

            <div className="mp-section-actions">
              <button
                className="mp-btn mp-btn--secondary"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                className="mp-btn mp-btn--primary"
                onClick={handleSaveConfiguration}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={14} className="mp-spinner" /> Saving...
                  </>
                ) : (
                  "Save Configuration →"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Activation */}
        {step === 3 && (
          <div className="mp-section">
            <div className="mp-section-header">
              <div className="mp-section-icon">✅</div>
              <div>
                <h2 className="mp-section-title">Activate MobilePay</h2>
                <p className="mp-section-desc">
                  Your configuration is ready. Review the terms and activate MobilePay for your restaurant.
                </p>
              </div>
            </div>

            <div className="mp-terms-section">
              <h3 className="mp-terms-title">Terms & Conditions</h3>
              <ol className="mp-terms-list">
                <li>
                  <strong>Payment Processing:</strong> MobilePay payments are processed directly through MobilePay Business API. TableTop Leo acts as a facilitator.
                </li>
                <li>
                  <strong>Security:</strong> All sensitive credentials are encrypted and stored securely. We never expose your Client Secret or API keys to the client-side.
                </li>
                <li>
                  <strong>Webhook Security:</strong> Webhook payloads are signed and verified using your Webhook Secret for maximum security.
                </li>
                <li>
                  <strong>Multi-Tenant:</strong> Each restaurant maintains its own independent MobilePay account. No account sharing or data mixing.
                </li>
                <li>
                  <strong>Refunds:</strong> Full and partial refunds are supported through the MobilePay API. Refund status is reflected in real-time.
                </li>
                <li>
                  <strong>Compliance:</strong> You must comply with MobilePay's merchant terms of service and PCI-DSS requirements.
                </li>
                <li>
                  <strong>Currency:</strong> All payments will be processed in {formData.currencyCode}. Currency conversion (if any) is handled by MobilePay.
                </li>
              </ol>

              <label className="mp-agree-checkbox">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>I have read and agree to the terms and conditions above</span>
              </label>
            </div>

            <div className="mp-section-actions">
              <button
                className="mp-btn mp-btn--secondary"
                onClick={() => setStep(2)}
              >
                ← Back
              </button>
              <button
                className={`mp-btn mp-btn--success ${!agreed ? "mp-btn--disabled" : ""}`}
                onClick={handleActivateMobilePay}
                disabled={!agreed || loading}
              >
                {loading ? "Activating..." : "Activate MobilePay ✓"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .mp-setup-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          color: #1a1a1a;
        }

        .mp-setup-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 32px;
        }

        .mp-back-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          margin-bottom: 8px;
        }

        .mp-back-button:hover {
          text-decoration: underline;
        }

        .mp-setup-title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
        }

        .mp-setup-subtitle {
          margin: 4px 0 0;
          font-size: 14px;
          color: #64748b;
        }

        .mp-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .mp-alert--success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #86efac;
        }

        .mp-alert--error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .mp-stepper {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          justify-content: center;
        }

        .mp-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .mp-step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
        }

        .mp-step--active .mp-step-number {
          background: #3b82f6;
          color: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .mp-step--completed .mp-step-number {
          background: #16a34a;
          color: white;
        }

        .mp-step-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-align: center;
        }

        .mp-step--active .mp-step-label {
          color: #3b82f6;
        }

        .mp-step-line {
          width: 40px;
          height: 2px;
          background: #e2e8f0;
          margin-top: 16px;
        }

        .mp-setup-content {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 32px;
        }

        .mp-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .mp-section-header {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .mp-section-icon {
          font-size: 32px;
          min-width: 40px;
          text-align: center;
        }

        .mp-section-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .mp-section-desc {
          margin: 6px 0 0;
          font-size: 14px;
          color: #64748b;
        }

        .mp-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mp-form-row {
          display: flex;
          gap: 16px;
        }

        .mp-form-row > div {
          flex: 1;
          min-width: 200px;
        }

        .mp-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mp-label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }

        .mp-required {
          color: #ef4444;
        }

        .mp-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .mp-input {
          width: 100%;
          padding: 9px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .mp-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .mp-input--filled {
          border-color: #d1d5db;
        }

        .mp-input--error {
          border-color: #ef4444;
        }

        .mp-input:disabled {
          background: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .mp-toggle-secret {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mp-toggle-secret:hover {
          color: #1a1a1a;
        }

        .mp-error-text {
          font-size: 11px;
          color: #ef4444;
          margin-top: 2px;
        }

        .mp-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          cursor: pointer;
          user-select: none;
        }

        .mp-checkbox input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .mp-verification-result {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .mp-verification-result.mp-success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #86efac;
        }

        .mp-verification-result.mp-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .mp-config-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .mp-info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          font-size: 12px;
        }

        .mp-info-card strong {
          display: block;
          color: #374151;
          margin-bottom: 4px;
        }

        .mp-info-card code {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 4px 8px;
          font-family: monospace;
          font-size: 11px;
          color: #3b82f6;
          display: block;
          word-break: break-all;
        }

        .mp-terms-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
        }

        .mp-terms-title {
          margin: 0 0 12px;
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }

        .mp-terms-list {
          margin: 0 0 16px;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mp-terms-list li {
          font-size: 12px;
          color: #475569;
          line-height: 1.6;
        }

        .mp-terms-list strong {
          color: #0f172a;
        }

        .mp-agree-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          user-select: none;
          color: #374151;
        }

        .mp-agree-checkbox input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .mp-section-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .mp-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 20px;
          border-radius: 8px;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .mp-btn--primary {
          background: #3b82f6;
          color: white;
        }

        .mp-btn--primary:hover:not(:disabled) {
          background: #2563eb;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .mp-btn--primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .mp-btn--secondary {
          background: white;
          color: #3b82f6;
          border: 1.5px solid #e2e8f0;
        }

        .mp-btn--secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .mp-btn--success {
          background: #16a34a;
          color: white;
        }

        .mp-btn--success:hover:not(:disabled) {
          background: #15803d;
          box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
        }

        .mp-btn--disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mp-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .mp-setup-content {
            padding: 20px;
          }

          .mp-form-row {
            flex-direction: column;
          }

          .mp-stepper {
            flex-direction: column;
            gap: 8px;
          }

          .mp-step-line {
            width: 2px;
            height: 30px;
            margin-top: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
