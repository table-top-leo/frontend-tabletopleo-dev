'use client'
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, ChevronDown,
  Home, ShoppingCart, Settings2, Package, HelpCircle,
  CreditCard, FileText, BarChart2, Grid, MoreHorizontal,
  Search, LayoutGrid, Bell, Settings,
  User, LogOut, Moon, Sun, MessageSquare, Rocket,
  Building2, UtensilsCrossed, Wallet, CheckCircle,
  X, Pencil, RotateCcw, PlusCircle, ChevronRight as ChevRight,
  ClipboardList
} from 'lucide-react';
import '../tabletopleodashboard/adminagedummydesign.css';

import MenuCategory        from '../menucategorypage/menucategorypage';
import BusinessInformation from '../businessinformationpage/businessinformationpage';
import SettingsPage        from '../ApplicationMainLayout/settingspage';
import HelpDeskPage        from '../ApplicationMainLayout/helpdesk';
import PaymentSetup        from '../tabletopleopaymentsconfiguration/upisetups';

const PAGE_COMPONENTS = {
  'menu-category':  MenuCategory,
  'business-info':  BusinessInformation,
  'settings':       SettingsPage,
  'help-desk':      HelpDeskPage,
  'payment-setup':  PaymentSetup,
};

const MENU_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  {
    id: 'admin-setup',
    label: 'Admin Setup',
    icon: Settings2,
    children: [
      { id: 'business-info', label: 'Business Information', icon: Building2 },
      { id: 'menu-category', label: 'Menu & Category', icon: UtensilsCrossed },
      { id: 'payment-setup', label: 'Payment Setup', icon: Wallet },
    ],
  },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'help-desk', label: 'Help Desk', icon: HelpCircle },
];

const PRODUCT_ITEMS = [
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'billing', label: 'Billing', icon: FileText },
  { id: 'reporting', label: 'Reporting', icon: BarChart2 },
  { id: 'apps', label: 'Apps', icon: Grid },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

