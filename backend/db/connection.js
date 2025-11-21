// backend/db/connection.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false } // ✅ needed for RDS
      : false,
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL (RDS)"))
  .catch((err) => console.error("❌ Database connection error:", err));
