import React, { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { downloadReceipt } from "../utils/receipt";
import { formatCurrency } from "../../utils/currencyHelper";
import customerOrderService from "../../services/customerOrderService";
import useWebSocket from "../../hooks/useWebSocket";

const STAGES = [
  { id: "placed", label: "Order placed", detail: "We've received your order" },
  { id: "preparing", label: "Preparing", detail: "Our chefs are on it" },
  { id: "ready", label: "Ready", detail: "Almost there" },
  { id: "served", label: "Served", detail: "Enjoy your meal!" },
];

const STAGE_ICONS = {
  placed: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  preparing: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 21c1-4 3-7 8-7s7 3 8 7" strokeLinecap="round" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  ),
  ready: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l9-7 9 7M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  served: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-4.4-9.5-9C1 8.5 2.8 5 6.5 5c2 0 3.3 1 5.5 3.2C14.2 6 15.5 5 17.5 5 21.2 5 23 8.5 21.5 12 19 16.6 12 21 12 21Z" />
    </svg>
  ),
};

// Real backend order statuses → the 4 visual stages above
function statusToStageIndex(status) {
  switch (status) {
    case "PLACED": return 0;
    case "ACCEPTED": return 1;
    case "PREPARING": return 1;
    case "READY": return 2;
    case "COMPLETED": return 3;
    default: return 0;
  }
}

export default function OrderTracking({ order, onNewOrder, onOpenEmail, onOpenRating, emailSent, currencyCode }) {
  const [orderStatus, setOrderStatus] = useState("PLACED");
  const [estimatedMinutes, setEstimatedMinutes] = useState(order.estimatedMinutes || 20);
  const firedRating = useRef(false);
  const isTakeaway = order.orderType === "takeaway";

  useEffect(() => {
    if (!order.orderId) return;
    (async () => {
      try {
        const res = await customerOrderService.getOrderStatus(order.orderId);
        if (res.success) {
          setOrderStatus(res.data.orderStatus || "PLACED");
          if (res.data.estimatedMinutes) setEstimatedMinutes(res.data.estimatedMinutes);
        }
      } catch {}
    })();
  }, [order.orderId]);

  useWebSocket({
    topics: order.orderId ? [`/topic/order/${order.orderId}/status`] : [],
    enabled: !!order.orderId,
    onMessage: (topic, event) => {
      if (event.eventType === "STATUS_UPDATED" && event.orderId === order.orderId) {
        setOrderStatus(event.orderStatus);
        if (event.estimatedMinutes) setEstimatedMinutes(event.estimatedMinutes);
      }
    },
  });

  const isCancelled = orderStatus === "CANCELLED";
  const stageIndex = statusToStageIndex(orderStatus);
  const isComplete = stageIndex === STAGES.length - 1;

  const finalLabel = isTakeaway ? "Ready for pickup" : "Served";
  const finalDetail = isTakeaway
    ? "Head to the counter — your order is ready"
    : "Enjoy your meal!";

  const stages = STAGES.map((s, i) =>
    i === STAGES.length - 1 ? { ...s, label: finalLabel, detail: finalDetail } : s
  );

  useEffect(() => {
    if (!isComplete || firedRating.current) return;
    firedRating.current = true;
    const t = setTimeout(() => onOpenRating?.(), 1200);
    return () => clearTimeout(t);
  }, [isComplete, onOpenRating]);

  return (
    <div className="relative w-full h-full bg-sand flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 bg-cream border-b border-charcoal/8">
        <span className="w-8" />
        <Logo size={26} />
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-4">
        <div className="text-center mb-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ember-deep font-semibold">
            Order #{order.number}
          </p>
          <h2 className="font-display font-semibold text-charcoal text-xl mt-1">
            {isCancelled ? "Order cancelled" : isComplete ? finalLabel : "We're on it"}
          </h2>
          <p className="text-muted text-xs mt-1">
            {order.orderType === "dine-in" ? `Table ${order.tableNumber}` : "Takeaway"} · {order.guest?.name}
            {!isCancelled && !isComplete && ` · Est. ${estimatedMinutes} min`}
          </p>
        </div>

        {isCancelled ? (
          <div className="bg-white rounded-2xl p-6 shadow-soft mb-5 text-center">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-sm font-semibold text-claret">This order was cancelled</p>
            <p className="text-xs text-muted mt-1">Please speak with a team member for assistance.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-soft mb-5">
            {stages.map((s, i) => {
              const done = i < stageIndex;
              const active = i === stageIndex;
              const isLast = i === stages.length - 1;
              return (
                <div key={s.id} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        done
                          ? "bg-moss text-cream"
                          : active
                          ? "bg-ember text-ink"
                          : "bg-sand text-charcoal/30"
                      }`}
                    >
                      {done ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        STAGE_ICONS[s.id]
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 my-1 rounded-full ${
                          done ? "bg-moss" : "bg-charcoal/10"
                        }`}
                        style={{ minHeight: 28 }}
                      />
                    )}
                  </div>
                  <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                    <p
                      className={`text-sm font-semibold ${
                        active ? "text-ember-deep" : done ? "text-charcoal" : "text-charcoal/35"
                      }`}
                    >
                      {s.label}
                      {active && !isComplete && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-ember ml-2 align-middle animate-pulse" />
                      )}
                    </p>
                    <p className={`text-xs mt-0.5 ${active || done ? "text-muted" : "text-charcoal/25"}`}>
                      {s.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={onOpenEmail}
            className="flex-1 rounded-full py-2.5 text-xs font-semibold border border-charcoal/15 text-charcoal/70 active:bg-charcoal/5 flex items-center justify-center gap-1.5 bg-white"
          >
            {emailSent ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5c7a52" strokeWidth="3">
                  <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Emailed
              </>
            ) : (
              "Email invoice"
            )}
          </button>
          <button
            onClick={() => downloadReceipt(order)}
            className="flex-1 rounded-full py-2.5 text-xs font-semibold border border-charcoal/15 text-charcoal/70 active:bg-charcoal/5 bg-white"
          >
            Download bill
          </button>
        </div>

        <button
          onClick={onOpenRating}
          className="block mx-auto mb-5 text-[11px] text-ember-deep underline underline-offset-2"
        >
          Rate your experience
        </button>

        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-xs font-semibold text-charcoal/70 mb-2.5">Order summary</p>
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm py-1.5">
              <span className="text-charcoal/80">
                {item.qty} × {item.name}
              </span>
              <span className="text-charcoal/60">{formatCurrency(item.qty * item.price, currencyCode)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm pt-2.5 mt-1.5 border-t border-charcoal/8">
            <span className="font-semibold text-charcoal">Total</span>
            <span className="font-bold text-ember-deep">{formatCurrency(order.total, currencyCode)}</span>
          </div>
        </div>
      </div>

      {(isComplete || isCancelled) && (
        <div className="px-5 py-4 bg-cream border-t border-charcoal/8">
          <button
            onClick={onNewOrder}
            className="w-full rounded-full py-3.5 text-sm font-semibold bg-ember text-ink active:bg-ember-deep"
          >
            Start a new order
          </button>
        </div>
      )}
    </div>
  );
}
