import axios from "axios";

// API URL configuration
// Option 1: Set REACT_APP_API_URL in .env file (recommended)
// Option 2: Replace the default URL below with your actual API endpoint
// 
// Examples:
// - Production domain: https://api.tsg-ai.com
// - AWS API Gateway: https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod
// - Local development: http://localhost:5000
//
// To find your AWS API Gateway URL, check the CloudFormation stack outputs
// or run: aws cloudformation describe-stacks --stack-name tsg-ai-main --query "Stacks[0].Outputs"
const API_URL = process.env.REACT_APP_API_URL || "https://api.tsg-ai.com";

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

