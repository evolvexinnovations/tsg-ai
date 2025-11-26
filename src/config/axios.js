import axios from "axios";
import API_BASE_URL from "./config.jsx";

// Use the central API base URL so all frontend requests go to the Lambda/API Gateway backend.
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401/403 if we're not already on the login page
    if ((error.response?.status === 401 || error.response?.status === 403) && 
        !window.location.pathname.includes('/login')) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

