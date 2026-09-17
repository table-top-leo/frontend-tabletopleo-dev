import api from "../services/axiosInterceptor";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.tabletopleo.com";

const discountService = {
  // ── Merchant-facing (JWT) ──────────────────────────────────
  createDiscount: async (payload) => {
    const res = await api.post("/api/admin/discounts", payload);
    return res.data;
  },
  getMyDiscounts: async () => {
    const res = await api.get("/api/admin/discounts");
    return res.data;
  },
  updateDiscount: async (discountId, payload) => {
    const res = await api.put(`/api/admin/discounts/${discountId}`, payload);
    return res.data;
  },
  toggleActive: async (discountId, active) => {
    const res = await api.put(`/api/admin/discounts/${discountId}/toggle?active=${active}`);
    return res.data;
  },
  deleteDiscount: async (discountId) => {
    const res = await api.delete(`/api/admin/discounts/${discountId}`);
    return res.data;
  },

  // ── Offer photo upload (admin, JWT) ─────────────────────────
  uploadDiscountImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/images/discount", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  deleteDiscountImage: async (filename) => {
    const res = await api.delete(`/api/images/discount/${filename}`);
    return res.data;
  },

  // ── Public — customer menu / landing page / kiosk / cart ────
  getActiveDiscounts: async (businessId) => {
    const res = await fetch(`${API_BASE}/api/menu/${businessId}/discounts`);
    return res.json();
  },
  evaluateCart: async (businessId, items) => {
    const res = await fetch(`${API_BASE}/api/menu/${businessId}/discounts/evaluate-cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    return res.json();
  },
};

export default discountService;