"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Search, Calendar, ChevronDown, X, RefreshCw, SlidersHorizontal,
  CheckCircle2, Clock, XCircle, Loader2, Smartphone, CreditCard, Globe,
  Store, Banknote, ChevronLeft, ChevronRight, Inbox, Wallet,
} from "lucide-react";
import { MdOutlinePayments } from "react-icons/md";

import adminOrderService from "../services/adminOrderService";
import { useCurrency } from "../context/CurrencyContext";
import { formatCurrency } from "../utils/currencyHelper";
import "../adminpaymentscomponent/AdminPayments.css";
import { useLanguage } from "../context/LanguageContext";


const ITEMS_PER_PAGE = 8;

function buildStatusCfg(t) {
  return {
    PAID:           { label: t("ap_status_paid"),     cls: "apay-status-paid" },
    PENDING:        { label: t("ap_status_pending"),  cls: "apay-status-pending" },
    FAILED:         { label: t("ap_status_failed"),   cls: "apay-status-failed" },
    PAY_AT_COUNTER: { label: t("ap_status_progress"), cls: "apay-status-progress" },
  };
}

function buildStatusTabs(t) {
  return [
    { key: "ALL",            label: t("ap_tab_all") },
    { key: "PAID",           label: t("ap_status_paid") },
    { key: "PENDING",        label: t("ap_status_pending") },
    { key: "PAY_AT_COUNTER", label: t("ap_status_progress") },
    { key: "FAILED",         label: t("ap_status_failed") },
  ];
}

function buildMethodCfg(t) {
  return {
    upi:            { label: t("ap_method_upi"),         icon: Smartphone },
    razorpay:       { label: t("ap_method_razorpay"),     icon: CreditCard },
    stripe:         { label: t("ap_method_stripe"),       icon: Globe },
    paypal:         { label: t("ap_method_paypal"),       icon: Globe },
    pay_at_counter: { label: t("ap_method_pay_counter"),  icon: Store },
    cash:           { label: t("ap_method_cash"),         icon: Banknote },
  };
}

function buildMethodOptions(t) {
  return [
    { key: "ALL",            label: t("ap_method_all") },
    { key: "upi",             label: t("ap_method_upi") },
    { key: "razorpay",        label: t("ap_method_cards_netbanking") },
    { key: "stripe",          label: t("ap_method_intl_card") },
    { key: "pay_at_counter",  label: t("ap_method_pay_counter") },
  ];
}

const AVATAR_PALETTE = [
  { bg: "#EEE9FE", fg: "#6D3FD6" },
  { bg: "#E1F1FF", fg: "#116FCC" },
  { bg: "#E4F8EC", fg: "#0F8C4C" },
  { bg: "#FFF2DE", fg: "#B9770E" },
  { bg: "#FDE9EA", fg: "#C0362F" },
  { bg: "#E7EAFE", fg: "#4A4FC4" },
];

