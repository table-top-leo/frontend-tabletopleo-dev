"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home, ShoppingBag, LayoutGrid, CreditCard, Package, Settings, LogOut,
  Bell, ChevronDown, ChevronLeft, ChevronRight, User, Menu, X,
  TrendingUp, Clock, CheckCircle2, AlertCircle, Star, Zap,
  ArrowUpRight, ArrowDownRight, Search, RefreshCw, Filter,
  MoreHorizontal, Utensils, Wallet, Users, BarChart3, ShieldCheck,
  Globe, ChefHat, Sun, Moon,
} from "lucide-react";
import { TbBusinessplan } from "react-icons/tb";
import { FaHandsHelping } from "react-icons/fa";
import "../designdashboardcomponent/designdashboard.css";
import MenuCategory from "../menucategorypage/menucategorypage";
import BusinessInformation from "../businessinformationpage/businessinformationpage";
import SettingsPage from "../ApplicationMainLayout/settingspage";
import HelpDeskPage from "../ApplicationMainLayout/helpdesk";
import PaymentSetup from "../tabletopleopaymentsconfiguration/upisetups"

const NAV_ITEMS = [
  { id:"Home",                 label:"Home",                 icon:Home },
  { id:"Orders",               label:"Orders",               icon:ShoppingBag },
  { id:"Business Information", label:"Business Information", icon:TbBusinessplan },
  { id:"Menu & Category",      label:"Menu & Category",      icon:LayoutGrid },
  { id:"Payment Setup",        label:"Payment Setup",        icon:CreditCard },
  { id:"Inventory Info",       label:"Inventory Info",       icon:Package },
  { id:"Settings",             label:"Settings",             icon:Settings },
  { id:"Help Desk",            label:"Help Desk",            icon:FaHandsHelping },
];

const MENU_CONTENT = {
  Home:                  { icon:ChefHat,       color:"#7c3aed", bg:"#ede9fe", title:"Something Delicious",  accent:"is Coming Soon!", desc:"We're building something powerful for your restaurant.",         tag:"🚀 Exciting things ahead" },
  Orders:                { icon:ShoppingBag,   color:"#0369a1", bg:"#e0f2fe", title:"Orders Module",         accent:"Coming Soon!",    desc:"Track live orders, manage delivery status and review history.",  tag:"📦 Order management system" },
  "Business Information":{ icon:TbBusinessplan,color:"#0369a1", bg:"#e0f2fe", title:"Business Information",  accent:"",               desc:"",                                                               tag:"" },
  "Menu & Category":     { icon:LayoutGrid,    color:"#b45309", bg:"#fef3c7", title:"Menu Management",       accent:"Coming Soon!",    desc:"Build rich menus, organise categories and set prices.",         tag:"🍽️ Menu builder & categories" },
  "Payment Setup":       { icon:CreditCard,    color:"#065f46", bg:"#d1fae5", title:"Payment Module",        accent:"Coming Soon!",    desc:"Accept UPI, cards and wallets. Configure payout cycles.",       tag:"💳 Secure payment gateway" },
  "Inventory Info":      { icon:Package,       color:"#7c2d12", bg:"#ffedd5", title:"Inventory Module",      accent:"Coming Soon!",    desc:"Monitor stock levels, get low-inventory alerts.",               tag:"📊 Stock & supply management" },
  Settings:              { icon:Settings,      color:"#1e3a5f", bg:"#dbeafe", title:"Settings Module",       accent:"Coming Soon!",    desc:"Configure profile, manage team roles and permissions.",         tag:"⚙️ System configuration" },
  "Help Desk":           { icon:FaHandsHelping,color:"#0f766e", bg:"#ccfbf1", title:"Help Desk",             accent:"Coming Soon!",    desc:"Get support, FAQs, contact admin, and submit tickets.",        tag:"🛟 Support & Help Center" },
};

const PAGE_COMPONENTS = {
  "Menu & Category":      MenuCategory,
  "Business Information": BusinessInformation,
  "Settings":             SettingsPage,
  "Help Desk":            HelpDeskPage,
  "Payment Setup":        PaymentSetup,
};

