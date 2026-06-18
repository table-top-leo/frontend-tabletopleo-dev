import api from "../services/axiosInterceptor";

export const uploadCategoryImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/api/images/category", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/api/images/product", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteCategoryImage = async (filename) => {
  const response = await api.delete(`/api/images/category/${filename}`);
  return response.data;
};

export const deleteProductImage = async (filename) => {
  const response = await api.delete(`/api/images/product/${filename}`);
  return response.data;
};