'use client'
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, ChevronDown,
  Home, ShoppingCart, Settings2, Package, HelpCircle,
  CreditCard, FileText, BarChart2, Grid, MoreHorizontal,
  Search, LayoutGrid, Bell, Settings,
  User, LogOut, Moon, Sun, MessageSquare, Rocket,
  Building2, UtensilsCrossed, Wallet,
  X, Pencil, RotateCcw, PlusCircle, ChevronRight as ChevRight,
  AlertTriangle, ShoppingBag, CheckCircle2, ArrowRight,
} from 'lucide-react';
import '../tabletopleodashboard/adminagedummydesign.css';

import NotificationTableTopLeo from '../notificationstabletopleo/notificationtabletopleopage';
import MenuCategory             from '../menucategorypage/menucategorypage';
import BusinessInformation      from '../businessinformationpage/businessinformationpage';
import SettingsPage             from '../ApplicationMainLayout/settingspage';
import HelpDeskPage             from '../ApplicationMainLayout/helpdesk';
import PaymentSetup             from '../tabletopleopaymentsconfiguration/upisetups';
import MyOrderTableTopleoPage   from '../orderstabletopleo/orderstabletopleopage';
import useWebSocket             from '../hooks/useWebSocket';

const PAY_LABEL = { upi:'UPI', razorpay:'Razorpay', stripe:'Stripe', paypal:'PayPal', pay_at_counter:'At Counter', cash:'Cash' };
const PAY_COLOR = { upi:'#7c3aed', razorpay:'#3395ff', stripe:'#635bff', paypal:'#003087', pay_at_counter:'#b45309', cash:'#16a34a' };

function getInitials(name) { if(!name) return 'AD'; return name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }
function getGreeting() { const h=new Date().getHours(); return h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening'; }

const MENU_ITEMS = [
  { id:'home',    label:'Home',    icon:Home },
  { id:'orders',  label:'Orders',  icon:ShoppingCart },
  { id:'admin-setup', label:'Admin Setup', icon:Settings2, children:[
      { id:'business-info', label:'Business Information', icon:Building2 },
      { id:'menu-category', label:'Menu & Category',      icon:UtensilsCrossed },
      { id:'payment-setup', label:'Payment Setup',        icon:Wallet },
  ]},
  { id:'inventory', label:'Inventory', icon:Package },
  { id:'help-desk', label:'Help Desk', icon:HelpCircle },
];
const PRODUCT_ITEMS = [
  { id:'payments',  label:'Payments',  icon:CreditCard },
  { id:'billing',   label:'Billing',   icon:FileText },
  { id:'reporting', label:'Reporting', icon:BarChart2 },
  { id:'apps',      label:'Apps',      icon:Grid },
  { id:'more',      label:'More',      icon:MoreHorizontal },
];

const AdminDashboardNew = () => {
  const router = useRouter();

  const [collapsed,      setCollapsed]      = useState(false);
  const [dark,           setDark]           = useState(false);
  const [activeMenu,     setActiveMenu]     = useState('home');
  const [adminOpen,      setAdminOpen]      = useState(false);
  const [recVisible,     setRecVisible]     = useState(true);
  const [userDropOpen,   setUserDropOpen]   = useState(false);
  const [showLogout,     setShowLogout]     = useState(false);
  const [user,           setUser]           = useState(null);
  const [highlightOrder, setHighlightOrder] = useState(null);
  const [bellOpen,       setBellOpen]       = useState(false);
  const [newOrders,      setNewOrders]      = useState([]);
  const [readIds,        setReadIds]        = useState(new Set());

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

  // ── WebSocket: subscribe to admin's order topic ────────────────
  const adminId = user?.adminId;
  useWebSocket({
    topics:   adminId ? [`/topic/admin/${adminId}/orders`] : [],
    enabled:  !!adminId,
    onMessage: (topic, event) => {
      if (event.eventType === 'NEW_ORDER') {
        setNewOrders(prev => {
          if (prev.find(o => o.orderId === event.orderId)) return prev;
          return [event, ...prev].slice(0, 15);
        });
      }
    },
  });

  const unreadCount = newOrders.length;

  const handleBellOrderClick = (order) => {
    setNewOrders(prev => prev.filter(o => o.orderId !== order.orderId));
    setBellOpen(false);
    setHighlightOrder(order.orderNumber || order.orderId);
    setActiveMenu('orders');
  };

  const handleDismissOrder = (e, orderId) => {
    e.stopPropagation();
    setNewOrders(prev => prev.filter(o => o.orderId !== orderId));
  };

  const clearAllBell = () => setNewOrders([]);

  const confirmLogout = () => {
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
      return <div data-afd-theme={dark?'dark':'light'}><NotificationTableTopLeo dark={dark}/></div>;
    }
    const PAGE_MAP = { 'menu-category':MenuCategory, 'business-info':BusinessInformation, 'settings':SettingsPage, 'help-desk':HelpDeskPage, 'payment-setup':PaymentSetup };
    const ActivePage = PAGE_MAP[activeMenu];
    if (ActivePage) return <div data-afd-theme={dark?'dark':'light'}><ActivePage/></div>;
    if (activeMenu === 'admin-setup') return null;

    if (activeMenu === 'home') return (
      <>
        <h1 className="afd-page-title">{greeting}, <span style={{color:'#635bff',fontWeight:800}}>{firstName}</span> 👋</h1>
        <div className="afd-chart-card">
          <div className="afd-metrics-row">
            <div><div className="afd-metric__label">Gross volume <ChevronDown size={12}/></div><div className="afd-metric__value">0.00kr</div><div className="afd-metric__time">11:33 PM</div></div>
            <div><div className="afd-metric__label">Yesterday <ChevronDown size={12}/></div><div className="afd-metric__value">0.00kr</div></div>
          </div>
          <div className="afd-chart-wrap"><svg viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="M0 88 L1000 88" stroke="#635bff" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="1000" cy="88" r="5" fill="#635bff"/></svg></div>
          <div className="afd-chart-times"><span>12:00 AM</span><span>12:00 AM</span></div>
          <div className="afd-balance-row">
            <div className="afd-balance-col"><div className="afd-balance-hd"><span className="afd-balance-label">DKK balance</span><button className="afd-balance-link">View</button></div><div className="afd-balance-amount">0.00kr</div></div>
            <div className="afd-balance-col"><div className="afd-balance-hd"><span className="afd-balance-label">Payouts</span><button className="afd-balance-link">View</button></div><div className="afd-balance-dash">—</div></div>
          </div>
        </div>
        <div className="afd-grid">
          <div className="afd-overview-card">
            <h2>Your overview</h2>
            <div className="afd-overview-controls">
              <div className="afd-overview-filters">
                <button className="afd-btn-pill">Date range</button>
                <button className="afd-btn-pill">Last 7 days <ChevronDown size={10}/></button>
                <button className="afd-btn-pill">Daily <ChevronDown size={10}/></button>
                <button className="afd-btn-pill"><RotateCcw size={12}/> Compare</button>
                <button className="afd-btn-pill">Previous period <ChevronDown size={10}/></button>
              </div>
              <div className="afd-overview-actions">
                <button className="afd-btn-pill"><PlusCircle size={12}/> Add</button>
                <button className="afd-btn-pill"><Pencil size={12}/> Edit</button>
              </div>
            </div>
            <div className="afd-empty-chart">No data to display for this period</div>
          </div>
          <div className="afd-right-panel">
            {recVisible && (
              <div className="afd-card">
                <div className="afd-card__hd"><span className="afd-card__title">Recommendations</span><button className="afd-card__close" onClick={()=>setRecVisible(false)}><X size={13}/></button></div>
                <div className="afd-rec-item"><p>Sell products, offer subscriptions, and collect tips or donations by creating a link—no code required.</p><a href="#">Create payment link</a></div>
                <div className="afd-rec-divider"/>
                <div className="afd-rec-item"><p>Offer subscriptions to drive predictable recurring revenue streams.</p><a href="#">Create a subscription</a></div>
              </div>
            )}
            <div className="afd-card">
              <div className="afd-apikeys-hd"><span>API keys</span><a href="#">View docs</a></div>
              <div className="afd-key-row"><span className="afd-key-label">Publishable key</span><span className="afd-key-val">pk_test_51TnN162KHtN...</span></div>
              <div className="afd-key-row"><span className="afd-key-label">Secret key</span><span className="afd-key-val">sk_test_51TnN162KHtN...</span></div>
            </div>
          </div>
        </div>
      </>
    );

    return (
      <div className="afd-coming-soon-page">
        <div className="afd-coming-soon-icon"><Rocket size={48}/></div>
        <h2>{menuLabel(activeMenu)}</h2>
        <p>This feature is under construction.</p>
        <p>We're working hard to bring it to you soon!</p>
      </div>
    );
  };

  return (
    <div className="afd-root" data-afd-theme={dark?'dark':'light'}>
      <style>{`
        @keyframes bellShake{0%,100%{transform:rotate(0)}15%{transform:rotate(14deg)}30%{transform:rotate(-12deg)}45%{transform:rotate(8deg)}60%{transform:rotate(-6deg)}75%{transform:rotate(3deg)}}
        @keyframes ddSlide{from{opacity:0;transform:translateY(-8px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .bell-new{animation:bellShake 0.7s ease}
      `}</style>

      {showLogout && (
        <>
          <div onClick={()=>setShowLogout(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,backdropFilter:'blur(3px)'}}/>
          <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'#fff',borderRadius:16,padding:'32px 28px',width:340,zIndex:1001,textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.18)'}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><AlertTriangle size={26} color="#dc2626"/></div>
            <h3 style={{fontSize:18,fontWeight:800,color:'#111827',margin:'0 0 8px'}}>Sign Out?</h3>
            <p style={{fontSize:13.5,color:'#6b7280',lineHeight:1.6,margin:'0 0 24px'}}>Are you sure you want to sign out of your TableTop Leo account?</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowLogout(false)} style={{flex:1,padding:'10px',border:'1.5px solid #e5e7eb',borderRadius:9,background:'#fff',fontSize:13.5,fontWeight:600,color:'#374151',cursor:'pointer'}}>Cancel</button>
              <button onClick={confirmLogout} style={{flex:1,padding:'10px',border:'none',borderRadius:9,background:'linear-gradient(135deg,#ef4444,#dc2626)',fontSize:13.5,fontWeight:700,color:'#fff',cursor:'pointer',boxShadow:'0 4px 12px rgba(239,68,68,0.35)'}}>Yes, Sign Out</button>
            </div>
          </div>
        </>
      )}

      <div className="afd-body">
        <aside className={`afd-sidebar${collapsed?' collapsed':''}`}>
          <div className="afd-sidebar__header">
            {!collapsed && <div className="afd-sidebar__brand"><span className="afd-sidebar__brand-name">TableTopLeo</span></div>}
            <button className="afd-collapse-btn" onClick={()=>setCollapsed(c=>!c)} title={collapsed?'Expand':'Collapse'}>
              {collapsed?<ChevronRight size={15}/>:<ChevronLeft size={15}/>}
            </button>
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
            <div className="afd-sidebar__section-label">Products</div>
            {PRODUCT_ITEMS.map(({id,label,icon:Icon})=>(
              <button key={id} className={`afd-sidebar__item${activeMenu===id?' afd-sidebar__item--active':''}`} onClick={()=>setActiveMenu(id)} title={collapsed?label:undefined}>
                <Icon size={17}/><span className="afd-item-label">{label}</span>
              </button>
            ))}
          </nav>
          <div className="afd-sidebar__bottom">
            <button className="afd-sidebar__item" onClick={()=>setActiveMenu('feedback')}><MessageSquare size={17}/><span className="afd-item-label">Give Feedback</span></button>
            <button className="afd-sidebar__item" onClick={()=>setActiveMenu('help-desk')}><HelpCircle size={17}/><span className="afd-item-label">Help</span></button>
            <button className="afd-sidebar__item afd-sidebar__item--danger" onClick={()=>setShowLogout(true)} style={{color:'#e53e3e'}}><LogOut size={17}/><span className="afd-item-label">Logout</span></button>
          </div>
        </aside>

        <div className="afd-main">
          <header className="afd-topbar">
            <div className="afd-topbar__search"><Search size={14}/><span>Search</span></div>
            <div className="afd-topbar__actions">
              <button className="afd-topbar__icon-btn" title="Apps"><LayoutGrid size={17}/></button>

              {/* ── BELL + REAL-TIME DROPDOWN ── */}
              <div style={{position:'relative'}} ref={bellRef}>
                <button className={`afd-topbar__icon-btn ${unreadCount>0?'bell-new':''}`} title="New Orders" onClick={()=>setBellOpen(o=>!o)} style={{position:'relative'}}>
                  <Bell size={17}/>
                  {newOrders.length>0&&(
                    <span style={{position:'absolute',top:2,right:2,minWidth:16,height:16,borderRadius:8,background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff',fontSize:9,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #fff',padding:'0 3px',lineHeight:1}}>
                      {newOrders.length>9?'9+':newOrders.length}
                    </span>
                  )}
                </button>

                {bellOpen&&(
                  <div style={{position:'absolute',top:'calc(100% + 10px)',right:0,width:280,background:dk?'#1e2130':'#ffffff',border:`1px solid ${dk?'rgba(255,255,255,0.08)':'#e5e7eb'}`,borderRadius:12,boxShadow:dk?'0 16px 48px rgba(0,0,0,0.5)':'0 16px 48px rgba(0,0,0,0.14)',zIndex:9999,animation:'ddSlide 0.18s cubic-bezier(0.34,1.2,0.64,1)',overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 13px 10px',borderBottom:`1px solid ${dk?'rgba(255,255,255,0.06)':'#f3f4f6'}`}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <Bell size={13} color="#635bff"/>
                        <span style={{fontSize:12.5,fontWeight:700,color:dk?'#e2e8f0':'#111827'}}>New Orders</span>
                        {newOrders.length>0&&<span style={{fontSize:9.5,fontWeight:800,background:'#635bff',color:'#fff',borderRadius:20,padding:'1px 6px'}}>{newOrders.length}</span>}
                      </div>
                      {newOrders.length>0&&<button onClick={clearAllBell} style={{fontSize:10.5,color:dk?'#6b7280':'#9ca3af',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Clear</button>}
                    </div>

                    <div style={{maxHeight:320,overflowY:'auto'}}>
                      {newOrders.length===0?(
                        <div style={{padding:'28px 16px',textAlign:'center'}}>
                          <ShoppingBag size={28} color={dk?'#4b5563':'#d1d5db'} strokeWidth={1.5} style={{display:'block',margin:'0 auto 8px'}}/>
                          <div style={{fontSize:12,fontWeight:600,color:dk?'#9ca3af':'#6b7280'}}>No new orders</div>
                          <div style={{fontSize:10.5,color:dk?'#6b7280':'#9ca3af',marginTop:3}}>New orders appear here via WebSocket</div>
                        </div>
                      ):newOrders.map((order,idx)=>{
                        const isUnread=!readIds.has(order.orderId);
                        const amount=Number(order.grandTotal||0).toLocaleString('en-IN');
                        const isPac  = order.payAtCounter || order.paymentStatus==='PAY_AT_COUNTER';
                        const isPaid = !isPac && order.paymentStatus==='PAID';
                        return (
                          <div key={order.orderId} onClick={()=>handleBellOrderClick(order)}
                            style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,padding:'9px 13px',cursor:'pointer',borderBottom:`1px solid ${dk?'rgba(255,255,255,0.04)':'#f9fafb'}`,background:isUnread?(dk?'rgba(99,91,255,0.07)':'rgba(99,91,255,0.03)'):'transparent',transition:'background 0.12s'}}
                            onMouseOver={e=>e.currentTarget.style.background=dk?'rgba(255,255,255,0.06)':'#f8fafc'}
                            onMouseOut={e=>e.currentTarget.style.background=isUnread?(dk?'rgba(99,91,255,0.07)':'rgba(99,91,255,0.03)'):'transparent'}
                          >
                            <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
                              {isUnread&&<div style={{width:7,height:7,borderRadius:'50%',background:'#635bff',flexShrink:0}}/>}
                              <div style={{minWidth:0}}>
                                <div style={{fontSize:11,fontWeight:700,color:'#635bff',marginBottom:2}}>🔔 New Order Received</div>
                                <div style={{fontSize:13,fontWeight:800,color:dk?'#e2e8f0':'#111827',fontFamily:'monospace',lineHeight:1}}>{order.orderNumber||order.orderId?.slice(0,14)}</div>
                              </div>
                            </div>
                            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0}}>
                              <span style={{fontSize:14,fontWeight:800,color:'#635bff'}}>₹{amount}</span>
                              <span style={{fontSize:10,fontWeight:600,color:isPac?'#b45309':isPaid?'#16a34a':'#f59e0b'}}>{isPac?'🏪 At Counter':isPaid?'✓ Paid':'Pending'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {newOrders.length>0&&(
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 13px',borderTop:`1px solid ${dk?'rgba(255,255,255,0.06)':'#f3f4f6'}`}}>
                        <span style={{fontSize:10.5,color:dk?'#6b7280':'#9ca3af'}}>{newOrders.length} pending</span>
                        <button onClick={()=>{setBellOpen(false);setActiveMenu('orders');}} style={{fontSize:11,fontWeight:700,color:'#635bff',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:3}}>
                          View All <ArrowRight size={10}/>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button className="afd-topbar__icon-btn" title="Settings" onClick={()=>setActiveMenu(p=>p==='settings'?'home':'settings')}><Settings size={17}/></button>
              <button className="afd-topbar__icon-btn" title={dark?'Light mode':'Dark mode'} onClick={()=>setDark(d=>!d)}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button>

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
                      {user?.adminId&&(<div style={{background:'#f9fafb',border:'1px solid #f3f4f6',borderRadius:7,padding:'7px 10px'}}><div style={{fontSize:10,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3,fontWeight:600}}>Admin ID</div><div style={{fontSize:11.5,fontFamily:'monospace',color:'#374151',fontWeight:600,wordBreak:'break-all'}}>{user.adminId}</div></div>)}
                    </div>
                    <button className="afd-dropdown-item" onClick={()=>{setUserDropOpen(false);setActiveMenu('settings');}}><User size={15}/> Account Settings</button>
                    <div className="afd-dropdown-divider"/>
                    <button className="afd-dropdown-item afd-dropdown-item--danger" onClick={()=>{setUserDropOpen(false);setShowLogout(true);}}><LogOut size={15}/> Logout</button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="afd-content">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;