"use client";
import { useMemo, useState } from "react";
import { Search, X, ShoppingBag, ImageOff, ArrowRight, LogOut } from "lucide-react";
import { formatCurrency } from "../../utils/currencyHelper";

const KioskMenuScreen = ({
  business,
  categories,
  items,
  cart,
  cartCount,
  cartTotal,
  currencyCode,
  onItemClick,
  onViewCart,
  onExit,
}) => {
  const [activeCategory, setActiveCategory] = useState(categories?.[0]?.categoryId || null);
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !search.trim() || item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = search.trim() ? true : (!activeCategory || item.catId === activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const activeCategoryName = search.trim()
    ? `Results for "${search}"`
    : categories.find((c) => c.categoryId === activeCategory)?.categoryName || "All Items";

  return (
    <div className="k-content" style={{ width: "100%" }}>
      {/* Top bar */}
      <div className="k-topbar">
        <div className="k-topbar-brand">
          <div className="k-topbar-logo">
            {business?.logoUrl ? (
              <img src={business.logoUrl} alt={business.businessName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (business?.businessName || "T")[0]
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="k-topbar-name">{business?.businessName || "TableTop Leo"}</div>
            <div className="k-topbar-sub">Self-Service Kiosk</div>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: 420 }} className="k-search-wrap">
          <Search size={20} color="var(--k-ink-mute)" />
          <input placeholder="Search the menu..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch("")}><X size={18} color="var(--k-ink-mute)" /></button>
          )}
        </div>

        <div className="k-topbar-actions">
          <button className="k-icon-btn" onClick={onViewCart} aria-label="View cart">
            <ShoppingBag size={24} />
            {cartCount > 0 && <span className="k-icon-btn-badge">{cartCount}</span>}
          </button>
          {onExit && (
            <button className="k-icon-btn" onClick={onExit} aria-label="Cancel order">
              <LogOut size={22} />
            </button>
          )}
        </div>
      </div>

      <div className="k-body" style={{ position: "relative" }}>
        {/* Sidebar categories */}
        <div className="k-sidebar k-scroll-hide">
          {categories.map((cat) => {
            const active = !search.trim() && activeCategory === cat.categoryId;
            const count = items.filter((it) => it.catId === cat.categoryId).length;
            return (
              <button
                key={cat.categoryId}
                className={`k-cat-btn ${active ? "is-active" : ""}`}
                onClick={() => { setActiveCategory(cat.categoryId); setSearch(""); }}
              >
                <div className="k-cat-btn-thumb">
                  {cat.categoryImageUrl ? (
                    <img src={cat.categoryImageUrl} alt={cat.categoryName} />
                  ) : (
                    <ImageOff size={20} color="var(--k-ink-mute)" />
                  )}
                </div>
                <div>
                  <div className="k-cat-btn-label">{cat.categoryName}</div>
                  <div className="k-cat-btn-count">{count} items</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Product grid */}
        <div className="k-content-scroll k-scroll-hide">
          <div className="k-section-title">{activeCategoryName}</div>
          <div className="k-section-sub">{filteredItems.length} item{filteredItems.length === 1 ? "" : "s"} available</div>

          {filteredItems.length === 0 ? (
            <div className="k-empty">
              <div className="k-empty-emoji">🔍</div>
              <div className="k-empty-title">No items found</div>
              <div>Try a different search or category.</div>
            </div>
          ) : (
            <div className="k-grid">
              {filteredItems.map((item, idx) => {
                const inCart = cart.find((c) => c.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="k-product-card"
                    style={{ animationDelay: `${Math.min(idx, 12) * 0.03}s` }}
                    onClick={() => onItemClick(item)}
                  >
                    <div className="k-product-img-wrap">
                      {item.img ? (
                        <img src={item.img} alt={item.name} onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="k-product-noimg">
                          <ImageOff size={26} />
                          <span style={{ fontSize: 11, fontWeight: 700 }}>No Image</span>
                        </div>
                      )}
                      <div className="k-product-add" style={{ transform: "translateY(0)" }}>
                        {inCart ? inCart.qty : "+"}
                      </div>
                    </div>
                    <div className="k-product-body">
                      <div className="k-product-name">{item.name}</div>
                      {item.desc && <div className="k-product-desc">{item.desc}</div>}
                      <div className="k-product-price">{formatCurrency(item.price, currencyCode)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky cart bar */}
        {cartCount > 0 && (
          <div className="k-cartbar-wrap">
            <div className="k-cartbar">
              <div className="k-cartbar-info">
                <div className="k-cartbar-count">{cartCount} item{cartCount === 1 ? "" : "s"} in cart</div>
                <div className="k-cartbar-total">{formatCurrency(cartTotal, currencyCode)}</div>
              </div>
              <button className="k-cartbar-btn" onClick={onViewCart}>
                View Cart <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KioskMenuScreen;
