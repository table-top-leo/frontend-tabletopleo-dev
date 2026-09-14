"use client";
import { useState } from "react";
import { MapPin, Star, Clock, Search, ChevronRight, ChevronDown, ImageOff, Flame, X, Menu, TrendingUp, ShieldCheck, Award, Loader2, Phone, Wallet, Navigation, ShoppingBag, Building2, Globe2 } from "lucide-react";
import { formatCurrency } from "../utils/currencyHelper";
import { useCustomerLanguage } from "../context/CustomerLanguageProvider";
import CustomerLanguageSelector from "./components/CustomerLanguageSelector";
import { CiSearch } from "react-icons/ci";

// ── Unified accent — one muted gold tone used everywhere instead of a
// different bright color per section. Neutral, premium, not "colorful". ──
const ACCENT = "#a8894f";
const ACCENT_DARK = "#8a6d3a";
const INK = "#18181b";

const COVER_BY_TYPE = {
  "Restaurant":        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "Cafe":              "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
  "Coffee":            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
  "Coffee Shop":       "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
  "Bakery":            "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80",
  "Fast Food":         "https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=800&q=80",
  "Pizza":             "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
  "Biryani":           "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  "South Indian":      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
  "North Indian":      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  "Chinese":           "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80",
  "Continental":       "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Juice Bar":         "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&q=80",
  "Ice Cream Parlour": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80",
  "Ice Cream":         "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80",
  "Sweet Shop":        "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80",
  "Dhaba":             "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  "Food Truck":        "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&q=80",
  "Bar":               "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
  "Pub":               "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
  "Sushi":             "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
  "Japanese":          "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
  "Mexican":           "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
  "Italian":           "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Thai":              "https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&q=80",
  "Burger":            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  "Sandwich":          "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=800&q=80",
  "Dessert":           "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80",
  "Healthy":           "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "Salad":             "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "Seafood":           "https://images.unsplash.com/photo-1559742811-822873691df8?w=800&q=80",
  "BBQ":               "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
  "Steak":             "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
  "Vegan":             "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "Breakfast":         "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
  "Brunch":            "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
  "Tea Shop":          "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
  "Bubble Tea":        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
  "Noodles":           "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
  "Pasta":             "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80",
  "Kebab":             "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&q=80",
  "Street Food":       "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  "default":           "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
};

function getCoverImage(business) {
  if (business?.cover) return business.cover;
  const type = business?.businessType || business?.type || "";
  if (COVER_BY_TYPE[type]) return COVER_BY_TYPE[type];
  const key = Object.keys(COVER_BY_TYPE).find(k =>
    type.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(type.toLowerCase())
  );
  return COVER_BY_TYPE[key] || COVER_BY_TYPE["default"];
}

function isBusinessOpen(openingTime, closingTime, workingDays) {
  try {
    const now    = new Date();
    const dayMap = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today  = dayMap[now.getDay()];
    if (workingDays) {
      const days = workingDays.split(",").map(d => d.trim());
      if (!days.some(d => d.toLowerCase() === today.toLowerCase())) return false;
    }
    if (!openingTime || !closingTime) return null;
    const [oH, oM] = openingTime.split(":").map(Number);
    const [cH, cM] = closingTime.split(":").map(Number);
    const nowMins   = now.getHours() * 60 + now.getMinutes();
    const openMins  = oH * 60 + oM;
    const closeMins = cH * 60 + cM;
    if (closeMins < openMins) {
      return nowMins >= openMins || nowMins < closeMins;
    }
    return nowMins >= openMins && nowMins < closeMins;
  } catch { return null; }
}

function fmt12h(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
}

