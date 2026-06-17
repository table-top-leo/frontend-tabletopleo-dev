"use client";
import { useState, useRef } from "react";
import {
  User, Bell, Shield, Smartphone, Globe, Moon, Sun, LogOut,
  ChevronRight, Check, Upload, Camera, Mail, Lock, Eye, EyeOff,
  QrCode, Download, Copy, RefreshCw, MessageCircle, BookOpen,
  ExternalLink, AlertCircle, Palette, Key, Trash2, CheckCircle2,
  Crown, Sparkles, HeadphonesIcon,
} from "lucide-react";
import QRCode from "react-qr-code";
import "../designdashboardcomponent/settings.css";

const NAV_SECTIONS = [
  { id: "profile",       label: "Profile",            icon: User },
  { id: "account",       label: "Account & Security", icon: Shield },
  { id: "notifications", label: "Notifications",      icon: Bell },
  { id: "appearance",    label: "Appearance",         icon: Palette },
  { id: "qr",            label: "QR Code",            icon: QrCode },
  { id: "plan",          label: "Upgrade Plan",       icon: Crown },
  { id: "support",       label: "Support & Help",     icon: HeadphonesIcon },
  { id: "danger",        label: "Danger Zone",        icon: AlertCircle },
];

const PLANS = [
  {
    id: "starter", name: "Starter", price: "Free", colorClass: "plan-card-starter",
    features: ["1 branch", "Up to 50 orders/day", "Basic analytics", "Email support"],
    current: true,
  },
  {
    id: "pro", name: "Pro", price: "₹999/mo", colorClass: "plan-card-pro",
    features: ["3 branches", "Unlimited orders", "Advanced analytics", "Priority support", "Custom QR branding", "Payment gateway"],
    current: false, popular: true,
  },
  {
    id: "elite", name: "Elite", price: "₹2499/mo", colorClass: "plan-card-elite",
    features: ["Unlimited branches", "All Pro features", "White-label app", "Dedicated manager", "API access", "Custom integrations"],
    current: false,
  },
];

const ACCENTS = [
  { name: "violet",  cls: "accent-violet" },
  { name: "rose",    cls: "accent-rose" },
  { name: "amber",   cls: "accent-amber" },
  { name: "emerald", cls: "accent-emerald" },
  { name: "sky",     cls: "accent-sky" },
  { name: "orange",  cls: "accent-orange" },
];

const Toggle = ({ checked, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)} className={`sp-toggle ${checked ? "sp-toggle-on" : "sp-toggle-off"}`}>
    <span className={`sp-toggle-thumb ${checked ? "sp-toggle-thumb-on" : ""}`} />
  </button>
);

const Section = ({ title, desc, children }) => (
  <div className="sp-section">
    <div className="sp-section-head">
      <h3 className="sp-section-title">{title}</h3>
      {desc && <p className="sp-section-desc">{desc}</p>}
    </div>
    <div className="sp-section-body">{children}</div>
  </div>
);

const Row = ({ icon: Icon, label, desc, action, noBorder, iconCls }) => (
  <div className={`sp-row ${noBorder ? "" : "sp-row-border"}`}>
    <div className="sp-row-icon">
      <Icon size={15} className={iconCls || "sp-icon-default"} />
    </div>
    <div className="sp-row-text">
      <div className="sp-row-label">{label}</div>
      {desc && <div className="sp-row-desc">{desc}</div>}
    </div>
    {action && <div className="sp-row-action">{action}</div>}
  </div>
);

