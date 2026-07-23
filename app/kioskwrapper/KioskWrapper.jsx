"use client";
import { useEffect, useState, useCallback } from "react";
import "../designkioskflow/kiosk-common.css";
import "../designkioskflow/kiosk-layout.css";
import "../designkioskflow/kiosk-components.css";

import KioskAttractScreen    from "../kiosk/components/KioskAttractScreen";
import KioskOrderTypeScreen  from "../kiosk/components/KioskOrderTypeScreen";
import KioskMenuScreen       from "../kiosk/components/KioskMenuScreen";
import KioskProductModal     from "../kiosk/components/KioskProductModal";
import KioskCartScreen       from "../kiosk/components/KioskCartScreen";
import KioskPaymentScreen    from "../kiosk/components/KioskPaymentScreen";
import KioskOrderSuccess     from "../kiosk/components/KioskOrderSuccess";
import KioskEmailInvoicePopup from "../kiosk/components/KioskEmailInvoicePopup";
import KioskRatingPopup      from "../kiosk/components/KioskRatingPopup";
import KioskLiveTracking     from "../kiosk/components/KioskLiveTracking";
import useIdleTimer          from "../kiosk/hooks/useIdleTimer";

import qrService            from "../services/qrService";
import customerOrderService from "../services/customerOrderService";

const SCREENS = {
  ATTRACT:   "ATTRACT",
  ORDERTYPE: "ORDERTYPE",
  MENU:      "MENU",
  CART:      "CART",
  PAYMENT:   "PAYMENT",
  SUCCESS:   "SUCCESS",
  TRACKING:  "TRACKING",
};

const EMPTY_DINING = { type: null, name: "", phone: "", email: "", table: "", note: "" };

function getCurrencyCode(business) {
  try {
    const stored = JSON.parse(localStorage.getItem("ttl_user") || "{}");
    if (stored?.currencyCode) return stored.currencyCode;
  } catch {}
  return business?.currencyCode || "INR";
}

