import { verifySkillgenieUser, checkSkillgenieAccess } from "../models/skillgenieModel.js";
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

    // Check payment-based access: only 7999 (3 months) or 14999 (6 months) plans allowed
    const access = await checkSkillgenieAccess(skillgenieUser.id);

    if (!access?.allowed) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. A valid 3-month (₹7,999) or 6-month (₹14,999) subscription is required.",
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
        subscriptionMonths: access.months,
        subscriptionEndDate: access.endDate,
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

    // Re-check access on verify to ensure subscription is still valid
    const access = await checkSkillgenieAccess(decoded.skillgenieUserId);

    if (!access?.allowed) {
      return res.json({ valid: false });
    }

    res.json({
      valid: true,
      user: {
        email: decoded.email,
        subscriptionMonths: access.months,
        subscriptionEndDate: access.endDate,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.json({ valid: false });
  }
};
