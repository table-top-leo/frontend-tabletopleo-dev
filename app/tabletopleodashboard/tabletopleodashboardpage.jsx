"use client";
import { useState, useRef, useEffect } from "react";
import { Home, ShoppingBag, LayoutGrid, CreditCard, Package, Settings, LogOut, Bell, ChevronDown, User, Menu, X, TrendingUp, Clock, CheckCircle2, AlertCircle, Star, Zap, ArrowUpRight, ArrowDownRight, Search, RefreshCw, Filter, MoreHorizontal, Utensils, Wallet, Users, BarChart3, ShieldCheck, Globe, ChefHat, Sun, Moon } from "lucide-react";
import { TbBusinessplan } from "react-icons/tb";
import { FaHandsHelping } from "react-icons/fa";
import '../designdashboardcomponent/designdashboard.css'
import MenuCategory from "../menucategorypage/menucategorypage";
import BusinessInformation from '../businessinformationpage/businessinformationpage'

const NAV_ITEMS = [
  { id: "Home", label: "Home", icon: Home },
  { id: "Orders", label: "Orders", icon: ShoppingBag },
  { id: "Business Information", label: "Business Information", icon: TbBusinessplan },
  { id: "Menu & Category", label: "Menu & Category", icon: LayoutGrid },
  { id: "Payment Setup", label: "Payment Setup", icon: CreditCard },
  { id: "Inventory Info", label: "Inventory Info", icon: Package },
  { id: "Settings", label: "Settings", icon: Settings },
  { id: "Help Desk", label: "Help Desk", icon: FaHandsHelping },
];

const MENU_CONTENT = {
  Home: { icon: ChefHat, color: "#6d28d9", bg: "#ede9fe", title: "Something Delicious", accent: "is Coming Soon!", desc: "We're building something powerful for your restaurant. Stay tuned — your full dashboard is on the way.", tag: "🚀 Exciting things ahead" },
  Orders: { icon: ShoppingBag, color: "#0369a1", bg: "#e0f2fe", title: "Orders Module", accent: "Coming Soon!", desc: "Track live orders, manage delivery status and review order history — all in one place. Launching very soon.", tag: "📦 Order management system" },
  "Business Information": { icon: TbBusinessplan, color: "#0369a1", bg: "#e0f2fe", title: "Business Information", accent: "Coming Soon!", desc: "Find your Business Information here.", tag: "📦 Business Information" },
  "Menu & Category": { icon: LayoutGrid, color: "#b45309", bg: "#fef3c7", title: "Menu Management", accent: "Coming Soon!", desc: "Build rich menus, organise categories, set prices and upload photos. Your perfect menu builder is being crafted.", tag: "🍽️ Menu builder & categories" },
  "Payment Setup": { icon: CreditCard, color: "#065f46", bg: "#d1fae5", title: "Payment Module", accent: "Coming Soon!", desc: "Accept UPI, cards and wallets. Configure payout cycles and view transaction reports with complete transparency.", tag: "💳 Secure payment gateway" },
  "Inventory Info": { icon: Package, color: "#7c2d12", bg: "#ffedd5", title: "Inventory Module", accent: "Coming Soon!", desc: "Monitor stock levels, get low-inventory alerts and manage your suppliers without any spreadsheet chaos.", tag: "📊 Stock & supply management" },
  Settings: { icon: Settings, color: "#1e3a5f", bg: "#dbeafe", title: "Settings Module", accent: "Coming Soon!", desc: "Configure your restaurant profile, manage team roles, permissions and notification preferences easily.", tag: "⚙️ System configuration" },
"Help Desk": { 
    icon: FaHandsHelping, 
    color: "#0f766e", 
    bg: "#ccfbf1", 
    title: "Help Desk", 
    accent: "Coming Soon!", 
    desc: "Get support, FAQs, contact admin, and submit tickets.", 
    tag: "🛟 Support & Help Center" 
  },
};

const PAGE_COMPONENTS = {
  "Menu & Category": MenuCategory,
  "Business Information": BusinessInformation,
};

const STAT_CARDS = [
  { label: "Today's Revenue", value: "₹24,580", change: "+12.4%", up: true, icon: Wallet, color: "#6d28d9", bg: "#ede9fe" },
  { label: "Total Orders", value: "348", change: "+8.1%", up: true, icon: ShoppingBag, color: "#0369a1", bg: "#e0f2fe" },
  { label: "Avg. Rating", value: "4.7★", change: "+0.2", up: true, icon: Star, color: "#b45309", bg: "#fef3c7" },
  { label: "Active Tables", value: "18/24", change: "-2 from peak", up: false, icon: Users, color: "#065f46", bg: "#d1fae5" },
];

