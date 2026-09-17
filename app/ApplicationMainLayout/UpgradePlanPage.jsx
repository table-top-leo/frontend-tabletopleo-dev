"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Check, X, Sparkles, Star, Crown, Zap,
  ChevronRight, ChevronLeft, User, Phone, Mail,
  MapPin, CreditCard, Lock, CheckCircle2, Loader2,
  Building2, Shield,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function getUser() {
  try { const s = localStorage.getItem("ttl_user"); return s ? JSON.parse(s) : null; } catch { return null; }
}

// ── PAYMENT METHOD ICONS (SVG inline) ─────────────────────────
const UpiIcon = () => (
  <svg viewBox="0 0 80 32" width="56" height="22">
    <rect width="80" height="32" rx="4" fill="#6B48C8"/>
    <text x="8" y="22" fontFamily="Arial" fontWeight="900" fontSize="16" fill="#fff">UPI</text>
    <circle cx="62" cy="16" r="8" fill="#F7A600"/>
    <circle cx="70" cy="16" r="8" fill="#EE3124" opacity=".85"/>
  </svg>
);
const RazorpayIcon = () => (
  <svg viewBox="0 0 100 28" width="80" height="22">
    <path d="M0 14 L12 2 L18 8 L10 16 L18 24 L12 30 Z" fill="#2E6BE6" transform="scale(0.8) translate(2,0)"/>
    <text x="22" y="19" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#2E6BE6">razorpay</text>
  </svg>
);
const StripeIcon = () => (
  <svg viewBox="0 0 60 26" width="48" height="20">
    <rect width="60" height="26" rx="4" fill="#635BFF"/>
    <text x="7" y="18" fontFamily="Arial" fontWeight="800" fontSize="13" fill="#fff">stripe</text>
  </svg>
);
const VisaIcon = () => (
  <svg viewBox="0 0 60 38" width="52" height="32">
    <rect width="60" height="38" rx="5" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5"/>
    <text x="6" y="26" fontFamily="Arial" fontWeight="900" fontSize="18" fill="#1A1F71" letterSpacing="-1">VISA</text>
  </svg>
);
const MastercardIcon = () => (
  <svg viewBox="0 0 54 38" width="46" height="32">
    <rect width="54" height="38" rx="5" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5"/>
    <circle cx="21" cy="19" r="11" fill="#EB001B"/>
    <circle cx="33" cy="19" r="11" fill="#F79E1B"/>
    <path d="M27 10.2a11 11 0 0 1 0 17.6 11 11 0 0 1 0-17.6z" fill="#FF5F00"/>
  </svg>
);
const AmexIcon = () => (
  <svg viewBox="0 0 60 38" width="52" height="32">
    <rect width="60" height="38" rx="5" fill="#2E77BC"/>
    <text x="4" y="17" fontFamily="Arial" fontWeight="800" fontSize="9" fill="#fff">AMERICAN</text>
    <text x="4" y="28" fontFamily="Arial" fontWeight="800" fontSize="9" fill="#fff">EXPRESS</text>
  </svg>
);

// ── STEPS ──────────────────────────────────────────────────────
// 0 = Plan list  1 = Billing details  2 = Payment method  3 = Processing  4 = Success

