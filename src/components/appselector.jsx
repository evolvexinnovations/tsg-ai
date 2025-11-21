// src/components/AppSelector.jsx
import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import { Apps } from "@mui/icons-material";

export default function AppSelector() {
  const [selected, setSelected] = useState("TSG v1");
  const [anchorEl, setAnchorEl] = useState(null);

  const apps = [
    { name: "TSG v1", icon: "🤖", desc: "TSG AI Version 1" },
    { name: "TSG v2", icon: "🧠", desc: "TSG AI Version 2" },
    { name: "TSG v3", icon: "✨", desc: "TSG AI Version 3" },
    { name: "TSG Pro", icon: "🚀", desc: "TSG AI Professional" },
    { name: "TSG Lite", icon: "🔍", desc: "TSG AI Lightweight" },
    { name: "TSG Plus", icon: "🦙", desc: "TSG AI Plus Edition" },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (appName) => {
    setSelected(appName);
    handleClose();
  };

  return (
    <Box sx={{ mr: 1 }}>
      <Button
        onClick={handleClick}
        sx={{
          color: "white",
          textTransform: "none",
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "rgba(255,255,255,0.08)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
          borderRadius: 2,
          px: 2,
          py: 1,
        }}
        startIcon={<Apps sx={{ color: "#14b8a6" }} />}
      >
        <span style={{ fontSize: "14px" }}>{selected}</span>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          "& .MuiPaper-root": {
            bgcolor: "#1a1a1a",
            color: "white",
            borderRadius: "8px",
            border: "1px solid #333",
          },
        }}
      >
        {apps.map((app) => (
          <MenuItem
            key={app.name}
            onClick={() => handleSelect(app.name)}
            selected={selected === app.name}
            sx={{
              bgcolor: selected === app.name ? "rgba(20, 184, 166, 0.2)" : "transparent",
              "&:hover": { bgcolor: "rgba(20, 184, 166, 0.15)" },
              py: 1.5,
            }}
          >
            <ListItemIcon sx={{ color: "#14b8a6", minWidth: 0, mr: 1.5 }}>
              <span style={{ fontSize: "18px" }}>{app.icon}</span>
            </ListItemIcon>
            <ListItemText
              primary={app.name}
              secondary={app.desc}
              primaryTypographyProps={{ sx: { fontSize: "14px", fontWeight: 500 } }}
              secondaryTypographyProps={{ sx: { fontSize: "12px", color: "#888" } }}
            />
            {selected === app.name && (
              <span style={{ marginLeft: "10px", color: "#4ade80", fontWeight: "bold" }}>✓</span>
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}



