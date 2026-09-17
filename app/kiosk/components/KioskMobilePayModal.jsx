"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatCurrency } from "../../utils/currencyHelper";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.tabletopleo.com/api";

export default function KioskMobilePayModal({ businessId, orderId, total, currencyCode, businessName, onSuccess, onClose }) {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [error, setError] = useState("");
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => { initiatePayment(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  useEffect(() => {
    if (!paymentData || paymentStatus === "CAPTURED") return;
    const iv = setInterval(checkPaymentStatus, 2500);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData, paymentStatus]);

  useEffect(() => {
    if (!paymentData) return;
    const iv = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) { setPaymentStatus("EXPIRED"); clearInterval(iv); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData]);

  const initiatePayment = async () => {
    try {
      setLoading(true); setError("");
      const response = await axios.post(`${API_BASE_URL}/payment/mobilepay/initiate`, {
        businessId, orderId, amount: total, currency: currencyCode || "DKK",
        businessName, generateQrCode: true, environment: "sandbox",
      });
      if (response.data.success && response.data.data) {
        setPaymentData(response.data.data);
        setTimeRemaining(response.data.data.expiresIn || 900);
      } else {
        setError(response.data.message || "Failed to initiate payment");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate MobilePay payment");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.paymentReference) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/payment/mobilepay/status/${businessId}/${paymentData.paymentReference}`);
      if (response.data.success && response.data.data) {
        const status = response.data.data.status;
        setPaymentStatus(status);
        setPollCount((p) => p + 1);
        if (status === "CAPTURED") {
          onSuccess({
            paymentReference: paymentData.paymentReference,
            transactionId: paymentData.transactionId,
            amount: total, currency: currencyCode || "DKK", status: "CAPTURED",
          });
        }
      }
    } catch { /* keep polling */ }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const overlayStyle = { position: "fixed", inset: 0, background: "rgba(13,12,11,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 };
  const cardStyle = { background: "#fff", borderRadius: 20, padding: 26, maxWidth: 420, width: "100%", maxHeight: "88vh", overflow: "auto" };

  if (loading) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...cardStyle, textAlign: "center", maxWidth: 320 }}>
          <div className="ttlKioskSpinner" style={{ width: 44, height: 44, margin: "0 auto 14px" }} />
          <p style={{ fontSize: 13, color: "var(--kiosk-muted)", margin: 0 }}>Initiating Mobile Pay payment…</p>
        </div>
      </div>
    );
  }

  if (error && !paymentData) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...cardStyle, maxWidth: 340 }}>
          <p style={{ fontWeight: 700, color: "var(--kiosk-claret)", marginBottom: 6 }}>Cannot process payment</p>
          <p style={{ fontSize: 13, color: "var(--kiosk-muted)", marginBottom: 16 }}>{error}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} className="ttlKioskPillBtn ttlKioskPillBtnPrimary">Close</button>
            <button onClick={initiatePayment} className="ttlKioskPillBtn ttlKioskPillBtnGhost">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "CAPTURED") {
    return (
      <div style={overlayStyle}>
        <div style={{ ...cardStyle, textAlign: "center", maxWidth: 340 }}>
          <p style={{ fontWeight: 700, color: "var(--kiosk-moss)", fontSize: 17 }}>Payment successful!</p>
          <p style={{ fontSize: 13, color: "var(--kiosk-muted)" }}>Confirming your order…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, paddingBottom: 16, borderBottom: "1px solid rgba(38,34,29,0.1)" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: "var(--kiosk-charcoal)" }}>Mobile Pay</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--kiosk-muted)" }}>Scan the QR code with your phone's wallet app</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: "var(--kiosk-muted)" }}>✕</button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "var(--kiosk-charcoal)" }}>{formatCurrency(total, currencyCode)}</p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--kiosk-muted)" }}>{businessName}</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div className="ttlKioskKestrelQrWrap">
            {paymentData?.qrCodeData ? (
              <img src={paymentData.qrCodeData} alt="Mobile Pay QR" style={{ width: 190, height: 190 }} />
            ) : (
              <p style={{ fontSize: 12, color: "var(--kiosk-muted)", width: 190 }}>QR unavailable — use the payment link on your phone.</p>
            )}
          </div>
        </div>

        <div style={{ padding: 10, background: "rgba(224,151,63,0.12)", border: "1px solid rgba(224,151,63,0.3)", borderRadius: 12, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--kiosk-ember-deep)" }}>Waiting for payment… (checked {pollCount}×)</span>
          {timeRemaining > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--kiosk-ember-deep)" }}>{formatTime(timeRemaining)}</span>}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={checkPaymentStatus} className="ttlKioskPillBtn ttlKioskPillBtnGhost" style={{ color: "var(--kiosk-charcoal)", borderColor: "rgba(38,34,29,0.2)" }}>Check status</button>
          <button onClick={onClose} className="ttlKioskPillBtn ttlKioskPillBtnGhost" style={{ color: "var(--kiosk-charcoal)", borderColor: "rgba(38,34,29,0.2)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
