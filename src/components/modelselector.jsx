// src/components/ModelSelector.jsx
import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import { MoreVert, SmartToy } from "@mui/icons-material";

export default function ModelSelector() {
  const [selected, setSelected] = useState("TSG Model v1");
  const [anchorEl, setAnchorEl] = useState(null);

  const models = [
    { name: "TSG Model v1", icon: "⚡", desc: "Fast & affordable" },
    { name: "TSG Model v2", icon: "🚀", desc: "Most powerful" },
    { name: "TSG Model Pro", icon: "🧠", desc: "Creative responses" },
    { name: "TSG Model Plus", icon: "✨", desc: "Advanced AI" },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (modelName) => {
    setSelected(modelName);
    handleClose();
  };

  return (
    <Box>
      <Button
        onClick={handleClick}
        sx={{
          color: "white",
          textTransform: "none",
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "rgba(255,255,255,0.1)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
          borderRadius: 2,
          px: 2,
          py: 1,
        }}
        startIcon={<SmartToy sx={{ color: "#b366ff" }} />}
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
        {models.map((model) => (
          <MenuItem
            key={model.name}
            onClick={() => handleSelect(model.name)}
            selected={selected === model.name}
            sx={{
              bgcolor: selected === model.name ? "rgba(179, 102, 255, 0.2)" : "transparent",
              "&:hover": { bgcolor: "rgba(179, 102, 255, 0.15)" },
              py: 1.5,
            }}
          >
            <ListItemIcon sx={{ color: "#b366ff", minWidth: 0, mr: 1.5 }}>
              <span style={{ fontSize: "18px" }}>{model.icon}</span>
            </ListItemIcon>
            <ListItemText
              primary={model.name}
              secondary={model.desc}
              primaryTypographyProps={{ sx: { fontSize: "14px", fontWeight: 500 } }}
              secondaryTypographyProps={{ sx: { fontSize: "12px", color: "#888" } }}
            />
            {selected === model.name && (
              <span style={{ marginLeft: "10px", color: "#4ade80", fontWeight: "bold" }}>✓</span>
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
