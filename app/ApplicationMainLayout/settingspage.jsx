"use client";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";
import { getCurrencySymbol } from "../utils/currencyHelper";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  User, Shield, Smartphone, Globe, QrCode, Crown, HeadphonesIcon,
  AlertCircle, Check, Upload, Camera, Mail, Lock, Eye, EyeOff,
  Copy, RefreshCw, BookOpen, Key, Trash2, CheckCircle2, Download,
  Sparkles, Loader2, ChevronRight, Zap, Star, LogOut,
} from "lucide-react";
import QRCode from "react-qr-code";
import "../designdashboardcomponent/settings.css";
import { changePassword } from "../services/authService";
import { SupportModal, DeleteModal } from "../ApplicationMainLayout/modalsettingspage";
import LanguageSection from "../ApplicationMainLayout/languagesettingspage";
import UpgradePlanPage from "../ApplicationMainLayout/UpgradePlanPage";

const NAV_SECTIONS = [
  { id:"profile",  icon:User,           label:"Profile" },
  { id:"account",  icon:Shield,         label:"Account & Security" },
  { id:"qr",       icon:QrCode,         label:"QR Code" },
  { id:"language", icon:Globe,          label:"Language" },
  { id:"plan",     icon:Crown,          label:"Upgrade Plan" },
  { id:"support",  icon:HeadphonesIcon, label:"Support" },
  { id:"danger",   icon:AlertCircle,    label:"Danger Zone" },
];

function getUser() {
  try { const s = localStorage.getItem("ttl_user"); return s ? JSON.parse(s) : null; }
  catch { return null; }
}

const Toggle = ({ checked, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)}
    className={`stg-toggle ${checked?"stg-on":""}`}>
    <span className="stg-toggle-thumb"/>
  </button>
);

const SendIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
  </svg>
);