const STAT_CARDS = [
  { label:"Today's Revenue", value:"₹24,580", change:"+12.4%", up:true,  icon:Wallet,     color:"#7c3aed", bg:"#ede9fe" },
  { label:"Total Orders",    value:"348",     change:"+8.1%",  up:true,  icon:ShoppingBag,color:"#0369a1", bg:"#e0f2fe" },
  { label:"Avg. Rating",     value:"4.7★",   change:"+0.2",   up:true,  icon:Star,       color:"#b45309", bg:"#fef3c7" },
  { label:"Active Tables",   value:"18/24",   change:"-2 from peak",up:false,icon:Users,  color:"#065f46", bg:"#d1fae5" },
];

const RECENT_ORDERS = [
  { id:"#ORD-2841", item:"Butter Chicken + Naan", table:"Table 4",  time:"2 min ago",  status:"new",       amount:"₹480" },
  { id:"#ORD-2840", item:"Veg Thali × 2",         table:"Table 7",  time:"8 min ago",  status:"preparing", amount:"₹360" },
  { id:"#ORD-2839", item:"Paneer Tikka + Lassi",  table:"Delivery", time:"14 min ago", status:"ready",     amount:"₹290" },
  { id:"#ORD-2838", item:"Masala Dosa × 3",        table:"Table 2",  time:"22 min ago", status:"delivered", amount:"₹210" },
  { id:"#ORD-2837", item:"Biryani Family Pack",    table:"Table 11", time:"31 min ago", status:"delivered", amount:"₹850" },
];

const TOP_ITEMS = [
  { name:"Butter Chicken", orders:84, pct:92 },
  { name:"Veg Biryani",    orders:71, pct:78 },
  { name:"Paneer Tikka",   orders:58, pct:63 },
  { name:"Masala Dosa",    orders:46, pct:50 },
  { name:"Gulab Jamun",    orders:39, pct:42 },
];

const STATUS_MAP = {
  new:       { label:"New",       cls:"status-new" },
  preparing: { label:"Preparing", cls:"status-preparing" },
  ready:     { label:"Ready",     cls:"status-ready" },
  delivered: { label:"Delivered", cls:"status-delivered" },
};

