"use client";
import { useState } from "react";
import {
  Sparkles, Check, X, ShoppingBag, Utensils, Users, CreditCard,
  Building2, Download, ArrowUpRight, ShieldCheck, Info,
} from "lucide-react";
import { FaCrown } from "react-icons/fa";
import { MdOutlineReceiptLong } from "react-icons/md";
import "../adminbillingcomponent/AdminBilling.css";

/* ============================================================
   AdminBilling — Billing & Subscription page.

   IMPORTANT: There is currently no billing/subscription module
   on the backend (no plan, invoice, or payment-method tables or
   endpoints exist yet). Every account is effectively on the
   Free plan. Everything below is UI-only, with clearly-dummy
   placeholder data, ready to be wired up once a real billing
   backend (Stripe Billing / Razorpay Subscriptions / a custom
   plan+invoice service) is built. See the "What to build next"
   notes at the bottom of this file for what a real backend
   would need to expose.
   ============================================================ */

// ── Dummy usage data (would come from a real /api/admin/usage endpoint) ──
const USAGE = [
  { label: "Orders this month", used: 142, limit: 200, icon: ShoppingBag },
  { label: "Menu Items",        used: 48,  limit: 60,  icon: Utensils },
  { label: "Team Members",      used: 2,   limit: 3,   icon: Users },
];

// ── Dummy plan catalogue ──
const PLANS = [
  {
    key: "free",
    name: "Free",
    tagline: "Everything you need to get your first orders live.",
    price: "$0",
    period: "/forever",
    current: true,
    features: [
      { text: "Up to 200 orders / month", on: true },
      { text: "Up to 60 menu items", on: true },
      { text: "QR code menu ordering", on: true },
      { text: "Up to 3 team members", on: true },
      { text: "Kiosk & self-service ordering", on: false },
      { text: "Priority support", on: false },
    ],
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "For growing restaurants ready to scale up.",
    price: "$29",
    period: "/month",
    recommended: true,
    features: [
      { text: "Unlimited orders", on: true },
      { text: "Unlimited menu items", on: true },
      { text: "QR code + Kiosk ordering", on: true },
      { text: "Up to 15 team members", on: true },
      { text: "Advanced analytics & reports", on: true },
      { text: "Priority support", on: true },
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "Custom limits, SLAs and dedicated support.",
    price: "Custom",
    period: "",
    features: [
      { text: "Everything in Pro", on: true },
      { text: "Unlimited team members", on: true },
      { text: "Multi-location management", on: true },
      { text: "Custom integrations & API access", on: true },
      { text: "Dedicated account manager", on: true },
      { text: "99.9% uptime SLA", on: true },
    ],
  },
];

// ── Dummy billing history (would come from a real /api/admin/billing/invoices endpoint) ──
const BILLING_HISTORY = [
  { id: "INV-2026-0005", desc: "Free Plan — July 2026",              date: "Jul 1, 2026", amount: 0,    status: "free" },
  { id: "INV-2026-0004", desc: "Free Plan — June 2026",               date: "Jun 1, 2026", amount: 0,    status: "free" },
  { id: "INV-2026-0003", desc: "SMS Notifications Add-on",            date: "May 14, 2026", amount: 4.99, status: "paid" },
  { id: "INV-2026-0002", desc: "Free Plan — May 2026",                date: "May 1, 2026", amount: 0,    status: "free" },
  { id: "INV-2026-0001", desc: "Account Created — Free Plan Activated", date: "Apr 18, 2026", amount: 0,  status: "free" },
];

function usagePct(used, limit) {
  return Math.min(100, Math.round((used / limit) * 100));
}

export default function AdminBilling() {
  const [billingEmail, setBillingEmail] = useState("");
  const [legalName, setLegalName]       = useState("");
  const [taxId, setTaxId]               = useState("");

  return (
    <div className="abill-root">
      {/* ── Header ── */}
      <div className="abill-header">
        <div className="abill-logo">
          <MdOutlineReceiptLong color="#fff" size={26} />
        </div>
        <div>
          <h1 className="abill-title">Billing &amp; Subscription</h1>
          <p className="abill-subtitle">Manage your plan, track usage and review invoices</p>
        </div>
      </div>

      {/* ── Current plan hero ── */}
      <div className="abill-hero">
        <div className="abill-hero-top">
          <div>
            <div className="abill-hero-plan-label">
              Current Plan
              <span className="abill-hero-active-pill">
                <ShieldCheck size={11} /> Active
              </span>
            </div>
            <div className="abill-hero-plan-name">
              Free Plan <span className="abill-hero-plan-price">{PLANS[0].price}{PLANS[0].period}</span>
            </div>
            <div className="abill-hero-desc">
              You're on the Free plan — perfect for getting started. Upgrade to Pro anytime to unlock
              unlimited orders, kiosk ordering and advanced analytics.
            </div>
          </div>
          <button className="abill-upgrade-btn">
            <FaCrown size={14} /> Upgrade to Pro <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="abill-hero-usage">
          {USAGE.map((u) => {
            const pct = usagePct(u.used, u.limit);
            const warn = pct >= 80;
            const Icon = u.icon;
            return (
              <div key={u.label}>
                <div className="abill-usage-item-top">
                  <span className="abill-usage-label"><Icon size={14} /> {u.label}</span>
                  <span className="abill-usage-count">{u.used}/{u.limit}</span>
                </div>
                <div className="abill-usage-bar-track">
                  <div
                    className={`abill-usage-bar-fill ${warn ? "abill-usage-warn" : ""}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Plan comparison ── */}
      <div className="abill-section-head">
        <div>
          <div className="abill-section-title">Available Plans</div>
          <div className="abill-section-sub">Compare plans and upgrade whenever you're ready</div>
        </div>
      </div>

      <div className="abill-plans-grid">
        {PLANS.map((p) => (
          <div
            key={p.key}
            className={`abill-plan-card ${p.recommended ? "abill-plan-recommended" : ""} ${p.current ? "abill-plan-current" : ""}`}
          >
            {p.recommended && <div className="abill-plan-badge">Most Popular</div>}
            <div className="abill-plan-name">{p.name}</div>
            <div className="abill-plan-tagline">{p.tagline}</div>
            <div className="abill-plan-price-row">
              <span className="abill-plan-price">{p.price}</span>
              {p.period && <span className="abill-plan-period">{p.period}</span>}
            </div>
            <div className="abill-plan-features">
              {p.features.map((f) => (
                <div key={f.text} className={`abill-plan-feature ${!f.on ? "abill-feature-off" : ""}`}>
                  {f.on ? <Check size={15} color="#0f9d58" /> : <X size={15} color="#c5c9d0" />}
                  {f.text}
                </div>
              ))}
            </div>
            <button
              className={`abill-plan-btn ${p.current ? "abill-plan-btn-current" : p.recommended ? "abill-plan-btn-primary" : ""}`}
              disabled={p.current}
            >
              {p.current ? "Current Plan" : p.key === "enterprise" ? "Contact Sales" : "Upgrade to Pro"}
            </button>
          </div>
        ))}
      </div>

      {/* ── Payment method + Billing details ── */}
      <div className="abill-section-head">
        <div>
          <div className="abill-section-title">Payment &amp; Billing Details</div>
          <div className="abill-section-sub">Used automatically once you upgrade to a paid plan</div>
        </div>
      </div>

      <div className="abill-two-col">
        <div className="abill-card">
          <div className="abill-card-title"><CreditCard size={16} /> Payment Method</div>
          <div className="abill-card-sub">No card is charged while you're on the Free plan</div>
          <div className="abill-pm-empty">
            <CreditCard size={26} color="#9096a2" strokeWidth={1.5} />
            <div className="abill-pm-empty-title">No payment method on file</div>
            <div className="abill-pm-empty-sub">Add one now so upgrading later is instant</div>
            <button className="abill-pm-add-btn"><CreditCard size={13} /> Add Payment Method</button>
          </div>
        </div>

        <div className="abill-card">
          <div className="abill-card-title"><Building2 size={16} /> Billing Information</div>
          <div className="abill-card-sub">Used on future invoices and tax receipts</div>
          <div className="abill-field">
            <label className="abill-field-label">Business Legal Name</label>
            <input
              className="abill-field-input"
              placeholder="e.g. Tabesto Foods Pvt. Ltd."
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
            />
          </div>
          <div className="abill-field-row">
            <div className="abill-field">
              <label className="abill-field-label">GSTIN / Tax ID</label>
              <input
                className="abill-field-input"
                placeholder="Optional"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
            </div>
            <div className="abill-field">
              <label className="abill-field-label">Billing Email</label>
              <input
                className="abill-field-input"
                placeholder="billing@yourbusiness.com"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
              />
            </div>
          </div>
          <button className="abill-save-btn">Save Details</button>
        </div>
      </div>

      {/* ── Billing history ── */}
      <div className="abill-section-head">
        <div>
          <div className="abill-section-title">Billing History</div>
          <div className="abill-section-sub">Every invoice and add-on purchase on your account</div>
        </div>
      </div>

      <div className="abill-panel">
        <div className="abill-panel-head">
          <div className="abill-panel-head-title"><Sparkles size={16} /> Invoices &amp; Purchases</div>
          <button className="abill-download-all"><Download size={13} /> Download All</button>
        </div>

        <div className="abill-table-wrap">
          <table className="abill-table">
            <thead>
              <tr>
                <th className="abill-th">Description</th>
                <th className="abill-th">Date</th>
                <th className="abill-th abill-right">Amount</th>
                <th className="abill-th">Status</th>
                <th className="abill-th abill-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {BILLING_HISTORY.map((row) => (
                <tr key={row.id} className="abill-row">
                  <td className="abill-td">
                    <div className="abill-inv-icon-cell">
                      <div className="abill-inv-icon"><MdOutlineReceiptLong size={16} color="#5b616e" /></div>
                      <div>
                        <div className="abill-inv-desc">{row.desc}</div>
                        <div className="abill-inv-id">{row.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="abill-td">{row.date}</td>
                  <td className="abill-td abill-right">
                    <span className={`abill-amount ${row.amount === 0 ? "abill-amount-zero" : ""}`}>
                      {row.amount === 0 ? "$0.00" : `$${row.amount.toFixed(2)}`}
                    </span>
                  </td>
                  <td className="abill-td">
                    <span className={`abill-status-pill ${row.status === "paid" ? "abill-status-paid" : "abill-status-free"}`}>
                      <span className="abill-status-dot" />
                      {row.status === "paid" ? "Paid" : "Free"}
                    </span>
                  </td>
                  <td className="abill-td abill-right">
                    <button className="abill-dl-btn" title="Download invoice">
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="abill-demo-note">
          <Info size={13} /> Sample data shown — connect a billing provider to replace this with real invoices.
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   What to build next (backend), when you're ready for real billing:

   1. Subscription/Plan module
      - PlanConfiguration table (planKey, name, price, orderLimit,
        menuItemLimit, teamMemberLimit, features JSON)
      - AdminSubscription table (adminId, planKey, status, renewsAt)
      - GET  /api/admin/billing/subscription  → current plan + usage
      - POST /api/admin/billing/upgrade       → Stripe/Razorpay checkout session

   2. Invoices
      - Invoice table (adminId, invoiceNumber, description, amount,
        status, issuedAt, pdfUrl)
      - GET /api/admin/billing/invoices       → paginated invoice history
      - GET /api/admin/billing/invoices/{id}/pdf → download

   3. Payment method on file
      - Store a Stripe/Razorpay customer + default payment method
        reference (never raw card data) against the admin
      - GET/POST/DELETE /api/admin/billing/payment-method

   4. Usage counters
      - Either compute live (COUNT orders this month, COUNT menu
        items, COUNT team members) or maintain a rolling usage
        counter table for speed at scale
      - GET /api/admin/billing/usage
   ============================================================ */
