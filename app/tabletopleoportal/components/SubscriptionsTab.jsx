"use client";
import { useMemo, useState } from "react";
import {
  Search, CreditCard, X, TrendingUp, Users, AlertTriangle, Wallet,
} from "lucide-react";
import { FaCrown } from "react-icons/fa";
import { SUBSCRIPTIONS, formatDate } from "../data";

const STATUS_CFG = {
  ACTIVE:    { label: "Active",    cls: "ttlp-badge-green" },
  TRIAL:     { label: "Trial",     cls: "ttlp-badge-amber" },
  PAST_DUE:  { label: "Past Due",  cls: "ttlp-badge-red" },
  CANCELLED: { label: "Cancelled", cls: "ttlp-badge-slate" },
};

export default function SubscriptionsTab() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const summary = useMemo(() => {
    const paid = SUBSCRIPTIONS.filter((s) => s.plan !== "Free");
    const activePaid = paid.filter((s) => s.status === "ACTIVE");
    const mrr = activePaid.reduce((s, c) => s + c.mrr, 0);
    const pastDue = SUBSCRIPTIONS.filter((s) => s.status === "PAST_DUE").length;
    return {
      totalSubs: SUBSCRIPTIONS.length,
      paidSubs: paid.length,
      mrr,
      pastDue,
    };
  }, []);

  const filtered = useMemo(() => {
    return SUBSCRIPTIONS.filter((s) => {
      if (plan !== "ALL" && s.plan !== plan) return false;
      if (status !== "ALL" && s.status !== status) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!`${s.businessName} ${s.businessId} ${s.adminId}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, plan, status]);

  const hasFilters = plan !== "ALL" || status !== "ALL" || !!search;

  return (
    <>
      <div className="ttlp-stats-grid">
        <MiniStat label="Total Subscriptions" value={summary.totalSubs} color="var(--ttlp-accent)" bg="var(--ttlp-accent-tint)" icon={Users} />
        <MiniStat label="Paid Subscribers" value={summary.paidSubs} color="var(--ttlp-gold)" bg="var(--ttlp-gold-tint)" icon={FaCrown} />
        <MiniStat label="Monthly Recurring Revenue" value={`$${summary.mrr.toLocaleString()}`} color="var(--ttlp-green)" bg="var(--ttlp-green-bg)" icon={Wallet} />
        <MiniStat label="Past Due" value={summary.pastDue} color="var(--ttlp-red)" bg="var(--ttlp-red-bg)" icon={AlertTriangle} />
      </div>

      <div className="ttlp-panel">
        <div className="ttlp-panel-head">
          <div>
            <div className="ttlp-panel-title"><CreditCard size={15} /> Subscriptions &amp; Billing</div>
            <div className="ttlp-panel-sub">Plan and payment status across every merchant</div>
          </div>
        </div>

        <div className="ttlp-filter-row">
          <div className="ttlp-filter-search">
            <Search size={13} />
            <input placeholder="Search business, admin ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="ttlp-select" value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="ALL">All Plans</option>
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <select className="ttlp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Trial</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {hasFilters && (
            <button className="ttlp-chip-clear" onClick={() => { setSearch(""); setPlan("ALL"); setStatus("ALL"); }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <div className="ttlp-table-wrap">
          <table className="ttlp-table">
            <thead>
              <tr>
                <th className="ttlp-th">Business</th>
                <th className="ttlp-th">Business ID</th>
                <th className="ttlp-th">Admin ID</th>
                <th className="ttlp-th">Plan</th>
                <th className="ttlp-th">MRR</th>
                <th className="ttlp-th">Started</th>
                <th className="ttlp-th">Renews</th>
                <th className="ttlp-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="ttlp-empty">
                      <CreditCard size={28} color="var(--ttlp-ink-mute)" strokeWidth={1.5} style={{ margin: "0 auto" }} />
                      <div className="ttlp-empty-title">No subscriptions match these filters</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const st = STATUS_CFG[s.status];
                  return (
                    <tr key={s.businessId} className="ttlp-row">
                      <td className="ttlp-td ttlp-strong">{s.businessName}</td>
                      <td className="ttlp-td"><span className="ttlp-mono">{s.businessId}</span></td>
                      <td className="ttlp-td"><span className="ttlp-mono" title={s.adminId}>{s.adminId.slice(0, 8)}…</span></td>
                      <td className="ttlp-td">
                        <span className={`ttlp-badge ${s.plan === "Enterprise" ? "ttlp-badge-gold" : s.plan === "Pro" ? "ttlp-badge-green" : "ttlp-badge-slate"}`}>
                          {s.plan === "Enterprise" && <FaCrown size={9} />} {s.plan}
                        </span>
                      </td>
                      <td className="ttlp-td ttlp-strong">{s.mrr === 0 ? "—" : `$${s.mrr}/mo`}</td>
                      <td className="ttlp-td">{formatDate(s.startedAt)}</td>
                      <td className="ttlp-td">{s.status === "CANCELLED" ? "—" : formatDate(s.renewsAt)}</td>
                      <td className="ttlp-td">
                        <span className={`ttlp-badge ${st.cls}`}><span className="ttlp-badge-dot" />{st.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value, color, bg, icon: Icon }) {
  return (
    <div className="ttlp-stat-card">
      <div className="ttlp-stat-top">
        <span className="ttlp-stat-label">{label}</span>
        <div className="ttlp-stat-icon" style={{ background: bg }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div className="ttlp-stat-value">{value}</div>
    </div>
  );
}
