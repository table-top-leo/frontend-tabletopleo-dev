"use client";
import { useEffect, useState } from "react";
import {
  Receipt, Loader2, CheckCircle2, Info, Percent,
} from "lucide-react";
import taxService from "../services/taxservice";
const TAX_SYSTEM_PRESETS = [
  { value: "GST",        label: "GST — Goods & Services Tax" },
  { value: "VAT",        label: "VAT — Value Added Tax" },
  { value: "SALES_TAX",  label: "Sales Tax" },
  { value: "OTHER",      label: "Other / Custom" },
];

const EMPTY = {
  taxEnabled: false,
  taxSystem: "GST",
  taxInclusive: false,
  defaultTaxRate: "",
  taxRegistrationNumber: "",
};

export default function TaxBillingSetup() {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [draft, setDraft]       = useState(EMPTY);
  const [customSystem, setCustomSystem] = useState("");
  const [toast, setToast]       = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  const load = () => {
    setLoading(true);
    setError("");
    taxService.getMyTaxConfiguration()
      .then((res) => {
        if (res.success) {
          const d = res.data || {};
          const isPreset = TAX_SYSTEM_PRESETS.some(p => p.value === d.taxSystem);
          setDraft({
            taxEnabled: !!d.taxEnabled,
            taxSystem: d.taxSystem ? (isPreset ? d.taxSystem : "OTHER") : "GST",
            taxInclusive: !!d.taxInclusive,
            defaultTaxRate: d.defaultTaxRate != null ? String(d.defaultTaxRate) : "",
            taxRegistrationNumber: d.taxRegistrationNumber || "",
          });
          if (d.taxSystem && !isPreset) setCustomSystem(d.taxSystem);
        } else {
          setError(res.message || "Failed to load tax configuration.");
        }
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load tax configuration."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setError("");
    const resolvedSystem = draft.taxSystem === "OTHER" ? customSystem.trim() : draft.taxSystem;

    if (draft.taxEnabled) {
      if (!resolvedSystem) return setError("Please select or enter a tax system.");
      if (draft.defaultTaxRate === "" || Number(draft.defaultTaxRate) < 0) {
        return setError("Please enter a valid tax rate.");
      }
    }

    setSaving(true);
    try {
      const payload = {
        taxEnabled: draft.taxEnabled,
        taxSystem: draft.taxEnabled ? resolvedSystem : (resolvedSystem || null),
        taxInclusive: draft.taxInclusive,
        defaultTaxRate: draft.defaultTaxRate === "" ? null : Number(draft.defaultTaxRate),
        taxRegistrationNumber: draft.taxRegistrationNumber || null,
      };
      const res = await taxService.updateMyTaxConfiguration(payload);
      if (!res.success) throw new Error(res.message);
      showToast(draft.taxEnabled ? "Tax enabled and saved ✓" : "Tax disabled ✓");
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save tax configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <Loader2 size={26} style={{ animation: "txSpin 0.8s linear infinite" }} color="#9ca3af" />
        <style>{`@keyframes txSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 60px", fontFamily: "inherit" }}>
      {toast.show && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: toast.type === "success" ? "#18181b" : "#dc2626", color: "#fff", padding: "11px 24px", borderRadius: 30, fontSize: 13.5, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#F2701D,#F0A500)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(242,112,29,0.3)" }}>
          <Receipt size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#111827" }}>Tax & Billing</div>
          <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 2 }}>Control whether — and how — tax is charged to your customers</div>
        </div>
      </div>

      {/* Enable toggle card — always visible, top of page */}
      <div style={{ background: "#fff", border: "1px solid #f0e4d6", borderRadius: 16, padding: "18px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: "#111827" }}>Enable Tax</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3, lineHeight: 1.5 }}>
            {draft.taxEnabled
              ? "Tax is currently enabled — configure the details below."
              : "Tax is currently disabled. Customers won't see or pay any tax. No further setup needed."}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDraft((d) => ({ ...d, taxEnabled: !d.taxEnabled }))}
          style={{ width: 50, height: 28, borderRadius: 999, background: draft.taxEnabled ? "#16a34a" : "#d1d5db", position: "relative", border: "none", cursor: "pointer", flexShrink: 0, marginLeft: 16 }}
        >
          <span style={{ position: "absolute", top: 3, left: draft.taxEnabled ? 25 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
        </button>
      </div>

      {/* Preview strip — always visible, shows exactly what the customer will see */}
      <div style={{ background: "#f9fafb", border: "1px dashed #e5e7eb", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 12.5, color: "#6b7280" }}>
        <div style={{ fontWeight: 700, color: "#9ca3af", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Customer will see</div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>Subtotal</span><span>500.00</span></div>
        {draft.taxEnabled && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
            <span>{draft.taxSystem === "OTHER" ? (customSystem || "Tax") : (TAX_SYSTEM_PRESETS.find(p => p.value === draft.taxSystem)?.value || "Tax")}</span>
            <span>{draft.defaultTaxRate ? (500 * Number(draft.defaultTaxRate) / 100).toFixed(2) : "—"}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 0", fontWeight: 800, color: "#111827", borderTop: "1px solid #e5e7eb", marginTop: 4 }}>
          <span>Total</span>
          <span>{draft.taxEnabled && draft.defaultTaxRate ? (500 + 500 * Number(draft.defaultTaxRate) / 100).toFixed(2) : "500.00"}</span>
        </div>
      </div>

      {/* Detailed config — only shown when tax is enabled */}
      {draft.taxEnabled && (
        <div style={{ background: "#fff", border: "1px solid #f0e4d6", borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

          <div>
            <label style={fieldLabel}>Tax System <span style={{ color: "#dc2626" }}>*</span></label>
            <select value={draft.taxSystem} onChange={(e) => setDraft((d) => ({ ...d, taxSystem: e.target.value }))} style={fieldInput}>
              {TAX_SYSTEM_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            {draft.taxSystem === "OTHER" && (
              <input
                value={customSystem}
                onChange={(e) => setCustomSystem(e.target.value)}
                placeholder="Enter your tax system name (e.g. Consumption Tax)"
                style={{ ...fieldInput, marginTop: 8 }}
              />
            )}
          </div>

          <div>
            <label style={fieldLabel}>Tax Registration Number <span style={{ color: "#9ca3af", fontWeight: 500 }}>(optional)</span></label>
            <input
              value={draft.taxRegistrationNumber}
              onChange={(e) => setDraft((d) => ({ ...d, taxRegistrationNumber: e.target.value }))}
              placeholder="e.g. GSTIN / VAT number"
              style={fieldInput}
            />
          </div>

          <div>
            <label style={fieldLabel}>Default Tax Rate (%) <span style={{ color: "#dc2626" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <input
                type="number" min="0" step="0.001"
                value={draft.defaultTaxRate}
                onChange={(e) => setDraft((d) => ({ ...d, defaultTaxRate: e.target.value }))}
                placeholder="e.g. 5"
                style={{ ...fieldInput, paddingRight: 32 }}
              />
              <Percent size={13} color="#9ca3af" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} />
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
              This is your rate to configure — we don't assume or hardcode any legal tax rate for you.
            </div>
          </div>

          <div>
            <label style={fieldLabel}>Tax Calculation</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, taxInclusive: false }))}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "12px 14px", borderRadius: 10, border: !draft.taxInclusive ? "2px solid #F2701D" : "2px solid #f0e4d6", background: !draft.taxInclusive ? "#FBF3EC" : "#fff", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>Tax Exclusive</span>
                <span style={{ fontSize: 10.5, color: "#9ca3af" }}>Tax added on top of menu price</span>
              </button>
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, taxInclusive: true }))}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "12px 14px", borderRadius: 10, border: draft.taxInclusive ? "2px solid #F2701D" : "2px solid #f0e4d6", background: draft.taxInclusive ? "#FBF3EC" : "#fff", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>Tax Inclusive</span>
                <span style={{ fontSize: 10.5, color: "#9ca3af" }}>Menu price already includes tax</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, color: "#dc2626", fontSize: 12.5, fontWeight: 600 }}>
          ⚠ {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: 18, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 11, border: "none", background: saving ? "#e5e7eb" : "linear-gradient(135deg,#F2701D,#F0A500)", color: saving ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer" }}
      >
        {saving ? <Loader2 size={16} style={{ animation: "txSpin 0.8s linear infinite" }} /> : <CheckCircle2 size={16} />}
        {saving ? "Saving..." : "Save Configuration"}
      </button>

      <div style={{ marginTop: 18, display: "flex", gap: 10, padding: "12px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, fontSize: 12, color: "#1e40af" }}>
        <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          Changes here only affect <strong>future</strong> orders. Orders already placed keep the tax
          rate and system that applied when the customer paid — past invoices never change.
        </div>
      </div>
    </div>
  );
}

const fieldLabel = { display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 };
const fieldInput = { width: "100%", padding: "10px 13px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#111827" };