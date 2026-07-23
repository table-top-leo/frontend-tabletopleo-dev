"use client";
import { useState } from "react";
import { MapPin, Star, Clock, Search, ChevronRight, ImageOff, Flame, X } from "lucide-react";

// ── Cover images per business type (high quality Unsplash) ──
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
  // Default fallback
  "default":           "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
};

function getCoverImage(business) {
  if (business?.cover) return business.cover; // admin uploaded cover takes priority
  const type = business?.businessType || business?.type || "";
  // Try exact match first, then partial match
  if (COVER_BY_TYPE[type]) return COVER_BY_TYPE[type];
  const key = Object.keys(COVER_BY_TYPE).find(k =>
    type.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(type.toLowerCase())
  );
  return COVER_BY_TYPE[key] || COVER_BY_TYPE["default"];
}

// ── Check if business is currently open based on DB times ────
function isBusinessOpen(openingTime, closingTime, workingDays) {
  try {
    const now    = new Date();
    const dayMap = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today  = dayMap[now.getDay()];

    // Check working days (e.g. "Monday,Tuesday,Wednesday,Thursday,Friday")
    if (workingDays) {
      const days = workingDays.split(",").map(d => d.trim());
      if (!days.some(d => d.toLowerCase() === today.toLowerCase())) return false;
    }

    if (!openingTime || !closingTime) return null; // unknown

    // Parse "HH:mm:ss" or "HH:mm"
    const [oH, oM] = openingTime.split(":").map(Number);
    const [cH, cM] = closingTime.split(":").map(Number);

    const nowMins   = now.getHours() * 60 + now.getMinutes();
    const openMins  = oH * 60 + oM;
    const closeMins = cH * 60 + cM;

    // Handle overnight (e.g. 22:00 - 02:00)
    if (closeMins < openMins) {
      return nowMins >= openMins || nowMins < closeMins;
    }
    return nowMins >= openMins && nowMins < closeMins;
  } catch { return null; }
}

// Format "14:30:00" → "2:30 PM"
function fmt12h(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
}

