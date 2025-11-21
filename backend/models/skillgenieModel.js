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

// Get user's subscription from mock_interview_payments or subscriptions table
export const checkSkillgenieSubscription = async (userId) => {
  try {
    console.log("checkSkillgenieSubscription called with userId:", userId);
    // First, get the user_id (username) from users table using the UUID
    const usersTable = process.env.SKILLGENIE_USERS_TABLE || "users";
    const usersIdColumn = process.env.SKILLGENIE_ID_COLUMN || "id";
    const usersUsernameColumn = process.env.SKILLGENIE_USERNAME_COLUMN || "user_id";
    
    // Get username from users table
    console.log(`Querying ${usersTable} for userId: ${userId}`);
    const userResult = await pool.query(
      `SELECT ${usersUsernameColumn} FROM ${usersTable} WHERE ${usersIdColumn} = $1`,
      [userId]
    );

    console.log(`User query result: ${userResult.rows.length} rows`);
    
    if (userResult.rows.length === 0) {
      console.log("No user found with userId:", userId);
      return null;
    }

    const username = userResult.rows[0][usersUsernameColumn];
    console.log("Found username:", username);
    
    if (!username) {
      console.log("Username is null or undefined");
      return null;
    }

    // Try mock_interview_payments table first (default)
    const paymentsTable = process.env.SKILLGENIE_PAYMENTS_TABLE || "mock_interview_payments";
    const paymentsUserIdColumn = process.env.SKILLGENIE_PAYMENT_USER_ID_COLUMN || "user_id";
    const planNameColumn = process.env.SKILLGENIE_PLAN_NAME_COLUMN || "plan_name";
    const statusColumn = process.env.SKILLGENIE_STATUS_COLUMN || "status";
    const paymentDateColumn = process.env.SKILLGENIE_PAYMENT_DATE_COLUMN || "created_at";
    
    // Subscription table columns (for fallback) - define these here so they're available later
    const subscriptionsTable = process.env.SKILLGENIE_SUBSCRIPTIONS_TABLE || "subscriptions";
    const subUserIdColumn = process.env.SKILLGENIE_USER_ID_COLUMN || "user_id";
    const planTypeColumn = process.env.SKILLGENIE_PLAN_TYPE_COLUMN || "subscription_type";
    const startDateColumn = process.env.SKILLGENIE_START_DATE_COLUMN || "start_date";
    const endDateColumn = process.env.SKILLGENIE_END_DATE_COLUMN || "end_date";

    let subscription = null;
    let isFromPayments = false;

    // Check mock_interview_payments table
    // This table has: plan_name, status, start_date, end_date, created_at
    try {
      console.log(`Querying ${paymentsTable} for username: ${username}`);
      const paymentResult = await pool.query(
        `SELECT ${planNameColumn}, ${statusColumn}, ${paymentDateColumn}, start_date, end_date
         FROM ${paymentsTable}
         WHERE ${paymentsUserIdColumn} = $1
         AND LOWER(${statusColumn}) = 'success'
         ORDER BY ${paymentDateColumn} DESC
         LIMIT 1`,
        [username]
      );
      
      console.log(`Payment query executed, found ${paymentResult.rows.length} rows`);

      console.log(`Checking payments for user: ${username}, found ${paymentResult.rows.length} records`);
      
      if (paymentResult.rows.length > 0) {
        subscription = paymentResult.rows[0];
        isFromPayments = true;
        console.log("Payment record found:", {
          planName: subscription[planNameColumn] || subscription.plan_name,
          status: subscription[statusColumn] || subscription.status,
          startDate: subscription.start_date,
          endDate: subscription.end_date,
          date: subscription[paymentDateColumn] || subscription.created_at,
          allKeys: Object.keys(subscription)
        });
      }
    } catch (err) {
      console.error("Error checking mock_interview_payments:", err.message);
      console.log("mock_interview_payments table not found, checking subscriptions table...");
    }

    // Fallback to subscriptions table if mock_interview_payments doesn't exist or has no data
    if (!subscription) {
      try {
        const subResult = await pool.query(
          `SELECT ${planTypeColumn}, ${startDateColumn}, ${endDateColumn}, ${statusColumn}
           FROM ${subscriptionsTable}
           WHERE ${subUserIdColumn} = $1
           AND LOWER(${statusColumn}) IN ('active', 'success', 'completed', 'paid')
           ORDER BY ${endDateColumn} DESC
           LIMIT 1`,
          [userId]
        );

        if (subResult.rows.length > 0) {
          subscription = subResult.rows[0];
          isFromPayments = false;
          console.log("Subscription record found from subscriptions table:", {
            planType: subscription[planTypeColumn],
            status: subscription[statusColumn]
          });
        }
      } catch (err) {
        console.error("Error checking subscriptions table:", err.message);
        console.log("Subscriptions table not found or error occurred");
      }
    }

    if (!subscription) {
      return null;
    }

    // Determine plan type from subscription data
    // For mock_interview_payments: check plan_name (e.g., "Standard (Quarterly)" = 3 months)
    // For subscriptions: check subscription_type
    let planName = "";
    try {
      if (isFromPayments) {
        // Try multiple ways to access the plan name
        planName = subscription[planNameColumn] || 
                   subscription.plan_name || 
                   (subscription[planNameColumn.toLowerCase()]) ||
                   "";
      } else {
        planName = subscription[planTypeColumn] || 
                   subscription.subscription_type || 
                   (subscription[planTypeColumn.toLowerCase()]) ||
                   "";
      }
      console.log("Extracted plan name:", planName);
    } catch (err) {
      console.error("Error accessing plan name:", err);
      planName = "";
    }
    
    const planType = (planName || "").toLowerCase();
    
    console.log("Checking plan type:", planName, "->", planType);
    
    let is3Months = false;
    let is6Months = false;
    
    // Check for explicit 3 or 6 month indicators in plan name
    // More flexible matching for various plan name formats
    if (planType.includes("quarterly") || 
        planType.includes("quarter") ||
        planType.includes("3 month") ||
        planType.includes("3months") ||
        planType.includes("90 day") ||
        planType.includes("90days") ||
        (planType.includes("3") && (planType.includes("month") || planType.includes("mon")))) {
      is3Months = true;
      console.log("Detected 3 months subscription");
    } else if (planType.includes("6 month") ||
               planType.includes("6months") ||
               planType.includes("180 day") ||
               planType.includes("180days") ||
               planType.includes("half") ||
               planType.includes("semi-annual") ||
               planType.includes("biannual") ||
               (planType.includes("6") && (planType.includes("month") || planType.includes("mon")))) {
      is6Months = true;
      console.log("Detected 6 months subscription");
    }
    
    // If not found, calculate from days (90 days = 3 months, 180 days = 6 months)
    if (!is3Months && !is6Months) {
      const daysMatch = planType.match(/(\d+)\s*days?/i);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        if (days >= 80 && days <= 100) is3Months = true; // ~90 days
        else if (days >= 170 && days <= 190) is6Months = true; // ~180 days
      }
    }

    // If still not determined, check date difference from start_date and end_date
    // This works for both mock_interview_payments (has start_date/end_date) and subscriptions table
    if (!is3Months && !is6Months) {
      // For mock_interview_payments, use start_date and end_date directly
      // For subscriptions, use the column names
      const startDate = isFromPayments 
        ? (subscription.start_date ? new Date(subscription.start_date) : null)
        : (subscription[startDateColumn] ? new Date(subscription[startDateColumn]) : null);
      
      const endDate = isFromPayments
        ? (subscription.end_date ? new Date(subscription.end_date) : null)
        : (subscription[endDateColumn] ? new Date(subscription[endDateColumn]) : null);
      
      if (startDate && endDate) {
        const diffTime = endDate - startDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log(`Date difference: ${diffDays} days (start: ${startDate}, end: ${endDate})`);
        
        // 3 months = ~90 days (allow 80-100 days range)
        if (diffDays >= 80 && diffDays <= 100) {
          is3Months = true;
          console.log("Detected 3 months from date difference");
        } 
        // 6 months = ~180 days (allow 170-190 days range)
        else if (diffDays >= 170 && diffDays <= 190) {
          is6Months = true;
          console.log("Detected 6 months from date difference");
        }
      }
    }
    
    // If still not determined but we have a payment from mock_interview_payments
    // Check plan name as fallback
    if (!is3Months && !is6Months && isFromPayments && planName) {
      // If it's a quarterly plan, it's 3 months
      if (planType.includes("quarterly") || planType.includes("quarter")) {
        is3Months = true;
        console.log("Detected quarterly plan as 3 months");
      }
    }

    if (!is3Months && !is6Months) {
      console.log("No valid 3 or 6 month subscription found. Plan name:", planName);
      return null; // Not a valid 3 or 6 month subscription
    }
    
    console.log("Valid subscription found:", is6Months ? "6 months" : "3 months");

    // Check if subscription is active and not expired
    // For mock_interview_payments, use end_date directly if available
    let endDate = null;
    try {
      if (isFromPayments && subscription.end_date) {
        // Use the end_date from mock_interview_payments table
        endDate = new Date(subscription.end_date);
      } else if (!isFromPayments && subscription[endDateColumn]) {
        endDate = new Date(subscription[endDateColumn]);
      } else if (isFromPayments) {
        // Try to get payment date from various possible column names
        const paymentDateValue = subscription[paymentDateColumn] || 
                                 subscription.created_at || 
                                 subscription.start_date;
        if (paymentDateValue && (is3Months || is6Months)) {
          // Fallback: Calculate end date from payment date + duration if end_date not available
          const paymentDate = new Date(paymentDateValue);
          endDate = new Date(paymentDate);
          endDate.setMonth(endDate.getMonth() + (is6Months ? 6 : 3));
        }
      }
    } catch (err) {
      console.error("Error calculating end date:", err);
    }
    
    const now = new Date();
    
    if (endDate && endDate <= now) {
      return null; // Expired
    }

    const status = subscription[statusColumn]?.toLowerCase() || "";
    const validStatuses = ["active", "completed", "paid", "success"];
    if (status && !validStatuses.includes(status)) {
      return null; // Not active
    }

    // Get start date safely
    let startDate = new Date();
    try {
      if (isFromPayments && subscription.start_date) {
        startDate = new Date(subscription.start_date);
      } else if (!isFromPayments && subscription[startDateColumn]) {
        startDate = new Date(subscription[startDateColumn]);
      } else {
        const paymentDateValue = subscription[paymentDateColumn] || 
                                 subscription.created_at || 
                                 subscription.start_date;
        if (paymentDateValue) {
          startDate = new Date(paymentDateValue);
        }
      }
    } catch (err) {
      console.error("Error getting start date:", err);
    }

    return {
      type: is6Months ? "6months" : "3months",
      start_date: startDate,
      end_date: endDate,
      is_active: true,
    };
  } catch (error) {
    console.error("Error checking Skillgenie subscription:", error);
    console.error("Error stack:", error.stack);
    return null;
  }
};

