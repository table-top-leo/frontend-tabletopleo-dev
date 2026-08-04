"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, ShoppingCart, Tag, Sparkles, PartyPopper, Gift, Sun, Plus, Check, Loader2, Percent } from "lucide-react";
import { formatCurrency } from "../utils/currencyHelper";
import { computeDiscountedPrice } from "../utils/discountHelper";
import discountService from "../services/discountService";
import useWebSocket from "../hooks/useWebSocket";

const CATEGORY_META = {
  FESTIVAL:    { icon: PartyPopper, color: "#e11d48", label: "Festival offers" },
  COMBO:       { icon: Gift,        color: "#0284c7", label: "Combo deals" },
  HAPPY_HOUR:  { icon: Sun,         color: "#d97706", label: "Happy hour" },
  PROMOTIONAL: { icon: Sparkles,    color: "#7c3aed", label: "Promotions" },
  GENERAL:     { icon: Tag,         color: "#16a34a", label: "More offers" },
};
const CATEGORY_ORDER = ["FESTIVAL", "COMBO", "HAPPY_HOUR", "PROMOTIONAL", "GENERAL"];

const CARD_W = 130;

const scrollRowStyle = {
  display: "flex", gap: 9, overflowX: "auto", paddingBottom: 2,
  scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
  scrollbarWidth: "none",
};

