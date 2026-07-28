"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import "./kiosk-v3-theme.css";

import WelcomeScreen from "./components/WelcomeScreen";
import Sidebar from "./components/Sidebar";
import HomeGrid from "./components/HomeGrid";
import ProductGrid from "./components/ProductGrid";
import CartBar from "./components/CartBar";
import CartModal from "./components/CartModal";
import TopBar from "./components/TopBar";
import OrderTypeScreen from "./components/OrderTypeScreen";
import TableSelectScreen from "./components/TableSelectScreen";
import GuestDetailsScreen from "./components/GuestDetailsScreen";
import PaymentScreen from "./components/PaymentScreen";
import ProcessingScreen from "./components/ProcessingScreen";
import OrderConfirmed from "./components/OrderConfirmed";
import OrderTracking from "./components/OrderTracking";
import RatingModal from "./components/RatingModal";
import EmailInvoiceModal from "./components/EmailInvoiceModal";
import ConfirmDialog from "./components/ConfirmDialog";

import qrService from "../services/qrService";
import customerOrderService from "../services/customerOrderService";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6163";

const SCREENS = {
  WELCOME: "WELCOME",
  MENU: "MENU",
  ORDERTYPE: "ORDERTYPE",
  TABLESELECT: "TABLESELECT",
  GUESTDETAILS: "GUESTDETAILS",
  PAYMENT: "PAYMENT",
  PROCESSING: "PROCESSING",
  CONFIRMED: "CONFIRMED",
  TRACKING: "TRACKING",
};

const EMPTY_GUEST = { name: "", phone: "", notes: "" };

// Cycle products through the 3 available card layouts so the grid
// doesn't look monotonous — purely a visual choice, not fake data.
function pickLayout(index, count) {
  if (count === 1) return "hero";
  if (count <= 4) return "two";
  return index % 5 === 0 ? "hero" : "two";
}

function getCurrencyCode(business) {
  try {
    const stored = JSON.parse(localStorage.getItem("ttl_user") || "{}");
    if (stored?.currencyCode) return stored.currencyCode;
  } catch {}
  return business?.currencyCode || "INR";
}

