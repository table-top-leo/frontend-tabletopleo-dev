"use client";
import { useState } from "react";
import { MapPin, Star, Clock, Search, ChevronRight } from "lucide-react";

const CustomerLandingPage = ({ business, categories, items, onStart, onItemClick }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  if (!business) {
    return <div className="cw-screen" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading business...</div>;
  }

  const filteredItems = items.filter(item => {
    const matchSearch = !search.trim() || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !activeCategory || item.catId === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="cw-screen">
      {/* Hero */}
      <div style={{ position: "relative" }}>
        <img 
          src={business.cover || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80"} 
          alt={business.name} 
          style={{ width: "100%", height: 180, objectFit: "cover" }} 
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "flex-end", gap: 12, padding: "14px 16px" }}>
          <img 
            src={business.logo || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop"} 
            alt="logo" 
            style={{ width: 56, height: 56, borderRadius: 14, border: "3px solid #fff", objectFit: "cover", background: "#fff" }} 
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{business.businessName || business.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>{business.businessType || business.type}</div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "12px 16px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--text-secondary)" }}>
            <Star size={14} fill="#F0A500" color="#F0A500" />
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>4.8</span>
            <span>(120+ Reviews)</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)" }}>
              <MapPin size={12} /> {business.city}
            </div>
            <span className="chip chip-green">
              <Clock size={11} /> Open Now
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="cx-search-wrap">
        <Search size={15} color="var(--text-muted)" />
        <input placeholder="Search menu items..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Categories - Horizontal Scroll */}
      <div className="cx-section">
        <div className="cx-section-head">
          <span className="section-label">Categories</span>
        </div>
        <div className="cat-scroll">
          {categories.map(cat => (
            <div 
              key={cat.categoryId} 
              className={`cat-chip ${activeCategory === cat.categoryId ? "active" : ""}`}
              onClick={() => setActiveCategory(activeCategory === cat.categoryId ? null : cat.categoryId)}
            >
              <div className="cat-chip-icon">
                {cat.categoryImageUrl ? (
                  <img src={cat.categoryImageUrl} alt={cat.categoryName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
                ) : "☕"}
              </div>
              <span className="cat-chip-label">{cat.categoryName}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cx-divider" />

      {/* Items - Horizontal Scroll */}
      <div className="cx-section">
        <div className="cx-section-head">
          <span className="section-label">
            {activeCategory 
              ? categories.find(c => c.categoryId === activeCategory)?.categoryName || "Items" 
              : "Popular Items"}
          </span>
        </div>

        <div className="popular-scroll">
          {filteredItems.length === 0 ? (
            <div style={{ padding: 20, color: "var(--text-muted)" }}>No items found</div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="pop-card" onClick={() => onItemClick(item)} style={{ width: "140px" }}>
                <img src={item.img} alt={item.name} style={{ height: 100 }} />
                <div className="pop-card-info">
                  <div className="pop-card-name">{item.name}</div>
                  <div className="pop-card-price">₹{item.price}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div className="cx-sticky-bottom">
        <button className="cta-btn" onClick={onStart}>
          Start Ordering <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default CustomerLandingPage;