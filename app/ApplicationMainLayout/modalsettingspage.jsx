"use client";
import { useState, useRef } from "react";
import {
  Mail, X, CheckCircle2, Loader2, Trash2, Paperclip, Send, AlertCircle,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6163";

function getUser() {
  try { const s = localStorage.getItem("ttl_user"); return s ? JSON.parse(s) : null; }
  catch { return null; }
}

// ── EMAIL SUPPORT POPUP ───────────────────────────────────────
export function SupportModal({ onClose }) {
  const { t } = useLanguage();
  const SUPPORT_CATEGORIES = [
    t("modal_cat_technical"), t("modal_cat_billing"), t("modal_cat_account"),
    t("modal_cat_menu"), t("modal_cat_order"), t("modal_cat_feature"), t("modal_cat_other"),
  ];

  const [form,    setForm]    = useState({ subject:"", category:"", priority:"Medium", description:"", includeSysInfo:true });
  const [file,    setFile]    = useState(null);
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState("");
  const fileRef = useRef();

  const handleFile   = (e) => { if (e.target.files[0]) setFile(e.target.files[0]); };

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.category || !form.description.trim()) return;
    setSending(true);
    setError("");
    try {
      const token = localStorage.getItem("ttl_token");
      const res = await fetch(`${API_BASE}/api/admin/support-tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: form.subject.trim(),
          category: form.category,
          priority: form.priority,
          description: form.description.trim(),
          includeSysInfo: form.includeSysInfo,
          attachmentName: file ? file.name : null,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || t("modal_ticket_fail"));
      }
      setSent(true);
    } catch (e) {
      setError(e.message || t("modal_ticket_fail_retry"));
    } finally {
      setSending(false);
    }
  };

  const valid = form.subject.trim() && form.category && form.description.trim();

  const PRIORITY_META = {
    Low: { key: "modal_priority_low", color: "#16a34a", bg: "#f0fdf4" },
    Medium: { key: "modal_priority_medium", color: "#d97706", bg: "#fffbeb" },
    High: { key: "modal_priority_high", color: "#ef4444", bg: "#fef2f2" },
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1001, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:460, boxShadow:"0 24px 64px rgba(0,0,0,0.2)", animation:"spModalIn 0.22s cubic-bezier(0.34,1.4,0.64,1)", overflow:"hidden" }}>
        <style>{`@keyframes spModalIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid #f0f0f0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Mail size={15} color="#7c3aed"/>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:"#111", lineHeight:1 }}>{t("modal_contact_support")}</div>
              <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{t("modal_respond_24h")}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex", padding:4, borderRadius:6 }}>
            <X size={17}/>
          </button>
        </div>

        {sent ? (
          <div style={{ padding:"36px 24px", textAlign:"center" }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
              <CheckCircle2 size={26} color="#16a34a"/>
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:"#111", marginBottom:6 }}>{t("modal_ticket_submitted")}</div>
            <div style={{ fontSize:13, color:"#6b7280", lineHeight:1.6, marginBottom:20 }}>
              {t("modal_ticket_submitted_desc")} <strong>{getUser()?.email || t("modal_your_email")}</strong>.
            </div>
            <button onClick={onClose} style={{ padding:"9px 24px", background:"#7c3aed", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {t("modal_done")}
            </button>
          </div>
        ) : (
          <div style={{ padding:"16px 18px 18px", display:"flex", flexDirection:"column", gap:11 }}>

            {/* Subject */}
            <div>
              <label style={{ fontSize:11.5, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>
                {t("modal_subject")} <span style={{ color:"#ef4444" }}>*</span>
              </label>
              <input type="text" placeholder={t("modal_subject_ph")}
                value={form.subject} onChange={e => setForm(p=>({...p,subject:e.target.value}))}
                style={{ width:"100%", padding:"8px 11px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:13, outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#7c3aed"}
                onBlur={e=>e.target.style.borderColor="#e4e4e7"}
              />
            </div>

            {/* Category + Priority */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <label style={{ fontSize:11.5, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>
                  {t("modal_category")} <span style={{ color:"#ef4444" }}>*</span>
                </label>
                <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}
                  style={{ width:"100%", padding:"8px 11px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:12.5, outline:"none", background:"#fff", cursor:"pointer", appearance:"none", boxSizing:"border-box" }}>
                  <option value="">{t("modal_select_ellipsis")}</option>
                  {SUPPORT_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11.5, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{t("modal_priority")}</label>
                <div style={{ display:"flex", gap:5 }}>
                  {["Low","Medium","High"].map(p=>{
                    const meta = PRIORITY_META[p];
                    return (
                      <button key={p} type="button" onClick={()=>setForm(f=>({...f,priority:p}))}
                        style={{ flex:1, padding:"7px 4px", borderRadius:7, border:`1.5px solid ${form.priority===p?meta.color:"#e4e4e7"}`, background:form.priority===p?meta.bg:"transparent", fontSize:11, fontWeight:700, color:form.priority===p?meta.color:"#6b7280", cursor:"pointer" }}>
                        {t(meta.key)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize:11.5, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>
                {t("modal_description")} <span style={{ color:"#ef4444" }}>*</span>
              </label>
              <textarea rows={4} placeholder={t("modal_description_ph")}
                value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                style={{ width:"100%", padding:"8px 11px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:13, outline:"none", resize:"none", fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.5 }}
                onFocus={e=>e.target.style.borderColor="#7c3aed"}
                onBlur={e=>e.target.style.borderColor="#e4e4e7"}
              />
            </div>

            {/* Attachment + sysinfo */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
              <div>
                <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={handleFile}/>
                <button type="button" onClick={()=>fileRef.current?.click()}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8, border:"1.5px dashed #d1d5db", background:"#fafaf9", fontSize:12, fontWeight:600, color:"#6b7280", cursor:"pointer" }}>
                  <Paperclip size={12}/>
                  {file ? file.name.slice(0,20)+(file.name.length>20?"...":"") : t("modal_attach_file")}
                </button>
                {file && <button type="button" onClick={()=>setFile(null)} style={{ marginLeft:6, fontSize:11, color:"#ef4444", background:"none", border:"none", cursor:"pointer" }}>✕</button>}
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:5, cursor:"pointer", fontSize:11.5, color:"#6b7280", fontWeight:600 }}>
                <input type="checkbox" checked={form.includeSysInfo} onChange={e=>setForm(p=>({...p,includeSysInfo:e.target.checked}))} style={{ accentColor:"#7c3aed" }}/>
                {t("modal_include_sysinfo")}
              </label>
            </div>

            {error && (
              <div style={{ display:"flex", alignItems:"center", gap:7, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"8px 11px", fontSize:12, color:"#dc2626", fontWeight:600 }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", paddingTop:2 }}>
              <button type="button" onClick={onClose}
                style={{ padding:"8px 16px", borderRadius:8, border:"1.5px solid #e4e4e7", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                {t("cancel")}
              </button>
              <button type="button" onClick={handleSubmit} disabled={!valid||sending}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:8, border:"none", background:valid?"#7c3aed":"#d1d5db", color:"#fff", fontSize:13, fontWeight:700, cursor:valid?"pointer":"not-allowed" }}>
                {sending
                  ? <><Loader2 size={12} style={{ animation:"spin .7s linear infinite" }}/> {t("modal_sending")}</>
                  : <><Send size={12}/> {t("modal_submit_ticket")}</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DELETE ACCOUNT POPUP ──────────────────────────────────────
export function DeleteModal({ fullName, onConfirm, onCancel, loading, error }) {
  const { t } = useLanguage();
  const LEAVE_REASONS = [
    t("modal_reason1"), t("modal_reason2"), t("modal_reason3"), t("modal_reason4"),
    t("modal_reason5"), t("modal_reason6"), t("modal_reason7"), t("modal_reason8"),
  ];
  const CONSEQUENCES = [t("modal_consequence1"), t("modal_consequence2"), t("modal_consequence3"), t("modal_consequence4")];

  const [reason,  setReason]  = useState("");
  const [comment, setComment] = useState("");

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1001, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }}>
      <div style={{ background:"#fff", borderRadius:16, maxWidth:430, width:"100%", boxShadow:"0 24px 64px rgba(0,0,0,0.22)", animation:"spModalIn 0.22s cubic-bezier(0.34,1.4,0.64,1)", overflow:"hidden" }}>
        <style>{`@keyframes spModalIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* Header */}
        <div style={{ background:"#fef2f2", borderBottom:"1px solid #fecaca", padding:"13px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, background:"#fee2e2", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Trash2 size={16} color="#dc2626"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#18181b", lineHeight:1 }}>{t("modal_delete_account_title")}</div>
            <div style={{ fontSize:11, color:"#ef4444", fontWeight:600, marginTop:2 }}>⚠ {t("modal_irreversible")}</div>
          </div>
          <button onClick={onCancel} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex", padding:4, borderRadius:6 }}>
            <X size={17}/>
          </button>
        </div>

        <div style={{ padding:"14px 16px 16px", display:"flex", flexDirection:"column", gap:12 }}>

          {/* Consequences */}
          <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:10, padding:"10px 13px" }}>
            <div style={{ fontSize:11.5, fontWeight:700, color:"#92400e", marginBottom:7 }}>{t("modal_deleting_will")}</div>
            {CONSEQUENCES.map(item=>(
              <div key={item} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#78350f", marginBottom:4 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#d97706", flexShrink:0 }}/>
                {item}
              </div>
            ))}
          </div>

          {/* Reason */}
          <div>
            <label style={{ fontSize:11.5, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{t("modal_reason_for_leaving")}</label>
            <select value={reason} onChange={e=>setReason(e.target.value)}
              style={{ width:"100%", padding:"8px 11px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:13, outline:"none", background:"#fff", cursor:"pointer", boxSizing:"border-box" }}>
              <option value="">{t("modal_select_reason")}</option>
              {LEAVE_REASONS.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Comment */}
          <div>
            <label style={{ fontSize:11.5, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>
              {t("modal_additional_comments")} <span style={{ fontWeight:400, color:"#9ca3af" }}>{t("modal_optional")}</span>
            </label>
            <textarea rows={3} placeholder={t("modal_comments_ph")}
              value={comment} onChange={e=>setComment(e.target.value)}
              style={{ width:"100%", padding:"8px 11px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:12.5, outline:"none", resize:"none", fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.5, color:"#374151" }}/>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"9px 12px", fontSize:12, color:"#dc2626", fontWeight:600 }}>
              ⚠ {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={onCancel} disabled={loading} type="button"
              style={{ padding:"8px 16px", borderRadius:8, border:"1.5px solid #e4e4e7", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer", fontFamily:"inherit" }}>
              {t("cancel")}
            </button>
            <button onClick={() => onConfirm({ reason, comment })} disabled={loading} type="button"
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", minWidth:180, justifyContent:"center" }}>
              {loading
                ? <><Loader2 size={13} style={{ animation:"spin .7s linear infinite" }}/> {t("modal_deleting")}</>
                : <><Trash2 size={13}/> {t("modal_request_deletion")}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
