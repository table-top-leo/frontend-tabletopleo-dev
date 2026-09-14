"use client";
import { useState, useEffect, useRef } from "react";
import {
  Check, Phone, HelpCircle, Clock, X, PartyPopper, Store,
  Info, Loader2, AlertTriangle, ReceiptText, Printer,
} from "lucide-react";
import customerOrderService from "../services/customerOrderService";
import useWebSocket from "../hooks/useWebSocket";
import { formatCurrency } from "../utils/currencyHelper";
import { CustomerLanguageProvider, useCustomerLanguage } from "../context/CustomerLanguageProvider";
import "../designcustomerflow/customer-common.css";
import "../designcustomerflow/customer-layout.css";
import "../designcustomerflow/customer-components.css";

const STATUS_TIMELINE = ["PLACED", "ACCEPTED", "PREPARING", "READY", "COMPLETED"];
const ACCENT = "#a4123f";
const DONE_GREEN = "#16a34a";

const STATUS_COLORS = {
  PLACED: "#6366f1",
  ACCEPTED: "#a4123f",
  PREPARING: "#f59e0b",
  READY: "#0ea5e9",
  COMPLETED: "#16a34a",
  CANCELLED: "#ef4444",
};

function getBusinessTypeLabel(businessType) {
  if (!businessType) return "restaurant";
  return businessType.trim().toLowerCase();
}

function useStatusConfig(t, businessTypeLabel) {
  return {
    PLACED:    { label: t("tracking.placedLabel"),    message: t("tracking.placedMsg") },
    ACCEPTED:  { label: t("tracking.acceptedLabel"),   message: t("tracking.acceptedMsg", { businessType: businessTypeLabel }) },
    PREPARING: { label: t("tracking.preparingLabel"),  message: t("tracking.preparingMsg") },
    READY:     { label: t("tracking.readyLabel"),      message: t("tracking.readyMsg") },
    COMPLETED: { label: t("tracking.completedLabel"),  message: t("tracking.completedMsg") },
    CANCELLED: { label: t("tracking.cancelledLabel"),  message: t("tracking.cancelledMsg", { businessType: businessTypeLabel }) },
  };
}

// Same synthesized two-tone chime as the in-app tracking page — no audio
// file to host, plays once per live status-change event.
let sharedAudioCtx = null;
function playStatusChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!sharedAudioCtx) sharedAudioCtx = new Ctx();
    if (sharedAudioCtx.state === "suspended") sharedAudioCtx.resume();
    const now = sharedAudioCtx.currentTime;
    [[880, now, 0.14], [1174.66, now + 0.11, 0.16]].forEach(([freq, start, dur]) => {
      const osc = sharedAudioCtx.createOscillator();
      const gain = sharedAudioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain).connect(sharedAudioCtx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  } catch { /* sound is a nice-to-have, never worth breaking tracking over */ }
}

function requestNotificationPermission() {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission();
  } catch {}
}

function showBrowserNotification(title, body) {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const n = new Notification(title, { body, icon: "/favicon.ico" });
    setTimeout(() => n.close(), 6000);
  } catch {}
}

const StatusToast = ({ event, onDismiss, statusConfig }) => {
  const status = event?.orderStatus;
  const cfg = statusConfig[status] || statusConfig.PLACED;
  const isCompleted = status === "COMPLETED";
  const isCancelled = status === "CANCELLED";
  const tint = isCompleted ? DONE_GREEN : isCancelled ? "#ef4444" : ACCENT;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: "fixed", top: "max(16px, env(safe-area-inset-top))", left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 380,
      background: "#fff", color: "#1a1a1e",
      borderRadius: 18, padding: "13px 14px",
      display: "flex", alignItems: "flex-start", gap: 11,
      boxShadow: "0 12px 32px rgba(20,10,20,0.16), 0 2px 8px rgba(20,10,20,0.06)",
      zIndex: 9999, animation: "stFadeIn 0.32s cubic-bezier(0.34,1.4,0.64,1)", overflow: "hidden",
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: `${tint}16`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isCompleted ? <PartyPopper size={17} color={tint} /> : <Check size={17} color={tint} strokeWidth={2.6} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1e", marginBottom: 2 }}>{cfg.label}</div>
        <div style={{ fontSize: 12, color: "#8f8f95", lineHeight: 1.4 }}>{event?.statusMessage || cfg.message}</div>
      </div>
      <button onClick={onDismiss} style={{ background: "#f4f3f4", border: "none", borderRadius: 8, cursor: "pointer", color: "#8f8f95", width: 22, height: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        <X size={13} />
      </button>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "#f0eef0" }}>
        <div style={{ height: "100%", background: tint, animation: "stProgress 4.5s linear forwards" }} />
      </div>
    </div>
  );
};

