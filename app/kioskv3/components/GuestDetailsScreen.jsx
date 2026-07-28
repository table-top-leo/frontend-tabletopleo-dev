import React, { useMemo, useState } from "react";
import Logo from "./Logo";
import { formatCurrency } from "../../utils/currencyHelper";

function Field({ label, required, error, children }) {
  return (
    <label className="block mb-3.5">
      <span className="text-[11px] font-semibold text-charcoal/70 mb-1.5 block">
        {label} {required && <span className="text-ember-deep">*</span>}
      </span>
      {children}
      {error && <span className="text-[10.5px] text-claret mt-1 block">{error}</span>}
    </label>
  );
}

export default function GuestDetailsScreen({
  orderType,
  tableNumber,
  onChangeTable,
  guest,
  onSave,
  onBack,
  total,
  currencyCode,
}) {
  const [form, setForm] = useState({
    name: guest?.name || "",
    phone: guest?.phone || "",
    notes: guest?.notes || "",
  });
  const [errors, setErrors] = useState({});

  const quickTables = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    if (!form.phone.trim()) e.phone = "Please enter a phone number";
    if (orderType === "dine-in" && !tableNumber) e.table = "Select a table";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleContinue() {
    if (validate()) onSave(form);
  }

  const inputClass =
    "w-full bg-white border border-charcoal/15 rounded-xl px-3.5 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ember focus:ring-2 focus:ring-ember/20";

  return (
    <div className="relative w-full h-full bg-sand flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 bg-cream border-b border-charcoal/8">
        <button onClick={onBack} className="text-charcoal/50 text-xs flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <Logo size={26} />
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-5 pb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ember-deep font-semibold">Almost there</p>
        <h2 className="font-display font-semibold text-charcoal text-xl mt-0.5 mb-5">
          Tell us who this order is for
        </h2>

        <div className="bg-white rounded-2xl p-4 mb-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-charcoal">
              <span className="w-2 h-2 rounded-full bg-moss" />
              {orderType === "dine-in" ? "Dine In" : "Takeaway"}
            </div>
            {orderType === "dine-in" && tableNumber && (
              <span className="text-xs text-muted">Table {tableNumber} selected</span>
            )}
          </div>

          {orderType === "dine-in" && (
            <div className="mt-3.5">
              <span className="text-[11px] font-semibold text-charcoal/70 mb-1.5 block">
                Table number <span className="text-ember-deep">*</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickTables.map((n) => (
                  <button
                    key={n}
                    onClick={() => onChangeTable(n)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      tableNumber === n
                        ? "bg-ember text-ink"
                        : "bg-sand text-charcoal/60 active:bg-charcoal/10"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {errors.table && <p className="text-[10.5px] text-claret mt-2">{errors.table}</p>}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <Field label="Full name" required error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Alex Morgan"
              className={inputClass}
            />
          </Field>

          <Field label="Phone number" required error={errors.phone}>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 98765 43210"
              inputMode="tel"
              className={inputClass}
            />
          </Field>

          <Field label="Order notes (optional)">
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Allergies, extra napkins, no onions..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>

          <p className="text-[10.5px] text-muted flex items-center gap-1.5 mt-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M12 8v.01M12 11v5" strokeLinecap="round" />
            </svg>
            We'll ask for an email after checkout, only if you'd like a copy of your bill.
          </p>
        </div>
      </div>

      <div className="px-5 py-4 bg-cream border-t border-charcoal/8">
        <button
          onClick={handleContinue}
          className="w-full rounded-full py-3.5 text-sm font-semibold bg-ember text-ink active:bg-ember-deep flex items-center justify-center gap-2"
        >
          Continue to payment · {formatCurrency(total, currencyCode)}
        </button>
      </div>
    </div>
  );
}
