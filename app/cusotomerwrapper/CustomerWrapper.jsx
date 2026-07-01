"use client";
import { useState, useEffect } from "react";
import "../designcustomerflow/customer-common.css";
import "../designcustomerflow/customer-layout.css";
import "../designcustomerflow/customer-components.css";

import CustomerLandingPage from "../customer/CustomerLandingPage";
import CustomerMenuPage from "../customer/CustomerMenuPage";
import CustomerProductPopup from "../customer/CustomerProductPopup";
import CustomerCartPage from "../customer/CustomerCartPage";
import CustomerDiningSelection from "../customer/CustomerDiningSelection";
import CustomerPaymentPage from "../customer/CustomerPaymentPage";
import CustomerOrderSuccess from "../customer/CustomerOrderSuccess";
import CustomerLiveTracking from "../customer/CustomerLiveTracking";

import qrService from "../services/qrService";

const SCREENS = { LANDING: "LANDING", MENU: "MENU", CART: "CART", DINING: "DINING", PAYMENT: "PAYMENT", SUCCESS: "SUCCESS", TRACKING: "TRACKING" };

const CustomerWrapper = ({ businessId }) => {
  const [screen, setScreen] = useState(SCREENS.LANDING);
  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [popupItem, setPopupItem] = useState(null);
  const [diningChoice, setDiningChoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId] = useState("ORD-" + Math.floor(1000 + Math.random() * 9000));

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
      
      // Categories with images
      const cats = res.data.categories || [];
      setCategories(cats);

      // Items
      const allItems = cats.flatMap(cat =>
        (cat.products || []).map(p => ({
          id: p.productId,
          catId: cat.categoryId,
          name: p.itemName,
          desc: p.itemDescription || "",
          price: Number(p.itemPrice),
          img: p.itemImageUrl || "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=200&fit=crop",
        }))
      );
      setItems(allItems);
    } else {
      setError("Failed to load menu");
    }
  } catch (err) {
    setError("Failed to load menu");
    console.error(err);
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

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  return (
    <div className="cw-root">
      <div className="cw-phone">
        {screen === SCREENS.LANDING && (
          <CustomerLandingPage 
            business={business} 
            categories={categories} 
            items={items} 
            onStart={() => setScreen(SCREENS.MENU)} 
            onItemClick={setPopupItem} 
          />
        )}

        {screen === SCREENS.MENU && (
          <CustomerMenuPage 
            business={business} 
            categories={categories} 
            items={items}
            cart={cart}
            onItemClick={setPopupItem} 
            onViewCart={() => setScreen(SCREENS.CART)} 
            onBack={() => setScreen(SCREENS.LANDING)} 
          />
        )}

        {screen === SCREENS.CART && (
          <CustomerCartPage 
            cart={cart} 
            subtotal={subtotal} 
            gst={gst} 
            total={total} 
            onUpdateQty={updateQty} 
            onRemove={removeFromCart} 
            onBack={() => setScreen(SCREENS.MENU)} 
            onProceed={() => setScreen(SCREENS.DINING)} 
          />
        )}

        {screen === SCREENS.DINING && (
          <CustomerDiningSelection choice={diningChoice} onChoose={setDiningChoice} onBack={() => setScreen(SCREENS.CART)} onContinue={() => setScreen(SCREENS.PAYMENT)} />
        )}

        {screen === SCREENS.PAYMENT && (
          <CustomerPaymentPage total={total} orderId={orderId} business={business} method={paymentMethod} onMethodSelect={setPaymentMethod} onBack={() => setScreen(SCREENS.DINING)} onPay={() => setScreen(SCREENS.SUCCESS)} />
        )}

        {screen === SCREENS.SUCCESS && (
          <CustomerOrderSuccess orderId={orderId} total={total} method={paymentMethod} onTrack={() => setScreen(SCREENS.TRACKING)} onHome={() => { setScreen(SCREENS.LANDING); setCart([]); setPaymentMethod(null); setDiningChoice(null); }} />
        )}

        {screen === SCREENS.TRACKING && (
          <CustomerLiveTracking orderId={orderId} business={business} onBack={() => setScreen(SCREENS.SUCCESS)} />
        )}

        {popupItem && <CustomerProductPopup item={popupItem} onClose={() => setPopupItem(null)} onAddToCart={addToCart} />}
      </div>
    </div>
  );
};

export default CustomerWrapper;