import { useState } from "react";
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Filter,
  Clock, CheckCircle2, AlertCircle, Zap, MoreHorizontal,
  ShoppingBag, Wallet, Users, Star, BarChart3, ShieldCheck,
  Globe, Bell,
} from "lucide-react";
import "../designdashboardcomponent/homepagedashboard.css";

const HPD_STAT_CARDS = [
  { label: "Today's Revenue", value: "₹24,580", change: "+12.4%", up: true,  icon: Wallet,      color: "#7c3aed", bg: "#ede9fe" },
  { label: "Total Orders",    value: "348",      change: "+8.1%",  up: true,  icon: ShoppingBag, color: "#0369a1", bg: "#e0f2fe" },
  { label: "Avg. Rating",     value: "4.7★",    change: "+0.2",   up: true,  icon: Star,        color: "#b45309", bg: "#fef3c7" },
  { label: "Active Tables",   value: "18/24",    change: "-2 from peak", up: false, icon: Users, color: "#065f46", bg: "#d1fae5" },
];

const HPD_RECENT_ORDERS = [
  { id: "#ORD-2841", item: "Butter Chicken + Naan", table: "Table 4",  time: "2 min ago",  status: "new",       amount: "₹480" },
  { id: "#ORD-2840", item: "Veg Thali × 2",         table: "Table 7",  time: "8 min ago",  status: "preparing", amount: "₹360" },
  { id: "#ORD-2839", item: "Paneer Tikka + Lassi",  table: "Delivery", time: "14 min ago", status: "ready",     amount: "₹290" },
  { id: "#ORD-2838", item: "Masala Dosa × 3",        table: "Table 2",  time: "22 min ago", status: "delivered", amount: "₹210" },
  { id: "#ORD-2837", item: "Biryani Family Pack",    table: "Table 11", time: "31 min ago", status: "delivered", amount: "₹850" },
];

const HPD_TOP_ITEMS = [
  { name: "Butter Chicken", orders: 84, pct: 92 },
  { name: "Veg Biryani",    orders: 71, pct: 78 },
  { name: "Paneer Tikka",   orders: 58, pct: 63 },
  { name: "Masala Dosa",    orders: 46, pct: 50 },
  { name: "Gulab Jamun",    orders: 39, pct: 42 },
];

const HPD_STATUS_MAP = {
  new:       { label: "New",       cls: "hpd-status-new" },
  preparing: { label: "Preparing", cls: "hpd-status-preparing" },
  ready:     { label: "Ready",     cls: "hpd-status-ready" },
  delivered: { label: "Delivered", cls: "hpd-status-delivered" },
};

