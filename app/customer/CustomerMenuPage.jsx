"use client";

import { getCurrencySymbol, formatCurrency } from "../utils/currencyHelper";

import { useState } from "react";
import { ArrowLeft, Search, ShoppingCart } from "lucide-react";

const CustomerMenuPage = ({ 
  business, 
  categories = [], 
  items = [], 
  cart: propCart = [], 
  onItemClick, 
  onViewCart, 
  onBack 
}) => {
  const _user = (typeof window !== "undefined") ? (() => { try { return JSON.parse(localStorage.getItem("ttl_user") || "{}"); } catch { return {}; } })() : {};
  const _currCode = _user.currencyCode || "INR";

  const [activecat, setActivecat] = useState(0);
  const [search, setSearch] = useState("");

  const allCats = [{ id: 0, name: "All", emoji: "🍽️" }, ...categories.map(c => ({
    id: c.categoryId || c.id,
    name: c.categoryName || c.name,
    emoji: "☕"
  }))];

  const filtered = items.filter(i => {
    const matchCat = activecat === 0 || i.catId === activecat;
    const matchSrch = !search.trim() || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrch;
  });

  const cartCount = propCart.reduce((s, c) => s + (c.qty || 0), 0);

  const getCartQty = (id) => propCart.find(c => c.id === id)?.qty || 0;

  return (
    <div className="cw-screen">
      <div className="cx-topbar">
        <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20} /></button>
        <span className="cx-topbar-title">{business?.businessName || "Menu"}</span>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: "8px 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <div className="cx-search-wrap" style={{ margin: 0, flex: 1 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button
          className="cx-topbar-action"
          onClick={() => onViewCart()}
          aria-label="View cart"
          style={{ position: "relative", flexShrink: 0 }}
        >
          <ShoppingCart size={18} />
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              background: "var(--brand)", color: "#fff",
              fontSize: 10, fontWeight: 700, lineHeight: 1,
              borderRadius: "9999px", minWidth: 16, height: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 3px",
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="menu-cat-tabs">
        {allCats.map(cat => (
         <button key={cat.id} className={`menu-tab ${activecat === cat.id ? "active" : ""}`} 
  onClick={() => { setActivecat(cat.id); setSearch(""); }}>
  <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden" }}>
    {cat.categoryImageUrl ? (
      <img src={cat.categoryImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    ) : (
      <div style={{ fontSize: "28px" }}>☕</div>
    )}
  </div>
  {cat.categoryName || cat.name}
</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>No items found</div>
        ) : filtered.map(item => {
          const qty = getCartQty(item.id);
          return (
            <div key={item.id} className="item-card" onClick={() => onItemClick(item)}>
              <img 
                className="item-card-img" 
                src={item.img || "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200"} 
                alt={item.name} 
              />
              <div className="item-card-body">
                <div className="item-card-name">{item.name}</div>
                <div className="item-card-desc">{item.desc}</div>
                <div className="item-card-bottom">
                  <div className="item-card-price">{formatCurrency(item.price, _currCode)}</div>
                  {qty > 0 && <span style={{fontSize:11,fontWeight:700,background:"var(--brand)",color:"#fff",borderRadius:"9999px",padding:"2px 8px"}}>{qty} in cart</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
};

export default CustomerMenuPage;