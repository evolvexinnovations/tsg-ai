import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import { pool } from "./db/connection.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connection OK");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
  console.log(`🚀 Corporate AI backend running on port ${PORT}`);
});
