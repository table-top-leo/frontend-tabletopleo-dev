"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import customerOrderService from "../../services/customerOrderService";
import useWebSocket from "../../hooks/useWebSocket";

const STATUS_TIMELINE = ["PLACED", "ACCEPTED", "PREPARING", "READY", "COMPLETED"];

const STATUS_CONFIG = {
  PLACED:    { label: "Order Placed",     emoji: "📋", message: "Your order has been received.",                 color: "#5b5bff" },
  ACCEPTED:  { label: "Order Accepted",   emoji: "✅", message: "Your order has been accepted by the kitchen.",  color: "#0ea5e9" },
  PREPARING: { label: "Preparing",        emoji: "👨‍🍳", message: "Our chefs are preparing your order now.",       color: "#c98400" },
  READY:     { label: "Ready for Pickup", emoji: "🍽️", message: "Your order is ready! Please collect it.",       color: "#f97316" },
  COMPLETED: { label: "Completed",        emoji: "🎉", message: "Thank you for ordering with us. Enjoy!",        color: "var(--k-success)" },
  CANCELLED: { label: "Cancelled",        emoji: "❌", message: "This order has been cancelled.",                 color: "var(--k-danger)" },
};

const KioskLiveTracking = ({ orderId, orderNumber, business, onBack, onCompleted }) => {
  const [statusData, setStatusData] = useState(null);
  const firedCompleted = useRef(false);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const res = await customerOrderService.getOrderStatus(orderId);
        if (res.success) setStatusData(res.data);
      } catch {}
    })();
  }, [orderId]);

  useWebSocket({
    topics: orderId ? [`/topic/order/${orderId}/status`] : [],
    enabled: !!orderId,
    onMessage: (topic, event) => {
      if (event.eventType === "STATUS_UPDATED" && event.orderId === orderId) {
        setStatusData((prev) => ({
          ...prev,
          orderStatus: event.orderStatus,
          estimatedMinutes: event.estimatedMinutes || prev?.estimatedMinutes,
        }));
      }
    },
  });

  const currentStatus = statusData?.orderStatus || "PLACED";
  const currentIdx = STATUS_TIMELINE.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";
  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PLACED;

  useEffect(() => {
    if (currentStatus === "COMPLETED" && !firedCompleted.current) {
      firedCompleted.current = true;
      onCompleted && onCompleted();
    }
  }, [currentStatus, onCompleted]);

  return (
    <div className="k-step-shell">
      <div className="k-step-header">
        <button className="k-step-back" onClick={onBack}><ArrowLeft size={24} /></button>
        <div className="k-step-title">Track Order</div>
      </div>

      <div className="k-step-body">
        <div className="k-step-body-inner">
          <div
            className="k-card"
            style={{ padding: 24, marginBottom: 30, background: `${cfg.color}14`, borderColor: `${cfg.color}33` }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--k-ink-mute)" }}>Order</div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{orderNumber || orderId}</div>
              </div>
              <div className="k-pill" style={{ background: cfg.color, color: "#fff", fontSize: 14 }}>
                {cfg.emoji} {cfg.label}
              </div>
            </div>
            <div style={{ fontSize: 15, color: "var(--k-ink-soft)" }}>{cfg.message}</div>
            {!isCancelled && currentStatus !== "COMPLETED" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <Clock size={16} color="var(--k-ink-mute)" />
                <span style={{ fontSize: 14, color: "var(--k-ink-mute)" }}>
                  Estimated <strong style={{ color: "var(--k-ink)" }}>{statusData?.estimatedMinutes || 20} mins</strong>
                </span>
              </div>
            )}
          </div>

          {isCancelled ? (
            <div className="k-card" style={{ padding: 26, textAlign: "center", background: "var(--k-danger-bg)" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>❌</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--k-danger)" }}>Order Cancelled</div>
              <div style={{ fontSize: 14, color: "var(--k-ink-mute)", marginTop: 6 }}>
                Please speak with a staff member for assistance.
              </div>
            </div>
          ) : (
            STATUS_TIMELINE.map((step, idx) => {
              const done = idx <= currentIdx;
              const active = idx === currentIdx;
              const c = STATUS_CONFIG[step];
              return (
                <div key={step} className="k-timeline-step">
                  {idx < STATUS_TIMELINE.length - 1 && (
                    <div className="k-timeline-line" style={{ background: done ? c.color : "var(--k-border)" }} />
                  )}
                  <div
                    className="k-timeline-dot"
                    style={{
                      background: done ? c.color : "var(--k-surface)",
                      borderColor: done || active ? c.color : "var(--k-border)",
                    }}
                  >
                    {done ? c.emoji : idx + 1}
                  </div>
                  <div className="k-timeline-content">
                    <div className="k-timeline-label" style={{ color: active ? c.color : undefined }}>{c.label}</div>
                    {(done || active) && <div className="k-timeline-msg">{c.message}</div>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default KioskLiveTracking;
