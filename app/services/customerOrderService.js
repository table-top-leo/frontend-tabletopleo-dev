import axios from "axios";

const BASE_URL = "http://localhost:6163";
const API      = `${BASE_URL}/api/customer`;

// All customer APIs are public (no JWT) — use plain axios
const pub = axios.create({ baseURL: BASE_URL, headers: { "Content-Type": "application/json" } });

const customerOrderService = {

  createSession: async (businessId, tableNumber = null) => {
    const res = await pub.post(`${API}/session`, { businessId, tableNumber });
    return res.data;
  },

  placeOrder: async (payload) => {
    const res = await pub.post(`${API}/order`, payload);
    return res.data;
  },

  initiatePayment: async (orderId, gatewayName, currency = "INR") => {
    const res = await pub.post(`${API}/payment/initiate`, { orderId, gatewayName, currency });
    return res.data;
  },

  confirmPayment: async (payload) => {
    const res = await pub.post(`${API}/payment/confirm`, payload);
    return res.data;
  },

  getOrderStatus: async (orderId) => {
    const res = await pub.get(`${API}/order/${orderId}/status`);
    return res.data;
  },
};

export default customerOrderService;
