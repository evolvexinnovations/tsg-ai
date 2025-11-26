import { verifySkillgenieUser } from "../models/skillgenieModel.js";
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

    res.json({
      valid: true,
      user: {
        email: decoded.email,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.json({ valid: false });
  }
};
