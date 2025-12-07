import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { pool } from "./db/connection.js";
import { createSessionsTable } from "./models/sessionModel.js";
import { createUsersTable } from "./models/userModel.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connection OK");
    
    // Initialize database tables
    await createUsersTable();
    await createSessionsTable();
    
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
      console.warn("⚠️  WARNING: OPENAI_API_KEY is not configured!");
      console.warn("   Chat functionality will not work until you set OPENAI_API_KEY in your .env file");
    } else {
      console.log("✅ OpenAI API key configured");
    }
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
  console.log(`🚀 Corporate AI backend running on port ${PORT}`);
});
