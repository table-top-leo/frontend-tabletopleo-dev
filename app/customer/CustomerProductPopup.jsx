"use client";

import { getCurrencySymbol, formatCurrency } from "../utils/currencyHelper";
import { useCustomerLanguage } from "../context/CustomerLanguageProvider";

import { useState } from "react";
import { X, Star, Plus, Minus, ShoppingCart } from "lucide-react";

const CustomerProductPopup = ({ item, currencyCode, onClose, onAddToCart }) => {
  const { t } = useCustomerLanguage();
  const _currCode = currencyCode || "INR";

  const [qty, setQty] = useState(1);

  const handleAdd = () => onAddToCart(item, qty);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-sheet" onClick={e => e.stopPropagation()}>
        <div className="popup-img-wrap">
          <img className="popup-img" src={item.img} alt={item.name} onError={e => { e.target.src = "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400"; }} />
          <button className="popup-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="popup-body">
          <div className="popup-name">{item.name}</div>
          <div className="popup-rating">
            <Star size={14} fill="#F0A500" color="#F0A500" />
            <span>{item.rating}</span>
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({item.reviews}+ {t("product.reviewsSuffix")})</span>
          </div>
          <div className="popup-price">{formatCurrency(item.price, _currCode)}</div>
          <div className="popup-desc-label">{t("product.description")}</div>
          <div className="popup-desc">{item.desc}. {t("product.tagline")}</div>
          <div className="popup-qty-label">{t("product.quantity")}</div>
          <div className="popup-qty-row">
            <button className="popup-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label={t("cart.decreaseQty")}>
              <Minus size={16} />
            </button>
            <span className="popup-qty-count">{qty}</span>
            <button className="popup-qty-btn" onClick={() => setQty(q => q + 1)} aria-label={t("cart.increaseQty")}>
              <Plus size={16} />
            </button>
          </div>
          <button className="cta-btn" onClick={handleAdd}>
            <ShoppingCart size={18} />
            {t("menu.addToCart")} — {formatCurrency(item.price * qty, _currCode)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductPopup;
