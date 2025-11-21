import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../config/axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          // Verify token with backend
          const response = await axiosInstance.get("/api/auth/verify");
          if (response.data.valid) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("authToken");
          }
        }
      } catch (error) {
        localStorage.removeItem("authToken");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      console.log("Attempting login with:", identifier);
      const response = await axiosInstance.post("/api/auth/login", { identifier, password });
      console.log("Login response:", response.data);

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("authToken", token);
        setUser(user);
        setIsAuthenticated(true);
        console.log("Login successful, user:", user);
        return user;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error details:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please check your credentials.";
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

