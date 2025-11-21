// function/AuthRoute/app.js

import express from "express";
import serverless from "serverless-http";
import { login, verifyToken } from "../../controllers/authController.js"; 
// adjust path if needed

const app = express();
app.use(express.json());

// Routes
app.post("/login", login);
app.get("/verify", verifyToken);

// Export Lambda-compatible handler
export const handler = serverless(app);
