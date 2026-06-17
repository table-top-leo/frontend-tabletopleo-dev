import axios from "axios";

const BASE_URL = "http://localhost:6163";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ttl_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ttl_token");
      localStorage.removeItem("ttl_user");
      window.location.href = "/logintabletopleo";
    }
    return Promise.reject(error);
  }
);

export default api;