function getInitials(name) {
  if (!name) return "AD";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const MainAdminDashboard = () => {
  const router = useRouter();
  const [active,       setActive]       = useState("Home");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [collapsed,    setCollapsed]    = useState(false);
  const [searchVal,    setSearchVal]    = useState("");
  const [isDark,       setIsDark]       = useState(false);
  const [user,         setUser]         = useState(null);
  const dropRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("ttl_user");
    const token  = localStorage.getItem("ttl_token");
    if (!stored || !token) { router.push("/logintabletopleo"); return; }
    try { setUser(JSON.parse(stored)); } catch { router.push("/logintabletopleo"); }
  }, []);

  useEffect(() => {
    const fn = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem("ttl_token");
    localStorage.removeItem("ttl_user");
    router.push("/logintabletopleo");
  };

  const handleNav = (id) => { setActive(id); setSidebarOpen(false); };

  const content     = MENU_CONTENT[active];
  const ContentIcon = content.icon;
  const ActivePage  = PAGE_COMPONENTS[active];
  const isHome      = active === "Home";
  const initials    = getInitials(user?.fullName);
  const firstName   = user?.fullName?.split(" ")[0] || "Admin";

  return (
    <div className="ad-root">
      {sidebarOpen && <div className="ad-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <aside className={`ad-sidebar ${sidebarOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}>

        {/* Logo */}
        <div className="ad-sidebar-logo">
          <div className="ad-logo-mark">
            <Utensils size={16} color="#fff" />
          </div>
          <span className="ad-logo-name">TableTop</span>

          {/* Collapse toggle — desktop only */}
          <button
            className="ad-collapse-btn"
            onClick={() => setCollapsed(v => !v)}
            type="button"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <ChevronRight size={13} />
              : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Admin card */}
        <div className="ad-sidebar-admin">
          <div className="ad-admin-av">{initials}</div>
          <div className="ad-admin-info">
            <div className="ad-admin-name">{user?.fullName || "Admin"}</div>
            <div className="ad-admin-role">Administrator</div>
          </div>
        </div>

        <div className="ad-sidebar-divider" />

        {/* Nav */}
        <nav className="ad-nav">
          <ul>
            {NAV_ITEMS.map(({ id, label, icon:Icon }) => (
              <li key={id}>
                <a
                  href="#"
                  className={`ad-nav-btn ${active === id ? "ad-nav-active" : ""}`}
                  onClick={e => { e.preventDefault(); handleNav(id); }}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={17} />
                  <span className="ad-nav-label">{label}</span>
                  {active === id && !collapsed && <div className="ad-nav-dot" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="ad-sidebar-bottom">
          <button
            className="ad-logout-btn"
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut size={16} />
            <span className="ad-logout-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── BODY ── */}
      <div className="ad-body">
        {/* Top Bar */}
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} type="button">
              <Menu size={20} />
            </button>
            <div className="ad-search-wrap">
              <Search size={14} className="ad-search-icon" />
              <input
                className="ad-search"
                placeholder="Search orders, items..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
              />
            </div>
          </div>

          <div className="ad-topbar-right">
            <div className="ad-live-badge"><span className="ad-live-dot" /> Live</div>

            <button className="ad-icon-btn" type="button" aria-label="Notifications">
              <Bell size={17} />
            </button>

            <button className="ad-icon-btn" onClick={() => setIsDark(!isDark)} type="button" aria-label="Toggle theme">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="ad-profile-wrap" ref={dropRef}>
              <button className="ad-profile-btn" onClick={() => setDropdownOpen(s => !s)} type="button">
                <div className="ad-profile-av">{initials}</div>
                <div className="ad-profile-text">
                  <span className="ad-profile-name">{user?.fullName || "Admin"}</span>
                  <span className="ad-profile-role">Admin</span>
                </div>
                <ChevronDown size={14} className={`ad-chevron ${dropdownOpen ? "rotated" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="ad-dropdown">
                  <div className="ad-dd-head">
                    <div className="ad-dd-av">{initials}</div>
                    <div>
                      <div className="ad-dd-name">{user?.fullName || "Admin"}</div>
                      <div className="ad-dd-email">{user?.email || ""}</div>
                      {user?.adminId && (
                        <div style={{ fontSize:11, color:"#a1a1aa", marginTop:2, fontFamily:"monospace" }}>
                          {user.adminId}
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="ad-dd-item" type="button"><User size={14} /> User Profile</button>
                  <button className="ad-dd-item" type="button" onClick={() => { handleNav("Settings"); setDropdownOpen(false); }}>
                    <Settings size={14} /> Settings
                  </button>
                  <button className="ad-dd-item" type="button" onClick={() => { handleNav("Help Desk"); setDropdownOpen(false); }}>
                    <Globe size={14} /> Help Center
                  </button>
                  <div className="ad-dd-div" />
                  <button className="ad-dd-item ad-dd-logout" type="button" onClick={handleLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="ad-content">
          {isHome ? (
            <>
              <div className="ad-welcome-row">
                <div>
                  <div className="ad-page-title">{getGreeting()}, {firstName} 👋</div>
                  <div className="ad-page-sub">Here&apos;s what&apos;s happening at your restaurant today.</div>
                </div>
                <div className="ad-header-actions">
                  <button className="ad-btn-secondary" type="button"><RefreshCw size={14} /> Refresh</button>
                  <button className="ad-btn-primary" type="button"><Filter size={14} /> Filter</button>
                </div>
              </div>

              <div className="ad-stat-grid">
                {STAT_CARDS.map(s => {
                  const Icon = s.icon;
                  return (
                    <div className="ad-stat-card" key={s.label}>
                      <div className="ad-stat-top">
                        <div className="ad-stat-icon-wrap" style={{ background:s.bg }}>
                          <Icon size={17} color={s.color} />
                        </div>
                        <span className={`ad-stat-change ${s.up ? "up" : "down"}`}>
                          {s.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{s.change}
                        </span>
                      </div>
                      <div className="ad-stat-value">{s.value}</div>
                      <div className="ad-stat-label">{s.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="ad-grid-2">
                <div className="ad-panel">
                  <div className="ad-panel-head">
                    <div className="ad-panel-title">Recent Orders</div>
                    <div className="ad-panel-actions">
                      <span className="ad-live-pill"><span className="ad-live-dot" />Live</span>
                      <button className="ad-text-btn" type="button">View all</button>
                    </div>
                  </div>
                  <div className="ad-orders-list">
                    {RECENT_ORDERS.map(o => {
                      const st = STATUS_MAP[o.status];
                      return (
                        <div className="ad-order-row" key={o.id}>
                          <div className="ad-order-left">
                            <div className="ad-order-id">{o.id}</div>
                            <div className="ad-order-item">{o.item}</div>
                            <div className="ad-order-meta"><Clock size={11} /> {o.time} · {o.table}</div>
                          </div>
                          <div className="ad-order-right">
                            <div className="ad-order-amount">{o.amount}</div>
                            <span className={`ad-status-pill ${st.cls}`}>{st.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="ad-panel">
                  <div className="ad-panel-head">
                    <div className="ad-panel-title">Top Selling Items</div>
                    <button className="ad-text-btn" type="button"><MoreHorizontal size={15} /></button>
                  </div>
                  <div className="ad-top-items">
                    {TOP_ITEMS.map((item, i) => (
                      <div className="ad-top-item" key={item.name}>
                        <div className="ad-top-rank">{i + 1}</div>
                        <div className="ad-top-info">
                          <div className="ad-top-name">{item.name}</div>
                          <div className="ad-top-bar-wrap">
                            <div className="ad-top-bar">
                              <div className="ad-top-bar-fill" style={{ width:`${item.pct}%` }} />
                            </div>
                            <span className="ad-top-orders">{item.orders} orders</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="ad-quick-stats">
                    <div className="ad-qs-item"><CheckCircle2 size={15} color="#16a34a" /><span>156 delivered</span></div>
                    <div className="ad-qs-item"><Zap size={15} color="#b45309" /><span>12 preparing</span></div>
                    <div className="ad-qs-item"><AlertCircle size={15} color="#dc2626" /><span>2 issues</span></div>
                    <div className="ad-qs-item"><TrendingUp size={15} color="#7c3aed" /><span>↑ 8% week</span></div>
                  </div>
                </div>
              </div>

              <div className="ad-bottom-row">
                <div className="ad-panel ad-perf-panel">
                  <div className="ad-panel-head">
                    <div className="ad-panel-title">Performance Overview</div>
                    <div className="ad-tab-group">
                      <button className="ad-tab active" type="button">Today</button>
                      <button className="ad-tab" type="button">Week</button>
                      <button className="ad-tab" type="button">Month</button>
                    </div>
                  </div>
                  <div className="ad-perf-bars">
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
                      const heights = [55,70,45,82,90,100,65];
                      const isToday = i === 6;
                      return (
                        <div className="ad-perf-col" key={d}>
                          <div className="ad-perf-bar-wrap">
                            <div className={`ad-perf-bar ${isToday ? "today" : ""}`}
                              style={{ height:`${heights[i]}%` }} />
                          </div>
                          <div className={`ad-perf-day ${isToday ? "today" : ""}`}>{d}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="ad-panel ad-info-panel">
                  <div className="ad-panel-head">
                    <div className="ad-panel-title">Restaurant Health</div>
                    <span className="ad-health-badge">Good</span>
                  </div>
                  <div className="ad-health-list">
                    {[
                      { icon:ShieldCheck, label:"Payment Gateway", val:"Active",      ok:true },
                      { icon:Globe,       label:"Online Visibility",val:"Live",       ok:true },
                      { icon:BarChart3,   label:"Analytics",        val:"Synced",     ok:true },
                      { icon:AlertCircle, label:"Stock Alerts",     val:"2 low items",ok:false },
                    ].map(({ icon:Icon, label, val, ok }) => (
                      <div className="ad-health-row" key={label}>
                        <div className="ad-health-left">
                          <Icon size={15} color={ok ? "#16a34a" : "#dc2626"} />
                          <span className="ad-health-label">{label}</span>
                        </div>
                        <span className={`ad-health-val ${ok ? "ok" : "warn"}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            ActivePage ? (
              <ActivePage />
            ) : (
              <div className="ad-coming-soon">
                <div className="ad-cs-inner">
                  <div className="ad-cs-icon-wrap" style={{ background:content.bg }}>
                    <ContentIcon size={32} color={content.color} />
                  </div>
                  <div className="ad-cs-tag">{content.tag}</div>
                  <h2 className="ad-cs-title">
                    {content.title}{" "}
                    <span className="ad-cs-accent" style={{ color:content.color }}>{content.accent}</span>
                  </h2>
                  <p className="ad-cs-desc">{content.desc}</p>
                  <div className="ad-cs-actions">
                    <button className="ad-btn-primary" type="button"><Bell size={15} /> Notify Me</button>
                    <button className="ad-btn-secondary" type="button" onClick={() => setActive("Home")}>
                      ← Back to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default MainAdminDashboard;