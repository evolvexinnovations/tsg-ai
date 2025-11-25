// function/SubscriptionRoute/app.js

import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import { authenticate } from "../../middleware/authMiddleware.js";
import { getPaymentHistoryController, getCurrentSubscriptionController } from "../../controllers/subscriptionController.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// All subscription routes require authentication
app.use(authenticate);

// Routes
app.get("/payment-history", getPaymentHistoryController);
app.get("/current", getCurrentSubscriptionController);

// Export Lambda-compatible handler
export const handler = serverless(app);

