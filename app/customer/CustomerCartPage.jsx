"use client";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

const CustomerCartPage = ({ cart, subtotal, gst, total, onUpdateQty, onRemove, onBack, onProceed }) => {
  if (cart.length === 0) {
    return (
      <div className="cw-screen">
        <div className="cx-topbar">
          <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20} /></button>
          <span className="cx-topbar-title">Your Cart</span>
          <div style={{ width: 32 }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32, color: "var(--text-muted)", textAlign: "center" }}>
          <ShoppingBag size={56} color="var(--accent)" strokeWidth={1.5} />
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>Cart is Empty</div>
          <div style={{ fontSize: 13 }}>Add items from the menu to get started</div>
          <button className="cta-btn" style={{ width: "auto", padding: "12px 28px" }} onClick={onBack}>Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cw-screen">
      <div className="cx-topbar">
        <button className="back-btn cx-topbar-action" onClick={onBack}><ArrowLeft size={20} /></button>
        <span className="cx-topbar-title">Your Cart</span>
        <Trash2 size={18} color="var(--text-muted)" style={{ width: 32, cursor: "pointer" }} />
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "8px 16px" }}>
          {cart.map(item => (
            <div key={item.id} className="cart-item-row">
              <img className="cart-item-img" src={item.img} alt={item.name} onError={e => { e.target.src = "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200"; }} />
              <div className="cart-item-body">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">₹{item.price} each</div>
                <div className="qty-row" style={{ marginTop: 8 }}>
                  <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)}>
                    <Minus size={13} />
                  </button>
                  <span className="qty-count">{item.qty}</span>
                  <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)}>
                    <Plus size={13} />
                  </button>
                </div>
              </div>
              <div className="cart-item-right">
                <div className="cart-item-total">₹{item.price * item.qty}</div>
                <button className="cart-delete-btn" onClick={() => onRemove(item.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="cx-divider" />

        <div className="cx-section">
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Order Summary</div>
          <div className="totals-box">
            <div className="totals-row">
              <span className="totals-label">Subtotal</span>
              <span className="totals-value">₹{subtotal}</span>
            </div>
            <div className="totals-row">
              <span className="totals-label">GST (5%)</span>
              <span className="totals-value">₹{gst}</span>
            </div>
            <div className="totals-row total">
              <span>Total</span>
              <span style={{ color: "var(--brand)" }}>₹{subtotal + gst}</span>
            </div>
          </div>
        </div>
        <div style={{ height: 16 }} />
      </div>

      <div className="cx-sticky-bottom">
        <button className="cta-btn" onClick={onProceed}>
          Proceed to Payment — ₹{subtotal + gst}
        </button>
      </div>
    </div>
  );
};

export default CustomerCartPage;
