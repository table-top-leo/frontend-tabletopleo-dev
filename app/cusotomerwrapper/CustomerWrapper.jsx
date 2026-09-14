"use client";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "../designcustomerflow/customer-common.css";
import "../designcustomerflow/customer-layout.css";
import "../designcustomerflow/customer-components.css";

import { CustomerLanguageProvider } from "../context/CustomerLanguageProvider";
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

const CustomerWrapperInner = ({ businessId, locationId }) => {
  const { t } = useTranslation();
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
  const [branchName,    setBranchName]    = useState("");

  const [sessionId,     setSessionId]     = useState(null);
  const [orderData,     setOrderData]     = useState(null);
  const [paymentData,   setPaymentData]   = useState(null);
  const [confirmedData, setConfirmedData] = useState(null);
  const [payAtCounterAvailable, setPayAtCounterAvailable] = useState(false);
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  // Landing page highlights — Trending Today / Most Popular / Special
  // Items. Always defaults to empty arrays so the UI never has to guard
  // against undefined; a failed/slow fetch just means empty sections
  // (which render their own "nothing yet" empty state) rather than a
  // broken landing page.
  const [highlights, setHighlights] = useState({ trendingToday: [], mostPopular: [], specialItems: [] });
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [screenBeforeMyOrders, setScreenBeforeMyOrders] = useState(SCREENS.LANDING);
  // Small inline toast shown when a customer taps an out-of-stock item on
  // the landing/menu pages — auto-dismisses itself.
  const [oosToast, setOosToast] = useState(false);

  const cartCount = useMemo(() => {
    const comboGroups = new Set();
    let count = 0;
    cart.forEach((c) => {
      if (c.comboGroupKey) {
        // Count each distinct "Add combo" tap as exactly 1, regardless of
        // how many items are inside it — matches what the customer tapped.
        if (!comboGroups.has(c.comboGroupKey)) { comboGroups.add(c.comboGroupKey); count += 1; }
      } else {
        count += c.qty;
      }
    });
    return count;
  }, [cart]);
  const subtotal  = cart.reduce((s, c) => s + c.price * c.qty, 0);
  // Preview only — mirrors the business's real Tax & Billing configuration
  // (never a hardcoded rate), so the cart shows an honest estimate before
  // checkout. The backend recalculates this authoritatively at order
  // placement regardless of what's shown here — this is UX only, never
  // the source of truth for what the customer actually gets charged.
  const taxEnabled = !!business?.taxEnabled;
  const taxRatePct = taxEnabled ? Number(business?.taxRate || 0) : 0;
  const gst = !taxEnabled ? 0
    : business?.taxInclusive
      ? Math.round(subtotal - subtotal / (1 + taxRatePct / 100))
      : Math.round(subtotal * taxRatePct / 100);
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

  // If this menu was reached via a branch-specific QR code
  // (/menu/{businessId}/{locationId}), fetch just that branch's name —
  // a small, public, unauthenticated lookup — to show "Ordering from:
  // {branchName}" so the customer knows which physical location their
  // order is going to. Best-effort: if it fails, the ordinary
  // Head-Office-only flow continues completely unaffected.
  useEffect(() => {
    if (!locationId) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:6163/api/locations/public/${locationId}`);
        const data = await res.json();
        if (data?.success && data?.data?.branchName) {
          setBranchName(data.data.branchName);
        }
      } catch { /* silently falls back to the ordinary Head Office flow */ }
    })();
  }, [locationId]);

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
            // "AVAILABLE" or "OUT_OF_STOCK" — drives the in-stock tag and
            // whether the item can be tapped/added on the customer side.
            availability: p.itemAvailability || "AVAILABLE",
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

        // Landing page highlights (Trending Today / Most Popular / Special
        // Items) — same defensive pattern as discounts: never blocks the
        // menu from loading, always logs the real failure reason.
        setHighlightsLoading(true);
        try {
          const hlRes = await qrService.getLandingHighlights(businessId);
          if (hlRes.success && hlRes.data) {
            setHighlights({
              trendingToday: hlRes.data.trendingToday || [],
              mostPopular:   hlRes.data.mostPopular   || [],
              specialItems:  hlRes.data.specialItems  || [],
            });
          } else {
            console.error("[Highlights] API responded but success=false:", hlRes.message);
            setHighlights({ trendingToday: [], mostPopular: [], specialItems: [] });
          }
        } catch (hlErr) {
          console.error("[Highlights] Failed to fetch landing highlights:", hlErr);
          setHighlights({ trendingToday: [], mostPopular: [], specialItems: [] });
        } finally {
          setHighlightsLoading(false);
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

  // Guards item taps from the landing/menu pages — out-of-stock items
  // can't be opened into the product popup; show a small toast instead.
  const handleItemClick = (item) => {
    if (item?.availability === "OUT_OF_STOCK") {
      setOosToast(true);
      setTimeout(() => setOosToast(false), 2200);
      return;
    }
    setPopupItem(item);
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

  // Adds every item in a combo offer to the cart at once, one unit each.
  // All items from the same "Add combo" tap share a comboGroupKey so the
  // cart badge can count the whole combo as ONE entry (matching what the
  // customer actually tapped) instead of counting every item inside it —
  // the cart PAGE itself still lists and totals every item individually.
  const addComboToCart = (comboItems, discount) => {
    const comboGroupKey = discount ? `combo-${discount.discountId}-${Date.now()}` : null;
    const offerTitle = discount?.title || null;
    // Clean, stable discountId (not the group key, which also has a
    // timestamp) — sent to the backend at checkout so combo pricing is
    // ONLY applied to items explicitly added through this combo action,
    // never to the same products picked individually from the normal menu.
    const comboDiscountId = discount?.discountId || null;
    setCart(prev => {
      let next = [...prev];
      comboItems.forEach((item) => {
        // Each combo add is its own group, even if the same product was
        // already in the cart individually — keeps combo accounting exact.
        next = [...next, { ...item, qty: 1, comboGroupKey, offerTitle, comboDiscountId }];
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
      offerTitle: c.offerTitle || null, originalPrice: c.offerTitle ? c.price : null,
    }));
    try {
      const evalRes = await discountService.evaluateCart(businessId, cart.map(c => ({
        productId: c.id, categoryId: c.catId, quantity: c.qty, originalUnitPrice: c.price,
        comboDiscountId: c.comboDiscountId || null,
      })));
      if (!evalRes.success || !evalRes.data?.items) return fallback();
      const priceMap = {};
      evalRes.data.items.forEach(i => { priceMap[i.productId] = i; });
      return cart.map(c => {
        const adjusted = priceMap[c.id];
        // Prefer the server's own applied-discount label (authoritative,
        // recalculated fresh at checkout); fall back to whatever offer tag
        // the item was added to the cart with, so combo items whose price
        // is fixed by the combo itself (not a per-item % discount) still
        // carry their offer name through to the order.
        const offerTitle = adjusted?.appliedDiscountLabel || c.offerTitle || null;
        const unitPrice  = adjusted?.discountedUnitPrice != null ? adjusted.discountedUnitPrice : c.price;
        return {
          productId: c.id, productName: c.name, productDescription: c.desc,
          productImageUrl: c.img, categoryName: c.catName,
          unitPrice, quantity: c.qty, specialRequest: null,
          offerTitle,
          originalPrice: offerTitle ? c.price : null,
        };
      });
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
          locationId:   locationId || null,
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
          orderRes.data.orderId, "pay_at_counter", business?.currencyCode || "INR"
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
          locationId:   locationId || null,
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

      // The business's own configured currency is authoritative — never
      // guess it from which gateway was picked. A gateway like Stripe can
      // charge in any currency the business is actually set up for; "guess
      // USD for stripe/paypal" was silently wrong for every non-USD Stripe
      // merchant (e.g. a Danish business charging in DKK via Stripe).
      const currency = business?.currencyCode || "INR";
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
        <p style={{ color:"var(--text-muted)", fontSize:14, margin:0 }}>{t("landing.loadingMenu")}</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div className="cw-root">
      <div className="cw-phone" style={{ alignItems:"center", justifyContent:"center", gap:12, padding:24, textAlign:"center" }}>
        <div style={{ fontSize:48 }}>😕</div>
        <p style={{ color:"var(--text-primary)", fontSize:16, fontWeight:700, margin:0 }}>{t("landing.menuUnavailable")}</p>
        <p style={{ color:"var(--text-muted)", fontSize:13, margin:0 }}>{error}</p>
        <button className="cta-btn" style={{ width:"auto", padding:"12px 28px" }} onClick={loadMenu}>{t("common.tryAgain")}</button>
      </div>
    </div>
  );

  return (
    <div className="cw-root">
      <div className="cw-phone">

        {branchName && screen !== SCREENS.SPLASH && (
          <div style={{
            position: "sticky", top: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "7px 12px", background: "#f5f3ff", borderBottom: "1px solid #ede9fe",
            fontSize: 11.5, fontWeight: 700, color: "#6d28d9",
          }}>
            📍 Ordering from: {branchName}
          </div>
        )}

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
            highlights={highlights}
            highlightsLoading={highlightsLoading}
            currencyCode={business?.currencyCode}
            onStart={() => setScreen(SCREENS.MENU)}
            onViewOffers={() => { setOffersOrigin(SCREENS.LANDING); setScreen(SCREENS.OFFERS); }}
            onItemClick={handleItemClick}
            onOpenMenu={() => setSidebarOpen(true)}
          />
        )}

        {screen === SCREENS.OFFERS && (
          <CustomerOffersPage
            business={business} businessId={businessId} items={items}
            activeDiscounts={activeDiscounts}
            currencyCode={business?.currencyCode}
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
            currencyCode={business?.currencyCode}
            cart={cart} cartCount={cartCount} cartTotal={total}
            onItemClick={handleItemClick}
            onViewOffers={() => { setOffersOrigin(SCREENS.MENU); setScreen(SCREENS.OFFERS); }}
            onViewCart={() => setScreen(SCREENS.CART)}
            onBack={() => setScreen(SCREENS.LANDING)}
          />
        )}

        {screen === SCREENS.CART && (
          <CustomerCartPage
            cart={cart} subtotal={subtotal} gst={gst} total={total}
            activeDiscounts={activeDiscounts}
            currencyCode={business?.currencyCode}
            taxEnabled={taxEnabled}
            taxLabel={business?.taxSystem}
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
            hasTableService={!!business?.hasTableService}
            dineInEnabled={business?.dineInEnabled !== false}
            takeawayEnabled={business?.takeawayEnabled !== false}
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
            currencyCode={business?.currencyCode}
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
            currencyCode={business?.currencyCode}
            onClose={() => setPopupItem(null)}
            onAddToCart={addToCart}
          />
        )}

        {/* Out-of-stock tap feedback — small, professional, auto-dismissing */}
        {oosToast && (
          <div style={{
            position: "absolute", left: "50%", bottom: 92, transform: "translateX(-50%)",
            background: "#18181b", color: "#fff", padding: "10px 18px", borderRadius: 30,
            fontSize: 13, fontWeight: 600, zIndex: 9999, whiteSpace: "nowrap",
            boxShadow: "0 6px 20px rgba(0,0,0,0.22)", display: "flex", alignItems: "center", gap: 8,
            animation: "cw-oos-in 0.2s ease",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
            {t("menu.outOfStockToastMsg")}
            <style>{`@keyframes cw-oos-in{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CustomerWrapper({ businessId, locationId }) {
  return (
    <CustomerLanguageProvider businessId={businessId}>
      <CustomerWrapperInner businessId={businessId} locationId={locationId} />
    </CustomerLanguageProvider>
  );
}