const CustomerLandingPage = ({ business, categories, items, onStart, onItemClick }) => {
  const [search,         setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  if (!business) {
    return (
      <div className="cw-screen" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:36, height:36, border:"3px solid #f3f4f6", borderTopColor:"var(--brand)", borderRadius:"50%", animation:"lp-spin 0.7s linear infinite" }}/>
        <style>{`@keyframes lp-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Compute open/closed from DB data
  const openStatus  = isBusinessOpen(business?.openingTime, business?.closingTime, business?.workingDays);
  const openLabel   = openStatus === true  ? "Open Now"
                    : openStatus === false ? "Closed"
                    : "Hours Unknown";
  const openColor   = openStatus === true  ? "#16a34a"
                    : openStatus === false ? "#ef4444"
                    : "#f59e0b";
  const openingFmt  = fmt12h(business?.openingTime);
  const closingFmt  = fmt12h(business?.closingTime);
  const hoursStr    = openingFmt && closingFmt ? `${openingFmt} – ${closingFmt}` : "";

  const filteredItems = items.filter(item => {
    const ms = !search.trim() || item.name.toLowerCase().includes(search.toLowerCase());
    const mc = !activeCategory || item.catId === activeCategory;
    return ms && mc;
  });

  // Split items into rows of 5 for grid layout
  const itemRows = [];
  for (let i = 0; i < filteredItems.length; i += 5)
    itemRows.push(filteredItems.slice(i, i + 5));

  return (
    <div className="cw-screen" style={{ overflow:"hidden", position:"relative" }}>
      <style>{`
        .lp-cats::-webkit-scrollbar { display:none }
        .lp-row::-webkit-scrollbar  { display:none }
        @keyframes lp-spin { to{transform:rotate(360deg)} }
        @keyframes lp-pop  { from{opacity:0;transform:scale(0.93) translateY(5px)} to{opacity:1;transform:scale(1) translateY(0)} }

        /* Fluid item card sizes based on container */
        .lp-item-card {
          flex: 0 0 calc(20% - 7px);
          min-width: 64px;
          max-width: 110px;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid var(--border-light);
          background: var(--surface);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: transform 0.14s, box-shadow 0.14s;
        }
        .lp-item-card:active { transform: scale(0.96); }

        /* Responsive tweaks */
        @media (max-width: 320px) {
          .lp-hero-img   { height: 130px !important; }
          .lp-biz-name   { font-size: 14px !important; }
          .lp-cat-pill   { font-size: 10.5px !important; padding: 4px 9px !important; }
          .lp-item-name  { font-size: 10px !important; }
          .lp-item-price { font-size: 11px !important; }
        }
        @media (min-width: 375px) {
          .lp-item-card  { border-radius: 11px; }
        }
        @media (min-width: 420px) {
          .lp-hero-img   { height: 175px !important; }
          .lp-item-card  { border-radius: 12px; }
        }
        @media (hover: hover) {
          .lp-item-card:hover { transform: translateY(-2px); box-shadow: 0 5px 14px rgba(0,0,0,0.1); }
        }
      `}</style>

      {/* ── Scrollable body ── */}
      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", WebkitOverflowScrolling:"touch" }}>

        {/* Hero */}
        <div style={{ position:"relative" }}>
          <img
            className="lp-hero-img"
            src={getCoverImage(business)}
            alt="cover"
            style={{ width:"100%", height:155, objectFit:"cover", display:"block" }}
          />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.6) 100%)" }}/>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 14px", display:"flex", alignItems:"flex-end", gap:10 }}>
            <div style={{ width:46, height:46, borderRadius:11, overflow:"hidden", border:"2.5px solid #fff", flexShrink:0, background:"#fff" }}>
              {(business.logoUrl || business.logo) ? (
                <img src={business.logoUrl || business.logo} alt="logo" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
              ) : (
                <div style={{ width:"100%", height:"100%", background:"var(--brand)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:"#fff" }}>
                  {(business.businessName || "T")[0]}
                </div>
              )}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="lp-biz-name" style={{ fontSize:15, fontWeight:900, color:"#fff", letterSpacing:"-0.3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {business.businessName || business.name}
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)", marginTop:1 }}>
                {business.businessType || business.type}
              </div>
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-around", padding:"7px 14px", borderBottom:"1px solid var(--border-light)", background:"var(--surface)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:3 }}>
            <Star size={12} fill="#f59e0b" color="#f59e0b"/>
            <span style={{ fontSize:12, fontWeight:800, color:"var(--text-primary)" }}>4.8</span>
            <span style={{ fontSize:10.5, color:"var(--text-muted)" }}>(120+)</span>
          </div>
          <div style={{ width:1, height:11, background:"var(--border)" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, color:"var(--text-muted)" }}>
            <MapPin size={11}/><span style={{ maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{business.city || ""}</span>
          </div>
          <div style={{ width:1, height:11, background:"var(--border)" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, fontWeight:700, color:openColor }} title={hoursStr}>
            <Clock size={11}/> {openLabel}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding:"8px 14px 6px", background:"var(--surface)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"var(--surface-2)", border:"1.5px solid var(--border-light)", borderRadius:9999, padding:"7px 12px", position:"relative" }}>
            <Search size={13} color="var(--text-muted)" style={{ flexShrink:0 }}/>
            <input
              placeholder="Search dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:13, color:"var(--text-primary)", minWidth:0 }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", flexShrink:0 }}>
                <X size={13} color="var(--text-muted)"/>
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border-light)", paddingBottom:8 }}>
          <div style={{ padding:"7px 14px 5px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:10.5, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Categories</span>
            <span style={{ fontSize:10.5, color:"var(--brand)", fontWeight:600 }}>{categories.length}</span>
          </div>
          <div className="lp-cats" style={{ display:"flex", gap:6, overflowX:"auto", padding:"0 14px", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
            {/* All pill */}
            <button
              className="lp-cat-pill"
              onClick={() => setActiveCategory(null)}
              style={{ flexShrink:0, padding:"4px 13px", borderRadius:9999, border:`1.5px solid ${!activeCategory?"var(--brand)":"var(--border)"}`, background:!activeCategory?"var(--brand)":"transparent", color:!activeCategory?"#fff":"var(--text-secondary)", fontSize:11.5, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", touchAction:"manipulation" }}
            >All</button>

            {categories.map(cat => {
              const isActive = activeCategory === cat.categoryId;
              return (
                <button
                  key={cat.categoryId}
                  className="lp-cat-pill"
                  onClick={() => setActiveCategory(isActive ? null : cat.categoryId)}
                  style={{ flexShrink:0, display:"flex", alignItems:"center", gap:5, padding: cat.categoryImageUrl ? "3px 10px 3px 3px" : "4px 11px", borderRadius:9999, border:`1.5px solid ${isActive?"var(--brand)":"var(--border)"}`, background:isActive?"var(--brand)":"transparent", color:isActive?"#fff":"var(--text-secondary)", fontSize:11.5, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s", touchAction:"manipulation" }}
                >
                  {cat.categoryImageUrl ? (
                    <div style={{ width:21, height:21, borderRadius:"50%", overflow:"hidden", flexShrink:0 }}>
                      <img src={cat.categoryImageUrl} alt={cat.categoryName} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                    </div>
                  ) : (
                    <div style={{ width:21, height:21, borderRadius:"50%", background:"#fef2f2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <ImageOff size={11} color="#ef4444"/>
                    </div>
                  )}
                  {cat.categoryName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Items — 5 per row, multiple rows */}
        <div style={{ background:"var(--surface)", marginTop:6, paddingBottom:80 }}>
          <div style={{ padding:"8px 14px 6px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <Flame size={13} color="#f97316"/>
              <span style={{ fontSize:10.5, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.07em" }}>
                {activeCategory
                  ? categories.find(c => c.categoryId === activeCategory)?.categoryName || "Items"
                  : search.trim() ? `"${search}"` : "Popular Items"}
              </span>
            </div>
            <span style={{ fontSize:10.5, color:"var(--text-muted)" }}>{filteredItems.length} items</span>
          </div>

          {filteredItems.length === 0 ? (
            <div style={{ padding:"24px", textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
              No items found
            </div>
          ) : itemRows.map((row, rowIdx) => (
            /* Each row = horizontal scroll strip of 5 */
            <div
              key={rowIdx}
              className="lp-row"
              style={{ display:"flex", gap:7, overflowX:"auto", padding: rowIdx === 0 ? "0 14px 10px" : "0 14px 10px", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}
            >
              {row.map((item, idx) => (
                <div
                  key={item.id}
                  className="lp-item-card"
                  onClick={() => onItemClick(item)}
                  style={{ animation:`lp-pop 0.2s ease ${(rowIdx*5+idx)*0.03}s both` }}
                >
                  {/* Image */}
                  <div style={{ width:"100%", paddingTop:"80%", position:"relative", overflow:"hidden" }}>
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.name}
                        style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                        onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
                      />
                    ) : null}
                    <div style={{ position:"absolute", inset:0, background:"#fef2f2", display:item.img?"none":"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:2 }}>
                      <ImageOff size={16} color="#ef4444" strokeWidth={1.5}/>
                      <span style={{ fontSize:7, fontWeight:700, color:"#ef4444" }}>NO IMAGE</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding:"5px 6px 7px" }}>
                    <div className="lp-item-name" style={{ fontSize:10.5, fontWeight:700, color:"var(--text-primary)", lineHeight:1.3, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", minHeight:26 }}>
                      {item.name}
                    </div>
                    <div className="lp-item-price" style={{ fontSize:11.5, fontWeight:800, color:"var(--brand)", marginTop:3 }}>
                      ₹{item.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="cx-sticky-bottom">
        <button className="cta-btn" onClick={onStart} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:15, fontWeight:800 }}>
          Start Ordering <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  );
};

export default CustomerLandingPage;