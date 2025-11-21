import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function ThankYou() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If still authenticated, redirect to home (shouldn't happen, but safety check)
    if (isAuthenticated) {
      navigate("/");
      return;
    }

    // Auto-redirect to login after 5 seconds
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

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
            p: 6,
            bgcolor: "grey.800",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.700",
            textAlign: "center",
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: "#5eead4",
              mb: 3,
            }}
          />

          <Typography
            variant="h4"
            sx={{
              color: "#5eead4",
              fontWeight: 700,
              mb: 2,
              textShadow: "0 0 8px rgba(94, 234, 212, 0.4)",
            }}
          >
            Thank You!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "grey.300",
              mb: 4,
              fontSize: "1.1rem",
            }}
          >
            You have been successfully logged out.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "grey.500",
              mb: 4,
            }}
          >
            Redirecting to login page in 5 seconds...
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{
              bgcolor: "#5eead4",
              color: "#0f2027",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              "&:hover": {
                bgcolor: "#2dd4bf",
              },
            }}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

