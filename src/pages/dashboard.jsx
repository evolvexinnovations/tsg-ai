// src/pages/Dashboard.jsx
import React, { useContext } from "react";
import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import ChatWindow from "../components/chatwindow";
import ChatInput from "../components/chatinput";
import Sidebar from "../components/sidebar";
import { ChatContext } from "../context/chatcontext";
import ModelSelector from "../components/modelselector";

export default function Dashboard() {
  const { messages, currentChat } = useContext(ChatContext);

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "grey.900" }}>
      {/* Sidebar with Chat History and Project Management */}
      <Sidebar />

      {/* Main Chat Area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="static"
          elevation={1}
          sx={{
            bgcolor: "grey.800",
            borderBottom: "1px solid",
            borderColor: "grey.700",
            zIndex: 1000,
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: "64px",
              px: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: "bold",
                flex: 1,
              }}
            >
              💬 Chat Workspace
            </Typography>
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
          </Toolbar>
        </AppBar>

        {/* Chat Window */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            bgcolor: "grey.900",
            p: 3,
            color: "white",
          }}
        >
          <ChatWindow messages={messages} />
        </Box>

        {/* Chat Input */}
        <ChatInput />
      </Box>
    </Box>
  );
}
