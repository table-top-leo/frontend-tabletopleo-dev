"use client";
import { useState } from "react";
import {
  Sparkles, Check, X, ShoppingBag, Utensils, Users, CreditCard,
  Building2, Download, ArrowUpRight, ShieldCheck, Info,
} from "lucide-react";
import { FaCrown } from "react-icons/fa";
import { MdOutlineReceiptLong } from "react-icons/md";
import "../adminbillingcomponent/AdminBilling.css";
import { useLanguage } from "../context/LanguageContext";

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
function buildUsage(t) {
  return [
    { label: t("ab_usage_orders"), used: 142, limit: 200, icon: ShoppingBag },
    { label: t("ab_usage_items"),  used: 48,  limit: 60,  icon: Utensils },
    { label: t("ab_usage_team"),   used: 2,   limit: 3,   icon: Users },
  ];
}

// ── Dummy plan catalogue ──
function buildPlans(t) {
  return [
    {
      key: "free",
      name: t("ab_plan_free_name"),
      tagline: t("ab_plan_free_tagline"),
      price: "$0",
      period: "/forever",
      current: true,
      features: [
        { text: t("ab_feat_orders200"), on: true },
        { text: t("ab_feat_items60"), on: true },
        { text: t("ab_feat_qr"), on: true },
        { text: t("ab_feat_team3"), on: true },
        { text: t("ab_feat_kiosk"), on: false },
        { text: t("ab_feat_priority_support"), on: false },
      ],
    },
    {
      key: "pro",
      name: t("ab_plan_pro_name"),
      tagline: t("ab_plan_pro_tagline"),
      price: "$29",
      period: "/month",
      recommended: true,
      features: [
        { text: t("ab_feat_unlim_orders"), on: true },
        { text: t("ab_feat_unlim_items"), on: true },
        { text: t("ab_feat_qr_kiosk"), on: true },
        { text: t("ab_feat_team15"), on: true },
        { text: t("ab_feat_adv_analytics"), on: true },
        { text: t("ab_feat_priority_support"), on: true },
      ],
    },
    {
      key: "enterprise",
      name: t("ab_plan_enterprise_name"),
      tagline: t("ab_plan_enterprise_tagline"),
      price: "Custom",
      period: "",
      features: [
        { text: t("ab_feat_everything_pro"), on: true },
        { text: t("ab_feat_unlim_team"), on: true },
        { text: t("ab_feat_multi_location"), on: true },
        { text: t("ab_feat_custom_int"), on: true },
        { text: t("ab_feat_dedicated_mgr"), on: true },
        { text: t("ab_feat_sla"), on: true },
      ],
    },
  ];
}

// ── Dummy billing history (would come from a real /api/admin/billing/invoices endpoint) ──
function buildBillingHistory(t) {
  return [
    { id: "INV-2026-0005", desc: `${t("ab_free_plan_name")} — July 2026`,              date: "Jul 1, 2026", amount: 0,    status: "free" },
    { id: "INV-2026-0004", desc: `${t("ab_free_plan_name")} — June 2026`,               date: "Jun 1, 2026", amount: 0,    status: "free" },
    { id: "INV-2026-0003", desc: "SMS Notifications Add-on",            date: "May 14, 2026", amount: 4.99, status: "paid" },
    { id: "INV-2026-0002", desc: `${t("ab_free_plan_name")} — May 2026`,                date: "May 1, 2026", amount: 0,    status: "free" },
    { id: "INV-2026-0001", desc: `Account Created — ${t("ab_free_plan_name")} Activated`, date: "Apr 18, 2026", amount: 0,  status: "free" },
  ];
}

function usagePct(used, limit) {
  return Math.min(100, Math.round((used / limit) * 100));
}

