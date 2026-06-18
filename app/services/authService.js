import api from "../services/axiosInterceptor";

export const registerUser = async (fullName, email, mobileNumber) => {
  const response = await api.post("/api/auth/register", { fullName, email, mobileNumber });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await api.post("/api/auth/verify-otp", { email, otp });
  return response.data;
};

export const createPassword = async (email, password, confirmPassword) => {
  const response = await api.post("/api/auth/create-password", { email, password, confirmPassword });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
};

export const changePassword = async (adminId, currentPassword, newPassword, confirmPassword) => {
  const response = await api.put(`/api/auth/change-password/${adminId}`, {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return response.data;
};

export const deleteAccount = async (adminId) => {
  const response = await api.delete(`/api/auth/delete-account/${adminId}`);
  return response.data;
};