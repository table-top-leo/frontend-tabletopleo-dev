"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Calendar, SlidersHorizontal, Bell, ChevronDown,
  ChevronLeft, ChevronRight, MoreHorizontal, X,
  ShoppingBag, ChefHat, Truck, CheckCircle2, XCircle,
  Printer, Phone, MessageSquare, CreditCard, Utensils,
  Package, ArrowUpRight, ArrowDownRight, Filter,
} from "lucide-react";
import "../orderstabletopleo/designorderspage.css";

const AVATAR_COLORS = [
  "#635bff","#0ea5e9","#16a34a","#f59e0b","#ef4444",
  "#8b5cf6","#06b6d4","#84cc16","#f97316","#ec4899",
];

const ORDERS = [
  { id:"#ORD-1028", date:"2025-05-27", type:"dine",     table:"Table 05", customer:"Rahul Sharma",   phone:"+91 98765 43210", initials:"RS", color:0, items:3, itemList:["2 x Cappuccino","1 x Brownie","1 x Garlic Bread"],        amount:450,  paid:true,  refund:false, status:"preparing",  time:"10:24 AM", ago:"2 mins ago",  payment:"UPI",      timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:3 },
  { id:"#ORD-1027", date:"2025-05-27", type:"takeaway", table:null,        customer:"Priya Nair",     phone:"+91 91234 56789", initials:"PN", color:1, items:4, itemList:["1 x Latte","1 x Sandwich","2 x Cold Coffee"],             amount:680,  paid:true,  refund:false, status:"delivery",   time:"10:18 AM", ago:"8 mins ago",  payment:"Razorpay", timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:4 },
  { id:"#ORD-1026", date:"2025-05-27", type:"dine",     table:"Table 03", customer:"Amit Verma",    phone:"+91 99887 76655", initials:"AV", color:2, items:2, itemList:["1 x Americano","1 x Muffin"],                              amount:280,  paid:true,  refund:false, status:"new",        time:"10:15 AM", ago:"11 mins ago", payment:"UPI",      timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:1 },
  { id:"#ORD-1025", date:"2025-05-27", type:"takeaway", table:null,        customer:"Sneha Iyer",    phone:"+91 88991 23456", initials:"SI", color:3, items:5, itemList:["2 x Cold Coffee","1 x Pastry","2 x Tea"],                  amount:750,  paid:true,  refund:false, status:"preparing",  time:"10:10 AM", ago:"16 mins ago", payment:"Stripe",   timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:3 },
  { id:"#ORD-1024", date:"2025-05-27", type:"dine",     table:"Table 08", customer:"Vikram Singh",  phone:"+91 77665 44332", initials:"VS", color:4, items:1, itemList:["1 x Cappuccino"],                                          amount:150,  paid:true,  refund:false, status:"completed",  time:"10:05 AM", ago:"21 mins ago", payment:"UPI",      timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:5 },
  { id:"#ORD-1023", date:"2025-05-27", type:"takeaway", table:null,        customer:"Neha Gupta",    phone:"+91 90011 22334", initials:"NG", color:5, items:3, itemList:["1 x Latte","1 x Brownie","1 x Tea"],                      amount:520,  paid:false, refund:true,  status:"cancelled",  time:"10:02 AM", ago:"24 mins ago", payment:"PayPal",   timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:2 },
  { id:"#ORD-1022", date:"2025-05-27", type:"dine",     table:"Table 01", customer:"Rohit Patel",   phone:"+91 78899 66554", initials:"RP", color:6, items:2, itemList:["1 x Mocha","1 x Sandwich"],                               amount:390,  paid:true,  refund:false, status:"completed",  time:"09:58 AM", ago:"28 mins ago", payment:"UPI",      timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:5 },
  { id:"#ORD-1021", date:"2025-05-27", type:"takeaway", table:null,        customer:"Kavya Reddy",   phone:"+91 91212 34343", initials:"KR", color:7, items:4, itemList:["2 x Tea","1 x Pastry","1 x Cold Coffee"],                 amount:610,  paid:true,  refund:false, status:"delivery",   time:"09:55 AM", ago:"31 mins ago", payment:"Razorpay", timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:4 },
  { id:"#ORD-1020", date:"2025-05-26", type:"dine",     table:"Table 06", customer:"Arjun Mehta",   phone:"+91 88001 55667", initials:"AM", color:8, items:2, itemList:["2 x Espresso"],                                            amount:240,  paid:true,  refund:false, status:"new",        time:"09:50 AM", ago:"36 mins ago", payment:"UPI",      timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:1 },
  { id:"#ORD-1019", date:"2025-05-26", type:"takeaway", table:null,        customer:"Divya Krishnan",phone:"+91 90123 45678", initials:"DK", color:9, items:6, itemList:["2 x Cappuccino","2 x Latte","1 x Brownie","1 x Muffin"],  amount:920,  paid:true,  refund:false, status:"preparing",  time:"09:44 AM", ago:"42 mins ago", payment:"Stripe",   timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:3 },
  { id:"#ORD-1018", date:"2025-05-26", type:"dine",     table:"Table 12", customer:"Sanjay Kapoor", phone:"+91 77889 00112", initials:"SK", color:0, items:3, itemList:["1 x Mocha","1 x Sandwich","1 x Tea"],                     amount:480,  paid:true,  refund:false, status:"completed",  time:"09:38 AM", ago:"48 mins ago", payment:"UPI",      timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:5 },
  { id:"#ORD-1017", date:"2025-05-26", type:"dine",     table:"Table 09", customer:"Meera Pillai",  phone:"+91 88234 56789", initials:"MP", color:1, items:2, itemList:["1 x Cold Coffee","1 x Pastry"],                           amount:320,  paid:true,  refund:false, status:"completed",  time:"09:30 AM", ago:"56 mins ago", payment:"UPI",      timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:5 },
  { id:"#ORD-1016", date:"2025-05-26", type:"takeaway", table:null,        customer:"Rajan Nair",    phone:"+91 91345 67890", initials:"RN", color:2, items:1, itemList:["1 x Americano"],                                          amount:130,  paid:false, refund:false, status:"cancelled",  time:"09:22 AM", ago:"1 hr ago",    payment:"UPI",      timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:1 },
  { id:"#ORD-1015", date:"2025-05-25", type:"dine",     table:"Table 02", customer:"Pooja Shah",    phone:"+91 99012 23456", initials:"PS", color:3, items:4, itemList:["2 x Latte","2 x Brownie"],                                amount:660,  paid:true,  refund:false, status:"completed",  time:"09:15 AM", ago:"1 hr ago",    payment:"Razorpay", timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:5 },
  { id:"#ORD-1014", date:"2025-05-25", type:"takeaway", table:null,        customer:"Kiran Bose",    phone:"+91 88567 89012", initials:"KB", color:4, items:3, itemList:["1 x Cappuccino","1 x Tea","1 x Muffin"],                  amount:370,  paid:true,  refund:false, status:"completed",  time:"09:05 AM", ago:"1 hr ago",    payment:"UPI",      timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:5 },
  { id:"#ORD-1013", date:"2025-05-25", type:"dine",     table:"Table 07", customer:"Suresh Kumar",  phone:"+91 77012 34567", initials:"SK", color:5, items:5, itemList:["2 x Mocha","1 x Sandwich","2 x Pastry"],                  amount:840,  paid:true,  refund:false, status:"completed",  time:"08:58 AM", ago:"1 hr ago",    payment:"Stripe",   timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:5 },
  { id:"#ORD-1012", date:"2025-05-25", type:"takeaway", table:null,        customer:"Anita Joshi",   phone:"+91 90234 56781", initials:"AJ", color:6, items:2, itemList:["1 x Americano","1 x Brownie"],                           amount:280,  paid:true,  refund:false, status:"completed",  time:"08:44 AM", ago:"2 hrs ago",   payment:"UPI",      timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:5 },
  { id:"#ORD-1011", date:"2025-05-24", type:"dine",     table:"Table 04", customer:"Ravi Shankar",  phone:"+91 88112 34560", initials:"RS", color:7, items:3, itemList:["1 x Latte","2 x Muffin"],                                 amount:310,  paid:true,  refund:false, status:"completed",  time:"08:30 AM", ago:"2 hrs ago",   payment:"Razorpay", timeline:["Order Placed","Confirmed","Preparing","Out for Delivery","Delivered"], tlDone:5 },
];

