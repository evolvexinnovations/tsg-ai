import { pool } from "../db/connection.js";

// Get payment history for a user
export const getPaymentHistory = async (userId) => {
  try {
    // First, get the username from users table using the userId
    const usersTable = process.env.SKILLGENIE_USERS_TABLE || "users";
    const usersIdColumn = process.env.SKILLGENIE_ID_COLUMN || "id";
    const usersUsernameColumn = process.env.SKILLGENIE_USERNAME_COLUMN || "user_id";
    
    const userResult = await pool.query(
      `SELECT ${usersUsernameColumn} FROM ${usersTable} WHERE ${usersIdColumn} = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return [];
    }

    const username = userResult.rows[0][usersUsernameColumn];
    if (!username) {
      return [];
    }

    const payments = [];
    
    // Try to get payments from mock_interview_payments table
    const paymentsTable = process.env.SKILLGENIE_PAYMENTS_TABLE || "mock_interview_payments";
    const paymentsUserIdColumn = process.env.SKILLGENIE_PAYMENT_USER_ID_COLUMN || "user_id";
    
    try {
      const paymentResult = await pool.query(
        `SELECT 
          plan_name,
          status,
          start_date,
          end_date,
          created_at,
          amount,
          transaction_id,
          payment_method
         FROM ${paymentsTable}
         WHERE ${paymentsUserIdColumn} = $1
         ORDER BY created_at DESC`,
        [username]
      );

      paymentResult.rows.forEach(row => {
        payments.push({
          id: row.transaction_id || row.created_at,
          planName: row.plan_name || "Unknown Plan",
          amount: row.amount || null,
          status: row.status || "unknown",
          paymentDate: row.created_at,
          startDate: row.start_date,
          endDate: row.end_date,
          transactionId: row.transaction_id || null,
          paymentMethod: row.payment_method || null,
          source: "payments"
        });
      });
    } catch (err) {
      console.log("mock_interview_payments table not accessible:", err.message);
    }

    // Also try to get from subscriptions table
    const subscriptionsTable = process.env.SKILLGENIE_SUBSCRIPTIONS_TABLE || "subscriptions";
    const subUserIdColumn = process.env.SKILLGENIE_USER_ID_COLUMN || "user_id";
    
    try {
      const subResult = await pool.query(
        `SELECT 
          subscription_type,
          start_date,
          end_date,
          status,
          created_at,
          amount,
          transaction_id,
          payment_method
         FROM ${subscriptionsTable}
         WHERE ${subUserIdColumn} = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      subResult.rows.forEach(row => {
        payments.push({
          id: row.transaction_id || row.created_at,
          planName: row.subscription_type || "Unknown Subscription",
          amount: row.amount || null,
          status: row.status || "unknown",
          paymentDate: row.created_at,
          startDate: row.start_date,
          endDate: row.end_date,
          transactionId: row.transaction_id || null,
          paymentMethod: row.payment_method || null,
          source: "subscriptions"
        });
      });
    } catch (err) {
      console.log("subscriptions table not accessible:", err.message);
    }

    // Sort by payment date (most recent first)
    payments.sort((a, b) => {
      const dateA = new Date(a.paymentDate || 0);
      const dateB = new Date(b.paymentDate || 0);
      return dateB - dateA;
    });

    return payments;
  } catch (error) {
    console.error("Error getting payment history:", error);
    throw error;
  }
};

// Get current subscription details
export const getCurrentSubscription = async (userId) => {
  try {
    const usersTable = process.env.SKILLGENIE_USERS_TABLE || "users";
    const usersIdColumn = process.env.SKILLGENIE_ID_COLUMN || "id";
    const usersUsernameColumn = process.env.SKILLGENIE_USERNAME_COLUMN || "user_id";
    
    const userResult = await pool.query(
      `SELECT ${usersUsernameColumn} FROM ${usersTable} WHERE ${usersIdColumn} = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const username = userResult.rows[0][usersUsernameColumn];
    if (!username) {
      return null;
    }

    // Try payments table first
    const paymentsTable = process.env.SKILLGENIE_PAYMENTS_TABLE || "mock_interview_payments";
    const paymentsUserIdColumn = process.env.SKILLGENIE_PAYMENT_USER_ID_COLUMN || "user_id";
    
    try {
      const paymentResult = await pool.query(
        `SELECT 
          plan_name,
          status,
          start_date,
          end_date,
          created_at
         FROM ${paymentsTable}
         WHERE ${paymentsUserIdColumn} = $1
           AND LOWER(status) = 'success'
         ORDER BY created_at DESC
         LIMIT 1`,
        [username]
      );

      if (paymentResult.rows.length > 0) {
        const row = paymentResult.rows[0];
        const endDate = row.end_date ? new Date(row.end_date) : null;
        const now = new Date();
        
        if (!endDate || endDate > now) {
          return {
            planName: row.plan_name || "Unknown Plan",
            status: row.status || "active",
            startDate: row.start_date,
            endDate: row.end_date,
            isActive: true
          };
        }
      }
    } catch (err) {
      console.log("Error checking payments table:", err.message);
    }

    // Try subscriptions table
    const subscriptionsTable = process.env.SKILLGENIE_SUBSCRIPTIONS_TABLE || "subscriptions";
    const subUserIdColumn = process.env.SKILLGENIE_USER_ID_COLUMN || "user_id";
    
    try {
      const subResult = await pool.query(
        `SELECT 
          subscription_type,
          start_date,
          end_date,
          status
         FROM ${subscriptionsTable}
         WHERE ${subUserIdColumn} = $1
           AND LOWER(status) IN ('active', 'success', 'completed', 'paid')
         ORDER BY end_date DESC
         LIMIT 1`,
        [userId]
      );

      if (subResult.rows.length > 0) {
        const row = subResult.rows[0];
        const endDate = row.end_date ? new Date(row.end_date) : null;
        const now = new Date();
        
        if (!endDate || endDate > now) {
          return {
            planName: row.subscription_type || "Unknown Subscription",
            status: row.status || "active",
            startDate: row.start_date,
            endDate: row.end_date,
            isActive: true
          };
        }
      }
    } catch (err) {
      console.log("Error checking subscriptions table:", err.message);
    }

    return null;
  } catch (error) {
    console.error("Error getting current subscription:", error);
    throw error;
  }
};

