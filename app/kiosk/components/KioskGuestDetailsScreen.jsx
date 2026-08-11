"use client";
import React, { useState } from "react";
import KioskLogo from "./KioskLogo";
import { formatCurrency } from "../../utils/currencyHelper";

function Field({ label, required, error, children }) {
  return (
    <label className="ttlKioskTigerField" style={{ display: "block" }}>
      <span className="ttlKioskTigerFieldLabel">
        {label} {required && <span className="ttlKioskTigerReq">*</span>}
      </span>
      {children}
      {error && <span className="ttlKioskTigerErr">{error}</span>}
    </label>
  );
}

export default function KioskGuestDetailsScreen({ orderType, hasTableService, tableNumber, onChangeTable, guest, total, currencyCode, onSave, onBack }) {
  const [form, setForm] = useState({
    name: guest?.name || "",
    phone: guest?.phone || "",
    email: guest?.email || "",
    notes: guest?.notes || "",
  });
  const [errors, setErrors] = useState({});

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e2) => ({ ...e2, [field]: "" }));
  };

  const setPhone = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phone: digits }));
    setErrors((e2) => ({ ...e2, phone: "" }));
  };

  function validate() {
    const e = {};
    const phone = form.phone.trim();
    if (orderType === "takeaway") {
      if (!form.name.trim()) e.name = "Please enter your name";
      if (!phone) e.phone = "Phone number is required for Takeaway";
      else if (!/^\d{10}$/.test(phone)) e.phone = "Enter a valid 10-digit phone number";
    } else {
      if (phone && !/^\d{10}$/.test(phone)) e.phone = "Enter a valid 10-digit phone number";
    }
    if (orderType === "dine-in" && hasTableService && !tableNumber) e.table = "Select a table";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleContinue = () => { if (validate()) onSave(form); };

  return (
    <div className="ttlKioskTigerScreen">
      <div className="ttlKioskTopbarLight">
        <button onClick={onBack} className="ttlKioskBackLink ttlKioskLogoDark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <KioskLogo size={26} />
        <span style={{ width: 32 }} />
      </div>

      <div className="ttlKioskTigerBody ttlKioskNoScroll">
        <p className="ttlKioskTigerEyebrow">Almost there</p>
        <h2 className="ttlKioskTigerTitle">Tell us who this order is for</h2>

        <div className="ttlKioskTigerCard">
          <div className="ttlKioskTigerCardRow">
            <div className="ttlKioskTigerCardType">
              <span className="ttlKioskTigerDot" />
              {orderType === "dine-in" ? "Dine In" : "Takeaway"}
            </div>
          </div>

          {orderType === "dine-in" && hasTableService && (
            <div style={{ marginTop: 14 }}>
              <span className="ttlKioskTigerFieldLabel">
                Table number <span className="ttlKioskTigerReq">*</span>
              </span>
              <input
                className="ttlKioskTigerInput"
                placeholder="e.g. Table 5"
                value={tableNumber || ""}
                onChange={(e) => onChangeTable(e.target.value)}
              />
              {errors.table && <p className="ttlKioskTigerErr">{errors.table}</p>}
            </div>
          )}
          {orderType === "dine-in" && !hasTableService && (
            <p style={{ fontSize: 11.5, color: "var(--kiosk-muted)", marginTop: 10 }}>
              We'll call your name when it's ready — no table number needed here.
            </p>
          )}
        </div>

        <div className="ttlKioskTigerCard">
          <Field label="Full name" required={orderType === "takeaway"} error={errors.name}>
            <input className="ttlKioskTigerInput" placeholder="e.g. Alex Morgan" value={form.name} onChange={update("name")} />
          </Field>

          <Field label="Phone number" required={orderType === "takeaway"} error={errors.phone}>
            <input
              className="ttlKioskTigerInput"
              placeholder="10-digit number"
              value={form.phone}
              onChange={setPhone}
              type="tel"
              inputMode="numeric"
              maxLength={10}
            />
          </Field>

          <Field label="Email (optional)">
            <input className="ttlKioskTigerInput" placeholder="you@email.com" value={form.email} onChange={update("email")} type="email" />
          </Field>

          <Field label="Order notes (optional)">
            <textarea
              className="ttlKioskTigerTextarea"
              value={form.notes}
              onChange={update("notes")}
              placeholder="Allergies, extra napkins, no onions..."
              rows={3}
            />
          </Field>

          <p className="ttlKioskTigerFootnote">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="9.5" />
              <path d="M12 8v.01M12 11v5" strokeLinecap="round" />
            </svg>
            We'll ask for an email after checkout too, only if you'd like a copy of your bill.
          </p>
        </div>
      </div>

      <div className="ttlKioskTigerFooter">
        <button onClick={handleContinue} className="ttlKioskPillBtn ttlKioskPillBtnPrimary">
          Continue to payment · {formatCurrency(total, currencyCode)}
        </button>
      </div>
    </div>
  );
}
