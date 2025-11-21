# Environment Variables Setup Guide

Based on your Skillgenie database schema, here are the environment variables you need to add to `backend/.env`:

## Required Database Connection

```env
# Skillgenie Database Connection
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASS=your_db_password
DB_PORT=5432
DB_SSL=false
```

## Required Authentication Settings

```env
# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Skillgenie Database Table Configuration

```env
# Users Table Configuration
SKILLGENIE_USERS_TABLE=users
SKILLGENIE_EMAIL_COLUMN=email
SKILLGENIE_USERNAME_COLUMN=user_id
SKILLGENIE_PASSWORD_COLUMN=password
SKILLGENIE_ID_COLUMN=id

# Subscriptions Table Configuration
SKILLGENIE_SUBSCRIPTIONS_TABLE=subscriptions
SKILLGENIE_USER_ID_COLUMN=user_id
SKILLGENIE_PLAN_TYPE_COLUMN=subscription_type
SKILLGENIE_START_DATE_COLUMN=start_date
SKILLGENIE_END_DATE_COLUMN=end_date
SKILLGENIE_STATUS_COLUMN=status
```

## Server Port

```env
PORT=5000
```

## How It Works

1. **Login**: Users can login with either their `email` or `user_id` (username)
2. **User Lookup**: System queries `users` table by email or `user_id` column
3. **Subscription Check**: System queries `subscriptions` table where `subscriptions.user_id` = `users.id` (UUID)
4. **Subscription Validation**: 
   - Checks if `subscription_type` indicates 3 or 6 months (e.g., "premium_90_days" = 3 months)
   - Verifies `status` is "active" or "success"
   - Ensures `end_date` is in the future

## Example .env File

```env
# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=skillgenie-dev
DB_PASS=your_password
DB_PORT=5432
DB_SSL=false

# JWT
JWT_SECRET=change-this-to-a-random-secret-key

# Users Table
SKILLGENIE_USERS_TABLE=users
SKILLGENIE_EMAIL_COLUMN=email
SKILLGENIE_USERNAME_COLUMN=user_id
SKILLGENIE_PASSWORD_COLUMN=password
SKILLGENIE_ID_COLUMN=id

# Subscriptions Table
SKILLGENIE_SUBSCRIPTIONS_TABLE=subscriptions
SKILLGENIE_USER_ID_COLUMN=user_id
SKILLGENIE_PLAN_TYPE_COLUMN=subscription_type
SKILLGENIE_START_DATE_COLUMN=start_date
SKILLGENIE_END_DATE_COLUMN=end_date
SKILLGENIE_STATUS_COLUMN=status

# Server
PORT=5000
```

## Notes

- The `subscriptions.user_id` column links to `users.id` (the UUID primary key)
- Subscription types like "premium_90_days" are automatically detected as 3 months
- Subscription types like "premium_180_days" are automatically detected as 6 months
- The system also calculates duration from `start_date` and `end_date` if needed


