"use client";
import { useMemo, useState } from "react";
import {
  Search, Trash2, X, CheckCircle2, XCircle, Clock, MessageSquareText,
} from "lucide-react";
import { DELETION_REQUESTS, formatDate } from "../data";

const STATUS_CFG = {
  PENDING:  { label: "Pending Review", cls: "ttlp-badge-amber" },
  APPROVED: { label: "Approved",       cls: "ttlp-badge-green" },
  REJECTED: { label: "Rejected",       cls: "ttlp-badge-red" },
};

export default function DeletionRequestsTab() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const counts = useMemo(() => ({
    pending: DELETION_REQUESTS.filter((d) => d.status === "PENDING").length,
    approved: DELETION_REQUESTS.filter((d) => d.status === "APPROVED").length,
    rejected: DELETION_REQUESTS.filter((d) => d.status === "REJECTED").length,
  }), []);

  const filtered = useMemo(() => {
    return DELETION_REQUESTS
      .filter((d) => (status === "ALL" ? true : d.status === status))
      .filter((d) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return `${d.businessName} ${d.businessId} ${d.adminId} ${d.requestedBy}`.toLowerCase().includes(q);
      })
      .sort((a, b) => b.requestedAt - a.requestedAt);
  }, [search, status]);

  const hasFilters = status !== "ALL" || !!search;

  return (
    <>
      <div className="ttlp-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <MiniStat label="Pending Review" value={counts.pending} color="var(--ttlp-amber)" bg="var(--ttlp-amber-bg)" icon={Clock} />
        <MiniStat label="Approved" value={counts.approved} color="var(--ttlp-green)" bg="var(--ttlp-green-bg)" icon={CheckCircle2} />
        <MiniStat label="Rejected" value={counts.rejected} color="var(--ttlp-red)" bg="var(--ttlp-red-bg)" icon={XCircle} />
      </div>

      <div className="ttlp-panel">
        <div className="ttlp-panel-head">
          <div>
            <div className="ttlp-panel-title"><Trash2 size={15} /> Account Deletion Requests</div>
            <div className="ttlp-panel-sub">Merchants who have asked to close their TableTop Leo account</div>
          </div>
        </div>

        <div className="ttlp-filter-row">
          <div className="ttlp-filter-search">
            <Search size={13} />
            <input placeholder="Search business, admin ID, requester..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="ttlp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
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
                <th className="ttlp-th">Business</th>
                <th className="ttlp-th">Business ID</th>
                <th className="ttlp-th">Admin ID</th>
                <th className="ttlp-th">Requested By</th>
                <th className="ttlp-th">Requested On</th>
                <th className="ttlp-th">Reason</th>
                <th className="ttlp-th">Status</th>
                <th className="ttlp-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="ttlp-empty">
                      <Trash2 size={28} color="var(--ttlp-ink-mute)" strokeWidth={1.5} style={{ margin: "0 auto" }} />
                      <div className="ttlp-empty-title">No deletion requests found</div>
                      <div className="ttlp-empty-sub">Try a different filter</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const st = STATUS_CFG[d.status];
                  return (
                    <tr key={d.requestId} className="ttlp-row">
                      <td className="ttlp-td"><span className="ttlp-mono">{d.requestId}</span></td>
                      <td className="ttlp-td ttlp-strong">{d.businessName}</td>
                      <td className="ttlp-td"><span className="ttlp-mono">{d.businessId}</span></td>
                      <td className="ttlp-td"><span className="ttlp-mono" title={d.adminId}>{d.adminId.slice(0, 8)}…</span></td>
                      <td className="ttlp-td">{d.requestedBy}</td>
                      <td className="ttlp-td">{formatDate(d.requestedAt)}</td>
                      <td className="ttlp-td" style={{ maxWidth: 220 }}>
                        <span style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                          <MessageSquareText size={12} style={{ marginTop: 2, flexShrink: 0, color: "var(--ttlp-ink-mute)" }} />
                          {d.reason}
                        </span>
                      </td>
                      <td className="ttlp-td">
                        <span className={`ttlp-badge ${st.cls}`}><span className="ttlp-badge-dot" />{st.label}</span>
                      </td>
                      <td className="ttlp-td">
                        {d.status === "PENDING" ? (
                          <div className="ttlp-row-actions">
                            <button className="ttlp-row-btn success" title="Approve deletion"><CheckCircle2 size={14} /></button>
                            <button className="ttlp-row-btn danger" title="Reject request"><XCircle size={14} /></button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11.5, color: "var(--ttlp-ink-mute)" }}>
                            {d.status === "APPROVED" && d.scheduledFor ? `Scheduled ${formatDate(d.scheduledFor)}` : "—"}
                          </span>
                        )}
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
          <Icon size={15} color={color} />
        </div>
      </div>
      <div className="ttlp-stat-value">{value}</div>
    </div>
  );
}
