"use client";
import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const OPTIONS = [
  { id:"dine-in",  emoji:"🍽️", title:"Dine In",   desc:"Sit down & enjoy inside the restaurant." },
  { id:"takeaway", emoji:"🥡", title:"Take Away", desc:"Pick up your order from the counter." },
];

const CustomerDiningSelection = ({ diningInfo, onInfoChange, onBack, onContinue }) => {
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    onInfoChange(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!diningInfo.type) errs.type = "Please select an order type.";
    if (diningInfo.type === "takeaway") {
      if (!diningInfo.name.trim())  errs.name  = "Name is required for Take Away.";
      if (!diningInfo.phone.trim()) errs.phone = "Phone number is required for Take Away.";
    }
    return errs;
  };

  const handleContinue = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onContinue(diningInfo);
  };

  const inputStyle = (hasErr) => ({
    width:"100%", padding:"11px 14px",
    border:`1.5px solid ${hasErr ? "var(--red)" : "var(--border)"}`,
    borderRadius:"var(--radius-md)", fontSize:14,
    color:"var(--text-primary)", background:"var(--surface-2)",
    outline:"none", fontFamily:"inherit", boxSizing:"border-box",
  });

  const label = (text, required) => (
    <label style={{ display:"block", fontSize:"12.5px", fontWeight:700, color:"var(--text-secondary)", marginBottom:6 }}>
      {text} {required && <span style={{ color:"var(--red)" }}>*</span>}
    </label>
  );

  const errMsg = (msg) => msg && (
    <p style={{ margin:"4px 0 0", fontSize:12, color:"var(--red)", fontWeight:500 }}>⚠ {msg}</p>
  );

  return (
    <div className="cw-screen">
      <div className="cx-topbar">
        <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20}/></button>
        <span className="cx-topbar-title">Order Type</span>
        <div style={{ width:32 }}/>
      </div>

      <div style={{ flex:1, padding:"18px 16px", overflowY:"auto" }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)" }}>How would you like your order?</div>
          <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:4 }}>Select your preference to continue</div>
        </div>

        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          {OPTIONS.map(opt => (
            <div key={opt.id} onClick={() => { onInfoChange(p => ({ ...p, type:opt.id })); setErrors(p=>({...p,type:""})); }}
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"20px 14px", borderRadius:20,
                border:`2.5px solid ${diningInfo.type===opt.id?"var(--brand)":"var(--border)"}`,
                background: diningInfo.type===opt.id?"var(--brand-muted)":"var(--surface-2)",
                cursor:"pointer", textAlign:"center", position:"relative",
                boxShadow: diningInfo.type===opt.id?"0 0 0 3px rgba(123,63,0,0.12)":"none" }}>
              {diningInfo.type===opt.id && <CheckCircle2 size={18} color="var(--brand)" style={{ position:"absolute", top:10, right:10 }}/>}
              <div style={{ fontSize:36 }}>{opt.emoji}</div>
              <div style={{ fontSize:15, fontWeight:800, color:"var(--text-primary)" }}>{opt.title}</div>
              <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.5 }}>{opt.desc}</div>
            </div>
          ))}
        </div>
        {errMsg(errors.type)}

        {/* Dine In fields */}
        {diningInfo.type === "dine-in" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"fadeIn 0.2s ease" }}>
            <div>
              {label("Table Number")}
              <input style={inputStyle(false)} placeholder="e.g. Table 5" value={diningInfo.table} onChange={set("table")} />
            </div>
            <div>
              {label("Your Name")}
              <input style={inputStyle(false)} placeholder="Optional" value={diningInfo.name} onChange={set("name")} />
            </div>
            <div>
              {label("Phone Number")}
              <input style={inputStyle(false)} placeholder="Optional" value={diningInfo.phone} onChange={set("phone")} />
            </div>
          </div>
        )}

        {/* Take Away fields */}
        {diningInfo.type === "takeaway" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"fadeIn 0.2s ease" }}>
            <div>
              {label("Your Name", true)}
              <input style={inputStyle(!!errors.name)} placeholder="Enter your name" value={diningInfo.name} onChange={set("name")} />
              {errMsg(errors.name)}
            </div>
            <div>
              {label("Phone Number", true)}
              <input style={inputStyle(!!errors.phone)} placeholder="+91 XXXXX XXXXX" value={diningInfo.phone} onChange={set("phone")} type="tel" />
              {errMsg(errors.phone)}
            </div>
            <div>
              {label("Email")}
              <input style={inputStyle(false)} placeholder="Optional — for e-receipt" value={diningInfo.email} onChange={set("email")} type="email" />
            </div>
          </div>
        )}

        {/* Customer Note — show for both */}
        {diningInfo.type && (
          <div style={{ marginTop:14, animation:"fadeIn 0.2s ease" }}>
            {label("Any Special Instructions?")}
            <textarea
              style={{ ...inputStyle(false), minHeight:70, resize:"vertical", fontFamily:"inherit", lineHeight:1.5 }}
              placeholder="e.g. Less spicy, no onion, extra sauce..."
              value={diningInfo.note} onChange={set("note")}
            />
            <div style={{ fontSize:11.5, color:"var(--text-muted)", marginTop:4 }}>This note will be shared with the kitchen.</div>
          </div>
        )}
      </div>

      <div className="cx-sticky-bottom">
        <button className="cta-btn" disabled={!diningInfo.type} onClick={handleContinue}
          style={{ opacity: diningInfo.type ? 1 : 0.5 }}>
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default CustomerDiningSelection;
