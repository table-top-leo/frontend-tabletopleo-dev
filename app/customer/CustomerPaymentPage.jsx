"use client";

import { getCurrencySymbol, formatCurrency } from "../utils/currencyHelper";

import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Copy, X, CheckCircle, AlertCircle } from "lucide-react";
import QRCode from "react-qr-code";
import axios from "axios";
import { useCustomerLanguage } from "../context/CustomerLanguageProvider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:6163/api";

const ICON_URLS = {
  "PhonePe":     "https://img.icons8.com/color/96/000000/phone-pe.png",
  "Google Pay":  "https://img.icons8.com/color/96/000000/google-pay.png",
  "Paytm":       "https://img.icons8.com/color/96/000000/paytm.png",
  "BHIM":        "https://img.icons8.com/color/96/000000/bhim.png",
  "Visa":        "https://img.icons8.com/color/96/000000/visa.png",
  "Mastercard":  "https://img.icons8.com/color/96/000000/mastercard-logo.png",
  "Apple Pay":   "https://img.icons8.com/color/96/000000/apple-pay.png",
  "Mobile Pay":  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr2_F3MVPlc3Hu_tCBeHZkgEmqi26yjuF8undocwwg0g&s=10",
};

const PaymentIcon = ({ name, size = 36 }) => {
  const [broken, setBroken] = useState(false);
  const r = Math.round(size * 0.28);
  const url = ICON_URLS[name];

  const badge = (bg, content, border) => (
    <div
      title={name}
      style={{
        width: size, height: size, borderRadius: r, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: border ? "1px solid var(--border)" : "none",
        flexShrink: 0, overflow: "hidden",
      }}
    >
      {content}
    </div>
  );

  if (url && !broken) {
    return (
      <div
        title={name}
        style={{
          width: size, height: size, borderRadius: r, background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid var(--border)", flexShrink: 0, overflow: "hidden",
          padding: Math.round(size * 0.1), boxSizing: "border-box",
        }}
      >
        <img
          src={url}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  switch (name) {
    case "PhonePe":
      return badge("#5F259F", (
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
          <path d="M8.2 6.5h5.1c2.1 0 3.6 1.35 3.6 3.35 0 1.75-1.15 3-2.85 3.25l3.05 4.9h-2.35l-2.85-4.75h-1.9v4.75H8.2V6.5zm1.8 1.7v3.5h3.1c1.15 0 1.85-.65 1.85-1.75s-.7-1.75-1.85-1.75H10z" fill="#fff" />
        </svg>
      ));
    case "Google Pay":
      return badge("#fff", (
        <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 48 48">
          <path fill="#4285F4" d="M24 9.5c3.15 0 5.98 1.09 8.2 3.22l6.1-6.1C34.5 3 29.6 1 24 1 14.9 1 7.1 6.2 3.5 13.8l7.1 5.5C12.3 13.6 17.6 9.5 24 9.5z" />
          <path fill="#34A853" d="M24 47c6.5 0 11.9-2.15 15.9-5.85l-7.4-5.75C30.4 37 27.4 38 24 38c-6.4 0-11.8-4.3-13.7-10.1l-7.2 5.6C6.9 41.7 14.7 47 24 47z" />
          <path fill="#FBBC05" d="M10.3 27.9C9.8 26.3 9.5 24.7 9.5 23s.3-3.3.8-4.9l-7.1-5.5C1.9 15.9 1 19.35 1 23s.9 7.1 2.4 10.4l6.9-5.5z" />
          <path fill="#EA4335" d="M24 23v-9.5h16.1c.4 1.9.6 3.9.6 6 0 8.4-3 15.3-8.2 19.65l-7.4-5.75c2.7-1.8 4.6-4.6 5.3-8.3H24z" />
        </svg>
      ), true);
    case "Paytm":
      return badge("#fff", (
        <span style={{ fontSize: size * 0.30, fontWeight: 800, color: "#00B9F1", fontFamily: "Arial, sans-serif" }}>
          pay<span style={{ color: "#002E6E" }}>tm</span>
        </span>
      ), true);
    case "BHIM":
      return badge("#fff", (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <div style={{ display: "flex", width: size * 0.6, height: 4, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ flex: 1, background: "#FF9933" }} />
            <div style={{ flex: 1, background: "#fff" }} />
            <div style={{ flex: 1, background: "#138808" }} />
          </div>
          <span style={{ fontSize: size * 0.26, fontWeight: 800, color: "#0B3D91", letterSpacing: 0.3 }}>BHIM</span>
        </div>
      ), true);
    case "Visa":
      return badge("#fff", (
        <span style={{ fontSize: size * 0.34, fontWeight: 900, color: "#1A1F71", fontStyle: "italic", letterSpacing: 0.5 }}>
          VISA
        </span>
      ), true);
    case "Mastercard":
      return badge("#fff", (
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 14">
          <circle cx="8" cy="7" r="7" fill="#EB001B" />
          <circle cx="16" cy="7" r="7" fill="#F79E1B" />
          <path d="M12 1.7a7 7 0 010 10.6 7 7 0 010-10.6z" fill="#FF5F00" />
        </svg>
      ), true);
    case "Apple Pay":
      return badge("#000", (
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <svg width={size * 0.3} height={size * 0.3} viewBox="0 0 24 24" fill="#fff">
            <path d="M16.5 7.6c-.9.05-2 .6-2.6 1.35-.55.65-1 1.65-.85 2.6 1 .1 2.05-.55 2.65-1.3.6-.7.95-1.6.8-2.65zM19.2 12c-.05-2 1.65-3 1.75-3.05-1-1.45-2.5-1.65-3.05-1.7-1.3-.13-2.5.75-3.15.75-.65 0-1.65-.73-2.7-.71-1.4.02-2.7.8-3.4 2.05-1.45 2.5-.37 6.2 1.05 8.25.7 1 1.5 2.1 2.6 2.06 1.05-.04 1.45-.68 2.7-.68 1.25 0 1.6.68 2.7.66 1.1-.02 1.8-1.02 2.5-2.02.55-.8.9-1.6 1.15-2.45-.85-.35-2.15-1.35-2.15-3.16z" />
          </svg>
          <span style={{ fontSize: size * 0.28, fontWeight: 700, color: "#fff" }}>Pay</span>
        </div>
      ));
    case "Mobile Pay":
      return badge("#5A67D8", (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
      ));
    default:
      return badge("#f1f1f1", <span style={{ fontSize: size * 0.22, fontWeight: 700, color: "#666" }}>{name?.[0] || "?"}</span>, true);
  }
};

const OtherCardsIcon = ({ size = 36 }) => (
  <div
    title="Other Cards & Net Banking"
    style={{
      width: size, height: size, borderRadius: Math.round(size * 0.28), background: "var(--surface-2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      border: "1px solid var(--border)", flexShrink: 0,
    }}
  >
    <CreditCard size={size * 0.55} color="var(--brand)" strokeWidth={2} />
  </div>
);

const renderAppIcon = (a, size) =>
  a.generic ? <OtherCardsIcon key={a.name} size={size} /> : <PaymentIcon key={a.name} name={a.name} size={size} />;

// ════════════════════════════════════════════════════════════
// MOBILEPAY MODAL COMPONENT - NEW
// ════════════════════════════════════════════════════════════

const MobilePayModal = ({ businessId, orderId, total, currencyCode, businessName, onSuccess, onClose }) => {
  const { t } = useCustomerLanguage();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Initiate payment on mount
  useEffect(() => {
    initiatePayment();
  }, []);

  // Load the Razorpay checkout SDK imperatively (once) instead of a raw
  // <script> tag in JSX — React never executes script tags it renders on
  // the client, so that pattern silently failed to (re)load the SDK and
  // also threw a console warning. This guards against loading it twice.
  useEffect(() => {
    if (window.Razorpay || document.getElementById("razorpay-checkout-js")) return;
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Poll for payment status
  useEffect(() => {
    if (!paymentData || paymentStatus === "CAPTURED") return;

    const pollInterval = setInterval(() => {
      checkPaymentStatus();
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [paymentData, paymentStatus]);

  // Countdown timer
  useEffect(() => {
    if (!paymentData) return;

    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setPaymentStatus("EXPIRED");
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [paymentData]);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${API_BASE_URL}/payment/mobilepay/initiate`, {
        businessId: businessId,
        orderId: orderId,
        amount: total,
        currency: currencyCode || "DKK",
        businessName: businessName,
        generateQrCode: true,
        environment: "sandbox",
      });

      if (response.data.success && response.data.data) {
        setPaymentData(response.data.data);
        setTimeRemaining(response.data.data.expiresIn || 900);
      } else {
        setError(response.data.message || t("errors.paymentFailed"));
      }
    } catch (err) {
      console.error("MobilePay initiate error:", err);
      setError(err.response?.data?.message || t("errors.paymentFailed"));
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
        setPollCount((p) => p + 1);

        if (status === "CAPTURED") {
          onSuccess({
            paymentReference: paymentData.paymentReference,
            transactionId: paymentData.transactionId,
            amount: total,
            currency: currencyCode || "DKK",
            status: "CAPTURED",
          });
        }
      }
    } catch (err) {
      console.error("Status check error:", err);
    }
  };

  const copyToClipboard = () => {
    if (paymentData?.paymentLink) {
      navigator.clipboard.writeText(paymentData.paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
      }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: 32, maxWidth: 420, textAlign: "center"
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", border: "3px solid #e2e8f0",
            borderTop: "3px solid #3b82f6", animation: "spin 1s linear infinite", margin: "0 auto 16px"
          }} />
          <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500, margin: 0 }}>
            {t("payment.initiatingMobilePayPayment")}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !paymentData) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
      }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: 32, maxWidth: 450
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <AlertCircle size={32} style={{ color: "#ef4444", flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: "#ef4444" }}>
                {t("payment.cannotProcessPayment")}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{error}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "10px 16px", background: "#3b82f6", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}>
              {t("common.close")}
            </button>
            <button onClick={initiatePayment} style={{
              flex: 1, padding: "10px 16px", background: "#fff", color: "#3b82f6",
              border: "1.5px solid #3b82f6", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}>
              {t("payment.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (paymentStatus === "CAPTURED") {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
      }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: 32, maxWidth: 450, textAlign: "center"
        }}>
          <CheckCircle size={48} style={{ color: "#10b981", margin: "0 auto 16px" }} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#10b981" }}>
            {t("payment.paymentSuccessful")}!
          </h3>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#64748b" }}>
            {t("payment.yourPaymentConfirmed")}
          </p>
          <div style={{
            marginTop: 20, padding: 12, background: "#f0fdf4", borderRadius: 8, textAlign: "left", fontSize: 12
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#475569" }}>{t("payment.reference")}</span>
              <code style={{ color: "#16a34a", fontWeight: 600 }}>{paymentData?.paymentReference}</code>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#475569" }}>{t("payment.amount")}:</span>
              <strong style={{ color: "#16a34a" }}>{paymentData?.amount} {paymentData?.currency}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment waiting state
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28, maxWidth: 480, maxHeight: "90vh", overflow: "auto"
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #e2e8f0"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              {t("payment.mobilePayModalTitle")}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
              {t("payment.scanQrWithApp")}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
            padding: 0, fontSize: 20, lineHeight: 1
          }}>
            ✕
          </button>
        </div>

        {/* Amount */}
        <div style={{
          textAlign: "center", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #e2e8f0"
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 500 }}>{t("payment.totalAmountLabel")}</p>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#0f172a", marginTop: 8 }}>
            {paymentData?.amount} <span style={{ fontSize: 18, color: "#64748b" }}>
              {paymentData?.currency}
            </span>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b" }}>{businessName}</p>
        </div>

        {/* QR Code */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 24
        }}>
          <div style={{
            background: "#f8fafc", padding: 16, borderRadius: 12, border: "2px solid #e2e8f0"
          }}>
            {paymentData?.qrCodeData ? (
              <img src={paymentData.qrCodeData} alt="MobilePay QR" style={{ width: 200, height: 200 }} />
            ) : (
              <QRCode
                value={paymentData?.paymentLink || `https://mobilepay.dk/${paymentData?.paymentReference}`}
                size={200}
                level="H"
              />
            )}
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "#64748b" }}>
            {t("payment.pointCamera")}
          </div>

          {/* Payment Link */}
          {paymentData?.paymentLink && (
            <div style={{ width: "100%", padding: 12, background: "#f8fafc", borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>
                {t("payment.cantScanUseLink")}
              </div>
              <div style={{
                display: "flex", gap: 8, background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 6, padding: 8
              }}>
                <code style={{
                  flex: 1, fontSize: 10, color: "#3b82f6", wordBreak: "break-all", fontFamily: "monospace"
                }}>
                  {paymentData.paymentLink}
                </code>
                <button onClick={copyToClipboard} style={{
                  background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4,
                  padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4, flexShrink: 0
                }}>
                  {copied ? "✓" : <Copy size={12} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div style={{
          padding: 12, background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8,
          marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 12, height: 12, borderRadius: "50%", background: "#f59e0b",
              animation: "pulse 1.4s ease-in-out infinite"
            }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>
                {t("payment.waitingForPayment")}
              </div>
              <div style={{ fontSize: 11, color: "#b45309" }}>{t("payment.checkedTimes", { count: pollCount })}</div>
            </div>
          </div>
          {timeRemaining > 0 && (
            <div style={{ fontSize: 11, fontWeight: 600, color: "#92400e", whiteSpace: "nowrap" }}>
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={checkPaymentStatus} style={{
            flex: 1, padding: "10px 16px", background: "#fff", color: "#3b82f6",
            border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
            {t("payment.checkStatus")}
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px 16px", background: "#fff", color: "#3b82f6",
            border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
            {t("common.cancel")}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// MAIN PAYMENT PAGE - EXISTING CODE PRESERVED
// ════════════════════════════════════════════════════════════

const CustomerPaymentPage = ({ total, business, diningInfo, onBack, onInitiatePayment, onConfirmPayment, payAtCounterAvailable }) => {
  const { t } = useCustomerLanguage();
  const METHODS = [
    { id: "upi", label: t("payment.upi"), sub: t("payment.upiDesc"),
      apps: [{ name:"PhonePe" },{ name:"Google Pay" },{ name:"Paytm" },{ name:"BHIM" }] },
    { id: "razorpay", label: t("payment.razorpay"), sub: t("payment.payUsingApps"),
      apps: [{ name:"PhonePe" },{ name:"Google Pay" },{ name:"Paytm" },{ name:"Visa" }] },
    { id: "stripe", label: t("payment.internationalCards"), sub: t("payment.stripeApps"),
      apps: [{ name:"Apple Pay" },{ name:"Mobile Pay" },{ name:"Google Pay" },{ name:"Other Cards & Net Banking", generic:true }] },
    { id: "mobilepay", label: t("payment.mobilePay"), sub: t("payment.mobilePayDesc"),
      apps: [{ name:"Mobile Pay" }] },
  ];
  const _currCode = business?.currencyCode || "INR";

  // Which of the 4 online gateways to actually show — driven by the
  // BUSINESS's country (never the customer's own phone/location), per
  // `business.availablePaymentMethods` from the public menu API. If that
  // field is missing (older cached business object), fall back to showing
  // everything rather than accidentally hiding a working payment option.
  const visibleMethods = business?.availablePaymentMethods
    ? METHODS.filter(m => business.availablePaymentMethods.map(x => x.toLowerCase()).includes(m.id))
    : METHODS;

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentData,    setPaymentData]    = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [confirming,     setConfirming]     = useState(false);
  const [error,          setError]          = useState("");
  const [upiRef,         setUpiRef]         = useState("");
  const [payAtCounter,   setPayAtCounter]   = useState(false);

  // NEW: MobilePay modal state
  const [showMobilePayModal, setShowMobilePayModal] = useState(false);
  const [mobilePayConfigured, setMobilePayConfigured] = useState(null);
  const [checkingMobilePayConfig, setCheckingMobilePayConfig] = useState(false);

  // NEW: Check MobilePay configuration before showing modal
  const checkMobilePayConfiguration = async () => {
    setCheckingMobilePayConfig(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payment/mobilepay/check-config/${business?.businessId}`
      );

      if (response.data.success && response.data.data) {
        const isConfigured = response.data.data.configured;
        setMobilePayConfigured(isConfigured);

        if (isConfigured) {
          // Admin has configured - show modal
          setShowMobilePayModal(true);
        } else {
          // Admin hasn't configured
          setError("⚠️ Admin Setup Pending: MobilePay is not configured yet. Please contact the restaurant admin.");
          setSelectedMethod(null);
        }
      }
    } catch (err) {
      console.error("MobilePay config check error:", err);
      setError("⚠️ Admin Setup Pending: MobilePay is not configured yet. Please contact the restaurant admin.");
      setSelectedMethod(null);
    } finally {
      setCheckingMobilePayConfig(false);
    }
  };

  const handleSelectMethod = async (methodId) => {
    setSelectedMethod(methodId);
    setPaymentData(null);
    setError("");

    // NEW: Special handling for MobilePay
    if (methodId === "mobilepay") {
      await checkMobilePayConfiguration();
      return;
    }

    setLoading(true);
    try {
      const data = await onInitiatePayment(methodId);
      setPaymentData(data);
    } catch (e) {
      setError(e.message || t("errors.paymentInitFailed"));
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle MobilePay payment success
  const handleMobilePaySuccess = async (paymentData) => {
    setShowMobilePayModal(false);
    setConfirming(true);
    setError("");

    try {
      const initData = await onInitiatePayment("mobilepay");
      await onConfirmPayment({
        paymentId: initData.paymentId,
        orderId: initData.orderId,
        orderNumber: initData.orderNumber,
        grandTotal: initData.grandTotal,
        orderType: initData.orderType,
        customerName: initData.customerName,
        createdAt: initData.createdAt,
        gatewayName: "mobilepay",
        paymentReference: paymentData.paymentReference,
        transactionId: paymentData.transactionId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        gatewayResponse: JSON.stringify(paymentData),
      });
    } catch (e) {
      setError(`MobilePay payment failed: ${e.message}`);
    } finally {
      setConfirming(false);
    }
  };

  const handleUpiConfirm = async () => {
    if (!upiRef.trim()) { setError(t("errors.upiRefRequired")); return; }
    setConfirming(true); setError("");
    try {
      await onConfirmPayment({
        paymentId:       paymentData.paymentId,
        orderId:         paymentData.orderId,
        gatewayName:     "upi",
        transactionId:   upiRef.trim(),
        paymentReference:upiRef.trim(),
        gatewayResponse: JSON.stringify({ upiRef, confirmedAt: new Date().toISOString() }),
      });
    } catch (e) { setError(e.message); } finally { setConfirming(false); }
  };

  const handleRazorpayPay = () => {
    if (!paymentData?.razorpayOrderId) { setError(t("errors.gatewayNotInitialized")); return; }
    const options = {
      key:         paymentData.razorpayKeyId,
      amount:      Math.round(total * 100),
      currency:    business?.currencyCode || "INR",
      name:        business?.businessName || "TableTop Leo",
      description: "Order Payment",
      order_id:    paymentData.razorpayOrderId,
      handler: async (response) => {
        setConfirming(true); setError("");
        try {
          await onConfirmPayment({
            paymentId:          paymentData.paymentId,
            orderId:            paymentData.orderId,
            gatewayName:        "razorpay",
            razorpayOrderId:    response.razorpay_order_id,
            razorpayPaymentId:  response.razorpay_payment_id,
            razorpaySignature:  response.razorpay_signature,
            transactionId:      response.razorpay_payment_id,
            gatewayResponse:    JSON.stringify(response),
          });
        } catch (e) { setError(e.message); } finally { setConfirming(false); }
      },
      prefill: { contact: diningInfo?.phone || "", email: diningInfo?.email || "" },
      theme: { color: "#F59E0B" },
    };
    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      setError(t("errors.sdkNotLoaded"));
    }
  };

  const handleStripePay = async () => {
    if (!paymentData?.stripeClientSecret) { setError(t("errors.gatewayNotInitialized")); return; }
    if (!window.Stripe) { setError(t("errors.sdkNotLoaded")); return; }
    setConfirming(true); setError("");
    try {
      const stripe = window.Stripe(paymentData.stripePublishableKey);
      const result = await stripe.confirmPayment({
        clientSecret: paymentData.stripeClientSecret,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });
      if (result.error) { setError(result.error.message); setConfirming(false); return; }
      if (result.paymentIntent?.status === "succeeded") {
        await onConfirmPayment({
          paymentId:             paymentData.paymentId,
          orderId:               paymentData.orderId,
          gatewayName:           "stripe",
          stripePaymentIntentId: result.paymentIntent.id,
          transactionId:         result.paymentIntent.id,
          gatewayResponse:       JSON.stringify(result.paymentIntent),
        });
      }
    } catch (e) { setError(e.message); } finally { setConfirming(false); }
  };

  const handlePaypalPay = async () => {
    setError("PayPal: Click Pay Now and complete payment in the PayPal window that opens.");
    if (!paymentData) return;
    setConfirming(true);
    try {
      await onConfirmPayment({
        paymentId:      paymentData.paymentId,
        orderId:        paymentData.orderId,
        gatewayName:    "paypal",
        paypalOrderId:  paymentData.paypalOrderId || "PAYPAL-DEMO",
        paypalCaptureId:"CAPTURE-" + Date.now(),
        transactionId:  "PP-" + Date.now(),
        gatewayResponse:JSON.stringify({ status:"COMPLETED", ts: new Date().toISOString() }),
      });
    } catch (e) { setError(e.message); } finally { setConfirming(false); }
  };

  const s = {
    methodCard: (active) => ({
      display:"flex", alignItems:"center", gap:12, padding:"13px 14px",
      borderRadius:"var(--radius-md)", border:`1.5px solid ${active?"var(--brand)":"var(--border)"}`,
      background: active?"var(--brand-muted)":"var(--surface-2)", cursor:"pointer",
      marginBottom:8, transition:"all 0.15s",
    }),
    radio: (active) => ({
      width:18, height:18, borderRadius:"50%", border:`2px solid ${active?"var(--brand)":"var(--border)"}`,
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
    }),
    payBtn: (dis) => ({
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      width:"100%", padding:14, background: dis?"#d1d5db":"linear-gradient(135deg,#f59e0b,#d97706)",
      color:"#fff", fontSize:15, fontWeight:700, border:"none",
      borderRadius:"var(--radius-lg)", cursor: dis?"not-allowed":"pointer",
    }),
  };

  return (
    <div className="cw-screen">
      <div className="cx-topbar">
        <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20}/></button>
        <span className="cx-topbar-title">{t("payment.title")}</span>
        <div style={{ width:32 }}/>
      </div>

      <div style={{ flex:1, overflow:"auto", paddingBottom:16 }}>
        {/* Order Summary */}
        <div className="cx-section">
          <div className="order-summary-box">
            <div className="osb-title">{t("payment.orderSummaryTitle")}</div>
            <div className="osb-row"><span className="osb-label">{t("payment.business")}</span><span className="osb-value">{business?.businessName}</span></div>
            <div className="osb-row"><span className="osb-label">{t("payment.orderType")}</span><span className="osb-value">{diningInfo.type === "dine-in" ? `🍽️ ${t("dining.dineIn")}` : `🥡 ${t("dining.takeAway")}`}{diningInfo.table ? ` — ${diningInfo.table}` : ""}</span></div>
            {diningInfo.name && <div className="osb-row"><span className="osb-label">{t("payment.name")}</span><span className="osb-value">{diningInfo.name}</span></div>}
            {diningInfo.note && <div className="osb-row"><span className="osb-label">{t("payment.note")}</span><span className="osb-value" style={{ fontStyle:"italic", color:"var(--text-muted)", fontSize:12 }}>{diningInfo.note}</span></div>}
            <div className="osb-row"><span className="osb-label">{t("payment.amount")}</span><span className="osb-amount">{formatCurrency(total, _currCode)}</span></div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="cx-section" style={{ paddingTop:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:10 }}>{t("payment.selectMethod")}</div>

          {visibleMethods.map(m => (
            <div key={m.id} style={s.methodCard(selectedMethod===m.id)} onClick={() => handleSelectMethod(m.id)}>
              <div style={s.radio(selectedMethod===m.id)}>
                {selectedMethod===m.id && <div style={{ width:9, height:9, borderRadius:"50%", background:"var(--brand)" }}/>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>{m.label}</div>
                <div style={{ fontSize:11.5, color:"var(--text-muted)", marginTop:2 }}>{m.sub}</div>
                {m.apps.length > 0 && (
                  <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                    {m.apps.map(a => renderAppIcon(a, 24))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Loading spinner */}
        {(loading || checkingMobilePayConfig) && (
          <div style={{ textAlign:"center", padding:24 }}>
            <div style={{ width:32, height:32, border:"3px solid var(--brand-muted)", borderTop:"3px solid var(--brand)", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 10px" }}/>
            <p style={{ fontSize:13, color:"var(--text-muted)", margin:0 }}>
              {checkingMobilePayConfig ? t("payment.checkingMobilePayConfig") : t("payment.initializingPayment")}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ margin:"0 16px", background:"var(--red-bg)", border:"1px solid #fecaca", borderRadius:"var(--radius-md)", padding:"10px 14px" }}>
            <p style={{ margin:0, fontSize:12.5, color:"var(--red)", fontWeight:600 }}>⚠ {error}</p>
          </div>
        )}

        {/* UPI Section - UNCHANGED */}
        {selectedMethod==="upi" && paymentData && !loading && (
          <div style={{ margin:"0 16px", animation:"fadeIn 0.22s ease" }}>
            <div style={{ background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-lg)", padding:20, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:13, color:"var(--text-muted)", fontWeight:600 }}>{t("payment.scanToPay")} <strong style={{ color:"var(--text-primary)" }}>{business?.businessName}</strong></div>
              <div style={{ fontSize:28, fontWeight:900, color:"var(--brand)" }}>{formatCurrency(total, _currCode)}</div>
              <div style={{ background:"#fff", padding:12, borderRadius:12, border:"1.5px solid var(--border)" }}>
                <QRCode value={paymentData.upiString} size={150} fgColor="#7B3F00"/>
              </div>
              <div style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center" }}>{t("payment.scanUsingAnyUpi")}</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
                {METHODS[0].apps.map(a => (
                  <a key={a.name} href={paymentData.upiString} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, textDecoration:"none" }}>
                    <PaymentIcon name={a.name} size={36} />
                    <span style={{ fontSize:10, color:"var(--text-muted)", fontWeight:600 }}>{a.name}</span>
                  </a>
                ))}
              </div>
              <div style={{ width:"100%" }}>
                <label style={{ fontSize:12.5, fontWeight:700, color:"var(--text-secondary)", display:"block", marginBottom:6 }}>
                  {t("payment.upiTransactionIdLabel")} <span style={{ color:"var(--red)" }}>*</span>
                </label>
                <input
                  value={upiRef} onChange={e => setUpiRef(e.target.value)}
                  placeholder={t("payment.upiRefPlaceholder")}
                  style={{ width:"100%", padding:"10px 12px", border:"1.5px solid var(--border)", borderRadius:"var(--radius-md)", fontSize:13, fontFamily:"monospace", outline:"none", boxSizing:"border-box" }}
                />
                <p style={{ margin:"4px 0 0", fontSize:11, color:"var(--text-muted)" }}>
                  {t("payment.findInUpiApp")}
                </p>
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <button style={s.payBtn(confirming || !upiRef.trim())} disabled={confirming || !upiRef.trim()} onClick={handleUpiConfirm}>
                {confirming ? t("payment.verifying") : t("payment.confirmOrderChecked")}
              </button>
            </div>
          </div>
        )}

        {/* Razorpay Section - UNCHANGED */}
        {selectedMethod==="razorpay" && paymentData && !loading && (
          <div style={{ margin:"0 16px", animation:"fadeIn 0.22s ease" }}>
            <div style={{ background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-lg)", padding:20, textAlign:"center" }}>
              <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:6 }}>{t("payment.payUsingApps")}</div>
              <div style={{ fontSize:26, fontWeight:900, color:"var(--brand)", marginBottom:12 }}>{formatCurrency(total, _currCode)}</div>
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16, flexWrap:"wrap" }}>
                {METHODS[1].apps.map(a => (
                  <PaymentIcon key={a.name} name={a.name} size={36} />
                ))}
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <button style={s.payBtn(confirming)} disabled={confirming} onClick={handleRazorpayPay}>
                {confirming ? t("payment.processingPayment") : t("payment.payViaRazorpay", { amount: formatCurrency(total, _currCode) })}
              </button>
            </div>
          </div>
        )}

        {/* Stripe Section - UNCHANGED */}
        {selectedMethod==="stripe" && paymentData && !loading && (
          <div style={{ margin:"0 16px", animation:"fadeIn 0.22s ease" }}>
            <div style={{ background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-lg)", padding:20, textAlign:"center" }}>
              <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:6 }}>{t("payment.stripeApps")}</div>
              <div style={{ fontSize:26, fontWeight:900, color:"var(--brand)", marginBottom:12 }}>{formatCurrency(total, _currCode)}</div>
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16, flexWrap:"wrap" }}>
                {METHODS[2].apps.map(a => renderAppIcon(a, 36))}
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <button style={s.payBtn(confirming)} disabled={confirming} onClick={handleStripePay}>
                {confirming ? t("payment.processingPayment") : t("payment.payViaStripe", { amount: formatCurrency(total, _currCode) })}
              </button>
            </div>
          </div>
        )}

        {/* ── PAY AT COUNTER TOGGLE ──────────────────────────── */}
        {payAtCounterAvailable && (
          <div style={{ margin:"16px 16px 4px", animation:"fadeIn 0.2s ease" }}>
            <div
              onClick={() => {
                setPayAtCounter(p => !p);
                if (!payAtCounter) {
                  setSelectedMethod(null);
                  setPaymentData(null);
                  setError("");
                }
              }}
              style={{
                display:"flex", alignItems:"center", gap:12, padding:"14px 16px",
                borderRadius:"var(--radius-md)",
                border:`2px solid ${payAtCounter ? "var(--green)" : "var(--border)"}`,
                background: payAtCounter ? "var(--green-bg)" : "var(--surface-2)",
                cursor:"pointer", transition:"all 0.18s",
              }}
            >
              <div style={{
                width:22, height:22, borderRadius:6,
                border:`2px solid ${payAtCounter ? "var(--green)" : "var(--border)"}`,
                background: payAtCounter ? "var(--green)" : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0, transition:"all 0.15s",
              }}>
                {payAtCounter && <span style={{ color:"#fff", fontSize:13, fontWeight:900, lineHeight:1 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color: payAtCounter ? "var(--green)" : "var(--text-primary)" }}>
                  🏪 {t("payment.payAtCounterTitle")}
                </div>
                <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                  {t("payment.payAtCounterToggleDesc")}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── STICKY BOTTOM BUTTON ──────────────────────────────── */}
      <div className="cx-sticky-bottom">
        {payAtCounter ? (
          <button
            style={s.payBtn(confirming)}
            disabled={confirming}
            onClick={async () => {
              setConfirming(true);
              setError("");
              try {
                const initData = await onInitiatePayment("pay_at_counter");
                await onConfirmPayment({
                  paymentId:        initData.paymentId,
                  payAtCounter:     true,
                  gatewayName:      "pay_at_counter",
                  orderId:          initData.orderId,
                  orderNumber:      initData.orderNumber,
                  grandTotal:       initData.grandTotal,
                  orderType:        initData.orderType,
                  customerName:     initData.customerName,
                  createdAt:        initData.createdAt,
                  gatewayResponse:  JSON.stringify({ method:"pay_at_counter", ts: new Date().toISOString() }),
                });
              } catch (e) { setError(e.message); } finally { setConfirming(false); }
            }}
          >
            {confirming ? t("payment.placingOrder") : t("payment.proceedPayAtCounter")}
          </button>
        ) : (
          <button
            style={s.payBtn(!selectedMethod || loading || checkingMobilePayConfig)}
            disabled={!selectedMethod || loading || checkingMobilePayConfig}
          >
            {!selectedMethod ? t("payment.selectPaymentMethodBtn") : t("payment.payAmount", { amount: formatCurrency(total, _currCode) })}
          </button>
        )}
      </div>

      {/* NEW: MobilePay Modal */}
      {showMobilePayModal && (
        <MobilePayModal
          businessId={business?.businessId}
          orderId={`order-${Date.now()}`}
          total={total}
          currencyCode={_currCode}
          businessName={business?.businessName}
          onSuccess={handleMobilePaySuccess}
          onClose={() => {
            setShowMobilePayModal(false);
            setSelectedMethod(null);
          }}
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
    </div>
  );
};

export default CustomerPaymentPage;