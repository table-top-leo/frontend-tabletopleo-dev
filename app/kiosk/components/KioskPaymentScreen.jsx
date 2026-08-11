"use client";
import React, { useState } from "react";
import axios from "axios";
import KioskLogo from "./KioskLogo";
import { formatCurrency } from "../../utils/currencyHelper";
import { KioskUpiPanel, KioskGatewaySummaryPanel, KioskCounterPanel } from "./KioskPaymentMethodPanels";
import KioskMobilePayModal from "./KioskMobilePayModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:6163/api";

const METHOD_ICONS = {
  upi: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12L14 4l6 6-10 10-6-6 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  razorpay: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" />
      <path d="M2.5 10h19" />
    </svg>
  ),
  stripe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" />
      <path d="M2.5 10h19" />
    </svg>
  ),
  mobilepay: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="6" y="2.5" width="12" height="19" rx="2.2" />
      <path d="M11 18h2" strokeLinecap="round" />
    </svg>
  ),
  pay_at_counter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  ),
};

const ALL_METHODS = [
  { id: "upi", label: "UPI", sub: "PhonePe · GPay · Paytm · BHIM · Any UPI app" },
  { id: "razorpay", label: "Cards & Net Banking", sub: "Powered by Razorpay" },
  { id: "stripe", label: "International Cards", sub: "Powered by Stripe — Apple Pay, GPay, cards" },
  { id: "mobilepay", label: "Mobile Pay", sub: "Scan with your phone's wallet to pay instantly" },
];

