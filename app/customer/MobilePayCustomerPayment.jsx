"use client";

import { useState, useEffect } from "react";
import { Loader, CheckCircle, AlertCircle, Copy, X } from "lucide-react";
import QRCode from "react-qr-code";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default function MobilePayCustomerPayment({
  businessId,
  orderId,
  totalAmount,
  currency,
  businessName,
  onPaymentSuccess,
  onPaymentFailed,
  onClose,
}) {
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState("");
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expireTime, setExpireTime] = useState(null);

  // Initialize payment
  useEffect(() => {
    initiatePayment();
  }, [businessId, orderId, totalAmount]);

  // Poll payment status
  useEffect(() => {
    if (!paymentData || paymentStatus === "CAPTURED" || paymentStatus === "FAILED") {
      return;
    }

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 2000); // Check every 2 seconds

    setStatusCheckInterval(interval);

    return () => clearInterval(interval);
  }, [paymentData, paymentStatus]);

  // Countdown timer
  useEffect(() => {
    if (!paymentData?.expiresIn) return;

    const timer = setInterval(() => {
      setExpireTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus("EXPIRED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setExpireTime(paymentData.expiresIn);

    return () => clearInterval(timer);
  }, [paymentData?.expiresIn]);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setInitError("");

      const response = await axios.post(
        `${API_BASE_URL}/payment/mobilepay/initiate`,
        {
          businessId,
          orderId,
          amount: totalAmount,
          currency,
          businessName,
          orderDescription: `Order #${orderId}`,
          generateQrCode: true,
          environment: "sandbox", // Change to production in live
          redirectUrl: window.location.href,
        }
      );

      if (response.data.success && response.data.data) {
        setPaymentData(response.data.data);
        setPaymentStatus("CREATED");
      } else {
        setInitError(response.data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      setInitError(
        error.response?.data?.message || "Failed to initiate MobilePay payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.paymentReference) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/payment/mobilepay/status/${businessId}/${paymentData.paymentReference}`
      );

      if (response.data.success && response.data.data) {
        const status = response.data.data.status;

        setPaymentStatus(status);

        if (status === "CAPTURED") {
          if (statusCheckInterval) clearInterval(statusCheckInterval);
          handlePaymentSuccess();
        } else if (status === "FAILED" || status === "CANCELLED") {
          if (statusCheckInterval) clearInterval(statusCheckInterval);
          setPaymentStatus(status);
        }
      }
    } catch (error) {
      console.error("Status check error:", error);
    }
  };

  const handlePaymentSuccess = () => {
    if (onPaymentSuccess) {
      onPaymentSuccess({
        paymentReference: paymentData.paymentReference,
        transactionId: paymentData.transactionId,
        amount: totalAmount,
        currency,
        status: "CAPTURED",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleManualStatusCheck = () => {
    checkPaymentStatus();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="mpc-container">
        <div className="mpc-loading">
          <Loader size={40} className="mpc-spinner" />
          <p>Initiating MobilePay payment...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="mpc-container">
        <div className="mpc-error-panel">
          <AlertCircle size={32} />
          <h3>Payment Error</h3>
          <p>{initError}</p>
          <div className="mpc-actions">
            <button className="mpc-btn mpc-btn--secondary" onClick={onClose}>
              Close
            </button>
            <button className="mpc-btn mpc-btn--primary" onClick={initiatePayment}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="mpc-container">
        <div className="mpc-error-panel">
          <AlertCircle size={32} />
          <h3>Payment Unavailable</h3>
          <p>MobilePay is not configured for this restaurant.</p>
          <button className="mpc-btn mpc-btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mpc-container">
      {/* Header */}
      <div className="mpc-header">
        <div className="mpc-header-content">
          <h2 className="mpc-title">MobilePay Payment</h2>
          <p className="mpc-subtitle">Scan with your MobilePay app to pay</p>
        </div>
        <button className="mpc-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Status Display */}
      {paymentStatus === "CAPTURED" && (
        <div className="mpc-status mpc-status--success">
          <CheckCircle size={24} />
          <h3>Payment Successful!</h3>
          <p>Your payment has been received</p>
          <div className="mpc-transaction-info">
            <div className="mpc-info-row">
              <span>Reference:</span>
              <code>{paymentData.paymentReference}</code>
            </div>
            <div className="mpc-info-row">
              <span>Amount:</span>
              <strong>
                {paymentData.amount} {paymentData.currency}
              </strong>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === "FAILED" || paymentStatus === "CANCELLED" ? (
        <div className="mpc-status mpc-status--error">
          <AlertCircle size={24} />
          <h3>{paymentStatus === "FAILED" ? "Payment Failed" : "Payment Cancelled"}</h3>
          <p>Please try again or use another payment method</p>
          <div className="mpc-actions">
            <button className="mpc-btn mpc-btn--secondary" onClick={onClose}>
              Close
            </button>
            <button className="mpc-btn mpc-btn--primary" onClick={initiatePayment}>
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Amount Display */}
          <div className="mpc-amount-section">
            <div className="mpc-amount-label">Total Amount</div>
            <div className="mpc-amount-display">
              {paymentData.amount} <span className="mpc-currency">{paymentData.currency}</span>
            </div>
            <div className="mpc-business-name">{businessName}</div>
          </div>

          {/* QR Code Section */}
          <div className="mpc-qr-section">
            <div className="mpc-qr-container">
              {paymentData.qrCodeData ? (
                <img
                  src={paymentData.qrCodeData}
                  alt="MobilePay QR Code"
                  className="mpc-qr-image"
                />
              ) : paymentData.qrCodeUrl ? (
                <img src={paymentData.qrCodeUrl} alt="MobilePay QR Code" className="mpc-qr-image" />
              ) : (
                <QRCode
                  value={paymentData.paymentLink || `https://mobilepay.dk/pay/${paymentData.paymentReference}`}
                  size={180}
                  level="H"
                  includeMargin={true}
                  fgColor="#7B3F00"
                  bgColor="#ffffff"
                />
              )}
            </div>

            <div className="mpc-qr-instructions">
              <div className="mpc-instruction-step">
                <div className="mpc-step-number">1</div>
                <div className="mpc-step-text">
                  <strong>Open MobilePay</strong>
                  <span>Launch the MobilePay app on your phone</span>
                </div>
              </div>
              <div className="mpc-instruction-step">
                <div className="mpc-step-number">2</div>
                <div className="mpc-step-text">
                  <strong>Scan QR Code</strong>
                  <span>Point your camera at this QR code</span>
                </div>
              </div>
              <div className="mpc-instruction-step">
                <div className="mpc-step-number">3</div>
                <div className="mpc-step-text">
                  <strong>Confirm Payment</strong>
                  <span>Review and confirm the payment details</span>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Payment Link */}
          {paymentData.paymentLink && (
            <div className="mpc-payment-link">
              <div className="mpc-link-label">Can't scan? Use this link instead:</div>
              <div className="mpc-link-box">
                <code className="mpc-link-text">{paymentData.paymentLink}</code>
                <button
                  className={`mpc-copy-btn ${copied ? "mpc-copy-btn--copied" : ""}`}
                  onClick={() => copyToClipboard(paymentData.paymentLink)}
                >
                  {copied ? (
                    <>
                      <CheckCircle size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="mpc-status-bar">
            <div className="mpc-status-content">
              <div className="mpc-spinner-small"></div>
              <div className="mpc-status-text">
                <strong>Waiting for payment confirmation...</strong>
                <span>This may take a few moments</span>
              </div>
            </div>
            {expireTime && (
              <div className="mpc-expiry-timer">
                Expires in: <strong>{formatTime(expireTime)}</strong>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mpc-actions-bar">
            <button className="mpc-btn mpc-btn--secondary" onClick={handleManualStatusCheck}>
              Check Status
            </button>
            <button className="mpc-btn mpc-btn--secondary" onClick={onClose}>
              Cancel Payment
            </button>
          </div>
        </>
      )}

      <style>{`
        .mpc-container {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 500px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1a1a1a;
        }

        .mpc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .mpc-header-content {
          flex: 1;
        }

        .mpc-title {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }

        .mpc-subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .mpc-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .mpc-close-btn:hover {
          color: #475569;
        }

        .mpc-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 40px 20px;
          text-align: center;
        }

        .mpc-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .mpc-error-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px 20px;
          text-align: center;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #991b1b;
        }

        .mpc-error-panel h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .mpc-error-panel p {
          margin: 0;
          font-size: 13px;
          color: #7f1d1d;
        }

        .mpc-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
        }

        .mpc-status--success {
          background: #f0fdf4;
          border: 1px solid #86efac;
          color: #166534;
        }

        .mpc-status--success h3 {
          margin: 0;
          font-size: 16px;
          color: #16a34a;
        }

        .mpc-status--error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .mpc-status--error h3 {
          margin: 0;
          font-size: 16px;
          color: #dc2626;
        }

        .mpc-status p {
          margin: 0;
          font-size: 12px;
        }

        .mpc-transaction-info {
          margin-top: 12px;
          width: 100%;
          text-align: left;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 8px;
          padding: 12px;
        }

        .mpc-info-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .mpc-info-row:last-child {
          margin-bottom: 0;
        }

        .mpc-info-row code {
          background: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          word-break: break-all;
        }

        .mpc-amount-section {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .mpc-amount-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .mpc-amount-display {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .mpc-currency {
          font-size: 18px;
          color: #64748b;
          margin-left: 4px;
        }

        .mpc-business-name {
          font-size: 13px;
          color: #64748b;
          margin-top: 6px;
        }

        .mpc-qr-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 24px;
        }

        .mpc-qr-container {
          display: flex;
          justify-content: center;
          padding: 16px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
        }

        .mpc-qr-image {
          max-width: 100%;
          height: auto;
        }

        .mpc-qr-instructions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mpc-instruction-step {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .mpc-step-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .mpc-step-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .mpc-step-text strong {
          font-size: 13px;
          color: #0f172a;
        }

        .mpc-step-text span {
          font-size: 12px;
          color: #64748b;
        }

        .mpc-payment-link {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .mpc-link-label {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .mpc-link-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px;
        }

        .mpc-link-text {
          flex: 1;
          font-size: 11px;
          color: #3b82f6;
          font-family: monospace;
          word-break: break-all;
          margin: 0;
        }

        .mpc-copy-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
        }

        .mpc-copy-btn:hover {
          background: #2563eb;
        }

        .mpc-copy-btn--copied {
          background: #16a34a;
        }

        .mpc-status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .mpc-status-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .mpc-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f4f6;
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .mpc-status-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }

        .mpc-status-text strong {
          font-size: 12px;
          color: #92400e;
        }

        .mpc-status-text span {
          font-size: 11px;
          color: #b45309;
        }

        .mpc-expiry-timer {
          font-size: 11px;
          color: #92400e;
          font-weight: 500;
          white-space: nowrap;
        }

        .mpc-actions-bar {
          display: flex;
          gap: 12px;
        }

        .mpc-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 12px;
        }

        .mpc-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: 8px;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          flex: 1;
          justify-content: center;
        }

        .mpc-btn--primary {
          background: #3b82f6;
          color: white;
        }

        .mpc-btn--primary:hover {
          background: #2563eb;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .mpc-btn--secondary {
          background: white;
          color: #3b82f6;
          border: 1.5px solid #e2e8f0;
        }

        .mpc-btn--secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        @media (max-width: 480px) {
          .mpc-container {
            padding: 16px;
          }

          .mpc-amount-display {
            font-size: 24px;
          }

          .mpc-qr-container {
            padding: 12px;
          }

          .mpc-instruction-step {
            padding: 10px;
          }

          .mpc-actions-bar {
            flex-direction: column;
          }

          .mpc-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
