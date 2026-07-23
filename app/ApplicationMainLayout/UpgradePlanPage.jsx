"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Check, X, Sparkles, Star, Crown, Zap,
  ChevronRight, ChevronLeft, User, Phone, Mail,
  MapPin, CreditCard, Lock, CheckCircle2, Loader2,
  Building2, Shield,
} from "lucide-react";

function getUser() {
  try { const s = localStorage.getItem("ttl_user"); return s ? JSON.parse(s) : null; } catch { return null; }
}

const PLANS = [
  {
    id:      "starter",
    name:    "Starter",
    price:   { monthly:0,    yearly:0 },
    color:   "#64748b",
    bg:      "#f8fafc",
    border:  "#e2e8f0",
    features:["1 Branch","50 orders/day","Basic analytics","QR ordering","5 menu categories","Email support"],
    current: true,
  },
  {
    id:      "pro",
    name:    "Pro",
    price:   { monthly:999,  yearly:799 },
    color:   "#7c3aed",
    bg:      "#faf5ff",
    border:  "#ddd6fe",
    popular: true,
    features:["3 Branches","Unlimited orders","Advanced analytics","Custom QR branding","Priority support","Payment gateway","Customer reviews","Unlimited categories"],
  },
  {
    id:      "elite",
    name:    "Elite",
    price:   { monthly:2499, yearly:1999 },
    color:   "#d97706",
    bg:      "#fffbeb",
    border:  "#fde68a",
    features:["Unlimited branches","All Pro features","White-label app","Dedicated manager","API access","Custom integrations","SMS notifications","Advanced reporting"],
  },
];

const COMPARE = [
  { label:"Branches",           starter:"1",      pro:"3",          elite:"Unlimited" },
  { label:"Orders/day",         starter:"50",     pro:"Unlimited",  elite:"Unlimited" },
  { label:"Menu categories",    starter:"5",      pro:"Unlimited",  elite:"Unlimited" },
  { label:"Analytics",          starter:"Basic",  pro:"Advanced",   elite:"Advanced" },
  { label:"QR custom branding", starter:false,    pro:true,         elite:true },
  { label:"Payment gateway",    starter:false,    pro:true,         elite:true },
  { label:"API access",         starter:false,    pro:false,        elite:true },
  { label:"White-label",        starter:false,    pro:false,        elite:true },
  { label:"Support",            starter:"Email",  pro:"Priority",   elite:"Dedicated" },
];

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

const PAYMENT_METHODS = [
  { id:"upi",      label:"UPI",             Icon:UpiIcon,       sub:"Pay via any UPI app" },
  { id:"razorpay", label:"Razorpay",        Icon:RazorpayIcon,  sub:"Cards, netbanking & wallets" },
  { id:"stripe",   label:"Stripe",          Icon:StripeIcon,    sub:"International cards" },
  { id:"card",     label:"Credit / Debit Card", Icon:()=><div style={{display:"flex",gap:4}}><VisaIcon/><MastercardIcon/><AmexIcon/></div>, sub:"Visa, Mastercard, Amex" },
];

// ── STEPS ──────────────────────────────────────────────────────
// 0 = Plan list  1 = Billing details  2 = Payment method  3 = Processing  4 = Success

