"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ChevronDown, Calendar, MapPin, RefreshCw, Coins, Receipt, Users,
  ShoppingCart, TrendingUp, Trophy, ArrowRight, Crown, CreditCard,
  BarChart3, Lightbulb, Clock, Building2, Compass, Loader2, AlertTriangle, Lock,
} from "lucide-react";
import { getHeadOfficeAnalytics, getHeadOfficeFilterOptions } from "../services/headOfficeAnalyticsService";
import { getBusinessInformation } from "../services/businessService";
import { formatCurrency } from "../utils/currencyHelper";
import { useCurrency } from "../context/CurrencyContext";
import useWebSocket from "../hooks/useWebSocket";
import "./designheadofficedashboard.css";

function getUser() {
  try { const s = localStorage.getItem("ttl_user"); return s ? JSON.parse(s) : null; } catch { return null; }
}

// Same proven, real, business-type cover images already used on the
// customer landing page and merchant home dashboard — reused here so the
// Top Performing Branch card always shows a genuine, matching photo
// (restaurant, cafe, ice cream parlour, etc.), never a random or
// mismatched one.
const COVER_BY_TYPE = {
  "Restaurant":        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=85",
  "Cafe":              "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=85",
  "Coffee":            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=85",
  "Coffee Shop":       "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=85",
  "Bakery":            "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1000&q=85",
  "Fast Food":         "https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=1000&q=85",
  "Pizza":             "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&q=85",
  "Biryani":           "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1000&q=85",
  "South Indian":      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&q=85",
  "North Indian":      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1000&q=85",
  "Chinese":           "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1000&q=85",
  "Continental":       "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=85",
  "Juice Bar":         "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=1000&q=85",
  "Ice Cream Parlour": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1000&q=85",
  "Ice Cream":         "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1000&q=85",
  "Sweet Shop":        "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=1000&q=85",
  "Dhaba":             "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1000&q=85",
  "Food Truck":        "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1000&q=85",
  "Bar":               "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1000&q=85",
  "Pub":               "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1000&q=85",
  "Sushi":             "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1000&q=85",
  "Japanese":          "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1000&q=85",
  "Mexican":           "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1000&q=85",
  "Italian":           "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=85",
  "Thai":              "https://images.unsplash.com/photo-1562802378-063ec186a863?w=1000&q=85",
  "Burger":            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1000&q=85",
  "Sandwich":          "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=1000&q=85",
  "Dessert":           "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1000&q=85",
  "Healthy":           "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&q=85",
  "Salad":             "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&q=85",
  "Seafood":           "https://images.unsplash.com/photo-1559742811-822873691df8?w=1000&q=85",
  "BBQ":               "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1000&q=85",
  "Steak":             "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1000&q=85",
  "Vegan":             "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&q=85",
  "Breakfast":         "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1000&q=85",
  "Brunch":            "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1000&q=85",
  "Tea Shop":          "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1000&q=85",
  "Bubble Tea":        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1000&q=85",
  "Noodles":           "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1000&q=85",
  "Pasta":             "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=1000&q=85",
  "Kebab":             "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=1000&q=85",
  "Street Food":       "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&q=85",
  "default":           "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=85",
};

// Exact match first, then a strict partial match in either direction —
// never falls through to an unrelated image; only ever the configured
// business type's own photo or the generic default.
function getCoverImage(businessType) {
  if (!businessType) return COVER_BY_TYPE.default;
  if (COVER_BY_TYPE[businessType]) return COVER_BY_TYPE[businessType];
  const key = Object.keys(COVER_BY_TYPE).find(
    (k) => k !== "default" &&
      (businessType.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(businessType.toLowerCase()))
  );
  return COVER_BY_TYPE[key] || COVER_BY_TYPE.default;
}

const DATE_PRESETS = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "This Month", "Previous Month", "Custom Range"];

