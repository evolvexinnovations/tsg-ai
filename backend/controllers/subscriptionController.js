import { getPaymentHistory, getCurrentSubscription } from "../models/paymentModel.js";

// Get payment history for authenticated user
export const getPaymentHistoryController = async (req, res) => {
  try {
    // Use skillgenie_user_id from token (which is the UUID from Skillgenie database)
    const userId = req.user?.skillgenie_user_id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const paymentHistory = await getPaymentHistory(userId);
    
    res.json({
      success: true,
      paymentHistory
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

// Get current subscription details
export const getCurrentSubscriptionController = async (req, res) => {
  try {
    // Use skillgenie_user_id from token (which is the UUID from Skillgenie database)
    const userId = req.user?.skillgenie_user_id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const subscription = await getCurrentSubscription(userId);
    
    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error("Error fetching current subscription:", error);
    res.status(500).json({ error: "Failed to fetch subscription details" });
  }
};