export default function KioskPaymentScreen({
  total, business, currencyCode, diningInfo, payAtCounterAvailable,
  onInitiatePayment, onConfirmPayment, onBeginProcessing, onProcessingFailed,
  paymentError, onBack,
}) {
  const visibleMethods = business?.availablePaymentMethods
    ? ALL_METHODS.filter((m) => business.availablePaymentMethods.map((x) => x.toLowerCase()).includes(m.id))
    : ALL_METHODS;

  const [selected, setSelected] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(paymentError || "");
  const [upiRef, setUpiRef] = useState("");
  const [showMobilePayModal, setShowMobilePayModal] = useState(false);
  const [checkingMobilePayConfig, setCheckingMobilePayConfig] = useState(false);

  const checkMobilePayConfiguration = async () => {
    setCheckingMobilePayConfig(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/payment/mobilepay/check-config/${business?.businessId}`);
      if (res.data.success && res.data.data?.configured) {
        setShowMobilePayModal(true);
      } else {
        setError("Mobile Pay is not configured for this business yet. Please choose another method.");
        setSelected(null);
      }
    } catch {
      setError("Mobile Pay is not configured for this business yet. Please choose another method.");
      setSelected(null);
    } finally {
      setCheckingMobilePayConfig(false);
    }
  };

  const handleSelectMethod = async (methodId) => {
    setSelected(methodId);
    setPaymentData(null);
    setError("");
    if (methodId === "mobilepay") { await checkMobilePayConfiguration(); return; }
    setLoading(true);
    try {
      const data = await onInitiatePayment(methodId);
      setPaymentData(data);
    } catch (e) {
      setError(e.message || "Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMobilePaySuccess = async (mpData) => {
    setShowMobilePayModal(false);
    onBeginProcessing?.("mobile pay");
    try {
      const initData = await onInitiatePayment("mobilepay");
      await onConfirmPayment({
        paymentId: initData.paymentId, orderId: initData.orderId, orderNumber: initData.orderNumber,
        grandTotal: initData.grandTotal, orderType: initData.orderType, customerName: initData.customerName,
        createdAt: initData.createdAt, gatewayName: "mobilepay",
        paymentReference: mpData.paymentReference, transactionId: mpData.transactionId,
        amount: mpData.amount, currency: mpData.currency, gatewayResponse: JSON.stringify(mpData),
      });
    } catch (e) {
      onProcessingFailed?.(`Mobile Pay confirmation failed: ${e.message}`);
    }
  };

  const handleUpiConfirm = async () => {
    if (!upiRef.trim()) { setError("Please enter your UPI transaction reference."); return; }
    onBeginProcessing?.("UPI");
    try {
      await onConfirmPayment({
        paymentId: paymentData.paymentId, orderId: paymentData.orderId, gatewayName: "upi",
        transactionId: upiRef.trim(), paymentReference: upiRef.trim(),
        gatewayResponse: JSON.stringify({ upiRef, confirmedAt: new Date().toISOString() }),
      });
    } catch (e) {
      onProcessingFailed?.(e.message);
    }
  };

  const handleRazorpayPay = () => {
    if (!paymentData?.razorpayOrderId) { setError("Razorpay not initialized."); return; }
    const options = {
      key: paymentData.razorpayKeyId,
      amount: Math.round(total * 100),
      currency: currencyCode,
      name: business?.businessName || "Table Top Leo",
      description: "Kiosk order payment",
      order_id: paymentData.razorpayOrderId,
      handler: async (response) => {
        setConfirming(true); setError("");
        try {
          await onConfirmPayment({
            paymentId: paymentData.paymentId, orderId: paymentData.orderId, gatewayName: "razorpay",
            razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature, transactionId: response.razorpay_payment_id,
            gatewayResponse: JSON.stringify(response),
          });
        } catch (e) { setError(e.message); } finally { setConfirming(false); }
      },
      prefill: { contact: diningInfo?.phone || "", email: diningInfo?.email || "" },
      theme: { color: "#e0973f" },
    };
    if (window.Razorpay) {
      new window.Razorpay(options).open();
    } else {
      setError("Razorpay SDK not loaded. Please refresh and try again.");
    }
  };

  const handleStripePay = async () => {
    if (!paymentData?.stripeClientSecret) { setError("Stripe not initialized."); return; }
    if (!window.Stripe) { setError("Stripe SDK not loaded."); return; }
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
          paymentId: paymentData.paymentId, orderId: paymentData.orderId, gatewayName: "stripe",
          stripePaymentIntentId: result.paymentIntent.id, transactionId: result.paymentIntent.id,
          gatewayResponse: JSON.stringify(result.paymentIntent),
        });
      }
    } catch (e) { setError(e.message); } finally { setConfirming(false); }
  };

  const handlePayAtCounter = async () => {
    onBeginProcessing?.("pay at counter");
    try {
      const initData = await onInitiatePayment("pay_at_counter");
      await onConfirmPayment({
        paymentId: initData.paymentId, payAtCounter: true, gatewayName: "pay_at_counter",
        orderId: initData.orderId, orderNumber: initData.orderNumber, grandTotal: initData.grandTotal,
        orderType: initData.orderType, customerName: initData.customerName, createdAt: initData.createdAt,
        gatewayResponse: JSON.stringify({ method: "pay_at_counter", ts: new Date().toISOString() }),
      });
    } catch (e) {
      onProcessingFailed?.(e.message);
    }
  };

  return (
    <div className="ttlKioskKestrelScreen">
      <div className="ttlKioskTopbarLight">
        <button onClick={onBack} className="ttlKioskBackLink ttlKioskLogoDark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <KioskLogo size={26} />
        <span style={{ width: 32 }} />
      </div>

      <div className="ttlKioskKestrelBody ttlKioskNoScroll">
        <p className="ttlKioskTigerEyebrow">Final step</p>
        <h2 className="ttlKioskTigerTitle" style={{ marginBottom: 4 }}>Choose payment method</h2>
        <p className="ttlKioskKestrelDue">
          Total due: <strong>{formatCurrency(total, currencyCode)}</strong>
        </p>

        <div className="ttlKioskKestrelMethods">
          {visibleMethods.map((m) => {
            const active = selected === m.id;
            return (
              <div key={m.id} className={`ttlKioskKestrelMethod ${active ? "ttlKioskKestrelMethodActive" : ""}`}>
                <button className="ttlKioskKestrelMethodHead" onClick={() => handleSelectMethod(m.id)}>
                  <div className="ttlKioskKestrelMethodIcon">{METHOD_ICONS[m.id]}</div>
                  <span className="ttlKioskKestrelMethodLabel">
                    {m.label}
                    <span className="ttlKioskKestrelMethodSub">{m.sub}</span>
                  </span>
                  <span className="ttlKioskKestrelRadio">{active && <span className="ttlKioskKestrelRadioDot" />}</span>
                </button>

                {active && (
                  <div className="ttlKioskKestrelPanel">
                    {(loading || checkingMobilePayConfig) && (
                      <div style={{ textAlign: "center", padding: 16 }}>
                        <div className="ttlKioskSpinner" style={{ width: 26, height: 26, margin: "0 auto 8px" }} />
                        <p style={{ fontSize: 12, color: "var(--kiosk-muted)", margin: 0 }}>
                          {checkingMobilePayConfig ? "Checking Mobile Pay setup…" : "Preparing payment…"}
                        </p>
                      </div>
                    )}
                    {!loading && m.id === "upi" && paymentData && (
                      <KioskUpiPanel
                        total={total} currencyCode={currencyCode} businessName={business?.businessName}
                        paymentData={paymentData} upiRef={upiRef} setUpiRef={setUpiRef}
                        confirming={confirming} onConfirm={handleUpiConfirm}
                      />
                    )}
                    {!loading && m.id === "razorpay" && paymentData && (
                      <KioskGatewaySummaryPanel
                        label="Pay using PhonePe, GPay, Paytm, cards, or net banking"
                        total={total} currencyCode={currencyCode}
                        apps={["PhonePe", "Google Pay", "Paytm"]}
                        confirming={confirming} onPay={handleRazorpayPay}
                      />
                    )}
                    {!loading && m.id === "stripe" && paymentData && (
                      <KioskGatewaySummaryPanel
                        label="Apple Pay · Google Pay · cards · net banking"
                        total={total} currencyCode={currencyCode}
                        apps={["Google Pay"]}
                        confirming={confirming} onPay={handleStripePay}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {payAtCounterAvailable && (
            <div className={`ttlKioskKestrelMethod ${selected === "pay_at_counter" ? "ttlKioskKestrelMethodActive" : ""}`}>
              <button className="ttlKioskKestrelMethodHead" onClick={() => { setSelected("pay_at_counter"); setError(""); }}>
                <div className="ttlKioskKestrelMethodIcon">{METHOD_ICONS.pay_at_counter}</div>
                <span className="ttlKioskKestrelMethodLabel">
                  Pay at Counter
                  <span className="ttlKioskKestrelMethodSub">Place your order now, pay cash or card at the counter</span>
                </span>
                <span className="ttlKioskKestrelRadio">{selected === "pay_at_counter" && <span className="ttlKioskKestrelRadioDot" />}</span>
              </button>
              {selected === "pay_at_counter" && (
                <div className="ttlKioskKestrelPanel"><KioskCounterPanel /></div>
              )}
            </div>
          )}
        </div>

        {error && <div className="ttlKioskErrorBanner" style={{ margin: "14px 0 0" }}>⚠ {error}</div>}
      </div>

      <div className="ttlKioskKestrelFooter">
        {selected === "pay_at_counter" ? (
          <button className="ttlKioskPillBtn ttlKioskPillBtnPrimary" disabled={confirming} onClick={handlePayAtCounter}>
            {confirming ? "Placing order…" : `Confirm order · ${formatCurrency(total, currencyCode)}`}
          </button>
        ) : (
          <button className="ttlKioskPillBtn ttlKioskPillBtnPrimary" disabled>
            {!selected ? "Select a payment method" : `Complete payment above`}
          </button>
        )}
      </div>

      {showMobilePayModal && (
        <KioskMobilePayModal
          businessId={business?.businessId}
          orderId={`kiosk-order-${Date.now()}`}
          total={total}
          currencyCode={currencyCode}
          businessName={business?.businessName}
          onSuccess={handleMobilePaySuccess}
          onClose={() => { setShowMobilePayModal(false); setSelected(null); }}
        />
      )}
    </div>
  );
}
