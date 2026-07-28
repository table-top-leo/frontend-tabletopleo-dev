"use client";
import { useMemo, useState } from "react";
import {
  Search, Store, ChevronLeft, ChevronRight, Download, X,
  Eye, Ban, CheckCircle2, Building2,
} from "lucide-react";
import { MERCHANTS, formatDate } from "../data";

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
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
function initials(name) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

export default function MerchantsTab() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [plan, setPlan] = useState("ALL");
  const [country, setCountry] = useState("ALL");
  const [page, setPage] = useState(1);

  const countries = useMemo(() => Array.from(new Set(MERCHANTS.map((m) => m.country))).sort(), []);

  const filtered = useMemo(() => {
    return MERCHANTS.filter((m) => {
      if (status !== "ALL" && m.status !== status) return false;
      if (plan !== "ALL" && m.plan !== plan) return false;
      if (country !== "ALL" && m.country !== country) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${m.businessName} ${m.businessId} ${m.adminId} ${m.ownerName} ${m.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, status, plan, country]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = status !== "ALL" || plan !== "ALL" || country !== "ALL" || !!search;

  function resetAndSet(setter) {
    return (v) => { setter(v); setPage(1); };
  }

  return (
    <div className="ttlp-panel">
      <div className="ttlp-panel-head">
        <div>
          <div className="ttlp-panel-title"><Building2 size={15} /> Merchant Directory</div>
          <div className="ttlp-panel-sub">All businesses registered on TableTop Leo</div>
        </div>
      </div>

      <div className="ttlp-filter-row">
        <div className="ttlp-filter-search">
          <Search size={13} />
          <input
            placeholder="Search business, admin ID, owner, email..."
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

        <select className="ttlp-select" value={plan} onChange={(e) => resetAndSet(setPlan)(e.target.value)}>
          <option value="ALL">All Plans</option>
          <option value="Free">Free</option>
          <option value="Pro">Pro</option>
          <option value="Enterprise">Enterprise</option>
        </select>

        <select className="ttlp-select" value={country} onChange={(e) => resetAndSet(setCountry)(e.target.value)}>
          <option value="ALL">All Countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {hasFilters && (
          <button className="ttlp-chip-clear" onClick={() => { setSearch(""); setStatus("ALL"); setPlan("ALL"); setCountry("ALL"); setPage(1); }}>
            <X size={12} /> Clear
          </button>
        )}

        <button className="ttlp-export-btn"><Download size={13} /> Export CSV</button>
      </div>

      <div className="ttlp-table-wrap">
        <table className="ttlp-table">
          <thead>
            <tr>
              <th className="ttlp-th">Merchant</th>
              <th className="ttlp-th">Business ID</th>
              <th className="ttlp-th">Admin ID</th>
              <th className="ttlp-th">Location</th>
              <th className="ttlp-th">Plan</th>
              <th className="ttlp-th">Orders (30d)</th>
              <th className="ttlp-th">Joined</th>
              <th className="ttlp-th">Status</th>
              <th className="ttlp-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="ttlp-empty">
                    <Store size={30} color="var(--ttlp-ink-mute)" strokeWidth={1.5} style={{ margin: "0 auto" }} />
                    <div className="ttlp-empty-title">No merchants match these filters</div>
                    <div className="ttlp-empty-sub">Try adjusting your search or filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((m) => {
                const st = STATUS_CFG[m.status];
                const pal = paletteFor(m.businessName);
                return (
                  <tr key={m.businessId} className="ttlp-row">
                    <td className="ttlp-td">
                      <div className="ttlp-merchant-cell">
                        <div className="ttlp-merchant-avatar" style={{ background: pal.bg, color: pal.fg }}>
                          {initials(m.businessName)}
                        </div>
                        <div>
                          <div className="ttlp-merchant-name">{m.businessName}</div>
                          <div className="ttlp-merchant-sub">{m.businessType} · {m.ownerName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="ttlp-td"><span className="ttlp-mono">{m.businessId}</span></td>
                    <td className="ttlp-td"><span className="ttlp-mono" title={m.adminId}>{m.adminId.slice(0, 8)}…</span></td>
                    <td className="ttlp-td">{m.city}, {m.country}</td>
                    <td className="ttlp-td">
                      <span className={`ttlp-badge ${m.plan === "Enterprise" ? "ttlp-badge-gold" : m.plan === "Pro" ? "ttlp-badge-green" : "ttlp-badge-slate"}`}>
                        {m.plan}
                      </span>
                    </td>
                    <td className="ttlp-td ttlp-strong">{m.ordersLast30.toLocaleString()}</td>
                    <td className="ttlp-td">{formatDate(m.joinedAt)}</td>
                    <td className="ttlp-td">
                      <span className={`ttlp-badge ${st.cls}`}><span className="ttlp-badge-dot" />{st.label}</span>
                    </td>
                    <td className="ttlp-td">
                      <div className="ttlp-row-actions">
                        <button className="ttlp-row-btn" title="View details"><Eye size={14} /></button>
                        {m.status === "ACTIVE" ? (
                          <button className="ttlp-row-btn danger" title="Suspend merchant"><Ban size={14} /></button>
                        ) : (
                          <button className="ttlp-row-btn success" title="Reactivate merchant"><CheckCircle2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="ttlp-pagination">
          <div className="ttlp-page-info">
            Showing <strong>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> merchants
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
    </div>
  );
}
