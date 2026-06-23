// app/services/qrService.js
// Phase 5 — QR Code Generation & Public Menu API Service

import api from "../services/axiosInterceptor";
import axios from "axios";

const QR_BASE = "/api/qr";
const MENU_BASE = "/api/menu";
const BASE_URL = "http://localhost:6163";

const qrService = {

  /**
   * Generate (or regenerate) a QR code for the admin's business.
   * JWT required. businessId is resolved on backend.
   *
   * @returns {Promise} - ApiResponse<QrCodeResponse>
   *   qrImageBase64: "data:image/png;base64,..." — use directly in <img src="">
   *   qrUrl: "http://localhost:3000/menu/BUS000001" — the URL encoded in the QR
   */
  generateQrCode: async () => {
    const response = await api.post(`${QR_BASE}/generate`);
    return response.data;
  },

  /**
   * Get the admin's existing QR code (for dashboard display).
   * Returns null data if not yet generated.
   *
   * @returns {Promise} - ApiResponse<QrCodeResponse>
   */
  getMyQrCode: async () => {
    const response = await api.get(`${QR_BASE}/my`);
    return response.data;
  },

  /**
   * Public menu API — called by customer page after QR scan.
   * NO JWT required — this is a public endpoint.
   *
   * @param {string} businessId - from URL: /menu/[businessId]
   * @returns {Promise} - ApiResponse<CustomerMenuResponse>
   */
  getPublicMenu: async (businessId) => {
    // Use plain axios (no auth header) for public endpoint
    const response = await axios.get(`${BASE_URL}${MENU_BASE}/${businessId}`);
    return response.data;
  },
};

export default qrService;
