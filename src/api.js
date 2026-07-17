import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Fixed: Match your actual page target route "/auth" uniformly
    if (originalRequest.url.includes("/auth/token/refresh/")) {
      localStorage.removeItem("access_token");
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth"; 
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Explicitly calling raw axios without custom headers to fetch the refresh
        const response = await axios.post("/api/auth/token/refresh/", {}, { withCredentials: true });
        const newAccessToken = response.data.access;

        localStorage.setItem("access_token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;