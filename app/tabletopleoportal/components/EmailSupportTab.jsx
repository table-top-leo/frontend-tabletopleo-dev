"use client";
import { useEffect, useMemo, useState, Fragment } from "react";
import {
  Search, Mail, X, Loader2, Paperclip, ChevronDown, ChevronUp,
  AlertCircle, Clock, CheckCircle2, XCircle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.tabletopleo.com";

const STATUS_CFG = {
  OPEN:        { label: "Open",         cls: "ttlp-badge-amber", icon: Clock },
  IN_PROGRESS: { label: "In Progress",  cls: "ttlp-badge-slate", icon: Loader2 },
  RESOLVED:    { label: "Resolved",     cls: "ttlp-badge-green", icon: CheckCircle2 },
  CLOSED:      { label: "Closed",       cls: "ttlp-badge-slate", icon: XCircle },
};

const PRIORITY_CFG = {
  High:   { cls: "ttlp-badge-red" },
  Medium: { cls: "ttlp-badge-amber" },
  Low:    { cls: "ttlp-badge-green" },
};

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function EmailSupportTab() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/api/platform/support-tickets`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setTickets(json.data || []);
        else setError(json.message || "Failed to load tickets");
      })
      .catch(() => setError("Failed to load tickets — is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length,
    high: tickets.filter((t) => t.priority === "High" && t.status === "OPEN").length,
  }), [tickets]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (status !== "ALL" && t.status !== status) return false;
      if (priority !== "ALL" && t.priority !== priority) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${t.subject} ${t.ticketId} ${t.adminId} ${t.businessId || ""} ${t.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, search, status, priority]);

  const hasFilters = status !== "ALL" || priority !== "ALL" || !!search;

  const handleStatusChange = async (ticketId, newStatus) => {
    const previous = tickets;
    // optimistic update — UI reflects the change immediately
    setTickets((prev) => prev.map((t) => (t.ticketId === ticketId ? { ...t, status: newStatus } : t)));
    setSavingId(ticketId);
    try {
      const res = await fetch(`${API_BASE}/api/platform/support-tickets/${ticketId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "Failed to update status");
    } catch (e) {
      // revert on failure so the dropdown never lies about what's saved
      setTickets(previous);
      setError(e.message || "Failed to update status");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <div className="ttlp-stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <MiniStat label="Open" value={counts.open} color="var(--ttlp-amber)" bg="var(--ttlp-amber-bg)" icon={Clock} />
        <MiniStat label="In Progress" value={counts.inProgress} color="var(--ttlp-accent)" bg="var(--ttlp-accent-tint)" icon={Loader2} />
        <MiniStat label="Resolved / Closed" value={counts.resolved} color="var(--ttlp-green)" bg="var(--ttlp-green-bg)" icon={CheckCircle2} />
        <MiniStat label="High Priority (Open)" value={counts.high} color="var(--ttlp-red)" bg="var(--ttlp-red-bg)" icon={AlertCircle} />
      </div>

      <div className="ttlp-panel">
        <div className="ttlp-panel-head">
          <div>
            <div className="ttlp-panel-title"><Mail size={15} /> Email Support Tickets</div>
            <div className="ttlp-panel-sub">Every support request submitted by merchants, live from the database</div>
          </div>
        </div>

        <div className="ttlp-filter-row">
          <div className="ttlp-filter-search">
            <Search size={13} />
            <input placeholder="Search subject, ticket ID, admin ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="ttlp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select className="ttlp-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          {hasFilters && (
            <button className="ttlp-chip-clear" onClick={() => { setSearch(""); setStatus("ALL"); setPriority("ALL"); }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <div className="ttlp-table-wrap">
          <table className="ttlp-table">
            <thead>
              <tr>
                <th className="ttlp-th"></th>
                <th className="ttlp-th">Ticket</th>
                <th className="ttlp-th">Admin ID</th>
                <th className="ttlp-th">Business ID</th>
                <th className="ttlp-th">Category</th>
                <th className="ttlp-th">Priority</th>
                <th className="ttlp-th">Submitted</th>
                <th className="ttlp-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className="ttlp-empty"><Loader2 size={26} style={{ animation: "ttlpSupSpin 0.8s linear infinite", margin: "0 auto" }} /></div></td></tr>
              ) : error ? (
                <tr><td colSpan={8}><div className="ttlp-empty"><div className="ttlp-empty-title" style={{ color: "var(--ttlp-red)" }}>{error}</div><div className="ttlp-empty-sub">Make sure the backend is running on port 6163</div></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="ttlp-empty"><Mail size={28} color="var(--ttlp-ink-mute)" strokeWidth={1.5} style={{ margin: "0 auto" }} /><div className="ttlp-empty-title">No support tickets found</div><div className="ttlp-empty-sub">Try adjusting your search or filters</div></div></td></tr>
              ) : (
                filtered.map((t) => {
                  const st = STATUS_CFG[t.status] || STATUS_CFG.OPEN;
                  const pr = PRIORITY_CFG[t.priority] || PRIORITY_CFG.Medium;
                  const isOpen = expanded === t.ticketId;
                  return (
                    <Fragment key={t.ticketId}>
                      <tr className="ttlp-row" style={{ cursor: "pointer" }} onClick={() => setExpanded(isOpen ? null : t.ticketId)}>
                        <td className="ttlp-td" style={{ width: 28 }}>
                          {isOpen ? <ChevronUp size={14} color="var(--ttlp-ink-mute)" /> : <ChevronDown size={14} color="var(--ttlp-ink-mute)" />}
                        </td>
                        <td className="ttlp-td">
                          <div className="ttlp-merchant-name">{t.subject}</div>
                          <div className="ttlp-merchant-sub"><span className="ttlp-mono">{t.ticketId}</span></div>
                        </td>
                        <td className="ttlp-td"><span className="ttlp-mono" title={t.adminId}>{(t.adminId || "").slice(0, 10)}…</span></td>
                        <td className="ttlp-td">{t.businessId ? <span className="ttlp-mono">{t.businessId}</span> : <span style={{ color: "var(--ttlp-ink-mute)" }}>—</span>}</td>
                        <td className="ttlp-td">{t.category}</td>
                        <td className="ttlp-td"><span className={`ttlp-badge ${pr.cls}`}>{t.priority}</span></td>
                        <td className="ttlp-td">{formatDateTime(t.createdAt)}</td>
                        <td className="ttlp-td" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown
                            value={t.status}
                            saving={savingId === t.ticketId}
                            onChange={(newStatus) => handleStatusChange(t.ticketId, newStatus)}
                          />
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={8} style={{ padding: 0, borderBottom: "1px solid var(--ttlp-border-soft)" }}>
                            <div style={{ background: "var(--ttlp-surface-2)", padding: "16px 24px" }}>
                              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ttlp-ink-mute)", marginBottom: 8 }}>
                                Description
                              </div>
                              <div style={{ fontSize: 13, color: "var(--ttlp-ink-soft)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                {t.description}
                              </div>
                              <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                                {t.attachmentName && (
                                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ttlp-ink-mute)" }}>
                                    <Paperclip size={12} /> {t.attachmentName}
                                  </span>
                                )}
                                <span style={{ fontSize: 12, color: "var(--ttlp-ink-mute)" }}>
                                  System info included: {t.includeSysInfo ? "Yes" : "No"}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes ttlpSupSpin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

function StatusDropdown({ value, saving, onChange }) {
  const cfg = STATUS_CFG[value] || STATUS_CFG.OPEN;
  const dotColor = {
    "ttlp-badge-amber": "var(--ttlp-amber)",
    "ttlp-badge-slate": "var(--ttlp-slate)",
    "ttlp-badge-green": "var(--ttlp-green)",
    "ttlp-badge-red": "var(--ttlp-red)",
  }[cfg.cls];

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span style={{ position: "absolute", left: 10, width: 6, height: 6, borderRadius: "50%", background: dotColor, pointerEvents: "none" }} />
      <select
        value={value}
        disabled={saving}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          padding: "5px 26px 5px 22px",
          borderRadius: 999,
          border: "1px solid var(--ttlp-border)",
          background: "var(--ttlp-surface)",
          fontSize: 11.5,
          fontWeight: 700,
          color: "var(--ttlp-ink)",
          cursor: saving ? "wait" : "pointer",
          opacity: saving ? 0.6 : 1,
          outline: "none",
        }}
      >
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
      </select>
      {saving && (
        <Loader2
          size={12}
          style={{ position: "absolute", right: 8, animation: "ttlpSupSpin 0.8s linear infinite", color: "var(--ttlp-ink-mute)" }}
        />
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