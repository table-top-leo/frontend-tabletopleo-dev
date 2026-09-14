import api from "../services/axiosInterceptor";

export const createLocation = async (payload) => {
  const response = await api.post("/api/locations", payload);
  return response.data;
};

export const getLocations = async () => {
  const response = await api.get("/api/locations");
  return response.data;
};

export const updateLocation = async (locationId, payload) => {
  const response = await api.put(`/api/locations/${locationId}`, payload);
  return response.data;
};

// Always fresh — never rely on a cached ttl_user snapshot for this, since
// the owner can toggle a branch's payment lock at any time while that
// branch's staff are already logged in.
export const getMyPaymentLockStatus = async () => {
  const response = await api.get("/api/locations/my-payment-lock-status");
  return response.data;
};

export const deleteLocation = async (locationId) => {
  const response = await api.delete(`/api/locations/${locationId}`);
  return response.data;
};