"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Users, ChevronLeft, ChevronRight, Download, X,
  Eye, Loader2, ShieldCheck, ShieldOff,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6163";
const PAGE_SIZE = 10;

const STATUS_CFG = {
  ACTIVE:    { label: "Active",    cls: "ttlp-badge-green" },
  INACTIVE:  { label: "Inactive",  cls: "ttlp-badge-slate" },
  SUSPENDED: { label: "Suspended", cls: "ttlp-badge-red" },
};

const AVATAR_PALETTE = [
  { bg: "#e7f3f1", fg: "#1f5b53" }, { bg: "#f8f0e0", fg: "#b8873a" },
  { bg: "#eaf1fd", fg: "#2b57b3" }, { bg: "#fbeae7", fg: "#b3311f" },
  { bg: "#eef0f3", fg: "#5b6577" },
];
function paletteFor(seed) {
  let hash = 0;
  for (let i = 0; i < (seed || "").length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MerchantsTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [verified, setVerified] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/api/platform/merchants`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUsers(json.data || []);
        else setError(json.message || "Failed to load users");
      })
      .catch(() => setError("Failed to load users — is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (status !== "ALL" && (u.accountStatus || "ACTIVE") !== status) return false;
      if (verified === "YES" && !u.emailVerified) return false;
      if (verified === "NO" && u.emailVerified) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${u.fullName || ""} ${u.adminId || ""} ${u.email || ""} ${u.mobileNumber || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [users, search, status, verified]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = status !== "ALL" || verified !== "ALL" || !!search;

  function resetAndSet(setter) {
    return (v) => { setter(v); setPage(1); };
  }

  return (
    <div className="ttlp-panel">
      <div className="ttlp-panel-head">
        <div>
          <div className="ttlp-panel-title"><Users size={15} /> TableTop Leo Users</div>
          <div className="ttlp-panel-sub">Every row in tabletop_leo_users, live from the database</div>
        </div>
      </div>

      <div className="ttlp-filter-row">
        <div className="ttlp-filter-search">
          <Search size={13} />
          <input
            placeholder="Search name, admin ID, email, phone..."
            value={search}
            onChange={(e) => resetAndSet(setSearch)(e.target.value)}
          />
        </div>

        <select className="ttlp-select" value={status} onChange={(e) => resetAndSet(setStatus)(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        <select className="ttlp-select" value={verified} onChange={(e) => resetAndSet(setVerified)(e.target.value)}>
          <option value="ALL">Email: All</option>
          <option value="YES">Email Verified</option>
          <option value="NO">Email Unverified</option>
        </select>

        {hasFilters && (
          <button className="ttlp-chip-clear" onClick={() => { setSearch(""); setStatus("ALL"); setVerified("ALL"); setPage(1); }}>
            <X size={12} /> Clear
          </button>
        )}

        <button className="ttlp-export-btn"><Download size={13} /> Export CSV</button>
      </div>

      <div className="ttlp-table-wrap">
        <table className="ttlp-table">
          <thead>
            <tr>
              <th className="ttlp-th">User</th>
              <th className="ttlp-th">Admin ID</th>
              <th className="ttlp-th">Email</th>
              <th className="ttlp-th">Mobile</th>
              <th className="ttlp-th">Language</th>
              <th className="ttlp-th">Email Verified</th>
              <th className="ttlp-th">Joined</th>
              <th className="ttlp-th">Status</th>
              <th className="ttlp-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9}>
                  <div className="ttlp-empty">
                    <Loader2 size={26} style={{ animation: "ttlpUsersSpin 0.8s linear infinite", margin: "0 auto" }} />
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9}>
                  <div className="ttlp-empty">
                    <div className="ttlp-empty-title" style={{ color: "var(--ttlp-red)" }}>{error}</div>
                    <div className="ttlp-empty-sub">Make sure the backend is running on port 6163</div>
                  </div>
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="ttlp-empty">
                    <Users size={30} color="var(--ttlp-ink-mute)" strokeWidth={1.5} style={{ margin: "0 auto" }} />
                    <div className="ttlp-empty-title">No users match these filters</div>
                    <div className="ttlp-empty-sub">Try adjusting your search or filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((u) => {
                const st = STATUS_CFG[u.accountStatus] || STATUS_CFG.ACTIVE;
                const pal = paletteFor(u.fullName || u.adminId);
                return (
                  <tr key={u.adminId} className="ttlp-row">
                    <td className="ttlp-td">
                      <div className="ttlp-merchant-cell">
                        <div className="ttlp-merchant-avatar" style={{ background: pal.bg, color: pal.fg }}>
                          {initials(u.fullName)}
                        </div>
                        <div>
                          <div className="ttlp-merchant-name">{u.fullName || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="ttlp-td"><span className="ttlp-mono" title={u.adminId}>{(u.adminId || "").slice(0, 10)}…</span></td>
                    <td className="ttlp-td">{u.email}</td>
                    <td className="ttlp-td">{u.mobileNumber}</td>
                    <td className="ttlp-td">{u.languageName || u.languageCode || "—"}</td>
                    <td className="ttlp-td">
                      {u.emailVerified ? (
                        <span className="ttlp-badge ttlp-badge-green"><ShieldCheck size={11} /> Verified</span>
                      ) : (
                        <span className="ttlp-badge ttlp-badge-slate"><ShieldOff size={11} /> Unverified</span>
                      )}
                    </td>
                    <td className="ttlp-td">{formatDate(u.createdAt)}</td>
                    <td className="ttlp-td">
                      <span className={`ttlp-badge ${st.cls}`}><span className="ttlp-badge-dot" />{st.label}</span>
                    </td>
                    <td className="ttlp-td">
                      <div className="ttlp-row-actions">
                        <button className="ttlp-row-btn" title="View details"><Eye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && filtered.length > 0 && (
        <div className="ttlp-pagination">
          <div className="ttlp-page-info">
            Showing <strong>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> users
          </div>
          <div className="ttlp-page-btns">
            <button className="ttlp-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={13} /> Prev
            </button>
            <button className="ttlp-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes ttlpUsersSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}