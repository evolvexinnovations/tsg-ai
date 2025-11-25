import jwt from "jsonwebtoken";
import { getUserByEmail, hasValidSubscription } from "../models/userModel.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );

    const user = await getUserByEmail(decoded.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!hasValidSubscription(user)) {
      return res.status(403).json({
        success: false,
        message: "Valid subscription required (3 or 6 months)",
      });
    }

    req.user = {
      ...user,
      skillgenie_user_id: decoded.skillgenieUserId || user.skillgenie_user_id,
    };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};


