"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Pencil, Check, Plus, X, Upload, Lock, Mail, Phone, Globe,
  MapPin, Building2, FileText, Clock, Calendar, Percent, Package,
  ChevronDown, RefreshCw, Coins,
} from "lucide-react";
import "../businessinformationpage/designbusinessinfo.css";
import { getBusinessInformation, updateBusinessInformation } from "../services/businessService";
import { COUNTRY_CURRENCY_MAP, CURRENCIES, getCurrencySymbol } from "../utils/currencyHelper";
import { useLanguage } from "../context/LanguageContext";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium",
  "Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei",
  "Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Chad","Chile","China",
  "Colombia","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark",
  "Dominican Republic","Ecuador","Egypt","El Salvador","Eritrea","Estonia","Ethiopia",
  "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala",
  "Guinea","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Libya","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia",
  "Maldives","Mali","Malta","Mauritius","Mexico","Moldova","Mongolia","Montenegro","Morocco",
  "Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger",
  "Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Panama","Paraguay",
  "Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia",
  "Senegal","Serbia","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa",
  "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey",
  "Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

const TIMEZONES = [
  "(GMT-12:00) International Date Line West","(GMT-11:00) Midway Island, Samoa",
  "(GMT-10:00) Hawaii","(GMT-09:00) Alaska","(GMT-08:00) Pacific Time (US & Canada)",
  "(GMT-07:00) Mountain Time (US & Canada)","(GMT-06:00) Central Time (US & Canada)",
  "(GMT-05:00) Eastern Time (US & Canada)","(GMT-04:00) Atlantic Time (Canada)",
  "(GMT-03:00) Buenos Aires, Georgetown","(GMT-02:00) Mid-Atlantic","(GMT-01:00) Azores",
  "(GMT+00:00) London, Lisbon, Dublin","(GMT+01:00) Amsterdam, Berlin, Paris",
  "(GMT+02:00) Cairo, Athens, Istanbul","(GMT+03:00) Moscow, Kuwait, Nairobi",
  "(GMT+04:00) Abu Dhabi, Muscat","(GMT+05:00) Islamabad, Karachi",
  "(GMT+05:30) Asia/Kolkata","(GMT+05:45) Kathmandu","(GMT+06:00) Astana, Dhaka",
  "(GMT+07:00) Bangkok, Hanoi, Jakarta","(GMT+08:00) Beijing, Singapore, Hong Kong",
  "(GMT+09:00) Tokyo, Seoul","(GMT+09:30) Adelaide, Darwin",
  "(GMT+10:00) Canberra, Melbourne, Sydney","(GMT+11:00) Solomon Islands",
  "(GMT+12:00) Auckland, Wellington, Fiji",
];

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  const ap = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2, "0")}:${m} ${ap}`;
});

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const PHONE_CODES = [
  { flag: "🇮🇳", code: "+91", iso: "IN" },
  { flag: "🇺🇸", code: "+1",  iso: "US" },
  { flag: "🇬🇧", code: "+44", iso: "GB" },
  { flag: "🇦🇺", code: "+61", iso: "AU" },
  { flag: "🇸🇬", code: "+65", iso: "SG" },
  { flag: "🇦🇪", code: "+971",iso: "AE" },
  { flag: "🇩🇪", code: "+49", iso: "DE" },
  { flag: "🇯🇵", code: "+81", iso: "JP" },
];

function formatTimeTo12(timeVal) {
  if (!timeVal) return "09:00 AM";
  if (typeof timeVal === "string" && (timeVal.includes("AM") || timeVal.includes("PM")))
    return timeVal;
  if (Array.isArray(timeVal)) {
    const [h, m] = timeVal;
    const ap = h < 12 ? "AM" : "PM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
  }
  const [h, m] = timeVal.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
}

function to24Hour(timeStr) {
  if (!timeStr) return "09:00";
  const [time, mer] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mer === "AM" && h === 12) h = 0;
  if (mer === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const EMPTY = {
  businessName: "", businessType: "", businessEmail: "",
  phoneCode: "+91", businessPhone: "", logoPreview: null,
  licenseNumber: "", gstNumber: "", website: "",
  addressLine1: "", addressLine2: "", city: "", state: "",
  country: "", currencyCode: "", postalCode: "",
  openingTime: "09:00 AM", closingTime: "10:00 PM",
  workingDays: [], timezone: "(GMT+05:30) Asia/Kolkata", description: "",
  hasTableService: false,
  dineInEnabled: true,
  takeawayEnabled: true,
  multiLocation: false,
};

const BusinessInformation = () => {
  const { t } = useLanguage();

  // Extra field types — built inside the component so labels/placeholders
  // follow the active language. Icons stay attached, exactly as before.
  const EXTRA_FIELD_TYPES = [
    { label: t("bi_extra_social"),    icon: Globe,     placeholder: t("bi_extra_social_ph") },
    { label: t("bi_extra_altphone"),  icon: Phone,     placeholder: t("bi_extra_altphone_ph") },
    { label: t("bi_extra_fssai"),     icon: FileText,  placeholder: t("bi_extra_fssai_ph") },
    { label: t("bi_extra_pan"),       icon: FileText,  placeholder: t("bi_extra_pan_ph") },
    { label: t("bi_extra_bank"),      icon: Package,   placeholder: t("bi_extra_bank_ph") },
  ];

  const [data,         setData]        = useState(EMPTY);
  const [draft,        setDraft]       = useState(EMPTY);
  const [editing,      setEditing]     = useState(false);
  const [errors,       setErrors]      = useState({});
  const [loading,      setLoading]     = useState(true);
  const [saving,       setSaving]      = useState(false);
  const [fetchErr,     setFetchErr]    = useState("");
  const [toast,        setToast]       = useState({ show: false, msg: "", type: "success" });
  const [extraFields,  setExtraFields] = useState([]);
  const [showAddField, setShowAddField]= useState(false);
  const logoRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  useEffect(() => { fetchBusiness(); }, []);

  const fetchBusiness = async () => {
    setLoading(true);
    setFetchErr("");
    try {
      const stored = localStorage.getItem("ttl_user");
      if (!stored) throw new Error("Not logged in");
      const { adminId } = JSON.parse(stored);
      if (!adminId) throw new Error("Admin ID not found");
      const res = await getBusinessInformation(adminId);
      const b   = res.data;
      const mapped = {
        businessName:  b.businessName  || "",
        businessType:  b.businessType  || "",
        businessEmail: b.businessEmail || "",
        phoneCode:     "+91",
        businessPhone: b.businessPhone || "",
        logoPreview:   b.logoUrl       || null,
        licenseNumber: b.licenseNumber || "",
        gstNumber:     b.gstNumber     || "",
        website:       b.website       || "",
        addressLine1:  b.addressLine1  || "",
        addressLine2:  b.addressLine2  || "",
        city:          b.city          || "",
        state:         b.state         || "",
        country:       b.country       || "",
        currencyCode:  b.currencyCode  || "",
        postalCode:    b.postalCode    || "",
        openingTime:   formatTimeTo12(b.openingTime),
        closingTime:   formatTimeTo12(b.closingTime),
        workingDays:   b.workingDays ? b.workingDays.split(",").map(d => d.trim()) : [],
        timezone:      b.timezone      || "(GMT+05:30) Asia/Kolkata",
        description:   b.businessDescription || "",
        hasTableService: Boolean(b.hasTableService),
        dineInEnabled: b.dineInEnabled === undefined || b.dineInEnabled === null ? true : Boolean(b.dineInEnabled),
        takeawayEnabled: b.takeawayEnabled === undefined || b.takeawayEnabled === null ? true : Boolean(b.takeawayEnabled),
        multiLocation: Boolean(b.multiLocation),
      };
      setData(mapped);
      setDraft(mapped);
    } catch (err) {
      setFetchErr(err.response?.data?.message || err.message || t("bi_load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = useCallback((field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  }, []);

  // When country changes → auto-set currency
  const handleCountryChange = useCallback((country) => {
    const auto = COUNTRY_CURRENCY_MAP[country] || "";
    setDraft(prev => ({ ...prev, country, currencyCode: auto || prev.currencyCode }));
    setErrors(prev => ({ ...prev, country: "" }));
  }, []);

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDraft(prev => ({ ...prev, logoPreview: ev.target.result }));
    reader.readAsDataURL(file);
  }, []);

  const handleDaysChange = useCallback((e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setDraft(prev => ({ ...prev, workingDays: selected }));
  }, []);

  const validate = () => {
    const e = {};
    if (!draft.businessName.trim())  e.businessName  = t("bi_err_name_required");
    if (!draft.businessEmail.trim()) e.businessEmail = t("bi_err_email_required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.businessEmail))
      e.businessEmail = t("bi_err_email_invalid");
    if (!draft.businessPhone.trim()) e.businessPhone = t("bi_err_phone_required");
    if (!draft.addressLine1.trim())  e.addressLine1  = t("bi_err_address1_required");
    if (!draft.city.trim())          e.city          = t("bi_err_city_required");
    if (!draft.state.trim())         e.state         = t("bi_err_state_required");
    if (!draft.country)              e.country       = t("bi_err_country_required");
    if (!draft.postalCode.trim())    e.postalCode    = t("bi_err_postal_required");
    if (!draft.dineInEnabled && !draft.takeawayEnabled) {
      e.orderTypes = t("bi_err_order_types");
    }
    return e;
  };

  const handleEdit   = () => { setDraft({ ...data }); setEditing(true);  setErrors({}); };
  const handleCancel = () => { setDraft({ ...data }); setEditing(false); setErrors({}); };

  const handleUpdate = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const stored      = localStorage.getItem("ttl_user");
      const { adminId } = JSON.parse(stored);
      const payload = {
        businessName:        draft.businessName,
        businessEmail:       draft.businessEmail,
        businessPhone:       draft.businessPhone,
        logoUrl:             draft.logoPreview  || null,
        gstNumber:           draft.gstNumber    || null,
        licenseNumber:       draft.licenseNumber || null,
        website:             draft.website       || null,
        addressLine1:        draft.addressLine1,
        addressLine2:        draft.addressLine2  || null,
        city:                draft.city,
        state:               draft.state,
        country:             draft.country,
        currencyCode:        draft.currencyCode  || null,
        postalCode:          draft.postalCode,
        openingTime:         to24Hour(draft.openingTime),
        closingTime:         to24Hour(draft.closingTime),
        workingDays:         draft.workingDays.length > 0 ? draft.workingDays.join(",") : null,
        timezone:            draft.timezone,
        businessDescription: draft.description || null,
        hasTableService:     draft.hasTableService,
        dineInEnabled:       draft.dineInEnabled,
        takeawayEnabled:     draft.takeawayEnabled,
        multiLocation:       draft.multiLocation,
      };
      await updateBusinessInformation(adminId, payload);
      setData({ ...draft });
      // Update currency AND multiLocation in localStorage — the dashboard
      // sidebar reads multiLocation from here (not a fresh API call) to
      // decide whether to show the "Locations" menu item, so this needs
      // to be current the moment the merchant refreshes the page.
      try {
        const stored2 = localStorage.getItem("ttl_user");
        if (stored2) {
          const u = JSON.parse(stored2);
          u.currencyCode = draft.currencyCode || u.currencyCode;
          u.multiLocation = draft.multiLocation;
          localStorage.setItem("ttl_user", JSON.stringify(u));
        }
      } catch {}
      setEditing(false);
      setErrors({});
      showToast(t("bi_toast_updated"));
    } catch (err) {
      showToast(err.response?.data?.message || t("bi_toast_update_failed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const addExtraField    = useCallback((type) => { setExtraFields(p => [...p, { id: Date.now(), ...type, value: "" }]); setShowAddField(false); }, []);
  const removeExtraField = useCallback((id)   => setExtraFields(p => p.filter(f => f.id !== id)), []);
  const updateExtraField = useCallback((id, value) => setExtraFields(p => p.map(f => f.id === id ? { ...f, value } : f)), []);

  const d = editing ? draft : data;
  const spinnerStyle = { width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"biSpin 0.7s linear infinite" };

  if (loading) return (
    <div className="bi-root">
      <div className="bi-card" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:320 }}>
        <div style={{ textAlign:"center", color:"#71717a" }}>
          <div style={{ width:36, height:36, border:"3px solid #e4e4e7", borderTopColor:"#7c3aed", borderRadius:"50%", animation:"biSpin 0.8s linear infinite", margin:"0 auto 14px" }}/>
          <style>{`@keyframes biSpin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ fontSize:14, fontWeight:600 }}>{t("bi_loading")}</div>
        </div>
      </div>
    </div>
  );

  if (fetchErr) return (
    <div className="bi-root">
      <div className="bi-card">
        <div style={{ padding:"48px 20px", textAlign:"center" }}>
          <div style={{ fontSize:44, marginBottom:14 }}>⚠️</div>
          <div style={{ fontSize:16, fontWeight:700, color:"#18181b", marginBottom:8 }}>{t("bi_could_not_load")}</div>
          <div style={{ fontSize:13, color:"#71717a", marginBottom:20 }}>{fetchErr}</div>
          <button onClick={fetchBusiness} style={{ display:"inline-flex", alignItems:"center", gap:7, background:"#7c3aed", color:"#fff", border:"none", borderRadius:10, padding:"10px 22px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }} type="button">
            <RefreshCw size={15}/> {t("bi_retry")}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bi-root">
      <style>{`
        @keyframes biSpin    { to{transform:rotate(360deg)} }
        @keyframes biToastIn { from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .bi-logo-circle:hover .bi-logo-overlay { opacity: 1 !important; }
      `}</style>

      {toast.show && (
        <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background: toast.type==="success"?"#18181b":"#dc2626", color:"#fff", padding:"11px 24px", borderRadius:30, fontSize:13.5, fontWeight:600, zIndex:9999, animation:"biToastIn 0.25s ease", boxShadow:"0 4px 20px rgba(0,0,0,0.18)" }}>
          {toast.msg}
        </div>
      )}

      <div className="bi-card">
        <div className="bi-header">
          <h1 className="bi-title">{t("bi_title")}</h1>
          <p className="bi-sub">
            {editing ? t("bi_sub_edit") : t("bi_sub_view")}
          </p>
          <div className="bi-header-actions">
            {!editing ? (
              <button className="bi-btn-edit" onClick={handleEdit} type="button">
                <Pencil size={15}/> {t("bi_edit_info")}
              </button>
            ) : (
              <div className="bi-edit-actions">
                <button className="bi-btn-cancel" onClick={handleCancel} type="button" disabled={saving}>
                  <X size={15}/> {t("bi_cancel")}
                </button>
                <button className="bi-btn-done" onClick={handleUpdate} type="button" disabled={saving} style={{ background: saving?"#a78bfa":undefined }}>
                  {saving ? <><div style={spinnerStyle}/> {t("bi_updating")}</> : <><Check size={15}/> {t("bi_update")}</>}
                </button>
              </div>
            )}
          </div>
        </div>

        {!editing && (
          <div className="bi-mode-banner">
            <Lock size={14}/>
            <span>{t("bi_view_mode_banner")} <strong>{t("bi_edit_info")}</strong> {t("bi_view_mode_banner2")}</span>
          </div>
        )}
        {editing && (
          <div className="bi-mode-banner" style={{ background:"#fef3c7", borderColor:"#fde68a", color:"#92400e" }}>
            <Pencil size={14}/>
            <span>{t("bi_edit_mode_banner")} <strong>{t("bi_update")}</strong> {t("bi_edit_mode_banner2")}</span>
          </div>
        )}

        <div className="bi-grid">

          {/* ── Business Name ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_business_name")} <span className="bi-req">*</span></label>
            <div className={`bi-input-wrap ${errors.businessName?"bi-err":""} ${!editing?"bi-readonly":""}`}>
              <Building2 size={15} className="bi-icon"/>
              <input className="bi-input" type="text" placeholder={t("bi_business_name_ph")}
                value={d.businessName} disabled={!editing}
                onChange={e => handleFieldChange("businessName", e.target.value)}/>
            </div>
            {errors.businessName && <span className="bi-field-err">⚠ {errors.businessName}</span>}
          </div>

          {/* ── Business Type — read-only ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_business_type")}</label>
            <div className="bi-input-wrap bi-readonly">
              <MapPin size={15} className="bi-icon"/>
              <input className="bi-input" type="text" value={d.businessType} disabled readOnly/>
              <span style={{ fontSize:11, color:"#a1a1aa", padding:"0 10px", whiteSpace:"nowrap" }}>{t("bi_readonly")}</span>
            </div>
          </div>

          {/* ── Business Email ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_business_email")} <span className="bi-req">*</span></label>
            <div className={`bi-input-wrap ${errors.businessEmail?"bi-err":""} ${!editing?"bi-readonly":""}`}>
              <Mail size={15} className="bi-icon"/>
              <input className="bi-input" type="email" placeholder={t("bi_business_email_ph")}
                value={d.businessEmail} disabled={!editing}
                onChange={e => handleFieldChange("businessEmail", e.target.value)}/>
            </div>
            {errors.businessEmail && <span className="bi-field-err">⚠ {errors.businessEmail}</span>}
          </div>

          {/* ── Business Phone ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_business_phone")} <span className="bi-req">*</span></label>
            <div className={`bi-phone-wrap ${errors.businessPhone?"bi-err":""} ${!editing?"bi-readonly":""}`}>
              <Phone size={15} className="bi-icon"/>
              <select className="bi-phone-code" value={d.phoneCode} disabled={!editing}
                onChange={e => handleFieldChange("phoneCode", e.target.value)}>
                {PHONE_CODES.map(c => <option key={c.iso} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
              <ChevronDown size={13} className="bi-phone-chevron"/>
              <input className="bi-input bi-phone-input" type="tel" placeholder={t("bi_phone_ph")}
                value={d.businessPhone} disabled={!editing}
                onChange={e => handleFieldChange("businessPhone", e.target.value)}/>
            </div>
            {errors.businessPhone && <span className="bi-field-err">⚠ {errors.businessPhone}</span>}
          </div>

          {/* ── Logo — CIRCLE shape ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_logo_optional")}</label>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              {/* Circle upload button */}
              <div
                className="bi-logo-circle"
                onClick={() => editing && logoRef.current?.click()}
                style={{
                  width:88, height:88, borderRadius:"50%",
                  border: editing ? "2.5px dashed #7c3aed" : "2.5px solid #e4e4e7",
                  overflow:"hidden", position:"relative", flexShrink:0,
                  cursor: editing ? "pointer" : "default",
                  background:"#f4f4f5",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"border-color 0.2s",
                }}
              >
                <input ref={logoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleLogoUpload}/>
                {d.logoPreview ? (
                  <>
                    <img src={d.logoPreview} alt="logo" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                    {/* Hover overlay */}
                    {editing && (
                      <div className="bi-logo-overlay" style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, opacity:0, transition:"opacity 0.2s" }}>
                        <Upload size={18} color="#fff"/>
                        <span style={{ fontSize:10, fontWeight:700, color:"#fff" }}>{t("bi_change")}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                    <Upload size={20} color={editing?"#7c3aed":"#a1a1aa"}/>
                    {editing && <span style={{ fontSize:9.5, fontWeight:700, color:"#7c3aed", textAlign:"center", lineHeight:1.3 }}>{t("bi_upload_logo")}</span>}
                  </div>
                )}
              </div>
              {/* Helper text */}
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"#18181b", marginBottom:4 }}>
                  {d.logoPreview ? t("bi_logo_uploaded") : t("bi_no_logo")}
                </div>
                {editing ? (
                  <>
                    <div style={{ fontSize:12, color:"#71717a", lineHeight:1.5 }}>{t("bi_logo_click_hint")}</div>
                    <div style={{ fontSize:11.5, color:"#a1a1aa", marginTop:2 }}>{t("bi_logo_size_hint")}</div>
                    {d.logoPreview && (
                      <button onClick={() => handleFieldChange("logoPreview", null)} type="button"
                        style={{ marginTop:6, fontSize:11.5, color:"#ef4444", background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"inherit", fontWeight:600 }}>
                        ✕ {t("bi_remove_logo")}
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize:12, color:"#a1a1aa" }}>{t("bi_click_edit_logo")}</div>
                )}
              </div>
            </div>
          </div>

          {/* ── License ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_license_optional")}</label>
            <div className={`bi-input-wrap ${!editing?"bi-readonly":""}`}>
              <FileText size={15} className="bi-icon"/>
              <input className="bi-input" type="text" placeholder={t("bi_license_ph")}
                value={d.licenseNumber} disabled={!editing}
                onChange={e => handleFieldChange("licenseNumber", e.target.value)}/>
            </div>
          </div>

          {/* ── GST ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_gst_optional")}</label>
            <div className={`bi-input-wrap ${!editing?"bi-readonly":""}`}>
              <Percent size={15} className="bi-icon"/>
              <input className="bi-input" type="text" placeholder={t("bi_gst_ph")}
                value={d.gstNumber} disabled={!editing}
                onChange={e => handleFieldChange("gstNumber", e.target.value)}/>
            </div>
          </div>

          {/* ── Website ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_website_optional")}</label>
            <div className={`bi-input-wrap ${!editing?"bi-readonly":""}`}>
              <Globe size={15} className="bi-icon"/>
              <input className="bi-input" type="url" placeholder={t("bi_website_ph")}
                value={d.website} disabled={!editing}
                onChange={e => handleFieldChange("website", e.target.value)}/>
            </div>
          </div>

          {/* ── Address Line 1 ── */}
          <div className="bi-col-full">
            <div className="bi-field-group">
              <label className="bi-label">{t("bi_address1")} <span className="bi-req">*</span></label>
              <div className={`bi-input-wrap ${errors.addressLine1?"bi-err":""} ${!editing?"bi-readonly":""}`}>
                <MapPin size={15} className="bi-icon"/>
                <input className="bi-input" type="text" placeholder={t("bi_address1_ph")}
                  value={d.addressLine1} disabled={!editing}
                  onChange={e => handleFieldChange("addressLine1", e.target.value)}/>
              </div>
              {errors.addressLine1 && <span className="bi-field-err">⚠ {errors.addressLine1}</span>}
            </div>
          </div>

          {/* ── Address Line 2 ── */}
          <div className="bi-col-full">
            <div className="bi-field-group">
              <label className="bi-label">{t("bi_address2_optional")}</label>
              <div className={`bi-input-wrap ${!editing?"bi-readonly":""}`}>
                <Building2 size={15} className="bi-icon"/>
                <input className="bi-input" type="text" placeholder={t("bi_address2_ph")}
                  value={d.addressLine2} disabled={!editing}
                  onChange={e => handleFieldChange("addressLine2", e.target.value)}/>
              </div>
            </div>
          </div>

          {/* ── City ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_city")} <span className="bi-req">*</span></label>
            <div className={`bi-input-wrap ${errors.city?"bi-err":""} ${!editing?"bi-readonly":""}`}>
              <Building2 size={15} className="bi-icon"/>
              <input className="bi-input" type="text" placeholder={t("bi_city_ph")}
                value={d.city} disabled={!editing}
                onChange={e => handleFieldChange("city", e.target.value)}/>
            </div>
            {errors.city && <span className="bi-field-err">⚠ {errors.city}</span>}
          </div>

          {/* ── State ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_state")} <span className="bi-req">*</span></label>
            <div className={`bi-input-wrap ${errors.state?"bi-err":""} ${!editing?"bi-readonly":""}`}>
              <MapPin size={15} className="bi-icon"/>
              <input className="bi-input" type="text" placeholder={t("bi_state_ph")}
                value={d.state} disabled={!editing}
                onChange={e => handleFieldChange("state", e.target.value)}/>
            </div>
            {errors.state && <span className="bi-field-err">⚠ {errors.state}</span>}
          </div>

          {/* ── Country + Currency side by side ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_country")} <span className="bi-req">*</span></label>
            <div className={`bi-input-wrap bi-select-wrap ${errors.country?"bi-err":""} ${!editing?"bi-readonly":""}`}>
              <Globe size={15} className="bi-icon"/>
              <select className="bi-select" value={d.country} disabled={!editing}
                onChange={e => handleCountryChange(e.target.value)}>
                <option value="">{t("bi_select_country")}</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} className="bi-select-chevron"/>
            </div>
            {errors.country && <span className="bi-field-err">⚠ {errors.country}</span>}
          </div>

          {/* ── Currency ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_currency")}</label>
            <div className={`bi-input-wrap bi-select-wrap ${!editing?"bi-readonly":""}`}>
              {/* Show symbol as icon */}
              <span style={{ paddingLeft:12, paddingRight:6, fontSize:14, fontWeight:700, color:"#7c3aed", flexShrink:0, fontFamily:"monospace" }}>
                {d.currencyCode ? getCurrencySymbol(d.currencyCode) : "—"}
              </span>
              <select className="bi-select" style={{ paddingLeft:0 }}
                value={d.currencyCode || ""} disabled={!editing}
                onChange={e => handleFieldChange("currencyCode", e.target.value)}>
                <option value="">{t("bi_not_selected")}</option>
                {CURRENCIES.map(cur => (
                  <option key={cur.code} value={cur.code}>{cur.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="bi-select-chevron"/>
            </div>
            {!editing && !d.currencyCode && (
              <span style={{ fontSize:11.5, color:"#f59e0b", marginTop:4, display:"block" }}>⚠ {t("bi_no_currency_selected")}</span>
            )}
            {editing && (
              <span style={{ fontSize:11, color:"#a1a1aa", marginTop:4, display:"block" }}>{t("bi_currency_auto_hint")}</span>
            )}
          </div>

          {/* ── Postal Code ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_postal_code")} <span className="bi-req">*</span></label>
            <div className={`bi-input-wrap ${errors.postalCode?"bi-err":""} ${!editing?"bi-readonly":""}`}>
              <Package size={15} className="bi-icon"/>
              <input className="bi-input" type="text" placeholder={t("bi_postal_code_ph")}
                value={d.postalCode} disabled={!editing}
                onChange={e => handleFieldChange("postalCode", e.target.value)}/>
            </div>
            {errors.postalCode && <span className="bi-field-err">⚠ {errors.postalCode}</span>}
          </div>

          {/* ── Opening Time ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_opening_time")} <span className="bi-req">*</span></label>
            <div className={`bi-input-wrap bi-select-wrap ${!editing?"bi-readonly":""}`}>
              <Clock size={15} className="bi-icon"/>
              <select className="bi-select" value={d.openingTime} disabled={!editing}
                onChange={e => handleFieldChange("openingTime", e.target.value)}>
                {TIMES.map(time => <option key={time} value={time}>{time}</option>)}
              </select>
              <ChevronDown size={13} className="bi-select-chevron"/>
            </div>
          </div>

          {/* ── Closing Time ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_closing_time")} <span className="bi-req">*</span></label>
            <div className={`bi-input-wrap bi-select-wrap ${!editing?"bi-readonly":""}`}>
              <Clock size={15} className="bi-icon"/>
              <select className="bi-select" value={d.closingTime} disabled={!editing}
                onChange={e => handleFieldChange("closingTime", e.target.value)}>
                {TIMES.map(time => <option key={time} value={time}>{time}</option>)}
              </select>
              <ChevronDown size={13} className="bi-select-chevron"/>
            </div>
          </div>

          {/* ── Working Days ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_working_days_optional")}</label>
            <div className={`bi-input-wrap bi-select-wrap ${!editing?"bi-readonly":""}`}>
              <Calendar size={15} className="bi-icon"/>
              <select className="bi-select" multiple value={d.workingDays}
                onChange={handleDaysChange} disabled={!editing} size={1} style={{ minHeight:42 }}>
                {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
              <ChevronDown size={13} className="bi-select-chevron"/>
            </div>
            {editing && <span className="bi-hint">{t("bi_hold_ctrl_hint")}</span>}
            {!editing && d.workingDays.length > 0 && (
              <div className="bi-days-display">
                {d.workingDays.map(day => <span key={day} className="bi-day-pill">{day.slice(0,3)}</span>)}
              </div>
            )}
          </div>

          {/* ── Timezone ── */}
          <div className="bi-field-group">
            <label className="bi-label">{t("bi_timezone")} <span className="bi-req">*</span></label>
            <div className={`bi-input-wrap bi-select-wrap ${!editing?"bi-readonly":""}`}>
              <Globe size={15} className="bi-icon"/>
              <select className="bi-select" value={d.timezone} disabled={!editing}
                onChange={e => handleFieldChange("timezone", e.target.value)}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
              <ChevronDown size={13} className="bi-select-chevron"/>
            </div>
          </div>

          {/* ── Description ── */}
          <div className="bi-col-full">
            <div className="bi-field-group">
              <label className="bi-label">{t("bi_description_optional")}</label>
              <div className={`bi-textarea-wrap ${!editing?"bi-readonly":""}`}>
                <textarea className="bi-textarea" placeholder={t("bi_description_ph")}
                  value={d.description} disabled={!editing}
                  onChange={e => handleFieldChange("description", e.target.value)}/>
                {editing && <Pencil size={14} className="bi-textarea-icon"/>}
              </div>
            </div>
          </div>

          {/* ── Table Service toggle ── */}
          <div className="bi-col-full">
            <div className="bi-field-group">
              <label className="bi-label">{t("bi_table_service")}</label>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background: editing ? "#fff" : "#f9fafb", border:"1.5px solid #e4e4e7", borderRadius:10 }}>
                <div style={{ paddingRight:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#18181b" }}>{t("bi_table_service_q")}</div>
                  <div style={{ fontSize:11.5, color:"#71717a", marginTop:3, lineHeight:1.5 }}>
                    {t("bi_table_service_desc")}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!editing}
                  onClick={() => handleFieldChange("hasTableService", !draft.hasTableService)}
                  style={{ width:46, height:26, borderRadius:999, background: d.hasTableService ? "#16a34a" : "#d1d5db", position:"relative", border:"none", cursor: editing ? "pointer" : "default", flexShrink:0, opacity: editing ? 1 : 0.7 }}
                >
                  <span style={{ position:"absolute", top:3, left: d.hasTableService ? 23 : 3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.15s" }} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Multiple Locations toggle ── */}
          <div className="bi-col-full">
            <div className="bi-field-group">
              <label className="bi-label">Multiple Locations</label>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background: editing ? "#fff" : "#f9fafb", border:"1.5px solid #e4e4e7", borderRadius:10 }}>
                <div style={{ paddingRight:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#18181b" }}>Does your business have more than one location?</div>
                  <div style={{ fontSize:11.5, color:"#71717a", marginTop:3, lineHeight:1.5 }}>
                    Turn this ON if you run more than one branch under this business. You'll get a
                    "Locations" section in your dashboard sidebar to manage each branch. Leave it OFF
                    if you only have this one location.
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!editing}
                  onClick={() => handleFieldChange("multiLocation", !draft.multiLocation)}
                  style={{ width:46, height:26, borderRadius:999, background: d.multiLocation ? "#16a34a" : "#d1d5db", position:"relative", border:"none", cursor: editing ? "pointer" : "default", flexShrink:0, opacity: editing ? 1 : 0.7 }}
                >
                  <span style={{ position:"absolute", top:3, left: d.multiLocation ? 23 : 3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.15s" }} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Order Types toggle ── */}
          <div className="bi-col-full">
            <div className="bi-field-group">
              <label className="bi-label">{t("bi_order_types")} <span className="bi-req">*</span></label>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background: editing ? "#fff" : "#f9fafb", border:"1.5px solid #e4e4e7", borderRadius:10 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#18181b" }}>🍽️ {t("bi_dine_in")}</div>
                    <div style={{ fontSize:11.5, color:"#71717a", marginTop:3 }}>{t("bi_dine_in_desc")}</div>
                  </div>
                  <button
                    type="button"
                    disabled={!editing}
                    onClick={() => handleFieldChange("dineInEnabled", !draft.dineInEnabled)}
                    style={{ width:46, height:26, borderRadius:999, background: d.dineInEnabled ? "#16a34a" : "#d1d5db", position:"relative", border:"none", cursor: editing ? "pointer" : "default", flexShrink:0, opacity: editing ? 1 : 0.7 }}
                  >
                    <span style={{ position:"absolute", top:3, left: d.dineInEnabled ? 23 : 3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.15s" }} />
                  </button>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background: editing ? "#fff" : "#f9fafb", border:"1.5px solid #e4e4e7", borderRadius:10 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#18181b" }}>🥡 {t("bi_take_away")}</div>
                    <div style={{ fontSize:11.5, color:"#71717a", marginTop:3 }}>{t("bi_take_away_desc")}</div>
                  </div>
                  <button
                    type="button"
                    disabled={!editing}
                    onClick={() => handleFieldChange("takeawayEnabled", !draft.takeawayEnabled)}
                    style={{ width:46, height:26, borderRadius:999, background: d.takeawayEnabled ? "#16a34a" : "#d1d5db", position:"relative", border:"none", cursor: editing ? "pointer" : "default", flexShrink:0, opacity: editing ? 1 : 0.7 }}
                  >
                    <span style={{ position:"absolute", top:3, left: d.takeawayEnabled ? 23 : 3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.15s" }} />
                  </button>
                </div>
                {errors.orderTypes && <span className="bi-field-err">⚠ {errors.orderTypes}</span>}
                {!d.dineInEnabled && !d.takeawayEnabled && !errors.orderTypes && (
                  <span style={{ fontSize:11.5, color:"#dc2626", fontWeight:600 }}>⚠ {t("bi_order_types_warn")}</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Extra fields ── */}
          {extraFields.map(field => {
            const Icon = field.icon;
            return (
              <div key={field.id} className="bi-col-full">
                <div className="bi-field-group">
                  <label className="bi-label">{field.label}</label>
                  <div className="bi-extra-field-row">
                    <div className={`bi-input-wrap ${!editing?"bi-readonly":""}`}>
                      <Icon size={15} className="bi-icon"/>
                      <input className="bi-input" type="text" placeholder={field.placeholder}
                        value={field.value} disabled={!editing}
                        onChange={e => updateExtraField(field.id, e.target.value)}/>
                    </div>
                    {editing && (
                      <button className="bi-remove-field-btn" onClick={() => removeExtraField(field.id)} type="button">
                        <X size={15}/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Add field ── */}
          {editing && (
            <div className="bi-col-full">
              <div className="bi-add-field-row">
                <button className="bi-add-field-btn" onClick={() => setShowAddField(v => !v)} type="button">
                  <Plus size={15}/> {t("bi_add_new_field")}
                </button>
                {showAddField && (
                  <div className="bi-field-picker">
                    <div className="bi-field-picker-title">{t("bi_choose_field_type")}</div>
                    {EXTRA_FIELD_TYPES.map(type => {
                      const Icon = type.icon;
                      return (
                        <button key={type.label} className="bi-field-picker-item" onClick={() => addExtraField(type)} type="button">
                          <Icon size={14}/> {type.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Update bar */}
        {editing && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 0 4px", borderTop:"1.5px solid #f4f4f5", marginTop:8, gap:12 }}>
            <div style={{ fontSize:12.5, color:"#71717a" }}>⚠ {t("bi_type_cannot_change")}</div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="bi-btn-cancel" onClick={handleCancel} type="button" disabled={saving}>
                <X size={15}/> {t("bi_cancel")}
              </button>
              <button className="bi-btn-done" onClick={handleUpdate} type="button" disabled={saving}
                style={{ background: saving?"#a78bfa":undefined, minWidth:120 }}>
                {saving ? <><div style={spinnerStyle}/> {t("bi_updating")}</> : <><Check size={15}/> {t("bi_update")}</>}
              </button>
            </div>
          </div>
        )}

        <div className="bi-secure-note">
          <Lock size={13}/>
          {t("bi_secure_note")}
        </div>
      </div>
    </div>
  );
};

export default BusinessInformation;