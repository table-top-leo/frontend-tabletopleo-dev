"use client";
import { useState } from "react";
import {
  Search, Bell, Settings, HelpCircle, LogOut, LayoutGrid, Store,
  Trash2, CreditCard, ShieldCheck, Globe, Mail, Star,
} from "lucide-react";
import { MdVerified } from "react-icons/md";
import "../tabletopleoportal/designtabletopleoportal.css";

import OverviewTab from "../tabletopleoportal/components/OverviewTab";
import MerchantsTab from "../tabletopleoportal/components/MerchantsTab";
import DeletionRequestsTab from "../tabletopleoportal/components/DeletionRequestsTab";
import SubscriptionsTab from "../tabletopleoportal/components/SubscriptionsTab";
import EmailSupportTab from "../tabletopleoportal/components/EmailSupportTab";
import ReviewsTab from "../tabletopleoportal/components/ReviewsTab";
import { MERCHANTS, SUBSCRIPTIONS } from "../tabletopleoportal/data";

const TABS = [
  { id: "overview",     label: "Overview",             icon: LayoutGrid },
  { id: "merchants",    label: "Merchants",             icon: Store },
  { id: "deletions",    label: "Deletion Requests",     icon: Trash2 },
  { id: "subscriptions",label: "Subscriptions",         icon: CreditCard },
  { id: "support",      label: "Email Support",         icon: Mail },
  { id: "reviews",      label: "Reviews",               icon: Star },
];

export default function TableTopLeoPortal({ operatorName = "Operations Admin" }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabCounts = {
    overview: null,
    merchants: MERCHANTS.length,
    deletions: null,
    subscriptions: SUBSCRIPTIONS.filter((s) => s.plan !== "Free").length,
    support: null,
    reviews: null,
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short", year: "numeric" });

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
          <div className="ttlp-brand">
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