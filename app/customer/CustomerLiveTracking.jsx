"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, CheckCircle2, Phone, HelpCircle, Clock } from "lucide-react";
import customerOrderService from "../services/customerOrderService";
import useWebSocket from "../hooks/useWebSocket";

const STATUS_TIMELINE = ["PLACED","ACCEPTED","PREPARING","READY","COMPLETED"];

const STATUS_CONFIG = {
  PLACED: {
    label:    "Order Placed",
    emoji:    "📋",
    message:  "Your order has been received.",
    color:    "#635bff",
    bg:       "rgba(99,91,255,0.12)",
  },
  ACCEPTED: {
    label:    "Order Accepted",
    emoji:    "✅",
    message:  "Your order has been accepted by the restaurant.",
    color:    "#0ea5e9",
    bg:       "rgba(14,165,233,0.12)",
  },
  PREPARING: {
    label:    "Preparing",
    emoji:    "👨‍🍳",
    message:  "Our chef is now preparing your order.",
    color:    "#f59e0b",
    bg:       "rgba(245,158,11,0.12)",
  },
  READY: {
    label:    "Ready for Pickup",
    emoji:    "🍽️",
    message:  "Your order is ready! Please pick it up.",
    color:    "#f97316",
    bg:       "rgba(249,115,22,0.12)",
  },
  COMPLETED: {
    label:    "Completed",
    emoji:    "🎉",
    message:  "Thank you for ordering with us. Enjoy your meal!",
    color:    "#16a34a",
    bg:       "rgba(22,163,74,0.12)",
  },
  CANCELLED: {
    label:    "Cancelled",
    emoji:    "❌",
    message:  "Your order has been cancelled.",
    color:    "#ef4444",
    bg:       "rgba(239,68,68,0.12)",
  },
};

// ── In-App Toast Notification ──────────────────────────────────
const StatusToast = ({ event, onDismiss }) => {
  const cfg = STATUS_CONFIG[event?.orderStatus] || STATUS_CONFIG.PLACED;
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position:"fixed", top:16, left:"50%", transform:"translateX(-50%)",
      background:"#1e293b", color:"#f1f5f9",
      borderRadius:14, padding:"12px 18px",
      display:"flex", alignItems:"center", gap:10,
      boxShadow:"0 8px 32px rgba(0,0,0,0.3)",
      zIndex:9999, minWidth:260, maxWidth:320,
      animation:"toastIn 0.3s cubic-bezier(0.34,1.4,0.64,1)",
      border:`1px solid ${cfg.color}44`,
    }}>
      <span style={{ fontSize:22, flexShrink:0 }}>{cfg.emoji}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:700, color: cfg.color, marginBottom:2 }}>
          🔔 Status Updated
        </div>
        <div style={{ fontSize:12.5, color:"#e2e8f0", lineHeight:1.4 }}>
          {event?.statusMessage || cfg.message}
        </div>
      </div>
      <button
        onClick={onDismiss}
        style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:16, flexShrink:0 }}
      >×</button>
    </div>
  );
};

