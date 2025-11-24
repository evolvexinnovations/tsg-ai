import { verifySkillgenieUser, checkSkillgenieSubscription } from "../models/skillgenieModel.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required",
      });
    }

    const skillgenieUser = await verifySkillgenieUser(identifier, password);

    if (!skillgenieUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("Checking subscription for user ID:", skillgenieUser.id);
    const subscription = await checkSkillgenieSubscription(skillgenieUser.id);

    if (!subscription) {
      console.log("No valid subscription found for user:", skillgenieUser.id);
      return res.status(403).json({
        success: false,
        message: "Access denied. A valid 3-month or 6-month subscription is required.",
      });
    }

    const now = new Date();
    const endDate = subscription.end_date ? new Date(subscription.end_date) : null;

    if (endDate && endDate <= now) {
      return res.status(403).json({
        success: false,
        message: "Your subscription has expired. Please renew to continue.",
      });
    }

    const normalizedEmail = (skillgenieUser.email || identifier || "").toLowerCase();

    if (!normalizedEmail) {
      return res.status(500).json({
        success: false,
        message: "Skillgenie user is missing an email address.",
      });
    }

    const token = jwt.sign(
      {
        email: normalizedEmail,
        skillgenieUserId: skillgenieUser.id.toString(),
        username: skillgenieUser.username || null,
      },
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        email: normalizedEmail,
        subscriptionType: subscription.type,
        subscriptionEndDate: endDate,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.json({ valid: false });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );

    const subscription = await checkSkillgenieSubscription(decoded.skillgenieUserId);

    if (!subscription) {
      return res.json({ valid: false });
    }

    const now = new Date();
    const endDate = subscription.end_date ? new Date(subscription.end_date) : null;

    if (endDate && endDate <= now) {
      return res.json({ valid: false });
    }

    res.json({
      valid: true,
      user: {
        email: decoded.email,
        subscriptionType: subscription.type,
        subscriptionEndDate: subscription.end_date,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.json({ valid: false });
  }
};
