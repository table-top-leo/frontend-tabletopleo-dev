import React, { useMemo } from "react";
import Logo from "./Logo";
import FloatingBubbles from "./FloatingBubbles";

export default function TableSelectScreen({ tableCount = 24, selectedTable, onSelect, onContinue, onBack }) {
  const tables = useMemo(
    () => Array.from({ length: tableCount }, (_, i) => i + 1),
    [tableCount]
  );

  return (
    <div className="relative w-full h-full bg-ink flex flex-col px-5 pt-6 pb-5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(224,151,63,0.14),transparent_55%)]" />
      <FloatingBubbles count={7} />

      <div className="relative flex items-center justify-between mb-5">
        <button onClick={onBack} className="text-cream/50 text-xs flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <Logo size={28} light />
        <span className="w-8" />
      </div>

      <h2 className="relative font-display font-semibold text-cream text-xl text-center mb-1">
        Which table are you at?
      </h2>
      <p className="relative text-cream/45 text-xs text-center mb-5">
        Tap your table number to continue
      </p>

      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-4 gap-2.5 pb-3">
          {tables.map((n) => {
            const active = selectedTable === n;
            return (
              <button
                key={n}
                onClick={() => onSelect(n)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-colors ${
                  active
                    ? "bg-ember text-ink border-ember"
                    : "bg-ink2 text-cream/80 border-white/10 active:bg-white/5"
                }`}
              >
                <span className="font-display font-semibold text-lg">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onContinue}
        disabled={!selectedTable}
        className={`relative mt-3 w-full rounded-full py-3.5 font-semibold text-sm transition-colors ${
          selectedTable
            ? "bg-ember text-ink active:bg-ember-deep"
            : "bg-white/5 text-cream/25"
        }`}
      >
        {selectedTable ? `Continue with Table ${selectedTable}` : "Select a table to continue"}
      </button>
    </div>
  );
}
