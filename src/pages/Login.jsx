import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useAuth } from "../context/authContext";
// Logo is in public folder for production builds
const logo = "/logogold.png";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(identifier, password);
      console.log("Login successful, user:", user);
      // Navigation will happen via useEffect when isAuthenticated becomes true
      // But also navigate directly as backup
      if (user) {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.900",
        }}
      >
        <CircularProgress sx={{ color: "#FFD700" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#000000",
        backgroundImage:
          // Soft gold light + vignette + login illustration
          "radial-gradient(circle at top left, rgba(255,215,0,0.25), transparent 55%)," +
          "radial-gradient(circle at bottom right, rgba(255,165,0,0.18), transparent 55%)," +
          "linear-gradient(135deg, #000000 0%, #050505 40%, #1a1a1a 70%, #000000 100%)," +
          "url('/login.png')",
        backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
        backgroundSize: "800px auto, 700px auto, cover, contain",
        backgroundPosition:
          "top left, bottom right, center center, right 8% center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            bgcolor: "rgba(10,10,10,0.96)",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "#FFD700",
            boxShadow: "0 0 25px rgba(255,215,0,0.18)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <img
                src={logo}
                alt="TSG AI"
                style={{
                  height: "60px",
                  width: "auto",
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "grey.400" }}>
              Sign in with your Skillgenie email or username
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              sx={{ mb: 2 }}
              autoComplete="username"
              InputProps={{
                sx: { color: "white" },
              }}
              InputLabelProps={{
                sx: { color: "grey.400" },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              autoComplete="current-password"
              InputProps={{
                sx: { color: "white" },
              }}
              InputLabelProps={{
                sx: { color: "grey.400" },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: "#FFD700",
                color: "#000000",
                fontWeight: 600,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#FFA500",
                },
                "&:disabled": {
                  bgcolor: "grey.700",
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "grey.500" }}>
              Use your Skillgenie credentials to access TSG AI.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