const TABS = [
  { key:"all",       label:"All Orders",       count:128 },
  { key:"new",       label:"New",              count:12  },
  { key:"preparing", label:"Preparing",        count:32  },
  { key:"delivery",  label:"Out for Delivery", count:18  },
  { key:"completed", label:"Completed",        count:76  },
  { key:"cancelled", label:"Cancelled",        count:2   },
];

const STATS = [
  { label:"Total Orders",     val:128, trend:"+18.6%", up:true,  icon:ShoppingBag, iconBg:"#eff6ff", iconColor:"#2563eb" },
  { label:"Preparing",        val:32,  trend:"+12.4%", up:true,  icon:ChefHat,     iconBg:"#fef3c7", iconColor:"#b45309" },
  { label:"Out for Delivery", val:18,  trend:"+8.3%",  up:true,  icon:Truck,       iconBg:"#fff7ed", iconColor:"#ea580c" },
  { label:"Completed",        val:76,  trend:"+22.1%", up:true,  icon:CheckCircle2,iconBg:"#f0fdf4", iconColor:"#16a34a" },
  { label:"Cancelled",        val:2,   trend:"-4.5%",  up:false, icon:XCircle,     iconBg:"#fef2f2", iconColor:"#dc2626" },
];

const STATUS_CFG = {
  new:       { label:"New",              cls:"mor-s-new"       },
  preparing: { label:"Preparing",        cls:"mor-s-prep"      },
  delivery:  { label:"Out for Delivery", cls:"mor-s-delivery"  },
  completed: { label:"Completed",        cls:"mor-s-completed" },
  cancelled: { label:"Cancelled",        cls:"mor-s-cancelled" },
};

