import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getPaymentHistoryController, getCurrentSubscriptionController } from "../controllers/subscriptionController.js";

const router = express.Router();

// All subscription routes require authentication
router.use(authenticate);

// Get payment history
router.get("/payment-history", getPaymentHistoryController);

// Get current subscription
router.get("/current", getCurrentSubscriptionController);

export default router;

