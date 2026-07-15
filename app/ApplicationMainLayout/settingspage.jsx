"use client";
import { useLanguage } from "../context/LanguageContext";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User, Bell, Shield, Smartphone, Globe, Moon, Sun, LogOut,
  ChevronRight, Check, Upload, Camera, Mail, Lock, Eye, EyeOff,
  QrCode, Download, Copy, RefreshCw, MessageCircle, BookOpen,
  ExternalLink, AlertCircle, Palette, Key, Trash2, CheckCircle2,
  Crown, Sparkles, HeadphonesIcon, Loader2, X,
} from "lucide-react";
import QRCode from "react-qr-code";
import "../designdashboardcomponent/settings.css";
import { changePassword, deleteAccount } from "../services/authService";

const NAV_SECTIONS = [
  { id:"profile",       icon:User },
  { id:"account",       icon:Shield },
  { id:"notifications", icon:Bell },
  { id:"appearance",    icon:Palette },
  { id:"qr",            icon:QrCode },
  { id:"language",      icon:Globe },
  { id:"plan",          icon:Crown },
  { id:"support",       icon:HeadphonesIcon },
  { id:"danger",        icon:AlertCircle },
];

// Nav labels resolved via t() at render time
const NAV_LABEL_KEYS = {
  profile:       "profile",
  account:       "account",
  notifications: "notifications",
  appearance:    "appearance",
  qr:            "qr",
  language:      "language",
  plan:          "plan",
  support:       "support",
  danger:        "danger",
};

const PLANS = [
  { id:"starter", name:"Starter", price:"Free",     colorClass:"plan-card-starter", features:["1 branch","Up to 50 orders/day","Basic analytics","Email support"], current:true },
  { id:"pro",     name:"Pro",     price:"₹999/mo",  colorClass:"plan-card-pro",     features:["3 branches","Unlimited orders","Advanced analytics","Priority support","Custom QR branding","Payment gateway"], current:false, popular:true },
  { id:"elite",   name:"Elite",   price:"₹2499/mo", colorClass:"plan-card-elite",   features:["Unlimited branches","All Pro features","White-label app","Dedicated manager","API access","Custom integrations"], current:false },
];

const ACCENTS = [
  { name:"violet",  cls:"accent-violet" },
  { name:"rose",    cls:"accent-rose" },
  { name:"amber",   cls:"accent-amber" },
  { name:"emerald", cls:"accent-emerald" },
  { name:"sky",     cls:"accent-sky" },
  { name:"orange",  cls:"accent-orange" },
];

function getUser() {
  try {
    const s = localStorage.getItem("ttl_user");
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

const Toggle = ({ checked, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)}
    className={`sp-toggle ${checked ? "sp-toggle-on" : "sp-toggle-off"}`}>
    <span className={`sp-toggle-thumb ${checked ? "sp-toggle-thumb-on" : ""}`} />
  </button>
);

const Section = ({ title, desc, children }) => (
  <div className="sp-section">
    <div className="sp-section-head">
      <h3 className="sp-section-title">{title}</h3>
      {desc && <p className="sp-section-desc">{desc}</p>}
    </div>
    <div className="sp-section-body">{children}</div>
  </div>
);

const Row = ({ icon:Icon, label, desc, action, noBorder, iconCls }) => (
  <div className={`sp-row ${noBorder ? "" : "sp-row-border"}`}>
    <div className="sp-row-icon"><Icon size={15} className={iconCls || "sp-icon-default"} /></div>
    <div className="sp-row-text">
      <div className="sp-row-label">{label}</div>
      {desc && <div className="sp-row-desc">{desc}</div>}
    </div>
    {action && <div className="sp-row-action">{action}</div>}
  </div>
);

function Toast({ msg, type }) {
  return (
    <div style={{
      position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
      background: type === "error" ? "#dc2626" : "#18181b",
      color:"#fff", padding:"11px 24px", borderRadius:30, fontSize:13.5,
      fontWeight:600, zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,0.18)",
      whiteSpace:"nowrap", animation:"spToastIn 0.25s ease",
    }}>
      <style>{`@keyframes spToastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {msg}
    </div>
  );
}

function DeleteModal({ fullName, onConfirm, onCancel, loading }) {
  const [typed, setTyped] = useState("");
  const match = typed.trim().toLowerCase() === "delete my account";

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
      zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center",
      padding:20, backdropFilter:"blur(3px)",
    }}>
      <div style={{
        background:"#fff", borderRadius:16, maxWidth:420, width:"100%",
        boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden",
        animation:"spModalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <style>{`@keyframes spModalIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>

        <div style={{ background:"#fef2f2", borderBottom:"1px solid #fecaca", padding:"18px 20px 14px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:"#fee2e2", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Trash2 size={17} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:"#18181b" }}>{t("delete_account")}</div>
            <div style={{ fontSize:12, color:"#71717a", marginTop:1 }}>This action cannot be undone</div>
          </div>
          <button onClick={onCancel} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"#a1a1aa", padding:4, borderRadius:6, display:"flex" }} type="button">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding:"20px 22px" }}>
          <div style={{ fontSize:13.5, color:"#3f3f46", lineHeight:1.6, marginBottom:16 }}>
            This will permanently delete <strong>{fullName}</strong>&apos;s account from the users table.
            Your business information, categories and products will remain in the database.
          </div>

          <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:10, padding:"10px 14px", marginBottom:18, fontSize:12.5, color:"#92400e", display:"flex", gap:8, alignItems:"flex-start" }}>
            <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }} />
            <span>You will be logged out immediately and will not be able to log back in.</span>
          </div>

          <label style={{ fontSize:12.5, fontWeight:600, color:"#3f3f46", display:"block", marginBottom:7 }}>
            Type <span style={{ color:"#dc2626", fontFamily:"monospace" }}>delete my account</span> to confirm
          </label>
          <input
            type="text"
            placeholder={t("type_to_confirm")}
            value={typed}
            onChange={e => setTyped(e.target.value)}
            style={{
              width:"100%", border:`1.5px solid ${match ? "#dc2626" : "#e4e4e7"}`,
              borderRadius:9, padding:"10px 13px", fontSize:13.5,
              fontFamily:"monospace", outline:"none", boxSizing:"border-box",
              color:"#18181b",
            }}
            autoFocus
          />
        </div>

        <div style={{ padding:"0 22px 20px", display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onCancel} disabled={loading} type="button" style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background:"#fff", border:"1.5px solid #e4e4e7", color:"#52525b",
            borderRadius:9, padding:"10px 18px", fontSize:13, fontWeight:700,
            cursor:"pointer", fontFamily:"inherit",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={!match || loading} type="button" style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background: match ? "#dc2626" : "#fca5a5",
            border:"none", color:"#fff", borderRadius:9, padding:"10px 18px",
            fontSize:13, fontWeight:700, cursor: match ? "pointer" : "not-allowed",
            fontFamily:"inherit", transition:"background .18s", minWidth:130,
          }}>
            {loading
              ? <><Loader2 size={14} style={{ animation:"spin .7s linear infinite" }} /> Deleting...</>
              : <><Trash2 size={14} /> Delete Account</>}
          </button>
        </div>
      </div>
    </div>
  );
}

const SendIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
  </svg>
);


// ── ALL WORLD LANGUAGES ─────────────────────────────────────
const ALL_LANGUAGES = [
  { code:"en",    name:"English",                     flag:"🇺🇸", region:"Global" },
  { code:"hi",    name:"Hindi (हिन्दी)",               flag:"🇮🇳", region:"South Asia" },
  { code:"bn",    name:"Bengali (বাংলা)",              flag:"🇧🇩", region:"South Asia" },
  { code:"te",    name:"Telugu (తెలుగు)",               flag:"🇮🇳", region:"South Asia" },
  { code:"mr",    name:"Marathi (मराठी)",              flag:"🇮🇳", region:"South Asia" },
  { code:"ta",    name:"Tamil (தமிழ்)",               flag:"🇮🇳", region:"South Asia" },
  { code:"gu",    name:"Gujarati (ગુજરાતી)",           flag:"🇮🇳", region:"South Asia" },
  { code:"kn",    name:"Kannada (ಕನ್ನಡ)",              flag:"🇮🇳", region:"South Asia" },
  { code:"ml",    name:"Malayalam (മലയാളം)",           flag:"🇮🇳", region:"South Asia" },
  { code:"pa",    name:"Punjabi (ਪੰਜਾਬੀ)",             flag:"🇮🇳", region:"South Asia" },
  { code:"ur",    name:"Urdu (اردو)",                 flag:"🇵🇰", region:"South Asia" },
  { code:"ar",    name:"Arabic (العربية)",             flag:"🇸🇦", region:"Middle East" },
  { code:"fa",    name:"Persian (فارسی)",              flag:"🇮🇷", region:"Middle East" },
  { code:"he",    name:"Hebrew (עברית)",               flag:"🇮🇱", region:"Middle East" },
  { code:"tr",    name:"Turkish (Türkçe)",             flag:"🇹🇷", region:"Europe / Asia" },
  { code:"da",    name:"Danish (Dansk)",               flag:"🇩🇰", region:"Europe" },
  { code:"de",    name:"German (Deutsch)",             flag:"🇩🇪", region:"Europe" },
  { code:"fr",    name:"French (Français)",            flag:"🇫🇷", region:"Europe" },
  { code:"es",    name:"Spanish (Español)",            flag:"🇪🇸", region:"Europe" },
  { code:"pt",    name:"Portuguese (Português)",       flag:"🇵🇹", region:"Europe" },
  { code:"it",    name:"Italian (Italiano)",           flag:"🇮🇹", region:"Europe" },
  { code:"nl",    name:"Dutch (Nederlands)",           flag:"🇳🇱", region:"Europe" },
  { code:"pl",    name:"Polish (Polski)",              flag:"🇵🇱", region:"Europe" },
  { code:"sv",    name:"Swedish (Svenska)",            flag:"🇸🇪", region:"Europe" },
  { code:"no",    name:"Norwegian (Norsk)",            flag:"🇳🇴", region:"Europe" },
  { code:"fi",    name:"Finnish (Suomi)",              flag:"🇫🇮", region:"Europe" },
  { code:"ru",    name:"Russian (Русский)",            flag:"🇷🇺", region:"Europe" },
  { code:"uk",    name:"Ukrainian (Українська)",       flag:"🇺🇦", region:"Europe" },
  { code:"el",    name:"Greek (Ελληνικά)",             flag:"🇬🇷", region:"Europe" },
  { code:"ro",    name:"Romanian (Română)",            flag:"🇷🇴", region:"Europe" },
  { code:"cs",    name:"Czech (Čeština)",              flag:"🇨🇿", region:"Europe" },
  { code:"hu",    name:"Hungarian (Magyar)",           flag:"🇭🇺", region:"Europe" },
  { code:"zh",    name:"Chinese Simplified (中文)",    flag:"🇨🇳", region:"East Asia" },
  { code:"zh-TW", name:"Chinese Traditional (繁體中文)",flag:"🇹🇼", region:"East Asia" },
  { code:"ja",    name:"Japanese (日本語)",             flag:"🇯🇵", region:"East Asia" },
  { code:"ko",    name:"Korean (한국어)",               flag:"🇰🇷", region:"East Asia" },
  { code:"th",    name:"Thai (ภาษาไทย)",              flag:"🇹🇭", region:"Southeast Asia" },
  { code:"vi",    name:"Vietnamese (Tiếng Việt)",      flag:"🇻🇳", region:"Southeast Asia" },
  { code:"id",    name:"Indonesian (Bahasa Indonesia)",flag:"🇮🇩", region:"Southeast Asia" },
  { code:"ms",    name:"Malay (Bahasa Melayu)",        flag:"🇲🇾", region:"Southeast Asia" },
  { code:"tl",    name:"Filipino (Tagalog)",           flag:"🇵🇭", region:"Southeast Asia" },
  { code:"sw",    name:"Swahili (Kiswahili)",          flag:"🇰🇪", region:"Africa" },
  { code:"am",    name:"Amharic (አማርኛ)",              flag:"🇪🇹", region:"Africa" },
  { code:"yo",    name:"Yoruba (Yorùbá)",              flag:"🇳🇬", region:"Africa" },
  { code:"ha",    name:"Hausa",                       flag:"🇳🇬", region:"Africa" },
  { code:"pt-BR", name:"Brazilian Portuguese",         flag:"🇧🇷", region:"Americas" },
  { code:"es-MX", name:"Mexican Spanish",              flag:"🇲🇽", region:"Americas" },
];