export default function SettingsPage() {
  const { languageCode, languageName, setLanguage, t, languages, loadingLangs } = useLanguage();
  const { currencyCode } = useCurrency();
  const sym = getCurrencySymbol(currencyCode);

  const [active,          setActive]          = useState("profile");
  const [copied,          setCopied]          = useState(false);
  const [showPass,        setShowPass]        = useState({ current:false, new:false, confirm:false });
  const [avatarPreview,   setAvatar]          = useState(null);
  const [twoFA,           setTwoFA]           = useState(false);
  const [toast,           setToast]           = useState(null);
  const [pwLoading,       setPwLoading]       = useState(false);
  const [pwErrors,        setPwErrors]        = useState({});
  const [passwords,       setPasswords]       = useState({ current:"", new:"", confirm:"" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSupportModal,setShowSupportModal]= useState(false);
  const [showUpgrade,     setShowUpgrade]     = useState(false);
  const [logoUrl,         setLogoUrl]         = useState(null);
  const [businessName,    setBusinessName]    = useState("");
  const avatarRef = useRef();

  const user       = getUser();
  const adminId    = user?.adminId    || "";
  const fullName   = user?.fullName   || "Admin";
  const email      = user?.email      || "";
  const businessId = user?.businessId || "";
  const initials   = fullName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  const QR_DATA    = businessId ? `http://localhost:3000/menu/${businessId}` : `http://localhost:3000/menu/${adminId}`;

  useEffect(() => {
    if (!adminId) return;
    fetch(`http://localhost:6163/api/business-information/${adminId}`, {
      headers: { Authorization:`Bearer ${localStorage.getItem("ttl_token")||""}` }
    }).then(r=>r.json()).then(d=>{
      const b = d?.data || d;
      setLogoUrl(b?.logoUrl || null);
      setBusinessName(b?.businessName || "");
    }).catch(()=>{});
  }, [adminId]);

  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type }); setTimeout(()=>setToast(null), 3500);
  }, []);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const copyQR = () => {
    navigator.clipboard?.writeText(QR_DATA).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const validatePassword = () => {
    const e = {};
    if (!passwords.current) e.current = "Current password is required.";
    if (!passwords.new) e.new = "New password is required.";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(passwords.new))
      e.new = "Min 8 chars with uppercase, lowercase, digit & special char.";
    if (!passwords.confirm) e.confirm = "Please confirm your new password.";
    else if (passwords.new !== passwords.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleChangePassword = async () => {
    const e = validatePassword();
    if (Object.keys(e).length) { setPwErrors(e); return; }
    setPwLoading(true); setPwErrors({});
    try {
      await changePassword(adminId, passwords.current, passwords.new, passwords.confirm);
      setPasswords({ current:"", new:"", confirm:"" });
      showToast("Password changed successfully! ✓");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password.";
      if (msg.toLowerCase().includes("current")) setPwErrors({ current:msg });
      else showToast(msg, "error");
    } finally { setPwLoading(false); }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    showToast("Account deletion request sent. Our team will contact you within 24 hours.");
  };

  const PlanBanner = () => (
    <div className="stg-plan-banner">
      <div className="stg-plan-banner-l">
        <div className="stg-plan-banner-icon"><Zap size={13}/></div>
        <div>
          <div className="stg-plan-banner-title">You're on the <strong>Free Starter</strong> plan</div>
          <div className="stg-plan-banner-sub">Unlock unlimited orders, analytics &amp; custom branding</div>
        </div>
      </div>
      <button className="stg-plan-banner-btn" onClick={()=>setShowUpgrade(true)}>
        <Sparkles size={12}/> Upgrade Now
      </button>
    </div>
  );

  const renderSection = () => {
    switch (active) {

      case "profile": return (
        <div className="stg-sec-wrap">
          <PlanBanner/>
          <div className="stg-card">
            <div className="stg-card-head"><User size={14}/><span>Profile</span></div>
            <div className="stg-profile-hero">
              <div className="stg-av-area">
                <div className="stg-av-ring">
                  {(logoUrl||avatarPreview)
                    ? <img src={logoUrl||avatarPreview} alt="logo" className="stg-av-img"/>
                    : <span className="stg-av-ini">{initials}</span>}
                </div>
                <button className="stg-av-cam" onClick={()=>avatarRef.current?.click()}>
                  <Camera size={10} color="#fff"/>
                </button>
                <input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarUpload}/>
              </div>
              <div className="stg-profile-info">
                <div className="stg-profile-name">{businessName||fullName}</div>
                <div className="stg-profile-email">{email}</div>
                <div className="stg-profile-badges">
                  <span className="stg-badge stg-bv">Admin</span>
                  <span className="stg-badge stg-bg">Free Plan</span>
                </div>
              </div>
              <button className="stg-btn-outline stg-ml-auto" onClick={()=>avatarRef.current?.click()}>
                <Upload size={12}/> Change Photo
              </button>
            </div>
          </div>
          <div className="stg-card">
            <div className="stg-card-head"><span>Account Details</span></div>
            {[
              { label:"Full Name",   val:fullName },
              { label:"Email Address", val:email },
              { label:"Admin ID",    val:adminId,    mono:true },
              { label:"Business ID", val:businessId||"Not set up yet", mono:true },
              { label:"Plan",        val:"Free Starter", badge:true, bCls:"stg-bg" },
            ].map(({ label, val, mono, badge, bCls }) => (
              <div key={label} className="stg-field-row stg-row-border">
                <span className="stg-field-label">{label}</span>
                {badge
                  ? <span className={`stg-badge ${bCls}`}>{val}</span>
                  : <span className={`stg-field-val ${mono?"stg-mono":""}`}>{val}</span>}
              </div>
            ))}
            <div className="stg-field-note">To update details, go to Business Information or contact support.</div>
          </div>
        </div>
      );

      case "account": return (
        <div className="stg-sec-wrap">
          <div className="stg-card">
            <div className="stg-card-head"><Lock size={14}/><span>Change Password</span></div>
            {[
              { label:"Current Password", key:"current", ph:"Enter current password" },
              { label:"New Password",      key:"new",     ph:"Min 8 chars, special char" },
              { label:"Confirm Password",  key:"confirm", ph:"Re-enter new password" },
            ].map(({ label, key, ph }, i, arr) => (
              <div key={key} className={`stg-field-row ${i<arr.length-1?"stg-row-border":""}`}>
                <span className="stg-field-label">{label}</span>
                <div style={{flex:1}}>
                  <div className={`stg-pass-wrap ${pwErrors[key]?"stg-perr":""}`}>
                    <Lock size={13} style={{color:"#a1a1aa",flexShrink:0}}/>
                    <input type={showPass[key]?"text":"password"} placeholder={ph}
                      value={passwords[key]}
                      onChange={e=>{setPasswords(p=>({...p,[key]:e.target.value}));setPwErrors(er=>({...er,[key]:""}));}}
                      className="stg-pass-input"/>
                    <button type="button" className="stg-eye-btn" onClick={()=>setShowPass(s=>({...s,[key]:!s[key]}))}>
                      {showPass[key]?<EyeOff size={13}/>:<Eye size={13}/>}
                    </button>
                  </div>
                  {pwErrors[key] && <div className="stg-ferr">⚠ {pwErrors[key]}</div>}
                </div>
              </div>
            ))}
            <div className="stg-field-row" style={{justifyContent:"flex-end",padding:"14px 20px"}}>
              <button className="stg-btn-primary" onClick={handleChangePassword} disabled={pwLoading}>
                {pwLoading?<><Loader2 size={13} style={{animation:"spin .7s linear infinite"}}/> Updating...</>
                          :<><Key size={13}/> Update Password</>}
              </button>
            </div>
          </div>
          <div className="stg-card">
            <div className="stg-card-head"><Shield size={14}/><span>Security</span></div>
            <div className="stg-field-row stg-row-border">
              <div className="stg-row-icon"><Shield size={14} style={{color:"#7c3aed"}}/></div>
              <div style={{flex:1}}>
                <div className="stg-row-title">Two-Factor Authentication</div>
                <div className="stg-row-sub">{twoFA?"2FA is enabled":"Add an extra layer of security"}</div>
              </div>
              <Toggle checked={twoFA} onChange={setTwoFA}/>
            </div>
            <div className="stg-field-row stg-row-border">
              <div className="stg-row-icon"><Smartphone size={14} style={{color:"#a1a1aa"}}/></div>
              <div style={{flex:1}}>
                <div className="stg-row-title">Trusted Devices</div>
                <div className="stg-row-sub">Manage devices with account access</div>
              </div>
              <button className="stg-btn-ghost">Manage</button>
            </div>
            {[
              {device:"Chrome · Desktop",loc:"Hyderabad, IN",time:"Now",   cur:true},
              {device:"Mobile Browser",  loc:"Hyderabad, IN",time:"2h ago",cur:false},
            ].map((s,i,arr)=>(
              <div key={i} className={`stg-field-row ${i<arr.length-1?"stg-row-border":""}`}>
                <div className="stg-row-icon"><Smartphone size={14} style={{color:"#a1a1aa"}}/></div>
                <div style={{flex:1}}>
                  <div className="stg-row-title">{s.device}</div>
                  <div className="stg-row-sub">{s.loc} · {s.time}</div>
                </div>
                {s.cur
                  ? <span className="stg-badge stg-bg">Current</span>
                  : <button className="stg-btn-danger-sm">Revoke</button>}
              </div>
            ))}
          </div>
        </div>
      );

      case "qr": return (
        <div className="stg-sec-wrap">
          <div className="stg-card">
            <div className="stg-card-head"><QrCode size={14}/><span>Your Order QR Code</span></div>
            <div className="stg-qr-center">
              <div className="stg-qr-frame">
                <div className="stg-qr-inner"><QRCode value={QR_DATA} size={190} fgColor="#18181b"/></div>
                <div className="stg-qr-brand">TableTop Leo</div>
              </div>
              <div className="stg-qr-info">
                <div className="stg-qr-name">{businessName||fullName}</div>
                <div className="stg-qr-url">{QR_DATA}</div>
              </div>
              <div className="stg-qr-actions">
                <button className={`stg-btn-outline ${copied?"stg-copied":""}`} onClick={copyQR}>
                  {copied?<><CheckCircle2 size={13}/> Copied!</>:<><Copy size={13}/> Copy Link</>}
                </button>
                <button className="stg-btn-outline"><Download size={13}/> Download</button>
                <button className="stg-btn-primary"><RefreshCw size={13}/> Regenerate</button>
              </div>
            </div>
          </div>
          <div className="stg-card">
            <div className="stg-card-head"><span>QR Settings</span></div>
            {[
              {label:"Track QR Scans",  sub:"Analytics for scan count and location", action:<Toggle checked={true} onChange={()=>{}}/>},
              {label:"Add Logo to QR",  sub:"Embed restaurant logo inside QR",        action:<span className="stg-badge stg-bv">Pro</span>},
              {label:"Custom QR Color", sub:"Customize QR colors for branding",        action:<span className="stg-badge stg-bv">Pro</span>},
            ].map(({label,sub,action},i,arr)=>(
              <div key={label} className={`stg-field-row ${i<arr.length-1?"stg-row-border":""}`}>
                <div style={{flex:1}}>
                  <div className="stg-row-title">{label}</div>
                  <div className="stg-row-sub">{sub}</div>
                </div>
                {action}
              </div>
            ))}
          </div>
        </div>
      );

      case "language": return (
        <div className="stg-sec-wrap">
          <div className="stg-card" style={{padding:0}}>
            <div className="stg-card-head"><Globe size={14}/><span>Language</span></div>
            <LanguageSection languageCode={languageCode} languageName={languageName}
              setLanguage={setLanguage} t={t} languages={languages} loadingLangs={loadingLangs}/>
          </div>
        </div>
      );

      case "plan": return (
        <div className="stg-sec-wrap">
          <div className="stg-current-plan-card">
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div className="stg-cpc-icon"><Star size={20}/></div>
              <div>
                <div className="stg-cpc-title">Free Starter Plan</div>
                
              </div>
            </div>
            <button className="stg-upgrade-cta" onClick={()=>setShowUpgrade(true)}>
              <Sparkles size={14}/> Upgrade Plan
            </button>
          </div>

          <div className="stg-plan-cards-row">
            {[
              {name:"Starter",price:"Free",         color:"#64748b",tag:"Current",  current:true},
              {name:"Pro",    price:`${sym}999/mo`,  color:"#7c3aed",tag:"Popular",  popular:true},
              {name:"Elite",  price:`${sym}2,499/mo`,color:"#f59e0b",tag:"Best Value"},
            ].map(p=>(
              <div key={p.name} className={`stg-plan-mini ${p.current?"stg-pmc":""} ${p.popular?"stg-pmp":""}`}>
                <div className="stg-plan-mini-tag" style={{background:p.color}}>{p.tag}</div>
                <div className="stg-plan-mini-name">{p.name}</div>
                <div className="stg-plan-mini-price" style={{color:p.color}}>{p.price}</div>
                <button className="stg-plan-mini-btn"
                  style={{background:p.current?"#f4f4f5":p.color,color:p.current?"#a1a1aa":"#fff"}}
                  disabled={p.current} onClick={()=>!p.current&&setShowUpgrade(true)}>
                  {p.current?"Current Plan":"Upgrade →"}
                </button>
              </div>
            ))}
          </div>

          <div className="stg-card">
            
            
          </div>
        </div>
      );

      case "support": return (
        <div className="stg-sec-wrap">
          <div className="stg-card">
            <div className="stg-card-head"><HeadphonesIcon size={14}/><span>Get Help</span></div>
            {[
              {icon:BookOpen,label:"Documentation",   sub:"Step-by-step guides and tutorials", color:"#3b82f6",onClick:null},
              {icon:Mail,    label:"Email Support",    sub:"Submit a support ticket",           color:"#7c3aed",onClick:()=>setShowSupportModal(true)},
            ].map(({icon:Icon,label,sub,color,onClick},i,arr)=>(
              <button key={label} type="button" onClick={onClick||undefined}
                className={`stg-support-row ${i<arr.length-1?"stg-row-border":""}`}>
                <div className="stg-support-icon" style={{background:`${color}18`}}>
                  <Icon size={16} style={{color}}/>
                </div>
                <div style={{flex:1,textAlign:"left"}}>
                  <div className="stg-row-title">{label}</div>
                  <div className="stg-row-sub">{sub}</div>
                </div>
                <ChevronRight size={14} style={{color:"#d4d4d8"}}/>
              </button>
            ))}
          </div>
          <div className="stg-card">
            <div className="stg-card-head"><span>System Status</span></div>
            {[
              {service:"Order API",       ok:true},
              {service:"Payment Gateway", ok:true},
              {service:"QR Service",      ok:true},
              {service:"Analytics",       ok:false},
            ].map(({service,ok},i,arr)=>(
              <div key={service} className={`stg-field-row ${i<arr.length-1?"stg-row-border":""}`}>
                <span style={{flex:1,fontSize:13,fontWeight:500,color:"#3f3f46"}}>{service}</span>
                <span className={`stg-status-pill ${ok?"stg-ok":"stg-warn"}`}>
                  <span className="stg-dot"/>{ok?"Operational":"Degraded"}
                </span>
              </div>
            ))}
          </div>
          <div className="stg-card">
            <div className="stg-card-head"><span>Send Feedback</span></div>
            <div style={{padding:"14px 20px 18px"}}>
              <textarea rows={3} placeholder="Share thoughts, report bugs or suggest features..." className="stg-textarea"/>
              <div style={{marginTop:10,display:"flex",justifyContent:"flex-end"}}>
                <button className="stg-btn-primary"><SendIcon size={12}/> Send</button>
              </div>
            </div>
          </div>
          <div className="stg-version">TableTop Leo v2.4.1 · <span>Release Notes</span> · <span>Privacy Policy</span></div>
        </div>
      );

      case "danger": return (
        <div className="stg-sec-wrap">
          <div className="stg-danger-alert"><AlertCircle size={15}/> These actions are irreversible. Proceed with extreme caution.</div>
          <div className="stg-card">
            <div className="stg-card-head"><AlertCircle size={14} style={{color:"#ef4444"}}/><span>Danger Zone</span></div>
            {[
              {icon:RefreshCw,label:"Reset All Settings",    sub:"Restore all settings to defaults",          btnLabel:"Reset",        btnCls:"stg-da"},
              {icon:LogOut,   label:"Sign Out All Devices",   sub:"Revoke all active sessions everywhere",     btnLabel:"Sign Out All", btnCls:"stg-do"},
            ].map(({icon:Icon,label,sub,btnLabel,btnCls})=>(
              <div key={label} className="stg-field-row stg-row-border">
                <div className="stg-row-icon-red"><Icon size={14} style={{color:"#ef4444"}}/></div>
                <div style={{flex:1}}>
                  <div className="stg-row-title">{label}</div>
                  <div className="stg-row-sub">{sub}</div>
                </div>
                <button className={`stg-danger-btn ${btnCls}`}>{btnLabel}</button>
              </div>
            ))}
            <div className="stg-field-row">
              <div className="stg-row-icon-red"><Trash2 size={14} style={{color:"#ef4444"}}/></div>
              <div style={{flex:1}}>
                <div className="stg-row-title">Delete Account</div>
                <div className="stg-row-sub">Remove login credentials only. Business data is not affected.</div>
              </div>
              <button className="stg-danger-btn stg-dr" onClick={()=>setShowDeleteModal(true)}>Delete Account</button>
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  if (showUpgrade) return <UpgradePlanPage onBack={()=>setShowUpgrade(false)} currencySymbol={sym} currencyCode={currencyCode}/>;

  return (
    <div className="stg-root">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes stgToastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>

      {toast && (
        <div className={`stg-toast ${toast.type==="error"?"stg-toast-err":""}`}>{toast.msg}</div>
      )}
      {showSupportModal && <SupportModal onClose={()=>setShowSupportModal(false)}/>}
      {showDeleteModal && <DeleteModal fullName={fullName} onConfirm={handleDeleteAccount} onCancel={()=>setShowDeleteModal(false)} loading={false}/>}

      <div className="stg-page-header">
        <div>
          <h1 className="stg-page-title">Settings</h1>
          <p className="stg-page-sub">Manage your account, preferences and integrations{fullName && <span className="stg-page-user"> — {fullName}</span>}</p>
        </div>
        <div className="stg-header-user">
          <div className="stg-header-av">
            {(logoUrl||avatarPreview)
              ? <img src={logoUrl||avatarPreview} alt="" className="stg-av-img"/>
              : <span style={{fontSize:12,fontWeight:800,color:"#fff"}}>{initials}</span>}
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#18181b"}}>{businessName||fullName}</div>
            <div style={{fontSize:11,color:"#a1a1aa"}}>{email}</div>
          </div>
        </div>
      </div>

      <div className="stg-layout">
        <aside className="stg-sidebar">
          <div className="stg-sidebar-plan-box">
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <div className="stg-sp-icon"><Zap size={11}/></div>
              <span style={{fontSize:11,fontWeight:700,color:"#7c3aed"}}>Free Starter</span>
            </div>
             
            <button className="stg-sidebar-upgrade-btn" onClick={()=>setShowUpgrade(true)}>
              <Sparkles size={11}/> Upgrade Plan
            </button>
          </div>
          {NAV_SECTIONS.map(({id,icon:Icon,label})=>(
            <button key={id} type="button" onClick={()=>setActive(id)}
              className={`stg-nav-btn ${active===id?"stg-nav-active":""}`}>
              <Icon size={14} className="stg-nav-icon"/>
              <span className="stg-nav-label">{label}</span>
              {id==="plan" && <span className="stg-nav-badge">!</span>}
            </button>
          ))}
        </aside>

        <div className="stg-mobile-tabs">
          {NAV_SECTIONS.map(({id,icon:Icon,label})=>(
            <button key={id} type="button" onClick={()=>setActive(id)}
              className={`stg-tab-btn ${active===id?"stg-tab-active":""}`}>
              <Icon size={11}/> {label}
            </button>
          ))}
        </div>

        <div className="stg-content">
          <div className="stg-content-header">
            {(() => { const n=NAV_SECTIONS.find(n=>n.id===active); return n?(<><n.icon size={17} style={{color:"#7c3aed"}}/><h2 className="stg-content-title">{n.label}</h2></>):null; })()}
          </div>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}