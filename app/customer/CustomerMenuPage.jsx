"use client";

import { getCurrencySymbol, formatCurrency } from "../utils/currencyHelper";
import { useState, useRef } from "react";
import { ArrowLeft, Search, ShoppingCart, X, Plus, ImageOff } from "lucide-react";

const CustomerMenuPage = ({
  business,
  categories = [],
  items = [],
  cart: propCart = [],
  onItemClick,
  onViewCart,
  onBack,
}) => {
  const _user = (typeof window !== "undefined")
    ? (() => { try { return JSON.parse(localStorage.getItem("ttl_user") || "{}"); } catch { return {}; } })()
    : {};
  const _currCode = _user.currencyCode || "INR";

  const [activecat, setActivecat] = useState(0);
  const [search,    setSearch]    = useState("");
  const searchRef  = useRef(null);

  const allCats = [
    { id: 0, name: "All", imageUrl: null },
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
    ? "All Items"
    : allCats.find(c => c.id === activecat)?.name || "Items";

  return (
    <div className="cw-screen" style={{ overflow:"hidden" }}>
      <style>{`
        .mp-cats::-webkit-scrollbar  { display:none }
        .mp-items::-webkit-scrollbar { width:2px }
        .mp-items::-webkit-scrollbar-track { background:transparent }
        .mp-items::-webkit-scrollbar-thumb { background:var(--border); border-radius:99px }

        /* Item card responsive */
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

        .mp-item-img {
          width:58px; height:58px;
          border-radius:9px;
          object-fit:cover;
          border:1px solid var(--border-light);
          display:block;
          flex-shrink:0;
        }

        /* Slightly bigger image on larger phones */
        @media (min-width:375px) {
          .mp-item-img { width:62px; height:62px; }
          .mp-item-name { font-size:13px !important; }
        }
        @media (min-width:420px) {
          .mp-item-img { width:66px; height:66px; border-radius:10px; }
          .mp-item-row { padding:10px 16px; }
        }

        /* Small phones */
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

      {/* ── FIXED HEADER ─────────────────────────── */}
      <div style={{ flexShrink:0 }}>

        {/* Topbar */}
        <div className="cx-topbar" style={{ padding:"12px 14px 10px" }}>
          <button className="back-btn cx-topbar-action" onClick={onBack} style={{ touchAction:"manipulation" }}>
            <ArrowLeft size={20}/>
          </button>
          <span className="cx-topbar-title" style={{ fontSize:15 }}>
            {business?.businessName || "Menu"}
          </span>
          <button className="cx-topbar-action" onClick={onViewCart}
            style={{ position:"relative", touchAction:"manipulation" }}>
            <ShoppingCart size={18}/>
            {cartCount > 0 && (
              <span style={{ position:"absolute", top:-4, right:-4, background:"var(--brand)", color:"#fff", fontSize:10, fontWeight:700, borderRadius:"9999px", minWidth:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px", lineHeight:1 }}>
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div style={{ padding:"7px 14px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"var(--surface-2)", border:"1.5px solid var(--border-light)", borderRadius:9999, padding:"7px 12px", position:"relative" }}>
            <Search size={13} color="var(--text-muted)" style={{ flexShrink:0 }}/>
            <input
              ref={searchRef}
              placeholder="Search items, categories..."
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

        {/* Category pills */}
        <div className="mp-cats" style={{ display:"flex", gap:5, overflowX:"auto", padding:"7px 14px 6px", scrollbarWidth:"none", borderBottom:"1px solid var(--border-light)", WebkitOverflowScrolling:"touch" }}>
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
                  border:`1.5px solid ${isActive?"var(--brand)":"var(--border)"}`,
                  background: isActive ? "var(--brand)" : "transparent",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  fontSize:11.5, fontWeight:600,
                  cursor:"pointer", whiteSpace:"nowrap",
                  transition:"all 0.15s", touchAction:"manipulation",
                }}
              >
                {hasImg && (
                  <div style={{ width:19, height:19, borderRadius:"50%", overflow:"hidden", flexShrink:0 }}>
                    <img src={cat.imageUrl} alt={cat.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                  </div>
                )}
                {noImg && (
                  <div style={{ width:19, height:19, borderRadius:"50%", background:"#fef2f2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ImageOff size={10} color="#ef4444"/>
                  </div>
                )}
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Results bar */}
        <div style={{ padding:"5px 14px 4px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:10.5, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {search.trim() ? `"${search}"` : activeCatName}
          </span>
          <span style={{ fontSize:10.5, color:"var(--text-muted)" }}>
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {/* ── SCROLLABLE ITEMS ONLY ─────────────────── */}
      <div className="mp-items" style={{ flex:1, overflowY:"auto", overflowX:"hidden", WebkitOverflowScrolling:"touch" }}>
        {filtered.length === 0 ? (
          <div style={{ padding:"40px 20px", textAlign:"center" }}>
            <div style={{ fontSize:34, marginBottom:10 }}>🔍</div>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--text-secondary)", marginBottom:4 }}>
              {search ? `No results for "${search}"` : "No items here"}
            </div>
            {search && (
              <button onClick={() => setSearch("")}
                style={{ fontSize:13, color:"var(--brand)", background:"none", border:"none", cursor:"pointer", fontWeight:600, marginTop:6, touchAction:"manipulation" }}>
                Clear search
              </button>
            )}
          </div>
        ) : filtered.map((item, idx) => {
          const qty = getCartQty(item.id);
          return (
            <div
              key={item.id}
              className="mp-item-row"
              onClick={() => onItemClick(item)}
              style={{ animation:`mp-fade 0.18s ease ${Math.min(idx,10)*0.025}s both` }}
            >
              {/* Image or no-image box */}
              <div style={{ position:"relative", flexShrink:0 }}>
                {item.img ? (
                  <>
                    <img
                      className="mp-item-img"
                      src={item.img}
                      alt={item.name}
                      onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
                    />
                    <div className="mp-item-img" style={{ display:"none", background:"#fef2f2", border:"1.5px solid #fecaca", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:2 }}>
                      <ImageOff size={16} color="#ef4444" strokeWidth={1.5}/>
                      <span style={{ fontSize:7.5, fontWeight:700, color:"#ef4444" }}>NO IMAGE</span>
                    </div>
                  </>
                ) : (
                  <div className="mp-item-img" style={{ display:"flex", background:"#fef2f2", border:"1.5px solid #fecaca", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:2 }}>
                    <ImageOff size={16} color="#ef4444" strokeWidth={1.5}/>
                    <span style={{ fontSize:7.5, fontWeight:700, color:"#ef4444" }}>NO IMAGE</span>
                  </div>
                )}
                {qty > 0 && (
                  <div style={{ position:"absolute", top:-5, right:-5, width:17, height:17, borderRadius:"50%", background:"var(--brand)", color:"#fff", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff" }}>
                    {qty}
                  </div>
                )}
              </div>

              {/* Text info */}
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
                    {(search.trim() || activecat === 0) && item.catName && (
                      <span style={{ fontSize:9, fontWeight:700, color:"var(--brand)", background:"var(--brand-muted)", borderRadius:20, padding:"1px 6px", display:"inline-block", marginTop:2 }}>
                        {item.catName}
                      </span>
                    )}
                  </div>
                  {/* + button */}
                  <div style={{ flexShrink:0, width:24, height:24, borderRadius:7, border:"1.5px solid var(--brand)", display:"flex", alignItems:"center", justifyContent:"center", background: qty>0?"var(--brand)":"transparent", transition:"background 0.15s" }}>
                    <Plus size={13} color={qty>0?"#fff":"var(--brand)"}/>
                  </div>
                </div>

                {/* Price + in-cart */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:4 }}>
                  <span className="mp-item-price" style={{ fontSize:13, fontWeight:800, color:"var(--brand)" }}>
                    {formatCurrency(item.price, _currCode)}
                  </span>
                  {qty > 0 && (
                    <span style={{ fontSize:10, fontWeight:700, color:"var(--brand)" }}>
                      {qty} in cart
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