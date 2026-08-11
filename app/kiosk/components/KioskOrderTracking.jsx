"use client";
import React, { useEffect, useRef, useState } from "react";
import KioskLogo from "./KioskLogo";
import customerOrderService from "../../services/customerOrderService";
import useWebSocket from "../../hooks/useWebSocket";
import { formatCurrency } from "../../utils/currencyHelper";
import { downloadKioskReceipt } from "../lib/kioskReceipt";

const STATUS_TIMELINE = ["PLACED", "ACCEPTED", "PREPARING", "READY", "COMPLETED"];
const STATUS_CONFIG = {
  PLACED: { label: "Order Placed", detail: "Your order has been received." },
  ACCEPTED: { label: "Order Accepted", detail: "Your order has been accepted by the restaurant." },
  PREPARING: { label: "Preparing", detail: "Our kitchen is on it." },
  READY: { label: "Ready", detail: "Your order is ready — head to the counter or your table." },
  COMPLETED: { label: "Completed", detail: "Enjoy your meal!" },
  CANCELLED: { label: "Cancelled", detail: "Your order has been cancelled." },
};

const StepIcon = ({ done }) =>
  done ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : null;

export default function KioskOrderTracking({ confirmedData, cart, currencyCode, business, onOpenEmail, onOpenRating, onNewOrder }) {
  const orderId = confirmedData?.orderId;
  const [statusData, setStatusData] = useState(null);
  const [toast, setToast] = useState(null);
  const prevStatus = useRef(null);
  const ratingPromptedRef = useRef(false);

  const fetchStatus = async () => {
    if (!orderId) return;
    try {
      const res = await customerOrderService.getOrderStatus(orderId);
      if (res.success) { setStatusData(res.data); prevStatus.current = res.data.orderStatus; }
    } catch { /* keep previous status on transient failure */ }
  };

  useEffect(() => { fetchStatus(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [orderId]);

  useWebSocket({
    topics: orderId ? [`/topic/order/${orderId}/status`] : [],
    enabled: !!orderId,
    onMessage: (topic, event) => {
      if (event.eventType === "STATUS_UPDATED" && event.orderId === orderId) {
        setStatusData((prev) => ({ ...prev, orderStatus: event.orderStatus, estimatedMinutes: event.estimatedMinutes || prev?.estimatedMinutes }));
        setToast(event);
        setTimeout(() => setToast(null), 4000);
        prevStatus.current = event.orderStatus;
      }
    },
  });

  const currentStatus = statusData?.orderStatus || "PLACED";
  const currentIdx = STATUS_TIMELINE.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";
  const isComplete = currentStatus === "COMPLETED";
  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PLACED;

  // Prompt for a rating once, only after the order genuinely completes.
  useEffect(() => {
    if (isComplete && !ratingPromptedRef.current) {
      ratingPromptedRef.current = true;
      const t = setTimeout(() => onOpenRating?.(), 1000);
      return () => clearTimeout(t);
    }
  }, [isComplete, onOpenRating]);

  return (
    <div className="ttlKioskHawkScreen">
      {toast && (
        <div className="ttlKioskHawkToast">
          🔔 {toast.statusMessage || cfg.detail}
        </div>
      )}

      <div className="ttlKioskTopbarLight">
        <span style={{ width: 32 }} />
        <KioskLogo size={26} />
        <span style={{ width: 32 }} />
      </div>

      <div className="ttlKioskHawkBody ttlKioskNoScroll">
        <div className="ttlKioskHawkHead">
          <p className="ttlKioskHawkOrderRef">Order #{confirmedData?.orderNumber || orderId}</p>
          <h2 className="ttlKioskHawkStatusTitle">{isComplete ? cfg.label : "We're on it"}</h2>
          <p className="ttlKioskHawkStatusSub">{cfg.detail}</p>
        </div>

        <div className="ttlKioskHawkTimelineCard">
          {isCancelled ? (
            <p style={{ textAlign: "center", color: "var(--kiosk-claret)", fontWeight: 700 }}>This order was cancelled.</p>
          ) : (
            STATUS_TIMELINE.map((step, idx) => {
              const done = idx < currentIdx || (idx === currentIdx && isComplete);
              const active = idx === currentIdx && !isComplete;
              const isLast = idx === STATUS_TIMELINE.length - 1;
              const c = STATUS_CONFIG[step];
              return (
                <div key={step} className="ttlKioskHawkStepRow">
                  <div className="ttlKioskHawkStepCol">
                    <div className={`ttlKioskHawkStepCircle ${done ? "ttlKioskHawkStepDone" : active ? "ttlKioskHawkStepActive" : ""}`}>
                      {done ? <StepIcon done /> : idx + 1}
                    </div>
                    {!isLast && <div className={`ttlKioskHawkStepLine ${idx < currentIdx ? "ttlKioskHawkStepLineDone" : ""}`} />}
                  </div>
                  <div className="ttlKioskHawkStepBody">
                    <p className={`ttlKioskHawkStepLabel ${active ? "ttlKioskHawkStepLabelActive" : done ? "ttlKioskHawkStepLabelDone" : ""}`}>
                      {c.label}
                      {active && <span className="ttlKioskHawkLiveDot" />}
                    </p>
                    <p className={`ttlKioskHawkStepDetail ${active || done ? "ttlKioskHawkStepDetailOn" : ""}`}>{c.detail}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="ttlKioskHawkActionsRow">
          <button onClick={onOpenEmail} className="ttlKioskHawkActionBtn">Email invoice</button>
          <button onClick={() => downloadKioskReceipt({ confirmedData, business, cart, currencyCode })} className="ttlKioskHawkActionBtn">Download bill</button>
        </div>

        <button onClick={onOpenRating} className="ttlKioskHawkRateLink">Rate your experience</button>

        <div className="ttlKioskHawkSummaryCard">
          <p className="ttlKioskHawkSummaryTitle">Order summary</p>
          {cart.map((item) => (
            <div key={`${item.id}-${item.comboGroupKey || ""}`} className="ttlKioskHawkSummaryRow">
              <span>{item.qty} × {item.name}</span>
              <span>{formatCurrency(item.qty * item.price, currencyCode)}</span>
            </div>
          ))}
          <div className="ttlKioskHawkSummaryRow ttlKioskHawkSummaryTotal">
            <span>Total</span>
            <span>{formatCurrency(confirmedData?.grandTotal ?? 0, currencyCode)}</span>
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="ttlKioskHawkFooter">
          <button onClick={onNewOrder} className="ttlKioskPillBtn ttlKioskPillBtnPrimary">Start a new order</button>
        </div>
      )}
    </div>
  );
}