const ITEMS_PER_PAGE = 8;

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y,m,d] = dateStr.split("-");
  return `${MONTHS[parseInt(m)-1].slice(0,3)} ${parseInt(d)}, ${y}`;
}

function CalendarPicker({ value, onChange, onClose }) {
  const today = new Date();
  const initDate = value ? new Date(value) : today;
  const [viewYear,  setViewYear]  = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedVal = value ? new Date(value) : null;

  return (
    <div className="mor-cal-dropdown" onClick={e => e.stopPropagation()}>
      <div className="mor-cal-header">
        <button className="mor-cal-nav" onClick={prevMonth}><ChevronLeft size={14}/></button>
        <span className="mor-cal-month">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="mor-cal-nav" onClick={nextMonth}><ChevronRight size={14}/></button>
      </div>
      <div className="mor-cal-grid-days">
        {DAYS.map(d => <span key={d} className="mor-cal-day-label">{d}</span>)}
      </div>
      <div className="mor-cal-grid">
        {cells.map((day, i) => {
          if (!day) return <span key={`e-${i}`} />;
          const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isSelected = selectedVal &&
            selectedVal.getFullYear() === viewYear &&
            selectedVal.getMonth() === viewMonth &&
            selectedVal.getDate() === day;
          const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
          return (
            <button
              key={day}
              className={`mor-cal-day ${isSelected ? "selected" : ""} ${isToday && !isSelected ? "today" : ""}`}
              onClick={() => { onChange(dateStr); onClose(); }}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mor-cal-footer">
        <button className="mor-cal-clear" onClick={() => { onChange(null); onClose(); }}>Clear</button>
        <button className="mor-cal-today" onClick={() => {
          const t = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
          onChange(t); onClose();
        }}>Today</button>
      </div>
    </div>
  );
}

const MyOrderTableTopleoPage = () => {
  const [activeTab,    setActiveTab]    = useState("all");
  const [selected,     setSelected]     = useState(null);
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [dateFilter,   setDateFilter]   = useState(null);
  const [calOpen,      setCalOpen]      = useState(false);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [filterType,   setFilterType]   = useState("all");
  const [filterPay,    setFilterPay]    = useState("all");
  const calRef    = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (calRef.current    && !calRef.current.contains(e.target))    setCalOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = useMemo(() => {
    let list = ORDERS;
    if (activeTab !== "all")  list = list.filter(o => o.status === activeTab);
    if (dateFilter)           list = list.filter(o => o.date === dateFilter);
    if (filterType !== "all") list = list.filter(o => o.type === filterType);
    if (filterPay  !== "all") list = list.filter(o => o.payment.toLowerCase() === filterPay);
    if (search.trim())        list = list.filter(o =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [activeTab, dateFilter, filterType, filterPay, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleTab = (key) => { setActiveTab(key); setPage(1); };

  const activeFiltersCount = [
    dateFilter,
    filterType !== "all" ? filterType : null,
    filterPay  !== "all" ? filterPay  : null,
  ].filter(Boolean).length;

  const clearAllFilters = () => { setDateFilter(null); setFilterType("all"); setFilterPay("all"); setSearch(""); setPage(1); };

  const renderPages = () => {
    const pages = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1,2,3);
      if (safePage > 4) pages.push("...");
      if (safePage > 3 && safePage < totalPages - 2) pages.push(safePage);
      if (safePage < totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const tl     = selected?.timeline || [];
  const tlDone = selected?.tlDone   || 0;

  const itemPrices = selected ? selected.itemList.map(item => {
    const match = item.match(/^(\d+)\s*x\s*/);
    const qty   = match ? parseInt(match[1]) : 1;
    const base  = Math.round(selected.amount / (selected.items || 1));
    return { name: item, price: qty * base };
  }) : [];

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
                <Search size={14} className="mor-search-icon" />
                <input
                  className="mor-search-input"
                  placeholder="Search by Order ID, Customer, Phone..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                <span className="mor-search-kbd">Ctrl + K</span>
              </div>

              <div className="mor-cal-wrap" ref={calRef}>
                <button
                  className={`mor-date-btn ${dateFilter ? "mor-date-btn-active" : ""}`}
                  onClick={() => { setCalOpen(o => !o); setFilterOpen(false); }}
                >
                  <Calendar size={13} />
                  {dateFilter ? formatDate(dateFilter) : "Pick Date"}
                  {dateFilter && (
                    <span className="mor-date-clear" onClick={e => { e.stopPropagation(); setDateFilter(null); setPage(1); }}>
                      <X size={11} />
                    </span>
                  )}
                </button>
                {calOpen && (
                  <CalendarPicker
                    value={dateFilter}
                    onChange={v => { setDateFilter(v); setPage(1); }}
                    onClose={() => setCalOpen(false)}
                  />
                )}
              </div>

              <div className="mor-filter-wrap" ref={filterRef}>
                <button
                  className={`mor-filter-btn ${activeFiltersCount > 0 ? "mor-filter-btn-active" : ""}`}
                  onClick={() => { setFilterOpen(o => !o); setCalOpen(false); }}
                >
                  <SlidersHorizontal size={13} /> Filters
                  {activeFiltersCount > 0 && <span className="mor-filter-count">{activeFiltersCount}</span>}
                </button>
                {filterOpen && (
                  <div className="mor-filter-dropdown" onClick={e => e.stopPropagation()}>
                    <div className="mor-fd-title">Filter Orders</div>

                    <div className="mor-fd-group">
                      <div className="mor-fd-label">Order Type</div>
                      <div className="mor-fd-pills">
                        {[["all","All"],["dine","Dine In"],["takeaway","Take Away"]].map(([v,l]) => (
                          <button key={v} className={`mor-fd-pill ${filterType===v?"active":""}`} onClick={() => { setFilterType(v); setPage(1); }}>{l}</button>
                        ))}
                      </div>
                    </div>

                    <div className="mor-fd-group">
                      <div className="mor-fd-label">Payment Method</div>
                      <div className="mor-fd-pills">
                        {[["all","All"],["upi","UPI"],["razorpay","Razorpay"],["stripe","Stripe"],["paypal","PayPal"]].map(([v,l]) => (
                          <button key={v} className={`mor-fd-pill ${filterPay===v?"active":""}`} onClick={() => { setFilterPay(v); setPage(1); }}>{l}</button>
                        ))}
                      </div>
                    </div>

                    <div className="mor-fd-actions">
                      <button className="mor-fd-clear" onClick={() => { setFilterType("all"); setFilterPay("all"); setPage(1); }}>Clear</button>
                      <button className="mor-fd-apply" onClick={() => setFilterOpen(false)}>Apply</button>
                    </div>
                  </div>
                )}
              </div>

              <button className="mor-notif-btn">
                <Bell size={15} />
                <span className="mor-notif-badge">12</span>
              </button>
            </div>
          </div>

          {(activeFiltersCount > 0 || search) && (
            <div className="mor-active-filters">
              <span className="mor-af-label">Active filters:</span>
              {dateFilter && <span className="mor-af-chip">📅 {formatDate(dateFilter)} <button onClick={() => { setDateFilter(null); setPage(1); }}><X size={10}/></button></span>}
              {filterType !== "all" && <span className="mor-af-chip">{filterType === "dine" ? "🍽️ Dine In" : "🥡 Take Away"} <button onClick={() => { setFilterType("all"); setPage(1); }}><X size={10}/></button></span>}
              {filterPay  !== "all" && <span className="mor-af-chip">💳 {filterPay} <button onClick={() => { setFilterPay("all"); setPage(1); }}><X size={10}/></button></span>}
              {search && <span className="mor-af-chip">🔍 "{search}" <button onClick={() => { setSearch(""); setPage(1); }}><X size={10}/></button></span>}
              <button className="mor-af-clear-all" onClick={clearAllFilters}>Clear all</button>
            </div>
          )}
        </div>

        <div className="mor-stats">
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div className="mor-stat-card" key={s.label}>
                <div className="mor-stat-icon" style={{ background: s.iconBg }}>
                  <Icon size={18} color={s.iconColor} />
                </div>
                <div className="mor-stat-body">
                  <div className="mor-stat-label">{s.label}</div>
                  <div className="mor-stat-val">{s.val}</div>
                  <div className={`mor-stat-trend ${s.up ? "up" : "down"}`}>
                    {s.up ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}
                    {s.trend} <span className="mor-stat-vs">vs yesterday</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mor-tabs-row">
          <div className="mor-tabs">
            {TABS.map(t => (
              <button key={t.key} className={`mor-tab ${activeTab===t.key?"active":""}`} onClick={() => handleTab(t.key)}>
                {t.label} ({t.count})
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
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign:"center", padding:"48px 20px", color:"#9ca3af", fontSize:13 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                      <Filter size={32} strokeWidth={1.2} color="#d1d5db"/>
                      <span>No orders found for selected filters</span>
                      <button className="mor-af-clear-all" onClick={clearAllFilters} style={{ marginTop:4 }}>Clear filters</button>
                    </div>
                  </td>
                </tr>
              ) : paged.map(order => {
                const sc = STATUS_CFG[order.status];
                return (
                  <tr
                    key={order.id}
                    className={`mor-tr ${selected?.id === order.id ? "selected" : ""}`}
                    onClick={() => setSelected(selected?.id === order.id ? null : order)}
                  >
                    <td className="mor-td">
                      <div className="mor-order-id">{order.id}</div>
                      <div className="mor-order-sub">Online Order</div>
                    </td>
                    <td className="mor-td">
                      <div className="mor-customer-cell">
                        <div className="mor-avatar" style={{ background: AVATAR_COLORS[order.color] }}>{order.initials}</div>
                        <div>
                          <div className="mor-cust-name">{order.customer}</div>
                          <div className="mor-cust-phone">{order.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mor-td">
                      {order.type === "dine" ? (
                        <div>
                          <span className="mor-type-badge mor-type-dine"><Utensils size={11}/> Dine In</span>
                          {order.table && <div style={{ fontSize:11, color:"#6b7280", marginTop:3 }}>{order.table}</div>}
                        </div>
                      ) : (
                        <span className="mor-type-badge mor-type-takeaway"><Package size={11}/> Take Away</span>
                      )}
                    </td>
                    <td className="mor-td">
                      <div className="mor-items-main">{order.items} Item{order.items!==1?"s":""}</div>
                      <div className="mor-items-sub">{order.itemList.slice(0,2).join(", ")}{order.itemList.length>2?"...":""}</div>
                    </td>
                    <td className="mor-td">
                      <div className="mor-amount">₹{order.amount.toLocaleString("en-IN")}.00</div>
                      {order.refund ? <div className="mor-refund">Refunded</div> : <div className="mor-paid">Paid</div>}
                    </td>
                    <td className="mor-td">
                      <span className={`mor-status-pill ${sc.cls}`}>
                        <span className="mor-dot"/>{sc.label}
                      </span>
                    </td>
                    <td className="mor-td">
                      <div className="mor-time-main">{order.time}</div>
                      <div className="mor-time-sub">{order.ago}</div>
                    </td>
                    <td className="mor-td" onClick={e => e.stopPropagation()}>
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
            <button className="mor-pg-btn" disabled={safePage===1} onClick={() => setPage(p => Math.max(1,p-1))}><ChevronLeft size={14}/></button>
            {renderPages().map((pg,i) =>
              pg==="..." ? <span key={`d${i}`} className="mor-pg-dots">...</span> :
              <button key={pg} className={`mor-pg-btn ${safePage===pg?"active":""}`} onClick={() => setPage(pg)}>{pg}</button>
            )}
            <button className="mor-pg-btn" disabled={safePage===totalPages} onClick={() => setPage(p => Math.min(totalPages,p+1))}><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="mor-right">
          <div className="mor-detail-header">
            <span className="mor-detail-title">Order Details</span>
            <button className="mor-close-btn" onClick={() => setSelected(null)}><X size={14}/></button>
          </div>

          <div className="mor-detail-body">
            <div className="mor-detail-id-row">
              <span className="mor-detail-id">{selected.id}</span>
              <span className={`mor-status-pill ${STATUS_CFG[selected.status].cls}`}>
                <span className="mor-dot"/>{STATUS_CFG[selected.status].label}
              </span>
            </div>

            <div className="mor-detail-meta">
              <div className="mor-detail-meta-row"><Calendar size={12}/> {formatDate(selected.date)} | {selected.time}</div>
              <div className="mor-detail-meta-row"><ShoppingBag size={12}/> Online Order</div>
            </div>

            <div className="mor-section-label">Customer Details</div>
            <div className="mor-cust-detail">
              <div className="mor-avatar" style={{ background: AVATAR_COLORS[selected.color], width:32, height:32, fontSize:12 }}>
                {selected.initials}
              </div>
              <div>
                <div className="mor-cust-detail-name">{selected.customer}</div>
                <div className="mor-cust-detail-phone">{selected.phone}</div>
              </div>
              <div className="mor-cust-actions">
                <button className="mor-cust-action-btn"><Phone size={12}/></button>
                <button className="mor-cust-action-btn"><MessageSquare size={12}/></button>
              </div>
            </div>

            <div className="mor-section-label">Order Type</div>
            <div className="mor-type-detail">
              {selected.type==="dine"
                ? <span className="mor-type-badge mor-type-dine"><Utensils size={11}/> Dine In</span>
                : <span className="mor-type-badge mor-type-takeaway"><Package size={11}/> Take Away</span>
              }
              {selected.table && <span className="mor-table-tag">{selected.table}</span>}
            </div>

            <div className="mor-section-label">Order Items</div>
            <div className="mor-items-detail">
              {itemPrices.map((item,i) => (
                <div key={i} className="mor-item-row">
                  <span className="mor-item-name">{item.name}</span>
                  <span className="mor-item-price">₹{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mor-totals">
              <div className="mor-total-row"><span>Subtotal</span><span className="mor-total-val">₹{selected.amount.toLocaleString("en-IN")}.00</span></div>
              <div className="mor-total-row"><span>Discount</span><span className="mor-total-val" style={{ color:"#dc2626" }}>- ₹0.00</span></div>
              <div className="mor-total-row"><span>Tax (5%)</span><span className="mor-total-val">₹0.00</span></div>
              <div className="mor-total-row main"><span>Total Amount</span><span>₹{selected.amount.toLocaleString("en-IN")}.00</span></div>
            </div>
            <div className="mor-pay-row">
              <span className="mor-pay-badge mor-pay-paid"><CheckCircle2 size={11}/> Paid</span>
              <span className="mor-pay-method"><CreditCard size={12}/> {selected.payment}</span>
            </div>

            <div className="mor-section-label">Order Timeline</div>
            <div className="mor-timeline">
              {tl.map((step,i) => {
                const done = i < tlDone;
                return (
                  <div key={step} className={`mor-tl-item ${done?"tl-done":"tl-pending"}`}>
                    <div className="mor-tl-line"/>
                    <div className="mor-tl-dot">{done && <div className="mor-tl-dot-inner"/>}</div>
                    <div className="mor-tl-content">
                      <div className="mor-tl-label">{step}</div>
                      <div className="mor-tl-time">{done ? selected.time : "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mor-detail-footer">
            <button className="mor-print-btn"><Printer size={13}/> Print Invoice</button>
            <div className="mor-update-wrap">
              <button className="mor-update-btn">Update Status</button>
              <button className="mor-update-chevron"><ChevronDown size={14}/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrderTableTopleoPage;