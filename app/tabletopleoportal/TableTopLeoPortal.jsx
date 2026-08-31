"use client";
import { useEffect, useState } from "react";
import {
  Search, Bell, Settings, HelpCircle, LogOut, LayoutGrid, Store,
  Trash2, CreditCard, ShieldCheck, Globe, Mail, Star, ArrowRight,
  Users, TrendingUp, Sparkles,
} from "lucide-react";
import { MdVerified } from "react-icons/md";
import "../tabletopleoportal/designtabletopleoportal.css";

import OverviewTab from "../tabletopleoportal/components/OverviewTab";
import MerchantsTab from "../tabletopleoportal/components/MerchantsTab";
import DeletionRequestsTab from "../tabletopleoportal/components/DeletionRequestsTab";
import SubscriptionsTab from "../tabletopleoportal/components/SubscriptionsTab";
import EmailSupportTab from "../tabletopleoportal/components/EmailSupportTab";
import ReviewsTab from "../tabletopleoportal/components/ReviewsTab";
import platformMerchantService from "../tabletopleoportal/platformMerchantService";

const TABS = [
  { id: "overview",     label: "Overview",             icon: LayoutGrid },
  { id: "merchants",    label: "Merchants",             icon: Store },
  { id: "deletions",    label: "Deletion Requests",     icon: Trash2 },
  { id: "subscriptions",label: "Subscriptions",         icon: CreditCard },
  { id: "support",      label: "Email Support",         icon: Mail },
  { id: "reviews",      label: "Reviews",               icon: Star },
];