export default function KioskV3Wrapper({ businessId }) {
  const [screen, setScreen] = useState(SCREENS.WELCOME);
  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [menuView, setMenuView] = useState("home"); // "home" | categoryId
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [orderType, setOrderType] = useState(null); // "dine-in" | "takeaway"
  const [tableNumber, setTableNumber] = useState(null);
  const [guest, setGuest] = useState(EMPTY_GUEST);

  const [sessionId, setSessionId] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null); // shaped for the new components
  const [payAtCounterAvailable, setPayAtCounterAvailable] = useState(false);
  const [processingMethod, setProcessingMethod] = useState("");

  const [showRating, setShowRating] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const currencyCode = getCurrencyCode(business);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  // ── Load menu (once) ─────────────────────────────────────
  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await qrService.getPublicMenu(businessId);
      if (res.success && res.data) {
        setBusiness(res.data.business);
        const cats = res.data.categories || [];
        setCategories(
          cats.map((c) => ({
            id: c.categoryId,
            name: c.categoryName,
            image: c.categoryImageUrl || null,
          }))
        );
        const allItems = cats.flatMap((cat) =>
          (cat.products || []).map((p) => ({
            id: p.productId,
            catId: cat.categoryId,
            catName: cat.categoryName,
            name: p.itemName,
            description: p.itemDescription || "",
            price: Number(p.itemPrice),
            image: p.itemImageUrl || null,
            kcal: null,
            unavailable: false,
          }))
        );
        setItems(allItems);

        const sessionRes = await customerOrderService.createSession(businessId, null);
        if (sessionRes.success) setSessionId(sessionRes.data.sessionId);

        try {
          const pacRes = await fetch(`${API_BASE}/api/payment/pay-at-counter/status?businessId=${businessId}`);
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
  }, [businessId]);

  useEffect(() => {
    if (businessId) loadMenu();
  }, [businessId, loadMenu]);

  const productsByCategory = useMemo(() => {
    const map = {};
    for (const item of items) {
      if (!map[item.catId]) map[item.catId] = [];
      map[item.catId].push(item);
    }
    return map;
  }, [items]);

  // ── Cart ──────────────────────────────────────────────────
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) return prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const incrementCart = (id) => setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)));
  const decrementCart = (id) =>
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );

  // ── Reset everything back to the welcome screen ─────────────
  const resetKiosk = useCallback(() => {
    setScreen(SCREENS.WELCOME);
    setMenuView("home");
    setCart([]);
    setShowCartModal(false);
    setShowCancelConfirm(false);
    setOrderType(null);
    setTableNumber(null);
    setGuest(EMPTY_GUEST);
    setOrderData(null);
    setConfirmedOrder(null);
    setShowRating(false);
    setShowEmailModal(false);
    setEmailSent(false);
    loadMenu();
  }, [loadMenu]);

  // ── Order / payment payload builder ─────────────────────────
  const buildOrderPayload = (payAtCounter) => ({
    sessionId,
    businessId,
    orderType: orderType === "dine-in" ? "DINE_IN" : "TAKE_AWAY",
    tableNumber: orderType === "dine-in" ? String(tableNumber || "") : null,
    customerName: guest.name || null,
    customerPhone: guest.phone || null,
    customerEmail: null,
    customerNote: guest.notes || null,
    payAtCounter,
    items: cart.map((c) => ({
      productId: c.id,
      productName: c.name,
      productDescription: c.description,
      productImageUrl: c.image,
      categoryName: c.catName,
      unitPrice: c.price,
      quantity: c.qty,
      specialRequest: null,
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
        };
      }

      let currentOrderId = orderData?.orderId;
      if (!currentOrderId) {
        const orderRes = await customerOrderService.placeOrder(buildOrderPayload(false));
        if (!orderRes.success) throw new Error(orderRes.message);
        setOrderData(orderRes.data);
        currentOrderId = orderRes.data.orderId;
      }
      const currency = gatewayName === "stripe" ? "USD" : "INR";
      const payRes = await customerOrderService.initiatePayment(currentOrderId, gatewayName, currency);
      if (!payRes.success) throw new Error(payRes.message);
      return payRes.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || "Failed to initiate payment");
    }
  };

  // Shapes the confirmed order into exactly what the new components expect
  const buildConfirmedOrderShape = (data) => ({
    orderId: data.orderId,
    number: data.orderNumber,
    total: Number(data.grandTotal || total),
    orderType,
    tableNumber,
    guest,
    businessName: business?.businessName,
    currencySymbol: "",
    date: new Date().toLocaleString(),
    estimatedMinutes: data.estimatedMinutes,
    items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, qty: c.qty, image: c.image })),
  });

  const handleConfirmPayment = async (confirmPayload) => {
    setScreen(SCREENS.PROCESSING);
    setProcessingMethod(confirmPayload.gatewayName === "pay_at_counter" ? "order" : confirmPayload.gatewayName);
    try {
      if (confirmPayload.gatewayName === "pay_at_counter") {
        const res = await customerOrderService.confirmPayment({
          paymentId: confirmPayload.paymentId,
          orderId: confirmPayload.orderId,
          gatewayName: "pay_at_counter",
          gatewayResponse: confirmPayload.gatewayResponse,
        });
        const data = res.success
          ? res.data
          : {
              orderId: confirmPayload.orderId,
              orderNumber: confirmPayload.orderNumber,
              grandTotal: confirmPayload.grandTotal,
            };
        setConfirmedOrder(buildConfirmedOrderShape(data));
        setScreen(SCREENS.CONFIRMED);
        return;
      }

      const res = await customerOrderService.confirmPayment(confirmPayload);
      if (!res.success) throw new Error(res.message);
      setConfirmedOrder(buildConfirmedOrderShape(res.data));
      setScreen(SCREENS.CONFIRMED);
    } catch (err) {
      setScreen(SCREENS.PAYMENT);
      throw new Error(err.response?.data?.message || err.message || "Payment confirmation failed");
    }
  };

  // ── Email invoice — real API ────────────────────────────────
  const handleSendInvoiceEmail = async (email) => {
    const res = await fetch(`${API_BASE}/api/customer/order/${confirmedOrder.orderId}/invoice/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok || data.data?.emailSent !== true) {
      throw new Error(data.message || "Couldn't send the invoice.");
    }
    setEmailSent(true);
  };

  // ── Rating — real API ────────────────────────────────────────
  const handleSubmitRating = async ({ stars, note }) => {
    const phone = (guest.phone && guest.phone.trim()) ? guest.phone.trim() : `KIOSK-GUEST-${Date.now()}`;
    const res = await fetch(`${API_BASE}/api/reviews/business`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        customerName: guest.name || "Guest",
        customerPhone: phone,
        rating: stars,
        reviewText: note?.trim() || null,
      }),
    });
    const data = await res.json();
    if (!res.ok && res.status !== 409 && data.success === false) {
      throw new Error(data.message || "Couldn't submit your rating.");
    }
  };

  // ── Loading / error states ──────────────────────────────────
  if (loading && !business) {
    return (
      <div className="kiosk-v3 w-full h-screen flex items-center justify-center bg-cream">
        <span className="w-10 h-10 rounded-full border-4 border-ember/25 border-t-ember animate-spin" />
      </div>
    );
  }
  if (error && !business) {
    return (
      <div className="kiosk-v3 w-full h-screen flex flex-col items-center justify-center bg-cream gap-3 px-8 text-center">
        <div className="text-4xl">😕</div>
        <p className="font-display font-semibold text-charcoal text-lg">Menu unavailable</p>
        <p className="text-muted text-sm">{error}</p>
        <button onClick={loadMenu} className="mt-2 rounded-full bg-ember text-ink px-6 py-2.5 text-sm font-semibold">
          Try again
        </button>
      </div>
    );
  }

  const activeCategoryName =
    menuView === "home" ? "Home" : categories.find((c) => c.id === menuView)?.name || "";
  const activeProducts = menuView === "home" ? [] : productsByCategory[menuView] || [];

  return (
    <div className="kiosk-v3 relative w-full h-screen overflow-hidden bg-cream">
      {screen === SCREENS.WELCOME && (
        <WelcomeScreen business={business} onStart={() => setScreen(SCREENS.MENU)} />
      )}

      {screen === SCREENS.MENU && (
        <div className="relative w-full h-full flex flex-col">
          <TopBar
            hasItems={cartCount > 0}
            orderType={null}
            onCancelOrder={() => setShowCancelConfirm(true)}
          />
          <div className="relative flex-1 flex overflow-hidden">
            <Sidebar
              categories={categories}
              activeCategory={menuView === "home" ? null : menuView}
              onSelectCategory={setMenuView}
              onHome={() => setMenuView("home")}
            />
            <div className="relative flex-1 overflow-y-auto no-scrollbar">
              {menuView === "home" ? (
                <HomeGrid categories={categories} onSelectCategory={setMenuView} />
              ) : (
                <ProductGrid
                  categoryName={activeCategoryName}
                  layout={pickLayout(categories.findIndex((c) => c.id === menuView), categories.length)}
                  products={activeProducts}
                  onAdd={addToCart}
                  currencyCode={currencyCode}
                />
              )}
              <CartBar
                itemCount={cartCount}
                total={total}
                currencyCode={currencyCode}
                onOpen={() => setShowCartModal(true)}
              />
            </div>
          </div>

          {showCartModal && (
            <CartModal
              cart={cart}
              total={total}
              currencyCode={currencyCode}
              onClose={() => setShowCartModal(false)}
              onIncrement={incrementCart}
              onDecrement={decrementCart}
              onContinue={() => {
                setShowCartModal(false);
                setScreen(SCREENS.ORDERTYPE);
              }}
            />
          )}

          {showCancelConfirm && (
            <ConfirmDialog
              title="Cancel this order?"
              message="Your cart will be cleared and you'll return to the start."
              confirmLabel="Cancel order"
              onCancel={() => setShowCancelConfirm(false)}
              onConfirm={() => {
                setShowCancelConfirm(false);
                resetKiosk();
              }}
            />
          )}
        </div>
      )}

      {screen === SCREENS.ORDERTYPE && (
        <OrderTypeScreen
          onBack={() => setScreen(SCREENS.MENU)}
          onSelect={(type) => {
            setOrderType(type);
            setScreen(type === "dine-in" ? SCREENS.TABLESELECT : SCREENS.GUESTDETAILS);
          }}
        />
      )}

      {screen === SCREENS.TABLESELECT && (
        <TableSelectScreen
          selectedTable={tableNumber}
          onSelect={setTableNumber}
          onBack={() => setScreen(SCREENS.ORDERTYPE)}
          onContinue={() => setScreen(SCREENS.GUESTDETAILS)}
        />
      )}

      {screen === SCREENS.GUESTDETAILS && (
        <GuestDetailsScreen
          orderType={orderType}
          tableNumber={tableNumber}
          onChangeTable={setTableNumber}
          guest={guest}
          total={total}
          currencyCode={currencyCode}
          onBack={() => setScreen(orderType === "dine-in" ? SCREENS.TABLESELECT : SCREENS.ORDERTYPE)}
          onSave={(form) => {
            setGuest(form);
            setScreen(SCREENS.PAYMENT);
          }}
        />
      )}

      {screen === SCREENS.PAYMENT && (
        <PaymentScreen
          total={total}
          currencyCode={currencyCode}
          business={business}
          diningInfo={guest}
          payAtCounterAvailable={payAtCounterAvailable}
          onBack={() => setScreen(SCREENS.GUESTDETAILS)}
          onInitiatePayment={handleInitiatePayment}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {screen === SCREENS.PROCESSING && <ProcessingScreen method={processingMethod} />}

      {screen === SCREENS.CONFIRMED && confirmedOrder && (
        <OrderConfirmed
          order={confirmedOrder}
          emailSent={emailSent}
          onTrack={() => setScreen(SCREENS.TRACKING)}
          onOpenEmail={() => setShowEmailModal(true)}
          onOpenRating={() => setShowRating(true)}
        />
      )}

      {screen === SCREENS.TRACKING && confirmedOrder && (
        <OrderTracking
          order={confirmedOrder}
          emailSent={emailSent}
          currencyCode={currencyCode}
          onNewOrder={resetKiosk}
          onOpenEmail={() => setShowEmailModal(true)}
          onOpenRating={() => setShowRating(true)}
        />
      )}

      <RatingModal
        open={showRating}
        onSubmit={handleSubmitRating}
        onSkip={() => setShowRating(false)}
      />

      <EmailInvoiceModal
        open={showEmailModal}
        defaultEmail=""
        onSend={async (email) => {
          await handleSendInvoiceEmail(email);
        }}
        onSkip={() => setShowEmailModal(false)}
      />
    </div>
  );
}
