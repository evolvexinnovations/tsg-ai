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
        <CircularProgress sx={{ color: "#5eead4" }} />
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
        bgcolor: "grey.900",
        background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            bgcolor: "grey.800",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.700",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                color: "#5eead4",
                fontWeight: 700,
                mb: 1,
                textShadow: "0 0 8px rgba(94, 234, 212, 0.4)",
              }}
            >
              TSG AI
            </Typography>
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
                bgcolor: "#5eead4",
                color: "#0f2027",
                fontWeight: 600,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#2dd4bf",
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