// ── Welcome landing screen — shown once, before any tab is picked ──
function WelcomeScreen({ operatorName, dateStr, merchantCount, onEnter }) {
  return (
    <div className="ttlp-welcome">
      <div className="ttlp-welcome-inner">
        <div className="ttlp-welcome-art" aria-hidden="true">
          <svg viewBox="0 0 480 480" width="100%" height="100%">
            <defs>
              <radialGradient id="ttlpGlow" cx="50%" cy="42%" r="60%">
                <stop offset="0%" stopColor="#2b7a70" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#2b7a70" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="ttlpRing1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2b7a70" />
                <stop offset="100%" stopColor="#1f5b53" />
              </linearGradient>
              <linearGradient id="ttlpRing2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b8873a" />
                <stop offset="100%" stopColor="#d9ac5c" />
              </linearGradient>
              <linearGradient id="ttlpCard" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f6f8fa" />
              </linearGradient>
              <filter id="ttlpSoftShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#17202e" floodOpacity="0.14" />
              </filter>
            </defs>

            <circle cx="240" cy="220" r="200" fill="url(#ttlpGlow)" />

            <circle cx="240" cy="220" r="150" fill="none" stroke="url(#ttlpRing1)" strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="2 10" strokeLinecap="round" className="ttlp-welcome-spin-slow" />
            <circle cx="240" cy="220" r="118" fill="none" stroke="url(#ttlpRing2)" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="1 8" strokeLinecap="round" className="ttlp-welcome-spin-rev" />

            {/* Center brand medallion */}
            <g filter="url(#ttlpSoftShadow)">
              <circle cx="240" cy="220" r="66" fill="url(#ttlpRing1)" />
            </g>
            <circle cx="240" cy="220" r="66" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
            <g transform="translate(212,192)">
              <path d="M28 0 L52 14 V38 L28 52 L4 38 V14 Z" fill="#ffffff" opacity="0.95" />
              <path d="M28 8 L44 17.5 V33 L28 42.5 L12 33 V17.5 Z" fill="url(#ttlpRing1)" />
              <path d="M28 16 L36 20.5 V29 L28 33.5 L20 29 V20.5 Z" fill="#ffffff" />
            </g>

            {/* Floating stat card — merchants */}
            <g className="ttlp-welcome-float-a">
              <rect x="52" y="88" width="132" height="56" rx="14" fill="url(#ttlpCard)" stroke="#e3e7ed" filter="url(#ttlpSoftShadow)" />
              <circle cx="80" cy="116" r="14" fill="#e7f3f1" />
              <path d="M74 116 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0" fill="none" stroke="#2b7a70" strokeWidth="1.6" />
              <rect x="102" y="105" width="66" height="8" rx="4" fill="#dfe3e9" />
              <rect x="102" y="118" width="44" height="7" rx="3.5" fill="#eceff2" />
            </g>

            {/* Floating stat card — revenue */}
            <g className="ttlp-welcome-float-b">
              <rect x="288" y="290" width="140" height="58" rx="14" fill="url(#ttlpCard)" stroke="#e3e7ed" filter="url(#ttlpSoftShadow)" />
              <circle cx="316" cy="319" r="14" fill="#f8f0e0" />
              <path d="M310 322 l4 -8 l4 5 l6 -10" fill="none" stroke="#b8873a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="340" y="308" width="70" height="8" rx="4" fill="#dfe3e9" />
              <rect x="340" y="321" width="48" height="7" rx="3.5" fill="#eceff2" />
            </g>

            {/* Floating badge — verified/status */}
            <g className="ttlp-welcome-float-c">
              <circle cx="380" cy="120" r="26" fill="url(#ttlpCard)" stroke="#e3e7ed" filter="url(#ttlpSoftShadow)" />
              <path d="M370 120 l7 7 l14 -15" fill="none" stroke="#1c8a52" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Floating dot cluster */}
            <g className="ttlp-welcome-float-d" opacity="0.55">
              <circle cx="96" cy="330" r="5" fill="#b8873a" />
              <circle cx="118" cy="352" r="3.5" fill="#2b7a70" />
              <circle cx="80" cy="356" r="3" fill="#2b7a70" />
            </g>
          </svg>
        </div>

        <div className="ttlp-welcome-badge"><Sparkles size={12} /> Operations Portal</div>
        <div className="ttlp-welcome-date">{dateStr}</div>
        <h1 className="ttlp-welcome-title">Welcome back, {operatorName.split(" ")[0]}</h1>
        <p className="ttlp-welcome-sub">
          Everything you need to keep TableTop Leo running smoothly — merchant activity,
          account deletions, subscription health, and support, all in one place.
        </p>

        <div className="ttlp-welcome-stats">
          <div className="ttlp-welcome-stat">
            <Users size={14} />
            <span><strong>{merchantCount}</strong> merchants onboarded</span>
          </div>
          <div className="ttlp-welcome-stat">
            <TrendingUp size={14} />
            <span>Live platform data</span>
          </div>
        </div>

        <button className="ttlp-welcome-cta" onClick={onEnter}>
          Go to Overview <ArrowRight size={15} />
        </button>
      </div>

      <style>{`
        .ttlp-welcome {
          display: flex; align-items: center; justify-content: center;
          min-height: 62vh; padding: 40px 24px;
        }
        .ttlp-welcome-inner {
          display: flex; flex-direction: column; align-items: center; text-align: center;
          max-width: 560px;
        }
        .ttlp-welcome-art { width: 300px; height: 300px; margin-bottom: 8px; }
        .ttlp-welcome-spin-slow { transform-origin: 240px 220px; animation: ttlpSpin 22s linear infinite; }
        .ttlp-welcome-spin-rev { transform-origin: 240px 220px; animation: ttlpSpin 16s linear infinite reverse; }
        .ttlp-welcome-float-a { animation: ttlpFloat 5.5s ease-in-out infinite; }
        .ttlp-welcome-float-b { animation: ttlpFloat 6.5s ease-in-out infinite 0.4s; }
        .ttlp-welcome-float-c { animation: ttlpFloat 4.8s ease-in-out infinite 0.2s; }
        .ttlp-welcome-float-d { animation: ttlpFloat 7s ease-in-out infinite 0.6s; }
        @keyframes ttlpSpin { to { transform: rotate(360deg); } }
        @keyframes ttlpFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }

        .ttlp-welcome-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: var(--ttlp-r-full);
          background: var(--ttlp-gold-tint); color: var(--ttlp-gold);
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.02em;
          margin-bottom: 14px;
        }
        .ttlp-welcome-date { font-size: 12.5px; color: var(--ttlp-ink-mute); margin-bottom: 6px; }
        .ttlp-welcome-title {
          font-size: 30px; font-weight: 800; color: var(--ttlp-ink);
          margin: 0 0 10px; letter-spacing: -0.02em;
        }
        .ttlp-welcome-sub {
          font-size: 14.5px; color: var(--ttlp-ink-soft); line-height: 1.6;
          margin: 0 0 22px; max-width: 460px;
        }
        .ttlp-welcome-stats {
          display: flex; align-items: center; gap: 18px; margin-bottom: 26px;
          font-size: 13px; color: var(--ttlp-ink-soft); font-weight: 600;
        }
        .ttlp-welcome-stat { display: flex; align-items: center; gap: 7px; color: var(--ttlp-accent); }
        .ttlp-welcome-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 26px; border: none; border-radius: var(--ttlp-r-md);
          background: var(--ttlp-accent); color: var(--ttlp-accent-dim);
          font-size: 14px; font-weight: 700; cursor: pointer;
          box-shadow: var(--ttlp-shadow-sm);
          transition: background 0.15s, transform 0.15s;
        }
 
      `}</style>
    </div>
  );
}

