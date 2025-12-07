import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "./context/chatcontext";
import { AuthProvider } from "./context/authContext";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#000000", paper: "#1a1a1a" },
    primary: { main: "#FFD700" }, // Gold
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
