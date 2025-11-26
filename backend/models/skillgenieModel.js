import { pool } from "../db/connection.js";
import bcrypt from "bcryptjs";

// Query Skillgenie users table to verify credentials
export const verifySkillgenieUser = async (identifier, password) => {
  try {
    // Try common table names - adjust based on your actual Skillgenie database schema
    // Common table names: users, user, accounts, skillgenie_users
    const tableName = process.env.SKILLGENIE_USERS_TABLE || "users";
    
    // Default to Skillgenie database schema
    // Users table: id, email, user_id (username), password
    const emailColumn = process.env.SKILLGENIE_EMAIL_COLUMN || "email";
    const usernameColumn = process.env.SKILLGENIE_USERNAME_COLUMN || "user_id"; // user_id is username in Skillgenie
    const passwordColumn = process.env.SKILLGENIE_PASSWORD_COLUMN || "password";
    const idColumn = process.env.SKILLGENIE_ID_COLUMN || "id";
    
    const identifierValue = identifier?.trim()?.toLowerCase();
    
    if (!identifierValue) {
      return null;
    }

    const isEmail = identifierValue.includes("@");

    let query = "";
    let params = [identifierValue];

    if (isEmail || !usernameColumn) {
      query = `SELECT ${idColumn}, ${emailColumn}, ${passwordColumn}${
        usernameColumn ? `, ${usernameColumn}` : ""
      } FROM ${tableName} WHERE LOWER(${emailColumn}) = $1`;
    } else {
      query = `SELECT ${idColumn}, ${emailColumn}, ${passwordColumn}, ${usernameColumn}
        FROM ${tableName}
        WHERE LOWER(${usernameColumn}) = $1`;
    }
    
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      // If identifier was not email and we tried username but didn't find, fallback to email check
      if (!isEmail && usernameColumn) {
        const emailResult = await pool.query(
          `SELECT ${idColumn}, ${emailColumn}, ${passwordColumn}${
            usernameColumn ? `, ${usernameColumn}` : ""
          } FROM ${tableName} WHERE LOWER(${emailColumn}) = $1`,
          [identifierValue]
        );

        if (emailResult.rows.length === 0) {
          return null;
        }

        return await processSkillgenieUser(emailResult.rows[0], {
          emailColumn,
          passwordColumn,
          idColumn,
          usernameColumn,
        }, password);
      }

      return null;
    }

    return await processSkillgenieUser(result.rows[0], {
      emailColumn,
      passwordColumn,
      idColumn,
      usernameColumn,
    }, password);
  } catch (error) {
    console.error("Error verifying Skillgenie user:", error);
    return null;
  }
};

async function processSkillgenieUser(user, columns, password) {
  const { emailColumn, passwordColumn, idColumn, usernameColumn } = columns;
  const storedPassword = user[passwordColumn];
  
  if (!storedPassword) {
    return null;
  }

  // Verify password - try bcrypt first, then plain text comparison
  let passwordMatch = false;
  
  try {
    // Try bcrypt comparison (most common)
    passwordMatch = await bcrypt.compare(password, storedPassword);
  } catch (err) {
    // If bcrypt fails, try plain text comparison (not recommended but some systems use it)
    passwordMatch = password === storedPassword;
  }
  
  if (!passwordMatch) {
    return null;
  }

  return {
    id: user[idColumn],
    email: user[emailColumn],
    username: usernameColumn ? user[usernameColumn] : null,
  };
}

// Check latest successful payment to decide access
// Allowed: 7999 (3 months) or 14999 (6 months)
// Anything else (e.g. 2999 for 1 month) => access denied
export const checkSkillgenieAccess = async (userId) => {
  try {
    // 1) Get username from users table (Skillgenie DB)
    const usersTable = process.env.SKILLGENIE_USERS_TABLE || "users";
    const usersIdColumn = process.env.SKILLGENIE_ID_COLUMN || "id";
    const usersUsernameColumn = process.env.SKILLGENIE_USERNAME_COLUMN || "user_id";

    const userResult = await pool.query(
      `SELECT ${usersUsernameColumn} FROM ${usersTable} WHERE ${usersIdColumn} = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return { allowed: false, reason: "user_not_found" };
    }

    const username = userResult.rows[0][usersUsernameColumn];
    if (!username) {
      return { allowed: false, reason: "username_missing" };
    }

    // 2) Look up latest successful payment in payments table
    const paymentsTable = process.env.SKILLGENIE_PAYMENTS_TABLE || "mock_interview_payments";
    const paymentsUserIdColumn = process.env.SKILLGENIE_PAYMENT_USER_ID_COLUMN || "user_id";
    const amountColumn = process.env.SKILLGENIE_AMOUNT_COLUMN || "amount";
    const statusColumn = process.env.SKILLGENIE_STATUS_COLUMN || "status";
    const startDateColumn = process.env.SKILLGENIE_START_DATE_COLUMN || "start_date";
    const endDateColumn = process.env.SKILLGENIE_END_DATE_COLUMN || "end_date";
    const paymentDateColumn = process.env.SKILLGENIE_PAYMENT_DATE_COLUMN || "created_at";

    const paymentResult = await pool.query(
      `SELECT ${amountColumn}, ${statusColumn}, ${startDateColumn}, ${endDateColumn}, ${paymentDateColumn}
       FROM ${paymentsTable}
       WHERE ${paymentsUserIdColumn} = $1
         AND LOWER(${statusColumn}) = 'success'
       ORDER BY ${paymentDateColumn} DESC
       LIMIT 1`,
      [username]
    );

    if (paymentResult.rows.length === 0) {
      return { allowed: false, reason: "no_payments" };
    }

    const row = paymentResult.rows[0];

    const rawAmount = row[amountColumn];
    const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount || 0);

    let months = 0;
    if (amount === 7999) {
      months = 3;
    } else if (amount === 14999) {
      months = 6;
    } else {
      // Any other plan (e.g. 2999 for 1 month) is not allowed
      return { allowed: false, reason: "unsupported_plan" };
    }

    // 3) Work out validity window
    let startDate =
      row[startDateColumn] ? new Date(row[startDateColumn]) : new Date(row[paymentDateColumn]);

    let endDate = row[endDateColumn] ? new Date(row[endDateColumn]) : null;
    if (!endDate) {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months);
    }

    const now = new Date();
    if (endDate <= now) {
      return { allowed: false, reason: "expired" };
    }

    return {
      allowed: true,
      months,
      startDate,
      endDate,
      amount,
    };
  } catch (error) {
    console.error("Error checking Skillgenie access:", error);
    return { allowed: false, reason: "error" };
  }
};
