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