const REGIONS_LIST = ["All", ...new Set(ALL_LANGUAGES.map(l=>l.region))];

const LanguageSection = ({ languageCode, languageName, setLanguage, t }) => {
  const [search,   setSearch]   = useState("");
  const [region,   setRegion]   = useState("All");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [selected, setSelected] = useState(languageCode || "en");

  const filtered = ALL_LANGUAGES.filter(l => {
    const mS = l.name.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase());
    const mR = region==="All" || l.region===region;
    return mS && mR;
  });

  const handleSave = async () => {
    const lang = ALL_LANGUAGES.find(l=>l.code===selected);
    if (!lang || selected===languageCode) return;
    setSaving(true);
    try { await setLanguage(lang.code, lang.name); setSaved(true); setTimeout(()=>setSaved(false),2500); }
    finally { setSaving(false); }
  };

  const current = ALL_LANGUAGES.find(l=>l.code===languageCode) || ALL_LANGUAGES[0];

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:"#111", margin:"0 0 4px", letterSpacing:"-0.4px" }}>Language</h2>
        <p style={{ fontSize:13, color:"#6b7280", margin:0 }}>Choose the language for your admin dashboard</p>
      </div>
      <div style={{ background:"#f0fdf4", border:"1.5px solid #bbf7d0", borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:28 }}>{current.flag}</span>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"#16a34a", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>Current Language</div>
          <div style={{ fontSize:14, fontWeight:700, color:"#111" }}>{current.name}</div>
        </div>
        {languageCode!=="en" && (
          <button onClick={async ()=>{ setSelected("en"); await setLanguage("en","English"); }}
            style={{ marginLeft:"auto", fontSize:12, fontWeight:600, color:"#6b7280", background:"none", border:"1px solid #e4e4e7", borderRadius:8, padding:"5px 10px", cursor:"pointer" }}>
            {t("reset_english")}
          </button>
        )}
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:14 }}>
        <div style={{ flex:1, position:"relative" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:14 }}>🔍</span>
          <input type="text" placeholder={t("search_language")}
            value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width:"100%", padding:"9px 12px 9px 32px", borderRadius:9, border:"1.5px solid #e4e4e7", fontSize:13.5, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <select value={region} onChange={e=>setRegion(e.target.value)}
          style={{ padding:"9px 12px", borderRadius:9, border:"1.5px solid #e4e4e7", fontSize:13, color:"#374151", background:"#fff", cursor:"pointer" }}>
          {REGIONS_LIST.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8, maxHeight:420, overflowY:"auto", paddingRight:4, marginBottom:20 }}>
        {filtered.map(lang=>{
          const isSel=selected===lang.code;
          const isCur=languageCode===lang.code;
          return (
            <button key={lang.code} onClick={()=>setSelected(lang.code)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", border:`1.5px solid ${isSel?"#635bff":isCur?"#16a34a":"#e4e4e7"}`, borderRadius:10, background:isSel?"#ede9fe":isCur?"#f0fdf4":"#fff", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{lang.flag}</span>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:isSel?"#635bff":isCur?"#16a34a":"#111", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lang.name}</div>
                <div style={{ fontSize:10.5, color:"#9ca3af" }}>{lang.code.toUpperCase()} · {lang.region}</div>
              </div>
              {(isSel||isCur) && (
                <div style={{ marginLeft:"auto", flexShrink:0, width:18, height:18, borderRadius:"50%", background:isSel?"#635bff":"#16a34a", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:"#fff", fontSize:10, fontWeight:900 }}>✓</span>
                </div>
              )}
            </button>
          );
        })}
        {filtered.length===0 && <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"32px 0", color:"#9ca3af", fontSize:13 }}>No languages found</div>}
      </div>
      <button onClick={handleSave} disabled={saving||selected===languageCode}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"11px 28px", background:saving||selected===languageCode?"#d1d5db":"#111", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:saving||selected===languageCode?"not-allowed":"pointer" }}>
        {saving?t("updating"):saved?t("language_saved"):t("save_language")}
      </button>
    </div>
  );
};

