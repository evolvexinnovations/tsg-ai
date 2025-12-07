import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "./components/sidebar";
import ChatWindow from "./components/chatwindow";
import ChatInput from "./components/chatinput";
import Header from "./components/header";
import Footer from "./components/footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import ThankYou from "./pages/ThankYou";
import { ChatContext } from "./context/chatcontext";

function MainApp() {
  const { messages, isProcessing, processingMessage } = useContext(ChatContext);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#000000",
        color: "white",
      }}
    >
      {/* 🧭 Simple Header */}
      <Header />

      {/* 🧩 Main layout */}
      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid #FFD700",
          }}
        >
          <ChatWindow messages={messages} />
          {isProcessing && (
            <Box
              sx={{
                textAlign: "center",
                py: 1,
                color: "#FFD700",
                fontStyle: "italic",
                fontSize: "0.9rem",
              }}
            >
              {processingMessage}
            </Box>
          )}
          <ChatInput />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
