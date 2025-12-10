import React from "react";
import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 1.5,
        px: 3,
        borderTop: "1px solid #FFD700",
        bgcolor: "#000000",
        color: "#FFD700",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "0.8rem",
      }}
    >
      <Typography variant="caption" sx={{ textAlign: "center" }}>
        All Rights Reserved by <strong>Evolve X Innovations</strong>
      </Typography>
    </Box>
  );
}


