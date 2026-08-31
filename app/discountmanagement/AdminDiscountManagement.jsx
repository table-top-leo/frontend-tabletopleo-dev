"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Tag, Plus, X, Loader2, Percent, IndianRupee, Layers, Store,
  Calendar, Clock, CheckCircle2, XCircle, PauseCircle, Trash2,
  Edit2, Search, Sparkles, PartyPopper, Sun, Gift, Flame,
  ImagePlus, ImageOff, Info, Wand2, Radio,
} from "lucide-react";
import api from "../services/axiosInterceptor";
import discountService from "../services/discountService";
import { useCurrency } from "../context/CurrencyContext";
import { formatCurrency } from "../utils/currencyHelper";
import useWebSocket from "../hooks/useWebSocket";
import { useLanguage } from "../context/LanguageContext";

function buildOfferCategories(t) {
  return [
    { key: "PROMOTIONAL", label: t("dm_cat_promotional"), icon: Sparkles, color: "#7c3aed" },
    { key: "FESTIVAL",    label: t("dm_cat_festival"),    icon: PartyPopper, color: "#dc2626" },
    { key: "COMBO",       label: t("dm_cat_combo"),       icon: Gift,     color: "#0ea5e9" },
    { key: "HAPPY_HOUR",  label: t("dm_cat_happy_hour"),  icon: Sun,      color: "#f59e0b" },
    { key: "GENERAL",     label: t("dm_cat_general"),     icon: Tag,      color: "#16a34a" },
  ];
}

function buildDiscountTypes(t) {
  return [
    { key: "PERCENTAGE",   label: t("dm_dt_percentage"), icon: Percent },
    { key: "FLAT_AMOUNT",  label: t("dm_dt_flat"),        icon: IndianRupee },
    { key: "COMBO_PRICE",  label: t("dm_dt_combo_price"), icon: Gift },
  ];
}

function buildScopes(t) {
  return [
    { key: "ITEM",      label: t("dm_scope_item_label"),      icon: Tag,   desc: t("dm_scope_item_desc") },
    { key: "CATEGORY",  label: t("dm_scope_category_label"),  icon: Layers, desc: t("dm_scope_category_desc") },
    { key: "COMBO",      label: t("dm_scope_combo_label"),     icon: Gift,  desc: t("dm_scope_combo_desc") },
    { key: "STOREWIDE",  label: t("dm_scope_storewide_label"), icon: Store, desc: t("dm_scope_storewide_desc") },
  ];
}