function resolveDateRange(preset, customFrom, customTo) {
  const fmt = (d) => d.toISOString().slice(0, 10);
  const today = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  switch (preset) {
    case "Today": return { fromDate: fmt(startOfDay(today)), toDate: fmt(startOfDay(today)) };
    case "Yesterday": {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      return { fromDate: fmt(startOfDay(y)), toDate: fmt(startOfDay(y)) };
    }
    case "Last 7 Days": {
      const f = new Date(today); f.setDate(f.getDate() - 6);
      return { fromDate: fmt(startOfDay(f)), toDate: fmt(startOfDay(today)) };
    }
    case "This Month": {
      const f = new Date(today.getFullYear(), today.getMonth(), 1);
      return { fromDate: fmt(f), toDate: fmt(startOfDay(today)) };
    }
    case "Previous Month": {
      const f = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const l = new Date(today.getFullYear(), today.getMonth(), 0);
      return { fromDate: fmt(f), toDate: fmt(l) };
    }
    case "Custom Range":
      return { fromDate: customFrom, toDate: customTo };
    case "Last 30 Days":
    default: {
      const f = new Date(today); f.setDate(f.getDate() - 29);
      return { fromDate: fmt(startOfDay(f)), toDate: fmt(startOfDay(today)) };
    }
  }
}

function fmtDateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

// ── SVG line chart — hand-plotted, no external chart library dependency ──
function LineChart({ points, height = 148 }) {
  const width = 640;
  if (!points || points.length === 0) {
    return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#a1a1aa", fontSize: 12 }}>No data for this range</div>;
  }
  const max = Math.max(...points, 1) * 1.15;
  const stepX = points.length > 1 ? width / (points.length - 1) : width;
  const coords = points.map((v, i) => [i * stepX, height - (v / max) * height]);
  const path = coords.map((c, i) => (i === 0 ? "M" : "L") + c[0].toFixed(1) + "," + c[1].toFixed(1)).join(" ");
  const areaPath = path + ` L${width},${height} L0,${height} Z`;
  const last = coords[coords.length - 1];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="hod-linechart" preserveAspectRatio="none">
      <defs>
        <linearGradient id="hodAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#hodAreaFill)" />
      <path d={path} fill="none" stroke="#0f172a" strokeWidth="2" />
      {coords.map((c, i) => (
        <circle key={i} cx={c[0]} cy={c[1]} r={i === coords.length - 1 ? 4 : 2.5} fill="#0f172a" stroke="#fff" strokeWidth="1.5" />
      ))}
      {last && (
        <g transform={`translate(${Math.max(0, last[0] - 44)}, ${Math.max(0, last[1] - 34)})`}>
          <rect width="88" height="22" rx="6" fill="#0f172a" />
          <text x="44" y="15" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff">
            {Math.round(points[points.length - 1]).toLocaleString()}
          </text>
        </g>
      )}
    </svg>
  );
}

function Donut({ segments, size = 132, stroke = 16, centerLabel, centerValue }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", border: `${stroke}px solid #f1f5f9`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: "#a1a1aa" }}>No data</span>
      </div>
    );
  }
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        {segments.map((s, i) => {
          const dash = (s.value / total) * c;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset} strokeLinecap="butt" />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{centerValue}</span>
        <span style={{ fontSize: 9.5, color: "#94a3b8", fontWeight: 600 }}>{centerLabel}</span>
      </div>
    </div>
  );
}

const PALETTE = ["#6366f1", "#8b5cf6", "#f59e0b", "#0d9488", "#ec4899", "#a1a1aa"];

function fmtCompact(n, code) {
  const num = Number(n) || 0;
  if (num >= 100000) return formatCurrency(num / 100000, code).replace(/[\d.,]+/, (m) => m) + "";
  return formatCurrency(num, code);
}

