"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Phone, HelpCircle } from "lucide-react";
import customerOrderService from "../services/customerOrderService";

const STATUS_TIMELINE = ["PLACED","ACCEPTED","PREPARING","READY","COMPLETED"];
const STATUS_LABEL = {
  PLACED:    { label:"Order Placed",    note:"Your order has been received."         },
  ACCEPTED:  { label:"Order Accepted",  note:"The restaurant confirmed your order."  },
  PREPARING: { label:"Preparing",       note:"Your order is being prepared."         },
  READY:     { label:"Ready",           note:"Your order is ready!"                  },
  COMPLETED: { label:"Completed",       note:"Enjoy your meal! 🎉"                   },
};

const CustomerLiveTracking = ({ orderId, orderNumber, business, onBack }) => {
  const [statusData, setStatusData] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchStatus = async () => {
    try {
      const res = await customerOrderService.getOrderStatus(orderId);
      if (res.success) setStatusData(res.data);
    } catch {}
  };

  const currentStatus = statusData?.orderStatus || "PLACED";
  const currentIdx    = STATUS_TIMELINE.indexOf(currentStatus);

  return (
    <div className="cw-screen">
      <div className="cx-topbar">
        <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20}/></button>
        <span className="cx-topbar-title">Track Order</span>
        <div style={{ width:32 }}/>
      </div>

      <div style={{ overflowY:"auto", paddingBottom:24 }}>
        <div style={{ padding:"14px 16px", background:"var(--surface-2)", borderBottom:"1px solid var(--border-light)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:12, color:"var(--text-muted)" }}>Order</div>
              <div style={{ fontSize:20, fontWeight:900, color:"var(--text-primary)", margin:"3px 0" }}>{orderNumber || orderId}</div>
            </div>
            <span style={{ background:"var(--brand-muted)", color:"var(--brand)", border:"1px solid var(--accent)", borderRadius:9999, padding:"5px 12px", fontSize:12, fontWeight:700 }}>
              {STATUS_LABEL[currentStatus]?.label || currentStatus}
            </span>
          </div>
          <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:4 }}>
            Estimated Time <strong style={{ color:"var(--text-primary)" }}>{statusData?.estimatedMinutes || 20} mins</strong>
          </div>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>Auto-refreshing every 10 seconds...</div>
        </div>

        <div style={{ padding:"18px 16px", display:"flex", flexDirection:"column" }}>
          {STATUS_TIMELINE.map((step, i) => {
            const done    = i <= currentIdx;
            const active  = i === currentIdx;
            const info    = STATUS_LABEL[step];
            return (
              <div key={step} style={{ display:"flex", gap:14, position:"relative" }}>
                {i < STATUS_TIMELINE.length - 1 && (
                  <div style={{ position:"absolute", left:14, top:30, bottom:-4, width:2, background: done?"#22c55e":"var(--border)", zIndex:0 }}/>
                )}
                <div style={{ width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: done?"#22c55e": active?"var(--brand-muted)":"var(--surface-2)", border:`2px solid ${done?"#22c55e":active?"var(--brand)":"var(--border)"}`, zIndex:1, animation: active?"glow 1.4s infinite":"none" }}>
                  {done ? <CheckCircle2 size={15} color="#fff"/> : <span style={{ fontSize:13 }}>🕐</span>}
                </div>
                <div style={{ flex:1, paddingBottom:22 }}>
                  <div style={{ fontSize:14, fontWeight:700, color: !done && !active?"var(--text-muted)":"var(--text-primary)" }}>{info.label}</div>
                  {(done || active) && <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:3 }}>{info.note}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {[
          { icon:<Phone size={18}/>, title:"Call Restaurant", sub: business?.businessPhone || "Contact support" },
          { icon:<HelpCircle size={18}/>, title:"Need Help?", sub:"Tap to contact support" },
        ].map(h => (
          <div key={h.title} style={{ margin:"0 16px 10px", display:"flex", alignItems:"center", gap:12, padding:14, borderRadius:"var(--radius-md)", border:"1.5px solid var(--border-light)", background:"var(--surface-2)", cursor:"pointer" }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"var(--brand-muted)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--brand)", flexShrink:0 }}>{h.icon}</div>
            <div>
              <div style={{ fontSize:13.5, fontWeight:700, color:"var(--text-primary)" }}>{h.title}</div>
              <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:1 }}>{h.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(123,63,0,0.4)}50%{box-shadow:0 0 0 6px rgba(123,63,0,0)}}`}</style>
    </div>
  );
};

export default CustomerLiveTracking;