function buildStatusCfg(t) {
  return {
    ACTIVE_NOW: { label: t("dm_stat_live"),      color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
    SCHEDULED:  { label: t("dm_stat_scheduled"), color: "#0ea5e9", bg: "#eff6ff", icon: Clock },
    EXPIRED:    { label: t("dm_status_expired"), color: "#6b7280", bg: "#f3f4f6", icon: XCircle },
    DISABLED:   { label: t("dm_status_disabled"),color: "#dc2626", bg: "#fef2f2", icon: PauseCircle },
  };
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const EMPTY_FORM = {
  title: "", description: "", imageUrl: "", isCustom: false,
  offerCategory: "PROMOTIONAL", discountType: "PERCENTAGE",
  discountValue: "", scope: "ITEM", productIds: [], categoryId: "", minCartValue: "",
  startDate: "", endDate: "", startTime: "", endTime: "", daysOfWeek: [], active: true,
};

function todayStr() { return new Date().toISOString().slice(0, 10); }

export default function AdminDiscountManagement() {
  const { currencyCode } = useCurrency();
  const { t } = useLanguage();

  const OFFER_CATEGORIES = buildOfferCategories(t);
  const DISCOUNT_TYPES   = buildDiscountTypes(t);
  const SCOPES            = buildScopes(t);
  const STATUS_CFG        = buildStatusCfg(t);

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch]       = useState("");
  const [adminId, setAdminId]     = useState(null);
  const [liveFlash, setLiveFlash] = useState(false);

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [knowMoreOpen, setKnowMoreOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const loadDiscounts = () => {
    setLoading(true);
    setError("");
    discountService.getMyDiscounts()
      .then((res) => { if (res.success) setDiscounts(res.data || []); else setError(res.message || t("dm_err_load_failed")); })
      .catch((e) => setError(e.response?.data?.message || t("dm_err_load_failed")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDiscounts();
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem("ttl_user") || "{}");
        if (!user.adminId) return;
        setAdminId(user.adminId);
        const [prodRes, catRes] = await Promise.all([
          api.get(`/api/products/admin/${user.adminId}`),
          api.get(`/api/categories/admin/${user.adminId}`),
        ]);
        if (prodRes.data?.success) setProducts(prodRes.data.data || []);
        if (catRes.data?.success) setCategories(catRes.data.data || []);
      } catch { /* menu list is optional context for the picker — fail quietly */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Real-time discount management: instantly reflect create / edit /
  // enable / disable / delete pushed by the backend the moment they happen,
  // with zero polling and zero manual refresh.
  useWebSocket({
    topics: adminId ? [`/topic/admin/${adminId}/discounts`] : [],
    enabled: !!adminId,
    onMessage: () => {
      loadDiscounts();
      setLiveFlash(true);
      setTimeout(() => setLiveFlash(false), 1800);
    },
  });

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

  const openCreate = (custom = false) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, startDate: todayStr(), endDate: todayStr(), isCustom: custom });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditingId(d.discountId);
    setForm({
      title: d.title, description: d.description || "",
      imageUrl: d.imageUrl || "", isCustom: !!d.isCustom,
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

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setFormError("");
    try {
      const res = await discountService.uploadDiscountImage(file);
      if (!res.success) throw new Error(res.message);
      setForm((f) => ({ ...f, imageUrl: res.data.imageUrl }));
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || t("dm_err_upload_failed"));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.title.trim()) return setFormError(t("dm_err_title_required"));
    if (!form.discountValue || Number(form.discountValue) <= 0) return setFormError(t("dm_err_value_required"));
    if (!form.startDate || !form.endDate) return setFormError(t("dm_err_dates_required"));
    if (form.scope === "ITEM" && form.productIds.length === 0) return setFormError(t("dm_err_select_item"));
    if (form.scope === "COMBO" && form.productIds.length < 2) return setFormError(t("dm_err_combo_min"));
    if (form.scope === "CATEGORY" && !form.categoryId) return setFormError(t("dm_err_select_category"));

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      imageUrl: form.imageUrl || null,
      isCustom: form.isCustom,
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
      setFormError(e.response?.data?.message || e.message || t("dm_err_save_failed"));
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
    if (!window.confirm(t("dm_confirm_delete"))) return;
    try {
      await discountService.deleteDiscount(discountId);
      loadDiscounts();
    } catch (e) { console.error(e); }
  };

  const valueLabel = form.discountType === "PERCENTAGE"
    ? t("dm_value_pct_suffix")
    : form.discountType === "FLAT_AMOUNT"
      ? t("dm_value_flat_suffix", { currency: currencyCode })
      : t("dm_value_combo_suffix", { currency: currencyCode });

  return (
    <div style={{ maxWidth: 1520, margin: "0 auto", padding: "24px 28px 60px", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#F2701D,#F0A500)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(242,112,29,0.3)" }}>
            <Tag size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 19, fontWeight: 800, color: "#111827" }}>{t("dm_title")}</span>
              {liveFlash && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 800, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 999, animation: "adPulse 1.8s ease" }}>
                  <Radio size={10} /> {t("dm_live_update")}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
              {t("dm_subtitle")}
              <button onClick={() => setKnowMoreOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#F2701D", fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 0 }}>
                <Info size={12} /> {t("dm_know_more")}
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => openCreate(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", color: "#F2701D", border: "1.5px solid #F2701D", padding: "11px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
            <Wand2 size={16} /> {t("dm_custom_discount")}
          </button>
          <button onClick={() => openCreate(false)} style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#F2701D,#F0A500)", color: "#fff", border: "none", padding: "11px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(242,112,29,0.28)" }}>
            <Plus size={16} /> {t("dm_create_discount")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: t("dm_stat_live"), value: stats.live, icon: Flame, color: "#dc2626", bg: "#fef2f2" },
          { label: t("dm_stat_scheduled"), value: stats.scheduled, icon: Clock, color: "#0ea5e9", bg: "#eff6ff" },
          { label: t("dm_stat_combos"), value: stats.combos, icon: Gift, color: "#7c3aed", bg: "#f5f3ff" },
          { label: t("dm_stat_total"), value: stats.total, icon: Tag, color: "#16a34a", bg: "#f0fdf4" },
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
              {s === "ALL" ? t("dm_filter_all") : STATUS_CFG[s].label}
            </button>
          ))}
        </div>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("dm_search_placeholder")} style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 12.5, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* Cards grid — wide, image-forward layout */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center" }}><Loader2 size={26} style={{ animation: "adSpin 0.8s linear infinite" }} color="#9ca3af" /></div>
      ) : error ? (
        <div style={{ padding: 40, textAlign: "center", color: "#dc2626", fontSize: 13, fontWeight: 600, background: "#fff", border: "1px solid #f0e4d6", borderRadius: 16 }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", background: "#fff", border: "1px solid #f0e4d6", borderRadius: 16 }}>
          <Tag size={32} color="#d1d5db" style={{ margin: "0 auto 10px" }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{t("dm_empty_title")}</div>
          <div style={{ fontSize: 12.5, color: "#9ca3af", marginTop: 4 }}>{t("dm_empty_desc")}</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map((d) => {
            const cat = OFFER_CATEGORIES.find((c) => c.key === d.offerCategory) || OFFER_CATEGORIES[0];
            const st = STATUS_CFG[d.computedStatus] || STATUS_CFG.SCHEDULED;
            return (
              <div key={d.discountId} style={{ background: "#fff", border: "1px solid #f0e4d6", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
                {/* Real photo, not an icon */}
                <div style={{ position: "relative", width: "100%", height: 150, background: `${cat.color}10` }}>
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: cat.color }}>
                      <cat.icon size={30} />
                      <span style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.7 }}>{t("dm_no_photo")}</span>
                    </div>
                  )}
                  <span style={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 10.5, fontWeight: 800, color: st.color, background: "#fff" }}>
                    <st.icon size={11} /> {st.label}
                  </span>
                  {d.isCustom && (
                    <span style={{ position: "absolute", top: 10, right: 10, padding: "4px 9px", borderRadius: 20, fontSize: 10, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.55)" }}>{t("dm_custom_badge")}</span>
                  )}
                </div>

                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800, color: "#111827", fontSize: 14.5, lineHeight: 1.3 }}>{d.title}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{cat.label} · {DISCOUNT_TYPES.find((dt) => dt.key === d.discountType)?.label}</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: cat.color, whiteSpace: "nowrap" }}>
                      {d.discountType === "PERCENTAGE" ? `${d.discountValue}%` : formatCurrency(d.discountValue, currencyCode)}
                    </div>
                  </div>

                  {d.description && <div style={{ fontSize: 11.5, color: "#6b7280", lineHeight: 1.4 }}>{d.description}</div>}

                  <div style={{ fontSize: 11, color: "#6b7280", display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                    <span style={{ background: "#f9fafb", padding: "3px 9px", borderRadius: 999 }}>
                      {d.scope === "ITEM" && t("dm_scope_items_count", { count: (d.productNames || []).length })}
                      {d.scope === "CATEGORY" && (d.categoryName || t("dm_category_label"))}
                      {d.scope === "COMBO" && t("dm_scope_combo_count", { count: (d.productNames || []).length })}
                      {d.scope === "STOREWIDE" && t("dm_scope_storewide")}
                    </span>
                    <span style={{ background: "#f9fafb", padding: "3px 9px", borderRadius: 999 }}>{d.startDate} → {d.endDate}</span>
                    {d.startTime && d.endTime && <span style={{ background: "#f9fafb", padding: "3px 9px", borderRadius: 999 }}>{d.startTime}–{d.endTime}</span>}
                  </div>

                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, paddingTop: 10 }}>
                    <div title={d.active ? t("dm_offer_switch_on_tip") : t("dm_offer_switch_off_tip")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", height: 34, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", padding: "0 10px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>{t("dm_offer_switch")}</span>
                      <button onClick={() => handleToggle(d)} style={{ width: 34, height: 19, borderRadius: 999, background: d.active ? "#16a34a" : "#d1d5db", position: "relative", border: "none", cursor: "pointer", flexShrink: 0 }}>
                        <span style={{ position: "absolute", top: 2, left: d.active ? 17 : 2, width: 15, height: 15, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
                      </button>
                    </div>
                    <button onClick={() => openEdit(d)} title={t("dm_edit_offer")} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(d.discountId)} title={t("dm_delete_offer")} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#dc2626" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal — wide, two-column layout for tablet/desktop */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(36,22,8,0.5)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 960, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 30px 70px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 30px", borderBottom: "1px solid #f0e4d6", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>
                {editingId ? t("dm_modal_edit_title") : form.isCustom ? t("dm_modal_custom_title") : t("dm_modal_create_title")}
              </div>
              <button onClick={() => setModalOpen(false)} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            </div>

            <div style={{ padding: "24px 30px", display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 24, rowGap: 18 }}>

              {/* Offer photo */}
              <div>
                <label style={fieldLabel}>{t("dm_offer_photo_label")}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 100, height: 78, borderRadius: 10, overflow: "hidden", background: "#f9fafb", border: "1.5px dashed #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="offer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <ImageOff size={18} color="#d1d5db" />
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1.5px solid #F2701D", background: "#FBF3EC", color: "#F2701D", fontSize: 12, fontWeight: 700, cursor: uploadingImage ? "wait" : "pointer" }}>
                      {uploadingImage ? <Loader2 size={13} style={{ animation: "adSpin 0.8s linear infinite" }} /> : <ImagePlus size={13} />}
                      {uploadingImage ? t("dm_uploading") : form.imageUrl ? t("dm_replace_photo") : t("dm_upload_photo")}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} style={{ display: "none" }} />
                    {form.imageUrl && (
                      <button onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))} style={{ background: "none", border: "none", color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0, textAlign: "left" }}>{t("dm_remove_photo")}</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={fieldLabel}>{t("dm_title_label")} <span style={{ color: "#dc2626" }}>*</span></label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder={t("dm_title_placeholder")} style={fieldInput} />
              </div>

              {/* Description — full width */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel}>{t("dm_desc_label")}</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder={t("dm_desc_placeholder")} style={{ ...fieldInput, resize: "none" }} />
              </div>

              {/* Offer category — full width */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel}>{t("dm_offer_category_label")}</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                  {OFFER_CATEGORIES.map((c) => (
                    <button key={c.key} onClick={() => setForm((f) => ({ ...f, offerCategory: c.key }))} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "12px 6px", borderRadius: 10, border: form.offerCategory === c.key ? `2px solid ${c.color}` : "2px solid #f0e4d6", background: form.offerCategory === c.key ? `${c.color}12` : "#fff", cursor: "pointer" }}>
                      <c.icon size={17} color={c.color} />
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#374151", textAlign: "center" }}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope — full width */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel}>{t("dm_applies_to_label")}</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                  {SCOPES.map((s) => (
                    <button key={s.key} onClick={() => handleScopeChange(s.key)} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "12px 13px", borderRadius: 10, border: form.scope === s.key ? "2px solid #F2701D" : "2px solid #f0e4d6", background: form.scope === s.key ? "#FBF3EC" : "#fff", cursor: "pointer", textAlign: "left" }}>
                      <s.icon size={16} color={form.scope === s.key ? "#F2701D" : "#9ca3af"} style={{ marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>{s.label}</div>
                        <div style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 1, lineHeight: 1.3 }}>{s.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Item picker — full width */}
              {(form.scope === "ITEM" || form.scope === "COMBO") && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={fieldLabel}>
                    {form.scope === "COMBO" ? t("dm_select_combo_items") : t("dm_select_items")} <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <div style={{ maxHeight: 190, overflowY: "auto", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: 8, columns: 2, columnGap: 8 }}>
                    {products.length === 0 ? (
                      <div style={{ padding: 14, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>{t("dm_no_menu_items")}</div>
                    ) : products.map((p) => (
                      <label key={p.productId} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 7, cursor: "pointer", breakInside: "avoid" }}>
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
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={fieldLabel}>{t("dm_category_label")} <span style={{ color: "#dc2626" }}>*</span></label>
                  <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} style={fieldInput}>
                    <option value="">{t("dm_select_category_placeholder")}</option>
                    {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                  </select>
                </div>
              )}

              {/* Min cart value */}
              {form.scope === "STOREWIDE" && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={fieldLabel}>{t("dm_min_cart_label")}</label>
                  <input type="number" min="0" value={form.minCartValue} onChange={(e) => setForm((f) => ({ ...f, minCartValue: e.target.value }))} placeholder={t("dm_min_cart_placeholder")} style={fieldInput} />
                </div>
              )}

              {/* Discount type + value */}
              <div>
                <label style={fieldLabel}>{t("dm_discount_type_label")}</label>
                <select value={form.discountType} disabled={form.scope === "COMBO"} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))} style={{ ...fieldInput, opacity: form.scope === "COMBO" ? 0.6 : 1 }}>
                  {DISCOUNT_TYPES.filter((dt) => form.scope === "COMBO" ? dt.key === "COMBO_PRICE" : dt.key !== "COMBO_PRICE").map((dt) => (
                    <option key={dt.key} value={dt.key}>{dt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>{t("dm_value_label")} {valueLabel} <span style={{ color: "#dc2626" }}>*</span></label>
                <input type="number" min="0" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} placeholder={form.discountType === "PERCENTAGE" ? t("dm_value_placeholder_pct") : t("dm_value_placeholder_flat")} style={fieldInput} />
              </div>

              {/* Date range */}
              <div>
                <label style={fieldLabel}><Calendar size={11} style={{ marginRight: 4 }} />{t("dm_start_date_label")} <span style={{ color: "#dc2626" }}>*</span></label>
                <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} style={fieldInput} />
              </div>
              <div>
                <label style={fieldLabel}><Calendar size={11} style={{ marginRight: 4 }} />{t("dm_end_date_label")} <span style={{ color: "#dc2626" }}>*</span></label>
                <input type="date" min={form.startDate} value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} style={fieldInput} />
              </div>

              {/* Time window */}
              <div>
                <label style={fieldLabel}><Clock size={11} style={{ marginRight: 4 }} />{t("dm_start_time_label")}</label>
                <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} style={fieldInput} />
              </div>
              <div>
                <label style={fieldLabel}><Clock size={11} style={{ marginRight: 4 }} />{t("dm_end_time_label")}</label>
                <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} style={fieldInput} />
              </div>

              {/* Days of week — full width */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel}>{t("dm_active_days_label")}</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DAYS.map((day) => (
                    <button key={day} onClick={() => toggleDay(day)} style={{ padding: "7px 13px", borderRadius: 8, border: form.daysOfWeek.includes(day) ? "2px solid #F2701D" : "2px solid #f0e4d6", background: form.daysOfWeek.includes(day) ? "#FBF3EC" : "#fff", fontSize: 11.5, fontWeight: 700, color: form.daysOfWeek.includes(day) ? "#F2701D" : "#6b7280", cursor: "pointer" }}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active toggle — full width */}
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f9fafb", borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>{t("dm_enable_discount_label")}</div>
                  <div style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 1 }}>{t("dm_enable_discount_desc")}</div>
                </div>
                <button onClick={() => setForm((f) => ({ ...f, active: !f.active }))} style={{ width: 46, height: 26, borderRadius: 999, background: form.active ? "#16a34a" : "#d1d5db", position: "relative", border: "none", cursor: "pointer", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 3, left: form.active ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
                </button>
              </div>

              {formError && <div style={{ gridColumn: "1 / -1", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, color: "#dc2626", fontSize: 12, fontWeight: 600 }}>⚠ {formError}</div>}

              <button onClick={handleSave} disabled={saving} style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 11, border: "none", background: saving ? "#e5e7eb" : "linear-gradient(135deg,#F2701D,#F0A500)", color: saving ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? <Loader2 size={16} style={{ animation: "adSpin 0.8s linear infinite" }} /> : <CheckCircle2 size={16} />}
                {saving ? t("saving_dots") : editingId ? t("dm_save_changes") : t("dm_create_discount")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Know More explainer popup */}
      {knowMoreOpen && (
        <div onClick={() => setKnowMoreOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(36,22,8,0.5)", backdropFilter: "blur(4px)", zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 30px 70px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f0e4d6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 16, fontWeight: 800 }}>
                <Info size={18} color="#F2701D" /> {t("dm_know_more_title")}
              </div>
              <button onClick={() => setKnowMoreOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={15} /></button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              <ExplainStep n={1} title={t("dm_step1_title")} text={t("dm_step1_text")} />
              <ExplainStep n={2} title={t("dm_step2_title")} text={t("dm_step2_text")} />
              <ExplainStep n={3} title={t("dm_step3_title")} text={t("dm_step3_text")} />
              <ExplainStep n={4} title={t("dm_step4_title")} text={t("dm_step4_text")} />
              <ExplainStep n={5} title={t("dm_step5_title")} text={t("dm_step5_text")} />
              <ExplainStep n={6} title={t("dm_step6_title")} text={t("dm_step6_text")} />
              <div style={{ background: "#FBF3EC", border: "1px solid #f0e4d6", borderRadius: 12, padding: "12px 14px", fontSize: 12, color: "#92400e" }}>
                💡 {t("dm_tip")}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes adSpin { to { transform: rotate(360deg); } }
        @keyframes adPulse { 0% { opacity:0; transform: scale(0.9);} 15% { opacity:1; transform: scale(1);} 85% { opacity:1; } 100% { opacity:0; } }
      `}</style>
    </div>
  );
}

function ExplainStep({ n, title, text }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#F2701D,#F0A500)", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
      <div>
        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 2 }}>{title}</div>
        <div style={{ color: "#6b7280" }}>{text}</div>
      </div>
    </div>
  );
}

const fieldLabel = { display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 };
const fieldInput = { width: "100%", padding: "10px 13px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#111827" };