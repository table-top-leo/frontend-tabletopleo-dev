import api from "../services/axiosInterceptor";

const adminOrderService = {

  getAllOrders: async () => {
    const res = await api.get("/api/admin/orders");
    return res.data;
  },

  getOrderDetail: async (orderId) => {
    const res = await api.get(`/api/admin/orders/${orderId}`);
    return res.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await api.put(`/api/admin/orders/${orderId}/status?status=${status}`);
    return res.data;
  },
};

export default adminOrderService;