export default function UpgradePlanPage({ onBack, currencySymbol = "₹", currencyCode = "INR" }) {
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
      fetch(`http://localhost:6163/api/business-information/${u.adminId}`, {
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

  const STEPS_LABEL = ["Plan","Details","Payment","Processing","Done"];

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
            <ArrowLeft size={14}/> {step===0?"Back to Settings":"Previous"}
          </button>
          <div>
            <div style={{ fontSize:15, fontWeight:900, color:"#18181b" }}>Upgrade TableTop Leo</div>
            <div style={{ fontSize:11.5, color:"#a1a1aa" }}>Professional billing · Secure checkout</div>
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
              {step===1?"Billing Details":step===2?"Payment":"Processing"}
            </div>
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#a1a1aa" }}>
          <Lock size={12} color="#16a34a"/> SSL Secured
        </div>
      </div>

      {/* ── STEP 0: PLAN SELECTION ── */}
      {step===0 && (
        <div style={{ maxWidth:1060, margin:"0 auto", padding:"28px 24px" }}>
          {/* Billing toggle */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:28, width:"fit-content", margin:"0 auto 28px", background:"#f1f1f4", borderRadius:11, padding:4 }}>
            {["monthly","yearly"].map(b=>(
              <button key={b} onClick={()=>setBilling(b)} style={{ padding:"8px 24px", borderRadius:8, border:"none", fontFamily:"inherit", fontSize:13, fontWeight:700, cursor:"pointer", background:billing===b?"#fff":"transparent", color:billing===b?"#7c3aed":"#71717a", boxShadow:billing===b?"0 1px 6px rgba(0,0,0,.1)":"none", transition:"all .15s" }}>
                {b==="monthly"?"Monthly":"Yearly"}{b==="yearly"&&<span style={{ marginLeft:6, background:"#dcfce7", color:"#16a34a", fontSize:10, fontWeight:800, padding:"2px 6px", borderRadius:20 }}>-20%</span>}
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
                  {p.popular&&<div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:p.color, color:"#fff", fontSize:10, fontWeight:800, padding:"3px 14px", borderRadius:99, whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:".06em" }}>Most Popular</div>}
                  {p.current&&<div style={{ position:"absolute", top:12, right:12, background:"#f1f5f9", color:"#64748b", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>Current</div>}

                  <div style={{ width:40, height:40, borderRadius:11, background:`${p.color}18`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                    {p.id==="starter"?<Zap size={18} style={{color:p.color}}/>:p.id==="pro"?<Star size={18} style={{color:p.color}}/>:<Crown size={18} style={{color:p.color}}/>}
                  </div>

                  <div style={{ fontSize:16, fontWeight:800, color:"#18181b", marginBottom:3 }}>{p.name}</div>
                  <div style={{ fontSize:26, fontWeight:900, color:p.color, marginBottom:2 }}>
                    {pr===0?"Free":fmt(pr)}{pr>0&&<span style={{ fontSize:12, fontWeight:600, color:"#a1a1aa" }}>/mo</span>}
                  </div>
                  {billing==="yearly"&&pr>0&&(
                    <div style={{ fontSize:11, color:"#16a34a", fontWeight:700, marginBottom:12 }}>Save {fmt((p.price.monthly-p.price.yearly)*12)}/yr</div>
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
                    {p.current?"Current Plan":`Choose ${p.name} →`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="up-card">
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f4f4f5", fontSize:13, fontWeight:700, color:"#3f3f46" }}>Feature Comparison</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    <th style={{ padding:"10px 20px", textAlign:"left", fontSize:11.5, fontWeight:700, color:"#a1a1aa", textTransform:"uppercase", letterSpacing:".05em", borderBottom:"1px solid #f4f4f5" }}>Feature</th>
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
                <div style={{ fontSize:13, fontWeight:800, color:"#4c1d95" }}>{plan.name} Plan · {billing==="monthly"?"Monthly":"Yearly"}</div>
                <div style={{ fontSize:11.5, color:"#7c3aed" }}>{billing==="yearly"?"Save 20% vs monthly":"Switch to yearly to save 20%"}</div>
              </div>
            </div>
            <div style={{ fontSize:22, fontWeight:900, color:"#4c1d95" }}>{fmt(price)}<span style={{ fontSize:12, fontWeight:600, color:"#a78bfa" }}>/mo</span></div>
          </div>

          <div className="up-card">
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f4f4f5", fontSize:13, fontWeight:700, color:"#3f3f46", display:"flex", alignItems:"center", gap:8 }}>
              <User size={14} style={{color:"#7c3aed"}}/> Billing Details
            </div>
            <div style={{ padding:"20px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { key:"fullName",     label:"Full Name",      icon:User,     ph:"Your full name" },
                  { key:"email",        label:"Email Address",  icon:Mail,     ph:"billing@email.com" },
                  { key:"phone",        label:"Phone Number",   icon:Phone,    ph:"+91 XXXXX XXXXX" },
                  { key:"businessName", label:"Business Name",  icon:Building2,ph:"Your restaurant name" },
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
                  <label className="up-label">Address</label>
                  <div style={{ position:"relative" }}>
                    <MapPin size={13} style={{ position:"absolute", left:11, top:12, color:"#a1a1aa" }}/>
                    <input className="up-input" style={{ paddingLeft:32 }} placeholder="Street, City, State"
                      value={details.address} onChange={e=>setDetails(d=>({...d,address:e.target.value}))}/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary card */}
          <div className="up-card" style={{ marginTop:16 }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f4f4f5", fontSize:13, fontWeight:700, color:"#3f3f46" }}>Order Summary</div>
            <div style={{ padding:"14px 20px" }}>
              {[
                { label:`${plan.name} Plan (${billing})`, val:fmt(price) },
                { label:"Tax (18% GST)",                  val:fmt(Math.round(price*0.18)) },
                { label:"Discount",                       val:"—" },
              ].map(({ label, val })=>(
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:13, color:"#52525b", borderBottom:"1px solid #f9f9f9" }}>
                  <span>{label}</span><span style={{ fontWeight:600 }}>{val}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 2px", fontSize:15, fontWeight:900, color:"#18181b" }}>
                <span>Total</span>
                <span style={{ color:"#7c3aed" }}>{fmt(price+Math.round(price*0.18))}</span>
              </div>
              <div style={{ fontSize:11, color:"#a1a1aa", marginTop:2 }}>{currencyCode} · {billing==="monthly"?"Billed monthly":"Billed yearly"}</div>
            </div>
          </div>

          <button className="up-btn-primary" style={{ marginTop:20 }}
            onClick={()=>setStep(2)}>
            Continue to Payment <ChevronRight size={15}/>
          </button>
          <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:"#a1a1aa", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <Lock size={12} color="#16a34a"/> Secure 256-bit SSL encryption
          </div>
        </div>
      )}

      {/* ── STEP 2: PAYMENT METHOD ── */}
      {step===2 && (
        <div style={{ maxWidth:680, margin:"32px auto", padding:"0 24px", animation:"upFadeUp .25s ease" }}>
          {/* Summary strip */}
          <div style={{ background:"#f8f8fb", border:"1px solid #ebebeb", borderRadius:12, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ fontSize:13, color:"#52525b" }}>
              <span style={{ fontWeight:700, color:"#18181b" }}>{plan.name} Plan</span> · {details.fullName || "—"}
            </div>
            <div style={{ fontSize:15, fontWeight:900, color:"#7c3aed" }}>{fmt(price+Math.round(price*0.18))}</div>
          </div>

          <div className="up-card">
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f4f4f5", fontSize:13, fontWeight:700, color:"#3f3f46", display:"flex", alignItems:"center", gap:8 }}>
              <CreditCard size={14} style={{color:"#7c3aed"}}/> Select Payment Method
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
                <label className="up-label">UPI ID</label>
                <input className="up-input" placeholder="yourname@upi" value={upiId} onChange={e=>setUpiId(e.target.value)}/>
                <div style={{ fontSize:11.5, color:"#a1a1aa", marginTop:5 }}>
                  Supported: PhonePe, GPay, Paytm, BHIM, Amazon Pay
                </div>
              </div>
            )}

            {/* Razorpay note */}
            {payMethod==="razorpay" && (
              <div style={{ padding:"0 16px 16px", animation:"upFadeUp .2s ease" }}>
                <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:9, padding:"11px 14px", fontSize:12.5, color:"#1e40af" }}>
                  You'll be redirected to Razorpay's secure checkout to complete payment.
                </div>
              </div>
            )}

            {/* Stripe note */}
            {payMethod==="stripe" && (
              <div style={{ padding:"0 16px 16px", animation:"upFadeUp .2s ease" }}>
                <div style={{ background:"#faf5ff", border:"1px solid #ddd6fe", borderRadius:9, padding:"11px 14px", fontSize:12.5, color:"#5b21b6" }}>
                  You'll be redirected to Stripe's secure checkout. Supports international cards.
                </div>
              </div>
            )}

            {/* Credit/Debit card form */}
            {payMethod==="card" && (
              <div style={{ padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:12, animation:"upFadeUp .2s ease" }}>
                <div>
                  <label className="up-label">Card Number</label>
                  <div style={{ position:"relative" }}>
                    <CreditCard size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#a1a1aa" }}/>
                    <input className="up-input" style={{ paddingLeft:32, letterSpacing:2 }}
                      placeholder="1234  5678  9012  3456" maxLength={19}
                      value={cardData.number}
                      onChange={e=>{
                        const v = e.target.value.replace(/\D/g,"").slice(0,16);
                        setCardData(d=>({...d,number:v.replace(/(.{4})/g,"$1 ").trim()}));
                      }}/>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label className="up-label">Expiry Date</label>
                    <input className="up-input" placeholder="MM / YY" maxLength={7}
                      value={cardData.expiry}
                      onChange={e=>{
                        const v = e.target.value.replace(/\D/g,"").slice(0,4);
                        setCardData(d=>({...d,expiry:v.length>2?v.slice(0,2)+" / "+v.slice(2):v}));
                      }}/>
                  </div>
                  <div>
                    <label className="up-label">CVV</label>
                    <div style={{ position:"relative" }}>
                      <input className="up-input" placeholder="•••" maxLength={4} type="password"
                        value={cardData.cvv} onChange={e=>setCardData(d=>({...d,cvv:e.target.value.replace(/\D/g,"").slice(0,4)}))}/>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="up-label">Name on Card</label>
                  <input className="up-input" placeholder="As printed on your card"
                    value={cardData.name} onChange={e=>setCardData(d=>({...d,name:e.target.value}))}/>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:2 }}>
                  <VisaIcon/><MastercardIcon/><AmexIcon/>
                  <span style={{ fontSize:11, color:"#a1a1aa", marginLeft:4 }}>All major cards accepted</span>
                </div>
              </div>
            )}
          </div>

          <button className="up-btn-primary" style={{ marginTop:20 }} onClick={handlePay}>
            <Lock size={14}/> Pay {fmt(price+Math.round(price*0.18))} Securely
          </button>
          <div style={{ textAlign:"center", marginTop:12, fontSize:11.5, color:"#a1a1aa", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Shield size={12} color="#16a34a"/> PCI-DSS Compliant · Data encrypted end-to-end
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
            <div style={{ fontSize:20, fontWeight:800, color:"#18181b", marginBottom:6 }}>Processing Payment...</div>
            <div style={{ fontSize:13.5, color:"#a1a1aa", maxWidth:300 }}>Please don't close this window. This usually takes a few seconds.</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, width:280 }}>
            {["Verifying payment details","Connecting to gateway","Confirming subscription"].map((s,i)=>(
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
            <div style={{ fontSize:24, fontWeight:900, color:"#18181b", marginBottom:8 }}>Payment Successful! 🎉</div>
            <div style={{ fontSize:14, color:"#6b7280", maxWidth:360, lineHeight:1.6 }}>
              Welcome to <strong>{plan.name}</strong>! Your subscription is now active. A confirmation has been sent to <strong>{details.email}</strong>.
            </div>
          </div>

          <div className="up-card" style={{ width:"100%", maxWidth:420 }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f4f4f5", fontSize:12.5, fontWeight:700, color:"#3f3f46" }}>Transaction Details</div>
            <div style={{ padding:"14px 20px" }}>
              {[
                { label:"Plan",          val:`${plan.name} (${billing})` },
                { label:"Amount Paid",   val:fmt(price+Math.round(price*0.18)) },
                { label:"Payment ID",    val:`TXN${Date.now().toString().slice(-8)}` },
                { label:"Billing",       val:details.email },
              ].map(({ label, val })=>(
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", fontSize:13, borderBottom:"1px solid #f9f9f9" }}>
                  <span style={{ color:"#a1a1aa" }}>{label}</span>
                  <span style={{ fontWeight:600, color:"#18181b" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="up-btn-primary" style={{ maxWidth:320 }} onClick={onBack}>
            <Sparkles size={14}/> Go to Settings
          </button>
        </div>
      )}
    </div>
  );
}