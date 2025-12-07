import { pool } from "../db/connection.js";
import crypto from "crypto";

// Create sessions table if it doesn't exist
export const createSessionsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        skillgenie_user_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true
      )
    `);
    
    // Create indexes if they don't exist (PostgreSQL uses CREATE INDEX IF NOT EXISTS)
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_session_id ON sessions(session_id)
      `);
    } catch (err) {
      console.log("Index creation check:", err.message);
    }
    
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_skillgenie_user_id ON sessions(skillgenie_user_id)
      `);
    } catch (err) {
      console.log("Index creation check:", err.message);
    }
    
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_email ON sessions(email)
      `);
    } catch (err) {
      console.log("Index creation check:", err.message);
    }
    
    console.log("✅ Sessions table ready");
  } catch (error) {
    console.error("❌ Error creating sessions table:", error);
  }
};

// Generate a unique session ID
export const generateSessionId = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Create a new session
export const createSession = async (skillgenieUserId, email, expiresInDays = 7) => {
  try {
    const sessionId = generateSessionId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const result = await pool.query(
      `INSERT INTO sessions (session_id, skillgenie_user_id, email, expires_at, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [sessionId, skillgenieUserId.toString(), email.toLowerCase(), expiresAt]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};

// Invalidate all existing sessions for a user
export const invalidateUserSessions = async (skillgenieUserId) => {
  try {
    const result = await pool.query(
      `UPDATE sessions 
       SET is_active = false 
       WHERE skillgenie_user_id = $1 AND is_active = true`,
      [skillgenieUserId.toString()]
    );
    return result.rowCount;
  } catch (error) {
    console.error("Error invalidating user sessions:", error);
    throw error;
  }
};

// Get session by session ID
export const getSessionById = async (sessionId) => {
  try {
    const result = await pool.query(
      `SELECT * FROM sessions 
       WHERE session_id = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP`,
      [sessionId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error getting session by ID:", error);
    throw error;
  }
};

// Delete a specific session
export const deleteSession = async (sessionId) => {
  try {
    const result = await pool.query(
      `DELETE FROM sessions WHERE session_id = $1`,
      [sessionId]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};

// Clean up expired sessions (can be called periodically)
export const cleanupExpiredSessions = async () => {
  try {
    const result = await pool.query(
      `DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP OR is_active = false`
    );
    return result.rowCount;
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    throw error;
  }
};

