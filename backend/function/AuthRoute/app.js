// function/AuthRoute/app.js

import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import { login, verifyToken } from "../../controllers/authController.js";

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

app.use(express.json());

// Routes
app.options("/login", cors()); // handle preflight for /login
app.options("/auth/login", cors()); // handle preflight for /auth/login
app.options("/auth/verify", cors()); // handle preflight for /auth/verify

// Support both /login and /auth/login for compatibility with API mappings
app.post("/login", login);
app.post("/auth/login", login);

// Support both /verify and /auth/verify
app.get("/verify", verifyToken);
app.get("/auth/verify", verifyToken);

// Export Lambda-compatible handler
export const handler = serverless(app);
