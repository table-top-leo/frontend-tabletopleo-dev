"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Store, Trash2, CreditCard, TrendingUp, ArrowUpRight,
  Globe, CheckCircle2, Clock, UserPlus, ShieldAlert, Loader2,
} from "lucide-react";
import platformMerchantService from "../platformMerchantService";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

// Real subscription_status values from the backend: FREE, ACTIVE,
// PENDING_PAYMENT, EXPIRED. A merchant with no subscription row yet
// (hasn't been assigned one by ops) is treated as FREE — same as
// paymentRequired = false meaning "always free, no restrictions".
const SUBSCRIPTION_STATUSES = ["FREE", "ACTIVE", "PENDING_PAYMENT", "EXPIRED"];

export default function OverviewTab({ onNavigate }) {
  const [merchants, setMerchants] = useState([]);
  const [deletions, setDeletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [merchantsRes, deletionsRes] = await Promise.all([
          platformMerchantService.getAllMerchants(),
          platformMerchantService.getAllDeletionRequests(),
        ]);
        if (cancelled) return;
        if (merchantsRes?.success) setMerchants(merchantsRes.data || []);
        else setError(merchantsRes?.message || "Failed to load merchants.");
        if (deletionsRes?.success) setDeletions(deletionsRes.data || []);
        else setError((prev) => prev || deletionsRes?.message || "Failed to load deletion requests.");
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load platform data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const active = merchants.filter((m) => m.accountStatus === "ACTIVE").length;
    const pendingDeletions = deletions.filter((d) => d.status === "PENDING").length;
    const paidMerchants = merchants.filter(
      (m) => m.paymentRequired === true && m.subscriptionStatus === "ACTIVE"
    );
    const mrr = paidMerchants.reduce((sum, m) => sum + Number(m.subscriptionAmount || 0), 0);
    return { active, pendingDeletions, paidCount: paidMerchants.length, mrr };
  }, [merchants, deletions]);

  const planBreakdown = useMemo(() => {
    const total = merchants.length || 1;
    return SUBSCRIPTION_STATUSES.map((status) => {
      const count = merchants.filter((m) => (m.subscriptionStatus || "FREE") === status).length;
      return { plan: status, count, pct: Math.round((count / total) * 100) };
    });
  }, [merchants]);

  const countryBreakdown = useMemo(() => {
    const map = {};
    merchants.forEach((m) => {
      if (!m.country) return;
      map[m.country] = (map[m.country] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [merchants]);

  const recentJoins = useMemo(
    () => [...merchants].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
    [merchants]
  );

  // Deletion requests don't carry businessName from the backend — look it
  // up from the merchants list by businessId, falling back to the raw ID.
  const businessNameById = useMemo(() => {
    const map = {};
    merchants.forEach((m) => { if (m.businessId) map[m.businessId] = m.businessName; });
    return map;
  }, [merchants]);

  const recentDeletions = useMemo(
    () => [...deletions].sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)).slice(0, 3),
    [deletions]
  );

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 10, color: "var(--ttlp-text-muted, #6b7280)" }}>
        <Loader2 size={20} style={{ animation: "spin 0.8s linear infinite" }} />
        <span>Loading platform data...</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>Couldn't load platform data</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="ttlp-stats-grid">
        <StatCard
          label="Total Merchants"
          value={merchants.length}
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
          trend={merchants.length ? `${Math.round((stats.active / merchants.length) * 100)}% of total` : "—"}
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
            {recentJoins.length === 0 && recentDeletions.length === 0 && (
              <div style={{ padding: "16px 0", fontSize: 13, color: "#9ca3af" }}>No recent activity yet.</div>
            )}
            {recentJoins.map((m) => (
              <div key={m.adminId} className="ttlp-activity-item">
                <div className="ttlp-activity-icon" style={{ background: "var(--ttlp-accent-tint)", color: "var(--ttlp-accent)" }}>
                  <Store size={14} />
                </div>
                <div>
                  <div className="ttlp-activity-text">
                    <strong>{m.businessName || m.fullName || m.adminId}</strong> joined the platform
                    {m.subscriptionStatus && <> on the <strong>{m.subscriptionStatus}</strong> plan</>}
                  </div>
                  <div className="ttlp-activity-time">
                    {formatDate(m.createdAt)}{m.city && m.country ? ` · ${m.city}, ${m.country}` : ""}
                  </div>
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
                    <strong>{businessNameById[d.businessId] || d.businessId}</strong> requested account deletion
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
              <div className="ttlp-panel-title"><TrendingUp size={15} /> Subscription Status</div>
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
            {countryBreakdown.length === 0 && (
              <div style={{ padding: "8px 0", fontSize: 12.5, color: "#9ca3af" }}>No business location data yet.</div>
            )}
            {countryBreakdown.map(([country, count]) => (
              <div key={country} className="ttlp-minibar-row">
                <span className="ttlp-minibar-label">{country}</span>
                <div className="ttlp-minibar-track">
                  <div className="ttlp-minibar-fill" style={{ width: `${Math.round((count / merchants.length) * 100)}%`, background: "var(--ttlp-gold)" }} />
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