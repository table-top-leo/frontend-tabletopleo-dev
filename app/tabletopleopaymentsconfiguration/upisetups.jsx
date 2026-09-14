import { useState, useEffect } from "react";
import UPIPayments from "../tabletopleopaymentsconfiguration/upipayments";
import RazorPayPayments from "../tabletopleopaymentsconfiguration/razorpaypayments";
import StripePaypalPayments from "../tabletopleopaymentsconfiguration/stripepayments";
import MobilePayPayments from "../tabletopleopaymentsconfiguration/mobilepaypayments";
import CashfreePayments from "../tabletopleopaymentsconfiguration/cashfreepayments";
import { SiRazorpay, SiStripe } from "react-icons/si";
import { Lock, Phone, Building2, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getMyPaymentLockStatus } from "../services/locationService";

// Popup shown when a branch whose payments are managed by Head Office
// tries to interact with a payment method card or the Pay at Counter
// toggle — the underlying page stays fully visible (so staff can still
// see what's configured), only the interaction itself is blocked.
const HeadOfficeAccessDeniedPopup = ({ headOfficePhone, onClose }) => (
  <div
    onClick={onClose}
    style={{ position: "fixed", inset: 0, background: "rgba(24,24,27,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "#fff", width: "100%", maxWidth: 420, borderRadius: 20,
        padding: "32px 28px", textAlign: "center", position: "relative",
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        animation: "popLockIn 0.2s cubic-bezier(0.34,1.35,0.64,1)",
      }}
    >
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 14, right: 14, background: "#f4f4f5", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#71717a" }}
      >
        <X size={15} />
      </button>
      <div style={{
        width: 64, height: 64, borderRadius: 18, margin: "0 auto 18px",
        background: "linear-gradient(135deg,#6d28d9,#a855f7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 10px 30px rgba(109,40,217,0.28)",
      }}>
        <Lock size={28} color="#fff" />
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#18181b", margin: "0 0 10px" }}>
        Access Denied
      </h2>
      <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6, margin: "0 0 20px" }}>
        Payments for this branch are managed by Head Office, so there's nothing to change here.
        Please contact Head Office if you need access.
      </p>
      {headOfficePhone && (
        <a
          href={`tel:${headOfficePhone}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12,
            background: "linear-gradient(135deg,#6d28d9,#7c3aed)", color: "#fff", fontSize: 13.5, fontWeight: 700,
            textDecoration: "none", boxShadow: "0 6px 16px rgba(124,58,237,0.28)",
          }}
        >
          <Phone size={15} /> Call Head Office — {headOfficePhone}
        </a>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, fontSize: 11, color: "#a1a1aa" }}>
        <Building2 size={12} /> Managed centrally for all branches
      </div>
    </div>
    <style>{`@keyframes popLockIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }`}</style>
  </div>
);

// Method metadata is now built from t() at render time (inside the
// component) instead of as a static module-level array, so every label,
// badge, description, and feature line re-renders in the selected
// language — same pattern already used by AdminPayments / RazorPayPayments.
function buildPaymentMethods(t) {
  return [
    {
      id: "upi",
      name: t("ps_method_upi_name"),
      desc: t("ps_method_upi_desc"),
      icon: (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="#FFF3EA" />
          <path d="M24 8L36 16V32L24 40L12 32V16L24 8Z" fill="#ED752E" opacity="0.12" />
          <path d="M18 20L24 14L30 20V30L24 34L18 30V20Z" fill="#ED752E" />
          <path d="M24 14V34M18 20L30 30M30 20L18 30" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      features: [t("ps_feat_upi_1"), t("ps_feat_upi_2"), t("ps_feat_upi_3")],
      badge: t("ps_badge_popular_india"),
    },
    {
      id: "razorpay",
      name: t("ps_method_razorpay_name"),
      desc: t("ps_method_razorpay_desc"),
      icon: (
        <div style={{ width: 32, height: 32, borderRadius: 7, background: "#EAF3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SiRazorpay size={17} color="#0C2451" />
        </div>
      ),
      features: [t("ps_feat_razorpay_1"), t("ps_feat_razorpay_2"), t("ps_feat_razorpay_3")],
      badge: t("pay_recommended_badge"),
    },
    {
      id: "stripe",
      name: t("ps_method_stripe_name"),
      desc: t("ps_method_stripe_desc"),
      icon: (
        <div style={{ width: 32, height: 32, borderRadius: 7, background: "#F0EEFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SiStripe size={18} color="#635BFF" />
        </div>
      ),
      features: [t("ps_feat_stripe_1"), t("ps_feat_stripe_2"), t("ps_feat_stripe_3")],
      badge: t("ps_badge_international"),
    },
    {
      id: "mobilepay",
      name: t("ps_method_mobilepay_name"),
      desc: t("ps_method_mobilepay_desc"),
      icon: (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="#F5F0FF" />
          <rect x="16" y="9" width="16" height="30" rx="4" fill="#7C3AED" opacity="0.15" />
          <rect x="18" y="11" width="12" height="26" rx="2.5" fill="#7C3AED" />
          <circle cx="24" cy="33.5" r="1.6" fill="white" />
        </svg>
      ),
      features: [t("ps_feat_mobilepay_1"), t("ps_feat_mobilepay_2"), t("ps_feat_mobilepay_3")],
      badge: t("ps_badge_new"),
    },
    {
      id: "cashfree",
      name: "Cashfree Payments",
      desc: "Cards, UPI, Net Banking, Wallets & more",
      icon: (
        <div style={{ width: 32, height: 32, borderRadius: 7, background: "#EAFBF3", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M14 24c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-3.2 0-6-1.5-7.8-3.8" stroke="#12B76A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M20 24l3 3 6-6" stroke="#12B76A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
      features: ["Cards, UPI, Net Banking", "Wallets & EMI", "Secure & Reliable"],
      badge: "Popular in India",
    },
  ];
}

const PaymentSetup =() =>{
  const { t } = useLanguage();
  const PAYMENT_METHODS = buildPaymentMethods(t);

  // A branch/staff login whose location has "Use Head Office's payment
  // settings" turned on has nothing to configure here. This is fetched
  // FRESH on every page load (not read from cached ttl_user) — the owner
  // can toggle this at any time while a branch is already logged in, and
  // a stale localStorage snapshot would never reflect that change until
  // the next login.
  const currentUser = (() => {
    try {
      const stored = localStorage.getItem("ttl_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  })();
  const isStaffAccount = !!(currentUser?.role && currentUser.role !== "OWNER");
  const [isLockedToHeadOffice, setIsLockedToHeadOffice] = useState(false);
  const [lockHeadOfficePhone, setLockHeadOfficePhone] = useState("");
  const [showDeniedPopup, setShowDeniedPopup] = useState(false);

  useEffect(() => {
    if (!isStaffAccount) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getMyPaymentLockStatus();
        if (cancelled || !res.success) return;
        setIsLockedToHeadOffice(!!res.data.locked);
        setLockHeadOfficePhone(res.data.headOfficePhone || "");
      } catch {
        // Network hiccup — stay unlocked rather than falsely blocking a
        // branch that's actually allowed to manage its own payments.
      }
    })();
    return () => { cancelled = true; };
  }, [isStaffAccount]);

  const [activePage,         setActivePage]         = useState(null);
  const [enabledMethods,     setEnabledMethods]     = useState(["upi"]);
  const [payAtCounterSaved,  setPayAtCounterSaved]  = useState(false);
  const [payAtCounterDraft,  setPayAtCounterDraft]  = useState(false);
  const [pacInitialLoading,  setPacInitialLoading]  = useState(true);
  const [pacLoading,         setPacLoading]         = useState(false);
  const [pacMsg,             setPacMsg]             = useState("");

  // Which gateways this business's country actually allows — fetched from
  // the backend (never guessed in the frontend). null while loading, so we
  // don't flash "unavailable" on every card before we know the real answer.
  const [availableGateways, setAvailableGateways] = useState(null);
  const [countryLabel,      setCountryLabel]      = useState("");

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const token = localStorage.getItem("ttl_token");
        const res = await fetch(`http://localhost:6163/api/payment/available-methods`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.success && data?.data) {
          setAvailableGateways((data.data.availableGateways || []).map((g) => g.toLowerCase()));
          setCountryLabel(data.data.countryCode || "");
        }
      } catch {
        // If this fails, fall back to showing every card enabled rather
        // than accidentally locking a merchant out of Payment Setup.
        setAvailableGateways(["upi", "razorpay", "stripe", "mobilepay", "cashfree"]);
      }
    };
    loadAvailability();
  }, []);

  const payAtCounterDirty = payAtCounterDraft !== payAtCounterSaved;

  // Load the currently SAVED Pay at Counter status from the backend once,
  // on mount, so the toggle always reflects what's actually in the DB.
  useEffect(() => {
    const loadStatus = async () => {
      setPacInitialLoading(true);
      try {
        const token = localStorage.getItem("ttl_token");
        const res = await fetch(`http://localhost:6163/api/payment/pay-at-counter/my-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const current = data?.data === true;
        setPayAtCounterSaved(current);
        setPayAtCounterDraft(current);
      } catch {
        // If the status can't be loaded, default to false rather than
        // guessing — the admin can still toggle + save to set it.
        setPayAtCounterSaved(false);
        setPayAtCounterDraft(false);
      } finally {
        setPacInitialLoading(false);
      }
    };
    loadStatus();
  }, []);

  const handleSavePayAtCounter = async () => {
    setPacLoading(true);
    setPacMsg("");
    try {
      const token = localStorage.getItem("ttl_token");
      const res = await fetch(
        `http://localhost:6163/api/payment/pay-at-counter/toggle?enabled=${payAtCounterDraft}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || t("ps_pac_fail_msg"));
      setPayAtCounterSaved(payAtCounterDraft);
      setPacMsg(data?.message || (payAtCounterDraft ? t("ps_pac_enabled_msg") : t("ps_pac_disabled_msg")));
    } catch (e) {
      setPacMsg(e.message || t("ps_pac_fail_msg"));
    } finally {
      setPacLoading(false);
    }
  };

  const toggleMethod = (id) => {
    if (isLockedToHeadOffice) { setShowDeniedPopup(true); return; }
    setEnabledMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  if (activePage === "upi") return <UPIPayments onBack={() => setActivePage(null)} />;
  if (activePage === "razorpay") return <RazorPayPayments onBack={() => setActivePage(null)} />;
  if (activePage === "stripe") return <StripePaypalPayments onBack={() => setActivePage(null)} initialTab="stripe" />;
  if (activePage === "paypal") return <StripePaypalPayments onBack={() => setActivePage(null)} initialTab="paypal" />;
  if (activePage === "mobilepay") return <MobilePayPayments onBack={() => setActivePage(null)} />;
  if (activePage === "cashfree") return <CashfreePayments onBack={() => setActivePage(null)} />;

  return (
    <div className="ps-root">
      {showDeniedPopup && (
        <HeadOfficeAccessDeniedPopup
          headOfficePhone={lockHeadOfficePhone}
          onClose={() => setShowDeniedPopup(false)}
        />
      )}

      <div className="ps-header">
        <div>
          <h1 className="ps-title">{t("ps_title")}</h1>
          <p className="ps-subtitle">{t("ps_subtitle")}</p>
        </div>
      </div>

      {availableGateways && countryLabel && (
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12.5, color:"#1e40af", fontWeight:600 }}>
          ℹ️ {t("ps_country_banner")} <strong>&nbsp;{countryLabel}</strong>.
        </div>
      )}

      <div className="ps-section-label">
        <span className="ps-section-dot" />
        {t("ps_select_methods")}
      </div>

      <div className="ps-grid">
        {PAYMENT_METHODS.map((m) => {
          const enabled = enabledMethods.includes(m.id);
          const isAvailable = !availableGateways || availableGateways.includes(m.id);
          return (
            <div
              key={m.id}
              className={`ps-card ${enabled ? "ps-card--active" : ""}`}
              onClick={() => { if (isLockedToHeadOffice) setShowDeniedPopup(true); }}
              style={{
                ...(!isAvailable ? { opacity:0.45, filter:"grayscale(1)", pointerEvents:"none" } : undefined),
                ...(isLockedToHeadOffice && isAvailable ? { cursor:"not-allowed", position:"relative" } : undefined),
              }}
            >
              {isLockedToHeadOffice && isAvailable && (
                <div style={{ position:"absolute", top:10, right:10, width:26, height:26, borderRadius:8, background:"rgba(109,40,217,0.1)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2 }}>
                  <Lock size={13} color="#7c3aed" />
                </div>
              )}
              <div className="ps-card-top">
                <div className="ps-card-icon">{m.icon}</div>
                <div className="ps-card-meta">
                  <div className="ps-card-name">{m.name}</div>
                  <span className="ps-card-badge">{isAvailable ? m.badge : t("ps_badge_unavailable")}</span>
                </div>
                <label className="ps-toggle" onClick={(e) => { if (isLockedToHeadOffice) e.preventDefault(); }}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    disabled={!isAvailable}
                    onChange={() => toggleMethod(m.id)}
                  />
                  <span className="ps-toggle-track" />
                </label>
              </div>
              <p className="ps-card-desc">{m.desc}</p>
              <ul className="ps-card-features">
                {m.features.map((f) => (
                  <li key={f}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="7" fill="#E6F4EA" />
                      <path d="M4 7l2 2 4-4" stroke="#1A8A3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="ps-configure-btn"
                onClick={() => {
                  if (!isAvailable) return;
                  if (isLockedToHeadOffice) { setShowDeniedPopup(true); return; }
                  setActivePage(m.id);
                }}
                disabled={!isAvailable}
                style={!isAvailable ? { cursor:"not-allowed" } : undefined}
              >
                {isAvailable ? t("ps_get_started") : t("ps_unavailable")}
              </button>
            </div>
          );
        })}
      </div>

      {enabledMethods.length > 0 && (
        <div className="ps-summary">
          <div className="ps-summary-label">{t("ps_active_methods")}</div>
          <div className="ps-summary-chips">
            {enabledMethods.map((id) => {
              const m = PAYMENT_METHODS.find((x) => x.id === id);
              return (
                <span key={id} className="ps-chip">
                  {m?.icon}
                  {m?.name}
                  <button
                    className="ps-chip-remove"
                    onClick={() => toggleMethod(id)}
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PAY AT COUNTER SECTION ───────────────────────────── */}
      <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"18px 20px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
              🏪
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", marginBottom:3, display:"flex", alignItems:"center", gap:6 }}>
                {t("ps_pac_title")}
                {isLockedToHeadOffice && <Lock size={12} color="#7c3aed" />}
              </div>
              <div style={{ fontSize:12, color:"#64748b", lineHeight:1.5 }}>
                {t("ps_pac_desc")}
              </div>
            </div>
          </div>
          <div style={{ flexShrink:0 }}>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor: pacInitialLoading ? "default" : "pointer" }}>
              <div
                onClick={() => {
                  if (pacInitialLoading || pacLoading) return;
                  if (isLockedToHeadOffice) { setShowDeniedPopup(true); return; }
                  // Only stage the change locally — nothing is sent to the
                  // backend here. The DB value changes only when the admin
                  // clicks "Save" below.
                  setPayAtCounterDraft((v) => !v);
                  setPacMsg("");
                }}
                style={{
                  width:44, height:24, borderRadius:12,
                  background: payAtCounterDraft ? "#16a34a" : "#d1d5db",
                  position:"relative", cursor: (pacInitialLoading || isLockedToHeadOffice) ? (isLockedToHeadOffice ? "not-allowed" : "default") : "pointer",
                  transition:"background 0.2s",
                  flexShrink:0,
                  opacity: pacInitialLoading ? 0.6 : 1,
                }}
              >
                <div style={{
                  position:"absolute", top:3, left: payAtCounterDraft ? 22 : 2,
                  width:18, height:18, borderRadius:"50%", background:"#fff",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.2)",
                  transition:"left 0.2s",
                }}/>
              </div>
              <span style={{ fontSize:13, fontWeight:600, color: payAtCounterDraft ? "#16a34a" : "#6b7280" }}>
                {pacInitialLoading ? t("mc_loading") : payAtCounterDraft ? t("enabled") : t("disabled")}
              </span>
            </label>
          </div>
        </div>

        {payAtCounterDirty && !pacInitialLoading && (
          <div style={{ marginTop:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:"10px 12px" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"#92400e" }}>
              {t("ps_pac_unsaved")}
            </span>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button
                type="button"
                onClick={() => { setPayAtCounterDraft(payAtCounterSaved); setPacMsg(""); }}
                disabled={pacLoading}
                style={{ padding:"7px 14px", borderRadius:7, border:"1.5px solid #e2e8f0", background:"#fff", color:"#475569", fontSize:12.5, fontWeight:600, cursor:"pointer" }}
              >
                {t("ps_discard")}
              </button>
              <button
                type="button"
                onClick={handleSavePayAtCounter}
                disabled={pacLoading}
                style={{ padding:"7px 16px", borderRadius:7, border:"none", background:"#16a34a", color:"#fff", fontSize:12.5, fontWeight:600, cursor: pacLoading ? "default" : "pointer", opacity: pacLoading ? 0.7 : 1 }}
              >
                {pacLoading ? t("saving_dots") : t("mc_save")}
              </button>
            </div>
          </div>
        )}

        {pacMsg && (
          <div style={{ marginTop:10, fontSize:12, fontWeight:600, color: pacMsg.toLowerCase().includes("fail") ? "#dc2626" : "#16a34a", background: pacMsg.toLowerCase().includes("fail") ? "#fef2f2" : "#f0fdf4", padding:"6px 12px", borderRadius:7 }}>
            {pacMsg}
          </div>
        )}
      </div>

      <div className="ps-terms">
        <div className="ps-terms-title">{t("pay_terms_conditions")}</div>        <ol className="ps-terms-list">
          <li>{t("ps_terms_1")}</li>
          <li>{t("ps_terms_2")}</li>
          <li>{t("ps_terms_3")}</li>
          <li>{t("ps_terms_4")}</li>
          <li>{t("ps_terms_5")}</li>
          <li>{t("ps_terms_6")}</li>
        </ol>
      </div>

       

      <style>{`
        .ps-root {
          padding: 32px 36px;
          max-width: 960px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1a1a2e;
        }
        .ps-header { margin-bottom: 28px; }
        .ps-title { font-size: 22px; font-weight: 700; margin: 0 0 4px; color: #0f172a; }
        .ps-subtitle { font-size: 13px; color: #64748b; margin: 0; }
        .ps-section-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: #334155;
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-bottom: 16px;
        }
        .ps-section-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #3b82f6;
        }
        .ps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }
        .ps-card {
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
          display: flex; flex-direction: column; gap: 10px;
        }
        .ps-card--active {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
        }
        .ps-card-top { display: flex; align-items: center; gap: 10px; }
        .ps-card-icon { flex-shrink: 0; }
        .ps-card-meta { flex: 1; min-width: 0; }
        .ps-card-name { font-size: 14px; font-weight: 600; color: #0f172a; }
        .ps-card-badge {
          font-size: 10px; font-weight: 600;
          background: #eff6ff; color: #2563eb;
          border-radius: 4px; padding: 1px 6px;
          display: inline-block; margin-top: 2px;
        }
        .ps-card-desc { font-size: 12px; color: #64748b; margin: 0; line-height: 1.5; }
        .ps-card-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }
        .ps-card-features li {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #475569;
        }
        .ps-configure-btn {
          margin-top: auto;
          width: 100%;
          padding: 8px 0;
          border: 1.5px solid #3b82f6;
          background: transparent;
          color: #3b82f6;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .ps-configure-btn:hover { background: #3b82f6; color: #fff; }

        /* Toggle */
        .ps-toggle { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
        .ps-toggle input { opacity: 0; width: 0; height: 0; }
        .ps-toggle-track {
          position: absolute; inset: 0;
          background: #cbd5e1; border-radius: 20px; cursor: pointer;
          transition: background 0.2s;
        }
        .ps-toggle-track::after {
          content: ''; position: absolute;
          left: 3px; top: 3px;
          width: 14px; height: 14px;
          background: #fff; border-radius: 50%;
          transition: transform 0.2s;
        }
        .ps-toggle input:checked + .ps-toggle-track { background: #3b82f6; }
        .ps-toggle input:checked + .ps-toggle-track::after { transform: translateX(16px); }

        /* Summary */
        .ps-summary {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 14px 16px;
          margin-bottom: 24px;
        }
        .ps-summary-label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
        .ps-summary-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .ps-chip {
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1px solid #dbeafe;
          border-radius: 20px; padding: 4px 10px;
          font-size: 12px; font-weight: 500; color: #1e40af;
        }
        .ps-chip svg { width: 18px; height: 18px; }
        .ps-chip-remove {
          background: none; border: none; cursor: pointer;
          color: #94a3b8; font-size: 16px; line-height: 1;
          padding: 0; margin-left: 2px;
        }
        .ps-chip-remove:hover { color: #ef4444; }

        /* Terms */
        .ps-terms {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 18px 20px;
          margin-bottom: 24px;
        }
        .ps-terms-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .ps-terms-list {
          margin: 0; padding-left: 18px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .ps-terms-list li { font-size: 12px; color: #475569; line-height: 1.6; }

        /* Footer */
        .ps-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; }
        .ps-btn-cancel {
          padding: 9px 20px; border-radius: 8px;
          border: 1.5px solid #e2e8f0; background: #fff;
          color: #475569; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .ps-btn-cancel:hover { border-color: #94a3b8; }
        .ps-btn-save {
          padding: 9px 22px; border-radius: 8px;
          background: #3b82f6; border: none;
          color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .ps-btn-save:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}
export default PaymentSetup;