import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Schedule,
  Payment,
} from "@mui/icons-material";
import axiosInstance from "../config/axios";
import { useAuth } from "../context/authContext";

export default function Subscriptions() {
  const { user } = useAuth();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [historyResponse, subscriptionResponse] = await Promise.all([
        axiosInstance.get("/api/subscriptions/payment-history"),
        axiosInstance.get("/api/subscriptions/current"),
      ]);

      if (historyResponse.data.success) {
        setPaymentHistory(historyResponse.data.paymentHistory || []);
      }

      if (subscriptionResponse.data.success) {
        setCurrentSubscription(subscriptionResponse.data.subscription);
      }
    } catch (err) {
      console.error("Error fetching subscription data:", err);
      setError(
        err.response?.data?.error ||
          "Failed to load subscription information. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const lowerStatus = (status || "").toLowerCase();
    if (lowerStatus === "success" || lowerStatus === "active" || lowerStatus === "paid" || lowerStatus === "completed") {
      return "success";
    }
    if (lowerStatus === "pending") {
      return "warning";
    }
    if (lowerStatus === "failed" || lowerStatus === "cancelled") {
      return "error";
    }
    return "default";
  };

  const getStatusIcon = (status) => {
    const lowerStatus = (status || "").toLowerCase();
    if (lowerStatus === "success" || lowerStatus === "active" || lowerStatus === "paid" || lowerStatus === "completed") {
      return <CheckCircle fontSize="small" />;
    }
    if (lowerStatus === "pending") {
      return <Schedule fontSize="small" />;
    }
    return <Cancel fontSize="small" />;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          color: "#FFD700",
          fontWeight: 700,
          mb: 4,
        }}
      >
        My Subscriptions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Current Subscription Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
              border: "1px solid #FFD700",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#FFD700", mb: 2 }}
              >
                Current Subscription
              </Typography>
              {currentSubscription ? (
                <Box>
                  <Typography variant="body1" sx={{ color: "#e5e7eb", mb: 1 }}>
                    <strong>Plan:</strong> {currentSubscription.planName}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#e5e7eb", mb: 1 }}>
                    <strong>Status:</strong>{" "}
                    <Chip
                      icon={getStatusIcon(currentSubscription.status)}
                      label={currentSubscription.status || "Active"}
                      color={getStatusColor(currentSubscription.status)}
                      size="small"
                    />
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#e5e7eb", mb: 1 }}>
                    <strong>Start Date:</strong>{" "}
                    {formatDate(currentSubscription.startDate)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#e5e7eb" }}>
                    <strong>End Date:</strong>{" "}
                    {formatDate(currentSubscription.endDate)}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                  No active subscription found.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment History */}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          color: "#FFD700",
          fontWeight: 600,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Payment />
        Payment History
      </Typography>

      {paymentHistory.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            background: "#1a1a1a",
            border: "1px solid #FFD700",
          }}
        >
          <Typography variant="body1" sx={{ color: "#9ca3af" }}>
            No payment history found.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            background: "#1a1a1a",
            border: "1px solid #FFD700",
            maxHeight: "600px",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#FFD700", fontWeight: 600 }}>
                  Date
                </TableCell>
                <TableCell sx={{ color: "#FFD700", fontWeight: 600 }}>
                  Plan
                </TableCell>
                <TableCell sx={{ color: "#FFD700", fontWeight: 600 }}>
                  Amount
                </TableCell>
                <TableCell sx={{ color: "#FFD700", fontWeight: 600 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "#FFD700", fontWeight: 600 }}>
                  Start Date
                </TableCell>
                <TableCell sx={{ color: "#FFD700", fontWeight: 600 }}>
                  End Date
                </TableCell>
                <TableCell sx={{ color: "#FFD700", fontWeight: 600 }}>
                  Transaction ID
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentHistory.map((payment, index) => (
                <TableRow
                  key={payment.id || index}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(255, 215, 0, 0.1)",
                    },
                  }}
                >
                  <TableCell sx={{ color: "#e5e7eb" }}>
                    {formatDate(payment.paymentDate)}
                  </TableCell>
                  <TableCell sx={{ color: "#e5e7eb" }}>
                    {payment.planName}
                  </TableCell>
                  <TableCell sx={{ color: "#e5e7eb" }}>
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(payment.status)}
                      label={payment.status || "Unknown"}
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#e5e7eb" }}>
                    {formatDate(payment.startDate)}
                  </TableCell>
                  <TableCell sx={{ color: "#e5e7eb" }}>
                    {formatDate(payment.endDate)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#9ca3af",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                    }}
                  >
                    {payment.transactionId || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

