"use client";
import { useState } from "react";
import {
  CreditCard, Printer, ScanLine, Wallet,
  CheckCircle2, X, Send, Loader2, Sparkles, ShieldCheck, Truck,
  FileText, Download, Clock, Globe2, TrendingUp,
  Handshake, Building2, Percent, Headset, ArrowRight,
  Package, Layers, Zap, Mail, Phone, ChevronRight,
} from "lucide-react";
import { FaApple, FaGooglePlay, FaCrown } from "react-icons/fa";
import "../inventorypage/InventoryPage.css";
import { useLanguage } from "../context/LanguageContext";

 

const KIOSKS = [
  {
    id: "mini",
    name: "TableTop Leo Kiosk — Mini",
    tag: "Best for Cafés & Small Counters",
    size: "15.6″ Countertop",
    image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1000&q=80",
    tagline: "Compact self-service ordering that fits on any counter.",
    features: ["15.6″ HD capacitive touchscreen", "Countertop footprint — no floor stand needed", "Built-in Wi-Fi & Ethernet", "4–6 hr setup, plug-and-play"],
    badge: null,
  },
  {
    id: "pro",
    name: "TableTop Leo Kiosk — Pro",
    tag: "Best for QSR & Fast Casual",
    size: "21.5″ Freestanding",
    image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1000&q=80",
    tagline: "Our most popular floor-standing kiosk for high foot-traffic locations.",
    features: ["21.5″ Full-HD touchscreen", "Freestanding floor unit with cable management", "Optional receipt printer bay", "Card reader + NFC tap-to-pay ready"],
    badge: "Most Popular",
  },
  {
    id: "elite",
    name: "TableTop Leo Kiosk — Elite",
    tag: "Best for High-Volume Restaurants",
    size: "27″ Premium Freestanding",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1000&q=80",
    tagline: "Flagship kiosk built for restaurants that never slow down.",
    features: ["27″ 4K touchscreen with anti-glare glass", "Integrated thermal receipt printer", "Dual card reader + QR scanner bay", "Industrial-grade, 24/7 duty cycle"],
    badge: "Flagship",
  },
  {
    id: "wall",
    name: "TableTop Leo Kiosk — Wall",
    tag: "Best for Space-Constrained Stores",
    size: "18.5″ Wall-Mounted",
    image: "https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=1000&q=80",
    tagline: "All the self-service power, zero floor space used.",
    features: ["18.5″ touchscreen, slim wall-mount bracket", "Ideal for narrow entryways & food courts", "Weather-resistant option available", "Same software as every other kiosk"],
    badge: null,
  },
];

const ACCESSORIES = [
  { icon: Printer,    name: "Thermal Receipt Printer", desc: "Fast, quiet order & bill printing add-on." },
  { icon: CreditCard, name: "Card & NFC Reader",       desc: "Tap, chip and swipe — bundled or standalone." },
  { icon: ScanLine,   name: "QR / Barcode Scanner",    desc: "For loyalty cards, coupons and quick scan-to-pay." },
  { icon: Wallet,     name: "Cash Drawer",             desc: "Pairs with Pay-at-Counter for hybrid checkout." },
];

const APPS = [
  { platform: "iOS",     icon: FaApple,      name: "TableTop Leo Merchant App", desc: "Manage live orders, menu, and analytics from your iPhone or iPad." },
  { platform: "Android", icon: FaGooglePlay, name: "TableTop Leo Merchant App", desc: "The same powerful dashboard, built for Android devices." },
];

const BROCHURES = [
  { icon: FileText,   name: "Kiosk Product Catalog",         desc: "Full specs, dimensions & photos for every kiosk model.", pages: "12 pages" },
  { icon: Building2,  name: "Company Profile",               desc: "Who we are, our mission, and our roadmap.", pages: "8 pages" },
  { icon: Handshake,  name: "Partnership & Reseller Deck",   desc: "Everything about margins, territories & support.", pages: "10 pages" },
];

const PARTNERSHIPS = [
  { icon: Percent,   title: "Reseller Program",              desc: "Sell TableTop Leo kiosks and software under your own brand with partner margins." },
  { icon: Building2, title: "Restaurant Chain Partnerships", desc: "Custom rollout plans, dedicated onboarding and volume pricing for multi-location groups." },
  { icon: Truck,     title: "Bulk Hardware Orders",          desc: "Ordering 10+ kiosks? Get a dedicated account manager and priority logistics." },
];

