"use client";
import { useState, useEffect } from "react";
import "../designcustomerflow/customer-common.css";
import "../designcustomerflow/customer-layout.css";
import "../designcustomerflow/customer-components.css";

import CustomerSplashScreen     from "../customer/splashscreenpage";
import CustomerLandingPage      from "../customer/CustomerLandingPage";
import CustomerOffersPage       from "../customer/CustomerOffersPage";
import CustomerMenuPage         from "../customer/CustomerMenuPage";
import CustomerProductPopup     from "../customer/CustomerProductPopup";
import CustomerCartPage         from "../customer/CustomerCartPage";
import CustomerDiningSelection  from "../customer/CustomerDiningSelection";
import CustomerPaymentPage      from "../customer/CustomerPaymentPage";
import CustomerOrderSuccess     from "../customer/CustomerOrderSuccess";
import CustomerLiveTracking     from "../customer/CustomerLiveTracking";
import CustomerSidebar          from "../customer/Customersidebar";
import CustomerMyOrdersPage     from "../customer/CustomerMyOrderPage";

import qrService              from "../services/qrService";
import customerOrderService   from "../services/customerOrderService";
import discountService        from "../services/discountService";
import useWebSocket           from "../hooks/useWebSocket";

const SCREENS = {
  SPLASH:"SPLASH", LANDING:"LANDING", OFFERS:"OFFERS", MENU:"MENU", CART:"CART",
  DINING:"DINING", PAYMENT:"PAYMENT", SUCCESS:"SUCCESS", TRACKING:"TRACKING", MY_ORDERS:"MY_ORDERS"
};

// Per-business identity key — a customer might visit multiple TableTop Leo
// businesses from the same phone, so we don't want their name/email from
// one restaurant leaking into another's sidebar.
const identityKey = (businessId) => `ttl_customer_identity_${businessId}`;

