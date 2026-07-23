"use client";
import { useState, useRef } from "react";
import {
  Mail, X, CheckCircle2, Loader2, Trash2, Paperclip, Send, AlertCircle,
} from "lucide-react";

function getUser() {
  try { const s = localStorage.getItem("ttl_user"); return s ? JSON.parse(s) : null; }
  catch { return null; }
}

const SUPPORT_CATEGORIES = [
  "Technical Issue","Billing & Payments","Account Access",
  "Menu & Products","Order Management","Feature Request","Other",
];

const LEAVE_REASONS = [
  "Too expensive","Missing features I need",
  "Switching to another product","Closing my business",
  "Too complicated to use","Technical problems",
  "Just testing / not ready yet","Other",
];

// ── EMAIL SUPPORT POPUP ───────────────────────────────────────
export function SupportModal({ onClose }) {
  const [form,    setForm]    = useState({ subject:"", category:"", priority:"Medium", description:"", includeSysInfo:true });
  const [file,    setFile]    = useState(null);
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef();

  const handleFile   = (e) => { if (e.target.files[0]) setFile(e.target.files[0]); };
  const handleSubmit = () => {
    if (!form.subject.trim() || !form.category || !form.description.trim()) return;
    setSending(true);
    setTimeout(() => { setSent(true); setSending(false); }, 1000);
  };
  const valid = form.subject.trim() && form.category && form.description.trim();

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
              <div style={{ fontSize:14, fontWeight:800, color:"#111", lineHeight:1 }}>Contact Support</div>
              <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>We'll respond within 24 hours</div>
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
            <div style={{ fontSize:15, fontWeight:800, color:"#111", marginBottom:6 }}>Ticket Submitted!</div>
            <div style={{ fontSize:13, color:"#6b7280", lineHeight:1.6, marginBottom:20 }}>
              Our team will get back to you at <strong>{getUser()?.email || "your email"}</strong>.
            </div>
            <button onClick={onClose} style={{ padding:"9px 24px", background:"#7c3aed", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Done
            </button>
          </div>
        ) : (
          <div style={{ padding:"16px 18px 18px", display:"flex", flexDirection:"column", gap:11 }}>

            {/* Subject */}
            <div>
              <label style={{ fontSize:11.5, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>
                Subject <span style={{ color:"#ef4444" }}>*</span>
              </label>
              <input type="text" placeholder="Brief summary of your issue"
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
                  Category <span style={{ color:"#ef4444" }}>*</span>
                </label>
                <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}
                  style={{ width:"100%", padding:"8px 11px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:12.5, outline:"none", background:"#fff", cursor:"pointer", appearance:"none", boxSizing:"border-box" }}>
                  <option value="">Select...</option>
                  {SUPPORT_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11.5, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>Priority</label>
                <div style={{ display:"flex", gap:5 }}>
                  {["Low","Medium","High"].map(p=>(
                    <button key={p} type="button" onClick={()=>setForm(f=>({...f,priority:p}))}
                      style={{ flex:1, padding:"7px 4px", borderRadius:7, border:`1.5px solid ${form.priority===p?(p==="High"?"#ef4444":p==="Medium"?"#f59e0b":"#16a34a"):"#e4e4e7"}`, background:form.priority===p?(p==="High"?"#fef2f2":p==="Medium"?"#fffbeb":"#f0fdf4"):"transparent", fontSize:11, fontWeight:700, color:form.priority===p?(p==="High"?"#ef4444":p==="Medium"?"#d97706":"#16a34a"):"#6b7280", cursor:"pointer" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize:11.5, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>
                Description <span style={{ color:"#ef4444" }}>*</span>
              </label>
              <textarea rows={4} placeholder="Describe your issue in detail. Include steps to reproduce if applicable..."
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
                  {file ? file.name.slice(0,20)+(file.name.length>20?"...":"") : "Attach file"}
                </button>
                {file && <button type="button" onClick={()=>setFile(null)} style={{ marginLeft:6, fontSize:11, color:"#ef4444", background:"none", border:"none", cursor:"pointer" }}>✕</button>}
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:5, cursor:"pointer", fontSize:11.5, color:"#6b7280", fontWeight:600 }}>
                <input type="checkbox" checked={form.includeSysInfo} onChange={e=>setForm(p=>({...p,includeSysInfo:e.target.checked}))} style={{ accentColor:"#7c3aed" }}/>
                Include system info
              </label>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", paddingTop:2 }}>
              <button type="button" onClick={onClose}
                style={{ padding:"8px 16px", borderRadius:8, border:"1.5px solid #e4e4e7", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={handleSubmit} disabled={!valid||sending}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:8, border:"none", background:valid?"#7c3aed":"#d1d5db", color:"#fff", fontSize:13, fontWeight:700, cursor:valid?"pointer":"not-allowed" }}>
                {sending
                  ? <><Loader2 size={12} style={{ animation:"spin .7s linear infinite" }}/> Sending...</>
                  : <><Send size={12}/> Submit Ticket</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DELETE ACCOUNT POPUP ──────────────────────────────────────
export function DeleteModal({ fullName, onConfirm, onCancel, loading }) {
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
            <div style={{ fontSize:14, fontWeight:800, color:"#18181b", lineHeight:1 }}>Delete Account</div>
            <div style={{ fontSize:11, color:"#ef4444", fontWeight:600, marginTop:2 }}>⚠ This action is irreversible</div>
          </div>
          <button onClick={onCancel} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex", padding:4, borderRadius:6 }}>
            <X size={17}/>
          </button>
        </div>

        <div style={{ padding:"14px 16px 16px", display:"flex", flexDirection:"column", gap:12 }}>

          {/* Consequences */}
          <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:10, padding:"10px 13px" }}>
            <div style={{ fontSize:11.5, fontWeight:700, color:"#92400e", marginBottom:7 }}>Deleting your account will:</div>
            {[
              "Deactivate your business profile",
              "Disable customer ordering via QR",
              "Cancel active subscription (if any)",
              "Schedule permanent deletion after 30 days",
            ].map(item=>(
              <div key={item} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#78350f", marginBottom:4 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#d97706", flexShrink:0 }}/>
                {item}
              </div>
            ))}
          </div>

          {/* Reason */}
          <div>
            <label style={{ fontSize:11.5, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>Reason for leaving</label>
            <select value={reason} onChange={e=>setReason(e.target.value)}
              style={{ width:"100%", padding:"8px 11px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:13, outline:"none", background:"#fff", cursor:"pointer", boxSizing:"border-box" }}>
              <option value="">Select a reason...</option>
              {LEAVE_REASONS.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Comment */}
          <div>
            <label style={{ fontSize:11.5, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>
              Additional comments <span style={{ fontWeight:400, color:"#9ca3af" }}>(optional)</span>
            </label>
            <textarea rows={3} placeholder="Tell us how we could have done better..."
              value={comment} onChange={e=>setComment(e.target.value)}
              style={{ width:"100%", padding:"8px 11px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:12.5, outline:"none", resize:"none", fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.5, color:"#374151" }}/>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={onCancel} disabled={loading} type="button"
              style={{ padding:"8px 16px", borderRadius:8, border:"1.5px solid #e4e4e7", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer", fontFamily:"inherit" }}>
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading} type="button"
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", minWidth:180, justifyContent:"center" }}>
              {loading
                ? <><Loader2 size={13} style={{ animation:"spin .7s linear infinite" }}/> Deleting...</>
                : <><Trash2 size={13}/> Request Account Deletion</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}