const HeadOfficeDashboardPage = () => {
  const { currencyCode } = useCurrency();
  const user = useMemo(() => getUser(), []);
  const isOwner = !!user && (!user.role || user.role === "OWNER") && user?.multiLocation === true;

  const [businessType, setBusinessType] = useState("");
  useEffect(() => {
    if (!isOwner || !user?.adminId) return;
    getBusinessInformation(user.adminId)
      .then((res) => { if (res?.data?.businessType) setBusinessType(res.data.businessType); })
      .catch(() => {}); // card just falls back to the generic default image
  }, [isOwner, user?.adminId]);

  const [filterOptions, setFilterOptions] = useState({ branches: [], cities: [], paymentMethods: [], orderTypes: [] });
  const [branchId, setBranchId] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderType, setOrderType] = useState("");
  const [datePreset, setDatePreset] = useState("Last 30 Days");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [trendTab, setTrendTab] = useState("Revenue");
  const [itemsTab, setItemsTab] = useState("By Quantity");
  const [branchSort, setBranchSort] = useState("Revenue");
  const [liveConnected, setLiveConnected] = useState(false);
  const refreshDebounceRef = useRef(null);

  const { fromDate, toDate } = useMemo(
    () => resolveDateRange(datePreset, customFrom, customTo),
    [datePreset, customFrom, customTo]
  );

  useEffect(() => {
    if (!isOwner) return;
    (async () => {
      try {
        const res = await getHeadOfficeFilterOptions();
        if (res.success) setFilterOptions(res.data);
      } catch { /* filter dropdowns just stay minimal — page still works */ }
    })();
  }, [isOwner]);

  const fetchAnalytics = useCallback(async () => {
    if (!isOwner) return;
    if (datePreset === "Custom Range" && (!customFrom || !customTo)) return;
    setLoading(true);
    setError("");
    try {
      const res = await getHeadOfficeAnalytics({ fromDate, toDate, branchId, city, paymentMethod, orderType });
      if (res.success) setData(res.data);
      else setError(res.message || "Could not load analytics.");
    } catch (e) {
      setError(e.response?.data?.message || "Could not load analytics.");
    } finally {
      setLoading(false);
    }
  }, [isOwner, fromDate, toDate, branchId, city, paymentMethod, orderType, datePreset, customFrom, customTo]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // ── Live updates — no manual refresh needed ──
  // Any new order or status change on any branch under this Head Office
  // broadcasts a lightweight "something changed" ping (not the analytics
  // payload itself — that's still computed by the real aggregation
  // endpoint, on demand). Debounced by 1.5s so a burst of orders arriving
  // together triggers one refetch, not one per event.
  const analyticsTopics = useMemo(
    () => (isOwner && user?.adminId ? [`/topic/head-office/${user.adminId}/analytics`] : []),
    [isOwner, user?.adminId]
  );
  useWebSocket({
    topics: analyticsTopics,
    enabled: isOwner,
    onMessage: () => {
      if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
      refreshDebounceRef.current = setTimeout(() => {
        fetchAnalytics();
      }, 1500);
    },
  });

  // The hook itself manages the actual socket connection/reconnection
  // silently (it doesn't expose raw connection state to consumers) — so
  // this reflects "subscribed and listening for live updates", which is
  // the accurate, honest signal to show rather than claiming a real-time
  // server handshake confirmation we don't actually have visibility into.
  useEffect(() => {
    setLiveConnected(analyticsTopics.length > 0);
  }, [analyticsTopics]);

  useEffect(() => {
    return () => { if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current); };
  }, []);

  const resetFilters = () => {
    setBranchId(""); setCity(""); setPaymentMethod(""); setOrderType(""); setDatePreset("Last 30 Days");
  };

  if (!isOwner) {
    return (
      <div className="hod-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f4efe3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Lock size={22} color="#8a6d3a" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#18181b", marginBottom: 6 }}>Head Office Only</div>
          <div style={{ fontSize: 12.5, color: "#71717a", lineHeight: 1.6 }}>
            This dashboard is only available to Head Office accounts with multiple branches.
            Branch logins and single-location merchants don't have access to combined
            business analytics.
          </div>
        </div>
      </div>
    );
  }

  const summary = data?.summary || { revenue: 0, orders: 0, customers: 0, avgOrderValue: 0 };
  const branches = data?.branches || [];
  const topBranch = branches[0];
  const topItems = itemsTab === "By Revenue" ? (data?.topItemsByRevenue || []) : (data?.topItemsByQuantity || []);
  const paymentMethods = data?.paymentMethods || [];
  const cityBreakdown = data?.cityBreakdown || [];
  const recentActivity = data?.recentActivity || [];
  const salesTrend = data?.salesTrend || [];

  const trendPoints = salesTrend.map(p =>
    trendTab === "Orders" ? p.orders : trendTab === "Customers" ? p.customers : Number(p.revenue)
  );
  const branchOrderBars = useMemo(() => {
    const sorted = [...branches].sort((a, b) => b.orders - a.orders).slice(0, 6);
    const max = sorted[0]?.orders || 1;
    return sorted.map(b => ({ ...b, pct: (b.orders / max) * 100 }));
  }, [branches]);

  const sortedBranches = useMemo(() => {
    const list = [...branches];
    if (branchSort === "Orders") return list.sort((a, b) => b.orders - a.orders);
    if (branchSort === "Name") return list.sort((a, b) => a.name.localeCompare(b.name));
    return list.sort((a, b) => b.revenue - a.revenue); // "Revenue" default
  }, [branches, branchSort]);

  const paymentDonutSegments = paymentMethods.map((p, i) => ({ name: p.gateway, value: p.sharePercent, color: PALETTE[i % PALETTE.length] }));
  const cityDonutSegments = cityBreakdown.map((c, i) => ({ name: c.city, value: c.sharePercent, color: PALETTE[i % PALETTE.length] }));

  const Dropdown = ({ id, icon: Icon, label, value, displayValue, options, onChange }) => (
    <div className="hod-filter">
      <span className="hod-filter-icon"><Icon size={15} /></span>
      <div className="hod-filter-body" onClick={() => setOpenDropdown(openDropdown === id ? null : id)}>
        <span className="hod-filter-label">{label}</span>
        <span className="hod-filter-value">{displayValue}</span>
      </div>
      <ChevronDown size={15} className="hod-filter-chevron" onClick={() => setOpenDropdown(openDropdown === id ? null : id)} />
      {openDropdown === id && (
        <div className="hod-dropdown-menu">
          {options.map(opt => (
            <div key={opt.value} className={`hod-dropdown-item${value === opt.value ? " active" : ""}`}
              onClick={() => { onChange(opt.value); setOpenDropdown(null); }}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="hod-root" onClick={() => openDropdown && setOpenDropdown(null)}>

      {/* ── Filters bar ── */}
      <div className="hod-filters-bar" onClick={(e) => e.stopPropagation()}>
        <Dropdown id="date" icon={Calendar} label="Date Range" value={datePreset} displayValue={datePreset}
          options={DATE_PRESETS.map(p => ({ value: p, label: p }))} onChange={setDatePreset} />
        {datePreset === "Custom Range" && (
          <>
            <input type="date" className="hod-date-input" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
            <input type="date" className="hod-date-input" value={customTo} onChange={e => setCustomTo(e.target.value)} />
          </>
        )}
        <Dropdown id="branch" icon={Building2} label="Branch" value={branchId}
          displayValue={branchId ? (filterOptions.branches.find(b => b.businessId === branchId)?.name || branchId) : "All Branches"}
          options={[{ value: "", label: "All Branches" }, ...filterOptions.branches.map(b => ({ value: b.businessId, label: b.name }))]}
          onChange={setBranchId} />
        <Dropdown id="city" icon={MapPin} label="City" value={city} displayValue={city || "All Cities"}
          options={[{ value: "", label: "All Cities" }, ...filterOptions.cities.map(c => ({ value: c, label: c }))]}
          onChange={setCity} />
        <Dropdown id="payment" icon={CreditCard} label="Payment Method" value={paymentMethod} displayValue={paymentMethod || "All Methods"}
          options={[{ value: "", label: "All Methods" }, ...filterOptions.paymentMethods.map(p => ({ value: p, label: p }))]}
          onChange={setPaymentMethod} />
        <Dropdown id="ordertype" icon={Compass} label="Order Type" value={orderType} displayValue={orderType || "All Types"}
          options={[{ value: "", label: "All Types" }, ...filterOptions.orderTypes.map(o => ({ value: o, label: o }))]}
          onChange={setOrderType} />
        <button className="hod-reset-btn" onClick={resetFilters}><RefreshCw size={14} /> Reset Filters</button>
      </div>

      {loading && !data ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "80px 0", color: "#a1a1aa", fontSize: 13 }}>
          <Loader2 size={18} style={{ animation: "hodSpin 0.7s linear infinite" }} /> Loading analytics...
          <style>{`@keyframes hodSpin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : error ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "80px 20px", textAlign: "center" }}>
          <AlertTriangle size={24} color="#ef4444" />
          <span style={{ fontSize: 13, color: "#52525b" }}>{error}</span>
          <button onClick={fetchAnalytics} className="hod-reset-btn" style={{ marginLeft: 0, background: "#18181b", color: "#fff", padding: "8px 16px", borderRadius: 8 }}>Try Again</button>
        </div>
      ) : (
        <>
          {/* ── KPI cards ── */}
          <div className="hod-kpi-row" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.15s" }}>
            <div className="hod-kpi-card">
              <div className="hod-kpi-icon c-blue"><Coins size={18} /></div>
              <div>
                <div className="hod-kpi-label">Total Revenue</div>
                <div className="hod-kpi-value">{formatCurrency(Number(summary.revenue), currencyCode)}</div>
                {summary.revenueChangePercent !== null && summary.revenueChangePercent !== undefined && (
                  <div className={`hod-kpi-delta ${summary.revenueChangePercent >= 0 ? "up" : "down"}`}>
                    {summary.revenueChangePercent >= 0 ? "↑" : "↓"} {Math.abs(summary.revenueChangePercent).toFixed(1)}% <span>vs previous period</span>
                  </div>
                )}
              </div>
            </div>
            <div className="hod-kpi-card">
              <div className="hod-kpi-icon c-purple"><Receipt size={18} /></div>
              <div>
                <div className="hod-kpi-label">Total Orders</div>
                <div className="hod-kpi-value">{Number(summary.orders).toLocaleString()}</div>
                {summary.ordersChangePercent !== null && summary.ordersChangePercent !== undefined && (
                  <div className={`hod-kpi-delta ${summary.ordersChangePercent >= 0 ? "up" : "down"}`}>
                    {summary.ordersChangePercent >= 0 ? "↑" : "↓"} {Math.abs(summary.ordersChangePercent).toFixed(1)}% <span>vs previous period</span>
                  </div>
                )}
              </div>
            </div>
            <div className="hod-kpi-card">
              <div className="hod-kpi-icon c-amber"><Users size={18} /></div>
              <div>
                <div className="hod-kpi-label">Total Customers</div>
                <div className="hod-kpi-value">{Number(summary.customers).toLocaleString()}</div>
                {summary.customersChangePercent !== null && summary.customersChangePercent !== undefined && (
                  <div className={`hod-kpi-delta ${summary.customersChangePercent >= 0 ? "up" : "down"}`}>
                    {summary.customersChangePercent >= 0 ? "↑" : "↓"} {Math.abs(summary.customersChangePercent).toFixed(1)}% <span>vs previous period</span>
                  </div>
                )}
              </div>
            </div>
            <div className="hod-kpi-card">
              <div className="hod-kpi-icon c-teal"><ShoppingCart size={18} /></div>
              <div>
                <div className="hod-kpi-label">Avg. Order Value</div>
                <div className="hod-kpi-value">{formatCurrency(Number(summary.avgOrderValue), currencyCode)}</div>
              </div>
            </div>
          </div>

          {/* ── Row 1 ── */}
          <div className="hod-grid" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.15s" }}>
            <div
              className="hod-card hod-top-branch"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(15,15,17,0.2), rgba(15,15,17,0.88)), url(${getCoverImage(businessType)})` }}
            >
              {topBranch ? (
                <>
                  <div className="hod-top-branch-badge"><Trophy size={13} /> Top Performing Branch</div>
                  <div className="hod-top-branch-name">{topBranch.name}</div>
                  <div className="hod-top-branch-revenue">{formatCurrency(Number(topBranch.revenue), currencyCode)}</div>
                  <div className="hod-top-branch-label">Total Revenue</div>
                  <div className="hod-top-branch-foot"><MapPin size={12} /> {topBranch.city || "—"} <span>· {topBranch.revenueSharePercent}% of total revenue</span></div>
                </>
              ) : (
                <div style={{ color: "#a1a1aa", fontSize: 12.5 }}>No branch data for this filter selection.</div>
              )}
            </div>

            <div className="hod-card hod-trend">
              <div className="hod-card-head">
                <div className="hod-card-title"><TrendingUp size={15} /> Revenue Trend<span className="hod-card-sub">Daily {trendTab.toLowerCase()}</span></div>
                <div className="hod-tab-group">
                  {["Revenue", "Orders", "Customers"].map(tb => (
                    <button key={tb} className={`hod-tab${trendTab === tb ? " active" : ""}`} onClick={() => setTrendTab(tb)}>{tb}</button>
                  ))}
                </div>
              </div>
              <LineChart points={trendPoints} />
              <div className="hod-trend-axis">
                {salesTrend.length > 0 && (
                  <>
                    <span>{fmtDateLabel(salesTrend[0]?.date)}</span>
                    <span>{fmtDateLabel(salesTrend[salesTrend.length - 1]?.date)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="hod-card hod-map">
              <div className="hod-card-head">
                <div className="hod-card-title"><Building2 size={15} /> Branch Overview<span className="hod-card-sub">No location coordinates on file yet — showing branch cards instead of a live map</span></div>
              </div>
              <div className="hod-branch-cards">
                {branches.slice(0, 4).map(b => (
                  <div key={b.businessId} className="hod-branch-card" onClick={() => setBranchId(b.businessId)}>
                    <div className="hod-branch-card-name">{b.name}</div>
                    <div className="hod-branch-card-rev">{formatCurrency(Number(b.revenue), currencyCode)}</div>
                    <div className="hod-branch-card-pct">{b.revenueSharePercent}% · {b.orders} orders</div>
                  </div>
                ))}
                {branches.length === 0 && <div style={{ fontSize: 12, color: "#a1a1aa", padding: "12px 0" }}>No branches to show.</div>}
              </div>
            </div>

            <div className="hod-card hod-topitems">
              <div className="hod-card-head">
                <div className="hod-card-title"><Crown size={15} /> Top Selling Items</div>
              </div>
              <div className="hod-tab-group full">
                {["By Quantity", "By Revenue"].map(tb => (
                  <button key={tb} className={`hod-tab${itemsTab === tb ? " active" : ""}`} onClick={() => setItemsTab(tb)}>{tb}</button>
                ))}
              </div>
              <div className="hod-item-list">
                {topItems.length === 0 && <div style={{ fontSize: 12, color: "#a1a1aa", padding: "10px 0" }}>No completed orders yet.</div>}
                {topItems.map((it, i) => (
                  <div className="hod-item-row" key={it.itemName + it.businessId + i}>
                    <span className="hod-item-rank">{i + 1}</span>
                    <div className="hod-item-thumb" />
                    <div className="hod-item-info">
                      <div className="hod-item-name">{it.itemName}</div>
                      <div className="hod-item-sub">{it.quantitySold} sold · {it.branchName}</div>
                    </div>
                    <div className="hod-item-right">
                      <div className="hod-item-revenue">{formatCurrency(Number(it.revenue), currencyCode)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 2 ── */}
          <div className="hod-grid hod-grid-row2" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.15s" }}>
            <div className="hod-card hod-payment">
              <div className="hod-card-head">
                <div className="hod-card-title"><CreditCard size={15} /> Payment Method Usage<span className="hod-card-sub">Share of successful transactions</span></div>
              </div>
              <div className="hod-payment-body">
                <Donut segments={paymentDonutSegments} centerValue={Number(summary.orders).toLocaleString()} centerLabel="Total Orders" />
                <div className="hod-legend">
                  {paymentMethods.length === 0 && <span style={{ fontSize: 11.5, color: "#a1a1aa" }}>No payment data yet.</span>}
                  {paymentMethods.map((p, i) => (
                    <div className="hod-legend-row" key={p.gateway}>
                      <span className="hod-legend-dot" style={{ background: PALETTE[i % PALETTE.length] }} />
                      <span className="hod-legend-name">{p.gateway}</span>
                      <span className="hod-legend-amount">{formatCurrency(Number(p.amount), currencyCode)}</span>
                      <span className="hod-legend-val">{p.sharePercent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hod-card hod-orders">
              <div className="hod-card-head">
                <div className="hod-card-title"><BarChart3 size={15} /> Orders by Branch<span className="hod-card-sub">Total orders count</span></div>
              </div>
              <div className="hod-bar-chart">
                {branchOrderBars.length === 0 && <div style={{ fontSize: 12, color: "#a1a1aa" }}>No order data yet.</div>}
                {branchOrderBars.map(b => (
                  <div className="hod-bar-col" key={b.businessId}>
                    <span className="hod-bar-value">{b.orders}</span>
                    <div className="hod-bar-track"><div className="hod-bar-fill" style={{ height: `${b.pct}%` }} /></div>
                    <span className="hod-bar-label">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hod-card hod-insights">
              <div className="hod-card-head">
                <div className="hod-card-title"><Lightbulb size={15} /> Quick Insights</div>
              </div>
              {topBranch && (
                <div className="hod-insight-row">
                  <span className="hod-insight-icon" style={{ background: "#eef2ff", color: "#4f46e5" }}><TrendingUp size={13} /></span>
                  <span className="hod-insight-text"><strong>{topBranch.name}</strong> generated the highest revenue ({topBranch.revenueSharePercent}% of total sales).</span>
                </div>
              )}
              {paymentMethods[0] && (
                <div className="hod-insight-row">
                  <span className="hod-insight-icon" style={{ background: "#f0fdfa", color: "#0d9488" }}><CreditCard size={13} /></span>
                  <span className="hod-insight-text"><strong>{paymentMethods[0].gateway}</strong> is the most used payment method ({paymentMethods[0].sharePercent}% of transactions).</span>
                </div>
              )}
              {topItems[0] && (
                <div className="hod-insight-row">
                  <span className="hod-insight-icon" style={{ background: "#fffbeb", color: "#d97706" }}><Crown size={13} /></span>
                  <span className="hod-insight-text"><strong>{topItems[0].itemName}</strong> is the top selling item ({topItems[0].quantitySold} sold).</span>
                </div>
              )}
              {!topBranch && !paymentMethods[0] && !topItems[0] && (
                <div style={{ fontSize: 12, color: "#a1a1aa", padding: "10px 13px" }}>Not enough data yet for insights.</div>
              )}
            </div>

            <div className="hod-card hod-recent">
               
            </div>
          </div>

          {/* ── Row 3 ── */}
          <div className="hod-grid hod-grid-row3" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.15s" }}>
            <div className="hod-card hod-table">
              <div className="hod-card-head">
                <div className="hod-card-title"><Building2 size={15} /> Branch-wise Performance<span className="hod-card-sub">Revenue and orders per branch</span></div>
              </div>
              <div className="hod-table-toolbar">
                <select className="hod-sort-select" value={branchSort} onChange={(e) => setBranchSort(e.target.value)}>
                  <option value="Revenue">Sort by Revenue</option>
                  <option value="Orders">Sort by Orders</option>
                  <option value="Name">Sort by Name</option>
                </select>
              </div>
              <table className="hod-perf-table">
                <thead>
                  <tr><th>Branch</th><th>City</th><th>Revenue</th><th>Orders</th><th>Avg. Order Value</th><th>Share</th></tr>
                </thead>
                <tbody>
                  {sortedBranches.length === 0 && <tr><td colSpan={6} style={{ padding: "16px", color: "#a1a1aa" }}>No branches to show for this filter.</td></tr>}
                  {sortedBranches.map(b => (
                    <tr key={b.businessId} onClick={() => setBranchId(b.businessId)} style={{ cursor: "pointer" }}>
                      <td className="strong">{b.name}</td>
                      <td>{b.city || "—"}</td>
                      <td>{formatCurrency(Number(b.revenue), currencyCode)}</td>
                      <td>{b.orders}</td>
                      <td>{formatCurrency(Number(b.avgOrderValue), currencyCode)}</td>
                      <td className="green">{b.revenueSharePercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="hod-card hod-citychart">
              <div className="hod-card-head">
                <div className="hod-card-title"><Lightbulb size={15} /> Revenue by City<span className="hod-card-sub">City wise contribution</span></div>
              </div>
              <div className="hod-payment-body">
                <Donut segments={cityDonutSegments} centerValue={formatCurrency(Number(summary.revenue), currencyCode)} centerLabel="Total Revenue" size={112} />
                <div className="hod-legend">
                  {cityBreakdown.length === 0 && <span style={{ fontSize: 11.5, color: "#a1a1aa" }}>No city data yet.</span>}
                  {cityBreakdown.map((c, i) => (
                    <div className="hod-legend-row" key={c.city}>
                      <span className="hod-legend-dot" style={{ background: PALETTE[i % PALETTE.length] }} />
                      <span className="hod-legend-name">{c.city}</span>
                      <span className="hod-legend-val">{c.sharePercent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HeadOfficeDashboardPage;