export default function SettingsPage() {
  const [active, setActive]           = useState("profile");
  const [darkMode, setDarkMode]       = useState(false);
  const [accent, setAccent]           = useState("violet");
  const [copied, setCopied]           = useState(false);
  const [showPass, setShowPass]       = useState({ current: false, new: false, confirm: false });
  const [avatarPreview, setAvatar]    = useState(null);
  const [twoFA, setTwoFA]             = useState(false);
  const [profile, setProfile]         = useState({
    name: "Liyaqath Zubair",
    email: "liyaqath@regalbiryani.com",
    phone: "+91 9876543210",
    role: "Admin",
    bio: "Restaurant owner passionate about great food and seamless digital experiences.",
  });
  const [notifs, setNotifs] = useState({
    newOrder: true, orderStatus: true, lowStock: true, dailyReport: false,
    paymentAlert: true, customerReview: false, promotions: false, systemUpdates: true,
  });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const avatarRef = useRef();

  const QR_DATA = `https://tabletop.in/order/${profile.name.toLowerCase().replace(" ", "-")}-restaurant`;

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const copyQR = () => {
    navigator.clipboard?.writeText(QR_DATA).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2);
  const activeNav = NAV_SECTIONS.find(n => n.id === active);

  const renderSection = () => {
    switch (active) {

      case "profile":
        return (
          <>
            <Section title="Profile Picture" desc="Upload a photo to personalise your account">
              <div className="sp-avatar-row">
                <div className="sp-avatar-wrap">
                  <div className="sp-avatar">
                    {avatarPreview
                      ? <img src={avatarPreview} alt="avatar" className="sp-avatar-img" />
                      : <span className="sp-avatar-initials">{initials}</span>
                    }
                  </div>
                  <button type="button" onClick={() => avatarRef.current?.click()} className="sp-avatar-cam">
                    <Camera size={10} color="#fff" />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="sp-hidden" onChange={handleAvatarUpload} />
                </div>
                <div className="sp-avatar-info">
                  <div className="sp-avatar-name">{profile.name}</div>
                  <div className="sp-avatar-email">{profile.email}</div>
                  <span className="sp-badge-role">{profile.role}</span>
                </div>
                <button type="button" onClick={() => avatarRef.current?.click()} className="sp-btn-upload">
                  <Upload size={12} /> Upload
                </button>
              </div>
            </Section>

            <Section title="Personal Details" desc="Your basic profile information">
              {[
                { label: "Full Name",     key: "name",  type: "text",  ph: "Your full name" },
                { label: "Email Address", key: "email", type: "email", ph: "your@email.com" },
                { label: "Phone Number",  key: "phone", type: "tel",   ph: "+91 9876543210" },
              ].map(({ label, key, type, ph }, i, arr) => (
                <div key={key} className={`sp-field-row ${i < arr.length - 1 ? "sp-field-border" : ""}`}>
                  <label className="sp-field-label">{label}</label>
                  <input type={type} value={profile[key]} placeholder={ph}
                    onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                    className="sp-input" />
                </div>
              ))}
              <div className="sp-field-row">
                <label className="sp-field-label">Bio</label>
                <textarea rows={2} value={profile.bio} className="sp-textarea"
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
              </div>
              <div className="sp-field-row sp-actions-row">
                <button type="button" className="sp-btn-primary">
                  <Check size={13} /> Save Changes
                </button>
              </div>
            </Section>
          </>
        );

      case "account":
        return (
          <>
            <Section title="Change Password" desc="Use a strong password to keep your account safe">
              {[
                { label: "Current Password",     key: "current" },
                { label: "New Password",          key: "new" },
                { label: "Confirm New Password",  key: "confirm" },
              ].map(({ label, key }, i, arr) => (
                <div key={key} className={`sp-field-row ${i < arr.length - 1 ? "sp-field-border" : ""}`}>
                  <label className="sp-field-label">{label}</label>
                  <div className="sp-pass-wrap">
                    <Lock size={13} className="sp-pass-icon" />
                    <input type={showPass[key] ? "text" : "password"} placeholder="••••••••"
                      value={passwords[key]} onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                      className="sp-pass-input" />
                    <button type="button" onClick={() => setShowPass(s => ({ ...s, [key]: !s[key] }))} className="sp-eye-btn">
                      {showPass[key] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="sp-field-row sp-actions-row">
                <button type="button" className="sp-btn-primary">
                  <Key size={13} /> Update Password
                </button>
              </div>
            </Section>

            <Section title="Security" desc="Extra layers of protection for your account">
              <Row icon={Shield} label="Two-Factor Authentication"
                desc={twoFA ? "2FA is enabled" : "Add an extra layer of security"}
                action={<Toggle checked={twoFA} onChange={setTwoFA} />} iconCls="sp-icon-violet" />
              <Row icon={Smartphone} label="Trusted Devices" desc="2 devices logged in" noBorder
                action={<button type="button" className="sp-link-btn">Manage</button>} iconCls="sp-icon-default" />
            </Section>

            <Section title="Active Sessions">
              {[
                { device: "Chrome · MacOS",     location: "Hyderabad, IN", time: "Now",   current: true },
                { device: "Safari · iPhone 15", location: "Hyderabad, IN", time: "2h ago", current: false },
              ].map((s, i, arr) => (
                <div key={i} className={`sp-row ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                  <div className="sp-row-icon"><Smartphone size={14} className="sp-icon-default" /></div>
                  <div className="sp-row-text">
                    <div className="sp-row-label">{s.device}</div>
                    <div className="sp-row-desc">{s.location} · {s.time}</div>
                  </div>
                  <div className="sp-row-action">
                    {s.current
                      ? <span className="sp-badge-green">Current</span>
                      : <button type="button" className="sp-link-btn sp-link-red">Revoke</button>
                    }
                  </div>
                </div>
              ))}
            </Section>
          </>
        );

      case "notifications":
        return (
          <Section title="Notification Preferences" desc="Choose what you want to be notified about">
            {[
              { key: "newOrder",       label: "New Orders",              desc: "Get notified when a new order arrives" },
              { key: "orderStatus",    label: "Order Status Updates",    desc: "When orders are confirmed, prepared or delivered" },
              { key: "lowStock",       label: "Low Stock Alerts",        desc: "When inventory items are running low" },
              { key: "paymentAlert",   label: "Payment Alerts",          desc: "Successful and failed payment notifications" },
              { key: "dailyReport",    label: "Daily Summary Report",    desc: "End-of-day sales and order report" },
              { key: "customerReview", label: "Customer Reviews",        desc: "When a customer leaves a review" },
              { key: "promotions",     label: "Promotions & Offers",     desc: "Special deals and platform offers" },
              { key: "systemUpdates",  label: "System Updates",          desc: "New features and maintenance notices" },
            ].map(({ key, label, desc }, i, arr) => (
              <div key={key} className={`sp-row ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                <div className="sp-row-text">
                  <div className="sp-row-label">{label}</div>
                  <div className="sp-row-desc">{desc}</div>
                </div>
                <div className="sp-row-action">
                  <Toggle checked={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
                </div>
              </div>
            ))}
          </Section>
        );

      case "appearance":
        return (
          <>
            <Section title="Theme" desc="Switch between light and dark mode">
              <div className="sp-theme-row">
                {[{ label: "Light", icon: Sun, val: false }, { label: "Dark", icon: Moon, val: true }].map(({ label, icon: Icon, val }) => (
                  <button key={label} type="button" onClick={() => setDarkMode(val)}
                    className={`sp-theme-btn ${darkMode === val ? "sp-theme-active" : ""}`}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Accent Color" desc="Pick your preferred interface color">
              <div className="sp-accent-row">
                {ACCENTS.map(a => (
                  <button key={a.name} type="button" onClick={() => setAccent(a.name)}
                    className={`sp-accent-dot ${a.cls} ${accent === a.name ? "sp-accent-active" : ""}`}>
                    {accent === a.name && <Check size={12} color="#fff" />}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Display Density" desc="Adjust how compact the UI looks">
              <div className="sp-density-row">
                {["Compact", "Default", "Comfortable"].map((d, i) => (
                  <button key={d} type="button" className={`sp-density-btn ${i === 0 ? "sp-density-active" : ""}`}>{d}</button>
                ))}
              </div>
            </Section>

            <Section title="Language & Region">
              {[
                { label: "Language",    val: "English (US)" },
                { label: "Date Format", val: "DD/MM/YYYY" },
                { label: "Currency",    val: "INR (₹)" },
              ].map(({ label, val }, i, arr) => (
                <div key={label} className={`sp-row ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                  <div className="sp-row-text"><div className="sp-row-label">{label}</div></div>
                  <div className="sp-row-action sp-row-val">
                    {val} <ChevronRight size={12} className="sp-icon-default" />
                  </div>
                </div>
              ))}
            </Section>
          </>
        );

      case "qr":
        return (
          <>
            <Section title="Your Order QR Code" desc="Share this QR code so customers can scan and place orders directly">
              <div className="sp-qr-center">
                <div className="sp-qr-box">
                  <QRCode value={QR_DATA} size={160} fgColor="#18181b" />
                </div>
                <div className="sp-qr-meta">
                  <div className="sp-qr-name">Regal Biryani House</div>
                  <div className="sp-qr-url">{QR_DATA}</div>
                </div>
                <div className="sp-qr-actions">
                  <button type="button" onClick={copyQR} className={`sp-btn-outline ${copied ? "sp-btn-copied" : ""}`}>
                    {copied ? <><CheckCircle2 size={13} /> Copied!</> : <><Copy size={13} /> Copy Link</>}
                  </button>
                  <button type="button" className="sp-btn-outline">
                    <Download size={13} /> Download PNG
                  </button>
                  <button type="button" className="sp-btn-primary">
                    <RefreshCw size={13} /> Regenerate
                  </button>
                </div>
              </div>
            </Section>

            <Section title="QR Code Settings">
              {[
                { label: "Custom Redirect URL", desc: "Link customers land on after scanning",     action: <ChevronRight size={14} className="sp-icon-default" /> },
                { label: "Track QR Scans",       desc: "Analytics for scan count and location",   action: <Toggle checked={true} onChange={() => {}} /> },
                { label: "Add Logo to QR",       desc: "Embed your restaurant logo inside QR",    action: <span className="sp-badge-pro">Pro</span> },
                { label: "QR Color Theme",       desc: "Customise QR colors to match branding",   action: <span className="sp-badge-pro">Pro</span> },
              ].map(({ label, desc, action }, i, arr) => (
                <div key={label} className={`sp-row ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                  <div className="sp-row-text">
                    <div className="sp-row-label">{label}</div>
                    <div className="sp-row-desc">{desc}</div>
                  </div>
                  <div className="sp-row-action">{action}</div>
                </div>
              ))}
            </Section>
          </>
        );

      case "plan":
        return (
          <>
            <div className="sp-plan-banner">
              <Sparkles size={15} className="sp-plan-banner-icon" />
              <div>
                <div className="sp-plan-banner-title">You're on the Free Starter plan</div>
                <div className="sp-plan-banner-desc">Upgrade to unlock unlimited orders, analytics and more.</div>
              </div>
            </div>

            <div className="sp-plan-grid">
              {PLANS.map(plan => (
                <div key={plan.id} className={`sp-plan-card ${plan.current ? "sp-plan-card-current" : ""}`}>
                  {plan.popular && <div className="sp-plan-popular">MOST POPULAR</div>}
                  <div className={`sp-plan-header ${plan.colorClass} ${plan.popular ? "sp-plan-header-offset" : ""}`}>
                    <div className="sp-plan-name">{plan.name}</div>
                    <div className="sp-plan-price">{plan.price}</div>
                  </div>
                  <div className="sp-plan-body">
                    <ul className="sp-plan-features">
                      {plan.features.map(f => (
                        <li key={f} className="sp-plan-feature">
                          <Check size={12} className="sp-icon-green" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button type="button" disabled={plan.current}
                      className={`sp-plan-btn ${plan.current ? "sp-plan-btn-current" : "sp-plan-btn-upgrade"}`}>
                      {plan.current ? "Current Plan" : "Coming Soon"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Section title="Usage This Month">
              {[
                { label: "Orders",     used: 142, max: 50,  unit: "",   over: true },
                { label: "Menu Items", used: 28,  max: 50,  unit: "" },
                { label: "Storage",    used: 340, max: 500, unit: "MB" },
              ].map(({ label, used, max, unit, over }) => (
                <div key={label} className="sp-usage-row">
                  <div className="sp-usage-meta">
                    <span className="sp-usage-label">{label}</span>
                    <span className={`sp-usage-val ${over ? "sp-usage-over" : ""}`}>{used}{unit} / {max}{unit}</span>
                  </div>
                  <div className="sp-usage-bar">
                    <div className={`sp-usage-fill ${over ? "sp-usage-fill-red" : "sp-usage-fill-violet"}`}
                      style={{ width: `${Math.min((used / max) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </Section>
          </>
        );

      case "support":
        return (
          <>
            <Section title="Get Help" desc="Find answers or reach out to our team">
              {[
                { icon: BookOpen,     label: "Documentation",    desc: "Guides, tutorials and API references",          iconCls: "sp-icon-blue" },
                { icon: MessageCircle,label: "Live Chat Support", desc: "Chat with our team — avg. 2 min response",     iconCls: "sp-icon-green" },
                { icon: Mail,         label: "Email Support",     desc: "support@tabletop.in",                          iconCls: "sp-icon-violet" },
                { icon: ExternalLink, label: "Community Forum",   desc: "Ask questions, share tips with other users",   iconCls: "sp-icon-amber" },
              ].map(({ icon: Icon, label, desc, iconCls }, i, arr) => (
                <button key={label} type="button" className={`sp-support-btn ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                  <div className="sp-support-icon"><Icon size={16} className={iconCls} /></div>
                  <div className="sp-row-text">
                    <div className="sp-row-label">{label}</div>
                    <div className="sp-row-desc">{desc}</div>
                  </div>
                  <ChevronRight size={14} className="sp-icon-default" />
                </button>
              ))}
            </Section>

            <Section title="System Status">
              {[
                { service: "Order API",         status: "Operational" },
                { service: "Payment Gateway",   status: "Operational" },
                { service: "QR Service",        status: "Operational" },
                { service: "Analytics",         status: "Degraded" },
              ].map(({ service, status }, i, arr) => (
                <div key={service} className={`sp-row ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                  <div className="sp-row-text"><div className="sp-row-label">{service}</div></div>
                  <div className={`sp-status-pill ${status === "Operational" ? "sp-status-ok" : "sp-status-warn"}`}>
                    <span className={`sp-status-dot ${status === "Operational" ? "sp-status-dot-ok" : "sp-status-dot-warn"}`} />
                    {status}
                  </div>
                </div>
              ))}
            </Section>

            <Section title="Send Feedback" desc="Help us improve TableTop">
              <div className="sp-feedback-wrap">
                <textarea rows={3} placeholder="Share your thoughts, report bugs or suggest features..." className="sp-textarea" />
                <div className="sp-actions-row">
                  <button type="button" className="sp-btn-primary">
                    <SendIcon size={12} /> Send Feedback
                  </button>
                </div>
              </div>
            </Section>

            <div className="sp-version-note">
              TableTop v2.4.1 ·{" "}
              <span className="sp-version-link">Release notes</span> ·{" "}
              <span className="sp-version-link">Privacy Policy</span>
            </div>
          </>
        );

      case "danger":
        return (
          <>
            <div className="sp-danger-banner">
              <AlertCircle size={15} className="sp-danger-icon" />
              <span>These actions are irreversible. Proceed with extreme caution.</span>
            </div>
            <Section title="Danger Zone">
              {[
                { icon: RefreshCw, label: "Reset All Settings",      desc: "Restore all settings to default values",             btn: "Reset",          btnCls: "sp-danger-btn-amber" },
                { icon: LogOut,    label: "Sign Out of All Devices",  desc: "Revoke all active sessions everywhere",              btn: "Sign Out All",   btnCls: "sp-danger-btn-orange" },
                { icon: Trash2,    label: "Delete Account",           desc: "Permanently delete your account and all data",       btn: "Delete Account", btnCls: "sp-danger-btn-red" },
              ].map(({ icon: Icon, label, desc, btn, btnCls }, i, arr) => (
                <div key={label} className={`sp-row ${i < arr.length - 1 ? "sp-row-border" : ""}`}>
                  <div className="sp-row-icon sp-row-icon-red"><Icon size={14} className="sp-icon-red" /></div>
                  <div className="sp-row-text">
                    <div className="sp-row-label">{label}</div>
                    <div className="sp-row-desc">{desc}</div>
                  </div>
                  <div className="sp-row-action">
                    <button type="button" className={`sp-danger-btn ${btnCls}`}>{btn}</button>
                  </div>
                </div>
              ))}
            </Section>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="sp-root">
      <div className="sp-container">
        <div className="sp-page-head">
          <h1 className="sp-page-title">Settings</h1>
          <p className="sp-page-sub">Manage your account, preferences and integrations</p>
        </div>

        <div className="sp-layout">
          <aside className="sp-sidebar">
            {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setActive(id)}
                className={`sp-nav-btn ${active === id ? "sp-nav-active" : ""}`}>
                <Icon size={15} className={active === id ? "sp-nav-icon-active" : "sp-nav-icon"} />
                <span className="sp-nav-label">{label}</span>
                {id === "plan" && <span className="sp-nav-badge">!</span>}
              </button>
            ))}
          </aside>

          <div className="sp-mobile-tabs">
            {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setActive(id)}
                className={`sp-tab-btn ${active === id ? "sp-tab-active" : ""}`}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          <div className="sp-content">
            <div className="sp-content-head">
              {activeNav && <activeNav.icon size={16} className="sp-content-icon" />}
              <h2 className="sp-content-title">{activeNav?.label}</h2>
            </div>
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}

const SendIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
  </svg>
);