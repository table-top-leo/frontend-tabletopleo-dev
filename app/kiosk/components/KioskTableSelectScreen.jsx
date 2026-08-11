"use client";
import React, { useState } from "react";
import KioskLogo from "./KioskLogo";
import KioskFloatingBubbles from "./KioskFloatingBubbles";

// TableTop Leo has no "list tables" API — CustomerDiningSelection just
// takes a free-text table number. This grid is only a faster tap-to-pick
// input for that same field (no fixed backend table list to fake), plus a
// manual field for anything outside the quick-pick range.
const QUICK_PICK = Array.from({ length: 24 }, (_, i) => i + 1);

export default function KioskTableSelectScreen({ selectedTable, onSelect, onContinue, onBack }) {
  const [manual, setManual] = useState("");

  return (
    <div className="ttlKioskSparrowScreen">
      <div className="ttlKioskGlowTop" />
      <KioskFloatingBubbles count={7} />

      <div className="ttlKioskSparrowHeader">
        <button onClick={onBack} className="ttlKioskBackLink ttlKioskLogoLight">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <KioskLogo size={28} light />
        <span style={{ width: 32 }} />
      </div>

      <h2 className="ttlKioskSparrowTitle">Which table are you at?</h2>
      <p className="ttlKioskSparrowSub">Tap your table number, or type it in below</p>

      <div className="ttlKioskSparrowGridWrap ttlKioskNoScroll">
        <div className="ttlKioskSparrowGrid">
          {QUICK_PICK.map((n) => {
            const active = String(selectedTable) === String(n);
            return (
              <button
                key={n}
                onClick={() => { setManual(""); onSelect(n); }}
                className={`ttlKioskSparrowTable ${active ? "ttlKioskSparrowActive" : ""}`}
              >
                <span className="ttlKioskSparrowTableNum">{n}</span>
              </button>
            );
          })}
        </div>
        <div style={{ padding: "6px 2px 4px" }}>
          <label className="ttlKioskTigerFieldLabel" style={{ color: "rgba(250,246,238,0.5)" }}>Or enter table name/number</label>
          <input
            className="ttlKioskTigerInput"
            placeholder="e.g. Patio 3"
            value={manual}
            onChange={(e) => { setManual(e.target.value); onSelect(e.target.value); }}
          />
        </div>
      </div>

      <button onClick={onContinue} disabled={!selectedTable} className="ttlKioskPillBtn ttlKioskPillBtnPrimary" style={{ marginTop: 12 }}>
        {selectedTable ? `Continue with Table ${selectedTable}` : "Select a table to continue"}
      </button>
    </div>
  );
}
