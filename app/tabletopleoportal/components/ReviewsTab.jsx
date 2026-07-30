"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, Star, MessageSquareText, X, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6163";

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Stars({ rating }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={13} fill={n <= rating ? "var(--ttlp-gold)" : "none"} color={n <= rating ? "var(--ttlp-gold)" : "var(--ttlp-border)"} />
      ))}
    </span>
  );
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/api/platform/reviews/app`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setReviews(json.data || []);
        else setError(json.message || "Failed to load reviews");
      })
      .catch(() => setError("Failed to load reviews — is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, total: 0, fiveStar: 0 };
    const total = reviews.length;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;
    const fiveStar = reviews.filter((r) => r.rating === 5).length;
    return { avg, total, fiveStar };
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter !== "ALL" && String(r.rating) !== ratingFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${r.reviewId} ${r.adminId} ${r.businessId || ""} ${r.reviewText || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reviews, search, ratingFilter]);

  const hasFilters = ratingFilter !== "ALL" || !!search;

  return (
    <>
      <div className="ttlp-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="ttlp-stat-card">
          <div className="ttlp-stat-top">
            <span className="ttlp-stat-label">Average Rating</span>
            <div className="ttlp-stat-icon" style={{ background: "var(--ttlp-gold-tint)" }}><Star size={15} color="var(--ttlp-gold)" /></div>
          </div>
          <div className="ttlp-stat-value">{summary.avg.toFixed(1)} <span style={{ fontSize: 14, color: "var(--ttlp-ink-mute)" }}>/ 5</span></div>
        </div>
        <div className="ttlp-stat-card">
          <div className="ttlp-stat-top">
            <span className="ttlp-stat-label">Total Reviews</span>
            <div className="ttlp-stat-icon" style={{ background: "var(--ttlp-accent-tint)" }}><MessageSquareText size={15} color="var(--ttlp-accent)" /></div>
          </div>
          <div className="ttlp-stat-value">{summary.total}</div>
        </div>
        <div className="ttlp-stat-card">
          <div className="ttlp-stat-top">
            <span className="ttlp-stat-label">5-Star Reviews</span>
            <div className="ttlp-stat-icon" style={{ background: "var(--ttlp-green-bg)" }}><Star size={15} color="var(--ttlp-green)" /></div>
          </div>
          <div className="ttlp-stat-value">{summary.fiveStar}</div>
        </div>
      </div>

      <div className="ttlp-panel">
        <div className="ttlp-panel-head">
          <div>
            <div className="ttlp-panel-title"><Star size={15} /> Application Reviews</div>
            <div className="ttlp-panel-sub">Merchant feedback on TableTop Leo itself, live from the database</div>
          </div>
        </div>

        <div className="ttlp-filter-row">
          <div className="ttlp-filter-search">
            <Search size={13} />
            <input placeholder="Search review ID, admin ID, business ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="ttlp-select" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          {hasFilters && (
            <button className="ttlp-chip-clear" onClick={() => { setSearch(""); setRatingFilter("ALL"); }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <div className="ttlp-table-wrap">
          <table className="ttlp-table">
            <thead>
              <tr>
                <th className="ttlp-th">Review</th>
                <th className="ttlp-th">Admin ID</th>
                <th className="ttlp-th">Business ID</th>
                <th className="ttlp-th">Rating</th>
                <th className="ttlp-th">Comment</th>
                <th className="ttlp-th">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><div className="ttlp-empty"><Loader2 size={26} style={{ animation: "ttlpRevSpin 0.8s linear infinite", margin: "0 auto" }} /></div></td></tr>
              ) : error ? (
                <tr><td colSpan={6}><div className="ttlp-empty"><div className="ttlp-empty-title" style={{ color: "var(--ttlp-red)" }}>{error}</div><div className="ttlp-empty-sub">Make sure the backend is running on port 6163</div></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="ttlp-empty"><Star size={28} color="var(--ttlp-ink-mute)" strokeWidth={1.5} style={{ margin: "0 auto" }} /><div className="ttlp-empty-title">No reviews found</div><div className="ttlp-empty-sub">Try adjusting your search or filters</div></div></td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.reviewId} className="ttlp-row">
                    <td className="ttlp-td"><span className="ttlp-mono">{r.reviewId}</span></td>
                    <td className="ttlp-td"><span className="ttlp-mono" title={r.adminId}>{(r.adminId || "").slice(0, 10)}…</span></td>
                    <td className="ttlp-td">{r.businessId ? <span className="ttlp-mono">{r.businessId}</span> : <span style={{ color: "var(--ttlp-ink-mute)" }}>—</span>}</td>
                    <td className="ttlp-td"><Stars rating={r.rating} /></td>
                    <td className="ttlp-td" style={{ maxWidth: 320 }}>{r.reviewText || <span style={{ color: "var(--ttlp-ink-mute)" }}>No comment</span>}</td>
                    <td className="ttlp-td">{formatDateTime(r.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes ttlpRevSpin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}