"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell, ShoppingBag, CreditCard, CheckCircle2, ChefHat, Package,
  Truck, TrendingUp, Zap, X, Trash2, ArrowRight, RefreshCw, Loader2,
  XCircle,
} from "lucide-react";
import notificationService from "../services/notificationService";
import adminOrderService from "../services/adminOrderService";
import AcceptOrderPopup from "../orderstabletopleo/AcceptOrderPopup";
import useWebSocket from "../hooks/useWebSocket";

/* ── Icon / color config per notification type ── */
const TYPE_CFG = {
  NEW_ORDER:       { label: "New Order",  color: "#635bff", bg: "rgba(99,91,255,0.12)",  icon: ShoppingBag },
  PAYMENT:         { label: "Payment",    color: "#16a34a", bg: "rgba(22,163,74,0.12)",  icon: CreditCard },
  ORDER_READY:     { label: "Ready",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: ChefHat },
  ORDER_DELIVERED: { label: "Delivered",  color: "#0ea5e9", bg: "rgba(14,165,233,0.12)", icon: Truck },
  STOCK_ALERT:     { label: "Stock",      color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: Package },
  REVENUE:         { label: "Revenue",    color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: TrendingUp },
  SYSTEM:          { label: "System",     color: "#6b7280", bg: "rgba(107,114,128,0.1)", icon: Zap },
};

const FILTERS = ["All", "Orders", "Payments", "Alerts"];

const T = (dark) => ({
  bg:          dark ? "#0f1117" : "#f8fafc",
  card:        dark ? "#1a1d28" : "#ffffff",
  border:      dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  text:        dark ? "#e2e8f0" : "#1e293b",
  muted:       dark ? "#8b92a9" : "#64748b",
  sub:         dark ? "#6b7184" : "#94a3b8",
  unreadBg:    dark ? "rgba(99,91,255,0.06)" : "rgba(99,91,255,0.04)",
  unreadBdr:   dark ? "rgba(99,91,255,0.2)"  : "rgba(99,91,255,0.15)",
  hdr:         dark ? "#141720" : "#ffffff",
  hdrBdr:      dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
});

function formatTimeAgo(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "Yesterday";
  if (day < 7) return `${day} days ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function amountLabel(amount) {
  if (amount == null) return null;
  return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

/* ── SINGLE NOTIFICATION CARD ── */
const NotifCard = ({ notif, dark, dismissing, onDismiss, onNavigate, onAccept, onReject, acting }) => {
  const t = T(dark);
  const cfg = TYPE_CFG[notif.type] || TYPE_CFG.SYSTEM;
  const Icon = cfg.icon;
  // Only a still-pending new order gets Accept/Reject — once acted on
  // (from here, the bell, or the Orders page) the backend's live status
  // lookup stops sending PLACED for it, so this naturally disappears.
  // Any notification tied to a still-pending order gets Accept/Reject —
  // not restricted to a specific notification "type" (NEW_ORDER is the
  // only type today, but this stays correct even if more are added
  // later, and avoids excluding anything on a type-string mismatch).
  const needsAction = !!notif.orderId && (!notif.orderStatus || notif.orderStatus === "PLACED");

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 8,
        padding: "10px 11px",
        background: t.unreadBg,
        border: `1px solid ${t.unreadBdr}`,
        borderRadius: 10,
        marginBottom: 5,
        transition: "opacity 0.18s ease, transform 0.18s ease",
        opacity: dismissing ? 0 : 1,
        transform: dismissing ? "translateX(12px)" : "translateX(0)",
      }}
    >
      <div
        onClick={() => onDismiss(notif.notificationId)}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: cfg.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={14} color={cfg.color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{notif.title}</span>
            {notif.orderNumber && (
              <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: "1px 6px", borderRadius: 20 }}>
                {notif.orderNumber}
              </span>
            )}
            {amountLabel(notif.amount) && (
              <span style={{ fontSize: 11, fontWeight: 700, color: t.text, marginLeft: "auto" }}>
                {amountLabel(notif.amount)}
              </span>
            )}
          </div>
          <div style={{ fontSize: 10.5, color: t.sub, marginTop: 2, lineHeight: 1.4 }}>
            {notif.message}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 9.5, color: t.sub }}>{formatTimeAgo(notif.createdAt)}</span>
            {notif.orderId && (
              <button
                onClick={(e) => { e.stopPropagation(); onNavigate(notif.orderNumber || notif.orderId); }}
                style={{
                  display: "flex", alignItems: "center", gap: 3,
                  fontSize: 9.5, fontWeight: 600, color: "#635bff",
                  background: "rgba(99,91,255,0.1)",
                  border: "none", borderRadius: 6, padding: "2px 7px",
                  cursor: "pointer",
                }}
              >
                View Order <ArrowRight size={9} />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(notif.notificationId); }}
          title="Dismiss"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: t.sub, padding: "3px", borderRadius: 4, display: "flex", flexShrink: 0,
          }}
        >
          <X size={13} />
        </button>
      </div>

      {/* ── Accept / Reject — the merchant's first decision on a new
          order, right on the notification, no need to open Orders ── */}
      {needsAction && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 40 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onAccept(notif); }}
            disabled={acting}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px 0", borderRadius: 7, border: "none", background: "#16a34a", color: "#fff", fontSize: 11.5, fontWeight: 700, cursor: acting ? "not-allowed" : "pointer", opacity: acting ? 0.7 : 1, fontFamily: "inherit" }}
          >
            {acting ? <Loader2 size={12} style={{ animation: "ntlSpin 0.7s linear infinite" }} /> : <CheckCircle2 size={12} />}
            Accept
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(notif); }}
            disabled={acting}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px 0", borderRadius: 7, border: "1.5px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: 11.5, fontWeight: 700, cursor: acting ? "not-allowed" : "pointer", opacity: acting ? 0.7 : 1, fontFamily: "inherit" }}
          >
            <XCircle size={12} /> Reject
          </button>
        </div>
      )}
    </div>
  );
};

/* ── MAIN COMPONENT ── */
const NotificationTableTopLeo = ({ dark = false, onNavigateToOrder }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [dismissingIds, setDismissingIds] = useState(new Set());
  const [clearing, setClearing]   = useState(false);
  const [actingId, setActingId]   = useState(null); // notificationId currently being Accepted/Rejected
  const [acceptPopupNotif, setAcceptPopupNotif] = useState(null);

  const adminId = useRef(null);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ttl_user") || "{}");
      adminId.current = stored?.adminId || null;
    } catch { adminId.current = null; }
  }, []);

  const t = T(dark);

  // ── Fetch notifications from the backend (persisted — survives refresh/next-day) ──
  const loadNotifications = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const res = await notificationService.getActiveNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      } else {
        setError(res.message || "Failed to load notifications");
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
      if (isManualRefresh) setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  // ── Live updates: when a new order comes in, refresh the list instantly ──
  useWebSocket({
    topics: adminId.current ? [`/topic/admin/${adminId.current}/orders`] : [],
    enabled: !!adminId.current,
    onMessage: (topic, event) => {
      if (event.eventType === "NEW_ORDER") {
        loadNotifications();
      }
    },
  });

  const unreadCount = notifications.length; // every active row IS "unread" by definition

  const filtered = notifications.filter((n) => {
    if (filter === "All")      return true;
    if (filter === "Orders")   return ["NEW_ORDER", "ORDER_READY", "ORDER_DELIVERED"].includes(n.type);
    if (filter === "Payments") return n.type === "PAYMENT";
    if (filter === "Alerts")   return ["STOCK_ALERT", "REVENUE", "SYSTEM"].includes(n.type);
    return true;
  });

  // ── Dismiss one — click on message (or the X button) ──
  const handleDismiss = async (notificationId) => {
    if (dismissingIds.has(notificationId)) return;
    setDismissingIds((prev) => new Set(prev).add(notificationId));
    try {
      await notificationService.markAsRead(notificationId);
    } catch (e) {
      console.error("Failed to dismiss notification:", e);
    } finally {
      // Remove from the list after the fade-out animation finishes
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
        setDismissingIds((prev) => { const next = new Set(prev); next.delete(notificationId); return next; });
      }, 180);
    }
  };

  // ── Clear All icon — dismiss everything at once ──
  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    setClearing(true);
    try {
      await notificationService.clearAll();
      setNotifications([]);
    } catch (e) {
      console.error("Failed to clear notifications:", e);
    } finally {
      setClearing(false);
    }
  };

  // "View Order" — prefer the real navigation callback from the parent
  // dashboard (it owns the tab/selected-order state); fall back to the
  // CustomEvent for any host that doesn't pass the prop, so nothing
  // breaks if this component is ever rendered somewhere else.
  const handleNavigate = (orderNo) => {
    if (onNavigateToOrder) {
      onNavigateToOrder(orderNo);
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ttl_navigate", { detail: { page: "orders", highlight: orderNo } }));
    }
  };

  // ── Accept opens the order-details + prep-time popup, same as the
  // bell and the Orders page. Reject stays instant. ──
  const handleAccept = (notif) => {
    setAcceptPopupNotif(notif);
  };

  const handleAcceptedFromPopup = (updatedOrder, notif) => {
    setNotifications((prev) => prev.filter((n) => n.notificationId !== notif.notificationId));
    handleNavigate(notif.orderNumber || notif.orderId);
  };

  const handleReject = async (notif) => {
    if (actingId) return;
    setActingId(notif.notificationId);
    try {
      const res = await adminOrderService.updateOrderStatus(notif.orderId, "CANCELLED");
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.notificationId !== notif.notificationId));
      }
    } catch (e) {
      console.error("Failed to reject order:", e);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div style={{ background: t.bg, minHeight: "100%", fontFamily: "'Inter', sans-serif" }}>
      {/* ── HEADER ── */}
      <div style={{ background: t.hdr, borderBottom: `1px solid ${t.hdrBdr}`, padding: "14px 16px 0", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(99,91,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={14} color="#635bff" />
            </div>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: 0, lineHeight: 1 }}>Notifications</h2>
              <p style={{ fontSize: 10.5, color: t.sub, margin: "2px 0 0" }}>
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <div style={{ background: "#635bff", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "2px 7px", minWidth: 18, textAlign: "center" }}>
                {unreadCount}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <button
              onClick={() => loadNotifications(true)}
              title="Refresh"
              style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 7, padding: "5px 8px", cursor: "pointer", color: t.muted, display: "flex", alignItems: "center" }}
            >
              <RefreshCw size={11} style={{ animation: refreshing ? "ntlSpin 0.7s linear infinite" : "none" }} />
            </button>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                title="Clear all"
                style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 7, padding: "5px 8px", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 600 }}
              >
                {clearing ? <Loader2 size={11} style={{ animation: "ntlSpin 0.7s linear infinite" }} /> : <Trash2 size={11} />}
                Clear All
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 2, overflowX: "auto", paddingBottom: 1, scrollbarWidth: "none" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "5px 11px", borderRadius: "8px 8px 0 0", border: "none",
                fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 0.15s",
                background: filter === f ? (dark ? "#0f1117" : "#f8fafc") : "transparent",
                color: filter === f ? "#635bff" : t.muted,
                borderBottom: filter === f ? "2px solid #635bff" : "2px solid transparent",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── LIST ── */}
      <div style={{ padding: "10px 12px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ height: 58, borderRadius: 10, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", animation: "ntlPulse 1.2s ease-in-out infinite" }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "36px 20px", color: t.sub, fontSize: 12 }}>
            <Bell size={26} color={t.sub} strokeWidth={1.5} style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
            {error}
            <div>
              <button onClick={() => loadNotifications()} style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: "#635bff", background: "rgba(99,91,255,0.1)", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>
                Try Again
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: t.sub, fontSize: 12 }}>
            <Bell size={28} color={t.sub} strokeWidth={1.5} style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
            No notifications here
          </div>
        ) : (
          filtered.map((notif) => (
            <NotifCard
              key={notif.notificationId}
              notif={notif}
              dark={dark}
              dismissing={dismissingIds.has(notif.notificationId)}
              onDismiss={handleDismiss}
              onNavigate={handleNavigate}
              onAccept={handleAccept}
              onReject={handleReject}
              acting={actingId === notif.notificationId}
            />
          ))
        )}
      </div>

      <style>{`
        @keyframes ntlSpin  { to { transform: rotate(360deg); } }
        @keyframes ntlPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {acceptPopupNotif && (
        <AcceptOrderPopup
          orderId={acceptPopupNotif.orderId}
          onClose={() => setAcceptPopupNotif(null)}
          onAccepted={(updatedOrder) => handleAcceptedFromPopup(updatedOrder, acceptPopupNotif)}
        />
      )}
    </div>
  );
};

export default NotificationTableTopLeo;