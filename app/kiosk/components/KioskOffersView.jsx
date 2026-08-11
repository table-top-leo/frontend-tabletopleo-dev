"use client";
import React, { useEffect, useState } from "react";
import { Tag, Gift, PartyPopper, Sun, Sparkles } from "lucide-react";
import { formatCurrency } from "../../utils/currencyHelper";
import discountService from "../../services/discountService";

const CATEGORY_META = {
  FESTIVAL: { icon: PartyPopper, color: "#e11d48", label: "Festival offers" },
  COMBO: { icon: Gift, color: "#0284c7", label: "Combo deals" },
  HAPPY_HOUR: { icon: Sun, color: "#d97706", label: "Happy hour" },
  PROMOTIONAL: { icon: Sparkles, color: "#7c3aed", label: "Promotions" },
  GENERAL: { icon: Tag, color: "#16a34a", label: "More offers" },
};
const CATEGORY_ORDER = ["FESTIVAL", "COMBO", "HAPPY_HOUR", "PROMOTIONAL", "GENERAL"];

function pctOff(d, currencyCode) {
  if (d.discountType === "PERCENTAGE") return `${Math.round(d.discountValue)}% OFF`;
  if (d.discountType === "FLAT_AMOUNT") return `${formatCurrency(d.discountValue, currencyCode)} OFF`;
  return "COMBO";
}

export default function KioskOffersView({ businessId, items, activeDiscounts, currencyCode, cart, onAddItem, onAddCombo, onDiscountsRefetched, onBrowseMenu }) {
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
          setFetchError(res.message || "Failed to load offers");
        }
      })
      .catch(() => setFetchError("Couldn't reach the offers service."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const getCartQty = (id) => cart.find((c) => c.id === id)?.qty || 0;

  const grouped = CATEGORY_ORDER.map((key) => ({
    key, meta: CATEGORY_META[key],
    discounts: liveDiscounts.filter((d) => d.offerCategory === key),
  })).filter((g) => g.discounts.length > 0);

  const findComboItems = (d) => {
    // A COMBO discount lists the product ids it applies to; resolve them
    // against the real menu items already loaded for this business.
    const ids = d.productIds || [];
    return items.filter((it) => ids.includes(it.id));
  };

  if (loading) {
    return <div style={{ padding: "60px 20px", textAlign: "center" }}><div className="ttlKioskSpinner" style={{ width: 30, height: 30, margin: "0 auto" }} /></div>;
  }
  if (fetchError) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <Tag size={30} color="#dc2626" strokeWidth={1.5} />
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#dc2626", marginTop: 10 }}>Couldn't load offers</div>
        <div style={{ fontSize: 12, color: "var(--kiosk-muted)", marginTop: 4 }}>{fetchError}</div>
        <button className="ttlKioskPillBtn ttlKioskPillBtnPrimary" style={{ width: "auto", padding: "10px 24px", marginTop: 16 }} onClick={onBrowseMenu}>Browse menu</button>
      </div>
    );
  }
  if (grouped.length === 0) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <Tag size={30} color="var(--kiosk-muted)" strokeWidth={1.5} />
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--kiosk-charcoal)", marginTop: 10 }}>No offers right now</div>
        <div style={{ fontSize: 12, color: "var(--kiosk-muted)", marginTop: 4 }}>Check back soon, or browse the full menu.</div>
        <button className="ttlKioskPillBtn ttlKioskPillBtnPrimary" style={{ width: "auto", padding: "10px 24px", marginTop: 16 }} onClick={onBrowseMenu}>Browse menu</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 0 112px" }}>
      {grouped.map((section) => (
        <div key={section.key} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", marginBottom: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: `${section.meta.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <section.meta.icon size={12} color={section.meta.color} />
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--kiosk-charcoal)" }}>{section.meta.label}</span>
            <span style={{ fontSize: 10.5, color: "var(--kiosk-muted)", fontWeight: 600 }}>{section.discounts.length}</span>
          </div>

          <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 14px" }} className="ttlKioskNoScroll">
            {section.discounts.map((d) => {
              const isCombo = d.scope === "COMBO";
              const comboItems = isCombo ? findComboItems(d) : [];
              return (
                <div key={d.discountId} style={{ width: 152, flexShrink: 0, background: "#fff", borderRadius: 16, boxShadow: "var(--kiosk-shadow-soft)", overflow: "hidden" }}>
                  <div style={{ height: 84, background: `linear-gradient(135deg, ${section.meta.color}, ${section.meta.color}cc)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>{pctOff(d, currencyCode)}</span>
                  </div>
                  <div style={{ padding: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--kiosk-charcoal)", margin: 0, lineHeight: 1.3 }}>{d.title}</p>
                    {d.description && <p style={{ fontSize: 10, color: "var(--kiosk-muted)", margin: "3px 0 0", lineHeight: 1.3 }}>{d.description}</p>}
                    {isCombo ? (
                      <button
                        disabled={comboItems.length === 0}
                        onClick={() => onAddCombo(comboItems, d)}
                        className="ttlKioskPillBtn ttlKioskPillBtnPrimary"
                        style={{ marginTop: 8, padding: "7px 0", fontSize: 11.5 }}
                      >
                        Add combo
                      </button>
                    ) : (
                      <p style={{ fontSize: 10, color: "var(--kiosk-muted)", marginTop: 8 }}>Applied automatically at checkout</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
