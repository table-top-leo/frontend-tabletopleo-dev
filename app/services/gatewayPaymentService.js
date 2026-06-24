// app/services/gatewayPaymentService.js
// Phase 4 — Razorpay, Stripe, PayPal API Service
// Uses axiosInterceptor — JWT attached automatically

import api from "../services/axiosInterceptor";

const BASE = "/api/payment";

const gatewayPaymentService = {

  // ── RAZORPAY ────────────────────────────────────────────

  saveRazorpay: async (data) => {
    const res = await api.post(`${BASE}/razorpay/save`, {
      keyId: data.keyId,
      keySecret: data.keySecret,
      webhookSecret: data.webhookSecret || "",
      environment: data.environment || "sandbox",
    });
    return res.data;
  },

  updateRazorpay: async (data) => {
    const res = await api.put(`${BASE}/razorpay/update`, {
      keyId: data.keyId,
      keySecret: data.keySecret,
      webhookSecret: data.webhookSecret || "",
      environment: data.environment || "sandbox",
    });
    return res.data;
  },

  getRazorpay: async () => {
    const res = await api.get(`${BASE}/razorpay`);
    return res.data;
  },

  deleteRazorpay: async () => {
    const res = await api.delete(`${BASE}/razorpay/delete`);
    return res.data;
  },

  // ── STRIPE ──────────────────────────────────────────────

  saveStripe: async (data) => {
    const res = await api.post(`${BASE}/stripe/save`, {
      publishableKey: data.publishableKey,
      secretKey: data.secretKey,
      webhookSecret: data.webhookSecret,
      environment: data.environment || "sandbox",
    });
    return res.data;
  },

  updateStripe: async (data) => {
    const res = await api.put(`${BASE}/stripe/update`, {
      publishableKey: data.publishableKey,
      secretKey: data.secretKey,
      webhookSecret: data.webhookSecret,
      environment: data.environment || "sandbox",
    });
    return res.data;
  },

  getStripe: async () => {
    const res = await api.get(`${BASE}/stripe`);
    return res.data;
  },

  deleteStripe: async () => {
    const res = await api.delete(`${BASE}/stripe/delete`);
    return res.data;
  },

  // ── PAYPAL ──────────────────────────────────────────────

  savePaypal: async (data) => {
    const res = await api.post(`${BASE}/paypal/save`, {
      paypalClientId: data.paypalClientId,
      secretKey: data.secretKey,
      webhookSecret: data.webhookSecret || "",
      environment: data.environment || "sandbox",
    });
    return res.data;
  },

  updatePaypal: async (data) => {
    const res = await api.put(`${BASE}/paypal/update`, {
      paypalClientId: data.paypalClientId,
      secretKey: data.secretKey,
      webhookSecret: data.webhookSecret || "",
      environment: data.environment || "sandbox",
    });
    return res.data;
  },

  getPaypal: async () => {
    const res = await api.get(`${BASE}/paypal`);
    return res.data;
  },

  deletePaypal: async () => {
    const res = await api.delete(`${BASE}/paypal/delete`);
    return res.data;
  },

  // ── ALL ─────────────────────────────────────────────────

  getAllGateways: async () => {
    const res = await api.get(`${BASE}/gateways/all`);
    return res.data;
  },
};

export default gatewayPaymentService;
