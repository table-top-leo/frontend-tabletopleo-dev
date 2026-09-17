"use client";
// app/kiosk/KioskWrapper.jsx
//
// Kiosk equivalent of app/cusotomerwrapper/CustomerWrapper.jsx.
// Same real TableTop Leo services, same order/payment/discount/tax rules —
// only the screens and stage machine are kiosk-shaped (tabesto-kiosk
// design). Nothing here talks to a mock/dummy API; every screen is fed by
// the same qrService / customerOrderService / discountService calls the
// phone customer flow uses, so a merchant's menu, offers, payment methods,
// and orders are always the same real data in both experiences.

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import "./styles/kiosk-theme.css";
import "./styles/kiosk-screens.css";

import qrService from "../services/qrService";
import customerOrderService from "../services/customerOrderService";
import discountService from "../services/discountService";
import useWebSocket from "../hooks/useWebSocket";
import { mapCategories, mapItems, itemsForCategory } from "./lib/kioskMenuAdapter";
import useKioskIdleTimeout from "./lib/useKioskIdleTimeout";

import KioskWelcomeScreen from "./components/KioskWelcomeScreen";
import KioskOrderTypeScreen from "./components/KioskOrderTypeScreen";
import KioskTableSelectScreen from "./components/KioskTableSelectScreen";
import KioskSidebar from "./components/KioskSidebar";
import KioskTopBar from "./components/KioskTopBar";
import KioskProductGrid from "./components/KioskProductGrid";
import KioskMenuIntro from "./components/KioskMenuIntro";
import KioskOffersView from "./components/KioskOffersView";
import KioskCartBar from "./components/KioskCartBar";
import KioskCartModal from "./components/KioskCartModal";
import KioskConfirmDialog from "./components/KioskConfirmDialog";
import KioskGuestDetailsScreen from "./components/KioskGuestDetailsScreen";
import KioskPaymentScreen from "./components/KioskPaymentScreen";
import KioskProcessingScreen from "./components/KioskProcessingScreen";
import KioskOrderConfirmed from "./components/KioskOrderConfirmed";
import KioskOrderTracking from "./components/KioskOrderTracking";
import KioskRatingModal from "./components/KioskRatingModal";
import KioskEmailInvoiceModal from "./components/KioskEmailInvoiceModal";
import KioskIdleOverlay from "./components/KioskIdleOverlay";

const STAGE = {
  WELCOME: "WELCOME",
  ORDER_TYPE: "ORDER_TYPE",
  TABLE_SELECT: "TABLE_SELECT",
  MENU: "MENU",
  GUEST_DETAILS: "GUEST_DETAILS",
  PAYMENT: "PAYMENT",
  PROCESSING: "PROCESSING",
  CONFIRMED: "CONFIRMED",
  TRACKING: "TRACKING",
};

function freshFlowState() {
  return {
    stage: STAGE.WELCOME,
    view: null, // categoryId | "offers" (set once categories load)
    cart: [],
    cartOpen: false,
    confirmingCancel: false,
    orderType: null, // "dine-in" | "takeaway"
    tableNumber: "",
    guest: { name: "", phone: "", email: "", notes: "" },
    orderData: null,
    paymentData: null,
    confirmedData: null,
    emailModalOpen: false,
    ratingModalOpen: false,
    processingLabel: "",
    paymentError: "",
  };
}

