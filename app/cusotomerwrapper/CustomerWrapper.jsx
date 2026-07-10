"use client";
import { useState, useEffect } from "react";
import "../designcustomerflow/customer-common.css";
import "../designcustomerflow/customer-layout.css";
import "../designcustomerflow/customer-components.css";

import CustomerLandingPage      from "../customer/CustomerLandingPage";
import CustomerMenuPage         from "../customer/CustomerMenuPage";
import CustomerProductPopup     from "../customer/CustomerProductPopup";
import CustomerCartPage         from "../customer/CustomerCartPage";
import CustomerDiningSelection  from "../customer/CustomerDiningSelection";
import CustomerPaymentPage      from "../customer/CustomerPaymentPage";
import CustomerOrderSuccess     from "../customer/CustomerOrderSuccess";
import CustomerLiveTracking     from "../customer/CustomerLiveTracking";

import qrService              from "../services/qrService";
import customerOrderService   from "../services/customerOrderService";

const SCREENS = {
  LANDING:"LANDING", MENU:"MENU", CART:"CART",
  DINING:"DINING", PAYMENT:"PAYMENT", SUCCESS:"SUCCESS", TRACKING:"TRACKING"
};

const CustomerWrapper = ({ businessId }) => {
  const [screen,        setScreen]        = useState(SCREENS.LANDING);
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

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal  = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const gst       = Math.round(subtotal * 0.05);
  const total     = subtotal + gst;

  useEffect(() => {
    if (businessId) loadMenu();
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

  const updateQty      = (id, delta) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  const removeFromCart = (id)        => setCart(prev => prev.filter(c => c.id !== id));

  const handleDiningContinue = (info) => {
    setDiningInfo(info);
    setScreen(SCREENS.PAYMENT);
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
          items: cart.map(c => ({
            productId:          c.id,
            productName:        c.name,
            productDescription: c.desc,
            productImageUrl:    c.img,
            categoryName:       c.catName,
            unitPrice:          c.price,
            quantity:           c.qty,
            specialRequest:     null,
          })),
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
          items: cart.map(c => ({
            productId:          c.id,
            productName:        c.name,
            productDescription: c.desc,
            productImageUrl:    c.img,
            categoryName:       c.catName,
            unitPrice:          c.price,
            quantity:           c.qty,
            specialRequest:     null,
          })),
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
            orderType:       confirmPayload.orderType,
            customerName:    confirmPayload.customerName,
            estimatedMinutes:20,
            createdAt:       confirmPayload.createdAt,
          });
        }
        setScreen(SCREENS.SUCCESS);
        return;
      }

      const res = await customerOrderService.confirmPayment(confirmPayload);
      if (!res.success) throw new Error(res.message);
      setConfirmedData(res.data);
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

        {screen === SCREENS.LANDING && (
          <CustomerLandingPage
            business={business} categories={categories} items={items}
            onStart={() => setScreen(SCREENS.MENU)} onItemClick={setPopupItem}
          />
        )}

        {screen === SCREENS.MENU && (
          <CustomerMenuPage
            business={business} categories={categories} items={items}
            cart={cart} cartCount={cartCount} cartTotal={total}
            onItemClick={setPopupItem}
            onViewCart={() => setScreen(SCREENS.CART)}
            onBack={() => setScreen(SCREENS.LANDING)}
          />
        )}

        {screen === SCREENS.CART && (
          <CustomerCartPage
            cart={cart} subtotal={subtotal} gst={gst} total={total}
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