const HPD_PERF_DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HPD_PERF_HEIGHTS = [55, 70, 45, 82, 90, 100, 65];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const HomePageDashboard = ({ firstName = "Admin" }) => {
  const [activeTab, setActiveTab] = useState("Today");

  return (
    <div className="hpd-root">
      {/* Welcome Row */}
      <div className="hpd-welcome-row">
        <div>
          <div className="hpd-page-title">{getGreeting()}, {firstName} 👋</div>
          <div className="hpd-page-sub">Here&apos;s what&apos;s happening at your restaurant today.</div>
        </div>
        <div className="hpd-header-actions">
          <button className="hpd-btn-secondary" type="button">
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="hpd-btn-primary" type="button">
            <Filter size={13} /> Filter
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="hpd-stat-grid">
        {HPD_STAT_CARDS.map(s => {
          const Icon = s.icon;
          return (
            <div className="hpd-stat-card" key={s.label}>
              <div className="hpd-stat-top">
                <div className="hpd-stat-icon-wrap" style={{ background: s.bg }}>
                  <Icon size={16} color={s.color} />
                </div>
                <span className={`hpd-stat-change ${s.up ? "hpd-up" : "hpd-down"}`}>
                  {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {s.change}
                </span>
              </div>
              <div className="hpd-stat-value">{s.value}</div>
              <div className="hpd-stat-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Orders + Top Items */}
      <div className="hpd-grid-two">
        {/* Recent Orders */}
        <div className="hpd-panel">
          <div className="hpd-panel-head">
            <div className="hpd-panel-title">Recent Orders</div>
            <div className="hpd-panel-actions">
              <span className="hpd-live-pill">
                <span className="hpd-live-dot" /> Live
              </span>
              <button className="hpd-text-btn" type="button">View all</button>
            </div>
          </div>
          <div className="hpd-orders-list">
            {HPD_RECENT_ORDERS.map(o => {
              const st = HPD_STATUS_MAP[o.status];
              return (
                <div className="hpd-order-row" key={o.id}>
                  <div className="hpd-order-left">
                    <div className="hpd-order-id">{o.id}</div>
                    <div className="hpd-order-item">{o.item}</div>
                    <div className="hpd-order-meta">
                      <Clock size={10} /> {o.time} · {o.table}
                    </div>
                  </div>
                  <div className="hpd-order-right">
                    <div className="hpd-order-amount">{o.amount}</div>
                    <span className={`hpd-status-pill ${st.cls}`}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="hpd-panel">
          <div className="hpd-panel-head">
            <div className="hpd-panel-title">Top Selling Items</div>
            <button className="hpd-text-btn" type="button">
              <MoreHorizontal size={14} />
            </button>
          </div>
          <div className="hpd-top-items">
            {HPD_TOP_ITEMS.map((item, i) => (
              <div className="hpd-top-item" key={item.name}>
                <div className="hpd-top-rank">{i + 1}</div>
                <div className="hpd-top-info">
                  <div className="hpd-top-name">{item.name}</div>
                  <div className="hpd-top-bar-wrap">
                    <div className="hpd-top-bar">
                      <div className="hpd-top-bar-fill" style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="hpd-top-orders">{item.orders} orders</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hpd-quick-stats">
            <div className="hpd-qs-item"><CheckCircle2 size={13} color="#16a34a" /><span>156 delivered</span></div>
            <div className="hpd-qs-item"><Zap size={13} color="#b45309" /><span>12 preparing</span></div>
            <div className="hpd-qs-item"><AlertCircle size={13} color="#dc2626" /><span>2 issues</span></div>
            <div className="hpd-qs-item"><TrendingUp size={13} color="#7c3aed" /><span>↑ 8% week</span></div>
          </div>
        </div>
      </div>

      {/* Performance + Health */}
      <div className="hpd-bottom-row">
        <div className="hpd-panel hpd-perf-panel">
          <div className="hpd-panel-head">
            <div className="hpd-panel-title">Performance Overview</div>
            <div className="hpd-tab-group">
              {["Today","Week","Month"].map(t => (
                <button
                  key={t}
                  className={`hpd-tab ${activeTab === t ? "hpd-tab-active" : ""}`}
                  onClick={() => setActiveTab(t)}
                  type="button"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="hpd-perf-bars">
            {HPD_PERF_DAYS.map((d, i) => {
              const isToday = i === 6;
              return (
                <div className="hpd-perf-col" key={d}>
                  <div className="hpd-perf-bar-wrap">
                    <div
                      className={`hpd-perf-bar ${isToday ? "hpd-perf-today" : ""}`}
                      style={{ height: `${HPD_PERF_HEIGHTS[i]}%` }}
                    />
                  </div>
                  <div className={`hpd-perf-day ${isToday ? "hpd-perf-day-today" : ""}`}>{d}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hpd-panel hpd-info-panel">
          <div className="hpd-panel-head">
            <div className="hpd-panel-title">Restaurant Health</div>
            <span className="hpd-health-badge">Good</span>
          </div>
          <div className="hpd-health-list">
            {[
              { icon: ShieldCheck, label: "Payment Gateway",   val: "Active",       ok: true },
              { icon: Globe,       label: "Online Visibility", val: "Live",         ok: true },
              { icon: BarChart3,   label: "Analytics",         val: "Synced",       ok: true },
              { icon: AlertCircle, label: "Stock Alerts",      val: "2 low items",  ok: false },
            ].map(({ icon: Icon, label, val, ok }) => (
              <div className="hpd-health-row" key={label}>
                <div className="hpd-health-left">
                  <Icon size={14} color={ok ? "#16a34a" : "#dc2626"} />
                  <span className="hpd-health-label">{label}</span>
                </div>
                <span className={`hpd-health-val ${ok ? "hpd-ok" : "hpd-warn"}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageDashboard;