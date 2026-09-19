'use client'
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, ChevronDown,
  Home, ShoppingCart, Settings2, Package, HelpCircle,
  CreditCard, FileText, BarChart2, Grid, MoreHorizontal,
  Search, LayoutGrid, Bell, Settings,
  User, LogOut, Moon, Sun, MessageSquare, Rocket,
  Building2, UtensilsCrossed, Wallet, MapPin,
  X, Pencil, RotateCcw, PlusCircle, ChevronRight as ChevRight,
  AlertTriangle, ShoppingBag, CheckCircle2, ArrowRight, XCircle, Loader2,
} from 'lucide-react';
import '../tabletopleodashboard/adminagedummydesign.css';
import AdminPayments from '../adminpaymentscomponent/AdminPayments'
import AdminDiscountManagement from '../discountmanagement/AdminDiscountManagement'

import NotificationTableTopLeo from '../notificationstabletopleo/notificationtabletopleopage';
import MenuCategory             from '../menucategorypage/menucategorypage';
import BusinessInformation      from '../businessinformationpage/businessinformationpage';
import LocationsPage            from '../locationspage/locationspage';
import SettingsPage             from '../ApplicationMainLayout/settingspage';
import HelpDeskPage             from '../ApplicationMainLayout/helpdesk';
import PaymentSetup             from '../tabletopleopaymentsconfiguration/upisetups';
import MyOrderTableTopleoPage   from '../orderstabletopleo/orderstabletopleopage';
import useWebSocket             from '../hooks/useWebSocket';
import notificationService      from '../services/notificationService';
import adminOrderService        from '../services/adminOrderService';
import AcceptOrderPopup         from '../orderstabletopleo/AcceptOrderPopup';
import { useCurrency }          from '../context/CurrencyContext';
import { formatCurrency }       from '../utils/currencyHelper';
import { logoutUser }           from '../services/authService';
import DashboardMainSetup from '../ApplicationMainLayout/dashboardsetup'
import AdminBilling from '../adminbillingcomponent/AdminBilling'
import HeadOfficeAnalyticsDashboard from '../headofficedashboardcomponent/headofficedashboard'
import InventoryPage from '../inventorypage/InventoryPage'
import TaxBillingSetup from '../taxbillingcomponent/taxbillingsetup'
import { useLanguage } from '../context/LanguageContext'



const PAY_LABEL = { upi:'UPI', razorpay:'Razorpay', stripe:'Stripe', paypal:'PayPal', pay_at_counter:'At Counter', cash:'Cash' };
const PAY_COLOR = { upi:'#7c3aed', razorpay:'#3395ff', stripe:'#635bff', paypal:'#003087', pay_at_counter:'#b45309', cash:'#16a34a' };

function getInitials(name) { if(!name) return 'AD'; return name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }
function getGreeting() { const h=new Date().getHours(); return h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening'; }

// ── New-order notification sound — a short two-tone chime synthesized
// with the Web Audio API (no external audio file to host or that could
// fail to load). Plays once each time a NEW_ORDER event arrives. ──
let sharedAdminAudioCtx = null;
function playNewOrderChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!sharedAdminAudioCtx) sharedAdminAudioCtx = new Ctx();
    if (sharedAdminAudioCtx.state === 'suspended') sharedAdminAudioCtx.resume();

    const now = sharedAdminAudioCtx.currentTime;
    [[988, now, 0.13], [1318.5, now + 0.1, 0.18]].forEach(([freq, start, dur]) => {
      const osc  = sharedAdminAudioCtx.createOscillator();
      const gain = sharedAdminAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain).connect(sharedAdminAudioCtx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  } catch {
    // Sound is a nice-to-have — never worth breaking the dashboard over.
  }
}

