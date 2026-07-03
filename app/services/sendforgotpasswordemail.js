import api from "../services/axiosInterceptor";

export const sendForgotPasswordEmail = async (email) => {
  const response = await api.post("/api/auth/forgot-password", { email });
  return response.data;
};

export const validateResetToken = async (token) => {
  const response = await api.post("/api/auth/validate-reset-token", { token });
  return response.data;
};

export const resetPassword = async (token, newPassword, confirmPassword) => {
  const response = await api.post("/api/auth/reset-password", {
    token,
    newPassword,
    confirmPassword,
  });
  return response.data;
};