const TimelineStep = ({ step, idx, currentIdx, isNew, statusConfig, isLast, lineColor, acceptProgress, countdownLabel, etaClockLabel }) => {
  const done = idx < currentIdx;
  const active = idx === currentIdx;
  const pending = idx > currentIdx;
  const cfg = statusConfig[step];
  const lineFilled = idx <= currentIdx;
  const fillPct = idx < currentIdx ? 100 : (active && acceptProgress != null ? Math.round(acceptProgress * 100) : 0);
  const spinning = active && step !== "COMPLETED" && step !== "CANCELLED";
  const spinColor = STATUS_COLORS[step] || lineColor;

  const row = (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
      <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
        {spinning && (
          <div style={{
            position: "absolute", top: -5, left: -5, width: 54, height: 54, borderRadius: "50%",
            border: "3px solid transparent", borderTopColor: spinColor, borderRightColor: spinColor,
            animation: "stRingSpin 1.1s linear infinite",
          }} />
        )}
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: done ? "#efeef0" : active ? `${lineColor}18` : "#efeef0",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.4s ease", animation: isNew && active ? "stStepBounce 0.5s ease" : "none",
        }}>
          {done
            ? <Check size={18} color="#6b6b70" strokeWidth={2.6} />
            : active && step === "COMPLETED"
            ? <Check size={18} color={lineColor} strokeWidth={2.8} />
            : <span style={{ fontSize: 15, fontWeight: 700, color: active ? lineColor : "#a3a3a8" }}>{idx + 1}</span>}
        </div>
      </div>
      <div style={{ flex: 1, paddingTop: 2, paddingBottom: active ? 0 : 2 }}>
        <div style={{ fontSize: 15.5, fontWeight: active ? 800 : 700, color: pending ? "#a3a3a8" : active ? "#1a1a1e" : "#8f8f95", marginBottom: 3 }}>
          {cfg.label}
        </div>
        <div style={{ fontSize: 12.5, color: pending ? "#b7b7bc" : "#88888e", lineHeight: 1.5 }}>
          {cfg.message}
        </div>
        {active && countdownLabel && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "8px 12px", borderRadius: 10, background: `${lineColor}0f` }}>
            <Clock size={14} color={lineColor} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: lineColor, fontVariantNumeric: "tabular-nums" }}>{countdownLabel}</div>
              {etaClockLabel && <div style={{ fontSize: 10.5, color: "#8f8f95", marginTop: 1 }}>Expected ready by {etaClockLabel}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 0, position: "relative" }}>
      <div style={{ width: 20, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        {!isLast && (
          <div style={{ position: "absolute", top: 14, bottom: -24, width: 2, background: "#e3e1e4", overflow: "hidden" }}>
            <div style={{ width: "100%", height: `${fillPct}%`, background: lineColor, transition: active ? "height 1s linear" : "height 0.6s ease" }} />
          </div>
        )}
        <span style={{
          width: 14, height: 14, borderRadius: "50%", flexShrink: 0, zIndex: 1,
          background: lineFilled ? lineColor : "#fff",
          border: lineFilled ? "none" : "2px solid #d8d6da",
          transition: "all 0.4s ease",
        }} />
      </div>
      <div style={{ flex: 1, marginLeft: 20, marginBottom: 32 }}>
        {active ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", boxShadow: "0 8px 28px rgba(20,10,20,0.10)", animation: isNew ? "stFadeSlideIn 0.4s ease" : "none" }}>
            {row}
          </div>
        ) : row}
      </div>
    </div>
  );
};

