"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, ShoppingCart, Tag, Sparkles, PartyPopper, Gift, Sun, Plus, Check, Loader2 } from "lucide-react";
import { formatCurrency } from "../utils/currencyHelper";
import { computeDiscountedPrice } from "../utils/discountHelper";
import discountService from "../services/discountService";
import useWebSocket from "../hooks/useWebSocket";

const CATEGORY_META = {
  FESTIVAL:    { icon: PartyPopper, color: "#dc2626", label: "Festival offers" },
  COMBO:       { icon: Gift,        color: "#0ea5e9", label: "Combo deals" },
  HAPPY_HOUR:  { icon: Sun,         color: "#f59e0b", label: "Happy hour" },
  PROMOTIONAL: { icon: Sparkles,    color: "#7c3aed", label: "Promotions" },
  GENERAL:     { icon: Tag,         color: "#16a34a", label: "More offers" },
};
const CATEGORY_ORDER = ["FESTIVAL", "COMBO", "HAPPY_HOUR", "PROMOTIONAL", "GENERAL"];

const scrollRowStyle = {
  display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4,
  scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
  scrollbarWidth: "none",
};

const CustomerOffersPage = ({
  business, businessId, items = [], activeDiscounts = [],
  onDiscountsRefetched,
  cart = [], cartCount = 0, cartTotal = 0,
  onAddItem, onAddCombo, onItemClick,
  onBrowseMenu, onViewCart, onBack,
}) => {
  const [liveDiscounts, setLiveDiscounts] = useState(activeDiscounts);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Fetches fresh data every time this page opens — this is a real,
  // visible network call each time, not reused stale state, so it's
  // always obvious in devtools whether the API is being reached.
  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    setFetchError("");
    discountService.getActiveDiscounts(businessId)
      .then((res) => {
        if (res.success) {
          setLiveDiscounts(res.data || []);
          onDiscountsRefetched?.(res.data || []);
        } else {
          console.error("[Offers page] API responded but success=false:", res.message);
          setFetchError(res.message || "Failed to load offers");
        }
      })
      .catch((err) => {
        console.error("[Offers page] Failed to fetch offers:", err);
        setFetchError("Couldn't reach the offers service. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  const getCartQty = (id) => cart.find((c) => c.id === id)?.qty || 0;

  // Real-time: the instant the merchant activates/edits/removes an offer,
  // this carousel refreshes itself — no pull-to-refresh needed.
  useWebSocket({
    topics: businessId ? [`/topic/business/${businessId}/discounts`] : [],
    enabled: !!businessId,
    onMessage: () => {
      discountService.getActiveDiscounts(businessId).then((res) => {
        if (res.success) {
          setLiveDiscounts(res.data || []);
          onDiscountsRefetched?.(res.data || []);
        }
      });
    },
  });

  const grouped = CATEGORY_ORDER.map((key) => ({
    key,
    meta: CATEGORY_META[key],
    discounts: liveDiscounts.filter((d) => d.offerCategory === key),
  })).filter((g) => g.discounts.length > 0);

  return (
    <div className="cw-screen">
      <style>{`.ttlp-noscroll::-webkit-scrollbar{display:none}`}</style>

      {/* Topbar */}
      <div className="cx-topbar" style={{ padding: "12px 14px 10px" }}>
        <button className="back-btn cx-topbar-action" onClick={onBack} style={{ touchAction: "manipulation" }}>
          <ArrowLeft size={20} />
        </button>
        <span className="cx-topbar-title" style={{ fontSize: 15 }}>Offers &amp; deals</span>
        <button className="cx-topbar-action" onClick={onViewCart} style={{ position: "relative", touchAction: "manipulation" }}>
          <ShoppingCart size={18} />
          {cartCount > 0 && (
            <span style={{ position: "absolute", top: -4, right: -4, background: "var(--brand)", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 9999, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", lineHeight: 1 }}>
            {cartCount > 9 ? "9+" : cartCount}
          </span>
          )}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 0 90px" }}>
        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <Loader2 size={26} style={{ animation: "cop-spin 0.8s linear infinite" }} color="var(--text-muted)" />
            <style>{`@keyframes cop-spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : fetchError ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <Tag size={34} color="#dc2626" strokeWidth={1.5} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", marginTop: 10 }}>Couldn't load offers</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>{fetchError}</div>
            <button className="cta-btn" style={{ width: "auto", padding: "11px 26px", marginTop: 18 }} onClick={onBrowseMenu}>Browse menu</button>
          </div>
        ) : grouped.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <Tag size={34} color="var(--text-muted)" strokeWidth={1.5} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", marginTop: 10 }}>No offers right now</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>Check back soon, or browse the full menu.</div>
            <button className="cta-btn" style={{ width: "auto", padding: "11px 26px", marginTop: 18 }} onClick={onBrowseMenu}>Browse menu</button>
          </div>
        ) : (
          grouped.map((section) => (
            <div key={section.key} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 14px", marginBottom: 10 }}>
                <section.meta.icon size={16} color={section.meta.color} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>{section.meta.label}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>({section.discounts.length})</span>
              </div>

              <div className="ttlp-noscroll" style={{ ...scrollRowStyle, padding: "0 14px" }}>
                {section.discounts.map((d) => {
                  if (d.scope === "COMBO") {
                    const comboItems = items.filter((i) => (d.productIds || []).includes(i.id));
                    const originalTotal = comboItems.reduce((s, i) => s + i.price, 0);
                    return (
                      <div key={d.discountId} style={{ scrollSnapAlign: "start", flexShrink: 0, width: 190, border: `1.5px solid ${section.meta.color}30`, background: `${section.meta.color}08`, borderRadius: 14, padding: 12 }}>
                        {d.imageUrl ? (
                          <div style={{ width: "100%", height: 78, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
                            <img src={d.imageUrl} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.visibility = "hidden"; }} />
                          </div>
                        ) : (
                        <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                          {(comboItems.length > 0 ? comboItems.slice(0, 3) : [null, null, null]).map((ci, idx) => (
                            <div key={ci?.id ?? idx} style={{ width: 44, height: 44, borderRadius: 9, background: "var(--surface-2)", overflow: "hidden", flexShrink: 0 }}>
                              {ci?.img && <img src={ci.img} alt={ci.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.visibility = "hidden"; }} />}
                            </div>
                          ))}
                        </div>
                        )}
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3, minHeight: 32 }}>{d.title}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "6px 0" }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: section.meta.color }}>{formatCurrency(d.discountValue, "INR")}</span>
                          {originalTotal > 0 && (
                            <span style={{ fontSize: 10.5, color: "var(--text-muted)", textDecoration: "line-through" }}>{formatCurrency(originalTotal, "INR")}</span>
                          )}
                        </div>
                        <button
                          onClick={() => comboItems.length > 0 ? onAddCombo(comboItems) : onBrowseMenu()}
                          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: section.meta.color, color: "#fff", border: "none", borderRadius: 9999, padding: "8px 0", fontSize: 11.5, fontWeight: 700, touchAction: "manipulation" }}
                        >
                          <Plus size={12} /> {comboItems.length > 0 ? "Add combo" : "View menu"}
                        </button>
                      </div>
                    );
                  }

                  if (d.scope === "STOREWIDE") {
                    return (
                      <div key={d.discountId} style={{ scrollSnapAlign: "start", flexShrink: 0, width: 190, border: `1.5px solid ${section.meta.color}30`, background: `${section.meta.color}08`, borderRadius: 14, padding: d.imageUrl ? 0 : 14, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: d.imageUrl ? "flex-start" : "center" }}>
                        {d.imageUrl ? (
                          <>
                            <div style={{ width: "100%", height: 78 }}>
                              <img src={d.imageUrl} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.visibility = "hidden"; }} />
                            </div>
                            <div style={{ padding: 12 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-primary)" }}>{d.title}</div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.4 }}>
                                {d.badgeLabel}{d.minCartValue ? ` · min ${formatCurrency(d.minCartValue, "INR")}` : " · whole order"}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <section.meta.icon size={20} color={section.meta.color} />
                            <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-primary)", marginTop: 8 }}>{d.title}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.4 }}>
                              {d.badgeLabel}{d.minCartValue ? ` · min ${formatCurrency(d.minCartValue, "INR")}` : " · whole order"}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }

                  // ITEM or CATEGORY scope
                  const matchedItems = d.scope === "CATEGORY"
                    ? items.filter((i) => i.catId === d.categoryId)
                    : items.filter((i) => (d.productIds || []).includes(i.id));
                  const first = matchedItems[0];
                  const qty = first ? getCartQty(first.id) : 0;
                  const discountedPrice = first ? computeDiscountedPrice(first.price, d) : null;

                  return (
                    <div
                      key={d.discountId}
                      onClick={() => first && onItemClick(first)}
                      style={{ scrollSnapAlign: "start", flexShrink: 0, width: 150, border: "1px solid var(--border-light)", borderRadius: 14, overflow: "hidden", background: "var(--surface)", cursor: first ? "pointer" : "default" }}
                    >
                      <div style={{ width: "100%", height: 100, background: "var(--surface-2)", position: "relative" }}>
                        {(d.imageUrl || first?.img) && <img src={d.imageUrl || first.img} alt={first ? first.name : d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.visibility = "hidden"; }} />}
                        <span style={{ position: "absolute", top: 6, left: 6, fontSize: 9.5, fontWeight: 800, color: "#fff", background: section.meta.color, padding: "2px 7px", borderRadius: 999 }}>{d.badgeLabel}</span>
                      </div>
                      <div style={{ padding: 9 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {first ? first.name : d.title}
                        </div>
                        {matchedItems.length > 1 && (
                          <div style={{ fontSize: 9.5, color: "var(--text-muted)", marginTop: 1 }}>+{matchedItems.length - 1} more item{matchedItems.length > 2 ? "s" : ""}</div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                          <span>
                            {first ? (
                              <>
                                <span style={{ fontSize: 12, fontWeight: 800, color: "#dc2626" }}>{formatCurrency(discountedPrice, "INR")}</span>
                                <span style={{ fontSize: 9.5, color: "var(--text-muted)", textDecoration: "line-through", marginLeft: 5 }}>{formatCurrency(first.price, "INR")}</span>
                              </>
                            ) : (
                              <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>Tap to view</span>
                            )}
                          </span>
                          {first && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onAddItem({ ...first }); }}
                              style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 7, border: "1.5px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", background: qty > 0 ? "var(--brand)" : "transparent", touchAction: "manipulation" }}
                            >
                              {qty > 0 ? <Check size={12} color="#fff" /> : <Plus size={12} color="var(--brand)" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {grouped.length > 0 && (
          <div style={{ padding: "4px 14px 0" }}>
            <button className="cta-btn" style={{ width: "100%" }} onClick={onBrowseMenu}>Browse full menu</button>
          </div>
        )}
      </div>

      {cartCount > 0 && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 12, background: "linear-gradient(to top, var(--surface-1) 70%, transparent)" }}>
          <button className="cta-btn" onClick={onViewCart} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 999, width: 20, height: 20, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
              View cart
            </span>
            <span style={{ fontWeight: 800 }}>{formatCurrency(cartTotal, "INR")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerOffersPage;