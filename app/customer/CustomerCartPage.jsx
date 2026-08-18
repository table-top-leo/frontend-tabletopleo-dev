"use client";

import { getCurrencySymbol, formatCurrency } from "../utils/currencyHelper";
import { getItemDiscount, computeDiscountedPrice } from "../utils/discountHelper";
import { useCustomerLanguage } from "../context/CustomerLanguageProvider";

import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Tag } from "lucide-react";

const CustomerCartPage = ({ cart, subtotal, gst, total, activeDiscounts = [], currencyCode, taxEnabled = false, taxLabel, onUpdateQty, onRemove, onBack, onProceed }) => {
  const { t } = useCustomerLanguage();
  const _currCode = currencyCode || "INR";
  const cartWithDiscounts = cart.map(item => {
    const discount = getItemDiscount(item, activeDiscounts);
    const discountedPrice = discount ? computeDiscountedPrice(item.price, discount) : item.price;
    return { ...item, discount, discountedPrice };
  });
  const itemLevelSavings = cartWithDiscounts.reduce(
    (s, i) => s + (i.price - i.discountedPrice) * i.qty, 0
  );

  if (cart.length === 0) {
    return (
      <div className="cw-screen">
        <div className="cx-topbar">
          <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20} /></button>
          <span className="cx-topbar-title">{t("cart.title")}</span>
          <div style={{ width: 32 }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32, color: "var(--text-muted)", textAlign: "center" }}>
          <ShoppingBag size={56} color="var(--accent)" strokeWidth={1.5} />
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{t("cart.empty")}</div>
          <div style={{ fontSize: 13 }}>{t("cart.emptyDesc")}</div>
          <button className="cta-btn" style={{ width: "auto", padding: "12px 28px" }} onClick={onBack}>{t("cart.browseMenu")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cw-screen">
      <div className="cx-topbar">
        <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20} /></button>
        <span className="cx-topbar-title">{t("cart.title")}</span>
        <Trash2 size={18} color="var(--text-muted)" style={{ width: 32, cursor: "pointer" }} />
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "8px 16px" }}>
          {cartWithDiscounts.map(item => (
            <div key={item.id} className="cart-item-row">
              <img className="cart-item-img" src={item.img} alt={item.name} onError={e => { e.target.src = "https:// .unsplash.com/photo-1572442388796-11668a67e53d?w=200"; }} />
              <div className="cart-item-body">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {item.discount ? (
                    <>
                      <span style={{ color: "#dc2626", fontWeight: 700 }}>{formatCurrency(item.discountedPrice, _currCode)} {t("cart.each")}</span>
                      <span style={{ textDecoration: "line-through", color: "var(--text-muted)", fontSize: 11 }}>{formatCurrency(item.price, _currCode)}</span>
                    </>
                  ) : (
                    <span>{formatCurrency(item.price, _currCode)} {t("cart.each")}</span>
                  )}
                </div>
                {item.discount && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 3, fontSize: 9.5, fontWeight: 800, color: "#dc2626", background: "#fef2f2", padding: "2px 7px", borderRadius: 20 }}>
                    <Tag size={8} /> {item.discount.badgeLabel}
                  </span>
                )}
                <div className="qty-row" style={{ marginTop: 8 }}>
                  <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)} aria-label={t("cart.decreaseQty")}>
                    <Minus size={13} />
                  </button>
                  <span className="qty-count">{item.qty}</span>
                  <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)} aria-label={t("cart.increaseQty")}>
                    <Plus size={13} />
                  </button>
                </div>
              </div>
              <div className="cart-item-right">
                <div className="cart-item-total">{formatCurrency(item.discountedPrice * item.qty, _currCode)}</div>
                <button className="cart-delete-btn" onClick={() => onRemove(item.id)} aria-label={t("cart.remove")}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="cx-divider" />

        <div className="cx-section">
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{t("cart.orderSummary")}</div>
          <div className="totals-box">
            <div className="totals-row">
              <span className="totals-label">{t("cart.subtotal")}</span>
              <span className="totals-value">{formatCurrency(subtotal, _currCode)}</span>
            </div>
            {itemLevelSavings > 0 && (
              <div className="totals-row">
                <span className="totals-label" style={{ color: "#dc2626", fontWeight: 700 }}>{t("cart.youSaved")}</span>
                <span className="totals-value" style={{ color: "#dc2626", fontWeight: 700 }}>−{formatCurrency(itemLevelSavings, _currCode)}</span>
              </div>
            )}
            {taxEnabled && (
              <div className="totals-row">
                <span className="totals-label">{taxLabel || t("cart.tax")}</span>
                <span className="totals-value">{formatCurrency(gst, _currCode)}</span>
              </div>
            )}
            <div className="totals-row total">
              <span>{t("cart.total")}</span>
              <span style={{ color: "var(--brand)" }}>{formatCurrency(subtotal - itemLevelSavings + gst, _currCode)}</span>
            </div>
          </div>
        </div>
        <div style={{ height: 16 }} />
      </div>

      <div className="cx-sticky-bottom">
        <button className="cta-btn" onClick={onProceed}>
          {t("cart.proceedToPayment")} — {formatCurrency(subtotal - itemLevelSavings + gst, _currCode)}
        </button>
      </div>
    </div>
  );
};

export default CustomerCartPage;
