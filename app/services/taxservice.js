import api from "../services/axiosInterceptor";

const taxService = {
  getMyTaxConfiguration: async () => {
    const res = await api.get("/api/tax/my-configuration");
    return res.data;
  },
  updateMyTaxConfiguration: async (payload) => {
    const res = await api.put("/api/tax/my-configuration", payload);
    return res.data;
  },
};

export default taxService;