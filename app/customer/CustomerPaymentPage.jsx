"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import QRCode from "react-qr-code";

const METHODS = [
  {
    id: "upi", label: "UPI",
    sub: "PhonePe · GPay · Paytm · BHIM · Any UPI App",
    apps: [
      { name:"PhonePe",   src:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.png/512px-PhonePe_Logo.png" },
      { name:"Google Pay", src:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" },
      { name:"Paytm",     src:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png" },
      { name:"BHIM",      src:"https://upload.wikimedia.org/wikipedia/en/thumb/4/44/BHIM_logo.svg/512px-BHIM_logo.svg.png" },
    ],
  },
  {
    id: "razorpay", label: "Cards & Net Banking",
    sub: "Powered by Razorpay — PhonePe · GPay · Paytm · Cards · Net Banking",
    apps: [
      { name:"PhonePe",    src:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.png/512px-PhonePe_Logo.png" },
      { name:"Google Pay", src:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" },
      { name:"Paytm",      src:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png" },
      { name:"Visa",       src:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png" },
    ],
  },
  {
    id: "stripe", label: "International Cards",
    sub: "Powered by Stripe — Apple Pay · GPay · MobilePay · Cards · Wallets",
    apps: [
      { name:"Apple Pay",  src:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/512px-Apple_Pay_logo.svg.png" },
      { name:"Google Pay", src:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" },
      { name:"Visa",       src:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png" },
      { name:"Mastercard", src:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/512px-Mastercard-logo.svg.png" },
    ],
  },
  // {
  //   id: "paypal", label: "PayPal",
  //   sub: "Fast, secure — available in 200+ countries",
  //   apps: [],
  // },
];

const CustomerPaymentPage = ({ total, business, diningInfo, onBack, onInitiatePayment, onConfirmPayment }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentData,    setPaymentData]    = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [confirming,     setConfirming]     = useState(false);
  const [error,          setError]          = useState("");
  const [upiRef,         setUpiRef]         = useState("");

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
                    {m.apps.map(a => (
                      <img key={a.name} src={a.src} alt={a.name} title={a.name}
                        style={{ width:24, height:24, objectFit:"contain", borderRadius:6, background:"#fff", border:"1px solid var(--border)", padding:2 }}
                        onError={e => { e.target.style.display="none"; }}
                      />
                    ))}
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
                    <img src={a.src} alt={a.name} style={{ width:36, height:36, objectFit:"contain", borderRadius:10, background:"#fff", border:"1px solid var(--border)", padding:2 }} onError={e => { e.target.style.display="none"; }}/>
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
                  <img key={a.name} src={a.src} alt={a.name} style={{ width:36, height:36, objectFit:"contain", borderRadius:10, background:"#fff", border:"1px solid var(--border)", padding:3 }} onError={e => { e.target.style.display="none"; }}/>
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
              <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:6 }}>Apple Pay · Google Pay · MobilePay · Visa · Mastercard</div>
              <div style={{ fontSize:26, fontWeight:900, color:"var(--brand)", marginBottom:12 }}>₹{total}</div>
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16, flexWrap:"wrap" }}>
                {METHODS[2].apps.map(a => (
                  <img key={a.name} src={a.src} alt={a.name} style={{ width:36, height:36, objectFit:"contain", borderRadius:10, background:"#fff", border:"1px solid var(--border)", padding:3 }} onError={e => { e.target.style.display="none"; }}/>
                ))}
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
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

export default CustomerPaymentPage;
