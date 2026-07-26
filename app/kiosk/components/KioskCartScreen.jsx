"use client";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { formatCurrency } from "../../utils/currencyHelper";

const KioskCartScreen = ({ cart, subtotal, gst, total, currencyCode, onUpdateQty, onRemove, onBack, onProceed }) => {
  if (cart.length === 0) {
    return (
      <div className="k-step-shell">
        <div className="k-step-header">
          <button className="k-step-back" onClick={onBack}><ArrowLeft size={22} /></button>
          <div className="k-step-title">Checkout</div>
        </div>
        <div className="k-empty" style={{ flex: 1, justifyContent: "center" }}>
          <ShoppingBag size={60} color="var(--k-ink-mute)" strokeWidth={1.4} />
          <div className="k-empty-title">Your cart is empty</div>
          <div>Add something delicious from the menu to get started.</div>
          <button className="k-btn k-btn-primary k-btn-lg" style={{ marginTop: 8 }} onClick={onBack}>Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="k-step-shell">
      <div className="k-step-header">
        <button className="k-step-back" onClick={onBack}><ArrowLeft size={22} /></button>
        <div className="k-step-title">Checkout</div>
      </div>

      <div className="k-step-body">
        <div className="k-step-body-inner">
          {cart.map((item) => (
            <div key={item.id} className="k-cart-row">
              <img className="k-cart-row-img" src={item.img} alt={item.name} onError={(e) => { e.target.style.visibility = "hidden"; }} />
              <div className="k-cart-row-body">
                <div className="k-cart-row-name">{item.name}</div>
                <div className="k-cart-row-unit">{formatCurrency(item.price, currencyCode)} each{item.note ? ` · "${item.note}"` : ""}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                  <button className="k-qty-btn" onClick={() => onUpdateQty(item.id, -1)}><Minus size={15} /></button>
                  <span style={{ fontSize: 16, fontWeight: 800, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button className="k-qty-btn" onClick={() => onUpdateQty(item.id, 1)}><Plus size={15} /></button>
                </div>
              </div>
              <div className="k-cart-row-right">
                <div className="k-cart-row-total">{formatCurrency(item.price * item.qty, currencyCode)}</div>
                <button className="k-cart-remove" onClick={() => onRemove(item.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}

          <div className="k-totals-box" style={{ marginTop: 16 }}>
            <div className="k-totals-row"><span>Subtotal</span><span>{formatCurrency(subtotal, currencyCode)}</span></div>
            <div className="k-totals-row"><span>GST (5%)</span><span>{formatCurrency(gst, currencyCode)}</span></div>
            <div className="k-totals-row k-totals-final"><span>Total</span><span>{formatCurrency(total, currencyCode)}</span></div>
          </div>
        </div>
      </div>

      <div className="k-step-footer">
        <div className="k-step-footer-inner" style={{ display: "flex", gap: 12 }}>
          <button className="k-btn k-btn-outline k-btn-xl" onClick={onBack}>Add More</button>
          <button className="k-btn k-btn-primary k-btn-xl" style={{ flex: 1 }} onClick={onProceed}>
            Continue <ArrowRight size={21} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KioskCartScreen;
