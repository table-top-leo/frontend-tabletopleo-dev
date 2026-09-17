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

// Revokes the persistent session on the server (clearing the HttpOnly
// refresh cookie) — this is what actually ends "stay logged in" for
// this browser. Errors are deliberately swallowed: even if the server
// call fails (e.g. the network drops), the caller should still proceed
// to clear local state and redirect to login — a failed logout call
// should never trap the person in the app.
export const logoutUser = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    return response.data;
  } catch (e) {
    return { success: false };
  }
};