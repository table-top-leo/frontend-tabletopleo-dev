"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Info, X, Bell } from "lucide-react";
import { useCustomerLanguage } from "../context/CustomerLanguageProvider";

const CustomerDiningSelection = ({ diningInfo, onInfoChange, onBack, onContinue, hasTableService = false, dineInEnabled = true, takeawayEnabled = true }) => {
  const { t } = useCustomerLanguage();
  const OPTIONS = [
    { id:"dine-in",  emoji:"🍽️", title:t("dining.dineIn"),   desc:t("dining.dineInDesc") },
    { id:"takeaway", emoji:"🥡", title:t("dining.takeAway"), desc:t("dining.takeAwayDesc") },
  ];
  const [errors, setErrors] = useState({});
  const [knowMoreOpen, setKnowMoreOpen] = useState(false);

  // Only show order types this business actually accepts. If (unexpectedly)
  // neither is enabled, fall back to showing both rather than presenting
  // the customer with an empty screen and no way to order.
  const visibleOptions = OPTIONS.filter(opt =>
    (opt.id === "dine-in" && dineInEnabled) || (opt.id === "takeaway" && takeawayEnabled)
  );
  const options = visibleOptions.length > 0 ? visibleOptions : OPTIONS;

  // If the merchant only accepts one order type, skip the manual choice
  // entirely — auto-select it so the customer isn't asked to tap the only
  // available card.
  useEffect(() => {
    if (options.length === 1 && diningInfo.type !== options[0].id) {
      onInfoChange(p => ({ ...p, type: options[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length]);

  const set = (field) => (e) => {
    onInfoChange(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // Phone field: digits only, hard-capped at 10 characters — strips
  // anything typed or pasted that isn't 0-9 and truncates on every change,
  // so it's impossible to end up with letters, symbols, or more than 10
  // digits regardless of how the user enters it.
  const setPhone = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    onInfoChange(prev => ({ ...prev, phone: digitsOnly }));
    setErrors(prev => ({ ...prev, phone: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!diningInfo.type) errs.type = t("errors.pleaseSelectOrderType");

    // Phone: required for Take Away, optional for Dine In — but whenever
    // it's provided, it must be a valid 10-digit number, no more, no less.
    const phone = (diningInfo.phone || "").trim();
    if (diningInfo.type === "takeaway") {
      if (!phone) errs.phone = t("errors.phoneRequiredTakeaway");
      else if (!/^\d{10}$/.test(phone)) errs.phone = t("errors.invalidPhone");
    } else if (phone && !/^\d{10}$/.test(phone)) {
      errs.phone = t("errors.invalidPhone");
    }

    if (diningInfo.type === "takeaway") {
      if (!diningInfo.name.trim())  errs.name  = t("errors.nameRequiredTakeaway");
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
        <span className="cx-topbar-title">{t("dining.title")}</span>
        <div style={{ width:32 }}/>
      </div>

      <div style={{ flex:1, padding:"18px 16px", overflowY:"auto" }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)" }}>{t("dining.howWouldYouLikeOrder")}</div>
          <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:4 }}>{t("dining.selectPreference")}</div>
        </div>

        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          {options.map(opt => (
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
            {hasTableService ? (
              <div>
                {label(t("dining.tableNumber"))}
                <input style={inputStyle(false)} placeholder={t("dining.tableNumberPlaceholder")} value={diningInfo.table} onChange={set("table")} />
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"11px 13px", background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"var(--radius-md)" }}>
                <Bell size={16} color="var(--brand)" style={{ marginTop:1, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12.5, fontWeight:700, color:"var(--text-primary)" }}>{t("dining.noTableHeading")}</div>
                  <div style={{ fontSize:11.5, color:"var(--text-muted)", marginTop:2, lineHeight:1.5 }}>
                    {t("dining.noTableDesc")}
                  </div>
                  <button
                    onClick={() => setKnowMoreOpen(true)}
                    style={{ display:"inline-flex", alignItems:"center", gap:4, background:"none", border:"none", color:"var(--brand)", fontWeight:700, fontSize:11.5, cursor:"pointer", padding:"6px 0 0" }}
                  >
                    <Info size={12} /> {t("dining.knowMore")}
                  </button>
                </div>
              </div>
            )}
            <div>
              {label(t("dining.yourName"))}
              <input style={inputStyle(false)} placeholder={t("common.optional")} value={diningInfo.name} onChange={set("name")} />
            </div>
            <div>
              {label(t("dining.phoneNumber"))}
              <input
                style={inputStyle(!!errors.phone)}
                placeholder={`${t("dining.phoneNumberPlaceholder")} (${t("common.optional")})`}
                value={diningInfo.phone}
                onChange={setPhone}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
              />
              {diningInfo.phone && !errors.phone && (
                <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>{diningInfo.phone.length}/10 {t("dining.digitsSuffix")}</div>
              )}
              {errMsg(errors.phone)}
            </div>
          </div>
        )}

        {/* Take Away fields */}
        {diningInfo.type === "takeaway" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"fadeIn 0.2s ease" }}>
            <div>
              {label(t("dining.yourName"), true)}
              <input style={inputStyle(!!errors.name)} placeholder={t("dining.guestNamePlaceholder")} value={diningInfo.name} onChange={set("name")} />
              {errMsg(errors.name)}
            </div>
            <div>
              {label(t("dining.phoneNumber"), true)}
              <input
                style={inputStyle(!!errors.phone)}
                placeholder={t("dining.phoneNumberPlaceholder")}
                value={diningInfo.phone}
                onChange={setPhone}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
              />
              {diningInfo.phone && !errors.phone && (
                <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>{diningInfo.phone.length}/10 {t("dining.digitsSuffix")}</div>
              )}
              {errMsg(errors.phone)}
            </div>
            <div>
              {label(t("dining.email"))}
              <input style={inputStyle(false)} placeholder={t("dining.emailHint")} value={diningInfo.email} onChange={set("email")} type="email" />
            </div>
          </div>
        )}

        {/* Customer Note — show for both */}
        {diningInfo.type && (
          <div style={{ marginTop:14, animation:"fadeIn 0.2s ease" }}>
            {label(t("dining.specialInstructions"))}
            <textarea
              style={{ ...inputStyle(false), minHeight:70, resize:"vertical", fontFamily:"inherit", lineHeight:1.5 }}
              placeholder={t("dining.specialInstructionsPlaceholder")}
              value={diningInfo.note} onChange={set("note")}
            />
            <div style={{ fontSize:11.5, color:"var(--text-muted)", marginTop:4 }}>{t("dining.specialInstructionsNote")}</div>
          </div>
        )}
      </div>

      <div className="cx-sticky-bottom">
        <button className="cta-btn" disabled={!diningInfo.type} onClick={handleContinue}
          style={{ opacity: diningInfo.type ? 1 : 0.5 }}>
          {t("dining.continueToPayment")}
        </button>
      </div>

      {knowMoreOpen && (
        <div onClick={() => setKnowMoreOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background:"var(--surface, #fff)", borderRadius:18, width:"100%", maxWidth:380, boxShadow:"0 24px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", borderBottom:"1px solid var(--border-light)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:15, fontWeight:800, color:"var(--text-primary)" }}>
                <Bell size={17} color="var(--brand)" /> How you'll get your order
              </div>
              <button onClick={() => setKnowMoreOpen(false)} style={{ width:30, height:30, borderRadius:"50%", border:"none", background:"var(--surface-2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:12, fontSize:13, color:"var(--text-secondary)", lineHeight:1.6 }}>
              <div>This place doesn't use fixed table numbers, so there's nothing to fill in here — just place your order and:</div>
              <ul style={{ margin:0, paddingLeft:18, display:"flex", flexDirection:"column", gap:6 }}>
                <li>We'll announce your <strong>name</strong> (or your order number) when it's ready.</li>
                <li>Head to the counter to collect it.</li>
                <li>You can also track your order status live from the order confirmation screen.</li>
              </ul>
              <div style={{ background:"var(--brand-muted)", borderRadius:10, padding:"10px 12px", fontSize:12, color:"var(--text-primary)" }}>
                💡 Tip: entering your name and phone number above helps us call you correctly and text you when it's ready.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDiningSelection;