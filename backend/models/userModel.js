import { pool } from "../db/connection.js";

// Create users table if it doesn't exist
export const createUsersTable = async () => {
  try {
    // Create table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        skillgenie_user_id VARCHAR(255),
        subscription_type VARCHAR(50),
        subscription_start_date TIMESTAMP,
        subscription_end_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add skillgenie_user_id column if it doesn't exist (for existing tables)
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS skillgenie_user_id VARCHAR(255)
      `);
    } catch (err) {
      // Column might already exist, ignore error
      console.log("skillgenie_user_id column check:", err.message);
    }
    
    // Add other columns if they don't exist
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(50),
        ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
        ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
    } catch (err) {
      // Columns might already exist, ignore error
      console.log("Other columns check:", err.message);
    }
    
    console.log("✅ Users table ready");
  } catch (error) {
    console.error("❌ Error creating users table:", error);
  }
};

// Get user by email
export const getUserByEmail = async (email) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
};

// Get user by Skillgenie user ID
export const getUserBySkillgenieId = async (skillgenieUserId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE skillgenie_user_id = $1",
      [skillgenieUserId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error getting user by Skillgenie ID:", error);
    throw error;
  }
};

// Create or update user
export const upsertUser = async (userData) => {
  try {
    const {
      email,
      skillgenie_user_id,
      subscription_type,
      subscription_start_date,
      subscription_end_date,
      is_active = true,
    } = userData;

    const result = await pool.query(
      `INSERT INTO users (email, skillgenie_user_id, subscription_type, subscription_start_date, subscription_end_date, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (email) 
       DO UPDATE SET 
         skillgenie_user_id = EXCLUDED.skillgenie_user_id,
         subscription_type = EXCLUDED.subscription_type,
         subscription_start_date = EXCLUDED.subscription_start_date,
         subscription_end_date = EXCLUDED.subscription_end_date,
         is_active = EXCLUDED.is_active,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        email,
        skillgenie_user_id,
        subscription_type,
        subscription_start_date,
        subscription_end_date,
        is_active,
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
};

// Check if user has valid subscription
export const hasValidSubscription = (user) => {
  if (!user || !user.is_active) return false;
  if (!user.subscription_type) return false;

  // Check if subscription type is 3 or 6 months
  const validTypes = ["3months", "6months", "3_months", "6_months"];
  if (!validTypes.includes(user.subscription_type.toLowerCase())) {
    return false;
  }

  // Check if subscription is still valid (not expired)
  if (user.subscription_end_date) {
    const endDate = new Date(user.subscription_end_date);
    const now = new Date();
    return endDate > now;
  }

  return true;
};

