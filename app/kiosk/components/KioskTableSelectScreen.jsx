"use client";
import React, { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";

const TABLE_COUNT = 15;

export default function KioskTableSelectScreen({ selectedTable, onSelect, onContinue, onBack, businessName }) {
  const [manual, setManual] = useState("");

  const tables = useMemo(() => Array.from({ length: TABLE_COUNT }, (_, i) => i + 1), []);

  const isManualSelected = selectedTable && !tables.some((n) => String(n) === String(selectedTable));

  const selectFromGrid = (num) => {
    setManual("");
    onSelect(String(num));
  };

  const selectFromManual = (value) => {
    setManual(value);
    onSelect(value);
  };

  return (
    <div className="w-full h-full bg-[#f5f7fb] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-2 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm active:scale-95 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex flex-col items-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
            <circle cx="12" cy="6" r="3" />
            <path d="M4 20v-2a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v2" strokeLinecap="round" />
          </svg>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Choose Your Table</h1>
          <p className="text-xs text-slate-500 mt-0.5">Please select an available table to continue</p>
        </div>

        <span className="text-sm font-bold text-slate-800 tracking-tight max-w-[160px] text-right truncate">
          {businessName || "Table Top Leo"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-2 no-scrollbar">
        <div className="grid grid-cols-3 gap-3">
          {tables.map((num) => {
            const active = String(selectedTable) === String(num);
            return (
              <button
                key={num}
                onClick={() => selectFromGrid(num)}
                className={`relative flex flex-col items-center justify-center rounded-2xl border py-4 transition active:scale-95 ${
                  active
                    ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
                    : "bg-gradient-to-b from-emerald-50/60 to-white border-slate-200"
                }`}
              >
                {active && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={active ? "#2563eb" : "#16a34a"} strokeWidth="1.8">
                  <rect x="3" y="9" width="18" height="4" rx="1" />
                  <path d="M4 13v4M20 13v4M2 9v-2a1 1 0 0 1 1-1h2M22 9v-2a1 1 0 0 0-1-1h-2" strokeLinecap="round" />
                </svg>
                <span className="text-xl font-extrabold text-slate-900 mt-1">{num}</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${active ? "bg-blue-500" : "bg-emerald-500"}`} />
              </button>
            );
          })}
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <label className="text-xs font-bold text-slate-500 mb-2 block">Or enter a table name / number manually</label>
          <input
            className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition ${
              isManualSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"
            }`}
            placeholder="e.g. Patio 3 or Table 21"
            value={isManualSelected ? selectedTable : manual}
            onChange={(e) => selectFromManual(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 flex-shrink-0 pt-2">
        <div className="flex items-center justify-center gap-5 bg-white border border-slate-200 rounded-full py-2 shadow-sm text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Available</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />Selected</span>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 py-4">
        <button
          onClick={onContinue}
          disabled={!selectedTable}
          className="w-full rounded-full py-3.5 font-bold text-sm text-white bg-blue-600 disabled:bg-slate-300 disabled:text-slate-500 transition active:scale-[0.99]"
        >
          {selectedTable ? `Continue with Table ${selectedTable}` : "Select a table to continue"}
        </button>
      </div>
    </div>
  );
}