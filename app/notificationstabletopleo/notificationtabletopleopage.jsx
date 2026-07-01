"use client";
import { useState } from "react";
import {
  Bell, ShoppingBag, CreditCard, CheckCircle2, AlertCircle,
  Clock, Truck, ChefHat, Package, Star, X, ChevronDown,
  ChevronUp, RotateCcw, MessageSquare, TrendingUp, Zap,
  Eye, Trash2, CheckCheck, ExternalLink,
} from "lucide-react";
import "../notificationstabletopleo/designnotifypage.css";

const NOTIF_DATA = [
  {
    id: 1,
    type: "new_order",
    title: "New Order Received!",
    desc: "Order #ORD-2841 placed — Butter Chicken + Naan × 2",
    sub: "Table 4 • ₹480 • UPI",
    time: "2 min ago",
    read: false,
    priority: "high",
    actions: [
      { label: "Accept Order", icon: CheckCircle2, color: "#16a34a", bg: "#dcfce7" },
      { label: "View Details", icon: Eye, color: "#635bff", bg: "#ede9fe" },
      { label: "Reject", icon: X, color: "#dc2626", bg: "#fee2e2" },
    ],
    detail: {
      items: ["Butter Chicken × 2 — ₹340", "Naan × 2 — ₹80", "Lassi × 1 — ₹60"],
      total: "₹480",
      payment: "UPI • Paid",
      table: "Table 4 — Dine In",
      customer: "Anonymous",
    },
  },
  {
    id: 2,
    type: "payment",
    title: "Payment Confirmed",
    desc: "₹360 received via Razorpay for Order #ORD-2840",
    sub: "Veg Thali × 2 • Table 7",
    time: "8 min ago",
    read: false,
    priority: "high",
    actions: [
      { label: "Start Preparing", icon: ChefHat, color: "#b45309", bg: "#fef3c7" },
      { label: "View Order", icon: Eye, color: "#635bff", bg: "#ede9fe" },
    ],
    detail: {
      items: ["Veg Thali × 2 — ₹360"],
      total: "₹360",
      payment: "Razorpay • Confirmed",
      table: "Table 7 — Dine In",
      txnId: "rzp_test_AbCdEfGhIj",
    },
  },
  {
    id: 3,
    type: "order_ready",
    title: "Order Ready for Pickup",
    desc: "Order #ORD-2839 is ready — Paneer Tikka + Lassi",
    sub: "Delivery • ₹290",
    time: "14 min ago",
    read: false,
    priority: "medium",
    actions: [
      { label: "Mark Delivered", icon: Truck, color: "#0369a1", bg: "#e0f2fe" },
      { label: "Track Order", icon: TrendingUp, color: "#635bff", bg: "#ede9fe" },
    ],
    detail: {
      items: ["Paneer Tikka × 1 — ₹200", "Lassi × 1 — ₹90"],
      total: "₹290",
      payment: "UPI • Paid",
      table: "Delivery",
    },
  },
  {
    id: 4,
    type: "order_delivered",
    title: "Order Delivered ✓",
    desc: "Order #ORD-2838 delivered to Table 2 — Masala Dosa × 3",
    sub: "Table 2 • ₹210 • Completed",
    time: "22 min ago",
    read: true,
    priority: "low",
    actions: [
      { label: "Rate Experience", icon: Star, color: "#f59e0b", bg: "#fffbeb" },
      { label: "Reorder", icon: RotateCcw, color: "#6b7280", bg: "#f9fafb" },
    ],
    detail: {
      items: ["Masala Dosa × 3 — ₹210"],
      total: "₹210",
      payment: "UPI • Paid",
      table: "Table 2 — Dine In",
    },
  },
  {
    id: 5,
    type: "new_order",
    title: "New Order Received!",
    desc: "Order #ORD-2837 — Biryani Family Pack",
    sub: "Table 11 • ₹850 • Stripe",
    time: "31 min ago",
    read: true,
    priority: "high",
    actions: [
      { label: "Accept Order", icon: CheckCircle2, color: "#16a34a", bg: "#dcfce7" },
      { label: "View Details", icon: Eye, color: "#635bff", bg: "#ede9fe" },
    ],
    detail: {
      items: ["Biryani Family Pack × 1 — ₹850"],
      total: "₹850",
      payment: "Stripe • Paid",
      table: "Table 11 — Dine In",
    },
  },
  {
    id: 6,
    type: "stock_alert",
    title: "Low Stock Alert ⚠️",
    desc: "Paneer is running low — only 500g remaining",
    sub: "Inventory Alert • Update stock",
    time: "1 hr ago",
    read: true,
    priority: "medium",
    actions: [
      { label: "Update Stock", icon: Package, color: "#7c2d12", bg: "#ffedd5" },
      { label: "Disable Items", icon: AlertCircle, color: "#dc2626", bg: "#fee2e2" },
    ],
    detail: null,
  },
  {
    id: 7,
    type: "payment",
    title: "Payment Failed",
    desc: "Payment of ₹680 failed for Order #ORD-2836 via PayPal",
    sub: "Table 9 • Action required",
    time: "1 hr ago",
    read: true,
    priority: "high",
    actions: [
      { label: "Retry Payment", icon: RotateCcw, color: "#635bff", bg: "#ede9fe" },
      { label: "Cancel Order", icon: X, color: "#dc2626", bg: "#fee2e2" },
    ],
    detail: {
      items: ["Mixed Platter × 2 — ₹680"],
      total: "₹680",
      payment: "PayPal • Failed",
      table: "Table 9 — Dine In",
    },
  },
  {
    id: 8,
    type: "revenue",
    title: "Daily Revenue Report",
    desc: "Today's revenue: ₹24,580 from 48 orders 📊",
    sub: "↑ +12.4% vs yesterday",
    time: "2 hr ago",
    read: true,
    priority: "low",
    actions: [
      { label: "View Analytics", icon: TrendingUp, color: "#635bff", bg: "#ede9fe" },
    ],
    detail: null,
  },
  {
    id: 9,
    type: "order_ready",
    title: "Peak Hour Alert 🔥",
    desc: "High traffic detected — 8 pending orders in queue",
    sub: "Kitchen load: Heavy",
    time: "2 hr ago",
    read: true,
    priority: "medium",
    actions: [
      { label: "View Queue", icon: Clock, color: "#b45309", bg: "#fef3c7" },
      { label: "Notify Staff", icon: Bell, color: "#635bff", bg: "#ede9fe" },
    ],
    detail: null,
  },
  {
    id: 10,
    type: "system",
    title: "QR Code Scanned",
    desc: "Your menu QR was scanned 24 times in the last hour",
    sub: "Menu views: 24 • Cart adds: 11",
    time: "3 hr ago",
    read: true,
    priority: "low",
    actions: [
      { label: "View Menu Stats", icon: TrendingUp, color: "#635bff", bg: "#ede9fe" },
    ],
    detail: null,
  },
];

const TYPE_CONFIG = {
  new_order:      { icon: ShoppingBag, color: "#635bff", bg: "#ede9fe", badge: "Order" },
  payment:        { icon: CreditCard,  color: "#16a34a", bg: "#dcfce7", badge: "Payment" },
  order_ready:    { icon: ChefHat,     color: "#b45309", bg: "#fef3c7", badge: "Kitchen" },
  order_delivered:{ icon: Truck,       color: "#0369a1", bg: "#e0f2fe", badge: "Delivered" },
  stock_alert:    { icon: Package,     color: "#7c2d12", bg: "#ffedd5", badge: "Stock" },
  revenue:        { icon: TrendingUp,  color: "#7c3aed", bg: "#f3e8ff", badge: "Analytics" },
  system:         { icon: Zap,         color: "#6b7280", bg: "#f3f4f6", badge: "System" },
};

const FILTERS = ["All", "Unread", "Orders", "Payments", "Alerts"];

const NotificationTableTopLeo = () => {
  const [notifications, setNotifications]   = useState(NOTIF_DATA);
  const [expanded,      setExpanded]         = useState(null);
  const [filter,        setFilter]           = useState("All");

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === "All")      return true;
    if (filter === "Unread")   return !n.read;
    if (filter === "Orders")   return ["new_order", "order_ready", "order_delivered"].includes(n.type);
    if (filter === "Payments") return n.type === "payment";
    if (filter === "Alerts")   return ["stock_alert", "revenue", "system"].includes(n.type);
    return true;
  });

  const markRead    = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () =>   setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotif = (id) => { setNotifications(prev => prev.filter(n => n.id !== id)); if (expanded === id) setExpanded(null); };

  const toggleExpand = (id) => {
    setExpanded(prev => prev === id ? null : id);
    markRead(id);
  };

  const cfg = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.system;

  return (
    <div className="ntl-root">
      {/* HEADER */}
      <div className="ntl-header">
        <div className="ntl-header-left">
          <div className="ntl-header-icon"><Bell size={16} /></div>
          <div>
            <h1 className="ntl-title">Notifications</h1>
            <p className="ntl-sub">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</p>
          </div>
        </div>
        <div className="ntl-header-actions">
          {unreadCount > 0 && (
            <button className="ntl-action-btn" onClick={markAllRead}>
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          <button className="ntl-action-btn ntl-action-ghost">
            <Bell size={13} /> Settings
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="ntl-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`ntl-filter-btn ${filter === f ? "ntl-filter-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f === "Unread" && unreadCount > 0 && (
              <span className="ntl-filter-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* NOTIFICATION LIST */}
      <div className="ntl-list">
        {filtered.length === 0 ? (
          <div className="ntl-empty">
            <Bell size={36} strokeWidth={1.5} />
            <p>No notifications here</p>
          </div>
        ) : filtered.map(notif => {
          const c       = cfg(notif.type);
          const Icon    = c.icon;
          const isOpen  = expanded === notif.id;
          const isHigh  = notif.priority === "high";

          return (
            <div
              key={notif.id}
              className={`ntl-card ${!notif.read ? "ntl-card-unread" : ""} ${isOpen ? "ntl-card-open" : ""} ${isHigh && !notif.read ? "ntl-card-high" : ""}`}
            >
              {/* CARD MAIN ROW */}
              <div className="ntl-card-row" onClick={() => toggleExpand(notif.id)}>
                <div className="ntl-card-icon" style={{ background: c.bg }}>
                  <Icon size={15} color={c.color} />
                </div>

                <div className="ntl-card-body">
                  <div className="ntl-card-top">
                    <div className="ntl-card-title-row">
                      <span className="ntl-card-title">{notif.title}</span>
                      <span className="ntl-badge" style={{ background: c.bg, color: c.color }}>{c.badge}</span>
                    </div>
                    <div className="ntl-card-meta">
                      <span className="ntl-card-time"><Clock size={10} /> {notif.time}</span>
                      {!notif.read && <span className="ntl-unread-dot" />}
                    </div>
                  </div>
                  <div className="ntl-card-desc">{notif.desc}</div>
                  <div className="ntl-card-sub">{notif.sub}</div>
                </div>

                <div className="ntl-card-controls" onClick={e => e.stopPropagation()}>
                  <button className="ntl-mini-btn" title="Delete" onClick={() => deleteNotif(notif.id)}>
                    <Trash2 size={12} />
                  </button>
                  <button className="ntl-mini-btn ntl-expand-btn" title={isOpen ? "Collapse" : "Expand"}>
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
              </div>

              {/* EXPANDED DROPDOWN */}
              {isOpen && (
                <div className="ntl-dropdown">
                  {/* Order detail */}
                  {notif.detail && (
                    <div className="ntl-detail-box">
                      {notif.detail.table && (
                        <div className="ntl-detail-row">
                          <span className="ntl-dl">📍 Location</span>
                          <span className="ntl-dv">{notif.detail.table}</span>
                        </div>
                      )}
                      {notif.detail.items && (
                        <div className="ntl-detail-items">
                          <span className="ntl-dl">🛒 Items</span>
                          <div className="ntl-items-list">
                            {notif.detail.items.map((item, i) => (
                              <div key={i} className="ntl-item-row">{item}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {notif.detail.total && (
                        <div className="ntl-detail-row ntl-total-row">
                          <span className="ntl-dl">💰 Total</span>
                          <span className="ntl-dv ntl-total-val">{notif.detail.total}</span>
                        </div>
                      )}
                      {notif.detail.payment && (
                        <div className="ntl-detail-row">
                          <span className="ntl-dl">💳 Payment</span>
                          <span className="ntl-dv">{notif.detail.payment}</span>
                        </div>
                      )}
                      {notif.detail.txnId && (
                        <div className="ntl-detail-row">
                          <span className="ntl-dl">🔖 Txn ID</span>
                          <span className="ntl-dv ntl-mono">{notif.detail.txnId}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="ntl-actions-row">
                    {notif.actions.map((action, i) => {
                      const AIcon = action.icon;
                      return (
                        <button
                          key={i}
                          className="ntl-action-pill"
                          style={{ background: action.bg, color: action.color }}
                        >
                          <AIcon size={12} />
                          {action.label}
                        </button>
                      );
                    })}
                    <button className="ntl-action-pill ntl-pill-ghost">
                      <ExternalLink size={12} /> Open
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      {notifications.length > 0 && (
        <div className="ntl-footer">
          <button className="ntl-footer-btn-clear" onClick={() => setNotifications([])}>
            <Trash2 size={12} /> Clear all
          </button>
          <span className="ntl-footer-count">{filtered.length} notifications</span>
        </div>
      )}
    </div>
  );
};

export default NotificationTableTopLeo;
