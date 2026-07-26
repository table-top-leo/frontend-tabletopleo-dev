import api from "../services/axiosInterceptor";

const notificationService = {

  getActiveNotifications: async () => {
    const res = await api.get("/api/admin/notifications");
    return res.data;
  },

  markAsRead: async (notificationId) => {
    const res = await api.put(`/api/admin/notifications/${notificationId}/read`);
    return res.data;
  },

  clearAll: async () => {
    const res = await api.put("/api/admin/notifications/clear-all");
    return res.data;
  },
};

export default notificationService;
