import axios from "axios";

// use VITE_SERVER_BASE_URL or fallback
export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: SERVER_BASE_URL,
});

// inject token for multi‑user support
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
