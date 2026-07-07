"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Calendar, SlidersHorizontal, Bell, ChevronDown,
  ChevronLeft, ChevronRight, MoreHorizontal, X,
  ShoppingBag, ChefHat, Truck, CheckCircle2, XCircle,
  Printer, Phone, MessageSquare, CreditCard, Utensils,
  Package, ArrowUpRight, ArrowDownRight, Filter, RefreshCw,
  Banknote, Smartphone, Globe, Store,
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
  READY:     { label:"Ready",            cls:"mor-s-delivery",  tabKey:"delivery"  },
  COMPLETED: { label:"Completed",        cls:"mor-s-completed", tabKey:"completed" },
  CANCELLED: { label:"Cancelled",        cls:"mor-s-cancelled", tabKey:"cancelled" },
};

const PAYMENT_ICON = {
  upi:            { icon: Smartphone,  label: "UPI",            color: "#7c3aed" },
  razorpay:       { icon: CreditCard,  label: "Razorpay",       color: "#3395ff" },
  stripe:         { icon: Globe,       label: "Stripe",         color: "#635bff" },
  paypal:         { icon: Globe,       label: "PayPal",         color: "#003087" },
  pay_at_counter: { icon: Store,       label: "Pay at Counter", color: "#b45309" },
  cash:           { icon: Banknote,    label: "Cash",           color: "#16a34a" },
};

const TIMELINE_STEPS = ["PLACED","ACCEPTED","PREPARING","READY","COMPLETED"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y,m,d] = dateStr.split("-");
  return `${MONTHS[parseInt(m)-1].slice(0,3)} ${parseInt(d)}, ${y}`;
}

function formatDateTime(isoStr) {
  if (!isoStr) return { date: "—", time: "—", ago: "" };
  const dt = new Date(isoStr);
  const date = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
  const time = dt.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
  const now  = Date.now();
  const diff = Math.floor((now - dt.getTime()) / 1000);
  let ago = "";
  if (diff < 60)        ago = "Just now";
  else if (diff < 3600) ago = `${Math.floor(diff/60)} min ago`;
  else if (diff < 86400)ago = `${Math.floor(diff/3600)} hr ago`;
  else                  ago = `${Math.floor(diff/86400)} days ago`;
  return { date, time, ago };
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
    : name.slice(0,2).toUpperCase();
}

function CalendarPicker({ value, onChange, onClose }) {
  const today = new Date();
  const initDate = value ? new Date(value) : today;
  const [viewYear,  setViewYear]  = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const prevMonth = () => { if (viewMonth===0) { setViewMonth(11); setViewYear(y=>y-1); } else setViewMonth(m=>m-1); };
  const nextMonth = () => { if (viewMonth===11) { setViewMonth(0); setViewYear(y=>y+1); } else setViewMonth(m=>m+1); };
  const cells = [];
  for (let i=0; i<firstDay; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(d);
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
        {cells.map((day,i) => {
          if (!day) return <span key={`e-${i}`}/>;
          const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isSelected = selectedVal && selectedVal.getFullYear()===viewYear && selectedVal.getMonth()===viewMonth && selectedVal.getDate()===day;
          const isToday = today.getFullYear()===viewYear && today.getMonth()===viewMonth && today.getDate()===day;
          return <button key={day} className={`mor-cal-day ${isSelected?"selected":""} ${isToday&&!isSelected?"today":""}`} onClick={()=>{onChange(dateStr);onClose();}}>{day}</button>;
        })}
      </div>
      <div className="mor-cal-footer">
        <button className="mor-cal-clear" onClick={()=>{onChange(null);onClose();}}>Clear</button>
        <button className="mor-cal-today" onClick={()=>{const t=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;onChange(t);onClose();}}>Today</button>
      </div>
    </div>
  );
}

