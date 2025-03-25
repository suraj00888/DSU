import axios from "axios";
import store from "../store";
import { logout, sessionRefreshed } from "../features/auth/authSlice";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5001/", // Replace with your API URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Track if we're currently refreshing the token to prevent infinite loops
let isRefreshing = false;
// Store pending requests that are waiting for token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to unauthorized access (expired token)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Try to refresh the token
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token, must logout
        console.log("No refresh token available, logging out...");
        store.dispatch(logout({ expired: true }));

        // Redirect to login page
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint
        const response = await axios.post(
          "http://localhost:5001/api/auth/refresh-token",
          { refreshToken },
          { skipAuthRefresh: true },
        );

        if (response.data.token) {
          // Update tokens
          localStorage.setItem("token", response.data.token);

          if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
          }

          // Update Redux state
          if (response.data.user) {
            store.dispatch(
              sessionRefreshed({
                user: response.data.user,
              }),
            );
          }

          // Update auth header for the original request
          api.defaults.headers.common["Authorization"] =
            "Bearer " + response.data.token;

          // Process any requests that were queued during the refresh
          processQueue(null, response.data.token);

          // Retry the original request
          originalRequest.headers["Authorization"] =
            "Bearer " + response.data.token;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        processQueue(refreshError, null);

        // Refresh failed, must logout
        store.dispatch(logout({ expired: true }));

        // Redirect to login page
        window.location.href = "/login";
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
