# Skillgenie Database Integration

This application now directly queries the Skillgenie database for authentication and subscription verification.

## How It Works

1. **Login**: User enters email or username and password
2. **Credential Check**: System queries the Skillgenie `users` table to verify credentials
3. **Subscription Check**: System checks payment/subscription history to verify 3 or 6 month subscription
4. **Access Grant**: If valid, user gets JWT token and can access the application

## Database Requirements

### 1. Users Table
Must contain user credentials:
- Email address
- Username (optional but recommended for login via username)
- Password (bcrypt hashed or plain text - both supported)
- User ID

### 2. Payments/Subscriptions Table
Must contain subscription information. The system checks:
- **Subscriptions table** (preferred): Contains plan_type, start_date, end_date, status
- **Payments table** (fallback): Contains plan_type/duration, payment_date, status

## Configuration

### Default Table/Column Names

The system uses these defaults (can be customized via environment variables):

**Users Table:**
- Table: `users`
- Columns: `id`, `email`, `username`, `password`

**Subscriptions Table:**
- Table: `subscriptions`
- Columns: `user_id`, `plan_type`, `start_date`, `end_date`, `status`

**Payments Table:**
- Table: `payments`
- Columns: `user_id`, `plan_type` or `duration`, `payment_date`, `status`, `amount`

### Customizing Table/Column Names

If your Skillgenie database uses different names, add these to `backend/.env`:

```env
# Users table
SKILLGENIE_USERS_TABLE=your_users_table
SKILLGENIE_EMAIL_COLUMN=your_email_column
# Optional: enable username-based login by specifying the column name
# SKILLGENIE_USERNAME_COLUMN=your_username_column
SKILLGENIE_PASSWORD_COLUMN=your_password_column
SKILLGENIE_ID_COLUMN=your_id_column

# Subscriptions table
SKILLGENIE_SUBSCRIPTIONS_TABLE=your_subscriptions_table
SKILLGENIE_USER_ID_COLUMN=your_user_id_column
SKILLGENIE_PLAN_TYPE_COLUMN=your_plan_type_column
SKILLGENIE_START_DATE_COLUMN=your_start_date_column
SKILLGENIE_END_DATE_COLUMN=your_end_date_column
SKILLGENIE_STATUS_COLUMN=your_status_column

# Payments table
SKILLGENIE_PAYMENTS_TABLE=your_payments_table
SKILLGENIE_DURATION_COLUMN=your_duration_column
SKILLGENIE_PAYMENT_DATE_COLUMN=your_payment_date_column
SKILLGENIE_AMOUNT_COLUMN=your_amount_column
```

## Subscription Validation

The system accepts subscriptions with:
- **Plan Types**: "3months", "6months", "3_months", "6_months", or duration values of 3 or 6
- **Status**: "active", "completed", "paid", "success"
- **Not Expired**: end_date must be in the future

## Password Verification

The system supports:
1. **Bcrypt hashed passwords** (recommended) - automatically detected
2. **Plain text passwords** (fallback) - used if bcrypt comparison fails

## Example Database Queries

### Check if user exists:
```sql
SELECT id, email, username, password FROM users WHERE email = 'user@example.com' OR username = 'user123';
```

### Check subscription:
```sql
SELECT plan_type, start_date, end_date, status 
FROM subscriptions 
WHERE user_id = 123 
ORDER BY end_date DESC 
LIMIT 1;
```

### Check payment:
```sql
SELECT plan_type, duration, payment_date, status 
FROM payments 
WHERE user_id = 123 
AND status IN ('completed', 'paid', 'success', 'active')
ORDER BY payment_date DESC 
LIMIT 1;
```

## Troubleshooting

### "Invalid email or password"
- Check if user exists in Skillgenie users table
- Verify password column name matches configuration
- Check if password is properly hashed (bcrypt) or plain text

### "Access denied. Valid 3 or 6 month subscription required"
- Check if user has a payment/subscription record
- Verify plan_type contains "3" or "6" months
- Check if payment status is valid (completed, paid, success, active)
- Verify subscription hasn't expired

### Database connection errors
- Ensure Skillgenie database credentials are correct in `.env`
- Verify database is accessible from your server
- Check if tables exist and have correct column names