// ── "Know about your order" — scrollable popup with the full itemized
// price breakdown (fetched lazily, only when opened). ──
const OrderDetailsPopup = ({ orderId, currencyCode, onClose }) => {
  const { t } = useCustomerLanguage();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [printing, setPrinting] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await customerOrderService.getInvoice(orderId);
        if (cancelled) return;
        if (res.success) setInvoice(res.data);
        else setError(res.message || "Could not load order details.");
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Could not load order details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  const curr = invoice?.currencyCode || currencyCode;

  const handlePrint = async () => {
    if (printing || !invoice) return;
    setPrinting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(invoiceRef.current, { scale: 3, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const dataUrl = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank", "width=480,height=700");
      printWindow.document.write(
        `<html><head><title>${invoice.invoiceNumber || orderId}</title></head><body style="margin:0"><img src="${dataUrl}" style="width:100%" onload="window.print();"/></body></html>`
      );
      printWindow.document.close();
    } catch (e) {
      console.error("Print failed:", e);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(20,10,20,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "stFadeIn 0.18s ease" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", width: "100%", maxWidth: 400, borderRadius: 20,
          maxHeight: "78vh", display: "flex", flexDirection: "column",
          animation: "stPopIn 0.22s cubic-bezier(0.34,1.4,0.64,1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 12px", borderBottom: "1px solid #f0eef0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ReceiptText size={17} color={ACCENT} />
            <span style={{ fontSize: 15.5, fontWeight: 800, color: "#1a1a1e" }}>{t("tracking.orderDetailsTitle") || "Your order details"}</span>
          </div>
          <button onClick={onClose} style={{ background: "#f4f3f4", border: "none", borderRadius: 8, cursor: "pointer", color: "#6b6b70", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body — items can run long, so this area (only) scrolls */}
        <div style={{ overflowY: "auto", padding: "14px 18px 8px", flex: 1 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "40px 0", color: "#8f8f95", fontSize: 13 }}>
              <Loader2 size={16} style={{ animation: "stSpin 0.7s linear infinite" }} /> {t("common.loading") || "Loading..."}
            </div>
          ) : error ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "36px 20px", textAlign: "center" }}>
              <AlertTriangle size={22} color="#ef4444" />
              <span style={{ fontSize: 13, color: "#6b6b70" }}>{error}</span>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "#8f8f95", marginBottom: 10 }}>
                {invoice?.invoiceNumber} · {invoice?.orderType === "DINE_IN" ? "Dine In" : "Take Away"}
                {invoice?.tableNumber ? ` · Table ${invoice.tableNumber}` : ""}
              </div>

              {(invoice?.items || []).map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f6f5f6" }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1a1e" }}>{item.productName}</div>
                    <div style={{ fontSize: 11.5, color: "#a3a3a8", marginTop: 1 }}>
                      {item.quantity} × {formatCurrency(item.unitPrice, curr)}
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#1a1a1e", flexShrink: 0 }}>
                    {formatCurrency(item.lineTotal, curr)}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 14, paddingTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, color: "#6b6b70" }}>
                  <span>{t("tracking.subtotal") || "Subtotal"}</span>
                  <span>{formatCurrency(invoice?.subtotal, curr)}</span>
                </div>
                {invoice?.gstAmount != null && Number(invoice.gstAmount) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, color: "#6b6b70" }}>
                    <span>{invoice?.taxSystem || "Tax"}</span>
                    <span>{formatCurrency(invoice.gstAmount, curr)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", marginTop: 4, borderTop: "1.5px solid #1a1a1e", fontSize: 15.5, fontWeight: 800, color: "#1a1a1e" }}>
                  <span>{t("tracking.total") || "Total"}</span>
                  <span>{formatCurrency(invoice?.grandTotal, curr)}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 10, padding: "10px 12px", borderRadius: 10, background: "#fafafa", border: "1px solid #efeef0" }}>
                <span style={{ fontSize: 11.5, color: "#8f8f95" }}>{t("tracking.paymentStatus") || "Payment"}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#15803d" }}>{invoice?.paymentStatus}</span>
              </div>

              <div style={{ position: "absolute", left: -9999, top: 0, width: 380 }}>
                <div ref={invoiceRef} style={{ width: 380, background: "#fff", fontFamily: "'Segoe UI',Arial,sans-serif", fontSize: 12, color: "#111" }}>
                  <div style={{ padding: "18px 24px 14px", borderBottom: "2px solid #111" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{invoice?.businessName}</div>
                    <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>RECEIPT</div>
                    <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "monospace", marginTop: 4 }}>{invoice?.invoiceNumber}</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>
                      {invoice?.createdAt ? new Date(invoice.createdAt).toLocaleString() : ""}
                    </div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>
                      {invoice?.customerName || "Guest"} · {invoice?.orderType === "DINE_IN" ? `Dine In${invoice?.tableNumber ? " · Table " + invoice.tableNumber : ""}` : "Take Away"}
                    </div>
                  </div>
                  <div style={{ padding: "12px 24px" }}>
                    {(invoice?.items || []).map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee" }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{item.quantity} × {item.productName}</span>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{formatCurrency(Number(item.lineTotal || 0), curr)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "0 24px 18px", display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 900, borderTop: "2px solid #111", marginTop: 4, paddingTop: 8 }}>
                    <span>TOTAL</span><span>{formatCurrency(Number(invoice?.grandTotal || 0), curr)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!loading && invoice && (
          <div style={{ padding: "10px 18px 16px", flexShrink: 0, borderTop: "1px solid #f0eef0" }}>
            <button
              onClick={handlePrint}
              disabled={printing}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 0", borderRadius: 10, border: `1.5px solid ${ACCENT}`, background: "#fff", color: ACCENT, fontSize: 13, fontWeight: 700, cursor: printing ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {printing ? <Loader2 size={14} style={{ animation: "stSpin 0.7s linear infinite" }} /> : <Printer size={14} />} {t("tracking.printReceipt") || "Print Receipt"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Inner tracking view — does the actual data fetching + rendering.
// Kept separate from the exported default so it can sit *inside*
// CustomerLanguageProvider and use useCustomerLanguage() from the start. ──
const StandaloneTrackingInner = ({ orderId, onBusinessResolved }) => {
  const { t, ready: langReady } = useCustomerLanguage();
  const [statusData, setStatusData] = useState(null);
  const [loading,     setLoading]   = useState(true);
  const [loadError,   setLoadError] = useState("");
  const [toast,       setToast]     = useState(null);
  const [newStep,     setNewStep]   = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const prevStatusRef = useRef(null);
  const resolvedRef    = useRef(false);

  const businessTypeLabel = getBusinessTypeLabel(statusData?.businessType);
  const STATUS_CONFIG = useStatusConfig(t, businessTypeLabel);

  useEffect(() => {
    if (!orderId) return;
    fetchStatus();
    requestNotificationPermission();
  }, [orderId]);

  const fetchStatus = async () => {
    try {
      const res = await customerOrderService.getOrderStatus(orderId);
      if (res.success) {
        setStatusData(res.data);
        prevStatusRef.current = res.data.orderStatus;
        if (!resolvedRef.current && res.data.businessId) {
          resolvedRef.current = true;
          onBusinessResolved?.(res.data.businessId);
        }
      } else {
        setLoadError(res.message || t("tracking.orderNotFound") || "We couldn't find this order.");
      }
    } catch (e) {
      setLoadError(e.response?.data?.message || t("tracking.orderNotFound") || "We couldn't find this order.");
    } finally {
      setLoading(false);
    }
  };

  useWebSocket({
    topics: orderId ? [`/topic/order/${orderId}/status`] : [],
    enabled: !!orderId,
    onMessage: (topic, event) => {
      if (event.eventType === "STATUS_UPDATED" && event.orderId === orderId) {
        setStatusData(prev => ({
          ...prev,
          orderStatus: event.orderStatus,
          estimatedMinutes: event.estimatedMinutes || prev?.estimatedMinutes,
          acceptedAt: event.acceptedAt || prev?.acceptedAt,
        }));
        const cfg = STATUS_CONFIG[event.orderStatus] || STATUS_CONFIG.PLACED;
        setToast(event);
        playStatusChime();
        showBrowserNotification(cfg.label, event.statusMessage || cfg.message);
        setNewStep(event.orderStatus);
        setTimeout(() => setNewStep(null), 1500);
        prevStatusRef.current = event.orderStatus;
      }
    },
  });

  const currentStatus = statusData?.orderStatus || "PLACED";
  const currentIdx = STATUS_TIMELINE.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";
  const isCompleted = currentStatus === "COMPLETED";
  const lineColor = isCompleted ? DONE_GREEN : ACCENT;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (currentStatus !== "ACCEPTED") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [currentStatus]);

  const acceptedAtMs = statusData?.acceptedAt ? new Date(statusData.acceptedAt).getTime() : null;
  const estimateMinutes = statusData?.estimatedMinutes || 15;
  const totalMs = estimateMinutes * 60 * 1000;
  const elapsedMs = acceptedAtMs ? Math.max(0, now - acceptedAtMs) : 0;
  const acceptProgress = (currentStatus === "ACCEPTED" && acceptedAtMs) ? Math.min(1, elapsedMs / totalMs) : null;
  const remainingMs = acceptedAtMs ? Math.max(0, totalMs - elapsedMs) : totalMs;
  const remainingMin = Math.floor(remainingMs / 60000);
  const remainingSec = Math.floor((remainingMs % 60000) / 1000);
  const countdownLabel = (currentStatus === "ACCEPTED" && acceptedAtMs)
    ? `${t("tracking.arrivingIn") || "Arriving in"} ${remainingMin}:${String(remainingSec).padStart(2, "0")}`
    : null;
  const etaClockLabel = acceptedAtMs
    ? new Date(acceptedAtMs + totalMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  if (loading || !langReady) {
    return (
      <div className="cw-root">
        <div className="cw-phone">
          <div className="cw-screen" style={{ background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #f3f4f6", borderTopColor: ACCENT, borderRadius: "50%", animation: "stSpin 0.8s linear infinite" }} />
            <style>{`@keyframes stSpin{to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="cw-root">
        <div className="cw-phone">
          <div className="cw-screen" style={{ background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", gap: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={28} color="#ef4444" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1e" }}>{t("tracking.orderNotFoundTitle") || "Order not found"}</div>
            <div style={{ fontSize: 13, color: "#8f8f95", maxWidth: 280 }}>{loadError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cw-root">
      <div className="cw-phone">
        <div className="cw-screen" style={{ background: "#fff" }}>
      <style>{`
        @keyframes stFadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes stProgress    { from{width:100%} to{width:0%} }
        @keyframes stFadeSlideIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stStepBounce  { 0%{transform:scale(0.8)} 60%{transform:scale(1.1)} 100%{transform:scale(1)} }
        @keyframes stRingSpin    { to{transform:rotate(360deg)} }
        @keyframes stPulseDot    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes stPopIn       { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {toast && <StatusToast event={toast} onDismiss={() => setToast(null)} statusConfig={STATUS_CONFIG} />}
      {showDetails && (
        <OrderDetailsPopup orderId={orderId} currencyCode={undefined} onClose={() => setShowDetails(false)} />
      )}

      {/* Topbar — no back button (this is a fresh tab from an email link);
          shows the business name so the customer knows they're in the
          right place. */}
      <div className="cx-topbar">
        <div style={{ width: 32 }} />
        <span className="cx-topbar-title" style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
          <Store size={15} color={ACCENT} />
          {statusData?.businessName || t("tracking.trackOrderTitle")}
        </span>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ overflowY: "auto", paddingBottom: 24 }}>
        {/* Order number badge — prominent, top of page, exactly this
            order and no other. */}
        <div style={{ padding: "18px 20px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, color: "#8f8f95" }}>
            {t("tracking.orderLabel")} <strong style={{ color: "#1a1a1e" }}>{statusData?.orderNumber || orderId}</strong>
          </div>
          {!isCancelled && !isCompleted && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={12} color="#a3a3a8" />
              <span style={{ fontSize: 11.5, color: "#a3a3a8", fontVariantNumeric: "tabular-nums" }}>
                {currentStatus === "ACCEPTED" && acceptedAtMs
                  ? `${remainingMin}:${String(remainingSec).padStart(2, "0")}`
                  : `${statusData?.estimatedMinutes || 20} ${t("tracking.minsLabel")}`}
              </span>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, animation: "stPulseDot 1.4s ease infinite", marginLeft: 2 }} />
            </div>
          )}
        </div>

        {/* Timeline */}
        <div style={{ padding: "18px 20px 4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1e" }}>
              {t("tracking.orderProgress") || "Order status"}
            </div>
            <button
              onClick={() => setShowDetails(true)}
              style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: ACCENT, fontSize: 12.5, fontWeight: 700, fontFamily: "inherit", padding: 0 }}
            >
              <Info size={13} /> {t("tracking.knowAboutOrder") || "Know about your order"}
            </button>
          </div>
          {isCancelled ? (
            <div style={{ padding: "20px 16px", background: "rgba(239,68,68,0.06)", border: "1.5px solid rgba(239,68,68,0.18)", borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#ef4444" }}>{t("tracking.orderCancelledTitle")}</div>
              <div style={{ fontSize: 12, color: "#a3a3a8", marginTop: 6 }}>{t("tracking.orderCancelledDesc", { businessType: businessTypeLabel })}</div>
              {statusData?.businessPhone && (
                <a href={`tel:${statusData.businessPhone}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "8px 16px", borderRadius: 9999, background: "#ef4444", color: "#fff", fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}>
                  <Phone size={13} /> {t("tracking.callRestaurant")}
                </a>
              )}
            </div>
          ) : (
            STATUS_TIMELINE.map((step, idx) => (
              <TimelineStep
                key={step}
                step={step}
                idx={idx}
                currentIdx={currentIdx}
                isNew={newStep === step}
                statusConfig={STATUS_CONFIG}
                isLast={idx === STATUS_TIMELINE.length - 1}
                lineColor={lineColor}
                acceptProgress={step === "ACCEPTED" ? acceptProgress : null}
                countdownLabel={step === "ACCEPTED" ? countdownLabel : null}
                etaClockLabel={step === "ACCEPTED" ? etaClockLabel : null}
              />
            ))
          )}
        </div>

        {/* Help section */}
        <div style={{ padding: "4px 20px 0" }}>
          {[
            { Icon: Phone, title: t("tracking.callRestaurant"), sub: statusData?.businessPhone || t("tracking.contactForHelp") },
            { Icon: HelpCircle, title: t("tracking.needHelp"), sub: t("tracking.contactSupportTeam") },
          ].map(h => (
            <div key={h.title} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", marginBottom: 8, borderRadius: 12, border: "1.5px solid #efeef0", background: "#fafafa", cursor: h.title === t("tracking.callRestaurant") && statusData?.businessPhone ? "pointer" : "default" }}
              onClick={() => { if (h.title === t("tracking.callRestaurant") && statusData?.businessPhone) window.location.href = `tel:${statusData.businessPhone}`; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${ACCENT}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <h.Icon size={17} color={ACCENT} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1a1e" }}>{h.title}</div>
                <div style={{ fontSize: 12, color: "#a3a3a8", marginTop: 1 }}>{h.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "20px 20px 0", fontSize: 11, color: "#c4c2c6" }}>
          Powered by TableTop Leo
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

// ── Default export — thin shell that owns the language provider, so
// StandaloneTrackingInner (and everything it renders) can use
// useCustomerLanguage() immediately. businessId re-keys the provider's
// per-business language storage once it's resolved from the first
// status fetch (falls back to English until then). ──
const CustomerStandaloneTracking = ({ orderId }) => {
  const [businessId, setBusinessId] = useState(undefined);
  return (
    <CustomerLanguageProvider businessId={businessId}>
      <StandaloneTrackingInner orderId={orderId} onBusinessResolved={setBusinessId} />
    </CustomerLanguageProvider>
  );
};

export default CustomerStandaloneTracking;