import api from "../services/axiosInterceptor";

export const getHeadOfficeAnalytics = async (filters = {}) => {
  const params = {};
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;
  if (filters.branchId) params.branchId = filters.branchId;
  if (filters.city) params.city = filters.city;
  if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
  if (filters.orderType) params.orderType = filters.orderType;
  const response = await api.get("/api/head-office/analytics", { params });
  return response.data;
};

export const getHeadOfficeFilterOptions = async () => {
  const response = await api.get("/api/head-office/analytics/filter-options");
  return response.data;
};