export default function AdminBilling() {
  const { t } = useLanguage();
  const USAGE = buildUsage(t);
  const PLANS = buildPlans(t);
  const BILLING_HISTORY = buildBillingHistory(t);
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
          <h1 className="abill-title">{t("ab_header_title")}</h1>
          <p className="abill-subtitle">{t("ab_header_sub")}</p>
        </div>
      </div>

      {/* ── Current plan hero ── */}
      <div className="abill-hero">
        <div className="abill-hero-top">
          <div>
            <div className="abill-hero-plan-label">
              {t("ab_current_plan")}
              <span className="abill-hero-active-pill">
                <ShieldCheck size={11} /> {t("ab_active")}
              </span>
            </div>
            <div className="abill-hero-plan-name">
              {t("ab_free_plan_name")} <span className="abill-hero-plan-price">{PLANS[0].price}{PLANS[0].period}</span>
            </div>
            <div className="abill-hero-desc">
              {t("ab_free_plan_desc")}
            </div>
          </div>
          <button className="abill-upgrade-btn">
            <FaCrown size={14} /> {t("ab_upgrade_to_pro")} <ArrowUpRight size={15} />
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
          <div className="abill-section-title">{t("ab_available_plans")}</div>
          <div className="abill-section-sub">{t("ab_available_plans_sub")}</div>
        </div>
      </div>

      <div className="abill-plans-grid">
        {PLANS.map((p) => (
          <div
            key={p.key}
            className={`abill-plan-card ${p.recommended ? "abill-plan-recommended" : ""} ${p.current ? "abill-plan-current" : ""}`}
          >
            {p.recommended && <div className="abill-plan-badge">{t("ab_most_popular")}</div>}
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
              {p.current ? t("ab_current_plan_btn") : p.key === "enterprise" ? t("ab_contact_sales") : t("ab_upgrade_to_pro")}
            </button>
          </div>
        ))}
      </div>

      {/* ── Payment method + Billing details ── */}
      <div className="abill-section-head">
        <div>
          <div className="abill-section-title">{t("ab_payment_billing_details")}</div>
          <div className="abill-section-sub">{t("ab_payment_billing_sub")}</div>
        </div>
      </div>

      <div className="abill-two-col">
        <div className="abill-card">
          <div className="abill-card-title"><CreditCard size={16} /> {t("ab_payment_method")}</div>
          <div className="abill-card-sub">{t("ab_payment_method_sub")}</div>
          <div className="abill-pm-empty">
            <CreditCard size={26} color="#9096a2" strokeWidth={1.5} />
            <div className="abill-pm-empty-title">{t("ab_no_payment_method")}</div>
            <div className="abill-pm-empty-sub">{t("ab_add_payment_now")}</div>
            <button className="abill-pm-add-btn"><CreditCard size={13} /> {t("ab_add_payment_method_btn")}</button>
          </div>
        </div>

        <div className="abill-card">
          <div className="abill-card-title"><Building2 size={16} /> {t("ab_billing_info")}</div>
          <div className="abill-card-sub">{t("ab_billing_info_sub")}</div>
          <div className="abill-field">
            <label className="abill-field-label">{t("ab_legal_name")}</label>
            <input
              className="abill-field-input"
              placeholder={t("ab_legal_name_ph")}
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
            />
          </div>
          <div className="abill-field-row">
            <div className="abill-field">
              <label className="abill-field-label">{t("ab_tax_id")}</label>
              <input
                className="abill-field-input"
                placeholder={t("ab_tax_id_ph")}
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
            </div>
            <div className="abill-field">
              <label className="abill-field-label">{t("ab_billing_email")}</label>
              <input
                className="abill-field-input"
                placeholder={t("ab_billing_email_ph")}
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
              />
            </div>
          </div>
          <button className="abill-save-btn">{t("ab_save_details")}</button>
        </div>
      </div>

      {/* ── Billing history ── */}
      <div className="abill-section-head">
        <div>
          <div className="abill-section-title">{t("ab_billing_history")}</div>
          <div className="abill-section-sub">{t("ab_billing_history_sub")}</div>
        </div>
      </div>

      <div className="abill-panel">
        <div className="abill-panel-head">
          <div className="abill-panel-head-title"><Sparkles size={16} /> {t("ab_invoices_purchases")}</div>
          <button className="abill-download-all"><Download size={13} /> {t("ab_download_all")}</button>
        </div>

        <div className="abill-table-wrap">
          <table className="abill-table">
            <thead>
              <tr>
                <th className="abill-th">{t("ab_th_description")}</th>
                <th className="abill-th">{t("ab_th_date")}</th>
                <th className="abill-th abill-right">{t("ab_th_amount")}</th>
                <th className="abill-th">{t("ab_th_status")}</th>
                <th className="abill-th abill-right">{t("ab_th_invoice")}</th>
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
                      {row.status === "paid" ? t("ab_status_paid") : t("ab_status_free")}
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
          <Info size={13} /> {t("ab_demo_note")}
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
