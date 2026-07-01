"use client";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const OPTIONS = [
  { id: "dine-in",  emoji: "🍽️", title: "Dine In",    desc: "Sit down and enjoy your meal inside the restaurant." },
  { id: "takeaway", emoji: "🥡", title: "Take Away", desc: "Pick up your order from the counter and go." },
];

const CustomerDiningSelection = ({ choice, onChoose, onBack, onContinue }) => (
  <div className="cw-screen">
    <div className="cx-topbar">
      <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20} /></button>
      <span className="cx-topbar-title">How would you like it?</span>
      <div style={{ width: 32 }} />
    </div>

    <div style={{ flex: 1, padding: "24px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Choose Order Type</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Select how you would like to receive your order</div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {OPTIONS.map(opt => (
          <div key={opt.id} className={`dining-card ${choice === opt.id ? "selected" : ""}`} onClick={() => onChoose(opt.id)}>
            {choice === opt.id && (
              <div style={{ position: "absolute", top: -1, right: -1 }}>
                <CheckCircle2 size={20} color="var(--brand)" fill="var(--brand-muted)" />
              </div>
            )}
            <div className="dining-icon">{opt.emoji}</div>
            <div className="dining-title">{opt.title}</div>
            <div className="dining-desc">{opt.desc}</div>
          </div>
        ))}
      </div>

      {choice === "dine-in" && (
        <div style={{ marginTop: 20, animation: "fadeIn 0.2s ease" }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 8 }}>
            Table Number <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            style={{ width: "100%", padding: "11px 14px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", fontSize: 14, color: "var(--text-primary)", background: "var(--surface-2)" }}
            placeholder="e.g. Table 4"
          />
        </div>
      )}
    </div>

    <div className="cx-sticky-bottom">
      <button className="cta-btn" disabled={!choice} onClick={onContinue} style={{ opacity: choice ? 1 : 0.5 }}>
        Continue to Payment
      </button>
    </div>
  </div>
);

export default CustomerDiningSelection;