const RECENT_ORDERS = [
  { id: "#ORD-2841", item: "Butter Chicken + Naan", table: "Table 4", time: "2 min ago", status: "new", amount: "₹480" },
  { id: "#ORD-2840", item: "Veg Thali × 2", table: "Table 7", time: "8 min ago", status: "preparing", amount: "₹360" },
  { id: "#ORD-2839", item: "Paneer Tikka + Lassi", table: "Delivery", time: "14 min ago", status: "ready", amount: "₹290" },
  { id: "#ORD-2838", item: "Masala Dosa × 3", table: "Table 2", time: "22 min ago", status: "delivered", amount: "₹210" },
  { id: "#ORD-2837", item: "Biryani Family Pack", table: "Table 11", time: "31 min ago", status: "delivered", amount: "₹850" },
];

const TOP_ITEMS = [
  { name: "Butter Chicken", orders: 84, pct: 92 },
  { name: "Veg Biryani", orders: 71, pct: 78 },
  { name: "Paneer Tikka", orders: 58, pct: 63 },
  { name: "Masala Dosa", orders: 46, pct: 50 },
  { name: "Gulab Jamun", orders: 39, pct: 42 },
];

const STATUS_MAP = {
  new: { label: "New", cls: "status-new" },
  preparing: { label: "Preparing", cls: "status-preparing" },
  ready: { label: "Ready", cls: "status-ready" },
  delivered: { label: "Delivered", cls: "status-delivered" },
};

