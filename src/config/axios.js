import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_URL,
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