// ── Timeline Step ──────────────────────────────────────────────
const TimelineStep = ({ step, idx, currentIdx, isNew }) => {
  const done    = idx <= currentIdx;
  const active  = idx === currentIdx;
  const pending = idx > currentIdx;
  const cfg     = STATUS_CONFIG[step] || STATUS_CONFIG.PLACED;

  return (
    <div style={{ display:"flex", gap:16, position:"relative" }}>
      {idx < STATUS_TIMELINE.length - 1 && (
        <div style={{
          position:"absolute", left:19, top:44, bottom:-8, width:2,
          background: done ? cfg.color : "var(--border)",
          transition:"background 0.6s ease",
          zIndex:0,
        }}/>
      )}
      {/* Step circle */}
      <div style={{
        width:40, height:40, borderRadius:"50%", flexShrink:0,
        background: done ? cfg.color : active ? cfg.bg : "var(--surface-2)",
        border: `2.5px solid ${done ? cfg.color : active ? cfg.color : "var(--border)"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        zIndex:1, transition:"all 0.5s ease",
        boxShadow: active ? `0 0 0 6px ${cfg.color}22` : "none",
        animation: isNew && active ? "stepBounce 0.5s ease" : "none",
      }}>
        {done
          ? <span style={{ fontSize:18 }}>{cfg.emoji}</span>
          : <span style={{ fontSize:14, color:"var(--text-muted)" }}>{idx + 1}</span>
        }
      </div>
      {/* Content */}
      <div style={{ flex:1, paddingBottom:28 }}>
        <div style={{
          fontSize:14, fontWeight: active || done ? 700 : 500,
          color: pending ? "var(--text-muted)" : active ? cfg.color : "var(--text-primary)",
          transition:"color 0.4s ease",
          marginBottom:3,
        }}>
          {cfg.label}
        </div>
        {(done || active) && (
          <div style={{
            fontSize:12, color:"var(--text-muted)", lineHeight:1.5,
            animation: isNew && active ? "fadeSlideIn 0.4s ease" : "none",
          }}>
            {cfg.message}
          </div>
        )}
        {active && (
          <div style={{
            display:"inline-flex", alignItems:"center", gap:5,
            marginTop:6, padding:"3px 10px",
            background: cfg.bg, borderRadius:20,
          }}>
            <div style={{
              width:7, height:7, borderRadius:"50%", background:cfg.color,
              animation:"pulseDot 1.4s ease infinite",
            }}/>
            <span style={{ fontSize:11, fontWeight:600, color:cfg.color }}>In Progress</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────
const CustomerLiveTracking = ({ orderId, orderNumber, business, onBack }) => {
  const [statusData,  setStatusData]  = useState(null);
  const [toast,       setToast]       = useState(null);
  const [newStep,     setNewStep]     = useState(null);
  const prevStatusRef = useRef(null);

  // Load initial status via REST
  useEffect(() => {
    if (!orderId) return;
    fetchStatus();
  }, [orderId]);

  const fetchStatus = async () => {
    try {
      const res = await customerOrderService.getOrderStatus(orderId);
      if (res.success) {
        setStatusData(res.data);
        prevStatusRef.current = res.data.orderStatus;
      }
    } catch {}
  };

  // Connect to WebSocket — listen for status updates on this specific order
  useWebSocket({
    topics: orderId ? [`/topic/order/${orderId}/status`] : [],
    enabled: !!orderId,
    onMessage: (topic, event) => {
      if (event.eventType === "STATUS_UPDATED" && event.orderId === orderId) {
        setStatusData(prev => ({
          ...prev,
          orderStatus:     event.orderStatus,
          estimatedMinutes:event.estimatedMinutes || prev?.estimatedMinutes,
        }));
        // Show toast
        setToast(event);
        // Trigger step animation
        setNewStep(event.orderStatus);
        setTimeout(() => setNewStep(null), 1500);
        prevStatusRef.current = event.orderStatus;
      }
    },
  });

  const currentStatus = statusData?.orderStatus || "PLACED";
  const currentIdx    = STATUS_TIMELINE.indexOf(currentStatus);
  const isCancelled   = currentStatus === "CANCELLED";
  const cfg           = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PLACED;

  return (
    <div className="cw-screen">
      <style>{`
        @keyframes toastIn     { from{opacity:0;transform:translateX(-50%) translateY(-12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stepBounce  { 0%{transform:scale(0.8)} 60%{transform:scale(1.1)} 100%{transform:scale(1)} }
        @keyframes pulseDot    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes glow        { 0%,100%{box-shadow:0 0 0 0 rgba(99,91,255,0.4)} 50%{box-shadow:0 0 0 8px rgba(99,91,255,0)} }
      `}</style>

      {/* Toast notification */}
      {toast && <StatusToast event={toast} onDismiss={() => setToast(null)} />}

      {/* Topbar */}
      <div className="cx-topbar">
        <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20}/></button>
        <span className="cx-topbar-title">Track Order</span>
        <div style={{ width:32 }}/>
      </div>

      <div style={{ overflowY:"auto", paddingBottom:24 }}>
        {/* Status header card */}
        <div style={{
          margin:"14px 16px",
          padding:"16px",
          background: cfg.bg,
          border:`1.5px solid ${cfg.color}33`,
          borderRadius:16,
          animation:"fadeSlideIn 0.3s ease",
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text-muted)", marginBottom:4 }}>Order</div>
              <div style={{ fontSize:18, fontWeight:900, color:"var(--text-primary)" }}>
                {orderNumber || orderId}
              </div>
            </div>
            <div style={{
              padding:"6px 14px", borderRadius:9999,
              background: cfg.color, color:"#fff",
              fontSize:12, fontWeight:700,
            }}>
              {cfg.emoji} {cfg.label}
            </div>
          </div>

          <div style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.5 }}>
            {cfg.message}
          </div>

          {!isCancelled && currentStatus !== "COMPLETED" && (
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10 }}>
              <Clock size={13} color="var(--text-muted)"/>
              <span style={{ fontSize:12, color:"var(--text-muted)" }}>
                Estimated: <strong style={{ color:"var(--text-primary)" }}>
                  {statusData?.estimatedMinutes || 20} mins
                </strong>
              </span>
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:cfg.color,animation:"pulseDot 1.4s ease infinite" }}/>
                <span style={{ fontSize:11, color:cfg.color, fontWeight:600 }}>Live</span>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div style={{ padding:"8px 20px 4px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:16 }}>
            Order Progress
          </div>
          {isCancelled ? (
            <div style={{
              padding:"20px 16px", background:"rgba(239,68,68,0.08)",
              border:"1.5px solid rgba(239,68,68,0.2)", borderRadius:12,
              textAlign:"center",
            }}>
              <div style={{ fontSize:36, marginBottom:10 }}>❌</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#ef4444" }}>Order Cancelled</div>
              <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:6 }}>
                This order has been cancelled. Please contact the restaurant if you have questions.
              </div>
            </div>
          ) : (
            STATUS_TIMELINE.map((step, idx) => (
              <TimelineStep
                key={step}
                step={step}
                idx={idx}
                currentIdx={currentIdx}
                isNew={newStep === step}
              />
            ))
          )}
        </div>

        {/* Help section */}
        <div style={{ padding:"4px 16px 0" }}>
          {[
            { emoji:"📞", title:"Call Restaurant", sub: business?.businessPhone || "Contact for help" },
            { emoji:"❓", title:"Need Help?",       sub: "Contact our support team" },
          ].map(h => (
            <div key={h.title} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"13px 14px", marginBottom:8,
              borderRadius:12, border:"1.5px solid var(--border-light)",
              background:"var(--surface-2)", cursor:"pointer",
            }}>
              <div style={{
                width:38, height:38, borderRadius:10,
                background:"var(--brand-muted)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18,
              }}>{h.emoji}</div>
              <div>
                <div style={{ fontSize:13.5, fontWeight:700, color:"var(--text-primary)" }}>{h.title}</div>
                <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:1 }}>{h.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerLiveTracking;
