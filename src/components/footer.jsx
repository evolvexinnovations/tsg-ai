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
        borderTop: "1px solid #333",
        bgcolor: "rgba(15,23,42,0.95)",
        color: "rgba(148,163,184,0.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "0.8rem",
      }}
    >
      <Typography variant="caption" sx={{ textAlign: "center" }}>
        Powered By <strong>Evolve X Innovations</strong> &copy; All Rights Reserved
      </Typography>
    </Box>
  );
}