const CustomerWrapper = ({ businessId }) => {
  const [screen,        setScreen]        = useState(SCREENS.SPLASH);
  const [offersOrigin,  setOffersOrigin]   = useState(SCREENS.LANDING);
  const [business,      setBusiness]      = useState(null);
  const [categories,    setCategories]    = useState([]);
  const [items,         setItems]         = useState([]);
  const [cart,          setCart]          = useState([]);
  const [popupItem,     setPopupItem]     = useState(null);
  const [diningInfo,    setDiningInfo]    = useState({ type: null, name: "", phone: "", email: "", table: "", note: "" });
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");

  const [sessionId,     setSessionId]     = useState(null);
  const [orderData,     setOrderData]     = useState(null);
  const [paymentData,   setPaymentData]   = useState(null);
  const [confirmedData, setConfirmedData] = useState(null);
  const [payAtCounterAvailable, setPayAtCounterAvailable] = useState(false);
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [screenBeforeMyOrders, setScreenBeforeMyOrders] = useState(SCREENS.LANDING);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal  = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const gst       = Math.round(subtotal * 0.05);
  const total     = subtotal + gst;

  // Real-time offers: the moment the merchant activates/edits/removes a
  // discount, the badge count and every open screen reflect it instantly.
  useWebSocket({
    topics: businessId ? [`/topic/business/${businessId}/discounts`] : [],
    enabled: !!businessId,
    onMessage: () => {
      discountService.getActiveDiscounts(businessId).then((res) => {
        if (res.success) setActiveDiscounts(res.data || []);
      });
    },
  });

  useEffect(() => {
    if (businessId) loadMenu();
  }, [businessId]);

  // Load any previously-saved identity for this business (set after their
  // last order). If none exists yet, the sidebar shows them as a Guest.
  useEffect(() => {
    if (!businessId) return;
    try {
      const saved = localStorage.getItem(identityKey(businessId));
      if (saved) setIdentity(JSON.parse(saved));
    } catch { /* ignore malformed storage */ }
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
        const allItems = cats.flatMap(cat =>
          (cat.products || []).map(p => ({
            id:       p.productId,
            catId:    cat.categoryId,
            catName:  cat.categoryName,
            name:     p.itemName,
            desc:     p.itemDescription || "",
            price:    Number(p.itemPrice),
            img:      p.itemImageUrl || null,
          }))
        );
        setItems(allItems);

        // Active discounts/offers — never blocks the menu if it fails,
        // but ALWAYS logs the real reason so it's visible in devtools
        // instead of silently looking like "no offers exist".
        try {
          const discRes = await discountService.getActiveDiscounts(businessId);
          if (discRes.success) {
            setActiveDiscounts(discRes.data || []);
          } else {
            console.error("[Discounts] API responded but success=false:", discRes.message);
            setActiveDiscounts([]);
          }
        } catch (discErr) {
          console.error("[Discounts] Failed to fetch active discounts:", discErr);
          setActiveDiscounts([]);
        }

        const sessionRes = await customerOrderService.createSession(businessId, null);
        if (sessionRes.success) {
          setSessionId(sessionRes.data.sessionId);
        }

        try {
          const pacRes = await fetch(`http://localhost:6163/api/payment/pay-at-counter/status?businessId=${businessId}`);
          const pacData = await pacRes.json();
          if (!pacRes.ok) {
            console.warn("Pay at Counter status check failed:", pacRes.status, pacData);
          }
          setPayAtCounterAvailable(pacData?.data === true);
        } catch (pacErr) {
          console.warn("Pay at Counter status check errored:", pacErr);
          setPayAtCounterAvailable(false);
        }
      } else {
        setError("Failed to load menu");
      }
    } catch (err) {
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item, qty) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + qty } : c);
      return [...prev, { ...item, qty }];
    });
    setPopupItem(null);
  };

  // Adds one unit of an item directly (used from the Offers page, where
  // tapping "+" should add immediately rather than opening the item popup)
  const addItemDirect = (item) => addToCart(item, 1);

  // Adds every item in a combo offer to the cart at once, one unit each
  const addComboToCart = (comboItems) => {
    setCart(prev => {
      let next = [...prev];
      comboItems.forEach((item) => {
        const existing = next.find(c => c.id === item.id);
        next = existing
          ? next.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
          : [...next, { ...item, qty: 1 }];
      });
      return next;
    });
  };

  const updateQty      = (id, delta) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  const removeFromCart = (id)        => setCart(prev => prev.filter(c => c.id !== id));

  // Resolves the REAL discounted unit price per cart item — including combo
  // and storewide offers, which can't be computed correctly on a per-item
  // basis alone — right before an order is placed. Falls back to original
  // prices if the discount service is unreachable, so checkout never breaks.
  const buildDiscountedItems = async () => {
    const fallback = () => cart.map(c => ({
      productId: c.id, productName: c.name, productDescription: c.desc,
      productImageUrl: c.img, categoryName: c.catName,
      unitPrice: c.price, quantity: c.qty, specialRequest: null,
    }));
    try {
      const evalRes = await discountService.evaluateCart(businessId, cart.map(c => ({
        productId: c.id, categoryId: c.catId, quantity: c.qty, originalUnitPrice: c.price,
      })));
      if (!evalRes.success || !evalRes.data?.items) return fallback();
      const priceMap = {};
      evalRes.data.items.forEach(i => { priceMap[i.productId] = i.discountedUnitPrice; });
      return cart.map(c => ({
        productId: c.id, productName: c.name, productDescription: c.desc,
        productImageUrl: c.img, categoryName: c.catName,
        unitPrice: priceMap[c.id] != null ? priceMap[c.id] : c.price,
        quantity: c.qty, specialRequest: null,
      }));
    } catch {
      return fallback();
    }
  };

  const handleDiningContinue = (info) => {
    setDiningInfo(info);
    setScreen(SCREENS.PAYMENT);
  };

  // Persist name/email/phone for this business so the hamburger sidebar and
  // My Orders lookup work on return visits — no login required.
  const saveIdentity = (info) => {
    if (!businessId || !info) return;
    const record = { name: info.name || "", email: info.email || "", phone: info.phone || "" };
    try { localStorage.setItem(identityKey(businessId), JSON.stringify(record)); } catch {}
    setIdentity(record);
  };

  const handleInitiatePayment = async (gatewayName) => {
    try {
      if (gatewayName === "pay_at_counter") {
        const orderPayload = {
          sessionId:    sessionId,
          businessId:   businessId,
          orderType:    diningInfo.type === "dine-in" ? "DINE_IN" : "TAKE_AWAY",
          tableNumber:  diningInfo.table  || null,
          customerName: diningInfo.name   || null,
          customerPhone:diningInfo.phone  || null,
          customerEmail:diningInfo.email  || null,
          customerNote: diningInfo.note   || null,
          payAtCounter: true,
          items: await buildDiscountedItems(),
        };
        const orderRes = await customerOrderService.placeOrder(orderPayload);
        if (!orderRes.success) throw new Error(orderRes.message);
        setOrderData(orderRes.data);

        const payRes = await customerOrderService.initiatePayment(
          orderRes.data.orderId, "pay_at_counter", "INR"
        );
        if (!payRes.success) throw new Error(payRes.message);
        setPaymentData(payRes.data);

        return {
          paymentId:    payRes.data.paymentId,
          orderId:      orderRes.data.orderId,
          orderNumber:  orderRes.data.orderNumber,
          grandTotal:   orderRes.data.grandTotal,
          orderType:    orderRes.data.orderType,
          customerName: orderRes.data.customerName,
          createdAt:    orderRes.data.createdAt,
          gatewayName:  "pay_at_counter",
        };
      }

      let currentOrderId = orderData?.orderId;

      if (!currentOrderId) {
        const orderPayload = {
          sessionId:    sessionId,
          businessId:   businessId,
          orderType:    diningInfo.type === "dine-in" ? "DINE_IN" : "TAKE_AWAY",
          tableNumber:  diningInfo.table  || null,
          customerName: diningInfo.name   || null,
          customerPhone:diningInfo.phone  || null,
          customerEmail:diningInfo.email  || null,
          customerNote: diningInfo.note   || null,
          payAtCounter: false,
          items: await buildDiscountedItems(),
        };

        const orderRes = await customerOrderService.placeOrder(orderPayload);
        if (!orderRes.success) throw new Error(orderRes.message);
        setOrderData(orderRes.data);
        currentOrderId = orderRes.data.orderId;
      }

      const currency = ["stripe", "paypal"].includes(gatewayName) ? "USD" : "INR";
      const payRes = await customerOrderService.initiatePayment(currentOrderId, gatewayName, currency);
      if (!payRes.success) throw new Error(payRes.message);
      setPaymentData(payRes.data);

      return payRes.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || "Failed to initiate payment");
    }
  };

  const handleConfirmPayment = async (confirmPayload) => {
    try {
      if (confirmPayload.gatewayName === "pay_at_counter") {
        const res = await customerOrderService.confirmPayment({
          paymentId:       confirmPayload.paymentId,
          orderId:         confirmPayload.orderId,
          gatewayName:     "pay_at_counter",
          gatewayResponse: JSON.stringify({ method: "pay_at_counter", ts: new Date().toISOString() }),
        });

        if (res.success) {
          setConfirmedData(res.data);
        } else {
          setConfirmedData({
            orderId:         confirmPayload.orderId,
            orderNumber:     confirmPayload.orderNumber,
            orderStatus:     "ACCEPTED",
            paymentStatus:   "PAY_AT_COUNTER",
            grandTotal:      confirmPayload.grandTotal,
            gatewayName:     "pay_at_counter",
            businessName:    business?.businessName,
            businessId:      businessId,
            orderType:       confirmPayload.orderType,
            customerName:    confirmPayload.customerName,
            customerPhone:   confirmPayload.customerPhone,
            estimatedMinutes:20,
            createdAt:       confirmPayload.createdAt,
          });
        }
        saveIdentity(diningInfo);
        setScreen(SCREENS.SUCCESS);
        return;
      }

      const res = await customerOrderService.confirmPayment(confirmPayload);
      if (!res.success) throw new Error(res.message);
      setConfirmedData(res.data);
      saveIdentity(diningInfo);
      setScreen(SCREENS.SUCCESS);
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || "Payment confirmation failed");
    }
  };

  const handleStartOver = () => {
    setScreen(SCREENS.LANDING);
    setCart([]);
    setDiningInfo({ type:null, name:"", phone:"", email:"", table:"", note:"" });
    setOrderData(null);
    setPaymentData(null);
    setConfirmedData(null);
    loadMenu();
  };

  if (loading) return (
    <div className="cw-root">
      <div className="cw-phone" style={{ alignItems:"center", justifyContent:"center", gap:16 }}>
        <div style={{ width:44, height:44, border:"3px solid var(--brand-muted)", borderTop:"3px solid var(--brand)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        <p style={{ color:"var(--text-muted)", fontSize:14, margin:0 }}>Loading menu...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div className="cw-root">
      <div className="cw-phone" style={{ alignItems:"center", justifyContent:"center", gap:12, padding:24, textAlign:"center" }}>
        <div style={{ fontSize:48 }}>😕</div>
        <p style={{ color:"var(--text-primary)", fontSize:16, fontWeight:700, margin:0 }}>Menu Unavailable</p>
        <p style={{ color:"var(--text-muted)", fontSize:13, margin:0 }}>{error}</p>
        <button className="cta-btn" style={{ width:"auto", padding:"12px 28px" }} onClick={loadMenu}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="cw-root">
      <div className="cw-phone">

        {screen === SCREENS.SPLASH && (
          <CustomerSplashScreen
            business={business}
            onContinue={() => setScreen(SCREENS.LANDING)}
          />
        )}

        {screen === SCREENS.LANDING && (
          <CustomerLandingPage
            business={business} categories={categories} items={items}
            activeDiscounts={activeDiscounts}
            onStart={() => setScreen(SCREENS.MENU)}
            onViewOffers={() => { setOffersOrigin(SCREENS.LANDING); setScreen(SCREENS.OFFERS); }}
            onItemClick={setPopupItem}
            onOpenMenu={() => setSidebarOpen(true)}
          />
        )}

        {screen === SCREENS.OFFERS && (
          <CustomerOffersPage
            business={business} businessId={businessId} items={items}
            activeDiscounts={activeDiscounts}
            onDiscountsRefetched={setActiveDiscounts}
            cart={cart} cartCount={cartCount} cartTotal={total}
            onAddItem={addItemDirect}
            onAddCombo={addComboToCart}
            onItemClick={setPopupItem}
            onBrowseMenu={() => setScreen(SCREENS.MENU)}
            onViewCart={() => setScreen(SCREENS.CART)}
            onBack={() => setScreen(offersOrigin)}
          />
        )}

        {screen === SCREENS.MENU && (
          <CustomerMenuPage
            business={business} categories={categories} items={items}
            activeDiscounts={activeDiscounts}
            cart={cart} cartCount={cartCount} cartTotal={total}
            onItemClick={setPopupItem}
            onViewOffers={() => { setOffersOrigin(SCREENS.MENU); setScreen(SCREENS.OFFERS); }}
            onViewCart={() => setScreen(SCREENS.CART)}
            onBack={() => setScreen(SCREENS.LANDING)}
          />
        )}

        {screen === SCREENS.CART && (
          <CustomerCartPage
            cart={cart} subtotal={subtotal} gst={gst} total={total}
            activeDiscounts={activeDiscounts}
            onUpdateQty={updateQty} onRemove={removeFromCart}
            onBack={() => setScreen(SCREENS.MENU)}
            onProceed={() => setScreen(SCREENS.DINING)}
          />
        )}

        {screen === SCREENS.DINING && (
          <CustomerDiningSelection
            diningInfo={diningInfo}
            onInfoChange={setDiningInfo}
            onBack={() => setScreen(SCREENS.CART)}
            onContinue={handleDiningContinue}
          />
        )}

        {screen === SCREENS.PAYMENT && (
          <CustomerPaymentPage
            total={total} business={business}
            diningInfo={diningInfo}
            onBack={() => setScreen(SCREENS.DINING)}
            onInitiatePayment={handleInitiatePayment}
            onConfirmPayment={handleConfirmPayment}
            payAtCounterAvailable={payAtCounterAvailable}
          />
        )}

        {/* ── pass business + cart for invoice download ── */}
        {screen === SCREENS.SUCCESS && (
          <CustomerOrderSuccess
            confirmedData={confirmedData}
            business={business}
            cart={cart}
            businessId={businessId}
            diningPhone={diningInfo?.phone || ""}
            onTrack={() => setScreen(SCREENS.TRACKING)}
            onHome={handleStartOver}
          />
        )}

        {screen === SCREENS.TRACKING && (
          <CustomerLiveTracking
            orderId={confirmedData?.orderId}
            orderNumber={confirmedData?.orderNumber}
            business={business}
            onBack={() => setScreen(SCREENS.SUCCESS)}
          />
        )}

        {screen === SCREENS.MY_ORDERS && (
          <CustomerMyOrdersPage
            businessId={businessId}
            phone={identity?.phone || diningInfo?.phone || ""}
            onBack={() => setScreen(screenBeforeMyOrders)}
            onBrowseMenu={() => setScreen(SCREENS.MENU)}
          />
        )}

        <CustomerSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          business={business}
          identity={identity}
          onHome={() => { setSidebarOpen(false); setScreen(SCREENS.LANDING); }}
          onOffers={() => { setSidebarOpen(false); setOffersOrigin(screen); setScreen(SCREENS.OFFERS); }}
          onMyOrders={() => { setSidebarOpen(false); setScreenBeforeMyOrders(screen); setScreen(SCREENS.MY_ORDERS); }}
        />

        {popupItem && (
          <CustomerProductPopup
            item={popupItem}
            onClose={() => setPopupItem(null)}
            onAddToCart={addToCart}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerWrapper;