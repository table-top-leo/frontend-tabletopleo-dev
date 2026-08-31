"use client";
import { useState, useEffect, useRef } from "react";
import {
  X, Clock, CheckCircle2, Printer, Loader2, AlertTriangle,
  MapPin, User, Tag,
} from "lucide-react";
import adminOrderService from "../services/adminOrderService";
import { useCurrency } from "../context/CurrencyContext";
import { formatCurrency } from "../utils/currencyHelper";
import { useLanguage } from "../context/LanguageContext";

const TIME_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60];
const DEFAULT_MINUTES = 15;

function formatDateTime(isoStr) {
  if (!isoStr) return { date: "", time: "" };
  const d = new Date(isoStr);
  return {
    date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

const AcceptOrderPopup = ({ orderId, onClose, onAccepted }) => {
  const { t } = useLanguage();
  const { currencyCode } = useCurrency();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMinutes, setSelectedMinutes] = useState(DEFAULT_MINUTES);
  const [accepting, setAccepting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminOrderService.getOrderDetail(orderId);
        if (cancelled) return;
        if (res.success) setOrder(res.data);
        else setError(res.message || "Could not load this order.");
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Could not load this order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  const handleAccept = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      const res = await adminOrderService.updateOrderStatus(orderId, "ACCEPTED", selectedMinutes);
      if (res.success) {
        onAccepted?.(res.data);
        onClose();
      } else {
        setError(res.message || "Could not accept the order.");
      }
    } catch (e) {
      setError(e.response?.data?.message || "Could not accept the order.");
    } finally {
      setAccepting(false);
    }
  };

  const handlePrint = async () => {
    if (printing || !order) return;
    setPrinting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(invoiceRef.current, { scale: 3, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const dataUrl = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank", "width=480,height=700");
      printWindow.document.write(
        `<html><head><title>${order.orderNumber}</title></head><body style="margin:0"><img src="${dataUrl}" style="width:100%" onload="window.print();"/></body></html>`
      );
      printWindow.document.close();
    } catch (e) {
      console.error("Print failed:", e);
    } finally {
      setPrinting(false);
    }
  };

  const invUser = (() => {
    try { return JSON.parse(localStorage.getItem("ttl_user") || "{}"); } catch { return {}; }
  })();
  const invBusinessName = invUser.businessName || invUser.fullName || "TableTop Leo";
  const isDine = order?.orderType === "DINE_IN";
  const dt = formatDateTime(order?.createdAt);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,15,20,0.55)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", width: "100%", maxWidth: 440, borderRadius: 18,
          maxHeight: "88vh", display: "flex", flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)", animation: "aopPopIn 0.2s cubic-bezier(0.34,1.4,0.64,1)",
        }}
      >
        <style>{`
          @keyframes aopPopIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
          @keyframes aopSpin  { to{transform:rotate(360deg)} }
        `}</style>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid #f0eef0", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: "#111827" }}>Accept Order</div>
            {order?.orderNumber && (
              <div style={{ fontSize: 11.5, color: "#9ca3af", fontFamily: "monospace", marginTop: 1 }}>{order.orderNumber}</div>
            )}
          </div>
          <button onClick={onClose} style={{ background: "#f4f3f4", border: "none", borderRadius: 8, cursor: "pointer", color: "#6b7280", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "14px 18px", flex: 1 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "40px 0", color: "#9ca3af", fontSize: 13 }}>
              <Loader2 size={16} style={{ animation: "aopSpin 0.7s linear infinite" }} /> Loading order...
            </div>
          ) : error && !order ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "36px 20px", textAlign: "center" }}>
              <AlertTriangle size={22} color="#ef4444" />
              <span style={{ fontSize: 13, color: "#6b7280" }}>{error}</span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, fontSize: 12, color: "#6b7280" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <User size={12} /> {order.customerName || "Guest"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={12} /> {isDine ? `Dine In${order.tableNumber ? " · Table " + order.tableNumber : ""}` : "Take Away"}
                </span>
              </div>

              <div style={{ border: "1px solid #f0eef0", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
                {(order.items || []).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderBottom: "1px solid #f6f5f6" }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 6 }}>
                        {item.productName}
                        {item.offerTitle && <Tag size={10} color="#dc2626" />}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Qty {item.quantity}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
                      {formatCurrency(Number(item.lineTotal || 0), currencyCode)}
                    </div>
                  </div>
                ))}
                <div style={{ padding: "10px 12px", background: "#fafafa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", padding: "2px 0" }}>
                    <span>Subtotal</span><span>{formatCurrency(Number(order.subtotal || 0), currencyCode)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", padding: "2px 0" }}>
                    <span>Tax</span><span>{formatCurrency(Number(order.taxAmount || 0), currencyCode)}</span>
                  </div>
                  {Number(order.discountAmount || 0) > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#dc2626", padding: "2px 0" }}>
                      <span>Discount</span><span>- {formatCurrency(Number(order.discountAmount || 0), currencyCode)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#111827", paddingTop: 6, marginTop: 4, borderTop: "1.5px solid #111827" }}>
                    <span>Total</span><span>{formatCurrency(Number(order.grandTotal || 0), currencyCode)}</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={13} color="#a4123f" /> Select preparation time
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 4 }}>
                {TIME_OPTIONS.map((m) => {
                  const isSelected = m === selectedMinutes;
                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedMinutes(m)}
                      style={{
                        padding: "10px 0", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                        border: `1.5px solid ${isSelected ? "#a4123f" : "#e5e7eb"}`,
                        background: isSelected ? "#a4123f" : "#fff",
                        color: isSelected ? "#fff" : "#374151",
                        fontSize: 13, fontWeight: 800,
                      }}
                    >
                      {m}<span style={{ fontSize: 10, fontWeight: 600 }}> min</span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div style={{ marginTop: 10, fontSize: 12, color: "#ef4444", textAlign: "center" }}>{error}</div>
              )}

              <div style={{ position: "absolute", left: -9999, top: 0, width: 380 }}>
                <div ref={invoiceRef} style={{ width: 380, background: "#fff", fontFamily: "'Segoe UI',Arial,sans-serif", fontSize: 12, color: "#111" }}>
                  <div style={{ padding: "18px 24px 14px", borderBottom: "2px solid #111" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{invBusinessName}</div>
                    <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>KITCHEN ORDER TICKET</div>
                    <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "monospace", marginTop: 4 }}>{order.orderNumber}</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{dt.date} {dt.time}</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{order.customerName || "Guest"} · {isDine ? `Dine In${order.tableNumber ? " · Table " + order.tableNumber : ""}` : "Take Away"}</div>
                    <div style={{ fontSize: 10, color: "#a4123f", fontWeight: 800, marginTop: 3 }}>Prep time: {selectedMinutes} min</div>
                  </div>
                  <div style={{ padding: "12px 24px" }}>
                    {(order.items || []).map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee" }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{item.quantity} × {item.productName}</span>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{formatCurrency(Number(item.lineTotal || 0), currencyCode)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "0 24px 18px", display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 900, borderTop: "2px solid #111", marginTop: 4, paddingTop: 8 }}>
                    <span>TOTAL</span><span>{formatCurrency(Number(order.grandTotal || 0), currencyCode)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!loading && order && (
          <div style={{ display: "flex", gap: 8, padding: "12px 18px 16px", borderTop: "1px solid #f0eef0", flexShrink: 0 }}>
            <button
              onClick={onClose}
              disabled={accepting}
              style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 700, cursor: accepting ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              disabled={printing || accepting}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 0", borderRadius: 10, border: "1.5px solid #a4123f", background: "#fff", color: "#a4123f", fontSize: 13, fontWeight: 700, cursor: printing ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {printing ? <Loader2 size={14} style={{ animation: "aopSpin 0.7s linear infinite" }} /> : <Printer size={14} />} Print
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting}
              style={{ flex: 1.4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 0", borderRadius: 10, border: "none", background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 800, cursor: accepting ? "not-allowed" : "pointer", opacity: accepting ? 0.75 : 1, fontFamily: "inherit" }}
            >
              {accepting ? <Loader2 size={14} style={{ animation: "aopSpin 0.7s linear infinite" }} /> : <CheckCircle2 size={14} />} Accept · {selectedMinutes} min
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptOrderPopup;