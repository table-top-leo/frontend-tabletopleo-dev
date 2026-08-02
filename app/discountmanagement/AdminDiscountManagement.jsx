"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Tag, Plus, X, Loader2, Percent, IndianRupee, Layers, Store,
  Calendar, Clock, CheckCircle2, XCircle, PauseCircle, Trash2,
  Edit2, Search, Sparkles, PartyPopper, Sun, Gift, Flame,
} from "lucide-react";
import api from "../services/axiosInterceptor";
import discountService from "../services/discountService";
import { useCurrency } from "../context/CurrencyContext";
import { formatCurrency } from "../utils/currencyHelper";

const OFFER_CATEGORIES = [
  { key: "PROMOTIONAL", label: "Promotional", icon: Sparkles, color: "#7c3aed" },
  { key: "FESTIVAL",    label: "Festival",     icon: PartyPopper, color: "#dc2626" },
  { key: "COMBO",       label: "Combo",        icon: Gift,     color: "#0ea5e9" },
  { key: "HAPPY_HOUR",  label: "Happy Hour",   icon: Sun,      color: "#f59e0b" },
  { key: "GENERAL",     label: "General",      icon: Tag,      color: "#16a34a" },
];

const DISCOUNT_TYPES = [
  { key: "PERCENTAGE",   label: "Percentage Off", icon: Percent },
  { key: "FLAT_AMOUNT",  label: "Flat Amount Off", icon: IndianRupee },
  { key: "COMBO_PRICE",  label: "Combo Fixed Price", icon: Gift },
];

const SCOPES = [
  { key: "ITEM",      label: "Specific Items",  icon: Tag,   desc: "Discount applies to one or more chosen items" },
  { key: "CATEGORY",  label: "Whole Category",  icon: Layers, desc: "Discount applies to every item in a category" },
  { key: "COMBO",      label: "Combo Offer",     icon: Gift,  desc: "Pick 2+ items sold together at a fixed price" },
  { key: "STOREWIDE",  label: "Storewide",       icon: Store, desc: "Discount applies to the whole order" },
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const STATUS_CFG = {
  ACTIVE_NOW: { label: "Live Now",  color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
  SCHEDULED:  { label: "Scheduled", color: "#0ea5e9", bg: "#eff6ff", icon: Clock },
  EXPIRED:    { label: "Expired",   color: "#6b7280", bg: "#f3f4f6", icon: XCircle },
  DISABLED:   { label: "Disabled",  color: "#dc2626", bg: "#fef2f2", icon: PauseCircle },
};

const EMPTY_FORM = {
  title: "", description: "", offerCategory: "PROMOTIONAL", discountType: "PERCENTAGE",
  discountValue: "", scope: "ITEM", productIds: [], categoryId: "", minCartValue: "",
  startDate: "", endDate: "", startTime: "", endTime: "", daysOfWeek: [], active: true,
};

function todayStr() { return new Date().toISOString().slice(0, 10); }

export default function AdminDiscountManagement() {
  const { currencyCode } = useCurrency();

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch]       = useState("");

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");

  const loadDiscounts = () => {
    setLoading(true);
    setError("");
    discountService.getMyDiscounts()
      .then((res) => { if (res.success) setDiscounts(res.data || []); else setError(res.message || "Failed to load discounts"); })
      .catch((e) => setError(e.response?.data?.message || "Failed to load discounts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDiscounts();
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem("ttl_user") || "{}");
        if (!user.adminId) return;
        const [prodRes, catRes] = await Promise.all([
          api.get(`/api/products/admin/${user.adminId}`),
          api.get(`/api/categories/admin/${user.adminId}`),
        ]);
        if (prodRes.data?.success) setProducts(prodRes.data.data || []);
        if (catRes.data?.success) setCategories(catRes.data.data || []);
      } catch { /* menu list is optional context for the picker — fail quietly */ }
    })();
  }, []);

  const stats = useMemo(() => ({
    live: discounts.filter((d) => d.computedStatus === "ACTIVE_NOW").length,
    scheduled: discounts.filter((d) => d.computedStatus === "SCHEDULED").length,
    combos: discounts.filter((d) => d.scope === "COMBO").length,
    total: discounts.length,
  }), [discounts]);

  const filtered = useMemo(() => {
    return discounts.filter((d) => {
      if (statusFilter !== "ALL" && d.computedStatus !== statusFilter) return false;
      if (search.trim() && !d.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [discounts, statusFilter, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, startDate: todayStr(), endDate: todayStr() });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditingId(d.discountId);
    setForm({
      title: d.title, description: d.description || "",
      offerCategory: d.offerCategory, discountType: d.discountType,
      discountValue: String(d.discountValue), scope: d.scope,
      productIds: d.productIds || [], categoryId: d.categoryId ? String(d.categoryId) : "",
      minCartValue: d.minCartValue ? String(d.minCartValue) : "",
      startDate: d.startDate, endDate: d.endDate,
      startTime: d.startTime || "", endTime: d.endTime || "",
      daysOfWeek: d.daysOfWeek || [], active: d.active,
    });
    setFormError("");
    setModalOpen(true);
  };

  const toggleDay = (day) => setForm((f) => ({
    ...f, daysOfWeek: f.daysOfWeek.includes(day) ? f.daysOfWeek.filter((d) => d !== day) : [...f.daysOfWeek, day],
  }));

  const toggleProduct = (id) => setForm((f) => ({
    ...f, productIds: f.productIds.includes(id) ? f.productIds.filter((p) => p !== id) : [...f.productIds, id],
  }));

  const handleScopeChange = (scope) => {
    setForm((f) => ({
      ...f, scope,
      discountType: scope === "COMBO" ? "COMBO_PRICE" : (f.discountType === "COMBO_PRICE" ? "PERCENTAGE" : f.discountType),
      productIds: [], categoryId: "",
    }));
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.title.trim()) return setFormError("Please enter a title.");
    if (!form.discountValue || Number(form.discountValue) <= 0) return setFormError("Please enter a value greater than 0.");
    if (!form.startDate || !form.endDate) return setFormError("Please set a start and end date.");
    if (form.scope === "ITEM" && form.productIds.length === 0) return setFormError("Select at least one item.");
    if (form.scope === "COMBO" && form.productIds.length < 2) return setFormError("A combo needs at least 2 items selected.");
    if (form.scope === "CATEGORY" && !form.categoryId) return setFormError("Select a category.");

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      offerCategory: form.offerCategory,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      scope: form.scope,
      productIds: (form.scope === "ITEM" || form.scope === "COMBO") ? form.productIds : null,
      categoryId: form.scope === "CATEGORY" ? Number(form.categoryId) : null,
      minCartValue: form.scope === "STOREWIDE" && form.minCartValue ? Number(form.minCartValue) : null,
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      daysOfWeek: form.daysOfWeek.length > 0 ? form.daysOfWeek : null,
      active: form.active,
    };

    try {
      const res = editingId
        ? await discountService.updateDiscount(editingId, payload)
        : await discountService.createDiscount(payload);
      if (!res.success) throw new Error(res.message);
      setModalOpen(false);
      loadDiscounts();
    } catch (e) {
      setFormError(e.response?.data?.message || e.message || "Failed to save discount");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (d) => {
    try {
      await discountService.toggleActive(d.discountId, !d.active);
      loadDiscounts();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (discountId) => {
    if (!window.confirm("Delete this discount? This can't be undone.")) return;
    try {
      await discountService.deleteDiscount(discountId);
      loadDiscounts();
    } catch (e) { console.error(e); }
  };

  const valueLabel = form.discountType === "PERCENTAGE" ? "% off" : form.discountType === "FLAT_AMOUNT" ? `${currencyCode} off` : `Fixed combo price (${currencyCode})`;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 60px", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#F2701D,#F0A500)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(242,112,29,0.3)" }}>
            <Tag size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#111827" }}>Discount Management</div>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 1 }}>Promotions, festival offers, happy hours, and combo deals</div>
          </div>
        </div>
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#F2701D,#F0A500)", color: "#fff", border: "none", padding: "11px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(242,112,29,0.28)" }}>
          <Plus size={16} /> Create Discount
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: "Live Now", value: stats.live, icon: Flame, color: "#dc2626", bg: "#fef2f2" },
          { label: "Scheduled", value: stats.scheduled, icon: Clock, color: "#0ea5e9", bg: "#eff6ff" },
          { label: "Combo Offers", value: stats.combos, icon: Gift, color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Total Discounts", value: stats.total, icon: Tag, color: "#16a34a", bg: "#f0fdf4" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #f0e4d6", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={15} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: "#f9fafb", border: "1px solid #f0e4d6", borderRadius: 10, padding: 4 }}>
          {["ALL", "ACTIVE_NOW", "SCHEDULED", "EXPIRED", "DISABLED"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "7px 13px", borderRadius: 7, border: "none", background: statusFilter === s ? "#fff" : "transparent", boxShadow: statusFilter === s ? "0 1px 3px rgba(0,0,0,0.1)" : "none", fontSize: 12, fontWeight: 700, color: statusFilter === s ? "#111827" : "#9ca3af", cursor: "pointer" }}>
              {s === "ALL" ? "All" : STATUS_CFG[s].label}
            </button>
          ))}
        </div>
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search discounts..." style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 12.5, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #f0e4d6", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}><Loader2 size={26} style={{ animation: "adSpin 0.8s linear infinite" }} color="#9ca3af" /></div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: "center", color: "#dc2626", fontSize: 13, fontWeight: 600 }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Tag size={32} color="#d1d5db" style={{ margin: "0 auto 10px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>No discounts yet</div>
            <div style={{ fontSize: 12.5, color: "#9ca3af", marginTop: 4 }}>Create your first promotional offer, festival sale, or combo deal.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f0e4d6" }}>
                  {["Offer", "Type", "Scope", "Value", "Schedule", "Status", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "11px 16px", fontSize: 10.5, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const cat = OFFER_CATEGORIES.find((c) => c.key === d.offerCategory) || OFFER_CATEGORIES[0];
                  const st = STATUS_CFG[d.computedStatus] || STATUS_CFG.SCHEDULED;
                  return (
                    <tr key={d.discountId} style={{ borderBottom: "1px solid #f6ece0" }}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <cat.icon size={15} color={cat.color} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#111827" }}>{d.title}</div>
                            <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{cat.label}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", color: "#6b7280" }}>{DISCOUNT_TYPES.find((t) => t.key === d.discountType)?.label}</td>
                      <td style={{ padding: "13px 16px", color: "#6b7280" }}>
                        {d.scope === "ITEM" && `${(d.productNames || []).length} item(s)`}
                        {d.scope === "CATEGORY" && (d.categoryName || "Category")}
                        {d.scope === "COMBO" && `${(d.productNames || []).length}-item combo`}
                        {d.scope === "STOREWIDE" && "Whole order"}
                      </td>
                      <td style={{ padding: "13px 16px", fontWeight: 700, color: "#111827" }}>
                        {d.discountType === "PERCENTAGE" ? `${d.discountValue}%` : formatCurrency(d.discountValue, currencyCode)}
                      </td>
                      <td style={{ padding: "13px 16px", color: "#6b7280", fontSize: 11.5 }}>
                        {d.startDate} → {d.endDate}
                        {d.startTime && d.endTime && <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{d.startTime}–{d.endTime}</div>}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 10.5, fontWeight: 800, color: st.color, background: st.bg }}>
                          <st.icon size={11} /> {st.label}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button onClick={() => handleToggle(d)} title={d.active ? "Disable" : "Enable"} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: d.active ? "#16a34a" : "#9ca3af" }}>
                            {d.active ? <CheckCircle2 size={14} /> : <PauseCircle size={14} />}
                          </button>
                          <button onClick={() => openEdit(d)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(d.discountId)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#dc2626" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(36,22,8,0.5)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 70px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 26px", borderBottom: "1px solid #f0e4d6" }}>
              <div style={{ fontSize: 16.5, fontWeight: 800 }}>{editingId ? "Edit Discount" : "Create New Discount"}</div>
              <button onClick={() => setModalOpen(false)} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            </div>

            <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Title + description */}
              <div>
                <label style={fieldLabel}>Title <span style={{ color: "#dc2626" }}>*</span></label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Happy Hour Butter Chicken" style={fieldInput} />
              </div>
              <div>
                <label style={fieldLabel}>Description (optional)</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Internal note about this offer..." style={{ ...fieldInput, resize: "none" }} />
              </div>

              {/* Offer category */}
              <div>
                <label style={fieldLabel}>Offer Category</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                  {OFFER_CATEGORIES.map((c) => (
                    <button key={c.key} onClick={() => setForm((f) => ({ ...f, offerCategory: c.key }))} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 6px", borderRadius: 10, border: form.offerCategory === c.key ? `2px solid ${c.color}` : "2px solid #f0e4d6", background: form.offerCategory === c.key ? `${c.color}12` : "#fff", cursor: "pointer" }}>
                      <c.icon size={16} color={c.color} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#374151", textAlign: "center" }}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope */}
              <div>
                <label style={fieldLabel}>Applies To</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                  {SCOPES.map((s) => (
                    <button key={s.key} onClick={() => handleScopeChange(s.key)} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "11px 13px", borderRadius: 10, border: form.scope === s.key ? "2px solid #F2701D" : "2px solid #f0e4d6", background: form.scope === s.key ? "#FBF3EC" : "#fff", cursor: "pointer", textAlign: "left" }}>
                      <s.icon size={16} color={form.scope === s.key ? "#F2701D" : "#9ca3af"} style={{ marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>{s.label}</div>
                        <div style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 1 }}>{s.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Item picker */}
              {(form.scope === "ITEM" || form.scope === "COMBO") && (
                <div>
                  <label style={fieldLabel}>
                    {form.scope === "COMBO" ? "Select Combo Items (2 or more)" : "Select Items"} <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <div style={{ maxHeight: 180, overflowY: "auto", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: 8 }}>
                    {products.length === 0 ? (
                      <div style={{ padding: 14, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>No menu items found</div>
                    ) : products.map((p) => (
                      <label key={p.productId} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 7, cursor: "pointer" }}>
                        <input type="checkbox" checked={form.productIds.includes(p.productId)} onChange={() => toggleProduct(p.productId)} style={{ accentColor: "#F2701D" }} />
                        <span style={{ fontSize: 12.5, color: "#374151" }}>{p.itemName}</span>
                        <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>{formatCurrency(p.itemPrice, currencyCode)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Category picker */}
              {form.scope === "CATEGORY" && (
                <div>
                  <label style={fieldLabel}>Category <span style={{ color: "#dc2626" }}>*</span></label>
                  <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} style={fieldInput}>
                    <option value="">Select a category...</option>
                    {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                  </select>
                </div>
              )}

              {/* Min cart value */}
              {form.scope === "STOREWIDE" && (
                <div>
                  <label style={fieldLabel}>Minimum Cart Value (optional)</label>
                  <input type="number" min="0" value={form.minCartValue} onChange={(e) => setForm((f) => ({ ...f, minCartValue: e.target.value }))} placeholder={`e.g. 500 (leave blank for no minimum)`} style={fieldInput} />
                </div>
              )}

              {/* Discount type + value */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={fieldLabel}>Discount Type</label>
                  <select value={form.discountType} disabled={form.scope === "COMBO"} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))} style={{ ...fieldInput, opacity: form.scope === "COMBO" ? 0.6 : 1 }}>
                    {DISCOUNT_TYPES.filter((t) => form.scope === "COMBO" ? t.key === "COMBO_PRICE" : t.key !== "COMBO_PRICE").map((t) => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={fieldLabel}>Value — {valueLabel} <span style={{ color: "#dc2626" }}>*</span></label>
                  <input type="number" min="0" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} placeholder={form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 50"} style={fieldInput} />
                </div>
              </div>

              {/* Date range */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={fieldLabel}><Calendar size={11} style={{ marginRight: 4 }} />Start Date <span style={{ color: "#dc2626" }}>*</span></label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} style={fieldInput} />
                </div>
                <div>
                  <label style={fieldLabel}><Calendar size={11} style={{ marginRight: 4 }} />End Date <span style={{ color: "#dc2626" }}>*</span></label>
                  <input type="date" min={form.startDate} value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} style={fieldInput} />
                </div>
              </div>

              {/* Time window */}
              <div>
                <label style={fieldLabel}><Clock size={11} style={{ marginRight: 4 }} />Time Window (optional — leave blank for all-day)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} style={fieldInput} />
                  <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} style={fieldInput} />
                </div>
              </div>

              {/* Days of week */}
              <div>
                <label style={fieldLabel}>Active Days (optional — leave blank for every day)</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DAYS.map((day) => (
                    <button key={day} onClick={() => toggleDay(day)} style={{ padding: "7px 13px", borderRadius: 8, border: form.daysOfWeek.includes(day) ? "2px solid #F2701D" : "2px solid #f0e4d6", background: form.daysOfWeek.includes(day) ? "#FBF3EC" : "#fff", fontSize: 11.5, fontWeight: 700, color: form.daysOfWeek.includes(day) ? "#F2701D" : "#6b7280", cursor: "pointer" }}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#f9fafb", borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>Enable this discount</div>
                  <div style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 1 }}>You can toggle this off anytime without deleting it</div>
                </div>
                <button onClick={() => setForm((f) => ({ ...f, active: !f.active }))} style={{ width: 46, height: 26, borderRadius: 999, background: form.active ? "#16a34a" : "#d1d5db", position: "relative", border: "none", cursor: "pointer" }}>
                  <span style={{ position: "absolute", top: 3, left: form.active ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
                </button>
              </div>

              {formError && <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, color: "#dc2626", fontSize: 12, fontWeight: 600 }}>⚠ {formError}</div>}

              <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 11, border: "none", background: saving ? "#e5e7eb" : "linear-gradient(135deg,#F2701D,#F0A500)", color: saving ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? <Loader2 size={16} style={{ animation: "adSpin 0.8s linear infinite" }} /> : <CheckCircle2 size={16} />}
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Discount"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes adSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const fieldLabel = { display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 };
const fieldInput = { width: "100%", padding: "10px 13px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#111827" };
