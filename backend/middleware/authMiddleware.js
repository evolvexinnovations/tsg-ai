import jwt from "jsonwebtoken";
import { getUserByEmail } from "../models/userModel.js";
import { checkSkillgenieAccess } from "../models/skillgenieModel.js";

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

    // Check if subscription/access is still valid (30/45 days not expired)
    const skillgenieUserId = decoded.skillgenieUserId || user.skillgenie_user_id;
    if (skillgenieUserId) {
      const access = await checkSkillgenieAccess(skillgenieUserId);
      if (!access?.allowed) {
        return res.status(403).json({
          success: false,
          message: access?.reason === "expired" 
            ? "Your subscription has expired. Please renew your subscription to continue using TSG AI."
            : "Access denied. A valid subscription is required.",
        });
      }
    }

    req.user = {
      ...user,
      skillgenie_user_id: skillgenieUserId,
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