const CustomerLandingPage = ({ business, categories, items, activeDiscounts = [], highlights, highlightsLoading = false, currencyCode, onStart, onViewOffers, onItemClick, onOpenMenu }) => {
  const { t } = useCustomerLanguage();
  const [search,         setSearch]         = useState("");
  const [activePanel,    setActivePanel]    = useState(null);

  const safeHighlights = {
    trendingToday: highlights?.trendingToday || [],
    mostPopular:   highlights?.mostPopular   || [],
    specialItems:  highlights?.specialItems  || [],
  };

  const resolveClickableItem = (highlightItem) => {
    const found = items.find(i => i.id === highlightItem.productId);
    if (found) return found;
    return {
      id: highlightItem.productId,
      catId: null,
      catName: highlightItem.categoryName || "",
      name: highlightItem.itemName,
      desc: highlightItem.itemDescription || "",
      price: Number(highlightItem.itemPrice),
      img: highlightItem.itemImageUrl || null,
      availability: "AVAILABLE",
    };
  };

  const businessName = business?.businessName || business?.name || "this restaurant";
  const addressParts = [business?.addressLine1, business?.city, business?.state, business?.country].filter(Boolean);
  const fullAddress = addressParts.length ? addressParts.join(", ") : null;
  const phoneDigits = (business?.businessPhone || "").trim();
  const directionsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;

  const paymentMethods = Array.isArray(business?.availablePaymentMethods) ? business.availablePaymentMethods : [];
  const formatGatewayName = (name) => {
    const map = { UPI: "UPI", RAZORPAY: "Razorpay", STRIPE: "Stripe", MOBILEPAY: "MobilePay", PAYPAL: "PayPal" };
    if (map[name]) return map[name];
    return String(name).charAt(0) + String(name).slice(1).toLowerCase();
  };
  const taxLine = business?.taxEnabled
    ? `${business.taxSystem || "Tax"} (${Number(business.taxRate || 0)}%) ${business.taxInclusive ? "included in prices" : "added at checkout"}`
    : "No additional tax charged";

  const HIGHLIGHT_PANELS = [
    { id: "trending", icon: TrendingUp, label: t("landing.highlights.trendingToday"), count: safeHighlights.trendingToday.length },
    { id: "special",  icon: Star,       label: t("landing.highlights.specialItems"),  count: safeHighlights.specialItems.length },
    { id: "popular",  icon: Award,      label: t("landing.highlights.mostPopular"),   count: safeHighlights.mostPopular.length },
    { id: "trust",    icon: ShieldCheck,label: t("landing.highlights.whyOrderWithUs"),count: null },
    { id: "contact",  icon: Phone,      label: `Contact ${businessName}`,             count: null },
    { id: "payments", icon: Wallet,     label: "Payments We Accept",                  count: paymentMethods.length || null },
  ];

  const trustItems = [
    { icon: ShieldCheck, title: t("landing.highlights.trustHygieneTitle"), desc: t("landing.highlights.trustHygieneDesc") },
    { icon: Flame,       title: t("landing.highlights.trustFreshTitle"),   desc: t("landing.highlights.trustFreshDesc") },
    { icon: Clock,       title: t("landing.highlights.trustFastTitle"),    desc: t("landing.highlights.trustFastDesc") },
    { icon: Star,        title: t("landing.highlights.trustSecureTitle"),  desc: t("landing.highlights.trustSecureDesc") },
  ];

  const renderHighlightCard = (h, badgeText) => {
    const clickable = resolveClickableItem(h);
    const isOOS = clickable.availability === "OUT_OF_STOCK";
    return (
      <div
        key={h.productId}
        className={`lp-hl-card${isOOS ? " lp-item-oos" : ""}`}
        onClick={() => onItemClick(clickable)}
      >
        <div style={{ width:"100%", paddingTop:"75%", position:"relative", overflow:"hidden" }}>
          {h.itemImageUrl ? (
            <img
              src={h.itemImageUrl}
              alt={h.itemName}
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }}
              onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
            />
          ) : null}
          <div style={{ position:"absolute", inset:0, background:"#f4f4f5", display:h.itemImageUrl?"none":"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:2 }}>
            <ImageOff size={14} color="#a1a1aa" strokeWidth={1.5}/>
          </div>
        </div>
        <div style={{ padding:"5px 6px 6px" }}>
          <div className="lp-hl-card-name">{h.itemName}</div>
          <div className="lp-hl-card-price">{formatCurrency(h.itemPrice, currencyCode || business?.currencyCode)}</div>
          {badgeText && (
            <span className="lp-hl-card-badge">{badgeText}</span>
          )}
        </div>
      </div>
    );
  };

  const renderEmptyState = (titleKey, quoteKey) => (
    <div className="lp-hl-empty">
      <div className="lp-hl-empty-title">{t(titleKey)}</div>
      <div className="lp-hl-empty-quote">{t(quoteKey)}</div>
      <button className="lp-hl-empty-cta" onClick={onStart}>{t("landing.startOrdering")}</button>
    </div>
  );

  if (!business) {
    return (
      <div className="cw-screen" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:36, height:36, border:"3px solid #f3f4f6", borderTopColor:"var(--brand)", borderRadius:"50%", animation:"lp-spin 0.7s linear infinite" }}/>
        <style>{`@keyframes lp-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  const handleDragStart = (e) => {
    const el = e.currentTarget;
    const startX = e.pageX;
    const startScrollLeft = el.scrollLeft;
    el.classList.add("lp-dragging");
    const onMove = (ev) => {
      el.scrollLeft = startScrollLeft - (ev.pageX - startX);
    };
    const onUp = () => {
      el.classList.remove("lp-dragging");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const openStatus  = isBusinessOpen(business?.openingTime, business?.closingTime, business?.workingDays);
  const openLabel   = openStatus === true  ? t("landing.openNow")
                    : openStatus === false ? t("landing.closed")
                    : t("landing.hoursUnknown");
  const openColor   = openStatus === true  ? "#16a34a"
                    : openStatus === false ? "#ef4444"
                    : "#a1a1aa";
  const openingFmt  = fmt12h(business?.openingTime);
  const closingFmt  = fmt12h(business?.closingTime);
  const hoursStr    = openingFmt && closingFmt ? `${openingFmt} – ${closingFmt}` : "";

  const searchResults = search.trim()
    ? items.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 12)
    : [];

  return (
    <div className="cw-screen" style={{ overflow:"hidden", position:"relative" }}>
      <style>{`
        .lp-cats, .lp-row { scrollbar-width: thin; scrollbar-color: var(--border) transparent; cursor: grab; }
        .lp-cats::-webkit-scrollbar, .lp-row::-webkit-scrollbar { height: 4px; }
        .lp-cats::-webkit-scrollbar-track, .lp-row::-webkit-scrollbar-track { background: transparent; }
        .lp-cats::-webkit-scrollbar-thumb, .lp-row::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }
        .lp-cats.lp-dragging, .lp-row.lp-dragging { cursor: grabbing; scroll-behavior: auto; }
        @keyframes lp-spin { to{transform:rotate(360deg)} }

        .lp-item-card {
          flex: 0 0 calc(20% - 7px);
          min-width: 64px;
          max-width: 110px;
          border-radius: 9px;
          overflow: hidden;
          border: 1px solid var(--border-light);
          background: var(--surface);
          cursor: pointer;
          transition: transform 0.14s, box-shadow 0.14s;
        }
        .lp-item-card:active { transform: scale(0.97); }

        .lp-item-card.lp-item-oos, .lp-hl-card.lp-item-oos { cursor: not-allowed; opacity: 0.6; }
        .lp-item-card.lp-item-oos img, .lp-hl-card.lp-item-oos img { filter: grayscale(55%); }
        .lp-item-card.lp-item-oos:active, .lp-hl-card.lp-item-oos:active { transform: none; }

        .lp-avail-tag {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 8px; font-weight: 700; letter-spacing: 0.02em;
          padding: 2px 6px; border-radius: 20px;
          text-transform: uppercase; line-height: 1.5; margin-top: 3px;
        }
        .lp-avail-tag.lp-avail-in  { background: #f0fdf4; color: #16a34a; }
        .lp-avail-tag.lp-avail-out { background: #fef2f2; color: #dc2626; }

        /* ── Highlight buttons — compressed, neutral list rows instead of
             colored gradient pills. One muted accent, no rainbow. ── */
        .lp-hl-btn {
          display: flex; align-items: center; gap: 9px; width: 100%;
          padding: 9px 11px; border-radius: 10px;
          background: var(--surface); border: 1px solid var(--border-light);
          cursor: pointer; text-align: left;
        }
        .lp-hl-btn:active { transform: scale(0.99); }
        .lp-hl-btn-icon {
          width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(168,137,79,0.12);
        }
        .lp-hl-btn-label { flex: 1; font-size: 12px; font-weight: 700; color: var(--text-primary); }
        .lp-hl-btn-count {
          background: #f4f4f5; color: #52525b; font-size: 10px; font-weight: 800;
          border-radius: 9999px; min-width: 18px; height: 18px; display: flex;
          align-items: center; justify-content: center; padding: 0 5px; flex-shrink: 0;
        }

        .lp-hl-panel {
          margin-top: 6px; border-radius: 10px; background: var(--surface-2);
          border: 1px solid var(--border-light); overflow: hidden;
          animation: lp-panel-in 0.16s ease both;
        }
        @keyframes lp-panel-in { from { opacity:0; transform: translateY(-3px); } to { opacity:1; transform: translateY(0); } }
        .lp-hl-panel-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 10px 6px;
        }
        .lp-hl-panel-title {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11.5px; font-weight: 700; color: var(--text-primary);
        }
        .lp-hl-panel-close {
          background: none; border: none; cursor: pointer; padding: 3px;
          color: var(--text-muted); display: flex; touch-action: manipulation;
        }

        .lp-hl-row {
          display: flex; gap: 7px; overflow-x: auto; padding: 0 10px 10px;
          -webkit-overflow-scrolling: touch; scroll-behavior: smooth;
          scrollbar-width: thin; scrollbar-color: var(--border) transparent; cursor: grab;
        }
        .lp-hl-row::-webkit-scrollbar { height: 4px; }
        .lp-hl-row::-webkit-scrollbar-track { background: transparent; }
        .lp-hl-row::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }
        .lp-hl-row.lp-dragging { cursor: grabbing; scroll-behavior: auto; }

        .lp-hl-card {
          flex: 0 0 104px; max-width: 104px; border-radius: 9px; overflow: hidden;
          border: 1px solid var(--border-light); background: var(--surface);
          cursor: pointer; transition: transform 0.14s;
        }
        .lp-hl-card:active { transform: scale(0.97); }
        .lp-hl-card-name {
          font-size: 10.5px; font-weight: 700; color: var(--text-primary); line-height: 1.3;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 26px;
        }
        .lp-hl-card-price { font-size: 11px; font-weight: 800; color: var(--brand); margin-top: 3px; }
        .lp-hl-card-badge {
          display: inline-block; font-size: 8px; font-weight: 700; margin-top: 4px;
          padding: 2px 6px; border-radius: 20px; white-space: nowrap;
          background: rgba(168,137,79,0.12); color: ${ACCENT_DARK};
        }

        .lp-hl-loading {
          display: flex; align-items: center; gap: 8px; padding: 16px 12px 18px;
          font-size: 11.5px; color: var(--text-muted); font-weight: 600;
        }
        .lp-hl-spinner {
          width: 13px; height: 13px; border-radius: 50%; flex-shrink: 0;
          border: 2px solid var(--border); border-top-color: ${ACCENT};
          animation: lp-spin 0.7s linear infinite;
        }

        .lp-hl-empty {
          display: flex; flex-direction: column; align-items: center; text-align: center;
          padding: 16px 18px 18px; gap: 3px;
        }
        .lp-hl-empty-title { font-size: 12px; font-weight: 700; color: var(--text-primary); }
        .lp-hl-empty-quote { font-size: 11px; color: var(--text-muted); line-height: 1.4; max-width: 230px; margin-bottom: 8px; }
        .lp-hl-empty-cta {
          font-size: 11px; font-weight: 700; color: #fff; background: ${INK};
          border: none; border-radius: 9999px; padding: 7px 16px; cursor: pointer;
          touch-action: manipulation;
        }

        .lp-hl-trust-row {
          display: flex; gap: 7px; overflow-x: auto; padding: 0 10px 11px;
          -webkit-overflow-scrolling: touch; scrollbar-width: thin; scrollbar-color: var(--border) transparent; cursor: grab;
        }
        .lp-hl-trust-row::-webkit-scrollbar { height: 4px; }
        .lp-hl-trust-row::-webkit-scrollbar-track { background: transparent; }
        .lp-hl-trust-row::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }
        .lp-hl-trust-row.lp-dragging { cursor: grabbing; scroll-behavior: auto; }
        .lp-hl-trust-card {
          flex: 0 0 112px; max-width: 112px; padding: 9px 8px; border-radius: 9px;
          background: var(--surface); border: 1px solid var(--border-light);
        }
        .lp-hl-trust-icon {
          width: 26px; height: 26px; border-radius: 7px; display: flex;
          align-items: center; justify-content: center; margin-bottom: 5px;
          background: rgba(168,137,79,0.12); color: ${ACCENT_DARK};
        }
        .lp-hl-trust-title { font-size: 10.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
        .lp-hl-trust-desc { font-size: 9px; color: var(--text-muted); line-height: 1.35; }

        .lp-hl-contact-body { padding: 0 10px 11px; display: flex; flex-direction: column; gap: 8px; }
        .lp-hl-contact-row { display: flex; align-items: flex-start; gap: 8px; }
        .lp-hl-contact-icon {
          width: 24px; height: 24px; border-radius: 7px; display: flex;
          align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
          background: rgba(168,137,79,0.12); color: ${ACCENT_DARK};
        }
        .lp-hl-contact-label { font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .lp-hl-contact-value { font-size: 11.5px; font-weight: 700; color: var(--text-primary); margin-top: 1px; line-height: 1.35; }
        .lp-hl-contact-actions { display: flex; gap: 7px; margin-top: 2px; }
        .lp-hl-contact-btn {
          flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 8px 10px; border-radius: 8px; background: ${INK}; color: #fff;
          font-size: 11px; font-weight: 700; text-decoration: none; cursor: pointer;
          touch-action: manipulation;
        }

        .lp-hl-pay-pills { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 10px 9px; }
        .lp-hl-pay-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 10px; border-radius: 9999px; background: #fafafa;
          color: var(--text-primary); font-size: 11px; font-weight: 700; border: 1px solid var(--border-light);
        }
        .lp-hl-tax-note {
          display: flex; align-items: center; gap: 7px; margin: 0 10px 11px;
          padding: 8px 10px; border-radius: 8px; background: #fafafa;
          font-size: 10.5px; font-weight: 600; color: var(--text-muted); line-height: 1.35;
          border: 1px solid var(--border-light);
        }

        /* Offers row — compressed neutral row instead of red/orange banner */
        .lp-offers-btn {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 9px 11px; border-radius: 10px;
          background: var(--surface); border: 1px solid var(--border-light);
          cursor: pointer;
        }

        @media (max-width: 320px) {
          .lp-hero-img   { height: 130px !important; }
          .lp-biz-name   { font-size: 14px !important; }
          .lp-cat-pill   { font-size: 10.5px !important; padding: 4px 9px !important; }
          .lp-item-name  { font-size: 10px !important; }
          .lp-item-price { font-size: 11px !important; }
        }
        @media (min-width: 375px) {
          .lp-item-card  { border-radius: 10px; }
        }
        @media (min-width: 420px) {
          .lp-hero-img   { height: 170px !important; }
          .lp-item-card  { border-radius: 11px; }
        }
        @media (hover: hover) {
          .lp-item-card:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.07); }
          .lp-hl-btn:hover { background: #fafafa; }
        }
      `}</style>

      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", WebkitOverflowScrolling:"touch" }}>

        {/* Hero */}
        <div style={{ position:"relative" }}>
          <img
            className="lp-hero-img"
            src={getCoverImage(business)}
            alt="cover"
            style={{ width:"100%", height:150, objectFit:"cover", display:"block" }}
          />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.58) 100%)" }}/>
          <button
            onClick={onOpenMenu}
            aria-label={t("landing.openMenuAria")}
            style={{
              position:"absolute", top:12, left:12, width:36, height:36, borderRadius:10,
              background:"rgba(0,0,0,0.36)", backdropFilter:"blur(4px)", border:"1px solid rgba(255,255,255,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", touchAction:"manipulation",
            }}
          >
            <Menu size={18} color="#fff" />
          </button>
          <div style={{ position:"absolute", top:12, right:12 }}>
            <CustomerLanguageSelector variant="dark" />
          </div>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 14px", display:"flex", alignItems:"flex-end", gap:10 }}>
            <div style={{ width:44, height:44, borderRadius:10, overflow:"hidden", border:"2px solid #fff", flexShrink:0, background:"#fff" }}>
              {(business.logoUrl || business.logo) ? (
                <img src={business.logoUrl || business.logo} alt="logo" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
              ) : (
                <div style={{ width:"100%", height:"100%", background:INK, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:800, color:"#fff" }}>
                  {(business.businessName || "T")[0]}
                </div>
              )}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="lp-biz-name" style={{ fontSize:14.5, fontWeight:800, color:"#fff", letterSpacing:"-0.2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {business.businessName || business.name}
              </div>
              <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.78)", marginTop:1 }}>
                {business.businessType || business.type}
              </div>
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-around", padding:"7px 14px", borderBottom:"1px solid var(--border-light)", background:"var(--surface)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:3 }}>
            <Star size={11} fill={ACCENT} color={ACCENT}/>
            <span style={{ fontSize:11.5, fontWeight:700, color:"var(--text-primary)" }}>4.8</span>
            <span style={{ fontSize:10, color:"var(--text-muted)" }}>(120+)</span>
          </div>
          <div style={{ width:1, height:11, background:"var(--border)" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:3, fontSize:10.5, color:"var(--text-muted)" }}>
            <MapPin size={11}/><span style={{ maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{business.city || ""}</span>
          </div>
          <div style={{ width:1, height:11, background:"var(--border)" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:3, fontSize:10.5, fontWeight:700, color:openColor }} title={hoursStr}>
            <Clock size={11}/> {openLabel}
          </div>
        </div>

        {/* Categories */}
        <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border-light)", paddingBottom:7 }}>
          <div style={{ padding:"8px 14px 5px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{t("landing.categories")}</span>
            <span style={{ fontSize:10, color:"var(--text-muted)", fontWeight:600 }}>{categories.length}</span>
          </div>
          <div className="lp-cats" onMouseDown={handleDragStart} style={{ display:"flex", gap:6, overflowX:"auto", padding:"0 14px", WebkitOverflowScrolling:"touch" }}>
            {categories.map(cat => (
              <button
                key={cat.categoryId}
                className="lp-cat-pill"
                onClick={onStart}
                style={{ flexShrink:0, display:"flex", alignItems:"center", gap:5, padding: cat.categoryImageUrl ? "3px 10px 3px 3px" : "4px 11px", borderRadius:9999, border:"1px solid var(--border)", background:"transparent", color:"var(--text-secondary)", fontSize:11, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s", touchAction:"manipulation" }}
              >
                {cat.categoryImageUrl ? (
                  <div style={{ width:20, height:20, borderRadius:"50%", overflow:"hidden", flexShrink:0 }}>
                    <img src={cat.categoryImageUrl} alt={cat.categoryName} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                  </div>
                ) : (
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"#f4f4f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ImageOff size={10} color="#a1a1aa"/>
                  </div>
                )}
                {cat.categoryName}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 12, background: "var(--surface)" }} />

        <div style={{ padding:"0 14px 4px", background:"var(--surface)" }}>
          {search.trim() && (
            <div className="lp-hl-panel" style={{ marginTop: 0 }}>
              <div className="lp-hl-panel-head">
                <span className="lp-hl-panel-title"><Search size={12} color={ACCENT_DARK}/> {`"${search}"`}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>
                  {searchResults.length} {searchResults.length === 1 ? t("common.item") : t("common.items")}
                </span>
              </div>
              {searchResults.length === 0 ? (
                <div style={{ padding:"18px 14px 20px", textAlign:"center", color:"var(--text-muted)", fontSize:12 }}>
                  <div style={{ fontSize:24, marginBottom:6 }}><CiSearch/></div>
                  {t("landing.noItemsFound")}
                </div>
              ) : (
                <div className="lp-hl-row" onMouseDown={handleDragStart}>
                  {searchResults.map(item => {
                    const isOOS = item.availability === "OUT_OF_STOCK";
                    return (
                      <div
                        key={item.id}
                        className={`lp-hl-card${isOOS ? " lp-item-oos" : ""}`}
                        onClick={() => onItemClick(item)}
                      >
                        <div style={{ width:"100%", paddingTop:"75%", position:"relative", overflow:"hidden" }}>
                          {item.img ? (
                            <img
                              src={item.img}
                              alt={item.name}
                              style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                              onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
                            />
                          ) : null}
                          <div style={{ position:"absolute", inset:0, background:"#f4f4f5", display:item.img?"none":"flex", alignItems:"center", justifyContent:"center" }}>
                            <ImageOff size={14} color="#a1a1aa" strokeWidth={1.5}/>
                          </div>
                        </div>
                        <div style={{ padding:"5px 6px 6px" }}>
                          <div className="lp-hl-card-name">{item.name}</div>
                          <div className="lp-hl-card-price">{formatCurrency(item.price, currencyCode || business?.currencyCode)}</div>
                          <span className={`lp-avail-tag ${isOOS ? "lp-avail-out" : "lp-avail-in"}`}>
                            {isOOS ? t("menu.outOfStock") : t("menu.available")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Offers */}
        <div style={{ padding:"2px 14px 6px", background:"var(--surface)" }}>
          <button onClick={onViewOffers} className="lp-offers-btn">
            <Flame size={14} color={ACCENT_DARK} style={{ flexShrink:0 }}/>
            <span style={{ flex:1, textAlign:"left", fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>
              {t("landing.offersAndDeals")}
            </span>
            {activeDiscounts.length > 0 && (
              <span className="lp-hl-btn-count">{activeDiscounts.length > 9 ? "9+" : activeDiscounts.length}</span>
            )}
            <ChevronRight size={13} color="#a1a1aa" style={{ flexShrink:0 }}/>
          </button>
        </div>

        <div style={{ padding:"2px 14px 8px", background:"var(--surface)", display:"flex", flexDirection:"column", gap:6 }}>
          {HIGHLIGHT_PANELS.map(panel => {
            const Icon = panel.icon;
            const isOpen = activePanel === panel.id;
            return (
              <div key={panel.id}>
                <button
                  type="button"
                  onClick={() => setActivePanel(isOpen ? null : panel.id)}
                  className="lp-hl-btn"
                >
                  <span className="lp-hl-btn-icon"><Icon size={14} color={ACCENT_DARK}/></span>
                  <span className="lp-hl-btn-label">{panel.label}</span>
                  {panel.count !== null && panel.count > 0 && (
                    <span className="lp-hl-btn-count">{panel.count > 9 ? "9+" : panel.count}</span>
                  )}
                  <ChevronDown size={13} color="#a1a1aa" style={{ flexShrink:0, transform: isOpen ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}/>
                </button>

                {isOpen && (
                  <div className="lp-hl-panel">
                    {panel.id === "trending" && (
                      <>
                        <div className="lp-hl-panel-head">
                          <span className="lp-hl-panel-title"><TrendingUp size={12} color={ACCENT_DARK}/> {t("landing.highlights.trendingToday")}</span>
                          <button className="lp-hl-panel-close" onClick={() => setActivePanel(null)}><X size={13}/></button>
                        </div>
                        {highlightsLoading && safeHighlights.trendingToday.length === 0 ? (
                          <div className="lp-hl-loading"><span className="lp-hl-spinner"/> {t("landing.highlights.loadingTrending")}</div>
                        ) : safeHighlights.trendingToday.length === 0 ? (
                          renderEmptyState("landing.highlights.noTrendingTitle", "landing.highlights.noTrendingQuote")
                        ) : (
                          <div className="lp-hl-row" onMouseDown={handleDragStart}>
                            {safeHighlights.trendingToday.map(h => renderHighlightCard(h, t("landing.highlights.soldToday", { count: h.orderCount || 0 })))}
                          </div>
                        )}
                      </>
                    )}

                    {panel.id === "special" && (
                      <>
                        <div className="lp-hl-panel-head">
                          <span className="lp-hl-panel-title"><Star size={12} color={ACCENT_DARK}/> {t("landing.highlights.specialItems")}</span>
                          <button className="lp-hl-panel-close" onClick={() => setActivePanel(null)}><X size={13}/></button>
                        </div>
                        {highlightsLoading && safeHighlights.specialItems.length === 0 ? (
                          <div className="lp-hl-loading"><span className="lp-hl-spinner"/> {t("landing.highlights.loadingSpecial")}</div>
                        ) : safeHighlights.specialItems.length === 0 ? (
                          renderEmptyState("landing.highlights.noSpecialTitle", "landing.highlights.noSpecialQuote")
                        ) : (
                          <div className="lp-hl-row" onMouseDown={handleDragStart}>
                            {safeHighlights.specialItems.map(h => renderHighlightCard(h, t("landing.highlights.chefsPick")))}
                          </div>
                        )}
                      </>
                    )}

                    {panel.id === "popular" && (
                      <>
                        <div className="lp-hl-panel-head">
                          <span className="lp-hl-panel-title"><Award size={12} color={ACCENT_DARK}/> {t("landing.highlights.mostPopular")}</span>
                          <button className="lp-hl-panel-close" onClick={() => setActivePanel(null)}><X size={13}/></button>
                        </div>
                        {highlightsLoading && safeHighlights.mostPopular.length === 0 ? (
                          <div className="lp-hl-loading"><span className="lp-hl-spinner"/> {t("landing.highlights.loadingPopular")}</div>
                        ) : safeHighlights.mostPopular.length === 0 ? (
                          renderEmptyState("landing.highlights.noPopularTitle", "landing.highlights.noPopularQuote")
                        ) : (
                          <div className="lp-hl-row" onMouseDown={handleDragStart}>
                            {safeHighlights.mostPopular.map(h => renderHighlightCard(h, t("landing.highlights.allTimeFavorite")))}
                          </div>
                        )}
                      </>
                    )}

                    {panel.id === "trust" && (
                      <>
                        <div className="lp-hl-panel-head">
                          <span className="lp-hl-panel-title"><ShieldCheck size={12} color={ACCENT_DARK}/> {t("landing.highlights.whyOrderWithUs")}</span>
                          <button className="lp-hl-panel-close" onClick={() => setActivePanel(null)}><X size={13}/></button>
                        </div>
                        <div className="lp-hl-trust-row" onMouseDown={handleDragStart}>
                          {trustItems.map((ti, idx) => {
                            const TIcon = ti.icon;
                            return (
                              <div key={idx} className="lp-hl-trust-card">
                                <div className="lp-hl-trust-icon"><TIcon size={14} /></div>
                                <div className="lp-hl-trust-title">{ti.title}</div>
                                <div className="lp-hl-trust-desc">{ti.desc}</div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {panel.id === "contact" && (
                      <>
                        <div className="lp-hl-panel-head">
                          <span className="lp-hl-panel-title"><Phone size={12} color={ACCENT_DARK}/> Contact {businessName}</span>
                          <button className="lp-hl-panel-close" onClick={() => setActivePanel(null)}><X size={13}/></button>
                        </div>
                        <div className="lp-hl-contact-body">
                          <div className="lp-hl-contact-row">
                            <div className="lp-hl-contact-icon"><Building2 size={13}/></div>
                            <div>
                              <div className="lp-hl-contact-label">Restaurant</div>
                              <div className="lp-hl-contact-value">{businessName}</div>
                            </div>
                          </div>
                          <div className="lp-hl-contact-row">
                            <div className="lp-hl-contact-icon"><MapPin size={13}/></div>
                            <div>
                              <div className="lp-hl-contact-label">Address</div>
                              <div className="lp-hl-contact-value">{fullAddress || "Not available yet"}</div>
                            </div>
                          </div>
                          <div className="lp-hl-contact-row">
                            <div className="lp-hl-contact-icon"><Phone size={13}/></div>
                            <div>
                              <div className="lp-hl-contact-label">Mobile Number</div>
                              <div className="lp-hl-contact-value">{phoneDigits || "Not available yet"}</div>
                            </div>
                          </div>
                          <div className="lp-hl-contact-row">
                            <div className="lp-hl-contact-icon"><Globe2 size={13}/></div>
                            <div>
                              <div className="lp-hl-contact-label">Country</div>
                              <div className="lp-hl-contact-value">{business?.country || "Not available yet"}</div>
                            </div>
                          </div>

                          {(phoneDigits || directionsUrl) && (
                            <div className="lp-hl-contact-actions">
                              {phoneDigits && (
                                <a className="lp-hl-contact-btn" href={`tel:${phoneDigits}`}>
                                  <Phone size={12}/> Call Now
                                </a>
                              )}
                              {directionsUrl && (
                                <a className="lp-hl-contact-btn" href={directionsUrl} target="_blank" rel="noopener noreferrer">
                                  <Navigation size={12}/> Get Directions
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {panel.id === "payments" && (
                      <>
                        <div className="lp-hl-panel-head">
                          <span className="lp-hl-panel-title"><Wallet size={12} color={ACCENT_DARK}/> Payments We Accept</span>
                          <button className="lp-hl-panel-close" onClick={() => setActivePanel(null)}><X size={13}/></button>
                        </div>
                        {paymentMethods.length === 0 ? (
                          <div style={{ padding:"14px 14px 16px", fontSize:11.5, color:"var(--text-muted)" }}>
                            Payment options will be shown here once configured.
                          </div>
                        ) : (
                          <div className="lp-hl-pay-pills">
                            {paymentMethods.map((pm, idx) => (
                              <span key={idx} className="lp-hl-pay-pill">
                                <Wallet size={11}/> {formatGatewayName(pm)}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="lp-hl-tax-note">
                          <ShieldCheck size={12} color={ACCENT_DARK} style={{ flexShrink:0 }}/>
                          <span>{taxLine}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ height: 80 }} />
      </div>

      <div className="cx-sticky-bottom" style={{ padding:"8px 14px" }}>
        <button
          onClick={onStart}
          style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            width:"100%", padding:"11px 20px", borderRadius:11,
            background: INK,
            border:"none", cursor:"pointer", touchAction:"manipulation",
            fontSize:13, fontWeight:700, color:"#fff",
          }}
        >
          <ShoppingBag size={15}/> {t("landing.startOrdering")} <ChevronRight size={15}/>
        </button>
      </div>
    </div>
  );
};

export default CustomerLandingPage;