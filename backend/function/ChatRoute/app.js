// function/ChatRoute/app.js

import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import chatRoutes from "../../routes/chatRoutes.js";

const app = express();

// CORS - allow CloudFront origin (and adjust if needed)
app.use(
  cors({
    origin: "https://d39vxhtnjx9d1n.cloudfront.net",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));

// Chat routes (includes authentication middleware)
app.use("/", chatRoutes);

// Export Lambda-compatible handler
export const handler = serverless(app);

