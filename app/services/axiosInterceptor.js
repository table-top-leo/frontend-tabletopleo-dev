import axios from "axios";

const BASE_URL = "https://api.tabletopleo.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Required so the browser actually sends/receives the HttpOnly refresh
  // cookie on requests to the backend. Harmless for every other request
  // that doesn't care about cookies at all.
  withCredentials: true,
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

// ── Silent refresh-and-retry on 401 ──
// Only the access token in localStorage expires on its own (45 min) —
// that's expected and not an error condition by itself. When it does,
// the very next API call gets a 401; instead of immediately logging the
// person out, we try once to use the still-valid refresh cookie to get
// a new access token, then quietly retry the original request. The
// person never sees this happen.
//
// A plain, separate axios call (not the `api` instance above) is used
// for the refresh request itself — routing it through `api` would let
// its own 401 response recurse back into this same interceptor.
let isRefreshing = false;
let pendingQueue = []; // { resolve, reject } for requests waiting on an in-flight refresh

function resolveQueue(error, newToken) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newToken);
  });
  pendingQueue = [];
}

const AUTH_ENDPOINTS_NEVER_RETRIED = ["/api/auth/login", "/api/auth/refresh", "/api/auth/logout"];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    const isAuthEndpoint = AUTH_ENDPOINTS_NEVER_RETRIED.some((path) => requestUrl.includes(path));

    // Not a 401, already retried once, or this IS the refresh/login/logout
    // call itself — none of these should trigger another refresh attempt.
    // Retrying indefinitely or refreshing-the-refresh-call would create
    // an infinite loop.
    if (status !== 401 || isAuthEndpoint || originalRequest?._retried) {
      if (status === 401 && isAuthEndpoint) {
        // The refresh/login call itself failed — this is the real,
        // final "not logged in" signal. Clear everything and send the
        // person to login.
        localStorage.removeItem("ttl_token");
        localStorage.removeItem("ttl_user");
        if (typeof window !== "undefined" && !window.location.pathname.includes("logintabletopleo")) {
          window.location.href = "/logintabletopleo";
        }
      }
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    // A refresh is already in flight (triggered by some other request
    // that 401'd first) — queue this one and wait for that single
    // refresh to finish, rather than firing a second parallel refresh
    // call.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshResponse = await axios.post(
        `${BASE_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const data = refreshResponse.data;

      if (!data?.success || !data?.token) {
        throw new Error("Refresh did not return a valid session.");
      }

      localStorage.setItem("ttl_token", data.token);
      // Same curated shape (with the same fallback defaults) that
      // loginpage.jsx builds on a normal login — kept identical here so
      // ttl_user always has the same structure regardless of whether it
      // was set by a fresh login or a silent background refresh.
      localStorage.setItem(
        "ttl_user",
        JSON.stringify({
          adminId: data.adminId,
          fullName: data.fullName,
          email: data.email,
          businessId: data.businessId,
          businessName: data.businessName || null,
          logoUrl: data.logoUrl || null,
          currencyCode: data.currencyCode || "INR",
          languageCode: data.languageCode || "en",
          languageName: data.languageName || "English",
          multiLocation: Boolean(data.multiLocation),
          role: data.role || "OWNER",
          branchName: data.branchName || null,
          locationId: data.locationId || null,
          parentAdminId: data.parentAdminId || null,
          useHeadOfficePayment: data.useHeadOfficePayment,
          headOfficePhone: data.headOfficePhone || null,
        })
      );

      resolveQueue(null, data.token);
      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError, null);
      localStorage.removeItem("ttl_token");
      localStorage.removeItem("ttl_user");
      if (typeof window !== "undefined" && !window.location.pathname.includes("logintabletopleo")) {
        window.location.href = "/logintabletopleo";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;