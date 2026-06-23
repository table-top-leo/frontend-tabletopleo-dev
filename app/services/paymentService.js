// app/services/paymentService.js
// Phase 4 — UPI Payment Configuration API Service
// Uses the existing axiosInterceptor (api.js) — JWT is attached automatically

import api from "../services/axiosInterceptor";

const PAYMENT_BASE = "/api/payment";

const paymentService = {

  /**
   * Save UPI configuration.
   * Sends ONLY merchantName and upiId — backend resolves admin_id and business_id from JWT.
   *
   * @param {Object} data - { merchantName, upiId }
   * @returns {Promise} - ApiResponse<PaymentConfigResponse>
   */
  saveUpiConfig: async (data) => {
    const response = await api.post(`${PAYMENT_BASE}/upi/save`, {
      merchantName: data.merchantName,
      upiId: data.upiId,
    });
    return response.data;
  },

  /**
   * Update existing UPI configuration.
   *
   * @param {Object} data - { merchantName, upiId }
   * @returns {Promise} - ApiResponse<PaymentConfigResponse>
   */
  updateUpiConfig: async (data) => {
    const response = await api.put(`${PAYMENT_BASE}/upi/update`, {
      merchantName: data.merchantName,
      upiId: data.upiId,
    });
    return response.data;
  },

  /**
   * Get current admin's UPI configuration.
   *
   * @returns {Promise} - ApiResponse<PaymentConfigResponse>
   */
  getUpiConfig: async () => {
    const response = await api.get(`${PAYMENT_BASE}/upi`);
    return response.data;
  },

  /**
   * Get all payment configurations for the admin.
   *
   * @returns {Promise} - ApiResponse<List<PaymentConfigResponse>>
   */
  getAllPaymentConfigs: async () => {
    const response = await api.get(`${PAYMENT_BASE}/all`);
    return response.data;
  },

  /**
   * Delete UPI configuration.
   *
   * @returns {Promise} - ApiResponse<String>
   */
  deleteUpiConfig: async () => {
    const response = await api.delete(`${PAYMENT_BASE}/upi/delete`);
    return response.data;
  },
};

export default paymentService;