const KioskWrapper = ({ businessId }) => {
  const [screen, setScreen] = useState(SCREENS.ATTRACT);
  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [popupItem, setPopupItem] = useState(null);
  const [diningInfo, setDiningInfo] = useState(EMPTY_DINING);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [confirmedData, setConfirmedData] = useState(null);
  const [payAtCounterAvailable, setPayAtCounterAvailable] = useState(false);

  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showRatingPopup, setShowRatingPopup] = useState(false);

  const currencyCode = getCurrencyCode(business);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal  = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const gst       = Math.round(subtotal * 0.05);
  const total     = subtotal + gst;

  useEffect(() => {
    if (businessId) loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const loadMenu = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await qrService.getPublicMenu(businessId);
      if (res.success && res.data) {
        setBusiness(res.data.business);
        const cats = res.data.categories || [];
        setCategories(cats);
        const allItems = cats.flatMap((cat) =>
          (cat.products || []).map((p) => ({
            id: p.productId,
            catId: cat.categoryId,
            catName: cat.categoryName,
            name: p.itemName,
            desc: p.itemDescription || "",
            price: Number(p.itemPrice),
            img: p.itemImageUrl || null,
          }))
        );
        setItems(allItems);

        const sessionRes = await customerOrderService.createSession(businessId, null);
        if (sessionRes.success) setSessionId(sessionRes.data.sessionId);

        try {
          const pacRes = await fetch(`http://localhost:6163/api/payment/pay-at-counter/status?businessId=${businessId}`);
          const pacData = await pacRes.json();
          setPayAtCounterAvailable(pacData?.data === true);
        } catch {
          setPayAtCounterAvailable(false);
        }
      } else {
        setError("Failed to load menu");
      }
    } catch {
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  // ── Cart ──────────────────────────────────────────────────
  const addToCart = (item, qty, note) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + qty, note: note || c.note } : c
        );
      }
      return [...prev, { ...item, qty, note: note || "" }];
    });
    setPopupItem(null);
  };

  const updateQty      = (id, delta) => setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)));
  const removeFromCart = (id)        => setCart((prev) => prev.filter((c) => c.id !== id));

  // ── Flow handlers ─────────────────────────────────────────
  const handleTapToStart = () => setScreen(SCREENS.ORDERTYPE);

  const handleOrderTypeContinue = (info) => {
    setDiningInfo(info);
    setScreen(SCREENS.MENU);
  };

  const handleCancelToAttract = () => resetKiosk();

  const buildOrderPayload = (payAtCounter) => ({
    sessionId,
    businessId,
    orderType: diningInfo.type === "dine-in" ? "DINE_IN" : "TAKE_AWAY",
    tableNumber: diningInfo.table || null,
    customerName: diningInfo.name || null,
    customerPhone: diningInfo.phone || null,
    customerEmail: diningInfo.email || null,
    customerNote: diningInfo.note || null,
    payAtCounter,
    items: cart.map((c) => ({
      productId: c.id,
      productName: c.name,
      productDescription: c.desc,
      productImageUrl: c.img,
      categoryName: c.catName,
      unitPrice: c.price,
      quantity: c.qty,
      specialRequest: c.note || null,
    })),
  });

  const handleInitiatePayment = async (gatewayName) => {
    try {
      if (gatewayName === "pay_at_counter") {
        const orderRes = await customerOrderService.placeOrder(buildOrderPayload(true));
        if (!orderRes.success) throw new Error(orderRes.message);
        setOrderData(orderRes.data);

        const payRes = await customerOrderService.initiatePayment(orderRes.data.orderId, "pay_at_counter", "INR");
        if (!payRes.success) throw new Error(payRes.message);

        return {
          paymentId: payRes.data.paymentId,
          orderId: orderRes.data.orderId,
          orderNumber: orderRes.data.orderNumber,
          grandTotal: orderRes.data.grandTotal,
          orderType: orderRes.data.orderType,
          customerName: orderRes.data.customerName,
          createdAt: orderRes.data.createdAt,
          gatewayName: "pay_at_counter",
        };
      }

      let currentOrderId = orderData?.orderId;
      if (!currentOrderId) {
        const orderRes = await customerOrderService.placeOrder(buildOrderPayload(false));
        if (!orderRes.success) throw new Error(orderRes.message);
        setOrderData(orderRes.data);
        currentOrderId = orderRes.data.orderId;
      }

      const currency = ["stripe", "paypal"].includes(gatewayName) ? "USD" : "INR";
      const payRes = await customerOrderService.initiatePayment(currentOrderId, gatewayName, currency);
      if (!payRes.success) throw new Error(payRes.message);
      return payRes.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || "Failed to initiate payment");
    }
  };

  const handleConfirmPayment = async (confirmPayload) => {
    try {
      if (confirmPayload.gatewayName === "pay_at_counter") {
        const res = await customerOrderService.confirmPayment({
          paymentId: confirmPayload.paymentId,
          orderId: confirmPayload.orderId,
          gatewayName: "pay_at_counter",
          gatewayResponse: JSON.stringify({ method: "pay_at_counter", ts: new Date().toISOString() }),
        });
        setConfirmedData(
          res.success
            ? res.data
            : {
                orderId: confirmPayload.orderId,
                orderNumber: confirmPayload.orderNumber,
                orderStatus: "ACCEPTED",
                paymentStatus: "PAY_AT_COUNTER",
                grandTotal: confirmPayload.grandTotal,
                gatewayName: "pay_at_counter",
                businessName: business?.businessName,
                businessId,
                orderType: confirmPayload.orderType,
                customerName: confirmPayload.customerName,
                estimatedMinutes: 20,
                createdAt: confirmPayload.createdAt,
              }
        );
        setScreen(SCREENS.SUCCESS);
        setTimeout(() => setShowEmailPopup(true), 900);
        return;
      }

      const res = await customerOrderService.confirmPayment(confirmPayload);
      if (!res.success) throw new Error(res.message);
      setConfirmedData(res.data);
      setScreen(SCREENS.SUCCESS);
      setTimeout(() => setShowEmailPopup(true), 900);
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || "Payment confirmation failed");
    }
  };

  const handleOrderCompleted = useCallback(() => {
    setShowRatingPopup(true);
  }, []);

  // ── Reset back to attract screen ────────────────────────────
  const resetKiosk = () => {
    setScreen(SCREENS.ATTRACT);
    setCart([]);
    setDiningInfo(EMPTY_DINING);
    setOrderData(null);
    setConfirmedData(null);
    setPopupItem(null);
    setShowEmailPopup(false);
    setShowRatingPopup(false);
    loadMenu();
  };

  // ── Idle watchdog — inactive on the attract screen itself ──
  const { warning, secondsLeft, stayHere } = useIdleTimer({
    enabled: screen !== SCREENS.ATTRACT,
    warnAfterMs: 75000,
    countdownMs: 15000,
    onTimeout: resetKiosk,
  });

  // ── Loading / error states (before menu is ready) ──────────
  if (loading && screen === SCREENS.ATTRACT && !business) {
    return (
      <div className="k-root k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="k-spinner" />
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="k-root k-shell" style={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 52 }}>😕</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Menu Unavailable</div>
        <div style={{ color: "var(--k-ink-mute)" }}>{error}</div>
        <button className="k-btn k-btn-primary k-btn-lg" onClick={loadMenu}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="k-root k-shell">
      {screen === SCREENS.ATTRACT && (
        <KioskAttractScreen business={business} onStart={handleTapToStart} />
      )}

      {screen === SCREENS.ORDERTYPE && (
        <KioskOrderTypeScreen
          diningInfo={diningInfo}
          onInfoChange={setDiningInfo}
          onCancel={handleCancelToAttract}
          onContinue={handleOrderTypeContinue}
        />
      )}

      {screen === SCREENS.MENU && (
        <KioskMenuScreen
          business={business}
          categories={categories}
          items={items}
          cart={cart}
          cartCount={cartCount}
          cartTotal={total}
          currencyCode={currencyCode}
          onItemClick={setPopupItem}
          onViewCart={() => setScreen(SCREENS.CART)}
          onExit={handleCancelToAttract}
        />
      )}

      {screen === SCREENS.CART && (
        <KioskCartScreen
          cart={cart}
          subtotal={subtotal}
          gst={gst}
          total={total}
          currencyCode={currencyCode}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onBack={() => setScreen(SCREENS.MENU)}
          onProceed={() => setScreen(SCREENS.PAYMENT)}
        />
      )}

      {screen === SCREENS.PAYMENT && (
        <KioskPaymentScreen
          total={total}
          business={business}
          diningInfo={diningInfo}
          currencyCode={currencyCode}
          onBack={() => setScreen(SCREENS.CART)}
          onInitiatePayment={handleInitiatePayment}
          onConfirmPayment={handleConfirmPayment}
          payAtCounterAvailable={payAtCounterAvailable}
        />
      )}

      {screen === SCREENS.SUCCESS && (
        <KioskOrderSuccess
          confirmedData={confirmedData}
          business={business}
          currencyCode={currencyCode}
          onEmailInvoice={() => setShowEmailPopup(true)}
          onTrack={() => setScreen(SCREENS.TRACKING)}
          onNewOrder={resetKiosk}
        />
      )}

      {screen === SCREENS.TRACKING && (
        <KioskLiveTracking
          orderId={confirmedData?.orderId}
          orderNumber={confirmedData?.orderNumber}
          business={business}
          onBack={() => setScreen(SCREENS.SUCCESS)}
          onCompleted={handleOrderCompleted}
        />
      )}

      {popupItem && (
        <KioskProductModal
          item={popupItem}
          currencyCode={currencyCode}
          onClose={() => setPopupItem(null)}
          onAddToCart={addToCart}
        />
      )}

      {showEmailPopup && (
        <KioskEmailInvoicePopup
          orderId={confirmedData?.orderId}
          orderNumber={confirmedData?.orderNumber}
          onClose={() => setShowEmailPopup(false)}
        />
      )}

      {showRatingPopup && (
        <KioskRatingPopup
          businessId={businessId}
          customerName={diningInfo?.name}
          customerPhone={diningInfo?.phone}
          onRated={() => {}}
          onClose={() => setShowRatingPopup(false)}
        />
      )}

      {/* ── Idle timeout warning ── */}
      {warning && (
        <div className="k-idle-overlay">
          <div className="k-idle-card">
            <div className="k-idle-ring">{secondsLeft}</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Still there?</div>
            <div style={{ fontSize: 14.5, color: "var(--k-ink-mute)", marginTop: 8, marginBottom: 24 }}>
              This kiosk will reset for the next guest in {secondsLeft}s.
            </div>
            <button className="k-btn k-btn-primary k-btn-lg k-btn-block" onClick={stayHere}>
              I'm Still Here
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskWrapper;
