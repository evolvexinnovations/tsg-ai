// function/AuthRoute/app.js

import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import { login, verifyToken } from "../../controllers/authController.js";

const app = express();

// CORS - allow CloudFront origin (and adjust if needed)
app.use(
  cors({
    origin: "https://d39vxhtnjx9d1n.cloudfront.net",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Routes
app.options("/login", cors()); // handle preflight for /login
app.options("/auth/login", cors()); // handle preflight for /auth/login if hit directly
app.post("/login", login);
app.get("/verify", verifyToken);

// Export Lambda-compatible handler
export const handler = serverless(app);