export default function UpgradePlanPage({ onBack, currencySymbol = "₹", currencyCode = "INR" }) {
  const { t } = useLanguage();

  const PLANS = [
    {
      id: "starter", name: t("up_plan_starter"), price: { monthly: 0, yearly: 0 },
      color: "#64748b", bg: "#f8fafc", border: "#e2e8f0",
      features: [t("up_feat_1branch"), t("up_feat_50orders"), t("up_feat_basic_analytics"), t("up_feat_qr"), t("up_feat_5cats"), t("up_feat_email_support")],
      current: true,
    },
    {
      id: "pro", name: t("up_plan_pro"), price: { monthly: 999, yearly: 799 },
      color: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe", popular: true,
      features: [t("up_feat_3branch"), t("up_feat_unlim_orders"), t("up_feat_adv_analytics"), t("up_feat_custom_qr"), t("up_feat_priority_support"), t("up_feat_gateway"), t("up_feat_reviews"), t("up_feat_unlim_cats")],
    },
    {
      id: "elite", name: t("up_plan_elite"), price: { monthly: 2499, yearly: 1999 },
      color: "#d97706", bg: "#fffbeb", border: "#fde68a",
      features: [t("up_feat_unlim_branch"), t("up_feat_all_pro"), t("up_feat_whitelabel"), t("up_feat_dedicated_mgr"), t("up_feat_api"), t("up_feat_custom_int"), t("up_feat_sms"), t("up_feat_adv_reporting")],
    },
  ];

  const COMPARE = [
    { label: t("up_cmp_branches"), starter: "1", pro: "3", elite: t("up_cmp_unlimited") },
    { label: t("up_cmp_orders_day"), starter: "50", pro: t("up_cmp_unlimited"), elite: t("up_cmp_unlimited") },
    { label: t("up_cmp_menu_cats"), starter: "5", pro: t("up_cmp_unlimited"), elite: t("up_cmp_unlimited") },
    { label: t("up_cmp_analytics"), starter: t("up_cmp_basic"), pro: t("up_cmp_advanced"), elite: t("up_cmp_advanced") },
    { label: t("up_cmp_qr_branding"), starter: false, pro: true, elite: true },
    { label: t("up_cmp_gateway"), starter: false, pro: true, elite: true },
    { label: t("up_cmp_api"), starter: false, pro: false, elite: true },
    { label: t("up_cmp_whitelabel"), starter: false, pro: false, elite: true },
    { label: t("up_cmp_support"), starter: t("up_cmp_email"), pro: t("up_cmp_priority"), elite: t("up_cmp_dedicated") },
  ];

  const PAYMENT_METHODS = [
    { id: "upi", label: t("up_pay_upi"), Icon: UpiIcon, sub: t("up_pay_upi_sub") },
    { id: "razorpay", label: t("up_pay_razorpay"), Icon: RazorpayIcon, sub: t("up_pay_razorpay_sub") },
    { id: "stripe", label: t("up_pay_stripe"), Icon: StripeIcon, sub: t("up_pay_stripe_sub") },
    { id: "card", label: t("up_pay_card"), Icon: () => <div style={{display:"flex",gap:4}}><VisaIcon/><MastercardIcon/><AmexIcon/></div>, sub: t("up_pay_card_sub") },
  ];

  const [step,          setStep]     = useState(0);
  const [billing,       setBilling]  = useState("monthly");
  const [selectedPlan,  setPlan]     = useState("pro");
  const [payMethod,     setPayMethod]= useState("upi");
  const [processing,    setProcessing]=useState(false);
  const [upiId,         setUpiId]    = useState("");
  const [cardData,      setCardData] = useState({ number:"", expiry:"", cvv:"", name:"" });
  const [details, setDetails] = useState({
    fullName:"", email:"", phone:"", businessName:"", address:"",
  });

  // Pre-fill from localStorage
  useEffect(() => {
    const u = getUser();
    if (!u) return;
    setDetails(d => ({
      ...d,
      fullName:     u.fullName     || "",
      email:        u.email        || "",
      phone:        u.phone        || u.businessPhone || "",
      businessName: u.businessName || "",
    }));
    // Fetch business info for address
    if (u.adminId) {
      fetch(`https://api.tabletopleo.com/api/business-information/${u.adminId}`, {
        headers:{ Authorization:`Bearer ${localStorage.getItem("ttl_token")||""}` }
      }).then(r=>r.json()).then(d=>{
        const b = d?.data || d;
        setDetails(prev=>({
          ...prev,
          businessName: b?.businessName || prev.businessName,
          address:      [b?.addressLine1,b?.city,b?.state].filter(Boolean).join(", "),
          phone:        b?.businessPhone || prev.phone,
        }));
      }).catch(()=>{});
    }
  }, []);

  const plan  = PLANS.find(p=>p.id===selectedPlan) || PLANS[1];
  const price = plan.price[billing];
  const fmt   = (n) => `${currencySymbol}${Number(n).toLocaleString()}`;

  const handlePay = () => {
    setStep(3);
    setTimeout(() => setStep(4), 3000);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f6f6f9", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif", fontSize:14, color:"#18181b" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes upSpin{to{transform:rotate(360deg)}}
        @keyframes upFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes upPop{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
        @keyframes upPulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes upCheckIn{from{stroke-dashoffset:60}to{stroke-dashoffset:0}}
        .up-card{background:#fff;border:1px solid #ebebeb;border-radius:16px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,.05);}
        .up-input{width:100%;padding:10px 13px;border:1.5px solid #e4e4e7;border-radius:9px;font-size:13px;color:#18181b;font-family:inherit;outline:none;background:#fafafa;transition:border-color .15s,box-shadow .15s;}
        .up-input:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.08);background:#fff;}
        .up-input::placeholder{color:#c4c4c4;}
        .up-label{display:block;font-size:11.5px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;}
        .up-btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 24px;background:#7c3aed;color:#fff;border:none;border-radius:11px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:background .15s;width:100%;}
        .up-btn-primary:hover{background:#6d28d9;}
        .up-btn-primary:disabled{background:#d4d4d8;cursor:not-allowed;}
        .up-btn-outline{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:#fff;color:#52525b;border:1.5px solid #e4e4e7;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;}
        .up-btn-outline:hover{border-color:#d4d4d8;background:#fafafa;}
        .up-section-title{font-size:13px;font-weight:700;color:#3f3f46;margin-bottom:14px;}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ebebeb", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button className="up-btn-outline" style={{ padding:"8px 14px" }} onClick={step===0?onBack:()=>setStep(s=>Math.max(0,s-1))}>
            <ArrowLeft size={14}/> {step===0?t("up_back_to_settings"):t("up_previous")}
          </button>
          <div>
            <div style={{ fontSize:15, fontWeight:900, color:"#18181b" }}>{t("up_title")}</div>
            <div style={{ fontSize:11.5, color:"#a1a1aa" }}>{t("up_subtitle")}</div>
          </div>
        </div>

        {/* Step indicator */}
        {step > 0 && step < 4 && (
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, background: step>s?"#7c3aed":step===s?"#7c3aed":"#f4f4f5", color: step>=s?"#fff":"#a1a1aa", transition:"all .2s" }}>
                  {step>s?<Check size={13}/>:s}
                </div>
                {s<3 && <div style={{ width:32, height:2, background: step>s?"#7c3aed":"#e4e4e7", borderRadius:2, transition:"background .2s" }}/>}
              </div>
            ))}
            <div style={{ marginLeft:8, fontSize:12, fontWeight:600, color:"#7c3aed" }}>
              {step===1?t("up_step_billing"):step===2?t("up_step_payment"):t("up_step_processing")}
            </div>
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#a1a1aa" }}>
          <Lock size={12} color="#16a34a"/> {t("up_ssl_secured")}
        </div>
      </div>

      {/* ── STEP 0: PLAN SELECTION ── */}
      {step===0 && (
        <div style={{ maxWidth:1060, margin:"0 auto", padding:"28px 24px" }}>
          {/* Billing toggle */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:28, width:"fit-content", margin:"0 auto 28px", background:"#f1f1f4", borderRadius:11, padding:4 }}>
            {["monthly","yearly"].map(b=>(
              <button key={b} onClick={()=>setBilling(b)} style={{ padding:"8px 24px", borderRadius:8, border:"none", fontFamily:"inherit", fontSize:13, fontWeight:700, cursor:"pointer", background:billing===b?"#fff":"transparent", color:billing===b?"#7c3aed":"#71717a", boxShadow:billing===b?"0 1px 6px rgba(0,0,0,.1)":"none", transition:"all .15s" }}>
                {b==="monthly"?t("up_monthly"):t("up_yearly")}{b==="yearly"&&<span style={{ marginLeft:6, background:"#dcfce7", color:"#16a34a", fontSize:10, fontWeight:800, padding:"2px 6px", borderRadius:20 }}>-20%</span>}
              </button>
            ))}
          </div>

          {/* Plans */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:32 }}>
            {PLANS.map(p=>{
              const isSel = selectedPlan===p.id;
              const pr = p.price[billing];
              return (
                <div key={p.id} onClick={()=>!p.current&&setPlan(p.id)}
                  style={{ background:isSel?p.bg:"#fff", border:`2px solid ${isSel?p.color:"#e4e4e7"}`, borderRadius:18, padding:"22px 20px", cursor:p.current?"default":"pointer", transition:"all .18s", boxShadow:isSel?`0 4px 20px ${p.color}20`:"0 1px 4px rgba(0,0,0,.05)", position:"relative", animation:"upFadeUp .3s ease" }}>
                  {p.popular&&<div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:p.color, color:"#fff", fontSize:10, fontWeight:800, padding:"3px 14px", borderRadius:99, whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:".06em" }}>{t("up_most_popular")}</div>}
                  {p.current&&<div style={{ position:"absolute", top:12, right:12, background:"#f1f5f9", color:"#64748b", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>{t("up_current")}</div>}

                  <div style={{ width:40, height:40, borderRadius:11, background:`${p.color}18`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                    {p.id==="starter"?<Zap size={18} style={{color:p.color}}/>:p.id==="pro"?<Star size={18} style={{color:p.color}}/>:<Crown size={18} style={{color:p.color}}/>}
                  </div>

                  <div style={{ fontSize:16, fontWeight:800, color:"#18181b", marginBottom:3 }}>{p.name}</div>
                  <div style={{ fontSize:26, fontWeight:900, color:p.color, marginBottom:2 }}>
                    {pr===0?t("free_starter_short").split(" ")[0]||"Free":fmt(pr)}{pr>0&&<span style={{ fontSize:12, fontWeight:600, color:"#a1a1aa" }}>/mo</span>}
                  </div>
                  {billing==="yearly"&&pr>0&&(
                    <div style={{ fontSize:11, color:"#16a34a", fontWeight:700, marginBottom:12 }}>{t("up_save_yr", { amount: fmt((p.price.monthly-p.price.yearly)*12) })}</div>
                  )}

                  <div style={{ borderTop:"1px solid #f4f4f5", margin:"14px 0", paddingTop:14, display:"flex", flexDirection:"column", gap:8 }}>
                    {p.features.map(f=>(
                      <div key={f} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, color:"#3f3f46" }}>
                        <div style={{ width:16, height:16, borderRadius:"50%", background:`${p.color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <Check size={9} style={{color:p.color}}/>
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>

                  <button onClick={e=>{e.stopPropagation();if(!p.current){setPlan(p.id);setStep(1);}}}
                    style={{ width:"100%", padding:"10px 0", border:"none", borderRadius:10, fontFamily:"inherit", fontWeight:800, fontSize:13, cursor:p.current?"default":"pointer", background:p.current?"#f1f5f9":isSel?p.color:"#f4f4f5", color:p.current?"#94a3b8":isSel?"#fff":p.color, marginTop:8, transition:"all .15s" }}
                    disabled={p.current}>
                    {p.current?t("up_current_plan"):t("up_choose_plan", { name: p.name })}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="up-card">
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f4f4f5", fontSize:13, fontWeight:700, color:"#3f3f46" }}>{t("up_feature_comparison")}</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    <th style={{ padding:"10px 20px", textAlign:"left", fontSize:11.5, fontWeight:700, color:"#a1a1aa", textTransform:"uppercase", letterSpacing:".05em", borderBottom:"1px solid #f4f4f5" }}>{t("up_feature_col")}</th>
                    {PLANS.map(p=>(
                      <th key={p.id} style={{ padding:"10px 16px", fontSize:12, fontWeight:800, color:p.color, borderBottom:"1px solid #f4f4f5", textAlign:"center" }}>{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map(({label,starter,pro,elite},i)=>(
                    <tr key={label} style={{ background:i%2===0?"#fafafa":"#fff" }}>
                      <td style={{ padding:"10px 20px", fontSize:13, color:"#52525b", fontWeight:500 }}>{label}</td>
                      {[starter,pro,elite].map((v,j)=>(
                        <td key={j} style={{ padding:"10px 16px", textAlign:"center", fontSize:12.5 }}>
                          {v===true?<Check size={14} style={{color:"#16a34a",margin:"0 auto"}}/>:
                           v===false?<X size={12} style={{color:"#d4d4d8",margin:"0 auto"}}/>:
                           <span style={{ fontWeight:600, color:"#3f3f46" }}>{v}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: BILLING DETAILS ── */}
      {step===1 && (
        <div style={{ maxWidth:680, margin:"32px auto", padding:"0 24px", animation:"upFadeUp .25s ease" }}>
          {/* Order summary */}
          <div style={{ background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", border:"1.5px solid #ddd6fe", borderRadius:14, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {plan.id==="pro"?<Star size={18} color="#fff"/>:<Crown size={18} color="#fff"/>}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:"#4c1d95" }}>{plan.name} · {billing==="monthly"?t("up_monthly"):t("up_yearly")}</div>
                <div style={{ fontSize:11.5, color:"#7c3aed" }}>{billing==="yearly"?t("up_save20_yearly"):t("up_switch_yearly")}</div>
              </div>
            </div>
            <div style={{ fontSize:22, fontWeight:900, color:"#4c1d95" }}>{fmt(price)}<span style={{ fontSize:12, fontWeight:600, color:"#a78bfa" }}>/mo</span></div>
          </div>

          <div className="up-card">
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f4f4f5", fontSize:13, fontWeight:700, color:"#3f3f46", display:"flex", alignItems:"center", gap:8 }}>
              <User size={14} style={{color:"#7c3aed"}}/> {t("up_billing_details")}
            </div>
            <div style={{ padding:"20px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { key:"fullName",     label:t("up_full_name"),      icon:User,     ph:t("up_full_name_ph") },
                  { key:"email",        label:t("up_email_address"),  icon:Mail,     ph:t("up_email_ph") },
                  { key:"phone",        label:t("up_phone_number"),   icon:Phone,    ph:t("up_phone_ph") },
                  { key:"businessName", label:t("up_business_name"),  icon:Building2,ph:t("up_business_name_ph") },
                ].map(({ key, label, icon:Icon, ph })=>(
                  <div key={key}>
                    <label className="up-label">{label}</label>
                    <div style={{ position:"relative" }}>
                      <Icon size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#a1a1aa" }}/>
                      <input className="up-input" style={{ paddingLeft:32 }} placeholder={ph}
                        value={details[key]} onChange={e=>setDetails(d=>({...d,[key]:e.target.value}))}/>
                    </div>
                  </div>
                ))}
                <div style={{ gridColumn:"1/-1" }}>
                  <label className="up-label">{t("up_address")}</label>
                  <div style={{ position:"relative" }}>
                    <MapPin size={13} style={{ position:"absolute", left:11, top:12, color:"#a1a1aa" }}/>
                    <input className="up-input" style={{ paddingLeft:32 }} placeholder={t("up_address_ph")}
                      value={details.address} onChange={e=>setDetails(d=>({...d,address:e.target.value}))}/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary card */}
          <div className="up-card" style={{ marginTop:16 }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f4f4f5", fontSize:13, fontWeight:700, color:"#3f3f46" }}>{t("up_order_summary")}</div>
            <div style={{ padding:"14px 20px" }}>
              {[
                { label:`${plan.name} · ${billing==="monthly"?t("up_monthly"):t("up_yearly")}`, val:fmt(price) },
                { label:t("up_tax_gst"),                  val:fmt(Math.round(price*0.18)) },
                { label:t("up_discount"),                       val:"—" },
              ].map(({ label, val })=>(
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:13, color:"#52525b", borderBottom:"1px solid #f9f9f9" }}>
                  <span>{label}</span><span style={{ fontWeight:600 }}>{val}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 2px", fontSize:15, fontWeight:900, color:"#18181b" }}>
                <span>{t("up_total")}</span>
                <span style={{ color:"#7c3aed" }}>{fmt(price+Math.round(price*0.18))}</span>
              </div>
              <div style={{ fontSize:11, color:"#a1a1aa", marginTop:2 }}>{currencyCode} · {billing==="monthly"?t("up_billed_monthly"):t("up_billed_yearly")}</div>
            </div>
          </div>

          <button className="up-btn-primary" style={{ marginTop:20 }}
            onClick={()=>setStep(2)}>
            {t("up_continue_payment")} <ChevronRight size={15}/>
          </button>
          <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:"#a1a1aa", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <Lock size={12} color="#16a34a"/> {t("up_secure_ssl")}
          </div>
        </div>
      )}

      {/* ── STEP 2: PAYMENT METHOD ── */}
      {step===2 && (
        <div style={{ maxWidth:680, margin:"32px auto", padding:"0 24px", animation:"upFadeUp .25s ease" }}>
          {/* Summary strip */}
          <div style={{ background:"#f8f8fb", border:"1px solid #ebebeb", borderRadius:12, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ fontSize:13, color:"#52525b" }}>
              <span style={{ fontWeight:700, color:"#18181b" }}>{plan.name}</span> · {details.fullName || "—"}
            </div>
            <div style={{ fontSize:15, fontWeight:900, color:"#7c3aed" }}>{fmt(price+Math.round(price*0.18))}</div>
          </div>

          <div className="up-card">
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f4f4f5", fontSize:13, fontWeight:700, color:"#3f3f46", display:"flex", alignItems:"center", gap:8 }}>
              <CreditCard size={14} style={{color:"#7c3aed"}}/> {t("up_select_payment_method")}
            </div>
            <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
              {PAYMENT_METHODS.map(({ id, label, Icon, sub })=>(
                <div key={id} onClick={()=>setPayMethod(id)}
                  style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12, border:`1.5px solid ${payMethod===id?"#7c3aed":"#e4e4e7"}`, background:payMethod===id?"#faf5ff":"#fff", cursor:"pointer", transition:"all .15s" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${payMethod===id?"#7c3aed":"#d4d4d8"}`, background:payMethod===id?"#7c3aed":"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}>
                    {payMethod===id&&<div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }}/>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, fontWeight:700, color:"#18181b", marginBottom:3 }}>{label}</div>
                    <div style={{ fontSize:11.5, color:"#a1a1aa" }}>{sub}</div>
                  </div>
                  <Icon/>
                </div>
              ))}
            </div>

            {/* UPI input */}
            {payMethod==="upi" && (
              <div style={{ padding:"0 16px 16px", animation:"upFadeUp .2s ease" }}>
                <label className="up-label">{t("up_upi_id")}</label>
                <input className="up-input" placeholder={t("up_upi_ph")} value={upiId} onChange={e=>setUpiId(e.target.value)}/>
                <div style={{ fontSize:11.5, color:"#a1a1aa", marginTop:5 }}>
                  {t("up_upi_supported")}
                </div>
              </div>
            )}

            {/* Razorpay note */}
            {payMethod==="razorpay" && (
              <div style={{ padding:"0 16px 16px", animation:"upFadeUp .2s ease" }}>
                <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:9, padding:"11px 14px", fontSize:12.5, color:"#1e40af" }}>
                  {t("up_razorpay_note")}
                </div>
              </div>
            )}

            {/* Stripe note */}
            {payMethod==="stripe" && (
              <div style={{ padding:"0 16px 16px", animation:"upFadeUp .2s ease" }}>
                <div style={{ background:"#faf5ff", border:"1px solid #ddd6fe", borderRadius:9, padding:"11px 14px", fontSize:12.5, color:"#5b21b6" }}>
                  {t("up_stripe_note")}
                </div>
              </div>
            )}

            {/* Credit/Debit card form */}
            {payMethod==="card" && (
              <div style={{ padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:12, animation:"upFadeUp .2s ease" }}>
                <div>
                  <label className="up-label">{t("up_card_number")}</label>
                  <div style={{ position:"relative" }}>
                    <CreditCard size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#a1a1aa" }}/>
                    <input className="up-input" style={{ paddingLeft:32, letterSpacing:2 }}
                      placeholder={t("up_card_number_ph")} maxLength={19}
                      value={cardData.number}
                      onChange={e=>{
                        const v = e.target.value.replace(/\D/g,"").slice(0,16);
                        setCardData(d=>({...d,number:v.replace(/(.{4})/g,"$1 ").trim()}));
                      }}/>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label className="up-label">{t("up_expiry_date")}</label>
                    <input className="up-input" placeholder="MM / YY" maxLength={7}
                      value={cardData.expiry}
                      onChange={e=>{
                        const v = e.target.value.replace(/\D/g,"").slice(0,4);
                        setCardData(d=>({...d,expiry:v.length>2?v.slice(0,2)+" / "+v.slice(2):v}));
                      }}/>
                  </div>
                  <div>
                    <label className="up-label">{t("up_cvv")}</label>
                    <div style={{ position:"relative" }}>
                      <input className="up-input" placeholder="•••" maxLength={4} type="password"
                        value={cardData.cvv} onChange={e=>setCardData(d=>({...d,cvv:e.target.value.replace(/\D/g,"").slice(0,4)}))}/>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="up-label">{t("up_name_on_card")}</label>
                  <input className="up-input" placeholder={t("up_name_on_card_ph")}
                    value={cardData.name} onChange={e=>setCardData(d=>({...d,name:e.target.value}))}/>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:2 }}>
                  <VisaIcon/><MastercardIcon/><AmexIcon/>
                  <span style={{ fontSize:11, color:"#a1a1aa", marginLeft:4 }}>{t("up_all_cards")}</span>
                </div>
              </div>
            )}
          </div>

          <button className="up-btn-primary" style={{ marginTop:20 }} onClick={handlePay}>
            <Lock size={14}/> {t("up_pay_securely", { amount: fmt(price+Math.round(price*0.18)) })}
          </button>
          <div style={{ textAlign:"center", marginTop:12, fontSize:11.5, color:"#a1a1aa", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Shield size={12} color="#16a34a"/> {t("up_pci_note")}
          </div>
        </div>
      )}

      {/* ── STEP 3: PROCESSING ── */}
      {step===3 && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"70vh", gap:24, animation:"upFadeUp .3s ease" }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"#faf5ff", border:"3px solid #ddd6fe", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Loader2 size={36} style={{ color:"#7c3aed", animation:"upSpin .8s linear infinite" }}/>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:800, color:"#18181b", marginBottom:6 }}>{t("up_processing_title")}</div>
            <div style={{ fontSize:13.5, color:"#a1a1aa", maxWidth:300 }}>{t("up_processing_desc")}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, width:280 }}>
            {[t("up_verifying"), t("up_connecting"), t("up_confirming")].map((s,i)=>(
              <div key={s} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:"#52525b" }}>
                <div style={{ width:18, height:18, borderRadius:"50%", background:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, animation:`upPulse ${.5+i*.3}s ease infinite` }}>
                  <Check size={10} color="#fff"/>
                </div>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 4: SUCCESS ── */}
      {step===4 && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"70vh", gap:20, animation:"upFadeUp .3s ease", padding:24 }}>
          <div style={{ width:90, height:90, borderRadius:"50%", background:"#f0fdf4", border:"3px solid #bbf7d0", display:"flex", alignItems:"center", justifyContent:"center", animation:"upPop .4s cubic-bezier(.34,1.56,.64,1)" }}>
            <CheckCircle2 size={46} color="#16a34a" strokeWidth={2}/>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:24, fontWeight:900, color:"#18181b", marginBottom:8 }}>{t("up_payment_successful")}</div>
            <div style={{ fontSize:14, color:"#6b7280", maxWidth:360, lineHeight:1.6 }}>
              {t("up_welcome_to")} <strong>{plan.name}</strong>! {t("up_confirmation_sent")} <strong>{details.email}</strong>.
            </div>
          </div>

          <div className="up-card" style={{ width:"100%", maxWidth:420 }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f4f4f5", fontSize:12.5, fontWeight:700, color:"#3f3f46" }}>{t("up_transaction_details")}</div>
            <div style={{ padding:"14px 20px" }}>
              {[
                { label:t("up_txn_plan"),          val:`${plan.name} (${billing==="monthly"?t("up_monthly"):t("up_yearly")})` },
                { label:t("up_txn_amount"),   val:fmt(price+Math.round(price*0.18)) },
                { label:t("up_txn_id"),    val:`TXN${Date.now().toString().slice(-8)}` },
                { label:t("up_txn_billing"),       val:details.email },
              ].map(({ label, val })=>(
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", fontSize:13, borderBottom:"1px solid #f9f9f9" }}>
                  <span style={{ color:"#a1a1aa" }}>{label}</span>
                  <span style={{ fontWeight:600, color:"#18181b" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="up-btn-primary" style={{ maxWidth:320 }} onClick={onBack}>
            <Sparkles size={14}/> {t("up_go_to_settings")}
          </button>
        </div>
      )}
    </div>
  );
}
