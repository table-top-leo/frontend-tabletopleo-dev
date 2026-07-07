"use client";
import { useState } from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import QRCode from "react-qr-code";

const ICON_URLS = {
  "PhonePe":     "https://img.icons8.com/color/96/000000/phone-pe.png",
  "Google Pay":  "https://img.icons8.com/color/96/000000/google-pay.png",
  "Paytm":       "https://img.icons8.com/color/96/000000/paytm.png",
  "BHIM":        "https://img.icons8.com/color/96/000000/bhim.png",
  "Visa":        "https://img.icons8.com/color/96/000000/visa.png",
  "Mastercard":  "https://img.icons8.com/color/96/000000/mastercard-logo.png",
  "Apple Pay":   "https://img.icons8.com/color/96/000000/apple-pay.png",
  "Mobile Pay":  "https://img.icons8.com/color/96/000000/mobile-payment.png",
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

const METHODS = [
  {
    id: "upi", label: "UPI",
    sub: "PhonePe · GPay · Paytm · BHIM · Any UPI App",
    apps: [
      { name:"PhonePe" },
      { name:"Google Pay" },
      { name:"Paytm" },
      { name:"BHIM" },
    ],
  },
  {
    id: "razorpay", label: "Cards & Net Banking",
    sub: "Powered by Razorpay — PhonePe · GPay · Paytm · Cards · Net Banking",
    apps: [
      { name:"PhonePe" },
      { name:"Google Pay" },
      { name:"Paytm" },
      { name:"Visa" },
    ],
  },
  {
    id: "stripe", label: "International Cards",
    sub: "Powered by Stripe — Apple Pay · Mobile Pay · GPay · Cards · Net Banking",
    apps: [
      { name:"Apple Pay" },
      { name:"Mobile Pay" },
      { name:"Google Pay" },
      { name:"Other Cards & Net Banking", generic:true },
    ],
  },
  // {
  //   id: "paypal", label: "PayPal",
  //   sub: "Fast, secure — available in 200+ countries",
  //   apps: [],
  // },
];

const CustomerPaymentPage = ({ total, business, diningInfo, onBack, onInitiatePayment, onConfirmPayment, payAtCounterAvailable }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentData,    setPaymentData]    = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [confirming,     setConfirming]     = useState(false);
  const [error,          setError]          = useState("");
  const [upiRef,         setUpiRef]         = useState("");
  const [payAtCounter,   setPayAtCounter]   = useState(false);

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
    if (!paymentData?.razorpayOrderId) { setError("Razorpay not initialized."); return; }
    const options = {
      key:         paymentData.razorpayKeyId,
      amount:      Math.round(total * 100),
      currency:    "INR",
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
    // PayPal JS SDK would handle this via window.paypal.Buttons
    // For now show a simulated confirm for demo
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
        <span className="cx-topbar-title">Payment</span>
        <div style={{ width:32 }}/>
      </div>

      <div style={{ flex:1, overflow:"auto", paddingBottom:16 }}>
        {/* Order Summary */}
        <div className="cx-section">
          <div className="order-summary-box">
            <div className="osb-title">Order Summary</div>
            <div className="osb-row"><span className="osb-label">Business</span><span className="osb-value">{business?.businessName}</span></div>
            <div className="osb-row"><span className="osb-label">Order Type</span><span className="osb-value">{diningInfo.type === "dine-in" ? "🍽️ Dine In" : "🥡 Take Away"}{diningInfo.table ? ` — ${diningInfo.table}` : ""}</span></div>
            {diningInfo.name && <div className="osb-row"><span className="osb-label">Name</span><span className="osb-value">{diningInfo.name}</span></div>}
            {diningInfo.note && <div className="osb-row"><span className="osb-label">Note</span><span className="osb-value" style={{ fontStyle:"italic", color:"var(--text-muted)", fontSize:12 }}>{diningInfo.note}</span></div>}
            <div className="osb-row"><span className="osb-label">Amount</span><span className="osb-amount">₹{total}</span></div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="cx-section" style={{ paddingTop:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:10 }}>Select Payment Method</div>

          {METHODS.map(m => (
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
        {loading && (
          <div style={{ textAlign:"center", padding:24 }}>
            <div style={{ width:32, height:32, border:"3px solid var(--brand-muted)", borderTop:"3px solid var(--brand)", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 10px" }}/>
            <p style={{ fontSize:13, color:"var(--text-muted)", margin:0 }}>Initializing payment...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ margin:"0 16px", background:"var(--red-bg)", border:"1px solid #fecaca", borderRadius:"var(--radius-md)", padding:"10px 14px" }}>
            <p style={{ margin:0, fontSize:12.5, color:"var(--red)", fontWeight:600 }}>⚠ {error}</p>
          </div>
        )}

        {/* UPI Section */}
        {selectedMethod==="upi" && paymentData && !loading && (
          <div style={{ margin:"0 16px", animation:"fadeIn 0.22s ease" }}>
            <div style={{ background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-lg)", padding:20, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:13, color:"var(--text-muted)", fontWeight:600 }}>Scan to pay <strong style={{ color:"var(--text-primary)" }}>{business?.businessName}</strong></div>
              <div style={{ fontSize:28, fontWeight:900, color:"var(--brand)" }}>₹{total}</div>
              <div style={{ background:"#fff", padding:12, borderRadius:12, border:"1.5px solid var(--border)" }}>
                <QRCode value={paymentData.upiString} size={150} fgColor="#7B3F00"/>
              </div>
              <div style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center" }}>Scan using any UPI app · Or tap an app below</div>
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
                  Enter UPI Transaction ID after payment <span style={{ color:"var(--red)" }}>*</span>
                </label>
                <input
                  value={upiRef} onChange={e => setUpiRef(e.target.value)}
                  placeholder="e.g. 3208765432109876"
                  style={{ width:"100%", padding:"10px 12px", border:"1.5px solid var(--border)", borderRadius:"var(--radius-md)", fontSize:13, fontFamily:"monospace", outline:"none", boxSizing:"border-box" }}
                />
                <p style={{ margin:"4px 0 0", fontSize:11, color:"var(--text-muted)" }}>
                  Find this in your UPI app after successful payment
                </p>
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <button style={s.payBtn(confirming || !upiRef.trim())} disabled={confirming || !upiRef.trim()} onClick={handleUpiConfirm}>
                {confirming ? "Verifying..." : "I've Paid — Confirm Order ✓"}
              </button>
            </div>
          </div>
        )}

        {/* Razorpay Section */}
        {selectedMethod==="razorpay" && paymentData && !loading && (
          <div style={{ margin:"0 16px", animation:"fadeIn 0.22s ease" }}>
            <div style={{ background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-lg)", padding:20, textAlign:"center" }}>
              <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:6 }}>Pay using PhonePe, GPay, Paytm, Cards, or Net Banking</div>
              <div style={{ fontSize:26, fontWeight:900, color:"var(--brand)", marginBottom:12 }}>₹{total}</div>
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16, flexWrap:"wrap" }}>
                {METHODS[1].apps.map(a => (
                  <PaymentIcon key={a.name} name={a.name} size={36} />
                ))}
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <button style={s.payBtn(confirming)} disabled={confirming} onClick={handleRazorpayPay}>
                {confirming ? "Processing..." : `Pay ₹${total} via Razorpay →`}
              </button>
            </div>
            <script src="https://checkout.razorpay.com/v1/checkout.js" async/>
          </div>
        )}

        {/* Stripe Section */}
        {selectedMethod==="stripe" && paymentData && !loading && (
          <div style={{ margin:"0 16px", animation:"fadeIn 0.22s ease" }}>
            <div style={{ background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-lg)", padding:20, textAlign:"center" }}>
              <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:6 }}>Apple Pay · Mobile Pay · Google Pay · Cards · Net Banking</div>
              <div style={{ fontSize:26, fontWeight:900, color:"var(--brand)", marginBottom:12 }}>₹{total}</div>
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16, flexWrap:"wrap" }}>
                {METHODS[2].apps.map(a => renderAppIcon(a, 36))}
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <button style={s.payBtn(confirming)} disabled={confirming} onClick={handleStripePay}>
                {confirming ? "Processing..." : `Pay ₹${total} via Stripe →`}
              </button>
            </div>
          </div>
        )}

        {/* PayPal Section */}
        {/* {selectedMethod==="paypal" && paymentData && !loading && (
          <div style={{ margin:"0 16px", animation:"fadeIn 0.22s ease" }}>
            <div style={{ background:"#e8f4fd", border:"1.5px solid #b3d7f5", borderRadius:"var(--radius-lg)", padding:20, textAlign:"center" }}>
              <div style={{ fontSize:13, color:"#555", marginBottom:6 }}>Fast · Secure · Available worldwide</div>
              <div style={{ fontSize:26, fontWeight:900, color:"#003087", marginBottom:12 }}>₹{total}</div>
            </div>
            <div style={{ marginTop:12 }}>
              <button style={{ ...s.payBtn(confirming), background:"#0070ba" }} disabled={confirming} onClick={handlePaypalPay}>
                {confirming ? "Processing..." : "Pay with PayPal →"}
              </button>
            </div>
          </div>
        )} */}

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
                  🏪 Pay at Counter
                </div>
                <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                  Place your order now and pay cash / card at the counter
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
            {confirming ? "Placing Order..." : "Proceed with Order with Pay at Counter →"}
          </button>
        ) : (
          <button
            style={s.payBtn(!selectedMethod || loading)}
            disabled={!selectedMethod || loading}
          >
            {!selectedMethod ? "Select a Payment Method" : `Pay ₹${total}`}
          </button>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

export default CustomerPaymentPage;