export default function TableTopLeoPortal({ operatorName = "Operations Admin" }) {
  const [activeTab, setActiveTab] = useState(null); // null = welcome screen
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    let cancelled = false;
    platformMerchantService.getAllMerchants()
      .then((res) => { if (!cancelled && res?.success) setMerchants(res.data || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // A merchant counts toward "Subscriptions" once they're on any status
  // other than the implicit free tier (no subscription row, or an
  // explicit FREE status, both mean "not a paying subscriber").
  const paidSubscriberCount = merchants.filter(
    (m) => (m.subscriptionStatus || "FREE") !== "FREE"
  ).length;

  const tabCounts = {
    overview: null,
    merchants: merchants.length,
    deletions: null,
    subscriptions: paidSubscriberCount,
    support: null,
    reviews: null,
  };

  // Rendered as a fixed placeholder on the server AND on the client's
  // first paint, then swapped to the real formatted date right after
  // mount. Calling toLocaleDateString() directly during render caused a
  // hydration mismatch — the server's Node runtime and the browser can
  // resolve `undefined` locale to different default formats (e.g.
  // "19 Aug 2026" vs "Aug 19, 2026"), so the SSR pass and the client
  // pass produced different text for the same Date object.
  const [dateStr, setDateStr] = useState("");
  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }));
  }, []);

  return (
    <div className="ttlp-root">
      {/* ── Utility strip ── */}
      <div className="ttlp-utilstrip">
        <span className="ttlp-utilstrip-dot" />
        <span>TableTop Leo Operations Portal · Internal use only</span>
        <div className="ttlp-utilstrip-right">
          <a className="ttlp-utilstrip-link" href="#"><Globe size={12} /> EN (US)</a>
          <a className="ttlp-utilstrip-link" href="#"><ShieldCheck size={12} /> System status: Operational</a>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="ttlp-header">
        <div className="ttlp-header-row">
          <div className="ttlp-brand" style={{ cursor: "pointer" }} onClick={() => setActiveTab(null)}>
            <div className="ttlp-brand-mark"><MdVerified size={22} /></div>
            <div className="ttlp-brand-text">
              <div className="ttlp-brand-name">TableTop Leo</div>
              <div className="ttlp-brand-sub">Operations Portal</div>
            </div>
          </div>

          <div className="ttlp-header-spacer" />

          <div className="ttlp-search">
            <Search size={14} />
            <input placeholder="Search merchants, requests, admin ID..." aria-label="Search" />
          </div>

          <div className="ttlp-header-icons">
            <button className="ttlp-icon-btn" aria-label="Notifications">
              <Bell size={17} />
              <span className="ttlp-icon-btn-badge" />
            </button>
            <button className="ttlp-icon-btn" aria-label="Help"><HelpCircle size={17} /></button>
            <button className="ttlp-icon-btn" aria-label="Settings"><Settings size={17} /></button>
            <button className="ttlp-icon-btn" aria-label="Sign out"><LogOut size={17} /></button>
            <div className="ttlp-avatar">{operatorName.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
          </div>
        </div>

        {activeTab !== null && (
          <div className="ttlp-greeting-row">
            <div>
              <div className="ttlp-greeting-date">{dateStr}</div>
              <h1 className="ttlp-greeting-title">Welcome back, {operatorName}</h1>
              <p className="ttlp-greeting-sub">
                Monitor merchant activity, review account deletion requests, and track subscription
                health across the TableTop Leo platform.
              </p>
            </div>
          </div>
        )}

        <nav className="ttlp-tabbar" aria-label="Portal sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const count = tabCounts[tab.id];
            return (
              <button
                key={tab.id}
                className={`ttlp-tab ${active ? "ttlp-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} />
                {tab.label}
                {count != null && <span className="ttlp-tab-count">{count}</span>}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── Body ── */}
      <main className="ttlp-body">
        {activeTab === null && (
          <WelcomeScreen
            operatorName={operatorName}
            dateStr={dateStr}
            merchantCount={merchants.length}
            onEnter={() => setActiveTab("overview")}
          />
        )}
        {activeTab === "overview" && <OverviewTab onNavigate={setActiveTab} />}
        {activeTab === "merchants" && <MerchantsTab />}
        {activeTab === "deletions" && <DeletionRequestsTab />}
        {activeTab === "subscriptions" && <SubscriptionsTab />}
        {activeTab === "support" && <EmailSupportTab />}
        {activeTab === "reviews" && <ReviewsTab />}
      </main>
    </div>
  );
}