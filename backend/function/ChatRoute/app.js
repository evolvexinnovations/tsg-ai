// function/ChatRoute/app.js

import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import chatRoutes from "../../routes/chatRoutes.js";

const app = express();

// CORS - allow both frontend domain and CloudFront origin
const allowedOrigins = [
  "https://www.tsg-ai.com",
  "https://d39vxhtnjx9d1n.cloudfront.net",
  "http://localhost:3000", // For local development
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log unexpected origin but allow it (API Gateway CORS also allows *)
        console.warn(`Unexpected origin: ${origin}`);
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// Middleware to strip /api/chat prefix if present (API Gateway passes full path)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/chat")) {
    req.url = req.url.replace("/api/chat", "") || "/";
  }
  next();
});

// Chat routes (includes authentication middleware)
app.use("/", chatRoutes);

// Export Lambda-compatible handler
export const handler = serverless(app);

