"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Trash2, X, CheckCircle2, XCircle, Clock, MessageSquareText, Loader2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6163";
 
const ADMIN_PORTAL_KEY = "change-me";
 
const STATUS_CFG = {
  REQUESTED: { label: "Requested",   cls: "ttlp-badge-amber", icon: Clock },
  PENDING:   { label: "In Progress", cls: "ttlp-badge-amber", icon: Clock },
  CANCELLED: { label: "Cancelled",   cls: "ttlp-badge-slate", icon: XCircle },
  DELETED:   { label: "Deleted",     cls: "ttlp-badge-red",   icon: CheckCircle2 },
};

const DROPDOWN_OPTIONS = [
  { value: "PENDING",   label: "In Progress" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "DELETED",   label: "Deleted" },
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DeletionRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [savingId, setSavingId] = useState(null);

  const loadRequests = () => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/api/account-deletion/all`, {
      headers: { "X-Admin-Portal-Key": ADMIN_PORTAL_KEY },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setRequests(json.data || []);
        else setError(json.message || "Failed to load deletion requests");
      })
      .catch(() => setError("Failed to load deletion requests — is the backend running?"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, []);

  const counts = useMemo(() => ({
    inProgress: requests.filter((d) => d.status === "PENDING" || d.status === "REQUESTED").length,
    cancelled: requests.filter((d) => d.status === "CANCELLED").length,
    deleted: requests.filter((d) => d.status === "DELETED").length,
  }), [requests]);

  const filtered = useMemo(() => {
    return requests
      .filter((d) => {
        if (status === "ALL") return true;
        if (status === "PENDING") return d.status === "PENDING" || d.status === "REQUESTED";
        return d.status === status;
      })
      .filter((d) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return `${d.requestId} ${d.adminId} ${d.businessId || ""} ${d.reason || ""}`.toLowerCase().includes(q);
      });
  }, [requests, search, status]);

  const hasFilters = status !== "ALL" || !!search;

  const handleStatusChange = async (req, newStatus) => {
    const previous = requests;
    setRequests((prev) => prev.map((r) => (r.requestId === req.requestId ? { ...r, status: newStatus } : r)));
    setSavingId(req.requestId);
    try {
      const res = await fetch(`${API_BASE}/api/account-deletion/${req.requestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Portal-Key": ADMIN_PORTAL_KEY,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "Failed to update status");
      // Use the server's authoritative response (it also sets deletedAt/cancelledAt)
      setRequests((prev) => prev.map((r) => (r.requestId === req.requestId ? json.data : r)));
    } catch (e) {
      setRequests(previous); // revert — e.g. backend correctly refuses to change a terminal status
      setError(e.message || "Failed to update status");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <div className="ttlp-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <MiniStat label="In Progress" value={counts.inProgress} color="var(--ttlp-amber)" bg="var(--ttlp-amber-bg)" icon={Clock} />
        <MiniStat label="Cancelled" value={counts.cancelled} color="var(--ttlp-slate)" bg="var(--ttlp-slate-bg)" icon={XCircle} />
        <MiniStat label="Deleted" value={counts.deleted} color="var(--ttlp-red)" bg="var(--ttlp-red-bg)" icon={CheckCircle2} />
      </div>

      <div className="ttlp-panel">
        <div className="ttlp-panel-head">
          <div>
            <div className="ttlp-panel-title"><Trash2 size={15} /> Account Deletion Requests</div>
            <div className="ttlp-panel-sub">Live from the database — merchants who have asked to close their TableTop Leo account</div>
          </div>
        </div>

        <div className="ttlp-filter-row">
          <div className="ttlp-filter-search">
            <Search size={13} />
            <input placeholder="Search request ID, admin ID, business ID, reason..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="ttlp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="PENDING">In Progress</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="DELETED">Deleted</option>
          </select>
          {hasFilters && (
            <button className="ttlp-chip-clear" onClick={() => { setSearch(""); setStatus("ALL"); }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <div className="ttlp-table-wrap">
          <table className="ttlp-table">
            <thead>
              <tr>
                <th className="ttlp-th">Request ID</th>
                <th className="ttlp-th">Admin ID</th>
                <th className="ttlp-th">Business ID</th>
                <th className="ttlp-th">Requested On</th>
                <th className="ttlp-th">Reason</th>
                <th className="ttlp-th">Scheduled / Days Left</th>
                <th className="ttlp-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="ttlp-empty"><Loader2 size={26} style={{ animation: "ttlpDelSpin 0.8s linear infinite", margin: "0 auto" }} /></div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7}>
                    <div className="ttlp-empty">
                      <div className="ttlp-empty-title" style={{ color: "var(--ttlp-red)" }}>{error}</div>
                      <div className="ttlp-empty-sub">Make sure the backend is running on port 6163</div>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="ttlp-empty">
                      <Trash2 size={28} color="var(--ttlp-ink-mute)" strokeWidth={1.5} style={{ margin: "0 auto" }} />
                      <div className="ttlp-empty-title">No deletion requests found</div>
                      <div className="ttlp-empty-sub">Try a different filter</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const isTerminal = d.status === "CANCELLED" || d.status === "DELETED";
                  return (
                    <tr key={d.requestId} className="ttlp-row">
                      <td className="ttlp-td"><span className="ttlp-mono">{d.requestId}</span></td>
                      <td className="ttlp-td"><span className="ttlp-mono" title={d.adminId}>{(d.adminId || "").slice(0, 10)}…</span></td>
                      <td className="ttlp-td">{d.businessId ? <span className="ttlp-mono">{d.businessId}</span> : <span style={{ color: "var(--ttlp-ink-mute)" }}>—</span>}</td>
                      <td className="ttlp-td">{formatDate(d.requestedAt)}</td>
                      <td className="ttlp-td" style={{ maxWidth: 220 }}>
                        <span style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                          <MessageSquareText size={12} style={{ marginTop: 2, flexShrink: 0, color: "var(--ttlp-ink-mute)" }} />
                          {d.reason}
                        </span>
                      </td>
                      <td className="ttlp-td" style={{ fontSize: 11.5 }}>
                        {d.status === "DELETED" ? `Deleted ${formatDate(d.deletedAt)}`
                          : d.status === "CANCELLED" ? `Cancelled ${formatDate(d.cancelledAt)}`
                          : `${formatDate(d.scheduledDeletionAt)} (${d.daysRemaining ?? "—"}d left)`}
                      </td>
                      <td className="ttlp-td">
                        <StatusDropdown
                          value={d.status === "REQUESTED" ? "PENDING" : d.status}
                          disabled={isTerminal}
                          saving={savingId === d.requestId}
                          onChange={(newStatus) => handleStatusChange(d, newStatus)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes ttlpDelSpin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

function StatusDropdown({ value, disabled, saving, onChange }) {
  const cfg = STATUS_CFG[value] || STATUS_CFG.PENDING;
  const dotColor = {
    "ttlp-badge-amber": "var(--ttlp-amber)",
    "ttlp-badge-slate": "var(--ttlp-slate)",
    "ttlp-badge-red": "var(--ttlp-red)",
  }[cfg.cls];

  if (disabled) {
    return (
      <span className={`ttlp-badge ${cfg.cls}`}><span className="ttlp-badge-dot" />{cfg.label}</span>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span style={{ position: "absolute", left: 10, width: 6, height: 6, borderRadius: "50%", background: dotColor, pointerEvents: "none" }} />
      <select
        value={value}
        disabled={saving}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none", WebkitAppearance: "none",
          padding: "5px 26px 5px 22px", borderRadius: 999,
          border: "1px solid var(--ttlp-border)", background: "var(--ttlp-surface)",
          fontSize: 11.5, fontWeight: 700, color: "var(--ttlp-ink)",
          cursor: saving ? "wait" : "pointer", opacity: saving ? 0.6 : 1, outline: "none",
        }}
      >
        {DROPDOWN_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {saving && (
        <Loader2 size={12} style={{ position: "absolute", right: 8, animation: "ttlpDelSpin 0.8s linear infinite", color: "var(--ttlp-ink-mute)" }} />
      )}
    </div>
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
