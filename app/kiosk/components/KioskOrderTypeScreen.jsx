"use client";
import { useState } from "react";
import { CheckCircle2, ArrowRight, X } from "lucide-react";

const OPTIONS = [
  { id: "dine-in", emoji: "🍽️", title: "Dine In", desc: "Sit down and enjoy your meal inside." },
  { id: "takeaway", emoji: "🥡", title: "Take Away", desc: "Grab your order and go." },
];

const KioskOrderTypeScreen = ({ diningInfo, onInfoChange, onCancel, onContinue }) => {
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    onInfoChange((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!diningInfo.type) errs.type = "Please choose Dine In or Take Away.";
    if (diningInfo.type === "takeaway" && !diningInfo.name.trim()) errs.name = "Please enter your name.";
    return errs;
  };

  const handleContinue = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onContinue(diningInfo);
  };

  return (
    <div className="k-step-shell">
      <div className="k-step-header">
        <button className="k-step-back" onClick={onCancel} aria-label="Cancel order"><X size={24} /></button>
        <div className="k-step-title">How would you like your order?</div>
      </div>

      <div className="k-step-body">
        <div className="k-step-body-inner">
          <div className="k-choice-grid">
            {OPTIONS.map((opt) => {
              const active = diningInfo.type === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`k-choice-card ${active ? "is-selected" : ""}`}
                  onClick={() => { onInfoChange((p) => ({ ...p, type: opt.id })); setErrors((p) => ({ ...p, type: "" })); }}
                >
                  {active && <div className="k-choice-check"><CheckCircle2 size={18} /></div>}
                  <div className="k-choice-emoji">{opt.emoji}</div>
                  <div className="k-choice-title">{opt.title}</div>
                  <div className="k-choice-desc">{opt.desc}</div>
                </div>
              );
            })}
          </div>
          {errors.type && <p style={{ color: "var(--k-danger)", fontSize: 14, fontWeight: 600, marginTop: 14, textAlign: "center" }}>{errors.type}</p>}

          {diningInfo.type && (
            <div style={{ marginTop: 34, animation: "k-fade-in 0.2s ease" }}>
              <label className="k-field-label">
                Your Name {diningInfo.type === "takeaway" && <span style={{ color: "var(--k-danger)" }}>*</span>}
              </label>
              <input
                className="k-field-input"
                placeholder="Enter your name for the order call-out"
                value={diningInfo.name}
                onChange={set("name")}
              />
              {errors.name && <p style={{ color: "var(--k-danger)", fontSize: 13, marginTop: 6 }}>{errors.name}</p>}

              {diningInfo.type === "dine-in" && (
                <>
                  <label className="k-field-label" style={{ marginTop: 20 }}>Table Number (optional)</label>
                  <input className="k-field-input" placeholder="e.g. Table 5" value={diningInfo.table} onChange={set("table")} />
                </>
              )}

              <label className="k-field-label" style={{ marginTop: 20 }}>Phone Number (optional)</label>
              <input className="k-field-input" type="tel" placeholder="For order updates" value={diningInfo.phone} onChange={set("phone")} />

              <label className="k-field-label" style={{ marginTop: 20 }}>Special Instructions (optional)</label>
              <textarea
                className="k-notes-input"
                placeholder="e.g. Less spicy, no onion, extra sauce..."
                value={diningInfo.note}
                onChange={set("note")}
              />
            </div>
          )}
        </div>
      </div>

      <div className="k-step-footer">
        <div className="k-step-footer-inner">
          <button
            className="k-btn k-btn-primary k-btn-xl k-btn-block"
            disabled={!diningInfo.type}
            onClick={handleContinue}
          >
            Continue to Menu <ArrowRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KioskOrderTypeScreen;
