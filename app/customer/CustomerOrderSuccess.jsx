"use client";

import { getCurrencySymbol, formatCurrency } from "../utils/currencyHelper";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Download, FileImage, FileText, X, Star, Mail } from "lucide-react";
import CustomerRatingPopup from "../customer/customerratingpopup";
import CustomerEmailInvoicePopup from "../customer/emailcustomerbillpopup";

const METHOD_LABEL = { upi:"UPI", razorpay:"Cards / Net Banking", stripe:"International Card", paypal:"PayPal", pay_at_counter:"Pay at Counter" };
const STATUS_LABEL = { PAID:"Paid", PAY_AT_COUNTER:"Pay at Counter (Pending)", PENDING:"Pending" };
const STATUS_COLOR = { PAID:"#16a34a", PAY_AT_COUNTER:"#b45309", PENDING:"#f59e0b" };
 
const CustomerOrderSuccess = ({ confirmedData, business, cart = [], onTrack, onHome, diningPhone = "", businessId = "" }) => {
  const _user = (typeof window !== "undefined") ? (() => { try { return JSON.parse(localStorage.getItem("ttl_user") || "{}"); } catch { return {}; } })() : {};
  const _currCode = _user.currencyCode || "INR";
 
  const invoiceRef         = useRef(null);
  const [menu, setMenu]    = useState(false);
  const [loading, setLoad] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [showEmailInvoice, setShowEmailInvoice] = useState(false);
 
  // auto-open the email invoice popup ~1s after the success page loads
  useEffect(() => {
    const t = setTimeout(() => setShowEmailInvoice(true), 1000);
    return () => clearTimeout(t);
  }, []);
 
  const now                = new Date();
  const dateStr            = `${now.toLocaleDateString("en-IN")} ${now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}`;
 
  const subtotal = cart.reduce((s, c) => s + (Number(c.price)||0) * (Number(c.qty)||1), 0);
  const gst      = Math.max(0, Number(confirmedData?.grandTotal||0) - subtotal);
  const bName    = business?.businessName || confirmedData?.businessName || "TableTop Leo";
  const bPhone   = business?.businessPhone || "";
  const bAddr    = business?.businessAddress || "";
  const bLogo    = business?.logoUrl || null;
 
  const capture = async () => {
    const html2canvas = (await import("html2canvas")).default;
    return html2canvas(invoiceRef.current, { scale:3, useCORS:true, backgroundColor:"#ffffff", logging:false });
  };
 
  const downloadJPG = async () => {
    setLoad(true); setMenu(false);
    try {
      const canvas = await capture();
      const link   = document.createElement("a");
      link.download = `Invoice-${confirmedData?.orderNumber||"order"}.jpg`;
      link.href     = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    } catch(e){ console.error(e); } finally { setLoad(false); }
  };
 
  const downloadPDF = async () => {
    setLoad(true); setMenu(false);
    try {
      const canvas   = await capture();
      const imgData  = canvas.toDataURL("image/jpeg", 0.95);
      const { jsPDF } = await import("jspdf");
      const pdf      = new jsPDF({ orientation:"portrait", unit:"px", format:[canvas.width/3, canvas.height/3] });
      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width/3, canvas.height/3);
      pdf.save(`Invoice-${confirmedData?.orderNumber||"order"}.pdf`);
    } catch(e){ console.error(e); } finally { setLoad(false); }
  };
 
  return (
    <div className="cw-screen">
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"36px 16px 20px", gap:18, overflowY:"auto", position:"relative" }}>
 
        {/* ── Download + Email Invoice buttons — top-right corner, compressed ── */}
        <div style={{ position:"absolute", top:12, right:12, zIndex:10, display:"flex", gap:6 }}>
          <button
            onClick={() => setShowEmailInvoice(true)}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", background:"#fff", border:"1px solid #d1d5db", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:600, color:"#374151", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}
          >
            <Mail size={12} strokeWidth={2}/> Email Invoice
          </button>
 
          <div style={{ position:"relative" }}>
          <button
            onClick={() => setMenu(o => !o)}
            disabled={loading}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", background:"#fff", border:"1px solid #d1d5db", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:600, color:"#374151", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}
          >
            <Download size={12} strokeWidth={2}/> {loading ? "..." : "Invoice"}
          </button>
 
          {menu && (
            <div style={{ position:"absolute", top:"calc(100% + 4px)", right:0, background:"#fff", border:"1px solid #e5e7eb", borderRadius:9, boxShadow:"0 6px 20px rgba(0,0,0,0.12)", overflow:"hidden", minWidth:140, zIndex:20, animation:"fadeUp 0.12s ease" }}>
              <button onClick={downloadJPG} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 12px", border:"none", background:"#fff", fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer", textAlign:"left", borderBottom:"1px solid #f3f4f6" }}
                onMouseOver={e=>e.currentTarget.style.background="#f9fafb"} onMouseOut={e=>e.currentTarget.style.background="#fff"}>
                <FileImage size={13} color="#6b7280"/> Download JPG
              </button>
              <button onClick={downloadPDF} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 12px", border:"none", background:"#fff", fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer", textAlign:"left" }}
                onMouseOver={e=>e.currentTarget.style.background="#f9fafb"} onMouseOut={e=>e.currentTarget.style.background="#fff"}>
                <FileText size={13} color="#6b7280"/> Download PDF
              </button>
            </div>
          )}
          </div>
        </div>
 
        {/* ── dots — unchanged ── */}
        <div style={{ display:"flex", gap:8 }}>
          {["#f59e0b","#22c55e","#f59e0b"].map((c,i) => (
            <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:c, animation:`pulse 1.2s infinite ${i*0.2}s` }}/>
          ))}
        </div>
 
        {/* ── check icon — unchanged ── */}
        <div style={{ width:90, height:90, borderRadius:"50%", background:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <CheckCircle2 size={50} color="#16a34a" strokeWidth={2}/>
        </div>
 
        {/* ── heading — unchanged ── */}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:24, fontWeight:900, color:"var(--text-primary)", marginBottom:8 }}>Order Confirmed! 🎉</div>
          <div style={{ fontSize:13.5, color:"var(--text-muted)", lineHeight:1.6, maxWidth:260 }}>
            Your order has been placed.
          </div>
        </div>
 
        {/* ── order detail card — unchanged ── */}
        <div style={{ background:"var(--surface-2)", border:"1px solid var(--border-light)", borderRadius:"var(--radius-lg)", padding:14, width:"100%", display:"flex", flexDirection:"column", gap:8 }}>
          {[
            ["Order Number", confirmedData?.orderNumber || "—"],
            ["Order ID",     confirmedData?.orderId     || "—"],
            ["Amount Paid",  `${getCurrencySymbol(_currCode)}${confirmedData?.grandTotal || "—"}`],
            ["Payment",      METHOD_LABEL[confirmedData?.gatewayName] || confirmedData?.gatewayName || "—"],
            ["Status",       STATUS_LABEL[confirmedData?.paymentStatus] || confirmedData?.paymentStatus || "PAID"],
            ["Date & Time",  dateStr],
          ].map(([l,v]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13.5 }}>
              <span style={{ color:"var(--text-muted)" }}>{l}</span>
              <span style={{ fontWeight:700, color: l==="Amount Paid"?"var(--brand)":l==="Status"?STATUS_COLOR[confirmedData?.paymentStatus]||"#16a34a":"var(--text-primary)", fontFamily:l==="Order ID"?"monospace":"inherit", fontSize:l==="Order ID"?11:13.5 }}>{v}</span>
            </div>
          ))}
          {confirmedData?.customerName && (
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13.5 }}>
              <span style={{ color:"var(--text-muted)" }}>Name</span>
              <span style={{ fontWeight:700, color:"var(--text-primary)" }}>{confirmedData.customerName}</span>
            </div>
          )}
        </div>
      </div>
 
      {/* ── sticky bottom — unchanged ── */}
      <div className="cx-sticky-bottom" style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <button className="cta-btn" onClick={onTrack}>Track Order Live</button>
        {hasRated ? (
          <button
            disabled
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, background:"#FFF3EB", border:"1.5px solid #F5D9C2", color:"#F2701D", fontSize:14, fontWeight:700, padding:"10px 0", borderRadius:12, cursor:"default" }}
          >
            <CheckCircle2 size={15} color="#F2701D" /> Thank You for Rating
          </button>
        ) : (
          <button
            onClick={() => setShowRating(true)}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, background:"#fff", border:"1.5px solid #F2701D", color:"#F2701D", fontSize:14, fontWeight:700, padding:"10px 0", borderRadius:12, cursor:"pointer" }}
          >
            <Star size={15} fill="#F2701D" color="#F2701D" /> Rate Us
          </button>
        )}
        <button onClick={onHome} style={{ background:"none", border:"none", color:"var(--brand)", fontSize:14, fontWeight:700, padding:"8px 0", cursor:"pointer" }}>
          Back to Home
        </button>
      </div>
 
      {showRating && (
        <CustomerRatingPopup
          onClose={() => setShowRating(false)}
          onRated={() => setHasRated(true)}
          businessId={businessId || business?.businessId || confirmedData?.businessId}
          customerName={confirmedData?.customerName || "Guest"}
          customerPhone={confirmedData?.customerPhone || diningPhone}
        />
      )}
 
      {showEmailInvoice && (
        <CustomerEmailInvoicePopup
          onClose={() => setShowEmailInvoice(false)}
          orderNumber={confirmedData?.orderNumber}
          orderId={confirmedData?.orderId}
        />
      )}
 
      {/* ── HIDDEN INVOICE — professional black & white, captured off-screen ── */}
      <div style={{ position:"absolute", left:"-9999px", top:0, width:420 }}>
        <div ref={invoiceRef} style={{ width:420, background:"#fff", fontFamily:"'Segoe UI',Arial,sans-serif", fontSize:12, color:"#111" }}>
 
          {/* Top bar */}
          <div style={{ background:"#111", height:4 }}/>
 
          {/* Business header */}
          <div style={{ padding:"20px 28px 16px", borderBottom:"2px solid #111", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {bLogo ? (
                <img src={bLogo} alt="logo" style={{ width:44, height:44, objectFit:"cover", borderRadius:4, border:"1px solid #e5e7eb" }} crossOrigin="anonymous"/>
              ) : (
                <div style={{ width:44, height:44, border:"2px solid #111", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:900, borderRadius:4 }}>
                  {bName[0]}
                </div>
              )}
              <div>
                <div style={{ fontSize:16, fontWeight:800, letterSpacing:"-0.4px", color:"#111" }}>{bName}</div>
                {bPhone && <div style={{ fontSize:10.5, color:"#555", marginTop:2 }}>{bPhone}</div>}
                {bAddr  && <div style={{ fontSize:10.5, color:"#555", marginTop:1 }}>{bAddr}</div>}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", color:"#888", marginBottom:4 }}>TAX INVOICE</div>
              <div style={{ fontSize:18, fontWeight:900, fontFamily:"monospace", color:"#111", letterSpacing:"1px" }}>{confirmedData?.orderNumber}</div>
              <div style={{ fontSize:10, color:"#555", marginTop:4 }}>{dateStr}</div>
            </div>
          </div>
 
          {/* Bill to + order info row */}
          <div style={{ display:"flex", borderBottom:"1px solid #ddd" }}>
            <div style={{ flex:1, padding:"12px 28px", borderRight:"1px solid #ddd" }}>
              <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", color:"#888", marginBottom:5 }}>Bill To</div>
              <div style={{ fontSize:12, fontWeight:700, color:"#111" }}>{confirmedData?.customerName || "Guest"}</div>
              <div style={{ fontSize:10.5, color:"#555", marginTop:2 }}>
                {confirmedData?.orderType === "DINE_IN" ? "Dine In" : "Take Away"}
              </div>
            </div>
            <div style={{ flex:1, padding:"12px 28px" }}>
              <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", color:"#888", marginBottom:5 }}>Order Reference</div>
              <div style={{ fontSize:10, fontFamily:"monospace", color:"#333", wordBreak:"break-all" }}>{confirmedData?.orderId}</div>
              <div style={{ fontSize:10.5, color:"#555", marginTop:4 }}>
                {METHOD_LABEL[confirmedData?.gatewayName] || confirmedData?.gatewayName}
              </div>
            </div>
          </div>
 
          {/* Items table */}
          <div style={{ padding:"0 28px" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", marginTop:0 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid #111" }}>
                  <th style={{ padding:"10px 0 8px", textAlign:"left", fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.08em", color:"#444", fontWeight:700 }}>#</th>
                  <th style={{ padding:"10px 0 8px", textAlign:"left", fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.08em", color:"#444", fontWeight:700 }}>Description</th>
                  <th style={{ padding:"10px 0 8px", textAlign:"center", fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.08em", color:"#444", fontWeight:700 }}>Qty</th>
                  <th style={{ padding:"10px 0 8px", textAlign:"right", fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.08em", color:"#444", fontWeight:700 }}>Rate</th>
                  <th style={{ padding:"10px 0 8px", textAlign:"right", fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.08em", color:"#444", fontWeight:700 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {cart.length > 0 ? cart.map((item, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid #f0f0f0" }}>
                    <td style={{ padding:"7px 0", fontSize:11, color:"#888", verticalAlign:"top" }}>{i+1}</td>
                    <td style={{ padding:"7px 8px 7px 0", verticalAlign:"top" }}>
                      <div style={{ fontSize:12, fontWeight:600, color:"#111" }}>{item.name}</div>
                      {item.catName && <div style={{ fontSize:10, color:"#888", marginTop:1 }}>{item.catName}</div>}
                    </td>
                    <td style={{ padding:"7px 0", textAlign:"center", fontSize:12, color:"#333" }}>{item.qty||1}</td>
                    <td style={{ padding:"7px 0", textAlign:"right", fontSize:12, color:"#333" }}>{formatCurrency(Number(item.price||0).toFixed(2), _currCode)}</td>
                    <td style={{ padding:"7px 0", textAlign:"right", fontSize:12, fontWeight:600, color:"#111" }}>{formatCurrency((Number(item.price||0)*Number(item.qty||1)).toFixed(2), _currCode)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} style={{ padding:"16px 0", textAlign:"center", color:"#aaa", fontSize:11 }}>No items</td></tr>
                )}
              </tbody>
            </table>
          </div>
 
          {/* Totals block */}
          <div style={{ padding:"0 28px 20px", marginTop:4 }}>
            <div style={{ marginLeft:"auto", width:200 }}>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #eee" }}>
                <span style={{ fontSize:11, color:"#555" }}>Subtotal</span>
                <span style={{ fontSize:11, color:"#333" }}>{formatCurrency(subtotal.toFixed(2), _currCode)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #eee" }}>
                <span style={{ fontSize:11, color:"#555" }}>GST (5%)</span>
                <span style={{ fontSize:11, color:"#333" }}>{formatCurrency(gst.toFixed(2), _currCode)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderTop:"2px solid #111", marginTop:2 }}>
                <span style={{ fontSize:13, fontWeight:800, color:"#111" }}>TOTAL</span>
                <span style={{ fontSize:14, fontWeight:900, color:"#111" }}>{formatCurrency(Number(confirmedData?.grandTotal||0).toFixed(2), _currCode)}</span>
              </div>
            </div>
          </div>
 
          {/* Status bar */}
          <div style={{ margin:"0 28px 20px", border:"1px solid #e5e7eb", borderRadius:6, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.08em", color:"#888", marginBottom:3 }}>Payment Status</div>
              <div style={{ fontSize:12, fontWeight:700, color: STATUS_COLOR[confirmedData?.paymentStatus]||"#111" }}>
                {STATUS_LABEL[confirmedData?.paymentStatus] || "Paid"}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.08em", color:"#888", marginBottom:3 }}>Method</div>
              <div style={{ fontSize:12, fontWeight:600, color:"#333" }}>
                {METHOD_LABEL[confirmedData?.gatewayName] || confirmedData?.gatewayName}
              </div>
            </div>
          </div>
 
          {/* Footer */}
          <div style={{ borderTop:"2px solid #111", padding:"12px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:10.5, fontWeight:600, color:"#111" }}>Thank you for your visit!</div>
            <div style={{ fontSize:9.5, color:"#888" }}>Powered by TableTop Leo</div>
          </div>
          <div style={{ background:"#111", height:4 }}/>
        </div>
      </div>
 
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes popIn{0%{opacity:0;transform:scale(0.9)}100%{opacity:1;transform:scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
};
 
export default CustomerOrderSuccess;