const AdminDashboardNew = () => {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [activeMenu, setActiveMenu] = useState('home');
  const [adminOpen, setAdminOpen] = useState(false);
  const [recVisible, setRecVisible] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ttl_token');
    localStorage.removeItem('ttl_user');
    router.push('/logintabletopleo');
  };

  const handleMenuClick = (id, hasChildren) => {
    if (hasChildren) {
      setAdminOpen((o) => !o);
      setActiveMenu(id);
      return;
    }
    setActiveMenu(id);
  };

  const menuLabel = (id) => {
    for (const m of [...MENU_ITEMS, ...PRODUCT_ITEMS]) {
      if (m.id === id) return m.label;
      if (m.children) for (const c of m.children) if (c.id === id) return c.label;
    }
    return id;
  };

  const renderContent = () => {
    const ActivePage = PAGE_COMPONENTS[activeMenu];
    if (ActivePage) return <ActivePage />;

    if (activeMenu === 'home') {
      return (
        <>
          <h1 className="afd-page-title">Good Morning</h1>

          <div className="afd-chart-card">
            <div className="afd-metrics-row">
              <div>
                <div className="afd-metric__label">Gross volume <ChevronDown size={12} /></div>
                <div className="afd-metric__value">0.00kr</div>
                <div className="afd-metric__time">11:33 PM</div>
              </div>
              <div>
                <div className="afd-metric__label">Yesterday <ChevronDown size={12} /></div>
                <div className="afd-metric__value">0.00kr</div>
              </div>
            </div>

            <div className="afd-chart-wrap">
              <svg viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path d="M0 88 L1000 88" stroke="#635bff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <circle cx="1000" cy="88" r="5" fill="#635bff"/>
              </svg>
            </div>
            <div className="afd-chart-times">
              <span>12:00 AM</span>
              <span>12:00 AM</span>
            </div>

            <div className="afd-balance-row">
              <div className="afd-balance-col">
                <div className="afd-balance-hd">
                  <span className="afd-balance-label">DKK balance</span>
                  <button className="afd-balance-link">View</button>
                </div>
                <div className="afd-balance-amount">0.00kr</div>
              </div>
              <div className="afd-balance-col">
                <div className="afd-balance-hd">
                  <span className="afd-balance-label">Payouts</span>
                  <button className="afd-balance-link">View</button>
                </div>
                <div className="afd-balance-dash">—</div>
              </div>
            </div>
          </div>

          <div className="afd-grid">
            <div className="afd-overview-card">
              <h2>Your overview</h2>
              <div className="afd-overview-controls">
                <div className="afd-overview-filters">
                  <button className="afd-btn-pill">Date range</button>
                  <button className="afd-btn-pill">Last 7 days <ChevronDown size={10} /></button>
                  <button className="afd-btn-pill">Daily <ChevronDown size={10} /></button>
                  <button className="afd-btn-pill"><RotateCcw size={12} /> Compare</button>
                  <button className="afd-btn-pill">Previous period <ChevronDown size={10} /></button>
                </div>
                <div className="afd-overview-actions">
                  <button className="afd-btn-pill"><PlusCircle size={12} /> Add</button>
                  <button className="afd-btn-pill"><Pencil size={12} /> Edit</button>
                </div>
              </div>
              <div className="afd-empty-chart">No data to display for this period</div>
            </div>

            <div className="afd-right-panel">
              {recVisible && (
                <div className="afd-card">
                  <div className="afd-card__hd">
                    <span className="afd-card__title">Recommendations</span>
                    <button className="afd-card__close" onClick={() => setRecVisible(false)}><X size={13} /></button>
                  </div>
                  <div className="afd-rec-item">
                    <p>Sell products, offer subscriptions, and collect tips or donations by creating a link—no code required.</p>
                    <a href="#">Create payment link</a>
                  </div>
                  <div className="afd-rec-divider" />
                  <div className="afd-rec-item">
                    <p>Offer subscriptions to drive predictable recurring revenue streams.</p>
                    <a href="#">Create a subscription</a>
                  </div>
                </div>
              )}

              <div className="afd-card">
                <div className="afd-apikeys-hd">
                  <span>API keys</span>
                  <a href="#">View docs</a>
                </div>
                <div className="afd-key-row">
                  <span className="afd-key-label">Publishable key</span>
                  <span className="afd-key-val">pk_test_51TnN162KHtN...</span>
                </div>
                <div className="afd-key-row">
                  <span className="afd-key-label">Secret key</span>
                  <span className="afd-key-val">sk_test_51TnN162KHtN...</span>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="afd-coming-soon-page">
        <div className="afd-coming-soon-icon">
          <Rocket size={48} />
        </div>
        <h2>{menuLabel(activeMenu)}</h2>
        <p>This feature is under construction.</p>
        <p>We're working hard to bring it to you soon!</p>
      </div>
    );
  };

  return (
    <div className="afd-root" data-afd-theme={dark ? 'dark' : 'light'}>
      <div className="afd-body">
        <aside className={`afd-sidebar${collapsed ? ' collapsed' : ''}`}>
          <div className="afd-sidebar__header">
            {!collapsed && (
              <div className="afd-sidebar__brand">
                <span className="afd-sidebar__brand-name">TableTopLeo</span>
              </div>
            )}
            <button className="afd-collapse-btn" onClick={() => setCollapsed((c) => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          <nav className="afd-sidebar__nav">
            {MENU_ITEMS.map(({ id, label, icon: Icon, children }) => (
              <div key={id}>
                <button
                  className={`afd-sidebar__item${activeMenu === id || (children && children.some(c => c.id === activeMenu)) ? ' afd-sidebar__item--active' : ''}`}
                  onClick={() => handleMenuClick(id, !!children)}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={17} />
                  <span className="afd-item-label">{label}</span>
                  {children && (
                    <span className="afd-item-chev">
                      {adminOpen ? <ChevronDown size={13} /> : <ChevRight size={13} />}
                    </span>
                  )}
                </button>
                {children && (
                  <div className={`afd-sidebar__dropdown${adminOpen ? ' open' : ''}`}>
                    {children.map(({ id: cid, label: clabel, icon: CIcon }) => (
                      <button
                        key={cid}
                        className={`afd-sidebar__sub-item${activeMenu === cid ? ' afd-sidebar__item--active' : ''}`}
                        onClick={() => setActiveMenu(cid)}
                      >
                        <CIcon size={14} />
                        {clabel}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="afd-sidebar__divider" />
            <div className="afd-sidebar__section-label">Products</div>

            {PRODUCT_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`afd-sidebar__item${activeMenu === id ? ' afd-sidebar__item--active' : ''}`}
                onClick={() => setActiveMenu(id)}
                title={collapsed ? label : undefined}
              >
                <Icon size={17} />
                <span className="afd-item-label">{label}</span>
              </button>
            ))}
          </nav>

          <div className="afd-sidebar__bottom">
            <button className="afd-sidebar__item" onClick={() => setActiveMenu('feedback')}>
              <MessageSquare size={17} />
              <span className="afd-item-label">Give Feedback</span>
            </button>
            <button className="afd-sidebar__item" onClick={() => setActiveMenu('help-desk')}>
              <HelpCircle size={17} />
              <span className="afd-item-label">Help</span>
            </button>
            <button className="afd-sidebar__item afd-sidebar__item--danger" onClick={handleLogout} style={{ color: '#e53e3e' }}>
              <LogOut size={17} />
              <span className="afd-item-label">Logout</span>
            </button>
          </div>
        </aside>

        <div className="afd-main">
          <header className="afd-topbar">
            <div className="afd-topbar__search">
              <Search size={14} />
              <span>Search</span>
            </div>
            <div className="afd-topbar__actions">
              <button className="afd-topbar__icon-btn" title="Apps"><LayoutGrid size={17} /></button>
              <button className="afd-topbar__icon-btn" title="Notifications" onClick={() => setShowNotif(true)}>
                <Bell size={17} />
              </button>
              <button className="afd-topbar__icon-btn" title="Settings" onClick={() => setActiveMenu('settings')}>
                <Settings size={17} />
              </button>
              <button className="afd-topbar__icon-btn" title={dark ? 'Light mode' : 'Dark mode'} onClick={() => setDark((d) => !d)}>
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              <div className="afd-dropdown-wrap" ref={userRef}>
                <button className="afd-user-btn" onClick={() => setUserDropOpen((o) => !o)}>
                  <div className="afd-user-avatar">AD</div>
                  <span>Admin</span>
                  <ChevronDown size={13} />
                </button>
                {userDropOpen && (
                  <div className="afd-dropdown-menu">
                    <button className="afd-dropdown-item" onClick={() => { setUserDropOpen(false); setActiveMenu('settings'); }}>
                      <User size={15} />
                      Account Settings
                    </button>
                    <div className="afd-dropdown-divider" />
                    <button className="afd-dropdown-item afd-dropdown-item--danger" onClick={() => { setUserDropOpen(false); handleLogout(); }}>
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="afd-content">
            {renderContent()}
          </main>
        </div>
      </div>

      {showNotif && (
        <>
          <div className="afd-notif-overlay" onClick={() => setShowNotif(false)} />
          <div className="afd-notif-toast">
            <Bell size={32} style={{ margin: '0 auto 12px', color: '#635bff', display: 'block' }} />
            <h3>Notifications</h3>
            <p>Coming soon! You'll be able to view all your alerts and updates here.</p>
            <button className="afd-coming-soon-close" onClick={() => setShowNotif(false)}>Got it</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardNew;