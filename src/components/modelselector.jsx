// src/components/ModelSelector.jsx
import React, { useContext, useMemo } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import { SmartToy } from "@mui/icons-material";
import { ChatContext } from "../context/chatcontext.jsx";

const MODEL_META = [
  {
    name: "TSG Model v1",
    icon: "⚡",
    desc: "Uses ChatGPT 3.5 Turbo",
  },
  {
    name: "TSG Plus",
    icon: "✨",
    desc: "Powered by GPT-4o Mini",
  },
  {
    name: "TSG Pro",
    icon: "🧠",
    desc: "Full GPT-4 performance",
  },
];

export default function ModelSelector() {
  const { selectedModel, setSelectedModel } = useContext(ChatContext);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const models = useMemo(() => MODEL_META, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (modelName) => {
    setSelectedModel(modelName);
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
        <span style={{ fontSize: "14px" }}>{selectedModel}</span>
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
            selected={selectedModel === model.name}
            sx={{
              bgcolor:
                selectedModel === model.name ? "rgba(179, 102, 255, 0.2)" : "transparent",
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
            {selectedModel === model.name && (
              <span style={{ marginLeft: "10px", color: "#4ade80", fontWeight: "bold" }}>✓</span>
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