function pctOff(d) {
  if (d.discountType === "PERCENTAGE") return `${Math.round(d.discountValue)}% OFF`;
  if (d.discountType === "FLAT_AMOUNT") return `${formatCurrency(d.discountValue, "INR")} OFF`;
  return "COMBO";
}

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

      {/* Topbar — compact */}
      <div className="cx-topbar" style={{ padding: "10px 12px 8px" }}>
        <button className="back-btn cx-topbar-action" onClick={onBack} style={{ touchAction: "manipulation" }}>
          <ArrowLeft size={19} />
        </button>
        <span className="cx-topbar-title" style={{ fontSize: 14.5 }}>Offers &amp; deals</span>
        <button className="cx-topbar-action" onClick={onViewCart} style={{ position: "relative", touchAction: "manipulation" }}>
          <ShoppingCart size={17} />
          {cartCount > 0 && (
            <span style={{ position: "absolute", top: -4, right: -4, background: "var(--brand)", color: "#fff", fontSize: 9.5, fontWeight: 800, borderRadius: 9999, minWidth: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", lineHeight: 1 }}>
            {cartCount > 9 ? "9+" : cartCount}
          </span>
          )}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 0 84px" }}>
        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <Loader2 size={24} style={{ animation: "cop-spin 0.8s linear infinite" }} color="var(--text-muted)" />
            <style>{`@keyframes cop-spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : fetchError ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <Tag size={30} color="#dc2626" strokeWidth={1.5} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#dc2626", marginTop: 10 }}>Couldn't load offers</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{fetchError}</div>
            <button className="cta-btn" style={{ width: "auto", padding: "10px 24px", marginTop: 16 }} onClick={onBrowseMenu}>Browse menu</button>
          </div>
        ) : grouped.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <Tag size={30} color="var(--text-muted)" strokeWidth={1.5} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-secondary)", marginTop: 10 }}>No offers right now</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Check back soon, or browse the full menu.</div>
            <button className="cta-btn" style={{ width: "auto", padding: "10px 24px", marginTop: 16 }} onClick={onBrowseMenu}>Browse menu</button>
          </div>
        ) : (
          grouped.map((section) => (
            <div key={section.key} style={{ marginBottom: 18 }}>
              {/* Compact section header, Zomato-style pill icon */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px", marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: `${section.meta.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <section.meta.icon size={11.5} color={section.meta.color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>{section.meta.label}</span>
                <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 600 }}>{section.discounts.length}</span>
              </div>

              <div className="ttlp-noscroll" style={{ ...scrollRowStyle, padding: "0 12px" }}>
                {section.discounts.map((d) => {
                  if (d.scope === "COMBO") {
                    const comboItems = items.filter((i) => (d.productIds || []).includes(i.id));
                    const originalTotal = comboItems.reduce((s, i) => s + i.price, 0);
                    return (
                      <div key={d.discountId} style={{ scrollSnapAlign: "start", flexShrink: 0, width: CARD_W + 22, borderRadius: 10, overflow: "hidden", background: "var(--surface)", border: "1px solid var(--border-light)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        <div style={{ position: "relative", width: "100%", height: 78, background: "var(--surface-2)" }}>
                          {d.imageUrl ? (
                            <img src={d.imageUrl} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.visibility = "hidden"; }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", gap: 3, padding: 6 }}>
                              {(comboItems.length > 0 ? comboItems.slice(0, 3) : [null, null, null]).map((ci, idx) => (
                                <div key={ci?.id ?? idx} style={{ flex: 1, borderRadius: 6, background: "var(--surface-1)", overflow: "hidden" }}>
                                  {ci?.img && <img src={ci.img} alt={ci.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.visibility = "hidden"; }} />}
                                </div>
                              ))}
                            </div>
                          )}
                          <span style={{ position: "absolute", top: 5, left: 5, display: "flex", alignItems: "center", gap: 2, fontSize: 8.5, fontWeight: 800, color: "#fff", background: section.meta.color, padding: "2px 5px 2px 4px", borderRadius: 4 }}>
                            <Percent size={8} /> COMBO
                          </span>
                        </div>
                        <div style={{ padding: "7px 8px 8px" }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: 27 }}>{d.title}</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 5, margin: "5px 0 7px" }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: section.meta.color }}>{formatCurrency(d.discountValue, "INR")}</span>
                            {originalTotal > 0 && (
                              <span style={{ fontSize: 9.5, color: "var(--text-muted)", textDecoration: "line-through" }}>{formatCurrency(originalTotal, "INR")}</span>
                            )}
                          </div>
                          <button
                            onClick={() => comboItems.length > 0 ? onAddCombo(comboItems, d) : onBrowseMenu()}
                            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#fff", color: section.meta.color, border: `1.3px solid ${section.meta.color}`, borderRadius: 7, padding: "6px 0", fontSize: 10.5, fontWeight: 800, touchAction: "manipulation", letterSpacing: 0.2 }}
                          >
                            {comboItems.length > 0 ? "ADD COMBO" : "VIEW MENU"}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (d.scope === "STOREWIDE") {
                    return (
                      <div key={d.discountId} style={{ scrollSnapAlign: "start", flexShrink: 0, width: CARD_W + 22, borderRadius: 10, overflow: "hidden", background: "var(--surface)", border: "1px solid var(--border-light)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        <div style={{ position: "relative", width: "100%", height: 78, background: `${section.meta.color}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {d.imageUrl ? (
                            <img src={d.imageUrl} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.visibility = "hidden"; }} />
                          ) : (
                            <section.meta.icon size={26} color={section.meta.color} />
                          )}
                          <span style={{ position: "absolute", top: 5, left: 5, fontSize: 8.5, fontWeight: 800, color: "#fff", background: section.meta.color, padding: "2px 5px", borderRadius: 4 }}>{pctOff(d)}</span>
                        </div>
                        <div style={{ padding: "7px 8px 8px" }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: 27 }}>{d.title}</div>
                          <div style={{ fontSize: 9.5, color: "var(--text-muted)", marginTop: 5 }}>
                            {d.minCartValue ? `Min order ${formatCurrency(d.minCartValue, "INR")}` : "On whole order"}
                          </div>
                        </div>
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
                      style={{ scrollSnapAlign: "start", flexShrink: 0, width: CARD_W, borderRadius: 10, overflow: "visible", background: "var(--surface)", border: "1px solid var(--border-light)", cursor: first ? "pointer" : "default", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    >
                      <div style={{ width: "100%", height: 78, background: "var(--surface-2)", position: "relative", borderRadius: "10px 10px 0 0", overflow: "hidden" }}>
                        {(d.imageUrl || first?.img) && <img src={d.imageUrl || first.img} alt={first ? first.name : d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.visibility = "hidden"; }} />}
                        <span style={{ position: "absolute", top: 5, left: 5, fontSize: 8.5, fontWeight: 800, color: "#fff", background: section.meta.color, padding: "2px 5px", borderRadius: 4 }}>{pctOff(d)}</span>
                      </div>
                      <div style={{ padding: "7px 8px 8px", position: "relative" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {first ? first.name : d.title}
                        </div>
                        {matchedItems.length > 1 && (
                          <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 1 }}>+{matchedItems.length - 1} more</div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
                          <span>
                            {first ? (
                              <>
                                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#dc2626" }}>{formatCurrency(discountedPrice, "INR")}</span>
                                <span style={{ fontSize: 9, color: "var(--text-muted)", textDecoration: "line-through", marginLeft: 4 }}>{formatCurrency(first.price, "INR")}</span>
                              </>
                            ) : (
                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Tap to view</span>
                            )}
                          </span>
                        </div>
                        {first && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onAddItem({ ...first }); }}
                            style={{ position: "absolute", right: 7, bottom: -11, width: 40, height: 22, borderRadius: 7, border: "1.3px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", background: qty > 0 ? "var(--brand)" : "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.12)", touchAction: "manipulation" }}
                          >
                            {qty > 0 ? <Check size={12} color="#fff" /> : <span style={{ fontSize: 9.5, fontWeight: 800, color: "var(--brand)" }}>ADD</span>}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {grouped.length > 0 && (
          <div style={{ padding: "10px 12px 0" }}>
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