import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:6163/api";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

// Configuration Management
export const saveMobilePayConfig = async (configData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payment/mobilepay/config/save`, configData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateMobilePayConfig = async (configData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/payment/mobilepay/config/update`, configData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMobilePayConfig = async (businessId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payment/mobilepay/config/${businessId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteMobilePayConfig = async (businessId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/payment/mobilepay/config/${businessId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyMobilePayCredentials = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payment/mobilepay/config/verify`, credentials, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Payment Operations
export const initiatePayment = async (paymentRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payment/mobilepay/initiate`, paymentRequest, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPaymentStatus = async (businessId, paymentReference) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/payment/mobilepay/status/${businessId}/${paymentReference}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPaymentStatusByOrderId = async (businessId, orderId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/payment/mobilepay/status/order/${businessId}/${orderId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Refund Operations
export const initiateRefund = async (refundRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payment/mobilepay/refund`, refundRequest, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const initiatePartialRefund = async (businessId, paymentReference, amount) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/payment/mobilepay/refund/partial`,
      { businessId, paymentReference, amount },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Webhook Management
export const testWebhook = async (businessId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payment/mobilepay/test-webhook/${businessId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Transaction History
export const getTransactionHistory = async (businessId, page = 0, size = 10) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/payment/mobilepay/transactions/${businessId}?page=${page}&size=${size}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getWebhookLogs = async (businessId, page = 0, size = 10) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/payment/mobilepay/webhook-logs/${businessId}?page=${page}&size=${size}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Health Check
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payment/mobilepay/health`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  saveMobilePayConfig,
  updateMobilePayConfig,
  getMobilePayConfig,
  deleteMobilePayConfig,
  verifyMobilePayCredentials,
  initiatePayment,
  getPaymentStatus,
  getPaymentStatusByOrderId,
  initiateRefund,
  initiatePartialRefund,
  testWebhook,
  getTransactionHistory,
  getWebhookLogs,
  healthCheck,
};