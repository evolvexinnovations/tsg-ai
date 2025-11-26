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
