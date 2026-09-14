import api from "../services/axiosInterceptor";

export const getHeadOfficeMenuForCopy = async () => {
  const response = await api.get("/api/menu-copy/head-office-menu");
  return response.data;
};

export const copyFromHeadOffice = async (productIds) => {
  const response = await api.post("/api/menu-copy/copy", { productIds });
  return response.data;
};