export default function SettingsPage() {
  const router = useRouter();
  const { languageCode, languageName, setLanguage, t } = useLanguage();
  const [active,        setActive]      = useState("profile");
  const [darkMode,      setDarkMode]    = useState(false);
  const [accent,        setAccent]      = useState("violet");
  const [copied,        setCopied]      = useState(false);
  const [showPass,      setShowPass]    = useState({ current:false, new:false, confirm:false });
  const [avatarPreview, setAvatar]      = useState(null);
  const [twoFA,         setTwoFA]       = useState(false);
  const [toast,         setToast]       = useState(null);
  const [pwLoading,     setPwLoading]   = useState(false);
  const [pwErrors,      setPwErrors]    = useState({});
  const [passwords,     setPasswords]   = useState({ current:"", new:"", confirm:"" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading,   setDeleteLoading]   = useState(false);
  const [notifs, setNotifs] = useState({
    newOrder:true, orderStatus:true, lowStock:true, dailyReport:false,
    paymentAlert:true, customerReview:false, promotions:false, systemUpdates:true,
  });

  const avatarRef = useRef();

  const user       = getUser();
  const adminId    = user?.adminId    || "";
  const fullName   = user?.fullName   || "Admin";
  const email      = user?.email      || "";
  const businessId = user?.businessId || "";
  const initials   = fullName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const activeNav  = NAV_SECTIONS.find(n => n.id === active);
  const activeNavLabel = t(NAV_LABEL_KEYS[active] || active);

  const QR_DATA = businessId
    ? `https://tabletop.in/order/${businessId}`
    : `https://tabletop.in/order/${adminId}`;

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const copyQR = () => {
    navigator.clipboard?.writeText(QR_DATA).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwords.current) errors.current = "Current password is required.";
    if (!passwords.new) {
      errors.new = "New password is required.";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(passwords.new)) {
      errors.new = "Min 8 chars: uppercase, lowercase, digit and special char (@$!%*?&).";
    }
    if (!passwords.confirm) {
      errors.confirm = "Please confirm your new password.";
    } else if (passwords.new !== passwords.confirm) {
      errors.confirm = "Passwords do not match.";
    }
    return errors;
  };

  const handleChangePassword = async () => {
    const errors = validatePassword();
    if (Object.keys(errors).length) { setPwErrors(errors); return; }
    setPwLoading(true);
    setPwErrors({});
    try {
      await changePassword(adminId, passwords.current, passwords.new, passwords.confirm);
      setPasswords({ current:"", new:"", confirm:"" });
      showToast("Password changed successfully! ✓");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password.";
      if (msg.toLowerCase().includes("current")) {
        setPwErrors({ current: msg });
      } else {
        showToast(msg, "error");
      }
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount(adminId);
      localStorage.removeItem("ttl_token");
      localStorage.removeItem("ttl_user");
      setShowDeleteModal(false);
      showToast("Account deleted. Redirecting...");
      setTimeout(() => router.replace("/logintabletopleo"), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete account.", "error");
      setDeleteLoading(false);
    }
  };

  const renderSection = () => {
    switch (active) {

      case "profile":
        return (
          <>
            <Section title={t("profile_picture")} desc={t("profile_picture_desc")}>
              <div className="sp-avatar-row">
                <div className="sp-avatar-wrap">
                  <div className="sp-avatar">
                    {avatarPreview
                      ? <img src={avatarPreview} alt="avatar" className="sp-avatar-img" />
                      : <span className="sp-avatar-initials">{initials}</span>}
                  </div>
                  <button type="button" onClick={() => avatarRef.current?.click()} className="sp-avatar-cam">
                    <Camera size={10} color="#fff" />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="sp-hidden" onChange={handleAvatarUpload} />
                </div>
                <div className="sp-avatar-info">
                  <div className="sp-avatar-name">{fullName}</div>
                  <div className="sp-avatar-email">{email}</div>
                  <span className="sp-badge-role">Admin</span>
                </div>
                <button type="button" onClick={() => avatarRef.current?.click()} className="sp-btn-upload">
                  <Upload size={12} /> Upload
                </button>
              </div>
            </Section>

            <Section title={t("account_details")} desc={t("account_details_desc")}>
              <div className="sp-field-row sp-field-border">
                <label className="sp-field-label">{t("full_name")}</label>
                <div className="sp-info-val">{fullName}</div>
              </div>
              <div className="sp-field-row sp-field-border">
                <label className="sp-field-label">{t("email_address")}</label>
                <div className="sp-info-val">{email}</div>
              </div>
              <div className="sp-field-row sp-field-border">
                <label className="sp-field-label">{t("admin_id")}</label>
                <div className="sp-info-val sp-mono">{adminId}</div>
              </div>
              <div className="sp-field-row sp-field-border">
                <label className="sp-field-label">Business ID</label>
                <div className="sp-info-val sp-mono">{businessId || "Not set up yet"}</div>
              </div>
              <div className="sp-field-row">
                <label className="sp-field-label">Role</label>
                <div className="sp-info-val"><span className="sp-badge-role">Admin</span></div>
              </div>
              <div className="sp-field-row sp-actions-row" style={{ borderTop:"1.5px solid #f4f4f5", marginTop:8, paddingTop:14 }}>
                <div style={{ fontSize:12.5, color:"#71717a" }}>To update profile details, contact support.</div>
              </div>
            </Section>
          </>
        );

      case "account":
        return (
          <>
            <Section title={t("change_password")} desc={t("change_password_desc")}>
              {[
                { label:t("current_password"), key:"current", ph:t("enter_current_password") },
                { label:t("new_password"),      key:"new",     ph:t("min_8_chars") },
                { label:t("confirm_new_password"), key:"confirm", ph:t("re_enter_password") },
              ].map(({ label, key, ph }, i, arr) => (
                <div key={key} className={`sp-field-row ${i < arr.length - 1 ? "sp-field-border" : ""}`}>
                  <label className="sp-field-label">{label}</label>
                  <div style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
                    <div className="sp-pass-wrap">
                      <Lock size={13} className="sp-pass-icon" />
                      <input
                        type={showPass[key] ? "text" : "password"}
                        placeholder={ph}
                        value={passwords[key]}
                        onChange={e => {
                          setPasswords(p => ({ ...p, [key]: e.target.value }));
                          setPwErrors(er => ({ ...er, [key]:"" }));
                        }}
                        className={`sp-pass-input ${pwErrors[key] ? "sp-input-err" : ""}`}
                      />
                      <button type="button"
                        onClick={() => setShowPass(s => ({ ...s, [key]:!s[key] }))}
                        className="sp-eye-btn">
                        {showPass[key] ? <EyeOff size={13}/> : <Eye size={13}/>}
                      </button>
                    </div>
                    {pwErrors[key] && (
                      <div style={{ fontSize:12, color:"#ef4444", fontWeight:500 }}>⚠ {pwErrors[key]}</div>
                    )}
                  </div>
                </div>
              ))}
              <div className="sp-field-row sp-actions-row">
                <button type="button" className="sp-btn-primary" onClick={handleChangePassword} disabled={pwLoading}>
                  {pwLoading
                    ? <><Loader2 size={13} style={{ animation:"spin .7s linear infinite" }}/> Updating...</>
                    : <><Key size={13}/>{t("update_password")}</>}
                </button>
              </div>
            </Section>

            <Section title={t("account_information")} desc={t("account_info_desc")}>
              <div className="sp-field-row sp-field-border">
                <label className="sp-field-label">Logged in as</label>
                <div className="sp-info-val">{fullName}</div>
              </div>
              <div className="sp-field-row sp-field-border">
                <label className="sp-field-label">{t("email_address")}</label>
                <div className="sp-info-val">{email}</div>
              </div>
              <div className="sp-field-row">
                <label className="sp-field-label">{t("admin_id")}</label>
                <div className="sp-info-val sp-mono">{adminId}</div>
              </div>
            </Section>

            <Section title={t("security")} desc={t("security_desc")}>
              <Row icon={Shield} label={t("two_factor")}
                desc={twoFA ? t("two_factor_on") : t("two_factor_off")}
                action={<Toggle checked={twoFA} onChange={setTwoFA}/>} iconCls="sp-icon-violet"/>
              <Row icon={Smartphone} label={t("trusted_devices")} desc={t("trusted_devices_desc")} noBorder
                action={<button type="button" className="sp-link-btn">Manage</button>} iconCls="sp-icon-default"/>
            </Section>

            <Section title={t("active_sessions")}>
              {[
                { device:"Chrome · Desktop", location:"Hyderabad, IN", time:"Now",    current:true },
                { device:"Mobile Browser",   location:"Hyderabad, IN", time:"2h ago", current:false },
              ].map((s, i, arr) => (
                <div key={i} className={`sp-row ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                  <div className="sp-row-icon"><Smartphone size={14} className="sp-icon-default"/></div>
                  <div className="sp-row-text">
                    <div className="sp-row-label">{s.device}</div>
                    <div className="sp-row-desc">{s.location} · {s.time}</div>
                  </div>
                  <div className="sp-row-action">
                    {s.current
                      ? <span className="sp-badge-green">Current</span>
                      : <button type="button" className="sp-link-btn sp-link-red">Revoke</button>}
                  </div>
                </div>
              ))}
            </Section>
          </>
        );

      case "notifications":
        return (
          <Section title={t("notif_preferences")} desc={t("notif_desc")}>
            {[
              { key:"newOrder",       label:"New Orders",           desc:"Get notified when a new order arrives" },
              { key:"orderStatus",    label:t("order_status"),       desc:t("order_status_desc") },
              { key:"lowStock",       label:"Low Stock Alerts",      desc:"When inventory items are running low" },
              { key:"paymentAlert",   label:"Payment Alerts",        desc:"Successful and failed payment notifications" },
              { key:"dailyReport",    label:"Daily Summary Report",  desc:"End-of-day sales and order report" },
              { key:"customerReview", label:"Customer Reviews",      desc:"When a customer leaves a review" },
              { key:"promotions",     label:"Promotions & Offers",   desc:"Special deals and platform offers" },
              { key:"systemUpdates",  label:t("system_updates"),     desc:t("system_updates_desc") },
            ].map(({ key, label, desc }, i, arr) => (
              <div key={key} className={`sp-row ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                <div className="sp-row-text">
                  <div className="sp-row-label">{label}</div>
                  <div className="sp-row-desc">{desc}</div>
                </div>
                <div className="sp-row-action">
                  <Toggle checked={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]:v }))}/>
                </div>
              </div>
            ))}
          </Section>
        );

      case "appearance":
        return (
          <>
            <Section title={t("theme")} desc={t("theme_desc")}>
              <div className="sp-theme-row">
                {[{ label:"Light", icon:Sun, val:false }, { label:"Dark", icon:Moon, val:true }].map(({ label, icon:Icon, val }) => (
                  <button key={label} type="button" onClick={() => setDarkMode(val)}
                    className={`sp-theme-btn ${darkMode === val ? "sp-theme-active" : ""}`}>
                    <Icon size={15}/> {label}
                  </button>
                ))}
              </div>
            </Section>
            <Section title={t("accent_color")} desc={t("accent_color_desc")}>
              <div className="sp-accent-row">
                {ACCENTS.map(a => (
                  <button key={a.name} type="button" onClick={() => setAccent(a.name)}
                    className={`sp-accent-dot ${a.cls} ${accent === a.name ? "sp-accent-active" : ""}`}>
                    {accent === a.name && <Check size={12} color="#fff"/>}
                  </button>
                ))}
              </div>
            </Section>
            <Section title={t("display_density")} desc={t("display_density_desc")}>
              <div className="sp-density-row">
                {["Compact","Default","Comfortable"].map((d, i) => (
                  <button key={d} type="button" className={`sp-density-btn ${i === 1 ? "sp-density-active" : ""}`}>{d}</button>
                ))}
              </div>
            </Section>
            <Section title={t("language_region")}>
              {[
                { label:"Language",    val:"English (US)" },
                { label:"Date Format", val:"DD/MM/YYYY" },
                { label:"Currency",    val:"INR (₹)" },
              ].map(({ label, val }, i, arr) => (
                <div key={label} className={`sp-row ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                  <div className="sp-row-text"><div className="sp-row-label">{label}</div></div>
                  <div className="sp-row-action sp-row-val">{val} <ChevronRight size={12} className="sp-icon-default"/></div>
                </div>
              ))}
            </Section>
          </>
        );

      case "qr":
        return (
          <>
            <Section title={t("qr_title")} desc={t("qr_desc")}>
              <div className="sp-qr-center">
                <div className="sp-qr-box">
                  <QRCode value={QR_DATA} size={160} fgColor="#18181b"/>
                </div>
                <div className="sp-qr-meta">
                  <div className="sp-qr-name">{fullName}</div>
                  <div className="sp-qr-url">{QR_DATA}</div>
                </div>
                <div className="sp-qr-actions">
                  <button type="button" onClick={copyQR} className={`sp-btn-outline ${copied ? "sp-btn-copied" : ""}`}>
                    {copied ? <><CheckCircle2 size={13}/> Copied!</> : <><Copy size={13}/> Copy Link</>}
                  </button>
                  <button type="button" className="sp-btn-outline"><Download size={13}/> Download PNG</button>
                  <button type="button" className="sp-btn-primary"><RefreshCw size={13}/> Regenerate</button>
                </div>
              </div>
            </Section>
            <Section title={t("qr_settings")}>
              {[
                { label:"Custom Redirect URL", desc:"Link customers land on after scanning",  action:<ChevronRight size={14} className="sp-icon-default"/> },
                { label:"Track QR Scans",      desc:"Analytics for scan count and location", action:<Toggle checked={true} onChange={() => {}}/> },
                { label:"Add Logo to QR",      desc:"Embed your restaurant logo inside QR",  action:<span className="sp-badge-pro">Pro</span> },
                { label:"QR Color Theme",      desc:"Customise QR colors to match branding", action:<span className="sp-badge-pro">Pro</span> },
              ].map(({ label, desc, action }, i, arr) => (
                <div key={label} className={`sp-row ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                  <div className="sp-row-text">
                    <div className="sp-row-label">{label}</div>
                    <div className="sp-row-desc">{desc}</div>
                  </div>
                  <div className="sp-row-action">{action}</div>
                </div>
              ))}
            </Section>
          </>
        );

      case "language":
        return <LanguageSection languageCode={languageCode} languageName={languageName} setLanguage={setLanguage} t={t}/>;

      case "plan":
        return (
          <>
            <div className="sp-plan-banner">
              <Sparkles size={15} className="sp-plan-banner-icon"/>
              <div>
                <div className="sp-plan-banner-title">You&apos;re on the Free Starter plan</div>
                <div className="sp-plan-banner-desc">Upgrade to unlock unlimited orders, analytics and more.</div>
              </div>
            </div>
            <div className="sp-plan-grid">
              {PLANS.map(plan => (
                <div key={plan.id} className={`sp-plan-card ${plan.current ? "sp-plan-card-current" : ""}`}>
                  {plan.popular && <div className="sp-plan-popular">MOST POPULAR</div>}
                  <div className={`sp-plan-header ${plan.colorClass} ${plan.popular ? "sp-plan-header-offset" : ""}`}>
                    <div className="sp-plan-name">{plan.name}</div>
                    <div className="sp-plan-price">{plan.price}</div>
                  </div>
                  <div className="sp-plan-body">
                    <ul className="sp-plan-features">
                      {plan.features.map(f => (
                        <li key={f} className="sp-plan-feature"><Check size={12} className="sp-icon-green"/> {f}</li>
                      ))}
                    </ul>
                    <button type="button" disabled={plan.current}
                      className={`sp-plan-btn ${plan.current ? "sp-plan-btn-current" : "sp-plan-btn-upgrade"}`}>
                      {plan.current ? "Current Plan" : "Coming Soon"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Section title="Usage This Month">
              {[
                { label:"Orders",     used:142, max:50,  unit:"",   over:true },
                { label:"Menu Items", used:28,  max:50,  unit:"" },
                { label:"Storage",    used:340, max:500, unit:"MB" },
              ].map(({ label, used, max, unit, over }) => (
                <div key={label} className="sp-usage-row">
                  <div className="sp-usage-meta">
                    <span className="sp-usage-label">{label}</span>
                    <span className={`sp-usage-val ${over ? "sp-usage-over" : ""}`}>{used}{unit} / {max}{unit}</span>
                  </div>
                  <div className="sp-usage-bar">
                    <div className={`sp-usage-fill ${over ? "sp-usage-fill-red" : "sp-usage-fill-violet"}`}
                      style={{ width:`${Math.min((used / max) * 100, 100)}%` }}/>
                  </div>
                </div>
              ))}
            </Section>
          </>
        );

      case "support":
        return (
          <>
            <Section title="Get Help" desc="Find answers or reach out to our team">
              {[
                { icon:BookOpen,      label:"Documentation",    desc:"Guides, tutorials and API references",        iconCls:"sp-icon-blue" },
                { icon:MessageCircle, label:"Live Chat Support", desc:"Chat with our team — avg. 2 min response",   iconCls:"sp-icon-green" },
                { icon:Mail,          label:"Email Support",     desc:"support@tabletop.in",                        iconCls:"sp-icon-violet" },
                { icon:ExternalLink,  label:"Community Forum",   desc:"Ask questions, share tips with other users", iconCls:"sp-icon-amber" },
              ].map(({ icon:Icon, label, desc, iconCls }, i, arr) => (
                <button key={label} type="button" className={`sp-support-btn ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                  <div className="sp-support-icon"><Icon size={16} className={iconCls}/></div>
                  <div className="sp-row-text">
                    <div className="sp-row-label">{label}</div>
                    <div className="sp-row-desc">{desc}</div>
                  </div>
                  <ChevronRight size={14} className="sp-icon-default"/>
                </button>
              ))}
            </Section>
            <Section title="System Status">
              {[
                { service:"Order API",       status:"Operational" },
                { service:"Payment Gateway", status:"Operational" },
                { service:"QR Service",      status:"Operational" },
                { service:"Analytics",       status:"Degraded" },
              ].map(({ service, status }, i, arr) => (
                <div key={service} className={`sp-row ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                  <div className="sp-row-text"><div className="sp-row-label">{service}</div></div>
                  <div className={`sp-status-pill ${status === "Operational" ? "sp-status-ok" : "sp-status-warn"}`}>
                    <span className={`sp-status-dot ${status === "Operational" ? "sp-status-dot-ok" : "sp-status-dot-warn"}`}/>
                    {status}
                  </div>
                </div>
              ))}
            </Section>
            <Section title="Send Feedback" desc="Help us improve TableTop">
              <div className="sp-feedback-wrap">
                <textarea rows={3} placeholder="Share your thoughts, report bugs or suggest features..." className="sp-textarea"/>
                <div className="sp-actions-row">
                  <button type="button" className="sp-btn-primary"><SendIcon size={12}/> Send Feedback</button>
                </div>
              </div>
            </Section>
            <div className="sp-version-note">
              TableTop v2.4.1 ·{" "}
              <span className="sp-version-link">Release notes</span> ·{" "}
              <span className="sp-version-link">Privacy Policy</span>
            </div>
          </>
        );

      case "danger":
        return (
          <>
            <div className="sp-danger-banner">
              <AlertCircle size={15} className="sp-danger-icon"/>
              <span>These actions are irreversible. Proceed with extreme caution.</span>
            </div>
            <Section title="Danger Zone">
              <div className="sp-row sp-row-border">
                <div className="sp-row-icon sp-row-icon-red"><RefreshCw size={14} className="sp-icon-red"/></div>
                <div className="sp-row-text">
                  <div className="sp-row-label">Reset All Settings</div>
                  <div className="sp-row-desc">Restore all settings to default values</div>
                </div>
                <div className="sp-row-action">
                  <button type="button" className="sp-danger-btn sp-danger-btn-amber">Reset</button>
                </div>
              </div>

              <div className="sp-row sp-row-border">
                <div className="sp-row-icon sp-row-icon-red"><LogOut size={14} className="sp-icon-red"/></div>
                <div className="sp-row-text">
                  <div className="sp-row-label">Sign Out of All Devices</div>
                  <div className="sp-row-desc">Revoke all active sessions everywhere</div>
                </div>
                <div className="sp-row-action">
                  <button type="button" className="sp-danger-btn sp-danger-btn-orange">Sign Out All</button>
                </div>
              </div>

              <div className="sp-row">
                <div className="sp-row-icon sp-row-icon-red"><Trash2 size={14} className="sp-icon-red"/></div>
                <div className="sp-row-text">
                  <div className="sp-row-label">{t("delete_account")}</div>
                  <div className="sp-row-desc">
                    Remove your login credentials from the users table only.
                    Business data is not affected.
                  </div>
                </div>
                <div className="sp-row-action">
                  <button
                    type="button"
                    className="sp-danger-btn sp-danger-btn-red"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </Section>
          </>
        );

      default: return null;
    }
  };

  return (
    <div className="sp-root">
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .sp-info-val{font-size:13.5px;color:#18181b;font-weight:500;padding:2px 0}
        .sp-mono{font-family:monospace;font-size:13px;color:#5b21b6;background:#f5f3ff;padding:2px 8px;border-radius:6px}
        .sp-input-err{border-color:#ef4444 !important;}
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      {showDeleteModal && (
        <DeleteModal
          fullName={fullName}
          onConfirm={handleDeleteAccount}
          onCancel={() => !deleteLoading && setShowDeleteModal(false)}
          loading={deleteLoading}
        />
      )}

      <div className="sp-container">
        <div className="sp-page-head">
          <h1 className="sp-page-title">Settings</h1>
          <p className="sp-page-sub">
            Manage your account, preferences and integrations
            {fullName && <span style={{ color:"#7c3aed", fontWeight:600 }}> — {fullName}</span>}
          </p>
        </div>

        <div className="sp-layout">
          <aside className="sp-sidebar">
            {NAV_SECTIONS.map(({ id, icon:Icon }) => { const label = t(NAV_LABEL_KEYS[id]||id); return (
              <button key={id} type="button" onClick={() => setActive(id)}
                className={`sp-nav-btn ${active === id ? "sp-nav-active" : ""}`}>
                <Icon size={15} className={active === id ? "sp-nav-icon-active" : "sp-nav-icon"}/>
                <span className="sp-nav-label">{label}</span>
                {id === "plan" && <span className="sp-nav-badge">!</span>}
              </button>
            ); })}
          </aside>

          <div className="sp-mobile-tabs">
            {NAV_SECTIONS.map(({ id, icon:Icon }) => { const label = t(NAV_LABEL_KEYS[id]||id); return (
              <button key={id} type="button" onClick={() => setActive(id)}
                className={`sp-tab-btn ${active === id ? "sp-tab-active" : ""}`}>
                <Icon size={12}/> {label}
              </button>
            ); })}
          </div>

          <div className="sp-content">
            <div className="sp-content-head">
              {activeNav && <activeNav.icon size={16} className="sp-content-icon"/>}
              <h2 className="sp-content-title">{activeNavLabel}</h2>
            </div>
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}