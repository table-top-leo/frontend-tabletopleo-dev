import api from "../services/axiosInterceptor";

export const createCategory = async (payload) => {
  const response = await api.post("/api/categories", payload);
  return response.data;
};

export const getCategoriesByAdmin = async (adminId) => {
  const response = await api.get(`/api/categories/admin/${adminId}`);
  return response.data;
};

export const updateCategory = async (categoryId, adminId, payload) => {
  const response = await api.put(`/api/categories/${categoryId}?adminId=${adminId}`, payload);
  return response.data;
};

export const deleteCategory = async (categoryId, adminId) => {
  const response = await api.delete(`/api/categories/${categoryId}?adminId=${adminId}`);
  return response.data;
};

export const createProduct = async (payload) => {
  const response = await api.post("/api/products", payload);
  return response.data;
};

export const getProductsByCategory = async (categoryId) => {
  const response = await api.get(`/api/products/category/${categoryId}`);
  return response.data;
};

export const updateProduct = async (productId, adminId, payload) => {
  const response = await api.put(`/api/products/${productId}?adminId=${adminId}`, payload);
  return response.data;
};

export const deleteProduct = async (productId, adminId) => {
  const response = await api.delete(`/api/products/${productId}?adminId=${adminId}`);
  return response.data;
};