"use client";
import { useMemo } from "react";
import {
  Store, Users, Trash2, CreditCard, TrendingUp, ArrowUpRight,
  Globe, CheckCircle2, Clock, UserPlus, ShieldAlert,
} from "lucide-react";
import { MERCHANTS, DELETION_REQUESTS, SUBSCRIPTIONS, formatDate } from "../data";

export default function OverviewTab({ onNavigate }) {
  const stats = useMemo(() => {
    const active = MERCHANTS.filter((m) => m.status === "ACTIVE").length;
    const pendingDeletions = DELETION_REQUESTS.filter((d) => d.status === "PENDING").length;
    const paidSubs = SUBSCRIPTIONS.filter((s) => s.status === "ACTIVE" && s.plan !== "Free");
    const mrr = paidSubs.reduce((sum, s) => sum + s.mrr, 0);
    return { active, pendingDeletions, paidCount: paidSubs.length, mrr };
  }, []);

  const planBreakdown = useMemo(() => {
    const total = MERCHANTS.length;
    return ["Free", "Pro", "Enterprise"].map((plan) => {
      const count = MERCHANTS.filter((m) => m.plan === plan).length;
      return { plan, count, pct: Math.round((count / total) * 100) };
    });
  }, []);

  const countryBreakdown = useMemo(() => {
    const map = {};
    MERCHANTS.forEach((m) => { map[m.country] = (map[m.country] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, []);

  const recentJoins = useMemo(
    () => [...MERCHANTS].sort((a, b) => b.joinedAt - a.joinedAt).slice(0, 3),
    []
  );
  const recentDeletions = useMemo(
    () => [...DELETION_REQUESTS].sort((a, b) => b.requestedAt - a.requestedAt).slice(0, 3),
    []
  );

  return (
    <>
      <div className="ttlp-stats-grid">
        <StatCard
          label="Total Merchants"
          value={MERCHANTS.length}
          icon={Store}
          color="var(--ttlp-accent)"
          bg="var(--ttlp-accent-tint)"
          trend={`${stats.active} active`}
          trendType="up"
        />
        <StatCard
          label="Active Merchants"
          value={stats.active}
          icon={CheckCircle2}
          color="var(--ttlp-green)"
          bg="var(--ttlp-green-bg)"
          trend={`${Math.round((stats.active / MERCHANTS.length) * 100)}% of total`}
          trendType="mute"
        />
        <StatCard
          label="Pending Deletions"
          value={stats.pendingDeletions}
          icon={Trash2}
          color="var(--ttlp-red)"
          bg="var(--ttlp-red-bg)"
          trend="Needs review"
          trendType="down"
          onClick={() => onNavigate?.("deletions")}
        />
        <StatCard
          label="Monthly Recurring Revenue"
          value={`$${stats.mrr.toLocaleString()}`}
          icon={CreditCard}
          color="var(--ttlp-gold)"
          bg="var(--ttlp-gold-tint)"
          trend={`${stats.paidCount} paid subscribers`}
          trendType="up"
          onClick={() => onNavigate?.("subscriptions")}
        />
      </div>

      <div className="ttlp-grid-2">
        <div className="ttlp-panel" style={{ marginBottom: 16 }}>
          <div className="ttlp-panel-head">
            <div>
              <div className="ttlp-panel-title"><UserPlus size={15} /> Recent Merchant Activity</div>
              <div className="ttlp-panel-sub">Latest onboarding and account changes</div>
            </div>
          </div>
          <div style={{ padding: "6px 20px 14px" }}>
            {recentJoins.map((m) => (
              <div key={m.businessId} className="ttlp-activity-item">
                <div className="ttlp-activity-icon" style={{ background: "var(--ttlp-accent-tint)", color: "var(--ttlp-accent)" }}>
                  <Store size={14} />
                </div>
                <div>
                  <div className="ttlp-activity-text">
                    <strong>{m.businessName}</strong> joined the platform on the <strong>{m.plan}</strong> plan
                  </div>
                  <div className="ttlp-activity-time">{formatDate(m.joinedAt)} · {m.city}, {m.country}</div>
                </div>
              </div>
            ))}
            {recentDeletions.map((d) => (
              <div key={d.requestId} className="ttlp-activity-item">
                <div className="ttlp-activity-icon" style={{ background: "var(--ttlp-red-bg)", color: "var(--ttlp-red)" }}>
                  <ShieldAlert size={14} />
                </div>
                <div>
                  <div className="ttlp-activity-text">
                    <strong>{d.businessName}</strong> requested account deletion
                  </div>
                  <div className="ttlp-activity-time">{formatDate(d.requestedAt)} · {d.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ttlp-panel" style={{ marginBottom: 16 }}>
          <div className="ttlp-panel-head">
            <div>
              <div className="ttlp-panel-title"><TrendingUp size={15} /> Plan Distribution</div>
            </div>
          </div>
          <div style={{ padding: "10px 20px 6px" }}>
            {planBreakdown.map((p) => (
              <div key={p.plan} className="ttlp-minibar-row">
                <span className="ttlp-minibar-label">{p.plan}</span>
                <div className="ttlp-minibar-track">
                  <div className="ttlp-minibar-fill" style={{ width: `${p.pct}%` }} />
                </div>
                <span className="ttlp-minibar-value">{p.count}</span>
              </div>
            ))}
          </div>

          <div className="ttlp-panel-head" style={{ borderTop: "1px solid var(--ttlp-border-soft)" }}>
            <div className="ttlp-panel-title" style={{ fontSize: 13 }}><Globe size={14} /> Merchants by Country</div>
          </div>
          <div style={{ padding: "10px 20px 18px" }}>
            {countryBreakdown.map(([country, count]) => (
              <div key={country} className="ttlp-minibar-row">
                <span className="ttlp-minibar-label">{country}</span>
                <div className="ttlp-minibar-track">
                  <div className="ttlp-minibar-fill" style={{ width: `${Math.round((count / MERCHANTS.length) * 100)}%`, background: "var(--ttlp-gold)" }} />
                </div>
                <span className="ttlp-minibar-value">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, trend, trendType, onClick }) {
  return (
    <div className="ttlp-stat-card" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className="ttlp-stat-top">
        <span className="ttlp-stat-label">{label}</span>
        <div className="ttlp-stat-icon" style={{ background: bg }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <div className="ttlp-stat-value">{value}</div>
      <div className={`ttlp-stat-trend ${trendType === "mute" ? "" : trendType}`}>
        {trendType === "up" && <ArrowUpRight size={12} />}
        {trendType === "down" && <Clock size={12} />}
        <span className={trendType === "mute" ? "ttlp-stat-trend-mute" : ""}>{trend}</span>
      </div>
    </div>
  );
}
