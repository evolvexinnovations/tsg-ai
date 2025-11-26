// src/components/Header.jsx
import React from "react";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import ModelSelector from "./modelselector";
// Logo is in public folder for production builds
const logo = "/logo.png";

export default function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Small delay to ensure state is updated before navigation
    setTimeout(() => {
      navigate("/thank-you", { replace: true });
    }, 100);
  };

  return (
    <header
      style={{
        background: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)", // teal-blue gradient
        borderBottom: "1px solid #1b3b45",
        boxShadow: "0 1px 6px rgba(0, 255, 255, 0.08)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
      }}
    >
      {/* Dropdowns on the LEFT */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <ModelSelector />
      </Box>

      {/* Expanding space in the middle */}
      <Box sx={{ flex: 1 }} />

      {/* TSG AI and User Info on the RIGHT */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
        }}
      >
        {user && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "grey.400",
              fontSize: "0.875rem",
            }}
          >
            <span>{user.email}</span>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <img
            src={logo}
            alt="TSG AI"
            style={{
              height: "32px",
              width: "auto",
            }}
          />
        </Box>
        <Button
          onClick={handleLogout}
          variant="outlined"
          size="small"
          sx={{
            color: "#5eead4",
            borderColor: "#5eead4",
            "&:hover": {
              borderColor: "#2dd4bf",
              bgcolor: "rgba(94, 234, 212, 0.1)",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </header>
  );
}
