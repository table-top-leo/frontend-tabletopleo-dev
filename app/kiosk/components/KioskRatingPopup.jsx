"use client";
import { useEffect, useState } from "react";
import { X, Send, CheckCircle2, Loader2, Heart } from "lucide-react";

const EMOJIS = [
  { value: 1, emoji: "😞", label: "Poor" },
  { value: 2, emoji: "😕", label: "Fair" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "🤩", label: "Great" },
];

const TAGS = [
  { key: "food_quality", label: "🍔 Food Quality" },
  { key: "service", label: "🙋 Service" },
  { key: "cleanliness", label: "🧼 Cleanliness" },
  { key: "speed", label: "⚡ Speed" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6163";

const KioskRatingPopup = ({ onClose, onRated, businessId, customerName, customerPhone }) => {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (key) => setTags((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true); setError("");
    try {
      const tagLabels = tags.map((k) => TAGS.find((t) => t.key === k)?.label).filter(Boolean);
      const parts = [];
      if (tagLabels.length) parts.push(`Highlights: ${tagLabels.join(", ")}`);
      if (comments.trim()) parts.push(comments.trim());
      const reviewText = parts.join(" | ") || null;
      const phone = (customerPhone && customerPhone.trim()) ? customerPhone.trim() : `KIOSK-GUEST-${Date.now()}`;

      const res = await fetch(`${API_BASE}/api/reviews/business`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: businessId || "",
          customerName: customerName || "Guest",
          customerPhone: phone,
          rating,
          reviewText,
        }),
      });
      const data = await res.json();
      if ((res.ok && data.success !== false) || res.status === 409) {
        setSubmitted(true);
        onRated?.();
      } else {
        setError(data.message || "Failed to submit. Please try again.");
      }
    } catch {
      setError("Network error — but thank you for trying!");
      setTimeout(() => { setSubmitted(true); onRated?.(); }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [submitted, onClose]);

  return (
    <div className="k-popup-overlay" onClick={onClose}>
      <div className="k-popup" onClick={(e) => e.stopPropagation()}>
        <button className="k-popup-close" onClick={onClose}><X size={20} /></button>

        {submitted ? (
          <div style={{ textAlign: "center" }}>
            <div className="k-popup-icon" style={{ background: "var(--k-brand-tint)" }}>
              <CheckCircle2 size={48} color="var(--k-brand)" />
            </div>
            <div className="k-popup-title">Thank You! 🎉</div>
            <div className="k-popup-sub">Your feedback helps us serve every guest better.</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, color: "var(--k-brand)", fontWeight: 700, fontSize: 13.5 }}>
              <Heart size={15} fill="var(--k-brand)" /> With love, {customerName ? "the team" : "TableTop Leo"}
            </div>
          </div>
        ) : (
          <>
            <div className="k-popup-title">How was your visit?</div>
            <div className="k-popup-sub">Tap an emoji to rate your experience</div>

            <div className="k-emoji-row">
              {EMOJIS.map((e) => (
                <button
                  key={e.value}
                  className={`k-emoji-btn ${rating === e.value ? "is-selected" : ""}`}
                  onClick={() => setRating(e.value)}
                  aria-label={e.label}
                >
                  {e.emoji}
                </button>
              ))}
            </div>
            {rating > 0 && <div className="k-emoji-label">{EMOJIS.find((e) => e.value === rating)?.label}</div>}

            <div style={{ marginTop: 26 }}>
              <div className="k-field-label">What stood out? (optional)</div>
              <div className="k-tag-grid">
                {TAGS.map((t) => (
                  <button key={t.key} className={`k-tag-btn ${tags.includes(t.key) ? "is-selected" : ""}`} onClick={() => toggleTag(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="k-field-label">Comments (optional)</div>
              <textarea
                className="k-notes-input"
                placeholder="Tell us more about your experience..."
                value={comments}
                onChange={(e) => setComments(e.target.value.slice(0, 200))}
              />
            </div>

            {error && <p style={{ color: "var(--k-danger)", fontSize: 13, marginTop: 10, textAlign: "center" }}>{error}</p>}

            <button className="k-btn k-btn-primary k-btn-lg k-btn-block" style={{ marginTop: 20 }} disabled={rating === 0 || submitting} onClick={handleSubmit}>
              {submitting ? <><Loader2 size={18} style={{ animation: "k-spin .7s linear infinite" }} /> Submitting...</> : <><Send size={18} /> Submit Rating</>}
            </button>
            <button className="k-btn k-btn-ghost k-btn-block" style={{ marginTop: 10 }} onClick={onClose}>Skip</button>
          </>
        )}
      </div>
    </div>
  );
};

export default KioskRatingPopup;