const KioskWrapper = ({ businessId }) => {
  const router = useRouter();
  const [f, setF] = useState(freshFlowState());
  const patch = (obj) => setF((prev) => ({ ...prev, ...obj }));

  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [payAtCounterAvailable, setPayAtCounterAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cartCount = useMemo(() => f.cart.reduce((sum, i) => sum + i.qty, 0), [f.cart]);
  const subtotal = useMemo(() => f.cart.reduce((sum, i) => sum + i.qty * i.price, 0), [f.cart]);
  const taxEnabled = !!business?.taxEnabled;
  const taxRatePct = taxEnabled ? Number(business?.taxRate || 0) : 0;
  const gst = !taxEnabled
    ? 0
    : business?.taxInclusive
      ? Math.round(subtotal - subtotal / (1 + taxRatePct / 100))
      : Math.round((subtotal * taxRatePct) / 100);
  const total = subtotal + gst;
  const currencyCode = business?.currencyCode || "INR";

  // ── Real-time offers — merchant activates/edits/removes a discount and
  // every open kiosk screen reflects it instantly, same as the phone flow.
  useWebSocket({
    topics: businessId ? [`/topic/business/${businessId}/discounts`] : [],
    enabled: !!businessId,
    onMessage: () => {
      discountService.getActiveDiscounts(businessId).then((res) => {
        if (res.success) setActiveDiscounts(res.data || []);
      });
    },
  });

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await qrService.getPublicMenu(businessId);
      if (res.success && res.data) {
        setBusiness(res.data.business);
        const cats = res.data.categories || [];
        setCategories(mapCategories(cats));
        setItems(mapItems(cats));

        try {
          const discRes = await discountService.getActiveDiscounts(businessId);
          setActiveDiscounts(discRes.success ? discRes.data || [] : []);
        } catch {
          setActiveDiscounts([]);
        }

        const sessionRes = await customerOrderService.createSession(businessId, null);
        if (sessionRes.success) setSessionId(sessionRes.data.sessionId);

        try {
          const pacRes = await fetch(`https://api.tabletopleo.com/api/payment/pay-at-counter/status?businessId=${businessId}`);
          const pacData = await pacRes.json();
          setPayAtCounterAvailable(pacData?.data === true);
        } catch {
          setPayAtCounterAvailable(false);
        }
      } else {
        setError("This kiosk isn't linked to a business yet.");
      }
    } catch {
      setError("Couldn't load the menu. Check the connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) loadMenu();
  }, [businessId, loadMenu]);

  // ── Idle reset — never armed while an order/payment is actively in
  // flight (PROCESSING), so a slow gateway response can't get wiped out.
  const { warning: idleWarning, stayHere } = useKioskIdleTimeout({
    warnAfterMs: 75_000,
    resetAfterMs: 100_000,
    paused: f.stage === STAGE.PROCESSING,
    onReset: () => resetKiosk(),
  });

  // ── Cart ────────────────────────────────────────────────────────
  const addToCart = (product) => {
    setF((prev) => {
      const existing = prev.cart.find((i) => i.id === product.id);
      const cart = existing
        ? prev.cart.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev.cart, { ...product, qty: 1 }];
      return { ...prev, cart };
    });
  };
  // Adds every item of a combo/offer at once, tagged with the discount that
  // unlocked it — same comboGroupKey pattern CustomerWrapper uses, so combo
  // pricing at checkout only ever applies to items added via this action.
  const addComboToCart = (comboItems, discount) => {
    const comboGroupKey = discount ? `combo-${discount.discountId}-${Date.now()}` : null;
    const offerTitle = discount?.title || null;
    const comboDiscountId = discount?.discountId || null;
    setF((prev) => ({
      ...prev,
      cart: [...prev.cart, ...comboItems.map((item) => ({ ...item, qty: 1, comboGroupKey, offerTitle, comboDiscountId }))],
    }));
  };
  const increment = (id) => setF((prev) => ({ ...prev, cart: prev.cart.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)) }));
  const decrement = (id) => setF((prev) => ({ ...prev, cart: prev.cart.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0) }));
  const removeFromCart = (id) => setF((prev) => ({ ...prev, cart: prev.cart.filter((i) => i.id !== id) }));

  const requestCancelOrder = () => { if (f.cart.length > 0) patch({ confirmingCancel: true }); };
  const confirmCancelOrder = () => patch({ cart: [], cartOpen: false, confirmingCancel: false, view: null });

  // Resolves REAL discounted unit prices (combo + storewide) right before
  // checkout — identical helper contract to CustomerWrapper.buildDiscountedItems,
  // so a kiosk order and a phone order price the exact same cart identically.
  const buildDiscountedItems = async () => {
    const fallback = () => f.cart.map((c) => ({
      productId: c.id, productName: c.name, productDescription: c.desc,
      productImageUrl: c.img, categoryName: c.catName,
      unitPrice: c.price, quantity: c.qty, specialRequest: null,
      offerTitle: c.offerTitle || null, originalPrice: c.offerTitle ? c.price : null,
    }));
    try {
      const evalRes = await discountService.evaluateCart(businessId, f.cart.map((c) => ({
        productId: c.id, categoryId: c.catId, quantity: c.qty, originalUnitPrice: c.price,
        comboDiscountId: c.comboDiscountId || null,
      })));
      if (!evalRes.success || !evalRes.data?.items) return fallback();
      const priceMap = {};
      evalRes.data.items.forEach((i) => { priceMap[i.productId] = i; });
      return f.cart.map((c) => {
        const adjusted = priceMap[c.id];
        const offerTitle = adjusted?.appliedDiscountLabel || c.offerTitle || null;
        const unitPrice = adjusted?.discountedUnitPrice != null ? adjusted.discountedUnitPrice : c.price;
        return {
          productId: c.id, productName: c.name, productDescription: c.desc,
          productImageUrl: c.img, categoryName: c.catName,
          unitPrice, quantity: c.qty, specialRequest: null,
          offerTitle, originalPrice: offerTitle ? c.price : null,
        };
      });
    } catch {
      return fallback();
    }
  };

  // ── Stage transitions ──────────────────────────────────────────
  const start = () => patch({ stage: STAGE.ORDER_TYPE });
  const chooseOrderType = (type) => {
    if (type === "dine-in" && business?.hasTableService) {
      patch({ orderType: type, stage: STAGE.TABLE_SELECT });
    } else {
      patch({ orderType: type, tableNumber: "", stage: STAGE.MENU, view: null });
    }
  };
  const confirmTable = () => patch({ stage: STAGE.MENU, view: null });
  const selectCategory = (id) => patch({ view: id, cartOpen: false });
  const goHome = () => router.push(`/menu/${businessId}`);
  const goToOffers = () => patch({ view: "offers", cartOpen: false });
  const goToGuestDetails = () => patch({ cartOpen: false, stage: STAGE.GUEST_DETAILS });

  const saveGuestDetails = (guest) => patch({ guest, stage: STAGE.PAYMENT });

  // ── Payment (real TableTop Leo order + payment services) ────────
  const handleInitiatePayment = async (gatewayName) => {
    const diningInfo = {
      type: f.orderType === "dine-in" ? "dine-in" : "takeaway",
      table: f.tableNumber || "",
      name: f.guest.name || "",
      phone: f.guest.phone || "",
      email: f.guest.email || "",
      note: f.guest.notes || "",
    };
    try {
      if (gatewayName === "pay_at_counter") {
        const orderPayload = {
          sessionId, businessId,
          orderType: diningInfo.type === "dine-in" ? "DINE_IN" : "TAKE_AWAY",
          tableNumber: diningInfo.table || null,
          customerName: diningInfo.name || null,
          customerPhone: diningInfo.phone || null,
          customerEmail: diningInfo.email || null,
          customerNote: diningInfo.note || null,
          payAtCounter: true,
          items: await buildDiscountedItems(),
        };
        const orderRes = await customerOrderService.placeOrder(orderPayload);
        if (!orderRes.success) throw new Error(orderRes.message);
        patch({ orderData: orderRes.data });

        const payRes = await customerOrderService.initiatePayment(orderRes.data.orderId, "pay_at_counter", currencyCode);
        if (!payRes.success) throw new Error(payRes.message);
        patch({ paymentData: payRes.data });

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

      let currentOrderId = f.orderData?.orderId;
      if (!currentOrderId) {
        const orderPayload = {
          sessionId, businessId,
          orderType: diningInfo.type === "dine-in" ? "DINE_IN" : "TAKE_AWAY",
          tableNumber: diningInfo.table || null,
          customerName: diningInfo.name || null,
          customerPhone: diningInfo.phone || null,
          customerEmail: diningInfo.email || null,
          customerNote: diningInfo.note || null,
          payAtCounter: false,
          items: await buildDiscountedItems(),
        };
        const orderRes = await customerOrderService.placeOrder(orderPayload);
        if (!orderRes.success) throw new Error(orderRes.message);
        patch({ orderData: orderRes.data });
        currentOrderId = orderRes.data.orderId;
      }

      const payRes = await customerOrderService.initiatePayment(currentOrderId, gatewayName, currencyCode);
      if (!payRes.success) throw new Error(payRes.message);
      patch({ paymentData: payRes.data });
      return payRes.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || "Failed to initiate payment");
    }
  };

  const saveIdentity = (guest) => {
    if (!businessId || !guest) return;
    try {
      localStorage.setItem(`ttl_kiosk_identity_${businessId}`, JSON.stringify({ name: guest.name || "", phone: guest.phone || "", email: guest.email || "" }));
    } catch { /* ignore */ }
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
        const confirmed = res.success ? res.data : {
          orderId: confirmPayload.orderId, orderNumber: confirmPayload.orderNumber,
          orderStatus: "ACCEPTED", paymentStatus: "PAY_AT_COUNTER", grandTotal: confirmPayload.grandTotal,
          gatewayName: "pay_at_counter", businessName: business?.businessName, businessId,
          orderType: confirmPayload.orderType, customerName: confirmPayload.customerName,
          customerPhone: confirmPayload.customerPhone, estimatedMinutes: 20, createdAt: confirmPayload.createdAt,
        };
        saveIdentity(f.guest);
        patch({ confirmedData: confirmed, stage: STAGE.CONFIRMED, processingLabel: "pay at counter" });
        return;
      }
      const res = await customerOrderService.confirmPayment(confirmPayload);
      if (!res.success) throw new Error(res.message);
      saveIdentity(f.guest);
      patch({ confirmedData: res.data, stage: STAGE.CONFIRMED, processingLabel: confirmPayload.gatewayName });
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || "Payment confirmation failed");
    }
  };

  // Kiosk-only intermediate stage: the actual work happens inside
  // handleInitiatePayment/handleConfirmPayment (called from KioskPaymentScreen);
  // PROCESSING is purely the "please wait" screen while that real network
  // round-trip is happening — never a fixed fake timer. If the real
  // confirmation throws, we return to PAYMENT with the real error message
  // instead of getting stuck on a spinner or silently pretending success.
  const beginProcessing = (label) => patch({ stage: STAGE.PROCESSING, processingLabel: label, paymentError: "" });
  const processingFailed = (message) => patch({ stage: STAGE.PAYMENT, paymentError: message || "Payment failed. Please try again." });

  const goToTracking = () => patch({ stage: STAGE.TRACKING });

  // ── Rating / email invoice — real endpoints, no local-only mocks ──
  const openEmailModal = () => patch({ emailModalOpen: true });
  const closeEmailModal = () => patch({ emailModalOpen: false });
  const openRatingModal = () => patch({ ratingModalOpen: true });
  const closeRatingModal = () => patch({ ratingModalOpen: false });

  // ── Full reset for the next customer (keeps business/menu/currency) ──
  const resetKiosk = () => {
    setF(freshFlowState());
    loadMenu();
  };

  if (loading) {
    return (
      <div className="ttlKioskFalconShell">
        <div className="ttlKioskCenterState" style={{ background: "var(--kiosk-ink)", height: "100%" }}>
          <div className="ttlKioskSpinner" style={{ width: 48, height: 48 }} />
          <p style={{ color: "rgba(250,246,238,0.6)", fontSize: 14, margin: 0 }}>Loading menu…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ttlKioskFalconShell">
        <div className="ttlKioskCenterState" style={{ background: "var(--kiosk-ink)", height: "100%" }}>
          <div style={{ fontSize: 44 }}>😕</div>
          <p style={{ color: "var(--kiosk-cream)", fontSize: 16, fontWeight: 700, margin: 0 }}>Kiosk unavailable</p>
          <p style={{ color: "rgba(250,246,238,0.55)", fontSize: 13, margin: 0 }}>{error}</p>
          <button className="ttlKioskPillBtn ttlKioskPillBtnPrimary" style={{ width: "auto", padding: "12px 28px" }} onClick={loadMenu}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const activeCategoryMeta = categories.find((c) => c.id === f.view);
  const categoryItems = f.view && f.view !== "offers" ? itemsForCategory(items, f.view) : [];

  return (
    <div className="ttlKioskFalconShell">
      {f.stage === STAGE.WELCOME && <KioskWelcomeScreen business={business} onStart={start} />}

      {f.stage === STAGE.ORDER_TYPE && (
        <KioskOrderTypeScreen
          dineInEnabled={business?.dineInEnabled !== false}
          takeawayEnabled={business?.takeawayEnabled !== false}
          onSelect={chooseOrderType}
          onBack={() => patch({ stage: STAGE.WELCOME })}
        />
      )}

      {f.stage === STAGE.TABLE_SELECT && (
        <KioskTableSelectScreen
          selectedTable={f.tableNumber}
          onSelect={(n) => patch({ tableNumber: n })}
          onContinue={confirmTable}
          onBack={() => patch({ stage: STAGE.ORDER_TYPE })}
          businessName={business?.businessName}
        />
      )}

      {f.stage === STAGE.MENU && (
        <div className="ttlKioskMenuLayout">
          <KioskSidebar
            business={business}
            categories={categories}
            items={items}
            activeCategory={f.view}
            onSelectCategory={selectCategory}
            onHome={goHome}
            onOffers={goToOffers}
            offersCount={activeDiscounts.length}
          />
          <div className="ttlKioskFalconMain">
            <KioskTopBar
              business={business}
              onCancelOrder={requestCancelOrder}
              hasItems={f.cart.length > 0}
              orderType={f.orderType}
              tableNumber={f.tableNumber}
              onLogoClick={() => patch({ view: null, cartOpen: false })}
            />
            <div className="ttlKioskFalconScroll ttlKioskNoScroll">
              {!f.view && <KioskMenuIntro business={business} />}
              {f.view === "offers" && (
                <KioskOffersView
                  businessId={businessId}
                  items={items}
                  activeDiscounts={activeDiscounts}
                  currencyCode={currencyCode}
                  cart={f.cart}
                  onAddItem={addToCart}
                  onAddCombo={addComboToCart}
                  onDiscountsRefetched={setActiveDiscounts}
                  onBrowseMenu={() => patch({ view: null })}
                />
              )}
              {f.view && f.view !== "offers" && (
                <KioskProductGrid
                  categoryName={activeCategoryMeta?.name}
                  products={categoryItems}
                  currencyCode={currencyCode}
                  onAdd={addToCart}
                />
              )}
            </div>

            <KioskCartBar total={total} itemCount={cartCount} currencyCode={currencyCode} onOpen={() => patch({ cartOpen: true })} />

            {f.cartOpen && (
              <KioskCartModal
                cart={f.cart}
                subtotal={subtotal}
                gst={gst}
                total={total}
                taxEnabled={taxEnabled}
                currencyCode={currencyCode}
                onClose={() => patch({ cartOpen: false })}
                onIncrement={increment}
                onDecrement={decrement}
                onRemove={removeFromCart}
                onContinue={goToGuestDetails}
              />
            )}

            {f.confirmingCancel && (
              <KioskConfirmDialog
                title="Cancel your order?"
                message="This will remove all items from your cart."
                confirmLabel="Cancel order"
                onConfirm={confirmCancelOrder}
                onCancel={() => patch({ confirmingCancel: false })}
              />
            )}
          </div>
        </div>
      )}

      {f.stage === STAGE.GUEST_DETAILS && (
        <KioskGuestDetailsScreen
          orderType={f.orderType}
          hasTableService={!!business?.hasTableService}
          tableNumber={f.tableNumber}
          onChangeTable={(n) => patch({ tableNumber: n })}
          guest={f.guest}
          total={total}
          currencyCode={currencyCode}
          onSave={saveGuestDetails}
          onBack={() => patch({ stage: STAGE.MENU })}
        />
      )}

      {f.stage === STAGE.PAYMENT && (
        <KioskPaymentScreen
          total={total}
          business={business}
          currencyCode={currencyCode}
          diningInfo={{ type: f.orderType === "dine-in" ? "dine-in" : "takeaway", table: f.tableNumber, ...f.guest }}
          payAtCounterAvailable={payAtCounterAvailable}
          onInitiatePayment={handleInitiatePayment}
          onConfirmPayment={handleConfirmPayment}
          onBeginProcessing={beginProcessing}
          onProcessingFailed={processingFailed}
          paymentError={f.paymentError}
          onBack={() => patch({ stage: STAGE.GUEST_DETAILS })}
        />
      )}

      {f.stage === STAGE.PROCESSING && <KioskProcessingScreen method={f.processingLabel} />}

      {f.stage === STAGE.CONFIRMED && f.confirmedData && (
        <KioskOrderConfirmed
          confirmedData={f.confirmedData}
          business={business}
          cart={f.cart}
          currencyCode={currencyCode}
          emailSent={false}
          onTrack={goToTracking}
          onOpenEmail={openEmailModal}
          onOpenRating={openRatingModal}
        />
      )}

      {f.stage === STAGE.TRACKING && f.confirmedData && (
        <KioskOrderTracking
          confirmedData={f.confirmedData}
          cart={f.cart}
          currencyCode={currencyCode}
          business={business}
          onOpenEmail={openEmailModal}
          onOpenRating={openRatingModal}
          onNewOrder={resetKiosk}
        />
      )}

      {f.confirmedData && (
        <KioskEmailInvoiceModal
          open={f.emailModalOpen}
          orderId={f.confirmedData.orderId}
          orderNumber={f.confirmedData.orderNumber}
          onClose={closeEmailModal}
        />
      )}
      {f.confirmedData && (
        <KioskRatingModal
          open={f.ratingModalOpen}
          businessId={businessId}
          customerName={f.guest.name}
          customerPhone={f.guest.phone}
          onClose={closeRatingModal}
        />
      )}

      {idleWarning && f.stage !== STAGE.WELCOME && (
        <KioskIdleOverlay onStayHere={stayHere} />
      )}
    </div>
  );
};

export default KioskWrapper;