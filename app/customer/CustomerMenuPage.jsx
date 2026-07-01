"use client";
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
  const cartTotal = propCart.reduce((s, c) => s + (c.price || 0) * (c.qty || 0), 0);

  const getCartQty = (id) => propCart.find(c => c.id === id)?.qty || 0;

  return (
    <div className="cw-screen">
      <div className="cx-topbar">
        <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20} /></button>
        <span className="cx-topbar-title">{business?.businessName || "Menu"}</span>
        <button className="cx-topbar-action" onClick={() => onViewCart()}><Search size={18} /></button>
      </div>

      <div style={{ padding: "8px 16px 0" }}>
        <div className="cx-search-wrap" style={{ margin: 0 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
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
                  <div className="item-card-price">₹{item.price}</div>
                  {qty > 0 && <span style={{fontSize:11,fontWeight:700,background:"var(--brand)",color:"#fff",borderRadius:"9999px",padding:"2px 8px"}}>{qty} in cart</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: cartCount > 0 ? 80 : 16 }} />
      </div>

      {cartCount > 0 && (
        <div className="cart-float-bar" onClick={() => onViewCart()}>
          <div className="cart-float-left">
            <ShoppingCart size={18} color="#fff" />
            <span className="cart-float-count">{cartCount}</span>
            <span className="cart-float-label">View Cart</span>
          </div>
          <span className="cart-float-price">₹{cartTotal}</span>
        </div>
      )}
    </div>
  );
};

export default CustomerMenuPage;