const WHY_FEATURES = [
  { icon: Zap,         title: "QR + Kiosk Ordering",  desc: "One platform for table-side QR orders and full self-service kiosks." },
  { icon: Globe2,      title: "Multi-Country Ready",  desc: "Multi-currency, multi-language, and region-aware payment gateways." },
  { icon: TrendingUp,  title: "Real-Time Analytics",  desc: "Live sales, order trends and performance — always up to date." },
  { icon: ShieldCheck, title: "Secure Payments",      desc: "UPI, cards and international gateways, all built with security in mind." },
  { icon: Headset,     title: "Real Human Support",   desc: "A support team that actually picks up — not just a chatbot." },
  { icon: Layers,      title: "Built to Scale",       desc: "From a single café counter to a 200-location chain rollout." },
];

const STATS = [
  { value: "500+", label: "Restaurants Onboarded" },
 
  { value: "15+",  label: "Countries Supported" },
  { value: "4.9★", label: "Average Merchant Rating" },
];

export default function InventoryPage() {
  const { t } = useLanguage();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState(null);

  const openEnquiry = (kiosk) => {
    setSelectedKiosk(kiosk);
    setEnquiryOpen(true);
  };

  return (
    <div className="inv-root">
      {/* ── Top bar ── */}
      <div className="inv-topbar">
        <Sparkles size={16} color="var(--inv-gold)" />
        {t("inv_topbar_banner")}
      </div>

      {/* ── Hero ── */}
      <section className="inv-hero">
        <div className="inv-hero-blob inv-hero-blob-1" />
        <div className="inv-hero-blob inv-hero-blob-2" />

        <div className="inv-hero-inner">
          <span className="inv-hero-badge"><Package size={16} /> {t("inv_badge")}</span>
          <h1 className="inv-hero-title">
            {t("inv_hero_title1")}<br />
            <span className="inv-hero-accent">{t("inv_hero_title2")}</span>
          </h1>
          <p className="inv-hero-sub">
            {t("inv_hero_sub")}
          </p>
          <div className="inv-hero-actions">
            <a href="#kiosks" className="inv-btn inv-btn-primary">
              {t("inv_browse_kiosks")} <ArrowRight size={18} />
            </a>
            <a href="#apps" className="inv-btn inv-btn-outline">{t("inv_view_app")}</a>
          </div>
        </div>

        <div className="inv-stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="inv-stat-card">
              <div className="inv-stat-value">{s.value}</div>
              <div className="inv-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Kiosk Machines ── */}
      <section id="kiosks" className="inv-section inv-section-white">
        <div className="inv-section-head">
          <span className="inv-eyebrow">{t("inv_hardware_catalog")}</span>
          <h2 className="inv-section-title">{t("inv_kiosk_section_title")}</h2>
          <p className="inv-section-sub">
            {t("inv_kiosk_section_sub")}
          </p>
        </div>

        <div className="inv-kiosk-grid">
          {KIOSKS.map((k) => (
            <button key={k.id} className="inv-kiosk-card" onClick={() => openEnquiry(k)}>
              {k.badge && (
                <span className="inv-kiosk-badge"><FaCrown size={11} color="var(--inv-gold)" /> {k.badge}</span>
              )}
              <div className="inv-kiosk-image-wrap">
                <img className="inv-kiosk-image" src={k.image} alt={k.name} />
                <div className="inv-kiosk-scrim" />
                <span className="inv-kiosk-size-tag">{k.size}</span>
              </div>
              <div className="inv-kiosk-body">
                <span className="inv-kiosk-tag">{k.tag}</span>
                <h3 className="inv-kiosk-name">{k.name}</h3>
                <p className="inv-kiosk-tagline">{k.tagline}</p>
                <ul className="inv-kiosk-features">
                  {k.features.map((f) => (
                    <li key={f} className="inv-kiosk-feature"><CheckCircle2 size={18} /> {f}</li>
                  ))}
                </ul>
                <div className="inv-kiosk-footer">
                  <span className="inv-kiosk-price-note">{t("inv_pricing_on_enquiry")}</span>
                  <span className="inv-kiosk-cta">{t("inv_enquire_now")} <ChevronRight size={15} /></span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Accessories ── */}
      <section className="inv-section inv-section-white" style={{ paddingTop: 0 }}>
        <div className="inv-section-head">
          <span className="inv-eyebrow">{t("inv_addons")}</span>
          <h2 className="inv-section-title" style={{ fontSize: 32 }}>{t("inv_hardware_accessories")}</h2>
        </div>
        <div className="inv-accessory-grid">
          {ACCESSORIES.map((a) => {
            const Icon = a.icon;
            return (
              <button key={a.name} className="inv-accessory-card" onClick={() => openEnquiry({ id: "accessory", name: a.name, size: "Add-on" })}>
                <div className="inv-accessory-icon"><Icon size={24} /></div>
                <div className="inv-accessory-name">{a.name}</div>
                <div className="inv-accessory-desc">{a.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Mobile Apps ── */}
      <section id="apps" className="inv-section inv-section-white" style={{ background: "var(--inv-surface-2)" }}>
        <div className="inv-section-head inv-section-head-center">
          <span className="inv-eyebrow">{t("inv_mobile_app")}</span>
          <h2 className="inv-section-title">{t("inv_manage_on_go")}</h2>
          <p className="inv-section-sub">
            {t("inv_app_coming")}
          </p>
        </div>

        <div className="inv-app-grid">
          {APPS.map((app) => {
            const Icon = app.icon;
            return (
              <div key={app.platform} className="inv-app-card">
                <span className="inv-badge-progress"><Clock size={13} /> {t("inv_under_progress")}</span>
                <div className="inv-app-icon"><Icon size={30} /></div>
                <div className="inv-app-name">{app.name}</div>
                <div className="inv-app-desc">{app.desc}</div>
                <div className="inv-app-store-btn">
                  {app.platform === "iOS" ? t("inv_download_appstore") : t("inv_get_googleplay")}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Brochures ── */}
      <section className="inv-section inv-section-white">
        <div className="inv-section-head">
          <span className="inv-eyebrow">{t("inv_resources")}</span>
          <h2 className="inv-section-title" style={{ fontSize: 32 }}>{t("inv_brochures_downloads")}</h2>
        </div>
        <div className="inv-brochure-grid">
          {BROCHURES.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.name} className="inv-brochure-card">
                <div className="inv-brochure-top">
                  <div className="inv-brochure-icon"><Icon size={24} /></div>
                  <span className="inv-badge-progress"><Clock size={13} /> {t("inv_under_progress")}</span>
                </div>
                <div className="inv-brochure-name">{b.name}</div>
                <div className="inv-brochure-desc">{b.desc}</div>
                <div className="inv-brochure-footer">
                  <span className="inv-brochure-pages">{b.pages} · PDF</span>
                  <span className="inv-brochure-download"><Download size={14} /> {t("inv_coming_soon")}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Partnerships ── */}
      <section className="inv-section inv-section-dark">
        <div className="inv-section-head inv-section-head-center">
          <span className="inv-eyebrow inv-eyebrow-light">{t("inv_collaborate")}</span>
          <h2 className="inv-section-title">{t("inv_partnership_programs")}</h2>
          <p className="inv-section-sub inv-section-sub-light">
            {t("inv_partnership_sub")}
          </p>
        </div>
        <div className="inv-partner-grid">
          {PARTNERSHIPS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="inv-partner-card">
                <div className="inv-partner-top">
                  <div className="inv-partner-icon"><Icon size={24} /></div>
                  <span className="inv-badge-progress-dark"><Clock size={13} /> {t("inv_under_progress")}</span>
                </div>
                <div className="inv-partner-title">{p.title}</div>
                <div className="inv-partner-desc">{p.desc}</div>
                <button className="inv-partner-link" onClick={() => openEnquiry({ id: "partnership", name: p.title, size: "Partnership" })}>
                  {t("inv_notify_me")} <ChevronRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Why TableTop Leo ── */}
      <section className="inv-section inv-section-white">
        <div className="inv-section-head inv-section-head-center">
          <span className="inv-eyebrow">{t("inv_why_tabletopleo")}</span>
          <h2 className="inv-section-title">{t("inv_built_for_growth")}</h2>
          <p className="inv-section-sub">
            {t("inv_why_sub")}
          </p>
        </div>
        <div className="inv-why-grid">
          {WHY_FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="inv-why-card">
                <div className="inv-why-icon"><Icon size={24} /></div>
                <div className="inv-why-title">{f.title}</div>
                <div className="inv-why-desc">{f.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="inv-footer-section">
        <div className="inv-footer-cta">
          <div className="inv-footer-blob inv-footer-blob-1" />
          <div className="inv-footer-blob inv-footer-blob-2" />
          <h2 className="inv-footer-cta-title">{t("inv_footer_cta_title")}</h2>
          <p className="inv-footer-cta-sub">
            {t("inv_footer_cta_sub")}
          </p>
          <div className="inv-footer-cta-actions">
            <button className="inv-btn inv-btn-white" onClick={() => openEnquiry(null)}>
              <Send size={17} /> {t("inv_send_enquiry")}
            </button>
            <div className="inv-footer-contact">
              <span className="inv-footer-contact-item"><Phone size={16} /> +91 86883 49726</span>
              <span className="inv-footer-contact-item"><Mail size={16} /> support@tabletopleo.com</span>
            </div>
          </div>
        </div>
      </section>

      {enquiryOpen && (
        <EnquiryModal kiosk={selectedKiosk} onClose={() => { setEnquiryOpen(false); setSelectedKiosk(null); }} />
      )}
    </div>
  );
}

/* ============================================================
   Dummy enquiry popup — collects info only, no payment, no
   real backend submission. Swap handleSubmit for a real API
   call once an inventory/leads endpoint exists.
   ============================================================ */
function EnquiryModal({ kiosk, onClose }) {
  const [form, setForm] = useState({ businessName: "", contactName: "", phone: "", email: "", quantity: "1", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!form.businessName.trim() || !form.contactName.trim() || !form.phone.trim()) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1000);
  };

  const valid = form.businessName.trim() && form.contactName.trim() && form.phone.trim();

  return (
    <div className="inv-modal-overlay" onClick={onClose}>
      <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inv-modal-head">
          <div>
            <div className="inv-modal-title">{kiosk ? `Enquire — ${kiosk.name}` : "Send an Enquiry"}</div>
            {kiosk && <div className="inv-modal-sub">{kiosk.size}</div>}
          </div>
          <button className="inv-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {sent ? (
          <div className="inv-modal-success">
            <div className="inv-modal-success-icon"><CheckCircle2 size={34} /></div>
            <div className="inv-modal-success-title">Enquiry Sent!</div>
            <p className="inv-modal-success-text">
              Thanks {form.contactName.split(" ")[0]} — our team will reach out to{" "}
              <strong>{form.phone}</strong> within 24–48 hours.
            </p>
            <button className="inv-btn inv-btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <div className="inv-modal-body">
            <div>
              <label className="inv-field-label">Business Name <span className="req">*</span></label>
              <input className="inv-field-input" value={form.businessName} onChange={update("businessName")} placeholder="e.g. Copper Kettle Bistro" />
            </div>
            <div className="inv-field-row">
              <div>
                <label className="inv-field-label">Your Name <span className="req">*</span></label>
                <input className="inv-field-input" value={form.contactName} onChange={update("contactName")} placeholder="Full name" />
              </div>
              <div>
                <label className="inv-field-label">Phone <span className="req">*</span></label>
                <input className="inv-field-input" value={form.phone} onChange={update("phone")} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="inv-field-row">
              <div>
                <label className="inv-field-label">Email</label>
                <input className="inv-field-input" value={form.email} onChange={update("email")} placeholder="you@business.com" />
              </div>
              <div>
                <label className="inv-field-label">Quantity</label>
                <input className="inv-field-input" type="number" min="1" value={form.quantity} onChange={update("quantity")} />
              </div>
            </div>
            <div>
              <label className="inv-field-label">Message (optional)</label>
              <textarea className="inv-field-textarea" rows={3} value={form.message} onChange={update("message")} placeholder="Tell us about your restaurant, timeline, or any questions..." />
            </div>

            <button className="inv-submit-btn" disabled={!valid || sending} onClick={handleSubmit}>
              {sending ? <Loader2 size={18} className="inv-spin" /> : <Send size={18} />}
              {sending ? "Sending..." : "Submit Enquiry"}
            </button>
            <p className="inv-submit-note">No payment required. This is a sales enquiry only.</p>
          </div>
        )}
      </div>
    </div>
  );
}
