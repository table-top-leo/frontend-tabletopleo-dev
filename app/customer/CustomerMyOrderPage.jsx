"use client";
import { useEffect, useState } from "react";
import {
  ArrowLeft, ChevronDown, ChevronUp, Receipt, ImageOff, CreditCard,
  Wallet, Landmark, Banknote, Loader2, PackageSearch,
} from "lucide-react";
import { formatCurrency } from "../utils/currencyHelper";
import customerOrderService from "../services/customerOrderService";

const PAYMENT_META = {
  upi:             { label: "UPI",               icon: Wallet },
  razorpay:        { label: "Razorpay",          icon: CreditCard },
  stripe:          { label: "Card (Stripe)",     icon: CreditCard },
  paypal:          { label: "PayPal",            icon: Landmark },
  pay_at_counter:  { label: "Pay at Counter",    icon: Banknote },
};

const STATUS_COLOR = {
  PLACED: "#0ea5e9", ACCEPTED: "#0ea5e9", PREPARING: "#f59e0b",
  READY: "#16a34a", COMPLETED: "#16a34a", CANCELLED: "#dc2626",
};

function fmtDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) +
    " · " + date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

const CustomerMyOrdersPage = ({ businessId, phone, onBack, onBrowseMenu }) => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!businessId || !phone) { setLoading(false); return; }
    setLoading(true);
    setError("");
    customerOrderService.getMyOrders(businessId, phone)
      .then((res) => {
        if (res.success) setOrders(res.data || []);
        else setError(res.message || "Failed to load your orders");
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load your orders"))
      .finally(() => setLoading(false));
  }, [businessId, phone]);

  return (
    <div className="cw-screen">
      <div className="cx-topbar" style={{ padding: "12px 14px 10px" }}>
        <button className="back-btn cx-topbar-action" onClick={onBack} style={{ touchAction: "manipulation" }}>
          <ArrowLeft size={20} />
        </button>
        <span className="cx-topbar-title" style={{ fontSize: 15 }}>My Orders</span>
        <span style={{ width: 34 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 40px" }}>
        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <Loader2 size={26} style={{ animation: "mo-spin 0.8s linear infinite" }} color="var(--text-muted)" />
            <style>{`@keyframes mo-spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : !phone ? (
          <EmptyState
            title="No orders yet"
            subtitle="Make your first order to see it here."
            onBrowseMenu={onBrowseMenu}
          />
        ) : error ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <PackageSearch size={34} color="#dc2626" strokeWidth={1.5} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", marginTop: 10 }}>Couldn't load your orders</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>{error}</div>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            subtitle="Make your first order — it'll show up here with your bill and tracking."
            onBrowseMenu={onBrowseMenu}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map((o) => {
              const isOpen = expanded === o.orderId;
              const payMeta = PAYMENT_META[o.paymentMethod] || { label: o.paymentMethod || "—", icon: Wallet };
              const statusColor = STATUS_COLOR[o.orderStatus] || "#6b7280";
              return (
                <div key={o.orderId} style={{ border: "1px solid var(--border-light)", borderRadius: 14, background: "var(--surface)", overflow: "hidden" }}>
                  {/* Header row — tap to expand */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : o.orderId)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", touchAction: "manipulation" }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Receipt size={17} color="var(--brand)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>{o.orderNumber}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{fmtDate(o.createdAt)} · {(o.items || []).length} item{(o.items || []).length !== 1 ? "s" : ""}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(o.grandTotal, "INR")}</div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: statusColor, marginTop: 2 }}>{(o.orderStatus || "").replace("_", " ")}</div>
                    </div>
                    {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid var(--border-light)", padding: "12px 14px 14px" }}>
                      {/* Items with images */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                        {(o.items || []).map((it, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 9, overflow: "hidden", background: "var(--surface-2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {it.productImageUrl ? (
                                <img src={it.productImageUrl} alt={it.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                              ) : (
                                <ImageOff size={15} color="var(--text-muted)" />
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.productName}</div>
                              <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Qty {it.quantity} × {formatCurrency(it.unitPrice, "INR")}</div>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", flexShrink: 0 }}>{formatCurrency(it.lineTotal, "INR")}</div>
                          </div>
                        ))}
                      </div>

                      {/* Bill breakdown */}
                      <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 5 }}>
                        <Row label="Subtotal" value={formatCurrency(o.subtotal, "INR")} />
                        {Number(o.discountAmount) > 0 && <Row label="Discount" value={`- ${formatCurrency(o.discountAmount, "INR")}`} valueColor="#16a34a" />}
                        <Row label="Tax / GST" value={formatCurrency(o.taxAmount, "INR")} />
                        <Row label="Grand Total" value={formatCurrency(o.grandTotal, "INR")} bold />
                      </div>

                      {/* Payment method dropdown-style pill */}
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", border: "1px solid var(--border-light)", borderRadius: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <payMeta.icon size={14} color="var(--brand)" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{payMeta.label}</span>
                        </div>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: o.paymentStatus === "PAID" || o.paymentStatus === "PAY_AT_COUNTER" ? "#16a34a" : "#f59e0b" }}>
                          {(o.paymentStatus || "").replace("_", " ")}
                        </span>
                      </div>

                      {o.orderType && (
                        <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
                          {o.orderType === "DINE_IN" ? `Dine-in${o.tableNumber ? ` · Table ${o.tableNumber}` : ""}` : "Takeaway"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function Row({ label, value, bold, valueColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontWeight: bold ? 800 : 500, color: bold ? "var(--text-primary)" : "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 700, color: valueColor || (bold ? "var(--text-primary)" : "var(--text-secondary)") }}>{value}</span>
    </div>
  );
}

function EmptyState({ title, subtitle, onBrowseMenu }) {
  return (
    <div style={{ padding: "70px 20px", textAlign: "center" }}>
      <PackageSearch size={38} color="var(--text-muted)" strokeWidth={1.4} />
      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-secondary)", marginTop: 12 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 5, lineHeight: 1.5 }}>{subtitle}</div>
      <button className="cta-btn" style={{ width: "auto", padding: "11px 28px", marginTop: 20 }} onClick={onBrowseMenu}>
        Make your first order
      </button>
    </div>
  );
}

export default CustomerMyOrdersPage;