import axios from "axios";

// Get the backend URL from environment variables with fallbacks
const getServerBaseUrl = () => {
  // For Vite applications, we must use import.meta.env, not process.env
  if (import.meta.env && import.meta.env.VITE_BACKEND_SERVER_BASE_URL) {
    console.log("Using Vite environment variable for backend URL:");
    return import.meta.env.VITE_BACKEND_SERVER_BASE_URL;
  }
};

const SERVER_BASE_URL = getServerBaseUrl();

console.log("API connecting to:", SERVER_BASE_URL);
console.log("Environment details:", {
  viteEnv: import.meta.env,
  hasViteServerUrl: Boolean(import.meta.env && import.meta.env.VITE_SERVER_BASE_URL),
  windowLocation: window.location.toString()
});

const api = axios.create({
  baseURL: SERVER_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
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

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
