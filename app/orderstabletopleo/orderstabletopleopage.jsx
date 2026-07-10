"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Calendar, SlidersHorizontal, ChevronDown,
  ChevronLeft, ChevronRight, MoreHorizontal, X,
  ShoppingBag, ChefHat, Truck, CheckCircle2, XCircle,
  Printer, Phone, MessageSquare, CreditCard, Utensils,
  Package, Filter, RefreshCw,
  Banknote, Smartphone, Globe, Store, ArrowRight,
} from "lucide-react";
import "../orderstabletopleo/designorderspage.css";
import adminOrderService from "../services/adminOrderService";

const AVATAR_COLORS = [
  "#635bff","#0ea5e9","#16a34a","#f59e0b","#ef4444",
  "#8b5cf6","#06b6d4","#84cc16","#f97316","#ec4899",
];
const ITEMS_PER_PAGE = 8;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const STATUS_CFG = {
  PLACED:    { label:"New",              cls:"mor-s-new",       tabKey:"new"       },
  ACCEPTED:  { label:"Accepted",         cls:"mor-s-new",       tabKey:"new"       },
  PREPARING: { label:"Preparing",        cls:"mor-s-prep",      tabKey:"preparing" },
  READY:     { label:"Out for Delivery", cls:"mor-s-delivery",  tabKey:"delivery"  },
  COMPLETED: { label:"Completed",        cls:"mor-s-completed", tabKey:"completed" },
  CANCELLED: { label:"Cancelled",        cls:"mor-s-cancelled", tabKey:"cancelled" },
};

const STATUS_OPTIONS = [
  { key:"ACCEPTED",  label:"Accepted",         dot:"#2563eb" },
  { key:"PREPARING", label:"Preparing",        dot:"#f59e0b" },
  { key:"READY",     label:"Out for Delivery", dot:"#f97316" },
  { key:"COMPLETED", label:"Completed",        dot:"#16a34a" },
  { key:"CANCELLED", label:"Cancelled",        dot:"#dc2626" },
];

const PAYMENT_ICON = {
  upi:            { icon: Smartphone, label:"UPI",            color:"#7c3aed" },
  razorpay:       { icon: CreditCard, label:"Razorpay",       color:"#3395ff" },
  stripe:         { icon: Globe,      label:"Stripe",         color:"#635bff" },
  paypal:         { icon: Globe,      label:"PayPal",         color:"#003087" },
  pay_at_counter: { icon: Store,      label:"Pay at Counter", color:"#b45309" },
  cash:           { icon: Banknote,   label:"Cash",           color:"#16a34a" },
};
const TIMELINE_STEPS = ["PLACED","ACCEPTED","PREPARING","READY","COMPLETED"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y,m,d] = dateStr.split("-");
  return `${MONTHS[parseInt(m)-1].slice(0,3)} ${parseInt(d)}, ${y}`;
}
function formatDateTime(isoStr) {
  if (!isoStr) return { date:"—", time:"—", ago:"" };
  const dt   = new Date(isoStr);
  const date = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
  const time = dt.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
  const diff = Math.floor((Date.now() - dt.getTime()) / 1000);
  const ago  = diff < 60 ? "Just now" : diff < 3600 ? `${Math.floor(diff/60)} min ago` : diff < 86400 ? `${Math.floor(diff/3600)} hr ago` : `${Math.floor(diff/86400)} days ago`;
  return { date, time, ago };
}
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? (parts[0][0]+parts[parts.length-1][0]).toUpperCase() : name.slice(0,2).toUpperCase();
}

