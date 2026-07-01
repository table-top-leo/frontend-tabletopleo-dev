"use client";
import { ArrowLeft, Phone, HelpCircle, CheckCircle2, Clock, ChefHat, Package, Star } from "lucide-react";

const TIMELINE = [
  { id: "received",  label: "Order Received",    icon: "📋", time: "10:30 AM", note: null,                         state: "done"    },
  { id: "payment",   label: "Payment Received",   icon: "💳", time: "10:31 AM", note: null,                         state: "done"    },
  { id: "preparing", label: "Preparing",           icon: "👨‍🍳", time: "10:31 AM", note: "Your order is being prepared", state: "active"  },
  { id: "ready",     label: "Ready",               icon: "✅", time: null,       note: "Expected in 12 mins",         state: "pending" },
  { id: "completed", label: "Completed",           icon: "🎉", time: null,       note: null,                         state: "pending" },
];

const CustomerLiveTracking = ({ orderId, business, onBack }) => (
  <div className="cw-screen">
    <div className="cx-topbar">
      <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20} /></button>
      <span className="cx-topbar-title">Track Order</span>
      <div style={{ width: 32 }} />
    </div>

    <div style={{ flex: 1, overflow: "auto" }}>
      <div className="track-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Order ID</div>
            <div className="track-order-id">{orderId}</div>
          </div>
          <span className="chip chip-brand" style={{ fontSize: 12, padding: "5px 12px" }}>Preparing</span>
        </div>
        <div className="track-est">
          Estimated Time <span>12 Minutes</span>
        </div>
      </div>

      <div className="timeline">
        {TIMELINE.map((step, i) => (
          <div key={step.id} className={`tl-item ${step.state}`}>
            <div className="tl-icon-col">
              <div className="tl-icon">{step.state === "done" ? <CheckCircle2 size={15} /> : step.icon}</div>
            </div>
            <div className="tl-content">
              <div className="tl-label">{step.label}</div>
              {step.time && <div className="tl-time">{step.time}</div>}
              {step.note && <div className="tl-note">{step.note}</div>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 0 8px" }}>
        <div style={{ padding: "0 16px 10px", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Need Help?</div>
        <div className="help-card">
          <div className="help-icon"><Phone size={18} /></div>
          <div>
            <div className="help-title">Call Restaurant</div>
            <div className="help-sub">{business.phone}</div>
          </div>
        </div>
        <div className="help-card">
          <div className="help-icon"><HelpCircle size={18} /></div>
          <div>
            <div className="help-title">Need Help?</div>
            <div className="help-sub">Tap to contact support</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CustomerLiveTracking;
