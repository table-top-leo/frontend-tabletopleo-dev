import api from "../services/axiosInterceptor";

export const setupBusiness = async (payload) => {
  const response = await api.post("/api/business/setup", payload);
  return response.data;
};

export const getBusinessInformation = async (adminId) => {
  const response = await api.get(`/api/business-information/${adminId}`);
  return response.data;
};

export const updateBusinessInformation = async (adminId, payload) => {
  const response = await api.put(`/api/business-information/${adminId}`, payload);
  return response.data;
};