// Same relative-time logic used on the full Notifications page, so the
// bell dropdown and that page always agree on what "2m ago" means.
function formatTimeAgo(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function buildMenuItems(t, multiLocation) {
  const adminChildren = [
    { id:'business-info', label:t('nav_business_info'), icon:Building2 },
  ];
  // Only shown at all for merchants who've turned on "multiple locations"
  // in Business Information — invisible by default, so a single-location
  // merchant's sidebar looks exactly as it always has.
  if (multiLocation) {
    adminChildren.push({ id:'locations', label:'Locations', icon:MapPin });
  }
  adminChildren.push(
    { id:'menu-category', label:t('nav_menu_category'),      icon:UtensilsCrossed },
    { id:'payment-setup', label:t('nav_payment_setup'),        icon:Wallet },
    { id:'tax-billing',   label:t('nav_tax_billing'),        icon:FileText },
  );

  return [
    { id:'home',    label:t('nav_home'),    icon:Home },
    { id:'orders',  label:t('nav_orders'),  icon:ShoppingCart },
    { id:'admin-setup', label:t('nav_admin_setup'), icon:Settings2, children:adminChildren },
    { id:'inventory', label:t('nav_inventory'), icon:Package },
    { id:'help-desk', label:t('nav_help_desk'), icon:HelpCircle },
    { id:'discount-management', label:t('nav_discounts'), icon:HelpCircle },
  ];
}
function buildProductItems(t) {
  return [
    { id:'payments',  label:t('nav_payments'),  icon:CreditCard },
    { id:'billing',   label:t('nav_billing'),   icon:FileText },
    { id:'analytics-dashboard', label:'Analytics Dashboard', icon:BarChart2, headOfficeOnly:true },
    { id:'reporting', label:t('nav_reporting'), icon:BarChart2 },
    { id:'apps',      label:t('nav_apps'),      icon:Grid },
    { id:'more',      label:t('nav_more'),      icon:MoreHorizontal },
  ];
}

const AdminDashboardNew = () => {
  const router = useRouter();
  const { currencyCode } = useCurrency();
  const { t } = useLanguage();
  const PRODUCT_ITEMS = buildProductItems(t);

  const [collapsed,      setCollapsed]      = useState(false);
  const [dark,           setDark]           = useState(false);
  const [activeMenu,     setActiveMenu]     = useState('home');
  const [adminOpen,      setAdminOpen]      = useState(false);
  const [recVisible,     setRecVisible]     = useState(true);
  const [userDropOpen,   setUserDropOpen]   = useState(false);
  const [showLogout,     setShowLogout]     = useState(false);
  const [user,           setUser]           = useState(null);
  const MENU_ITEMS = buildMenuItems(t, user?.multiLocation);
  const [highlightOrder, setHighlightOrder] = useState(null);
  const [bellOpen,       setBellOpen]       = useState(false);
  const [newOrders,      setNewOrders]      = useState([]); // persisted notifications (backend-backed)
  const [bellLoading,    setBellLoading]    = useState(true);
  const [actingId,       setActingId]       = useState(null); // notificationId currently being Accepted/Rejected
  const [acceptPopupOrder, setAcceptPopupOrder] = useState(null); // order pending Accept-popup decision

  const userRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('ttl_user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-afd-theme', dark ? 'dark' : 'light');
    document.body.setAttribute('data-afd-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (activeMenu !== 'orders') setHighlightOrder(null);
  }, [activeMenu]);

  // ── Notifications: fetch persisted list on mount so it survives
  //    refresh / closing the browser / opening again tomorrow ─────
  const loadBellNotifications = async () => {
    try {
      const res = await notificationService.getActiveNotifications();
      if (res.success) setNewOrders(res.data || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setBellLoading(false);
    }
  };

  useEffect(() => { loadBellNotifications(); }, []);

  // ── WebSocket: subscribe to admin's order topic ────────────────
  const adminId = user?.adminId;
  useWebSocket({
    topics:   adminId ? [`/topic/admin/${adminId}/orders`] : [],
    enabled:  !!adminId,
    onMessage: (topic, event) => {
      // A new order was just confirmed — the backend has already
      // persisted a notification for it, so simply re-fetch the
      // real list rather than fabricating a local-only entry.
      if (event.eventType === 'NEW_ORDER') {
        playNewOrderChime();
        loadBellNotifications();
      }
    },
  });

  const unreadCount = newOrders.length;

  const handleBellOrderClick = (order) => {
    setNewOrders(prev => prev.filter(o => o.notificationId !== order.notificationId));
    setBellOpen(false);
    setHighlightOrder(order.orderNumber || order.orderId);
    setActiveMenu('orders');
    notificationService.markAsRead(order.notificationId).catch(e => console.error('Failed to dismiss notification:', e));
  };

  const handleDismissOrder = (e, notificationId) => {
    e.stopPropagation();
    setNewOrders(prev => prev.filter(o => o.notificationId !== notificationId));
    notificationService.markAsRead(notificationId).catch(err => console.error('Failed to dismiss notification:', err));
  };

  // ── Accept an incoming order — opens the Accept popup (order details +
  // dynamic prep-time selector + print), same as accepting from the
  // Orders page. Reject stays instant (no popup needed for that path). ──
  const handleAcceptOrder = (e, order) => {
    e.stopPropagation();
    setAcceptPopupOrder(order);
  };

  const handleAcceptedFromBellPopup = (updatedOrder, order) => {
    setNewOrders(prev => prev.filter(o => o.notificationId !== order.notificationId));
    setBellOpen(false);
    setHighlightOrder(order.orderNumber || order.orderId);
    setActiveMenu('orders');
  };

  const handleRejectOrder = async (e, order) => {
    e.stopPropagation();
    if (actingId) return;
    setActingId(order.notificationId);
    try {
      const res = await adminOrderService.updateOrderStatus(order.orderId, 'CANCELLED');
      if (res.success) {
        setNewOrders(prev => prev.filter(o => o.notificationId !== order.notificationId));
      } else {
        setBellActionError(order.notificationId, res.message || t('bell_reject_failed'));
      }
    } catch (err) {
      setBellActionError(order.notificationId, err.response?.data?.message || t('bell_reject_failed'));
    } finally {
      setActingId(null);
    }
  };

  const [bellActionErrors, setBellActionErrorsState] = useState({});
  const setBellActionError = (notificationId, msg) => {
    setBellActionErrorsState(prev => ({ ...prev, [notificationId]: msg }));
    setTimeout(() => setBellActionErrorsState(prev => { const next = { ...prev }; delete next[notificationId]; return next; }), 4000);
  };

  const clearAllBell = () => {
    setNewOrders([]);
    notificationService.clearAll().catch(e => console.error('Failed to clear notifications:', e));
  };

  const confirmLogout = async () => {
    // Revoke the persistent session on the server first — this is what
    // actually clears the HttpOnly refresh cookie. Without this, closing
    // and reopening the browser after "logging out" would silently log
    // the person back in, since the still-valid refresh cookie would
    // just issue a fresh access token again.
    await logoutUser();
    localStorage.removeItem('ttl_token');
    localStorage.removeItem('ttl_user');
    router.push('/logintabletopleo');
  };

  const handleMenuClick = (id, hasChildren) => {
    if (hasChildren) { setAdminOpen(o => !o); return; }
    setActiveMenu(id);
  };

  const menuLabel = (id) => {
    for (const m of [...MENU_ITEMS, ...PRODUCT_ITEMS]) {
      if (m.id === id) return m.label;
      if (m.children) for (const c of m.children) if (c.id === id) return c.label;
    }
    return id;
  };

  const firstName = user?.fullName?.split(' ')[0] || 'Admin';
  const initials  = getInitials(user?.fullName);
  const greeting  = getGreeting();
  const dk        = dark;

  const renderContent = () => {
    if (activeMenu === 'orders') {
      return (
        <div data-afd-theme={dark ? 'dark' : 'light'} style={{ height:'100%' }}>
          <MyOrderTableTopleoPage highlightOrder={highlightOrder} isDark={dark}/>
        </div>
      );
    }
    if (activeMenu === 'notifications') {
      return <div data-afd-theme={dark?'dark':'light'}><NotificationTableTopLeo dark={dark} onNavigateToOrder={(orderNoOrId)=>{setHighlightOrder(orderNoOrId);setActiveMenu('orders');}}/></div>;
    }
    const PAGE_MAP = { 'menu-category':MenuCategory, 'business-info':BusinessInformation, 'locations':LocationsPage, 'settings':SettingsPage, 'help-desk':HelpDeskPage, 'payment-setup':PaymentSetup,'home':DashboardMainSetup,'payments':AdminPayments,'billing':AdminBilling,'analytics-dashboard':HeadOfficeAnalyticsDashboard,'inventory':InventoryPage,'discount-management':AdminDiscountManagement,'tax-billing':TaxBillingSetup };
    const ActivePage = PAGE_MAP[activeMenu];
    if (ActivePage) return <div data-afd-theme={dark?'dark':'light'}><ActivePage/></div>;
    if (activeMenu === 'admin-setup') return null;

    if (activeMenu === 'home') return (
      <>
        <h1 className="afd-page-title">{greeting}, <span style={{color:'#635bff',fontWeight:800}}>{firstName}</span> 👋</h1>
        <div className="afd-chart-card">
          <div className="afd-metrics-row">
            <div><div className="afd-metric__label">{t("home_gross_volume")} <ChevronDown size={12}/></div><div className="afd-metric__value">0.00kr</div><div className="afd-metric__time">11:33 PM</div></div>
            <div><div className="afd-metric__label">{t("home_yesterday")} <ChevronDown size={12}/></div><div className="afd-metric__value">0.00kr</div></div>
          </div>
          <div className="afd-chart-wrap"><svg viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="M0 88 L1000 88" stroke="#635bff" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="1000" cy="88" r="5" fill="#635bff"/></svg></div>
          <div className="afd-chart-times"><span>12:00 AM</span><span>12:00 AM</span></div>
          <div className="afd-balance-row">
            <div className="afd-balance-col"><div className="afd-balance-hd"><span className="afd-balance-label">{t("home_dkk_balance")}</span><button className="afd-balance-link">{t("home_view")}</button></div><div className="afd-balance-amount">0.00kr</div></div>
            <div className="afd-balance-col"><div className="afd-balance-hd"><span className="afd-balance-label">{t("home_payouts")}</span><button className="afd-balance-link">{t("home_view")}</button></div><div className="afd-balance-dash">—</div></div>
          </div>
        </div>
        <div className="afd-grid">
          <div className="afd-overview-card">
            <h2>{t("home_your_overview")}</h2>
            <div className="afd-overview-controls">
              <div className="afd-overview-filters">
                <button className="afd-btn-pill">{t("home_date_range")}</button>
                <button className="afd-btn-pill">{t("home_last_7_days")} <ChevronDown size={10}/></button>
                <button className="afd-btn-pill">{t("home_daily")} <ChevronDown size={10}/></button>
                <button className="afd-btn-pill"><RotateCcw size={12}/> {t("home_compare")}</button>
                <button className="afd-btn-pill">{t("home_previous_period")} <ChevronDown size={10}/></button>
              </div>
              <div className="afd-overview-actions">
                <button className="afd-btn-pill"><PlusCircle size={12}/> {t("home_add")}</button>
                <button className="afd-btn-pill"><Pencil size={12}/> {t("home_edit")}</button>
              </div>
            </div>
            <div className="afd-empty-chart">{t("home_no_data")}</div>
          </div>
          <div className="afd-right-panel">
            {recVisible && (
              <div className="afd-card">
                <div className="afd-card__hd"><span className="afd-card__title">{t("home_recommendations")}</span><button className="afd-card__close" onClick={()=>setRecVisible(false)}><X size={13}/></button></div>
                <div className="afd-rec-item"><p>{t("home_rec1")}</p><a href="#">{t("home_rec1_link")}</a></div>
                <div className="afd-rec-divider"/>
                <div className="afd-rec-item"><p>{t("home_rec2")}</p><a href="#">{t("home_rec2_link")}</a></div>
              </div>
            )}
            <div className="afd-card">
              <div className="afd-apikeys-hd"><span>{t("home_api_keys")}</span><a href="#">{t("home_view_docs")}</a></div>
              <div className="afd-key-row"><span className="afd-key-label">{t("home_publishable_key")}</span><span className="afd-key-val">pk_test_51TnN162KHtN...</span></div>
              <div className="afd-key-row"><span className="afd-key-label">{t("home_secret_key")}</span><span className="afd-key-val">sk_test_51TnN162KHtN...</span></div>
            </div>
          </div>
        </div>
      </>
    );

    return (
      <div className="afd-coming-soon-page">
        <div className="afd-coming-soon-icon"><Rocket size={48}/></div>
        <h2>{menuLabel(activeMenu)}</h2>
        <p>{t("coming_soon_desc1")}</p>
        <p>{t("coming_soon_desc2")}</p>
      </div>
    );
  };

  return (
    <div className="afd-root" data-afd-theme={dark?'dark':'light'}>
      <style>{`
        @keyframes bellShake{0%,100%{transform:rotate(0)}15%{transform:rotate(14deg)}30%{transform:rotate(-12deg)}45%{transform:rotate(8deg)}60%{transform:rotate(-6deg)}75%{transform:rotate(3deg)}}
        @keyframes ddSlide{from{opacity:0;transform:translateY(-8px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .bell-new{animation:bellShake 0.7s ease}
      `}</style>

      {showLogout && (
        <>
          <div onClick={()=>setShowLogout(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,backdropFilter:'blur(3px)'}}/>
          <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'#fff',borderRadius:16,padding:'32px 28px',width:340,zIndex:1001,textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.18)'}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><AlertTriangle size={26} color="#dc2626"/></div>
            <h3 style={{fontSize:18,fontWeight:800,color:'#111827',margin:'0 0 8px'}}>{t('signout_title')}</h3>
            <p style={{fontSize:13.5,color:'#6b7280',lineHeight:1.6,margin:'0 0 24px'}}>{t('signout_desc')}</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowLogout(false)} style={{flex:1,padding:'10px',border:'1.5px solid #e5e7eb',borderRadius:9,background:'#fff',fontSize:13.5,fontWeight:600,color:'#374151',cursor:'pointer'}}>{t('signout_cancel')}</button>
              <button onClick={confirmLogout} style={{flex:1,padding:'10px',border:'none',borderRadius:9,background:'linear-gradient(135deg,#ef4444,#dc2626)',fontSize:13.5,fontWeight:700,color:'#fff',cursor:'pointer',boxShadow:'0 4px 12px rgba(239,68,68,0.35)'}}>{t('signout_confirm')}</button>
            </div>
          </div>
        </>
      )}

      <div className="afd-body">
        <aside className={`afd-sidebar${collapsed?' collapsed':''}`}>
          <div className="afd-sidebar__header" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {!collapsed && <div className="afd-sidebar__brand"><span className="afd-sidebar__brand-name">TableTopLeo</span></div>}
              <button className="afd-collapse-btn" onClick={()=>setCollapsed(c=>!c)} title={collapsed?t('expand_sidebar'):t('collapse_sidebar')}>
                {collapsed?<ChevronRight size={15}/>:<ChevronLeft size={15}/>}
              </button>
            </div>
            {!collapsed && (user?.businessName || user?.branchName) && (
              <div style={{
                marginTop: 6, fontSize: 11, fontWeight: 600, color: dk ? '#a1a1aa' : '#71717a',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <Building2 size={11} style={{ flexShrink: 0, opacity: 0.7 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.businessName || 'Business'}{user?.branchName ? ` · ${user.branchName}` : ''}
                </span>
              </div>
            )}
          </div>
          <nav className="afd-sidebar__nav">
            {MENU_ITEMS.map(({id,label,icon:Icon,children})=>(
              <div key={id}>
                <button className={`afd-sidebar__item${activeMenu===id||(children&&children.some(c=>c.id===activeMenu))?' afd-sidebar__item--active':''}`} onClick={()=>handleMenuClick(id,!!children)} title={collapsed?label:undefined}>
                  <Icon size={17}/><span className="afd-item-label">{label}</span>
                  {children&&<span className="afd-item-chev">{adminOpen?<ChevronDown size={13}/>:<ChevRight size={13}/>}</span>}
                </button>
                {children&&(
                  <div className={`afd-sidebar__dropdown${adminOpen?' open':''}`}>
                    {children.map(({id:cid,label:clabel,icon:CIcon})=>(
                      <button key={cid} className={`afd-sidebar__sub-item${activeMenu===cid?' afd-sidebar__item--active':''}`} onClick={()=>setActiveMenu(cid)}>
                        <CIcon size={14}/>{clabel}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="afd-sidebar__divider"/>
            <div className="afd-sidebar__section-label">{t('nav_more_section')}</div>
            {PRODUCT_ITEMS.filter(item => !item.headOfficeOnly || (user?.multiLocation === true && (!user?.role || user.role === 'OWNER'))).map(({id,label,icon:Icon})=>(
              <button key={id} className={`afd-sidebar__item${activeMenu===id?' afd-sidebar__item--active':''}`} onClick={()=>setActiveMenu(id)} title={collapsed?label:undefined}>
                <Icon size={17}/><span className="afd-item-label">{label}</span>
              </button>
            ))}
          </nav>
          <div className="afd-sidebar__bottom">
             
            <button className="afd-sidebar__item" onClick={()=>setActiveMenu('help-desk')}><HelpCircle size={17}/><span className="afd-item-label">{t('nav_help')}</span></button>
            <button className="afd-sidebar__item afd-sidebar__item--danger" onClick={()=>setShowLogout(true)} style={{color:'#e53e3e'}}><LogOut size={17}/><span className="afd-item-label">{t('nav_logout')}</span></button>
          </div>
        </aside>

        <div className="afd-main">
          <header className="afd-topbar">
            <div className="afd-topbar__search"><Search size={14}/><span>{t('topbar_search')}</span></div>
            <div className="afd-topbar__actions">
              

              {/* ── BELL + REAL-TIME DROPDOWN ── */}
              <div style={{position:'relative'}} ref={bellRef}>
                <button className={`afd-topbar__icon-btn ${unreadCount>0?'bell-new':''}`} title={t('topbar_new_orders')} onClick={()=>setBellOpen(o=>!o)} style={{position:'relative'}}>
                  <Bell size={17}/>
                  {newOrders.length>0&&(
                    <span style={{position:'absolute',top:2,right:2,minWidth:16,height:16,borderRadius:8,background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff',fontSize:9,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #fff',padding:'0 3px',lineHeight:1}}>
                      {newOrders.length>9?'9+':newOrders.length}
                    </span>
                  )}
                </button>

                {bellOpen&&(
                  <div style={{position:'absolute',top:'calc(100% + 10px)',right:0,width:320,background:dk?'#1e2130':'#ffffff',border:`1px solid ${dk?'rgba(255,255,255,0.08)':'#eef0f4'}`,borderRadius:16,boxShadow:dk?'0 20px 56px rgba(0,0,0,0.5)':'0 20px 56px rgba(17,24,39,0.12)',zIndex:9999,animation:'ddSlide 0.18s cubic-bezier(0.34,1.2,0.64,1)',overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
                    {/* ── Header: title + Mark all read (matches the reference popup) ── */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px 14px'}}>
                      <span style={{fontSize:15,fontWeight:700,color:dk?'#f1f5f9':'#111827',letterSpacing:'-0.01em'}}>{t('bell_new_orders')}</span>
                      {newOrders.length>0&&(
                        <button onClick={clearAllBell} style={{fontSize:12,fontWeight:600,color:dk?'#8b92a9':'#9ca3af',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',padding:0}}>
                          {t('Mark as Read')}
                        </button>
                      )}
                    </div>

                    {/* ── List: purple dot + bold title + gray time-ago, tinted rows for the (all-unread) items ── */}
                    <div style={{maxHeight:340,overflowY:'auto',padding:'0 8px 8px'}}>
                      {bellLoading?(
                        <div style={{padding:'28px 16px',textAlign:'center'}}>
                          <div style={{fontSize:11.5,color:dk?'#6b7280':'#9ca3af'}}>{t('bell_loading')}</div>
                        </div>
                      ):newOrders.length===0?(
                        <div style={{padding:'28px 16px',textAlign:'center'}}>
                          <ShoppingBag size={28} color={dk?'#4b5563':'#d1d5db'} strokeWidth={1.5} style={{display:'block',margin:'0 auto 8px'}}/>
                          <div style={{fontSize:12,fontWeight:600,color:dk?'#9ca3af':'#6b7280'}}>{t('bell_no_orders')}</div>
                          <div style={{fontSize:10.5,color:dk?'#6b7280':'#9ca3af',marginTop:3}}>{t('bell_caught_up')}</div>
                        </div>
                      ):newOrders.map((order)=>{
                        const amount=Number(order.amount||0).toLocaleString('en-IN');
                        const isPac  = order.paymentStatus==='PAY_AT_COUNTER';
                        const isPaid = !isPac && order.paymentStatus==='PAID';
                        const payWord = isPac ? t('bell_at_counter') : isPaid ? t('bell_paid') : t('bell_pending_status');
                        // Only orders still awaiting the merchant's first
                        // decision get Accept/Reject — anything already
                        // moved along (from here, the Orders page, or
                        // another admin session) just shows its info.
                        const needsAction = !order.orderStatus || order.orderStatus === 'PLACED';
                        const isActing = actingId === order.notificationId;
                        const actionError = bellActionErrors[order.notificationId];
                        return (
                          <div key={order.notificationId} onClick={()=>handleBellOrderClick(order)}
                            className="ttl-bell-row"
                            style={{position:'relative',display:'flex',flexDirection:'column',gap:8,padding:'10px 10px',borderRadius:10,cursor:'pointer',background:dk?'rgba(99,91,255,0.10)':'rgba(99,91,255,0.055)',marginBottom:3,transition:'background 0.12s'}}
                          >
                            <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                              <span style={{width:7,height:7,marginTop:5,borderRadius:'50%',background:'#635bff',flexShrink:0}}/>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:12.5,fontWeight:600,color:dk?'#e2e8f0':'#1f2937',lineHeight:1.35}}>
                                  {t('bell_new_order_received')}: <span style={{fontFamily:'monospace',fontWeight:700}}>{order.orderNumber||order.orderId?.slice(0,14)}</span> · {formatCurrency(amount, currencyCode)}
                                </div>
                                <div style={{fontSize:11,color:dk?'#7d879c':'#9aa1b0',marginTop:3}}>
                                  {formatTimeAgo(order.createdAt)} · {payWord}
                                </div>
                              </div>
                              <button
                                onClick={(e)=>handleDismissOrder(e, order.notificationId)}
                                title={t('bell_dismiss')}
                                className="ttl-bell-row-dismiss"
                                style={{background:'none',border:'none',cursor:'pointer',color:dk?'#6b7280':'#c4c9d2',padding:2,display:'flex',flexShrink:0,opacity:0,transition:'opacity 0.12s'}}
                              >
                                <X size={13}/>
                              </button>
                            </div>

                            {/* ── Accept / Reject — the merchant's first decision,
                                right here in the bell, no need to open Orders ── */}
                            {needsAction && (
                              <div style={{display:'flex',alignItems:'center',gap:6,paddingLeft:17}}>
                                <button
                                  onClick={(e)=>handleAcceptOrder(e, order)}
                                  disabled={isActing}
                                  style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'6px 0',borderRadius:7,border:'none',background:'#16a34a',color:'#fff',fontSize:11.5,fontWeight:700,cursor:isActing?'not-allowed':'pointer',opacity:isActing?0.7:1,fontFamily:'inherit'}}
                                >
                                  {isActing ? <Loader2 size={12} style={{animation:'spin .7s linear infinite'}}/> : <CheckCircle2 size={12}/>}
                                  {t('bell_accept')}
                                </button>
                                <button
                                  onClick={(e)=>handleRejectOrder(e, order)}
                                  disabled={isActing}
                                  style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'6px 0',borderRadius:7,border:'1.5px solid #ef4444',background:'transparent',color:'#ef4444',fontSize:11.5,fontWeight:700,cursor:isActing?'not-allowed':'pointer',opacity:isActing?0.7:1,fontFamily:'inherit'}}
                                >
                                  <XCircle size={12}/> {t('bell_reject')}
                                </button>
                              </div>
                            )}
                            {actionError && (
                              <div style={{fontSize:10.5,color:'#ef4444',paddingLeft:17}}>{actionError}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {newOrders.length>0&&(
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderTop:`1px solid ${dk?'rgba(255,255,255,0.06)':'#f3f4f6'}`}}>
                        <span style={{fontSize:10.5,color:dk?'#6b7280':'#9ca3af'}}>{newOrders.length} {t('bell_pending')}</span>
                        <button onClick={()=>{setBellOpen(false);setActiveMenu('orders');}} style={{fontSize:11,fontWeight:700,color:'#635bff',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:3}}>
                          {t('bell_view_all')} <ArrowRight size={10}/>
                        </button>
                      </div>
                    )}

                    <style>{`
                      .ttl-bell-row:hover { background: ${dk?'rgba(99,91,255,0.16)':'rgba(99,91,255,0.09)'} !important; }
                      .ttl-bell-row:hover .ttl-bell-row-dismiss { opacity: 1; }
                    `}</style>
                  </div>
                )}
              </div>

              <button className="afd-topbar__icon-btn" title={t('topbar_settings')} onClick={()=>setActiveMenu(p=>p==='settings'?'home':'settings')}><Settings size={17}/></button>
              <button className="afd-topbar__icon-btn" title={dark?t('topbar_light_mode'):t('topbar_dark_mode')} onClick={()=>setDark(d=>!d)}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button>

              <div className="afd-dropdown-wrap" ref={userRef}>
                <button className="afd-user-btn" onClick={()=>setUserDropOpen(o=>!o)}>
                  <div className="afd-user-avatar" style={{overflow:'hidden',padding:0}}>
                    {user?.logoUrl?<img src={user.logoUrl} alt="logo" style={{width:'100%',height:'100%',objectFit:'cover',display:'block',borderRadius:'inherit'}} onError={e=>{e.target.style.display='none';}}/>:initials}
                  </div>
                  <span>{firstName}</span><ChevronDown size={13}/>
                </button>
                {userDropOpen&&(
                  <div className="afd-dropdown-menu" style={{minWidth:260}}>
                    <div style={{padding:'14px',borderBottom:'1px solid #f3f4f6'}}>
                      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                        <div style={{width:44,height:44,borderRadius:10,overflow:'hidden',flexShrink:0,border:'2px solid #f3f4f6',background:'linear-gradient(135deg,#635bff,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {user?.logoUrl?(<><img src={user.logoUrl} alt="Business Logo" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}}/><span style={{display:'none',color:'#fff',fontWeight:800,fontSize:14,alignItems:'center',justifyContent:'center',width:'100%',height:'100%'}}>{initials}</span></>):(<span style={{color:'#fff',fontWeight:800,fontSize:14}}>{initials}</span>)}
                        </div>
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:800,color:'#111827',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.fullName||'Admin'}</div>
                          <div style={{fontSize:12,color:'#6b7280',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.email||''}</div>
                        </div>
                      </div>
                      {user?.adminId&&(<div style={{background:'#f9fafb',border:'1px solid #f3f4f6',borderRadius:7,padding:'7px 10px'}}><div style={{fontSize:10,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3,fontWeight:600}}>{t('admin_id')}</div><div style={{fontSize:11.5,fontFamily:'monospace',color:'#374151',fontWeight:600,wordBreak:'break-all'}}>{user.adminId}</div></div>)}
                    </div>
                    <button className="afd-dropdown-item" onClick={()=>{setUserDropOpen(false);setActiveMenu('settings');}}><User size={15}/> {t('topbar_account_settings')}</button>
                    <div className="afd-dropdown-divider"/>
                    <button className="afd-dropdown-item afd-dropdown-item--danger" onClick={()=>{setUserDropOpen(false);setShowLogout(true);}}><LogOut size={15}/> {t('nav_logout')}</button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="afd-content">{renderContent()}</main>
        </div>
      </div>
      {acceptPopupOrder && (
        <AcceptOrderPopup
          orderId={acceptPopupOrder.orderId}
          onClose={()=>setAcceptPopupOrder(null)}
          onAccepted={(updatedOrder)=>handleAcceptedFromBellPopup(updatedOrder, acceptPopupOrder)}
        />
      )}
    </div>
  );
};

export default AdminDashboardNew;