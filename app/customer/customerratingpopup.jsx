"use client";

import { useEffect, useState } from "react";
import {
  X, Star, MessageSquareText, Utensils, Bell, Soup, Bike, Package,
  ClipboardCheck, Tag, User, Armchair, Send, CheckCircle2, Heart, Loader2,
} from "lucide-react";

const RATING_TAGS = [
  { key: "food_quality",   label: "Food Quality",    Icon: Utensils },
  { key: "food_taste",     label: "Food Taste",      Icon: Bell },
  { key: "portion_size",   label: "Portion Size",    Icon: Soup },
  { key: "delivery_speed", label: "Delivery Speed",  Icon: Bike },
  { key: "packaging",      label: "Packaging",       Icon: Package },
  { key: "order_accuracy", label: "Order Accuracy",  Icon: ClipboardCheck },
  { key: "value_for_money",label: "Value for Money", Icon: Tag },
  { key: "staff_behavior", label: "Staff Behavior",  Icon: User },
  { key: "ambience",       label: "Ambience",        Icon: Armchair },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6163";

const CustomerRatingPopup = ({ onClose, onRated, businessId, customerName, customerPhone }) => {
  const [rating,       setRating]       = useState(0);
  const [hoverRating,  setHoverRating]  = useState(0);
  const [feedback,     setFeedback]     = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitted,    setSubmitted]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");

  const activeRating = hoverRating || rating;

  const toggleTag = (key) =>
    setSelectedTags((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    setError("");
    try {
      // Build reviewText: include tags + user feedback
      const tagLabels   = selectedTags.map(k => RATING_TAGS.find(t => t.key === k)?.label).filter(Boolean);
      const reviewParts = [];
      if (tagLabels.length)      reviewParts.push(`Highlights: ${tagLabels.join(", ")}`);
      if (feedback.trim())       reviewParts.push(feedback.trim());
      const reviewText  = reviewParts.join(" | ") || null;

      // Use fallbacks so API is always called
      const phone = (customerPhone && customerPhone.trim()) ? customerPhone.trim() : `GUEST-${Date.now()}`;
      const bId   = businessId || "";

      console.log("[Rating] Submitting:", { bId, phone, customerName, rating });

      const res = await fetch(`${API_BASE}/api/reviews/business`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          businessId:    bId,
          customerName:  customerName || "Guest",
          customerPhone: phone,
          rating,
          reviewText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSubmitted(true);
        onRated?.();
      } else {
        // 409 = already reviewed — treat as success since review was already submitted
        if (res.status === 409) {
          setSubmitted(true);
          onRated?.();
        } else {
          setError(data.message || "Failed to submit rating. Please try again.");
        }
      }
    } catch {
      setError("Network error. Rating not saved, but thank you for trying!");
      // Still show success after error so UX is not blocked
      setTimeout(() => { setSubmitted(true); onRated?.(); }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-close after thank-you screen
  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(() => onClose(), 2400);
    return () => clearTimeout(t);
  }, [submitted, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        backdropFilter: "blur(2px)", animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface, #fff)", borderRadius: 22,
          width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto",
          animation: "popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)", position: "relative",
        }}
      >
        {/* close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12, width: 30, height: 30,
            borderRadius: "50%", background: "#F3F4F6", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#6B7280", zIndex: 5,
          }}
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div style={{
            padding: "48px 24px 44px", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 14, textAlign: "center",
            animation: "fadeIn 0.25s ease",
          }}>
            <div style={{
              width: 84, height: 84, borderRadius: "50%",
              background: "linear-gradient(135deg, #FFF3EB, #FDECE3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              <CheckCircle2 size={44} color="#F2701D" strokeWidth={2} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1008" }}>Thank You! 🎉</div>
            <div style={{ fontSize: 13.5, color: "#9b7d5e", lineHeight: 1.6, maxWidth: 260 }}>
              Thanks for taking the time to share your feedback — it truly helps us serve you better every single day.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#F2701D", fontWeight: 600, marginTop: 2 }}>
              <Heart size={14} fill="#F2701D" color="#F2701D" /> With love, TableTop Leo Team
            </div>
          </div>
        ) : (
          <div style={{ padding: "28px 20px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>

            {/* heading */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: "#1a1008", marginBottom: 4 }}>
                How was your experience?
              </div>
              <div style={{ fontSize: 12.5, color: "#9b7d5e", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                Your feedback helps us serve you better <span>🧡</span>
              </div>
            </div>

            {/* stars */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= activeRating;
                return (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: 4,
                      transition: "transform 0.12s", transform: filled ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <Star size={36} color={filled ? "#F2701D" : "#D1D5DB"} fill={filled ? "#F2701D" : "none"} strokeWidth={1.5} />
                  </button>
                );
              })}
            </div>

            {/* feedback textarea */}
            <div style={{ width: "100%", position: "relative" }}>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 200))}
                placeholder="Tell us more about your experience (optional)"
                rows={3}
                style={{
                  width: "100%", boxSizing: "border-box", resize: "none",
                  border: "1.5px solid #E5E7EB", borderRadius: 14, padding: "12px 14px",
                  fontSize: 13, color: "#1a1008", outline: "none", fontFamily: "inherit",
                }}
              />
              <span style={{ position: "absolute", right: 12, bottom: 8, fontSize: 10.5, color: "#B0B0B0" }}>
                {feedback.length}/200
              </span>
            </div>

            {/* tags */}
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1008", marginBottom: 10 }}>
                What would you like to rate? (optional)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {RATING_TAGS.map(({ key, label, Icon }) => {
                  const selected = selectedTags.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleTag(key)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 8px", borderRadius: 12,
                        border: selected ? "1.5px solid #F2701D" : "1.5px solid #E5E7EB",
                        background: selected ? "#FFF3EB" : "#fff",
                        cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                      }}
                    >
                      <Icon size={15} color="#F2701D" strokeWidth={2} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: "#374151", lineHeight: 1.15 }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* error */}
            {error && (
              <div style={{ fontSize: 12, color: "#ef4444", textAlign: "center", width: "100%" }}>{error}</div>
            )}

            {/* submit */}
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 0", borderRadius: 14, border: "none",
                cursor: rating === 0 || submitting ? "not-allowed" : "pointer",
                background: rating === 0 ? "#F3D9C6" : "linear-gradient(135deg, #F2701D, #F0A500)",
                color: "#fff", fontSize: 15, fontWeight: 800,
                boxShadow: rating === 0 ? "none" : "0 6px 16px rgba(242,112,29,0.32)",
                marginTop: 4, transition: "all 0.15s",
              }}
            >
              {submitting
                ? <><Loader2 size={16} style={{ animation: "spin .7s linear infinite" }} /> Submitting...</>
                : <><Send size={16} /> Submit Rating</>}
            </button>

            {/* skip */}
            <button
              onClick={onClose}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "12px 0", borderRadius: 14, cursor: "pointer",
                background: "#fff", border: "1.5px solid #F2701D", color: "#F2701D",
                fontSize: 14.5, fontWeight: 700,
              }}
            >
              ⏭ Skip
            </button>

            <div style={{ fontSize: 12, color: "#9b7d5e", textAlign: "center", marginTop: 2 }}>
              Thank you! Your feedback means a lot to us. 🧡
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn  { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CustomerRatingPopup;