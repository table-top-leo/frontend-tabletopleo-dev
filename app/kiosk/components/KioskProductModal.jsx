"use client";
import { useState } from "react";
import { X, Plus, Minus, ShoppingCart, ImageOff } from "lucide-react";
import { formatCurrency } from "../../utils/currencyHelper";

const KioskProductModal = ({ item, currencyCode, onClose, onAddToCart }) => {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  if (!item) return null;

  const handleAdd = () => onAddToCart(item, qty, note.trim());

  return (
    <div className="k-modal-overlay" onClick={onClose}>
      <div className="k-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="k-product-modal-img">
          {item.img ? (
            <img src={item.img} alt={item.name} onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: "var(--k-ink-mute)" }}>
              <ImageOff size={40} />
              <span style={{ fontWeight: 700 }}>No Image</span>
            </div>
          )}
          <button className="k-product-modal-close" onClick={onClose}><X size={22} /></button>
        </div>

        <div className="k-product-modal-body">
          <div className="k-product-modal-name">{item.name}</div>
          <div className="k-product-modal-price">{formatCurrency(item.price, currencyCode)}</div>
          {item.desc && <div className="k-product-modal-desc">{item.desc}</div>}

          <div className="k-modal-label">Special Instructions (optional)</div>
          <textarea
            className="k-notes-input"
            placeholder="e.g. No onions, extra spicy..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="k-modal-label">Quantity</div>
          <div className="k-modal-qty-row">
            <button className="k-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={18} /></button>
            <span className="k-modal-qty-count">{qty}</span>
            <button className="k-qty-btn" onClick={() => setQty((q) => q + 1)}><Plus size={18} /></button>
          </div>

          <div className="k-modal-footer">
            <button className="k-btn k-btn-primary k-btn-xl k-btn-block" onClick={handleAdd}>
              <ShoppingCart size={22} />
              Add to Cart — {formatCurrency(item.price * qty, currencyCode)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskProductModal;
