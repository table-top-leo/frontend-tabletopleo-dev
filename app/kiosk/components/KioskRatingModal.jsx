"use client";
import React, { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.tabletopleo.com";
const REACTIONS = { 0: "Tap a star to rate", 1: "What went wrong?", 2: "We can do better", 3: "Thanks for the feedback", 4: "Glad you enjoyed it!", 5: "You're roar-some!" };

export default function KioskRatingModal({ open, businessId, customerName, customerPhone, onClose }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;
  const shown = hover || stars;

  const handleSubmit = async () => {
    if (stars === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const phone = (customerPhone && customerPhone.trim()) ? customerPhone.trim() : `GUEST-${Date.now()}`;
      const res = await fetch(`${API_BASE}/api/reviews/business`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: businessId || "",
          customerName: customerName || "Guest",
          customerPhone: phone,
          rating: stars,
          reviewText: note.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSubmitted(true);
      } else if (res.status === 409) {
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to submit rating. Please try again.");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ttlKioskWrenOverlay">
      <div className="ttlKioskWrenCard ttlKioskPopIn">
        <div className="ttlKioskWrenTop">
          {submitted ? (
            <>
              <div className="ttlKioskWrenIconWrap ttlKioskWrenDone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                  <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="ttlKioskWrenTitle">Thanks a bunch!</h3>
              <p className="ttlKioskWrenSub">Your feedback helps us do better.</p>
            </>
          ) : (
            <>
              <h3 className="ttlKioskWrenTitle">How was everything?</h3>
              <p className="ttlKioskWrenSub">{REACTIONS[shown]}</p>
              <div className="ttlKioskWrenStars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setStars(n)} aria-label={`${n} star`}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill={n <= shown ? "#e0973f" : "none"} stroke={n <= shown ? "#e0973f" : "#c9beb0"} strokeWidth="1.6">
                      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.6 6.2 20.5l1.1-6.5-4.8-4.6 6.6-.9L12 2.5Z" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
              {stars > 0 && (
                <textarea
                  className="ttlKioskWrenTextarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything you'd like to add? (optional)"
                  rows={2}
                />
              )}
              {error && <p className="ttlKioskWrenErr">{error}</p>}
            </>
          )}
        </div>
        {!submitted && (
          <div className="ttlKioskWrenActions">
            <button onClick={onClose} className="ttlKioskWrenSkip">Skip</button>
            <button onClick={handleSubmit} disabled={stars === 0 || submitting} className="ttlKioskWrenSubmit">
              {submitting ? "Submitting…" : "Submit rating"}
            </button>
          </div>
        )}
        {submitted && (
          <div className="ttlKioskWrenActions">
            <button onClick={onClose} className="ttlKioskWrenSubmit" style={{ flex: 1, borderLeft: "none" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