const MainAdminDashboard = () => {
  const [active, setActive] = useState("Home");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [isDark, setIsDark] = useState(false);
  const dropRef = useRef(null);

  const content = MENU_CONTENT[active];
  const ContentIcon = content.icon;
  const ActivePage = PAGE_COMPONENTS[active];

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleNav = (id) => {
    setActive(id);
    setSidebarOpen(false);
  };

  const isHome = active === "Home";

  return (
    <div className="ad-root">
      {sidebarOpen && <div className="ad-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`ad-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ad-sidebar-logo">
          <div className="ad-logo-mark">
            <Utensils size={16} color="#fff" />
          </div>
          <span className="ad-logo-name">TableTop</span>
          <button className="ad-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="ad-nav">
          <ul>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <a
                  href="#"
                  className={`ad-nav-btn ${active === id ? "ad-nav-active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(id);
                  }}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  {active === id && <div className="ad-nav-dot" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ad-sidebar-bottom">
          <div className="ad-restaurant-card">
            <div className="ad-rc-avatar">R</div>
            <div className="ad-rc-info">
              <div className="ad-rc-name">Liyaqath Leo</div>
              <div className="ad-rc-status">
                <span className="ad-rc-dot" /> Live
              </div>
            </div>
            <div className="ad-rc-badge">Pro</div>
          </div>
          <button className="ad-logout-btn" type="button">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="ad-body">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu" type="button">
              <Menu size={20} />
            </button>
            <div className="ad-search-wrap">
              <Search size={14} className="ad-search-icon" />
              <input
                className="ad-search"
                placeholder="Search orders, items..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
            </div>
          </div>

          <div className="ad-topbar-right">
            <div className="ad-live-badge">
              <span className="ad-live-dot" />
              Live
            </div>

            <button className="ad-icon-btn" aria-label="Notifications" type="button">
              <Bell size={17} />
            </button>

            <button
              className="ad-icon-btn"
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle theme"
              type="button"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="ad-profile-wrap" ref={dropRef}>
              <button
                className="ad-profile-btn"
                onClick={() => setDropdownOpen((s) => !s)}
                type="button"
              >
                <div className="ad-profile-av">LZ</div>
                <div className="ad-profile-text">
                  <span className="ad-profile-name">Liyaqath</span>
                  <span className="ad-profile-role">Admin</span>
                </div>
                <ChevronDown size={14} className={`ad-chevron ${dropdownOpen ? "rotated" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="ad-dropdown">
                  <div className="ad-dd-head">
                    <div className="ad-dd-av">LZ</div>
                    <div>
                      <div className="ad-dd-name">Liyaqath</div>
                      <div className="ad-dd-email">liyaqath@tabletop.in</div>
                    </div>
                  </div>
                  <div className="ad-dd-div" />
                  <button className="ad-dd-item" type="button"><User size={14} /> User Profile</button>
                  <button className="ad-dd-item" type="button"><Settings size={14} /> Settings</button>
                  <button className="ad-dd-item" type="button"><Globe size={14} /> Help Center</button>
                  <div className="ad-dd-div" />
                  <button className="ad-dd-item ad-dd-logout" type="button"><LogOut size={14} /> Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ad-content">
          {isHome ? (
            <>
              <div className="ad-welcome-row">
                <div>
                  <div className="ad-page-title">Good morning, Liyaqath 👋</div>
                  <div className="ad-page-sub">Here's what's happening at your restaurant today.</div>
                </div>
                <div className="ad-header-actions">
                  <button className="ad-btn-secondary" type="button"><RefreshCw size={14} /> Refresh</button>
                  <button className="ad-btn-primary" type="button"><Filter size={14} /> Filter</button>
                </div>
              </div>

              <div className="ad-stat-grid">
                {STAT_CARDS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div className="ad-stat-card" key={s.label}>
                      <div className="ad-stat-top">
                        <div className="ad-stat-icon-wrap" style={{ background: s.bg }}>
                          <Icon size={17} color={s.color} />
                        </div>
                        <span className={`ad-stat-change ${s.up ? "up" : "down"}`}>
                          {s.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                          {s.change}
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
                    {RECENT_ORDERS.map((o) => {
                      const st = STATUS_MAP[o.status];
                      return (
                        <div className="ad-order-row" key={o.id}>
                          <div className="ad-order-left">
                            <div className="ad-order-id">{o.id}</div>
                            <div className="ad-order-item">{o.item}</div>
                            <div className="ad-order-meta">
                              <Clock size={11} /> {o.time} · {o.table}
                            </div>
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
                              <div className="ad-top-bar-fill" style={{ width: `${item.pct}%` }} />
                            </div>
                            <span className="ad-top-orders">{item.orders} orders</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ad-quick-stats">
                    <div className="ad-qs-item">
                      <CheckCircle2 size={15} color="#16a34a" />
                      <span>156 delivered</span>
                    </div>
                    <div className="ad-qs-item">
                      <Zap size={15} color="#b45309" />
                      <span>12 preparing</span>
                    </div>
                    <div className="ad-qs-item">
                      <AlertCircle size={15} color="#dc2626" />
                      <span>2 issues</span>
                    </div>
                    <div className="ad-qs-item">
                      <TrendingUp size={15} color="#6d28d9" />
                      <span>↑ 8% week</span>
                    </div>
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
                      const heights = [55, 70, 45, 82, 90, 100, 65];
                      const isToday = i === 6;
                      return (
                        <div className="ad-perf-col" key={d}>
                          <div className="ad-perf-bar-wrap">
                            <div
                              className={`ad-perf-bar ${isToday ? "today" : ""}`}
                              style={{ height: `${heights[i]}%` }}
                            />
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
                      { icon: ShieldCheck, label: "Payment Gateway", val: "Active", ok: true },
                      { icon: Globe, label: "Online Visibility", val: "Live", ok: true },
                      { icon: BarChart3, label: "Analytics", val: "Synced", ok: true },
                      { icon: AlertCircle, label: "Stock Alerts", val: "2 low items", ok: false },
                    ].map(({ icon: Icon, label, val, ok }) => (
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
            <>
              {ActivePage ? (
                <ActivePage />
              ) : (
                <div className="ad-coming-soon">
                  <div className="ad-cs-inner">
                    <div className="ad-cs-icon-wrap" style={{ background: content.bg }}>
                      <ContentIcon size={32} color={content.color} />
                    </div>
                    <div className="ad-cs-tag">{content.tag}</div>
                    <h2 className="ad-cs-title">
                      {content.title}{" "}
                      <span className="ad-cs-accent" style={{ color: content.color }}>
                        {content.accent}
                      </span>
                    </h2>
                    <p className="ad-cs-desc">{content.desc}</p>
                    <div className="ad-cs-actions">
                      <button className="ad-btn-primary" type="button">
                        <Bell size={15} /> Notify Me
                      </button>
                      <button className="ad-btn-secondary" type="button" onClick={() => setActive("Home")}>
                        ← Back to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MainAdminDashboard;