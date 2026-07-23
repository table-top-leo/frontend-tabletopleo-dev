"use client";
import { useState } from "react";
import { ArrowLeft, CreditCard, Store, Smartphone, Landmark } from "lucide-react";
import QRCode from "react-qr-code";
import { formatCurrency } from "../../utils/currencyHelper";

const METHODS = [
  {
    id: "upi",
    label: "UPI / QR Pay",
    sub: "Scan with any UPI app — PhonePe, GPay, Paytm, BHIM",
    icon: Smartphone,
  },
  {
    id: "razorpay",
    label: "Cards & Net Banking",
    sub: "Tap or insert card · Powered by Razorpay",
    icon: CreditCard,
  },
  {
    id: "stripe",
    label: "International Card",
    sub: "Visa, Mastercard, Apple Pay, Google Pay",
    icon: Landmark,
  },
];

const KioskPaymentScreen = ({
  total,
  business,
  diningInfo,
  currencyCode,
  onBack,
  onInitiatePayment,
  onConfirmPayment,
  payAtCounterAvailable,
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [payAtCounter, setPayAtCounter] = useState(false);

  const handleSelectMethod = async (methodId) => {
    setSelectedMethod(methodId);
    setPaymentData(null);
    setError("");
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

  const handleUpiConfirm = async () => {
    if (!upiRef.trim()) { setError("Please enter your UPI transaction reference."); return; }
    setConfirming(true); setError("");
    try {
      await onConfirmPayment({
        paymentId: paymentData.paymentId,
        orderId: paymentData.orderId,
        gatewayName: "upi",
        transactionId: upiRef.trim(),
        paymentReference: upiRef.trim(),
        gatewayResponse: JSON.stringify({ upiRef, confirmedAt: new Date().toISOString() }),
      });
    } catch (e) { setError(e.message); } finally { setConfirming(false); }
  };

  const handleRazorpayPay = () => {
    if (!paymentData?.razorpayOrderId) { setError("Razorpay not initialized."); return; }
    const options = {
      key: paymentData.razorpayKeyId,
      amount: Math.round(total * 100),
      currency: "INR",
      name: business?.businessName || "TableTop Leo",
      description: "Kiosk Order Payment",
      order_id: paymentData.razorpayOrderId,
      handler: async (response) => {
        setConfirming(true); setError("");
        try {
          await onConfirmPayment({
            paymentId: paymentData.paymentId,
            orderId: paymentData.orderId,
            gatewayName: "razorpay",
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            transactionId: response.razorpay_payment_id,
            gatewayResponse: JSON.stringify(response),
          });
        } catch (e) { setError(e.message); } finally { setConfirming(false); }
      },
      prefill: { contact: diningInfo?.phone || "", email: diningInfo?.email || "" },
      theme: { color: "#111114" },
    };
    if (window.Razorpay) {
      new window.Razorpay(options).open();
    } else {
      setError("Razorpay SDK not loaded. Please try again.");
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
          paymentId: paymentData.paymentId,
          orderId: paymentData.orderId,
          gatewayName: "stripe",
          stripePaymentIntentId: result.paymentIntent.id,
          transactionId: result.paymentIntent.id,
          gatewayResponse: JSON.stringify(result.paymentIntent),
        });
      }
    } catch (e) { setError(e.message); } finally { setConfirming(false); }
  };

  const handlePayAtCounter = async () => {
    setConfirming(true); setError("");
    try {
      const initData = await onInitiatePayment("pay_at_counter");
      await onConfirmPayment({
        paymentId: initData.paymentId,
        payAtCounter: true,
        gatewayName: "pay_at_counter",
        orderId: initData.orderId,
        orderNumber: initData.orderNumber,
        grandTotal: initData.grandTotal,
        orderType: initData.orderType,
        customerName: initData.customerName,
        createdAt: initData.createdAt,
        gatewayResponse: JSON.stringify({ method: "pay_at_counter", ts: new Date().toISOString() }),
      });
    } catch (e) { setError(e.message); } finally { setConfirming(false); }
  };

  return (
    <div className="k-step-shell">
      <div className="k-step-header">
        <button className="k-step-back" onClick={onBack}><ArrowLeft size={24} /></button>
        <div className="k-step-title">Payment</div>
      </div>

      <div className="k-step-body">
        <div className="k-step-body-inner">
          <div className="k-totals-box" style={{ marginBottom: 26 }}>
            <div className="k-totals-row"><span>Order Type</span><span>{diningInfo.type === "dine-in" ? "🍽️ Dine In" : "🥡 Take Away"}{diningInfo.table ? ` — ${diningInfo.table}` : ""}</span></div>
            {diningInfo.name && <div className="k-totals-row"><span>Name</span><span>{diningInfo.name}</span></div>}
            <div className="k-totals-row k-totals-final"><span>Amount Due</span><span>{formatCurrency(total, currencyCode)}</span></div>
          </div>

          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Select Payment Method</div>

          {METHODS.map((m) => {
            const Icon = m.icon;
            const active = selectedMethod === m.id;
            return (
              <div key={m.id} className={`k-pay-method ${active ? "is-selected" : ""}`} onClick={() => handleSelectMethod(m.id)}>
                <div className="k-pay-radio">{active && <div className="k-pay-radio-dot" />}</div>
                <div className="k-icon-circle" style={{ width: 52, height: 52 }}><Icon size={24} /></div>
                <div style={{ flex: 1 }}>
                  <div className="k-pay-title">{m.label}</div>
                  <div className="k-pay-sub">{m.sub}</div>
                </div>
              </div>
            );
          })}

          {payAtCounterAvailable && (
            <div
              className={`k-pay-method ${payAtCounter ? "is-selected" : ""}`}
              onClick={() => { setPayAtCounter((p) => !p); setSelectedMethod(null); setPaymentData(null); setError(""); }}
            >
              <div className="k-pay-radio">{payAtCounter && <div className="k-pay-radio-dot" />}</div>
              <div className="k-icon-circle" style={{ width: 52, height: 52 }}><Store size={24} /></div>
              <div style={{ flex: 1 }}>
                <div className="k-pay-title">Pay at Counter</div>
                <div className="k-pay-sub">Place your order now, pay cash or card at the counter</div>
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: 30 }}>
              <div className="k-spinner" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "var(--k-ink-mute)" }}>Initializing payment...</p>
            </div>
          )}

          {error && (
            <div className="k-pill k-pill-danger" style={{ display: "block", padding: "14px 18px", marginTop: 10, fontSize: 14 }}>⚠ {error}</div>
          )}

          {selectedMethod === "upi" && paymentData && !loading && (
            <div className="k-qr-panel">
              <div style={{ fontSize: 14, color: "var(--k-ink-mute)", fontWeight: 600 }}>Scan to pay <strong>{business?.businessName}</strong></div>
              <div style={{ fontSize: 30, fontWeight: 900 }}>{formatCurrency(total, currencyCode)}</div>
              <div className="k-qr-box"><QRCode value={paymentData.upiString} size={190} fgColor="#111114" /></div>
              <input
                className="k-field-input"
                placeholder="Enter UPI transaction ID after payment"
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value)}
                style={{ maxWidth: 360, fontFamily: "monospace" }}
              />
              <button className="k-btn k-btn-primary k-btn-lg" disabled={confirming || !upiRef.trim()} onClick={handleUpiConfirm}>
                {confirming ? "Verifying..." : "I've Paid — Confirm Order"}
              </button>
            </div>
          )}

          {selectedMethod === "razorpay" && paymentData && !loading && (
            <div className="k-qr-panel">
              <div style={{ fontSize: 14, color: "var(--k-ink-mute)" }}>Tap your card or phone on the reader, or continue on screen</div>
              <div style={{ fontSize: 30, fontWeight: 900 }}>{formatCurrency(total, currencyCode)}</div>
              <button className="k-btn k-btn-primary k-btn-lg" disabled={confirming} onClick={handleRazorpayPay}>
                {confirming ? "Processing..." : `Pay ${formatCurrency(total, currencyCode)} Now`}
              </button>
              <script src="https://checkout.razorpay.com/v1/checkout.js" async />
            </div>
          )}

          {selectedMethod === "stripe" && paymentData && !loading && (
            <div className="k-qr-panel">
              <div style={{ fontSize: 14, color: "var(--k-ink-mute)" }}>Apple Pay · Google Pay · Cards</div>
              <div style={{ fontSize: 30, fontWeight: 900 }}>{formatCurrency(total, currencyCode)}</div>
              <button className="k-btn k-btn-primary k-btn-lg" disabled={confirming} onClick={handleStripePay}>
                {confirming ? "Processing..." : `Pay ${formatCurrency(total, currencyCode)} Now`}
              </button>
            </div>
          )}
        </div>
      </div>

      {payAtCounter && (
        <div className="k-step-footer">
          <div className="k-step-footer-inner">
            <button className="k-btn k-btn-primary k-btn-xl k-btn-block" disabled={confirming} onClick={handlePayAtCounter}>
              {confirming ? "Placing Order..." : "Place Order — Pay at Counter"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskPaymentScreen;