function toDateInputValue(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateShort(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${day} ${month} ${year} · ${time}`;
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function avatarPalette(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function useOutsideClose(ref, onClose) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

export default function AdminPayments() {
  const { t } = useLanguage();
  const STATUS_CFG = buildStatusCfg(t);
  const STATUS_TABS = buildStatusTabs(t);
  const METHOD_CFG = buildMethodCfg(t);
  const METHOD_OPTIONS = buildMethodOptions(t);
  const { currencyCode } = useCurrency();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [search, setSearch]       = useState("");
  const [statusTab, setStatusTab] = useState("ALL");
  const [methodFilter, setMethod] = useState("ALL");
  const [page, setPage]           = useState(1);

  const today = new Date();
  const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
  const [draftFrom, setDraftFrom] = useState(toDateInputValue(monthAgo));
  const [draftTo, setDraftTo]     = useState(toDateInputValue(today));
  const [appliedFrom, setAppliedFrom] = useState(toDateInputValue(monthAgo));
  const [appliedTo, setAppliedTo]     = useState(toDateInputValue(today));

  const [dateOpen, setDateOpen]     = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);

  const dateRef = useRef(null);
  const methodRef = useRef(null);
  useOutsideClose(dateRef, () => setDateOpen(false));
  useOutsideClose(methodRef, () => setMethodOpen(false));

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminOrderService.getAllOrders();
      if (res.success) {
        setOrders(res.data || []);
      } else {
        setError(res.message || t("ap_couldnt_load"));
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || t("ap_couldnt_load"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // ── Filtering ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const fromTs = appliedFrom ? new Date(appliedFrom + "T00:00:00").getTime() : null;
    const toTs   = appliedTo   ? new Date(appliedTo + "T23:59:59").getTime()   : null;

    return orders.filter((o) => {
      if (statusTab !== "ALL" && (o.paymentStatus || "PENDING") !== statusTab) return false;
      if (methodFilter !== "ALL" && o.paymentMethod !== methodFilter) return false;

      if (fromTs || toTs) {
        const ts = o.createdAt ? new Date(o.createdAt).getTime() : null;
        if (ts == null) return false;
        if (fromTs && ts < fromTs) return false;
        if (toTs && ts > toTs) return false;
      }

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${o.orderNumber || ""} ${o.orderId || ""} ${o.customerName || ""} ${o.customerPhone || ""} ${o.customerEmail || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusTab, methodFilter, appliedFrom, appliedTo, search]);

  useEffect(() => { setPage(1); }, [statusTab, methodFilter, appliedFrom, appliedTo, search]);

  // ── Stats — computed for the applied date range, independent of status/method/search filters ──
  const stats = useMemo(() => {
    const fromTs = appliedFrom ? new Date(appliedFrom + "T00:00:00").getTime() : null;
    const toTs   = appliedTo   ? new Date(appliedTo + "T23:59:59").getTime()   : null;
    const inRange = orders.filter((o) => {
      const ts = o.createdAt ? new Date(o.createdAt).getTime() : null;
      if (fromTs && (ts == null || ts < fromTs)) return false;
      if (toTs && (ts == null || ts > toTs)) return false;
      return true;
    });
    const sum = (arr) => arr.reduce((s, o) => s + Number(o.grandTotal || 0), 0);
    const paid   = inRange.filter((o) => o.paymentStatus === "PAID");
    const pend   = inRange.filter((o) => (o.paymentStatus || "PENDING") === "PENDING");
    const prog   = inRange.filter((o) => o.paymentStatus === "PAY_AT_COUNTER");
    const failed = inRange.filter((o) => o.paymentStatus === "FAILED");
    return {
      totalAmount: sum(inRange), totalCount: inRange.length,
      paidAmount: sum(paid),     paidCount: paid.length,
      pendAmount: sum(pend),     pendCount: pend.length,
      progAmount: sum(prog),     progCount: prog.length,
      failedCount: failed.length,
    };
  }, [orders, appliedFrom, appliedTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageRows = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setStatusTab("ALL");
    setMethod("ALL");
    setSearch("");
    setDraftFrom(toDateInputValue(monthAgo));
    setDraftTo(toDateInputValue(today));
    setAppliedFrom(toDateInputValue(monthAgo));
    setAppliedTo(toDateInputValue(today));
  };

  const applyDateRange = () => {
    setAppliedFrom(draftFrom);
    setAppliedTo(draftTo);
    setDateOpen(false);
  };

  const rangeLabel = `${appliedFrom || "…"}  →  ${appliedTo || "…"}`;

  // Compact page-number list around the current page (max 5 visible)
  const pageNumbers = useMemo(() => {
    const span = 5;
    let start = Math.max(1, page - Math.floor(span / 2));
    let end = Math.min(totalPages, start + span - 1);
    start = Math.max(1, end - span + 1);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  const hasActiveFilters = statusTab !== "ALL" || methodFilter !== "ALL" || !!search;

  return (
    <div className="apay-root">
      {/* ── Header ── */}
      <div className="apay-header">
        <div className="apay-header-left">
          <div className="apay-logo">
            <MdOutlinePayments color="#fff" size={26} />
          </div>
          <div>
            <h1 className="apay-title">{t("ap_title")}</h1>
            <p className="apay-subtitle">{t("ap_subtitle")}</p>
          </div>
        </div>
        <button className="apay-refresh-btn" onClick={loadOrders}>
          <RefreshCw size={15} className={loading ? "apay-spin" : ""} /> {t("ap_refresh")}
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="apay-stats-grid">
        <StatCard
          label={t("ap_stat_total_volume")}
          icon={Wallet}
          amount={formatCurrency(stats.totalAmount, currencyCode)}
          sub={`${stats.totalCount} ${t("ap_orders_word")}`}
          featured
        />
        <StatCard
          label={t("ap_stat_paid")}
          icon={CheckCircle2}
          amount={formatCurrency(stats.paidAmount, currencyCode)}
          sub={`${stats.paidCount} ${stats.paidCount === 1 ? t("ap_payment_word") : t("ap_payments_word")}`}
        />
        <StatCard
          label={t("ap_stat_pending")}
          icon={Clock}
          amount={formatCurrency(stats.pendAmount, currencyCode)}
          sub={`${stats.pendCount} ${stats.pendCount === 1 ? t("ap_payment_word") : t("ap_payments_word")}`}
        />
        <StatCard
          label={t("ap_stat_progress")}
          icon={Loader2}
          amount={formatCurrency(stats.progAmount, currencyCode)}
          sub={`${stats.progCount} ${t("ap_pay_at_counter_word")}`}
        />
        <StatCard
          label={t("ap_stat_failed")}
          icon={XCircle}
          amount={String(stats.failedCount)}
          sub={t("ap_payments_word")}
        />
      </div>

      {/* ── Panel: filters + table ── */}
      <div className="apay-panel">
        {/* Row 1 — status tabs + search */}
        <div className="apay-filter-row1">
          <div className="apay-tabs">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`apay-tab ${statusTab === tab.key ? "apay-active" : ""}`}
                onClick={() => setStatusTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="apay-spacer" />

          <div className="apay-search-wrap">
            <Search size={16} className="apay-search-icon" />
            <input
              className="apay-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("ap_search_ph")}
            />
          </div>
        </div>

        {/* Row 2 — date range / method / clear */}
        <div className="apay-filter-row2">
          <div className="apay-dropdown" ref={dateRef}>
            <button className="apay-dd-btn" onClick={() => setDateOpen((o) => !o)}>
              <Calendar size={15} className="apay-dd-icon" />
              {rangeLabel}
              <ChevronDown size={15} className="apay-dd-icon" />
            </button>
            {dateOpen && (
              <div className="apay-dd-panel apay-dd-date">
                <div className="apay-dd-title">{t("ap_select_date_range")}</div>
                <div className="apay-date-row">
                  <div className="apay-date-field">
                    <label className="apay-date-field-label">{t("ap_from")}</label>
                    <input
                      type="date"
                      className="apay-date-input"
                      value={draftFrom}
                      max={draftTo}
                      onChange={(e) => setDraftFrom(e.target.value)}
                    />
                  </div>
                  <div className="apay-date-field">
                    <label className="apay-date-field-label">{t("ap_to")}</label>
                    <input
                      type="date"
                      className="apay-date-input"
                      value={draftTo}
                      min={draftFrom}
                      max={toDateInputValue(today)}
                      onChange={(e) => setDraftTo(e.target.value)}
                    />
                  </div>
                </div>
                <div className="apay-dd-actions">
                  <button className="apay-btn-text" onClick={() => setDateOpen(false)}>{t("cancel")}</button>
                  <button className="apay-btn-dark" onClick={applyDateRange}>{t("ap_apply")}</button>
                </div>
              </div>
            )}
          </div>

          <div className="apay-dropdown" ref={methodRef}>
            <button className="apay-dd-btn" onClick={() => setMethodOpen((o) => !o)}>
              <SlidersHorizontal size={15} className="apay-dd-icon" />
              {METHOD_OPTIONS.find((m) => m.key === methodFilter)?.label}
              <ChevronDown size={15} className="apay-dd-icon" />
            </button>
            {methodOpen && (
              <div className="apay-dd-panel apay-dd-method">
                {METHOD_OPTIONS.map((m) => (
                  <button
                    key={m.key}
                    className={`apay-method-item ${methodFilter === m.key ? "apay-active" : ""}`}
                    onClick={() => { setMethod(m.key); setMethodOpen(false); }}
                  >
                    {m.label}
                    {methodFilter === m.key && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button className="apay-clear-btn" onClick={clearFilters}>
              <X size={14} /> {t("ap_clear_filters")}
            </button>
          )}

          <div className="apay-spacer" />
          <div className="apay-count-text">
            {t("ap_showing")} <span className="apay-count-strong">{filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}
            –{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> {t("ap_of")} <span className="apay-count-strong">{filtered.length}</span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="apay-table-wrap">
          <table className="apay-table">
            <thead>
              <tr>
                <th className="apay-th">{t("ap_th_customer")}</th>
                <th className="apay-th">{t("ap_th_order_id")}</th>
                <th className="apay-th">{t("ap_th_method")}</th>
                <th className="apay-th apay-right">{t("ap_th_amount")}</th>
                <th className="apay-th">{t("ap_th_status")}</th>
                <th className="apay-th">{t("ap_th_created_on")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="apay-row">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="apay-td">
                        <div className="apay-skel-bar" style={{ width: j === 0 ? "70%" : "50%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="apay-state">
                    <XCircle className="apay-state-icon" size={36} color="#d33a3a" />
                    <div className="apay-state-title">{t("ap_couldnt_load")}</div>
                    <div className="apay-state-sub">{error}</div>
                    <button className="apay-retry-btn" onClick={loadOrders}>{t("ap_try_again")}</button>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="apay-state">
                    <Inbox className="apay-state-icon" size={40} strokeWidth={1.5} color="#c5c9d0" />
                    <div className="apay-state-title">{t("ap_no_payment_found")}</div>
                    <div className="apay-state-sub">{t("ap_no_payment_sub")}</div>
                  </td>
                </tr>
              ) : (
                pageRows.map((o) => {
                  const st = STATUS_CFG[o.paymentStatus] || STATUS_CFG.PENDING;
                  const method = METHOD_CFG[o.paymentMethod];
                  const MethodIcon = method?.icon;
                  const pal = avatarPalette(o.customerName || o.orderId || "G");
                  return (
                    <tr key={o.orderId} className="apay-row">
                      <td className="apay-td">
                        <div className="apay-cust-cell">
                          <div className="apay-avatar" style={{ background: pal.bg, color: pal.fg }}>
                            {initials(o.customerName || t("ap_guest"))}
                          </div>
                          <div>
                            <div className="apay-cust-name">{o.customerName || t("ap_guest")}</div>
                            <div className="apay-cust-sub">{o.customerPhone || o.customerEmail || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="apay-td">
                        <div className="apay-order-id">{o.orderNumber || o.orderId}</div>
                        <div className="apay-order-type">{o.orderType === "DINE_IN" ? t("ap_dine_in") : t("ap_take_away")}</div>
                      </td>
                      <td className="apay-td">
                        {method ? (
                          <div className="apay-method-cell">
                            <MethodIcon size={15} />
                            {method.label}
                          </div>
                        ) : (
                          <span className="apay-method-none">—</span>
                        )}
                      </td>
                      <td className="apay-td apay-right">
                        <span className="apay-amount">{formatCurrency(o.grandTotal || 0, currencyCode)}</span>
                      </td>
                      <td className="apay-td">
                        <span className={`apay-status-pill ${st.cls}`}>
                          <span className="apay-status-dot" />
                          {st.label}
                        </span>
                      </td>
                      <td className="apay-td">
                        <span className="apay-date-cell">{formatDateShort(o.createdAt)}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination — Previous / Next ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="apay-pagination">
            <div className="apay-page-info">
              {t("ap_page")} <strong>{page}</strong> {t("ap_of")} <strong>{totalPages}</strong>
            </div>

            <div className="apay-page-controls">
              <button
                className="apay-nav-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> {t("ap_previous")}
              </button>

              <div className="apay-page-nums">
                {pageNumbers[0] > 1 && <span className="apay-page-ellipsis">…</span>}
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    className={`apay-page-num ${n === page ? "apay-active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                {pageNumbers[pageNumbers.length - 1] < totalPages && <span className="apay-page-ellipsis">…</span>}
              </div>

              <button
                className="apay-nav-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t("ap_next")} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, icon: Icon, amount, sub, featured }) {
  return (
    <div className={`apay-stat-card ${featured ? "apay-featured" : ""}`}>
      <div className="apay-stat-top">
        <span className="apay-stat-label">{label}</span>
        <div className="apay-stat-icon" style={{ background: featured ? undefined : "#f1f2f5" }}>
          <Icon size={17} color={featured ? "#fff" : "#5b616e"} />
        </div>
      </div>
      <div className="apay-stat-value">{amount}</div>
      <div className="apay-stat-sub">{sub}</div>
    </div>
  );
}
