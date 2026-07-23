"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Check,
  Wallet,
  ShoppingBag,
  ReceiptText,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Download,
  Soup,
} from "lucide-react";

import "../designdashboardcomponent/designdashboardpage.css";
import adminOrderService from "../services/adminOrderService";
import { formatCurrency } from "../utils/currencyHelper";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function useOutsideClose(open, setOpen) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);
  return ref;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function sameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatShort(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const DATE_PRESETS = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last 30 Days",
  "This Month",
  "Last Month",
  "This Year",
];

function resolvePreset(label, anchor) {
  const end = new Date(anchor);
  const start = new Date(anchor);
  if (label === "Today") return [end, end];
  if (label === "Yesterday") {
    const y = new Date(end);
    y.setDate(y.getDate() - 1);
    return [y, y];
  }
  if (label === "Last 7 Days") {
    start.setDate(start.getDate() - 6);
    return [start, end];
  }
  if (label === "Last 30 Days") {
    start.setDate(start.getDate() - 29);
    return [start, end];
  }
  if (label === "This Month") {
    return [new Date(end.getFullYear(), end.getMonth(), 1), end];
  }
  if (label === "Last Month") {
    const s = new Date(end.getFullYear(), end.getMonth() - 1, 1);
    const e = new Date(end.getFullYear(), end.getMonth(), 0);
    return [s, e];
  }
  if (label === "This Year") {
    return [new Date(end.getFullYear(), 0, 1), end];
  }
  return [end, end];
}

