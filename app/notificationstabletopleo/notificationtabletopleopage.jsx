"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, ShoppingBag, CreditCard, CheckCircle2, AlertCircle,
  Clock, Truck, ChefHat, Package, Star, X, ChevronDown,
  ChevronUp, RotateCcw, MessageSquare, TrendingUp, Zap,
  Eye, Trash2, CheckCheck, ExternalLink, RefreshCw,
  ArrowRight, ChevronRight,
} from "lucide-react";

/* ─── NOTIFICATION DATA ─── */
const INITIAL_NOTIF_DATA = [
  {
    id: 1, type: "new_order", read: false, priority: "high",
    time: "2 min ago",
    order: {
      orderNo: "ORD-2841", customer: "Rahul Sharma",
      amount: "₹480", items: ["Butter Chicken × 2 — ₹340", "Naan × 2 — ₹80", "Lassi × 1 — ₹60"],
      table: "Table 4 — Dine In", payment: "UPI • Paid", status: "New",
    },
  },
  {
    id: 2, type: "payment", read: false, priority: "high",
    time: "8 min ago",
    order: {
      orderNo: "ORD-2840", customer: "Priya Nair",
      amount: "₹360", items: ["Veg Thali × 2 — ₹360"],
      table: "Table 7 — Dine In", payment: "Razorpay • Confirmed", status: "Accepted",
    },
  },
  {
    id: 3, type: "order_ready", read: false, priority: "medium",
    time: "14 min ago",
    order: {
      orderNo: "ORD-2839", customer: "Arjun Mehta",
      amount: "₹290", items: ["Paneer Tikka × 1 — ₹200", "Lassi × 1 — ₹90"],
      table: "Delivery", payment: "UPI • Paid", status: "Ready",
    },
  },
  {
    id: 4, type: "order_delivered", read: true, priority: "low",
    time: "22 min ago",
    order: {
      orderNo: "ORD-2838", customer: "Deepa Krishnan",
      amount: "₹210", items: ["Masala Dosa × 3 — ₹210"],
      table: "Table 2 — Dine In", payment: "UPI • Paid", status: "Completed",
    },
  },
  {
    id: 5, type: "new_order", read: true, priority: "high",
    time: "31 min ago",
    order: {
      orderNo: "ORD-2837", customer: "Vikram Singh",
      amount: "₹850", items: ["Biryani Family Pack × 1 — ₹850"],
      table: "Table 11 — Dine In", payment: "Stripe • Paid", status: "Preparing",
    },
  },
  {
    id: 6, type: "stock_alert", read: true, priority: "medium",
    time: "1 hr ago",
    order: null,
    alertMsg: "Paneer is running low — only 500g remaining",
    alertSub: "Inventory Alert",
  },
  {
    id: 7, type: "payment", read: true, priority: "high",
    time: "1 hr ago",
    order: {
      orderNo: "ORD-2836", customer: "Meena Iyer",
      amount: "₹680", items: ["Mixed Platter × 2 — ₹680"],
      table: "Table 9 — Dine In", payment: "PayPal • Failed", status: "Failed",
    },
  },
  {
    id: 8, type: "revenue", read: true, priority: "low",
    time: "2 hr ago",
    order: null,
    alertMsg: "Today's revenue: ₹24,580 from 48 orders — ↑ +12.4% vs yesterday",
    alertSub: "Daily Report",
  },
  {
    id: 9, type: "order_ready", read: true, priority: "medium",
    time: "2 hr ago",
    order: {
      orderNo: "ORD-2835", customer: "Suresh Patel",
      amount: "₹320", items: ["Daal Makhani × 2 — ₹220", "Roti × 4 — ₹100"],
      table: "Table 6 — Dine In", payment: "UPI • Paid", status: "Ready",
    },
  },
  {
    id: 10, type: "system", read: true, priority: "low",
    time: "3 hr ago",
    order: null,
    alertMsg: "Your menu QR was scanned 24 times · Cart adds: 11",
    alertSub: "QR Analytics",
  },
];

