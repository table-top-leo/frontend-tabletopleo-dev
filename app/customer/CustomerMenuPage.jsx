"use client";

import { getCurrencySymbol, formatCurrency } from "../utils/currencyHelper";
import { getItemDiscount, computeDiscountedPrice } from "../utils/discountHelper";
import { useState, useRef } from "react";
import { ArrowLeft, Search, ShoppingCart, X, Plus, ImageOff, Tag } from "lucide-react";
import { useCustomerLanguage } from "../context/CustomerLanguageProvider";
import { CiSearch } from "react-icons/ci";

const CustomerMenuPage = ({
  business,
  categories = [],
  items = [],
  activeDiscounts = [],
  currencyCode,
  cart: propCart = [],
  onItemClick,
  onViewCart,
  onViewOffers,
  onBack,
}) => {
  const { t } = useCustomerLanguage();
  // Business currency is authoritative — never the admin's own login
  // session (which a real customer's device never has anyway).
  const _currCode = currencyCode || business?.currencyCode || "INR";

  const [activecat, setActivecat] = useState(0);
  const [search,    setSearch]    = useState("");
  const searchRef  = useRef(null);

  const allCats = [
    { id: 0, name: t("menu.allItems"), imageUrl: null },
    ...categories.map(c => ({
      id:       c.categoryId || c.id,
      name:     c.categoryName || c.name,
      imageUrl: c.categoryImageUrl || null,
    })),
  ];

  const filtered = items.filter(i => {
    const matchCat  = activecat === 0 || i.catId === activecat;
    const matchSrch = !search.trim() ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.desc    || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.catName || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrch;
  });

  const cartCount  = propCart.reduce((s, c) => s + (c.qty || 0), 0);
  const getCartQty = (id) => propCart.find(c => c.id === id)?.qty || 0;

  const activeCatName = activecat === 0
    ? t("menu.allItems")
    : allCats.find(c => c.id === activecat)?.name || t("common.items");

  // Mouse click-and-drag horizontal scroll for desktop — mobile already
  // scrolls fine via native touch-swipe.
  const handleDragStart = (e) => {
    const el = e.currentTarget;
    const startX = e.pageX;
    const startScrollLeft = el.scrollLeft;
    el.classList.add("mp-dragging");
    const onMove = (ev) => { el.scrollLeft = startScrollLeft - (ev.pageX - startX); };
    const onUp = () => {
      el.classList.remove("mp-dragging");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div className="cw-screen" style={{ overflow:"hidden" }}>
      <style>{`
        .mp-cats { scrollbar-width: thin; scrollbar-color: var(--border) transparent; cursor: grab; }
        .mp-cats::-webkit-scrollbar  { height: 4px; }
        .mp-cats::-webkit-scrollbar-track { background: transparent; }
        .mp-cats::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }
        .mp-cats.mp-dragging { cursor: grabbing; scroll-behavior: auto; }
        .mp-items::-webkit-scrollbar { width:2px }
        .mp-items::-webkit-scrollbar-track { background:transparent }
        .mp-items::-webkit-scrollbar-thumb { background:var(--border); border-radius:99px }

        .mp-item-row {
          display:flex;
          align-items:center;
          gap:10px;
          padding:9px 14px;
          border-bottom:1px solid var(--border-light);
          cursor:pointer;
          background:transparent;
          transition:background 0.12s;
          -webkit-tap-highlight-color:transparent;
          touch-action:manipulation;
        }
        .mp-item-row:active { background:var(--brand-bg); }

        .mp-item-row.mp-row-oos { cursor:not-allowed; opacity:0.55; }
        .mp-item-row.mp-row-oos:active { background:transparent; }
        .mp-item-row.mp-row-oos .mp-item-img { filter: grayscale(70%); }

        .mp-avail-tag {
          display:inline-flex; align-items:center; gap:3px;
          font-size:9px; font-weight:700; letter-spacing:0.02em;
          padding:1.5px 7px; border-radius:20px; text-transform:uppercase;
          line-height:1.6; margin-top:3px;
        }
        .mp-avail-tag.mp-avail-in  { background:#f0fdf4; color:#16a34a; }
        .mp-avail-tag.mp-avail-out { background:#fef2f2; color:#dc2626; }

        .mp-item-img {
          width:58px; height:58px;
          border-radius:8px;
          object-fit:cover;
          border:1px solid var(--border-light);
          display:block;
          flex-shrink:0;
        }

        @media (min-width:375px) {
          .mp-item-img { width:62px; height:62px; }
          .mp-item-name { font-size:13px !important; }
        }
        @media (min-width:420px) {
          .mp-item-img { width:64px; height:64px; border-radius:9px; }
          .mp-item-row { padding:10px 16px; }
        }

        @media (max-width:320px) {
          .mp-item-img   { width:52px; height:52px; }
          .mp-item-name  { font-size:11.5px !important; }
          .mp-item-price { font-size:12px !important; }
          .mp-cat-pill   { font-size:10.5px !important; }
        }

        @media (hover:hover) {
          .mp-item-row:hover { background:var(--brand-bg); }
        }

        @keyframes mp-fade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── FIXED HEADER — stays put; only the items list below scrolls ── */}
      <div style={{ flexShrink:0 }}>

        <div className="cx-topbar" style={{ padding:"11px 14px 9px" }}>
          <button className="back-btn cx-topbar-action" onClick={onBack} style={{ touchAction:"manipulation" }}>
            <ArrowLeft size={19}/>
          </button>
          <span className="cx-topbar-title" style={{ fontSize:14.5 }}>
            {business?.businessName || t("menu.title")}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <button onClick={onViewOffers} className="cx-topbar-action" style={{ position: "relative", touchAction: "manipulation" }} aria-label={t("menu.offersAria")}>
              <Tag size={17} />
              {activeDiscounts.length > 0 && (
                <span style={{ position:"absolute", top:-4, right:-4, background:"#dc2626", color:"#fff", fontSize:9.5, fontWeight:700, borderRadius:"9999px", minWidth:15, height:15, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px", lineHeight:1 }}>
                  {activeDiscounts.length > 9 ? "9+" : activeDiscounts.length}
                </span>
              )}
            </button>
            <button className="cx-topbar-action" onClick={onViewCart}
              style={{ position:"relative", touchAction:"manipulation" }}>
              <ShoppingCart size={17}/>
              {cartCount > 0 && (
                <span style={{ position:"absolute", top:-4, right:-4, background:"var(--brand)", color:"#fff", fontSize:9.5, fontWeight:700, borderRadius:"9999px", minWidth:15, height:15, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px", lineHeight:1 }}>
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div style={{ padding:"6px 14px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"var(--surface-2)", border:"1px solid var(--border-light)", borderRadius:9999, padding:"7px 12px", position:"relative" }}>
            <Search size={13} color="var(--text-muted)" style={{ flexShrink:0 }}/>
            <input
              ref={searchRef}
              placeholder={t("menu.searchItemsCategories")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:13, color:"var(--text-primary)", minWidth:0 }}
            />
            {search && (
              <button onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", flexShrink:0, touchAction:"manipulation" }}>
                <X size={13} color="var(--text-muted)"/>
              </button>
            )}
          </div>
        </div>

        <div className="mp-cats" onMouseDown={handleDragStart} style={{ display:"flex", gap:5, overflowX:"auto", padding:"6px 14px 6px", borderBottom:"1px solid var(--border-light)", WebkitOverflowScrolling:"touch" }}>
          {allCats.map(cat => {
            const isActive = activecat === cat.id;
            const hasImg   = cat.id !== 0 && cat.imageUrl;
            const noImg    = cat.id !== 0 && !cat.imageUrl;
            return (
              <button
                key={cat.id}
                className="mp-cat-pill"
                onClick={() => { setActivecat(cat.id); setSearch(""); }}
                style={{
                  flexShrink:0, display:"flex", alignItems:"center",
                  gap: cat.id !== 0 ? 4 : 0,
                  padding: hasImg ? "3px 9px 3px 3px" : "4px 11px",
                  borderRadius:9999,
                  border:`1px solid ${isActive?"var(--brand)":"var(--border)"}`,
                  background: isActive ? "var(--brand)" : "transparent",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  fontSize:11, fontWeight:600,
                  cursor:"pointer", whiteSpace:"nowrap",
                  transition:"all 0.15s", touchAction:"manipulation",
                }}
              >
                {hasImg && (
                  <div style={{ width:18, height:18, borderRadius:"50%", overflow:"hidden", flexShrink:0 }}>
                    <img src={cat.imageUrl} alt={cat.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                  </div>
                )}
                {noImg && (
                  <div style={{ width:18, height:18, borderRadius:"50%", background:"#f4f4f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ImageOff size={9} color="#a1a1aa"/>
                  </div>
                )}
                {cat.name}
              </button>
            );
          })}
        </div>

        <div style={{ padding:"5px 14px 4px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {search.trim() ? `"${search}"` : activeCatName}
          </span>
          <span style={{ fontSize:10, color:"var(--text-muted)" }}>
            {filtered.length} {filtered.length === 1 ? t("common.item") : t("common.items")}
          </span>
        </div>
      </div>

      {/* ── SCROLLABLE ITEMS ONLY ─────────────────── */}
      <div className="mp-items" style={{ flex:1, minHeight:0, overflowY:"auto", overflowX:"hidden", WebkitOverflowScrolling:"touch" }}>
        {filtered.length === 0 ? (
          <div style={{ padding:"40px 20px", textAlign:"center" }}> 
            <div style={{ fontSize:32, marginBottom:10, color:"#d4d4d8" }}><CiSearch/></div>
            <div style={{ fontSize:13.5, fontWeight:700, color:"var(--text-secondary)", marginBottom:4 }}>
              {search ? t("menu.noResultsFor", { search }) : t("menu.noItemsHere")}
            </div>
            {search && (
              <button onClick={() => setSearch("")}
                style={{ fontSize:12.5, color:"var(--brand)", background:"none", border:"none", cursor:"pointer", fontWeight:600, marginTop:6, touchAction:"manipulation" }}>
                {t("menu.clearSearch")}
              </button>
            )}
          </div>
        ) : filtered.map((item, idx) => {
          const qty = getCartQty(item.id);
          const discount = getItemDiscount(item, activeDiscounts);
          const discountedPrice = discount ? computeDiscountedPrice(item.price, discount) : null;
          const isOOS = item.availability === "OUT_OF_STOCK";
          return (
            <div
              key={item.id}
              className={`mp-item-row${isOOS ? " mp-row-oos" : ""}`}
              onClick={() => onItemClick(item)}
              style={{ animation:`mp-fade 0.18s ease ${Math.min(idx,10)*0.025}s both` }}
            >
              <div style={{ position:"relative", flexShrink:0 }}>
                {item.img ? (
                  <>
                    <img
                      className="mp-item-img"
                      src={item.img}
                      alt={item.name}
                      onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
                    />
                    <div className="mp-item-img" style={{ display:"none", background:"#f4f4f5", alignItems:"center", justifyContent:"center" }}>
                      <ImageOff size={16} color="#a1a1aa" strokeWidth={1.5}/>
                    </div>
                  </>
                ) : (
                  <div className="mp-item-img" style={{ display:"flex", background:"#f4f4f5", alignItems:"center", justifyContent:"center" }}>
                    <ImageOff size={16} color="#a1a1aa" strokeWidth={1.5}/>
                  </div>
                )}
                {qty > 0 && (
                  <div style={{ position:"absolute", top:-5, right:-5, width:17, height:17, borderRadius:"50%", background:"var(--brand)", color:"#fff", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff" }}>
                    {qty}
                  </div>
                )}
                {discount && (
                  <div style={{ position:"absolute", bottom:-4, left:-4, display:"flex", alignItems:"center", gap:2, background:"#dc2626", color:"#fff", fontSize:7.5, fontWeight:800, padding:"2px 5px", borderRadius:20, border:"1.5px solid #fff" }}>
                    <Tag size={7} /> {discount.badgeLabel}
                  </div>
                )}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:6 }}>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div className="mp-item-name" style={{ fontSize:12.5, fontWeight:700, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {item.name}
                    </div>
                    {item.desc && (
                      <div style={{ fontSize:11, color:"var(--text-muted)", lineHeight:1.4, marginTop:1, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical" }}>
                        {item.desc}
                      </div>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                      {(search.trim() || activecat === 0) && item.catName && (
                        <span style={{ fontSize:9, fontWeight:700, color:"var(--brand)", background:"var(--brand-muted)", borderRadius:20, padding:"1px 6px", display:"inline-block", marginTop:2 }}>
                          {item.catName}
                        </span>
                      )}
                      <span className={`mp-avail-tag ${isOOS ? "mp-avail-out" : "mp-avail-in"}`}>
                        {isOOS ? t("menu.outOfStock") : t("menu.available")}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    flexShrink:0, minWidth:52, height:26, borderRadius:7, padding:"0 12px",
                    border:`1px solid ${isOOS ? "var(--border)" : "var(--brand)"}`, display:"flex", alignItems:"center", justifyContent:"center",
                    background: isOOS ? "var(--surface-2)" : (qty>0 ? "var(--brand)" : "transparent"),
                    color: isOOS ? "var(--text-muted)" : (qty>0 ? "#fff" : "var(--brand)"),
                    fontSize:11, fontWeight:800, letterSpacing:"0.02em",
                    transition:"background 0.15s, color 0.15s",
                  }}>
                    {isOOS ? t("menu.outOfStockShort") : (qty>0 ? t("menu.added") : t("menu.add"))}
                  </div>
                </div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:4 }}>
                  <span style={{ display:"flex", alignItems:"baseline", gap:5 }}>
                    <span className="mp-item-price" style={{ fontSize:13, fontWeight:800, color: discount ? "#dc2626" : "var(--brand)" }}>
                      {formatCurrency(discount ? discountedPrice : item.price, _currCode)}
                    </span>
                    {discount && (
                      <span style={{ fontSize:10.5, color:"var(--text-muted)", textDecoration:"line-through" }}>
                        {formatCurrency(item.price, _currCode)}
                      </span>
                    )}
                  </span>
                  {qty > 0 && (
                    <span style={{ fontSize:10, fontWeight:700, color:"var(--brand)" }}>
                      {t("menu.inCart", { count: qty })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
};

export default CustomerMenuPage;