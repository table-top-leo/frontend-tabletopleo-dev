"use client";
// app/menu/[businessId]/page.jsx
// Premium Light UI with Real Icons

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import qrService from "../../services/qrService";

import { 
  Search, MapPin, Clock, Phone, Star, 
  Plus, ArrowRight 
} from "lucide-react";

export default function CustomerMenuPage() {
  const params = useParams();
  const businessId = params?.businessId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!businessId) return;
    loadMenu();
  }, [businessId]);

  const loadMenu = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await qrService.getPublicMenu(businessId);
      if (res.success && res.data) {
        setBusiness(res.data.business);
        setCategories(res.data.categories || []);
        if (res.data.categories?.length > 0) {
          setActiveCategory(res.data.categories[0].categoryId);
        }
      } else {
        setError(res.message || "Menu not available.");
      }
    } catch (err) {
      setError("This QR code is invalid or the menu is currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const activeProducts = categories.find((c) => c.categoryId === activeCategory)?.products || [];

  const filteredProducts = searchQuery
    ? categories.flatMap((c) => c.products || []).filter((p) =>
        p.itemName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeProducts;

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "16px",
        background: "#ffffff", fontFamily: "-apple-system, sans-serif"
      }}>
        <div style={{
          width: "48px", height: "48px", border: "3px solid #f1f5f9",
          borderTop: "3px solid #f59e0b", borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ color: "#64748b", fontSize: "14px" }}>Loading menu...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "12px",
        background: "#ffffff", padding: "24px", textAlign: "center",
        fontFamily: "-apple-system, sans-serif"
      }}>
        <div style={{ fontSize: "56px" }}>😕</div>
        <h2 style={{ color: "#0f172a", fontSize: "20px", margin: 0 }}>Menu Unavailable</h2>
        <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "280px" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "480px", margin: "0 auto", minHeight: "100vh",
      background: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: "relative", boxShadow: "0 0 20px rgba(0,0,0,0.08)"
    }}>

      {/* HERO HEADER */}
      <div style={{
        background: "linear-gradient(160deg, #1e3a5f 0%, #0f172a 100%)",
        padding: "28px 16px 20px", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "160px", height: "160px", borderRadius: "50%",
          background: "rgba(245,158,11,0.1)"
        }} />

        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", position: "relative" }}>
          {/* Logo */}
          <div style={{
            width: "68px", height: "68px", borderRadius: "16px", flexShrink: 0,
            background: business?.logoUrl ? "transparent" : "linear-gradient(135deg, #f59e0b, #d97706)",
            border: "3px solid rgba(245,158,11,0.4)",
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {business?.logoUrl ? (
              <img src={business.logoUrl} alt={business.businessName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "32px" }}>☕</span>
            )}
          </div>

          {/* Business Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              margin: "0 0 4px", fontSize: "22px", fontWeight: "800",
              color: "#f1f5f9", letterSpacing: "-0.5px"
            }}>
              {business?.businessName}
            </h1>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)",
              borderRadius: "9999px", padding: "3px 10px", marginBottom: "8px"
            }}>
              <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "700" }}>
                {business?.businessType}
              </span>
            </div>

            {business?.businessDescription && (
              <p style={{
                margin: "0 0 8px", fontSize: "12.5px", color: "#cbd5e1",
                lineHeight: "1.45", display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
              }}>
                {business.businessDescription}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {business?.city && (
                <div style={{
                  fontSize: "11px", color: "#e2e8f0", background: "rgba(255,255,255,0.1)",
                  padding: "3px 9px", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "4px"
                }}>
                  <MapPin size={13} /> {business.city}
                </div>
              )}
              {business?.openingTime && (
                <div style={{
                  fontSize: "11px", color: "#e2e8f0", background: "rgba(255,255,255,0.1)",
                  padding: "3px 9px", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "4px"
                }}>
                  <Clock size={13} /> {business.openingTime}–{business.closingTime}
                </div>
              )}
              {business?.businessPhone && (
                <a href={`tel:${business.businessPhone}`} style={{
                  fontSize: "11px", color: "#93c5fd", background: "rgba(147,197,253,0.15)",
                  padding: "3px 9px", borderRadius: "9999px", textDecoration: "none",
                  display: "flex", alignItems: "center", gap: "4px"
                }}>
                  <Phone size={13} /> {business.businessPhone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Open Now Badge */}
        <div style={{
          position: "absolute", top: "20px", right: "16px",
          background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)",
          borderRadius: "9999px", padding: "4px 10px",
          display: "flex", alignItems: "center", gap: "5px"
        }}>
          <div style={{ width: "7px", height: "7px", background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 6px #22c55e" }} />
          <span style={{ fontSize: "11px", color: "#86efac", fontWeight: "700" }}>Open Now</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{ padding: "14px 16px 8px", background: "#ffffff" }}>
        <div style={{ position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "12px 16px 12px 48px",
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: "12px", color: "#0f172a", fontSize: "15px",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* CATEGORIES */}
      {!searchQuery && categories.length > 0 && (
        <div style={{ padding: "8px 0 0" }}>
          <div style={{ display: "flex", overflowX: "auto", padding: "0 16px", gap: "10px" }}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.categoryId;
              return (
                <button
                  key={cat.categoryId}
                  onClick={() => setActiveCategory(cat.categoryId)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "6px", flexShrink: 0, padding: "10px 14px",
                    borderRadius: "14px", border: "none", cursor: "pointer",
                    background: isActive ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#f1f5f9",
                    minWidth: "72px",
                    boxShadow: isActive ? "0 4px 12px rgba(245,158,11,0.3)" : "none"
                  }}
                >
                  {cat.categoryImageUrl ? (
                    <img src={cat.categoryImageUrl} alt="" style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} />
                  ) : (
                    <div style={{ fontSize: "28px" }}>☕</div>
                  )}
                  <span style={{
                    fontSize: "11px", fontWeight: "700",
                    color: isActive ? "#fff" : "#475569"
                  }}>
                    {cat.categoryName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION HEADER */}
      <div style={{ padding: "16px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "16.5px", fontWeight: "700", color: "#0f172a" }}>
            {searchQuery ? `Results for "${searchQuery}"` :
              categories.find(c => c.categoryId === activeCategory)?.categoryName || "All Items"}
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
            {filteredProducts.length} items
          </p>
        </div>
      </div>

      {/* PRODUCTS LIST */}
      <div style={{ padding: "0 16px 100px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🍽️</div>
            <p>No items found</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.productId}
              style={{
                background: "#fff", borderRadius: "16px",
                overflow: "hidden", display: "flex",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ width: "96px", height: "96px", position: "relative", flexShrink: 0 }}>
                {product.itemImageUrl ? (
                  <img src={product.itemImageUrl} alt={product.itemName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
                    🍽️
                  </div>
                )}
              </div>

              <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: "14.5px", fontWeight: "700", color: "#111827" }}>
                    {product.itemName}
                  </h3>
                  {product.itemDescription && (
                    <p style={{
                      fontSize: "12px", color: "#64748b", lineHeight: "1.4",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                    }}>
                      {product.itemDescription}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "17px", fontWeight: "800", color: "#f59e0b" }}>
                    ₹{Number(product.itemPrice).toFixed(2)}
                  </span>

                  {product.productStatus === "ACTIVE" && (
                    <button style={{
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      border: "none", borderRadius: "10px", padding: "7px 16px",
                      color: "#fff", fontSize: "13px", fontWeight: "700",
                      display: "flex", alignItems: "center", gap: "5px"
                    }}>
                      <Plus size={16} /> Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* BOTTOM BAR */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: "480px",
        background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
        borderTop: "1px solid #e2e8f0", padding: "12px 16px",
        display: "flex", justifyContent: "center"
      }}>
        <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
          Made with ❤️ by <span style={{ color: "#f59e0b", fontWeight: "700" }}>TableTop Leo</span>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8fafc; }
        input::placeholder { color: #94a3b8; }
        div::-webkit-scrollbar { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}