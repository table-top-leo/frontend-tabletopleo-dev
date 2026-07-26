"use client";
import { CheckCircle2, Mail, Radar, Home } from "lucide-react";
import { formatCurrency } from "../../utils/currencyHelper";

const KioskOrderSuccess = ({ confirmedData, business, currencyCode, onTrack, onEmailInvoice, onNewOrder }) => {
  return (
    <div className="k-step-shell">
      <div className="k-step-body" style={{ justifyContent: "center", paddingTop: 16 }}>
        <div className="k-step-body-inner" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 }}>
          <div className="k-success-badge">
            <CheckCircle2 size={58} color="var(--k-success)" strokeWidth={2} />
          </div>

          <div>
            <div style={{ fontSize: 30, fontWeight: 900 }}>Order Confirmed! 🎉</div>
            <div style={{ fontSize: 15, color: "var(--k-ink-mute)", marginTop: 8 }}>
              Thank you{confirmedData?.customerName ? `, ${confirmedData.customerName}` : ""}. Please collect your receipt below.
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--k-ink-mute)" }}>
              Order Number
            </div>
            <div className="k-order-number">{confirmedData?.orderNumber || "—"}</div>
          </div>

          <div className="k-totals-box" style={{ width: "100%", maxWidth: 400, textAlign: "left" }}>
            <div className="k-totals-row"><span>Business</span><span>{business?.businessName}</span></div>
            <div className="k-totals-row"><span>Order Type</span><span>{confirmedData?.orderType === "DINE_IN" ? "🍽️ Dine In" : "🥡 Take Away"}</span></div>
            <div className="k-totals-row k-totals-final"><span>Total Paid</span><span>{formatCurrency(confirmedData?.grandTotal || 0, currencyCode)}</span></div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
            <button className="k-btn k-btn-outline k-btn-lg" onClick={onEmailInvoice}>
              <Mail size={19} /> Email My Receipt
            </button>
            <button className="k-btn k-btn-primary k-btn-lg" onClick={onTrack}>
              <Radar size={19} /> Track My Order
            </button>
          </div>
        </div>
      </div>

      <div className="k-step-footer">
        <div className="k-step-footer-inner">
          <button className="k-btn k-btn-ghost k-btn-block k-btn-lg" onClick={onNewOrder}>
            <Home size={19} /> Start a New Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default KioskOrderSuccess;