// ── DATE / BUCKETING HELPERS ─────────────────────────────────
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function daysBetween(a, b) { return Math.max(1, Math.round((endOfDay(b) - startOfDay(a)) / 86400000) + 1); }

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.max(0, (Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 45) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function bucketGranularityFor(days, requested) {
  if (requested === "Monthly") return "Monthly";
  if (requested === "Weekly") return "Weekly";
  if (days > 31) return "Weekly";
  return "Daily";
}

function bucketKey(date, gran) {
  const d = new Date(date);
  if (gran === "Monthly") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  if (gran === "Weekly") {
    const day = startOfDay(d);
    day.setDate(day.getDate() - day.getDay());
    return day.toISOString().slice(0, 10);
  }
  return startOfDay(d).toISOString().slice(0, 10);
}

function bucketLabel(key, gran) {
  if (gran === "Monthly") {
    const [y, m] = key.split("-");
    return `${MONTH_NAMES[Number(m) - 1].slice(0, 3)} ${y}`;
  }
  const d = new Date(key);
  if (gran === "Weekly") return `Wk ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildRevenueSeries(ordersInRange, start, end, gran) {
  const map = new Map();
  ordersInRange.forEach((o) => {
    if (o.paymentStatus !== "PAID") return;
    const key = bucketKey(o.createdAt, gran);
    map.set(key, (map.get(key) || 0) + Number(o.grandTotal || 0));
  });
  const keys = [];
  if (gran === "Monthly") {
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cur <= last) { keys.push(bucketKey(cur, "Monthly")); cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1); }
  } else if (gran === "Weekly") {
    let cur = startOfDay(start); cur.setDate(cur.getDate() - cur.getDay());
    const last = startOfDay(end);
    while (cur <= last) { keys.push(bucketKey(cur, "Weekly")); cur = addDays(cur, 7); }
  } else {
    let cur = startOfDay(start);
    const last = startOfDay(end);
    while (cur <= last) { keys.push(bucketKey(cur, "Daily")); cur = addDays(cur, 1); }
  }
  const uniqKeys = Array.from(new Set(keys));
  const capped = uniqKeys.slice(-16); // compressed — max 16 bars
  return capped.map((k) => ({ key: k, label: bucketLabel(k, gran), value: map.get(k) || 0 }));
}

function buildSparklinePath(series, width = 1000, height = 110, padding = 8) {
  if (!series.length) return { path: "", lastX: width - padding, lastY: height - padding };
  const max = Math.max(...series.map((s) => s.value), 1);
  const stepX = (width - padding * 2) / Math.max(series.length - 1, 1);
  const points = series.map((s, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (s.value / max) * (height - padding * 2);
    return [x, y];
  });
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) d += ` L${points[i][0]} ${points[i][1]}`;
  const [lastX, lastY] = points[points.length - 1];
  return { path: d, lastX, lastY };
}

const METHOD_LABEL = { upi: "UPI", razorpay: "Cards", stripe: "Int'l Card", paypal: "PayPal", pay_at_counter: "Pay at Counter" };
const DONUT_COLORS = ["#4f46e5", "#0ea5e9", "#f59e0b", "#10b981", "#94a3b8", "#ec4899"];

const STATUS_META = {
  PLACED:    { label: "Placed",    color: "#f59e0b" },
  ACCEPTED:  { label: "Accepted",  color: "#0ea5e9" },
  PREPARING: { label: "Preparing", color: "#6366f1" },
  READY:     { label: "Ready",     color: "#8b5cf6" },
  COMPLETED: { label: "Completed", color: "#22c55e" },
  CANCELLED: { label: "Cancelled", color: "#ef4444" },
};

// ── SHARED DROPDOWN CONTROLS (unchanged) ─────────────────────
function InlineSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, setOpen);
  return (
    <div className="violet-select" ref={ref}>
      <button className="violet-trigger" onClick={() => setOpen((o) => !o)}>
        {value}
        <ChevronDown size={12} className="marigold-chevron" />
      </button>
      {open && (
        <div className="marigold-panel">
          {options.map((o) => (
            <button
              key={o}
              className={`marigold-item ${value === o ? "marigold-item--selected" : ""}`}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              <span className="marigold-check">{value === o && <Check size={12} />}</span>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, setOpen);
  return (
    <div className="marigold-wrap" ref={ref}>
      <button className="marigold-pill" onClick={() => setOpen((o) => !o)}>
        {value}
        <ChevronDown size={14} className="marigold-chevron" />
      </button>
      {open && (
        <div className="marigold-panel">
          {options.map((o) => (
            <button
              key={o}
              className={`marigold-item ${value === o ? "marigold-item--selected" : ""}`}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              <span className="marigold-check">{value === o && <Check size={13} />}</span>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CompareToggle({ value, onChange }) {
  const options = ["No Comparison", "Previous Period", "Previous Year"];
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, setOpen);
  const active = value !== "No Comparison";
  return (
    <div className="marigold-wrap" ref={ref}>
      <button
        className={`marigold-pill ${active ? "marigold-pill--active" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <RotateCcw size={14} />
        Compare
      </button>
      {open && (
        <div className="marigold-panel">
          {options.map((o) => (
            <button
              key={o}
              className={`marigold-item ${value === o ? "marigold-item--selected" : ""}`}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              <span className="marigold-check">{value === o && <Check size={13} />}</span>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DateRangeCalendar({ onApply }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [baseMonth, setBaseMonth] = useState(new Date(today.getFullYear(), today.getMonth() - 1, 1));
  const ref = useOutsideClose(open, setOpen);

  const pickDay = (day) => {
    if (!day) return;
    if (!start || (start && end)) {
      setStart(day);
      setEnd(null);
    } else if (day < start) {
      setStart(day);
    } else {
      setEnd(day);
    }
  };

  const applyPreset = (p) => {
    const [s, e] = resolvePreset(p, today);
    setStart(s);
    setEnd(e);
    setBaseMonth(new Date(s.getFullYear(), s.getMonth(), 1));
  };

  const apply = () => {
    if (start && end) {
      onApply({
        start: startOfDay(start),
        end: endOfDay(end),
        label: `${formatShort(start)} - ${formatShort(end)}`,
      });
      setOpen(false);
    }
  };

  const cancel = () => {
    setStart(null);
    setEnd(null);
    setOpen(false);
  };

  const leftMonth = baseMonth;
  const rightMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);

  const dayClasses = (day) => {
    if (!day) return "jasmine-day jasmine-day--muted";
    let cls = "jasmine-day";
    if (start && !end && sameDay(day, start)) return cls + " jasmine-day--edge";
    if (start && end) {
      if (sameDay(day, start) || sameDay(day, end)) return cls + " jasmine-day--edge";
      if (day > start && day < end) return cls + " jasmine-day--range";
    }
    return cls;
  };

  const renderMonth = (monthDate, showPrev, showNext) => {
    const weeks = buildMonthGrid(monthDate.getFullYear(), monthDate.getMonth());
    return (
      <div className="jasmine-month">
        <div className="jasmine-month-head">
          {showPrev ? (
            <button
              className="jasmine-nav"
              onClick={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1))}
            >
              <ChevronLeft size={14} />
            </button>
          ) : (
            <span className="jasmine-nav-spacer" />
          )}
          <span className="jasmine-month-title">
            {MONTH_NAMES[monthDate.getMonth()]} {monthDate.getFullYear()}
          </span>
          {showNext ? (
            <button
              className="jasmine-nav"
              onClick={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1))}
            >
              <ChevronRight size={14} />
            </button>
          ) : (
            <span className="jasmine-nav-spacer" />
          )}
        </div>
        <div className="jasmine-grid">
          {WEEKDAYS.map((w) => (
            <div key={w} className="jasmine-weekday">
              {w}
            </div>
          ))}
          {weeks.flat().map((day, i) => (
            <div key={i} className={dayClasses(day)} onClick={() => pickDay(day)}>
              {day ? day.getDate() : ""}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="jasmine-wrap" ref={ref}>
      <button className="jasmine-trigger" onClick={() => setOpen((o) => !o)}>
        Date range
      </button>
      {open && (
        <div className="jasmine-popover">
          <div className="jasmine-presets">
            {DATE_PRESETS.map((p) => (
              <button key={p} className="jasmine-preset" onClick={() => applyPreset(p)}>
                {p}
              </button>
            ))}
          </div>
          <div>
            <div className="jasmine-body">
              {renderMonth(leftMonth, true, false)}
              {renderMonth(rightMonth, false, true)}
            </div>
            <div className="jasmine-footer">
              <span className="jasmine-footer-text">
                {start ? formatShort(start) : "Start date"} – {end ? formatShort(end) : "End date"}
              </span>
              <div className="jasmine-footer-actions">
                <button className="jasmine-btn-ghost" onClick={cancel}>
                  Cancel
                </button>
                <button className="jasmine-btn-primary" onClick={apply} disabled={!start || !end}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────
export default function DashboardMainSetup() {
  const [userName, setUserName] = useState("there");
  const [currency, setCurrency] = useState("INR");

  // read the logged-in admin's name/currency only after mount (client-only)
  // to avoid SSR/client hydration mismatches from reading localStorage during render
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ttl_user") || "{}");
      if (stored.fullName) setUserName(stored.fullName.split(" ")[0]);
      if (stored.currencyCode) setCurrency(stored.currencyCode);
    } catch {}
  }, []);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastSync, setLastSync] = useState(null);

  const [grossLabel, setGrossLabel] = useState("Total Revenue");
  const [compareMetric, setCompareMetric] = useState("Yesterday");
  const [rangeLabel, setRangeLabel] = useState("Last 7 Days");
  const [customRange, setCustomRange] = useState(null);
  const [granularity, setGranularity] = useState("Daily");
  const [comparePeriod, setComparePeriod] = useState("No Comparison");
  const [previousPeriod, setPreviousPeriod] = useState("Previous Period");
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [barsGrown, setBarsGrown] = useState(false);

  const fetchOrders = async (silent) => {
    try {
      if (!silent) setLoading(true);
      setErrorMsg("");
      const res = await adminOrderService.getAllOrders();
      setOrders(Array.isArray(res?.data) ? res.data : []);
      setLastSync(new Date());
    } catch (e) {
      setErrorMsg("Unable to load live orders right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);
    const iv = setInterval(() => fetchOrders(true), 45000); // live refresh
    return () => clearInterval(iv);
  }, []);

  // ── date range resolution ──
  const range = useMemo(() => {
    if (customRange) return customRange;
    const [s, e] = resolvePreset(rangeLabel, new Date());
    return { start: startOfDay(s), end: endOfDay(e) };
  }, [rangeLabel, customRange]);

  const prevRange = useMemo(() => {
    const span = range.end.getTime() - range.start.getTime();
    const prevEnd = new Date(range.start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - span);
    return { start: prevStart, end: prevEnd };
  }, [range]);

  const inRange = (o, r) => {
    const t = new Date(o.createdAt).getTime();
    return t >= r.start.getTime() && t <= r.end.getTime();
  };

  const filteredOrders = useMemo(() => orders.filter((o) => inRange(o, range)), [orders, range]);
  const prevOrders = useMemo(() => orders.filter((o) => inRange(o, prevRange)), [orders, prevRange]);

  // ── KPIs ──
  const paidOrders = filteredOrders.filter((o) => o.paymentStatus === "PAID");
  const prevPaid = prevOrders.filter((o) => o.paymentStatus === "PAID");

  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.grandTotal || 0), 0);
  const prevRevenue = prevPaid.reduce((s, o) => s + Number(o.grandTotal || 0), 0);
  const totalOrdersCount = filteredOrders.length;
  const prevOrdersCount = prevOrders.length;
  const avgOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0;
  const prevAvgOrderValue = prevPaid.length ? prevRevenue / prevPaid.length : 0;
  const completedCount = filteredOrders.filter((o) => o.orderStatus === "COMPLETED").length;
  const completionRate = totalOrdersCount ? (completedCount / totalOrdersCount) * 100 : 0;
  const prevCompletedCount = prevOrders.filter((o) => o.orderStatus === "COMPLETED").length;
  const prevCompletionRate = prevOrdersCount ? (prevCompletedCount / prevOrdersCount) * 100 : 0;

  const pctChange = (cur, prev) => {
    if (!prev) return cur > 0 ? 100 : 0;
    return ((cur - prev) / prev) * 100;
  };

  const kpis = [
    { key: "revenue", label: "Total Revenue", icon: Wallet, value: formatCurrency(totalRevenue.toFixed(2), currency), trend: pctChange(totalRevenue, prevRevenue) },
    { key: "orders", label: "Total Orders", icon: ShoppingBag, value: totalOrdersCount.toLocaleString(), trend: pctChange(totalOrdersCount, prevOrdersCount) },
    { key: "aov", label: "Avg Order Value", icon: ReceiptText, value: formatCurrency(avgOrderValue.toFixed(2), currency), trend: pctChange(avgOrderValue, prevAvgOrderValue) },
    { key: "completion", label: "Completion Rate", icon: CheckCircle2, value: `${completionRate.toFixed(0)}%`, trend: pctChange(completionRate, prevCompletionRate) },
  ];

  // ── top summary card values ──
  const grossValue = grossLabel === "Total Orders"
    ? totalOrdersCount.toLocaleString()
    : grossLabel === "Avg Order Value"
    ? formatCurrency(avgOrderValue.toFixed(2), currency)
    : formatCurrency(totalRevenue.toFixed(2), currency);

  const compareValue = useMemo(() => {
    const [s, e] = resolvePreset(compareMetric === "Last 7 days" ? "Last 7 Days" : compareMetric, new Date());
    const r = { start: startOfDay(s), end: endOfDay(e) };
    const rev = orders.filter((o) => o.paymentStatus === "PAID" && inRange(o, r)).reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);
    return formatCurrency(rev.toFixed(2), currency);
  }, [compareMetric, orders, currency]);

  const thisMonthRevenue = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return orders.filter((o) => o.paymentStatus === "PAID" && new Date(o.createdAt) >= start).reduce((s, o) => s + Number(o.grandTotal || 0), 0);
  }, [orders]);

  const pendingAmount = useMemo(
    () => orders.filter((o) => o.paymentStatus === "PAY_AT_COUNTER" || o.paymentStatus === "PENDING").reduce((s, o) => s + Number(o.grandTotal || 0), 0),
    [orders]
  );

  // ── sparkline (last 14 days, always) ──
  const sparkline = useMemo(() => {
    const end = endOfDay(new Date());
    const start = startOfDay(addDays(end, -13));
    return buildRevenueSeries(orders.filter((o) => inRange(o, { start, end })), start, end, "Daily");
  }, [orders]);
  const sparklinePath = useMemo(() => buildSparklinePath(sparkline), [sparkline]);

  // ── revenue chart (respects selected range + granularity) ──
  const effectiveGranularity = bucketGranularityFor(daysBetween(range.start, range.end), granularity);
  const revenueSeries = useMemo(() => buildRevenueSeries(filteredOrders, range.start, range.end, effectiveGranularity), [filteredOrders, range, effectiveGranularity]);
  const maxRevenueBar = Math.max(...revenueSeries.map((s) => s.value), 1);
  const hasRevenue = revenueSeries.some((s) => s.value > 0);

  useEffect(() => {
    setBarsGrown(false);
    const t = setTimeout(() => setBarsGrown(true), 60);
    return () => clearTimeout(t);
  }, [revenueSeries]);

  // ── top selling items ──
  const topItems = useMemo(() => {
    const map = new Map();
    filteredOrders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.productName || "Item";
        const cur = map.get(key) || { name: key, qty: 0, revenue: 0, category: it.categoryName || "", image: it.productImageUrl || null };
        cur.qty += Number(it.quantity || 0);
        cur.revenue += Number(it.lineTotal || Number(it.unitPrice || 0) * Number(it.quantity || 0));
        if (!cur.image && it.productImageUrl) cur.image = it.productImageUrl;
        map.set(key, cur);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [filteredOrders]);
  const maxTopQty = Math.max(...topItems.map((i) => i.qty), 1);

  // ── payment method breakdown ──
  const paymentBreakdown = useMemo(() => {
    const map = new Map();
    filteredOrders.forEach((o) => {
      const key = o.paymentMethod || "other";
      const cur = map.get(key) || { key, label: METHOD_LABEL[key] || (key ? key.replace(/_/g, " ") : "Other"), count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += Number(o.grandTotal || 0);
      map.set(key, cur);
    });
    const total = filteredOrders.length || 1;
    return Array.from(map.values()).map((x) => ({ ...x, pct: (x.count / total) * 100 })).sort((a, b) => b.count - a.count);
  }, [filteredOrders]);

  const donutGradient = useMemo(() => {
    let acc = 0;
    const stops = paymentBreakdown.map((x, i) => {
      const start = acc; acc += x.pct;
      return `${DONUT_COLORS[i % DONUT_COLORS.length]} ${start}% ${acc}%`;
    });
    return stops.length ? `conic-gradient(${stops.join(",")})` : "conic-gradient(#e2e8f0 0% 100%)";
  }, [paymentBreakdown]);

  // ── business health / order status breakdown ──
  const statusBreakdown = useMemo(() => {
    const buckets = {};
    Object.keys(STATUS_META).forEach((k) => (buckets[k] = 0));
    filteredOrders.forEach((o) => { const s = o.orderStatus || "PLACED"; buckets[s] = (buckets[s] || 0) + 1; });
    return buckets;
  }, [filteredOrders]);
  const statusTotal = Object.values(statusBreakdown).reduce((a, b) => a + b, 0) || 1;

  // ── recent live orders feed ──
  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [orders]
  );

  const exportCSV = () => {
    const header = ["Order Number", "Customer", "Items", "Amount", "Payment", "Status", "Date"];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.customerName || "Guest",
      (o.items || []).reduce((s, i) => s + Number(i.quantity || 0), 0),
      Number(o.grandTotal || 0).toFixed(2),
      METHOD_LABEL[o.paymentMethod] || o.paymentMethod || "-",
      o.orderStatus,
      new Date(o.createdAt).toLocaleString(),
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${rangeLabel.replace(/\s+/g, "-").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="meadow-root">
      <div className="meadow-header-row">
        <h1 className="meadow-greeting">
          {getGreeting()}, <span className="meadow-greeting-name">{userName}</span> <span>👋</span>
        </h1>
        <div className="meadow-live">
          <span className="pearl-dot" />
          Live · Updated {lastSync ? lastSync.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
        </div>
      </div>

      {errorMsg && (
        <div className="banner-error">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}

      {/* ── KPI ROW ── */}
      <div className="kpi-grid">
        {kpis.map((k) => {
          const Icon = k.icon;
          const up = k.trend >= 0;
          return (
            <div className="kpi-card" key={k.key}>
              <div className="kpi-icon"><Icon size={18} /></div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{loading ? "—" : k.value}</div>
              <div className={`kpi-trend ${up ? "kpi-trend--up" : "kpi-trend--down"}`}>
                {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(k.trend).toFixed(1)}%
                <span className="kpi-trend-sub">vs previous</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="orchid-card">
        <div className="orchid-metrics">
          <div>
            <InlineSelect
              value={grossLabel}
              options={["Total Revenue", "Total Orders", "Avg Order Value"]}
              onChange={setGrossLabel}
            />
            <div className="orchid-metric-value">{loading ? "—" : grossValue}</div>
            <div className="orchid-metric-time">
              {lastSync ? `Updated ${lastSync.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` : "Syncing..."}
            </div>
          </div>
          <div>
            <InlineSelect
              value={compareMetric}
              options={["Yesterday", "Today", "Last 7 days"]}
              onChange={setCompareMetric}
            />
            <div className="orchid-metric-value">{loading ? "—" : compareValue}</div>
          </div>
        </div>

        <div className="orchid-chart">
          <svg viewBox="0 0 1000 110" preserveAspectRatio="none">
            {sparklinePath.path && (
              <>
                <path d={sparklinePath.path} stroke="#6366f1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <circle cx={sparklinePath.lastX} cy={sparklinePath.lastY} r="5" fill="#6366f1" />
              </>
            )}
          </svg>
        </div>
        <div className="orchid-chart-axis">
          <span>{sparkline[0] ? sparkline[0].label : ""}</span>
          <span>{sparkline.length ? sparkline[sparkline.length - 1].label : ""}</span>
        </div>

        <div className="orchid-balance-row">
          <div className="orchid-balance-col">
            <div className="orchid-balance-head">
              <span className="orchid-balance-label">This Month Revenue</span>
            </div>
            <div className="orchid-balance-amount">{formatCurrency(thisMonthRevenue.toFixed(2), currency)}</div>
          </div>
          <div className="orchid-balance-col">
            <div className="orchid-balance-head">
              <span className="orchid-balance-label">Pending Payments</span>
            </div>
            <div className="orchid-balance-amount" style={{ color: pendingAmount > 0 ? "#f59e0b" : "#94a3b8" }}>
              {formatCurrency(pendingAmount.toFixed(2), currency)}
            </div>
          </div>
        </div>
      </div>

      <div className="tulip-grid">
        <div className="tulip-col-left">
          <div className="tulip-card">
            <h2 className="tulip-title">Your overview</h2>
            <div className="tulip-filters">
              <div className="tulip-filter-group">
                <DateRangeCalendar
                  onApply={({ start, end, label }) => {
                    setCustomRange({ start, end });
                    setRangeLabel(label);
                  }}
                />
                <SelectDropdown
                  value={rangeLabel}
                  options={["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "This Month", "Last Month", "This Year"]}
                  onChange={(v) => { setRangeLabel(v); setCustomRange(null); }}
                />
                <SelectDropdown value={granularity} options={["Daily", "Weekly", "Monthly"]} onChange={setGranularity} />
                <CompareToggle value={comparePeriod} onChange={setComparePeriod} />
                <SelectDropdown
                  value={previousPeriod}
                  options={["Previous Period", "Previous Year", "Custom Period"]}
                  onChange={setPreviousPeriod}
                />
              </div>
              <div className="tulip-actions">
                <button className="marigold-pill" onClick={() => fetchOrders(true)} disabled={loading}>
                  <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
                </button>
                <button className="marigold-pill" onClick={exportCSV} disabled={!filteredOrders.length}>
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            <div className="tulip-summary">
              <span className="tulip-summary-amount">{formatCurrency(totalRevenue.toFixed(2), currency)}</span>
              <span className="tulip-summary-sub">{totalOrdersCount} orders · {effectiveGranularity} view</span>
            </div>

            {loading ? (
              <div className="tulip-empty"><Loader2 size={18} className="spin" /> Loading orders...</div>
            ) : !hasRevenue ? (
              <div className="tulip-empty">No revenue yet for this period</div>
            ) : (
              <div className="revbar-wrap">
                <div className="revbar-track">
                  {revenueSeries.map((s) => (
                    <div className="revbar-col" key={s.key} title={`${s.label}: ${formatCurrency(s.value.toFixed(2), currency)}`}>
                      <div
                        className="revbar-bar"
                        style={{ height: barsGrown ? `${Math.max(3, (s.value / maxRevenueBar) * 100)}%` : "0%" }}
                      />
                      <span className="revbar-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="iris-card">
            <div className="iris-head">
              <h3 className="iris-title">Top Selling Items</h3>
              <span className="iris-static-tag">{rangeLabel}</span>
            </div>
            {loading ? (
              <div className="tulip-empty" style={{ height: 120 }}><Loader2 size={16} className="spin" /></div>
            ) : topItems.length === 0 ? (
              <div className="tulip-empty" style={{ height: 120 }}>No items sold in this period</div>
            ) : (
              topItems.map((it, i) => (
                <div className="topitem-row" key={it.name}>
                  <span className={`topitem-rank ${i < 3 ? `topitem-rank--${i + 1}` : ""}`}>{i + 1}</span>
                  <div className="topitem-avatar">
                    {it.image ? <img src={it.image} alt={it.name} /> : <Soup size={16} />}
                  </div>
                  <div className="topitem-info">
                    <div className="topitem-name">{it.name}</div>
                    <div className="topitem-bar-track">
                      <div className="topitem-bar-fill" style={{ width: barsGrown ? `${(it.qty / maxTopQty) * 100}%` : "0%" }} />
                    </div>
                  </div>
                  <div className="topitem-stats">
                    <span className="topitem-qty">{it.qty} sold</span>
                    <span className="topitem-amount">{formatCurrency(it.revenue.toFixed(2), currency)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="iris-card">
            <div className="iris-head">
              <h3 className="iris-title">Recent Orders</h3>
              <span className="pearl-live"><span className="pearl-dot pearl-dot--sm" /> Live</span>
            </div>
            {loading ? (
              <div className="tulip-empty" style={{ height: 120 }}><Loader2 size={16} className="spin" /></div>
            ) : recentOrders.length === 0 ? (
              <div className="tulip-empty" style={{ height: 120 }}>No orders yet</div>
            ) : (
              recentOrders.map((o) => {
                const meta = STATUS_META[o.orderStatus] || STATUS_META.PLACED;
                return (
                  <div className="recent-row" key={o.orderId}>
                    <div className="recent-avatar">{(o.customerName || "G")[0].toUpperCase()}</div>
                    <div className="recent-info">
                      <div className="recent-name">{o.customerName || "Guest"} · #{o.orderNumber}</div>
                      <div className="recent-meta">{(o.items || []).length} items · {timeAgo(o.createdAt)}</div>
                    </div>
                    <div className="recent-right">
                      <span className="recent-amount">{formatCurrency(Number(o.grandTotal || 0).toFixed(2), currency)}</span>
                      <span className="recent-badge" style={{ color: meta.color, background: `${meta.color}1A` }}>{meta.label}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="peony-stack">
          <div className="iris-card">
            <div className="iris-head">
              <h3 className="iris-title">Payment Methods</h3>
            </div>
            {loading ? (
              <div className="tulip-empty" style={{ height: 120 }}><Loader2 size={16} className="spin" /></div>
            ) : paymentBreakdown.length === 0 ? (
              <div className="tulip-empty" style={{ height: 120 }}>No payments yet</div>
            ) : (
              <div className="donut-wrap">
                <div className="donut-ring" style={{ background: donutGradient }}>
                  <div className="donut-center">
                    <span className="donut-center-value">{filteredOrders.length}</span>
                    <span className="donut-center-label">orders</span>
                  </div>
                </div>
                <div className="donut-legend">
                  {paymentBreakdown.map((p, i) => (
                    <div className="donut-legend-row" key={p.key}>
                      <span className="donut-dot" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="donut-legend-label">{p.label}</span>
                      <span className="donut-legend-pct">{p.pct.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="iris-card">
            <div className="iris-head">
              <h3 className="iris-title">Business Health</h3>
            </div>
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const count = statusBreakdown[key] || 0;
              const pct = (count / statusTotal) * 100;
              return (
                <div className="health-row" key={key}>
                  <span className="health-label">{meta.label}</span>
                  <div className="health-bar-track">
                    <div className="health-bar-fill" style={{ width: barsGrown ? `${pct}%` : "0%", background: meta.color }} />
                  </div>
                  <span className="health-count">{count}</span>
                </div>
              );
            })}
          </div>

          {showRecommendations && (
            <div className="peony-card">
              <div className="peony-head">
                <h3 className="peony-title">Recommendations</h3>
                <button className="peony-close" onClick={() => setShowRecommendations(false)}>
                  <X size={15} />
                </button>
              </div>
              <p className="peony-text">
                Sell products, offer subscriptions, and collect tips or donations by creating a link—no code required.
              </p>
              <button className="peony-link">Create payment link</button>
              <div className="peony-divider" />
              <p className="peony-text">
                Offer subscriptions to drive predictable recurring revenue streams.
              </p>
              <button className="peony-link">Create a subscription</button>
            </div>
          )}

          <div className="iris-card">
            <div className="iris-head">
              <h3 className="iris-title">API keys</h3>
              <button className="iris-link">View docs</button>
            </div>
            <div className="iris-row">
              <span className="iris-label">Publishable key</span>
              <span className="iris-value">pk_test_51TnN162KHtN...</span>
            </div>
            <div className="iris-row">
              <span className="iris-label">Secret key</span>
              <span className="iris-value">sk_test_51TnN162KHtN...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}