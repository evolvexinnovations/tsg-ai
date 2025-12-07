import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Box, CircularProgress } from "@mui/material";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "grey.900",
        }}
      >
        <CircularProgress sx={{ color: "#FFD700" }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