const MyOrderTableTopleoPage = () => {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [activeTab,   setActiveTab]   = useState("all");
  const [selected,    setSelected]    = useState(null);
  const [search,      setSearch]      = useState("");
  const [page,        setPage]        = useState(1);
  const [dateFilter,  setDateFilter]  = useState(null);
  const [calOpen,     setCalOpen]     = useState(false);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [filterType,  setFilterType]  = useState("all");
  const [filterPay,   setFilterPay]   = useState("all");
  const [updatingId,  setUpdatingId]  = useState(null);
  const [showStatusDd,setShowStatusDd]= useState(false);
  const calRef    = useRef(null);
  const filterRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const fn = (e) => {
      if (calRef.current    && !calRef.current.contains(e.target))    setCalOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setShowStatusDd(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminOrderService.getAllOrders();
      if (res.success) {
        setOrders(res.data || []);
      } else {
        setError(res.message || "Failed to load orders.");
      }
    } catch (e) {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setShowStatusDd(false);
    try {
      const res = await adminOrderService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(prev => prev.map(o =>
          o.orderId === orderId ? { ...o, orderStatus: newStatus.toUpperCase() } : o
        ));
        if (selected?.orderId === orderId) {
          setSelected(prev => ({ ...prev, orderStatus: newStatus.toUpperCase() }));
        }
      }
    } catch {} finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => ({
    total:     orders.length,
    preparing: orders.filter(o => o.orderStatus === "PREPARING").length,
    ready:     orders.filter(o => o.orderStatus === "READY").length,
    completed: orders.filter(o => o.orderStatus === "COMPLETED").length,
    cancelled: orders.filter(o => o.orderStatus === "CANCELLED").length,
  }), [orders]);

  const STATS = [
    { label:"Total Orders",     val:stats.total,     icon:ShoppingBag, iconBg:"#eff6ff", iconColor:"#2563eb" },
    { label:"Preparing",        val:stats.preparing, icon:ChefHat,     iconBg:"#fef3c7", iconColor:"#b45309" },
    { label:"Ready for Pickup", val:stats.ready,     icon:Truck,       iconBg:"#fff7ed", iconColor:"#ea580c" },
    { label:"Completed",        val:stats.completed, icon:CheckCircle2,iconBg:"#f0fdf4", iconColor:"#16a34a" },
    { label:"Cancelled",        val:stats.cancelled, icon:XCircle,     iconBg:"#fef2f2", iconColor:"#dc2626" },
  ];

  const tabCounts = useMemo(() => ({
    all:       orders.length,
    new:       orders.filter(o => ["PLACED","ACCEPTED"].includes(o.orderStatus)).length,
    preparing: orders.filter(o => o.orderStatus === "PREPARING").length,
    delivery:  orders.filter(o => o.orderStatus === "READY").length,
    completed: orders.filter(o => o.orderStatus === "COMPLETED").length,
    cancelled: orders.filter(o => o.orderStatus === "CANCELLED").length,
  }), [orders]);

  const TABS = [
    { key:"all",       label:"All Orders"       },
    { key:"new",       label:"New"              },
    { key:"preparing", label:"Preparing"        },
    { key:"delivery",  label:"Out for Delivery" },
    { key:"completed", label:"Completed"        },
    { key:"cancelled", label:"Cancelled"        },
  ];

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const cfg = STATUS_CFG[o.orderStatus] || STATUS_CFG.PLACED;
      if (activeTab !== "all" && cfg.tabKey !== activeTab) return false;
      if (dateFilter) {
        const { date } = formatDateTime(o.createdAt);
        if (date !== dateFilter) return false;
      }
      if (filterType !== "all") {
        const oType = o.orderType === "DINE_IN" ? "dine" : "takeaway";
        if (oType !== filterType) return false;
      }
      if (filterPay !== "all") {
        if ((o.paymentMethod || "").toLowerCase() !== filterPay) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !o.orderId?.toLowerCase().includes(q) &&
          !o.orderNumber?.toLowerCase().includes(q) &&
          !o.customerName?.toLowerCase().includes(q) &&
          !o.customerPhone?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [orders, activeTab, dateFilter, filterType, filterPay, search]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage    = Math.min(page, totalPages);
  const paged       = filtered.slice((safePage-1)*ITEMS_PER_PAGE, safePage*ITEMS_PER_PAGE);
  const activeFiltersCount = [dateFilter, filterType!=="all"?filterType:null, filterPay!=="all"?filterPay:null].filter(Boolean).length;

  const clearAllFilters = () => { setDateFilter(null); setFilterType("all"); setFilterPay("all"); setSearch(""); setPage(1); };
  const handleTab = (key) => { setActiveTab(key); setPage(1); };

  const renderPages = () => {
    const pages = [];
    if (totalPages<=7) { for(let i=1;i<=totalPages;i++) pages.push(i); }
    else {
      pages.push(1,2,3);
      if (safePage>4) pages.push("...");
      if (safePage>3 && safePage<totalPages-2) pages.push(safePage);
      if (safePage<totalPages-3) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const getStatusCfg = (status) => STATUS_CFG[status] || STATUS_CFG.PLACED;
  const getPayIcon   = (method) => PAYMENT_ICON[(method||"").toLowerCase()] || PAYMENT_ICON.upi;
  const getTimelineDone = (status) => {
    const idx = TIMELINE_STEPS.indexOf(status);
    return idx >= 0 ? idx + 1 : 1;
  };

  if (loading) return (
    <div className="mor-root" style={{ alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ width:44, height:44, border:"3px solid #f1f5f9", borderTop:"3px solid #635bff", borderRadius:"50%", animation:"morSpin 0.8s linear infinite" }}/>
      <p style={{ color:"#6b7280", fontSize:14 }}>Loading orders...</p>
      <style>{`@keyframes morSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div className="mor-root" style={{ alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14 }}>
      <div style={{ fontSize:48 }}>⚠️</div>
      <p style={{ color:"#374151", fontSize:15, fontWeight:700, margin:0 }}>Failed to load orders</p>
      <p style={{ color:"#6b7280", fontSize:13, margin:0 }}>{error}</p>
      <button onClick={fetchOrders} style={{ padding:"10px 24px", background:"#635bff", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
        <RefreshCw size={14}/> Retry
      </button>
    </div>
  );

  return (
    <div className="mor-root">
      <div className="mor-left">

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
                  {dateFilter ? formatDate(dateFilter) : "Pick Date"}
                  {dateFilter && <span className="mor-date-clear" onClick={e=>{e.stopPropagation();setDateFilter(null);setPage(1);}}><X size={11}/></span>}
                </button>
                {calOpen && <CalendarPicker value={dateFilter} onChange={v=>{setDateFilter(v);setPage(1);}} onClose={()=>setCalOpen(false)}/>}
              </div>

              <div className="mor-filter-wrap" ref={filterRef}>
                <button className={`mor-filter-btn ${activeFiltersCount>0?"mor-filter-btn-active":""}`} onClick={()=>{setFilterOpen(o=>!o);setCalOpen(false);}}>
                  <SlidersHorizontal size={13}/> Filters
                  {activeFiltersCount>0 && <span className="mor-filter-count">{activeFiltersCount}</span>}
                </button>
                {filterOpen && (
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

              <button className="mor-date-btn" onClick={fetchOrders} title="Refresh" style={{ gap:5 }}>
                <RefreshCw size={13}/> Refresh
              </button>
            </div>
          </div>

          {(activeFiltersCount>0 || search) && (
            <div className="mor-active-filters">
              <span className="mor-af-label">Active filters:</span>
              {dateFilter && <span className="mor-af-chip">📅 {formatDate(dateFilter)} <button onClick={()=>{setDateFilter(null);setPage(1);}}><X size={10}/></button></span>}
              {filterType!=="all" && <span className="mor-af-chip">{filterType==="dine"?"🍽️ Dine In":"🥡 Take Away"} <button onClick={()=>{setFilterType("all");setPage(1);}}><X size={10}/></button></span>}
              {filterPay!=="all" && <span className="mor-af-chip">💳 {filterPay} <button onClick={()=>{setFilterPay("all");setPage(1);}}><X size={10}/></button></span>}
              {search && <span className="mor-af-chip">🔍 "{search}" <button onClick={()=>{setSearch("");setPage(1);}}><X size={10}/></button></span>}
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
                  <div className="mor-stat-trend up" style={{color:"#6b7280",fontSize:11}}>
                    Real-time data
                  </div>
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
            <button className="mor-sort-btn">
              <SlidersHorizontal size={12}/> Newest First <ChevronDown size={11}/>
            </button>
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
              {paged.length===0 ? (
                <tr>
                  <td colSpan={8} style={{textAlign:"center",padding:"48px 20px",color:"#9ca3af",fontSize:13}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                      <Filter size={32} strokeWidth={1.2} color="#d1d5db"/>
                      <span>{orders.length===0 ? "No orders yet. Orders placed by customers will appear here." : "No orders found for selected filters."}</span>
                      {orders.length>0 && <button className="mor-af-clear-all" onClick={clearAllFilters} style={{marginTop:4}}>Clear filters</button>}
                    </div>
                  </td>
                </tr>
              ) : paged.map((order,idx) => {
                const cfg    = getStatusCfg(order.orderStatus);
                const dt     = formatDateTime(order.createdAt);
                const inits  = getInitials(order.customerName);
                const color  = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const isDine = order.orderType === "DINE_IN";
                const itemCount = order.items?.length || 0;
                const itemNames = (order.items||[]).slice(0,2).map(i=>`${i.quantity} x ${i.productName}`);
                const PayI   = getPayIcon(order.paymentMethod);
                return (
                  <tr key={order.orderId} className={`mor-tr ${selected?.orderId===order.orderId?"selected":""}`}
                    onClick={()=>setSelected(selected?.orderId===order.orderId?null:order)}>
                    <td className="mor-td">
                      <div className="mor-order-id">{order.orderNumber || order.orderId}</div>
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
                      {isDine ? (
                        <div>
                          <span className="mor-type-badge mor-type-dine"><Utensils size={11}/> Dine In</span>
                          {order.tableNumber && <div style={{fontSize:11,color:"#6b7280",marginTop:3}}>{order.tableNumber}</div>}
                        </div>
                      ) : (
                        <span className="mor-type-badge mor-type-takeaway"><Package size={11}/> Take Away</span>
                      )}
                    </td>
                    <td className="mor-td">
                      <div className="mor-items-main">{itemCount} Item{itemCount!==1?"s":""}</div>
                      <div className="mor-items-sub">{itemNames.join(", ")}{itemCount>2?"...":""}</div>
                    </td>
                    <td className="mor-td">
                      <div className="mor-amount">₹{Number(order.grandTotal||0).toLocaleString("en-IN")}</div>
                      {order.payAtCounter
                        ? <div style={{fontSize:11,color:"#b45309",fontWeight:600}}>Pay at Counter</div>
                        : order.paymentStatus==="PAID"
                          ? <div className="mor-paid">Paid</div>
                          : <div style={{fontSize:11,color:"#f59e0b",fontWeight:600}}>{order.paymentStatus}</div>
                      }
                    </td>
                    <td className="mor-td">
                      <span className={`mor-status-pill ${cfg.cls}`}>
                        <span className="mor-dot"/>{cfg.label}
                      </span>
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

        <div className="mor-pagination">
          <span className="mor-pg-info">
            Showing {filtered.length===0?0:(safePage-1)*ITEMS_PER_PAGE+1} to {Math.min(safePage*ITEMS_PER_PAGE,filtered.length)} of {filtered.length} orders
          </span>
          <div className="mor-pg-controls">
            <button className="mor-pg-btn" disabled={safePage===1} onClick={()=>setPage(p=>Math.max(1,p-1))}><ChevronLeft size={14}/></button>
            {renderPages().map((pg,i)=>
              pg==="..."?<span key={`d${i}`} className="mor-pg-dots">...</span>:
              <button key={pg} className={`mor-pg-btn ${safePage===pg?"active":""}`} onClick={()=>setPage(pg)}>{pg}</button>
            )}
            <button className="mor-pg-btn" disabled={safePage===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="mor-right">
          <div className="mor-detail-header">
            <span className="mor-detail-title">Order Details</span>
            <button className="mor-close-btn" onClick={()=>setSelected(null)}><X size={14}/></button>
          </div>

          <div className="mor-detail-body">
            {(() => {
              const cfg  = getStatusCfg(selected.orderStatus);
              const dt   = formatDateTime(selected.createdAt);
              const PayI = getPayIcon(selected.paymentMethod);
              const inits= getInitials(selected.customerName);
              const isDine = selected.orderType === "DINE_IN";
              const tlDone = getTimelineDone(selected.orderStatus);
              return (
                <>
                  <div className="mor-detail-id-row">
                    <span className="mor-detail-id">{selected.orderNumber}</span>
                    <span className={`mor-status-pill ${cfg.cls}`}><span className="mor-dot"/>{cfg.label}</span>
                  </div>

                  <div className="mor-detail-meta">
                    <div className="mor-detail-meta-row"><Calendar size={12}/> {formatDate(dt.date)} | {dt.time}</div>
                    <div className="mor-detail-meta-row"><ShoppingBag size={12}/> {isDine ? "Dine In" : "Take Away"}</div>
                    {selected.customerNote && (
                      <div className="mor-detail-meta-row" style={{fontSize:11.5,color:"#f59e0b",fontStyle:"italic"}}>
                        📝 Note: {selected.customerNote}
                      </div>
                    )}
                  </div>

                  <div className="mor-section-label">Customer Details</div>
                  <div className="mor-cust-detail">
                    <div className="mor-avatar" style={{background:AVATAR_COLORS[0],width:32,height:32,fontSize:12}}>{inits}</div>
                    <div>
                      <div className="mor-cust-detail-name">{selected.customerName||"Guest"}</div>
                      <div className="mor-cust-detail-phone">{selected.customerPhone||"—"}</div>
                      {selected.customerEmail && <div style={{fontSize:11,color:"#9ca3af",marginTop:1}}>{selected.customerEmail}</div>}
                    </div>
                    <div className="mor-cust-actions">
                      {selected.customerPhone && (
                        <a href={`tel:${selected.customerPhone}`} className="mor-cust-action-btn"><Phone size={12}/></a>
                      )}
                      <button className="mor-cust-action-btn"><MessageSquare size={12}/></button>
                    </div>
                  </div>

                  <div className="mor-section-label">Order Type</div>
                  <div className="mor-type-detail">
                    {isDine
                      ? <span className="mor-type-badge mor-type-dine"><Utensils size={11}/> Dine In</span>
                      : <span className="mor-type-badge mor-type-takeaway"><Package size={11}/> Take Away</span>
                    }
                    {selected.tableNumber && <span className="mor-table-tag">{selected.tableNumber}</span>}
                  </div>

                  <div className="mor-section-label">Order Items</div>
                  <div className="mor-items-detail">
                    {(selected.items||[]).map((item,i)=>(
                      <div key={i} className="mor-item-row">
                        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                          {item.productImageUrl && (
                            <img src={item.productImageUrl} alt={item.productName}
                              style={{width:28,height:28,borderRadius:6,objectFit:"cover",flexShrink:0,border:"1px solid #f1f5f9"}}
                              onError={e=>{e.target.style.display="none";}}
                            />
                          )}
                          <span className="mor-item-name">
                            {item.quantity} × {item.productName}
                            {item.specialRequest && <span style={{fontSize:11,color:"#9ca3af",fontStyle:"italic",display:"block"}}>↳ {item.specialRequest}</span>}
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
                    {selected.payAtCounter ? (
                      <span className="mor-pay-badge" style={{background:"#fef3c7",color:"#b45309",border:"1px solid #fde68a"}}>
                        <Store size={11}/> Pay at Counter
                      </span>
                    ) : (
                      <span className={`mor-pay-badge ${selected.paymentStatus==="PAID"?"mor-pay-paid":""}`}>
                        <CheckCircle2 size={11}/> {selected.paymentStatus}
                      </span>
                    )}
                    <span className="mor-pay-method">
                      <PayI.icon size={12} color={PayI.color}/> {PayI.label}
                    </span>
                  </div>

                  <div className="mor-section-label">Order Timeline</div>
                  <div className="mor-timeline">
                    {TIMELINE_STEPS.map((step,i)=>{
                      const done = i < tlDone;
                      return (
                        <div key={step} className={`mor-tl-item ${done?"tl-done":"tl-pending"}`}>
                          <div className="mor-tl-line"/>
                          <div className="mor-tl-dot">{done && <div className="mor-tl-dot-inner"/>}</div>
                          <div className="mor-tl-content">
                            <div className="mor-tl-label">{step.charAt(0)+step.slice(1).toLowerCase().replace("_"," ")}</div>
                            <div className="mor-tl-time">{done ? dt.time : "—"}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>

          <div className="mor-detail-footer">
            <button className="mor-print-btn"><Printer size={13}/> Print Invoice</button>
            <div className="mor-update-wrap" ref={statusRef}>
              <button
                className="mor-update-btn"
                disabled={!!updatingId}
                onClick={()=>setShowStatusDd(o=>!o)}
              >
                {updatingId===selected?.orderId ? "Updating..." : "Update Status"}
              </button>
              <button className="mor-update-chevron" onClick={()=>setShowStatusDd(o=>!o)}>
                <ChevronDown size={14}/>
              </button>
              {showStatusDd && (
                <div style={{position:"absolute",bottom:"100%",right:0,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",overflow:"hidden",minWidth:180,zIndex:100,marginBottom:4}}>
                  {["ACCEPTED","PREPARING","READY","COMPLETED","CANCELLED"].map(s=>(
                    <button key={s} onClick={()=>handleUpdateStatus(selected.orderId,s)}
                      style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 14px",border:"none",background:selected.orderStatus===s?"#f5f3ff":"#fff",fontSize:13,fontWeight:selected.orderStatus===s?700:500,color:selected.orderStatus===s?"#635bff":"#374151",cursor:"pointer",textAlign:"left"}}>
                      <span className={`mor-dot ${getStatusCfg(s).cls}`} style={{width:7,height:7,borderRadius:"50%",background: s==="COMPLETED"?"#16a34a":s==="CANCELLED"?"#dc2626":s==="PREPARING"?"#f59e0b":s==="READY"?"#f97316":"#2563eb",display:"inline-block",flexShrink:0}}/>
                      {getStatusCfg(s).label}
                      {selected.orderStatus===s && <CheckCircle2 size={13} color="#635bff" style={{marginLeft:"auto"}}/>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrderTableTopleoPage;