const TYPE_CFG = {
  new_order:       { label: "New Order",   color: "#635bff", bg: "rgba(99,91,255,0.12)",  dot: "#635bff" },
  payment:         { label: "Payment",     color: "#16a34a", bg: "rgba(22,163,74,0.12)",  dot: "#16a34a" },
  order_ready:     { label: "Ready",       color: "#f59e0b", bg: "rgba(245,158,11,0.12)", dot: "#f59e0b" },
  order_delivered: { label: "Delivered",   color: "#0ea5e9", bg: "rgba(14,165,233,0.12)", dot: "#0ea5e9" },
  stock_alert:     { label: "Stock",       color: "#ef4444", bg: "rgba(239,68,68,0.12)",  dot: "#ef4444" },
  revenue:         { label: "Revenue",     color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", dot: "#8b5cf6" },
  system:          { label: "System",      color: "#6b7280", bg: "rgba(107,114,128,0.1)", dot: "#9ca3af" },
};

const STATUS_COLOR = {
  "New":       { c: "#635bff", bg: "rgba(99,91,255,0.1)"  },
  "Accepted":  { c: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
  "Preparing": { c: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  "Ready":     { c: "#f97316", bg: "rgba(249,115,22,0.1)" },
  "Completed": { c: "#16a34a", bg: "rgba(22,163,74,0.1)"  },
  "Failed":    { c: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
};

const FILTERS = ["All", "Unread", "Orders", "Payments", "Alerts"];

/* ── THEME ── */
const T = (dark) => ({
  bg:          dark ? "#0f1117" : "#f8fafc",
  card:        dark ? "#1a1d28" : "#ffffff",
  cardHover:   dark ? "#1f2335" : "#f1f5f9",
  border:      dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  text:        dark ? "#e2e8f0" : "#1e293b",
  muted:       dark ? "#8b92a9" : "#64748b",
  sub:         dark ? "#6b7184" : "#94a3b8",
  unreadBg:    dark ? "rgba(99,91,255,0.06)" : "rgba(99,91,255,0.04)",
  unreadBdr:   dark ? "rgba(99,91,255,0.2)"  : "rgba(99,91,255,0.15)",
  nestedBg:    dark ? "#0d0f18" : "#f8fafc",
  nestedBdr:   dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  itemBg:      dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
  pill:        dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
  pillActive:  dark ? "rgba(99,91,255,0.18)"   : "rgba(99,91,255,0.1)",
  pillText:    dark ? "#c4c9d8" : "#475569",
  pillTextAct: "#635bff",
  hdr:         dark ? "#141720" : "#ffffff",
  hdrBdr:      dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
  badge:       dark ? "#1a1d28" : "#f1f5f9",
  shadow:      dark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.08)",
});

/* ── NESTED ORDER DETAIL DROPDOWN ── */
const OrderDetail = ({ order, dark, onNavigate }) => {
  const t = T(dark);
  const sc = STATUS_COLOR[order.status] || STATUS_COLOR["New"];
  return (
    <div style={{
      marginTop: 6,
      background: t.nestedBg,
      border: `1px solid ${t.nestedBdr}`,
      borderRadius: 10,
      padding: "10px 12px",
      animation: "ntlSlideDown 0.18s ease",
    }}>
      <style>{`@keyframes ntlSlideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Order header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#635bff", fontFamily: "monospace" }}>
            #{order.orderNo}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
            background: sc.bg, color: sc.c,
          }}>{order.status}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{order.amount}</span>
      </div>

      {/* Customer */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          background: "linear-gradient(135deg,#635bff,#a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0,
        }}>
          {order.customer[0]}
        </div>
        <span style={{ fontSize: 11, color: t.muted, fontWeight: 500 }}>{order.customer}</span>
        <span style={{ fontSize: 10, color: t.sub }}>·</span>
        <span style={{ fontSize: 10, color: t.sub }}>{order.table}</span>
      </div>

      {/* Items list */}
      <div style={{
        background: t.itemBg,
        borderRadius: 7,
        padding: "6px 8px",
        marginBottom: 7,
      }}>
        {order.items.map((item, i) => (
          <div key={i} style={{
            fontSize: 10.5,
            color: t.muted,
            padding: "2px 0",
            borderBottom: i < order.items.length - 1 ? `1px solid ${t.border}` : "none",
          }}>
            {item}
          </div>
        ))}
      </div>

      {/* Payment + action */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: t.sub }}>{order.payment}</span>
        <button
          onClick={onNavigate}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 10.5, fontWeight: 600, color: "#635bff",
            background: "rgba(99,91,255,0.1)",
            border: "none", borderRadius: 6, padding: "4px 9px",
            cursor: "pointer",
          }}
        >
          View Full Order <ArrowRight size={10} />
        </button>
      </div>
    </div>
  );
};

/* ── SINGLE NOTIFICATION CARD ── */
const NotifCard = ({ notif, dark, onDelete, onMarkRead, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const t = T(dark);
  const cfg = TYPE_CFG[notif.type] || TYPE_CFG.system;

  const handleCardClick = () => {
    if (!notif.order) return;
    setOpen(o => !o);
    if (!notif.read) onMarkRead(notif.id);
  };

  return (
    <div style={{
      background: notif.read ? t.card : t.unreadBg,
      border: `1px solid ${notif.read ? t.border : t.unreadBdr}`,
      borderRadius: 10,
      marginBottom: 5,
      transition: "all 0.15s",
      overflow: "hidden",
    }}>
      {/* MAIN ROW */}
      <div
        onClick={handleCardClick}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 11px",
          cursor: notif.order ? "pointer" : "default",
        }}
      >
        {/* Type dot */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: cfg.dot, flexShrink: 0,
          boxShadow: `0 0 6px ${cfg.dot}66`,
          opacity: notif.read ? 0.5 : 1,
        }} />

        {/* Icon */}
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: cfg.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {notif.type === "new_order"       && <ShoppingBag size={13} color={cfg.color} />}
          {notif.type === "payment"         && <CreditCard  size={13} color={cfg.color} />}
          {notif.type === "order_ready"     && <ChefHat     size={13} color={cfg.color} />}
          {notif.type === "order_delivered" && <Truck       size={13} color={cfg.color} />}
          {notif.type === "stock_alert"     && <Package     size={13} color={cfg.color} />}
          {notif.type === "revenue"         && <TrendingUp  size={13} color={cfg.color} />}
          {notif.type === "system"          && <Zap         size={13} color={cfg.color} />}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Order notification */}
          {notif.order && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: t.text }}>
                {notif.order.orderNo}
              </span>
              <span style={{
                fontSize: 10, padding: "1px 6px", borderRadius: 20,
                background: cfg.bg, color: cfg.color, fontWeight: 600,
              }}>{cfg.label}</span>
              <span style={{ fontSize: 11, color: t.muted, marginLeft: "auto", fontWeight: 600 }}>
                {notif.order.amount}
              </span>
            </div>
          )}
          {/* Alert notification */}
          {!notif.order && (
            <span style={{ fontSize: 11.5, fontWeight: 600, color: t.text, display: "block" }}>
              {notif.alertSub}
            </span>
          )}

          {/* Sub-line */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
            {notif.order && (
              <span style={{ fontSize: 10, color: t.sub }}>
                {notif.order.customer} · {notif.order.table}
              </span>
            )}
            {!notif.order && (
              <span style={{ fontSize: 10, color: t.sub, lineHeight: 1.4 }}>
                {notif.alertMsg}
              </span>
            )}
          </div>
        </div>

        {/* Right: time + controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <span style={{ fontSize: 9.5, color: t.sub, whiteSpace: "nowrap" }}>{notif.time}</span>
          {notif.order && (
            <div style={{
              color: t.sub, display: "flex", alignItems: "center",
              transition: "transform 0.15s",
              transform: open ? "rotate(180deg)" : "none",
            }}>
              <ChevronDown size={12} />
            </div>
          )}
          <button
            onClick={e => { e.stopPropagation(); onDelete(notif.id); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: t.sub, padding: "2px", borderRadius: 4, display: "flex",
            }}
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* NESTED DROPDOWN — order detail */}
      {open && notif.order && (
        <div style={{ padding: "0 11px 9px" }}>
          <OrderDetail
            order={notif.order}
            dark={dark}
            onNavigate={() => onNavigate(notif.order.orderNo)}
          />
        </div>
      )}
    </div>
  );
};

/* ── MAIN COMPONENT ── */
const NotificationTableTopLeo = ({ dark = false }) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_NOTIF_DATA);
  const [filter, setFilter]               = useState("All");
  const [refreshing, setRefreshing]       = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const t = T(dark);

  const filtered = notifications.filter(n => {
    if (filter === "All")      return true;
    if (filter === "Unread")   return !n.read;
    if (filter === "Orders")   return ["new_order","order_ready","order_delivered"].includes(n.type);
    if (filter === "Payments") return n.type === "payment";
    if (filter === "Alerts")   return ["stock_alert","revenue","system"].includes(n.type);
    return true;
  });

  const handleDelete  = (id) => setNotifications(p => p.filter(n => n.id !== id));
  const handleMarkRead = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const handleMarkAll  = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const handleClearAll = () => setNotifications([]);

  const handleNavigate = (orderNo) => {
    /* Navigate to orders page inside dashboard — set activeMenu via router or custom event */
    /* Since MyOrderTableTopleoPage is inside the dashboard, we fire a custom event 
       that AdminDashboardNew can listen to and switch to 'orders' tab */
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ttl_navigate", { detail: { page: "orders", highlight: orderNo } }));
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    /* In real app this would re-fetch — here we just simulate a brief flash */
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <div style={{
      background: t.bg,
      minHeight: "100%",
      fontFamily: "'Inter', sans-serif",
      padding: "0",
    }}>
      {/* ── HEADER ── */}
      <div style={{
        background: t.hdr,
        borderBottom: `1px solid ${t.hdrBdr}`,
        padding: "14px 16px 0",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "rgba(99,91,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bell size={14} color="#635bff" />
            </div>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: 0, lineHeight: 1 }}>
                Notifications
              </h2>
              <p style={{ fontSize: 10.5, color: t.sub, margin: "2px 0 0" }}>
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <div style={{
                background: "#635bff", color: "#fff",
                fontSize: 10, fontWeight: 700, borderRadius: 20,
                padding: "2px 7px", minWidth: 18, textAlign: "center",
              }}>{unreadCount}</div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <button
              onClick={handleRefresh}
              style={{
                background: "none", border: `1px solid ${t.border}`,
                borderRadius: 7, padding: "5px 8px",
                cursor: "pointer", color: t.muted, display: "flex", alignItems: "center", gap: 4,
                fontSize: 10.5, fontWeight: 500,
              }}
            >
              <RefreshCw size={11} style={{ animation: refreshing ? "ntlSpin 0.7s linear" : "none" }} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                style={{
                  background: "none", border: `1px solid ${t.border}`,
                  borderRadius: 7, padding: "5px 8px",
                  cursor: "pointer", color: t.muted, display: "flex", alignItems: "center", gap: 4,
                  fontSize: 10.5, fontWeight: 500,
                }}
              >
                <CheckCheck size={11} /> All read
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: "flex", gap: 2, overflowX: "auto",
          paddingBottom: 1,
          scrollbarWidth: "none",
        }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "5px 11px",
                borderRadius: "8px 8px 0 0",
                border: "none",
                fontSize: 11, fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                background: filter === f
                  ? (dark ? "#0f1117" : "#f8fafc")
                  : "transparent",
                color: filter === f ? "#635bff" : t.muted,
                borderBottom: filter === f ? `2px solid #635bff` : "2px solid transparent",
              }}
            >
              {f}
              {f === "Unread" && unreadCount > 0 && (
                <span style={{
                  marginLeft: 4, fontSize: 9, fontWeight: 700,
                  background: "#635bff", color: "#fff",
                  borderRadius: 10, padding: "1px 5px",
                }}>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── NOTIFICATION LIST ── */}
      <div style={{ padding: "10px 12px" }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "40px 20px",
            color: t.sub, fontSize: 12,
          }}>
            <Bell size={28} color={t.sub} strokeWidth={1.5} style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
            No notifications here
          </div>
        ) : filtered.map(notif => (
          <NotifCard
            key={notif.id}
            notif={notif}
            dark={dark}
            onDelete={handleDelete}
            onMarkRead={handleMarkRead}
            onNavigate={handleNavigate}
          />
        ))}
      </div>

      {/* ── FOOTER ── */}
      {notifications.length > 0 && (
        <div style={{
          borderTop: `1px solid ${t.hdrBdr}`,
          padding: "9px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 10.5, color: t.sub }}>
            {filtered.length} of {notifications.length} shown
          </span>
          <button
            onClick={handleClearAll}
            style={{
              fontSize: 10.5, fontWeight: 600, color: "#ef4444",
              background: "rgba(239,68,68,0.08)", border: "none",
              borderRadius: 6, padding: "4px 10px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <Trash2 size={10} /> Clear all
          </button>
        </div>
      )}

      <style>{`
        @keyframes ntlSpin { to { transform: rotate(360deg); } }
        @keyframes ntlSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationTableTopLeo;