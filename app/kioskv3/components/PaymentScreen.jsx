import React, { useState } from "react";
import Logo from "./Logo";
import { formatCurrency } from "../../utils/currencyHelper";
import { UpiPanel, isUpiValid, GatewayPanel, CounterPanel } from "./PaymentMethodDetails";

const METHODS = [
  { id: "upi", label: "UPI", icon: "upi" },
  { id: "razorpay", label: "Cards & Net Banking", icon: "card" },
  { id: "stripe", label: "International Card", icon: "mobile" },
];

const ICONS = {
  card: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" />
      <path d="M2.5 10h19" />
    </svg>
  ),
  upi: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12L14 4l6 6-10 10-6-6 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  mobile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19M12 2.5a15 15 0 0 1 0 19M12 2.5a15 15 0 0 0 0 19" strokeLinecap="round" />
    </svg>
  ),
  cash: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  ),
};

export default function PaymentScreen({
  total,
  currencyCode,
  business,
  diningInfo,
  payAtCounterAvailable,
  onBack,
  onInitiatePayment,
  onConfirmPayment,
}) {
  const methods = payAtCounterAvailable
    ? [...METHODS, { id: "cash", label: "Pay at Counter", icon: "cash" }]
    : METHODS;

  const [selected, setSelected] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [initLoading, setInitLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [upiRef, setUpiRef] = useState("");
  const [error, setError] = useState("");

  async function select(id) {
    if (selected === id) return;
    setSelected(id);
    setPaymentData(null);
    setError("");
    setUpiRef("");
    if (id === "cash") return; // no gateway to initialize
    setInitLoading(true);
    try {
      const data = await onInitiatePayment(id);
      setPaymentData(data);
    } catch (e) {
      setError(e.message || "Failed to start payment. Please try again.");
    } finally {
      setInitLoading(false);
    }
  }

  async function handleRazorpay() {
    if (!paymentData?.razorpayOrderId) return;
    setError("");
    const options = {
      key: paymentData.razorpayKeyId,
      amount: Math.round(total * 100),
      currency: "INR",
      name: business?.businessName || "TableTop Leo",
      description: "Kiosk Order Payment",
      order_id: paymentData.razorpayOrderId,
      handler: async (response) => {
        setConfirming(true);
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
        } catch (e) {
          setError(e.message || "Payment confirmation failed.");
        } finally {
          setConfirming(false);
        }
      },
      prefill: { contact: diningInfo?.phone || "", email: "" },
      theme: { color: "#e0973f" },
    };
    if (window.Razorpay) {
      new window.Razorpay(options).open();
    } else {
      setError("Payment SDK not loaded. Please try again.");
    }
  }

  async function handleStripe() {
    if (!paymentData?.stripeClientSecret || !window.Stripe) {
      setError("Payment SDK not loaded. Please try again.");
      return;
    }
    setConfirming(true);
    setError("");
    try {
      const stripe = window.Stripe(paymentData.stripePublishableKey);
      const result = await stripe.confirmPayment({
        clientSecret: paymentData.stripeClientSecret,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });
      if (result.error) {
        setError(result.error.message);
        return;
      }
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
    } catch (e) {
      setError(e.message || "Payment failed.");
    } finally {
      setConfirming(false);
    }
  }

  async function handleUpiConfirm() {
    if (!isUpiValid(upiRef) || !paymentData) return;
    setConfirming(true);
    setError("");
    try {
      await onConfirmPayment({
        paymentId: paymentData.paymentId,
        orderId: paymentData.orderId,
        gatewayName: "upi",
        transactionId: upiRef.trim(),
        paymentReference: upiRef.trim(),
        gatewayResponse: JSON.stringify({ upiRef, confirmedAt: new Date().toISOString() }),
      });
    } catch (e) {
      setError(e.message || "Payment confirmation failed.");
    } finally {
      setConfirming(false);
    }
  }

  async function handleCash() {
    setConfirming(true);
    setError("");
    try {
      const initData = await onInitiatePayment("pay_at_counter");
      await onConfirmPayment({
        paymentId: initData.paymentId,
        orderId: initData.orderId,
        orderNumber: initData.orderNumber,
        grandTotal: initData.grandTotal,
        orderType: initData.orderType,
        customerName: initData.customerName,
        createdAt: initData.createdAt,
        payAtCounter: true,
        gatewayName: "pay_at_counter",
        gatewayResponse: JSON.stringify({ method: "pay_at_counter", ts: new Date().toISOString() }),
      });
    } catch (e) {
      setError(e.message || "Failed to place order.");
    } finally {
      setConfirming(false);
    }
  }

  function handlePay() {
    if (selected === "razorpay") return handleRazorpay();
    if (selected === "stripe") return handleStripe();
    if (selected === "upi") return handleUpiConfirm();
    if (selected === "cash") return handleCash();
  }

  const isValid = (() => {
    if (confirming) return false;
    switch (selected) {
      case "upi": return !!paymentData && isUpiValid(upiRef);
      case "razorpay": return !!paymentData?.razorpayOrderId;
      case "stripe": return !!paymentData?.stripeClientSecret;
      case "cash": return true;
      default: return false;
    }
  })();

  const ctaLabel = confirming
    ? "Confirming…"
    : selected === "cash"
      ? `Confirm order · ${formatCurrency(total, currencyCode)}`
      : selected === "upi"
        ? "I've paid — Confirm order"
        : `Pay ${formatCurrency(total, currencyCode)}`;

  return (
    <div className="relative w-full h-full bg-sand flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 bg-cream border-b border-charcoal/8 z-10">
        <button onClick={onBack} className="text-charcoal/50 text-xs flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <Logo size={26} />
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-5 pb-4 relative">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ember-deep font-semibold">Final step</p>
        <h2 className="font-display font-semibold text-charcoal text-xl mt-0.5 mb-1">
          Choose payment method
        </h2>
        <p className="text-muted text-xs mb-5">
          Total due: <span className="font-semibold text-charcoal">{formatCurrency(total, currencyCode)}</span>
        </p>

        <div className="flex flex-col gap-2.5">
          {methods.map((m) => {
            const active = selected === m.id;
            return (
              <div
                key={m.id}
                className={`rounded-2xl border transition-colors overflow-hidden ${
                  active ? "bg-ember/10 border-ember" : "bg-white border-charcoal/10"
                }`}
              >
                <button onClick={() => select(m.id)} className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left active:bg-charcoal/5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-ember text-ink" : "bg-sand text-charcoal/60"}`}>
                    {ICONS[m.icon]}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-charcoal">{m.label}</span>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? "border-ember bg-ember" : "border-charcoal/20"}`}>
                    {active && <span className="w-2 h-2 rounded-full bg-ink" />}
                  </span>
                </button>

                {active && (
                  <div className="px-4 pb-4">
                    {m.id === "upi" && (
                      <UpiPanel paymentData={paymentData} loading={initLoading} upiRef={upiRef} onUpiRefChange={setUpiRef} />
                    )}
                    {m.id === "razorpay" && <GatewayPanel label="Card" loading={initLoading} />}
                    {m.id === "stripe" && <GatewayPanel label="International Card" loading={initLoading} />}
                    {m.id === "cash" && <CounterPanel />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <p className="mt-3 text-[11.5px] text-claret bg-claret/8 border border-claret/20 rounded-lg px-3 py-2.5">
            ⚠ {error}
          </p>
        )}
      </div>

      <div className="px-5 py-4 bg-cream border-t border-charcoal/8">
        <button
          onClick={handlePay}
          disabled={!isValid}
          className={`w-full rounded-full py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            isValid ? "bg-ember text-ink active:bg-ember-deep" : "bg-charcoal/10 text-charcoal/30"
          }`}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
