"use client";
import { CheckCircle2 } from "lucide-react";

const METHOD_LABEL = { upi:"UPI", razorpay:"Cards / Net Banking", stripe:"International Card", paypal:"PayPal", pay_at_counter:"🏪 Pay at Counter" };

const CustomerOrderSuccess = ({ confirmedData, onTrack, onHome }) => {
  const now = new Date();

  return (
    <div className="cw-screen">
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"36px 16px 20px", gap:18, overflowY:"auto" }}>
        <div style={{ display:"flex", gap:8 }}>
          {["#f59e0b","#22c55e","#f59e0b"].map((c,i) => (
            <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:c, animation:`pulse 1.2s infinite ${i*0.2}s` }}/>
          ))}
        </div>

        <div style={{ width:90, height:90, borderRadius:"50%", background:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <CheckCircle2 size={50} color="#16a34a" strokeWidth={2}/>
        </div>

        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:24, fontWeight:900, color:"var(--text-primary)", marginBottom:8 }}>Order Confirmed! 🎉</div>
          <div style={{ fontSize:13.5, color:"var(--text-muted)", lineHeight:1.6, maxWidth:260 }}>
            Your order has been placed and payment received. The kitchen has been notified!
          </div>
        </div>

        <div style={{ background:"var(--surface-2)", border:"1px solid var(--border-light)", borderRadius:"var(--radius-lg)", padding:14, width:"100%", display:"flex", flexDirection:"column", gap:8 }}>
          {[
            ["Order Number",    confirmedData?.orderNumber || "—"],
            ["Order ID",        confirmedData?.orderId     || "—"],
            ["Amount Paid",     `₹${confirmedData?.grandTotal || "—"}`],
            ["Payment",         METHOD_LABEL[confirmedData?.gatewayName] || confirmedData?.gatewayName || "—"],
            ["Status",          confirmedData?.paymentStatus || "PAID"],
            ["Date & Time",     `${now.toLocaleDateString("en-IN")} ${now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}`],
          ].map(([l,v]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13.5 }}>
              <span style={{ color:"var(--text-muted)" }}>{l}</span>
              <span style={{ fontWeight:700, color: l==="Amount Paid"?"var(--brand)":l==="Status"?"#16a34a":"var(--text-primary)", fontFamily: l==="Order ID"?"monospace":"inherit", fontSize: l==="Order ID"?11:13.5 }}>{v}</span>
            </div>
          ))}
          {confirmedData?.customerName && (
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13.5 }}>
              <span style={{ color:"var(--text-muted)" }}>Name</span>
              <span style={{ fontWeight:700, color:"var(--text-primary)" }}>{confirmedData.customerName}</span>
            </div>
          )}
        </div>

        {/* <div style={{ background:"var(--green-bg)", borderRadius:"var(--radius-md)", padding:"12px 16px", textAlign:"center", width:"100%" }}>
          <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:4 }}>Estimated Preparation Time</div>
          <div style={{ fontSize:18, fontWeight:900, color:"var(--green)" }}>{confirmedData?.estimatedMinutes || 20} – {(confirmedData?.estimatedMinutes || 20) + 5} Minutes</div>
        </div> */}
      </div>

      <div className="cx-sticky-bottom" style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <button className="cta-btn" onClick={onTrack}>Track Order Live</button>
        <button onClick={onHome} style={{ background:"none", border:"none", color:"var(--brand)", fontSize:14, fontWeight:700, padding:"8px 0", cursor:"pointer" }}>
          Back to Home
        </button>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}@keyframes popIn{0%{opacity:0;transform:scale(0.9)}100%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
};

export default CustomerOrderSuccess;