function CalendarPicker({ value, onChange, onClose }) {
  const today = new Date();
  const initDate = value ? new Date(value) : today;
  const [viewYear,  setViewYear]  = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const firstDay    = new Date(viewYear,viewMonth,1).getDay();
  const daysInMonth = new Date(viewYear,viewMonth+1,0).getDate();
  const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };
  const cells = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  const selectedVal = value ? new Date(value) : null;
  return (
    <div className="mor-cal-dropdown" onClick={e=>e.stopPropagation()}>
      <div className="mor-cal-header">
        <button className="mor-cal-nav" onClick={prevMonth}><ChevronLeft size={14}/></button>
        <span className="mor-cal-month">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="mor-cal-nav" onClick={nextMonth}><ChevronRight size={14}/></button>
      </div>
      <div className="mor-cal-grid-days">{DAYS.map(d=><span key={d} className="mor-cal-day-label">{d}</span>)}</div>
      <div className="mor-cal-grid">
        {cells.map((day,i)=>{
          if(!day) return <span key={`e-${i}`}/>;
          const ds=`${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isSel=selectedVal&&selectedVal.getFullYear()===viewYear&&selectedVal.getMonth()===viewMonth&&selectedVal.getDate()===day;
          const isToday=today.getFullYear()===viewYear&&today.getMonth()===viewMonth&&today.getDate()===day;
          return <button key={day} className={`mor-cal-day ${isSel?"selected":""} ${isToday&&!isSel?"today":""}`} onClick={()=>{onChange(ds);onClose();}}>{day}</button>;
        })}
      </div>
      <div className="mor-cal-footer">
        <button className="mor-cal-clear" onClick={()=>{onChange(null);onClose();}}>Clear</button>
        <button className="mor-cal-today" onClick={()=>{const t=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;onChange(t);onClose();}}>Today</button>
      </div>
    </div>
  );
}

const HoverTooltip = ({ order, visible, dark }) => {
  if (!visible || !order) return null;
  const cfg  = STATUS_CFG[order.orderStatus] || STATUS_CFG.PLACED;
  const PayI = PAYMENT_ICON[(order.paymentMethod||"").toLowerCase()] || PAYMENT_ICON.upi;
  const isDine = order.orderType === "DINE_IN";
  return (
    <div style={{ position:"fixed", background:dark?"#1a1d28":"#fff", border:`1px solid ${dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`, borderRadius:12, padding:"12px 14px", width:240, boxShadow:dark?"0 8px 32px rgba(0,0,0,0.5)":"0 8px 32px rgba(0,0,0,0.15)", zIndex:9999, pointerEvents:"none", fontFamily:"'Inter',sans-serif", animation:"morTooltipIn 0.12s ease" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:12, fontWeight:700, color:"#635bff", fontFamily:"monospace" }}>{order.orderNumber||order.orderId?.slice(0,12)}</span>
        <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, fontWeight:600, background:cfg.cls.includes("completed")?"rgba(22,163,74,0.1)":cfg.cls.includes("cancelled")?"rgba(239,68,68,0.1)":cfg.cls.includes("prep")?"rgba(245,158,11,0.1)":"rgba(99,91,255,0.1)", color:cfg.cls.includes("completed")?"#16a34a":cfg.cls.includes("cancelled")?"#ef4444":cfg.cls.includes("prep")?"#f59e0b":"#635bff" }}>{cfg.label}</span>
      </div>
      <div style={{ fontSize:11, color:dark?"#9aa1b5":"#64748b", marginBottom:6 }}>👤 {order.customerName||"Guest"}{order.customerPhone&&` · ${order.customerPhone}`}</div>
      <div style={{ fontSize:11, color:dark?"#9aa1b5":"#64748b", marginBottom:8 }}>{isDine?"🍽️ Dine In":"🥡 Take Away"}{order.tableNumber&&` · ${order.tableNumber}`}</div>
      <div style={{ background:dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)", borderRadius:7, padding:"6px 8px", marginBottom:8 }}>
        {(order.items||[]).slice(0,3).map((item,i)=>(
          <div key={i} style={{ fontSize:10.5, color:dark?"#8b92a9":"#64748b", padding:"1.5px 0" }}>{item.quantity} × {item.productName}</div>
        ))}
        {(order.items||[]).length>3&&<div style={{ fontSize:10, color:"#9ca3af", marginTop:2 }}>+{(order.items||[]).length-3} more</div>}
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:13, fontWeight:800, color:dark?"#e2e8f0":"#1e293b" }}>₹{Number(order.grandTotal||0).toLocaleString("en-IN")}</span>
        <span style={{ fontSize:10, color:PayI.color, fontWeight:600, display:"flex", alignItems:"center", gap:3 }}><PayI.icon size={10}/> {PayI.label}</span>
      </div>
      <style>{`@keyframes morTooltipIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
};

const MyOrderTableTopleoPage = ({ highlightOrder = null, isDark: darkProp = false }) => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [spinning,     setSpinning]     = useState(false);
  const [error,        setError]        = useState("");
  const [activeTab,    setActiveTab]    = useState("all");
  const [selected,     setSelected]     = useState(null);
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [dateFilter,   setDateFilter]   = useState(null);
  const [calOpen,      setCalOpen]      = useState(false);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [filterType,   setFilterType]   = useState("all");
  const [filterPay,    setFilterPay]    = useState("all");
  const [updatingId,   setUpdatingId]   = useState(null);
  const [showStatusDd, setShowStatusDd] = useState(false);
  const [docDark,      setDocDark]      = useState(false);
  const [hoveredOrder,   setHoveredOrder]   = useState(null);
  const [tooltipPos,     setTooltipPos]     = useState({ x:0, y:0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const hoverTimerRef = useRef(null);
  const calRef    = useRef(null);
  const filterRef = useRef(null);
  const statusRef = useRef(null);
  const highlightRef = useRef(null);

  // Watch data-afd-theme attribute on <html> so dark mode from dashboard applies instantly
  useEffect(()=>{
    const check = () => {
      setDocDark(document.documentElement.getAttribute("data-afd-theme") === "dark");
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-afd-theme"] });
    return () => observer.disconnect();
  }, []);

  const isDark = darkProp || docDark;

  useEffect(()=>{ fetchOrders(); },[]);

  useEffect(()=>{
    const fn=(e)=>{
      if(calRef.current&&!calRef.current.contains(e.target))    setCalOpen(false);
      if(filterRef.current&&!filterRef.current.contains(e.target)) setFilterOpen(false);
      if(statusRef.current&&!statusRef.current.contains(e.target)) setShowStatusDd(false);
    };
    document.addEventListener("mousedown",fn);
    return ()=>document.removeEventListener("mousedown",fn);
  },[]);

  useEffect(()=>{
    if(highlightOrder&&orders.length>0){
      const match=orders.find(o=>o.orderNumber===highlightOrder||o.orderId===highlightOrder||o.orderId?.includes(highlightOrder));
      if(match){
        setSelected(match);
        setTimeout(()=>{ highlightRef.current?.scrollIntoView({behavior:"smooth",block:"center"}); },200);
      }
    }
  },[highlightOrder,orders]);

  const fetchOrders = async (isRefresh=false) => {
    if(isRefresh){ setSpinning(true); }
    else setLoading(true);
    setError("");
    try {
      const res = await adminOrderService.getAllOrders();
      if(res.success) setOrders(res.data||[]);
      else setError(res.message||"Failed to load orders.");
    } catch { setError("Failed to load orders. Please try again."); }
    finally {
      setLoading(false);
      if(isRefresh){
        setTimeout(()=>setSpinning(false), 600);
      }
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setShowStatusDd(false);
    try {
      const res = await adminOrderService.updateOrderStatus(orderId, newStatus);
      if(res.success){
        setOrders(prev=>prev.map(o=>o.orderId===orderId?{...o,orderStatus:newStatus.toUpperCase()}:o));
        if(selected?.orderId===orderId) setSelected(prev=>({...prev,orderStatus:newStatus.toUpperCase()}));
        const newTabKey = STATUS_CFG[newStatus.toUpperCase()]?.tabKey || "all";
        setActiveTab(newTabKey);
        setPage(1);
      }
    } catch {} finally { setUpdatingId(null); }
  };

  const handleRowMouseEnter = (e, order) => {
    clearTimeout(hoverTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimerRef.current = setTimeout(()=>{
      const x = Math.min(rect.right+8, window.innerWidth-260);
      const y = Math.min(rect.top, window.innerHeight-280);
      setTooltipPos({x,y});
      setHoveredOrder(order);
      setTooltipVisible(true);
    },350);
  };
  const handleRowMouseLeave = () => {
    clearTimeout(hoverTimerRef.current);
    setTooltipVisible(false);
    setTimeout(()=>setHoveredOrder(null),150);
  };


  const stats = useMemo(()=>({
    total:     orders.length,
    preparing: orders.filter(o=>o.orderStatus==="PREPARING").length,
    ready:     orders.filter(o=>o.orderStatus==="READY").length,
    completed: orders.filter(o=>o.orderStatus==="COMPLETED").length,
    cancelled: orders.filter(o=>o.orderStatus==="CANCELLED").length,
  }),[orders]);

  const STATS = [
    { label:"Total Orders",     val:stats.total,     icon:ShoppingBag, iconBg:"#eff6ff", iconColor:"#2563eb" },
    { label:"Preparing",        val:stats.preparing, icon:ChefHat,     iconBg:"#fef3c7", iconColor:"#b45309" },
    { label:"Ready for Pickup", val:stats.ready,     icon:Truck,       iconBg:"#fff7ed", iconColor:"#ea580c" },
    { label:"Completed",        val:stats.completed, icon:CheckCircle2,iconBg:"#f0fdf4", iconColor:"#16a34a" },
    { label:"Cancelled",        val:stats.cancelled, icon:XCircle,     iconBg:"#fef2f2", iconColor:"#dc2626" },
  ];

  const tabCounts = useMemo(()=>({
    all:       orders.length,
    new:       orders.filter(o=>["PLACED","ACCEPTED"].includes(o.orderStatus)).length,
    preparing: orders.filter(o=>o.orderStatus==="PREPARING").length,
    delivery:  orders.filter(o=>o.orderStatus==="READY").length,
    completed: orders.filter(o=>o.orderStatus==="COMPLETED").length,
    cancelled: orders.filter(o=>o.orderStatus==="CANCELLED").length,
  }),[orders]);

  const TABS = [
    {key:"all",       label:"All Orders"},
    {key:"new",       label:"New"},
    {key:"preparing", label:"Preparing"},
    {key:"delivery",  label:"Out for Delivery"},
    {key:"completed", label:"Completed"},
    {key:"cancelled", label:"Cancelled"},
  ];

  const filtered = useMemo(()=>orders.filter(o=>{
    const cfg=STATUS_CFG[o.orderStatus]||STATUS_CFG.PLACED;
    if(activeTab!=="all"&&cfg.tabKey!==activeTab) return false;
    if(dateFilter){const{date}=formatDateTime(o.createdAt);if(date!==dateFilter) return false;}
    if(filterType!=="all"){const ot=o.orderType==="DINE_IN"?"dine":"takeaway";if(ot!==filterType) return false;}
    if(filterPay!=="all"&&(o.paymentMethod||"").toLowerCase()!==filterPay) return false;
    if(search.trim()){const q=search.toLowerCase();if(!o.orderId?.toLowerCase().includes(q)&&!o.orderNumber?.toLowerCase().includes(q)&&!o.customerName?.toLowerCase().includes(q)&&!o.customerPhone?.toLowerCase().includes(q)) return false;}
    return true;
  }),[orders,activeTab,dateFilter,filterType,filterPay,search]);

  const totalPages = Math.max(1,Math.ceil(filtered.length/ITEMS_PER_PAGE));
  const safePage   = Math.min(page,totalPages);
  const paged      = filtered.slice((safePage-1)*ITEMS_PER_PAGE, safePage*ITEMS_PER_PAGE);
  const activeFiltersCount=[dateFilter,filterType!=="all"?filterType:null,filterPay!=="all"?filterPay:null].filter(Boolean).length;
  const clearAllFilters=()=>{setDateFilter(null);setFilterType("all");setFilterPay("all");setSearch("");setPage(1);};
  const handleTab=(key)=>{setActiveTab(key);setPage(1);};
  const getStatusCfg=(s)=>STATUS_CFG[s]||STATUS_CFG.PLACED;
  const getPayIcon=(m)=>PAYMENT_ICON[(m||"").toLowerCase()]||PAYMENT_ICON.upi;
  const getTimelineDone=(s)=>{const i=TIMELINE_STEPS.indexOf(s);return i>=0?i+1:1;};

  if(loading) return (
    <div className="mor-root" style={{alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{width:44,height:44,border:"3px solid #f1f5f9",borderTop:"3px solid #635bff",borderRadius:"50%",animation:"morSpin 0.8s linear infinite"}}/>
      <p style={{color:"#6b7280",fontSize:14}}>Loading orders...</p>
      <style>{`@keyframes morSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(error) return (
    <div className="mor-root" style={{alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
      <div style={{fontSize:48}}>⚠️</div>
      <p style={{color:"#374151",fontSize:15,fontWeight:700,margin:0}}>Failed to load orders</p>
      <p style={{color:"#6b7280",fontSize:13,margin:0}}>{error}</p>
      <button onClick={()=>fetchOrders()} style={{padding:"10px 24px",background:"#635bff",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
        <RefreshCw size={14}/> Retry
      </button>
    </div>
  );

  return (
    <div className="mor-root">
      <style>{`
        @keyframes morSpin{to{transform:rotate(360deg)}}
        @keyframes morRefSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes morTooltipIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
        @keyframes highlightPulse{0%{box-shadow:0 0 0 0 rgba(99,91,255,0.4)}50%{box-shadow:0 0 0 6px rgba(99,91,255,0)}100%{box-shadow:0 0 0 0 rgba(99,91,255,0)}}
        @keyframes statusDdIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .mor-ref-spinning{animation:morRefSpin 0.6s linear!important}
      `}</style>

      {tooltipVisible&&hoveredOrder&&(
        <div style={{position:"fixed",left:tooltipPos.x,top:tooltipPos.y,zIndex:9999,pointerEvents:"none"}}>
          <HoverTooltip order={hoveredOrder} visible={tooltipVisible} dark={isDark}/>
        </div>
      )}

      <div className="mor-left">

        {highlightOrder&&(
          <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(99,91,255,0.08)",border:"1px solid rgba(99,91,255,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#635bff",animation:"highlightPulse 1.5s ease infinite"}}/>
            <span style={{fontSize:12,fontWeight:600,color:"#635bff"}}>Navigated from notification — order <strong>{highlightOrder}</strong></span>
          </div>
        )}

        <div className="mor-header">
          <div className="mor-header-row">
            <div>
              <h1 className="mor-title">Orders</h1>
              <p className="mor-sub">Manage and track all customer orders in real-time</p>
            </div>
            <div className="mor-header-right">
              <div className="mor-search-wrap">
                <Search size={14} className="mor-search-icon"/>
                <input className="mor-search-input" placeholder="Search by Order ID, Customer, Phone..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
                <span className="mor-search-kbd">Ctrl + K</span>
              </div>

              <div className="mor-cal-wrap" ref={calRef}>
                <button className={`mor-date-btn ${dateFilter?"mor-date-btn-active":""}`} onClick={()=>{setCalOpen(o=>!o);setFilterOpen(false);}}>
                  <Calendar size={13}/>
                  {dateFilter?formatDate(dateFilter):"Pick Date"}
                  {dateFilter&&<span className="mor-date-clear" onClick={e=>{e.stopPropagation();setDateFilter(null);setPage(1);}}><X size={11}/></span>}
                </button>
                {calOpen&&<CalendarPicker value={dateFilter} onChange={v=>{setDateFilter(v);setPage(1);}} onClose={()=>setCalOpen(false)}/>}
              </div>

              <div className="mor-filter-wrap" ref={filterRef}>
                <button className={`mor-filter-btn ${activeFiltersCount>0?"mor-filter-btn-active":""}`} onClick={()=>{setFilterOpen(o=>!o);setCalOpen(false);}}>
                  <SlidersHorizontal size={13}/> Filters
                  {activeFiltersCount>0&&<span className="mor-filter-count">{activeFiltersCount}</span>}
                </button>
                {filterOpen&&(
                  <div className="mor-filter-dropdown" onClick={e=>e.stopPropagation()}>
                    <div className="mor-fd-title">Filter Orders</div>
                    <div className="mor-fd-group">
                      <div className="mor-fd-label">Order Type</div>
                      <div className="mor-fd-pills">
                        {[["all","All"],["dine","Dine In"],["takeaway","Take Away"]].map(([v,l])=>(
                          <button key={v} className={`mor-fd-pill ${filterType===v?"active":""}`} onClick={()=>{setFilterType(v);setPage(1);}}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div className="mor-fd-group">
                      <div className="mor-fd-label">Payment Method</div>
                      <div className="mor-fd-pills">
                        {[["all","All"],["upi","UPI"],["razorpay","Razorpay"],["stripe","Stripe"],["paypal","PayPal"],["pay_at_counter","At Counter"]].map(([v,l])=>(
                          <button key={v} className={`mor-fd-pill ${filterPay===v?"active":""}`} onClick={()=>{setFilterPay(v);setPage(1);}}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div className="mor-fd-actions">
                      <button className="mor-fd-clear" onClick={()=>{setFilterType("all");setFilterPay("all");setPage(1);}}>Clear</button>
                      <button className="mor-fd-apply" onClick={()=>setFilterOpen(false)}>Apply</button>
                    </div>
                  </div>
                )}
              </div>

              <button className="mor-date-btn" onClick={()=>fetchOrders(true)} style={{gap:5}}>
                <RefreshCw size={13} className={spinning?"mor-ref-spinning":""}/> {spinning?"Refreshing...":"Refresh"}
              </button>
            </div>
          </div>

          {(activeFiltersCount>0||search)&&(
            <div className="mor-active-filters">
              <span className="mor-af-label">Active filters:</span>
              {dateFilter&&<span className="mor-af-chip">📅 {formatDate(dateFilter)} <button onClick={()=>{setDateFilter(null);setPage(1);}}><X size={10}/></button></span>}
              {filterType!=="all"&&<span className="mor-af-chip">{filterType==="dine"?"🍽️ Dine In":"🥡 Take Away"} <button onClick={()=>{setFilterType("all");setPage(1);}}><X size={10}/></button></span>}
              {filterPay!=="all"&&<span className="mor-af-chip">💳 {filterPay} <button onClick={()=>{setFilterPay("all");setPage(1);}}><X size={10}/></button></span>}
              {search&&<span className="mor-af-chip">🔍 "{search}" <button onClick={()=>{setSearch("");setPage(1);}}><X size={10}/></button></span>}
              <button className="mor-af-clear-all" onClick={clearAllFilters}>Clear all</button>
            </div>
          )}
        </div>

        <div className="mor-stats">
          {STATS.map(s=>{
            const Icon=s.icon;
            return (
              <div className="mor-stat-card" key={s.label}>
                <div className="mor-stat-icon" style={{background:s.iconBg}}><Icon size={18} color={s.iconColor}/></div>
                <div className="mor-stat-body">
                  <div className="mor-stat-label">{s.label}</div>
                  <div className="mor-stat-val">{s.val}</div>
                  <div className="mor-stat-trend up" style={{color:"#6b7280",fontSize:11}}>Real-time data</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mor-tabs-row">
          <div className="mor-tabs">
            {TABS.map(t=>(
              <button key={t.key} className={`mor-tab ${activeTab===t.key?"active":""}`} onClick={()=>handleTab(t.key)}>
                {t.label} ({tabCounts[t.key]})
              </button>
            ))}
          </div>
          <div className="mor-sort-wrap">
            <button className="mor-sort-btn"><SlidersHorizontal size={12}/> Newest First <ChevronDown size={11}/></button>
          </div>
        </div>

        <div className="mor-table-wrap">
          <table className="mor-table">
            <thead>
              <tr>
                <th className="mor-th">Order ID</th>
                <th className="mor-th">Customer</th>
                <th className="mor-th">Type</th>
                <th className="mor-th">Items</th>
                <th className="mor-th">Amount</th>
                <th className="mor-th">Status</th>
                <th className="mor-th">Time</th>
                <th className="mor-th"/>
              </tr>
            </thead>
            <tbody>
              {paged.length===0?(
                <tr>
                  <td colSpan={8} style={{textAlign:"center",padding:"48px 20px",color:"#9ca3af",fontSize:13}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                      <Filter size={32} strokeWidth={1.2} color="#d1d5db"/>
                      <span>{orders.length===0?"No orders yet. Orders placed by customers will appear here.":"No orders found for selected filters."}</span>
                      {orders.length>0&&<button className="mor-af-clear-all" onClick={clearAllFilters} style={{marginTop:4}}>Clear filters</button>}
                    </div>
                  </td>
                </tr>
              ):paged.map((order,idx)=>{
                const cfg    = getStatusCfg(order.orderStatus);
                const dt     = formatDateTime(order.createdAt);
                const inits  = getInitials(order.customerName);
                const color  = AVATAR_COLORS[idx%AVATAR_COLORS.length];
                const isDine = order.orderType==="DINE_IN";
                const itemCnt= order.items?.length||0;
                const itemNms= (order.items||[]).slice(0,2).map(i=>`${i.quantity} x ${i.productName}`);
                const isHighlighted=highlightOrder&&(order.orderNumber===highlightOrder||order.orderId===highlightOrder);
                return (
                  <tr
                    key={order.orderId}
                    ref={isHighlighted?highlightRef:null}
                    className={`mor-tr ${selected?.orderId===order.orderId?"selected":""}`}
                    onClick={()=>setSelected(selected?.orderId===order.orderId?null:order)}
                    onMouseEnter={e=>handleRowMouseEnter(e,order)}
                    onMouseLeave={handleRowMouseLeave}
                    style={{outline:isHighlighted?"2px solid #635bff":"none",outlineOffset:"-1px",animation:isHighlighted?"highlightPulse 2s ease":"none"}}
                  >
                    <td className="mor-td">
                      <div className="mor-order-id">{order.orderNumber||order.orderId}</div>
                      <div className="mor-order-sub" style={{fontSize:10,fontFamily:"monospace",color:"#9ca3af"}}>{order.orderId.slice(0,16)}...</div>
                    </td>
                    <td className="mor-td">
                      <div className="mor-customer-cell">
                        <div className="mor-avatar" style={{background:color}}>{inits}</div>
                        <div>
                          <div className="mor-cust-name">{order.customerName||"Guest"}</div>
                          <div className="mor-cust-phone">{order.customerPhone||"—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mor-td">
                      {isDine?(
                        <div>
                          <span className="mor-type-badge mor-type-dine"><Utensils size={11}/> Dine In</span>
                          {order.tableNumber&&<div style={{fontSize:11,color:"#6b7280",marginTop:3}}>{order.tableNumber}</div>}
                        </div>
                      ):<span className="mor-type-badge mor-type-takeaway"><Package size={11}/> Take Away</span>}
                    </td>
                    <td className="mor-td">
                      <div className="mor-items-main">{itemCnt} Item{itemCnt!==1?"s":""}</div>
                      <div className="mor-items-sub">{itemNms.join(", ")}{itemCnt>2?"...":""}</div>
                    </td>
                    <td className="mor-td">
                      <div className="mor-amount">₹{Number(order.grandTotal||0).toLocaleString("en-IN")}</div>
                      {order.payAtCounter?<div style={{fontSize:11,color:"#b45309",fontWeight:600}}>Pay at Counter</div>:order.paymentStatus==="PAID"?<div className="mor-paid">Paid</div>:<div style={{fontSize:11,color:"#f59e0b",fontWeight:600}}>{order.paymentStatus}</div>}
                    </td>
                    <td className="mor-td">
                      <span className={`mor-status-pill ${cfg.cls}`}><span className="mor-dot"/>{cfg.label}</span>
                    </td>
                    <td className="mor-td">
                      <div className="mor-time-main">{dt.time}</div>
                      <div className="mor-time-sub">{dt.ago}</div>
                    </td>
                    <td className="mor-td" onClick={e=>e.stopPropagation()}>
                      <button className="mor-more-btn"><MoreHorizontal size={15}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── PREV / NEXT ONLY ── */}
        <div className="mor-pagination">
          <span className="mor-pg-info">
            Showing {filtered.length===0?0:(safePage-1)*ITEMS_PER_PAGE+1}–{Math.min(safePage*ITEMS_PER_PAGE,filtered.length)} of {filtered.length} orders
          </span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button
              className="mor-pg-btn"
              disabled={safePage===1}
              onClick={()=>setPage(p=>Math.max(1,p-1))}
              style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",fontWeight:600}}
            >
              <ChevronLeft size={14}/> Previous
            </button>
            <span style={{fontSize:12,color:"#6b7280",padding:"0 4px",minWidth:80,textAlign:"center"}}>
              Page {safePage} of {totalPages}
            </span>
            <button
              className="mor-pg-btn"
              disabled={safePage===totalPages}
              onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
              style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",fontWeight:600}}
            >
              Next <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      </div>

      {selected&&(()=>{
        const cfg   = getStatusCfg(selected.orderStatus);
        const dt    = formatDateTime(selected.createdAt);
        const PayI  = getPayIcon(selected.paymentMethod);
        const inits = getInitials(selected.customerName);
        const isDine= selected.orderType==="DINE_IN";
        const tlDone= getTimelineDone(selected.orderStatus);
        return (
          <div className="mor-right">
            <div className="mor-detail-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid #f3f4f6",flexShrink:0}}>
              <span className="mor-detail-title">Order Details</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {/* UPDATE STATUS BUTTON + DROPDOWN — right of Order Details */}
                <div ref={statusRef} style={{position:"relative"}}>
                  <button
                    onClick={()=>setShowStatusDd(o=>!o)}
                    disabled={!!updatingId}
                    style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:showStatusDd?"#4f46e5":"#635bff",color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"background 0.15s"}}
                  >
                    {updatingId===selected?.orderId?"Updating...":"Update Status"}
                    <ChevronDown size={13} style={{transform:showStatusDd?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.15s"}}/>
                  </button>

                  {showStatusDd&&(
                    <div
                      onClick={e=>e.stopPropagation()}
                      style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:12,boxShadow:"0 16px 40px rgba(0,0,0,0.16)",overflow:"hidden",minWidth:210,zIndex:9999,animation:"statusDdIn 0.15s ease"}}
                    >
                      <div style={{padding:"9px 14px 7px",borderBottom:"1px solid #f3f4f6"}}>
                        <div style={{fontSize:10.5,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.06em"}}>Move order to</div>
                      </div>
                      {STATUS_OPTIONS.map(s=>{
                        const isActive=selected.orderStatus===s.key||(s.key==="ACCEPTED"&&["PLACED"].includes(selected.orderStatus));
                        return (
                          <button
                            key={s.key}
                            onClick={()=>handleUpdateStatus(selected.orderId,s.key)}
                            style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",border:"none",background:isActive?"#f5f3ff":"transparent",fontSize:13,fontWeight:isActive?700:500,color:isActive?"#635bff":"#374151",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"background 0.1s"}}
                            onMouseOver={e=>{if(!isActive) e.currentTarget.style.background="#f9fafb";}}
                            onMouseOut={e=>{if(!isActive) e.currentTarget.style.background="transparent";}}
                          >
                            <span style={{width:9,height:9,borderRadius:"50%",background:s.dot,flexShrink:0,display:"inline-block",boxShadow:`0 0 0 2px ${s.dot}33`}}/>
                            {s.label}
                            {isActive&&<CheckCircle2 size={13} color="#635bff" style={{marginLeft:"auto"}}/>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button className="mor-close-btn" onClick={()=>setSelected(null)}><X size={14}/></button>
              </div>
            </div>
            <div className="mor-detail-body">
              <div className="mor-detail-id-row">
                <span className="mor-detail-id">{selected.orderNumber}</span>
                <span className={`mor-status-pill ${cfg.cls}`}><span className="mor-dot"/>{cfg.label}</span>
              </div>
              <div className="mor-detail-meta">
                <div className="mor-detail-meta-row"><Calendar size={12}/> {formatDate(dt.date)} | {dt.time}</div>
                <div className="mor-detail-meta-row"><ShoppingBag size={12}/> {isDine?"Dine In":"Take Away"}</div>
                {selected.customerNote&&<div className="mor-detail-meta-row" style={{fontSize:11.5,color:"#f59e0b",fontStyle:"italic"}}>📝 Note: {selected.customerNote}</div>}
              </div>
              <div className="mor-section-label">Customer Details</div>
              <div className="mor-cust-detail">
                <div className="mor-avatar" style={{background:AVATAR_COLORS[0],width:32,height:32,fontSize:12}}>{inits}</div>
                <div>
                  <div className="mor-cust-detail-name">{selected.customerName||"Guest"}</div>
                  <div className="mor-cust-detail-phone">{selected.customerPhone||"—"}</div>
                  {selected.customerEmail&&<div style={{fontSize:11,color:"#9ca3af",marginTop:1}}>{selected.customerEmail}</div>}
                </div>
                <div className="mor-cust-actions">
                  {selected.customerPhone&&<a href={`tel:${selected.customerPhone}`} className="mor-cust-action-btn"><Phone size={12}/></a>}
                  <button className="mor-cust-action-btn"><MessageSquare size={12}/></button>
                </div>
              </div>
              <div className="mor-section-label">Order Type</div>
              <div className="mor-type-detail">
                {isDine?<span className="mor-type-badge mor-type-dine"><Utensils size={11}/> Dine In</span>:<span className="mor-type-badge mor-type-takeaway"><Package size={11}/> Take Away</span>}
                {selected.tableNumber&&<span className="mor-table-tag">{selected.tableNumber}</span>}
              </div>
              <div className="mor-section-label">Order Items</div>
              <div className="mor-items-detail">
                {(selected.items||[]).map((item,i)=>(
                  <div key={i} className="mor-item-row">
                    <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                      {item.productImageUrl&&<img src={item.productImageUrl} alt={item.productName} style={{width:28,height:28,borderRadius:6,objectFit:"cover",flexShrink:0,border:"1px solid #f1f5f9"}} onError={e=>{e.target.style.display="none";}}/>}
                      <span className="mor-item-name">
                        {item.quantity} × {item.productName}
                        {item.specialRequest&&<span style={{fontSize:11,color:"#9ca3af",fontStyle:"italic",display:"block"}}>↳ {item.specialRequest}</span>}
                      </span>
                    </div>
                    <span className="mor-item-price">₹{Number(item.lineTotal||0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mor-totals">
                <div className="mor-total-row"><span>Subtotal</span><span className="mor-total-val">₹{Number(selected.subtotal||0).toFixed(2)}</span></div>
                <div className="mor-total-row"><span>Tax</span><span className="mor-total-val">₹{Number(selected.taxAmount||0).toFixed(2)}</span></div>
                <div className="mor-total-row"><span>Discount</span><span className="mor-total-val" style={{color:"#dc2626"}}>- ₹{Number(selected.discountAmount||0).toFixed(2)}</span></div>
                <div className="mor-total-row main"><span>Total Amount</span><span>₹{Number(selected.grandTotal||0).toFixed(2)}</span></div>
              </div>
              <div className="mor-pay-row">
                {selected.payAtCounter
                  ?<span className="mor-pay-badge" style={{background:"#fef3c7",color:"#b45309",border:"1px solid #fde68a"}}><Store size={11}/> Pay at Counter</span>
                  :<span className={`mor-pay-badge ${selected.paymentStatus==="PAID"?"mor-pay-paid":""}`}><CheckCircle2 size={11}/> {selected.paymentStatus}</span>
                }
                <span className="mor-pay-method"><PayI.icon size={12} color={PayI.color}/> {PayI.label}</span>
              </div>
              <div className="mor-section-label">Order Timeline</div>
              <div className="mor-timeline">
                {TIMELINE_STEPS.map((step,i)=>{
                  const done=i<tlDone;
                  return (
                    <div key={step} className={`mor-tl-item ${done?"tl-done":"tl-pending"}`}>
                      <div className="mor-tl-line"/>
                      <div className="mor-tl-dot">{done&&<div className="mor-tl-dot-inner"/>}</div>
                      <div className="mor-tl-content">
                        <div className="mor-tl-label">{step.charAt(0)+step.slice(1).toLowerCase().replace("_"," ")}</div>
                        <div className="mor-tl-time">{done?dt.time:"—"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mor-detail-footer" style={{padding:"12px 16px",borderTop:"1px solid #f3f4f6",flexShrink:0}}>
              <button className="mor-print-btn"><Printer size={13}/> Print Invoice</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MyOrderTableTopleoPage;